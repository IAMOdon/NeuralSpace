"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { ensureAdmin } from "@/lib/auth";
import { renderEmailHtml, renderEmailText } from "@/lib/email/render";
import { sendOne, sendBatch, isEmailConfigured, type OutgoingEmail } from "@/lib/email/send";
import { buildTemplate, type EmailTemplateId } from "@/lib/email/templates";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import type { Campaign, EmailBlock } from "@/types/email";
import type { Json } from "@/types/supabase";

// ── Validation des blocs (frontière système : le builder client envoie du JSON) ──

const BlockSchema: z.ZodType<EmailBlock> = z.discriminatedUnion("type", [
  z.object({ id: z.string(), type: z.literal("heading"), text: z.string() }),
  z.object({ id: z.string(), type: z.literal("paragraph"), text: z.string() }),
  z.object({
    id: z.string(),
    type: z.literal("image"),
    url: z.string().url(),
    alt: z.string(),
    href: z.string().url().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("button"),
    label: z.string(),
    url: z.string().url(),
  }),
  z.object({ id: z.string(), type: z.literal("divider") }),
  z.object({
    id: z.string(),
    type: z.literal("article"),
    articleId: z.string(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    coverImageUrl: z.string().optional(),
    coverImageAlt: z.string().optional(),
    categoryName: z.string().optional(),
    categoryColor: z.string().optional(),
    readingTimeMin: z.number().optional(),
  }),
]);

const BlocksSchema = z.array(BlockSchema);

function parseBlocks(raw: unknown): EmailBlock[] {
  const parsed = BlocksSchema.safeParse(raw);
  return parsed.success ? parsed.data : [];
}

function mapCampaign(row: {
  id: string;
  subject: string;
  preheader: string;
  blocks: Json;
  status: string;
  audience: string;
  sent_at: string | null;
  recipient_count: number | null;
  created_at: string;
  updated_at: string;
}): Campaign {
  return {
    id: row.id,
    subject: row.subject,
    preheader: row.preheader,
    blocks: parseBlocks(row.blocks),
    status: row.status as Campaign["status"],
    audience: row.audience as Campaign["audience"],
    sentAt: row.sent_at ?? undefined,
    recipientCount: row.recipient_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<Campaign[]> {
  await ensureAdmin();
  const { data } = await adminClient
    .from("email_campaigns")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data ?? []).map(mapCampaign);
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  await ensureAdmin();
  const { data } = await adminClient
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .single();
  return data ? mapCampaign(data) : null;
}

export async function createCampaign(
  template: EmailTemplateId = "blank"
): Promise<{ ok: boolean; id?: string; error?: string }> {
  await ensureAdmin();

  // Les templates « digest » et « annonce » se pré-remplissent avec les
  // derniers articles publiés — c'est tout l'intérêt : une campagne prête
  // en un clic, plus qu'à ajuster le texte.
  const needsArticles = template === "digest" || template === "announcement";
  const articles = needsArticles ? await searchArticlesForEmail("") : [];
  const { subject, preheader, blocks } = buildTemplate(template, articles, SITE_URL);

  const { data, error } = await adminClient
    .from("email_campaigns")
    .insert({ subject, preheader, blocks: blocks as unknown as Json })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/newsletter");
  return { ok: true, id: data.id };
}

export async function updateCampaign(
  id: string,
  input: { subject: string; preheader: string; blocks: EmailBlock[] }
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();

  const blocks = BlocksSchema.safeParse(input.blocks);
  if (!blocks.success) return { ok: false, error: "Blocs invalides." };

  const { error } = await adminClient
    .from("email_campaigns")
    .update({
      subject: input.subject,
      preheader: input.preheader,
      blocks: blocks.data as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "draft"); // une campagne envoyée est immuable

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/newsletter");
  return { ok: true };
}

export async function deleteCampaign(id: string): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();
  const { error } = await adminClient
    .from("email_campaigns")
    .delete()
    .eq("id", id)
    .eq("status", "draft"); // l'historique des campagnes envoyées est conservé
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/newsletter");
  return { ok: true };
}

// ── Recherche d'articles pour le widget ──────────────────────────────────────

export type ArticlePick = {
  articleId: string;
  slug: string;
  title: string;
  summary: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  categoryName?: string;
  categoryColor?: string;
  readingTimeMin?: number;
};

export async function searchArticlesForEmail(q: string): Promise<ArticlePick[]> {
  await ensureAdmin();
  let query = adminClient
    .from("articles")
    .select("id, slug, title, summary, cover_image_url, cover_image_alt, reading_time_min, categories(name, color_hex)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(8);
  if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);

  const { data } = await query;
  return (data ?? []).map((r) => {
    const cat = r.categories as { name: string; color_hex: string | null } | null;
    return {
      articleId: r.id,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      coverImageUrl: r.cover_image_url ?? undefined,
      coverImageAlt: r.cover_image_alt ?? undefined,
      categoryName: cat?.name,
      categoryColor: cat?.color_hex ?? undefined,
      readingTimeMin: r.reading_time_min ?? undefined,
    };
  });
}

// ── Envoi ─────────────────────────────────────────────────────────────────────

export async function getEmailConfigStatus(): Promise<{ configured: boolean }> {
  await ensureAdmin();
  return { configured: isEmailConfigured() };
}

function buildEmail(campaign: Campaign, to: string, unsubscribeToken?: string): OutgoingEmail {
  const unsubscribeUrl = unsubscribeToken
    ? `${SITE_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`
    : undefined;
  const opts = {
    siteUrl: SITE_URL,
    siteName: SITE_NAME,
    preheader: campaign.preheader,
    unsubscribeUrl,
  };
  return {
    to,
    subject: campaign.subject,
    html: renderEmailHtml(campaign.blocks, opts),
    text: renderEmailText(campaign.blocks, opts),
    unsubscribeUrl,
  };
}

const TestSchema = z.object({ email: z.string().email() });

export async function sendTestEmail(
  campaignId: string,
  toEmail: string
): Promise<{ ok: boolean; error?: string }> {
  await ensureAdmin();

  const parsed = TestSchema.safeParse({ email: toEmail });
  if (!parsed.success) return { ok: false, error: "Adresse e-mail invalide." };

  const campaign = await getCampaign(campaignId);
  if (!campaign) return { ok: false, error: "Campagne introuvable." };
  if (!campaign.subject.trim()) return { ok: false, error: "Ajoutez un objet avant le test." };

  try {
    const email = buildEmail(
      { ...campaign, subject: `[TEST] ${campaign.subject}` },
      parsed.data.email
    );
    await sendOne(email);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Échec de l'envoi du test." };
  }
}

export async function sendCampaign(
  campaignId: string
): Promise<{ ok: boolean; sent?: number; error?: string }> {
  await ensureAdmin();

  const campaign = await getCampaign(campaignId);
  if (!campaign) return { ok: false, error: "Campagne introuvable." };
  if (campaign.status === "sent") return { ok: false, error: "Cette campagne a déjà été envoyée." };
  if (!campaign.subject.trim()) return { ok: false, error: "L'objet est obligatoire." };
  if (campaign.blocks.length === 0) return { ok: false, error: "La campagne est vide." };

  const { data: subscribers, error: subError } = await adminClient
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .is("unsubscribed_at", null);

  if (subError) return { ok: false, error: subError.message };
  if (!subscribers || subscribers.length === 0) {
    return { ok: false, error: "Aucun abonné actif." };
  }

  try {
    const emails = subscribers.map((s) => buildEmail(campaign, s.email, s.unsubscribe_token));
    const sent = await sendBatch(emails);

    await adminClient
      .from("email_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: sent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    revalidatePath("/dashboard/newsletter");
    return { ok: true, sent };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Échec de l'envoi." };
  }
}
