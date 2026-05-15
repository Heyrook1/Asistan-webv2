-- Run this in Supabase SQL Editor

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  user_id uuid null references public.users(id) on delete set null,
  full_name text not null,
  email text not null,
  role text not null check (role in ('Super Admin','Isletme Sahibi','Doktor','Sekreter','Personel')),
  status text not null default 'active' check (status in ('active','inactive')),
  permissions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  last_active_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists team_members_provider_email_uidx
  on public.team_members(provider_id, email);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  actor_id uuid null references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  details jsonb null,
  created_at timestamptz not null default now()
);

alter table public.team_members enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists team_members_provider_access on public.team_members;
create policy team_members_provider_access on public.team_members
for all
using (
  provider_id in (select id from public.providers where user_id = auth.uid())
)
with check (
  provider_id in (select id from public.providers where user_id = auth.uid())
);

drop policy if exists activity_logs_provider_access on public.activity_logs;
create policy activity_logs_provider_access on public.activity_logs
for all
using (
  provider_id in (select id from public.providers where user_id = auth.uid())
)
with check (
  provider_id in (select id from public.providers where user_id = auth.uid())
);
