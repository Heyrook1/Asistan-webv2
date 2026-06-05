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
  "id"        uuid primary key default gen_random_uuid(),
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
  "id"           uuid primary key default gen_random_uuid(),
  "name"         text not null,
  "slug"         text unique not null,
  "ownerUserId"  uuid unique not null references "User"("id") on delete restrict,
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
  "id"          uuid primary key default gen_random_uuid(),
  "businessId"  uuid not null references "Business"("id") on delete cascade,
  "userId"      uuid references "User"("id") on delete set null,
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
  "id"                    uuid primary key default gen_random_uuid(),
  "businessId"            uuid not null references "Business"("id") on delete cascade,
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
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "patientId"  uuid not null references "Patient"("id")  on delete cascade,
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
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "patientId"  uuid not null references "Patient"("id")  on delete cascade,
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
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "patientId"  uuid not null references "Patient"("id")  on delete cascade,
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
  "id"          uuid primary key default gen_random_uuid(),
  "businessId"  uuid not null references "Business"("id") on delete cascade,
  "patientId"   uuid not null references "Patient"("id")  on delete cascade,
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
  "id"          uuid primary key default gen_random_uuid(),
  "businessId"  uuid not null references "Business"("id") on delete cascade,
  "patientId"   uuid not null references "Patient"("id")  on delete cascade,
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
  "id"          uuid primary key default gen_random_uuid(),
  "businessId"  uuid not null references "Business"("id") on delete cascade,
  "patientId"   uuid not null references "Patient"("id")  on delete cascade,
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
  "id"          uuid primary key default gen_random_uuid(),
  "businessId"  uuid not null references "Business"("id") on delete cascade,
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
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id")    on delete cascade,
  "patientId"  uuid not null references "Patient"("id")     on delete cascade,
  "serviceId"  uuid not null references "Service"("id")     on delete restrict,
  "staffId"    uuid          references "TeamMember"("id")  on delete set null,
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
  "id"          uuid primary key default gen_random_uuid(),
  "businessId"  uuid not null references "Business"("id") on delete cascade,
  "patientId"   uuid          references "Patient"("id")  on delete cascade,
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
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "userId"     uuid          references "User"("id")     on delete cascade,
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
