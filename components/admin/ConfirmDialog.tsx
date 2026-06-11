"use client";

import { useEffect, useRef } from "react";
import { Loader2, AlertTriangle, Send } from "lucide-react";

type Variant = "danger" | "primary";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const danger = variant === "danger";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
              danger ? "bg-red-50 text-red-500" : "bg-ns-blue/10 text-ns-blue"
            }`}
          >
            {danger ? (
              <AlertTriangle className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Send className="w-5 h-5" strokeWidth={2} />
            )}
          </span>
          <div className="space-y-1 pt-0.5">
            <h2 className="font-heading font-bold text-base text-ns-black leading-snug">{title}</h2>
            <p className="text-sm text-neutral-500 font-sans leading-6">{message}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-sans font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors duration-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 ${
              danger ? "bg-red-500" : "bg-ns-blue"
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
