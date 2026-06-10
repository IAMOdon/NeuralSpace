"use client";

import { useEffect, useRef, useState } from "react";
import { Orb } from "./Orb";

// The hero orb, alive: it tilts to watch your cursor (it IS screen aware),
// pops when clicked, and after 5 clicks starts talking back — an easter egg
// that demos the product's personality.

const SECRETS = [
  "Je vous vois, vous savez.",
  "Vous me cliquez. Je vous observe. On est quittes.",
  "3 deadlines repérées pendant que vous cliquiez.",
  "L'âme, c'est moi. Enchanté.",
  "Continuez — j'apprends vos habitudes.",
];

export function LivingOrb({ size = 140 }: { size?: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [clicks, setClicks] = useState(0);
  const [secret, setSecret] = useState<string | null>(null);
  const [pop, setPop] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Watch the cursor — clamp to a gentle tilt so it stays elegant.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 400));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 400));
      setTilt({ x: dx, y: dy });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  function handleClick() {
    setPop(true);
    setTimeout(() => setPop(false), 220);
    const n = clicks + 1;
    setClicks(n);
    if (n >= 5) {
      const msg = SECRETS[(n - 5) % SECRETS.length] ?? SECRETS[0]!;
      setSecret(msg);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setSecret(null), 3200);
    }
  }

  return (
    <div className="relative" style={{ animation: "float-y 7s ease-in-out infinite" }}>
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-label="Coherence"
        className="block cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-ns-blue rounded-full"
        style={{
          transform: `perspective(600px) rotateY(${tilt.x * 10}deg) rotateX(${-tilt.y * 10}deg) scale(${pop ? 1.12 : 1})`,
          transition: "transform 180ms ease-out",
        }}
      >
        <Orb size={size} state={secret ? "speaking" : "idle"} />
      </button>

      {/* Secret speech bubble */}
      {secret && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-64 rounded-2xl bg-white shadow-2xl px-4 py-3 z-20"
          style={{ animation: "word-rise 0.35s ease-out" }}
        >
          <p className="text-[13px] font-sans text-neutral-800 leading-relaxed text-center">{secret}</p>
        </div>
      )}
    </div>
  );
}
