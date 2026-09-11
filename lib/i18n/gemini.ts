import "server-only";
// Explicit extension so this module also loads under plain `node`, which is how
// scripts/verify-i18n-translate.ts exercises it without booting Next.
import { getLocale } from "./locales.ts";

/**
 * Gemini client for the translation pipeline.
 *
 * Two properties matter more than anything else here:
 *
 * 1. The model receives `[{id, text}]` and is schema-constrained to return
 *    `[{id, text}]`. Dynamic-key objects cannot be pinned by a responseSchema;
 *    an array of fixed-shape records can. The id set is then checked exactly,
 *    so a dropped or invented entry is an error rather than a silently
 *    truncated article.
 *
 * 2. Nothing structural is ever sent. Callers pass the flat map produced by
 *    lib/i18n/extract.ts, which contains only human-readable leaves.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3.6-flash";

/** Chunk bounds. Small chunks keep a retry cheap and keep output well clear of
 *  any truncation limit; a long article simply becomes several requests. */
const MAX_ITEMS_PER_CHUNK = 40;
const MAX_CHARS_PER_CHUNK = 6000;

/** How long a key sits out after a rate-limit or server error. */
const KEY_COOLDOWN_MS = 60_000;

export class TranslationError extends Error {}

// ── Key pool ─────────────────────────────────────────────────────────────────

type PooledKey = { key: string; cooldownUntil: number };

let pool: PooledKey[] | null = null;
let cursor = 0;

function getPool(): PooledKey[] {
  if (pool) return pool;
  const raw = process.env.GEMINI_API_KEYS ?? "";
  const keys = raw.split(",").map((k) => k.trim()).filter(Boolean);
  if (keys.length === 0) {
    throw new TranslationError("GEMINI_API_KEYS is empty — no key to translate with");
  }
  pool = keys.map((key) => ({ key, cooldownUntil: 0 }));
  return pool;
}

/**
 * Next usable key, round-robin. Returns null when every key is cooling down,
 * which the caller surfaces as a retryable failure so the row stays pending and
 * the next cron tick picks it up.
 */
function takeKey(): PooledKey | null {
  const keys = getPool();
  const now = Date.now();
  for (let i = 0; i < keys.length; i++) {
    const candidate = keys[(cursor + i) % keys.length]!;
    if (candidate.cooldownUntil <= now) {
      cursor = (cursor + i + 1) % keys.length;
      return candidate;
    }
  }
  return null;
}

// ── Request ──────────────────────────────────────────────────────────────────

type Item = { id: string; text: string };

function systemInstruction(targetEnglishName: string, sourceEnglishName: string): string {
  return [
    `You are translating a science magazine for a general but educated audience, from ${sourceEnglishName} into ${targetEnglishName}.`,
    "",
    "You receive a JSON array of objects, each with an `id` and a `text`.",
    "Return one object per input object, with the id unchanged, translating only `text`.",
    "Return exactly as many objects as you received, in the same order. Never merge, split, drop or invent an entry.",
    "",
    "Rules:",
    "- Preserve scientific hedging precisely. A claim that 'suggests' must not become one that 'proves' or 'shows'.",
    "- Keep every number, unit, symbol and mathematical expression exactly as given.",
    "- Do not translate proper nouns, institution names, author names, journal names or product names.",
    "- Translate a fragment as a fragment. Many entries are parts of a sentence split across formatting runs, so do not add capitalisation, punctuation or words to make one read as a complete sentence.",
    "- Preserve leading and trailing spaces exactly — they join adjacent fragments.",
    "- Do not add explanations, footnotes or commentary.",
    "- Match the register of quality science journalism in the target language.",
  ].join("\n");
}

const RESPONSE_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: { id: { type: "STRING" }, text: { type: "STRING" } },
    required: ["id", "text"],
    propertyOrdering: ["id", "text"],
  },
} as const;

/** Splits a map into request-sized batches, by count and by character budget. */
function chunk(items: Item[]): Item[][] {
  const out: Item[][] = [];
  let current: Item[] = [];
  let chars = 0;

  for (const item of items) {
    const size = item.text.length + item.id.length;
    if (current.length > 0 && (current.length >= MAX_ITEMS_PER_CHUNK || chars + size > MAX_CHARS_PER_CHUNK)) {
      out.push(current);
      current = [];
      chars = 0;
    }
    current.push(item);
    chars += size;
  }
  if (current.length > 0) out.push(current);
  return out;
}

type CallResult =
  | { ok: true; items: Item[] }
  | { ok: false; retryable: boolean; reason: string };

async function callOnce(items: Item[], targetLocale: string, key: string, model: string): Promise<CallResult> {
  const target = getLocale(targetLocale);
  const source = getLocale("fr");
  if (!target) return { ok: false, retryable: false, reason: `unknown locale "${targetLocale}"` };

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction(target.englishName, source?.englishName ?? "French") }],
        },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(items) }] }],
        generationConfig: {
          temperature: 0.3,
          // Translation is not a reasoning task: measured on real article text,
          // low thinking gives identical output for a third of the tokens and a
          // third of the latency.
          thinkingConfig: { thinkingLevel: "low" },
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
      }),
    });
  } catch (e) {
    return { ok: false, retryable: true, reason: `network: ${(e as Error).message}` };
  }

  if (!res.ok) {
    const body = await res.text();
    // 429 and 5xx are the key's problem, not the request's.
    const retryable = res.status === 429 || res.status >= 500;
    return { ok: false, retryable, reason: `HTTP ${res.status}: ${body.slice(0, 200)}` };
  }

  let parsed: unknown;
  try {
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      // Usually a safety block or a truncated candidate — worth another key.
      return { ok: false, retryable: true, reason: `no text in response: ${JSON.stringify(json).slice(0, 200)}` };
    }
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, retryable: true, reason: `unparseable response: ${(e as Error).message}` };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, retryable: true, reason: "response was not an array" };
  }

  const out: Item[] = [];
  for (const entry of parsed) {
    if (typeof entry?.id !== "string" || typeof entry?.text !== "string") {
      return { ok: false, retryable: true, reason: "entry missing id or text" };
    }
    out.push({ id: entry.id, text: entry.text });
  }

  // The id set must match exactly — this is what stops a partial response from
  // becoming a half-translated article.
  const expected = new Set(items.map((i) => i.id));
  const received = new Set(out.map((i) => i.id));
  if (expected.size !== received.size || [...expected].some((id) => !received.has(id))) {
    return { ok: false, retryable: true, reason: `id set mismatch (sent ${expected.size}, got ${received.size})` };
  }

  return { ok: true, items: out };
}

async function translateChunk(items: Item[], targetLocale: string, model: string): Promise<Item[]> {
  const attempts = Math.max(2, Math.min(4, getPool().length));
  let last = "no attempt made";

  for (let i = 0; i < attempts; i++) {
    const pooled = takeKey();
    if (!pooled) throw new TranslationError("every API key is cooling down");

    const result = await callOnce(items, targetLocale, pooled.key, model);
    if (result.ok) return result.items;

    last = result.reason;
    if (!result.retryable) throw new TranslationError(last);
    if (result.reason.startsWith("HTTP 429") || result.reason.startsWith("HTTP 5")) {
      pooled.cooldownUntil = Date.now() + KEY_COOLDOWN_MS;
    }
  }

  throw new TranslationError(`chunk failed after ${attempts} attempts — ${last}`);
}

// ── Public API ───────────────────────────────────────────────────────────────

export function translationModel(): string {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL;
}

/**
 * Translates a flat `key -> string` map, returning a map with the same keys.
 *
 * Chunks are sent sequentially so one article cannot monopolise the key pool
 * while other locales wait. Any chunk failing exhausts its retries and throws,
 * leaving the caller to mark the row failed and keep the rest of the queue
 * moving.
 */
export async function translateStrings(
  strings: Record<string, string>,
  targetLocale: string,
  model: string = translationModel()
): Promise<Record<string, string>> {
  const items: Item[] = Object.entries(strings).map(([id, text]) => ({ id, text }));
  if (items.length === 0) return {};

  const out: Record<string, string> = {};
  for (const batch of chunk(items)) {
    for (const item of await translateChunk(batch, targetLocale, model)) {
      out[item.id] = item.text;
    }
  }

  // Belt and braces: the per-chunk check already guarantees this, but the
  // caller is about to write an article with it.
  const missing = Object.keys(strings).filter((k) => !(k in out));
  if (missing.length > 0) {
    throw new TranslationError(`translation dropped ${missing.length} keys (e.g. ${missing.slice(0, 3).join(", ")})`);
  }

  return out;
}

/** Test seam — lets a script reset pool state between runs. */
export function __resetKeyPool(): void {
  pool = null;
  cursor = 0;
}
