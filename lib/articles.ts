import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ContentSchema, ArticleSourcesSchema } from "@/lib/content/validators";
import type { ArticleCard, ArticleWithRelations, Series } from "@/types/article";

type RawSeriesJoin = { order: number; series: Series } | null;

function parseContent(raw: unknown) {
  return ContentSchema.parse(raw);
}

function parseSources(raw: unknown) {
  return ArticleSourcesSchema.parse(raw);
}

export async function getArticles({
  categorySlug,
  tagSlug,
  sort = "recent",
  limit = 20,
  offset = 0,
}: {
  categorySlug?: string;
  tagSlug?: string;
  sort?: "recent" | "popular";
  limit?: number;
  offset?: number;
} = {}): Promise<ArticleCard[]> {
  const client = await createClient();

  // Use !inner only when filtering — avoids excluding articles without tags/category
  const categoryJoin = categorySlug
    ? "categories!inner(id, slug, name, color_hex)"
    : "categories(id, slug, name, color_hex)";

  const tagJoin = tagSlug
    ? "article_tags!inner(tags!inner(id, slug, name))"
    : "article_tags(tags(id, slug, name))";

  let query = client
    .from("articles")
    .select(
      `id, slug, type, title, summary,
       cover_image_url, cover_image_alt,
       reading_time_min, view_count, published_at,
       ${categoryJoin}, ${tagJoin}`
    )
    .eq("status", "published")
    .range(offset, offset + limit - 1);

  if (sort === "popular") {
    query = query.order("view_count", { ascending: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  if (categorySlug) query = query.eq("categories.slug", categorySlug);
  if (tagSlug) query = query.eq("article_tags.tags.slug", tagSlug);

  const { data, error } = await query;

  if (error) throw new Error(`getArticles: ${error.message}`);
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    type: row.type as ArticleCard["type"],
    title: row.title,
    summary: row.summary,
    coverImageUrl: row.cover_image_url ?? undefined,
    coverImageAlt: row.cover_image_alt ?? undefined,
    readingTimeMin: row.reading_time_min,
    viewCount: row.view_count,
    publishedAt: row.published_at ?? undefined,
    category: row.categories as ArticleCard["category"],
    tags: (row.article_tags as { tags: ArticleCard["tags"][number] }[]).map(
      (at) => at.tags
    ),
  }));
}

// cache() deduplicates calls within a single request —
// generateMetadata and the page component both call this without double-fetching.
export const getArticleBySlug = cache(async function getArticleBySlug(
  slug: string
): Promise<ArticleWithRelations | null> {
  const client = await createClient();

  const { data, error } = await client
    .from("articles")
    .select(
      `*,
       categories(id, slug, name, color_hex),
       article_authors(order, authors(id, name, slug, avatar_url, role, institution)),
       article_tags(tags(id, slug, name)),
       article_series(order, series(id, slug, title, description))`
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;

  const rawSeries = data.article_series as RawSeriesJoin;

  return {
    id: data.id,
    slug: data.slug,
    type: data.type as ArticleWithRelations["type"],
    status: data.status as ArticleWithRelations["status"],
    categoryId: data.category_id ?? "",
    title: data.title,
    summary: data.summary,
    coverImageUrl: data.cover_image_url ?? undefined,
    coverImageAlt: data.cover_image_alt ?? undefined,
    content: parseContent(data.content),
    sources: parseSources(data.sources),
    layoutPreset: data.layout_preset ?? undefined,
    wordCount: data.word_count,
    readingTimeMin: data.reading_time_min,
    viewCount: data.view_count,
    seoTitle: data.seo_title ?? undefined,
    seoDescription: data.seo_description ?? undefined,
    ogImageUrl: data.og_image_url ?? undefined,
    lastUpdatedNote: data.last_updated_note ?? undefined,
    scheduledAt: data.scheduled_at ?? undefined,
    publishedAt: data.published_at ?? undefined,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
    createdBy: data.created_by ?? "",
    category: data.categories as ArticleWithRelations["category"],
    authors: (
      data.article_authors as {
        order: number;
        authors: ArticleWithRelations["authors"][number];
      }[]
    )
      .sort((a, b) => a.order - b.order)
      .map((aa) => aa.authors),
    tags: (
      data.article_tags as { tags: ArticleWithRelations["tags"][number] }[]
    ).map((at) => at.tags),
    series: rawSeries
      ? { series: rawSeries.series, order: rawSeries.order }
      : undefined,
  };
});

export async function getCategories() {
  const client = await createClient();
  const { data } = await client
    .from("categories")
    .select("id, slug, name, color_hex")
    .order("name");
  return data ?? [];
}

// Uses adminClient — no cookies needed, safe for generateStaticParams at build time.
export async function getArticleSlugs(): Promise<string[]> {
  const { data } = await adminClient
    .from("articles")
    .select("slug")
    .eq("status", "published");
  return data?.map((r) => r.slug) ?? [];
}
