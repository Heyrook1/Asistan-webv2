import 'server-only'

import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/identity/normalize'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

export type ClaimGuestBookingsResult = {
  claimed: number
  appointmentIds: string[]
}

/**
 * Bağla: yalnızca **doğrulanmış oturum e-postası** ile eşleşen,
 * henüz `clientUserId`'siz randevuları bu ClientUser'a bağlar.
 *
 * Telefon ile claim YOK — profil telefonu self-asserted; OTP yokken
 * phone-only claim randevu gaspına açık olur.
 *
 * Kimlik numarası / identityHash ile claim YOK (enumerable secret olmaz).
 * Person auto-merge değil — yalnız Appointment.clientUserId sahipliği.
 *
 * E-posta doğrulanmamış hesaplarda çağrılmamalı (`requireClientAuth` engeller).
 */
export async function claimGuestBookingsForClientUser(input: {
  clientUserId: string
  /** Must be the verified auth email (not an editable profile spoof). */
  email: string | null
}): Promise<ClaimGuestBookingsResult> {
  const email = normalizeEmail(input.email)
  if (!email) {
    return { claimed: 0, appointmentIds: [] }
  }

  return runWithTenantBypassAsync('client:claim-guest-bookings', async () => {
    const patients = await prisma.patient.findMany({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
      take: 200,
    })
    if (patients.length === 0) {
      return { claimed: 0, appointmentIds: [] }
    }

    const patientIds = patients.map((p) => p.id)
    const orphans = await prisma.appointment.findMany({
      where: {
        patientId: { in: patientIds },
        clientUserId: null,
        deletedAt: null,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      select: { id: true },
      take: 100,
      orderBy: { createdAt: 'desc' },
    })

    if (orphans.length === 0) {
      return { claimed: 0, appointmentIds: [] }
    }

    const ids = orphans.map((row) => row.id)
    await prisma.appointment.updateMany({
      where: {
        id: { in: ids },
        clientUserId: null,
      },
      data: { clientUserId: input.clientUserId },
    })

    return { claimed: ids.length, appointmentIds: ids }
  })
}
