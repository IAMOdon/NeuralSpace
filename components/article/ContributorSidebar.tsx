import Image from "next/image";
import type { AuthorSummary } from "@/types/author";

type Props = {
  contributors: AuthorSummary[];
  isSponsored?: boolean;
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

export function ContributorSidebar({ contributors, isSponsored }: Props) {
  if (!contributors.length && !isSponsored) return null;

  return (
    <div className="space-y-1">
      {/* Blue accent label */}
      <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-ns-blue mb-4">
        Contributeurs
      </p>

      {/* Contributors list with blue left border */}
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
  );
}
