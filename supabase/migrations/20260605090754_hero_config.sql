-- Single-row table — id is always 'singleton'
create table hero_config (
  id         text primary key default 'singleton',
  type       text not null default 'none'
             check (type in ('none', 'live', 'news', 'player')),
  config     jsonb not null default '{}',
  updated_at timestamptz default now(),
  updated_by text  -- email de l'admin qui a fait la dernière modif
);

insert into hero_config (id, type, config)
values ('singleton', 'none', '{}')
on conflict (id) do nothing;

alter table hero_config enable row level security;

-- Lecture publique — nécessaire pour le feed (server component anon)
create policy "public_read" on hero_config
  for select using (true);

-- Écriture réservée aux utilisateurs authentifiés (admins)
create policy "admin_write" on hero_config
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
