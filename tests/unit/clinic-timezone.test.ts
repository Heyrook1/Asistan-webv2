import { describe, expect, it } from 'vitest'

import { formatInTimeZone } from '@/lib/calendar/busy-blocks'
import { combineDateAndTime } from '@/lib/health-timeline/group-by-day'
import { buildClinicHealthTimeline } from '@/lib/health-timeline/build-clinic-timeline'
import {
  DEFAULT_CLINIC_TIMEZONE,
  formatWallTimeInZone,
  resolveClinicTimezone,
  toCalendarDateString,
  wallClockToUtc,
} from '@/lib/datetime/clinic-zone'

describe('clinic timezone wall-clock model', () => {
  it('defaults empty timezone to Asia/Nicosia and aliases Europe/Nicosia', () => {
    expect(resolveClinicTimezone(null)).toBe('Asia/Nicosia')
    expect(resolveClinicTimezone('')).toBe('Asia/Nicosia')
    expect(resolveClinicTimezone('Europe/Nicosia')).toBe('Asia/Nicosia')
    expect(resolveClinicTimezone('Asia/Nicosia')).toBe('Asia/Nicosia')
    expect(resolveClinicTimezone('Europe/Istanbul')).toBe('Europe/Istanbul')
    expect(resolveClinicTimezone('Europe/London')).toBe('Europe/London')
    expect(DEFAULT_CLINIC_TIMEZONE).toBe('Asia/Nicosia')
  })

  it('reads Prisma @db.Date UTC midnight as calendar day without host shift', () => {
    expect(toCalendarDateString(new Date('2026-07-24T00:00:00.000Z'))).toBe('2026-07-24')
    expect(toCalendarDateString('2026-07-24T00:00:00.000Z')).toBe('2026-07-24')
    expect(toCalendarDateString('2026-07-24')).toBe('2026-07-24')
  })

  it('does not shift 15:00 Nicosia to 18:00 when formatting back', () => {
    const utc = wallClockToUtc('2026-07-24', '15:00', 'Asia/Nicosia')
    // Summer EEST = UTC+3 → 15:00 local = 12:00 UTC
    expect(utc.toISOString()).toBe('2026-07-24T12:00:00.000Z')
    expect(formatWallTimeInZone(utc, 'Asia/Nicosia')).toBe('15:00')
    expect(formatInTimeZone(utc, 'Europe/Nicosia').time).toBe('15:00')
  })

  it('matches Europe/Istanbul wall clock independently of host', () => {
    const utc = wallClockToUtc('2026-01-15', '09:30', 'Europe/Istanbul')
    // Winter EET = UTC+3 for Turkey (no DST since 2016)
    expect(utc.toISOString()).toBe('2026-01-15T06:30:00.000Z')
    expect(formatWallTimeInZone(utc, 'Europe/Istanbul')).toBe('09:30')
  })

  it('handles Europe/London GMT and BST', () => {
    const winter = wallClockToUtc('2026-01-15', '15:00', 'Europe/London')
    expect(winter.toISOString()).toBe('2026-01-15T15:00:00.000Z')
    expect(formatWallTimeInZone(winter, 'Europe/London')).toBe('15:00')

    const summer = wallClockToUtc('2026-07-15', '15:00', 'Europe/London')
    expect(summer.toISOString()).toBe('2026-07-15T14:00:00.000Z')
    expect(formatWallTimeInZone(summer, 'Europe/London')).toBe('15:00')
  })

  it('handles KKTC/EU DST spring-forward gap (2026-03-29 03:00→04:00)', () => {
    // EU/Cyprus: 01:00 UTC → clocks jump 03:00 EET → 04:00 EEST (03:xx does not exist).
    const before = wallClockToUtc('2026-03-29', '01:30', 'Asia/Nicosia')
    const after = wallClockToUtc('2026-03-29', '04:30', 'Asia/Nicosia')
    expect(formatWallTimeInZone(before, 'Asia/Nicosia')).toBe('01:30')
    expect(formatWallTimeInZone(after, 'Asia/Nicosia')).toBe('04:30')
    expect(after.getTime()).toBeGreaterThan(before.getTime())
  })

  it('handles KKTC/EU DST fall-back overlap (2026-10-25)', () => {
    const afternoon = wallClockToUtc('2026-10-25', '15:00', 'Asia/Nicosia')
    expect(formatWallTimeInZone(afternoon, 'Asia/Nicosia')).toBe('15:00')
    // After fall-back, 15:00 is still uniquely EET (UTC+2)
    expect(afternoon.toISOString()).toBe('2026-10-25T13:00:00.000Z')
  })

  it('combineDateAndTime + timeline clockTime stay at 15:00 (P0-07 regression)', () => {
    const prismaDate = new Date('2026-07-24T00:00:00.000Z')
    const occurred = combineDateAndTime(prismaDate, '15:00', 'Asia/Nicosia')
    expect(formatWallTimeInZone(occurred, 'Asia/Nicosia')).toBe('15:00')

    const items = buildClinicHealthTimeline({
      timeZone: 'Asia/Nicosia',
      appointments: [
        {
          id: 'a1',
          date: prismaDate,
          startTime: '15:00',
          status: 'SCHEDULED',
          service: { name: 'Kontrol' },
        },
      ],
    })

    expect(items[0]?.clockTime).toBe('15:00')
    expect(formatWallTimeInZone(items[0]!.occurredAt, 'Asia/Nicosia')).toBe('15:00')
    // Host locale formatting of the ISO without timeZone would wrongly show 18:00 in TR —
    // clockTime is the display source of truth for visits.
    expect(items[0]?.occurredAt).toBe('2026-07-24T12:00:00.000Z')
  })
})
