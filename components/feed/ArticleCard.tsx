import Link from "next/link";
import Image from "next/image";
import type { ArticleCard as ArticleCardType } from "@/types/article";

export function ArticleCard({ article }: { article: ArticleCardType }) {
  return (
    <Link href={`/${article.slug}`} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-ns-blue focus-visible:outline-offset-2">
      <article className="h-full flex flex-col gap-4 p-3 rounded-2xl transition-shadow duration-200 hover:shadow-lg hover:shadow-black/5 bg-white border border-neutral-100">
        {/* Cover */}
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-neutral-100">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.coverImageAlt ?? article.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-ns-blue/10 to-ns-blue/5" />
          )}

          {/* Type badge */}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest px-2 py-1 rounded-full bg-ns-black/70 text-white backdrop-blur-sm">
              {article.type === "short" ? "Rapide" : "Approfondir"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 flex-1 px-1 pb-1">
          {/* Category + reading time */}
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${article.category.colorHex ?? "#2233f0"}18`,
                color: article.category.colorHex ?? "#2233f0",
              }}
            >
              {article.category.name}
            </span>
            <span className="text-neutral-300 text-xs">·</span>
            <span className="text-xs text-neutral-400 font-sans">
              {article.readingTimeMin} min
            </span>
          </div>

          {/* Title */}
          <h2 className="font-heading font-bold text-[17px] leading-snug text-ns-black group-hover:text-ns-blue transition-colors duration-200 line-clamp-2">
            {article.title}
          </h2>

          {/* Summary — neutral-600 for WCAG AA contrast */}
          <p className="text-sm leading-6 text-neutral-600 line-clamp-2 font-sans">
            {article.summary}
          </p>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-[10px] font-sans text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
