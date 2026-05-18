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
alter table "Patient" add column if not exists "assignedDoctorId" uuid;

-- Atanmış doktor FK (TeamMember silinirse set null)
do $$ begin
  alter table "Patient"
    add constraint "Patient_assignedDoctorId_fkey"
    foreign key ("assignedDoctorId") references "TeamMember"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "Patient_assignedDoctor_idx" on "Patient" ("businessId", "assignedDoctorId");

-- ── TreatmentPlanItem tablosu ──────────────────────────────────────────────
create table if not exists "TreatmentPlanItem" (
  "id"         uuid primary key default gen_random_uuid(),
  "businessId" uuid not null references "Business"("id") on delete cascade,
  "patientId"  uuid not null references "Patient"("id")  on delete cascade,
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
