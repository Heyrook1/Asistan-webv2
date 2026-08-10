/**
 * Clinic wall-clock times ↔ UTC.
 *
 * Appointment storage model:
 * - `date` = calendar day (@db.Date / YYYY-MM-DD)
 * - `startTime`/`endTime` = HH:mm wall clock in Business.timezone
 * - never treat HH:mm as UTC and never use host `setHours`
 *
 * Default ops zone = KKTC (`Asia/Nicosia`; IANA-equivalent to `Europe/Nicosia`).
 */

import { formatInTimeZone } from '@/lib/calendar/busy-blocks'
import { KKTC_TZ } from '@/lib/datetime/calendar-label'

/** Canonical clinic default — KKTC. Prefer this over host locale. */
export const DEFAULT_CLINIC_TIMEZONE = 'Asia/Nicosia'

/** Accepted aliases that share Cyprus civil time with Asia/Nicosia. */
const NICOSIA_ALIASES = new Set(['Asia/Nicosia', 'Europe/Nicosia', KKTC_TZ])

export function resolveClinicTimezone(raw?: string | null): string {
  const trimmed = raw?.trim()
  if (!trimmed) return DEFAULT_CLINIC_TIMEZONE
  if (NICOSIA_ALIASES.has(trimmed)) return DEFAULT_CLINIC_TIMEZONE
  return trimmed
}

/** Extract YYYY-MM-DD from Prisma `@db.Date` or ISO string without host-TZ day shift. */
export function toCalendarDateString(date: Date | string): string {
  if (typeof date === 'string') {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(date.trim())
    if (match) return match[1]
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return '1970-01-01'
    return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, '0')}-${String(parsed.getUTCDate()).padStart(2, '0')}`
  }
  if (Number.isNaN(date.getTime())) return '1970-01-01'
  // Prisma Date columns arrive as UTC midnight of the calendar day
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function normalizeWallTime(time: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim())
  if (!match) return '00:00'
  const h = Math.min(23, Math.max(0, Number(match[1])))
  const m = Math.min(59, Math.max(0, Number(match[2])))
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Interpret calendar date + HH:mm as wall clock in `timeZone`, return UTC instant.
 * Iterative Intl offset correction — handles DST spring-forward / fall-back.
 */
export function wallClockToUtc(
  dateYmd: string,
  timeHHmm: string,
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): Date {
  const zone = resolveClinicTimezone(timeZone)
  const time = normalizeWallTime(timeHHmm)
  const [y, mo, d] = dateYmd.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) return new Date(NaN)

  let guess = Date.UTC(y, mo - 1, d, h, mi, 0, 0)
  for (let i = 0; i < 4; i += 1) {
    const zoned = formatInTimeZone(new Date(guess), zone)
    const [zy, zm, zd] = zoned.date.split('-').map(Number)
    const [zh, zmi] = zoned.time.split(':').map(Number)
    const asUtc = Date.UTC(zy, zm - 1, zd, zh, zmi, 0, 0)
    const desired = Date.UTC(y, mo - 1, d, h, mi, 0, 0)
    const diff = desired - asUtc
    if (diff === 0) break
    guess += diff
  }
  return new Date(guess)
}

/** Format a UTC instant back to wall-clock HH:mm in clinic zone (single display conversion). */
export function formatWallTimeInZone(
  instant: Date | string,
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): string {
  const d = typeof instant === 'string' ? new Date(instant) : instant
  if (Number.isNaN(d.getTime())) return '—'
  return formatInTimeZone(d, resolveClinicTimezone(timeZone)).time
}

export function formatWallDateInZone(
  instant: Date | string,
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): string {
  const d = typeof instant === 'string' ? new Date(instant) : instant
  if (Number.isNaN(d.getTime())) return 'invalid'
  return formatInTimeZone(d, resolveClinicTimezone(timeZone)).date
}
