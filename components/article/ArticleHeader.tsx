import Image from "next/image";

type Props = {
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  category: { name: string; colorHex?: string | null };
  readingTimeMin: number | null;
  publishedAt: string | null;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleHeader({
  title, summary, coverImageUrl, coverImageAlt,
  category, readingTimeMin, publishedAt,
}: Props) {
  const hex = category.colorHex ?? "#2233f0";

  return (
    <header className="mb-10">
      {/* Cover image */}
      {coverImageUrl && (
        <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-8">
          <Image
            src={coverImageUrl}
            alt={coverImageAlt || title}
            fill
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

      {/* Divider */}
      <div className="border-t border-neutral-100 mt-8" />
    </header>
  );
}
