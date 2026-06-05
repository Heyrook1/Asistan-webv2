const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export function isTimeString(value: string) {
  return TIME_REGEX.test(value)
}

export function parseTimeToMinutes(value: string) {
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(value: number) {
  const normalized = ((value % (24 * 60)) + (24 * 60)) % (24 * 60)
  const h = Math.floor(normalized / 60)
  const m = normalized % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function addMinutesToTime(time: string, minutes: number) {
  return minutesToTime(parseTimeToMinutes(time) + minutes)
}

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  return startA < endB && endA > startB
}

export function getWeekdayFromDateString(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function getCurrentDateAndTimeForTimezone(timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const bag = new Map(parts.map((part) => [part.type, part.value]))
  const year = bag.get('year') ?? '1970'
  const month = bag.get('month') ?? '01'
  const day = bag.get('day') ?? '01'
  const hour = bag.get('hour') ?? '00'
  const minute = bag.get('minute') ?? '00'

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  }
}

