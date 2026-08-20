/**
 * User-facing Turkish labels for internal enums / ops codes.
 * Keep DB/API values as-is; never render raw codes in clinic UI.
 */

export const ALLERGY_SEVERITY_LABELS = {
  HAFIF: 'Hafif',
  ORTA: 'Orta',
  SIDDETLI: 'Şiddetli',
} as const

export type AllergySeverityCode = keyof typeof ALLERGY_SEVERITY_LABELS

export function labelAllergySeverity(code: string | null | undefined): string {
  if (!code) return '—'
  return ALLERGY_SEVERITY_LABELS[code as AllergySeverityCode] ?? '—'
}

export const INTAKE_FIELD_TYPE_LABELS = {
  TEXT: 'Kısa metin',
  TEXTAREA: 'Uzun metin',
  SELECT: 'Seçim listesi',
  CHECKBOX: 'Onay kutusu',
  PHONE: 'Telefon',
  DATE: 'Tarih',
} as const

export type IntakeFieldTypeCode = keyof typeof INTAKE_FIELD_TYPE_LABELS

export function labelIntakeFieldType(code: string): string {
  return INTAKE_FIELD_TYPE_LABELS[code as IntakeFieldTypeCode] ?? 'Alan'
}

export const INTAKE_INVITE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  SUBMITTED: 'Gönderildi',
  EXPIRED: 'Süresi doldu',
  REVOKED: 'İptal edildi',
}

export function labelIntakeInviteStatus(code: string): string {
  return INTAKE_INVITE_STATUS_LABELS[code] ?? 'Durum bilinmiyor'
}

export const AUDIT_SEVERITY_LABELS: Record<string, string> = {
  DEBUG: 'Hata ayıklama',
  INFO: 'Bilgi',
  WARN: 'Uyarı',
  ERROR: 'Hata',
  CRITICAL: 'Kritik',
}

export function labelAuditSeverity(code: string): string {
  return AUDIT_SEVERITY_LABELS[code] ?? code
}

export const DATA_DELETION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor',
  IN_REVIEW: 'İnceleniyor',
  COMPLETED: 'Tamamlandı',
  REJECTED: 'Reddedildi',
}

export function labelDataDeletionStatus(code: string): string {
  return DATA_DELETION_STATUS_LABELS[code] ?? 'Durum bilinmiyor'
}

export const COMPLIANCE_DOC_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif',
  ARCHIVED: 'Arşiv',
  DRAFT: 'Taslak',
}

export function labelComplianceDocStatus(code: string): string {
  return COMPLIANCE_DOC_STATUS_LABELS[code] ?? code
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Taslak',
  READY: 'Yazdırılabilir',
  SUBMITTED: 'Gönderildi',
  FAILED: 'Hata',
  VOID: 'İptal',
}

export function labelInvoiceStatus(code: string): string {
  return INVOICE_STATUS_LABELS[code] ?? 'Durum bilinmiyor'
}

export const PRESCRIPTION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Taslak',
  ISSUED: 'Düzenlendi',
  CANCELLED: 'İptal',
}

export function labelPrescriptionStatus(code: string): string {
  return PRESCRIPTION_STATUS_LABELS[code] ?? 'Durum bilinmiyor'
}

export const TIMELINE_EVENT_TYPE_LABELS: Record<string, string> = {
  PATIENT_CREATED: 'Hasta kaydı',
  PATIENT_UPDATED: 'Hasta güncellendi',
  NOTE_ADDED: 'Not eklendi',
  MEDICATION_ADDED: 'İlaç eklendi',
  ALLERGY_ADDED: 'Alerji eklendi',
  TREATMENT_ADDED: 'Tedavi eklendi',
  LAB_RESULT_ADDED: 'Tahlil eklendi',
  FILE_UPLOADED: 'Dosya yüklendi',
  APPOINTMENT_CREATED: 'Randevu oluşturuldu',
  APPOINTMENT_UPDATED: 'Randevu güncellendi',
  APPOINTMENT_COMPLETED: 'Randevu tamamlandı',
  APPOINTMENT_CANCELLED: 'Randevu iptal',
  INTAKE_SUBMITTED: 'Anket gönderildi',
}

export function labelTimelineEventType(code: string): string {
  return TIMELINE_EVENT_TYPE_LABELS[code] ?? 'Aktivite'
}

const IDENTITY_MATCH_METHOD_LABELS: Record<string, string> = {
  'suggest:weak-signal': 'Zayıf sinyal önerisi',
  'suggest:score': 'Skor önerisi',
  'auto:dual-strong': 'Otomatik güçlü eşleşme',
  'auto:identity-hash': 'Kimlik doğrulama eşleşmesi',
}

/** Maps PersonIdentityMatch.method (may include |accept / |reject suffix). */
export function labelIdentityMatchMethod(raw: string | null | undefined): string {
  if (!raw) return 'Kimlik önerisi'
  const [base, decision] = raw.split('|')
  const core =
    IDENTITY_MATCH_METHOD_LABELS[base ?? ''] ??
    (base?.startsWith('suggest:')
      ? 'Kimlik eşleşme önerisi'
      : base?.startsWith('auto:')
        ? 'Otomatik eşleşme'
        : 'Kimlik eşleşmesi')
  if (decision === 'accept') return `${core} · kabul edildi`
  if (decision === 'reject') return `${core} · reddedildi`
  return core
}

/** Patterns that must not appear as clinic-facing copy (product UI scan). */
export const USER_FACING_TECH_LEAK_PATTERNS: RegExp[] = [
  /\bSCHEDULED\b/,
  /\bCONFIRMED\b/,
  /\bNO_SHOW\b/,
  /\bSIDDETLI\b/,
  /\bTEXTAREA\b/,
  /\bCHECKBOX\b/,
  /\bsuggest:weak-signal\b/i,
  /\bASISTAN_FLAG_/,
  /\bHTTP\s*ACK\b/i,
  /\bDLR\b/,
  /docs\/[a-z0-9_.-]+\.md/i,
  /\bSMS_PROVIDER_WEBHOOK_URL\b/,
  /\benv ile\b/i,
  />\s*READY\s*</,
  /READY yap/,
  /Yazdırılabilir READY/,
  />\s*INFO\s*</,
  />\s*WARN\s*</,
  />\s*CRITICAL\s*</,
  /\{t\}/, // raw type option render
]

export function looksLikeUserFacingTechLeak(text: string): boolean {
  return USER_FACING_TECH_LEAK_PATTERNS.some((re) => re.test(text))
}
