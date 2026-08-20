import type { HealthTimelineDayGroup, HealthTimelineItem } from '@/lib/health-timeline/types'
import {
  DEFAULT_CLINIC_TIMEZONE,
  formatWallDateInZone,
  normalizeWallTime,
  resolveClinicTimezone,
  toCalendarDateString,
  wallClockToUtc,
} from '@/lib/datetime/clinic-zone'

const dayFmt = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const monthFmt = new Intl.DateTimeFormat('tr-TR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function toDayKey(
  isoOrDate: string | Date,
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): string {
  return formatWallDateInZone(isoOrDate, resolveClinicTimezone(timeZone))
}

/**
 * Appointment date (@db.Date) + wall-clock HH:mm in clinic timezone → UTC Date.
 * Does not use host `setHours` (that caused 15:00 → 18:00 drift).
 */
export function combineDateAndTime(
  date: Date | string,
  time?: string | null,
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): Date {
  const dateYmd = toCalendarDateString(date)
  const zone = resolveClinicTimezone(timeZone)
  if (time && /^\d{1,2}:\d{2}/.test(time)) {
    return wallClockToUtc(dateYmd, normalizeWallTime(time), zone)
  }
  return wallClockToUtc(dateYmd, '12:00', zone)
}

/** Newest day first; items within a day newest first. Day keys use clinic timezone. */
export function groupHealthTimelineByDay(
  items: HealthTimelineItem[],
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): HealthTimelineDayGroup[] {
  const zone = resolveClinicTimezone(timeZone)
  const sorted = [...items].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  )

  const map = new Map<string, HealthTimelineItem[]>()
  for (const item of sorted) {
    const key = toDayKey(item.occurredAt, zone)
    if (key === 'invalid') continue
    const bucket = map.get(key)
    if (bucket) bucket.push(item)
    else map.set(key, [item])
  }

  return [...map.entries()].map(([dayKey, dayItems]) => {
    // Noon UTC of the calendar day — labels use timeZone:UTC so host TZ cannot shift the day.
    const d = new Date(`${dayKey}T12:00:00.000Z`)
    return {
      dayKey,
      label: dayFmt.format(d),
      monthLabel: monthFmt.format(d),
      items: dayItems,
    }
  })
}
