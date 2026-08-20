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
ALTER TABLE "NotificationOutbox" FORCE ROW LEVEL SECURITY;

-- Policies live in 20260808000100_notification_outbox_rls.sql (also applied below for
-- standalone apply-notification-outbox.mjs runs that only read this file).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asistan_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."NotificationOutbox" TO asistan_app;
  END IF;

  DROP POLICY IF EXISTS notification_outbox_deny_anon ON public."NotificationOutbox";
  CREATE POLICY notification_outbox_deny_anon ON public."NotificationOutbox"
    FOR ALL TO anon USING (false) WITH CHECK (false);

  DROP POLICY IF EXISTS notification_outbox_deny_authenticated ON public."NotificationOutbox";
  CREATE POLICY notification_outbox_deny_authenticated ON public."NotificationOutbox"
    FOR ALL TO authenticated USING (false) WITH CHECK (false);

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asistan_app') THEN
    DROP POLICY IF EXISTS notification_outbox_prisma_guc ON public."NotificationOutbox";
    CREATE POLICY notification_outbox_prisma_guc ON public."NotificationOutbox"
      FOR ALL TO asistan_app
      USING (
        nullif(current_setting('app.business_id', true), '') IS NOT NULL
        AND "businessId" = current_setting('app.business_id', true)
      )
      WITH CHECK (
        nullif(current_setting('app.business_id', true), '') IS NOT NULL
        AND "businessId" = current_setting('app.business_id', true)
      );
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;
