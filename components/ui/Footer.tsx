import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";
import { ManageCookiesButton } from "./ManageCookiesButton";

const navigation = [
  { label: "Articles", href: "/" },
  { label: "NeuralLab", href: "/neurallab" },
];

const legal = [
  { label: "Conditions générales", href: "/legal/cgu" },
  { label: "Politique de confidentialité", href: "/legal/confidentialite" },
  { label: "Politique de cookies", href: "/legal/cookies" },
  { label: "Mentions légales", href: "/legal/mentions-legales" },
];

const socials = [
  {
    label: "X (Twitter)",
    href: "https://x.com/NeuralSpace_",
    handle: "@NeuralSpace_",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#", // TODO: ajouter le handle Instagram
    handle: "@neuralspace", // TODO
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#", // TODO: ajouter la page Facebook
    handle: "Neural Space", // TODO
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ns-blue text-white mt-auto" aria-label="Pied de page Neural Space">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-1 group">
              <span className="font-heading font-black text-xl tracking-widest text-white uppercase">
                Neural Space
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white mb-3 group-hover:scale-125 transition-transform" />
            </Link>
            <p className="text-sm leading-6 text-white/70 max-w-xs font-sans">
              {SITE_DESCRIPTION}
            </p>

            {/* Socials */}
            <div className="flex items-center gap-4 pt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE_NAME} sur ${s.label}`}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {s.icon}
                  <span className="text-xs font-sans">{s.handle}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <p className="text-[10px] font-heading font-bold uppercase tracking-widest text-white/40">
              Navigation
            </p>
            <ul className="space-y-3">
              {navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
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
