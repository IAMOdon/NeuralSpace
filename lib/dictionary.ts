export type Definition = {
  partOfSpeech: string;
  definition: string;
};

// Module-level cache — persists across re-renders, cleared on page refresh.
const cache = new Map<string, Definition[] | null>();

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function normalize(word: string): string {
  return word.toLowerCase().trim().replace(/[.,;:!?'"«»()]/g, "");
}

export async function lookupWord(
  raw: string,
  signal?: AbortSignal
): Promise<Definition[] | null> {
  const word = normalize(raw);
  if (!word || word.length < 2) return null;

  if (cache.has(word)) return cache.get(word)!;

  try {
    const res = await fetch(
      `https://fr.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`,
      { signal }
    );

    if (!res.ok) {
      cache.set(word, null);
      return null;
    }

    const json = await res.json();
    // Wiktionary returns definitions keyed by language code
    const firstKey = Object.keys(json)[0] ?? "";
    const entries: { partOfSpeech: string; definitions: { definition: string }[] }[] =
      json["fr"] ?? json[firstKey] ?? [];

    const definitions: Definition[] = entries
      .flatMap((entry) =>
        entry.definitions.slice(0, 2).map((d) => ({
          partOfSpeech: entry.partOfSpeech,
          definition: stripHtml(d.definition),
        }))
      )
      .filter((d) => d.definition.length > 0)
      .slice(0, 3);

    const result = definitions.length > 0 ? definitions : null;
    cache.set(word, result);
    return result;
  } catch {
    return null;
  }
}
