import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminClient } from "@/lib/supabase/admin";
import { parseBlocks } from "@/lib/content/parseBlocks";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import { ArticleHeader } from "@/components/article/ArticleHeader";

type Props = { params: Promise<{ id: string }> };

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;

  const { data } = await adminClient
    .from("articles")
    .select("*, categories(id, slug, name, color_hex)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const blocks = parseBlocks(data.content).filter((b) => b.type !== "heading");
  const cat = data.categories as { id: string; slug: string; name: string; color_hex: string | null } | null;

  return (
    <div className="min-h-screen bg-white">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-ns-black px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-sans font-semibold text-white/90">Prévisualisation</span>
          <span
            className={`text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
              data.status === "published"
                ? "bg-green-500/20 text-green-400"
                : "bg-white/10 text-white/50"
            }`}
          >
            {data.status === "draft" ? "Brouillon" : "Publié"}
          </span>
        </div>
        <Link
          href={`/dashboard/articles/${id}/edit`}
          className="flex items-center gap-1.5 text-xs font-sans text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour à l'éditeur
        </Link>
      </div>

      {/* Article content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <ArticleHeader
          title={data.title}
          summary={data.summary}
          coverImageUrl={data.cover_image_url}
          coverImageAlt={data.cover_image_alt}
          category={cat ? { name: cat.name, colorHex: cat.color_hex } : { name: "Non classé" }}
          readingTimeMin={data.reading_time_min}
          publishedAt={data.published_at}
        />
        <ArticleRenderer blocks={blocks} />
      </div>
    </div>
  );
}
