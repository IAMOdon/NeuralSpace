# NeuralSpace

A production science-media platform — public feed, full editorial back-office, and an
LLM translation pipeline that ships articles into other languages without a human in the loop.

**Live:** https://neural-space-hftk.vercel.app · **Stack:** Next.js 16 · React 19 · TypeScript (strict) · Supabase · Vercel

> **If you have thirty seconds:** read [`lib/i18n/gemini.ts`](lib/i18n/gemini.ts). It is 264 lines
> of schema-constrained LLM plumbing that runs in production, and it is the most interesting thing
> in this repository.

---

## What it is

NeuralSpace is a French-language popular-science publication I built and run end to end.
It is not a demo: it is deployed, it serves real articles, and the editorial workflow behind
it is the one actually used to publish them.

Three parts:

- **Public site** — article feed with category filtering, long-form reader with syntax
  highlighting (Shiki) and math rendering (KaTeX), inline dictionary lookup on text
  selection, full-text search in French, RSS, sitemap, JSON-LD structured data.
- **Admin back-office** — Tiptap block editor, Cloudinary uploads, contributor management,
  email campaign builder with Resend, audience analytics dashboard, GDPR consent and
  disclosure flows.
- **Translation pipeline** — a schema-constrained LLM pipeline that translates published
  articles, drained by a nightly Vercel cron. This is the part worth reading.

## The problem the translation pipeline solves

Machine-translating a *structured document* is not machine-translating text. An article is a
tree of blocks — headings, paragraphs with inline marks, captions, pull quotes, SEO metadata,
slugs. Hand the whole tree to a model and it will happily reshape it, drop a caption, or
invent a block. Publishing that silently is worse than not translating at all.

`lib/i18n/` (4 files, ~910 lines) is the answer:

**`extract.ts`** flattens the block tree into a flat map of `id → translatable string`, so the
model never sees structure and cannot damage it. Handles Unicode-safe slug generation.

**`gemini.ts`** is the model client, and it is where the engineering is:

- **Schema-constrained I/O with a deliberate shape.** The model receives and must return
  `[{id, text}]` — an array of fixed-shape records — because a dynamic-key object cannot be
  pinned by a `responseSchema`. The reasoning is written into the file header, not inferred.
- **Integrity check by id-set equality.** The set of ids that comes back is compared exactly
  against the set that went out. A dropped or hallucinated entry is a hard error, not a
  half-translated article that goes live unnoticed.
- **Round-robin API key pool with cooldown.** Keys are drawn in rotation; a key that returns
  429 or 5xx is benched for 60s. When every key is cooling down, the call fails *retryably*
  and the row stays queued.
- **Retryable vs. fatal error classification.** `unknown locale` is fatal and stops the row.
  A truncated response or a safety block is retryable and is re-attempted on a different key.
- **Chunking on two axes** — 40 items and 6,000 characters, whichever hits first. Small
  chunks keep a retry cheap and keep output clear of any truncation ceiling.
- **Measured reasoning budget.** `thinkingLevel: "low"`, chosen after comparing output on real
  article text: identical results at roughly a third of the tokens and a third of the latency.

**`queue.ts`** decouples the work from the request. Publishing enqueues; a cron drains. A
failed row stays `pending` and the next tick retries it. No job is lost to a timeout.

**`locales.ts`** is the locale registry.

Also worth a look: **`lib/grok-validator.ts`** (~285 lines) — per-field error/warning validation
of LLM-generated article JSON, which blocks structurally invalid content from ever reaching the
editor — and **`lib/prompts/`**, ~1,600 lines of production prompts versioned and documented as
code: tone checklist, strict validation rules, worked examples, design rationale.

## Architecture

```
app/
  (public)/      feed, article, search, legal, RSS, sitemap
  (admin)/       dashboard, editor, contributors, campaigns, analytics
  api/           14 routes — i18n cron, newsletter, search, tracking, upload, …
lib/
  actions/       server actions
  content/       block parsing and conversion
  i18n/          translation pipeline (extract · gemini · queue · locales)
  seo/           metadata and JSON-LD
  email/         Resend templates and sending
  supabase/      client / server / admin clients, kept separate on purpose
  prompts/       versioned production prompts
supabase/
  migrations/    14 timestamped SQL migrations, RLS from the first one
```

Sensitive modules are marked `import "server-only"`. The three Supabase clients are separate
files because the admin client bypasses RLS and that should never be one import away from a
component.

## Stack

Next.js 16.3 (App Router) · React 19.2 · TypeScript strict · Supabase (PostgreSQL, RLS,
French full-text search) · Redis · Cloudinary · Tiptap 3 · Zod 4 · Tailwind 4 · Shiki · KaTeX ·
Resend · deployed on Vercel with a 5-minute cron.

~18,800 lines of TypeScript across 139 files. 14 API routes. 14 SQL migrations.

## Security

Handled as part of the work, and visible in the history rather than claimed here:

- Unauthenticated debug routes that exposed article data were found and removed (`549c0d8`).
- Real admin role checks replaced a placeholder (`e9797fd`).
- JSON-LD is escaped before injection into inline `<script>` tags (`b40ae5e`).
- Full Content Security Policy with a comment justifying each directive, plus `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, `poweredByHeader: false`.
- RLS enabled in the initial migration, not bolted on later.
- No secret has ever been committed — `.env*` is ignored and the history is clean.

## What this repository does not have

Stated plainly, because you would find out in thirty seconds anyway:

- **No test suite.** The three `scripts/verify-i18n-*.ts` are manual verification scripts I run
  by hand against the real pipeline; they are not automated tests. On ~18,800 lines with a
  database, a queue and a model in the loop, this is the real gap. Adding Vitest coverage over
  the pure logic — `grok-validator`, `extract`, the chunking and id-set check in `gemini` — is
  the next thing I intend to do here.
- **No CI.** Nothing runs automatically before a deploy.
- **No ESLint configuration.**
- The `embedding vector(1536)` column and its ivfflat index exist in the schema but are
  **never populated**. There is no semantic search and no RAG in this project. `/api/similar`
  is a category filter ordered by popularity, and nothing more.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Required environment variables are listed in `.env.example`. Database: apply
`supabase/migrations/` in order.

## Author

Built and maintained solo, in Luxembourg. Open to applied AI and agent engineering roles,
remote or relocation.

[LinkedIn](https://www.linkedin.com/in/armand-wegnez/) · [armand.wegnez@gmail.com](mailto:armand.wegnez@gmail.com)
