import 'server-only'

import type { Prisma } from '@prisma/client'
import {
  normalizeEmail,
  normalizePhoneE164,
  phoneLookupVariants,
} from '@/lib/identity/normalize'
import { resolveOrCreatePerson } from '@/lib/identity/resolve'

export type ClinicPatientInput = {
  businessId: string
  fullName: string
  phone: string
  /** Required on public/client book — links Person via identityHash. */
  identityNumber: string
  email?: string | null
  address?: string | null
  city?: string | null
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

/**
 * Shared clinic Patient membership for guest public book + authenticated client book (I5).
 * Always scoped by businessId. Links Person via resolveOrCreatePerson.
 */
export async function resolveOrCreateClinicPatient(
  tx: Prisma.TransactionClient,
  input: ClinicPatientInput
): Promise<ClinicPatientResult> {
  const email = normalizeEmail(input.email)
  const phoneStored =
    normalizePhoneE164(input.phone)?.trim() || input.phone.trim()
  const phoneVariants = phoneLookupVariants(input.phone)

  const { personId } = await resolveOrCreatePerson(tx, {
    fullName: input.fullName,
    phone: input.phone,
    email,
    identityNumber: input.identityNumber,
  })

  const byPerson = await tx.patient.findFirst({
    where: { businessId: input.businessId, personId },
    select: { id: true },
  })

  const byEmail =
    !byPerson && email
      ? await tx.patient.findFirst({
          where: { businessId: input.businessId, email },
          select: { id: true },
        })
      : null

  const byPhone =
    !byPerson && !byEmail && phoneVariants.length > 0
      ? await tx.patient.findFirst({
          where: {
            businessId: input.businessId,
            phone: { in: phoneVariants },
          },
          select: { id: true },
        })
      : null

  const existing = byPerson ?? byEmail ?? byPhone
  if (existing) {
    await tx.patient.updateMany({
      where: { id: existing.id, businessId: input.businessId },
      data: {
        fullName: input.fullName,
        phone: phoneStored,
        email,
        identityNumber: input.identityNumber,
        address: input.address ?? undefined,
        city: input.city ?? undefined,
        personId,
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
      identityNumber: input.identityNumber,
      address: input.address ?? null,
      city: input.city ?? null,
    },
    select: { id: true },
  })
  return { patientId: created.id, personId, created: true }
}
