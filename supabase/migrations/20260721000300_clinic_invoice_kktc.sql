-- Q4: KKTC e-Fatura draft invoices (not TR GİB e-SMM)

do $$ begin
  create type "ClinicInvoiceStatus" as enum (
    'DRAFT', 'READY', 'SUBMITTED', 'FAILED', 'VOID'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "ClinicInvoiceKind" as enum (
    'SERVICE',   -- KKTC hizmet / e-fatura yolu
    'SMM_TR'     -- TR e-SMM placeholder only — not submitted from KKTC product
  );
exception when duplicate_object then null;
end $$;

alter table "Business"
  add column if not exists "invoiceEnabled" boolean not null default false,
  add column if not exists "taxVkn" text,
  add column if not exists "taxOffice" text,
  add column if not exists "invoiceTitle" text,
  add column if not exists "invoiceAddress" text;

create table if not exists "ClinicInvoice" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "appointmentId" text references "Appointment"("id") on delete set null,
  "patientId" text references "Patient"("id") on delete set null,
  "kind" "ClinicInvoiceKind" not null default 'SERVICE',
  "status" "ClinicInvoiceStatus" not null default 'DRAFT',
  "number" text,
  "currency" text not null default 'TRY',
  "subtotal" numeric(12, 2) not null default 0,
  "taxRate" numeric(5, 2) not null default 0,
  "taxAmount" numeric(12, 2) not null default 0,
  "total" numeric(12, 2) not null default 0,
  "buyerName" text,
  "buyerTaxId" text,
  "lineItems" jsonb not null default '[]'::jsonb,
  "notes" text,
  "provider" text,
  "providerRef" text,
  "ublPayload" jsonb,
  "lastError" text,
  "issuedAt" timestamptz,
  "submittedAt" timestamptz,
  "createdByUserId" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "ClinicInvoice_business_status_idx"
  on "ClinicInvoice" ("businessId", "status");
create index if not exists "ClinicInvoice_business_created_idx"
  on "ClinicInvoice" ("businessId", "createdAt" desc);
create index if not exists "ClinicInvoice_appointment_idx"
  on "ClinicInvoice" ("appointmentId");
create unique index if not exists "ClinicInvoice_business_number_uidx"
  on "ClinicInvoice" ("businessId", "number")
  where "number" is not null;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    grant select, insert, update, delete on table "ClinicInvoice" to asistan_app;
  end if;

  if to_regclass('public."ClinicInvoice"') is not null then
    alter table "ClinicInvoice" enable row level security;
    alter table "ClinicInvoice" force row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'ClinicInvoice'
        and policyname = 'clinic_invoice_prisma_guc'
    ) then
      create policy clinic_invoice_prisma_guc on "ClinicInvoice"
        for all
        to asistan_app
        using (
          nullif(current_setting('app.current_business_id', true), '') is not null
          and "businessId" = current_setting('app.current_business_id', true)
        )
        with check (
          nullif(current_setting('app.current_business_id', true), '') is not null
          and "businessId" = current_setting('app.current_business_id', true)
        );
    end if;
  end if;
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end $$;
