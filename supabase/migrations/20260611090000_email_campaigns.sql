-- Email campaigns (newsletter builder) + unsubscribe support.

-- Per-subscriber unsubscribe token (required in every email footer — RGPD/CAN-SPAM)
alter table newsletter_subscribers
  add column unsubscribe_token uuid not null default gen_random_uuid() unique,
  add column unsubscribed_at   timestamptz;

create index newsletter_subscribers_active_idx
  on newsletter_subscribers(created_at desc)
  where unsubscribed_at is null;

-- Campaigns: subject + preheader + ordered JSON blocks (see types/email.ts).
create table email_campaigns (
  id              uuid primary key default gen_random_uuid(),
  subject         text not null default '',
  preheader       text not null default '',
  blocks          jsonb not null default '[]'::jsonb,
  status          text not null default 'draft' check (status in ('draft', 'sent')),
  audience        text not null default 'newsletter' check (audience in ('newsletter', 'coherence_waitlist')),
  sent_at         timestamptz,
  recipient_count integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index email_campaigns_updated_at_idx on email_campaigns(updated_at desc);

-- RLS on, no public policies — service-role adminClient only (admin actions).
alter table email_campaigns enable row level security;
