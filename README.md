# Neural Space

Média scientifique grand public — la science rendue accessible.

**Stack :** Next.js 15 App Router · TypeScript strict · Supabase (RLS) · Cloudinary · Tailwind CSS · Lucide · Shiki · KaTeX

---

## Routes

### Public `app/(public)/`

| Route | Page | Statut |
|---|---|---|
| `/` | Feed — articles récents, filtre catégories, HeroBlock, "Parce que vous avez lu" | ✅ Live |
| `/[slug]` | Article — rich text, word lookup, ArticleTracker | ✅ Live |
| `/audio` | Épisodes audio / podcasts | 🔜 Coming soon |
| `/live` | Sessions en direct avec LivePlayer + chat | 🔜 Coming soon |
| `/legal/cgu` | Conditions générales | ✅ Live |
| `/legal/confidentialite` | Politique de confidentialité | ✅ Live |
| `/legal/cookies` | Politique de cookies (RGPD complète) | ✅ Live |
| `/legal/mentions-legales` | Mentions légales | ✅ Live |

### Admin `app/(admin)/`

| Route | Page | Statut |
|---|---|---|
| `/dashboard` | Dashboard — stats placeholder | ✅ Live |
| `/dashboard/articles` | Liste des articles (tous statuts, vues, dates) | ✅ Live |
| `/dashboard/articles/new` | Créer un article | ✅ Live |
| `/dashboard/articles/[id]/edit` | Éditeur article (blocks, cover, sources, contributeurs) | ✅ Live |
| `/dashboard/articles/[id]/preview` | Prévisualisation article avant publication | ✅ Live |
| `/dashboard/hero` | Configuration du bloc hero du feed | ✅ Live |
| `/login` | Authentification Supabase — avec redirectTo post-login | ✅ Live |

### API `app/api/`

| Route | Rôle | Auth |
|---|---|---|
| `/api/track` | Events `view` et `watch` depuis ArticleTracker | Aucune |
| `/api/similar` | Articles similaires par catégorie (BecauseYouRead) | Aucune |
| `/api/dictionary` | Lookup Wiktionnaire / Wikipedia (word lookup) | Aucune |
| `/api/search` | Recherche full-text articles (titre + résumé) | Requiert session admin |
| `/api/upload` | Upload image vers Cloudinary (10 Mo max, magic bytes) | Requiert session admin |
| `/api/contributors` | Recherche contributeurs par nom | Requiert session admin |

---

## Features implémentées

### Contenu & Feed
- Feed avec filtre par catégorie (URL-based), tri Récents / Populaire
- `ArticleCard` : cover 3:2 landscape, catégorie colorée, tags, temps de lecture
- Article complet : heading, paragraph, quote, bullet-list, key-takeaways, callout, LaTeX (KaTeX), code (Shiki), image (Cloudinary), vidéo (YouTube/Vimeo), divider
- `HeroBlock` : configurable depuis l'admin (none / live / news / player) sans redeploy — table `hero_config` singleton en Supabase
- JSON-LD `Article` + `BreadcrumbList` sur chaque article
- `generateMetadata()` dynamique (title, description, OG, Twitter Cards)
- Sitemap XML + robots.txt auto-générés

### Admin — Éditeur
- `ArticleEditor` : titre, résumé, type, catégorie, tags, cover Cloudinary, sources (label + url + doi), SEO title/description, contenu sponsorisé, word count live
- `BlockEditor` : système de blocs natif (heading, subheading, paragraph rich text, quote, bullet-list, key-takeaways, callout, equation, code, image, video, divider)
- `ContributorPicker` : recherche + création à la volée, upload avatar Cloudinary
- Publish / Unpublish / Delete depuis l'éditeur
- Prévisualisation `/preview` avant publication
- Slug auto-généré avec déduplication DB (ex: `titre-1`, `titre-2`)
- Word count et reading time calculés et sauvegardés côté serveur
- `GROK_ARTICLE_PROMPT.md` : prompt détaillé pour générer du contenu structuré avec Grok / GPT

### Admin — Sécurité
- `middleware.ts` : guard Supabase sur `/dashboard/**`, redirige vers `/login?redirectTo=<path>` avec restauration de la destination après connexion
- `adminClient` protégé par `import "server-only"` — crash build si importé côté client
- `/api/upload` : limite 10 Mo, validation magic bytes (JPEG/PNG/GIF/WebP/AVIF), whitelist de 5 dossiers Cloudinary
- CSP (`Content-Security-Policy`) dans `next.config.ts`
- Cookies `ns_session` : 365 jours, flag `Secure` sur HTTPS

### Word Lookup
- Sélection d'un mot → tooltip (Wiktionnaire ou extrait Wikipedia)
- AbortController par requête, cache module-level, listener scroll passive

### Analytics & Personnalisation (RGPD)
- **Sans consentement** : `article_views` (device, pays, heure, source — sans session_id)
- **Avec consentement** : `watch_events` (watch time actif, scroll depth, word lookups, source clicks)
- `session_interests` : scores par catégorie en Supabase
- `session_profiles` : portrait de lecture anonyme (articles lus, complétion, expertise signal)
- `ns_interests` + `ns_history` localStorage
- `BecauseYouRead` : recommandations personnalisées via `/api/similar`

### Cookies RGPD
- Banner avec détail expandable (2 colonnes : avec / sans cookies)
- `ns_consent` (1 an), `ns_session` (365 jours + Secure), localStorage
- `clearAllConsentData()` au refus ET à la révocation
- "Gérer mes cookies" dans le footer (reset complet + reload)
- Page légale exhaustive

### Live & Audio (Coming Soon)
- `LivePlayer` : badge LIVE animé / Rediffusion, play/pause, volume, fullscreen API, chat, responsive
- `AudioCard` : lecture simulée avec barre de progression
- Pages `/live` et `/audio` : design complet avec overlay "Bientôt disponible"

---

## À faire

### Court terme
- [ ] **Newsletter** : brancher `NewsletterForm` sur Resend ou Brevo
- [ ] **Réseaux sociaux** : remplir les handles dans `Footer.tsx` (Instagram, TikTok, YouTube, LinkedIn, Twitch, Facebook)
- [ ] **Cookies Live/Audio** : tracker les events dans `LivePlayer`, `AudioCard`, `LiveHero`
- [ ] **Rate limiting** `/api/track` : Vercel KV ou middleware Upstash

### Moyen terme
- [ ] **Section Audio** : table `episodes` Supabase, page `/audio` live avec `AudioCard` dans le feed
- [ ] **Section Live** : table `live_events`, `LiveHero` conditionnel, `LivePlayer` avec vraie vidéo (YouTube Live ou Mux)
- [ ] **Pages auteurs publiques** : sidebar article — photo, bio, institution, articles liés
- [ ] **Séries** : regroupement d'articles multi-parties
- [ ] **Admin analytics** : vues/semaine, top articles, répartition pays/device
- [ ] **`content_analytics`** : job hebdo qui agrège `watch_events` → stats par article

### Long terme
- [ ] **pgvector** : recommandations par embedding plutôt que filtre catégorie
- [ ] **Compte utilisateur** : migration profil anonyme → connecté, historique cross-device
- [ ] **Audio** : enregistrements, transcriptions, chapitres liés aux articles
- [ ] **Live** : intégration Twitch/YouTube Live, replay automatique post-stream
- [ ] **Notifications** : email/push pour nouveaux articles et lives à venir

---

## Structure

```
app/
  (public)/              — Layout nav publique
    page.tsx             — Feed
    [slug]/page.tsx      — Article
    audio/page.tsx       — Coming soon
    live/page.tsx        — Coming soon
    legal/               — 4 pages légales
  (admin)/               — Layout protégé (Sidebar)
    dashboard/
      page.tsx           — Dashboard placeholder
      articles/          — CRUD articles
      hero/              — Config HeroBlock
  api/                   — Route Handlers (track, similar, dictionary, search, upload, contributors)
  login/page.tsx         — Authentification avec redirectTo
  layout.tsx             — Root layout + CSP
  sitemap.ts / robots.ts
components/
  admin/                 — Sidebar, SearchBar, HeroConfigForm, editor/
  article/               — ArticleRenderer, ArticleTracker, WordLookup, TextRunRenderer
  feed/                  — ArticleCard, HeroBlock, CategoryFilter, BecauseYouRead, AudioCover
  live/                  — LivePlayer
  ui/                    — Nav, Footer, CookieBanner, ManageCookiesButton, NewsletterForm
lib/
  actions/               — Server Actions : articles, contributors, hero
  content/               — parseBlocks, validators (Zod), shiki
  supabase/              — server / browser / admin clients
  cloudinary/            — uploadImage helper
  articles.ts            — Requêtes Supabase read-only
  cookies.ts             — Consent, session, history, interests
  slug.ts                — slugify partagé
  config.ts              — SITE_NAME, BASE_URL, etc.
  dictionary.ts          — Wiktionnaire / Wikipedia lookup
  seo/                   — Helpers JSON-LD
middleware.ts            — Auth guard Supabase sur /dashboard/**
next.config.ts           — CSP, image domains
docs/                    — Best practices internes (sécurité, SEO, perf)
supabase/migrations/     — Schéma versionné
types/                   — article.ts, content.ts, events.d.ts, supabase.ts (généré)
```
