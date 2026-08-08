/**
 * Verifies the translation extract/reinject layer without spending a single
 * Gemini call.
 *
 *   node scripts/verify-i18n-extract.ts          # synthetic suite only
 *   node scripts/verify-i18n-extract.ts --db     # also round-trips real articles
 *
 * Node strips the types natively (v22.6+). The --db mode reads .env.local for
 * the service-role key and checks every published article.
 *
 * The synthetic suite covers the block types production content does not yet
 * contain — equation, code, video — because those carry precisely the fields a
 * translator must never touch.
 */
import { readFileSync } from "node:fs";
import {
  extractStrings,
  reinjectStrings,
  extractMetaStrings,
  reinjectMetaStrings,
  ReinjectError,
} from "../lib/i18n/extract.ts";
import { ContentSchema } from "../lib/content/validators.ts";

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

// ── Synthetic document: every block type, plus the inline edge cases ─────────

const doc: any = [
  { id: "h", type: "heading", content: "Les trous noirs" },
  { id: "s", type: "subheading", level: 2, content: "Le disque d'accrétion", anchor: "le-disque-daccretion" },
  {
    id: "p",
    type: "paragraph",
    content: [
      { text: "La masse vaut ", marks: ["bold"] },
      { text: "", inlineLatex: "M_\\odot \\times 10^6" },
      { text: " selon l'étude", citation: 2 },
      { text: "voir la source", link: { href: "https://example.org/paper?a=1&b=2", label: "l'étude de 2024" } },
      { text: "sans label", link: { href: "https://example.org/x" } },
    ],
  },
  { id: "e", type: "equation", latex: "E = mc^2 \\quad \\text{où } c \\approx 3\\times10^8" },
  { id: "c", type: "code", language: "python", content: "def f(x):\n    return x ** 2  # carré", filename: "modèle.py" },
  {
    id: "i",
    type: "image",
    url: "https://cdn.example.org/a.jpg",
    alt: "Vue d'artiste",
    caption: "Simulation du disque",
    credit: { author: "NASA/JPL", source: "Wikimedia Commons", url: "https://commons.example/x", license: "CC BY 4.0" },
  },
  { id: "v", type: "video", provider: "youtube", videoId: "dQw4w9WgXcQ", caption: "Animation du phénomène" },
  { id: "k", type: "key-takeaways", items: ["Premier point", "Second point", "   "] },
  { id: "q", type: "quote", content: "C'est fascinant.", attribution: "Dr. Dupont" },
  { id: "b", type: "bullet-list", items: [[{ text: "Un" }], [{ text: "Deux", link: { href: "https://e.org", label: "deux" } }]] },
  { id: "ca", type: "callout", variant: "key-concept", title: "À retenir", content: [{ text: "Important." }] },
  { id: "d", type: "divider" },
];

check("synthetic doc is valid content", ContentSchema.safeParse(doc).success);

const map = extractStrings(doc);
const keys = Object.keys(map);
const values = Object.values(map);

// Nothing structural, technical or legal may be offered for translation.
check("latex never extracted", !values.some((v) => v.includes("mc^2")));
check("inlineLatex never extracted", !values.some((v) => v.includes("M_\\odot")));
check("text of an inlineLatex run is skipped", !keys.includes("b2.content.1.text"));
check("code content never extracted", !values.some((v) => v.includes("return x ** 2")));
check("code language never extracted", !values.includes("python"));
check("image url never extracted", !values.some((v) => v.startsWith("https://cdn")));
check("videoId never extracted", !values.includes("dQw4w9WgXcQ"));
check("licence never extracted", !values.includes("CC BY 4.0"));
check("credit author never extracted", !values.includes("NASA/JPL"));
check("credit source never extracted", !values.includes("Wikimedia Commons"));
check("link href never extracted", !values.some((v) => v.includes("example.org/paper")));
check("subheading anchor never extracted", !values.includes("le-disque-daccretion"));
check("whitespace-only takeaway skipped", !keys.includes("b7.items.2"));
check("run without a link label yields no label key", !keys.includes("b2.content.4.link.label"));

for (const [what, v] of [
  ["heading", "Les trous noirs"],
  ["subheading", "Le disque d'accrétion"],
  ["link label", "l'étude de 2024"],
  ["code filename", "modèle.py"],
  ["image alt", "Vue d'artiste"],
  ["image caption", "Simulation du disque"],
  ["video caption", "Animation du phénomène"],
  ["quote", "C'est fascinant."],
  ["attribution", "Dr. Dupont"],
  ["callout title", "À retenir"],
  ["takeaway", "Premier point"],
  ["bullet run", "Un"],
] as const) {
  check(`${what} is extracted`, values.includes(v));
}

const translated = Object.fromEntries(keys.map((k) => [k, `[${map[k]}]`]));
const out: any = reinjectStrings(doc, translated);

check("output is valid content", ContentSchema.safeParse(out).success);
check("latex byte-identical", out[3].latex === doc[3].latex);
check("code content byte-identical", out[4].content === doc[4].content);
check("code language byte-identical", out[4].language === doc[4].language);
check("image url byte-identical", out[5].url === doc[5].url);
check("credit object byte-identical", JSON.stringify(out[5].credit) === JSON.stringify(doc[5].credit));
check("videoId byte-identical", out[6].videoId === doc[6].videoId);
check("provider byte-identical", out[6].provider === doc[6].provider);
check("citation index preserved", out[2].content[2].citation === 2);
check("link href preserved", out[2].content[3].link.href === doc[2].content[3].link.href);
check("link label translated", out[2].content[3].link.label === "[l'étude de 2024]");
check("marks preserved", JSON.stringify(out[2].content[0].marks) === JSON.stringify(["bold"]));
check("block ids preserved", out.map((b: any) => b.id).join() === doc.map((b: any) => b.id).join());
check("block order and count preserved", out.length === doc.length);
check("subheading anchor untouched", out[1].anchor === "le-disque-daccretion");
check("blank takeaway untouched", out[7].items[2] === "   ");
check("inlineLatex untouched", out[2].content[1].inlineLatex === doc[2].content[1].inlineLatex);
check("source document not mutated", doc[0].content === "Les trous noirs");

// A malformed model response must fail loudly rather than corrupt an article.
function throwsReinject(fn: () => unknown): boolean {
  try {
    fn();
    return false;
  } catch (e) {
    return e instanceof ReinjectError;
  }
}
const dropped = { ...translated };
delete dropped[keys[0]!];
check("missing key rejected", throwsReinject(() => reinjectStrings(doc, dropped)));
check("extra key rejected", throwsReinject(() => reinjectStrings(doc, { ...translated, "b99.content": "x" })));
check("non-string value rejected", throwsReinject(() => reinjectStrings(doc, { ...translated, [keys[0]!]: 42 as any })));
check("empty map rejected", throwsReinject(() => reinjectStrings(doc, {})));

const meta = { title: "Titre", summary: "Résumé", seoTitle: null, seoDescription: "SEO", coverImageAlt: "" };
const metaMap = extractMetaStrings(meta);
check("null seoTitle not extracted", !("meta.seoTitle" in metaMap));
check("empty coverImageAlt not extracted", !("meta.coverImageAlt" in metaMap));
check("title and summary extracted", metaMap["meta.title"] === "Titre" && metaMap["meta.summary"] === "Résumé");
const metaOut = reinjectMetaStrings(meta, { "meta.title": "Title", "meta.summary": "Summary" });
check("meta translated", metaOut.title === "Title" && metaOut.summary === "Summary");
check("null seoTitle stays null", metaOut.seoTitle === null);
check("untranslated seoDescription kept", metaOut.seoDescription === "SEO");

// ── Optional: round-trip every published article ─────────────────────────────

if (process.argv.includes("--db")) {
  console.log("\n── production articles ──");

  const env = Object.fromEntries(
    readFileSync(new URL("../.env.local", import.meta.url), "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
      })
  );

  const res = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/articles` +
      `?select=slug,content,content_simplified,content_scientific&status=eq.published`,
    { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
  );
  const articles = await res.json();

  if (!Array.isArray(articles)) {
    check("fetched published articles", false, JSON.stringify(articles).slice(0, 200));
  } else {
    // Erase every string so only shape remains — proves translation moved
    // leaves and nothing else.
    const shapeOf = (t: unknown) => JSON.stringify(JSON.parse(JSON.stringify(t), (_k, v) => (typeof v === "string" ? "" : v)));

    let docs = 0;
    for (const a of articles) {
      for (const field of ["content", "content_simplified", "content_scientific"] as const) {
        const raw = (a as any)[field];
        if (!Array.isArray(raw) || raw.length === 0) continue;
        const parsed = ContentSchema.safeParse(raw);
        if (!parsed.success) continue;
        docs++;

        const blocks = parsed.data;
        const m = extractStrings(blocks);
        const identity = reinjectStrings(blocks, m);
        const marked = reinjectStrings(blocks, Object.fromEntries(Object.keys(m).map((k) => [k, "XX"])));

        const ok =
          JSON.stringify(identity) === JSON.stringify(blocks) &&
          ContentSchema.safeParse(identity).success &&
          shapeOf(marked) === shapeOf(blocks);

        if (!ok) check(`${a.slug} :: ${field}`, false);
      }
    }
    check(`round-tripped ${docs} production documents`, docs > 0);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
