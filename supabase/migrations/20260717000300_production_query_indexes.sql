-- ============================================================================
-- Production query indexes — appointments, patient search, notification polling
-- Date: 2026-07-17
--
-- Idempotent. Safe to re-run. Prefer IF NOT EXISTS (non-CONCURRENTLY) so this
-- works inside transactional migration runners used by ensure-db-ready.
-- ============================================================================

create extension if not exists pg_trgm;

-- ── Appointment: availability / booking lock / calendar / lists ─────────────
-- Hot path: businessId + staffId + date + active status (conflict checks)
create index if not exists "Appointment_businessId_staffId_date_status_idx"
  on "Appointment" ("businessId", "staffId", "date", "status");

-- Status-filtered lists + dashboard counts ordered by date/time
create index if not exists "Appointment_businessId_status_date_startTime_idx"
  on "Appointment" ("businessId", "status", "date", "startTime");

-- Service-scoped calendar ranges
create index if not exists "Appointment_businessId_serviceId_date_idx"
  on "Appointment" ("businessId", "serviceId", "date");

-- Patient history ordered by date
create index if not exists "Appointment_businessId_patientId_date_idx"
  on "Appointment" ("businessId", "patientId", "date");

-- Soft-delete scoped tenant scans (middleware injects deletedAt IS NULL)
create index if not exists "Appointment_businessId_deletedAt_date_idx"
  on "Appointment" ("businessId", "deletedAt", "date");

-- ── Patient: list sort + search + booking identity ──────────────────────────
-- Default list: businessId + isArchived + orderBy updatedAt desc
create index if not exists "Patient_businessId_isArchived_updatedAt_idx"
  on "Patient" ("businessId", "isArchived", "updatedAt" desc);

-- Tenant-safe Person → Patient resolution for guest/client booking
create index if not exists "Patient_businessId_personId_idx"
  on "Patient" ("businessId", "personId");

-- tags has / hasSome
create index if not exists "Patient_tags_gin_idx"
  on "Patient" using gin ("tags");

-- Case-insensitive substring search (contains + mode: insensitive)
create index if not exists "Patient_fullName_trgm_idx"
  on "Patient" using gin ((lower("fullName")) gin_trgm_ops);

create index if not exists "Patient_phone_trgm_idx"
  on "Patient" using gin ((lower("phone")) gin_trgm_ops);

create index if not exists "Patient_email_trgm_idx"
  on "Patient" using gin ((lower(coalesce("email", ''))) gin_trgm_ops);

create index if not exists "Patient_patientNumber_trgm_idx"
  on "Patient" using gin ((lower("patientNumber")) gin_trgm_ops);

create index if not exists "Patient_identityNumber_trgm_idx"
  on "Patient" using gin ((lower(coalesce("identityNumber", ''))) gin_trgm_ops);

-- ── Notification polling (/api/notifications/since + inbox) ─────────────────
-- Recipient branch: (userId = me OR userId IS NULL) AND archivedAt IS NULL
-- Ordered by createdAt; filtered by createdAt > after
create index if not exists "Notification_businessId_userId_archivedAt_createdAt_idx"
  on "Notification" ("businessId", "userId", "archivedAt", "createdAt");

-- Broadcast + personal unread inbox without archived noise
create index if not exists "Notification_businessId_archivedAt_createdAt_idx"
  on "Notification" ("businessId", "archivedAt", "createdAt" desc);

-- Client app notification feed (ordered by createdAt, no isRead filter)
create index if not exists "ClientNotification_clientUserId_createdAt_idx"
  on "ClientNotification" ("clientUserId", "createdAt" desc);
