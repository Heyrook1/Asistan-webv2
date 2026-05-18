'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { AppointmentStatus, TimelineEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/session'
import { ok, err, type ActionResult } from './result'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor((total % (24 * 60)) / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
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
    if (!staff) return err('Personel bulunamadÄ±')
  }

  const endTime = input.endTime ?? addMinutes(input.startTime, service.durationMin)
  if (endTime <= input.startTime) return err('Bitiş saati başlangıçtan sonra olmalı')

  // Conflict check on same staff/business and overlapping slot.
  if (input.staffId) {
    const conflicts = await prisma.appointment.findMany({
      where: {
        businessId: session.businessId,
        staffId: input.staffId,
        date: new Date(input.date),
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      select: { startTime: true, endTime: true },
    })
    const overlap = conflicts.some(
      (c) => c.startTime < endTime && c.endTime > input.startTime
    )
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

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
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

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
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
  await prisma.appointment.update({
    where: { id: parsed.data.id },
    data: {
      date: new Date(parsed.data.date),
      startTime: parsed.data.startTime,
      endTime,
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
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/randevular')
  revalidatePath('/dashboard/takvim')
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
