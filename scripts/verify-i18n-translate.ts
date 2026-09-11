/**
 * End-to-end check of the translation pipeline against a real published
 * article. THIS SPENDS GEMINI TOKENS — it is not part of the free suite.
 *
 *   node --conditions=react-server scripts/verify-i18n-translate.ts
 *   node --conditions=react-server scripts/verify-i18n-translate.ts --locale es
 *   node --conditions=react-server scripts/verify-i18n-translate.ts --slug my-article --locale de
 *
 * Defaults to the article with the most translatable strings, so chunking is
 * exercised rather than skipped.
 *
 * `--conditions=react-server` is required because lib/i18n/gemini.ts imports
 * `server-only`, which throws under any other export condition. That guard is
 * deliberate: the module reads API keys and must never reach a client bundle.
 */
import { readFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;

for (const line of readFileSync(`${ROOT}.env.local`, "utf8").split("\n")) {
  if (!line.includes("=") || line.trim().startsWith("#")) continue;
  const i = line.indexOf("=");
  process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^"|"$/g, "");
}

const { extractStrings, reinjectStrings } = await import("../lib/i18n/extract.ts");
const { ContentSchema } = await import("../lib/content/validators.ts");
const { translateStrings, translationModel } = await import("../lib/i18n/gemini.ts");
const { getLocale } = await import("../lib/i18n/locales.ts");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

const locale = arg("locale") ?? "en";
const wantSlug = arg("slug");

if (!getLocale(locale)) {
  console.error(`unknown locale "${locale}"`);
  process.exit(1);
}

const SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const res = await fetch(
  `${SUPA}/rest/v1/articles?select=slug,title,content_simplified&status=eq.published`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
);
const rows: any[] = await res.json();

const candidates = rows
  .filter((r) => Array.isArray(r.content_simplified) && r.content_simplified.length > 0)
  .filter((r) => (wantSlug ? r.slug === wantSlug : true))
  .map((r) => {
    const parsed = ContentSchema.safeParse(r.content_simplified);
    return parsed.success ? { slug: r.slug, blocks: parsed.data } : null;
  })
  .filter(Boolean) as { slug: string; blocks: any }[];

if (candidates.length === 0) {
  console.error(wantSlug ? `no published article with slug "${wantSlug}"` : "no usable articles");
  process.exit(1);
}

// Biggest first, so a default run exercises multi-chunk behaviour.
candidates.sort((a, b) => Object.keys(extractStrings(b.blocks)).length - Object.keys(extractStrings(a.blocks)).length);
const { slug, blocks } = candidates[0]!;

const map = extractStrings(blocks);
const count = Object.keys(map).length;

console.log(`article : ${slug}`);
console.log(`locale  : ${locale} (${getLocale(locale)!.englishName})`);
console.log(`model   : ${translationModel()}`);
console.log(`blocks  : ${blocks.length}`);
console.log(`strings : ${count}${count > 40 ? "  → multiple chunks" : ""}`);

const t0 = Date.now();
const translated = await translateStrings(map, locale);
const secs = ((Date.now() - t0) / 1000).toFixed(1);

const out = reinjectStrings(blocks, translated);
const shape = (t: unknown) => JSON.stringify(JSON.parse(JSON.stringify(t), (_k, v) => (typeof v === "string" ? "" : v)));

let fail = 0;
function check(name: string, cond: boolean) {
  if (cond) console.log(`ok    ${name}`);
  else { fail++; console.log(`FAIL  ${name}`); }
}

console.log(`\ntranslated in ${secs}s\n`);
check("every key returned", Object.keys(translated).length === count);
check("reinjected tree is valid content", ContentSchema.safeParse(out).success);
check("structure identical to source", shape(out) === shape(blocks));
check("block ids unchanged", JSON.stringify(out.map((b: any) => b.id)) === JSON.stringify(blocks.map((b: any) => b.id)));
check("no empty translation", Object.values(translated).every((v) => v.trim().length > 0));
check("something actually changed", Object.keys(map).some((k) => translated[k] !== map[k]));

console.log("\n── sample ──");
for (const k of Object.keys(map).slice(0, 4)) {
  console.log(`  fr → ${map[k]!.slice(0, 90)}`);
  console.log(`  ${locale} → ${translated[k]!.slice(0, 90)}\n`);
}

process.exit(fail === 0 ? 0 : 1);
