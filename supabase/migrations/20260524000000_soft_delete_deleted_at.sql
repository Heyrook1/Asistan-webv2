-- ============================================================================
-- Soft delete baseline: deletedAt columns
-- Date: 2026-05-24
-- ============================================================================

alter table "Business" add column if not exists "deletedAt" timestamptz;
alter table "VendorAccount" add column if not exists "deletedAt" timestamptz;
alter table "TeamMember" add column if not exists "deletedAt" timestamptz;

alter table "Patient" add column if not exists "deletedAt" timestamptz;
alter table "PatientNote" add column if not exists "deletedAt" timestamptz;
alter table "Medication" add column if not exists "deletedAt" timestamptz;
alter table "Allergy" add column if not exists "deletedAt" timestamptz;
alter table "Treatment" add column if not exists "deletedAt" timestamptz;
alter table "TreatmentPlanItem" add column if not exists "deletedAt" timestamptz;
alter table "LabResult" add column if not exists "deletedAt" timestamptz;
alter table "PatientFile" add column if not exists "deletedAt" timestamptz;

alter table "Service" add column if not exists "deletedAt" timestamptz;
alter table "Appointment" add column if not exists "deletedAt" timestamptz;

alter table "TimelineEvent" add column if not exists "deletedAt" timestamptz;
alter table "Notification" add column if not exists "deletedAt" timestamptz;
alter table "NotificationAction" add column if not exists "deletedAt" timestamptz;
alter table "PushSubscription" add column if not exists "deletedAt" timestamptz;
alter table "Reminder" add column if not exists "deletedAt" timestamptz;

alter table "Conversation" add column if not exists "deletedAt" timestamptz;
alter table "ConversationParticipant" add column if not exists "deletedAt" timestamptz;
alter table "MessageAttachment" add column if not exists "deletedAt" timestamptz;
alter table "MessageReaction" add column if not exists "deletedAt" timestamptz;

create index if not exists "TeamMember_business_deletedAt_idx"
  on "TeamMember" ("businessId", "deletedAt");

create index if not exists "Patient_business_deletedAt_idx"
  on "Patient" ("businessId", "deletedAt");

create index if not exists "Service_business_deletedAt_idx"
  on "Service" ("businessId", "deletedAt");

create index if not exists "Appointment_business_deletedAt_idx"
  on "Appointment" ("businessId", "deletedAt");

create index if not exists "Reminder_business_user_deletedAt_idx"
  on "Reminder" ("businessId", "userId", "deletedAt");

create index if not exists "Conversation_business_deletedAt_idx"
  on "Conversation" ("businessId", "deletedAt");

