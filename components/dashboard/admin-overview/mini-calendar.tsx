'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from './types'

const monthFormatter = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' })
const weekdayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz']

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function MiniCalendar({ calendarEvents }: { calendarEvents: CalendarEvent[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [calendarOpen, setCalendarOpen] = useState(true)

  const days = useMemo(() => {
    const start = startOfWeek(cursor)
    return Array.from({ length: 42 }, (_, index) => addDays(start, index))
  }, [cursor])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of calendarEvents) {
      if (!map.has(event.date)) map.set(event.date, [])
      map.get(event.date)!.push(event)
    }
    return map
  }, [calendarEvents])

  return (
    <Card className="border-border/60 bg-white/85 shadow-sm backdrop-blur-md">
      <CardContent className="p-4 lg:p-5">
        <button
          type="button"
          onClick={() => setCalendarOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-2 xl:cursor-default"
          aria-expanded={calendarOpen}
        >
          <h2 className="text-sm font-bold text-brand-ink">Aylık Takvim</h2>
          <span className="flex items-center gap-2">
            <span className="text-xs font-medium capitalize text-muted-foreground">{monthFormatter.format(cursor)}</span>
            <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform xl:hidden', calendarOpen && 'rotate-180')} />
          </span>
        </button>

        <div className={cn('mt-3', !calendarOpen && 'hidden xl:block')}>
          <div className="mb-3 flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              aria-label="Önceki ay"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                const now = new Date()
                setCursor(new Date(now.getFullYear(), now.getMonth(), 1))
              }}
            >
              Bugün
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              aria-label="Sonraki ay"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
            {weekdayLabels.map((day) => (
              <span key={day} className="pb-1 text-[10px] font-medium text-muted-foreground">
                {day}
              </span>
            ))}
            {days.map((day) => {
              const iso = toIsoDate(day)
              const dayEvents = eventsByDate.get(iso) ?? []
              const inMonth = day.getMonth() === cursor.getMonth()
              const isToday = iso === toIsoDate(new Date())
              return (
                <Link
                  key={iso}
                  href={`/dashboard/takvim?date=${iso}`}
                  className={cn(
                    'mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-xs font-semibold transition-colors hover:bg-cyan-50',
                    !inMonth && 'text-slate-300',
                    isToday && 'bg-brand-teal text-white hover:bg-brand-teal',
                  )}
                  title={dayEvents.length ? `${dayEvents.length} onaylı randevu` : 'Randevu yok'}
                >
                  <span>{day.getDate()}</span>
                  {dayEvents.length > 0 && <span className={cn('mt-0.5 h-1 w-1 rounded-full', isToday ? 'bg-white' : 'bg-brand-teal')} />}
                </Link>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MiniCalendarSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 lg:p-5">
        <div className="flex w-full items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full xl:hidden" />
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-3 flex items-center justify-end gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={`weekday-${index}`} className="mx-auto h-3 w-6" />
            ))}
            {Array.from({ length: 42 }).map((_, index) => (
              <Skeleton key={`day-${index}`} className="mx-auto h-9 w-9 rounded-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

