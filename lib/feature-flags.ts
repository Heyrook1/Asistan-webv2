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

const DEFAULTS: Record<FeatureFlagKey, boolean> = {
  announcements: true,
  ownerAuditLog: true,
  advancedAnalytics: true,
  supportMode: true,
  patientExport: true,
  financeExport: true,
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
