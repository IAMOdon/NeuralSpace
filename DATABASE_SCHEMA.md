# NeuralSpace — Database Schema

Base de données : **Supabase (PostgreSQL)**
RLS activé sur toutes les tables.
Extension requise : `pgvector` (similarité vectorielle pour les recommandations).

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Tables

### `categories`

| Colonne      | Type          | Contraintes      | Description                   |
|-------------|---------------|------------------|-------------------------------|
| `id`        | `uuid`        | PK, default gen  |                               |
| `slug`      | `text`        | UNIQUE, NOT NULL | kebab-case, stable            |
| `name`      | `text`        | NOT NULL         | Ex: "Physique"                |
| `color_hex` | `text`        |                  | Couleur badge ex: `#2233F0`   |
| `created_at`| `timestamptz` | default now()    |                               |

---

### `tags`

| Colonne      | Type          | Contraintes      | Description                          |
|-------------|---------------|------------------|--------------------------------------|
| `id`        | `uuid`        | PK, default gen  |                                      |
| `slug`      | `text`        | UNIQUE, NOT NULL | kebab-case — stable, sert dans les URLs |
| `name`      | `text`        | NOT NULL         | Ex: "trous noirs"                    |
| `created_at`| `timestamptz` | default now()    |                                      |

---

### `series`

| Colonne       | Type          | Contraintes      | Description                              |
|--------------|---------------|------------------|------------------------------------------|
| `id`         | `uuid`        | PK, default gen  |                                          |
| `slug`       | `text`        | UNIQUE, NOT NULL | kebab-case                               |
| `title`      | `text`        | NOT NULL         | Ex: "La mécanique quantique en 5 parties"|
| `description`| `text`        |                  |                                          |
| `created_at` | `timestamptz` | default now()    |                                          |

---

### `authors`

| Colonne        | Type          | Contraintes      | Description                                        |
|---------------|---------------|------------------|----------------------------------------------------|
| `id`          | `uuid`        | PK               |                                                    |
| `name`        | `text`        | NOT NULL         |                                                    |
| `slug`        | `text`        | UNIQUE, NOT NULL | Pour les futures pages auteur                      |
| `role`        | `text`        |                  | Ex: "Chercheur en neurosciences"                   |
| `institution` | `text`        |                  | Ex: "CNRS", "MIT"                                  |
| `bio`         | `text`        |                  | Bio courte                                         |
| `avatar_url`  | `text`        |                  | URL Cloudinary                                     |
| `links`       | `jsonb`       | default `{}`     | `{ website, twitter, scholar, researchgate, ... }` |
| `user_id`     | `uuid`        | FK → auth.users  | Null si auteur externe sans compte                 |
| `created_at`  | `timestamptz` | default now()    |                                                    |

---

### `articles`

| Colonne              | Type            | Contraintes      | Description                                               |
|---------------------|-----------------|------------------|-----------------------------------------------------------|
| `id`                | `uuid`          | PK               |                                                           |
| `slug`              | `text`          | UNIQUE, NOT NULL | kebab-case, jamais modifié après publication              |
| `type`              | `text`          | NOT NULL         | `'short'` ou `'long'`                                    |
| `status`            | `text`          | NOT NULL         | `'draft'`, `'published'`, `'archived'`                   |
| `category_id`       | `uuid`          | FK → categories  |                                                           |
| `title`             | `text`          | NOT NULL         |                                                           |
| `summary`           | `text`          | NOT NULL         | Résumé feed (150–300 chars)                               |
| `cover_image_url`   | `text`          |                  | URL Cloudinary                                            |
| `cover_image_alt`   | `text`          |                  | Alt text obligatoire si image présente                    |
| `content`           | `jsonb`         | NOT NULL         | Tableau de `ContentBlock[]`                               |
| `sources`           | `jsonb`         | default `[]`     | `[{ label, url, doi? }]` — sources citables inline        |
| `layout_preset`     | `text`          |                  | `'default'`, `'interview'`, … (à définir)                 |
| `word_count`        | `int`           | default 0        | Calculé à la sauvegarde                                   |
| `reading_time_min`  | `int`           | default 1        | word_count / 200, arrondi au supérieur                    |
| `view_count`        | `int`           | default 0        | Incrémenté à chaque vue — filtre "Populaire"              |
| `embedding`         | `vector(1536)`  |                  | Vecteur OpenAI — similarité pour recommandations          |
| `seo_title`         | `text`          |                  | Titre SEO (≤ 60 chars)                                    |
| `seo_description`   | `text`          |                  | Meta description (≤ 155 chars)                            |
| `og_image_url`      | `text`          |                  | Image Open Graph (1200×630)                               |
| `last_updated_note` | `text`          |                  | Note de révision affichée publiquement ex: "Mis à jour : ajout des données 2025" |
| `scheduled_at`      | `timestamptz`   |                  | Publication différée — null = publication immédiate       |
| `published_at`      | `timestamptz`   |                  | Null si draft                                             |
| `created_at`        | `timestamptz`   | default now()    |                                                           |
| `updated_at`        | `timestamptz`   | default now()    | Mis à jour via trigger                                    |
| `created_by`        | `uuid`          | FK → auth.users  |                                                           |

---

### `article_authors` (N:N)

| Colonne      | Type   | Contraintes                      |
|-------------|--------|----------------------------------|
| `article_id`| `uuid` | FK → articles, ON DELETE CASCADE |
| `author_id` | `uuid` | FK → authors, ON DELETE RESTRICT |
| `order`     | `int`  | default 0                        |

PK composite : `(article_id, author_id)`

---

### `article_tags` (N:N)

| Colonne      | Type   | Contraintes                      |
|-------------|--------|----------------------------------|
| `article_id`| `uuid` | FK → articles, ON DELETE CASCADE |
| `tag_id`    | `uuid` | FK → tags, ON DELETE CASCADE     |

PK composite : `(article_id, tag_id)`

---

### `article_series` (N:1 — un article appartient à une seule série)

| Colonne      | Type   | Contraintes                       | Description                    |
|-------------|--------|-----------------------------------|--------------------------------|
| `article_id`| `uuid` | PK, FK → articles, ON DELETE CASCADE |                            |
| `series_id` | `uuid` | FK → series, ON DELETE CASCADE    |                                |
| `order`     | `int`  | NOT NULL                          | Position dans la série (1, 2…) |

---

### `watch_events`

Traque le temps de lecture réel de manière anonyme. Jamais de données personnelles.

| Colonne        | Type          | Contraintes      | Description                                   |
|---------------|---------------|------------------|-----------------------------------------------|
| `id`          | `uuid`        | PK, default gen  |                                               |
| `article_id`  | `uuid`        | FK → articles, ON DELETE CASCADE |                               |
| `session_id`  | `text`        | NOT NULL         | Identifiant de session anonyme (cookie)       |
| `duration_sec`| `int`         | NOT NULL         | Temps actif sur la page en secondes           |
| `scroll_depth`| `int`         | NOT NULL         | Profondeur de scroll en % (0–100)             |
| `created_at`  | `timestamptz` | default now()    |                                               |

---

## Marks inline

| mark            | Rendu               |
|----------------|---------------------|
| `bold`         | `<strong>`          |
| `underline`    | UI custom           |
| `strikethrough`| `<s>`               |
| `link`         | UI custom (pas `<a>` standard) |
| `citation`     | `[n]` superscript avec tooltip → `article.sources[n]` |

---

## Types de blocs (`ContentBlock`)

| type             | Description                                         |
|-----------------|-----------------------------------------------------|
| `heading`       | H1 — un seul par article, texte plat               |
| `subheading`    | H2/H3 avec `anchor` stable                         |
| `paragraph`     | Texte riche (RichText)                              |
| `quote`         | Citation + attribution optionnelle                  |
| `bullet-list`   | Items en RichText                                   |
| `key-takeaways` | Points "À retenir" — texte plat                    |
| `callout`       | Encadré typé : `key-concept`, `warning`, `anecdote` |
| `equation`      | LaTeX via KaTeX, `display` block ou inline          |
| `code`          | Code + langage + filename optionnel, via Shiki      |
| `image`         | Cloudinary, alt obligatoire                         |
| `video`         | YouTube/Vimeo via videoId                           |
| `divider`       | Séparateur visuel                                   |

---

## Politiques RLS

```sql
-- Articles : lecture publique des publiés uniquement
CREATE POLICY "public_read_published" ON articles
  FOR SELECT USING (status = 'published');

-- Tables de référence : lecture publique
CREATE POLICY "public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read" ON tags FOR SELECT USING (true);
CREATE POLICY "public_read" ON series FOR SELECT USING (true);
CREATE POLICY "public_read" ON authors FOR SELECT USING (true);
CREATE POLICY "public_read" ON article_authors FOR SELECT USING (true);
CREATE POLICY "public_read" ON article_tags FOR SELECT USING (true);
CREATE POLICY "public_read" ON article_series FOR SELECT USING (true);

-- watch_events : insert public (anonyme), lecture admin uniquement
CREATE POLICY "public_insert_watch" ON watch_events
  FOR INSERT WITH CHECK (true);

-- Admin : accès total sur tout
CREATE POLICY "admin_all" ON articles
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Triggers

```sql
-- updated_at automatique sur articles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Incrémente view_count via une fonction dédiée (appelée depuis une API Route)
-- On n'expose pas un UPDATE direct sur articles à l'anonyme
CREATE OR REPLACE FUNCTION increment_view_count(article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE articles SET view_count = view_count + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Index

```sql
-- Articles
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_view_count ON articles(view_count DESC);

-- Similarité vectorielle (ivfflat — bon compromis perf/précision)
CREATE INDEX idx_articles_embedding ON articles
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Jonctions
CREATE INDEX idx_article_authors_article ON article_authors(article_id);
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX idx_article_series_series ON article_series(series_id);

-- Watch events
CREATE INDEX idx_watch_events_article ON watch_events(article_id);
```
