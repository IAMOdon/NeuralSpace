import type { ContentBlock, RichText } from "@/types/content";

/**
 * Translatable-string extraction for the AI translation pipeline.
 *
 * The translator never sees the document structure. We walk the ContentBlock
 * tree, pull out only the leaf strings a human would read, and hand the
 * translator a flat `path -> string` map. The translated map is then written
 * back into a structural clone of the original.
 *
 * That means block ids, citation indices, LaTeX, code, URLs, licences and the
 * discriminated-union tags cannot be corrupted by the model: it never emits
 * them. A key-set mismatch on the way back is a hard error, so a truncated or
 * embellished response fails loudly instead of silently producing a broken
 * article.
 *
 * Symmetry between the two directions is structural, not by convention: both
 * use the same `collectFields` traversal, so a field can never be extracted but
 * not reinjected (or vice versa).
 */

/** A single translatable leaf, bound to the tree it was collected from. */
type FieldRef = {
  key: string;
  value: string;
  set: (next: string) => void;
};

/** Fields carried on the article row rather than inside the content blocks. */
export type ArticleMetaStrings = {
  title: string;
  summary: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  coverImageAlt?: string | null;
};

// ── Traversal ────────────────────────────────────────────────────────────────

function collectRichTextFields(content: RichText, prefix: string): FieldRef[] {
  const refs: FieldRef[] = [];

  content.forEach((run, i) => {
    // A run carrying inlineLatex renders the LaTeX and ignores `text`
    // (components/article/TextRunRenderer.tsx:8-16), so translating it would
    // spend tokens on a string nobody reads. The LaTeX itself is never touched.
    if (run.inlineLatex === undefined) {
      refs.push({
        key: `${prefix}.${i}.text`,
        value: run.text,
        set: (next) => { run.text = next; },
      });
    }

    // href is navigation, label is prose — only the label is translated.
    if (run.link?.label !== undefined) {
      refs.push({
        key: `${prefix}.${i}.link.label`,
        value: run.link.label,
        set: (next) => { run.link!.label = next; },
      });
    }
  });

  return refs;
}

/**
 * Every translatable leaf in the document, in a stable order.
 *
 * Keys are positional (`b3.content.1.text`). Positions are stable because the
 * reinjection target is a clone of the very tree the keys were derived from.
 */
function collectFields(blocks: ContentBlock[]): FieldRef[] {
  const refs: FieldRef[] = [];

  blocks.forEach((block, i) => {
    const p = `b${i}`;

    switch (block.type) {
      case "heading":
      case "subheading":
        // `anchor` on a subheading is deliberately absent: it is a URL fragment,
        // regenerated per locale from the translated heading by the caller.
        refs.push({
          key: `${p}.content`,
          value: block.content,
          set: (next) => { block.content = next; },
        });
        break;

      case "paragraph":
        refs.push(...collectRichTextFields(block.content, `${p}.content`));
        break;

      case "quote":
        refs.push({
          key: `${p}.content`,
          value: block.content,
          set: (next) => { block.content = next; },
        });
        if (block.attribution !== undefined) {
          refs.push({
            key: `${p}.attribution`,
            value: block.attribution,
            set: (next) => { block.attribution = next; },
          });
        }
        break;

      case "bullet-list":
        block.items.forEach((item, j) => {
          refs.push(...collectRichTextFields(item, `${p}.items.${j}`));
        });
        break;

      case "key-takeaways":
        block.items.forEach((item, j) => {
          refs.push({
            key: `${p}.items.${j}`,
            value: item,
            set: (next) => { block.items[j] = next; },
          });
        });
        break;

      case "callout":
        if (block.title !== undefined) {
          refs.push({
            key: `${p}.title`,
            value: block.title,
            set: (next) => { block.title = next; },
          });
        }
        refs.push(...collectRichTextFields(block.content, `${p}.content`));
        break;

      case "image":
        // alt and caption are prose. url, and every field of `credit`, are not:
        // a licence like "CC BY 4.0" must stay exactly that in every language.
        refs.push({
          key: `${p}.alt`,
          value: block.alt,
          set: (next) => { block.alt = next; },
        });
        if (block.caption !== undefined) {
          refs.push({
            key: `${p}.caption`,
            value: block.caption,
            set: (next) => { block.caption = next; },
          });
        }
        break;

      case "video":
        if (block.caption !== undefined) {
          refs.push({
            key: `${p}.caption`,
            value: block.caption,
            set: (next) => { block.caption = next; },
          });
        }
        break;

      case "code":
        // `content` and `language` are code and an identifier respectively —
        // translating either breaks rendering (lib/content/shiki.ts:21).
        // The filename label is the only human-readable part.
        if (block.filename !== undefined) {
          refs.push({
            key: `${p}.filename`,
            value: block.filename,
            set: (next) => { block.filename = next; },
          });
        }
        break;

      case "equation":
      case "divider":
        // Nothing translatable. LaTeX is mathematics, not prose.
        break;
    }
  });

  return refs;
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Blank strings carry no meaning and would waste tokens. */
function isTranslatable(value: string): boolean {
  return value.trim() !== "";
}

/**
 * The flat `path -> string` map to hand the translator.
 *
 * Empty and whitespace-only values are omitted; `reinjectStrings` expects the
 * returned map's key set exactly.
 */
export function extractStrings(blocks: ContentBlock[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const ref of collectFields(blocks)) {
    if (isTranslatable(ref.value)) out[ref.key] = ref.value;
  }
  return out;
}

export class ReinjectError extends Error {}

/**
 * Writes a translated map back into a clone of `blocks`.
 *
 * The input is never mutated. Throws when the map does not carry exactly the
 * keys `extractStrings` would have produced for the same tree, or when a value
 * is not a string — which is how a truncated, padded or hallucinated response
 * is caught before it can reach the database.
 */
export function reinjectStrings(
  blocks: ContentBlock[],
  translated: Record<string, string>
): ContentBlock[] {
  const clone = structuredClone(blocks);
  const refs = collectFields(clone).filter((r) => isTranslatable(r.value));

  const expected = new Set(refs.map((r) => r.key));
  const received = new Set(Object.keys(translated));

  const missing = [...expected].filter((k) => !received.has(k));
  const unexpected = [...received].filter((k) => !expected.has(k));

  if (missing.length > 0 || unexpected.length > 0) {
    throw new ReinjectError(
      `translated map does not match the source document — ` +
        `${missing.length} missing, ${unexpected.length} unexpected` +
        (missing.length ? ` (missing e.g. ${missing.slice(0, 3).join(", ")})` : "") +
        (unexpected.length ? ` (unexpected e.g. ${unexpected.slice(0, 3).join(", ")})` : "")
    );
  }

  for (const ref of refs) {
    const next = translated[ref.key];
    if (typeof next !== "string") {
      throw new ReinjectError(`value for "${ref.key}" is ${typeof next}, expected string`);
    }
    ref.set(next);
  }

  return clone;
}

// ── Article-level fields ─────────────────────────────────────────────────────

const META_KEYS = ["title", "summary", "seoTitle", "seoDescription", "coverImageAlt"] as const;

/** Article row strings, namespaced so they can share a request with content. */
export function extractMetaStrings(meta: ArticleMetaStrings): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of META_KEYS) {
    const value = meta[key];
    if (typeof value === "string" && isTranslatable(value)) out[`meta.${key}`] = value;
  }
  return out;
}

/**
 * Applies a translated meta map. Absent keys keep their original value, so a
 * null `seoTitle` stays null rather than becoming an empty string.
 */
export function reinjectMetaStrings(
  meta: ArticleMetaStrings,
  translated: Record<string, string>
): ArticleMetaStrings {
  const out: ArticleMetaStrings = { ...meta };
  for (const key of META_KEYS) {
    const next = translated[`meta.${key}`];
    if (typeof next === "string") out[key] = next;
  }
  return out;
}
