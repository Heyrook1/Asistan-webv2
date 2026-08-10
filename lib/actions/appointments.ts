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
import { ensurePatientCardOnConfirm } from '@/lib/identity/ensure-patient-card-on-confirm'
import { clinicStaffAssignmentError } from '@/lib/security/platform-roles'
import { LOCATION_REQUIRED_ERROR } from '@/lib/locations/constants'
import { normalizeWallTime } from '@/lib/datetime/clinic-zone'

export { LOCATION_REQUIRED_ERROR }

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

/** HTML `<input type="time">` may send HH:mm:ss — coerce to HH:mm before zod. */
const timeInputSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return value
  // Only coerce clock-like strings; leave garbage for the regex to reject.
  if (!/^\d{1,2}:\d{2}/.test(trimmed)) return trimmed
  return normalizeWallTime(trimmed)
}, z.string().regex(timeRegex, 'Saat ss:dd formatında olmalı (örn. 15:30)'))

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor((total % (24 * 60)) / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** Calendar YYYY-MM-DD → Date for Prisma `@db.Date` (noon UTC, no host-TZ day shift). */
function calendarDateToPrismaDate(dateYmd: string): Date {
  return new Date(`${dateYmd}T12:00:00.000Z`)
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
  startTime: timeInputSchema,
  endTime: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    timeInputSchema.optional()
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
      return err('Lütfen randevu için bir şube seçin')
    } else {
      return err(LOCATION_REQUIRED_ERROR)
    }
  }

  if (input.staffId) {
    const staff = await prisma.teamMember.findFirst({
      where: { id: input.staffId },
      select: { id: true, businessId: true, isActive: true, role: true },
    })
    const staffError = clinicStaffAssignmentError({
      staff,
      expectedBusinessId: session.businessId,
    })
    if (staffError) return err(staffError)
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
        metadata: { appointmentId: appointment.id },
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
      message: `${patient.fullName} için ${service.name} randevusu oluşturuldu (${location.name} • ${input.date} ${input.startTime}). Onay bekliyor.`,
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
  /** Clinic cancel reason — required on cancel (min 3), stored in audit/timeline. */
  cancelReason: z
    .preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().trim().min(3).max(500).optional()),
  /** Toast “Geri al”: restore SCHEDULED/CONFIRMED from CANCELLED only. */
  undoCancel: z.boolean().optional(),
})

export async function setAppointmentStatus(
  rawInput: unknown
): Promise<
  ActionResult<{
    channelDelivery?: PatientChannelSummary
    fillGapOffer?: FillGapOfferResult | null
    alreadyInStatus?: boolean
    previousStatus?: AppointmentStatus
  }>
> {
  try {
    const parsed = statusSchema.safeParse(rawInput)
    if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
    if (
      parsed.data.status === 'CANCELLED' &&
      !parsed.data.undoCancel &&
      !(parsed.data.cancelReason && parsed.data.cancelReason.trim().length >= 3)
    ) {
      return err('İptal gerekçesi en az 3 karakter olmalıdır')
    }
    const session = await requirePermission('appointment.manage')

    const existing = await prisma.appointment.findFirst({
      where: { id: parsed.data.id, businessId: session.businessId },
    })
    if (!existing) return err('Randevu bulunamadı')

    // Idempotent: already at target — no second notify / audit / timeline.
    if (existing.status === parsed.data.status) {
      return ok({ alreadyInStatus: true })
    }

    if (parsed.data.undoCancel) {
      if (existing.status !== AppointmentStatus.CANCELLED) {
        return err('Yalnızca iptal edilmiş randevu geri alınabilir')
      }
      if (
        parsed.data.status !== AppointmentStatus.SCHEDULED &&
        parsed.data.status !== AppointmentStatus.CONFIRMED
      ) {
        return err('Geri alma yalnızca Onay bekliyor veya Onaylandı durumuna yapılabilir')
      }
    } else if (!canTransitionAppointmentStatus(existing.status, parsed.data.status)) {
      return err(
        `Bu randevu ${existing.status} durumundan ${parsed.data.status} durumuna geçirilemez`
      )
    }

    if (parsed.data.status === 'CONFIRMED' && existing.staffId && !parsed.data.undoCancel) {
      const overlap = await hasActiveStaffConflict({
        businessId: session.businessId,
        staffId: existing.staffId,
        date: existing.date,
        startTime: existing.startTime,
        endTime: existing.endTime,
        excludeAppointmentId: existing.id,
      })
      if (overlap === 'appointment') {
        return err('Bu saat için bekleyen veya onaylanmış başka bir randevu var')
      }
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

    const fromStatus = existing.status
    let transitioned = false

    try {
      transitioned = await tenantTransaction(session.businessId, async (tx) => {
        // CAS: only one concurrent transition from the observed status wins.
        const updated = await tx.appointment.updateMany({
          where: {
            id: parsed.data.id,
            businessId: session.businessId,
            status: fromStatus,
          },
          data: {
            status: parsed.data.status,
            // Do not overwrite clinical notes with cancel reason.
            ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
          },
        })

        if (updated.count === 0) {
          const current = await tx.appointment.findFirst({
            where: { id: parsed.data.id, businessId: session.businessId },
            select: { status: true },
          })
          if (current?.status === parsed.data.status) {
            return false
          }
          throw new Error('STATUS_CAS_CONFLICT')
        }

        if (parsed.data.status === 'CONFIRMED' && !parsed.data.undoCancel) {
          // Soft-fail inside helper — never rolls back CONFIRMED.
          await ensurePatientCardOnConfirm(tx, {
            businessId: session.businessId,
            patientId: existing.patientId,
            staffId: existing.staffId,
            appointmentSource: existing.source,
          })
        }

        const cancelReason = parsed.data.cancelReason?.trim()
        await tx.timelineEvent.create({
          data: {
            businessId: session.businessId,
            patientId: existing.patientId,
            type: map[parsed.data.status],
            title: parsed.data.undoCancel
              ? 'Randevu iptali geri alındı'
              : parsed.data.status === 'CANCELLED'
                ? 'Randevu iptal edildi'
                : `Randevu durumu: ${parsed.data.status}`,
            description: cancelReason
              ? `Gerekçe: ${cancelReason}`
              : parsed.data.undoCancel
                ? `Önceki durum geri yüklendi: ${parsed.data.status}`
                : null,
            actorName: session.fullName,
            actorId: session.userId,
            metadata: {
              appointmentId: existing.id,
              source: 'clinic',
              from: fromStatus,
              to: parsed.data.status,
              cancelReason: cancelReason ?? null,
              undoCancel: Boolean(parsed.data.undoCancel),
            },
          },
        })
        return true
      })
    } catch (txError) {
      if (txError instanceof Error && txError.message === 'STATUS_CAS_CONFLICT') {
        return err('Randevu durumu başka bir işlem tarafından değiştirildi. Sayfayı yenileyip tekrar deneyin.')
      }
      console.error('[setAppointmentStatus] transaction failed', txError)
      return err('Randevu durumu güncellenemedi. Lütfen tekrar deneyin.')
    }

    if (!transitioned) {
      return ok({ alreadyInStatus: true })
    }

    // Side effects after commit — soft-fail so status stays correct.
    let channelDelivery: PatientChannelSummary | undefined
    let fillGapOffer: FillGapOfferResult | null | undefined

    try {
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
      const cancelReason = parsed.data.cancelReason?.trim()
      const meta = {
        appointmentId: existing.id,
        patientId: existing.patientId,
        patientName: patient?.fullName,
        serviceName: service?.name,
        locationId: location?.id ?? null,
        locationName: location?.name ?? null,
        date: dateStr,
        startTime: existing.startTime,
        cancelReason: cancelReason ?? null,
        undoCancel: Boolean(parsed.data.undoCancel),
      }

      if (parsed.data.undoCancel) {
        await createNotification({
          businessId: existing.businessId,
          recipientUserIds: recipients,
          excludeUserId: session.userId,
          actorUserId: session.userId,
          type: NotificationType.APPOINTMENT,
          subtype: 'appointment_updated',
          title: 'Randevu iptali geri alındı',
          message: `${patient?.fullName ?? 'Hasta'} randevusu yeniden aktif: ${detail}`,
          entityType: 'appointment',
          entityId: existing.id,
          link: `${ajandaLink}&status=${status}`,
          priority: NotificationPriority.NORMAL,
          metadata: meta,
        })
      } else if (status === AppointmentStatus.CONFIRMED) {
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
            title: 'Randevunuz onaylandı',
            message: `${dateStr} ${existing.startTime} randevunuz klinik tarafından onaylandı.`,
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
          kind: 'confirm',
        })
        channelDelivery = summarizeNotifyResults(channelResults)
      } else if (status === AppointmentStatus.CANCELLED || status === AppointmentStatus.NO_SHOW) {
        const reasonSuffix = cancelReason ? ` Gerekçe: ${cancelReason}` : ''
        await createNotification({
          businessId: existing.businessId,
          recipientUserIds: recipients,
          excludeUserId: session.userId,
          actorUserId: session.userId,
          type: NotificationType.APPOINTMENT,
          subtype: 'appointment_cancelled',
          title: status === AppointmentStatus.NO_SHOW ? 'Randevuya gelinmedi' : 'Randevu iptal edildi',
          message: `${patient?.fullName ?? 'Hasta'} için randevu iptal edildi. ${detail}.${reasonSuffix}`,
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
            message: `${dateStr} ${existing.startTime} randevunuz iptal edildi.${reasonSuffix}`,
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
            title: 'Randevunuz tamamlandı',
            message: 'Deneyiminizi puanlayarak diğer hastalara yardımcı olabilirsiniz.',
            link: `/client/bookings?id=${existing.id}`,
            metadata: meta,
          })
        }
      }

      await writeAuditLog({
        businessId: session.businessId,
        actorUserId: session.userId,
        action: parsed.data.undoCancel
          ? 'appointment.update'
          : parsed.data.status === 'CANCELLED'
            ? 'appointment.cancel'
            : 'appointment.update',
        entityType: 'Appointment',
        entityId: existing.id,
        severity: parsed.data.status === 'CANCELLED' && !parsed.data.undoCancel ? 'WARN' : 'INFO',
        summary: parsed.data.undoCancel
          ? `Randevu iptali geri alındı → ${parsed.data.status}`
          : parsed.data.status === 'CANCELLED'
            ? `Randevu iptal edildi${cancelReason ? `: ${cancelReason}` : ''}`
            : `Randevu durumu güncellendi: ${parsed.data.status}`,
        metadata: {
          status: parsed.data.status,
          fromStatus,
          patientId: existing.patientId,
          cancelReason: cancelReason ?? null,
          undoCancel: Boolean(parsed.data.undoCancel),
          channelOutcome: channelDelivery?.outcome ?? null,
          fillGapAttempted: fillGapOffer?.attempted ?? null,
          fillGapNotified: fillGapOffer?.notified ?? null,
        },
      })
    } catch (sideEffectError) {
      console.error('[setAppointmentStatus] side-effect soft-fail', sideEffectError)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/ajanda')
    revalidatePath('/dashboard/randevular')
    revalidatePath('/dashboard/takvim')
    revalidatePath('/dashboard/bildirimler')
    revalidatePath('/dashboard/hastalar')
    revalidatePath(`/dashboard/hastalar/${existing.patientId}`)
    return ok({ channelDelivery, fillGapOffer, previousStatus: fromStatus })
  } catch (error) {
    console.error('[setAppointmentStatus] unexpected', error)
    return err('Randevu durumu güncellenemedi. Lütfen tekrar deneyin.')
  }
}

const rescheduleSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: timeInputSchema,
  endTime: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    timeInputSchema.optional()
  ),
})

export async function rescheduleAppointment(rawInput: unknown): Promise<ActionResult> {
  const parsed = rescheduleSchema.safeParse(rawInput)
  if (!parsed.success) {
    const fieldHint = parsed.error.issues[0]?.message
    return err(fieldHint ?? 'Geçersiz girdi', parsed.error.issues)
  }
  const session = await requirePermission('appointment.manage')
  const existing = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
    include: { service: { select: { durationMin: true } } },
  })
  if (!existing) return err('Randevu bulunamadı')
  const endTime = parsed.data.endTime ?? addMinutes(parsed.data.startTime, existing.service.durationMin)
  if (endTime <= parsed.data.startTime) return err('Bitiş saati başlangıçtan sonra olmalı')
  const rescheduledDate = calendarDateToPrismaDate(parsed.data.date)

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

  try {
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
      if (updated.count === 0) throw new Error('STATUS_CAS_CONFLICT')
      await tx.timelineEvent.create({
        data: {
          businessId: session.businessId,
          patientId: existing.patientId,
          type: TimelineEventType.APPOINTMENT_UPDATED,
          title: 'Randevu yeniden planlandı',
          description: `${parsed.data.date} ${parsed.data.startTime}`,
          actorName: session.fullName,
          actorId: session.userId,
          metadata: {
            appointmentId: existing.id,
            date: parsed.data.date,
            startTime: parsed.data.startTime,
            endTime,
          },
        },
      })
    })
  } catch (txError) {
    if (txError instanceof Error && txError.message === 'STATUS_CAS_CONFLICT') {
      return err('Randevu güncellenemedi. Sayfayı yenileyip tekrar deneyin.')
    }
    console.error('[rescheduleAppointment] transaction failed', txError)
    return err('Randevu yeniden planlanamadı. Lütfen tekrar deneyin.')
  }

  // Side effects after commit — soft-fail so the saved slot is never rolled back silently.
  try {
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
      message: `${patient?.fullName ?? 'Hasta'} için randevu${location?.name ? ` (${location.name})` : ''} ${parsed.data.date} ${parsed.data.startTime} saatine alındı.`,
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
        message: `${parsed.data.date} ${parsed.data.startTime} için yeni randevu saatiniz oluşturuldu.`,
        link: `/client/bookings?id=${existing.id}`,
        metadata: {
          appointmentId: existing.id,
          date: parsed.data.date,
          startTime: parsed.data.startTime,
        },
      })
    }
  } catch (notifyError) {
    console.error('[rescheduleAppointment] notify soft-fail', notifyError)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/bildirimler')
  revalidatePath(`/dashboard/hastalar/${existing.patientId}`)
  try {
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
  } catch (auditError) {
    console.error('[rescheduleAppointment] audit soft-fail', auditError)
  }

  return ok({ date: parsed.data.date, startTime: parsed.data.startTime, endTime })
}

export async function deleteAppointment(rawInput: unknown): Promise<ActionResult> {
  const schema = z.object({ id: z.string().uuid() })
  const parsed = schema.safeParse(rawInput)
  if (!parsed.success) return err('Geçersiz girdi', parsed.error.issues)
  const session = await requirePermission('appointment.manage')

  const existing = await prisma.appointment.findFirst({
    where: { id: parsed.data.id, businessId: session.businessId },
    select: { id: true, patientId: true, date: true, startTime: true },
  })
  if (!existing) return err('Randevu bulunamadı')

  // Product decision: soft-delete (archive). Agenda / patient / analytics / counts
  // all hide via deletedAt; audit + optional timeline breadcrumb remain.
  await tenantTransaction(session.businessId, async (tx) => {
    const archived = await tx.appointment.deleteMany({
      where: { id: existing.id, businessId: session.businessId },
    })
    if (archived.count === 0) throw new Error('Randevu bulunamadı')

    await tx.notification.deleteMany({
      where: {
        businessId: session.businessId,
        entityType: 'appointment',
        entityId: existing.id,
      },
    })

    await tx.clientNotification.deleteMany({
      where: {
        appointmentId: existing.id,
      },
    })

    await tx.timelineEvent.deleteMany({
      where: {
        businessId: session.businessId,
        patientId: existing.patientId,
        metadata: { path: ['appointmentId'], equals: existing.id },
      },
    })

    await tx.timelineEvent.create({
      data: {
        businessId: session.businessId,
        patientId: existing.patientId,
        type: TimelineEventType.APPOINTMENT_CANCELLED,
        title: 'Randevu ajandadan kaldırıldı',
        description:
          'Ajanda ve sayaçlardan düşürüldü; denetim kaydı için arşivlendi (geri alınamaz soft-delete).',
        actorName: session.fullName,
        actorId: session.userId,
        metadata: {
          appointmentId: existing.id,
          archived: true,
          date: existing.date.toISOString().slice(0, 10),
          startTime: existing.startTime,
        },
      },
    })
  })

  await writeAuditLog({
    businessId: session.businessId,
    actorUserId: session.userId,
    action: 'appointment.archive',
    entityType: 'Appointment',
    entityId: existing.id,
    severity: 'WARN',
    summary: 'Randevu ajandadan kaldırıldı (arşiv)',
    metadata: { patientId: existing.patientId, softDelete: true },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/ajanda')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
  revalidatePath('/dashboard/hastalar')
  revalidatePath(`/dashboard/hastalar/${existing.patientId}`)
  revalidatePath('/dashboard/analitik')
  return ok(undefined)
}
