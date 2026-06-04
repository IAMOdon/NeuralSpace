export type WikiSummary = {
  title: string;
  extract: string;
  wikiUrl?: string;
};

const cache = new Map<string, WikiSummary | null>();

function normalize(word: string): string {
  return word.trim().replace(/[.,;:!?'"«»()]/g, "");
}

export async function lookupWord(
  raw: string,
  signal?: AbortSignal
): Promise<WikiSummary | null> {
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

    const data: WikiSummary | null = await res.json();
    cache.set(word, data);
    return data;
  } catch {
    return null;
  }
}
