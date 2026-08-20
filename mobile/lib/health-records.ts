import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from './api'

/** Server-backed Passport health records (parity with the web PWA APIs). */

export type MedicationStatus = 'ACTIVE' | 'ENDED' | 'ARCHIVED'
export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'UNKNOWN'
export type DocumentCategory =
  | 'LAB_RESULT'
  | 'MEDICAL_REPORT'
  | 'IMAGING'
  | 'PRESCRIPTION'
  | 'VISIT_DOCUMENT'
  | 'REFERRAL'
  | 'OTHER'
export type HealthRecordSource =
  | 'PATIENT_ENTERED'
  | 'CLINIC_ENTERED'
  | 'PROVIDER_ENTERED'
  | 'SYSTEM_IMPORTED'

export type MedicationDto = {
  id: string
  name: string
  strength: string | null
  form: string | null
  frequency: string | null
  startDate: string | null
  endDate: string | null
  stoppedAt: string | null
  instructions: string | null
  notes: string | null
  status: MedicationStatus
  source: HealthRecordSource
  editable: boolean
  createdAt: string
  updatedAt: string
}

export type AllergyDto = {
  id: string
  name: string
  reaction: string | null
  severity: AllergySeverity
  firstObservedAt: string | null
  notes: string | null
  source: HealthRecordSource
  editable: boolean
  createdAt: string
  updatedAt: string
}

export type DocumentDto = {
  id: string
  title: string
  category: DocumentCategory
  mimeType: string
  fileSize: number
  documentDate: string | null
  notes: string | null
  source: HealthRecordSource
  editable: boolean
  createdAt: string
  updatedAt: string
}

export type HealthRecordsSummary = {
  activeMedications: number
  totalMedications: number
  allergies: number
  documents: number
}

type Envelope<T> = { ok?: boolean; data?: T; error?: string }

function unwrap<T>(res: Envelope<T>): T {
  if (res.data === undefined) throw new Error(res.error ?? 'İşlem tamamlanamadı')
  return res.data
}

function assertOnline(): void {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('İnternet bağlantısı gerekli')
  }
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  LAB_RESULT: 'Laboratuvar sonucu',
  MEDICAL_REPORT: 'Tıbbi rapor',
  IMAGING: 'Görüntüleme',
  PRESCRIPTION: 'Reçete',
  VISIT_DOCUMENT: 'Ziyaret belgesi',
  REFERRAL: 'Sevk',
  OTHER: 'Diğer',
}

export const ALLERGY_SEVERITY_LABELS: Record<AllergySeverity, string> = {
  MILD: 'Hafif',
  MODERATE: 'Orta',
  SEVERE: 'Şiddetli',
  UNKNOWN: 'Belirsiz',
}

export const MEDICATION_STATUS_LABELS: Record<MedicationStatus, string> = {
  ACTIVE: 'Aktif',
  ENDED: 'Sonlandırıldı',
  ARCHIVED: 'Arşivlendi',
}

// ── Summary ─────────────────────────────────────────────────────────────────
export async function getHealthSummary(): Promise<HealthRecordsSummary> {
  return unwrap(await apiGet<Envelope<HealthRecordsSummary>>('/api/client/health/summary'))
}

// ── Medications ─────────────────────────────────────────────────────────────
export async function getMedications(): Promise<{ active: MedicationDto[]; previous: MedicationDto[] }> {
  return unwrap(await apiGet<Envelope<{ active: MedicationDto[]; previous: MedicationDto[] }>>('/api/client/health/medications'))
}

export type MedicationInput = {
  name: string
  strength?: string | null
  frequency?: string | null
  startDate?: string | null
  endDate?: string | null
  instructions?: string | null
  notes?: string | null
}

export async function createMedication(input: MedicationInput): Promise<MedicationDto> {
  assertOnline()
  return unwrap(await apiPost<Envelope<MedicationDto>>('/api/client/health/medications', input))
}

export async function updateMedication(id: string, input: Partial<MedicationInput>): Promise<MedicationDto> {
  assertOnline()
  return unwrap(await apiPatch<Envelope<MedicationDto>>(`/api/client/health/medications/${id}`, input))
}

export async function stopMedication(id: string): Promise<MedicationDto> {
  assertOnline()
  return unwrap(await apiPost<Envelope<MedicationDto>>(`/api/client/health/medications/${id}/stop`, {}))
}

export async function deleteMedication(id: string): Promise<void> {
  assertOnline()
  await apiDelete<Envelope<{ deleted: boolean }>>(`/api/client/health/medications/${id}`)
}

// ── Allergies ───────────────────────────────────────────────────────────────
export async function getAllergies(): Promise<AllergyDto[]> {
  return unwrap(await apiGet<Envelope<{ items: AllergyDto[] }>>('/api/client/health/allergies')).items
}

export type AllergyInput = {
  name: string
  reaction?: string | null
  severity?: AllergySeverity
  firstObservedAt?: string | null
  notes?: string | null
}

export async function createAllergy(input: AllergyInput): Promise<AllergyDto> {
  assertOnline()
  return unwrap(await apiPost<Envelope<AllergyDto>>('/api/client/health/allergies', input))
}

export async function deleteAllergy(id: string): Promise<void> {
  assertOnline()
  await apiDelete<Envelope<{ deleted: boolean }>>(`/api/client/health/allergies/${id}`)
}

// ── Documents ───────────────────────────────────────────────────────────────
export async function getDocuments(
  category: DocumentCategory | 'ALL' = 'ALL',
  cursor?: string | null,
): Promise<{ items: DocumentDto[]; nextCursor: string | null }> {
  const q = new URLSearchParams({ category })
  if (cursor) q.set('cursor', cursor)
  return unwrap(await apiGet<Envelope<{ items: DocumentDto[]; nextCursor: string | null }>>(`/api/client/health/documents?${q.toString()}`))
}

export async function uploadDocument(params: {
  file: { uri: string; name: string; type: string }
  title: string
  category: DocumentCategory
  documentDate?: string | null
  notes?: string | null
}): Promise<DocumentDto> {
  const form = new FormData()
  // React Native FormData file part.
  form.append('file', {
    uri: params.file.uri,
    name: params.file.name,
    type: params.file.type,
  } as unknown as Blob)
  form.append('title', params.title)
  form.append('category', params.category)
  if (params.documentDate) form.append('documentDate', params.documentDate)
  if (params.notes) form.append('notes', params.notes)
  assertOnline()
  return unwrap(await apiUpload<Envelope<DocumentDto>>('/api/client/health/documents', form))
}

export async function getDocumentSignedUrl(id: string): Promise<{ url: string; mimeType: string }> {
  return unwrap(await apiGet<Envelope<{ url: string; expiresInSeconds: number; mimeType: string }>>(`/api/client/health/documents/${id}/url`))
}

export async function deleteDocument(id: string): Promise<void> {
  assertOnline()
  await apiDelete<Envelope<{ deleted: boolean }>>(`/api/client/health/documents/${id}`)
}
