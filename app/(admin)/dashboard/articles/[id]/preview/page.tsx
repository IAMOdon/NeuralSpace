import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminClient } from "@/lib/supabase/admin";
import { parseBlocks } from "@/lib/content/parseBlocks";
import { ArticleSourcesSchema } from "@/lib/content/validators";
import { ArticleRenderer } from "@/components/article/ArticleRenderer";
import { ArticleHeader } from "@/components/article/ArticleHeader";
import { ContributorSidebar } from "@/components/article/ContributorSidebar";
import type { AuthorSummary } from "@/types/author";
import type { ArticleSource } from "@/types/article";

type Props = { params: Promise<{ id: string }> };

function parseSources(raw: unknown): ArticleSource[] {
  const r = ArticleSourcesSchema.safeParse(raw);
  return r.success ? r.data : [];
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;

  const { data } = await getAdminClient()
    .from("articles")
    .select(
      `*, categories(id, slug, name, color_hex),
       article_authors(order, authors(id, name, slug, avatar_url, role, institution))`
    )
    .eq("id", id)
    .single();

  if (!data) notFound();

  const blocks = parseBlocks(data.content).filter((b) => b.type !== "heading");
  const cat = data.categories as { id: string; slug: string; name: string; color_hex: string | null } | null;
  const sources = parseSources(data.sources);

  type RawAuthor = { id: string; name: string; slug: string; avatar_url?: string | null; role?: string | null; institution?: string | null };
  const authors: AuthorSummary[] = (
    (data.article_authors ?? []) as { order: number; authors: RawAuthor }[]
  )
    .sort((a, b) => a.order - b.order)
    .map((row) => ({
      id:          row.authors.id,
      name:        row.authors.name,
      slug:        row.authors.slug,
      avatarUrl:   row.authors.avatar_url ?? undefined,
      role:        row.authors.role ?? undefined,
      institution: row.authors.institution ?? undefined,
    }));

  return (
    <div className="min-h-screen bg-white">
      {/* Preview banner — mode immersif : seule barre à l'écran sur mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 flex-wrap bg-ns-black px-4 md:px-6 py-3">
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

      {/* Article — same two-column layout as the public reader */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        <article className="flex-1 min-w-0">
          <ArticleHeader
            title={data.title}
            summary={data.summary}
            coverImageUrl={data.cover_image_url}
            coverImageAlt={data.cover_image_alt}
            category={cat ? { name: cat.name, colorHex: cat.color_hex } : { name: "Non classé" }}
            readingTimeMin={data.reading_time_min}
            publishedAt={data.published_at}
            authors={authors}
          />
          <ArticleRenderer blocks={blocks} />
        </article>
        <aside className="hidden lg:block w-64 shrink-0 pt-2">
          <ContributorSidebar
            contributors={authors}
            isSponsored={data.is_sponsored ?? false}
            sources={sources}
          />
        </aside>
      </div>
    </div>
  );
}
