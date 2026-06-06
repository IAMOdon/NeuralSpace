# app/api

Route Handlers Next.js. Tous les handlers sont stateless — pas de WebSocket, pas de streaming.

---

## Endpoints

### `POST /api/upload`
Upload d'image vers Cloudinary. Réservé aux admins authentifiés.

- Auth : session Supabase requise (401 si absent)
- Limite : 10 Mo (413 sinon)
- Validation : magic bytes du buffer — JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), GIF (`47 49 46`), WebP (RIFF), AVIF/HEIC (ISO BMFF ftyp) — 415 si non reconnu
- Dossiers Cloudinary autorisés (whitelist fermée) :
  - `neuralspace/uploads` (défaut)
  - `neuralspace/articles`
  - `neuralspace/covers`
  - `neuralspace/contributors`
  - `neuralspace/hero`
- Retourne : `{ url: string }` — URL Cloudinary permanente

### `GET /api/search?q=<query>`
Recherche full-text dans les articles (titre + résumé). Réservé aux admins.

- Auth : session Supabase requise
- Sanitization : les chars spéciaux PostgREST (`,`, `.`, `(`, `)`) sont strippés avant interpolation dans le filtre `.or()`
- Retourne : tableau d'articles (id, title, slug, status, cover)

### `GET /api/contributors?q=<query>`
Recherche de contributeurs par nom (pour le `ContributorPicker`).

- Auth : session Supabase requise
- Retourne : `ContributorRef[]` (id, name, role, institution, avatarUrl)

### `POST /api/track`
Enregistrement d'events analytics. Appelé par `ArticleTracker` côté client.

- Auth : aucune — public
- Rate limiting : 100 events par minute par IP (429 si dépassé) via Redis
- Events : `view` (lecture simple) et `watch` (watch time, scroll depth, interactions)
- Sans consentement : enregistre dans `article_views` sans session_id
- Avec consentement : enregistre dans `watch_events` avec session

### `GET /api/similar?articleId=<id>&categoryId=<id>`
Articles similaires pour la section "Parce que vous avez lu" (`BecauseYouRead`).

- Auth : aucune — public
- Retourne : jusqu'à 4 articles publiés de la même catégorie (hors article courant)

### `GET /api/dictionary?word=<mot>`
Définition d'un mot via Wiktionnaire (fr) ou Wikipedia (fr) en fallback.

- Auth : aucune — public
- Cache module-level côté serveur
- Retourne : `{ definition: string }` ou `{ error }` si non trouvé

---

## À faire

- [x] Rate limiting sur `/api/track` — 100 events/min par IP via Redis
- [ ] Pagination sur `/api/search` (actuellement limite 20)
