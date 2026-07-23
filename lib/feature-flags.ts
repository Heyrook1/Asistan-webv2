/**
 * Lightweight product flags — no DB migration.
 * Toggle via env (ASISTAN_FLAG_*) or edit defaults here.
 */
export type FeatureFlagKey =
  | 'announcements'
  | 'ownerAuditLog'
  | 'advancedAnalytics'
  | 'supportMode'
  | 'patientExport'
  | 'financeExport'
  | 'calendarSync'
  | 'selfServeBilling'
  /** Staff-only in-app chat. Off by default — use WhatsApp/SMS patient channels instead. */
  | 'teamMessaging'
  /** Honest ops overview on /dashboard/analitik. Off via ASISTAN_FLAG_CLINIC_ANALYTICS=false. */
  | 'clinicAnalytics'
  /** Rules-only open-slot + returning-patient shortlist on Genel Bakış / Ajanda. */
  | 'fillTheGap'
  /** WhatsApp rules front-desk booking on slot engine (not LLM claim). */
  | 'whatsappBookingAgent'

const DEFAULTS: Record<FeatureFlagKey, boolean> = {
  announcements: true,
  ownerAuditLog: true,
  // Funnel / utilization — opt-in; overview report does not require these.
  advancedAnalytics: false,
  supportMode: true,
  patientExport: true,
  financeExport: true,
  // On by default when Google env credentials are present (gated in isGoogleCalendarSyncEnabled).
  calendarSync: true,
  selfServeBilling: true,
  // Frozen: rebuilding Slack/WhatsApp in-product is not the product. Opt-in only.
  teamMessaging: false,
  // Honest ops overview (DB counts + CSV/PDF). No invented fill %.
  clinicAnalytics: true,
  // Ops shortlist — not Revenue Intelligence / ML fill %.
  fillTheGap: true,
  // Inbound WhatsApp booking agent — on when clinic enables + webhook auth.
  whatsappBookingAgent: true,
}

function envOverride(key: FeatureFlagKey): boolean | null {
  const raw = process.env[`ASISTAN_FLAG_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`]
  // Also accept ASISTAN_FLAG_ANNOUNCEMENTS style via explicit map
  const map: Record<FeatureFlagKey, string> = {
    announcements: 'ASISTAN_FLAG_ANNOUNCEMENTS',
    ownerAuditLog: 'ASISTAN_FLAG_OWNER_AUDIT_LOG',
    advancedAnalytics: 'ASISTAN_FLAG_ADVANCED_ANALYTICS',
    supportMode: 'ASISTAN_FLAG_SUPPORT_MODE',
    patientExport: 'ASISTAN_FLAG_PATIENT_EXPORT',
    financeExport: 'ASISTAN_FLAG_FINANCE_EXPORT',
    calendarSync: 'ASISTAN_FLAG_CALENDAR_SYNC',
    selfServeBilling: 'ASISTAN_FLAG_SELF_SERVE_BILLING',
    teamMessaging: 'ASISTAN_FLAG_TEAM_MESSAGING',
    clinicAnalytics: 'ASISTAN_FLAG_CLINIC_ANALYTICS',
    fillTheGap: 'ASISTAN_FLAG_FILL_THE_GAP',
    whatsappBookingAgent: 'ASISTAN_FLAG_WHATSAPP_BOOKING_AGENT',
  }
  const value = process.env[map[key]] ?? raw
  if (value == null) return null
  if (value === '1' || value.toLowerCase() === 'true') return true
  if (value === '0' || value.toLowerCase() === 'false') return false
  return null
}

export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  const override = envOverride(key)
  if (override != null) return override
  return DEFAULTS[key]
}
