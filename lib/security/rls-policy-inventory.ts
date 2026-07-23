/**
 * RLS policy expectations for PHI / tenant tables (PascalCase).
 * Used by verify-production-readiness + audit-rls-policies.
 *
 * Prisma bypasses RLS — these policies protect anon/authenticated PostgREST access.
 */

/** Must reference businessId via is_business_member / has_business_permission in ≥1 policy */
export const RLS_BUSINESS_ID_SCOPED_TABLES = [
  'Location',
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
  'Conversation',
  'Reminder',
  'PushSubscription',
  'IntakeForm',
  'IntakeInvite',
  'IntakeResponse',
  'Prescription',
  'CalendarConnection',
  'ServiceStaff',
  'TeamMemberAvailability',
  'TeamMemberUnavailableBlock',
  'VendorAccount',
  'MembershipPayment',
  'ClinicInvoice',
  'FrontDeskSession',
  'Review',
  'AuditLog',
  'DataDeletionRequest',
  'ComplianceDocument',
] as const

/** Child/join tables — policy must reference parent business scope */
export const RLS_PARENT_SCOPED_TABLES = [
  { table: 'PrescriptionLine', parent: 'Prescription' },
  { table: 'NotificationAction', parent: 'Notification' },
  { table: 'Message', parent: 'Conversation' },
  { table: 'MessageAttachment', parent: 'Message' },
  { table: 'MessageReaction', parent: 'Message' },
  { table: 'ConversationParticipant', parent: 'Conversation' },
] as const

/** PostgREST closed — explicit deny for anon + authenticated */
export const RLS_DENY_POSTGREST_TABLES = [
  'Person',
  'PersonIdentityMatch',
  'BookingIdempotency',
  'Waitlist',
  'TourismLead',
] as const

/** No businessId column — membership via Business.id or User self */
export const RLS_SPECIAL_TABLES = ['Business', 'User', 'ClientUser', 'ClientNotification'] as const

/** User-owned rows — auth.uid() match (KVKK consent, client profile) */
export const RLS_SELF_SCOPED_TABLES = ['UserConsent', 'ClientUser'] as const

export function listBusinessIdScopedTables() {
  return [...RLS_BUSINESS_ID_SCOPED_TABLES]
}

export function listDenyPostgrestTables() {
  return [...RLS_DENY_POSTGREST_TABLES]
}

export function listParentScopedTableNames() {
  return RLS_PARENT_SCOPED_TABLES.map((item) => item.table)
}

export function listSelfScopedTableNames() {
  return [...RLS_SELF_SCOPED_TABLES]
}

/** Policy qual/with_check must mention business tenant isolation (direct or via security definer helpers) */
export function policyLooksBusinessScoped(qual: string | null, withCheck: string | null): boolean {
  const text = `${qual ?? ''} ${withCheck ?? ''}`
  return (
    text.includes('businessId') ||
    text.includes('is_business_member') ||
    text.includes('has_business_permission') ||
    text.includes('is_business_member_text') ||
    text.includes('is_conversation_participant') ||
    text.includes('patient_belongs_to_business')
  )
}

export function policyLooksSelfScoped(qual: string | null, withCheck: string | null): boolean {
  const text = `${qual ?? ''} ${withCheck ?? ''}`
  return text.includes('auth.uid()')
}

export function policyLooksDenyAll(qual: string | null, withCheck: string | null): boolean {
  const text = `${qual ?? ''} ${withCheck ?? ''}`.replace(/\s+/g, ' ')
  return text.includes('false') || text === ''
}
