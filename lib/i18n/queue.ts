import "server-only";
import { createHash } from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { ContentSchema } from "@/lib/content/validators";
import { slugifyLocalized } from "@/lib/slug";
import { targetLocales, SOURCE_LOCALE } from "./locales.ts";
import { extractStrings, reinjectStrings, extractMetaStrings, reinjectMetaStrings } from "./extract.ts";
import { translateStrings, translationModel } from "./gemini.ts";
import type { ContentBlock } from "@/types/content";

/**
 * The translation queue.
 *
 * Publishing an article only enqueues work — translating ten locales inline
 * would blow past the function timeout and leave partial state behind. A cron
 * route drains the queue a few rows at a time, so each (article, locale) pair
 * succeeds or fails on its own without holding up the rest.
 */

/** How many rows one cron tick will attempt. Each is several Gemini calls. */
const DEFAULT_BATCH = 3;

/** Give up on a row after this many attempts so a permanently broken article
 *  cannot occupy the queue forever. */
const MAX_ATTEMPTS = 4;

type SourceArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  seo_title: string | null;
  seo_description: string | null;
  cover_image_alt: string | null;
  content: unknown;
  content_simplified: unknown;
  content_scientific: unknown;
  translations_enabled: boolean;
};

const ARTICLE_COLUMNS =
  "id,slug,title,summary,seo_title,seo_description,cover_image_alt,content,content_simplified,content_scientific,translations_enabled";

/**
 * Fingerprint of everything a translation is derived from. When an article is
 * edited, this changes and the affected locales are re-queued; when it does
 * not, an edit to some untranslated field costs nothing.
 */
export function sourceHash(a: Pick<SourceArticle,
  "title" | "summary" | "seo_title" | "seo_description" | "cover_image_alt" | "content" | "content_simplified" | "content_scientific">
): string {
  return createHash("sha256")
    .update(JSON.stringify([
      a.title, a.summary, a.seo_title, a.seo_description, a.cover_image_alt,
      a.content_simplified ?? a.content, a.content_scientific,
    ]))
    .digest("hex");
}

/**
 * Queues every enabled target locale for an article.
 *
 * A locale already `ready` at the same source hash is left alone, so
 * re-publishing an unchanged article is free. Returns how many rows were
 * queued.
 */
export async function enqueueTranslations(articleId: string): Promise<number> {
  const { data: article, error } = await getAdminClient()
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("id", articleId)
    .single<SourceArticle>();

  if (error || !article) return 0;
  if (!article.translations_enabled) return 0;

  const hash = sourceHash(article);
  const locales = targetLocales().map((l) => l.code);
  if (locales.length === 0) return 0;

  const { data: existing } = await getAdminClient()
    .from("article_translations")
    .select("locale,status,source_hash")
    .eq("article_id", articleId);

  const upToDate = new Set(
    (existing ?? [])
      .filter((r) => r.status === "ready" && r.source_hash === hash)
      .map((r) => r.locale)
  );

  const rows = locales
    .filter((code) => !upToDate.has(code))
    .map((code) => ({
      article_id: articleId,
      locale: code,
      // Placeholders — the worker overwrites these. The columns are NOT NULL so
      // the queue row has to carry something; the source values are the least
      // surprising thing to show if anything ever reads a pending row.
      slug: `${article.slug}-${code}`,
      title: article.title,
      summary: article.summary,
      source_hash: hash,
      status: "pending" as const,
      attempts: 0,
      error: null,
    }));

  if (rows.length === 0) return 0;

  const { error: upsertError } = await getAdminClient()
    .from("article_translations")
    .upsert(rows, { onConflict: "article_id,locale" });

  if (upsertError) {
    console.error("[i18n] enqueue failed:", upsertError.message);
    return 0;
  }
  return rows.length;
}

/** Anchors are URL fragments, so they are regenerated from the translated
 *  heading rather than translated. Duplicates within a document get a suffix,
 *  matching how the source anchors stay unique. */
function retargetAnchors(blocks: ContentBlock[], locale: string): ContentBlock[] {
  const seen = new Map<string, number>();
  return blocks.map((block) => {
    if (block.type !== "subheading") return block;
    const base = slugifyLocalized(block.content, locale, block.id) || block.id;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return { ...block, anchor: n === 0 ? base : `${base}-${n + 1}` };
  });
}

/** A slug unique within the locale. */
async function uniqueLocalizedSlug(title: string, locale: string, articleId: string): Promise<string> {
  const base = slugifyLocalized(title, locale, articleId) || `article-${articleId.replace(/-/g, "").slice(0, 8)}`;
  let candidate = base;

  for (let i = 2; i < 50; i++) {
    const { data } = await getAdminClient()
      .from("article_translations")
      .select("article_id")
      .eq("locale", locale)
      .eq("slug", candidate)
      .maybeSingle();

    if (!data || data.article_id === articleId) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

async function translateContent(
  raw: unknown,
  locale: string,
  model: string
): Promise<ContentBlock[] | null> {
  const parsed = ContentSchema.safeParse(raw);
  if (!parsed.success) return null;
  const blocks = parsed.data;
  if (blocks.length === 0) return null;

  const strings = extractStrings(blocks);
  const translated = Object.keys(strings).length > 0
    ? await translateStrings(strings, locale, model)
    : {};

  const rebuilt = reinjectStrings(blocks, translated);

  // Reinjection guarantees structure, but the result is about to be published,
  // so it is validated as content one more time before it can be written.
  const revalidated = ContentSchema.safeParse(retargetAnchors(rebuilt, locale));
  if (!revalidated.success) {
    throw new Error(`translated content failed validation: ${revalidated.error.issues[0]?.message ?? "unknown"}`);
  }
  return revalidated.data;
}

/** Translates one queued row. Throws on failure; the caller records it. */
async function translateRow(articleId: string, locale: string): Promise<void> {
  const { data: article, error } = await getAdminClient()
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("id", articleId)
    .single<SourceArticle>();

  if (error || !article) throw new Error("source article vanished");

  const model = translationModel();

  const metaStrings = extractMetaStrings({
    title: article.title,
    summary: article.summary,
    seoTitle: article.seo_title,
    seoDescription: article.seo_description,
    coverImageAlt: article.cover_image_alt,
  });
  const meta = reinjectMetaStrings(
    {
      title: article.title,
      summary: article.summary,
      seoTitle: article.seo_title,
      seoDescription: article.seo_description,
      coverImageAlt: article.cover_image_alt,
    },
    await translateStrings(metaStrings, locale, model)
  );

  const simplified = await translateContent(article.content_simplified ?? article.content, locale, model);
  const scientific = article.content_scientific
    ? await translateContent(article.content_scientific, locale, model)
    : null;

  const slug = await uniqueLocalizedSlug(meta.title, locale, articleId);

  const { error: writeError } = await getAdminClient()
    .from("article_translations")
    .update({
      slug,
      title: meta.title,
      summary: meta.summary,
      seo_title: meta.seoTitle ?? null,
      seo_description: meta.seoDescription ?? null,
      cover_image_alt: meta.coverImageAlt ?? null,
      content_simplified: simplified as never,
      content_scientific: scientific as never,
      source_hash: sourceHash(article),
      status: "ready",
      error: null,
      model,
      translated_at: new Date().toISOString(),
    })
    .eq("article_id", articleId)
    .eq("locale", locale);

  if (writeError) throw new Error(`write failed: ${writeError.message}`);
}

export type DrainResult = {
  claimed: number;
  ready: number;
  failed: number;
  details: { locale: string; articleId: string; status: "ready" | "failed"; error?: string }[];
};

/**
 * Processes up to `limit` pending rows, oldest first.
 *
 * Each row is claimed with a conditional update, so two overlapping cron ticks
 * cannot translate the same row twice: the second claim matches nothing.
 */
export async function drainQueue(limit: number = DEFAULT_BATCH): Promise<DrainResult> {
  const result: DrainResult = { claimed: 0, ready: 0, failed: 0, details: [] };

  const { data: pending } = await getAdminClient()
    .from("article_translations")
    .select("article_id,locale,attempts")
    .eq("status", "pending")
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(limit);

  for (const row of pending ?? []) {
    const { data: claimed } = await getAdminClient()
      .from("article_translations")
      .update({ status: "running", attempts: (row.attempts ?? 0) + 1 })
      .eq("article_id", row.article_id)
      .eq("locale", row.locale)
      .eq("status", "pending")
      .select("article_id")
      .maybeSingle();

    if (!claimed) continue; // another tick got there first
    result.claimed++;

    try {
      await translateRow(row.article_id, row.locale);
      result.ready++;
      result.details.push({ locale: row.locale, articleId: row.article_id, status: "ready" });
    } catch (e) {
      const message = (e as Error).message.slice(0, 400);
      const attempts = (row.attempts ?? 0) + 1;
      // Back to pending while retries remain, so a transient rate limit is not
      // a permanent failure.
      await getAdminClient()
        .from("article_translations")
        .update({ status: attempts >= MAX_ATTEMPTS ? "failed" : "pending", error: message })
        .eq("article_id", row.article_id)
        .eq("locale", row.locale);

      result.failed++;
      result.details.push({ locale: row.locale, articleId: row.article_id, status: "failed", error: message });
      console.error(`[i18n] ${row.locale} for ${row.article_id} failed:`, message);
    }
  }

  return result;
}

export { SOURCE_LOCALE };
