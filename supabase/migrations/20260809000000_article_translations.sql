-- Traductions IA des articles.
--
-- L'article source (français) reste la seule source de vérité : rien n'est
-- écrasé. Chaque locale vit dans sa propre ligne, avec son slug, ses métadonnées
-- SEO et ses deux versions de contenu.
--
-- Le pipeline n'écrit jamais la structure des blocs : seules les chaînes
-- traduisibles sont extraites puis réinjectées côté application
-- (lib/i18n/extract.ts), donc les identifiants de blocs, indices de citation,
-- LaTeX, code et URLs sont préservés par construction.

create table article_translations (
  article_id  uuid not null references articles(id) on delete cascade,
  locale      text not null,

  -- Slug localisé : l'URL de lecture dans cette langue. Peut contenir des
  -- caractères non latins (lib/slug.ts slugifyLocalized).
  slug        text not null,

  title       text not null,
  summary     text not null,
  seo_title       text,
  seo_description text,
  cover_image_alt text,

  content_simplified jsonb,
  content_scientific jsonb,

  -- Empreinte du contenu source au moment de la traduction. Quand l'article est
  -- modifié après publication, seules les locales dont l'empreinte ne
  -- correspond plus sont remises en file.
  source_hash text not null,

  status   text not null default 'pending'
             check (status in ('pending', 'running', 'ready', 'failed')),
  error    text,           -- dernier message d'échec, pour le tableau de bord
  attempts int  not null default 0,
  model    text,           -- modèle exact utilisé, pour la reproductibilité

  translated_at timestamptz,
  created_at    timestamptz not null default now(),

  primary key (article_id, locale)
);

-- Une URL ne peut désigner qu'un seul article dans une langue donnée.
create unique index article_translations_locale_slug_idx
  on article_translations (locale, slug);

-- File d'attente : le cron réclame les lignes les plus anciennes d'abord.
create index article_translations_queue_idx
  on article_translations (status, created_at)
  where status in ('pending', 'running');

-- Permet d'exclure un article du pipeline (contenu sensible, article daté,
-- brouillon qu'on ne veut pas diffuser hors du français).
alter table articles
  add column translations_enabled boolean not null default true;

alter table article_translations enable row level security;

-- Lecture publique des seules traductions abouties, et seulement si l'article
-- source est publié — une traduction ne peut pas révéler un brouillon.
-- Les écritures passent par le client service role (RLS contournée), comme pour
-- le reste du pipeline éditorial.
create policy "public_read_ready" on article_translations
  for select using (
    status = 'ready'
    and exists (
      select 1 from articles a
      where a.id = article_translations.article_id
        and a.status = 'published'
    )
  );
