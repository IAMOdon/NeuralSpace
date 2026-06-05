# lib/actions

Server Actions Next.js (`"use server"`). Toutes les mutations de données passent par ici — jamais par des Route Handlers. Chaque action vérifie l'authentification Supabase via `ensureAdmin()` avant d'utiliser `adminClient`.

---

## `articles.ts`

Actions CRUD pour les articles.

| Fonction | Description |
|---|---|
| `createArticle(input)` | Crée un brouillon, génère un slug unique (déduplication DB en boucle), calcule word count + reading time |
| `updateArticle(id, input)` | Met à jour les champs fournis (partial update), recalcule word count si `content` change |
| `publishArticle(id)` | Passe à `status = "published"`, set `published_at`, revalide `/` et `/<slug>` |
| `unpublishArticle(id)` | Repasse à `draft`, vide `published_at` |
| `deleteArticle(id)` | Supprime et `redirect("/dashboard/articles")` côté serveur |

`uniqueSlug(base)` — boucle DB pour garantir l'unicité : si `titre` existe, essaie `titre-1`, `titre-2`, etc.

`countWords(content)` — supporte les deux formats : `ContentBlock[]` (natif) et Tiptap ProseMirror JSON (legacy).

---

## `contributors.ts`

| Fonction | Description |
|---|---|
| `createContributor(input)` | Crée un auteur avec slug unique (même pattern que `uniqueSlug` mais sur table `authors`) |
| `updateArticleContributors(articleId, contributors[])` | Delete-then-insert sur `article_authors` — remplace la liste complète |

---

## `hero.ts`

| Fonction | Description |
|---|---|
| `saveHeroConfig({ type, config })` | Update le singleton `hero_config` (id = "singleton"), revalide `/` et `/dashboard/hero` |

---

## Sécurité

- `ensureAdmin()` appelle `supabase.auth.getUser()` côté serveur — ne fait jamais confiance au JWT client
- Toutes les écritures passent par `adminClient` (service_role, bypass RLS) — jamais exposé côté client grâce à `import "server-only"` dans `lib/supabase/admin.ts`
- Les Server Actions ne sont appelables que depuis des composants server ou des handlers autorisés — pas de surface d'exposition directe au client
