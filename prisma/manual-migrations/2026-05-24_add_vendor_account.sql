DO $$
BEGIN
  CREATE TYPE "VendorMembershipStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "VendorAccount" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL,
  "status" "VendorMembershipStatus" NOT NULL DEFAULT 'TRIAL',
  "plan" TEXT NOT NULL DEFAULT 'STARTER',
  "balance" NUMERIC(12, 2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "VendorAccount_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "VendorAccount_businessId_fkey"
    FOREIGN KEY ("businessId") REFERENCES "Business" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VendorAccount_businessId_key" UNIQUE ("businessId")
);

CREATE INDEX IF NOT EXISTS "VendorAccount_status_idx" ON "VendorAccount" ("status");
