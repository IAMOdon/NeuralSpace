import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/articles";
import { ArticleEditor } from "@/components/admin/editor/ArticleEditor";
import type { Json } from "@/types/supabase";

export const metadata: Metadata = { title: "Éditer l'article — Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  const [{ data: article }, categories] = await Promise.all([
    adminClient
      .from("articles")
      .select("id, title, summary, content, type, status, slug, category_id, cover_image_url, cover_image_alt, seo_title, seo_description, sources, is_sponsored, article_authors(order, authors(id, name, slug, avatar_url, role, institution))")
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
        id:             article.id,
        title:          article.title,
        summary:        article.summary,
        content:        (article.content as object) ?? [],
        type:           article.type,
        status:         article.status,
        slug:           article.slug,
        categoryId:     article.category_id,
        coverImageUrl:  article.cover_image_url,
        coverImageAlt:  article.cover_image_alt,
        seoTitle:       article.seo_title,
        seoDescription: article.seo_description,
        sources,
        isSponsored:    article.is_sponsored ?? false,
      }}
    />
  );
}
