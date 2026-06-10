"use client";

import { useEffect, useState } from "react";

// Page-level effects for /coherence:
// 1. Thin scroll-progress bar above the nav (scroll-driven UI cue).
// 2. Subtle film grain over the whole page (premium texture).
// 3. Konami-code easter egg (↑↑↓↓←→←→BA) — party mode: every orb dances.

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

// Tiny SVG turbulence noise, inlined — no asset request.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export function PageFx() {
  const [progress, setProgress] = useState(0);
  const [party, setParty] = useState(false);
  const [toast, setToast] = useState(false);

  // Scroll progress
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(total > 0 ? window.scrollY / total : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Konami code
  useEffect(() => {
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[i]) {
        i += 1;
        if (i === KONAMI.length) {
          i = 0;
          setParty((p) => {
            const next = !p;
            document.documentElement.classList.toggle("coh-party", next);
            return next;
          });
          setToast(true);
          setTimeout(() => setToast(false), 3500);
        }
      } else {
        i = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("coh-party");
    };
  }, []);

  return (
    <>
      {/* Scroll progress bar — above the sticky nav */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-ns-blue z-50 pointer-events-none"
        style={{ width: `${progress * 100}%`, transition: "width 80ms linear" }}
        aria-hidden
      />

      {/* Film grain */}
      <div
        className="fixed inset-0 z-[45] pointer-events-none opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
        aria-hidden
      />

      {/* Party toast */}
      {toast && (
        <div
          className="fixed bottom-8 left-1/2 z-50 px-5 py-3 rounded-full bg-white shadow-2xl border border-neutral-100"
          style={{ animation: "toast-in 0.3s ease-out", transform: "translateX(-50%)" }}
        >
          <p className="text-sm font-sans font-semibold text-ns-black whitespace-nowrap">
            {party ? "🎉 Mode festif activé — l'orbe danse." : "L'orbe reprend son sérieux."}
          </p>
        </div>
      )}
    </>
  );
}
