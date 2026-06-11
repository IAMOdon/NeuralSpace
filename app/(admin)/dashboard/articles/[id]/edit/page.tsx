import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/articles";
import { ArticleEditor } from "@/components/admin/editor/ArticleEditor";
import { ContentSchema } from "@/lib/content/validators";
import type { Json } from "@/types/supabase";

export const metadata: Metadata = { title: "Éditer l'article — Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  const [{ data: article }, categories] = await Promise.all([
    adminClient
      .from("articles")
      .select("id, title, summary, content, content_simplified, content_scientific, has_dual_content, type, status, slug, category_id, cover_image_url, cover_image_alt, seo_title, seo_description, sources, is_sponsored, corrections, article_authors(order, authors(id, name, slug, avatar_url, role, institution))")
      .eq("id", id)
      .single(),
    getCategories(),
  ]);

  if (!article) notFound();

  const sources = Array.isArray(article.sources)
    ? (article.sources as { label: string; url: string }[])
    : [];

  type AuthorRow = { id: string; name: string; slug: string; avatar_url: string | null; role: string | null; institution: string | null };
  const contributors = (
    article.article_authors as { order: number; authors: AuthorRow }[] | null ?? []
  )
    .sort((a, b) => a.order - b.order)
    .map((aa) => ({
      id: aa.authors.id,
      name: aa.authors.name,
      avatarUrl: aa.authors.avatar_url,
      role: aa.authors.role,
      institution: aa.authors.institution,
    }));

  // Validate and parse content — falls back to empty array if invalid
  const parsedContent = ContentSchema.safeParse(article.content);
  const validContent = parsedContent.success ? article.content : [];

  const parsedSimplified = ContentSchema.safeParse(article.content_simplified ?? article.content);
  const validSimplified = parsedSimplified.success ? (article.content_simplified ?? article.content) : [];

  const parsedScientific = article.content_scientific ? ContentSchema.safeParse(article.content_scientific) : { success: false };
  const validScientific = parsedScientific.success ? article.content_scientific : undefined;

  return (
    <ArticleEditor
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        colorHex: c.colorHex ?? null,
      }))}
      initialContributors={contributors}
      article={{
        id:                article.id,
        title:             article.title,
        summary:           article.summary,
        content:           validContent,
        contentSimplified: validSimplified,
        contentScientific: validScientific,
        hasDualContent:    article.has_dual_content ?? false,
        type:              article.type,
        status:            article.status,
        slug:              article.slug,
        categoryId:        article.category_id,
        coverImageUrl:     article.cover_image_url,
        coverImageAlt:     article.cover_image_alt,
        seoTitle:          article.seo_title,
        seoDescription:    article.seo_description,
        sources,
        isSponsored:       article.is_sponsored ?? false,
        corrections:       Array.isArray(article.corrections)
          ? (article.corrections as { date: string; note: string }[])
          : [],
      }}
    />
  );
}
