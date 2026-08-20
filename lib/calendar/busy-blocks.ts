/**
 * Pure helpers for FreeBusy → local day/time blocks (no Nest server imports).
 */

export type ZonedDateTime = {
  date: string // yyyy-mm-dd
  time: string // HH:mm
}

export type LocalBusyBlock = {
  date: string
  startTime: string
  endTime: string
  externalEventId: string
}

export function formatInTimeZone(date: Date, timezone: string): ZonedDateTime {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const bag = new Map(parts.map((part) => [part.type, part.value]))
  let hour = bag.get('hour') ?? '00'
  // Some engines emit "24" for midnight
  if (hour === '24') hour = '00'
  return {
    date: `${bag.get('year') ?? '1970'}-${bag.get('month') ?? '01'}-${bag.get('day') ?? '01'}`,
    time: `${hour}:${bag.get('minute') ?? '00'}`,
  }
}

function addCalendarDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d + days))
  return utc.toISOString().slice(0, 10)
}

function compareDateTime(a: ZonedDateTime, b: ZonedDateTime) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  if (a.time === b.time) return 0
  return a.time < b.time ? -1 : 1
}

/**
 * Split an exclusive UTC interval into local-day HH:mm blocks for clinic timezone.
 * Uses FreeBusy exclusive end semantics (busy [start, end)).
 */
export function splitBusyIntervalToLocalBlocks(input: {
  startIso: string
  endIso: string
  timezone: string
}): LocalBusyBlock[] {
  const start = new Date(input.startIso)
  const end = new Date(input.endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return []
  }

  const startZ = formatInTimeZone(start, input.timezone)
  const endZ = formatInTimeZone(end, input.timezone)
  const blocks: LocalBusyBlock[] = []

  // Zero-length after rounding → skip
  if (compareDateTime(startZ, endZ) >= 0 && startZ.date === endZ.date) {
    return []
  }

  let cursorDate = startZ.date
  let cursorStart = startZ.time

  while (cursorDate < endZ.date) {
    if (cursorStart < '23:59') {
      const externalEventId = `gcal:${input.startIso}:${input.endIso}:${cursorDate}:${cursorStart}-23:59`
      blocks.push({
        date: cursorDate,
        startTime: cursorStart,
        endTime: '23:59',
        externalEventId,
      })
    }
    cursorDate = addCalendarDays(cursorDate, 1)
    cursorStart = '00:00'
  }

  // Same-day or final day segment
  if (cursorDate === endZ.date && cursorStart < endZ.time) {
    const externalEventId = `gcal:${input.startIso}:${input.endIso}:${cursorDate}:${cursorStart}-${endZ.time}`
    blocks.push({
      date: cursorDate,
      startTime: cursorStart,
      endTime: endZ.time,
      externalEventId,
    })
  }

  return blocks
}
