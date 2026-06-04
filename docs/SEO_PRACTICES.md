# NeuralSpace — SEO Practices

Sources : Google Search Central, Google Quality Rater Guidelines (EEAT), Ahrefs.

---

## Règles absolues

### Title tag
- ≤ 60 caractères (sinon tronqué dans les SERPs)
- Format : `Sujet spécifique — Neural Space`
- Chaque page a un titre unique — jamais de duplicate
- Inclure le mot-clé principal en début de titre

### Meta description
- ≤ 155 caractères
- Doit donner envie de cliquer (CTR) — pas juste décrire
- Inclure un bénéfice ou une promesse concrète
- Unique par page

### Canonical
- Chaque page publique a une URL canonique explicite
- Format : `<link rel="canonical" href="https://neuralspace.io/slug" />`
- Évite le duplicate content inter-domaines

### Open Graph
- `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`
- `og:locale: "fr_FR"` sur toutes les pages
- `og:site_name: "Neural Space"`
- Image OG obligatoire pour les articles — générée via Cloudinary

### Twitter Cards
- `twitter:card: "summary_large_image"` sur les articles
- `twitter:site: "@neuralspace_io"`
- `twitter:title` et `twitter:description` explicites

---

## JSON-LD Structured Data

### Sur chaque article
```json
{
  "@type": "Article",
  "headline": "...",         // ≤ 110 chars pour Google
  "description": "...",
  "datePublished": "ISO8601",
  "dateModified": "ISO8601",
  "author": [{ "@type": "Person", "name": "..." }],
  "publisher": { "@type": "Organization" },
  "wordCount": 800,
  "timeRequired": "PT4M",
  "inLanguage": "fr",
  "image": { "width": 1200, "height": 630 }
}
```

### BreadcrumbList sur chaque article
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "position": 1, "name": "Accueil", "item": "https://neuralspace.io" },
    { "position": 2, "name": "Catégorie", "item": "..." },
    { "position": 3, "name": "Titre article", "item": "..." }
  ]
}
```

### Sur le root layout (global)
- `Organization` — nom, URL, réseaux sociaux
- `WebSite` — avec `SearchAction` (potentialAction)

---

## EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)

Google Quality Rater Guidelines — signaux à maximiser :
- **Auteurs identifiés** avec rôle + institution affichés sur chaque article
- **Sources citées** inline avec hover tooltip + liste en bas d'article
- **Date de publication** visible + date de mise à jour si révisé
- **Institution partenaire** affichée dans la sidebar si applicable
- **À propos** page (future) décrivant l'équipe et la mission

---

## Sitemap & Robots

- `/sitemap.xml` — auto-généré via `app/sitemap.ts`, liste tous les articles publiés
- `/robots.txt` — généré via `app/robots.ts`
  - Allow: `/`
  - Disallow: `/dashboard/`, `/api/`
- Sitemaps soumis à Google Search Console

---

## Core Web Vitals (objectif 100/100 Lighthouse)

| Métrique | Objectif | Fix appliqué |
|---|---|---|
| LCP | < 2.5s | `priority` sur la première image du feed |
| CLS | < 0.1 | `fill` + container `aspect-ratio` sur les images |
| INP | < 200ms | Client Components minimaux, pas de JS inutile |
| FID | < 100ms | Server Components par défaut |

### Images
- Toujours `next/image` — jamais `<img>` brut
- `priority={true}` sur le premier élément visible (LCP)
- `sizes` correctement défini selon le contexte responsive
- Format auto via Cloudinary (`f_auto`) — WebP/AVIF selon browser

### Fonts
- `next/font/google` — auto-hébergé, zéro requête externe
- `display: "swap"` — évite le FOIT (Flash of Invisible Text)
- Weights explicites — évite le chargement de weights inutiles

### Pas de layout shift
- Toutes les images ont un ratio d'aspect défini (container `aspect-video`, `aspect-[16/9]`)
- Fonts hébergées localement — pas de décalage au chargement

---

## URLs

- Toujours en kebab-case ASCII : `les-trous-noirs-expliques`
- Slugs **jamais modifiés** après publication (casse les backlinks)
- Pas de paramètres inutiles dans les URLs canoniques
- Hiérarchie plate : `/slug` plutôt que `/category/slug`

---

## Contenu

- Chaque article cible un sujet précis, pas un mot-clé générique
- `wordCount` stocké en base et exposé dans le JSON-LD
- `readingTimeMin` affiché dans les cards et le JSON-LD (`timeRequired`)
- Titres H1 uniques par page, H2/H3 hiérarchisés avec ancres stables
- Alt text obligatoire sur toutes les images (enforced au niveau type TypeScript)
