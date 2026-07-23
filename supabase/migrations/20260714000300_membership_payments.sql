-- Self-serve membership payments (manual invoice + Stripe-ready)

do $$ begin
  create type "MembershipPaymentStatus" as enum ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "MembershipBillingPeriod" as enum ('MONTHLY', 'YEARLY');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type "MembershipPaymentProvider" as enum ('MANUAL', 'STRIPE');
exception when duplicate_object then null;
end $$;

create table if not exists "MembershipPayment" (
  "id" text primary key default gen_random_uuid()::text,
  "businessId" text not null references "Business"("id") on delete cascade,
  "planCode" text not null,
  "billingPeriod" "MembershipBillingPeriod" not null,
  "amount" numeric(12, 2) not null,
  "currency" text not null default 'EUR',
  "status" "MembershipPaymentStatus" not null default 'PENDING',
  "provider" "MembershipPaymentProvider" not null default 'MANUAL',
  "providerRef" text,
  "checkoutUrl" text,
  "packageDurationDays" integer not null,
  "requestedByUserId" text,
  "paidAt" timestamptz,
  "expiresAt" timestamptz,
  "notes" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "MembershipPayment_business_status_idx"
  on "MembershipPayment" ("businessId", "status");
create index if not exists "MembershipPayment_providerRef_idx"
  on "MembershipPayment" ("providerRef");
create index if not exists "MembershipPayment_status_created_idx"
  on "MembershipPayment" ("status", "createdAt");
