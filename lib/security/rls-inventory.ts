/**
 * Canonical Prisma table inventory for Row Level Security.
 *
 * Table names match Prisma model names (quoted PascalCase in Postgres).
 * Legacy snake_case tables from `20260516000100_enable_rls.sql` (providers,
 * customers, …) are historical and must not be used as the production RLS map.
 * Inventory: `lib/security/legacy-schema.ts` · drop: `20260716000200_drop_legacy_snake_schema.sql`
 *
 * Parity migration: `supabase/migrations/20260714000400_rls_prisma_parity.sql`
 * Person / GPI deny-default: `supabase/migrations/20260716000100_person_identity_rls.sql`
 * PHI businessId hardening: `supabase/migrations/20260717000100_rls_phi_business_scope_hardening.sql`
 * Prisma text ids + auth.uid(): `supabase/migrations/20260717000200_rls_auth_uid_text_cast.sql`
 * Prisma GUC role (asistan_app): `supabase/migrations/20260720000200_prisma_guc_rls.sql`
 */

export { LEGACY_SNAKE_RLS_TABLES, listLegacyPublicTables } from '@/lib/security/legacy-schema'

export type RlsExpectation = {
  table: string
  /** Why this table must have RLS when accessed via anon/authenticated Supabase clients */
  reason: string
}

/** Tables covered by the 20260518 + messaging + client + reminders migrations */
export const RLS_BASELINE_TABLES: readonly string[] = [
  'Business',
  'User',
  'TeamMember',
  'Patient',
  'Appointment',
  'Service',
  'PatientNote',
  'Medication',
  'Allergy',
  'Treatment',
  'TreatmentPlanItem',
  'LabResult',
  'PatientFile',
  'TimelineEvent',
  'Notification',
  'NotificationAction',
  'Conversation',
  'ConversationParticipant',
  'Message',
  'MessageAttachment',
  'MessageReaction',
  'Reminder',
  'PushSubscription',
  'ClientUser',
  'ClientNotification',
  'Review',
] as const

/** Tables closed by 20260714000400_rls_prisma_parity.sql */
export const RLS_PARITY_GAP_TABLES: readonly string[] = [
  'Location',
  'VendorAccount',
  'MembershipPayment',
  'ServiceStaff',
  'TeamMemberAvailability',
  'TeamMemberUnavailableBlock',
  'CalendarConnection',
  'IntakeForm',
  'IntakeInvite',
  'IntakeResponse',
  'Prescription',
  'PrescriptionLine',
  'AuditLog',
  'UserConsent',
  'DataDeletionRequest',
  'ComplianceDocument',
  'Waitlist',
] as const

/**
 * Ecosystem / platform tables — RLS enabled with deny-by-default for anon+authenticated.
 * Migration: `20260716000100_person_identity_rls.sql`
 * Access is Prisma / service-role only (PostgREST closed).
 */
export const RLS_ECOSYSTEM_DENY_TABLES: readonly string[] = [
  'Person',
  'PersonIdentityMatch',
  'BookingIdempotency',
] as const

/** Q3 clinic money / front-desk — GUC app.business_id (fixed 20260730) */
export const RLS_Q3_BUSINESS_SCOPED_TABLES: readonly string[] = [
  'AppointmentDeposit',
  'ClinicInvoice',
  'FrontDeskSession',
  'PatientChannelAttempt',
  'NotificationOutbox',
] as const

/**
 * Full required set for production RLS verify (`pnpm check:production`).
 */
export const REQUIRED_RLS_TABLES: readonly RlsExpectation[] = [
  ...RLS_BASELINE_TABLES.map((table) => ({ table, reason: 'baseline PascalCase RLS' })),
  ...RLS_PARITY_GAP_TABLES.map((table) => ({ table, reason: 'parity migration 20260714' })),
  ...RLS_ECOSYSTEM_DENY_TABLES.map((table) => ({
    table,
    reason: 'ecosystem deny-default migration 20260716',
  })),
  ...RLS_Q3_BUSINESS_SCOPED_TABLES.map((table) => ({
    table,
    reason: 'Q3 business GUC RLS (deposit/invoice/front-desk)',
  })),
]

export function listRequiredRlsTableNames() {
  return REQUIRED_RLS_TABLES.map((item) => item.table)
}

export function listRlsParityGapTables() {
  return [...RLS_PARITY_GAP_TABLES]
}
