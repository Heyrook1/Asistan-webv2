'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { canManageClinicSettings } from '@/lib/settings/tabs'
import { ok, err, type ActionResult } from '@/lib/actions/result'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { entityIdSchema } from '@/lib/actions/validation'
import { getMembershipPaymentProvider } from '@/lib/payments'
import {
  MEMBERSHIP_BILLING_PERIODS,
  PAID_VENDOR_PLAN_CODES,
  addDays,
  getVendorPlanName,
  getVendorPlanPrice,
} from '@/lib/vendor-membership'

const requestSchema = z.object({
  planCode: z.enum(PAID_VENDOR_PLAN_CODES),
  billingPeriod: z.enum(MEMBERSHIP_BILLING_PERIODS),
})

export type MembershipPaymentView = {
  id: string
  planCode: string
  planName: string
  billingPeriod: 'MONTHLY' | 'YEARLY'
  amount: number
  currency: string
  status: string
  provider: string
  checkoutUrl: string | null
  instructions: string | null
  packageDurationDays: number
  createdAt: string
  expiresAt: string | null
}

export async function requestMembershipUpgrade(
  raw: unknown
): Promise<ActionResult<{ payment: MembershipPaymentView }>> {
  if (!isFeatureEnabled('selfServeBilling')) {
    return err('Online paket yükseltme şu an kapalı')
  }

  const parsed = requestSchema.safeParse(raw)
  if (!parsed.success) return err('Geçersiz paket seçimi', parsed.error.issues)

  const session = await requireSession()
  if (!canManageClinicSettings(session)) return err('Yalnızca işletme yöneticisi paket yükseltebilir')

  const price = getVendorPlanPrice(parsed.data.planCode, parsed.data.billingPeriod)
  if (!price) return err('Bu plan için fiyat tanımlı değil')

  const business = await prisma.business.findFirst({
    where: { id: session.businessId },
    select: { id: true, name: true, email: true },
  })
  if (!business) return err('İşletme bulunamadı')

  const existingPending = await prisma.membershipPayment.findFirst({
    where: { businessId: session.businessId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  })
  if (existingPending) {
    return err('Zaten bekleyen bir ödeme talebiniz var. İptal edip yeniden deneyin veya onay bekleyin.')
  }

  const expiresAt = addDays(new Date(), 7)
  const payment = await prisma.membershipPayment.create({
    data: {
      businessId: session.businessId,
      planCode: parsed.data.planCode,
      billingPeriod: parsed.data.billingPeriod,
      amount: new Prisma.Decimal(price.amount),
      currency: price.currency,
      status: 'PENDING',
      provider: 'MANUAL',
      packageDurationDays: price.durationDays,
      requestedByUserId: session.userId,
      expiresAt,
    },
  })

  try {
    const provider = getMembershipPaymentProvider()
    const intent = await provider.createIntent({
      paymentId: payment.id,
      businessId: business.id,
      businessName: business.name,
      planCode: parsed.data.planCode,
      planName: getVendorPlanName(parsed.data.planCode),
      billingPeriod: parsed.data.billingPeriod,
      amount: price.amount,
      currency: price.currency,
      packageDurationDays: price.durationDays,
      customerEmail: business.email || session.email,
    })

    const updatedRows = await prisma.membershipPayment.updateMany({
      where: { id: payment.id, businessId: business.id },
      data: {
        provider: intent.provider,
        providerRef: intent.providerRef,
        checkoutUrl: intent.checkoutUrl,
        notes: intent.instructions,
      },
    })
    if (updatedRows.count === 0) return err('Ödeme kaydı güncellenemedi')
    const updated = await prisma.membershipPayment.findFirst({
      where: { id: payment.id, businessId: business.id },
    })
    if (!updated) return err('Ödeme kaydı bulunamadı')

    revalidatePath('/dashboard/ayarlar')
    revalidatePath('/dashboard/super-admin')

    return ok({
      payment: {
        id: updated.id,
        planCode: updated.planCode,
        planName: getVendorPlanName(updated.planCode),
        billingPeriod: updated.billingPeriod,
        amount: Number(updated.amount),
        currency: updated.currency,
        status: updated.status,
        provider: updated.provider,
        checkoutUrl: updated.checkoutUrl,
        instructions: updated.notes,
        packageDurationDays: updated.packageDurationDays,
        createdAt: updated.createdAt.toISOString(),
        expiresAt: updated.expiresAt?.toISOString() ?? null,
      },
    })
  } catch (error) {
    await prisma.membershipPayment.updateMany({
      where: { id: payment.id, businessId: business.id },
      data: { status: 'FAILED', notes: error instanceof Error ? error.message : 'Intent failed' },
    })
    return err(error instanceof Error ? error.message : 'Ödeme talebi oluşturulamadı')
  }
}

export async function cancelPendingMembershipPayment(
  paymentId: string
): Promise<ActionResult> {
  const parsed = entityIdSchema.safeParse(paymentId)
  if (!parsed.success) return err('Geçersiz ödeme kimliği', parsed.error.issues)
  const session = await requireSession()
  if (!canManageClinicSettings(session)) return err('Yetkisiz')

  const payment = await prisma.membershipPayment.findFirst({
    where: { id: parsed.data, businessId: session.businessId, status: 'PENDING' },
    select: { id: true },
  })
  if (!payment) return err('Bekleyen ödeme bulunamadı')

  await prisma.membershipPayment.updateMany({
    where: { id: payment.id, businessId: session.businessId },
    data: { status: 'CANCELLED' },
  })

  revalidatePath('/dashboard/ayarlar')
  return ok(undefined)
}
