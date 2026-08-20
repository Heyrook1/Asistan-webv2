-- ============================================================================
-- Drop legacy snake_case public.* schema (pre-Prisma marketplace prototype)
-- Date: 2026-07-16
--
-- Production truth: Prisma PascalCase ("Business", "Patient", "User", …).
-- These tables are dead weight in a PHI database — extra RLS surface, confusion.
--
-- GUARD: aborts if any legacy table still has rows. Run:
--   node scripts/audit-legacy-public-schema.mjs
-- before applying on production.
-- ============================================================================

do $$
declare
  legacy_tables text[] := array[
    'appointment_status_history',
    'reviews',
    'appointments',
    'calendar_availability',
    'calendar_blocks',
    'notifications',
    'services',
    'team_members',
    'activity_logs',
    'user_consents',
    'data_deletion_requests',
    'customers',
    'providers',
    'categories',
    'specialties',
    'users'
  ];
  t text;
  row_count bigint;
begin
  foreach t in array legacy_tables loop
    if to_regclass('public.' || quote_ident(t)) is not null then
      execute format('select count(*)::bigint from public.%I', t) into row_count;
      if row_count > 0 then
        raise exception
          'Legacy table public.% has % rows — archive or truncate before drop (see docs/legacy-public-schema-deprecation.md)',
          t, row_count;
      end if;
    end if;
  end loop;
end $$;

-- Revoke PostgREST roles before drop (belt-and-suspenders if migration re-run)
do $$
declare
  legacy_tables text[] := array[
    'appointment_status_history', 'reviews', 'appointments', 'calendar_availability',
    'calendar_blocks', 'notifications', 'services', 'team_members', 'activity_logs',
    'user_consents', 'data_deletion_requests', 'customers', 'providers',
    'categories', 'specialties', 'users'
  ];
  t text;
begin
  foreach t in array legacy_tables loop
    if to_regclass('public.' || quote_ident(t)) is not null then
      execute format('revoke all on table public.%I from anon, authenticated', t);
    end if;
  end loop;
end $$;

-- Triggers (legacy tables only)
drop trigger if exists trg_audit_appointments on public.appointments;
drop trigger if exists trg_audit_customers on public.customers;
drop trigger if exists trg_audit_services on public.services;
drop trigger if exists trg_appointments_status_history on public.appointments;
drop trigger if exists trg_users_updated_at on public.users;
drop trigger if exists trg_providers_updated_at on public.providers;
drop trigger if exists trg_customers_updated_at on public.customers;
drop trigger if exists trg_services_updated_at on public.services;
drop trigger if exists trg_availability_updated_at on public.calendar_availability;
drop trigger if exists trg_appointments_updated_at on public.appointments;
drop trigger if exists trg_reviews_updated_at on public.reviews;

-- Tables (child → parent)
drop table if exists public.appointment_status_history cascade;
drop table if exists public.reviews cascade;
drop table if exists public.appointments cascade;
drop table if exists public.calendar_availability cascade;
drop table if exists public.calendar_blocks cascade;
drop table if exists public.notifications cascade;
drop table if exists public.services cascade;
drop table if exists public.team_members cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.user_consents cascade;
drop table if exists public.data_deletion_requests cascade;
drop table if exists public.customers cascade;
drop table if exists public.providers cascade;
drop table if exists public.categories cascade;
drop table if exists public.specialties cascade;
drop table if exists public.users cascade;

-- Legacy-only helpers
drop function if exists public.log_appointment_status_change() cascade;
drop function if exists public.audit_trigger_func() cascade;
drop function if exists public.log_activity(uuid, text, text, uuid, jsonb, text) cascade;
drop function if exists public.is_provider_owner(uuid) cascade;
drop function if exists public.is_team_member(uuid, text) cascade;
drop function if exists public.can_access_provider(uuid, text) cascade;
drop function if exists public.set_updated_at() cascade;
