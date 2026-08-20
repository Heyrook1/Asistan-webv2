'use client'

import { formatTime } from '@/lib/format'
import type { CalendarEvent } from './calendar-types'
import { WEEK_DAY_LABELS } from './calendar-types'
import { dayCellAriaLabel, toISODate } from './calendar-date-utils'
import { CalendarEventChip } from './calendar-event-chip'

export function MonthGrid({
  cursor,
  days,
  eventsByDate,
  onSlotClick,
  canManage = false,
}: {
  cursor: Date
  days: Date[]
  eventsByDate: Map<string, CalendarEvent[]>
  onSlotClick: (date: string) => void
  canManage?: boolean
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
            <div className="mb-1 flex items-center justify-between">
              <span className={`text-xs font-medium ${iso === today ? 'rounded-full bg-brand-teal px-2 text-white' : ''}`}>
                {day.getDate()}
              </span>
              {dayEvents.length > 0 && (
                <span className="text-[10px] text-muted-foreground">{dayEvents.length}</span>
              )}
            </div>
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map((ev) => (
                <div key={ev.id} onClick={(e) => e.stopPropagation()}>
                  <CalendarEventChip event={ev} canManage={canManage} compact />
                </div>
              ))}
              {dayEvents.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{dayEvents.length - 2} daha
                  {dayEvents[0] ? ` · ${formatTime(dayEvents[0].startTime)}` : ''}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
