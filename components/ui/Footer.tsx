import Link from "next/link";
import { unstable_cache } from "next/cache";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/types/article";
import { ManageCookiesButton } from "./ManageCookiesButton";
import { NewsletterForm } from "./NewsletterForm";

const getFooterCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const { data } = await getAdminClient()
      .from("categories")
      .select("id, slug, name, color_hex")
      .order("name");
    return (data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      colorHex: r.color_hex ?? undefined,
    }));
  },
  ["footer-categories"],
  { revalidate: 3600 }
);

const socials = [
  {
    label: "X (Twitter)",
    href: "https://x.com/NeuralSpace_",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>,
  },
  {
    label: "Instagram",
    href: "#", // TODO: handle Instagram
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
  },
  {
    label: "TikTok",
    href: "#", // TODO: handle TikTok
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.21a8.16 8.16 0 004.77 1.52V7.28a4.85 4.85 0 01-1-.59z" /></svg>,
  },
  {
    label: "YouTube",
    href: "#", // TODO: handle YouTube
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
  {
    label: "LinkedIn",
    href: "#", // TODO: handle LinkedIn
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  {
    label: "Twitch",
    href: "#", // TODO: handle Twitch
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" /></svg>,
  },
  {
    label: "Facebook",
    href: "#", // TODO: handle Facebook
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  },
];

const legal = [
  { label: "Conditions générales", href: "/legal/cgu" },
  { label: "Politique de confidentialité", href: "/legal/confidentialite" },
  { label: "Politique de cookies", href: "/legal/cookies" },
  { label: "Mentions légales", href: "/legal/mentions-legales" },
];

export async function Footer() {
  const year = new Date().getFullYear();
  const categories = await getFooterCategories();

  return (
    <footer className="bg-ns-blue text-white mt-auto" aria-label="Pied de page Neural Space">

      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-heading font-bold text-sm text-white">
              La science dans votre boîte mail
            </p>
            <p className="text-xs text-white/60 font-sans">
              Un article par semaine. Pas de spam, résiliation en un clic.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-1 group">
              <span className="font-heading font-black text-xl tracking-widest text-white uppercase">
                Neural Space
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white mb-3 group-hover:scale-125 transition-transform" />
            </Link>
            <p className="text-sm leading-6 text-white/70 font-sans">
              {SITE_DESCRIPTION}
            </p>
            <div className="flex items-center flex-wrap gap-2 pt-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE_NAME} sur ${s.label}`}
                  title={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Thématiques */}
          <div className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-white/40">
              Thématiques
            </p>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/?category=${cat.slug}`}
                    className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-white/40">
              Explorer
            </p>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/charte" className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200">
                  Charte éditoriale
                </Link>
              </li>
              <li>
                <Link href="/labos" className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200">
                  Espace labos
                </Link>
              </li>
              <li>
                <Link href="/audio" className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200">
                  Audio
                </Link>
              </li>
              <li>
                <Link href="/live" className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200">
                  Live
                </Link>
              </li>
              <li>
                <a href="/feed.xml" className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200">
                  Flux RSS
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-white/40">
              Légal
            </p>
            <ul className="space-y-3">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <ManageCookiesButton />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs font-sans text-white/40">
            © {year} {SITE_NAME}. Tous droits réservés.
          </p>
          <p className="text-xs font-sans text-white/30">
            La science rendue accessible — contenu à visée éducative uniquement.
          </p>
        </div>
      </div>
    </footer>
  );
}
