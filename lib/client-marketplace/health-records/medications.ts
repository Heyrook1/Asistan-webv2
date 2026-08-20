import 'server-only'

/**
 * Patient-owned medication records (Person-scoped). All access goes through
 * withPersonDb() so RLS (app.person_id) + the where-clause both gate ownership.
 * Provenance rule: only PATIENT_ENTERED rows are editable/deletable by the patient.
 */
import { withPersonDb } from '@/lib/passport/person-db'
import { HealthRecordError } from './errors'
import { emitHealthRecordEvent } from './events'
import type { MedicationCreateInput, MedicationStatus, MedicationUpdateInput, HealthRecordSourceValue } from './schemas'
import type { MedicationDto, MedicationListResult } from './types'

type MedicationRow = {
  id: string
  name: string
  strength: string | null
  form: string | null
  frequency: string | null
  startDate: Date | null
  endDate: Date | null
  stoppedAt: Date | null
  instructions: string | null
  notes: string | null
  status: MedicationStatus
  sourceType: HealthRecordSourceValue
  createdAt: Date
  updatedAt: Date
}

const iso = (value: Date | null) => (value ? value.toISOString() : null)

function toDto(row: MedicationRow): MedicationDto {
  return {
    id: row.id,
    name: row.name,
    strength: row.strength,
    form: row.form,
    frequency: row.frequency,
    startDate: iso(row.startDate),
    endDate: iso(row.endDate),
    stoppedAt: iso(row.stoppedAt),
    instructions: row.instructions,
    notes: row.notes,
    status: row.status,
    source: row.sourceType,
    editable: row.sourceType === 'PATIENT_ENTERED',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const SELECT = {
  id: true,
  name: true,
  strength: true,
  form: true,
  frequency: true,
  startDate: true,
  endDate: true,
  stoppedAt: true,
  instructions: true,
  notes: true,
  status: true,
  sourceType: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function listMedications(personId: string): Promise<MedicationListResult> {
  const rows = await withPersonDb(personId, (tx) =>
    tx.personMedication.findMany({
      where: { personId, deletedAt: null },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      select: SELECT,
    })
  )
  const dtos = (rows as MedicationRow[]).map(toDto)
  return {
    active: dtos.filter((m) => m.status === 'ACTIVE'),
    previous: dtos.filter((m) => m.status !== 'ACTIVE'),
  }
}

export async function getMedication(personId: string, id: string): Promise<MedicationDto> {
  const row = await withPersonDb(personId, (tx) =>
    tx.personMedication.findFirst({ where: { id, personId, deletedAt: null }, select: SELECT })
  )
  if (!row) throw new HealthRecordError('not_found')
  return toDto(row as MedicationRow)
}

export async function createMedication(
  personId: string,
  createdByClientUserId: string | null,
  input: MedicationCreateInput
): Promise<MedicationDto> {
  const row = await withPersonDb(personId, (tx) =>
    tx.personMedication.create({
      data: {
        personId,
        createdByClientUserId,
        sourceType: 'PATIENT_ENTERED',
        name: input.name,
        strength: input.strength,
        form: input.form,
        frequency: input.frequency,
        startDate: input.startDate,
        endDate: input.endDate,
        instructions: input.instructions,
        notes: input.notes,
      },
      select: SELECT,
    })
  )
  const dto = toDto(row as MedicationRow)
  emitHealthRecordEvent('medication_created', { id: dto.id, status: dto.status })
  return dto
}

export async function updateMedication(
  personId: string,
  id: string,
  input: MedicationUpdateInput
): Promise<MedicationDto> {
  return withPersonDb(personId, async (tx) => {
    const existing = await tx.personMedication.findFirst({
      where: { id, personId, deletedAt: null },
      select: { id: true, sourceType: true },
    })
    if (!existing) throw new HealthRecordError('not_found')
    if (existing.sourceType !== 'PATIENT_ENTERED') throw new HealthRecordError('not_editable')

    const row = await tx.personMedication.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.strength !== undefined ? { strength: input.strength } : {}),
        ...(input.form !== undefined ? { form: input.form } : {}),
        ...(input.frequency !== undefined ? { frequency: input.frequency } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
        ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
        ...(input.instructions !== undefined ? { instructions: input.instructions } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      select: SELECT,
    })
    const dto = toDto(row as MedicationRow)
    emitHealthRecordEvent('medication_updated', { id: dto.id, status: dto.status })
    return dto
  })
}

export async function stopMedication(
  personId: string,
  id: string,
  stoppedAt: Date | null
): Promise<MedicationDto> {
  return withPersonDb(personId, async (tx) => {
    const existing = await tx.personMedication.findFirst({
      where: { id, personId, deletedAt: null },
      select: { id: true, sourceType: true },
    })
    if (!existing) throw new HealthRecordError('not_found')
    if (existing.sourceType !== 'PATIENT_ENTERED') throw new HealthRecordError('not_editable')

    const row = await tx.personMedication.update({
      where: { id },
      data: { status: 'ENDED', stoppedAt: stoppedAt ?? new Date() },
      select: SELECT,
    })
    const dto = toDto(row as MedicationRow)
    emitHealthRecordEvent('medication_stopped', { id: dto.id, status: dto.status })
    return dto
  })
}

export async function deleteMedication(personId: string, id: string): Promise<void> {
  await withPersonDb(personId, async (tx) => {
    const existing = await tx.personMedication.findFirst({
      where: { id, personId, deletedAt: null },
      select: { id: true, sourceType: true },
    })
    if (!existing) throw new HealthRecordError('not_found')
    if (existing.sourceType !== 'PATIENT_ENTERED') throw new HealthRecordError('not_editable')
    // Soft-delete to preserve provenance/audit; excluded from every read above.
    await tx.personMedication.update({ where: { id }, data: { deletedAt: new Date() } })
    emitHealthRecordEvent('medication_deleted', { id })
  })
}
