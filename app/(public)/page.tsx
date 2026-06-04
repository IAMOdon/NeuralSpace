import { getArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/feed/ArticleCard";

export default async function FeedPage() {
  const articles = await getArticles({ sort: "recent" });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="font-heading font-black text-4xl text-ns-black tracking-tight">
          La science,<br />rendue accessible.
        </h1>
      </div>

      {articles.length === 0 ? (
        <p className="text-neutral-400 font-sans">Aucun article publié pour l&apos;instant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
