import 'server-only'

import {
  AppointmentStatus,
  NotificationPriority,
  NotificationType,
  TimelineEventType,
} from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications/service'
import { getAvailableSlots } from './availability'
import { createClientNotification } from './notifications'
import { addMinutesToTime } from './time'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/
const ACTIVE_STATUSES: AppointmentStatus[] = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]

const cancelSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z.string().trim().max(500).optional(),
})

const rescheduleSchema = z.object({
  appointmentId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(timeRegex),
})

export type ClientLifecycleResult =
  | { ok: true }
  | { ok: false; error: string }

async function loadOwnedAppointment(clientUserId: string, appointmentId: string) {
  return prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      clientUserId,
      deletedAt: null,
    },
    include: {
      patient: { select: { fullName: true } },
      service: { select: { name: true, durationMin: true } },
      business: { select: { ownerUserId: true, name: true } },
      staff: { select: { id: true, userId: true, fullName: true } },
      location: { select: { id: true, name: true } },
    },
  })
}

export async function cancelClientAppointment(input: {
  clientUserId: string
  appointmentId: string
  reason?: string
}): Promise<ClientLifecycleResult> {
  const parsed = cancelSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Gecersiz iptal istegi' }

  const existing = await loadOwnedAppointment(input.clientUserId, parsed.data.appointmentId)
  if (!existing) return { ok: false, error: 'Randevu bulunamadi' }
  if (!ACTIVE_STATUSES.includes(existing.status)) {
    return { ok: false, error: 'Bu randevu artik iptal edilemez' }
  }

  const dateStr = existing.date.toISOString().slice(0, 10)
  const cancellationNote = parsed.data.reason
    ? [existing.notes, `Hasta iptali: ${parsed.data.reason}`].filter(Boolean).join('\n')
    : existing.notes

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: existing.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        notes: cancellationNote,
      },
    })

    await tx.timelineEvent.create({
      data: {
        businessId: existing.businessId,
        patientId: existing.patientId,
        type: TimelineEventType.APPOINTMENT_CANCELLED,
        title: 'Hasta randevuyu iptal etti',
        description: parsed.data.reason ?? `${dateStr} ${existing.startTime}`,
        actorName: existing.patient.fullName,
      },
    })
  })

  const detail = `${existing.service.name}${existing.location?.name ? ` • ${existing.location.name}` : ''} • ${dateStr} ${existing.startTime}`

  await createNotification({
    businessId: existing.businessId,
    recipientUserIds: [existing.staff?.userId, existing.business.ownerUserId].filter(
      (id): id is string => Boolean(id)
    ),
    type: NotificationType.APPOINTMENT,
    subtype: 'appointment_cancelled',
    title: 'Randevu iptal edildi',
    message: `${existing.patient.fullName} randevusunu iptal etti. ${detail}`,
    entityType: 'appointment',
    entityId: existing.id,
    link: `/dashboard/randevular?id=${existing.id}`,
    priority: NotificationPriority.HIGH,
    metadata: {
      appointmentId: existing.id,
      patientName: existing.patient.fullName,
      cancelledBy: 'client',
      reason: parsed.data.reason ?? null,
    },
  })

  await createClientNotification({
    clientUserId: input.clientUserId,
    businessId: existing.businessId,
    appointmentId: existing.id,
    type: 'BOOKING_CANCELLED',
    title: 'Randevunuz iptal edildi',
    message: `${dateStr} ${existing.startTime} randevunuz iptal edildi.`,
    link: `/client/bookings?id=${existing.id}`,
    metadata: {
      appointmentId: existing.id,
      date: dateStr,
      startTime: existing.startTime,
    },
  })

  return { ok: true }
}

export async function rescheduleClientAppointment(input: {
  clientUserId: string
  appointmentId: string
  date: string
  startTime: string
}): Promise<ClientLifecycleResult> {
  const parsed = rescheduleSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Gecersiz erteleme istegi' }

  const existing = await loadOwnedAppointment(input.clientUserId, parsed.data.appointmentId)
  if (!existing) return { ok: false, error: 'Randevu bulunamadi' }
  if (!ACTIVE_STATUSES.includes(existing.status)) {
    return { ok: false, error: 'Bu randevu artik ertelenemez' }
  }
  if (!existing.staffId) return { ok: false, error: 'Doktor atanmamis randevu ertelenemez' }

  const currentDate = existing.date.toISOString().slice(0, 10)
  const unchanged = currentDate === parsed.data.date && existing.startTime === parsed.data.startTime
  if (unchanged) return { ok: true }

  const endTime = addMinutesToTime(parsed.data.startTime, existing.service.durationMin)
  const slots = await getAvailableSlots({
    businessId: existing.businessId,
    doctorId: existing.staffId,
    serviceId: existing.serviceId,
    date: parsed.data.date,
    locationId: existing.locationId,
    excludeAppointmentId: existing.id,
  })

  if (!slots.some((slot) => slot.startTime === parsed.data.startTime)) {
    return { ok: false, error: 'Secilen saat artik uygun degil. Lutfen baska bir saat secin.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: existing.id },
      data: {
        date: new Date(parsed.data.date),
        startTime: parsed.data.startTime,
        endTime,
        status: AppointmentStatus.SCHEDULED,
      },
    })

    await tx.timelineEvent.create({
      data: {
        businessId: existing.businessId,
        patientId: existing.patientId,
        type: TimelineEventType.APPOINTMENT_UPDATED,
        title: 'Hasta randevuyu erteledi',
        description: `${parsed.data.date} ${parsed.data.startTime}`,
        actorName: existing.patient.fullName,
      },
    })
  })

  await createNotification({
    businessId: existing.businessId,
    recipientUserIds: [existing.staff?.userId, existing.business.ownerUserId].filter(
      (id): id is string => Boolean(id)
    ),
    type: NotificationType.APPOINTMENT,
    subtype: 'appointment_rescheduled',
    title: 'Randevu ertelendi',
    message: `${existing.patient.fullName} randevusunu ${parsed.data.date} ${parsed.data.startTime} saatine aldi.`,
    entityType: 'appointment',
    entityId: existing.id,
    link: `/dashboard/randevular?id=${existing.id}`,
    priority: NotificationPriority.HIGH,
    metadata: {
      appointmentId: existing.id,
      patientName: existing.patient.fullName,
      rescheduledBy: 'client',
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      requiresConfirmation: true,
    },
  })

  await createClientNotification({
    clientUserId: input.clientUserId,
    businessId: existing.businessId,
    appointmentId: existing.id,
    type: 'BOOKING_RESCHEDULED',
    title: 'Randevu erteleme talebi alindi',
    message: `${parsed.data.date} ${parsed.data.startTime} icin yeni saat talebiniz klinige iletildi.`,
    link: `/client/bookings?id=${existing.id}`,
    metadata: {
      appointmentId: existing.id,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
    },
  })

  return { ok: true }
}
