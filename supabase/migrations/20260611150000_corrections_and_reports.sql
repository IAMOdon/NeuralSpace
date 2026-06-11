-- Pack crédibilité : corrections visibles + signalements d'erreurs lecteurs.

-- Corrections datées, affichées publiquement sous l'article.
-- Format : [{ "date": "2026-06-11T...", "note": "..." }]
alter table articles
  add column corrections jsonb not null default '[]'::jsonb;

-- Signalements d'erreurs (privés) — file de relecture pour la rédaction.
create table article_reports (
  id             uuid primary key default gen_random_uuid(),
  article_id     uuid not null references articles(id) on delete cascade,
  quote          text,             -- passage concerné (optionnel, max 500 côté API)
  message        text not null,    -- description de l'erreur
  source_url     text,             -- source proposée par le lecteur (optionnel)
  reporter_email text,             -- optionnel — uniquement si le lecteur veut être recontacté
  status         text not null default 'new' check (status in ('new', 'accepted', 'rejected')),
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

create index article_reports_status_idx on article_reports(status, created_at desc);
create index article_reports_article_idx on article_reports(article_id);

-- RLS on, aucune policy publique — écriture via l'API rate-limitée (service
-- role), lecture admin uniquement.
alter table article_reports enable row level security;
