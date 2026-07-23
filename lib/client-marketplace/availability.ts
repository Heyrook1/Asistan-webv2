import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { AvailabilitySlot } from './types'
import {
  getCurrentDateAndTimeForTimezone,
  getWeekdayFromDateString,
} from './time'
import {
  computeAvailableSlots,
  type AvailabilityRuleRow,
  type BusyInterval,
} from './availability-compute'

type DbClient = Prisma.TransactionClient | typeof prisma

export type GetAvailableSlotsInput = {
  doctorId: string
  serviceId: string
  date: string // yyyy-mm-dd
  businessId: string
  locationId?: string | null
  excludeAppointmentId?: string
}

async function isDoctorAssignedToService(
  db: DbClient,
  input: { businessId: string; doctorId: string; serviceId: string }
) {
  const assignments = await db.serviceStaff.count({
    where: {
      businessId: input.businessId,
      serviceId: input.serviceId,
      isActive: true,
    },
  })

  if (assignments === 0) return true

  const linked = await db.serviceStaff.findFirst({
    where: {
      businessId: input.businessId,
      serviceId: input.serviceId,
      staffId: input.doctorId,
      isActive: true,
    },
    select: { id: true },
  })

  return Boolean(linked)
}

async function getAvailableSlotsWithDb(
  db: DbClient,
  input: GetAvailableSlotsInput
): Promise<AvailabilitySlot[]> {
  const [business, service, doctor] = await Promise.all([
    db.business.findFirst({
      where: { id: input.businessId, isActive: true },
      select: { id: true, timezone: true },
    }),
    db.service.findFirst({
      where: { id: input.serviceId, businessId: input.businessId, isActive: true },
      select: { id: true, durationMin: true },
    }),
    db.teamMember.findFirst({
      where: {
        id: input.doctorId,
        businessId: input.businessId,
        isActive: true,
        role: 'DOKTOR',
      },
      select: { id: true, isBookable: true },
    }),
  ])

  if (!business || !service || !doctor || !doctor.isBookable) return []

  const allowedForService = await isDoctorAssignedToService(db, {
    businessId: input.businessId,
    doctorId: input.doctorId,
    serviceId: input.serviceId,
  })
  if (!allowedForService) return []

  const weekday = getWeekdayFromDateString(input.date)
  const allRules = await db.teamMemberAvailability.findMany({
    where: {
      businessId: input.businessId,
      staffId: input.doctorId,
      weekday,
      isActive: true,
    },
    select: {
      startTime: true,
      endTime: true,
      slotIntervalMin: true,
      locationId: true,
    },
    orderBy: [{ startTime: 'asc' }],
  })
  if (allRules.length === 0) return []

  const [appointments, blocks] = await Promise.all([
    db.appointment.findMany({
      where: {
        businessId: input.businessId,
        staffId: input.doctorId,
        date: new Date(input.date),
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        ...(input.excludeAppointmentId ? { id: { not: input.excludeAppointmentId } } : {}),
      },
      select: { startTime: true, endTime: true },
    }),
    db.teamMemberUnavailableBlock.findMany({
      where: {
        businessId: input.businessId,
        staffId: input.doctorId,
        date: new Date(input.date),
        ...(input.locationId ? { OR: [{ locationId: input.locationId }, { locationId: null }] } : {}),
      },
      select: { startTime: true, endTime: true },
    }),
  ])

  const now = getCurrentDateAndTimeForTimezone(business.timezone || 'Europe/Istanbul')

  return computeAvailableSlots({
    durationMin: service.durationMin,
    rules: allRules as AvailabilityRuleRow[],
    appointments: appointments as BusyInterval[],
    blocks: blocks as BusyInterval[],
    date: input.date,
    nowDate: now.date,
    nowTime: now.time,
    locationId: input.locationId,
  })
}

export async function getAvailableSlots(input: GetAvailableSlotsInput): Promise<AvailabilitySlot[]> {
  return getAvailableSlotsWithDb(prisma, input)
}

export async function getAvailableSlotsTx(
  tx: Prisma.TransactionClient,
  input: GetAvailableSlotsInput
): Promise<AvailabilitySlot[]> {
  return getAvailableSlotsWithDb(tx, input)
}

export { computeAvailableSlots, deDupeSlots } from './availability-compute'
