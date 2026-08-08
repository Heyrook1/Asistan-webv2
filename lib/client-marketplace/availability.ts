import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { catalogPrisma } from '@/lib/prisma-owner'
import { withTenantDb } from '@/lib/security/tenant-db-context'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
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

function appointmentDateOnly(isoDate: string): Date {
  // Prisma @db.Date — UTC noon keeps the calendar day stable across TZ.
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
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

  const day = appointmentDateOnly(input.date)
  const [appointments, blocks] = await Promise.all([
    db.appointment.findMany({
      where: {
        businessId: input.businessId,
        staffId: input.doctorId,
        date: day,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        ...(input.excludeAppointmentId ? { id: { not: input.excludeAppointmentId } } : {}),
      },
      select: { startTime: true, endTime: true },
    }),
    db.teamMemberUnavailableBlock.findMany({
      where: {
        businessId: input.businessId,
        staffId: input.doctorId,
        date: day,
        ...(input.locationId ? { OR: [{ locationId: input.locationId }, { locationId: null }] } : {}),
      },
      select: { startTime: true, endTime: true },
    }),
  ])

  const timezone = business.timezone?.trim() || 'Europe/Nicosia'
  let now: { date: string; time: string }
  try {
    now = getCurrentDateAndTimeForTimezone(timezone)
  } catch {
    now = getCurrentDateAndTimeForTimezone('Europe/Istanbul')
  }

  return computeAvailableSlots({
    durationMin: service.durationMin,
    rules: allRules as AvailabilityRuleRow[],
    appointments: appointments as BusyInterval[],
    blocks: blocks as BusyInterval[],
    date: input.date,
    nowDate: now.date,
    nowTime: now.time === '24:00' ? '00:00' : now.time,
    locationId: input.locationId,
  })
}

/**
 * Public slot query — try asistan_app + GUC first; fall back to catalog/owner
 * if the tenant path throws (pooler / missing set_config / host drift).
 * Never throws to the route — empty list is safer than a blank 500 body.
 */
export async function getAvailableSlots(input: GetAvailableSlotsInput): Promise<AvailabilitySlot[]> {
  try {
    return await runWithTenantBypassAsync('marketplace:availability', () =>
      withTenantDb(input.businessId, (tx) => getAvailableSlotsWithDb(tx, input)),
    )
  } catch (tenantError) {
    console.error('[availability] tenant path failed, trying catalogPrisma', tenantError)
    try {
      return await getAvailableSlotsWithDb(catalogPrisma(), input)
    } catch (catalogError) {
      console.error('[availability] catalogPrisma path failed', catalogError)
      return []
    }
  }
}

export async function getAvailableSlotsTx(
  tx: Prisma.TransactionClient,
  input: GetAvailableSlotsInput
): Promise<AvailabilitySlot[]> {
  return getAvailableSlotsWithDb(tx, input)
}

export { computeAvailableSlots, deDupeSlots } from './availability-compute'
