"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { addCorrection, deleteCorrection } from "@/lib/actions/articles";
import type { ArticleCorrection } from "@/types/article";

// Panneau « Corrections » de l'éditeur — chaque note ajoutée ici est publiée
// immédiatement sous l'article, datée (norme de transparence éditoriale).
export function CorrectionsPanel({
  articleId,
  initial,
}: {
  articleId: string;
  initial: ArticleCorrection[];
}) {
  const [corrections, setCorrections] = useState<ArticleCorrection[]>(initial);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (busy || !note.trim()) return;
    setBusy(true);
    setError(null);
    const result = await addCorrection(articleId, note);
    setBusy(false);
    if (result.ok) {
      setCorrections((c) => [...c, { date: new Date().toISOString(), note: note.trim() }]);
      setNote("");
    } else {
      setError(result.error ?? "Échec de l'ajout.");
    }
  }

  async function handleDelete(index: number) {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await deleteCorrection(articleId, index);
    setBusy(false);
    if (result.ok) {
      setCorrections((c) => c.filter((_, i) => i !== index));
    } else {
      setError(result.error ?? "Échec de la suppression.");
    }
  }

  return (
    <div className="space-y-2.5">
      {corrections.length > 0 && (
        <ul className="space-y-2">
          {corrections.map((c, i) => (
            <li key={i} className="group flex items-start gap-2 text-xs font-sans text-neutral-600 leading-5">
              <span className="flex-1 min-w-0">
                <span className="font-semibold text-amber-700">
                  {new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
                {" — "}
                {c.note}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(i)}
                aria-label="Supprimer la correction"
                className="p-1 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <Trash2 className="w-3 h-3" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Ex. : La masse indiquée était en kg, pas en tonnes — corrigé."
        className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-sans text-ns-black placeholder-neutral-300 focus:outline-none focus:border-ns-blue transition-colors resize-none"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={busy || !note.trim()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-sans font-semibold hover:bg-amber-200 transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" strokeWidth={2.5} />}
        Publier la correction
      </button>
      {error && <p className="text-[11px] font-sans text-red-500">{error}</p>}
      <p className="text-[10px] font-sans text-neutral-400 leading-4">
        Affichée immédiatement sous l&apos;article, avec la date du jour.
      </p>
    </div>
  );
}
