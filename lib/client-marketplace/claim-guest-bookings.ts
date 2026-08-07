import 'server-only'

import { prisma } from '@/lib/prisma'
import { normalizeEmail, normalizePhoneE164, phoneLookupVariants } from '@/lib/identity/normalize'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'

export type ClaimGuestBookingsResult = {
  claimed: number
  appointmentIds: string[]
}

/**
 * Bağla: doğrulanmış e-posta (ve varsa telefon) ile eşleşen,
 * henüz clientUserId'siz randevuları bu ClientUser'a bağlar.
 *
 * Otomatik Person merge değil — yalnız Appointment.clientUserId sahipliği.
 * E-posta doğrulanmamış hesaplarda çağrılmamalı (requireClientAuth zaten engeller).
 */
export async function claimGuestBookingsForClientUser(input: {
  clientUserId: string
  email: string | null
  phone: string | null
}): Promise<ClaimGuestBookingsResult> {
  const email = normalizeEmail(input.email)
  const phone = normalizePhoneE164(input.phone)
  const phoneVariants = input.phone ? phoneLookupVariants(input.phone) : []

  if (!email && phoneVariants.length === 0) {
    return { claimed: 0, appointmentIds: [] }
  }

  return runWithTenantBypassAsync('client:claim-guest-bookings', async () => {
    const orFilters: Array<Record<string, unknown>> = []
    if (email) {
      orFilters.push({ email: { equals: email, mode: 'insensitive' as const } })
    }
    for (const variant of phoneVariants) {
      orFilters.push({ phone: variant })
    }
    if (phone) {
      orFilters.push({ phone })
    }

    const patients = await prisma.patient.findMany({
      where: { OR: orFilters },
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
