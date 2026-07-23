import type { HealthTimelineDayGroup, HealthTimelineItem } from '@/lib/health-timeline/types'

const dayFmt = new Intl.DateTimeFormat('tr-TR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const monthFmt = new Intl.DateTimeFormat('tr-TR', {
  month: 'long',
  year: 'numeric',
})

export function toDayKey(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (Number.isNaN(d.getTime())) return 'invalid'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function combineDateAndTime(date: Date | string, time?: string | null): Date {
  const base = typeof date === 'string' ? new Date(date) : new Date(date.getTime())
  if (Number.isNaN(base.getTime())) return new Date(0)
  if (time && /^\d{1,2}:\d{2}/.test(time)) {
    const [h, m] = time.split(':').map((part) => Number(part))
    base.setHours(h || 0, m || 0, 0, 0)
  } else {
    base.setHours(12, 0, 0, 0)
  }
  return base
}

/** Newest day first; items within a day newest first. */
export function groupHealthTimelineByDay(items: HealthTimelineItem[]): HealthTimelineDayGroup[] {
  const sorted = [...items].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  )

  const map = new Map<string, HealthTimelineItem[]>()
  for (const item of sorted) {
    const key = toDayKey(item.occurredAt)
    if (key === 'invalid') continue
    const bucket = map.get(key)
    if (bucket) bucket.push(item)
    else map.set(key, [item])
  }

  return [...map.entries()].map(([dayKey, dayItems]) => {
    const d = new Date(`${dayKey}T12:00:00`)
    return {
      dayKey,
      label: dayFmt.format(d),
      monthLabel: monthFmt.format(d),
      items: dayItems,
    }
  })
}
