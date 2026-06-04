"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/cookies";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if no consent decision has been made yet
    if (getConsent() === null) setVisible(true);
  }, []);

  function accept() {
    setConsent("accepted");
    setVisible(false);
  }

  function decline() {
    setConsent("declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
      <div className="max-w-2xl mx-auto bg-ns-black text-white rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        {/* Text */}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-sans font-semibold text-white">
            Nous utilisons des cookies
          </p>
          <p className="text-xs font-sans text-white/60 leading-5">
            Des cookies fonctionnels améliorent votre expérience (recommandations, historique de lecture).
            Aucune donnée personnelle identifiable n&apos;est collectée.{" "}
            <Link
              href="/legal/cookies"
              className="underline underline-offset-2 hover:text-white transition-colors"
            >
              En savoir plus
            </Link>
          </p>
        </div>

        {/* Actions */}
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
    </div>
  );
}
