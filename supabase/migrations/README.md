# supabase/migrations

Historique des migrations Supabase. Chaque fichier est appliqué une seule fois dans l'ordre chronologique.

---

## Migrations appliquées

| Fichier | Contenu |
|---|---|
| `20260604103951_enable_extensions.sql` | Active `pgcrypto`, `uuid-ossp`, `pg_trgm` (FTS trigramme) |
| `20260604104005_initial_schema.sql` | Schéma complet initial : `articles`, `authors`, `categories`, `tags`, `article_authors`, `article_tags`, `article_views`, `watch_events`, `session_interests`, `session_profiles` |
| `20260604143945_enrich_analytics.sql` | Enrichit les tables analytics : champs device, pays, source, scroll depth, word lookups |
| `20260604150206_fix_top_category_id.sql` | Corrige un type mismatch sur `top_category_id` dans `session_profiles` |
| `20260605084351_full_text_search.sql` | Index `tsvector` sur `articles.title` + `articles.summary` pour la recherche admin |
| `20260605090754_hero_config.sql` | Table `hero_config` singleton — contrôle le HeroBlock du feed sans redeploy. RLS : lecture publique, écriture authentifiée |
| `20260605120000_is_sponsored.sql` | `ALTER TABLE articles ADD COLUMN is_sponsored BOOLEAN NOT NULL DEFAULT FALSE` |

---

## Schéma clé

### `articles`
Colonnes notables : `content JSONB` (blocs natifs ou Tiptap legacy), `sources JSONB`, `status` (draft/published/archived), `is_sponsored BOOLEAN`, `word_count INT`, `reading_time_min INT`.

### `hero_config`
Singleton (`id = 'singleton'`). `type TEXT` parmi `none/live/news/player`. `config JSONB` contient les paramètres spécifiques au mode (articleId pour `news`, streamUrl pour `live`, etc.).

### `authors`
Contributeurs avec `slug` unique, `role`, `institution`, `avatar_url`, `bio`.

### `article_authors`
Join table ordonnée (`order INT`) entre `articles` et `authors`.

---

## À appliquer en production

Aucune migration en attente au 2026-06-05.

---

## Ajouter une migration

```bash
# Nommer avec le timestamp courant
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_description.sql
# Appliquer localement
npx supabase db push
# Régénérer les types après application
npx supabase gen types typescript --project-id <id> > types/supabase.ts
```
