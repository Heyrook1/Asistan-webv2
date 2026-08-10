import 'server-only'

import {
  AppointmentStatus,
  NotificationActionType,
  NotificationPriority,
  NotificationType,
  Prisma,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications/service'
import { notifyPatientChannels } from '@/lib/notifications/patient-channels'
import {
  createClientBookingSchema,
  type CreateClientBookingInput,
} from './booking-schema'
import {
  runSlotAppointmentTransaction,
  SlotConflictError,
} from '@/lib/booking/create-slot-appointment'

export { createClientBookingSchema }
export type { CreateClientBookingInput }

async function notifyDashboardActors(input: {
  businessId: string
  appointmentId: string
  patientId: string
  patientName: string
  serviceName: string
  locationName: string | null
  date: string
  startTime: string
  staffId: string
  actorUserId: string | null
  pendingApproval: boolean
}) {
  const [assigned, business] = await Promise.all([
    prisma.teamMember.findFirst({
      where: { id: input.staffId, businessId: input.businessId },
      select: { userId: true },
    }),
    prisma.business.findUnique({
      where: { id: input.businessId },
      select: { ownerUserId: true },
    }),
  ])

  const message = `Yeni randevu talebi: ${input.patientName}, ${input.date} ${input.startTime}${
    input.locationName ? ` (${input.locationName})` : ''
  }`

  if (input.pendingApproval) {
    await createNotification({
      businessId: input.businessId,
      recipientUserId: assigned?.userId,
      recipientUserIds: [business?.ownerUserId],
      roles: assigned?.userId ? undefined : ['DOKTOR', 'ISLETME_SAHIBI', 'SEKRETER'],
      actorUserId: input.actorUserId,
      type: NotificationType.APPOINTMENT,
      subtype: 'appointment_pending_approval',
      title: 'Onay bekleyen randevu',
      message,
      entityType: 'appointment',
      entityId: input.appointmentId,
      link: `/dashboard/randevular?id=${input.appointmentId}`,
      priority: NotificationPriority.HIGH,
      actionRequired: true,
      metadata: {
        appointmentId: input.appointmentId,
        patientName: input.patientName,
        serviceName: input.serviceName,
        date: input.date,
        startTime: input.startTime,
      },
      actions: [
        { label: 'Onayla', actionType: NotificationActionType.APPOINTMENT_APPROVE, payload: { appointmentId: input.appointmentId } },
        { label: 'Iptal Et', actionType: NotificationActionType.APPOINTMENT_CANCEL, payload: { appointmentId: input.appointmentId } },
        { label: 'Ertele', actionType: NotificationActionType.APPOINTMENT_RESCHEDULE, payload: { appointmentId: input.appointmentId } },
        { label: 'Hastayi Ac', actionType: NotificationActionType.OPEN_PATIENT, payload: { patientId: input.patientId } },
      ],
    })
  } else {
    await createNotification({
      businessId: input.businessId,
      recipientUserId: assigned?.userId,
      recipientUserIds: [business?.ownerUserId],
      roles: assigned?.userId ? undefined : ['DOKTOR', 'ISLETME_SAHIBI', 'SEKRETER'],
      actorUserId: input.actorUserId,
      type: NotificationType.APPOINTMENT,
      subtype: 'appointment_assigned',
      title: 'Yeni randevu olustu',
      message,
      entityType: 'appointment',
      entityId: input.appointmentId,
      link: `/dashboard/randevular?id=${input.appointmentId}`,
      priority: NotificationPriority.NORMAL,
      metadata: {
        appointmentId: input.appointmentId,
        patientName: input.patientName,
        serviceName: input.serviceName,
        date: input.date,
        startTime: input.startTime,
      },
    })
  }
}

async function createClientBookingOnce(input: {
  payload: CreateClientBookingInput
  clientUserId: string
  authUserId: string
}) {
  return runSlotAppointmentTransaction({
    payload: input.payload,
    clientUserId: input.clientUserId,
    actorUserId: input.authUserId,
    notes: input.payload.note ?? null,
    timelineTitle: 'Client uygulamasından randevu oluşturuldu',
    requireLocationIfIdProvided: true,
    onAfterAppointment: async (tx, ctx) => {
      const notificationType =
        ctx.status === AppointmentStatus.CONFIRMED
          ? 'BOOKING_CONFIRMATION'
          : 'BOOKING_PENDING'
      const notificationTitle =
        ctx.status === AppointmentStatus.CONFIRMED
          ? 'Randevunuz onaylandi'
          : 'Randevunuz onay bekliyor'

      await tx.clientNotification.create({
        data: {
          clientUserId: input.clientUserId,
          businessId: input.payload.businessId,
          appointmentId: ctx.appointmentId,
          type: notificationType,
          title: notificationTitle,
          message: `${input.payload.date} ${input.payload.startTime} randevunuz olusturuldu.`,
          link: `/client/bookings?id=${ctx.appointmentId}`,
          metadata: {
            appointmentId: ctx.appointmentId,
            doctorId: input.payload.doctorId,
            serviceId: input.payload.serviceId,
          },
        },
      })
    },
  })
}

export async function createClientBooking(input: {
  payload: CreateClientBookingInput
  clientUserId: string
  authUserId: string
}) {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const booking = await createClientBookingOnce(input)

      try {
        await notifyDashboardActors({
          businessId: input.payload.businessId,
          appointmentId: booking.appointmentId,
          patientId: booking.patientId,
          patientName: input.payload.fullName,
          serviceName: booking.serviceName,
          locationName: booking.locationName,
          date: input.payload.date,
          startTime: input.payload.startTime,
          staffId: input.payload.doctorId,
          actorUserId: input.authUserId,
          pendingApproval: booking.status === AppointmentStatus.SCHEDULED,
        })
      } catch (notifyError) {
        // Appointment already committed — do not fail the client response.
        console.error('[client-book] clinic notify failed', notifyError)
      }

      if (booking.status === AppointmentStatus.CONFIRMED) {
        try {
          const business = await prisma.business.findUnique({
            where: { id: input.payload.businessId },
            select: { name: true },
          })
          await notifyPatientChannels({
            businessId: input.payload.businessId,
            appointmentId: booking.appointmentId,
            patientId: booking.patientId,
            patientName: input.payload.fullName,
            patientPhone: input.payload.phone,
            patientEmail: input.payload.email,
            serviceName: booking.serviceName,
            startsAt: `${input.payload.date}T${input.payload.startTime}:00`,
            clinicName: business?.name,
            kind: 'confirm',
          })
        } catch (patientNotifyError) {
          console.error('[client-book] patient notify failed', patientNotifyError)
        }
      }

      return {
        ok: true as const,
        data: {
          appointmentId: booking.appointmentId,
          status: booking.status,
          message:
            booking.status === AppointmentStatus.CONFIRMED
              ? 'Randevunuz onaylandi.'
              : 'Randevu talebiniz alindi. Klinik onayindan sonra bilgilendirileceksiniz.',
        },
      }
    } catch (error) {
      if (error instanceof SlotConflictError) {
        return {
          ok: false as const,
          error: error.message,
        }
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034' &&
        attempt < maxAttempts
      ) {
        continue
      }

      throw error
    }
  }

  return {
    ok: false as const,
    error: 'Randevu olusturulurken gecici bir cakisiklik olustu. Lutfen tekrar deneyin.',
  }
}
