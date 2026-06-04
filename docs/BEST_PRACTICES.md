# NeuralSpace — Best Practices

Règles non négociables pour tout le code de ce projet.
Chaque décision ici est intentionnelle et doit être respectée sans exception.

---

## TypeScript

- `strict: true` dans `tsconfig.json` — toujours.
- Aucun `any`. Si le type est inconnu, utiliser `unknown` et le narrower proprement.
- Types métier (article, auteur, catégorie…) définis dans `types/` et exportés depuis un index.
- Inférer les types Supabase depuis le client généré (`supabase gen types typescript`), ne jamais les écrire à la main.
- Préférer `type` à `interface` sauf pour les entités extensibles (patterns de plugin).

---

## Next.js App Router

- **Server Components par défaut** — n'ajouter `"use client"` que si interactivité réelle requise.
- Les pages article sont Server Components pour le SSR / SEO.
- Les layouts sont stables et ne se re-rendent pas à chaque navigation.
- Utiliser `generateMetadata()` sur chaque page publique — jamais de metadata statiques dans `layout.tsx` pour les pages article.
- `generateStaticParams()` pour les slugs connus à build time (ISR si le contenu change).
- Jamais de `fetch` dans un Client Component — les données viennent toujours d'un Server Component parent via props.

### Structure des dossiers

```
app/
  (public)/          # groupe de routes public (layout avec nav)
    page.tsx         # feed
    [slug]/
      page.tsx       # article
  (admin)/           # groupe de routes admin (layout protégé)
    dashboard/
    articles/
      new/
      [id]/edit/
  api/               # Route Handlers uniquement
components/
  ui/                # primitives visuelles (Button, Badge, Card…)
  article/           # composants spécifiques articles
  feed/              # composants du feed
  admin/             # composants admin
lib/
  supabase/          # clients (server, browser, admin)
  cloudinary/        # helpers upload/transform
  seo/               # helpers generateMetadata
  content/           # parser de blocs rich text
types/
  index.ts           # re-export de tous les types
  article.ts
  author.ts
  content.ts         # types des blocs rich text
```

---

## Supabase

- **Row Level Security (RLS) activé sur toutes les tables** sans exception.
- Client serveur via `createServerClient` (cookies) dans les Server Components et Route Handlers.
- Client browser via `createBrowserClient` dans les Client Components (état auth seulement).
- Ne jamais exposer la `service_role` key côté client.
- Migrations versionées dans `supabase/migrations/` — aucun changement de schéma sans migration.
- Politique RLS minimale : les données publiques sont `SELECT` pour `anon`, écriture uniquement pour `authenticated` avec vérification de rôle.

---

## SEO

- `generateMetadata()` asynchrone sur chaque page dynamique.
- Structure obligatoire pour les articles :

```ts
{
  title: `${article.seo_title} — Neural Space`,
  description: article.seo_description,
  openGraph: {
    title: article.seo_title,
    description: article.seo_description,
    images: [{ url: article.og_image_url, width: 1200, height: 630 }],
    type: 'article',
    publishedTime: article.published_at,
    authors: article.authors.map(a => a.name),
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: `https://neuralspace.io/${article.slug}` },
}
```

- JSON-LD `Article` injecté via `<script type="application/ld+json">` dans chaque page article.
- Tous les slugs sont en kebab-case ASCII, jamais modifiés après publication.
- Chaque image a un `alt` text descriptif — obligatoire, pas optionnel.

---

## Images (Cloudinary)

- Toutes les images passent par Cloudinary — jamais de stockage local ou de blob Supabase pour les médias.
- Utiliser les transformations Cloudinary pour servir le bon format/taille (`f_auto`, `q_auto`).
- Le composant `<Image>` de Next.js est utilisé partout avec `sizes` correctement défini.
- Les URLs Cloudinary sont stockées en base, les transformations sont appliquées à la volée via URL.

---

## Contenu riche (Rich Text)

- Le contenu est stocké en **JSON structuré** (tableau de blocs), jamais en HTML brut.
- Le schéma des blocs est défini dans `types/content.ts` et versionné.
- Le rendu côté public est un Server Component pur (`ArticleRenderer`).
- L'éditeur admin est 100% custom — Selection API, Range, contenteditable natif. Zéro lib tierce.
- Chaque bloc est un composant indépendant avec son propre `contenteditable`.
- La sérialisation état interne → `ContentBlock[]` se fait dans une fonction pure testable.
- Le `word_count` est calculé au moment de la sauvegarde, stocké en base.

---

## Performance

- Pas de dépendance inutile — chaque package ajouté doit avoir une raison claire.
- CSS uniquement via Tailwind — pas de CSS-in-JS, pas de styled-components.
- Pas de barrel exports qui cassent le tree-shaking (`export * from` avec précaution).
- `React.lazy` + `Suspense` pour les composants lourds côté client (éditeur de blocs).
- Les polices sont auto-hébergées via `next/font` — jamais de requête Google Fonts externe.

---

## Qualité & Conventions

- Pas de commentaires qui expliquent le QUOI — les noms de variables/fonctions suffisent.
- Un commentaire uniquement pour le POURQUOI non-évident (contrainte cachée, bug workaround).
- Fonctions pures et testables pour toute la logique métier (parsing, SEO helpers, content).
- Aucune logique métier dans les composants — uniquement dans `lib/`.
- Nommage : `PascalCase` pour composants, `camelCase` pour fonctions/variables, `kebab-case` pour fichiers de composants, `SCREAMING_SNAKE` pour constantes d'env.
- `zod` pour valider toutes les entrées aux frontières système (formulaires admin, API routes).
