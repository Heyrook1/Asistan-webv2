-- ============================================================================
-- Shareable digital prescription (patient / pharmacy read-only link)
-- Date: 2026-07-17
--
-- Additive: adds a peppered token hash + shared-at marker to Prescription.
-- The raw token is only ever returned once to the issuing clinic; the public
-- read path (/rx/<token>) hashes the incoming token and matches this column.
-- This is a printable clinic prescription share — NOT an official e-reçete
-- network endpoint (see docs/e-recete-boundary.md).
-- ============================================================================

alter table "Prescription"
  add column if not exists "shareTokenHash" text;

alter table "Prescription"
  add column if not exists "sharedAt" timestamp(3);

create unique index if not exists "Prescription_shareTokenHash_key"
  on "Prescription" ("shareTokenHash");
