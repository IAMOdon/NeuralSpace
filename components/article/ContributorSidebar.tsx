import Image from "next/image";
import { classifySource } from "@/lib/sources";
import type { AuthorSummary } from "@/types/author";
import type { ArticleSource } from "@/types/article";

type Props = {
  contributors: AuthorSummary[];
  isSponsored?: boolean;
  sources?: ArticleSource[];
};

function Avatar({ c }: { c: AuthorSummary }) {
  if (c.avatarUrl) {
    return (
      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-white">
        <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" sizes="36px" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-ns-blue/10 flex items-center justify-center shrink-0 ring-2 ring-white">
      <span className="text-xs font-sans font-bold text-ns-blue">
        {c.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function ContributorSidebar({ contributors, isSponsored, sources = [] }: Props) {
  const hasSources = sources.length > 0;
  if (!contributors.length && !isSponsored && !hasSources) return null;

  return (
    <div className="space-y-8">
      {/* Contributors */}
      {(contributors.length > 0 || isSponsored) && (
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-ns-blue mb-4">
            Contributeurs
          </p>
          <div className="border-l-2 border-ns-blue pl-4 space-y-5">
            {contributors.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <Avatar c={c} />
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-sans font-semibold text-ns-black leading-tight">{c.name}</p>
                  {c.role && (
                    <p className="text-xs text-neutral-500 font-sans leading-snug mt-0.5">{c.role}</p>
                  )}
                  {c.institution && (
                    <p className="text-[11px] text-neutral-400 font-sans leading-snug">{c.institution}</p>
                  )}
                </div>
              </div>
            ))}
            {isSponsored && (
              <div className={contributors.length ? "pt-2 border-t border-neutral-100" : ""}>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full">
                  Contenu sponsorisé
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources */}
      {hasSources && (
        <div>
          <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400 mb-4">
            Sources
          </p>
          <ol className="space-y-3">
            {sources.map((s, i) => {
              const kind = classifySource(s);
              return (
                <li key={i} className="flex gap-2.5">
                  <span className="text-[10px] font-sans font-bold text-ns-blue mt-0.5 shrink-0 w-4 text-right">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-sans text-neutral-600 hover:text-ns-blue hover:underline transition-colors leading-snug block"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span className="text-[11px] font-sans text-neutral-600 leading-snug block">
                        {s.label}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 flex-wrap">
                      {s.doi && (
                        <a
                          href={`https://doi.org/${s.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-neutral-400 hover:text-ns-blue transition-colors"
                        >
                          DOI {s.doi}
                        </a>
                      )}
                      {kind === "preprint" && (
                        <span
                          title="Préprint — résultats non encore évalués par les pairs"
                          className="text-[9px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700"
                        >
                          Préprint
                        </span>
                      )}
                      {kind === "doi" && !s.doi && (
                        <span
                          title="Publication identifiée par un DOI"
                          className="text-[9px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-ns-blue/10 text-ns-blue"
                        >
                          DOI
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
