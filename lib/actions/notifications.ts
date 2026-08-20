'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { AppointmentStatus, NotificationActionStatus, NotificationActionType, NotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/session'
import { ok, err, type ActionResult } from './result'
import { createNotification } from '@/lib/notifications/service'
import { setAppointmentStatus, rescheduleAppointment } from './appointments'

/** Manual creator — typically used by admin tooling. The integration triggers
 *  call `createNotification` from the service directly so they can include
 *  metadata, actions, role-fanout, etc. */
const createSchema = z.object({
  title: z.string().trim().min(2).max(160),
  message: z.string().trim().min(2).max(1000),
  type: z.enum(['APPOINTMENT', 'PATIENT', 'TEAM', 'SYSTEM']).default('SYSTEM'),
  link: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().optional()),
  userId: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().uuid().optional()),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
})

export async function createManualNotification(input: unknown): Promise<ActionResult<{ ids: string[] }>> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requireSession()
  const result = await createNotification({
    businessId: session.businessId,
    recipientUserId: parsed.data.userId ?? null,
    roles: parsed.data.userId ? undefined : ['ISLETME_SAHIBI', 'DOKTOR', 'SEKRETER', 'PERSONEL'],
    excludeUserId: session.userId,
    actorUserId: session.userId,
    type: parsed.data.type as NotificationType,
    subtype: 'system_alert',
    title: parsed.data.title,
    message: parsed.data.message,
    link: parsed.data.link ?? null,
    priority: parsed.data.priority,
  })
  revalidatePath('/dashboard/bildirimler')
  revalidatePath('/dashboard')
  return ok({ ids: result.ids })
}

const idSchema = z.object({ id: z.string().uuid() })

export async function markNotificationRead(input: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  const result = await prisma.notification.updateMany({
    where: {
      id: parsed.data.id,
      businessId: session.businessId,
      OR: [{ userId: session.userId }, { userId: null }],
      isRead: false,
    },
    data: { isRead: true, readAt: new Date() },
  })
  if (result.count === 0) {
    // Already-read or not visible to this user: treat as a soft success so the
    // UI can collapse silently.
    return ok(undefined)
  }
  revalidatePath('/dashboard/bildirimler')
  revalidatePath('/dashboard')
  return ok(undefined)
}

export async function markNotificationUnread(input: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  await prisma.notification.updateMany({
    where: {
      id: parsed.data.id,
      businessId: session.businessId,
      OR: [{ userId: session.userId }, { userId: null }],
    },
    data: { isRead: false, readAt: null },
  })
  revalidatePath('/dashboard/bildirimler')
  revalidatePath('/dashboard')
  return ok(undefined)
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await requireSession()
  await prisma.notification.updateMany({
    where: {
      businessId: session.businessId,
      OR: [{ userId: session.userId }, { userId: null }],
      isRead: false,
      archivedAt: null,
    },
    data: { isRead: true, readAt: new Date() },
  })
  revalidatePath('/dashboard/bildirimler')
  revalidatePath('/dashboard')
  return ok(undefined)
}

export async function archiveNotification(input: unknown): Promise<ActionResult> {
  const parsed = idSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()
  await prisma.notification.updateMany({
    where: {
      id: parsed.data.id,
      businessId: session.businessId,
      OR: [{ userId: session.userId }, { userId: null }],
    },
    data: { archivedAt: new Date(), isRead: true, readAt: new Date() },
  })
  revalidatePath('/dashboard/bildirimler')
  revalidatePath('/dashboard')
  return ok(undefined)
}

// ── Quick action runner ────────────────────────────────────────────────────

const runActionSchema = z.object({
  actionId: z.string().uuid(),
  rescheduleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  rescheduleStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
})

type ActionPayload = {
  appointmentId?: string
  patientId?: string
  link?: string
}

export async function runNotificationAction(
  input: unknown
): Promise<ActionResult<{ message: string; link?: string }>> {
  const parsed = runActionSchema.safeParse(input)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requireSession()

  const action = await prisma.notificationAction.findFirst({
    where: { id: parsed.data.actionId },
    include: {
      notification: true,
    },
  })
  if (!action) return err('Aksiyon bulunamadı')
  if (action.notification.businessId !== session.businessId) return err('Yetkisiz işlem')
  if (action.notification.userId && action.notification.userId !== session.userId) {
    return err('Bu aksiyon size atanmamış')
  }
  if (action.status !== NotificationActionStatus.PENDING) {
    return err('Bu aksiyon zaten tamamlanmış')
  }

  const payload = (action.payload ?? {}) as ActionPayload

  try {
    switch (action.actionType) {
      case NotificationActionType.APPOINTMENT_APPROVE: {
        if (!payload.appointmentId) return err('Randevu bulunamadı')
        const res = await setAppointmentStatus({
          id: payload.appointmentId,
          status: AppointmentStatus.CONFIRMED,
        })
        if (!res.ok) return res
        await completeActionRow(action.id, session.userId)
        await closePeerActions(action.notificationId, action.id)
        const channelNote = res.data.channelDelivery?.label
        return ok({
          message: channelNote
            ? `Randevu onaylandı. ${channelNote}`
            : 'Randevu onaylandı',
        })
      }
      case NotificationActionType.APPOINTMENT_CANCEL: {
        if (!payload.appointmentId) return err('Randevu bulunamadı')
        const res = await setAppointmentStatus({
          id: payload.appointmentId,
          status: AppointmentStatus.CANCELLED,
        })
        if (!res.ok) return res
        await completeActionRow(action.id, session.userId)
        await closePeerActions(action.notificationId, action.id)
        const channelNote = res.data.channelDelivery?.label
        return ok({
          message: channelNote
            ? `Randevu iptal edildi. ${channelNote}`
            : 'Randevu iptal edildi',
        })
      }
      case NotificationActionType.APPOINTMENT_RESCHEDULE: {
        if (!payload.appointmentId) return err('Randevu bulunamadı')
        if (!parsed.data.rescheduleDate || !parsed.data.rescheduleStart) {
          return ok({
            message: 'Yeni tarih/saat seçimi gerekli',
            link: `/dashboard/randevular?id=${payload.appointmentId}`,
          })
        }
        const res = await rescheduleAppointment({
          id: payload.appointmentId,
          date: parsed.data.rescheduleDate,
          startTime: parsed.data.rescheduleStart,
        })
        if (!res.ok) return res
        await completeActionRow(action.id, session.userId)
        return ok({ message: 'Randevu ertelendi' })
      }
      case NotificationActionType.OPEN_LINK:
      case NotificationActionType.OPEN_APPOINTMENT:
      case NotificationActionType.OPEN_PATIENT: {
        const link =
          payload.link ??
          (payload.appointmentId
            ? `/dashboard/randevular?id=${payload.appointmentId}`
            : payload.patientId
              ? `/dashboard/hastalar/${payload.patientId}`
              : action.notification.link ?? '/dashboard/bildirimler')
        await completeActionRow(action.id, session.userId)
        return ok({ message: 'Açılıyor', link })
      }
      case NotificationActionType.ACK:
      default: {
        await completeActionRow(action.id, session.userId)
        return ok({ message: 'İşlem tamamlandı' })
      }
    }
  } finally {
    revalidatePath('/dashboard/bildirimler')
    revalidatePath('/dashboard')
  }
}

async function completeActionRow(actionId: string, userId: string) {
  const completedAt = new Date()

  await prisma.$transaction(async (tx) => {
    // Marking the parent notification as read so it stops counting against the
    // unread badge once a decision has been made.
    const action = await tx.notificationAction.update({
      where: { id: actionId },
      data: { status: NotificationActionStatus.COMPLETED, completedBy: userId, completedAt },
      select: { notificationId: true },
    })

    await tx.notification.update({
      where: { id: action.notificationId },
      data: { isRead: true, readAt: completedAt },
    })
  })
}

async function closePeerActions(notificationId: string, exceptActionId: string) {
  await prisma.notificationAction.updateMany({
    where: {
      notificationId,
      id: { not: exceptActionId },
      status: NotificationActionStatus.PENDING,
    },
    data: { status: NotificationActionStatus.CANCELLED, completedAt: new Date() },
  })
}
