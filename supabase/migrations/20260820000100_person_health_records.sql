-- ============================================================================
-- Asistan Passport V2 — patient-owned (Person-scoped) health records
-- Date: 2026-08-20
--
-- Additive: enums + tables (IF NOT EXISTS) + FORCE RLS + asistan_app grants
-- gated by app.person_id GUC — mirroring 20260721000500_client_person_passport.sql.
-- NOT businessId-scoped. PostgREST (anon/authenticated) is explicitly denied.
-- ============================================================================

do $$ begin
  create type "HealthRecordSource" as enum (
    'PATIENT_ENTERED', 'CLINIC_ENTERED', 'PROVIDER_ENTERED', 'SYSTEM_IMPORTED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "PersonMedicationStatus" as enum ('ACTIVE', 'ENDED', 'ARCHIVED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "PersonAllergySeverity" as enum ('MILD', 'MODERATE', 'SEVERE', 'UNKNOWN');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "PersonDocumentCategory" as enum (
    'LAB_RESULT', 'MEDICAL_REPORT', 'IMAGING', 'PRESCRIPTION',
    'VISIT_DOCUMENT', 'REFERRAL', 'OTHER'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "HealthRecordVisibility" as enum ('PRIVATE', 'SHAREABLE');
exception when duplicate_object then null;
end $$;

create table if not exists "PersonMedication" (
  "id" text primary key default gen_random_uuid()::text,
  "personId" text not null references "Person"("id") on delete cascade,
  "name" text not null,
  "strength" text,
  "form" text,
  "frequency" text,
  "startDate" timestamptz,
  "endDate" timestamptz,
  "instructions" text,
  "notes" text,
  "status" "PersonMedicationStatus" not null default 'ACTIVE',
  "stoppedAt" timestamptz,
  "sourceType" "HealthRecordSource" not null default 'PATIENT_ENTERED',
  "sourceClinicId" text,
  "sourceProviderId" text,
  "createdByClientUserId" text,
  "visibility" "HealthRecordVisibility" not null default 'PRIVATE',
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "PersonMedication_personId_status_idx"
  on "PersonMedication" ("personId", "status");
create index if not exists "PersonMedication_personId_deletedAt_idx"
  on "PersonMedication" ("personId", "deletedAt");

create table if not exists "PersonAllergy" (
  "id" text primary key default gen_random_uuid()::text,
  "personId" text not null references "Person"("id") on delete cascade,
  "name" text not null,
  "reaction" text,
  "severity" "PersonAllergySeverity" not null default 'UNKNOWN',
  "firstObservedAt" timestamptz,
  "notes" text,
  "sourceType" "HealthRecordSource" not null default 'PATIENT_ENTERED',
  "sourceClinicId" text,
  "sourceProviderId" text,
  "createdByClientUserId" text,
  "visibility" "HealthRecordVisibility" not null default 'PRIVATE',
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "PersonAllergy_personId_idx"
  on "PersonAllergy" ("personId");
create index if not exists "PersonAllergy_personId_deletedAt_idx"
  on "PersonAllergy" ("personId", "deletedAt");

create table if not exists "PersonDocument" (
  "id" text primary key default gen_random_uuid()::text,
  "personId" text not null references "Person"("id") on delete cascade,
  "title" text not null,
  "category" "PersonDocumentCategory" not null default 'OTHER',
  "storageKey" text not null unique,
  "mimeType" text not null,
  "fileSize" integer not null,
  "documentDate" timestamptz,
  "notes" text,
  "sourceType" "HealthRecordSource" not null default 'PATIENT_ENTERED',
  "sourceClinicId" text,
  "sourceProviderId" text,
  "uploadedByClientUserId" text,
  "visibility" "HealthRecordVisibility" not null default 'PRIVATE',
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "PersonDocument_personId_category_idx"
  on "PersonDocument" ("personId", "category");
create index if not exists "PersonDocument_personId_deletedAt_idx"
  on "PersonDocument" ("personId", "deletedAt");

-- FORCE RLS + person GUC policy for Prisma (asistan_app). Deny PostgREST.
do $$
declare
  tbl text;
  pol text;
begin
  if not exists (select 1 from pg_roles where rolname = 'asistan_app') then
    return;
  end if;

  grant usage on type "HealthRecordSource" to asistan_app;
  grant usage on type "PersonMedicationStatus" to asistan_app;
  grant usage on type "PersonAllergySeverity" to asistan_app;
  grant usage on type "PersonDocumentCategory" to asistan_app;
  grant usage on type "HealthRecordVisibility" to asistan_app;

  foreach tbl in array array['PersonMedication', 'PersonAllergy', 'PersonDocument']
  loop
    if to_regclass(format('public.%I', tbl)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', tbl);
    execute format('alter table public.%I force row level security', tbl);
    execute format(
      'grant select, insert, update, delete on public.%I to asistan_app',
      tbl
    );

    pol := lower(tbl) || '_person_guc';
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = tbl and policyname = pol
    ) then
      execute format(
        'create policy %I on public.%I for all to asistan_app'
        || ' using ("personId" = nullif(current_setting(''app.person_id'', true), ''''))'
        || ' with check ("personId" = nullif(current_setting(''app.person_id'', true), ''''))',
        pol,
        tbl
      );
    end if;

    -- PostgREST closed: explicit deny for anon + authenticated (Prisma uses asistan_app).
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = tbl and policyname = lower(tbl) || '_deny_authenticated'
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (false) with check (false)',
        lower(tbl) || '_deny_authenticated',
        tbl
      );
    end if;
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = tbl and policyname = lower(tbl) || '_deny_anon'
    ) then
      execute format(
        'create policy %I on public.%I for all to anon using (false) with check (false)',
        lower(tbl) || '_deny_anon',
        tbl
      );
    end if;
  end loop;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;
