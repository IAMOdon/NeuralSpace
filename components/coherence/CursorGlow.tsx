"use client";

import { useEffect, useRef } from "react";

// A soft blue spotlight that follows the cursor inside its parent section
// (parent must be `relative overflow-hidden`). Written with direct style
// mutation — no re-renders on mousemove.
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = parent.getBoundingClientRect();
        el.style.opacity = e.clientY >= r.top && e.clientY <= r.bottom ? "1" : "0";
        el.style.background = `radial-gradient(520px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(34,51,240,0.10), transparent 65%)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0"
      aria-hidden
    />
  );
}
