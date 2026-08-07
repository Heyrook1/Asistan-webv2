-- Durable patient outbound notification queue (retry / backoff).
-- Payload may include destination address — service-role / Prisma only; deny anon.

CREATE TABLE IF NOT EXISTS "NotificationOutbox" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "businessId" text NOT NULL REFERENCES "Business"("id") ON DELETE CASCADE,
  "appointmentId" text,
  "patientId" text,
  "channel" text NOT NULL,
  "kind" text NOT NULL,
  "payload" jsonb NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "attempts" integer NOT NULL DEFAULT 0,
  "nextAttemptAt" timestamptz NOT NULL DEFAULT now(),
  "lastError" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "NotificationOutbox_status_nextAttemptAt_idx"
  ON "NotificationOutbox" ("status", "nextAttemptAt");

CREATE INDEX IF NOT EXISTS "NotificationOutbox_businessId_createdAt_idx"
  ON "NotificationOutbox" ("businessId", "createdAt" DESC);

ALTER TABLE "NotificationOutbox" ENABLE ROW LEVEL SECURITY;
