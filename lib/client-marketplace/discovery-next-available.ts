import 'server-only'

import { catalogPrisma } from '@/lib/prisma-owner'
import {
  DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET,
  indexDiscoveryBusy,
  indexDiscoveryRules,
  resolveNextAvailableFromMaps,
  type DiscoveryBusyRow,
  type DiscoveryNextRequest,
  type DiscoveryRuleRow,
} from '@/lib/client-marketplace/discovery-next-available-core'
import {
  getCurrentDateAndTimeForTimezone,
  getWeekdayFromDateString,
} from '@/lib/client-marketplace/time'

export type NextAvailableRequest = {
  businessId: string
  doctorId: string
  /** Candidate services — first 3 used (same as legacy N+1 path). */
  serviceIds: string[]
  timezone: string
  availableTodayOnly?: boolean
}

export { DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET }

function formatDate(offsetDays = 0) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10)
}

/**
 * Batch next-available for marketplace discovery — replaces per doctor×day×service
 * `getAvailableSlots` N+1 (fill-the-gap pattern / BUG-005).
 *
 * Returns Map doctorId → `yyyy-mm-ddTHH:mm:00` or null.
 * Query budget: {@link DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET} (not O(doctors)).
 */
export async function batchFindNextAvailable(
  requests: NextAvailableRequest[]
): Promise<Map<string, string | null>> {
  if (requests.length === 0) return new Map()

  const horizon = requests.some((r) => !r.availableTodayOnly) ? 14 : 1
  const dates: string[] = []
  for (let day = 0; day < horizon; day += 1) dates.push(formatDate(day))
  const weekdays = [...new Set(dates.map((d) => getWeekdayFromDateString(d)))]

  const doctorIds = [...new Set(requests.map((r) => r.doctorId))]
  const businessIds = [...new Set(requests.map((r) => r.businessId))]
  const serviceIds = [...new Set(requests.flatMap((r) => r.serviceIds.slice(0, 3)))]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const horizonEnd = new Date(today)
  horizonEnd.setDate(horizonEnd.getDate() + horizon)

  const prisma = catalogPrisma()

  const [services, rules, appointments, blocks] = await Promise.all([
    serviceIds.length === 0
      ? Promise.resolve([] as { id: string; durationMin: number; businessId: string }[])
      : prisma.service.findMany({
          where: {
            id: { in: serviceIds },
            businessId: { in: businessIds },
            isActive: true,
          },
          select: { id: true, durationMin: true, businessId: true },
        }),
    prisma.teamMemberAvailability.findMany({
      where: {
        businessId: { in: businessIds },
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
        businessId: { in: businessIds },
        staffId: { in: doctorIds },
        date: { gte: today, lt: horizonEnd },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      select: { staffId: true, date: true, startTime: true, endTime: true },
      take: 8_000,
    }),
    prisma.teamMemberUnavailableBlock.findMany({
      where: {
        businessId: { in: businessIds },
        staffId: { in: doctorIds },
        date: { gte: today, lt: horizonEnd },
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

  const nowByTz = new Map<string, { date: string; time: string }>()
  for (const req of requests) {
    const tz = req.timezone || 'Europe/Istanbul'
    if (!nowByTz.has(tz)) {
      nowByTz.set(tz, getCurrentDateAndTimeForTimezone(tz))
    }
  }

  const coreRequests: DiscoveryNextRequest[] = requests.map((r) => ({
    doctorId: r.doctorId,
    serviceIds: r.serviceIds,
    timezone: r.timezone,
    availableTodayOnly: r.availableTodayOnly,
  }))

  return resolveNextAvailableFromMaps(coreRequests, {
    dates,
    durationByService: new Map(services.map((s) => [s.id, s.durationMin])),
    rulesByStaffWeekday: indexDiscoveryRules(ruleRows),
    apptByStaffDate: indexDiscoveryBusy(apptRows),
    blockByStaffDate: indexDiscoveryBusy(blockRows),
    nowByTz,
  })
}
