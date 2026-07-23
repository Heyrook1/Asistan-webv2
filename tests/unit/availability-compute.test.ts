import { describe, expect, it } from 'vitest'

import { computeAvailableSlots } from '@/lib/client-marketplace/availability-compute'

describe('availability-compute (Q1 fill-the-gap batch)', () => {
  it('returns open slots outside busy intervals', () => {
    const slots = computeAvailableSlots({
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

    expect(slots.map((s) => s.startTime)).toEqual(['09:00', '10:00', '10:30'])
  })

  it('skips past times on today', () => {
    const slots = computeAvailableSlots({
      durationMin: 30,
      rules: [
        {
          startTime: '09:00',
          endTime: '11:00',
          slotIntervalMin: 30,
          locationId: null,
        },
      ],
      appointments: [],
      blocks: [],
      date: '2026-07-21',
      nowDate: '2026-07-21',
      nowTime: '10:00',
    })

    expect(slots.every((s) => s.startTime > '10:00')).toBe(true)
    expect(slots.map((s) => s.startTime)).toEqual(['10:30'])
  })

  it('returns empty for past dates', () => {
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
        date: '2026-07-20',
        nowDate: '2026-07-21',
        nowTime: '12:00',
      }),
    ).toEqual([])
  })
})
