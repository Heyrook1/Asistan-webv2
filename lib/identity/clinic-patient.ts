import 'server-only'

import { Prisma } from '@prisma/client'
import {
  normalizeEmail,
  normalizePhoneE164,
  phoneLookupVariants,
} from '@/lib/identity/normalize'
import { resolveOrCreatePerson } from '@/lib/identity/resolve'
import { WEB_BOOKING_TAG } from '@/lib/identity/ensure-patient-card-on-confirm'

export type ClinicPatientInput = {
  businessId: string
  fullName: string
  phone: string
  /** Optional — hashed into Person.identityHash when present. */
  identityNumber?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  /**
   * When false (guest public book), never persist raw national ID on Patient —
   * only Person.identityHash. Clinic staff can fill the card later.
   */
  persistIdentityOnPatientCard?: boolean
  /**
   * Pre-resolved ecosystem Person id. Provided by the caller when the Person was
   * committed BEFORE a Serializable booking tx (owner-connection Person is otherwise
   * invisible to the tx snapshot and fails the Patient.personId FK). When omitted,
   * the Person is resolved on this transaction.
   */
  personId?: string
}

export type ClinicPatientResult = {
  patientId: string
  personId: string
  created: boolean
}

export { phoneLookupVariants }

async function nextPatientNumber(
  tx: Prisma.TransactionClient,
  businessId: string
): Promise<string> {
  const rows = await tx.$queryRaw<Array<{ next_patient_number: string }>>`
    select public.next_patient_number(${businessId}) as next_patient_number
  `
  const patientNumber = rows[0]?.next_patient_number
  if (!patientNumber) throw new Error('Hasta numarası üretilemedi')
  return patientNumber
}

/** Find clinic patient including soft-deleted rows (middleware would hide them). */
async function findClinicPatientIncludingDeleted(
  tx: Prisma.TransactionClient,
  businessId: string,
  opts: { personId: string; email: string | null; phoneVariants: string[] },
): Promise<{ id: string; tags: string[] } | null> {
  const byPerson = await tx.$queryRaw<Array<{ id: string; tags: string[] | null }>>`
    SELECT id, tags FROM "Patient"
    WHERE "businessId" = ${businessId} AND "personId" = ${opts.personId}
    ORDER BY ("deletedAt" IS NULL) DESC, "updatedAt" DESC
    LIMIT 1
  `
  if (byPerson[0]) {
    return { id: byPerson[0].id, tags: byPerson[0].tags ?? [] }
  }

  if (opts.email) {
    const byEmail = await tx.$queryRaw<Array<{ id: string; tags: string[] | null }>>`
      SELECT id, tags FROM "Patient"
      WHERE "businessId" = ${businessId} AND email = ${opts.email}
      ORDER BY ("deletedAt" IS NULL) DESC, "updatedAt" DESC
      LIMIT 1
    `
    if (byEmail[0]) {
      return { id: byEmail[0].id, tags: byEmail[0].tags ?? [] }
    }
  }

  if (opts.phoneVariants.length > 0) {
    const byPhone = await tx.$queryRaw<Array<{ id: string; tags: string[] | null }>>`
      SELECT id, tags FROM "Patient"
      WHERE "businessId" = ${businessId}
        AND phone IN (${Prisma.join(opts.phoneVariants)})
      ORDER BY ("deletedAt" IS NULL) DESC, "updatedAt" DESC
      LIMIT 1
    `
    if (byPhone[0]) {
      return { id: byPhone[0].id, tags: byPhone[0].tags ?? [] }
    }
  }

  return null
}

/**
 * Shared clinic Patient membership for guest public book + authenticated client book (I5).
 * Always scoped by businessId. Links Person via resolveOrCreatePerson.
 * Soft-deleted/archived cards are restored instead of creating duplicates.
 */
export async function resolveOrCreateClinicPatient(
  tx: Prisma.TransactionClient,
  input: ClinicPatientInput
): Promise<ClinicPatientResult> {
  const email = normalizeEmail(input.email)
  const phoneStored =
    normalizePhoneE164(input.phone)?.trim() || input.phone.trim()
  const phoneVariants = phoneLookupVariants(input.phone)
  const identityNumber = input.identityNumber?.trim() || null
  const persistPlaintext = Boolean(input.persistIdentityOnPatientCard && identityNumber)

  const { personId } = input.personId
    ? { personId: input.personId }
    : await resolveOrCreatePerson(tx, {
        fullName: input.fullName,
        phone: input.phone,
        email,
        identityNumber,
      })

  const existing = await findClinicPatientIncludingDeleted(tx, input.businessId, {
    personId,
    email,
    phoneVariants,
  })

  const tags = new Set(existing?.tags ?? [])
  tags.add(WEB_BOOKING_TAG)

  if (existing) {
    await tx.patient.update({
      where: { id: existing.id },
      data: {
        fullName: input.fullName,
        phone: phoneStored,
        email,
        ...(persistPlaintext ? { identityNumber } : {}),
        address: input.address ?? undefined,
        city: input.city ?? undefined,
        personId,
        deletedAt: null,
        tags: [...tags],
      },
    })
    return { patientId: existing.id, personId, created: false }
  }

  const patientNumber = await nextPatientNumber(tx, input.businessId)
  const created = await tx.patient.create({
    data: {
      businessId: input.businessId,
      personId,
      patientNumber,
      fullName: input.fullName,
      phone: phoneStored,
      email,
      identityNumber: persistPlaintext ? identityNumber : null,
      address: input.address ?? null,
      city: input.city ?? null,
      // Hidden from /dashboard/hastalar until clinic confirms the appointment.
      isArchived: true,
      tags: [...tags],
    },
    select: { id: true },
  })
  return { patientId: created.id, personId, created: true }
}
