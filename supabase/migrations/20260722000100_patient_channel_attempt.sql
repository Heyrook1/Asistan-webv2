-- Patient outbound channel attempt log (SMS / WhatsApp / email delivery %).
-- No PII contact values — status + channel only for ops gate ≥80%.

CREATE TABLE IF NOT EXISTS "PatientChannelAttempt" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" text NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
  "appointmentId" text,
  "channel" text NOT NULL,
  "status" text NOT NULL,
  "provider" text,
  "kind" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "PatientChannelAttempt_businessId_createdAt_idx"
  ON "PatientChannelAttempt" ("businessId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "PatientChannelAttempt_businessId_status_createdAt_idx"
  ON "PatientChannelAttempt" ("businessId", "status", "createdAt" DESC);

ALTER TABLE "PatientChannelAttempt" ENABLE ROW LEVEL SECURITY;
