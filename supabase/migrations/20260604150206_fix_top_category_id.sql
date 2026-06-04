-- Accumulate score for a session/category pair (insert or add to existing score).
create or replace function increment_category_interest(
  p_session_id  text,
  p_category_id uuid,
  p_score       int
) returns void as $$
begin
  insert into session_interests (session_id, entity_type, entity_id, score, updated_at)
  values (p_session_id, 'category', p_category_id, p_score, now())
  on conflict (session_id, entity_type, entity_id) do update
    set score      = session_interests.score + excluded.score,
        updated_at = now();
end;
$$ language plpgsql security definer;

-- Recalculate top_category_id on session_profiles after each interest update.
create or replace function refresh_top_category(p_session_id text)
returns void as $$
declare
  v_top_category uuid;
begin
  select entity_id into v_top_category
  from session_interests
  where session_id = p_session_id
    and entity_type = 'category'
  order by score desc
  limit 1;

  update session_profiles
  set top_category_id = v_top_category
  where session_id = p_session_id;
end;
$$ language plpgsql security definer;
