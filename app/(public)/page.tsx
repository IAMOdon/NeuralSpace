import { Suspense } from "react";
import { getArticles, getCategories } from "@/lib/articles";
import { ArticleCard } from "@/components/feed/ArticleCard";
import { CategoryFilter } from "@/components/feed/CategoryFilter";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [articles, categories] = await Promise.all([
    getArticles({ categorySlug: category, sort: "recent" }),
    getCategories(),
  ]);

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

      {/* Filter strip — white, scrollable edge-to-edge on mobile */}
      <div className="w-full border-b border-neutral-100 bg-white sticky top-16 z-30">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 px-6 py-3 max-w-7xl mx-auto w-max min-w-full">
            <Suspense>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {articles.length === 0 ? (
          <p className="text-neutral-400 font-sans">Aucun article dans cette catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} priority={i === 0} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
