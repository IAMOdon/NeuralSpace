"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BarChart2, Radio, Tv, Mail, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/config";

const nav = [
  { label: "Dashboard",   href: "/dashboard",              icon: LayoutDashboard },
  { label: "Articles",    href: "/dashboard/articles",     icon: FileText        },
  { label: "Analytics",   href: "/dashboard/analytics",    icon: BarChart2       },
  { label: "Hero Config", href: "/dashboard/hero",         icon: Tv              },
  { label: "Newsletter",  href: "/dashboard/newsletter",   icon: Mail            },
  { label: "Live",        href: "/dashboard/live",         icon: Radio           },
];

const ready = new Set(["/dashboard", "/dashboard/hero", "/dashboard/articles", "/dashboard/analytics"]);

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 bg-ns-black flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-1 group">
          <span className="font-heading font-black text-base tracking-widest text-white uppercase">
            {SITE_NAME}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-ns-blue mb-2 group-hover:scale-125 transition-transform duration-200" />
        </Link>
        <p className="text-[10px] text-white/30 font-sans mt-1 uppercase tracking-widest">Admin</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const Icon    = item.icon;
          const isReady  = ready.has(item.href);
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={isReady ? item.href : "#"}
              aria-disabled={!isReady}
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
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans text-white/50 hover:text-white hover:bg-white/5 transition-colors duration-200"
        >
          <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          Paramètres
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
