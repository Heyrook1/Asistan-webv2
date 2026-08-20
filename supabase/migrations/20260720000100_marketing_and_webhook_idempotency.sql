-- Additive: landing-page capture tables + inbound webhook idempotency.
-- Replaces ad-hoc CREATE TABLE IF NOT EXISTS calls that were previously issued
-- via $executeRawUnsafe from unauthenticated public endpoints.

-- Newsletter opt-ins (public landing page)
create table if not exists "NewsletterSubscriber" (
  "id"        text primary key default gen_random_uuid()::text,
  "email"     text not null unique,
  "createdAt" timestamptz not null default now()
);

-- Guest demo requests (marketing site)
create table if not exists "DemoBooking" (
  "id"        text primary key default gen_random_uuid()::text,
  "name"      text not null,
  "clinic"    text not null,
  "email"     text not null,
  "date"      text not null,
  "time"      text not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists "DemoBooking_createdAt_idx"
  on "DemoBooking" ("createdAt");

-- Inbound webhook event de-duplication (Stripe etc.)
create table if not exists "ProcessedWebhookEvent" (
  "id"          text primary key default gen_random_uuid()::text,
  "provider"    text not null,
  "eventId"     text not null,
  "eventType"   text,
  "processedAt" timestamptz not null default now()
);

create unique index if not exists "ProcessedWebhookEvent_provider_eventId_key"
  on "ProcessedWebhookEvent" ("provider", "eventId");

create index if not exists "ProcessedWebhookEvent_processedAt_idx"
  on "ProcessedWebhookEvent" ("processedAt");
