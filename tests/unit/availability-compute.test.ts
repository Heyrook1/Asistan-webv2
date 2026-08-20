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

  it('blocks overlapping starts when duration exceeds slot step (20×15)', () => {
    // 09:45–10:05 (20 min) must remove 10:00 on a 15-min grid (10:00–10:20 overlaps).
    const slots = computeAvailableSlots({
      durationMin: 20,
      rules: [
        {
          startTime: '09:00',
          endTime: '11:00',
          slotIntervalMin: 15,
          locationId: null,
        },
      ],
      appointments: [{ startTime: '09:45', endTime: '10:05' }],
      blocks: [],
      date: '2026-08-10',
      nowDate: '2026-08-09',
      nowTime: '12:00',
    })

    const starts = slots.map((s) => s.startTime)
    expect(starts).not.toContain('09:45')
    expect(starts).not.toContain('10:00')
    // 09:30–09:50 also overlaps 09:45–10:05
    expect(starts).not.toContain('09:30')
    // Next grid start after end (10:05) is 10:15
    expect(starts).toContain('09:15')
    expect(starts).toContain('10:15')
  })

  it('keeps non-overlapping adjacent starts on 20×15 grid', () => {
    const slots = computeAvailableSlots({
      durationMin: 20,
      rules: [
        {
          startTime: '09:00',
          endTime: '11:00',
          slotIntervalMin: 15,
          locationId: null,
        },
      ],
      appointments: [{ startTime: '09:00', endTime: '09:20' }],
      blocks: [],
      date: '2026-08-10',
      nowDate: '2026-08-09',
      nowTime: '12:00',
    })

    const starts = slots.map((s) => s.startTime)
    expect(starts).not.toContain('09:00')
    expect(starts).not.toContain('09:15') // 09:15–09:35 overlaps 09:00–09:20
    // Grid is :00/:15/:30/:45 — first free after 09:20 is 09:30
    expect(starts).toContain('09:30')
  })
})
