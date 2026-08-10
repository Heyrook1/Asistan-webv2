'use client'

import { useRef } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from './calendar-types'
import { FULL_WEEK_DAY_LABELS, HOUR_END, HOUR_START, WEEK_DAY_LABELS } from './calendar-types'
import { addDays, hourSlotAriaLabel, startOfWeek, toISODate } from './calendar-date-utils'
import { CalendarEventChip } from './calendar-event-chip'

export function MobileAgenda({
  cursor,
  setCursor,
  weekDays,
  eventsByDate,
  events,
  canCreate,
  canManage = false,
  onCreate,
}: {
  cursor: Date
  setCursor: (date: Date) => void
  weekDays?: Date[]
  eventsByDate?: Map<string, CalendarEvent[]>
  events: CalendarEvent[]
  canCreate: boolean
  canManage?: boolean
  onCreate: (date: string, startTime?: string) => void
}) {
  const touch = useRef<{ x: number; y: number } | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const todayIso = toISODate(new Date())
  const cursorIso = toISODate(cursor)
  const isToday = cursorIso === todayIso
  const weekdayIndex = (cursor.getDay() + 6) % 7
  const stripDays = weekDays ?? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY }
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (!touch.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touch.current.x
    const dy = t.clientY - touch.current.y
    touch.current = null
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      setCursor(addDays(cursor, dx < 0 ? 1 : -1))
    }
  }

  function openDatePicker() {
    const input = dateInputRef.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker()
        return
      } catch {
        // fall back to click
      }
    }
    input.click()
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (!value) return
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return
    const next = new Date(y, m - 1, d)
    next.setHours(0, 0, 0, 0)
    setCursor(next)
  }

  const hourSlots = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  return (
    <div className="md:hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="sticky top-14 z-20 -mx-4 flex items-center justify-between gap-2 border-b border-border/40 bg-dashboard-bg/95 px-4 py-2 backdrop-blur">
        <button
          type="button"
          onClick={() => setCursor(addDays(cursor, -1))}
          className="tap-target flex items-center justify-center rounded-xl border bg-white text-muted-foreground"
          aria-label="Önceki gün"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={openDatePicker}
          className="flex flex-col items-center rounded-lg px-3 py-1 transition-colors hover:bg-white/60 active:bg-white/80"
          aria-label="Tarih seç"
        >
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {FULL_WEEK_DAY_LABELS[weekdayIndex]}
          </span>
          <span className="text-sm font-bold text-brand-ink">
            {new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(cursor)}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(addDays(cursor, 1))}
            className="tap-target flex items-center justify-center rounded-xl border bg-white text-muted-foreground"
            aria-label="Sonraki gün"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={openDatePicker}
            className="tap-target flex items-center justify-center rounded-xl border border-brand-teal/40 bg-brand-teal/10 text-brand-teal"
            aria-label="Takvimden tarih seç"
          >
            <CalendarDays className="h-5 w-5" />
          </button>
          <input
            ref={dateInputRef}
            id="mobile-calendar-date"
            name="mobile_calendar_date"
            type="date"
            value={cursorIso}
            onChange={handleDateChange}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Compact week strip — replaces cramped 7-column grid on small screens */}
      <div
        className="mt-3 grid grid-cols-7 gap-1 rounded-2xl border bg-white p-1.5"
        role="tablist"
        aria-label="Haftanın günleri"
      >
        {stripDays.map((day) => {
          const iso = toISODate(day)
          const selected = iso === cursorIso
          const count = eventsByDate?.get(iso)?.length ?? 0
          return (
            <button
              key={iso}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setCursor(day)}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center rounded-xl px-0.5 py-1.5 text-center transition-colors',
                selected
                  ? 'bg-brand-teal text-white shadow-sm'
                  : 'text-brand-ink hover:bg-slate-50 active:bg-slate-100',
                iso === todayIso && !selected && 'ring-1 ring-brand-teal/40',
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase',
                  selected ? 'text-white/85' : 'text-muted-foreground',
                )}
              >
                {WEEK_DAY_LABELS[(day.getDay() + 6) % 7]}
              </span>
              <span className="text-sm font-bold leading-none">{day.getDate()}</span>
              {count > 0 ? (
                <span
                  className={cn(
                    'mt-1 h-1 w-1 rounded-full',
                    selected ? 'bg-white' : 'bg-brand-teal',
                  )}
                  aria-hidden
                />
              ) : (
                <span className="mt-1 h-1 w-1" aria-hidden />
              )}
            </button>
          )
        })}
      </div>

      {!isToday && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => {
              const d = new Date()
              d.setHours(0, 0, 0, 0)
              setCursor(d)
            }}
            className="rounded-full bg-brand-teal px-4 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            Bugüne Dön
          </button>
        </div>
      )}

      {events.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed bg-white py-10 text-center">
          <p className="text-sm font-semibold text-brand-ink">Bu gün için randevu yok</p>
          <p className="mt-1 text-xs text-muted-foreground">Boş saate dokunarak randevu oluşturabilirsiniz.</p>
        </div>
      ) : null}

      <ul className="mt-4 space-y-px overflow-hidden rounded-2xl border bg-white">
        {hourSlots.map((hour) => {
          const hourLabel = `${String(hour).padStart(2, '0')}:00`
          const hourEvents = events.filter((e) => Number(e.startTime.slice(0, 2)) === hour)
          return (
            <li key={hour}>
              <button
                type="button"
                onClick={() => canCreate && onCreate(cursorIso, hourLabel)}
                disabled={!canCreate}
                aria-label={hourSlotAriaLabel(cursor, hour, hourEvents.length, canCreate)}
                className={cn(
                  'flex w-full items-start gap-3 px-3 py-2 text-left transition-colors',
                  hourEvents.length === 0 && canCreate && 'hover:bg-slate-50 active:bg-slate-100',
                  hourEvents.length === 0 && !canCreate && 'cursor-default'
                )}
              >
                <span className="w-12 shrink-0 pt-1 text-[11px] font-semibold text-muted-foreground">
                  {hourLabel}
                </span>
                <span className="min-w-0 flex-1 border-l border-dashed border-slate-200 pl-3">
                  {hourEvents.length === 0 ? (
                    <span className="block py-3 text-[12px] text-slate-400">Müsait</span>
                  ) : (
                    <span className="block space-y-2 py-1">
                      {hourEvents.map((ev) => (
                        <CalendarEventChip key={ev.id} event={ev} canManage={canManage} />
                      ))}
                    </span>
                  )}
                </span>
                {hourEvents.length === 0 && canCreate && (
                  <Plus className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
