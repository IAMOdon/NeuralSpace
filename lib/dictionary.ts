export type DictionaryResult =
  | { source: "wiktionary"; definitions: string[] }
  | { source: "wikipedia"; extract: string };

const cache = new Map<string, DictionaryResult | null>();

function normalize(word: string): string {
  return word.trim().replace(/[.,;:!?'"«»()]/g, "");
}

export async function lookupWord(
  raw: string,
  signal?: AbortSignal
): Promise<DictionaryResult | null> {
  const word = normalize(raw);
  if (!word || word.length < 2) return null;

  if (cache.has(word)) return cache.get(word)!;

  try {
    const res = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`, {
      signal,
    });

    if (!res.ok) {
      cache.set(word, null);
      return null;
    }

    const data: DictionaryResult | null = await res.json();
    cache.set(word, data);
    return data;
  } catch {
    return null;
  }
}
