-- ============================================================================
-- Migration: Enable Row Level Security on all tenant tables
-- Date: 2026-05-16
-- ============================================================================
--
-- This migration enforces multi-tenancy at the database layer. Without it,
-- any authenticated user could read/write any clinic's data via supabase-js.
--
-- Key concepts:
-- * `auth.uid()` = the authenticated user calling the request
-- * `is_provider_owner(provider_id)` = user owns this clinic
-- * `is_team_member(provider_id, capability)` = user is a team member
--   with the given capability
-- * Patients can only see their OWN customer/appointment/review records
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper functions (security definer so they can read providers/team_members)
-- ----------------------------------------------------------------------------

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

create or replace function public.is_provider_owner(target_provider_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.providers
    where id = target_provider_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_team_member(
  target_provider_id uuid,
  required_capability text default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    join public.users u on u.id = auth.uid()
    where tm.provider_id = target_provider_id
      and tm.email = u.email
      and tm.is_active = true
      and (
        required_capability is null
        or tm.role in ('Super Admin', 'Isletme Sahibi')
        or tm.permissions ? required_capability
      )
  );
$$;

create or replace function public.can_access_provider(
  target_provider_id uuid,
  required_capability text default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_provider_owner(target_provider_id)
      or public.is_team_member(target_provider_id, required_capability);
$$;

-- ----------------------------------------------------------------------------
-- USERS table
-- ----------------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select using (id = auth.uid());

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Providers can read users that are their customers (via customers table FK)
drop policy if exists users_provider_visibility on public.users;
create policy users_provider_visibility on public.users
  for select using (
    exists (
      select 1
      from public.customers c
      join public.appointments a on a.customer_id = c.id
      where c.user_id = public.users.id
        and public.can_access_provider(a.provider_id, 'manage_customers')
    )
  );

-- ----------------------------------------------------------------------------
-- PROVIDERS
-- ----------------------------------------------------------------------------
alter table public.providers enable row level security;

drop policy if exists providers_public_read on public.providers;
create policy providers_public_read on public.providers
  for select using (is_active = true);

drop policy if exists providers_owner_all on public.providers;
create policy providers_owner_all on public.providers
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- CUSTOMERS (patient profiles)
-- ----------------------------------------------------------------------------
alter table public.customers enable row level security;

drop policy if exists customers_self_select on public.customers;
create policy customers_self_select on public.customers
  for select using (user_id = auth.uid());

drop policy if exists customers_self_update on public.customers;
create policy customers_self_update on public.customers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists customers_provider_access on public.customers;
create policy customers_provider_access on public.customers
  for all using (
    exists (
      select 1 from public.appointments a
      where a.customer_id = public.customers.id
        and public.can_access_provider(a.provider_id, 'manage_customers')
    )
  )
  with check (
    exists (
      select 1 from public.appointments a
      where a.customer_id = public.customers.id
        and public.can_access_provider(a.provider_id, 'manage_customers')
    )
  );

-- ----------------------------------------------------------------------------
-- SERVICES (clinic services / treatments)
-- ----------------------------------------------------------------------------
alter table public.services enable row level security;

drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services
  for select using (is_active = true);

drop policy if exists services_provider_manage on public.services;
create policy services_provider_manage on public.services
  for all
  using (public.can_access_provider(provider_id, 'edit_appointments'))
  with check (public.can_access_provider(provider_id, 'edit_appointments'));

-- ----------------------------------------------------------------------------
-- APPOINTMENTS (the hot path)
-- ----------------------------------------------------------------------------
alter table public.appointments enable row level security;

-- Customers see their own
drop policy if exists appointments_customer_self on public.appointments;
create policy appointments_customer_self on public.appointments
  for select using (
    exists (
      select 1 from public.customers c
      where c.id = public.appointments.customer_id
        and c.user_id = auth.uid()
    )
  );

-- Customers create their own
drop policy if exists appointments_customer_insert on public.appointments;
create policy appointments_customer_insert on public.appointments
  for insert with check (
    exists (
      select 1 from public.customers c
      where c.id = customer_id and c.user_id = auth.uid()
    )
  );

-- Providers/team manage
drop policy if exists appointments_provider_all on public.appointments;
create policy appointments_provider_all on public.appointments
  for all
  using (public.can_access_provider(provider_id, 'view_appointments'))
  with check (public.can_access_provider(provider_id, 'edit_appointments'));

-- ----------------------------------------------------------------------------
-- CALENDAR_AVAILABILITY + CALENDAR_BLOCKS
-- ----------------------------------------------------------------------------
alter table public.calendar_availability enable row level security;
alter table public.calendar_blocks enable row level security;

drop policy if exists availability_public_read on public.calendar_availability;
create policy availability_public_read on public.calendar_availability
  for select using (true);

drop policy if exists availability_provider_manage on public.calendar_availability;
create policy availability_provider_manage on public.calendar_availability
  for all
  using (public.can_access_provider(provider_id, 'edit_appointments'))
  with check (public.can_access_provider(provider_id, 'edit_appointments'));

drop policy if exists blocks_provider_manage on public.calendar_blocks;
create policy blocks_provider_manage on public.calendar_blocks
  for all
  using (public.can_access_provider(provider_id, 'edit_appointments'))
  with check (public.can_access_provider(provider_id, 'edit_appointments'));

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS (user-scoped)
-- ----------------------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists notifications_self on public.notifications;
create policy notifications_self on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- REVIEWS (public read for active, customer can write own)
-- ----------------------------------------------------------------------------
alter table public.reviews enable row level security;

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select using (is_visible = true);

drop policy if exists reviews_customer_write on public.reviews;
create policy reviews_customer_write on public.reviews
  for insert with check (
    exists (
      select 1 from public.customers c
      where c.id = customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists reviews_customer_update_own on public.reviews;
create policy reviews_customer_update_own on public.reviews
  for update using (
    exists (
      select 1 from public.customers c
      where c.id = customer_id and c.user_id = auth.uid()
    )
  );

drop policy if exists reviews_provider_respond on public.reviews;
create policy reviews_provider_respond on public.reviews
  for update using (public.can_access_provider(provider_id, 'view_appointments'))
  with check (public.can_access_provider(provider_id, 'view_appointments'));

-- ----------------------------------------------------------------------------
-- CATEGORIES + SPECIALTIES (publicly readable)
-- ----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.specialties enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (is_active = true);

drop policy if exists specialties_public_read on public.specialties;
create policy specialties_public_read on public.specialties
  for select using (is_active = true);

-- ----------------------------------------------------------------------------
-- TEAM_MEMBERS (already has policy from earlier migration; reinforced here)
-- ----------------------------------------------------------------------------
alter table public.team_members enable row level security;

drop policy if exists team_members_provider_access on public.team_members;
create policy team_members_provider_access on public.team_members
  for all
  using (public.is_provider_owner(provider_id) or public.is_team_member(provider_id, 'manage_team'))
  with check (public.is_provider_owner(provider_id) or public.is_team_member(provider_id, 'manage_team'));

-- Self-read so members can see their own row
drop policy if exists team_members_self_read on public.team_members;
create policy team_members_self_read on public.team_members
  for select using (
    email = (select email from public.users where id = auth.uid())
  );
