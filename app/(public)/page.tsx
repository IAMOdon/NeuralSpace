import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { getArticles, getCategories } from "@/lib/articles";
import { adminClient } from "@/lib/supabase/admin";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_LOCALE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Accueil",
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} — La science rendue accessible`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
  },
};
import { ArticleCard } from "@/components/feed/ArticleCard";
import { CategoryFilter } from "@/components/feed/CategoryFilter";
import { BecauseYouRead } from "@/components/feed/BecauseYouRead";
import { HeroBlock, type HeroConfig } from "@/components/feed/HeroBlock";
import { AudioCover } from "@/components/feed/AudioCover";

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const [articles, categories, heroRow] = await Promise.all([
    getArticles({ categorySlug: category, searchQuery: q, sort: "recent", limit: 20 }),
    getCategories(),
    adminClient.from("hero_config").select("type, config").eq("id", "singleton").single(),
  ]);

  const hero = category ? articles : articles.slice(0, 3);
  const rest = category ? []       : articles.slice(3);

  const heroConfig: HeroConfig = heroRow.data
    ? { type: heroRow.data.type, ...(heroRow.data.config as object) } as HeroConfig
    : { type: "none" };

  return (
    <>
      {/* Hero — title only, clean blue strip */}
      <div className="bg-ns-blue w-full py-5">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-heading font-black text-lg md:text-xl text-ns-white tracking-tight">
            La science, rendue accessible.
          </h1>
        </div>
      </div>

      {/* Filter strip */}
      <div className="w-full border-b border-neutral-100 bg-white sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <Suspense>
            <CategoryFilter categories={categories} />
          </Suspense>
        </div>
      </div>

      {/* HeroBlock — full-bleed, hors container */}
      <HeroBlock config={heroConfig} />

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-14">
        <BecauseYouRead />
        {articles.length === 0 ? (
          <p className="text-neutral-400 font-sans">Aucun article dans cette catégorie.</p>
        ) : (
          <>
            {/* Top 3 — card grid */}
            <section className="space-y-5">
              <h2 className="font-heading font-bold text-lg text-ns-black">
                {category ? "Articles" : "Les plus récents"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {hero.map((article, i) => (
                  <ArticleCard key={article.id} article={article} priority={i === 0} />
                ))}
              </div>
            </section>

            {/* Audio — épisodes récents */}
            {!category && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-lg text-ns-black">Écouter</h2>
                  <Link
                    href="/audio"
                    className="text-xs font-sans font-semibold text-ns-blue hover:opacity-70 transition-opacity duration-200 flex items-center gap-1"
                  >
                    Tous les épisodes
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                {/* TODO: remplacer par fetch depuis table episodes Supabase */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AudioCover
                    episodeNumber={8}
                    title="Les trous noirs, portes vers l'infini"
                    duration="38 min"
                    categoryName="Physique"
                    categoryColor="#2233f0"
                    publishedAt="2026-06-12"
                  />
                  <AudioCover
                    episodeNumber={7}
                    title="CRISPR, dix ans après : où en est-on ?"
                    duration="45 min"
                    categoryName="Biologie"
                    categoryColor="#10b981"
                    publishedAt="2026-06-05"
                  />
                  <AudioCover
                    episodeNumber={6}
                    title="L'IA peut-elle vraiment raisonner ?"
                    duration="52 min"
                    categoryName="IA"
                    categoryColor="#f59e0b"
                    publishedAt="2026-05-29"
                  />
                  <AudioCover
                    episodeNumber={5}
                    title="Matière noire : le grand mystère cosmique"
                    duration="41 min"
                    categoryName="Cosmologie"
                    categoryColor="#8b5cf6"
                    publishedAt="2026-05-22"
                  />
                </div>
              </section>
            )}

            {/* Rest — compact list */}
            {rest.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-heading font-bold text-lg text-ns-black">Explorer</h2>
                <div className="divide-y divide-neutral-100">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      href={`/${article.slug}`}
                      className="group flex items-center gap-4 py-4 hover:bg-neutral-50 -mx-3 px-3 rounded-xl transition-colors duration-200"
                    >
                      {/* Thumbnail */}
                      {article.coverImageUrl ? (
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                          <Image
                            src={article.coverImageUrl}
                            alt={article.coverImageAlt ?? article.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 md:w-20 md:h-20 rounded-xl shrink-0"
                          style={{ backgroundColor: `${article.category.colorHex ?? "#2233f0"}18` }}
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${article.category.colorHex ?? "#2233f0"}18`,
                              color: article.category.colorHex ?? "#2233f0",
                            }}
                          >
                            {article.category.name}
                          </span>
                          <span className="text-xs text-neutral-400 font-sans">
                            {article.readingTimeMin} min
                          </span>
                        </div>
                        <p className="font-heading font-bold text-[15px] leading-snug text-ns-black group-hover:text-ns-blue transition-colors duration-200 line-clamp-2">
                          {article.title}
                        </p>
                        <p className="text-xs text-neutral-500 font-sans line-clamp-1 hidden md:block">
                          {article.summary}
                        </p>
                      </div>

                      {/* Arrow */}
                      <svg
                        className="w-4 h-4 text-neutral-300 group-hover:text-ns-blue transition-colors duration-200 shrink-0"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
