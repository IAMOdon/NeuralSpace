# NeuralSpace — Performance Practices

Objectif : 100/100 sur Lighthouse Performance, Accessibility, Best Practices, SEO.

---

## Architecture de rendu

### Server Components par défaut
- Toutes les pages et composants sont Server Components sauf nécessité explicite
- `"use client"` uniquement pour : état interactif, événements browser, hooks React
- Résultat : zéro JS client inutile, TTI (Time to Interactive) minimal

### Données
- `cache()` de React sur les queries utilisées dans `generateMetadata` ET la page — un seul fetch par request
- `Promise.all()` pour les queries parallèles (ex: articles + catégories sur le feed)
- Pas de waterfall de requêtes

---

## Images

```tsx
// Toujours next/image, jamais <img>
<Image
  src={url}
  alt={alt}           // obligatoire — TypeScript l'enforce
  fill               // pour les conteneurs avec position:relative
  sizes="..."        // calibré selon le contexte responsive
  priority={i === 0} // sur le premier élément visible (LCP)
  className="object-cover"
/>
```

- Container avec `aspect-ratio` défini → pas de CLS
- `f_auto` Cloudinary → WebP/AVIF selon le browser
- `q_auto` Cloudinary → qualité optimisée automatiquement

---

## Fonts

```ts
// next/font/google — auto-hébergé, display:swap, weights explicites
const orbitron = Orbitron({
  weight: ["400", "700", "900"], // uniquement les weights utilisés
  display: "swap",               // évite le FOIT
  variable: "--font-orbitron",
});
```

- Zéro requête vers Google Fonts → pas de round-trip réseau
- `display: "swap"` → texte affiché immédiatement (fallback), remplacé quand la font charge
- Variables CSS → Tailwind peut les utiliser directement

---

## Singletons serveur

```ts
// Shiki — créé une seule fois, réutilisé sur toutes les requêtes
let highlighter: Highlighter | null = null;
async function getHighlighter() {
  if (!highlighter) highlighter = await createHighlighter({ ... });
  return highlighter;
}
```

Même pattern pour tout client/instance coûteux à initialiser.

---

## Client Components légers

### WordLookup (dictionary)
- Fetch on-demand uniquement — zéro chargement initial
- `AbortController` — annule la requête précédente si nouvelle sélection
- Cache module-level `Map` — même mot = zéro requête réseau répétée
- `passive: true` sur le listener scroll — pas de blocage du thread principal

### CategoryFilter
- URL-based state — pas de `useState`, pas de hydration mismatch
- `scroll: false` sur `router.push` — pas de scroll-to-top intempestif

---

## Animations

- Max `duration-200` (200ms) — Apple HIG standard
- `transition-transform` plutôt que `transition-all` — GPU-composited
- `scale-105` sur hover images — transform uniquement, pas de layout recalcul
- Pas d'animations déclenchées au scroll (pas de `IntersectionObserver` inutile)

---

## Accessibilité (Lighthouse Accessibility = 100)

- `:focus-visible` global défini dans `globals.css`
- `lang="fr"` sur `<html>`
- `alt` text obligatoire sur toutes les images (TypeScript `alt: string` non-optional)
- Semantic HTML : `<article>`, `<aside>`, `<nav>`, `<header>`, `<main>`
- Contraste WCAG AA minimum partout (ratio ≥ 4.5:1)
- Titres hiérarchisés (H1 → H2 → H3, jamais de saut)

---

## Sécurité (Lighthouse Best Practices)

Headers appliqués via `next.config.ts` :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `poweredByHeader: false` — cache la version Next.js

---

## Checklist avant chaque déploiement

- [ ] `npx tsc --noEmit` — zéro erreur TypeScript
- [ ] Nouvelles images passent par `next/image` avec `alt` et `sizes`
- [ ] Nouvelles pages ont `generateMetadata()` async
- [ ] Nouveau contenu JSON-LD valide (`schema.org` validator)
- [ ] Zéro `console.error` non catché en prod
