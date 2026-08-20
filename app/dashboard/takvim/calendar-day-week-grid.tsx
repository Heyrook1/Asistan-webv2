'use client'

import { Fragment } from 'react'
import type { CalendarEvent } from './calendar-types'
import { HOUR_END, HOUR_START, WEEK_DAY_LABELS } from './calendar-types'
import { hourSlotAriaLabel, toISODate } from './calendar-date-utils'
import { CalendarEventChip } from './calendar-event-chip'

export function DayWeekGrid({
  days,
  eventsByDate,
  onSlotClick,
  canManage = false,
}: {
  days: Date[]
  eventsByDate: Map<string, CalendarEvent[]>
  onSlotClick: (date: string, time: string) => void
  canManage?: boolean
}) {
  const today = toISODate(new Date())
  const isSingleDay = days.length === 1
  // Day view fills width; week keeps readable columns with horizontal scroll instead of squeezing.
  const gridTemplateColumns = isSingleDay
    ? '56px minmax(0, 1fr)'
    : `56px repeat(${days.length}, minmax(148px, 1fr))`

  return (
    <div className="overflow-x-auto overscroll-x-contain">
      <div className="grid min-w-0" style={{ gridTemplateColumns }}>
        <div className="sticky left-0 z-10 bg-dashboard-surface border-b border-r" />
        {days.map((d) => {
          const iso = toISODate(d)
          return (
            <div
              key={iso}
              className={`px-3 py-3 text-center border-b border-r bg-dashboard-surface ${
                iso === today ? 'text-brand-teal' : 'text-brand-ink'
              }`}
            >
              <p className="text-[11px] uppercase text-muted-foreground">{WEEK_DAY_LABELS[(d.getDay() + 6) % 7]}</p>
              <p className="text-lg font-semibold">{d.getDate()}</p>
            </div>
          )
        })}

        {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i).map((hour) => (
          <Fragment key={hour}>
            <div
              key={`h${hour}`}
              className="sticky left-0 z-10 bg-white text-[10px] text-muted-foreground border-b border-r px-2 py-3 text-right"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
            {days.map((d) => {
              const iso = toISODate(d)
              const hourEvents = (eventsByDate.get(iso) ?? []).filter(
                (e) => Number(e.startTime.slice(0, 2)) === hour
              )
              return (
                <button
                  key={`${iso}-${hour}`}
                  type="button"
                  onClick={() => onSlotClick(iso, `${String(hour).padStart(2, '0')}:00`)}
                  aria-label={hourSlotAriaLabel(d, hour, hourEvents.length, true)}
                  className="relative min-h-[60px] border-b border-r p-1 text-left hover:bg-dashboard-surface"
                >
                  {hourEvents.map((ev) => (
                    <div key={ev.id} className="mb-1" onClick={(e) => e.stopPropagation()}>
                      <CalendarEventChip event={ev} canManage={canManage} compact />
                    </div>
                  ))}
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
