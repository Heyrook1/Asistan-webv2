-- Idempotency keys for public guest booking (double-submit safe)

create table if not exists "BookingIdempotency" (
  "id" text primary key default gen_random_uuid()::text,
  "keyHash" text not null unique,
  "response" jsonb not null,
  "createdAt" timestamptz not null default now(),
  "expiresAt" timestamptz not null
);

create index if not exists "BookingIdempotency_expiresAt_idx"
  on "BookingIdempotency" ("expiresAt");
