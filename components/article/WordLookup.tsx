"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lookupWord, type Definition } from "@/lib/dictionary";

type TooltipState =
  | { status: "hidden" }
  | { status: "loading"; word: string; x: number; y: number }
  | { status: "found"; word: string; definitions: Definition[]; x: number; y: number }
  | { status: "not-found"; word: string; x: number; y: number };

function getSelectedWord(): { word: string; rect: DOMRect } | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;

  const text = selection.toString().trim();
  // Only single words — no spaces
  if (!text || /\s/.test(text) || text.length < 2 || text.length > 40) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  return { word: text, rect };
}

export function WordLookup({ children }: { children: React.ReactNode }) {
  const [tooltip, setTooltip] = useState<TooltipState>({ status: "hidden" });
  const containerRef = useRef<HTMLDivElement>(null);
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
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + window.scrollY;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setTooltip({ status: "loading", word, x, y });

      const definitions = await lookupWord(word, controller.signal);

      if (controller.signal.aborted) return;

      setTooltip(
        definitions
          ? { status: "found", word, definitions, x, y }
          : { status: "not-found", word, x, y }
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hide]);

  return (
    <div ref={containerRef} className="relative">
      {children}
      {tooltip.status !== "hidden" && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 12,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-ns-black text-ns-white rounded-xl px-4 py-3 shadow-2xl max-w-xs w-max pointer-events-auto">
            {tooltip.status === "loading" && (
              <p className="text-sm text-white/60 font-sans">Recherche…</p>
            )}

            {tooltip.status === "not-found" && (
              <p className="text-sm text-white/60 font-sans">
                Aucune définition trouvée.
              </p>
            )}

            {tooltip.status === "found" && (
              <div className="space-y-2">
                <p className="text-xs font-heading text-ns-blue tracking-widest uppercase">
                  {tooltip.word}
                </p>
                {tooltip.definitions.map((def, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-sans">
                      {def.partOfSpeech}
                    </p>
                    <p className="text-sm leading-5 text-white/90 font-sans">
                      {def.definition}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-ns-black" />
          </div>
        </div>
      )}
    </div>
  );
}
