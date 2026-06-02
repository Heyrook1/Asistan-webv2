-- ============================================================================
-- Migration: Core schema for Asistan
-- Date: 2026-05-16
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id text primary key default gen_random_uuid(),
  email citext not null unique,
  full_name text null,
  phone text null unique,
  avatar_url text null,
  role text not null default 'customer' check (role in ('customer', 'provider', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key default gen_random_uuid(),
  name text not null unique,
  name_tr text null,
  description text null,
  icon text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.specialties (
  id text primary key default gen_random_uuid(),
  category_id text null references public.categories(id) on delete set null,
  name text not null unique,
  name_tr text null,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.providers (
  id text primary key default gen_random_uuid(),
  user_id text not null unique references public.users(id) on delete cascade,
  business_name text not null,
  business_description text null,
  category_id text null references public.categories(id) on delete set null,
  specialty_id text null references public.specialties(id) on delete set null,
  address text null,
  city text null,
  district text null,
  latitude numeric(10, 7) null,
  longitude numeric(10, 7) null,
  phone text null,
  website text null,
  instagram text null,
  working_hours jsonb null,
  average_rating numeric(3, 2) not null default 0,
  total_reviews integer not null default 0,
  total_appointments integer not null default 0,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key default gen_random_uuid(),
  user_id text not null unique references public.users(id) on delete cascade,
  date_of_birth date null,
  gender text null check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  address text null,
  city text null,
  notes text null,
  total_appointments integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id text primary key default gen_random_uuid(),
  provider_id text not null references public.providers(id) on delete cascade,
  name text not null,
  description text null,
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  price numeric(12, 2) not null default 0 check (price >= 0),
  currency text not null default 'TRY' check (currency in ('TRY', 'USD', 'EUR')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_id, name)
);

create table if not exists public.calendar_availability (
  id text primary key default gen_random_uuid(),
  provider_id text not null references public.providers(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time),
  unique(provider_id, day_of_week, start_time, end_time)
);

create table if not exists public.calendar_blocks (
  id text primary key default gen_random_uuid(),
  provider_id text not null references public.providers(id) on delete cascade,
  block_date date not null,
  start_time time null,
  end_time time null,
  is_full_day boolean not null default false,
  reason text null,
  created_at timestamptz not null default now(),
  check ((is_full_day = true and start_time is null and end_time is null) or (is_full_day = false and start_time is not null and end_time is not null and end_time > start_time))
);

create table if not exists public.appointments (
  id text primary key default gen_random_uuid(),
  provider_id text not null references public.providers(id) on delete cascade,
  customer_id text not null references public.customers(id) on delete cascade,
  service_id text not null references public.services(id) on delete restrict,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'requested' check (
    status in (
      'requested',
      'pending_provider_approval',
      'confirmed',
      'rejected',
      'reschedule_requested',
      'cancelled_by_customer',
      'cancelled_by_provider',
      'completed',
      'no_show',
      'expired'
    )
  ),
  price numeric(12, 2) not null default 0,
  currency text not null default 'TRY' check (currency in ('TRY', 'USD', 'EUR')),
  notes text null,
  customer_notes text null,
  provider_notes text null,
  cancelled_by text null references public.users(id) on delete set null,
  cancellation_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.appointment_status_history (
  id text primary key default gen_random_uuid(),
  appointment_id text not null references public.appointments(id) on delete cascade,
  old_status text null,
  new_status text not null,
  changed_by text null references public.users(id) on delete set null,
  notes text null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  type text not null check (
    type in (
      'appointment_requested',
      'appointment_confirmed',
      'appointment_rejected',
      'appointment_cancelled',
      'appointment_completed',
      'appointment_reminder',
      'review_received',
      'system'
    )
  ),
  title text not null,
  message text not null,
  data jsonb null,
  is_read boolean not null default false,
  read_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key default gen_random_uuid(),
  appointment_id text not null unique references public.appointments(id) on delete cascade,
  provider_id text not null references public.providers(id) on delete cascade,
  customer_id text not null references public.customers(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text null,
  provider_response text null,
  responded_at timestamptz null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_role_idx on public.users(role);
create index if not exists users_active_idx on public.users(is_active);

create index if not exists providers_active_idx on public.providers(is_active);
create index if not exists providers_category_idx on public.providers(category_id);
create index if not exists providers_specialty_idx on public.providers(specialty_id);
create index if not exists providers_city_idx on public.providers(city);

create index if not exists services_provider_active_idx on public.services(provider_id, is_active);
create index if not exists customers_active_idx on public.customers(is_active);

create index if not exists availability_provider_day_idx
  on public.calendar_availability(provider_id, day_of_week);

create index if not exists blocks_provider_date_idx
  on public.calendar_blocks(provider_id, block_date);

create index if not exists appointments_provider_date_idx
  on public.appointments(provider_id, appointment_date, start_time);
create index if not exists appointments_customer_date_idx
  on public.appointments(customer_id, appointment_date desc);
create index if not exists appointments_status_idx
  on public.appointments(status);

create index if not exists notification_user_read_idx
  on public.notifications(user_id, is_read, created_at desc);

create index if not exists reviews_provider_created_idx
  on public.reviews(provider_id, created_at desc);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_providers_updated_at on public.providers;
create trigger trg_providers_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists trg_availability_updated_at on public.calendar_availability;
create trigger trg_availability_updated_at
  before update on public.calendar_availability
  for each row execute function public.set_updated_at();

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create or replace function public.log_appointment_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.appointment_status_history(appointment_id, old_status, new_status, changed_by)
    values (new.id, null, new.status, auth.uid());
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.appointment_status_history(appointment_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_appointments_status_history on public.appointments;
create trigger trg_appointments_status_history
  after insert or update on public.appointments
  for each row execute function public.log_appointment_status_change();
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
  id text primary key default gen_random_uuid(),
  provider_id text not null references public.providers(id) on delete cascade,
  user_id text null references public.users(id) on delete set null,
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
  id text primary key default gen_random_uuid(),
  provider_id text not null references public.providers(id) on delete cascade,
  actor_id text null references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text null,
  details jsonb null,
  created_at timestamptz not null default now()
);

create or replace function public.is_provider_owner(target_provider_id text)
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
  target_provider_id text,
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
  target_provider_id text,
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
-- ============================================================================
-- Migration: KVKK compliance — audit logs + consent tracking + soft-delete
-- Date: 2026-05-16
-- ============================================================================
-- KVKK (Türkiye Kişisel Verilerin Korunması Kanunu) requires:
--   * Açık rıza (explicit consent) tracked with timestamp + IP + version
--   * Audit trail of who accessed/modified personal data
--   * Right to deletion (soft-delete preferred, hard-delete on request)
--   * Data retention policy enforcement
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USER_CONSENTS — record each consent action
-- ----------------------------------------------------------------------------
create table if not exists public.user_consents (
  id text primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  consent_type text not null check (consent_type in (
    'terms_of_service',
    'privacy_policy',
    'kvkk_explicit',
    'marketing_emails',
    'marketing_sms',
    'data_sharing_third_party',
    'health_data_processing'
  )),
  version text not null,
  granted boolean not null,
  ip_address inet null,
  user_agent text null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz null
);

create index if not exists user_consents_user_idx on public.user_consents(user_id);
create index if not exists user_consents_type_idx on public.user_consents(consent_type);

alter table public.user_consents enable row level security;

drop policy if exists user_consents_self on public.user_consents;
create policy user_consents_self on public.user_consents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- ACTIVITY_LOGS — extend existing table with severity + table tracking
-- ----------------------------------------------------------------------------
alter table public.activity_logs
  add column if not exists severity text not null default 'info'
    check (severity in ('debug', 'info', 'warn', 'error', 'critical')),
  add column if not exists ip_address inet null,
  add column if not exists user_agent text null;

create index if not exists activity_logs_provider_created_idx
  on public.activity_logs(provider_id, created_at desc);
create index if not exists activity_logs_actor_idx
  on public.activity_logs(actor_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Generic logger function (call from server actions)
-- ----------------------------------------------------------------------------
create or replace function public.log_activity(
  p_provider_id text,
  p_action text,
  p_entity_type text,
  p_entity_id text default null,
  p_details jsonb default null,
  p_severity text default 'info'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  log_id text;
begin
  insert into public.activity_logs (
    provider_id, actor_id, action, entity_type, entity_id, details, severity
  ) values (
    p_provider_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_details, p_severity
  )
  returning id into log_id;
  return log_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- Soft-delete columns on personal-data tables
-- ----------------------------------------------------------------------------
alter table public.customers     add column if not exists deleted_at timestamptz null;
alter table public.appointments  add column if not exists deleted_at timestamptz null;
alter table public.users         add column if not exists deleted_at timestamptz null;

create index if not exists customers_active_idx    on public.customers(id) where deleted_at is null;
create index if not exists appointments_active_idx on public.appointments(id) where deleted_at is null;

-- ----------------------------------------------------------------------------
-- Audit trigger: log every mutation on sensitive tables
-- ----------------------------------------------------------------------------
create or replace function public.audit_trigger_func()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider_id text;
  v_action text;
begin
  v_action := lower(tg_op);  -- insert / update / delete

  -- Resolve provider_id depending on table
  if tg_table_name = 'appointments' then
    v_provider_id := coalesce(new.provider_id, old.provider_id);
  elsif tg_table_name = 'services' then
    v_provider_id := coalesce(new.provider_id, old.provider_id);
  elsif tg_table_name = 'customers' then
    -- Pick first appointment's provider as best-effort
    select a.provider_id into v_provider_id
    from public.appointments a
    where a.customer_id = coalesce(new.id, old.id)
    limit 1;
  end if;

  if v_provider_id is null then
    return coalesce(new, old);
  end if;

  insert into public.activity_logs (provider_id, actor_id, action, entity_type, entity_id, details, severity)
  values (
    v_provider_id,
    auth.uid(),
    v_action || '_' || tg_table_name,
    tg_table_name,
    coalesce(new.id, old.id),
    jsonb_build_object(
      'old', case when tg_op = 'INSERT' then null else to_jsonb(old) end,
      'new', case when tg_op = 'DELETE' then null else to_jsonb(new) end
    ),
    case when tg_op = 'DELETE' then 'warn' else 'info' end
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_audit_appointments on public.appointments;
create trigger trg_audit_appointments
  after insert or update or delete on public.appointments
  for each row execute function public.audit_trigger_func();

drop trigger if exists trg_audit_customers on public.customers;
create trigger trg_audit_customers
  after insert or update or delete on public.customers
  for each row execute function public.audit_trigger_func();

drop trigger if exists trg_audit_services on public.services;
create trigger trg_audit_services
  after insert or update or delete on public.services
  for each row execute function public.audit_trigger_func();

-- ----------------------------------------------------------------------------
-- DATA_DELETION_REQUESTS — KVKK "right to be forgotten"
-- ----------------------------------------------------------------------------
create table if not exists public.data_deletion_requests (
  id text primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'completed', 'rejected')),
  reason text null,
  requested_at timestamptz not null default now(),
  processed_at timestamptz null,
  processed_by text null references public.users(id)
);

alter table public.data_deletion_requests enable row level security;

drop policy if exists ddr_self on public.data_deletion_requests;
create policy ddr_self on public.data_deletion_requests
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Admins can read all (for processing)
drop policy if exists ddr_admin_read on public.data_deletion_requests;
create policy ddr_admin_read on public.data_deletion_requests
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );
-- ============================================================================
-- Asistan Health — production core schema (Prisma-managed)
-- Date: 2026-05-18
--
-- Baseline only: apply every file in supabase/migrations in timestamp order to
-- reach the current prisma/schema.prisma shape.
--
-- This migration creates the initial clinical/scheduling baseline tables.
-- Run it as part of the full ordered migration chain on a fresh Supabase
-- project or any Postgres database with the pgcrypto extension.
-- pgcrypto extension). After this, mutations should be performed via Prisma —
-- ============================================================================

create extension if not exists pgcrypto;

-- ── Enums ──────────────────────────────────────────────────────────────────
do $$ begin
  create type "TeamRole" as enum ('SUPER_ADMIN','ISLETME_SAHIBI','DOKTOR','SEKRETER','PERSONEL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "AppointmentStatus" as enum ('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "TreatmentStatus" as enum ('PLANLANDI','DEVAM_EDIYOR','TAMAMLANDI','IPTAL');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "FileCategory" as enum ('TAHLIL','GORUNTU','RECETE','RAPOR','KIMLIK','DIGER');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "NotificationType" as enum ('APPOINTMENT','PATIENT','TEAM','SYSTEM');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "TimelineEventType" as enum (
    'PATIENT_CREATED','PATIENT_UPDATED','NOTE_ADDED','MEDICATION_ADDED',
    'ALLERGY_ADDED','TREATMENT_ADDED','LAB_RESULT_ADDED','FILE_UPLOADED',
    'APPOINTMENT_CREATED','APPOINTMENT_UPDATED','APPOINTMENT_COMPLETED','APPOINTMENT_CANCELLED'
  );
exception when duplicate_object then null; end $$;

-- ── User ───────────────────────────────────────────────────────────────────
create table if not exists "User" (
  "id"        text primary key default gen_random_uuid(),
  "email"     text unique not null,
  "fullName"  text not null,
  "phone"     text,
  "avatarUrl" text,
  "isActive"  boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists "User_email_idx" on "User" ("email");

-- ── Business ───────────────────────────────────────────────────────────────
create table if not exists "Business" (
  "id"           text primary key default gen_random_uuid(),
  "name"         text not null,
  "slug"         text unique not null,
  "ownerUserId"  text unique not null references "User"("id") on delete restrict,
  "description"  text,
  "phone"        text,
  "email"        text,
  "address"      text,
  "city"         text,
  "logoUrl"      text,
  "primaryColor" text not null default '#12C8AD',
  "currency"     text not null default 'TRY',
  "timezone"     text not null default 'Europe/Istanbul',
  "isActive"     boolean not null default true,
  "createdAt"    timestamptz not null default now(),
  "updatedAt"    timestamptz not null default now()
);
create index if not exists "Business_slug_idx" on "Business" ("slug");

-- ── TeamMember ─────────────────────────────────────────────────────────────
create table if not exists "TeamMember" (
  "id"          text primary key default gen_random_uuid(),
  "businessId"  text not null references "Business"("id") on delete cascade,
  "userId"      text references "User"("id") on delete set null,
  "fullName"    text not null,
  "email"       text not null,
  "phone"       text,
  "role"        "TeamRole" not null default 'PERSONEL',
  "permissions" text[] not null default array[]::text[],
  "color"       text not null default '#16A9E8',
  "isActive"    boolean not null default true,
  "lastSeenAt"  timestamptz,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now(),
  unique ("businessId", "email")
);
create index if not exists "TeamMember_businessId_idx" on "TeamMember" ("businessId");
create index if not exists "TeamMember_userId_idx" on "TeamMember" ("userId");

-- ── Patient ────────────────────────────────────────────────────────────────
create table if not exists "Patient" (
  "id"                    text primary key default gen_random_uuid(),
  "businessId"            text not null references "Business"("id") on delete cascade,
  "patientNumber"         text not null,
  "fullName"              text not null,
  "identityNumber"        text,
  "birthDate"             timestamptz,
  "gender"                text,
  "bloodType"             text,
  "phone"                 text not null,
  "email"                 text,
  "address"               text,
  "city"                  text,
  "emergencyContactName"  text,
  "emergencyContactPhone" text,
  "occupation"            text,
  "insuranceProvider"     text,
  "chronicDiseases"       text,
  "familyHistory"         text,
  "patientStory"          text,
  "tags"                  text[] not null default array[]::text[],
  "isArchived"            boolean not null default false,
  "createdAt"             timestamptz not null default now(),
  "updatedAt"             timestamptz not null default now(),
  unique ("businessId", "patientNumber")
);
create index if not exists "Patient_business_name_idx"     on "Patient" ("businessId", "fullName");
create index if not exists "Patient_business_phone_idx"    on "Patient" ("businessId", "phone");
create index if not exists "Patient_business_email_idx"    on "Patient" ("businessId", "email");
create index if not exists "Patient_business_identity_idx" on "Patient" ("businessId", "identityNumber");
create index if not exists "Patient_business_archived_idx" on "Patient" ("businessId", "isArchived");

-- ── PatientNote ────────────────────────────────────────────────────────────
create table if not exists "PatientNote" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "patientId"  text not null references "Patient"("id")  on delete cascade,
  "title"      text not null,
  "note"       text not null,
  "createdBy"  text not null,
  "isPinned"   boolean not null default false,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists "PatientNote_business_patient_idx" on "PatientNote" ("businessId", "patientId");

-- ── Medication ─────────────────────────────────────────────────────────────
create table if not exists "Medication" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "patientId"  text not null references "Patient"("id")  on delete cascade,
  "name"       text not null,
  "dosage"     text,
  "frequency"  text,
  "startDate"  timestamptz,
  "endDate"    timestamptz,
  "notes"      text,
  "active"     boolean not null default true,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists "Medication_business_patient_idx" on "Medication" ("businessId", "patientId");

-- ── Allergy ────────────────────────────────────────────────────────────────
create table if not exists "Allergy" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "patientId"  text not null references "Patient"("id")  on delete cascade,
  "name"       text not null,
  "severity"   text not null default 'ORTA',
  "reaction"   text,
  "notes"      text,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists "Allergy_business_patient_idx" on "Allergy" ("businessId", "patientId");

-- ── Treatment ──────────────────────────────────────────────────────────────
create table if not exists "Treatment" (
  "id"          text primary key default gen_random_uuid(),
  "businessId"  text not null references "Business"("id") on delete cascade,
  "patientId"   text not null references "Patient"("id")  on delete cascade,
  "title"       text not null,
  "description" text,
  "doctorName"  text,
  "startDate"   timestamptz,
  "endDate"     timestamptz,
  "status"      "TreatmentStatus" not null default 'PLANLANDI',
  "cost"        numeric(10,2),
  "notes"       text,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);
create index if not exists "Treatment_business_patient_idx" on "Treatment" ("businessId", "patientId");

-- ── LabResult ──────────────────────────────────────────────────────────────
create table if not exists "LabResult" (
  "id"          text primary key default gen_random_uuid(),
  "businessId"  text not null references "Business"("id") on delete cascade,
  "patientId"   text not null references "Patient"("id")  on delete cascade,
  "title"       text not null,
  "description" text,
  "resultDate"  timestamptz not null,
  "labName"     text,
  "fileUrl"     text,
  "notes"       text,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);
create index if not exists "LabResult_business_patient_idx" on "LabResult" ("businessId", "patientId");

-- ── PatientFile ────────────────────────────────────────────────────────────
create table if not exists "PatientFile" (
  "id"          text primary key default gen_random_uuid(),
  "businessId"  text not null references "Business"("id") on delete cascade,
  "patientId"   text not null references "Patient"("id")  on delete cascade,
  "fileName"    text not null,
  "fileType"    text not null,
  "fileSize"    integer,
  "category"    "FileCategory" not null default 'DIGER',
  "storageKey"  text not null,
  "fileUrl"     text not null,
  "description" text,
  "uploadedBy"  text,
  "uploadedAt"  timestamptz not null default now()
);
create index if not exists "PatientFile_business_patient_idx" on "PatientFile" ("businessId", "patientId");
create index if not exists "PatientFile_business_cat_idx"     on "PatientFile" ("businessId", "category");

-- ── Service ────────────────────────────────────────────────────────────────
create table if not exists "Service" (
  "id"          text primary key default gen_random_uuid(),
  "businessId"  text not null references "Business"("id") on delete cascade,
  "name"        text not null,
  "description" text,
  "category"    text,
  "durationMin" integer not null default 30,
  "price"       numeric(10,2) not null default 0,
  "currency"    text not null default 'TRY',
  "color"       text not null default '#12C8AD',
  "isActive"    boolean not null default true,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);
create index if not exists "Service_business_active_idx" on "Service" ("businessId", "isActive");

-- ── Appointment ────────────────────────────────────────────────────────────
create table if not exists "Appointment" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id")    on delete cascade,
  "patientId"  text not null references "Patient"("id")     on delete cascade,
  "serviceId"  text not null references "Service"("id")     on delete restrict,
  "staffId"    text          references "TeamMember"("id")  on delete set null,
  "date"       date not null,
  "startTime"  text not null,
  "endTime"    text not null,
  "status"     "AppointmentStatus" not null default 'SCHEDULED',
  "price"      numeric(10,2),
  "notes"      text,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists "Appointment_business_date_idx"    on "Appointment" ("businessId", "date");
create index if not exists "Appointment_business_status_idx"  on "Appointment" ("businessId", "status");
create index if not exists "Appointment_business_patient_idx" on "Appointment" ("businessId", "patientId");
create index if not exists "Appointment_business_staff_idx"   on "Appointment" ("businessId", "staffId");

-- ── TimelineEvent ──────────────────────────────────────────────────────────
create table if not exists "TimelineEvent" (
  "id"          text primary key default gen_random_uuid(),
  "businessId"  text not null references "Business"("id") on delete cascade,
  "patientId"   text          references "Patient"("id")  on delete cascade,
  "type"        "TimelineEventType" not null,
  "title"       text not null,
  "description" text,
  "actorName"   text,
  "actorId"     text,
  "metadata"    jsonb,
  "createdAt"   timestamptz not null default now()
);
create index if not exists "TimelineEvent_business_created_idx"        on "TimelineEvent" ("businessId", "createdAt");
create index if not exists "TimelineEvent_business_patient_created_idx" on "TimelineEvent" ("businessId", "patientId", "createdAt");

-- ── Notification ───────────────────────────────────────────────────────────
create table if not exists "Notification" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "userId"     text          references "User"("id")     on delete cascade,
  "type"       "NotificationType" not null default 'SYSTEM',
  "title"      text not null,
  "message"    text not null,
  "link"       text,
  "isRead"     boolean not null default false,
  "readAt"     timestamptz,
  "createdAt"  timestamptz not null default now()
);
create index if not exists "Notification_business_read_created_idx" on "Notification" ("businessId", "isRead", "createdAt");
create index if not exists "Notification_user_read_created_idx"     on "Notification" ("userId", "isRead", "createdAt");
-- ============================================================================
-- Asistan Health — Hasta Kartı v2 alanları
-- Date: 2026-05-18
--
-- Bu migrasyon Patient tablosuna "hızlı bakış" alanları ekler ve yeni
-- TreatmentPlanItem tablosunu (tedavi planı checklist'i) oluşturur.
--
-- Idempotent: tekrar çalıştırılabilir (IF NOT EXISTS / DO blok).
-- ============================================================================

-- ── PlanItemStatus enum ────────────────────────────────────────────────────
do $$ begin
  create type "PlanItemStatus" as enum ('AKTIF','PLANLANDI','BEKLIYOR','TAMAMLANDI');
exception when duplicate_object then null; end $$;

-- ── Patient: yeni alanlar ──────────────────────────────────────────────────
alter table "Patient" add column if not exists "lastDiagnosis"    text;
alter table "Patient" add column if not exists "currentTreatment" text;
alter table "Patient" add column if not exists "riskNote"         text;
alter table "Patient" add column if not exists "summary"          text;
alter table "Patient" add column if not exists "aiSuggestions"    jsonb;
alter table "Patient" add column if not exists "assignedDoctorId" text;

-- Atanmış doktor FK (TeamMember silinirse set null)
do $$ begin
  alter table "Patient"
    add constraint "Patient_assignedDoctorId_fkey"
    foreign key ("assignedDoctorId") references "TeamMember"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "Patient_assignedDoctor_idx" on "Patient" ("businessId", "assignedDoctorId");

-- ── TreatmentPlanItem tablosu ──────────────────────────────────────────────
create table if not exists "TreatmentPlanItem" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "patientId"  text not null references "Patient"("id")  on delete cascade,
  "title"      text not null,
  "frequency"  text,
  "status"     "PlanItemStatus" not null default 'PLANLANDI',
  "order"      integer not null default 0,
  "notes"      text,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists "TreatmentPlanItem_business_patient_order_idx"
  on "TreatmentPlanItem" ("businessId", "patientId", "order");
-- ============================================================================
-- Asistan Health production security layer
-- Date: 2026-05-18
--
-- Secures the Prisma-managed PascalCase tables and the private Supabase Storage
-- bucket used for patient files.
-- ============================================================================

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'patient-files',
  'patient-files',
  false,
  26214400,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.current_business_ids()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct b.id), array[]::text[])
  from "Business" b
  left join "TeamMember" tm on tm."businessId" = b.id
  left join "User" u on u.id = auth.uid()
  where b."ownerUserId" = auth.uid()
     or (
       tm."isActive" = true
       and (
         tm."userId" = auth.uid()
         or lower(tm.email) = lower(coalesce(u.email, auth.jwt() ->> 'email'))
       )
     );
$$;

create or replace function public.is_business_member(target_business_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_business_id = any(public.current_business_ids());
$$;

create or replace function public.has_business_permission(
  target_business_id text,
  required_permission text default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "Business" b
    where b.id = target_business_id
      and b."ownerUserId" = auth.uid()
  )
  or exists (
    select 1
    from "TeamMember" tm
    left join "User" u on u.id = auth.uid()
    where tm."businessId" = target_business_id
      and tm."isActive" = true
      and (
        tm."userId" = auth.uid()
        or lower(tm.email) = lower(coalesce(u.email, auth.jwt() ->> 'email'))
      )
      and (
        required_permission is null
        or tm.role in ('SUPER_ADMIN', 'ISLETME_SAHIBI')
        or tm.permissions @> array[required_permission]::text[]
      )
  );
$$;

create or replace function public.storage_business_id(object_name text)
returns text
language sql
stable
as $$
  select nullif((storage.foldername(object_name))[1], '')::text;
$$;

create or replace function public.storage_patient_id(object_name text)
returns text
language sql
stable
as $$
  select nullif((storage.foldername(object_name))[2], '')::text;
$$;

create or replace function public.patient_belongs_to_business(target_patient_id text, target_business_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "Patient" p
    where p.id = target_patient_id
      and p."businessId" = target_business_id
  );
$$;

alter table "Business" enable row level security;
alter table "User" enable row level security;
alter table "TeamMember" enable row level security;
alter table "Patient" enable row level security;
alter table "Appointment" enable row level security;
alter table "Service" enable row level security;
alter table "PatientNote" enable row level security;
alter table "Medication" enable row level security;
alter table "Allergy" enable row level security;
alter table "Treatment" enable row level security;
alter table "TreatmentPlanItem" enable row level security;
alter table "LabResult" enable row level security;
alter table "PatientFile" enable row level security;
alter table "TimelineEvent" enable row level security;
alter table "Notification" enable row level security;

drop policy if exists "user_self_select" on "User";
create policy "user_self_select" on "User"
  for select using (id = auth.uid());

drop policy if exists "user_self_update" on "User";
create policy "user_self_update" on "User"
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "user_business_member_select" on "User";
create policy "user_business_member_select" on "User"
  for select using (
    exists (
      select 1
      from "TeamMember" viewer
      join "TeamMember" target on target."businessId" = viewer."businessId"
      where target."userId" = "User".id
        and viewer."isActive" = true
        and (
          viewer."userId" = auth.uid()
          or lower(viewer.email) = lower(auth.jwt() ->> 'email')
        )
    )
  );

drop policy if exists "business_member_select" on "Business";
create policy "business_member_select" on "Business"
  for select using (public.is_business_member(id));

drop policy if exists "business_owner_insert" on "Business";
create policy "business_owner_insert" on "Business"
  for insert with check ("ownerUserId" = auth.uid());

drop policy if exists "business_owner_update" on "Business";
create policy "business_owner_update" on "Business"
  for update using ("ownerUserId" = auth.uid()) with check ("ownerUserId" = auth.uid());

drop policy if exists "team_member_select" on "TeamMember";
create policy "team_member_select" on "TeamMember"
  for select using (public.is_business_member("businessId"));

drop policy if exists "team_member_manage" on "TeamMember";
create policy "team_member_manage" on "TeamMember"
  for all
  using (public.has_business_permission("businessId", 'team.manage'))
  with check (public.has_business_permission("businessId", 'team.manage'));

drop policy if exists "patient_select" on "Patient";
create policy "patient_select" on "Patient"
  for select using (public.has_business_permission("businessId", 'patient.view'));

drop policy if exists "patient_manage" on "Patient";
create policy "patient_manage" on "Patient"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (public.has_business_permission("businessId", 'patient.edit'));

drop policy if exists "appointment_select" on "Appointment";
create policy "appointment_select" on "Appointment"
  for select using (public.has_business_permission("businessId", 'appointment.manage'));

drop policy if exists "appointment_manage" on "Appointment";
create policy "appointment_manage" on "Appointment"
  for all
  using (public.has_business_permission("businessId", 'appointment.manage'))
  with check (
    public.has_business_permission("businessId", 'appointment.manage')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "service_select" on "Service";
create policy "service_select" on "Service"
  for select using (public.is_business_member("businessId"));

drop policy if exists "service_manage" on "Service";
create policy "service_manage" on "Service"
  for all
  using (public.has_business_permission("businessId", 'service.manage'))
  with check (public.has_business_permission("businessId", 'service.manage'));

drop policy if exists "patient_note_select" on "PatientNote";
create policy "patient_note_select" on "PatientNote"
  for select using (
    public.has_business_permission("businessId", 'medical_note.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "patient_note_manage" on "PatientNote";
create policy "patient_note_manage" on "PatientNote"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "medication_select" on "Medication";
create policy "medication_select" on "Medication"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "medication_manage" on "Medication";
create policy "medication_manage" on "Medication"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "allergy_select" on "Allergy";
create policy "allergy_select" on "Allergy"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "allergy_manage" on "Allergy";
create policy "allergy_manage" on "Allergy"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_select" on "Treatment";
create policy "treatment_select" on "Treatment"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_manage" on "Treatment";
create policy "treatment_manage" on "Treatment"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_plan_select" on "TreatmentPlanItem";
create policy "treatment_plan_select" on "TreatmentPlanItem"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "treatment_plan_manage" on "TreatmentPlanItem";
create policy "treatment_plan_manage" on "TreatmentPlanItem"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "lab_result_select" on "LabResult";
create policy "lab_result_select" on "LabResult"
  for select using (
    public.has_business_permission("businessId", 'patient.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "lab_result_manage" on "LabResult";
create policy "lab_result_manage" on "LabResult"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "patient_file_select" on "PatientFile";
create policy "patient_file_select" on "PatientFile"
  for select using (
    public.has_business_permission("businessId", 'file.view')
    and public.patient_belongs_to_business("patientId", "businessId")
  );

drop policy if exists "patient_file_manage" on "PatientFile";
create policy "patient_file_manage" on "PatientFile"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (
    public.has_business_permission("businessId", 'patient.edit')
    and public.patient_belongs_to_business("patientId", "businessId")
    and "storageKey" like ("businessId"::text || '/' || "patientId"::text || '/%')
    and "fileUrl" = ('storage://patient-files/' || "storageKey")
  );

drop policy if exists "timeline_select" on "TimelineEvent";
create policy "timeline_select" on "TimelineEvent"
  for select using (public.has_business_permission("businessId", 'patient.view'));

drop policy if exists "timeline_manage" on "TimelineEvent";
create policy "timeline_manage" on "TimelineEvent"
  for all
  using (public.has_business_permission("businessId", 'patient.edit'))
  with check (public.has_business_permission("businessId", 'patient.edit'));

drop policy if exists "notification_select" on "Notification";
create policy "notification_select" on "Notification"
  for select using (
    public.is_business_member("businessId")
    and ("userId" is null or "userId" = auth.uid())
  );

drop policy if exists "notification_manage" on "Notification";
create policy "notification_manage" on "Notification"
  for all
  using (public.is_business_member("businessId"))
  with check (public.is_business_member("businessId"));

drop policy if exists "patient_files_select" on storage.objects;
create policy "patient_files_select" on storage.objects
  for select using (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'file.view')
    and public.patient_belongs_to_business(public.storage_patient_id(name), public.storage_business_id(name))
  );

drop policy if exists "patient_files_insert" on storage.objects;
create policy "patient_files_insert" on storage.objects
  for insert with check (
    bucket_id = 'patient-files'
    and owner = auth.uid()
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
    and public.patient_belongs_to_business(public.storage_patient_id(name), public.storage_business_id(name))
  );

drop policy if exists "patient_files_update" on storage.objects;
create policy "patient_files_update" on storage.objects
  for update using (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
  )
  with check (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
    and public.patient_belongs_to_business(public.storage_patient_id(name), public.storage_business_id(name))
  );

drop policy if exists "patient_files_delete" on storage.objects;
create policy "patient_files_delete" on storage.objects
  for delete using (
    bucket_id = 'patient-files'
    and public.has_business_permission(public.storage_business_id(name), 'patient.edit')
  );
-- ============================================================================
-- Runtime schema parity with prisma/schema.prisma
-- Date: 2026-05-19
--
-- Adds the notification, reminder, push subscription, and messaging tables that
-- later RLS/realtime migrations depend on. Keep this before
-- 20260519000100_production_rls_messaging_storage.sql.
-- ============================================================================

do $$ begin
  create type "NotificationPriority" as enum ('LOW','NORMAL','HIGH','URGENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "NotificationActionStatus" as enum ('PENDING','COMPLETED','CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type "NotificationActionType" as enum (
    'APPOINTMENT_APPROVE',
    'APPOINTMENT_CANCEL',
    'APPOINTMENT_RESCHEDULE',
    'OPEN_LINK',
    'OPEN_PATIENT',
    'OPEN_APPOINTMENT',
    'ACK'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type "ReminderPriority" as enum ('LOW','NORMAL','HIGH');
exception when duplicate_object then null; end $$;

alter table "Notification" add column if not exists "actorUserId" text;
alter table "Notification" add column if not exists "subtype" text;
alter table "Notification" add column if not exists "entityType" text;
alter table "Notification" add column if not exists "entityId" text;
alter table "Notification" add column if not exists "priority" "NotificationPriority" not null default 'NORMAL';
alter table "Notification" add column if not exists "actionRequired" boolean not null default false;
alter table "Notification" add column if not exists "metadata" jsonb;
alter table "Notification" add column if not exists "archivedAt" timestamptz;

do $$ begin
  alter table "Notification"
    add constraint "Notification_actorUserId_fkey"
    foreign key ("actorUserId") references "User"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "Notification_business_entity_idx" on "Notification" ("businessId", "entityType", "entityId");
create index if not exists "Notification_business_archived_idx" on "Notification" ("businessId", "archivedAt");

create table if not exists "NotificationAction" (
  "id"             text primary key default gen_random_uuid(),
  "notificationId" text not null references "Notification"("id") on delete cascade,
  "label"          text not null,
  "actionType"     "NotificationActionType" not null,
  "payload"        jsonb,
  "status"         "NotificationActionStatus" not null default 'PENDING',
  "completedBy"    text,
  "completedAt"    timestamptz,
  "createdAt"      timestamptz not null default now()
);
create index if not exists "NotificationAction_notification_status_idx" on "NotificationAction" ("notificationId", "status");

create table if not exists "PushSubscription" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "userId"     text not null references "User"("id") on delete cascade,
  "endpoint"   text unique not null,
  "p256dh"     text not null,
  "auth"       text not null,
  "userAgent"  text,
  "createdAt"  timestamptz not null default now(),
  "lastUsedAt" timestamptz
);
create index if not exists "PushSubscription_userId_idx" on "PushSubscription" ("userId");
create index if not exists "PushSubscription_businessId_idx" on "PushSubscription" ("businessId");

create table if not exists "Reminder" (
  "id"         text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "userId"     text not null references "User"("id") on delete cascade,
  "title"      text not null,
  "note"       text,
  "dueAt"      timestamptz,
  "isDone"     boolean not null default false,
  "priority"   "ReminderPriority" not null default 'NORMAL',
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists "Reminder_business_user_done_due_idx" on "Reminder" ("businessId", "userId", "isDone", "dueAt");

create table if not exists "Conversation" (
  "id"            text primary key default gen_random_uuid(),
  "businessId"    text not null references "Business"("id") on delete cascade,
  "title"         text,
  "isGroup"       boolean not null default false,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now(),
  "lastMessageAt" timestamptz
);
create index if not exists "Conversation_business_lastMessage_idx" on "Conversation" ("businessId", "lastMessageAt");

create table if not exists "ConversationParticipant" (
  "id"             text primary key default gen_random_uuid(),
  "conversationId" text not null references "Conversation"("id") on delete cascade,
  "userId"         text not null references "User"("id") on delete cascade,
  "joinedAt"       timestamptz not null default now(),
  "lastReadAt"     timestamptz,
  "isActive"       boolean not null default true,
  unique ("conversationId", "userId")
);
create index if not exists "ConversationParticipant_user_lastRead_idx" on "ConversationParticipant" ("userId", "lastReadAt");

create table if not exists "Message" (
  "id"             text primary key default gen_random_uuid(),
  "conversationId" text not null references "Conversation"("id") on delete cascade,
  "senderUserId"   text not null references "User"("id") on delete cascade,
  "body"           text not null default '',
  "createdAt"      timestamptz not null default now(),
  "editedAt"       timestamptz,
  "deletedAt"      timestamptz
);
create index if not exists "Message_conversation_created_idx" on "Message" ("conversationId", "createdAt");
create index if not exists "Message_senderUserId_idx" on "Message" ("senderUserId");
-- ============================================================================
-- Asistan Health production hardening
-- Date: 2026-05-19
--
-- Adds message media storage plus RLS for notification actions and team chat.
-- Reinforces tenant access using Business membership and explicit RBAC helpers
-- from 20260518_0002_patient_files_storage_rls.sql.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-media',
  'message-media',
  false,
  15728640,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists "MessageAttachment" (
  "id"         text primary key default gen_random_uuid(),
  "messageId"  text not null references "Message"("id") on delete cascade,
  "fileName"   text not null,
  "fileType"   text not null,
  "fileSize"   integer not null,
  "storageKey" text not null,
  "fileUrl"    text not null,
  "createdAt"  timestamptz not null default now()
);

create index if not exists "MessageAttachment_messageId_idx" on "MessageAttachment" ("messageId");

create table if not exists "MessageReaction" (
  "id"        text primary key default gen_random_uuid(),
  "messageId" text not null references "Message"("id") on delete cascade,
  "userId"    text not null references "User"("id") on delete cascade,
  "emoji"     text not null,
  "createdAt" timestamptz not null default now(),
  unique ("messageId", "userId", "emoji")
);

create index if not exists "MessageReaction_messageId_idx" on "MessageReaction" ("messageId");
create index if not exists "MessageReaction_userId_idx" on "MessageReaction" ("userId");

alter table "Message" alter column "body" set default '';

create or replace function public.is_conversation_participant(target_conversation_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "ConversationParticipant" cp
    join "Conversation" c on c.id = cp."conversationId"
    where cp."conversationId" = target_conversation_id
      and cp."isActive" = true
      and cp."userId" = auth.uid()
      and public.is_business_member(c."businessId")
  );
$$;

create or replace function public.message_business_id(target_message_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select c."businessId"
  from "Message" m
  join "Conversation" c on c.id = m."conversationId"
  where m.id = target_message_id;
$$;

create or replace function public.message_conversation_id(target_message_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m."conversationId"
  from "Message" m
  where m.id = target_message_id;
$$;

create or replace function public.storage_conversation_id(object_name text)
returns text
language sql
stable
as $$
  select nullif((storage.foldername(object_name))[2], '')::text;
$$;

alter table "NotificationAction" enable row level security;
alter table "Conversation" enable row level security;
alter table "ConversationParticipant" enable row level security;
alter table "Message" enable row level security;
alter table "MessageAttachment" enable row level security;
alter table "MessageReaction" enable row level security;

drop policy if exists "notification_action_member_select" on "NotificationAction";
create policy "notification_action_member_select" on "NotificationAction"
  for select using (
    exists (
      select 1
      from "Notification" n
      where n.id = "NotificationAction"."notificationId"
        and public.is_business_member(n."businessId")
        and (n."userId" is null or n."userId" = auth.uid())
    )
  );

drop policy if exists "notification_action_member_update" on "NotificationAction";
create policy "notification_action_member_update" on "NotificationAction"
  for update using (
    exists (
      select 1
      from "Notification" n
      where n.id = "NotificationAction"."notificationId"
        and public.is_business_member(n."businessId")
        and (n."userId" is null or n."userId" = auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from "Notification" n
      where n.id = "NotificationAction"."notificationId"
        and public.is_business_member(n."businessId")
        and (n."userId" is null or n."userId" = auth.uid())
    )
  );

drop policy if exists "conversation_participant_select" on "Conversation";
create policy "conversation_participant_select" on "Conversation"
  for select using (public.is_conversation_participant(id));

drop policy if exists "conversation_member_insert" on "Conversation";
create policy "conversation_member_insert" on "Conversation"
  for insert with check (public.is_business_member("businessId"));

drop policy if exists "conversation_participant_update" on "Conversation";
create policy "conversation_participant_update" on "Conversation"
  for update using (public.is_conversation_participant(id))
  with check (public.is_conversation_participant(id));

drop policy if exists "conversation_participant_visible" on "ConversationParticipant";
create policy "conversation_participant_visible" on "ConversationParticipant"
  for select using (public.is_conversation_participant("conversationId"));

drop policy if exists "conversation_participant_member_insert" on "ConversationParticipant";
create policy "conversation_participant_member_insert" on "ConversationParticipant"
  for insert with check (
    exists (
      select 1
      from "Conversation" c
      where c.id = "ConversationParticipant"."conversationId"
        and public.is_business_member(c."businessId")
    )
  );

drop policy if exists "conversation_participant_self_update" on "ConversationParticipant";
create policy "conversation_participant_self_update" on "ConversationParticipant"
  for update using ("userId" = auth.uid() and public.is_conversation_participant("conversationId"))
  with check ("userId" = auth.uid() and public.is_conversation_participant("conversationId"));

drop policy if exists "message_participant_select" on "Message";
create policy "message_participant_select" on "Message"
  for select using (public.is_conversation_participant("conversationId"));

drop policy if exists "message_participant_insert" on "Message";
create policy "message_participant_insert" on "Message"
  for insert with check (
    "senderUserId" = auth.uid()
    and public.is_conversation_participant("conversationId")
  );

drop policy if exists "message_sender_update" on "Message";
create policy "message_sender_update" on "Message"
  for update using ("senderUserId" = auth.uid() and public.is_conversation_participant("conversationId"))
  with check ("senderUserId" = auth.uid() and public.is_conversation_participant("conversationId"));

drop policy if exists "message_attachment_participant_select" on "MessageAttachment";
create policy "message_attachment_participant_select" on "MessageAttachment"
  for select using (public.is_conversation_participant(public.message_conversation_id("messageId")));

drop policy if exists "message_attachment_sender_insert" on "MessageAttachment";
create policy "message_attachment_sender_insert" on "MessageAttachment"
  for insert with check (
    public.is_conversation_participant(public.message_conversation_id("messageId"))
    and "fileUrl" = ('storage://message-media/' || "storageKey")
  );

drop policy if exists "message_reaction_participant_select" on "MessageReaction";
create policy "message_reaction_participant_select" on "MessageReaction"
  for select using (public.is_conversation_participant(public.message_conversation_id("messageId")));

drop policy if exists "message_reaction_self_manage" on "MessageReaction";
create policy "message_reaction_self_manage" on "MessageReaction"
  for all using (
    "userId" = auth.uid()
    and public.is_conversation_participant(public.message_conversation_id("messageId"))
  )
  with check (
    "userId" = auth.uid()
    and public.is_conversation_participant(public.message_conversation_id("messageId"))
  );

drop policy if exists "message_media_select" on storage.objects;
create policy "message_media_select" on storage.objects
  for select using (
    bucket_id = 'message-media'
    and public.is_business_member(public.storage_business_id(name))
    and public.is_conversation_participant(public.storage_conversation_id(name))
  );

drop policy if exists "message_media_insert" on storage.objects;
create policy "message_media_insert" on storage.objects
  for insert with check (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and public.is_business_member(public.storage_business_id(name))
    and public.is_conversation_participant(public.storage_conversation_id(name))
  );

drop policy if exists "message_media_delete" on storage.objects;
create policy "message_media_delete" on storage.objects
  for delete using (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and public.is_business_member(public.storage_business_id(name))
    and public.is_conversation_participant(public.storage_conversation_id(name))
  );
-- ============================================================================
-- Tighten chat RLS checks
-- Date: 2026-05-19
-- ============================================================================

create or replace function public.user_belongs_to_business(
  target_user_id text,
  target_business_id text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from "Business" b
    where b.id = target_business_id
      and b."ownerUserId" = target_user_id
  )
  or exists (
    select 1
    from "TeamMember" tm
    where tm."businessId" = target_business_id
      and tm."userId" = target_user_id
      and tm."isActive" = true
  );
$$;

drop policy if exists "conversation_participant_member_insert" on "ConversationParticipant";
create policy "conversation_participant_member_insert" on "ConversationParticipant"
  for insert with check (
    exists (
      select 1
      from "Conversation" c
      where c.id = "ConversationParticipant"."conversationId"
        and public.is_conversation_participant(c.id)
        and public.user_belongs_to_business("ConversationParticipant"."userId", c."businessId")
    )
  );

drop policy if exists "message_attachment_sender_insert" on "MessageAttachment";
create policy "message_attachment_sender_insert" on "MessageAttachment"
  for insert with check (
    exists (
      select 1
      from "Message" m
      join "Conversation" c on c.id = m."conversationId"
      where m.id = "MessageAttachment"."messageId"
        and public.is_conversation_participant(c.id)
        and "MessageAttachment"."storageKey" like (c."businessId"::text || '/' || c.id::text || '/%')
        and "MessageAttachment"."fileUrl" = ('storage://message-media/' || "MessageAttachment"."storageKey")
    )
  );
-- ============================================================================
-- Enable Supabase Realtime for notifications and messaging
-- Date: 2026-05-19
-- ============================================================================

alter table "Notification" replica identity full;
alter table "Message" replica identity full;
alter table "MessageReaction" replica identity full;
alter table "ConversationParticipant" replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'Notification'
  ) then
    alter publication supabase_realtime add table "Notification";
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'Message'
  ) then
    alter publication supabase_realtime add table "Message";
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'MessageReaction'
  ) then
    alter publication supabase_realtime add table "MessageReaction";
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ConversationParticipant'
  ) then
    alter publication supabase_realtime add table "ConversationParticipant";
  end if;
end $$;
-- ============================================================================
-- Reminder and push subscription RLS
-- Date: 2026-05-20
--
-- Closes the remaining Prisma-managed user-scoped tables so direct Supabase
-- client access cannot read or mutate another user's reminder/subscription data.
-- ============================================================================

alter table "Reminder" enable row level security;
alter table "PushSubscription" enable row level security;

drop policy if exists "reminder_self_select" on "Reminder";
create policy "reminder_self_select" on "Reminder"
  for select using (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );

drop policy if exists "reminder_self_insert" on "Reminder";
create policy "reminder_self_insert" on "Reminder"
  for insert with check (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );

drop policy if exists "reminder_self_update" on "Reminder";
create policy "reminder_self_update" on "Reminder"
  for update using (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  )
  with check (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );

drop policy if exists "reminder_self_delete" on "Reminder";
create policy "reminder_self_delete" on "Reminder"
  for delete using (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_select" on "PushSubscription";
create policy "push_subscription_self_select" on "PushSubscription"
  for select using (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_insert" on "PushSubscription";
create policy "push_subscription_self_insert" on "PushSubscription"
  for insert with check (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_update" on "PushSubscription";
create policy "push_subscription_self_update" on "PushSubscription"
  for update using (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  )
  with check (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );

drop policy if exists "push_subscription_self_delete" on "PushSubscription";
create policy "push_subscription_self_delete" on "PushSubscription"
  for delete using (
    "userId" = auth.uid()
    and public.is_business_member("businessId")
  );
-- ============================================================================
-- Storage reference guards
-- Date: 2026-05-20
--
-- Enforces that database file columns store small storage references/links, not
-- inline base64 payloads. NOT VALID keeps rollout safe for legacy rows while
-- still protecting all new writes.
-- ============================================================================

alter table "PatientFile"
  drop constraint if exists "PatientFile_storage_reference_check";

alter table "PatientFile"
  add constraint "PatientFile_storage_reference_check"
  check (
    "fileUrl" = ('storage://patient-files/' || "storageKey")
    and "storageKey" like ("businessId"::text || '/' || "patientId"::text || '/%')
    and octet_length("fileUrl") <= 1200
    and octet_length("storageKey") <= 1000
  ) not valid;

alter table "MessageAttachment"
  drop constraint if exists "MessageAttachment_storage_reference_check";

alter table "MessageAttachment"
  add constraint "MessageAttachment_storage_reference_check"
  check (
    "fileUrl" = ('storage://message-media/' || "storageKey")
    and octet_length("fileUrl") <= 1200
    and octet_length("storageKey") <= 1000
  ) not valid;

alter table "LabResult"
  drop constraint if exists "LabResult_file_url_not_inline_payload_check";

alter table "LabResult"
  add constraint "LabResult_file_url_not_inline_payload_check"
  check (
    "fileUrl" is null
    or (
      "fileUrl" !~* '^data:'
      and octet_length("fileUrl") <= 2000
    )
  ) not valid;
-- ============================================================================
-- Race-free patient number generation
-- Date: 2026-05-20
--
-- Generates HST-1001 style numbers under a per-business advisory transaction
-- lock. The trigger covers direct SQL/API inserts; application code also calls
-- the function explicitly so Prisma keeps its required patientNumber field.
-- ============================================================================

create or replace function public.next_patient_number(target_business_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
begin
  perform pg_advisory_xact_lock(hashtext(target_business_id::text));

  select coalesce(
    max(nullif(substring("patientNumber" from '^HST-([0-9]+)$'), '')::integer),
    1000
  ) + 1
  into next_number
  from "Patient"
  where "businessId" = target_business_id;

  return 'HST-' || next_number::text;
end;
$$;

create or replace function public.set_patient_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new."patientNumber" is null or btrim(new."patientNumber") = '' then
    new."patientNumber" := public.next_patient_number(new."businessId");
  end if;

  return new;
end;
$$;

drop trigger if exists "Patient_set_patient_number" on "Patient";
create trigger "Patient_set_patient_number"
  before insert on "Patient"
  for each row
  execute function public.set_patient_number();
-- ============================================================================
-- Patient note creator audit FK
-- Date: 2026-05-20
--
-- Keeps the legacy createdBy display snapshot while adding a nullable FK to the
-- actual User row for auditability. New writes should populate createdByUserId.
-- ============================================================================

alter table "PatientNote" add column if not exists "createdByUserId" text;

do $$ begin
  alter table "PatientNote"
    add constraint "PatientNote_createdByUserId_fkey"
    foreign key ("createdByUserId") references "User"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "PatientNote_createdByUserId_idx" on "PatientNote" ("createdByUserId");
-- ============================================================================
-- LabResult storage tenant/patient scope
-- Date: 2026-05-20
--
-- LabResult has only fileUrl (no separate storageKey), so the storage reference
-- itself must encode and enforce the owning business and patient.
-- ============================================================================

alter table "LabResult"
  drop constraint if exists "LabResult_file_url_not_inline_payload_check";

alter table "LabResult"
  drop constraint if exists "LabResult_storage_reference_check";

alter table "LabResult"
  add constraint "LabResult_storage_reference_check"
  check (
    "fileUrl" is null
    or (
      "fileUrl" like ('storage://patient-files/' || "businessId"::text || '/' || "patientId"::text || '/%')
      and octet_length("fileUrl") <= 1200
    )
  ) not valid;
-- ============================================================================
-- Direct conversation identity
-- Date: 2026-05-20
--
-- A direct message is identified by the owning business and the sorted pair of
-- user ids. This avoids relation-filter ambiguity and prevents duplicate DMs
-- under concurrent "start conversation" requests.
-- ============================================================================

alter table "Conversation"
  add column if not exists "directKey" text;

with direct_pairs as (
  select
    c.id,
    c."businessId",
    string_agg(cp."userId"::text, ':' order by cp."userId"::text) as direct_key
  from "Conversation" c
  join "ConversationParticipant" cp
    on cp."conversationId" = c.id
   and cp."isActive" = true
  where c."isGroup" = false
  group by c.id, c."businessId"
  having count(*) = 2
),
ranked_pairs as (
  select
    id,
    "businessId",
    direct_key,
    row_number() over (partition by "businessId", direct_key order by id) as rn
  from direct_pairs
)
update "Conversation" c
set "directKey" = rp.direct_key
from ranked_pairs rp
where c.id = rp.id
  and rp.rn = 1
  and c."directKey" is null;

create unique index if not exists "Conversation_business_directKey_unique"
  on "Conversation" ("businessId", "directKey")
  where "directKey" is not null;

create index if not exists "Conversation_business_directKey_idx"
  on "Conversation" ("businessId", "directKey");
-- ============================================================================
-- Soft delete baseline: deletedAt columns
-- Date: 2026-05-24
-- ============================================================================

alter table "Business" add column if not exists "deletedAt" timestamptz;
alter table "VendorAccount" add column if not exists "deletedAt" timestamptz;
alter table "TeamMember" add column if not exists "deletedAt" timestamptz;

alter table "Patient" add column if not exists "deletedAt" timestamptz;
alter table "PatientNote" add column if not exists "deletedAt" timestamptz;
alter table "Medication" add column if not exists "deletedAt" timestamptz;
alter table "Allergy" add column if not exists "deletedAt" timestamptz;
alter table "Treatment" add column if not exists "deletedAt" timestamptz;
alter table "TreatmentPlanItem" add column if not exists "deletedAt" timestamptz;
alter table "LabResult" add column if not exists "deletedAt" timestamptz;
alter table "PatientFile" add column if not exists "deletedAt" timestamptz;

alter table "Service" add column if not exists "deletedAt" timestamptz;
alter table "Appointment" add column if not exists "deletedAt" timestamptz;

alter table "TimelineEvent" add column if not exists "deletedAt" timestamptz;
alter table "Notification" add column if not exists "deletedAt" timestamptz;
alter table "NotificationAction" add column if not exists "deletedAt" timestamptz;
alter table "PushSubscription" add column if not exists "deletedAt" timestamptz;
alter table "Reminder" add column if not exists "deletedAt" timestamptz;

alter table "Conversation" add column if not exists "deletedAt" timestamptz;
alter table "ConversationParticipant" add column if not exists "deletedAt" timestamptz;
alter table "MessageAttachment" add column if not exists "deletedAt" timestamptz;
alter table "MessageReaction" add column if not exists "deletedAt" timestamptz;

create index if not exists "TeamMember_business_deletedAt_idx"
  on "TeamMember" ("businessId", "deletedAt");

create index if not exists "Patient_business_deletedAt_idx"
  on "Patient" ("businessId", "deletedAt");

create index if not exists "Service_business_deletedAt_idx"
  on "Service" ("businessId", "deletedAt");

create index if not exists "Appointment_business_deletedAt_idx"
  on "Appointment" ("businessId", "deletedAt");

create index if not exists "Reminder_business_user_deletedAt_idx"
  on "Reminder" ("businessId", "userId", "deletedAt");

create index if not exists "Conversation_business_deletedAt_idx"
  on "Conversation" ("businessId", "deletedAt");

-- ============================================================================
-- Multi-location foundation
-- Date: 2026-05-24
-- ============================================================================

create table if not exists "Location" (
  "id" text primary key default gen_random_uuid(),
  "businessId" text not null references "Business"("id") on delete cascade,
  "name" text not null,
  "address" text,
  "city" text,
  "phone" text,
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 0,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "Location_business_active_idx"
  on "Location" ("businessId", "isActive");

create index if not exists "Location_business_sort_name_idx"
  on "Location" ("businessId", "sortOrder", "name");

alter table "Appointment"
  add column if not exists "locationId" text;

do $$ begin
  alter table "Appointment"
    add constraint "Appointment_locationId_fkey"
    foreign key ("locationId") references "Location"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "Appointment_business_location_date_idx"
  on "Appointment" ("businessId", "locationId", "date");

-- For existing tenants, create one default branch if they already have
-- appointments but no location rows.
insert into "Location" ("businessId", "name", "address", "city", "phone", "isActive", "sortOrder")
select
  b."id",
  'Merkez Sube',
  b."address",
  b."city",
  b."phone",
  true,
  0
from "Business" b
where exists (
  select 1
  from "Appointment" a
  where a."businessId" = b."id"
    and a."locationId" is null
)
and not exists (
  select 1
  from "Location" l
  where l."businessId" = b."id"
    and l."deletedAt" is null
);

with "FirstLocation" as (
  select distinct on (l."businessId")
    l."businessId",
    l."id"
  from "Location" l
  where l."deletedAt" is null
  order by l."businessId", l."sortOrder" asc, l."createdAt" asc
)
update "Appointment" a
set "locationId" = f."id"
from "FirstLocation" f
where a."locationId" is null
  and a."businessId" = f."businessId";
