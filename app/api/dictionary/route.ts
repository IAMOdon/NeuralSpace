import { NextRequest, NextResponse } from "next/server";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word");
  if (!word || word.length < 2) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://fr.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
      { next: { revalidate: 86400 } } // cache 24h côté serveur
    );

    if (!res.ok) return NextResponse.json(null);

    const json = await res.json();

    const firstKey = Object.keys(json)[0] ?? "";
    const entries: {
      partOfSpeech: string;
      definitions: { definition: string }[];
    }[] = json["fr"] ?? json[firstKey] ?? [];

    const definitions = entries
      .flatMap((entry) =>
        entry.definitions.slice(0, 2).map((d) => ({
          partOfSpeech: entry.partOfSpeech,
          definition: stripHtml(d.definition),
        }))
      )
      .filter((d) => d.definition.length > 0)
      .slice(0, 3);

    return NextResponse.json(definitions.length > 0 ? definitions : null);
  } catch {
    return NextResponse.json(null);
  }
}
