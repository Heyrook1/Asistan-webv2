'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import {
  AppointmentStatus,
  NotificationActionType,
  NotificationPriority,
  NotificationType,
  TimelineEventType,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import { ok, err, type ActionResult } from './result'
import { createNotification } from '@/lib/notifications/service'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor((total % (24 * 60)) / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

async function hasActiveStaffConflict(input: {
  businessId: string
  staffId: string
  date: Date
  startTime: string
  endTime: string
  excludeAppointmentId?: string
}) {
  const conflicts = await prisma.appointment.findMany({
    where: {
      businessId: input.businessId,
      staffId: input.staffId,
      date: input.date,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      id: input.excludeAppointmentId ? { not: input.excludeAppointmentId } : undefined,
    },
    select: { startTime: true, endTime: true },
  })

  return conflicts.some((c) => c.startTime < input.endTime && c.endTime > input.startTime)
}

const createSchema = z.object({
  patientId: z.string().uuid('Geçersiz hasta'),
  serviceId: z.string().uuid('Geçersiz hizmet'),
  staffId: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().uuid().optional()
  ),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih yyyy-mm-dd formatında olmalı'),
  startTime: z.string().regex(timeRegex, 'Saat hh:mm formatında olmalı'),
  endTime: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().regex(timeRegex).optional()
  ),
  status: z
    .enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .default('SCHEDULED'),
  notes: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(2000).optional()),
})

export async function createAppointment(rawInput: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(rawInput)
  if (!parsed.success) return err('Form hatalı', parsed.error.issues)
  const session = await requirePermission('appointment.manage')

  const input = parsed.data
  const [patient, service] = await Promise.all([
    prisma.patient.findFirst({
      where: { id: input.patientId, businessId: session.businessId },
      select: { id: true, fullName: true },
    }),
    prisma.service.findFirst({
      where: { id: input.serviceId, businessId: session.businessId },
      select: { id: true, name: true, durationMin: true, price: true },
    }),
  ])
  if (!patient) return err('Hasta bulunamadı')
  if (!service) return err('Hizmet bulunamadı')

  if (input.staffId) {
    const staff = await prisma.teamMember.findFirst({
      where: { id: input.staffId, businessId: session.businessId, isActive: true },
      select: { id: true },
    })
    if (!staff) return err('Personel bulunamadı')
  }

  const endTime = input.endTime ?? addMinutes(input.startTime, service.durationMin)
  if (endTime <= input.startTime) return err('Bitiş saati başlangıçtan sonra olmalı')

  if (input.staffId && (input.status === 'SCHEDULED' || input.status === 'CONFIRMED')) {
    const overlap = await hasActiveStaffConflict({
      businessId: session.businessId,
      staffId: input.staffId,
      date: new Date(input.date),
      startTime: input.startTime,
      endTime,
    })
    if (overlap) return err('Seçilen personel için çakışan bir randevu var')
  }

  const created = await prisma.appointment.create({
    data: {
      businessId: session.businessId,
      patientId: input.patientId,
      serviceId: input.serviceId,
      staffId: input.staffId ?? null,
      date: new Date(input.date),
      startTime: input.startTime,
      endTime,
      status: input.status as AppointmentStatus,
      price: service.price,
      notes: input.notes ?? null,
    },
  })

  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: input.patientId,
      type: TimelineEventType.APPOINTMENT_CREATED,
      title: 'Randevu oluşturuldu',
      description: `${service.name} • ${input.date} ${input.startTime}`,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })

  // Pending-approval workflow: when an appointment lands in SCHEDULED status,
  // the assigned doctor (or — when none — every doctor) needs to approve it.
  // The owner gets a copy for awareness.
  if (created.status === AppointmentStatus.SCHEDULED) {
    const assignedUserId = input.staffId
      ? (await prisma.teamMember.findFirst({
          where: { id: input.staffId, businessId: session.businessId },
          select: { userId: true },
        }))?.userId ?? null
      : null

    const ownerUserId = (
      await prisma.business.findUnique({
        where: { id: session.businessId },
        select: { ownerUserId: true },
      })
    )?.ownerUserId

    await createNotification({
      businessId: session.businessId,
      recipientUserId: assignedUserId,
      recipientUserIds: [ownerUserId],
      roles: assignedUserId ? undefined : ['DOKTOR', 'ISLETME_SAHIBI'],
      excludeUserId: session.userId,
      actorUserId: session.userId,
      type: NotificationType.APPOINTMENT,
      subtype: 'appointment_pending_approval',
      title: 'Onay bekleyen randevu',
      message: `${patient.fullName} için ${service.name} randevusu oluşturuldu (${input.date} ${input.startTime}). Onay bekliyor.`,
      entityType: 'appointment',
      entityId: created.id,
      link: `/dashboard/randevular?id=${created.id}`,
      priority: NotificationPriority.HIGH,
      actionRequired: true,
      metadata: {
        appointmentId: created.id,
        patientId: patient.id,
        patientName: patient.fullName,
        serviceName: service.name,
        date: input.date,
        startTime: input.startTime,
        endTime,
      },
      actions: [
        {
          label: 'Onayla',
          actionType: NotificationActionType.APPOINTMENT_APPROVE,
          payload: { appointmentId: created.id },
        },
        {
          label: 'İptal Et',
          actionType: NotificationActionType.APPOINTMENT_CANCEL,
          payload: { appointmentId: created.id },
        },
        {
          label: 'Ertele',
          actionType: NotificationActionType.APPOINTMENT_RESCHEDULE,
          payload: { appointmentId: created.id },
        },
      ],
    })
  } else if (input.staffId) {
    // Already-confirmed appointments still trigger an `appointment_assigned`
    // ping so the doctor knows a slot is on their calendar.
    const assignedUserId = (
      await prisma.teamMember.findFirst({
        where: { id: input.staffId, businessId: session.businessId },
        select: { userId: true },
      })
    )?.userId
    if (assignedUserId) {
      await createNotification({
        businessId: session.businessId,
        recipientUserId: assignedUserId,
        excludeUserId: session.userId,
        actorUserId: session.userId,
        type: NotificationType.APPOINTMENT,
        subtype: 'appointment_assigned',
        title: 'Yeni randevu atandı',
        message: `${patient.fullName} • ${service.name} • ${input.date} ${input.startTime}`,
        entityType: 'appointment',
        entityId: created.id,
        link: `/dashboard/randevular?id=${created.id}`,
        metadata: {
          appointmentId: created.id,
          patientId: patient.id,
          patientName: patient.fullName,
          serviceName: service.name,
          date: input.date,
          startTime: input.startTime,
        },
      })
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')
  revalidatePath(`/dashboard/hastalar/${input.patientId}`)
  return ok({ id: created.id })
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  notes: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(2000).optional()),
})

export async function setAppointmentStatus(rawInput: unknown): Promise<ActionResult> {
  const parsed = statusSchema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('appointment.manage')

  const existing = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
  })
  if (!existing) return err('Randevu bulunamadı')

  if (parsed.data.status === 'CONFIRMED' && existing.staffId) {
    const overlap = await hasActiveStaffConflict({
      businessId: session.businessId,
      staffId: existing.staffId,
      date: existing.date,
      startTime: existing.startTime,
      endTime: existing.endTime,
      excludeAppointmentId: existing.id,
    })
    if (overlap) return err('Bu saat için bekleyen veya onaylanmış başka bir randevu var')
  }

  await prisma.appointment.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, notes: parsed.data.notes ?? existing.notes },
  })

  const map: Record<AppointmentStatus, TimelineEventType> = {
    SCHEDULED: TimelineEventType.APPOINTMENT_UPDATED,
    CONFIRMED: TimelineEventType.APPOINTMENT_UPDATED,
    COMPLETED: TimelineEventType.APPOINTMENT_COMPLETED,
    CANCELLED: TimelineEventType.APPOINTMENT_CANCELLED,
    NO_SHOW: TimelineEventType.APPOINTMENT_CANCELLED,
  }

  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: existing.patientId,
      type: map[parsed.data.status],
      title: `Randevu durumu: ${parsed.data.status}`,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })

  // Fan a notification out to the other interested parties (owner + assigned
  // doctor), skipping the actor.
  const [patient, service, staff, business] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: existing.patientId },
      select: { fullName: true },
    }),
    prisma.service.findUnique({
      where: { id: existing.serviceId },
      select: { name: true },
    }),
    existing.staffId
      ? prisma.teamMember.findUnique({
          where: { id: existing.staffId },
          select: { userId: true, fullName: true },
        })
      : Promise.resolve(null),
    prisma.business.findUnique({
      where: { id: existing.businessId },
      select: { ownerUserId: true },
    }),
  ])

  const dateStr = existing.date.toISOString().slice(0, 10)
  const detail = `${service?.name ?? 'Hizmet'} • ${dateStr} ${existing.startTime}`
  const recipients = [staff?.userId, business?.ownerUserId].filter(
    (id): id is string => Boolean(id)
  )

  const status = parsed.data.status
  const meta = {
    appointmentId: existing.id,
    patientId: existing.patientId,
    patientName: patient?.fullName,
    serviceName: service?.name,
    date: dateStr,
    startTime: existing.startTime,
  }

  if (status === AppointmentStatus.CONFIRMED) {
    await createNotification({
      businessId: existing.businessId,
      recipientUserIds: recipients,
      excludeUserId: session.userId,
      actorUserId: session.userId,
      type: NotificationType.APPOINTMENT,
      subtype: 'appointment_approved',
      title: 'Randevu onaylandı',
      message: `${patient?.fullName ?? 'Hasta'} için randevu onaylandı. ${detail}`,
      entityType: 'appointment',
      entityId: existing.id,
      link: `/dashboard/randevular?id=${existing.id}`,
      metadata: meta,
    })
  } else if (status === AppointmentStatus.CANCELLED || status === AppointmentStatus.NO_SHOW) {
    await createNotification({
      businessId: existing.businessId,
      recipientUserIds: recipients,
      excludeUserId: session.userId,
      actorUserId: session.userId,
      type: NotificationType.APPOINTMENT,
      subtype: 'appointment_cancelled',
      title: status === AppointmentStatus.NO_SHOW ? 'Randevuya gelinmedi' : 'Randevu iptal edildi',
      message: `${patient?.fullName ?? 'Hasta'} için randevu iptal edildi. ${detail}`,
      entityType: 'appointment',
      entityId: existing.id,
      link: `/dashboard/randevular?id=${existing.id}`,
      priority: NotificationPriority.HIGH,
      metadata: meta,
    })
  } else if (status === AppointmentStatus.COMPLETED) {
    await createNotification({
      businessId: existing.businessId,
      recipientUserIds: recipients,
      excludeUserId: session.userId,
      actorUserId: session.userId,
      type: NotificationType.APPOINTMENT,
      subtype: 'appointment_updated',
      title: 'Randevu tamamlandı',
      message: `${patient?.fullName ?? 'Hasta'} için randevu tamamlandı. ${detail}`,
      entityType: 'appointment',
      entityId: existing.id,
      link: `/dashboard/randevular?id=${existing.id}`,
      metadata: meta,
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')
  revalidatePath(`/dashboard/hastalar/${existing.patientId}`)
  return ok(undefined)
}

const rescheduleSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(timeRegex),
  endTime: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().regex(timeRegex).optional()
  ),
})

export async function rescheduleAppointment(rawInput: unknown): Promise<ActionResult> {
  const parsed = rescheduleSchema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('appointment.manage')
  const existing = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
    include: { service: { select: { durationMin: true } } },
  })
  if (!existing) return err('Randevu bulunamadı')
  const endTime = parsed.data.endTime ?? addMinutes(parsed.data.startTime, existing.service.durationMin)
  if (endTime <= parsed.data.startTime) return err('Bitiş saati başlangıçtan sonra olmalı')
  const rescheduledDate = new Date(parsed.data.date)

  if (existing.staffId) {
    const overlap = await hasActiveStaffConflict({
      businessId: session.businessId,
      staffId: existing.staffId,
      date: rescheduledDate,
      startTime: parsed.data.startTime,
      endTime,
      excludeAppointmentId: existing.id,
    })
    if (overlap) return err('Bu saat için bekleyen veya onaylanmış başka bir randevu var')
  }

  await prisma.appointment.update({
    where: { id: parsed.data.id },
    data: {
      date: rescheduledDate,
      startTime: parsed.data.startTime,
      endTime,
      // Rescheduling invalidates a previous confirmation: the new slot needs
      // staff review and sends an appointment_rescheduled notification.
      status: AppointmentStatus.SCHEDULED,
    },
  })
  await prisma.timelineEvent.create({
    data: {
      businessId: session.businessId,
      patientId: existing.patientId,
      type: TimelineEventType.APPOINTMENT_UPDATED,
      title: 'Randevu yeniden planlandı',
      description: `${parsed.data.date} ${parsed.data.startTime}`,
      actorName: session.fullName,
      actorId: session.userId,
    },
  })

  const [patient, service, staff, business] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: existing.patientId },
      select: { fullName: true },
    }),
    prisma.service.findUnique({
      where: { id: existing.serviceId },
      select: { name: true },
    }),
    existing.staffId
      ? prisma.teamMember.findUnique({
          where: { id: existing.staffId },
          select: { userId: true },
        })
      : Promise.resolve(null),
    prisma.business.findUnique({
      where: { id: existing.businessId },
      select: { ownerUserId: true },
    }),
  ])

  await createNotification({
    businessId: existing.businessId,
    recipientUserIds: [staff?.userId, business?.ownerUserId],
    excludeUserId: session.userId,
    actorUserId: session.userId,
    type: NotificationType.APPOINTMENT,
    subtype: 'appointment_rescheduled',
    title: 'Randevu ertelendi',
    message: `${patient?.fullName ?? 'Hasta'} için randevu ${parsed.data.date} ${parsed.data.startTime} saatine alındı.`,
    entityType: 'appointment',
    entityId: existing.id,
    link: `/dashboard/randevular?id=${existing.id}`,
    priority: NotificationPriority.HIGH,
    metadata: {
      appointmentId: existing.id,
      patientId: existing.patientId,
      patientName: patient?.fullName,
      serviceName: service?.name,
      previousStatus: existing.status,
      newStatus: AppointmentStatus.SCHEDULED,
      requiresConfirmation: true,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')
  revalidatePath(`/dashboard/hastalar/${existing.patientId}`)
  return ok(undefined)
}

export async function deleteAppointment(rawInput: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid() })
  const parsed = schema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('appointment.manage')
  await prisma.appointment.deleteMany({
    where: { id: parsed.data.id, businessId: session.businessId },
  })
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  return ok(undefined)
}
