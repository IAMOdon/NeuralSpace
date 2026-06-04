"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsent, setConsent, clearAllConsentData } from "@/lib/cookies";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  function accept() {
    setConsent("accepted");
    setVisible(false);
  }

  function decline() {
    setConsent("declined");
    clearAllConsentData();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="max-w-2xl mx-auto bg-ns-black text-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Main row */}
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-start gap-5 md:gap-8">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-sans font-semibold text-white">
              Personnaliser votre expérience
            </p>
            <p className="text-xs font-sans text-white/60 leading-5">
              En acceptant, vous activez l&apos;historique de lecture, les recommandations
              personnalisées et l&apos;analyse anonyme de l&apos;engagement éditorial.
              Aucune donnée personnelle identifiable n&apos;est collectée.{" "}
              <button
                onClick={() => setExpanded((v) => !v)}
                className="underline underline-offset-2 hover:text-white transition-colors"
                aria-expanded={expanded}
              >
                {expanded ? "Masquer le détail" : "Voir le détail"}
              </button>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={decline}
              className="text-xs font-sans font-semibold px-4 py-2.5 rounded-full border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-colors duration-200"
            >
              Refuser
            </button>
            <button
              onClick={accept}
              className="text-xs font-sans font-semibold px-4 py-2.5 rounded-full bg-ns-blue text-white hover:opacity-80 transition-opacity duration-200"
            >
              Accepter
            </button>
          </div>
        </div>

        {/* Expandable detail */}
        {expanded && (
          <div className="border-t border-white/10 px-5 md:px-6 pb-5 md:pb-6 pt-4 space-y-4">

            <div className="grid md:grid-cols-2 gap-4">
              {/* Without consent */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">
                  Sans cookies (toujours actif)
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Compteur de vues anonyme par article",
                    "Tri « Populaire » basé sur les vues agrégées",
                    "Mémorisation de votre choix de consentement",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 text-[12px] text-white/55 leading-4">
                      <span className="mt-1 w-1 h-1 rounded-full bg-white/30 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* With consent */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ns-blue/80">
                  Avec cookies (si accepté)
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Historique des 10 derniers articles lus",
                    "Scores d'intérêt par thématique scientifique",
                    "Section « Parce que vous avez lu »",
                    "Temps de lecture actif et profondeur de scroll",
                    "Nombre de lookups dictionnaire et clics sources",
                    "Profil de lecture anonyme (UUID aléatoire)",
                    "Pays déduit du réseau — IP jamais stockée",
                  ].map((item) => (
                    <li key={item} className="flex gap-2 text-[12px] text-white/70 leading-4">
                      <span className="mt-1 w-1 h-1 rounded-full bg-ns-blue shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-white/35 leading-4">
              Données hébergées en Europe · Jamais revendues ·{" "}
              <Link
                href="/legal/cookies"
                className="underline underline-offset-2 hover:text-white/60 transition-colors"
              >
                Politique complète
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
