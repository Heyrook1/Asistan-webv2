/**
 * Confirmed production indexes for hot appointment / patient / notification paths.
 * Source of truth for names: supabase/migrations/20260717000300_production_query_indexes.sql
 */
export const PRODUCTION_QUERY_INDEX_MIGRATION =
  '20260717000300_production_query_indexes.sql'

export const PRODUCTION_QUERY_INDEXES = [
  // Appointment
  'Appointment_businessId_staffId_date_status_idx',
  'Appointment_businessId_status_date_startTime_idx',
  'Appointment_businessId_serviceId_date_idx',
  'Appointment_businessId_patientId_date_idx',
  'Appointment_businessId_deletedAt_date_idx',
  // Patient
  'Patient_businessId_isArchived_updatedAt_idx',
  'Patient_businessId_personId_idx',
  'Patient_tags_gin_idx',
  'Patient_fullName_trgm_idx',
  'Patient_phone_trgm_idx',
  'Patient_email_trgm_idx',
  'Patient_patientNumber_trgm_idx',
  'Patient_identityNumber_trgm_idx',
  // Notification polling
  'Notification_businessId_userId_archivedAt_createdAt_idx',
  'Notification_businessId_archivedAt_createdAt_idx',
  'ClientNotification_clientUserId_createdAt_idx',
] as const

export type ProductionQueryIndex = (typeof PRODUCTION_QUERY_INDEXES)[number]
