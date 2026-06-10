-- Waitlist for the Coherence product (screen-aware AI assistant).
create table coherence_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,             -- where the signup came from (e.g. 'coherence_page')
  user_agent text,
  country    text,
  created_at timestamptz not null default now()
);

create index coherence_waitlist_created_at_idx on coherence_waitlist(created_at desc);

-- RLS on, no public policies — writes go through the service-role adminClient
-- only (see app/api/coherence/waitlist). Anon/auth clients cannot read or write.
alter table coherence_waitlist enable row level security;
