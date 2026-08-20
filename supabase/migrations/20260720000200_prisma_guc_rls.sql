-- ============================================================================
-- Prisma GUC RLS — second door for app role (defense-in-depth)
-- Date: 2026-07-20
--
-- Prisma historically connected as a privileged/owner role and bypassed RLS.
-- This migration:
--   1) Creates `asistan_app` (NOBYPASSRLS) for clinic runtime DATABASE_URL
--   2) Creates `asistan_identity` for Person / GPI jobs (separate connection)
--   3) FORCE ROW LEVEL SECURITY on PHI tables with businessId
--   4) Policies for asistan_app: "businessId" = current_setting('app.business_id', true)
--
-- Ops:
--   - Set passwords: ALTER ROLE asistan_app PASSWORD '...'; ALTER ROLE asistan_identity ...
--   - App runtime DATABASE_URL → asistan_app
--   - DATABASE_URL_MIGRATE / DIRECT_URL → table owner (migrations + optional identity)
--   - Clinic requests must call set_config('app.business_id', ..., true) via withTenantDb
--
-- Rollback: point DATABASE_URL back at owner role; roles/policies can remain.
-- Canonical: docs/security-ops.md · lib/security/tenant-db-context.ts
-- ============================================================================

-- ── Roles ───────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'asistan_app') then
    create role asistan_app nosuperuser nobypassrls nocreatedb nocreaterole inherit login;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'asistan_identity') then
    create role asistan_identity nosuperuser nobypassrls nocreatedb nocreaterole inherit login;
  end if;
end $$;

-- Ensure flags even if roles pre-existed
alter role asistan_app with nobypassrls login;
alter role asistan_identity with nobypassrls login;

grant usage on schema public to asistan_app, asistan_identity;

-- DML on all current public tables + sequences (owner still owns DDL)
do $$
declare
  r record;
begin
  for r in
    select c.relname as name, c.relkind
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'S') -- table, partitioned, sequence
  loop
    if r.relkind = 'S' then
      execute format('grant usage, select on sequence public.%I to asistan_app, asistan_identity', r.name);
    else
      execute format(
        'grant select, insert, update, delete on table public.%I to asistan_app, asistan_identity',
        r.name
      );
    end if;
  end loop;
end $$;

grant usage, select on all sequences in schema public to asistan_app, asistan_identity;
alter default privileges in schema public
  grant select, insert, update, delete on tables to asistan_app, asistan_identity;
alter default privileges in schema public
  grant usage, select on sequences to asistan_app, asistan_identity;

-- ── FORCE RLS + GUC policies (PHI with businessId) ─────────────────────────

do $$
declare
  t text;
  policy_name text;
begin
  foreach t in array array[
    'Location',
    'VendorAccount',
    'MembershipPayment',
    'TeamMember',
    'Patient',
    'PatientNote',
    'Medication',
    'Allergy',
    'Treatment',
    'TreatmentPlanItem',
    'LabResult',
    'PatientFile',
    'Prescription',
    'Service',
    'ServiceStaff',
    'TeamMemberAvailability',
    'TeamMemberUnavailableBlock',
    'CalendarConnection',
    'Appointment',
    'IntakeForm',
    'IntakeInvite',
    'IntakeResponse',
    'Review',
    'TimelineEvent',
    'Notification',
    'PushSubscription',
    'Reminder',
    'ClientNotification',
    'Conversation',
    'AuditLog',
    'DataDeletionRequest',
    'ComplianceDocument'
  ]
  loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);

    policy_name := format('%s_prisma_guc', lower(t));
    execute format('drop policy if exists %I on public.%I', policy_name, t);
    execute format(
      'create policy %I on public.%I for all to asistan_app using (
         "businessId" is not null
         and "businessId" = nullif(current_setting(''app.business_id'', true), '''')
       ) with check (
         "businessId" is not null
         and "businessId" = nullif(current_setting(''app.business_id'', true), '''')
       )',
      policy_name,
      t
    );
  end loop;
end $$;

-- PrescriptionLine has no businessId — scope via parent Prescription
do $$
begin
  if to_regclass('public."PrescriptionLine"') is not null then
    alter table public."PrescriptionLine" enable row level security;
    alter table public."PrescriptionLine" force row level security;
    drop policy if exists prescriptionline_prisma_guc on public."PrescriptionLine";
    create policy prescriptionline_prisma_guc on public."PrescriptionLine"
      for all to asistan_app
      using (
        exists (
          select 1 from public."Prescription" p
          where p.id = "prescriptionId"
            and p."businessId" = nullif(current_setting('app.business_id', true), '')
        )
      )
      with check (
        exists (
          select 1 from public."Prescription" p
          where p.id = "prescriptionId"
            and p."businessId" = nullif(current_setting('app.business_id', true), '')
        )
      );
  end if;
end $$;

-- NotificationAction — via Notification.businessId
do $$
begin
  if to_regclass('public."NotificationAction"') is not null then
    alter table public."NotificationAction" enable row level security;
    alter table public."NotificationAction" force row level security;
    drop policy if exists notificationaction_prisma_guc on public."NotificationAction";
    create policy notificationaction_prisma_guc on public."NotificationAction"
      for all to asistan_app
      using (
        exists (
          select 1 from public."Notification" n
          where n.id = "notificationId"
            and n."businessId" = nullif(current_setting('app.business_id', true), '')
        )
      )
      with check (
        exists (
          select 1 from public."Notification" n
          where n.id = "notificationId"
            and n."businessId" = nullif(current_setting('app.business_id', true), '')
        )
      );
  end if;
end $$;

-- ── Person / GPI — asistan_identity only (not asistan_app) ──────────────────

do $$
declare
  t text;
begin
  foreach t in array array['Person', 'PersonIdentityMatch', 'BookingIdempotency']
  loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    -- Deny asistan_app explicitly
    execute format('drop policy if exists %I_deny_app on public.%I', lower(t), t);
    execute format(
      'create policy %I_deny_app on public.%I for all to asistan_app using (false) with check (false)',
      lower(t),
      t
    );
    -- Allow asistan_identity full access (identity jobs use this role)
    execute format('drop policy if exists %I_identity on public.%I', lower(t), t);
    execute format(
      'create policy %I_identity on public.%I for all to asistan_identity using (true) with check (true)',
      lower(t),
      t
    );
  end loop;
end $$;

comment on role asistan_app is 'Asistan clinic runtime Prisma role — GUC app.business_id required; no BYPASSRLS';
comment on role asistan_identity is 'Asistan Person/GPI Prisma role — separate from clinic tenant GUC';
