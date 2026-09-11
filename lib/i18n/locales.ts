/**
 * The languages NeuralSpace publishes in.
 *
 * French is the source: articles are written in it, and every translation is
 * derived from it. It is never a translation target.
 *
 * `enabled` gates what the publish hook actually queues. The pipeline is
 * locale-agnostic, so turning on a second wave is a one-line change here — but
 * the non-Latin locales also need the RTL and localized-slug work in place,
 * which is why they ship second.
 */

export const SOURCE_LOCALE = "fr" as const;

export type LocaleConfig = {
  /** BCP-47 code, used in URLs and hreflang. */
  code: string;
  /** Name in the language itself, for the locale switcher. */
  label: string;
  /** Name in English, used in the translation prompt. */
  englishName: string;
  dir: "ltr" | "rtl";
  enabled: boolean;
};

export const LOCALES: LocaleConfig[] = [
  { code: "fr", label: "Français",  englishName: "French",             dir: "ltr", enabled: true },

  // Wave 1 — Latin script, no new rendering work required.
  { code: "en", label: "English",   englishName: "English",            dir: "ltr", enabled: true },
  { code: "es", label: "Español",   englishName: "Spanish",            dir: "ltr", enabled: true },
  { code: "pt", label: "Português", englishName: "Portuguese",         dir: "ltr", enabled: true },
  { code: "de", label: "Deutsch",   englishName: "German",             dir: "ltr", enabled: true },
  { code: "it", label: "Italiano",  englishName: "Italian",            dir: "ltr", enabled: true },

  // Wave 2 — needs localized slugs (shipped) plus RTL layout for Arabic.
  { code: "zh", label: "中文",       englishName: "Simplified Chinese", dir: "ltr", enabled: false },
  { code: "hi", label: "हिन्दी",       englishName: "Hindi",              dir: "ltr", enabled: false },
  { code: "ar", label: "العربية",    englishName: "Arabic",             dir: "rtl", enabled: false },
  { code: "ru", label: "Русский",   englishName: "Russian",            dir: "ltr", enabled: false },
  { code: "ja", label: "日本語",      englishName: "Japanese",           dir: "ltr", enabled: false },
];

const BY_CODE = new Map(LOCALES.map((l) => [l.code, l]));

export function getLocale(code: string): LocaleConfig | undefined {
  return BY_CODE.get(code);
}

export function isSupportedLocale(code: string): boolean {
  return BY_CODE.has(code);
}

/** Locales an article is translated into — everything enabled except the source. */
export function targetLocales(): LocaleConfig[] {
  return LOCALES.filter((l) => l.enabled && l.code !== SOURCE_LOCALE);
}

/** Every enabled locale, source first — the set the site actually serves. */
export function activeLocales(): LocaleConfig[] {
  return LOCALES.filter((l) => l.enabled);
}

export function localeDir(code: string): "ltr" | "rtl" {
  return BY_CODE.get(code)?.dir ?? "ltr";
}
