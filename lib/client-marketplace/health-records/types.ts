/**
 * Client-safe DTO shapes for Passport health records. No 'server-only' import so
 * both route handlers/services and browser components can share these types.
 */
import type {
  AllergySeverity,
  DocumentCategory,
  HealthRecordSourceValue,
  MedicationStatus,
} from './schemas'

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
  source: HealthRecordSourceValue
  editable: boolean
  createdAt: string
  updatedAt: string
}

export type MedicationListResult = {
  active: MedicationDto[]
  previous: MedicationDto[]
}

export type AllergyDto = {
  id: string
  name: string
  reaction: string | null
  severity: AllergySeverity
  firstObservedAt: string | null
  notes: string | null
  source: HealthRecordSourceValue
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
  source: HealthRecordSourceValue
  editable: boolean
  createdAt: string
  updatedAt: string
}

export type DocumentListResult = {
  items: DocumentDto[]
  nextCursor: string | null
}

export type HealthRecordsSummary = {
  activeMedications: number
  totalMedications: number
  allergies: number
  documents: number
}
