-- ----------------------------------------------------------------
-- 1. article_views — lightweight, no consent required
-- ----------------------------------------------------------------
create table article_views (
  id             uuid primary key default gen_random_uuid(),
  article_id     uuid not null references articles(id) on delete cascade,
  session_id     text,
  referrer_source text,  -- 'google_organic' | 'twitter' | 'instagram' | 'direct' | 'other'
  device         text,  -- 'mobile' | 'tablet' | 'desktop'
  country_code   text,  -- 'FR' | 'BE' | 'CA' ...
  hour_of_day    int,   -- 0–23
  day_of_week    int,   -- 0 (sun) – 6 (sat)
  created_at     timestamptz default now()
);

-- ----------------------------------------------------------------
-- 2. Enrich watch_events with new signals
-- ----------------------------------------------------------------
alter table watch_events
  add column if not exists referrer_source text,
  add column if not exists device         text,
  add column if not exists country_code   text,
  add column if not exists read_completed boolean default false,
  add column if not exists word_lookups   int default 0,
  add column if not exists source_clicks  int default 0,
  add column if not exists hour_of_day    int,
  add column if not exists day_of_week    int,
  add column if not exists utm_params     jsonb default '{}'::jsonb;

-- ----------------------------------------------------------------
-- 3. session_interests — interest scores per category/tag
-- ----------------------------------------------------------------
create table session_interests (
  session_id  text not null,
  entity_type text not null check (entity_type in ('category', 'tag')),
  entity_id   uuid not null,
  score       int  not null default 0,
  updated_at  timestamptz default now(),
  primary key (session_id, entity_type, entity_id)
);

-- ----------------------------------------------------------------
-- 4. session_profiles — aggregated reader portrait
-- ----------------------------------------------------------------
create table session_profiles (
  session_id          text primary key,
  articles_read       int  default 0,
  quality_reads       int  default 0,   -- scroll>80% + duration>120s
  total_duration_sec  int  default 0,
  preferred_format    text,             -- 'short' | 'long' | 'balanced'
  expertise_signal    float,            -- 0=expert, 1=novice (word lookup ratio)
  top_category_id     uuid references categories(id) on delete set null,
  word_lookups_total  int  default 0,
  source_clicks_total int  default 0,
  country_code        text,
  device              text,
  first_seen          timestamptz default now(),
  last_seen           timestamptz default now()
);

-- ----------------------------------------------------------------
-- 5. content_analytics — weekly aggregates per article (admin panel)
-- ----------------------------------------------------------------
create table content_analytics (
  id                  uuid primary key default gen_random_uuid(),
  article_id          uuid not null references articles(id) on delete cascade,
  week_start          date not null,
  total_views         int  default 0,
  unique_sessions     int  default 0,
  quality_reads       int  default 0,
  avg_completion_rate float,
  avg_duration_sec    float,
  expert_reader_pct   float,
  mobile_pct          float,
  top_referrer        text,
  top_country         text,
  unique (article_id, week_start)
);

-- ----------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------
alter table article_views      enable row level security;
alter table session_interests  enable row level security;
alter table session_profiles   enable row level security;
alter table content_analytics  enable row level security;

-- article_views: public insert (no consent needed), admin read
create policy "public_insert_view" on article_views
  for insert with check (true);

-- session_interests: public upsert (with consent), admin read
create policy "public_upsert_interests" on session_interests
  for all with check (true);

-- session_profiles: public upsert (with consent), admin read
create policy "public_upsert_profiles" on session_profiles
  for all with check (true);

-- content_analytics: admin only
create policy "admin_all" on content_analytics
  for all using ((auth.jwt() ->> 'role') = 'admin');

-- ----------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------
create index idx_article_views_article    on article_views(article_id);
create index idx_article_views_created    on article_views(created_at desc);
create index idx_article_views_country    on article_views(country_code);
create index idx_session_interests_session on session_interests(session_id);
create index idx_session_profiles_country  on session_profiles(country_code);
create index idx_content_analytics_article on content_analytics(article_id, week_start desc);

-- ----------------------------------------------------------------
-- Helper: update session profile after each watch event
-- ----------------------------------------------------------------
create or replace function upsert_session_profile(
  p_session_id        text,
  p_duration_sec      int,
  p_read_completed    boolean,
  p_word_lookups      int,
  p_source_clicks     int,
  p_device            text,
  p_country_code      text,
  p_format            text  -- 'short' | 'long'
) returns void as $$
declare
  v_quality boolean := p_read_completed and p_duration_sec >= 120;
begin
  insert into session_profiles (
    session_id, articles_read, quality_reads,
    total_duration_sec, word_lookups_total,
    source_clicks_total, device, country_code,
    preferred_format, first_seen, last_seen
  ) values (
    p_session_id, 1,
    case when v_quality then 1 else 0 end,
    p_duration_sec, p_word_lookups, p_source_clicks,
    p_device, p_country_code, p_format,
    now(), now()
  )
  on conflict (session_id) do update set
    articles_read      = session_profiles.articles_read + 1,
    quality_reads      = session_profiles.quality_reads + (case when v_quality then 1 else 0 end),
    total_duration_sec = session_profiles.total_duration_sec + p_duration_sec,
    word_lookups_total = session_profiles.word_lookups_total + p_word_lookups,
    source_clicks_total= session_profiles.source_clicks_total + p_source_clicks,
    last_seen          = now(),
    preferred_format   = case
      when p_format = 'short' and session_profiles.preferred_format = 'long' then 'balanced'
      when p_format = 'long'  and session_profiles.preferred_format = 'short' then 'balanced'
      else coalesce(p_format, session_profiles.preferred_format)
    end;
end;
$$ language plpgsql security definer;
