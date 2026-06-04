# Neural Space

Média scientifique grand public — la science rendue accessible.

**Stack :** Next.js 15 App Router · TypeScript strict · Supabase (RLS) · Cloudinary · Tailwind CSS · Lucide

---

## Routes

### Public `app/(public)/`

| Route | Page | Statut |
|---|---|---|
| `/` | Feed — articles récents, filtre catégories, LiveHero, "Parce que vous avez lu" | ✅ Live |
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
| `/dashboard` | Dashboard admin | 🚧 Placeholder |
| `/login` | Authentification Supabase | ✅ Live |

### API `app/api/`

| Route | Rôle |
|---|---|
| `/api/track` | Events `view` et `watch` depuis l'ArticleTracker |
| `/api/similar` | Articles similaires par catégorie (BecauseYouRead) |
| `/api/dictionary` | Lookup Wiktionnaire / Wikipedia (word lookup) |

---

## Features implémentées

### Contenu & Feed
- Feed avec filtre par catégorie (URL-based), tri Récents / Populaire
- ArticleCard : cover, catégorie colorée, tags, temps de lecture
- Article complet : heading, paragraph, quote, bullet-list, key-takeaways, callout, LaTeX (KaTeX), code (Shiki), image (Cloudinary), vidéo (YouTube/Vimeo), divider
- JSON-LD `Article` + `BreadcrumbList` sur chaque article
- `generateMetadata()` dynamique (title, description, OG, Twitter Cards)
- Sitemap XML + robots.txt auto-générés

### Word Lookup
- Sélection d'un mot → tooltip (Wiktionnaire ou extrait Wikipedia)
- AbortController par requête, cache module-level, listener scroll passive

### Analytics & Personnalisation (RGPD)
- **Sans consentement** : `article_views` (device, pays, heure, source — pas de session_id)
- **Avec consentement** : `watch_events` (watch time actif, scroll depth, word lookups, source clicks)
- `session_interests` : scores par catégorie accumulés en Supabase
- `session_profiles` : portrait de lecture anonyme (articles lus, complétion, expertise signal)
- `ns_interests` localStorage : scores locaux mis à jour à chaque fin de lecture
- `ns_history` localStorage : 10 derniers articles lus
- `BecauseYouRead` : section feed personnalisée via `/api/similar`

### Cookies RGPD
- Banner avec détail expandable (2 colonnes : avec / sans cookies)
- `ns_consent` (1 an), `ns_session` (session), `ns_history` / `ns_interests` (localStorage)
- `clearAllConsentData()` au refus ET à la révocation
- "Gérer mes cookies" dans le footer (reset complet + reload)
- Page légale exhaustive : tables, champs, base légale, procédure

### UI / Navigation
- Nav fixe avec hamburger mobile
- Footer async : thématiques Supabase (cache 1h), 7 réseaux sociaux, newsletter placeholder, légal
- 4 pages légales complètes

### Live & Audio (Coming Soon)
- `LivePlayer` : badge LIVE animé / Rediffusion, play/pause, volume, fullscreen API, chat simulé auto-alimenté, input utilisateur — responsive
- `LiveHero` : card feed avec badge LIVE / À venir, CTA, spectateurs
- `AudioCard` : lecture simulée avec barre de progression, catégorie, durée
- Pages `/live` et `/audio` : design complet avec overlay "Bientôt disponible"

---

## À faire

### Court terme
- [ ] **Admin panel** : CRUD articles, dashboard analytics
- [ ] **Newsletter** : brancher `NewsletterForm` sur Resend ou Brevo
- [ ] **Réseaux sociaux** : remplir les handles dans `Footer.tsx` (Instagram, TikTok, YouTube, LinkedIn, Twitch, Facebook)
- [ ] **Cookie `Secure` flag** : activer sur domaine custom HTTPS (`lib/cookies.ts` — 2 TODOs)
- [ ] **Cookies integration Live/Audio** : tracker les events dans `LivePlayer`, `AudioCard`, `LiveHero` (TODOs en place)

### Moyen terme
- [ ] **Section Audio** : table `episodes` Supabase, page `/audio` live, `AudioCard` dans le feed
- [ ] **Section Live** : table `live_events`, `LiveHero` conditionnel (actif seulement si live en cours), `LivePlayer` avec vraie vidéo (YouTube Live embed ou Mux)
- [ ] **Auteurs** : sidebar article — photo, bio, institution, articles liés
- [ ] **Séries** : regroupement d'articles multi-parties
- [ ] **pgvector** : recommandations par embedding plutôt que simple filtre catégorie
- [ ] **Compte utilisateur** : migration profil anonyme → connecté, historique cross-device
- [ ] **`content_analytics`** : job hebdo qui agrège `watch_events` → stats par article
- [ ] **Admin dashboard** : vues/semaine, top articles, répartition pays/device

### Long terme
- [ ] **Audio** : enregistrements, transcriptions, chapitres liés aux articles
- [ ] **Live** : intégration Twitch/YouTube Live, replay automatique post-stream
- [ ] **Notifications** : email/push pour nouveaux articles et lives à venir

---

## Suggestions

### SEO
- `WebSite` + `SearchAction` JSON-LD dans le root layout (Google Sitelinks Searchbox)
- `Organization` JSON-LD avec sameAs réseaux sociaux (boost EEAT)
- ISR sur les pages article (`revalidate: 3600`) plutôt que full dynamic

### Produit
- **"À la une"** : épingler un article hero dans le feed (1 grand + grille)
- **Tags navigation** : filtre par tag en plus des catégories
- **Partage social** : Web Share API avec fallback par article
- **Mode sombre** : palette en custom props Tailwind, à compléter
- **Table des matières** : générée depuis les `subheading` blocks, sticky sidebar
- **Temps de lecture restant** : "Il vous reste ~3 min" en cours de lecture

### Architecture
- `site_config` table Supabase pour activer/désactiver `LiveHero` sans redeploy
- Rate limiting sur `/api/track` (Vercel KV ou middleware)
- Extraire la logique footer dans `lib/footer.ts`

---

## Structure

```
app/
  (public)/          — Layout nav publique
    page.tsx         — Feed
    [slug]/page.tsx  — Article
    audio/page.tsx   — Coming soon
    live/page.tsx    — Coming soon
    legal/           — 4 pages légales
  (admin)/           — Layout protégé
  api/               — Route Handlers (track, similar, dictionary)
components/
  article/           — ArticleRenderer, ArticleTracker, WordLookup, SourceLink
  feed/              — ArticleCard, CategoryFilter, BecauseYouRead, LiveHero, AudioCard
  live/              — LivePlayer
  ui/                — Nav, Footer, CookieBanner, ManageCookiesButton, NewsletterForm
lib/
  articles.ts        — Queries Supabase
  cookies.ts         — Consent, session, history, interests
  supabase/          — Clients server / browser / admin
  content/           — Validators Zod blocs rich text
docs/
  BEST_PRACTICES.md
  PERFORMANCE_PRACTICES.md
  SECURITY_PRACTICES.md
  SEO_PRACTICES.md
supabase/migrations/ — Schéma versionné
types/               — article.ts, content.ts, supabase.ts (généré)
```
