import 'server-only'

import type { Prisma } from '@prisma/client'

const WEB_BOOKING_TAG = 'web-randevu'

/**
 * On clinic approve (CONFIRMED): surface the linked Patient on /dashboard/hastalar.
 * - Un-archive / clear soft-delete (web guests start archived until confirm)
 * - Assign booking doctor when unset
 * - Tag web bookings so staff can filter
 */
export async function ensurePatientCardOnConfirm(
  tx: Prisma.TransactionClient,
  input: {
    businessId: string
    patientId: string
    staffId: string | null
    /** Appointment.source — CLIENT_APP covers guest public book + client app. */
    appointmentSource?: string | null
  },
): Promise<{ patientId: string; restored: boolean }> {
  const rows = await tx.$queryRaw<
    Array<{
      id: string
      tags: string[] | null
      assignedDoctorId: string | null
      deletedAt: Date | null
      isArchived: boolean
    }>
  >`
    SELECT id, tags, "assignedDoctorId", "deletedAt", "isArchived"
    FROM "Patient"
    WHERE id = ${input.patientId}
      AND "businessId" = ${input.businessId}
    LIMIT 1
  `

  const row = rows[0]
  if (!row) {
    throw new Error('Randevu hastası klinik kaydında bulunamadı')
  }

  const tags = new Set(Array.isArray(row.tags) ? row.tags : [])
  if (input.appointmentSource === 'CLIENT_APP') {
    tags.add(WEB_BOOKING_TAG)
  }
  // Confirmed appointment → visible clinic membership marker on the patient card.
  tags.add('klinik-uye')

  const nextTags = [...tags]
  const nextDoctorId = row.assignedDoctorId ?? input.staffId
  const restored = Boolean(row.deletedAt) || row.isArchived

  await tx.patient.update({
    where: { id: input.patientId },
    data: {
      deletedAt: null,
      isArchived: false,
      assignedDoctorId: nextDoctorId,
      tags: nextTags,
    },
  })

  return { patientId: input.patientId, restored }
}

export { WEB_BOOKING_TAG }
