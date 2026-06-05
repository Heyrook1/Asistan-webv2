DO $$
BEGIN
  CREATE TYPE "VendorAccountSource" AS ENUM ('SELF_SIGNUP', 'ADMIN_CREATED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "VendorAccount"
  ADD COLUMN IF NOT EXISTS "source" "VendorAccountSource" NOT NULL DEFAULT 'ADMIN_CREATED',
  ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "accessStartAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "accessEndAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "packageDurationDays" INTEGER;

CREATE INDEX IF NOT EXISTS "VendorAccount_isDemo_accessEndAt_idx"
  ON "VendorAccount" ("isDemo", "accessEndAt");
