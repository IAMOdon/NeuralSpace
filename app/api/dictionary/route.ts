import { NextRequest, NextResponse } from "next/server";

function parseWiktionaryDefinitions(wikitext: string): string[] {
  return wikitext
    .split("\n")
    .filter((line) => line.startsWith("# ") && !line.startsWith("## "))
    .map((line) => {
      let clean = line.slice(2);
      // [[label|display]] → display, [[word]] → word
      clean = clean.replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, "$1");
      // {{...}} templates removed
      clean = clean.replace(/\{\{[^}]+\}\}/g, "");
      // italic/bold markup
      clean = clean.replace(/'{2,}/g, "");
      // HTML entities
      clean = clean.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
      return clean.trim();
    })
    .filter((d) => d.length > 5)
    .slice(0, 3);
}

async function fromWiktionary(word: string): Promise<string[] | null> {
  const url = `https://fr.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=revisions&rvprop=content&format=json&origin=*`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const json = await res.json();
  const page = Object.values(json.query.pages as Record<string, { missing?: boolean; revisions?: { "*": string }[] }>)[0];
  if (!page || page.missing || !page.revisions) return null;

  const wikitext = page.revisions[0]?.["*"] ?? "";
  const defs = parseWiktionaryDefinitions(wikitext);
  return defs.length > 0 ? defs : null;
}

async function fromWikipedia(word: string): Promise<string | null> {
  const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const json = await res.json();
  const extract: string = json.extract ?? "";
  if (!extract || json.type === "disambiguation") return null;

  return extract.length > 280
    ? extract.slice(0, 280).replace(/[^.!?]*$/, "").trim()
    : extract;
}

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word");
  if (!word || word.length < 2) {
    return NextResponse.json(null, { status: 400 });
  }

  // Wiktionary first — covers all words
  const defs = await fromWiktionary(word);
  if (defs) {
    return NextResponse.json({ source: "wiktionary", definitions: defs });
  }

  // Wikipedia fallback — for proper nouns and scientific terms
  const extract = await fromWikipedia(word);
  if (extract) {
    return NextResponse.json({ source: "wikipedia", extract });
  }

  return NextResponse.json(null);
}
