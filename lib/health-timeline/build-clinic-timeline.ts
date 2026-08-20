import { APPOINTMENT_STATUS_LABELS, FILE_CATEGORY_LABELS, TREATMENT_STATUS_LABELS } from '@/lib/format'
import { combineDateAndTime } from '@/lib/health-timeline/group-by-day'
import type { HealthTimelineItem } from '@/lib/health-timeline/types'
import {
  DEFAULT_CLINIC_TIMEZONE,
  normalizeWallTime,
  resolveClinicTimezone,
} from '@/lib/datetime/clinic-zone'

/** Appointment lifecycle events already represented by visit rows. */
const APPOINTMENT_TIMELINE_TYPES = new Set([
  'APPOINTMENT_CREATED',
  'APPOINTMENT_UPDATED',
  'APPOINTMENT_COMPLETED',
  'APPOINTMENT_CANCELLED',
])

type ClinicAppointment = {
  id: string
  date: Date | string
  startTime?: string | null
  status: string
  notes?: string | null
  service?: { name: string } | null
  staff?: { fullName: string } | null
  location?: { name: string } | null
}

type ClinicLab = {
  id: string
  title: string
  resultDate: Date | string
  labName?: string | null
  description?: string | null
}

type ClinicMedication = {
  id: string
  name: string
  dosage?: string | null
  frequency?: string | null
  startDate?: Date | string | null
  createdAt: Date | string
  active?: boolean | null
}

type ClinicAllergy = {
  id: string
  name: string
  severity?: string | null
  createdAt: Date | string
}

type ClinicTreatment = {
  id: string
  title: string
  status: string
  doctorName?: string | null
  startDate?: Date | string | null
  createdAt: Date | string
}

type ClinicNote = {
  id: string
  title: string
  createdAt: Date | string
  createdBy?: string | null
  creator?: { fullName?: string | null } | null
}

type ClinicFile = {
  id: string
  fileName: string
  category: string
  uploadedAt: Date | string
}

type ClinicTimelineEvent = {
  id: string
  type: string
  title: string
  description?: string | null
  createdAt: Date | string
  metadata?: unknown
}

type ClinicPrescription = {
  id: string
  protocolNo?: string | null
  diagnosis?: string | null
  issuedAt: Date | string
}

type ClinicIntake = {
  id: string
  submittedAt: Date | string
  form?: { name?: string | null } | null
  appointment?: { service?: { name?: string | null } | null } | null
}

export type ClinicHealthTimelineInput = {
  appointments?: ClinicAppointment[]
  labResults?: ClinicLab[]
  medications?: ClinicMedication[]
  allergies?: ClinicAllergy[]
  treatments?: ClinicTreatment[]
  notes?: ClinicNote[]
  files?: ClinicFile[]
  timeline?: ClinicTimelineEvent[]
  prescriptions?: ClinicPrescription[]
  intakeResponses?: ClinicIntake[]
  includeNotes?: boolean
  includeFiles?: boolean
  /** Business.timezone — wall-clock source for visits (default Asia/Nicosia). */
  timeZone?: string | null
}

function toIso(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString()
}

export function buildClinicHealthTimeline(input: ClinicHealthTimelineInput): HealthTimelineItem[] {
  const includeNotes = input.includeNotes !== false
  const includeFiles = input.includeFiles !== false
  const timeZone = resolveClinicTimezone(input.timeZone ?? DEFAULT_CLINIC_TIMEZONE)
  const items: HealthTimelineItem[] = []

  for (const appt of input.appointments ?? []) {
    const occurred = combineDateAndTime(appt.date, appt.startTime, timeZone)
    const clockTime = appt.startTime ? normalizeWallTime(appt.startTime) : null
    const parts = [
      appt.staff?.fullName,
      appt.location?.name,
      APPOINTMENT_STATUS_LABELS[appt.status] ?? appt.status,
    ].filter(Boolean)
    items.push({
      id: `visit:${appt.id}`,
      kind: 'visit',
      occurredAt: occurred.toISOString(),
      clockTime,
      title: appt.service?.name ?? 'Randevu',
      subtitle: parts.join(' · ') || null,
      status: appt.status,
      sourceEntityId: appt.id,
    })
  }

  for (const lab of input.labResults ?? []) {
    items.push({
      id: `lab:${lab.id}`,
      kind: 'lab',
      occurredAt: toIso(lab.resultDate),
      title: lab.title,
      subtitle: lab.labName ?? lab.description?.slice(0, 120) ?? null,
      sourceEntityId: lab.id,
    })
  }

  for (const med of input.medications ?? []) {
    const when = med.startDate ?? med.createdAt
    const dose = [med.dosage, med.frequency].filter(Boolean).join(' · ')
    items.push({
      id: `medication:${med.id}`,
      kind: 'medication',
      occurredAt: toIso(when),
      title: med.name,
      subtitle: dose || (med.active === false ? 'Pasif' : null),
      status: med.active === false ? 'INACTIVE' : 'ACTIVE',
      sourceEntityId: med.id,
    })
  }

  for (const allergy of input.allergies ?? []) {
    items.push({
      id: `allergy:${allergy.id}`,
      kind: 'allergy',
      occurredAt: toIso(allergy.createdAt),
      title: allergy.name,
      subtitle: allergy.severity ? `Şiddet: ${allergy.severity}` : null,
      sourceEntityId: allergy.id,
    })
  }

  for (const treatment of input.treatments ?? []) {
    const when = treatment.startDate ?? treatment.createdAt
    items.push({
      id: `treatment:${treatment.id}`,
      kind: 'treatment',
      occurredAt: toIso(when),
      title: treatment.title,
      subtitle: [treatment.doctorName, TREATMENT_STATUS_LABELS[treatment.status] ?? treatment.status]
        .filter(Boolean)
        .join(' · '),
      status: treatment.status,
      sourceEntityId: treatment.id,
    })
  }

  if (includeNotes) {
    for (const note of input.notes ?? []) {
      items.push({
        id: `note:${note.id}`,
        kind: 'note',
        occurredAt: toIso(note.createdAt),
        title: note.title,
        subtitle: note.creator?.fullName ?? note.createdBy ?? null,
        sourceEntityId: note.id,
      })
    }
  }

  if (includeFiles) {
    for (const file of input.files ?? []) {
      items.push({
        id: `file:${file.id}`,
        kind: 'file',
        occurredAt: toIso(file.uploadedAt),
        title: file.fileName,
        subtitle: FILE_CATEGORY_LABELS[file.category] ?? file.category,
        sourceEntityId: file.id,
      })
    }
  }

  for (const rx of input.prescriptions ?? []) {
    items.push({
      id: `prescription:${rx.id}`,
      kind: 'activity',
      occurredAt: toIso(rx.issuedAt),
      title: rx.protocolNo ? `Klinik reçete ${rx.protocolNo}` : 'Klinik reçete',
      subtitle: rx.diagnosis ?? null,
      sourceEntityId: rx.id,
      href: null,
    })
  }

  for (const intake of input.intakeResponses ?? []) {
    items.push({
      id: `intake:${intake.id}`,
      kind: 'intake',
      occurredAt: toIso(intake.submittedAt),
      title: intake.form?.name ?? 'Anket yanıtı',
      subtitle: intake.appointment?.service?.name ?? null,
      sourceEntityId: intake.id,
    })
  }

  const prescriptionIds = new Set((input.prescriptions ?? []).map((rx) => rx.id))
  const hasPrescriptionRows = prescriptionIds.size > 0

  // Residual operational events (skip appointment lifecycle — covered by visits).
  // Soft-archived appointments keep a single breadcrumb (metadata.archived).
  for (const event of input.timeline ?? []) {
    if (APPOINTMENT_TIMELINE_TYPES.has(event.type)) {
      const meta =
        event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata)
          ? (event.metadata as { archived?: unknown })
          : null
      if (meta?.archived !== true) continue
    }
    if (!includeNotes && event.type === 'NOTE_ADDED') continue
    if (!includeFiles && event.type === 'FILE_UPLOADED') continue

    const meta =
      event.metadata && typeof event.metadata === 'object' && !Array.isArray(event.metadata)
        ? (event.metadata as { prescriptionId?: unknown; archived?: unknown })
        : null

    // Prescription entity already rendered — skip mirror TimelineEvent (P1-08).
    if (
      typeof meta?.prescriptionId === 'string' &&
      (prescriptionIds.has(meta.prescriptionId) || hasPrescriptionRows)
    ) {
      continue
    }
    if (
      hasPrescriptionRows &&
      (/klinik reçete/i.test(event.title) ||
        /e-?re[cç]ete/i.test(event.title) ||
        /^RX-\d{4}-\d+/i.test(event.description ?? ''))
    ) {
      continue
    }

    // Prefer entity rows over duplicate activity titles when we already have typed items
    const skipDuplicates =
      event.type === 'LAB_RESULT_ADDED' ||
      event.type === 'MEDICATION_ADDED' ||
      event.type === 'ALLERGY_ADDED' ||
      event.type === 'TREATMENT_ADDED' ||
      event.type === 'NOTE_ADDED' ||
      event.type === 'FILE_UPLOADED' ||
      event.type === 'INTAKE_SUBMITTED'

    if (skipDuplicates) continue

    items.push({
      id: `activity:${event.id}`,
      kind: 'activity',
      occurredAt: toIso(event.createdAt),
      title: event.title,
      subtitle: event.description,
      sourceEntityId: event.id,
    })
  }

  return items.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  )
}
