-- ============================================================================
-- Patient note creator audit FK
-- Date: 2026-05-20
--
-- Keeps the legacy createdBy display snapshot while adding a nullable FK to the
-- actual User row for auditability. New writes should populate createdByUserId.
-- ============================================================================

alter table "PatientNote" add column if not exists "createdByUserId" uuid;

do $$ begin
  alter table "PatientNote"
    add constraint "PatientNote_createdByUserId_fkey"
    foreign key ("createdByUserId") references "User"("id") on delete set null;
exception when duplicate_object then null; end $$;

create index if not exists "PatientNote_createdByUserId_idx" on "PatientNote" ("createdByUserId");
