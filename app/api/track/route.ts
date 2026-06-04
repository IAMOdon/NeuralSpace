import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const ViewSchema = z.object({
  type: z.literal("view"),
  articleId: z.string().min(1),
  // sessionId intentionally absent — article_views is consent-free aggregate data
});

const WatchSchema = z.object({
  type: z.literal("watch"),
  articleId: z.string().min(1),
  sessionId: z.string(),
  durationSec: z.number().int().min(0),
  scrollDepth: z.number().int().min(0).max(100),
  readCompleted: z.boolean(),
  wordLookups: z.number().int().min(0),
  sourceClicks: z.number().int().min(0),
  device: z.enum(["mobile", "tablet", "desktop"]),
  referrerSource: z.string(),
  articleFormat: z.enum(["short", "long"]),
  categoryId: z.string().min(1).optional(),
  tagIds: z.array(z.string()).optional(),
});

const EventSchema = z.discriminatedUnion("type", [ViewSchema, WatchSchema]);

function getDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  return "desktop";
}

function getReferrerSource(referer: string): string {
  if (!referer) return "direct";
  if (/google\./i.test(referer)) return "google_organic";
  if (/bing\./i.test(referer)) return "bing";
  if (/twitter\.com|t\.co/i.test(referer)) return "twitter";
  if (/instagram\.com/i.test(referer)) return "instagram";
  if (/facebook\.com/i.test(referer)) return "facebook";
  if (/linkedin\.com/i.test(referer)) return "linkedin";
  return "other";
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const referer = req.headers.get("referer") ?? "";
  const country = req.headers.get("x-vercel-ip-country") ??
                  req.headers.get("cf-ipcountry") ?? null;

  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(null, { status: 400 });
  }

  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(null, { status: 400 });

  const event = parsed.data;
  const device = getDevice(ua);
  const referrerSource = getReferrerSource(referer);

  if (event.type === "view") {
    await adminClient.from("article_views").insert({
      article_id: event.articleId,
      referrer_source: referrerSource,
      device,
      country_code: country,
      hour_of_day: hour,
      day_of_week: day,
    });

    // Always increment view count
    await adminClient.rpc("increment_view_count", { p_article_id: event.articleId });
  }

  if (event.type === "watch") {
    await adminClient.from("watch_events").insert({
      article_id: event.articleId,
      session_id: event.sessionId,
      duration_sec: event.durationSec,
      scroll_depth: event.scrollDepth,
      read_completed: event.readCompleted,
      word_lookups: event.wordLookups,
      source_clicks: event.sourceClicks,
      referrer_source: referrerSource,
      device,
      country_code: country,
      hour_of_day: hour,
      day_of_week: day,
    });

    // Update session profile
    await adminClient.rpc("upsert_session_profile", {
      p_session_id: event.sessionId,
      p_duration_sec: event.durationSec,
      p_read_completed: event.readCompleted,
      p_word_lookups: event.wordLookups,
      p_source_clicks: event.sourceClicks,
      p_device: device,
      p_country_code: country ?? "",
      p_format: event.articleFormat,
    });

    // Update interest scores per category/tag
    if (event.categoryId) {
      const score = event.readCompleted ? 2 : 1;
      await adminClient.rpc("increment_category_interest", {
        p_session_id: event.sessionId,
        p_category_id: event.categoryId,
        p_score: score,
      });
      await adminClient.rpc("refresh_top_category", { p_session_id: event.sessionId });
    }
  }

  return NextResponse.json({ ok: true });
}
