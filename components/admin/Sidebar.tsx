"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, BarChart2, Radio, Tv, Mail, Settings, LogOut, Wrench, Users, X, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { SITE_NAME } from "@/lib/config";

const nav = [
  { label: "Dashboard",   href: "/dashboard",              icon: LayoutDashboard },
  { label: "Articles",    href: "/dashboard/articles",     icon: FileText        },
  { label: "Signalements", href: "/dashboard/reports",     icon: Flag            },
  { label: "Analytics",   href: "/dashboard/analytics",    icon: BarChart2       },
  { label: "Toolbox",     href: "/dashboard/toolbox",      icon: Wrench          },
  { label: "Hero Config", href: "/dashboard/hero",         icon: Tv              },
  { label: "Newsletter",  href: "/dashboard/newsletter",   icon: Mail            },
  { label: "Audience",    href: "/dashboard/audience",     icon: Users           },
  { label: "Live",        href: "/dashboard/live",         icon: Radio           },
];

const ready = new Set([
  "/dashboard",
  "/dashboard/hero",
  "/dashboard/articles",
  "/dashboard/reports",
  "/dashboard/analytics",
  "/dashboard/toolbox",
  "/dashboard/newsletter",
  "/dashboard/audience",
]);

// Éditeur et prévisualisation : plein écran sur mobile — leur propre barre
// d'outils devient LA barre supérieure (pas de double bandeau).
function isImmersive(pathname: string): boolean {
  return /^\/dashboard\/articles\/(new$|[^/]+\/(edit|preview))/.test(pathname);
}

const DRAWER_MS = 300;

function Wordmark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-1 group">
      <span className="font-heading font-black text-base tracking-widest text-white uppercase">
        {SITE_NAME}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-ns-blue mb-2 group-hover:scale-125 transition-transform duration-200" />
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {nav.map((item) => {
        const Icon = item.icon;
        const isReady = ready.has(item.href);
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={isReady ? item.href : "#"}
            aria-disabled={!isReady}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans font-medium transition-colors duration-200 ${
              isActive
                ? "bg-white/10 text-white"
                : isReady
                  ? "text-white/50 hover:text-white hover:bg-white/5"
                  : "text-white/30 cursor-not-allowed"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            {item.label}
            {!isReady && (
              <span className="ml-auto text-[9px] font-sans text-white/20 uppercase tracking-widest">
                Bientôt
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function BottomLinks({ onLogout, onNavigate }: { onLogout: () => void; onNavigate?: () => void }) {
  return (
    <>
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans text-white/50 hover:text-white hover:bg-white/5 transition-colors duration-200"
      >
        <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />
        Paramètres
      </Link>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
      >
        <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
        Déconnexion
      </button>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Drawer : `mounted` garde le DOM le temps de l'animation de sortie,
  // `shown` pilote les classes de transition (translate / opacity).
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openDrawer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMounted(true);
    // Double rAF : garantit que l'état initial (-translate-x-full) est peint
    // avant la transition — sinon le panneau apparaît sans glisser.
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }

  function closeDrawer() {
    setShown(false);
    closeTimer.current = setTimeout(() => setMounted(false), DRAWER_MS);
  }

  // Ferme à chaque navigation + nettoie le timer au démontage
  useEffect(() => {
    setShown(false);
    const t = setTimeout(() => setMounted(false), DRAWER_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mounted ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mounted]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const immersive = isImmersive(pathname);

  return (
    <>
      {/* ── Desktop — sidebar fixe ── */}
      <aside className="hidden md:flex w-56 shrink-0 bg-ns-black flex-col h-screen sticky top-0">
        <div className="px-5 py-6 border-b border-white/10">
          <Wordmark />
          <p className="text-[10px] text-white/30 font-sans mt-1 uppercase tracking-widest">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </nav>
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <BottomLinks onLogout={handleLogout} />
        </div>
      </aside>

      {/* ── Mobile — barre supérieure en flux (sticky, pas de padding à compenser) ── */}
      {!immersive && (
        <header className="md:hidden sticky top-0 z-40 h-14 shrink-0 bg-ns-black flex items-center justify-between px-4">
          <Wordmark />
          <button
            onClick={openDrawer}
            aria-label="Ouvrir le menu"
            aria-expanded={shown}
            className="flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
        </header>
      )}

      {/* ── Mobile — drawer animé ── */}
      {mounted && !immersive && (
        <div
          className={`md:hidden fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none ${
            shown ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDrawer}
          role="dialog"
          aria-modal="true"
          aria-label="Menu d'administration"
        >
          <div
            className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ns-black flex flex-col transition-transform duration-300 ease-out motion-reduce:transition-none ${
              shown ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <Wordmark />
                <p className="text-[10px] text-white/30 font-sans mt-1 uppercase tracking-widest">Admin</p>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Fermer le menu"
                className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <NavLinks pathname={pathname} onNavigate={closeDrawer} />
            </nav>
            <div className="px-3 py-4 border-t border-white/10 space-y-0.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <BottomLinks onLogout={handleLogout} onNavigate={closeDrawer} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
