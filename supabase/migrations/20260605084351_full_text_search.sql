-- ── Full-text search on articles ────────────────────────────────────────────
-- Uses PostgreSQL French dictionary for stemming (plurals, conjugations, accents)
-- search_vector is a STORED generated column → always up to date, indexed via GIN

alter table articles
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('french',
      coalesce(title, '')       || ' ' ||
      coalesce(summary, '')     || ' ' ||
      coalesce(seo_title, '')   || ' ' ||
      coalesce(seo_description, '')
    )
  ) stored;

create index if not exists articles_search_vector_gin
  on articles using gin(search_vector);

-- ── search_articles(query, max_results) ──────────────────────────────────────
-- Called from /api/search with a pre-built tsquery string.
-- Falls back to ILIKE when no tsvector match (very short queries, typos).

create or replace function search_articles(
  query       text,
  max_results int default 10
)
returns table(
  id           uuid,
  title        text,
  slug         text,
  status       text,
  published_at timestamptz,
  view_count   int,
  summary      text,
  rank         real
)
language plpgsql stable security definer as $$
declare
  tsq tsquery;
begin
  -- Try to parse the incoming tsquery string (already built by TypeScript)
  begin
    tsq := to_tsquery('french', query);
  exception when others then
    tsq := null;
  end;

  return query
  select
    a.id,
    a.title,
    a.slug,
    a.status,
    a.published_at,
    a.view_count,
    a.summary,
    case
      when tsq is not null then ts_rank(a.search_vector, tsq)
      else 0.0
    end as rank
  from articles a
  where
    (tsq is not null and a.search_vector @@ tsq)
    or a.title   ilike '%' || query || '%'
    or a.summary ilike '%' || query || '%'
  order by
    rank desc,
    a.published_at desc nulls last
  limit max_results;
end;
$$;
