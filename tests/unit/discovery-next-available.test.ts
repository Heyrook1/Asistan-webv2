import { describe, expect, it } from 'vitest'

import { computeAvailableSlots } from '@/lib/client-marketplace/availability-compute'
import {
  DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET,
  indexDiscoveryBusy,
  indexDiscoveryRules,
  resolveNextAvailableFromMaps,
  resolveNextSlotsFromMaps,
  type DiscoveryBusyRow,
  type DiscoveryNextRequest,
  type DiscoveryRuleRow,
} from '@/lib/client-marketplace/discovery-next-available-core'
import { getWeekdayFromDateString } from '@/lib/client-marketplace/time'

function buildHorizon(startIso: string, days: number): string[] {
  const out: string[] = []
  const cursor = new Date(`${startIso}T00:00:00.000Z`)
  for (let i = 0; i < days; i += 1) {
    out.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return out
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0
  const idx = Math.min(sortedAsc.length - 1, Math.ceil(sortedAsc.length * p) - 1)
  return sortedAsc[Math.max(0, idx)]
}

describe('discovery slot math (batch path)', () => {
  it('returns first open slot like legacy next-available', () => {
    const slots = computeAvailableSlots({
      durationMin: 30,
      rules: [{ startTime: '09:00', endTime: '12:00', slotIntervalMin: 30, locationId: null }],
      appointments: [{ startTime: '09:00', endTime: '09:30' }],
      blocks: [],
      date: '2099-01-15',
      nowDate: '2099-01-01',
      nowTime: '08:00',
    })
    expect(slots[0]?.startTime).toBe('09:30')
  })
})

describe('discovery batch next-available (BUG-005)', () => {
  it('keeps a fixed query budget (fill-the-gap model, not O(doctors))', () => {
    expect(DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET).toBe(4)
    // Legacy N+1 worst case ≈ 50 doctors × 14 days × 3 services
    expect(50 * 14 * 3).toBeGreaterThan(DISCOVERY_NEXT_AVAILABLE_QUERY_BUDGET * 100)
  })

  it('resolves 50 doctors with p95 under budget (in-memory batch)', () => {
    const dates = buildHorizon('2099-06-02', 14) // Tue start
    const serviceId = 'svc-1'
    const rules: DiscoveryRuleRow[] = []
    const appts: DiscoveryBusyRow[] = []

    for (let i = 0; i < 50; i += 1) {
      const doctorId = `doc-${i}`
      for (const date of dates) {
        const weekday = getWeekdayFromDateString(date)
        rules.push({
          staffId: doctorId,
          weekday,
          startTime: '09:00',
          endTime: '17:00',
          slotIntervalMin: 30,
          locationId: null,
        })
      }
      // Busy morning so first slot is after lunch for half the doctors
      if (i % 2 === 0) {
        appts.push({
          staffId: doctorId,
          date: dates[0],
          startTime: '09:00',
          endTime: '12:00',
        })
      }
    }

    const maps = {
      dates,
      durationByService: new Map([[serviceId, 30]]),
      rulesByStaffWeekday: indexDiscoveryRules(rules),
      apptByStaffDate: indexDiscoveryBusy(appts),
      blockByStaffDate: indexDiscoveryBusy([]),
      nowByTz: new Map([['Europe/Istanbul', { date: '2099-06-01', time: '08:00' }]]),
    }

    const requests: DiscoveryNextRequest[] = Array.from({ length: 50 }, (_, i) => ({
      doctorId: `doc-${i}`,
      serviceIds: [serviceId, 'svc-2', 'svc-3'],
      timezone: 'Europe/Istanbul',
    }))

    const samples: number[] = []
    let last: Map<string, string | null> | null = null
    for (let run = 0; run < 25; run += 1) {
      const t0 = performance.now()
      last = resolveNextAvailableFromMaps(requests, maps)
      samples.push(performance.now() - t0)
    }

    expect(last?.size).toBe(50)
    expect(last?.get('doc-0')).toBe('2099-06-02T12:00:00')
    expect(last?.get('doc-1')).toBe('2099-06-02T09:00:00')

    samples.sort((a, b) => a - b)
    const p95 = percentile(samples, 0.95)
    // CI-safe budget: 50 × 14 × 3 slot scans should stay well under 250ms p95 on modern runners
    expect(p95).toBeLessThan(250)
  })
})

describe('clinic-detail next-slots (batch path)', () => {
  const dates = buildHorizon('2099-06-02', 7) // Tue start
  const serviceId = 'svc-1'

  function buildMaps(overrides?: {
    rules?: DiscoveryRuleRow[]
    appts?: DiscoveryBusyRow[]
    durationByService?: Map<string, number>
  }) {
    const rules =
      overrides?.rules ??
      dates.map((date) => ({
        staffId: 'doc-1',
        weekday: getWeekdayFromDateString(date),
        startTime: '09:00',
        endTime: '12:00',
        slotIntervalMin: 30,
        locationId: null,
      }))
    return {
      dates,
      durationByService: overrides?.durationByService ?? new Map([[serviceId, 30]]),
      rulesByStaffWeekday: indexDiscoveryRules(rules),
      apptByStaffDate: indexDiscoveryBusy(overrides?.appts ?? []),
      blockByStaffDate: indexDiscoveryBusy([]),
      nowByTz: new Map([['Asia/Nicosia', { date: '2099-06-01', time: '08:00' }]]),
    }
  }

  it('returns up to 6 slots for the first available day, tagged with serviceId', () => {
    const result = resolveNextSlotsFromMaps(
      [{ doctorId: 'doc-1', serviceId, timezone: 'Asia/Nicosia' }],
      buildMaps(),
    )
    const slots = result.get('doc-1') ?? []
    expect(slots.length).toBe(6)
    expect(slots[0]).toEqual({
      date: '2099-06-02',
      startTime: '09:00',
      endTime: '09:30',
      serviceId,
    })
    expect(slots.every((s) => s.serviceId === serviceId)).toBe(true)
    // All slots come from the same (first available) day.
    expect(new Set(slots.map((s) => s.date)).size).toBe(1)
  })

  it('skips fully-booked first day and returns the next open day', () => {
    const appts: DiscoveryBusyRow[] = [
      { staffId: 'doc-1', date: dates[0], startTime: '09:00', endTime: '12:00' },
    ]
    const result = resolveNextSlotsFromMaps(
      [{ doctorId: 'doc-1', serviceId, timezone: 'Asia/Nicosia' }],
      buildMaps({ appts }),
    )
    const slots = result.get('doc-1') ?? []
    expect(slots[0]?.date).toBe(dates[1])
    expect(slots[0]?.startTime).toBe('09:00')
  })

  it('returns empty when the service duration is unknown (missing/inactive service)', () => {
    const result = resolveNextSlotsFromMaps(
      [{ doctorId: 'doc-1', serviceId, timezone: 'Asia/Nicosia' }],
      buildMaps({ durationByService: new Map() }),
    )
    expect(result.get('doc-1')).toEqual([])
  })

  it('returns empty when the doctor has no rules', () => {
    const result = resolveNextSlotsFromMaps(
      [{ doctorId: 'doc-1', serviceId, timezone: 'Asia/Nicosia' }],
      buildMaps({ rules: [] }),
    )
    expect(result.get('doc-1')).toEqual([])
  })
})
