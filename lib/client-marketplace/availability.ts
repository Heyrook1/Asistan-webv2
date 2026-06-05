import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { AvailabilitySlot } from './types'
import {
  addMinutesToTime,
  getCurrentDateAndTimeForTimezone,
  getWeekdayFromDateString,
  parseTimeToMinutes,
  rangesOverlap,
} from './time'

type DbClient = Prisma.TransactionClient | typeof prisma

export type GetAvailableSlotsInput = {
  doctorId: string
  serviceId: string
  date: string // yyyy-mm-dd
  businessId: string
  locationId?: string | null
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

function deDupeSlots(slots: AvailabilitySlot[]) {
  const map = new Map<string, AvailabilitySlot>()
  for (const slot of slots) {
    map.set(`${slot.startTime}-${slot.endTime}`, slot)
  }
  return Array.from(map.values()).sort((a, b) => a.startTime.localeCompare(b.startTime))
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

  const locationRules =
    input.locationId != null
      ? allRules.filter((rule) => rule.locationId === input.locationId)
      : []
  const globalRules = allRules.filter((rule) => rule.locationId == null)
  const activeRules = locationRules.length > 0 ? locationRules : globalRules
  if (activeRules.length === 0) return []

  const [appointments, blocks] = await Promise.all([
    db.appointment.findMany({
      where: {
        businessId: input.businessId,
        staffId: input.doctorId,
        date: new Date(input.date),
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
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
  const isPastDate = input.date < now.date
  if (isPastDate) return []

  const candidateSlots: AvailabilitySlot[] = []

  for (const rule of activeRules) {
    const step = Math.max(5, rule.slotIntervalMin || 15)
    const startMin = parseTimeToMinutes(rule.startTime)
    const endMin = parseTimeToMinutes(rule.endTime)
    const duration = service.durationMin
    const lastStart = endMin - duration
    if (lastStart < startMin) continue

    for (let current = startMin; current <= lastStart; current += step) {
      const startTime = addMinutesToTime('00:00', current)
      const endTime = addMinutesToTime(startTime, duration)

      if (input.date === now.date && startTime <= now.time) {
        continue
      }

      const collidesAppointment = appointments.some((item) =>
        rangesOverlap(startTime, endTime, item.startTime, item.endTime)
      )
      if (collidesAppointment) continue

      const collidesBlock = blocks.some((item) =>
        rangesOverlap(startTime, endTime, item.startTime, item.endTime)
      )
      if (collidesBlock) continue

      candidateSlots.push({ startTime, endTime })
    }
  }

  return deDupeSlots(candidateSlots)
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

