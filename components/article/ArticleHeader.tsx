import Image from "next/image";
import type { AuthorSummary } from "@/types/author";

type Props = {
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  category: { name: string; colorHex?: string | null };
  readingTimeMin: number | null;
  publishedAt: string | null;
  authors?: AuthorSummary[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function AuthorAvatar({ a }: { a: AuthorSummary }) {
  if (a.avatarUrl) {
    return (
      <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-white shrink-0">
        <Image src={a.avatarUrl} alt={a.name} fill className="object-cover" sizes="24px" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-ns-blue/10 flex items-center justify-center ring-1 ring-white shrink-0">
      <span className="text-[9px] font-sans font-bold text-ns-blue">
        {a.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function ArticleHeader({
  title, summary, coverImageUrl, coverImageAlt,
  category, readingTimeMin, publishedAt, authors = [],
}: Props) {
  const hex = category.colorHex ?? "#2233f0";

  return (
    <header className="mb-10">
      {/* Cover image */}
      {coverImageUrl && (
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/7] rounded-2xl overflow-hidden mb-8">
          <Image
            src={coverImageUrl}
            alt={coverImageAlt || title}
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 65vw"
            priority
          />
        </div>
      )}

      {/* Category + meta */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        <span
          className="text-[11px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${hex}18`, color: hex }}
        >
          {category.name}
        </span>
        {readingTimeMin && (
          <>
            <span className="text-neutral-200 select-none">·</span>
            <span className="text-xs text-neutral-400 font-sans">{readingTimeMin} min de lecture</span>
          </>
        )}
        {publishedAt && (
          <>
            <span className="text-neutral-200 select-none">·</span>
            <time dateTime={publishedAt} className="text-xs text-neutral-400 font-sans">
              {formatDate(publishedAt)}
            </time>
          </>
        )}
      </div>

      {/* Title */}
      <h1 className="font-heading font-black text-2xl md:text-3xl text-ns-black leading-tight tracking-tight mb-4">
        {title}
      </h1>

      {/* Summary / accroche */}
      {summary && (
        <p className="text-base md:text-lg text-neutral-500 font-sans leading-relaxed">
          {summary}
        </p>
      )}

      {/* Authors byline — visible at all breakpoints */}
      {authors.length > 0 && (
        <div className="flex items-center gap-2 mt-5 flex-wrap">
          <div className="flex -space-x-1.5">
            {authors.map((a) => <AuthorAvatar key={a.id} a={a} />)}
          </div>
          <p className="text-xs text-neutral-500 font-sans">
            {authors.map((a, i) => (
              <span key={a.id}>
                <span className="font-semibold text-ns-black">{a.name}</span>
                {a.role && <span className="text-neutral-400"> · {a.role}</span>}
                {i < authors.length - 1 && <span className="text-neutral-300">, </span>}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-neutral-100 mt-8" />
    </header>
  );
}
