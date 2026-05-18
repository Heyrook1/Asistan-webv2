'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { NotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const createSchema = z.object({
  title: z.string().trim().min(2).max(160),
  message: z.string().trim().min(2).max(1000),
  type: z.enum(['APPOINTMENT', 'PATIENT', 'TEAM', 'SYSTEM']).default('SYSTEM'),
  link: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().optional()),
  userId: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().uuid().optional()),
})

export async function createNotification(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const created = await prisma.notification.create({
    data: {
      businessId: session.businessId,
      userId: parsed.data.userId ?? null,
      type: parsed.data.type as NotificationType,
      title: parsed.data.title,
      message: parsed.data.message,
      link: parsed.data.link ?? null,
    },
  })
  revalidatePath('/dashboard/bildirimler')
  revalidatePath('/dashboard')
  return ok({ id: created.id })
}

export async function markNotificationRead(input: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid() })
  const parsed = schema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  await prisma.notification.updateMany({
    where: {
      id: parsed.data.id,
      businessId: session.businessId,
      OR: [{ userId: session.userId }, { userId: null }],
    },
    data: { isRead: true, readAt: new Date() },
  })
  revalidatePath('/dashboard/bildirimler')
  return ok(undefined)
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await requireSession()
  await prisma.notification.updateMany({
    where: {
      businessId: session.businessId,
      OR: [{ userId: session.userId }, { userId: null }],
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  })
  revalidatePath('/dashboard/bildirimler')
  return ok(undefined)
}
