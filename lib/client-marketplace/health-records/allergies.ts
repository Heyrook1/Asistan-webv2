import 'server-only'

/**
 * Patient-owned allergy records (Person-scoped). Same ownership + provenance
 * rules as medications: only PATIENT_ENTERED rows are patient-editable.
 * Severity is never inferred and never defaults to SEVERE.
 */
import { withPersonDb } from '@/lib/passport/person-db'
import { HealthRecordError } from './errors'
import { emitHealthRecordEvent } from './events'
import type { AllergyCreateInput, AllergySeverity, AllergyUpdateInput, HealthRecordSourceValue } from './schemas'
import type { AllergyDto } from './types'

type AllergyRow = {
  id: string
  name: string
  reaction: string | null
  severity: AllergySeverity
  firstObservedAt: Date | null
  notes: string | null
  sourceType: HealthRecordSourceValue
  createdAt: Date
  updatedAt: Date
}

const SELECT = {
  id: true,
  name: true,
  reaction: true,
  severity: true,
  firstObservedAt: true,
  notes: true,
  sourceType: true,
  createdAt: true,
  updatedAt: true,
} as const

function toDto(row: AllergyRow): AllergyDto {
  return {
    id: row.id,
    name: row.name,
    reaction: row.reaction,
    severity: row.severity,
    firstObservedAt: row.firstObservedAt ? row.firstObservedAt.toISOString() : null,
    notes: row.notes,
    source: row.sourceType,
    editable: row.sourceType === 'PATIENT_ENTERED',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function listAllergies(personId: string): Promise<AllergyDto[]> {
  const rows = await withPersonDb(personId, (tx) =>
    tx.personAllergy.findMany({
      where: { personId, deletedAt: null },
      orderBy: [{ updatedAt: 'desc' }],
      select: SELECT,
    })
  )
  return (rows as AllergyRow[]).map(toDto)
}

export async function getAllergy(personId: string, id: string): Promise<AllergyDto> {
  const row = await withPersonDb(personId, (tx) =>
    tx.personAllergy.findFirst({ where: { id, personId, deletedAt: null }, select: SELECT })
  )
  if (!row) throw new HealthRecordError('not_found')
  return toDto(row as AllergyRow)
}

export async function createAllergy(
  personId: string,
  createdByClientUserId: string | null,
  input: AllergyCreateInput
): Promise<AllergyDto> {
  const row = await withPersonDb(personId, (tx) =>
    tx.personAllergy.create({
      data: {
        personId,
        createdByClientUserId,
        sourceType: 'PATIENT_ENTERED',
        name: input.name,
        reaction: input.reaction,
        severity: input.severity ?? 'UNKNOWN',
        firstObservedAt: input.firstObservedAt,
        notes: input.notes,
      },
      select: SELECT,
    })
  )
  const dto = toDto(row as AllergyRow)
  emitHealthRecordEvent('allergy_created', { id: dto.id })
  return dto
}

export async function updateAllergy(
  personId: string,
  id: string,
  input: AllergyUpdateInput
): Promise<AllergyDto> {
  return withPersonDb(personId, async (tx) => {
    const existing = await tx.personAllergy.findFirst({
      where: { id, personId, deletedAt: null },
      select: { id: true, sourceType: true },
    })
    if (!existing) throw new HealthRecordError('not_found')
    if (existing.sourceType !== 'PATIENT_ENTERED') throw new HealthRecordError('not_editable')

    const row = await tx.personAllergy.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.reaction !== undefined ? { reaction: input.reaction } : {}),
        ...(input.severity !== undefined ? { severity: input.severity } : {}),
        ...(input.firstObservedAt !== undefined ? { firstObservedAt: input.firstObservedAt } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
      select: SELECT,
    })
    const dto = toDto(row as AllergyRow)
    emitHealthRecordEvent('allergy_updated', { id: dto.id })
    return dto
  })
}

export async function deleteAllergy(personId: string, id: string): Promise<void> {
  await withPersonDb(personId, async (tx) => {
    const existing = await tx.personAllergy.findFirst({
      where: { id, personId, deletedAt: null },
      select: { id: true, sourceType: true },
    })
    if (!existing) throw new HealthRecordError('not_found')
    if (existing.sourceType !== 'PATIENT_ENTERED') throw new HealthRecordError('not_editable')
    await tx.personAllergy.update({ where: { id }, data: { deletedAt: new Date() } })
    emitHealthRecordEvent('allergy_deleted', { id })
  })
}
