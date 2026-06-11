import type { ArticleCorrection } from "@/types/article";

// Corrections éditoriales visibles — norme des médias sérieux : les erreurs
// corrigées restent documentées publiquement, datées, sous l'article.
export function CorrectionsBlock({ corrections }: { corrections: ArticleCorrection[] }) {
  if (corrections.length === 0) return null;

  return (
    <section
      aria-label="Corrections apportées à cet article"
      className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 md:p-6 space-y-3"
    >
      <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-700">
        Corrections
      </p>
      <ul className="space-y-2.5">
        {corrections.map((c, i) => (
          <li key={i} className="text-sm font-sans text-neutral-700 leading-6">
            <time dateTime={c.date} className="font-semibold text-amber-800">
              {new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </time>
            {" — "}
            {c.note}
          </li>
        ))}
      </ul>
      <p className="text-[11px] font-sans text-neutral-400 leading-4">
        Conformément à notre <a href="/charte" className="underline underline-offset-2 hover:text-neutral-600 transition-colors">charte éditoriale</a>,
        toute correction substantielle est documentée ici.
      </p>
    </section>
  );
}
