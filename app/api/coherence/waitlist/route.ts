import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/redis";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(request: NextRequest) {
  // Rate limit by IP — generous, but stops abuse of the public endpoint.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const allowed = await checkRateLimit(`waitlist:${ip}`, 10, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;
  const country = request.headers.get("x-vercel-ip-country") ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (adminClient as any)
    .from("coherence_waitlist")
    .insert({ email, source: "coherence_page", user_agent: userAgent, country });

  if (error) {
    // Unique violation — already signed up. Treat as success (idempotent).
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, already: true });
    }
    console.error("Coherence waitlist insert error:", error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
