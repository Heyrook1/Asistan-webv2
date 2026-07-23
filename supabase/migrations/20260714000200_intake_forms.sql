-- Pre-visit intake forms → patient chart

do $$ begin
  alter type "TimelineEventType" add value 'INTAKE_SUBMITTED';
exception when others then null;
end $$;

do $$ begin
  create type "IntakeFieldType" as enum ('TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'PHONE', 'DATE');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "IntakeInviteStatus" as enum ('PENDING', 'SUBMITTED', 'EXPIRED', 'REVOKED');
exception when duplicate_object then null;
end $$;

create table if not exists "IntakeForm" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "name" text not null,
  "description" text,
  "fields" jsonb not null default '[]'::jsonb,
  "isActive" boolean not null default true,
  "isDefault" boolean not null default false,
  "deletedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "IntakeForm_business_active_idx" on "IntakeForm" ("businessId", "isActive");
create index if not exists "IntakeForm_business_default_idx" on "IntakeForm" ("businessId", "isDefault");

alter table "Service"
  add column if not exists "intakeFormId" text references "IntakeForm"("id") on delete set null;

create index if not exists "Service_intakeFormId_idx" on "Service" ("intakeFormId");

create table if not exists "IntakeInvite" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "formId" text not null references "IntakeForm"("id") on delete cascade,
  "appointmentId" text not null unique references "Appointment"("id") on delete cascade,
  "patientId" text not null references "Patient"("id") on delete cascade,
  "tokenHash" text not null unique,
  "status" "IntakeInviteStatus" not null default 'PENDING',
  "expiresAt" timestamptz not null,
  "submittedAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "IntakeInvite_business_status_idx" on "IntakeInvite" ("businessId", "status");
create index if not exists "IntakeInvite_patient_status_idx" on "IntakeInvite" ("patientId", "status");
create index if not exists "IntakeInvite_form_idx" on "IntakeInvite" ("formId");

create table if not exists "IntakeResponse" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "formId" text not null references "IntakeForm"("id") on delete cascade,
  "inviteId" text not null unique references "IntakeInvite"("id") on delete cascade,
  "appointmentId" text not null unique references "Appointment"("id") on delete cascade,
  "patientId" text not null references "Patient"("id") on delete cascade,
  "answers" jsonb not null,
  "formSnapshot" jsonb not null,
  "submittedAt" timestamptz not null default now()
);

create index if not exists "IntakeResponse_patient_submitted_idx"
  on "IntakeResponse" ("businessId", "patientId", "submittedAt");
