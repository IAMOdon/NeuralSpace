"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { lookupWord, type WikiSummary } from "@/lib/dictionary";

type TooltipState =
  | { status: "hidden" }
  | { status: "loading"; word: string; x: number; y: number }
  | { status: "found"; result: WikiSummary; x: number; y: number }
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
      const x = rect.left + rect.width / 2 + window.scrollX;
      const y = rect.top + window.scrollY;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setTooltip({ status: "loading", word, x, y });

      const result = await lookupWord(word, controller.signal);

      if (controller.signal.aborted) return;

      setTooltip(
        result
          ? { status: "found", result, x, y }
          : { status: "not-found", x, y }
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

  const visible = tooltip.status !== "hidden";

  return (
    <div className="relative">
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
              <div className="px-4 py-3 space-y-2">
                <p className="text-xs font-heading text-ns-blue tracking-widest uppercase">
                  {tooltip.result.title}
                </p>
                <p className="text-sm leading-6 text-white/85 font-sans">
                  {tooltip.result.extract}
                </p>
                {tooltip.result.wikiUrl && (
                  <a
                    href={tooltip.result.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-white/40 hover:text-white/70 transition-colors pt-1"
                  >
                    Lire sur Wikipédia →
                  </a>
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
