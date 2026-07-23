'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSuperAdminSession } from '@/lib/session'
import { err, ok, type ActionResult } from '@/lib/actions/result'
import { activateMembershipFromPayment } from '@/lib/payments/activate-membership'
import { entityIdSchema } from '@/lib/actions/validation'
import {
  DEMO_PLAN_CODE,
  DEMO_TRIAL_DAYS,
  VENDOR_MEMBERSHIP_STATUSES,
  VENDOR_PLAN_CODES,
  addDays,
} from '@/lib/vendor-membership'

const updateVendorSchema = z.object({
  businessId: z.string().uuid(),
  isVendorActive: z.boolean(),
  status: z.enum(VENDOR_MEMBERSHIP_STATUSES),
  plan: z.enum(VENDOR_PLAN_CODES),
  balance: z.preprocess(
    (value) => (typeof value === 'string' ? Number(value) : value),
    z.number().finite().min(-1_000_000).max(1_000_000)
  ),
  currency: z.string().trim().toUpperCase().min(3).max(6),
  isDemo: z.boolean().optional(),
  accessStartAt: z.preprocess((value) => (value === '' ? undefined : value), z.string().datetime().optional()),
  packageDurationDays: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined
      if (typeof value === 'string') return Number(value)
      return value
    },
    z.number().int().min(1).max(3650).optional()
  ),
  notes: z.string().trim().max(300).optional(),
})

export async function updateVendorMembership(input: z.infer<typeof updateVendorSchema>): Promise<ActionResult<{ businessId: string }>> {
  await requireSuperAdminSession()

  const parsed = updateVendorSchema.safeParse(input)
  if (!parsed.success) {
    return err('Vendor bilgileri doğrulanamadı', parsed.error.issues)
  }

  const business = await prisma.business.findUnique({
    where: { id: parsed.data.businessId },
    select: { id: true },
  })
  if (!business) return err('Vendor bulunamadı')

  const normalizedStartAt = parsed.data.accessStartAt
    ? new Date(parsed.data.accessStartAt)
    : parsed.data.packageDurationDays || parsed.data.isDemo
      ? new Date()
      : undefined
  const normalizedDuration =
    parsed.data.packageDurationDays ?? (parsed.data.isDemo ? DEMO_TRIAL_DAYS : undefined)
  const normalizedPlan = parsed.data.isDemo ? DEMO_PLAN_CODE : parsed.data.plan
  const normalizedEndAt =
    normalizedStartAt && normalizedDuration ? addDays(normalizedStartAt, normalizedDuration) : undefined

  const shouldBeActive =
    parsed.data.isVendorActive && (parsed.data.status === 'ACTIVE' || parsed.data.status === 'TRIAL')

  try {
    await prisma.$transaction([
      prisma.business.update({
        where: { id: parsed.data.businessId },
        data: { isActive: shouldBeActive },
      }),
      prisma.vendorAccount.upsert({
        where: { businessId: parsed.data.businessId },
        create: {
          businessId: parsed.data.businessId,
          status: parsed.data.status,
          source: 'ADMIN_CREATED',
          isDemo: parsed.data.isDemo ?? false,
          plan: normalizedPlan,
          balance: new Prisma.Decimal(parsed.data.balance),
          currency: parsed.data.currency,
          accessStartAt: normalizedStartAt ?? null,
          accessEndAt: normalizedEndAt ?? null,
          packageDurationDays: normalizedDuration ?? null,
          notes: parsed.data.notes || null,
        },
        update: {
          status: parsed.data.status,
          isDemo: parsed.data.isDemo ?? undefined,
          plan: normalizedPlan,
          balance: new Prisma.Decimal(parsed.data.balance),
          currency: parsed.data.currency,
          accessStartAt: normalizedStartAt,
          accessEndAt: normalizedEndAt,
          packageDurationDays: normalizedDuration,
          notes: parsed.data.notes || null,
        },
      }),
    ])
  } catch {
    return err('Vendor tablosu veritabanında hazır değil. Yönetici paneli için önce veritabanı migration adımı uygulanmalı.')
  }

  revalidatePath('/dashboard/sistem-admin')
  revalidatePath('/dashboard/super-admin')
  return ok({ businessId: parsed.data.businessId })
}

export async function confirmMembershipPayment(
  paymentId: string
): Promise<ActionResult<{ businessId: string }>> {
  const parsed = entityIdSchema.safeParse(paymentId)
  if (!parsed.success) return err('Geçersiz ödeme kimliği', parsed.error.issues)
  await requireSuperAdminSession()
  const result = await activateMembershipFromPayment(parsed.data)
  if (!result.ok) return err(result.error)

  revalidatePath('/dashboard/sistem-admin')
  revalidatePath('/dashboard/super-admin')
  revalidatePath('/dashboard/ayarlar')
  return ok({ businessId: result.businessId ?? '' })
}

export async function rejectMembershipPayment(
  paymentId: string
): Promise<ActionResult> {
  const parsed = entityIdSchema.safeParse(paymentId)
  if (!parsed.success) return err('Geçersiz ödeme kimliği', parsed.error.issues)
  await requireSuperAdminSession()
  const updated = await prisma.membershipPayment.updateMany({
    where: { id: parsed.data, status: 'PENDING' },
    data: { status: 'CANCELLED' },
  })
  if (updated.count === 0) return err('Bekleyen ödeme bulunamadı')
  revalidatePath('/dashboard/super-admin')
  revalidatePath('/dashboard/sistem-admin')
  return ok(undefined)
}
