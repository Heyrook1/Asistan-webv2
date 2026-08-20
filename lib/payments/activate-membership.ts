import 'server-only'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { addDays } from '@/lib/vendor-membership'

export async function activateMembershipFromPayment(paymentId: string) {
  const payment = await prisma.membershipPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      businessId: true,
      planCode: true,
      packageDurationDays: true,
      amount: true,
      currency: true,
      status: true,
      notes: true,
    },
  })

  if (!payment) return { ok: false as const, error: 'Ödeme kaydı bulunamadı' }
  if (payment.status === 'PAID') {
    return { ok: true as const, alreadyPaid: true as const, businessId: payment.businessId }
  }
  if (payment.status !== 'PENDING') {
    return { ok: false as const, error: `Ödeme durumu uygun değil: ${payment.status}` }
  }

  const start = new Date()
  const end = addDays(start, payment.packageDurationDays)

  await prisma.$transaction(async (tx) => {
    await tx.membershipPayment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: start,
      },
    })

    await tx.membershipPayment.updateMany({
      where: {
        businessId: payment.businessId,
        status: 'PENDING',
        NOT: { id: payment.id },
      },
      data: { status: 'CANCELLED' },
    })

    await tx.business.update({
      where: { id: payment.businessId },
      data: { isActive: true },
    })

    await tx.vendorAccount.upsert({
      where: { businessId: payment.businessId },
      create: {
        businessId: payment.businessId,
        status: 'ACTIVE',
        source: 'SELF_SIGNUP',
        isDemo: false,
        plan: payment.planCode,
        balance: new Prisma.Decimal(0),
        currency: payment.currency,
        accessStartAt: start,
        accessEndAt: end,
        packageDurationDays: payment.packageDurationDays,
        notes: `Self-serve ödeme ${payment.id.slice(0, 8)}`,
      },
      update: {
        status: 'ACTIVE',
        isDemo: false,
        plan: payment.planCode,
        currency: payment.currency,
        accessStartAt: start,
        accessEndAt: end,
        packageDurationDays: payment.packageDurationDays,
        notes: `Self-serve ödeme ${payment.id.slice(0, 8)}`,
      },
    })
  })

  return { ok: true as const, alreadyPaid: false as const, businessId: payment.businessId }
}
