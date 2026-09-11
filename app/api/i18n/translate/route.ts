import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { drainQueue } from "@/lib/i18n/queue";

/**
 * Drains the translation queue. Called by the Vercel cron in vercel.json.
 *
 * Not reachable anonymously: it spends Gemini tokens, so an open endpoint would
 * be someone else's budget to burn. Vercel sends `Authorization: Bearer
 * $CRON_SECRET` on scheduled invocations.
 */

// Translating several locales takes far longer than the default budget.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;

  // Constant-time compare, and length-guarded because timingSafeEqual throws on
  // a length mismatch.
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }

  const limitParam = Number(request.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 10) : undefined;

  try {
    const result = await drainQueue(limit);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[i18n] drain failed:", e);
    return NextResponse.json({ error: "Échec du traitement de la file." }, { status: 500 });
  }
}
