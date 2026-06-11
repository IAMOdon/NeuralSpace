-- Newsletter subscribers (footer signup) — same pattern as coherence_waitlist.
create table newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,             -- where the signup came from (e.g. 'footer')
  user_agent text,
  country    text,
  created_at timestamptz not null default now()
);

create index newsletter_subscribers_created_at_idx on newsletter_subscribers(created_at desc);

-- RLS on, no public policies — writes go through the service-role adminClient
-- only (see app/api/newsletter). Anon/auth clients cannot read or write.
alter table newsletter_subscribers enable row level security;
