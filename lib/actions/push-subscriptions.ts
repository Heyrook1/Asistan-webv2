'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const subscribeSchema = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(1).max(500),
  auth: z.string().min(1).max(500),
  userAgent: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(500).optional()),
})

export async function registerPushSubscription(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = subscribeSchema.safeParse(input)
  if (!parsed.success) return err('Push aboneliği bilgileri eksik', parsed.error.issues)
  const session = await requireSession()

  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: parsed.data.endpoint },
    select: { id: true, userId: true },
  })

  if (existing) {
    if (existing.userId !== session.userId) {
      // Reassign the subscription if the browser changed accounts.
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          userId: session.userId,
          businessId: session.businessId,
          p256dh: parsed.data.p256dh,
          auth: parsed.data.auth,
          userAgent: parsed.data.userAgent ?? null,
          lastUsedAt: new Date(),
        },
      })
    } else {
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: parsed.data.p256dh,
          auth: parsed.data.auth,
          userAgent: parsed.data.userAgent ?? null,
          lastUsedAt: new Date(),
        },
      })
    }
    return ok({ id: existing.id })
  }

  const created = await prisma.pushSubscription.create({
    data: {
      businessId: session.businessId,
      userId: session.userId,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
      userAgent: parsed.data.userAgent ?? null,
      lastUsedAt: new Date(),
    },
    select: { id: true },
  })
  return ok({ id: created.id })
}

const unsubscribeSchema = z.object({ endpoint: z.string().url() })

export async function unregisterPushSubscription(input: unknown): Promise<ActionResult> {
  const parsed = unsubscribeSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz endpoint', parsed.error.issues)
  const session = await requireSession()
  await prisma.pushSubscription.deleteMany({
    where: { endpoint: parsed.data.endpoint, userId: session.userId },
  })
  return ok(undefined)
}
