import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import { runWithTenantBypassAsync } from '@/lib/security/tenant-guard'
import {
  indexDiscoveryBusy,
  indexDiscoveryRules,
  resolveNextSlotsFromMaps,
  type DiscoveryBusyRow,
  type DiscoveryRuleRow,
  type NextSlot,
} from '@/lib/client-marketplace/discovery-next-available-core'
import {
  getCurrentDateAndTimeForTimezone,
  getWeekdayFromDateString,
} from '@/lib/client-marketplace/time'
import { addCalendarDays, calendarDateInTimeZone } from '@/lib/datetime/calendar-label'

const HORIZON_DAYS = 7
const MAX_SLOTS = 6

export type ClinicDoctorSlotRequest = {
  doctorId: string
  serviceId: string
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

/** Prisma @db.Date — UTC noon keeps the calendar day stable across TZ. */
function appointmentDateOnly(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

/**
 * Batch "next slots" for the clinic-detail doctor cards — replaces the per-doctor x
 * per-day `getAvailableSlots` N+1 (which opened one interactive transaction per call
 * and exhausted the connection pool). Loads rules/appointments/blocks for every doctor
 * across a 7-day window in a fixed number of `catalogPrisma()` reads (no interactive
 * transaction), then resolves the first available day's slots in memory.
 *
 * Returns Map doctorId -> up to {@link MAX_SLOTS} slots for the first day with availability.
 */
export async function batchFindNextSlots(input: {
  businessId: string
  timezone: string | null
  doctors: ClinicDoctorSlotRequest[]
}): Promise<Map<string, NextSlot[]>> {
  const doctors = input.doctors.filter((d) => d.doctorId && d.serviceId)
  if (doctors.length === 0) return new Map()

  const timezone = input.timezone?.trim() || 'Asia/Nicosia'

  // Calendar window uses KKTC days (matches the previous clinic-detail loop); the
  // wall-clock "now" used for filtering uses the business timezone.
  const baseToday = calendarDateInTimeZone()
  const dates: string[] = []
  for (let day = 0; day < HORIZON_DAYS; day += 1) {
    dates.push(addCalendarDays(baseToday, day))
  }
  const weekdays = [...new Set(dates.map((d) => getWeekdayFromDateString(d)))]
  const dayDates = dates.map(appointmentDateOnly)

  const doctorIds = [...new Set(doctors.map((d) => d.doctorId))]
  const serviceIds = [...new Set(doctors.map((d) => d.serviceId))]

  return runWithTenantBypassAsync('marketplace:clinic-detail-slots', async () => {
    const prisma = catalogPrisma()

    const [services, rules, appointments, blocks] = await Promise.all([
      prisma.service.findMany({
        where: { id: { in: serviceIds }, businessId: input.businessId, isActive: true },
        select: { id: true, durationMin: true },
      }),
      prisma.teamMemberAvailability.findMany({
        where: {
          businessId: input.businessId,
          staffId: { in: doctorIds },
          weekday: { in: weekdays },
          isActive: true,
        },
        select: {
          staffId: true,
          weekday: true,
          startTime: true,
          endTime: true,
          slotIntervalMin: true,
          locationId: true,
        },
        take: 4_000,
      }),
      prisma.appointment.findMany({
        where: {
          businessId: input.businessId,
          staffId: { in: doctorIds },
          date: { in: dayDates },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        select: { staffId: true, date: true, startTime: true, endTime: true },
        take: 8_000,
      }),
      prisma.teamMemberUnavailableBlock.findMany({
        where: {
          businessId: input.businessId,
          staffId: { in: doctorIds },
          date: { in: dayDates },
        },
        select: { staffId: true, date: true, startTime: true, endTime: true },
        take: 4_000,
      }),
    ])

    const ruleRows: DiscoveryRuleRow[] = rules.map((rule) => ({
      staffId: rule.staffId,
      weekday: rule.weekday,
      startTime: rule.startTime,
      endTime: rule.endTime,
      slotIntervalMin: rule.slotIntervalMin,
      locationId: rule.locationId,
    }))

    const apptRows: DiscoveryBusyRow[] = appointments
      .filter((row): row is typeof row & { staffId: string } => Boolean(row.staffId))
      .map((row) => ({
        staffId: row.staffId,
        date: dateKey(row.date),
        startTime: row.startTime,
        endTime: row.endTime,
      }))

    const blockRows: DiscoveryBusyRow[] = blocks.map((row) => ({
      staffId: row.staffId,
      date: dateKey(row.date),
      startTime: row.startTime,
      endTime: row.endTime,
    }))

    // Wall-clock HH:mm in Business.timezone; empty/invalid -> KKTC ops TZ.
    let rawNow: { date: string; time: string }
    try {
      rawNow = getCurrentDateAndTimeForTimezone(timezone)
    } catch {
      rawNow = getCurrentDateAndTimeForTimezone('Asia/Nicosia')
    }
    const now = { date: rawNow.date, time: rawNow.time === '24:00' ? '00:00' : rawNow.time }

    return resolveNextSlotsFromMaps(
      doctors.map((d) => ({ doctorId: d.doctorId, serviceId: d.serviceId, timezone })),
      {
        dates,
        durationByService: new Map(services.map((s) => [s.id, s.durationMin])),
        rulesByStaffWeekday: indexDiscoveryRules(ruleRows),
        apptByStaffDate: indexDiscoveryBusy(apptRows),
        blockByStaffDate: indexDiscoveryBusy(blockRows),
        nowByTz: new Map([[timezone, now]]),
      },
      MAX_SLOTS,
    )
  })
}
