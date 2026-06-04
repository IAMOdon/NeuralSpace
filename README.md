# Neural Space

Science media platform making complex science accessible — physics, biology, neuroscience, cosmology.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Language | TypeScript strict |
| Database | Supabase (PostgreSQL + RLS + pgvector) |
| Storage | Cloudinary |
| Styling | Tailwind CSS v4 (100% custom, no UI lib) |
| Fonts | Orbitron (headings) · Space Grotesk (body) via `next/font` |
| Syntax highlighting | Shiki (server-side, custom theme) |
| Math rendering | KaTeX (server-side) |
| Dictionary | Wiktionary + Wikipedia REST APIs (proxied) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_URL=
```

### Database

Requires a Supabase project with `pgvector` extension. Apply migrations:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

---

## Project Structure

```
app/
  (public)/           Public routes (feed, articles)
  (admin)/            Protected admin routes
  api/dictionary/     Dictionary proxy API route
  robots.ts           Auto-generated robots.txt
  sitemap.ts          Auto-generated sitemap.xml
components/
  ui/                 Nav, shared primitives
  feed/               ArticleCard, CategoryFilter
  article/            ArticleRenderer, TextRunRenderer, WordLookup
lib/
  supabase/           server · browser · admin clients
  cloudinary/         upload + URL transform helpers
  content/            Zod validators, Shiki singleton
  articles.ts         All article queries
  dictionary.ts       Word lookup client
  config.ts           Site-wide constants
types/
  content.ts          ContentBlock discriminated union (12 block types)
  article.ts          Article, ArticleCard, ArticleWithRelations
  author.ts           Author, AuthorSummary
  supabase.ts         Auto-generated from DB schema
docs/
  SEO_PRACTICES.md
  PERFORMANCE_PRACTICES.md
  SECURITY_PRACTICES.md
```

---

## Content Blocks

The article editor supports 12 block types stored as typed JSON:

`heading` · `subheading` · `paragraph` · `quote` · `bullet-list` · `key-takeaways` · `callout` · `equation` (KaTeX) · `code` (Shiki) · `image` · `video` · `divider`

Inline formatting: **bold** · *italic* · underline · ~~strikethrough~~ · links · citations `[n]` · inline LaTeX

---

## Key Features

- **Word lookup** — select any word → Wiktionary/Wikipedia definition tooltip
- **Equation rendering** — LaTeX via KaTeX, server-side
- **Code highlighting** — Shiki with `github-dark` theme, server-side
- **Recommendations** — pgvector embeddings (OpenAI) for "read next"
- **Category filter** — URL-based, server-rendered
- **Full SEO** — JSON-LD Article + BreadcrumbList + Organization + WebSite, sitemap, robots

---

## Documentation

| File | Description |
|---|---|
| `NEURALSPACE_CONTEXT.md` | Product vision, roadmap, architecture decisions |
| `BEST_PRACTICES.md` | TypeScript, Next.js, Supabase coding standards |
| `DATABASE_SCHEMA.md` | Full DB schema, RLS policies, indexes, triggers |
| `docs/SEO_PRACTICES.md` | SEO rules, JSON-LD schemas, Core Web Vitals |
| `docs/PERFORMANCE_PRACTICES.md` | Lighthouse 100 checklist, image/font/animation rules |
| `docs/SECURITY_PRACTICES.md` | RLS, headers, env vars, security boundaries |
