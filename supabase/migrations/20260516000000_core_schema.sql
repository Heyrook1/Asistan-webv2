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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  name_tr text null,
  description text null,
  icon text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.specialties (
  id uuid primary key default gen_random_uuid(),
  category_id uuid null references public.categories(id) on delete set null,
  name text not null unique,
  name_tr text null,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  business_name text not null,
  business_description text null,
  category_id uuid null references public.categories(id) on delete set null,
  specialty_id uuid null references public.specialties(id) on delete set null,
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
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  block_date date not null,
  start_time time null,
  end_time time null,
  is_full_day boolean not null default false,
  reason text null,
  created_at timestamptz not null default now(),
  check ((is_full_day = true and start_time is null and end_time is null) or (is_full_day = false and start_time is not null and end_time is not null and end_time > start_time))
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
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
  cancelled_by uuid null references public.users(id) on delete set null,
  cancellation_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.appointment_status_history (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  old_status text null,
  new_status text not null,
  changed_by uuid null references public.users(id) on delete set null,
  notes text null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
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
