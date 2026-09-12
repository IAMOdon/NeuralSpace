import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";

// Builds a safe tsquery with prefix matching for each token.
// "trous noirs" → "trous:* & noirs:*"
// Handles French accents, ignores special chars, skips short tokens.
function buildTsQuery(input: string): string {
  const tokens = input
    .trim()
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëîïôùûüÿçœæ\-]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) return "";
  return tokens.map((t) => `${t}:*`).join(" & ");
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  // Seul l'admin voit les brouillons dans les résultats
  const isAdmin = !!(await getAdminUser());

  const tsQuery = buildTsQuery(q);

  const { data, error } = await getAdminClient().rpc("search_articles", {
    query: tsQuery || q,
    max_results: 10,
  });

  if (error) {
    const fallbackQuery = getAdminClient()
      .from("articles")
      .select("id, title, slug, status, published_at, view_count, summary")
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%`)
      .order("published_at", { ascending: false })
      .limit(10);

    if (!isAdmin) fallbackQuery.eq("status", "published");

    const { data: fallback } = await fallbackQuery;
    return NextResponse.json(fallback ?? []);
  }

  // Strip drafts for non-admin callers
  const results = isAdmin ? data : (data ?? []).filter((r: { status: string }) => r.status === "published");

  return NextResponse.json(results ?? [], {
    headers: { "Cache-Control": "no-store" },
  });
}
