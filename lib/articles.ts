import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ContentSchema, ArticleSourcesSchema, ArticleCorrectionsSchema } from "@/lib/content/validators";
import { tiptapToContentBlocks } from "@/lib/content/tiptapConverter";
import type { ContentBlock } from "@/types/content";
import type { ArticleCorrection, ArticleSource, Category } from "@/types/article";
import type { ArticleCard, ArticleWithRelations, Series } from "@/types/article";

type RawSeriesJoin = { order: number; series: Series } | null;

// ── Tiptap ProseMirror → ContentBlock converter ───────────────────────────────

type TiptapNode = {
  type: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
};




// safeParse — malformed DB content returns empty array, never crashes the page.
// Handles both the native ContentBlock[] format and Tiptap ProseMirror JSON.
function parseContent(raw: unknown): ContentBlock[] {
  // Native format first
  const native = ContentSchema.safeParse(raw);
  if (native.success) return native.data;

  // Tiptap doc fallback
  if (raw && typeof raw === "object" && "type" in raw && (raw as TiptapNode).type === "doc") {
    return tiptapToContentBlocks(raw as TiptapNode);
  }

  return [];
}

function parseSources(raw: unknown): ArticleSource[] {
  const result = ArticleSourcesSchema.safeParse(raw);
  return result.success ? result.data : [];
}

function parseCorrections(raw: unknown): ArticleCorrection[] {
  const result = ArticleCorrectionsSchema.safeParse(raw);
  return result.success ? result.data : [];
}

const UNCATEGORIZED: Category = { id: "", slug: "", name: "Non classé" };

// Supabase returns snake_case; our types use camelCase.
function mapCategory(raw: { id: string; slug: string; name: string; color_hex: string | null } | null): Category {
  if (!raw) return UNCATEGORIZED;
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    colorHex: raw.color_hex ?? undefined,
  };
}

export async function getArticles({
  categorySlug,
  tagSlug,
  searchQuery,
  sort = "recent",
  limit = 20,
  offset = 0,
}: {
  categorySlug?: string;
  tagSlug?: string;
  searchQuery?: string;
  sort?: "recent" | "popular";
  limit?: number;
  offset?: number;
} = {}): Promise<ArticleCard[]> {
  const client = await createClient();

  // !inner only when filtering — avoids excluding articles without tags/category
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
  if (searchQuery) {
    // Strip PostgREST filter special chars (comma, parentheses, dot used as operators)
    const safe = searchQuery.replace(/[,().]/g, " ").trim();
    if (safe) query = query.or(`title.ilike.%${safe}%,summary.ilike.%${safe}%`);
  }

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
    category: mapCategory(row.categories as { id: string; slug: string; name: string; color_hex: string | null }),
    tags: ((row.article_tags ?? []) as { tags: ArticleCard["tags"][number] }[]).map(
      (at) => at.tags
    ),
  }));
}

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
    contentSimplified: parseContent(data.content_simplified ?? data.content),
    contentScientific: data.content_scientific ? parseContent(data.content_scientific) : undefined,
    hasDualContent: data.has_dual_content ?? false,
    sources: parseSources(data.sources),
    corrections: parseCorrections(data.corrections),
    layoutPreset: data.layout_preset ?? undefined,
    wordCount: data.word_count,
    readingTimeMin: data.reading_time_min,
    viewCount: data.view_count,
    isSponsored: data.is_sponsored ?? false,
    seoTitle: data.seo_title ?? undefined,
    seoDescription: data.seo_description ?? undefined,
    ogImageUrl: data.og_image_url ?? undefined,
    lastUpdatedNote: data.last_updated_note ?? undefined,
    scheduledAt: data.scheduled_at ?? undefined,
    publishedAt: data.published_at ?? undefined,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
    createdBy: data.created_by ?? "",
    category: mapCategory(data.categories as { id: string; slug: string; name: string; color_hex: string | null }),
    authors: (
      (data.article_authors ?? []) as {
        order: number;
        authors: ArticleWithRelations["authors"][number];
      }[]
    )
      .sort((a, b) => a.order - b.order)
      .map((aa) => aa.authors),
    tags: (
      (data.article_tags ?? []) as { tags: ArticleWithRelations["tags"][number] }[]
    ).map((at) => at.tags),
    series: rawSeries
      ? { series: rawSeries.series, order: rawSeries.order }
      : undefined,
  };
});

// Lightweight fetch for the feed news hero — just what's needed to render the
// featured card (cover image, category, reading time) without parsing content.
export type ArticleHeroMeta = {
  coverImageUrl?: string;
  coverImageAlt?: string;
  categoryName?: string;
  categoryColor?: string | null;
  readingTimeMin?: number | null;
};

export async function getArticleHeroMeta(slug: string): Promise<ArticleHeroMeta | null> {
  const client = await createClient();
  const { data, error } = await client
    .from("articles")
    .select("cover_image_url, cover_image_alt, reading_time_min, categories(name, color_hex)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  const cat = data.categories as { name: string; color_hex: string | null } | null;
  return {
    coverImageUrl: data.cover_image_url ?? undefined,
    coverImageAlt: data.cover_image_alt ?? undefined,
    categoryName: cat?.name,
    categoryColor: cat?.color_hex ?? null,
    readingTimeMin: data.reading_time_min ?? null,
  };
}

export async function getCategories(): Promise<Category[]> {
  const client = await createClient();
  const { data } = await client
    .from("categories")
    .select("id, slug, name, color_hex")
    .order("name");
  return (data ?? []).map(mapCategory);
}

export async function searchContributors(q: string) {
  const client = await createClient();
  if (!q.trim()) return [];
  const { data } = await client
    .from("authors")
    .select("id, name, slug, avatar_url, role, institution")
    .ilike("name", `%${q}%`)
    .limit(8);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    avatarUrl: r.avatar_url ?? null,
    role: r.role ?? null,
    institution: r.institution ?? null,
  }));
}

// adminClient — no cookies, safe for generateStaticParams at build time.
export async function getArticleSlugs(): Promise<string[]> {
  const { data } = await adminClient
    .from("articles")
    .select("slug")
    .eq("status", "published");
  return data?.map((r) => r.slug) ?? [];
}
