import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/articles";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categorySlug = searchParams.get("categorySlug");
  const exclude = searchParams.get("exclude"); // article slug to exclude

  if (!categorySlug) {
    return NextResponse.json([], { status: 400 });
  }

  const articles = await getArticles({ categorySlug, sort: "popular", limit: 6 });
  const filtered = exclude ? articles.filter((a) => a.slug !== exclude) : articles;

  return NextResponse.json(filtered.slice(0, 3), {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
