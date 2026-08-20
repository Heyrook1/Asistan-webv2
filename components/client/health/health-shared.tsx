'use client'

import { BadgeCheck, User } from 'lucide-react'

import type { Language } from '@/hooks/useLanguage'
import type {
  AllergySeverity,
  DocumentCategory,
  HealthRecordSourceValue,
  MedicationStatus,
} from '@/lib/client-marketplace/health-records/schemas'

type Bi = { tr: string; en: string }

export function formatHealthDate(iso: string | null, language: Language): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const MEDICATION_STATUS_LABELS: Record<MedicationStatus, Bi> = {
  ACTIVE: { tr: 'Aktif', en: 'Active' },
  ENDED: { tr: 'Sonlandırıldı', en: 'Stopped' },
  ARCHIVED: { tr: 'Arşivlendi', en: 'Archived' },
}

export const ALLERGY_SEVERITY_LABELS: Record<AllergySeverity, Bi> = {
  MILD: { tr: 'Hafif', en: 'Mild' },
  MODERATE: { tr: 'Orta', en: 'Moderate' },
  SEVERE: { tr: 'Şiddetli', en: 'Severe' },
  UNKNOWN: { tr: 'Belirsiz', en: 'Unknown' },
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, Bi> = {
  LAB_RESULT: { tr: 'Laboratuvar sonucu', en: 'Lab result' },
  MEDICAL_REPORT: { tr: 'Tıbbi rapor', en: 'Medical report' },
  IMAGING: { tr: 'Görüntüleme', en: 'Imaging' },
  PRESCRIPTION: { tr: 'Reçete', en: 'Prescription' },
  VISIT_DOCUMENT: { tr: 'Ziyaret belgesi', en: 'Visit document' },
  REFERRAL: { tr: 'Sevk', en: 'Referral' },
  OTHER: { tr: 'Diğer', en: 'Other' },
}

/** Restrained severity color — no panic-oriented design. */
export function severityToneClass(severity: AllergySeverity): string {
  switch (severity) {
    case 'SEVERE':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
    case 'MODERATE':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    case 'MILD':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  }
}

/** Provenance chip — only "verified" chrome when the source is genuinely a clinic. */
export function SourceBadge({
  source,
  language,
}: {
  source: HealthRecordSourceValue
  language: Language
}) {
  const isPatient = source === 'PATIENT_ENTERED'
  const label = isPatient
    ? language === 'tr'
      ? 'Kendiniz eklediniz'
      : 'Added by you'
    : language === 'tr'
      ? 'Klinik tarafından eklendi'
      : 'Added by clinic'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isPatient ? 'bg-slate-100 text-slate-600' : 'bg-[var(--rz-blue-soft)] text-[var(--rz-blue)]'
      }`}
    >
      {isPatient ? <User className="size-3" aria-hidden /> : <BadgeCheck className="size-3" aria-hidden />}
      {label}
    </span>
  )
}

export const OFFLINE_COPY = {
  tr: 'İnternet bağlantısı gerekli',
  en: 'An internet connection is required',
} as const

/** Writes to health records must not succeed (or look like they did) while offline. */
export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}
