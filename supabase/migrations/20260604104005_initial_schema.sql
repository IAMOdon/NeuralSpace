-- categories
create table categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  color_hex  text,
  created_at timestamptz default now()
);

-- tags
create table tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  created_at timestamptz default now()
);

-- series
create table series (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  created_at  timestamptz default now()
);

-- authors
create table authors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  role        text,
  institution text,
  bio         text,
  avatar_url  text,
  links       jsonb default '{}'::jsonb,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz default now()
);

-- articles
create table articles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  type               text not null check (type in ('short', 'long')),
  status             text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  category_id        uuid references categories(id) on delete restrict,
  title              text not null,
  summary            text not null,
  cover_image_url    text,
  cover_image_alt    text,
  content            jsonb not null default '[]'::jsonb,
  sources            jsonb not null default '[]'::jsonb,
  layout_preset      text,
  word_count         int not null default 0,
  reading_time_min   int not null default 1,
  view_count         int not null default 0,
  embedding          vector(1536),
  seo_title          text,
  seo_description    text,
  og_image_url       text,
  last_updated_note  text,
  scheduled_at       timestamptz,
  published_at       timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  created_by         uuid references auth.users(id) on delete restrict
);

-- article_authors (N:N)
create table article_authors (
  article_id uuid references articles(id) on delete cascade,
  author_id  uuid references authors(id) on delete restrict,
  "order"    int not null default 0,
  primary key (article_id, author_id)
);

-- article_tags (N:N)
create table article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id     uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- article_series (N:1)
create table article_series (
  article_id uuid primary key references articles(id) on delete cascade,
  series_id  uuid not null references series(id) on delete cascade,
  "order"    int not null
);

-- watch_events (anonymous read tracking)
create table watch_events (
  id           uuid primary key default gen_random_uuid(),
  article_id   uuid not null references articles(id) on delete cascade,
  session_id   text not null,
  duration_sec int not null,
  scroll_depth int not null check (scroll_depth between 0 and 100),
  created_at   timestamptz default now()
);

-- ----------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on articles
  for each row execute function update_updated_at();

-- ----------------------------------------------------------------
-- view_count increment — called from API Route only
-- ----------------------------------------------------------------
create or replace function increment_view_count(p_article_id uuid)
returns void as $$
begin
  update articles set view_count = view_count + 1 where id = p_article_id;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------
-- indexes
-- ----------------------------------------------------------------
create index idx_articles_status       on articles(status);
create index idx_articles_category     on articles(category_id);
create index idx_articles_published_at on articles(published_at desc);
create index idx_articles_slug         on articles(slug);
create index idx_articles_view_count   on articles(view_count desc);

create index idx_article_authors_article on article_authors(article_id);
create index idx_article_tags_article    on article_tags(article_id);
create index idx_article_tags_tag        on article_tags(tag_id);
create index idx_article_series_series   on article_series(series_id);
create index idx_watch_events_article    on watch_events(article_id);

create index idx_articles_embedding on articles
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ----------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------
alter table categories      enable row level security;
alter table tags            enable row level security;
alter table series          enable row level security;
alter table authors         enable row level security;
alter table articles        enable row level security;
alter table article_authors enable row level security;
alter table article_tags    enable row level security;
alter table article_series  enable row level security;
alter table watch_events    enable row level security;

create policy "public_read" on categories      for select using (true);
create policy "public_read" on tags            for select using (true);
create policy "public_read" on series          for select using (true);
create policy "public_read" on authors         for select using (true);
create policy "public_read" on article_authors for select using (true);
create policy "public_read" on article_tags    for select using (true);
create policy "public_read" on article_series  for select using (true);

create policy "public_read_published" on articles
  for select using (status = 'published');

create policy "public_insert_watch" on watch_events
  for insert with check (true);

create policy "admin_all" on articles
  for all using ((auth.jwt() ->> 'role') = 'admin');

create policy "admin_all" on categories
  for all using ((auth.jwt() ->> 'role') = 'admin');

create policy "admin_all" on tags
  for all using ((auth.jwt() ->> 'role') = 'admin');

create policy "admin_all" on series
  for all using ((auth.jwt() ->> 'role') = 'admin');

create policy "admin_all" on authors
  for all using ((auth.jwt() ->> 'role') = 'admin');
