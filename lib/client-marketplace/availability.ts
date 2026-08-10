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
  computeAvailableSlotsResult,
  type AvailabilityEmptyReason,
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

export type AvailabilityQueryResult = {
  slots: AvailabilitySlot[]
  emptyReason: AvailabilityEmptyReason
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
): Promise<AvailabilityQueryResult> {
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

  if (!business || !service || !doctor || !doctor.isBookable) {
    return { slots: [], emptyReason: 'NOT_BOOKABLE' }
  }

  const allowedForService = await isDoctorAssignedToService(db, {
    businessId: input.businessId,
    doctorId: input.doctorId,
    serviceId: input.serviceId,
  })
  if (!allowedForService) {
    return { slots: [], emptyReason: 'NOT_BOOKABLE' }
  }

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
  if (allRules.length === 0) {
    return { slots: [], emptyReason: 'NO_RULES' }
  }

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

  // Wall-clock HH:mm in Business.timezone; empty → KKTC ops TZ (Asia/Nicosia).
  const timezone = business.timezone?.trim() || 'Asia/Nicosia'
  let now: { date: string; time: string }
  try {
    now = getCurrentDateAndTimeForTimezone(timezone)
  } catch {
    now = getCurrentDateAndTimeForTimezone('Asia/Nicosia')
  }

  return computeAvailableSlotsResult({
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

function preferConfigReason(
  primary: AvailabilityQueryResult | null,
  secondary: AvailabilityQueryResult
): AvailabilityQueryResult {
  if (secondary.slots.length > 0) return secondary
  if (!primary) return secondary
  // Prefer concrete schedule reasons over NOT_BOOKABLE from a possibly RLS-empty catalog read.
  if (
    primary.emptyReason === 'NOT_BOOKABLE' &&
    secondary.emptyReason !== 'NOT_BOOKABLE' &&
    secondary.emptyReason !== 'INFRA'
  ) {
    return secondary
  }
  if (primary.slots.length === 0 && secondary.emptyReason === 'NOT_BOOKABLE') {
    return primary.emptyReason !== 'INFRA' ? primary : secondary
  }
  return secondary
}

/**
 * Public slot query with emptyReason — catalog/owner first, then tenant GUC.
 * Never throws — INFRA on total failure.
 */
export async function getAvailableSlotsDetailed(
  input: GetAvailableSlotsInput
): Promise<AvailabilityQueryResult> {
  try {
    return await runWithTenantBypassAsync('marketplace:availability', async () => {
      let catalogResult: AvailabilityQueryResult | null = null
      try {
        catalogResult = await getAvailableSlotsWithDb(catalogPrisma(), input)
      } catch (catalogError) {
        console.error('[availability] catalogPrisma failed, trying tenant GUC', catalogError)
      }

      if (catalogResult && catalogResult.slots.length > 0) return catalogResult

      try {
        const tenantResult = await withTenantDb(input.businessId, (tx) =>
          getAvailableSlotsWithDb(tx, input)
        )
        return preferConfigReason(catalogResult, tenantResult)
      } catch (tenantError) {
        console.error('[availability] tenant path also failed', tenantError)
        return catalogResult ?? { slots: [], emptyReason: 'INFRA' }
      }
    })
  } catch (fatal) {
    console.error('[availability] fatal', fatal)
    return { slots: [], emptyReason: 'INFRA' }
  }
}

/**
 * Public slot query — catalog/owner first (cross-tenant, no GUC).
 * If catalog returns empty (RLS-empty owner role) or throws, try tenant GUC.
 * Never throws — empty list on total failure.
 */
export async function getAvailableSlots(input: GetAvailableSlotsInput): Promise<AvailabilitySlot[]> {
  return (await getAvailableSlotsDetailed(input)).slots
}

export async function getAvailableSlotsTx(
  tx: Prisma.TransactionClient,
  input: GetAvailableSlotsInput
): Promise<AvailabilitySlot[]> {
  return (await getAvailableSlotsWithDb(tx, input)).slots
}

export { computeAvailableSlots, computeAvailableSlotsResult, deDupeSlots } from './availability-compute'
export type { AvailabilityEmptyReason }
