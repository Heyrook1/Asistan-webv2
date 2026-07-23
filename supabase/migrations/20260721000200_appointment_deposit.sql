-- Q3: Patient appointment deposit + clinic no-show fee policy (additive)

do $$ begin
  create type "AppointmentDepositStatus" as enum (
    'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'WAIVED', 'REFUNDED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "AppointmentDepositProvider" as enum ('MANUAL', 'STRIPE');
exception when duplicate_object then null;
end $$;

alter table "Business"
  add column if not exists "depositEnabled" boolean not null default false,
  add column if not exists "depositAmount" numeric(10, 2),
  add column if not exists "noShowFeeEnabled" boolean not null default false,
  add column if not exists "noShowFeeAmount" numeric(10, 2),
  add column if not exists "noShowFeeNote" text;

create table if not exists "AppointmentDeposit" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "appointmentId" text not null unique references "Appointment"("id") on delete cascade,
  "amount" numeric(10, 2) not null,
  "currency" text not null default 'TRY',
  "status" "AppointmentDepositStatus" not null default 'PENDING',
  "provider" "AppointmentDepositProvider" not null default 'MANUAL',
  "providerRef" text,
  "checkoutUrl" text,
  "instructions" text,
  "paidAt" timestamptz,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "AppointmentDeposit_business_status_idx"
  on "AppointmentDeposit" ("businessId", "status");
create index if not exists "AppointmentDeposit_providerRef_idx"
  on "AppointmentDeposit" ("providerRef");

-- Defense-in-depth: same GUC tenant pattern as MembershipPayment (when asistan_app exists)
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'asistan_app') then
    grant select, insert, update, delete on table "AppointmentDeposit" to asistan_app;
  end if;

  if to_regclass('public."AppointmentDeposit"') is not null then
    alter table "AppointmentDeposit" enable row level security;
    alter table "AppointmentDeposit" force row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'AppointmentDeposit'
        and policyname = 'appointment_deposit_prisma_guc'
    ) then
      create policy appointment_deposit_prisma_guc on "AppointmentDeposit"
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
