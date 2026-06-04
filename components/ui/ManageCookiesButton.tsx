"use client";

import { setConsent } from "@/lib/cookies";

export function ManageCookiesButton() {
  function reset() {
    // Clear consent so the banner reappears on reload
    document.cookie = "ns_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  }

  return (
    <button
      onClick={reset}
      className="text-sm font-sans text-white/70 hover:text-white transition-colors duration-200 text-left"
    >
      Gérer mes cookies
    </button>
  );
}
