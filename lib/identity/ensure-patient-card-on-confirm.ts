import 'server-only'

import type { Prisma } from '@prisma/client'

const WEB_BOOKING_TAG = 'web-randevu'
const CLINIC_MEMBER_TAG = 'klinik-uye'

/**
 * On clinic approve (CONFIRMED): surface the linked Patient on /dashboard/hastalar.
 * Soft-fails instead of aborting the appointment status transition.
 *
 * Uses raw SQL for the read so soft-deleted/archived guest cards are found
 * even when Prisma soft-delete middleware would hide them.
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
): Promise<{ patientId: string; restored: boolean } | null> {
  try {
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
      console.error('[ensurePatientCardOnConfirm] patient missing', {
        patientId: input.patientId,
        businessId: input.businessId,
      })
      return null
    }

    const tags = new Set(Array.isArray(row.tags) ? row.tags : [])
    if (input.appointmentSource === 'CLIENT_APP') {
      tags.add(WEB_BOOKING_TAG)
    }
    tags.add(CLINIC_MEMBER_TAG)

    const nextDoctorId = row.assignedDoctorId ?? input.staffId
    const restored = Boolean(row.deletedAt) || row.isArchived

    await tx.patient.update({
      where: { id: input.patientId },
      data: {
        deletedAt: null,
        isArchived: false,
        assignedDoctorId: nextDoctorId,
        tags: [...tags],
      },
    })

    return { patientId: input.patientId, restored }
  } catch (error) {
    console.error('[ensurePatientCardOnConfirm] soft-fail', error)
    return null
  }
}

export { WEB_BOOKING_TAG, CLINIC_MEMBER_TAG }
