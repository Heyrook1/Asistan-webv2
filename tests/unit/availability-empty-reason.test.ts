import { describe, expect, it } from 'vitest'

import {
  computeAvailableSlots,
  computeAvailableSlotsResult,
} from '@/lib/client-marketplace/availability-compute'
import { rotateClinicSample } from '@/lib/ops/booking-canary-core'
import { extractAvailabilitySlots } from '@/lib/http/read-json'

describe('availability-compute emptyReason', () => {
  it('returns OK with open slots', () => {
    const result = computeAvailableSlotsResult({
      durationMin: 30,
      rules: [
        {
          startTime: '09:00',
          endTime: '11:00',
          slotIntervalMin: 30,
          locationId: null,
        },
      ],
      appointments: [{ startTime: '09:30', endTime: '10:00' }],
      blocks: [],
      date: '2026-07-22',
      nowDate: '2026-07-21',
      nowTime: '12:00',
    })

    expect(result.emptyReason).toBe('OK')
    expect(result.slots.map((s) => s.startTime)).toEqual(['09:00', '10:00', '10:30'])
  })

  it('returns CLOSED for past dates', () => {
    expect(
      computeAvailableSlotsResult({
        durationMin: 30,
        rules: [
          {
            startTime: '09:00',
            endTime: '10:00',
            slotIntervalMin: 30,
            locationId: null,
          },
        ],
        appointments: [],
        blocks: [],
        date: '2026-07-20',
        nowDate: '2026-07-21',
        nowTime: '12:00',
      }),
    ).toEqual({ slots: [], emptyReason: 'CLOSED' })
  })

  it('returns NO_RULES when rules array empty', () => {
    expect(
      computeAvailableSlotsResult({
        durationMin: 30,
        rules: [],
        appointments: [],
        blocks: [],
        date: '2026-07-22',
        nowDate: '2026-07-21',
        nowTime: '12:00',
      }).emptyReason,
    ).toBe('NO_RULES')
  })

  it('returns FULL when every future candidate is busy', () => {
    const result = computeAvailableSlotsResult({
      durationMin: 30,
      rules: [
        {
          startTime: '09:00',
          endTime: '10:00',
          slotIntervalMin: 30,
          locationId: null,
        },
      ],
      appointments: [
        { startTime: '09:00', endTime: '09:30' },
        { startTime: '09:30', endTime: '10:00' },
      ],
      blocks: [],
      date: '2026-07-22',
      nowDate: '2026-07-21',
      nowTime: '12:00',
    })
    expect(result.slots).toEqual([])
    expect(result.emptyReason).toBe('FULL')
  })

  it('computeAvailableSlots still returns array only', () => {
    expect(
      computeAvailableSlots({
        durationMin: 30,
        rules: [
          {
            startTime: '09:00',
            endTime: '10:00',
            slotIntervalMin: 30,
            locationId: null,
          },
        ],
        appointments: [],
        blocks: [],
        date: '2026-07-22',
        nowDate: '2026-07-21',
        nowTime: '12:00',
      }),
    ).toHaveLength(2)
  })
})

describe('rotateClinicSample', () => {
  it('rotates deterministically by window', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const windowMs = 10 * 60 * 1000
    const first = rotateClinicSample(items, 2, 0)
    const second = rotateClinicSample(items, 2, windowMs)
    expect(first).toEqual(['a', 'b'])
    expect(second).toEqual(['c', 'd'])
  })

  it('wraps around the list', () => {
    const items = ['a', 'b', 'c']
    const sample = rotateClinicSample(items, 2, 2 * 10 * 60 * 1000)
    expect(sample).toHaveLength(2)
    expect(sample[0]).toBe('b')
  })
})

describe('extractAvailabilitySlots degraded', () => {
  it('surfaces degraded + emptyReason INFRA', () => {
    const out = extractAvailabilitySlots({
      ok: true,
      slots: [],
      degraded: true,
      emptyReason: 'INFRA',
    })
    expect(out.degraded).toBe(true)
    expect(out.emptyReason).toBe('INFRA')
    expect(out.slots).toEqual([])
  })
})
