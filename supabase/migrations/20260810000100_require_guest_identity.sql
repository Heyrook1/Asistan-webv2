-- P0.6: Guest book identity is optional by default (data minimization).
-- Clinics may opt in to require KKTC / TC / passport on /book/[slug].
ALTER TABLE "Business"
  ADD COLUMN IF NOT EXISTS "requireGuestIdentity" BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN "Business"."requireGuestIdentity" IS
  'When true, public guest book requires national ID or passport. Default false.';
