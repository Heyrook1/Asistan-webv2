'use client'

import Link from 'next/link'
import { formatTime } from '@/lib/format'
import type { CalendarEvent } from './calendar-types'
import { WEEK_DAY_LABELS } from './calendar-types'
import { dayCellAriaLabel, toISODate } from './calendar-date-utils'

export function MonthGrid({
  cursor,
  days,
  eventsByDate,
  onSlotClick,
}: {
  cursor: Date
  days: Date[]
  eventsByDate: Map<string, CalendarEvent[]>
  onSlotClick: (date: string) => void
}) {
  const today = toISODate(new Date())
  return (
    <div className="grid grid-cols-7 text-xs">
      {WEEK_DAY_LABELS.map((d) => (
        <div key={d} className="px-3 py-2 text-center text-[11px] uppercase text-muted-foreground bg-dashboard-surface border-b">
          {d}
        </div>
      ))}
      {days.map((day) => {
        const iso = toISODate(day)
        const inMonth = day.getMonth() === cursor.getMonth()
        const dayEvents = eventsByDate.get(iso) ?? []
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSlotClick(iso)}
            aria-label={dayCellAriaLabel(day, dayEvents.length)}
            className={`text-left min-h-[110px] border-b border-r p-2 hover:bg-dashboard-surface ${
              !inMonth ? 'bg-dashboard-surface text-muted-foreground' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${iso === today ? 'rounded-full bg-brand-teal text-white px-2' : ''}`}>
                {day.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <span className="text-[10px] text-muted-foreground">{dayEvents.length}</span>
              )}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((ev) => (
                <Link
                  key={ev.id}
                  href={`/dashboard/hastalar/${ev.patientId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="block rounded-md px-1.5 py-0.5 text-[10px] truncate"
                  style={{ background: `${ev.serviceColor}1f`, color: 'var(--brand-ink)' }}
                  title={`${ev.patientName} • ${ev.serviceName}`}
                >
                  <span className="font-medium">{formatTime(ev.startTime)}</span> {ev.patientName}
                </Link>
              ))}
              {dayEvents.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} daha</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
