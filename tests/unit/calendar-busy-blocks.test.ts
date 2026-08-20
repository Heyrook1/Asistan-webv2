import { describe, expect, it } from 'vitest'

import { splitBusyIntervalToLocalBlocks } from '@/lib/calendar/busy-blocks'

describe('splitBusyIntervalToLocalBlocks', () => {
  it('maps a same-day UTC interval into Istanbul local times', () => {
    // 10:00–11:00 Europe/Istanbul in winter ≈ 07:00–08:00 UTC
    const blocks = splitBusyIntervalToLocalBlocks({
      startIso: '2026-01-15T07:00:00.000Z',
      endIso: '2026-01-15T08:00:00.000Z',
      timezone: 'Europe/Istanbul',
    })
    expect(blocks).toEqual([
      {
        date: '2026-01-15',
        startTime: '10:00',
        endTime: '11:00',
        externalEventId: expect.stringContaining('2026-01-15'),
      },
    ])
  })

  it('splits overnight intervals across local dates', () => {
    // 20:00 UTC Jan 15 → 23:00 Istanbul; 22:30 UTC → 01:30 next local day
    const blocks = splitBusyIntervalToLocalBlocks({
      startIso: '2026-01-15T20:00:00.000Z',
      endIso: '2026-01-15T22:30:00.000Z',
      timezone: 'Europe/Istanbul',
    })
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toMatchObject({ date: '2026-01-15', startTime: '23:00', endTime: '23:59' })
    expect(blocks[1]).toMatchObject({ date: '2026-01-16', startTime: '00:00', endTime: '01:30' })
  })

  it('returns empty for invalid range', () => {
    expect(
      splitBusyIntervalToLocalBlocks({
        startIso: '2026-01-15T08:00:00.000Z',
        endIso: '2026-01-15T07:00:00.000Z',
        timezone: 'Europe/Istanbul',
      })
    ).toEqual([])
  })
})
