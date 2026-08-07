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
import { writeAuditLog } from '@/lib/audit'
import { requirePermission } from '@/lib/session'
import { tenantTransaction } from '@/lib/security/tenant-db-context'
import { ok, err, type ActionResult } from './result'
import { createNotification } from '@/lib/notifications/service'
import {
  notifyPatientChannels,
  summarizeNotifyResults,
  type PatientChannelSummary,
} from '@/lib/notifications/patient-channels'
import {
  offerOpenedSlotToWaitlistCandidates,
  type FillGapOfferResult,
} from '@/lib/ops/fill-the-gap'
import { trackFunnelEvent } from '@/lib/observability/funnel'
import { createClientNotification } from '@/lib/client-marketplace/notifications'
import { canTransitionAppointmentStatus } from '@/lib/appointment-transitions'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor((total % (24 * 60)) / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

async function ensureDefaultLocation(businessId: string) {
  const existing = await prisma.location.findFirst({
    where: { businessId, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true },
  })
  if (existing) return existing

  const business = await prisma.business.findFirst({
    where: { id: businessId },
    select: { address: true, city: true, phone: true },
  })

  return prisma.location.create({
    data: {
      businessId,
      name: 'Merkez Sube',
      address: business?.address ?? null,
      city: business?.city ?? null,
      phone: business?.phone ?? null,
      isActive: true,
      sortOrder: 0,
    },
    select: { id: true, name: true },
  })
}

async function hasActiveStaffConflict(input: {
  businessId: string
  staffId: string
  date: Date
  startTime: string
  endTime: string
  excludeAppointmentId?: string
}): Promise<'appointment' | 'unavailable' | null> {
  const [conflicts, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        businessId: input.businessId,
        staffId: input.staffId,
        date: input.date,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        id: input.excludeAppointmentId ? { not: input.excludeAppointmentId } : undefined,
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.teamMemberUnavailableBlock.findMany({
      where: {
        businessId: input.businessId,
        staffId: input.staffId,
        date: input.date,
      },
      select: { startTime: true, endTime: true },
    }),
  ])

  if (conflicts.some((c) => c.startTime < input.endTime && c.endTime > input.startTime)) {
    return 'appointment'
  }
  if (blocks.some((b) => b.startTime < input.endTime && b.endTime > input.startTime)) {
    return 'unavailable'
  }
  return null
}

const createSchema = z.object({
  locationId: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().uuid().optional()
  ),
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
  const [patient, service, locationByInput, activeLocations] = await Promise.all([
    prisma.patient.findFirst({
      where: { id: input.patientId, businessId: session.businessId },
      select: { id: true, fullName: true },
    }),
    prisma.service.findFirst({
      where: { id: input.serviceId, businessId: session.businessId },
      select: { id: true, name: true, durationMin: true, price: true },
    }),
    input.locationId
      ? prisma.location.findFirst({
          where: {
            id: input.locationId,
            businessId: session.businessId,
            isActive: true,
          },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
    prisma.location.findMany({
      where: { businessId: session.businessId, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
      take: 200,
    }),
  ])
  if (!patient) return err('Hasta bulunamadı')
  if (!service) return err('Hizmet bulunamadı')
  if (input.locationId && !locationByInput) return err('Konum bulunamadı')

  let location = locationByInput
  if (!location) {
    if (activeLocations.length === 1) {
      location = activeLocations[0]
    } else if (activeLocations.length > 1) {
      return err('Lutfen randevu icin bir sube secin')
    } else {
      location = await ensureDefaultLocation(session.businessId)
    }
  }

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
    if (overlap === 'appointment') return err('Seçilen personel için çakışan bir randevu var')
    if (overlap === 'unavailable') {
      return err('Seçilen personel bu saatte müsait değil (takvim meşgul bloğu)')
    }
  }

  const created = await tenantTransaction(session.businessId, async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        businessId: session.businessId,
        locationId: location.id,
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

    await tx.timelineEvent.create({
      data: {
        businessId: session.businessId,
        patientId: input.patientId,
        type: TimelineEventType.APPOINTMENT_CREATED,
        title: 'Randevu oluşturuldu',
        description: `${service.name} • ${location.name} • ${input.date} ${input.startTime}`,
        actorName: session.fullName,
        actorId: session.userId,
      },
    })

    return appointment
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
      message: `${patient.fullName} icin ${service.name} randevusu olusturuldu (${location.name} • ${input.date} ${input.startTime}). Onay bekliyor.`,
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
        locationId: location.id,
        locationName: location.name,
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
        message: `${patient.fullName} • ${service.name} • ${location.name} • ${input.date} ${input.startTime}`,
        entityType: 'appointment',
        entityId: created.id,
        link: `/dashboard/randevular?id=${created.id}`,
        metadata: {
          appointmentId: created.id,
          patientId: patient.id,
          patientName: patient.fullName,
          serviceName: service.name,
          locationId: location.id,
          locationName: location.name,
          date: input.date,
          startTime: input.startTime,
        },
      })
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')
  revalidatePath(`/dashboard/hastalar/${input.patientId}`)
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'appointment.create',
    entityType: 'Appointment',
    entityId: created.id,
    summary: `Randevu oluşturuldu: ${input.date} ${input.startTime}`,
    metadata: {
      patientId: input.patientId,
      serviceId: input.serviceId,
      date: input.date,
      startTime: input.startTime,
    },
  })
  return ok({ id: created.id })
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  notes: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().max(2000).optional()),
})

export async function setAppointmentStatus(
  rawInput: unknown
): Promise<
  ActionResult<{
    channelDelivery?: PatientChannelSummary
    fillGapOffer?: FillGapOfferResult | null
  }>
> {
  const parsed = statusSchema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('appointment.manage')

  const existing = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
  })
  if (!existing) return err('Randevu bulunamadı')

  if (!canTransitionAppointmentStatus(existing.status, parsed.data.status)) {
    return err(
      `Bu randevu ${existing.status} durumundan ${parsed.data.status} durumuna geçirilemez`
    )
  }

  if (parsed.data.status === 'CONFIRMED' && existing.staffId) {
    const overlap = await hasActiveStaffConflict({
      businessId: session.businessId,
      staffId: existing.staffId,
      date: existing.date,
      startTime: existing.startTime,
      endTime: existing.endTime,
      excludeAppointmentId: existing.id,
    })
    if (overlap === 'appointment') return err('Bu saat için bekleyen veya onaylanmış başka bir randevu var')
    if (overlap === 'unavailable') {
      return err('Bu saat personel takviminde meşgul (Google Calendar / müsait değil bloğu)')
    }
  }

  const map: Record<AppointmentStatus, TimelineEventType> = {
    SCHEDULED: TimelineEventType.APPOINTMENT_UPDATED,
    CONFIRMED: TimelineEventType.APPOINTMENT_UPDATED,
    COMPLETED: TimelineEventType.APPOINTMENT_COMPLETED,
    CANCELLED: TimelineEventType.APPOINTMENT_CANCELLED,
    NO_SHOW: TimelineEventType.APPOINTMENT_CANCELLED,
  }

  await tenantTransaction(session.businessId, async (tx) => {
    const updated = await tx.appointment.updateMany({
      where: { id: parsed.data.id, businessId: session.businessId },
      data: { status: parsed.data.status, notes: parsed.data.notes ?? existing.notes },
    })
    if (updated.count === 0) throw new Error('Randevu bulunamadı')

    await tx.timelineEvent.create({
      data: {
        businessId: session.businessId,
        patientId: existing.patientId,
        type: map[parsed.data.status],
        title: `Randevu durumu: ${parsed.data.status}`,
        actorName: session.fullName,
        actorId: session.userId,
        metadata: { appointmentId: existing.id, source: 'clinic' },
      },
    })
  })

  // Fan a notification out to the other interested parties (owner + assigned
  // doctor), skipping the actor.
  const [patient, service, staff, business, location] = await Promise.all([
    prisma.patient.findFirst({
      where: { id: existing.patientId, businessId: existing.businessId },
      select: { fullName: true, phone: true, email: true },
    }),
    prisma.service.findFirst({
      where: { id: existing.serviceId, businessId: existing.businessId },
      select: { name: true },
    }),
    existing.staffId
      ? prisma.teamMember.findFirst({
          where: { id: existing.staffId, businessId: existing.businessId },
          select: { userId: true, fullName: true },
        })
      : Promise.resolve(null),
    prisma.business.findUnique({
      where: { id: existing.businessId },
      select: { ownerUserId: true, name: true },
    }),
    existing.locationId
      ? prisma.location.findFirst({
          where: { id: existing.locationId, businessId: existing.businessId },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
  ])

  const dateStr = existing.date.toISOString().slice(0, 10)
  const detail = `${service?.name ?? 'Hizmet'}${location?.name ? ` • ${location.name}` : ''} • ${dateStr} ${existing.startTime}`
  const ajandaLink = `/dashboard/ajanda?mode=liste&id=${existing.id}`
  const startsAt = `${dateStr}T${existing.startTime}:00`
  const recipients = [staff?.userId, business?.ownerUserId].filter(
    (id): id is string => Boolean(id)
  )

  const status = parsed.data.status
  const meta = {
    appointmentId: existing.id,
    patientId: existing.patientId,
    patientName: patient?.fullName,
    serviceName: service?.name,
    locationId: location?.id ?? null,
    locationName: location?.name ?? null,
    date: dateStr,
    startTime: existing.startTime,
  }

  let channelDelivery: PatientChannelSummary | undefined
  let fillGapOffer: FillGapOfferResult | null | undefined

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
      link: `${ajandaLink}&status=CONFIRMED`,
      metadata: meta,
    })
    if (existing.clientUserId) {
      await createClientNotification({
        clientUserId: existing.clientUserId,
        businessId: existing.businessId,
        appointmentId: existing.id,
        type: 'BOOKING_APPROVED',
        title: 'Randevunuz onaylandi',
        message: `${dateStr} ${existing.startTime} randevunuz klinik tarafindan onaylandi.`,
        link: `/client/bookings?id=${existing.id}`,
        metadata: meta,
      })
    }
    // Soft-fail: channel errors never roll back approve.
    const channelResults = await notifyPatientChannels({
      businessId: existing.businessId,
      appointmentId: existing.id,
      patientId: existing.patientId,
      patientName: patient?.fullName ?? 'Hasta',
      patientPhone: patient?.phone,
      patientEmail: patient?.email,
      serviceName: service?.name ?? 'Hizmet',
      startsAt,
      clinicName: business?.name,
      kind: 'confirm',
    })
    channelDelivery = summarizeNotifyResults(channelResults)
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
      link: `${ajandaLink}&status=${status}`,
      priority: NotificationPriority.HIGH,
      metadata: meta,
    })
    if (existing.clientUserId) {
      await createClientNotification({
        clientUserId: existing.clientUserId,
        businessId: existing.businessId,
        appointmentId: existing.id,
        type: 'BOOKING_CANCELLED',
        title: 'Randevunuz iptal edildi',
        message: `${dateStr} ${existing.startTime} randevunuz iptal edildi.`,
        link: `/client/bookings?id=${existing.id}`,
        metadata: meta,
      })
    }
    const channelResults = await notifyPatientChannels({
      businessId: existing.businessId,
      appointmentId: existing.id,
      patientId: existing.patientId,
      patientName: patient?.fullName ?? 'Hasta',
      patientPhone: patient?.phone,
      patientEmail: patient?.email,
      serviceName: service?.name ?? 'Hizmet',
      startsAt,
      clinicName: business?.name,
      kind: 'cancel',
    })
    channelDelivery = summarizeNotifyResults(channelResults)

    // Soft-fail waitlist auto-fill: offer opened slot to returning patients.
    try {
      fillGapOffer = await offerOpenedSlotToWaitlistCandidates({
        businessId: existing.businessId,
        appointmentId: existing.id,
        staffId: existing.staffId,
        serviceName: service?.name ?? 'Hizmet',
        startsAt,
        clinicName: business?.name,
        dateIso: dateStr,
        startTime: existing.startTime,
      })
    } catch {
      fillGapOffer = null
    }

    if (status === AppointmentStatus.NO_SHOW) {
      const feePolicy = await prisma.business.findUnique({
        where: { id: existing.businessId },
        select: {
          noShowFeeEnabled: true,
          noShowFeeAmount: true,
          currency: true,
        },
      })
      if (feePolicy?.noShowFeeEnabled && feePolicy.noShowFeeAmount) {
        trackFunnelEvent({
          step: 'deposit_pending',
          businessId: existing.businessId,
          appointmentId: existing.id,
          ok: true,
          metadata: {
            kind: 'no_show_fee_policy',
            amount: Number(feePolicy.noShowFeeAmount),
            currency: feePolicy.currency,
            collection: 'later',
          },
        })
      }
    }
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
      link: `${ajandaLink}&status=COMPLETED`,
      metadata: meta,
    })
    if (existing.clientUserId) {
      await createClientNotification({
        clientUserId: existing.clientUserId,
        businessId: existing.businessId,
        appointmentId: existing.id,
        type: 'REVIEW_REQUEST',
        title: 'Randevunuz tamamlandi',
        message: 'Deneyiminizi puanlayarak diger hastalara yardimci olabilirsiniz.',
        link: `/client/bookings?id=${existing.id}`,
        metadata: meta,
      })
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')
  revalidatePath(`/dashboard/hastalar/${existing.patientId}`)
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: parsed.data.status === 'CANCELLED' ? 'appointment.cancel' : 'appointment.update',
    entityType: 'Appointment',
    entityId: existing.id,
    severity: parsed.data.status === 'CANCELLED' ? 'WARN' : 'INFO',
    summary: `Randevu durumu güncellendi: ${parsed.data.status}`,
    metadata: {
      status: parsed.data.status,
      patientId: existing.patientId,
      channelOutcome: channelDelivery?.outcome ?? null,
      fillGapAttempted: fillGapOffer?.attempted ?? null,
      fillGapNotified: fillGapOffer?.notified ?? null,
    },
  })
  return ok({ channelDelivery, fillGapOffer })
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
    if (overlap === 'appointment') return err('Bu saat için bekleyen veya onaylanmış başka bir randevu var')
    if (overlap === 'unavailable') {
      return err('Bu saat personel takviminde meşgul (Google Calendar / müsait değil bloğu)')
    }
  }

  await tenantTransaction(session.businessId, async (tx) => {
    const updated = await tx.appointment.updateMany({
      where: { id: parsed.data.id, businessId: session.businessId },
      data: {
        date: rescheduledDate,
        startTime: parsed.data.startTime,
        endTime,
        // Rescheduling invalidates a previous confirmation: the new slot needs
        // staff review and sends an appointment_rescheduled notification.
        status: AppointmentStatus.SCHEDULED,
      },
    })
    if (updated.count === 0) throw new Error('Randevu bulunamadı')
    await tx.timelineEvent.create({
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
  })

  const [patient, service, staff, business, location] = await Promise.all([
    prisma.patient.findFirst({
      where: { id: existing.patientId, businessId: existing.businessId },
      select: { fullName: true },
    }),
    prisma.service.findFirst({
      where: { id: existing.serviceId, businessId: existing.businessId },
      select: { name: true },
    }),
    existing.staffId
      ? prisma.teamMember.findFirst({
          where: { id: existing.staffId, businessId: existing.businessId },
          select: { userId: true },
        })
      : Promise.resolve(null),
    prisma.business.findUnique({
      where: { id: existing.businessId },
      select: { ownerUserId: true },
    }),
    existing.locationId
      ? prisma.location.findFirst({
          where: { id: existing.locationId, businessId: existing.businessId },
          select: { id: true, name: true },
        })
      : Promise.resolve(null),
  ])

  await createNotification({
    businessId: existing.businessId,
    recipientUserIds: [staff?.userId, business?.ownerUserId],
    excludeUserId: session.userId,
    actorUserId: session.userId,
    type: NotificationType.APPOINTMENT,
    subtype: 'appointment_rescheduled',
    title: 'Randevu ertelendi',
    message: `${patient?.fullName ?? 'Hasta'} icin randevu${location?.name ? ` (${location.name})` : ''} ${parsed.data.date} ${parsed.data.startTime} saatine alindi.`,
    entityType: 'appointment',
    entityId: existing.id,
    link: `/dashboard/randevular?id=${existing.id}`,
    priority: NotificationPriority.HIGH,
    metadata: {
      appointmentId: existing.id,
      patientId: existing.patientId,
      patientName: patient?.fullName,
      serviceName: service?.name,
      locationId: location?.id ?? null,
      locationName: location?.name ?? null,
      previousStatus: existing.status,
      newStatus: AppointmentStatus.SCHEDULED,
      requiresConfirmation: true,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
    },
  })

  if (existing.clientUserId) {
    await createClientNotification({
      clientUserId: existing.clientUserId,
      businessId: existing.businessId,
      appointmentId: existing.id,
      type: 'BOOKING_RESCHEDULED',
      title: 'Randevunuz ertelendi',
      message: `${parsed.data.date} ${parsed.data.startTime} icin yeni randevu saatiniz olusturuldu.`,
      link: `/client/bookings?id=${existing.id}`,
      metadata: {
        appointmentId: existing.id,
        date: parsed.data.date,
        startTime: parsed.data.startTime,
      },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')
  revalidatePath(`/dashboard/hastalar/${existing.patientId}`)
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'appointment.reschedule',
    entityType: 'Appointment',
    entityId: existing.id,
    severity: 'WARN',
    summary: `Randevu yeniden planlandı: ${parsed.data.date} ${parsed.data.startTime}`,
    metadata: {
      patientId: existing.patientId,
      date: parsed.data.date,
      startTime: parsed.data.startTime,
    },
  })
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
  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'appointment.cancel',
    entityType: 'Appointment',
    entityId: parsed.data.id,
    severity: 'WARN',
    summary: 'Randevu silindi',
  })
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  return ok(undefined)
}
