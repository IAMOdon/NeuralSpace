import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word");
  if (!word || word.length < 2) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return NextResponse.json(null);

    const data = await res.json();
    const extract: string = data.extract ?? "";
    if (!extract) return NextResponse.json(null);

    // Truncate to ~280 chars at a sentence boundary
    const truncated =
      extract.length > 280
        ? extract.slice(0, 280).replace(/[^.!?]*$/, "").trim()
        : extract;

    return NextResponse.json({
      title: data.title as string,
      extract: truncated,
      wikiUrl: data.content_urls?.desktop?.page as string | undefined,
    });
  } catch {
    return NextResponse.json(null);
  }
}
