import 'server-only'

import { Prisma, AppointmentStatus, NotificationActionType, NotificationPriority, NotificationType, TimelineEventType } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications/service'
import { getAvailableSlotsTx } from './availability'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

export const createClientBookingSchema = z.object({
  businessId: z.string().uuid(),
  doctorId: z.string().uuid(),
  serviceId: z.string().uuid(),
  locationId: z.string().uuid().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(timeRegex),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().optional().nullable(),
  note: z.string().trim().max(2000).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
})

type CreateClientBookingInput = z.infer<typeof createClientBookingSchema>

class SlotConflictError extends Error {
  constructor() {
    super('Bu saat az önce doldu. Lütfen başka bir saat seçin.')
  }
}

async function nextPatientNumber(tx: Prisma.TransactionClient, businessId: string) {
  const rows = await tx.$queryRaw<Array<{ next_patient_number: string }>>`
    select public.next_patient_number(${businessId}) as next_patient_number
  `
  const patientNumber = rows[0]?.next_patient_number
  if (!patientNumber) throw new Error('Hasta numarasi uretilemedi')
  return patientNumber
}

async function getOrCreatePatientFromClient(
  tx: Prisma.TransactionClient,
  input: CreateClientBookingInput
) {
  const email = input.email?.toLowerCase() ?? null
  const byEmail = email
    ? await tx.patient.findFirst({
        where: { businessId: input.businessId, email },
        select: { id: true, fullName: true },
      })
    : null

  const byPhone = byEmail
    ? null
    : await tx.patient.findFirst({
        where: { businessId: input.businessId, phone: input.phone },
        select: { id: true, fullName: true },
      })

  const existing = byEmail ?? byPhone
  if (existing) {
    await tx.patient.update({
      where: { id: existing.id },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        email,
        address: input.address ?? undefined,
        city: input.city ?? undefined,
      },
    })
    return existing.id
  }

  const patientNumber = await nextPatientNumber(tx, input.businessId)
  const created = await tx.patient.create({
    data: {
      businessId: input.businessId,
      patientNumber,
      fullName: input.fullName,
      phone: input.phone,
      email,
      address: input.address ?? null,
      city: input.city ?? null,
    },
    select: { id: true },
  })
  return created.id
}

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
  const booking = await prisma.$transaction(
    async (tx) => {
      const [business, doctor, service] = await Promise.all([
        tx.business.findFirst({
          where: { id: input.payload.businessId, isActive: true },
          select: { id: true, autoConfirmClientAppointments: true },
        }),
        tx.teamMember.findFirst({
          where: {
            id: input.payload.doctorId,
            businessId: input.payload.businessId,
            role: 'DOKTOR',
            isBookable: true,
            isActive: true,
          },
          select: { id: true, fullName: true },
        }),
        tx.service.findFirst({
          where: {
            id: input.payload.serviceId,
            businessId: input.payload.businessId,
            isActive: true,
          },
          select: { id: true, name: true, durationMin: true, price: true },
        }),
      ])

      if (!business || !doctor || !service) {
        throw new Error('Klinik, doktor veya hizmet bilgisi bulunamadi')
      }

      await tx.$queryRaw`
        select "id"
        from "Appointment"
        where "businessId" = ${input.payload.businessId}::uuid
          and "staffId" = ${input.payload.doctorId}::uuid
          and "date" = ${input.payload.date}::date
          and "status" in ('SCHEDULED', 'CONFIRMED')
        for update
      `

      const availableSlots = await getAvailableSlotsTx(tx, {
        businessId: input.payload.businessId,
        doctorId: input.payload.doctorId,
        serviceId: input.payload.serviceId,
        date: input.payload.date,
        locationId: input.payload.locationId ?? null,
      })

      const matched = availableSlots.find((slot) => slot.startTime === input.payload.startTime)
      if (!matched) {
        throw new SlotConflictError()
      }

      const location = input.payload.locationId
        ? await tx.location.findFirst({
            where: {
              id: input.payload.locationId,
              businessId: input.payload.businessId,
              isActive: true,
            },
            select: { id: true, name: true },
          })
        : await tx.location.findFirst({
            where: { businessId: input.payload.businessId, isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            select: { id: true, name: true },
          })

      if (!location) {
        throw new Error('Randevu icin uygun sube bulunamadi')
      }

      const patientId = await getOrCreatePatientFromClient(tx, input.payload)
      const status = business.autoConfirmClientAppointments
        ? AppointmentStatus.CONFIRMED
        : AppointmentStatus.SCHEDULED

      const appointment = await tx.appointment.create({
        data: {
          businessId: input.payload.businessId,
          locationId: location.id,
          patientId,
          serviceId: input.payload.serviceId,
          staffId: input.payload.doctorId,
          clientUserId: input.clientUserId,
          date: new Date(input.payload.date),
          startTime: matched.startTime,
          endTime: matched.endTime,
          status,
          source: 'CLIENT_APP',
          notes: input.payload.note ?? null,
          price: service.price,
        },
        select: {
          id: true,
          status: true,
          date: true,
          startTime: true,
        },
      })

      await tx.timelineEvent.create({
        data: {
          businessId: input.payload.businessId,
          patientId,
          type: TimelineEventType.APPOINTMENT_CREATED,
          title: 'Client uygulamasindan randevu olusturuldu',
          description: `${service.name} • ${input.payload.date} ${input.payload.startTime}`,
          actorName: input.payload.fullName,
          actorId: input.authUserId,
        },
      })

      const notificationType =
        status === AppointmentStatus.CONFIRMED
          ? 'BOOKING_CONFIRMATION'
          : 'BOOKING_PENDING'
      const notificationTitle =
        status === AppointmentStatus.CONFIRMED
          ? 'Randevunuz onaylandi'
          : 'Randevunuz onay bekliyor'

      await tx.clientNotification.create({
        data: {
          clientUserId: input.clientUserId,
          businessId: input.payload.businessId,
          appointmentId: appointment.id,
          type: notificationType,
          title: notificationTitle,
          message: `${input.payload.date} ${input.payload.startTime} randevunuz olusturuldu.`,
          link: `/client/bookings?id=${appointment.id}`,
          metadata: {
            appointmentId: appointment.id,
            doctorId: input.payload.doctorId,
            serviceId: input.payload.serviceId,
          },
        },
      })

      return {
        appointmentId: appointment.id,
        patientId,
        status: appointment.status,
        locationName: location.name,
        serviceName: service.name,
        doctorName: doctor.fullName,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 8_000,
      timeout: 15_000,
    }
  )

  return booking
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

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < maxAttempts) {
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
