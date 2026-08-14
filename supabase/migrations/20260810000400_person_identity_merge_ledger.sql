-- P1-03: identity merge ledger for accept/undo (clinic-scoped patient re-point).
CREATE TABLE IF NOT EXISTS "PersonIdentityMergeLedger" (
  "id" TEXT PRIMARY KEY,
  "businessId" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "leftPersonId" TEXT NOT NULL,
  "rightPersonId" TEXT NOT NULL,
  "score" DECIMAL(4,3) NOT NULL,
  "patientIdsMoved" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "summary" JSONB,
  "acceptedBy" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "undoneAt" TIMESTAMP(3),
  "undoneBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PersonIdentityMergeLedger_businessId_acceptedAt_idx"
  ON "PersonIdentityMergeLedger" ("businessId", "acceptedAt" DESC);

CREATE INDEX IF NOT EXISTS "PersonIdentityMergeLedger_matchId_idx"
  ON "PersonIdentityMergeLedger" ("matchId");

CREATE INDEX IF NOT EXISTS "PersonIdentityMergeLedger_undoneAt_idx"
  ON "PersonIdentityMergeLedger" ("undoneAt");

-- ----------------------------------------------------------------------------
-- RLS: deny PostgREST (anon/authenticated), same posture as Person /
-- PersonIdentityMatch in 20260716000100_person_identity_rls.sql.
--
-- This ledger holds businessId, cross-clinic person ids and merge summaries.
-- Access is Prisma / service-role only; Prisma bypasses RLS, so these policies
-- exist to close the Supabase-client door rather than to grant anything.
-- Canonical map: lib/security/rls-inventory.ts
-- ----------------------------------------------------------------------------

ALTER TABLE "PersonIdentityMergeLedger" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "person_identity_merge_ledger_deny_authenticated" ON "PersonIdentityMergeLedger";
CREATE POLICY "person_identity_merge_ledger_deny_authenticated" ON "PersonIdentityMergeLedger"
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "person_identity_merge_ledger_deny_anon" ON "PersonIdentityMergeLedger";
CREATE POLICY "person_identity_merge_ledger_deny_anon" ON "PersonIdentityMergeLedger"
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
