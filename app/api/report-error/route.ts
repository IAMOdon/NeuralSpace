import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/redis";

// Signalement d'erreur par les lecteurs — privé, relu par la rédaction.
// Volontairement strict : rate limit serré + tailles bornées (anti-spam).

const Schema = z.object({
  articleId: z.string().uuid(),
  message: z.string().min(10).max(2000),
  quote: z.string().max(500).optional(),
  sourceUrl: z.string().url().max(500).optional(),
  email: z.string().email().max(254).optional(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const allowed = await checkRateLimit(`report:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de signalements. Réessayez dans une minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Signalement invalide — vérifiez les champs." }, { status: 400 });
  }

  const { articleId, message, quote, sourceUrl, email } = parsed.data;

  const { error } = await adminClient.from("article_reports").insert({
    article_id: articleId,
    message: message.trim(),
    quote: quote?.trim() || null,
    source_url: sourceUrl ?? null,
    reporter_email: email?.toLowerCase().trim() ?? null,
  });

  if (error) {
    // FK violation → article inexistant
    if (error.code === "23503") {
      return NextResponse.json({ error: "Article introuvable." }, { status: 400 });
    }
    console.error("Report insert error:", error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
