/**
 * Checks slugifyLocalized across every target locale.
 *
 *   node scripts/verify-slug-locales.ts
 *
 * The critical property: no locale may produce an empty slug for a real
 * heading. The existing `slugify` returns "" for Chinese, Arabic, Hindi,
 * Russian and Japanese, which is why the localized variant exists.
 */
import { slugify, slugifyLocalized } from "../lib/slug.ts";

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail = ""): void {
  if (cond) {
    pass++;
    console.log(`ok    ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`);
  }
}

// Same heading, as it would arrive from the translator in each locale.
const headings: Record<string, string> = {
  fr: "Le disque d'accrétion des trous noirs",
  en: "The Accretion Disc of Black Holes",
  es: "El disco de acreción de los agujeros negros",
  pt: "O disco de acreção dos buracos negros",
  de: "Die Akkretionsscheibe Schwarzer Löcher",
  it: "Il disco di accrescimento dei buchi neri",
  zh: "黑洞的吸积盘",
  hi: "ब्लैक होल की अभिवृद्धि डिस्क",
  ar: "قرص التراكم للثقوب السوداء",
  ru: "Аккреционный диск чёрных дыр",
  ja: "ブラックホールの降着円盤",
};

console.log("── every locale produces a usable slug ──");
for (const [locale, text] of Object.entries(headings)) {
  const s = slugifyLocalized(text, locale);
  check(`${locale}: "${s}"`, s.length > 0);
}

console.log("\n── the old slugify is why this was needed ──");
for (const locale of ["zh", "hi", "ar", "ru", "ja"]) {
  check(`slugify() would have returned "" for ${locale}`, slugify(headings[locale]!) === "");
}

console.log("\n── existing French URLs must not move ──");
for (const text of [
  "Le disque d'accrétion des trous noirs",
  "Vapotage : dommages à l'ADN et risque de cancer",
  "Ötzi, levures psychrophiles & pain au levain",
  "Cellule ABM — régénération des follicules pileux",
]) {
  check(`slugifyLocalized(fr) === slugify() for "${text.slice(0, 32)}…"`, slugifyLocalized(text, "fr") === slugify(text));
}

console.log("\n── shape ──");
check("accents folded for ASCII locales", slugifyLocalized("L'été à Genève", "fr") === "lete-a-geneve");
check("German umlauts folded", slugifyLocalized("Schwarzer Löcher", "de") === "schwarzer-locher");
check("CJK keeps its script", /[一-鿿]/.test(slugifyLocalized(headings.zh!, "zh")));
check("Cyrillic keeps its script", /[Ѐ-ӿ]/.test(slugifyLocalized(headings.ru!, "ru")));
check("Arabic keeps its script", /[؀-ۿ]/.test(slugifyLocalized(headings.ar!, "ar")));
check("Devanagari keeps its script", /[ऀ-ॿ]/.test(slugifyLocalized(headings.hi!, "hi")));
// Combining marks carry meaning outside Latin: dropping them silently mangles
// the word instead of failing, which is the worst kind of bug here.
check("Devanagari vowel signs survive", slugifyLocalized("ब्लैक होल", "hi") === "ब्लैक-होल");
check("Devanagari virama survives", slugifyLocalized("ब्लैक", "hi").includes("्"));
check("Arabic harakat survive", slugifyLocalized("قُرْص", "ar") === "قُرْص");
check("Korean syllables survive intact", slugifyLocalized("블랙홀", "ko") === "블랙홀");
check("no leading or trailing hyphen", !/^-|-$/.test(slugifyLocalized("— Le titre —", "fr")));
check("punctuation dropped in ru", !slugifyLocalized("Диск: чёрных дыр!", "ru").includes(":"));
check("spaces become hyphens in ru", slugifyLocalized("чёрных дыр", "ru") === "чёрных-дыр");
check("length capped at 80", slugifyLocalized("a".repeat(200), "en").length <= 80);

console.log("\n── degenerate input ──");
check("emoji-only returns empty", slugifyLocalized("🚀🔭✨", "en") === "");
check("emoji-only with fallback id", slugifyLocalized("🚀", "en", "9e2a25b6-b554-4298") === "article-9e2a25b6");
check("empty string returns empty", slugifyLocalized("", "zh") === "");
check("punctuation-only returns empty", slugifyLocalized("!!! ??? ...", "fr") === "");
check("fallback is stable for the same id", slugifyLocalized("🚀", "zh", "abc-def") === slugifyLocalized("✨", "ja", "abc-def"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
