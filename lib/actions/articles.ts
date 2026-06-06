"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import type { Json } from "@/types/supabase";

function countWords(content: Json): number {
  if (!content) return 0;

  // ContentBlock[] — our native format
  if (Array.isArray(content)) {
    let n = 0;
    for (const b of content as Record<string, unknown>[]) {
      const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
      if (b.type === "paragraph" || b.type === "callout")
        n += (b.content as { text: string }[] ?? []).reduce((a, r) => a + words(r.text ?? ""), 0);
      else if (b.type === "heading" || b.type === "subheading" || b.type === "quote")
        n += words((b.content as string) ?? "");
      else if (b.type === "bullet-list")
        n += (b.items as { text: string }[][] ?? []).reduce((a, item) => a + item.reduce((c, r) => c + words(r.text ?? ""), 0), 0);
      else if (b.type === "key-takeaways")
        n += (b.items as string[] ?? []).reduce((a, s) => a + words(s), 0);
    }
    return n;
  }

  // Tiptap ProseMirror JSON — legacy
  if (typeof content !== "object") return 0;
  const json = content as { content?: unknown[] };
  function extractText(node: unknown): string {
    if (!node || typeof node !== "object") return "";
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.type === "text") return n.text ?? "";
    if (Array.isArray(n.content)) return n.content.map(extractText).join(" ");
    return "";
  }
  const text = (json.content ?? []).map(extractText).join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

function readingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 230));
}

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié.");
  return user;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export type ArticleInput = {
  title: string;
  summary: string;
  content: Json;
  contentSimplified?: Json | null;
  contentScientific?: Json | null;
  hasDualContent?: boolean;
  type: string;
  categoryId?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sources?: Json;
  slug?: string;
  isSponsored?: boolean;
};

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (true) {
    const { count } = await adminClient
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("slug", slug);
    if ((count ?? 0) === 0) return slug;
    slug = `${base}-${++i}`;
  }
}

export async function createArticle(
  input: ArticleInput
): Promise<{ ok: boolean; id?: string; slug?: string; error?: string }> {
  const user = await ensureAdmin().catch((e) => { throw e; });

  const slug = await uniqueSlug(input.slug?.trim() || slugify(input.title));
  const words = countWords(input.content);

  const { data, error } = await adminClient
    .from("articles")
    .insert({
      title:           input.title,
      summary:         input.summary,
      content:         input.content,
      type:            input.type || "short",
      slug,
      status:          "draft",
      category_id:     input.categoryId ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      cover_image_alt: input.coverImageAlt ?? null,
      seo_title:       input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      sources:         input.sources ?? [],
      is_sponsored:    input.isSponsored ?? false,
      word_count:      words,
      reading_time_min: readingTime(words),
      created_by:      user.id,
    })
    .select("id, slug")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id, slug: data.slug };
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();

  const words = input.content ? countWords(input.content) : undefined;

  const { error } = await adminClient
    .from("articles")
    .update({
      ...(input.title             !== undefined && { title: input.title }),
      ...(input.summary           !== undefined && { summary: input.summary }),
      ...(input.content           !== undefined && { content: input.content }),
      ...(input.contentSimplified !== undefined && { content_simplified: input.contentSimplified }),
      ...(input.contentScientific !== undefined && { content_scientific: input.contentScientific }),
      ...(input.hasDualContent    !== undefined && { has_dual_content: input.hasDualContent }),
      ...(input.type              !== undefined && { type: input.type }),
      ...(input.slug              !== undefined && { slug: input.slug }),
      ...(input.categoryId        !== undefined && { category_id: input.categoryId }),
      ...(input.coverImageUrl     !== undefined && { cover_image_url: input.coverImageUrl }),
      ...(input.coverImageAlt     !== undefined && { cover_image_alt: input.coverImageAlt }),
      ...(input.seoTitle          !== undefined && { seo_title: input.seoTitle }),
      ...(input.seoDescription    !== undefined && { seo_description: input.seoDescription }),
      ...(input.sources           !== undefined && { sources: input.sources }),
      ...(input.isSponsored       !== undefined && { is_sponsored: input.isSponsored }),
      ...(words                   !== undefined && { word_count: words, reading_time_min: readingTime(words) }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/articles");
  // Do NOT revalidatePath the edit page — that would remount the client component
  // mid-transition and wipe the flash message state.
  return { ok: true };
}

export async function publishArticle(
  id: string
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  await ensureAdmin();

  const { data, error } = await adminClient
    .from("articles")
    .update({
      status:       "published",
      published_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath(`/${data.slug}`);
  revalidatePath("/dashboard/articles");
  return { ok: true, slug: data.slug };
}

export async function unpublishArticle(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();

  const { error } = await adminClient
    .from("articles")
    .update({ status: "draft", published_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/dashboard/articles");
  return { ok: true };
}

export async function deleteArticle(id: string): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();

  const { error } = await adminClient.from("articles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/articles");
  revalidatePath("/");
  redirect("/dashboard/articles");
}
