/**
 * Hydration-safe calendar labels — avoid Node vs browser ICU `toLocale*` drift (React #418).
 * Calendar “today” uses Europe/Nicosia (KKTC).
 */

export const KKTC_TZ = 'Europe/Nicosia'

const TR_WEEKDAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'] as const
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'] as const
const EN_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export function calendarDateInTimeZone(
  now: Date = new Date(),
  timeZone: string = KKTC_TZ,
): string {
  try {
    // en-CA → YYYY-MM-DD (stable across Node + Chromium)
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now)
  } catch {
    // Some hosts lack full ICU TZ data — fall back to UTC calendar day.
    return now.toISOString().slice(0, 10)
  }
}

export function addCalendarDays(isoDate: string, days: number): string {
  const parts = parseIsoDateParts(isoDate)
  if (!parts) return isoDate
  const utc = new Date(Date.UTC(parts.y, parts.m - 1, parts.d + days, 12))
  return utc.toISOString().slice(0, 10)
}

export function parseIsoDateParts(
  iso: string,
): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null
  return { y, m, d }
}

function weekdayUtcNoon(isoDate: string): number {
  const parts = parseIsoDateParts(isoDate)
  if (!parts) return 0
  return new Date(Date.UTC(parts.y, parts.m - 1, parts.d, 12)).getUTCDay()
}

/** Chip / relative day label without `toLocaleDateString`. */
export function formatDayChipLabel(
  isoDate: string,
  lang: 'tr' | 'en' | 'ru',
  todayIso: string = calendarDateInTimeZone(),
  tomorrowIso: string = addCalendarDays(todayIso, 1),
): string {
  if (isoDate === todayIso) {
    return lang === 'en' ? 'Today' : lang === 'ru' ? 'Сегодня' : 'Bugün'
  }
  if (isoDate === tomorrowIso) {
    return lang === 'en' ? 'Tomorrow' : lang === 'ru' ? 'Завтра' : 'Yarın'
  }
  const parts = parseIsoDateParts(isoDate)
  if (!parts) return isoDate
  const wd = weekdayUtcNoon(isoDate)
  if (lang === 'en') {
    return `${EN_WEEKDAYS[wd]} ${parts.d} ${EN_MONTHS[parts.m - 1]}`
  }
  // RU falls back to TR short form (booking widget rarely uses full RU month table)
  return `${TR_WEEKDAYS[wd]} ${parts.d} ${TR_MONTHS[parts.m - 1]}`
}

/** `2026-08-07T14:30:00` → stable "Bugün · 14:30" style label. */
export function formatNextSlotLabelStable(
  nextAvailableAt: string | null,
  lang: 'tr' | 'en',
  now: Date = new Date(),
): string | null {
  if (!nextAvailableAt) return null
  const datePart = nextAvailableAt.slice(0, 10)
  if (!parseIsoDateParts(datePart)) return null
  const timeMatch = /T(\d{2}:\d{2})/.exec(nextAvailableAt)
  const timePart = timeMatch?.[1] ?? null
  const today = calendarDateInTimeZone(now)
  const tomorrow = addCalendarDays(today, 1)
  const day = formatDayChipLabel(datePart, lang, today, tomorrow)
  return timePart ? `${day} · ${timePart}` : day
}

export function formatBookingWhenStable(
  date: string,
  time: string | null,
  lang: 'tr' | 'en' | 'ru',
): string {
  if (!time) return date
  const parts = parseIsoDateParts(date)
  if (!parts) return `${date} ${time}`
  const wd = weekdayUtcNoon(date)
  const hhmm = time.length >= 5 ? time.slice(0, 5) : time
  if (lang === 'en') {
    return `${EN_WEEKDAYS[wd]}, ${parts.d} ${EN_MONTHS[parts.m - 1]} ${parts.y} · ${hhmm}`
  }
  return `${TR_WEEKDAYS[wd]}, ${parts.d} ${TR_MONTHS[parts.m - 1]} ${parts.y} · ${hhmm}`
}
