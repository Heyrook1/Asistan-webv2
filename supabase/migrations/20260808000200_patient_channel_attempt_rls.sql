-- Ensure PatientChannelAttempt exists + RLS policies for production verify.
-- Root cause: 20260722000100 was not in RLS_MIGRATIONS, so many hosts never created the table.

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

DO $$
BEGIN
  IF to_regclass('public."PatientChannelAttempt"') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public."PatientChannelAttempt" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public."PatientChannelAttempt" FORCE ROW LEVEL SECURITY;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asistan_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."PatientChannelAttempt" TO asistan_app;
  END IF;

  -- PostgREST: anon closed
  DROP POLICY IF EXISTS patient_channel_attempt_deny_anon ON public."PatientChannelAttempt";
  CREATE POLICY patient_channel_attempt_deny_anon ON public."PatientChannelAttempt"
    FOR ALL TO anon
    USING (false)
    WITH CHECK (false);

  -- Clinic staff (Supabase JWT) — business membership
  DROP POLICY IF EXISTS patient_channel_attempt_member_select ON public."PatientChannelAttempt";
  CREATE POLICY patient_channel_attempt_member_select ON public."PatientChannelAttempt"
    FOR SELECT TO authenticated
    USING (public.is_business_member("businessId"));

  -- Writes stay Prisma/GUC (not PostgREST)
  DROP POLICY IF EXISTS patient_channel_attempt_deny_authenticated_write ON public."PatientChannelAttempt";
  CREATE POLICY patient_channel_attempt_deny_authenticated_write ON public."PatientChannelAttempt"
    FOR INSERT TO authenticated
    WITH CHECK (false);

  DROP POLICY IF EXISTS patient_channel_attempt_deny_authenticated_update ON public."PatientChannelAttempt";
  CREATE POLICY patient_channel_attempt_deny_authenticated_update ON public."PatientChannelAttempt"
    FOR UPDATE TO authenticated
    USING (false)
    WITH CHECK (false);

  DROP POLICY IF EXISTS patient_channel_attempt_deny_authenticated_delete ON public."PatientChannelAttempt";
  CREATE POLICY patient_channel_attempt_deny_authenticated_delete ON public."PatientChannelAttempt"
    FOR DELETE TO authenticated
    USING (false);

  -- Drop legacy blanket deny if present (blocks member select OR-chain confusion in audits)
  DROP POLICY IF EXISTS patient_channel_attempt_deny_authenticated ON public."PatientChannelAttempt";

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'asistan_app') THEN
    DROP POLICY IF EXISTS patient_channel_attempt_prisma_guc ON public."PatientChannelAttempt";
    CREATE POLICY patient_channel_attempt_prisma_guc ON public."PatientChannelAttempt"
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
