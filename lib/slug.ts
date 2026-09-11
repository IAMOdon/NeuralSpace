export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Locales whose slugs stay pure ASCII.
 *
 * For these, accents are folded (é → e) exactly as `slugify` does, which keeps
 * URLs short and typeable. Everything else keeps its own script: stripping
 * non-ASCII from Chinese, Arabic, Hindi, Russian or Japanese would leave an
 * empty string, not a slug.
 */
const ASCII_SLUG_LOCALES = new Set(["fr", "en", "es", "pt", "de", "it", "nl"]);

/**
 * Slug for a translated title or heading.
 *
 * Deliberately separate from `slugify`: that function backs every already
 * published French URL, so its output must never change. This one is only ever
 * called for locales that did not exist before.
 *
 * Non-ASCII slugs are percent-encoded by browsers in the address bar but
 * display as the original script, which is what every major site serving these
 * languages does.
 *
 * Returns "" when the input has no usable characters at all (an emoji-only
 * heading, say). Pass `fallbackId` to get a stable `article-xxxxxxxx` instead.
 */
export function slugifyLocalized(text: string, locale: string, fallbackId?: string): string {
  const ascii = ASCII_SLUG_LOCALES.has(locale);

  // NFD then stripping combining marks folds Latin accents. It would also
  // decompose Hangul syllables into jamo and split Devanagari, so non-ASCII
  // locales are composed with NFC and left intact.
  const base = ascii
    ? text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    : text.toLowerCase().normalize("NFC");

  // \p{M} is not optional: Devanagari vowel signs and the virama are combining
  // marks, not letters, so allowing only \p{L}\p{N} turns "ब्लैक" into "बलक" —
  // still non-empty, so it fails silently. Same for Arabic harakat and Korean
  // jamo.
  const slug = (ascii
    ? base.replace(/[^a-z0-9\s-]/g, "")
    : base.replace(/[^\p{L}\p{N}\p{M}\s-]/gu, ""))
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");

  if (slug) return slug;
  return fallbackId ? `article-${fallbackId.replace(/-/g, "").slice(0, 8)}` : "";
}
