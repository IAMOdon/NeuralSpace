-- Authorization, not authentication.
--
-- Every admin gate in the app used to test "is there a Supabase session", which
-- is not an authorization decision: the project accepts self-service signup, so
-- any stranger who registered became a CMS admin. The RLS policies meanwhile
-- tested `(auth.jwt() ->> 'role') = 'admin'` — a claim Supabase never issues
-- (it is always 'authenticated'), so those policies never granted anything and
-- never denied anything either, because every write went through the
-- service-role client that bypasses RLS entirely.
--
-- Admin rights now come from explicit membership in this table.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A signed-in user may read only their own membership row, which is what lets
-- the request-scoped (RLS-respecting) client answer "am I an admin?" without
-- the service-role key. There is deliberately no insert/update/delete policy:
-- membership is granted out of band, with the service role or from the SQL
-- editor, so a compromised session can never promote itself.
drop policy if exists "read_own_admin_row" on public.admins;
create policy "read_own_admin_row" on public.admins
  for select using (user_id = auth.uid());

-- SECURITY DEFINER so the policies below can call it without recursing back
-- into admins' own row-level policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- Point the existing admin policies at real membership. They keep their name so
-- the intent stays readable next to the original schema.
drop policy if exists "admin_all" on public.articles;
create policy "admin_all" on public.articles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all" on public.categories;
create policy "admin_all" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all" on public.tags;
create policy "admin_all" on public.tags
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all" on public.series;
create policy "admin_all" on public.series
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all" on public.authors;
create policy "admin_all" on public.authors
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin_all" on public.content_analytics;
create policy "admin_all" on public.content_analytics
  for all using (public.is_admin()) with check (public.is_admin());

-- Grant yourself admin after applying this migration, e.g.
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com';
