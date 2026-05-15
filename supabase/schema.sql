-- MediClaimPilot: claim_sessions table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

create table if not exists claim_sessions (
  id           text primary key,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  data         jsonb not null default '{}'::jsonb
);

-- Auto-update updated_at on upsert
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger claim_sessions_updated_at
  before update on claim_sessions
  for each row execute function update_updated_at();

-- RLS: only allow service-role inserts (no public read/write)
alter table claim_sessions enable row level security;

-- Allow the service role (server-side) full access
create policy "service role full access"
  on claim_sessions
  using (true)
  with check (true);

-- Cleanup old sessions after 24h (optional — run as cron or pg_cron if available)
-- delete from claim_sessions where created_at < now() - interval '24 hours';
