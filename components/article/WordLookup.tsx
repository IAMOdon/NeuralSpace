"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lookupWord, type DictionaryResult } from "@/lib/dictionary";

type TooltipState =
  | { status: "hidden" }
  | { status: "loading"; x: number; y: number }
  | { status: "found"; word: string; result: DictionaryResult; x: number; y: number }
  | { status: "not-found"; x: number; y: number };

function getSelectedWord(): { word: string; rect: DOMRect } | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;

  const text = selection.toString().trim();
  if (!text || /\s/.test(text) || text.length < 2 || text.length > 40) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  return { word: text, rect };
}

export function WordLookup({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipState>({ status: "hidden" });
  const abortRef = useRef<AbortController | null>(null);

  const hide = useCallback(() => {
    abortRef.current?.abort();
    setTooltip({ status: "hidden" });
  }, []);

  useEffect(() => {
    const handleMouseUp = async () => {
      const selected = getSelectedWord();
      if (!selected) { hide(); return; }

      const { word, rect } = selected;
      // Clamp x to viewport to prevent overflow on mobile (16px margin each side)
      const rawX = rect.left + rect.width / 2;
      const x = Math.min(Math.max(rawX, 160), window.innerWidth - 160);
      const y = rect.top;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setTooltip({ status: "loading", x, y });

      const result = await lookupWord(word, controller.signal);

      if (controller.signal.aborted) return;

      if (result) {
        window.dispatchEvent(new Event("ns:word-lookup"));
        setTooltip({ status: "found", word, result, x, y });
      } else {
        setTooltip({ status: "not-found", x, y });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };

    // Close on scroll — tooltip can't follow the word
    const handleScroll = () => hide();

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hide]);

  const visible = tooltip.status !== "hidden";

  // Always render the same wrapper — no conditional mount/unmount of children
  return (
    <div>
      {children}
      {visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 12,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-ns-black text-ns-white rounded-xl shadow-2xl max-w-sm w-max pointer-events-auto">
            {tooltip.status === "loading" && (
              <div className="px-4 py-3">
                <p className="text-sm text-white/50">Recherche…</p>
              </div>
            )}

            {tooltip.status === "not-found" && (
              <div className="px-4 py-3">
                <p className="text-sm text-white/50">Aucun résultat.</p>
              </div>
            )}

            {tooltip.status === "found" && (
              <div className="px-4 py-3 space-y-2 max-w-xs">
                <p className="text-[10px] font-heading font-bold text-white tracking-widest uppercase">
                  {tooltip.word}
                </p>

                {tooltip.result.source === "wiktionary" && (
                  <ul className="space-y-1.5">
                    {tooltip.result.definitions.map((def, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-5 text-white/85">
                        <span className="text-ns-blue shrink-0 mt-0.5">·</span>
                        <span>{def}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {tooltip.result.source === "wikipedia" && (
                  <p className="text-sm leading-5 text-white/85">
                    {tooltip.result.extract}
                  </p>
                )}
              </div>
            )}

            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-ns-black" />
          </div>
        </div>
      )}
    </div>
  );
}
