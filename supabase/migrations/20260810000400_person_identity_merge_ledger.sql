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
