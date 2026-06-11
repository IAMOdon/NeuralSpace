"use client";

import Link from "next/link";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-ns-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 group shrink-0"
          onClick={() => setOpen(false)}
        >
          <span className="font-heading font-black text-lg tracking-widest text-ns-blue uppercase">
            Neural Space
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-ns-blue mb-3 group-hover:scale-125 transition-transform" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-sans text-ns-black hover:text-ns-blue transition-colors"
          >
            Articles
          </Link>
          <Link
            href="/coherence"
            className="text-sm font-sans text-neutral-400 hover:text-ns-blue transition-colors flex items-center gap-1.5"
          >
            Coherence
            <span className="text-[10px] font-sans bg-ns-blue/10 text-ns-blue px-1.5 py-0.5 rounded-full">
              Bientôt
            </span>
          </Link>
          {/* Pas encore de page /neurallab — teaser inerte plutôt qu'un lien 404 */}
          <span className="text-sm font-sans text-neutral-300 flex items-center gap-1.5 cursor-default select-none">
            NeuralLab
            <span className="text-[10px] font-sans bg-ns-blue/10 text-ns-blue px-1.5 py-0.5 rounded-full">
              Bientôt
            </span>
          </span>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
        >
          <span className={`block w-5 h-0.5 bg-ns-black transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block w-5 h-0.5 bg-ns-black transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-ns-black transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-neutral-100 bg-ns-white">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center h-12 text-base font-sans font-medium text-ns-black hover:text-ns-blue transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/coherence"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 h-12 text-base font-sans font-medium text-neutral-400 hover:text-ns-blue transition-colors"
            >
              Coherence
              <span className="text-[10px] bg-ns-blue/10 text-ns-blue px-1.5 py-0.5 rounded-full">
                Bientôt
              </span>
            </Link>
            <span className="flex items-center gap-2 h-12 text-base font-sans font-medium text-neutral-300 cursor-default select-none">
              NeuralLab
              <span className="text-[10px] bg-ns-blue/10 text-ns-blue px-1.5 py-0.5 rounded-full">
                Bientôt
              </span>
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}
