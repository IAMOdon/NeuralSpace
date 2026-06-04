export type Definition = {
  partOfSpeech: string;
  definition: string;
};

// Module-level cache — persists across re-renders, cleared on page refresh.
const cache = new Map<string, Definition[] | null>();

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
    const res = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`, {
      signal,
    });

    if (!res.ok) {
      cache.set(word, null);
      return null;
    }

    const data: Definition[] | null = await res.json();
    cache.set(word, data);
    return data;
  } catch {
    return null;
  }
}
