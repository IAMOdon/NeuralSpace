# lib

Modules serveur et partagés. Rien dans ce dossier ne doit être importé directement par des Client Components (sauf `cookies.ts`, `dictionary.ts`, `config.ts`).

---

## Modules

| Fichier/Dossier | Rôle | Contexte |
|---|---|---|
| `articles.ts` | Requêtes Supabase read-only pour le feed et les pages publiques | Server uniquement |
| `slug.ts` | `slugify()` partagé — normalization Unicode, max 80 chars | Server + client |
| `config.ts` | Constantes globales (`SITE_NAME`, `BASE_URL`, etc.) | Universel |
| `cookies.ts` | Consent RGPD, session `ns_session`, `ns_history`, `ns_interests` | Client uniquement |
| `dictionary.ts` | Lookup Wiktionnaire / Wikipedia avec cache module-level | Server uniquement |
| `actions/` | Server Actions Next.js (articles, contributeurs, hero) | Server uniquement |
| `content/` | Parsing blocs, validateurs Zod, Shiki | Server uniquement |
| `cloudinary/` | `uploadImage()` helper vers Cloudinary SDK | Server uniquement |
| `supabase/` | Trois clients Supabase (server, browser, admin) | Voir supabase/README |
| `seo/` | Helpers JSON-LD (Article, BreadcrumbList, Organization) | Server uniquement |

---

## `slug.ts`

```ts
slugify("Physique Quantique : une intro") // "physique-quantique-une-intro"
```

Utilisé dans `lib/actions/articles.ts` (création article) et `lib/actions/contributors.ts` (création contributeur). Extrait d'une duplication qui existait dans 3 fichiers distincts.

---

## `articles.ts`

Fonctions read-only qui utilisent le client `anon` (respecte RLS) :

- `getArticles(options)` — liste paginée avec filtres catégorie/tag/search/tri
- `getArticle(slug)` — article complet avec auteurs, tags, sources
- `getCategories()` — toutes les catégories (cache 1h)
- `getRelatedArticles(articleId, categoryId)` — pour BecauseYouRead

`searchQuery` est sanitizé avant interpolation dans le filtre PostgREST `.or()` — les chars `,`, `.`, `(`, `)` sont remplacés par des espaces pour éviter une injection de syntaxe.

---

## `cookies.ts`

Gestion entièrement côté client (browser API `document.cookie` + localStorage).

- `setCookie(name, value, days)` — ajoute `; Secure` automatiquement sur HTTPS
- `getOrCreateSession()` — crée ou récupère `ns_session` (UUID, 365 jours)
- `hasConsent()` / `setConsent()` / `clearAllConsentData()`
- `getHistory()` / `addToHistory()` — 10 derniers articles lus
- `getInterests()` / `updateInterests()` — scores par catégorie
