/**
 * Pure discovery next-available resolution (BUG-005).
 * DB batching lives in `discovery-next-available.ts`; this is fill-the-gap-style
 * in-memory slot math over preloaded maps — no Prisma.
 */

import { computeAvailableSlots } from '@/lib/client-marketplace/availability-compute'
import { getWeekdayFromDateString } from '@/lib/client-marketplace/time'

export type DiscoveryNextRequest = {
  doctorId: string
  serviceIds: string[]
  timezone: string
  availableTodayOnly?: boolean
  /** Pre-resolved "now" for the request timezone (optional; falls back to clocks.now). */
  now?: { date: string; time: string }
}

export type DiscoveryRuleRow = {
  staffId: string
  weekday: number
  startTime: string
  endTime: string
  slotIntervalMin: number
  locationId: string | null
}

export type DiscoveryBusyRow = {
  staffId: string
  date: string
  startTime: string
  endTime: string
}

export type DiscoveryBatchMaps = {
  dates: string[]
  durationByService: Map<string, number>
  rulesByStaffWeekday: Map<string, DiscoveryRuleRow[]>
  apptByStaffDate: Map<string, { startTime: string; endTime: string }[]>
  blockByStaffDate: Map<string, { startTime: string; endTime: string }[]>
  /** timezone → local date/time */
  nowByTz: Map<string, { date: string; time: string }>
}

export function indexDiscoveryRules(rules: DiscoveryRuleRow[]): Map<string, DiscoveryRuleRow[]> {
  const map = new Map<string, DiscoveryRuleRow[]>()
  for (const rule of rules) {
    const key = `${rule.staffId}:${rule.weekday}`
    const list = map.get(key) ?? []
    list.push(rule)
    map.set(key, list)
  }
  return map
}

export function indexDiscoveryBusy(
  rows: DiscoveryBusyRow[]
): Map<string, { startTime: string; endTime: string }[]> {
  const map = new Map<string, { startTime: string; endTime: string }[]>()
  for (const row of rows) {
    const key = `${row.staffId}:${row.date}`
    const list = map.get(key) ?? []
    list.push({ startTime: row.startTime, endTime: row.endTime })
    map.set(key, list)
  }
  return map
}

/**
 * Resolve next available ISO-ish stamp per doctor from preloaded batch maps.
 * Complexity ~ O(doctors × days × services × slots) in memory — not O(N) DB round-trips.
 */
export function resolveNextAvailableFromMaps(
  requests: DiscoveryNextRequest[],
  maps: DiscoveryBatchMaps
): Map<string, string | null> {
  const result = new Map<string, string | null>()

  for (const req of requests) {
    const tz = req.timezone || 'Europe/Istanbul'
    const now = req.now ?? maps.nowByTz.get(tz)
    if (!now) {
      result.set(req.doctorId, null)
      continue
    }

    const candidateServices = req.serviceIds.slice(0, 3)
    if (candidateServices.length === 0) {
      result.set(req.doctorId, null)
      continue
    }

    const dayLimit = req.availableTodayOnly ? Math.min(1, maps.dates.length) : maps.dates.length
    let found: string | null = null

    outer: for (let i = 0; i < dayLimit; i += 1) {
      const date = maps.dates[i]
      const weekday = getWeekdayFromDateString(date)
      const dayRules = maps.rulesByStaffWeekday.get(`${req.doctorId}:${weekday}`) ?? []
      if (dayRules.length === 0) continue

      for (const serviceId of candidateServices) {
        const durationMin = maps.durationByService.get(serviceId) ?? 30
        const slots = computeAvailableSlots({
          durationMin,
          rules: dayRules,
          appointments: maps.apptByStaffDate.get(`${req.doctorId}:${date}`) ?? [],
          blocks: maps.blockByStaffDate.get(`${req.doctorId}:${date}`) ?? [],
          date,
          nowDate: now.date,
          nowTime: now.time,
        })
        if (slots.length > 0) {
          found = `${date}T${slots[0].startTime}:00`
          break outer
        }
      }
    }

    result.set(req.doctorId, found)
  }

  return result
}

/** Fixed DB round-trips for discovery next-available (services + rules + appts + blocks). */
export const DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET = 4
