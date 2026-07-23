'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_DOT, formatTime } from '@/lib/format'
import type { CalendarEvent } from './calendar-types'
import { HOUR_END, HOUR_START, WEEK_DAY_LABELS } from './calendar-types'
import { hourSlotAriaLabel, toISODate } from './calendar-date-utils'

export function DayWeekGrid({
  days,
  eventsByDate,
  onSlotClick,
}: {
  days: Date[]
  eventsByDate: Map<string, CalendarEvent[]>
  onSlotClick: (date: string, time: string) => void
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
                    <Link
                      key={ev.id}
                      href={`/dashboard/hastalar/${ev.patientId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="block rounded-md px-2 py-1 text-[11px] mb-1"
                      style={{
                        background: `${ev.serviceColor}26`,
                        borderLeft: `3px solid ${APPOINTMENT_STATUS_DOT[ev.status] ?? ev.serviceColor}`,
                      }}
                    >
                      <p className="font-medium text-brand-ink truncate">{ev.patientName}</p>
                      <p className="text-muted-foreground truncate">
                        {formatTime(ev.startTime)} - {formatTime(ev.endTime)} • {APPOINTMENT_STATUS_LABELS[ev.status]}
                      </p>
                    </Link>
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
