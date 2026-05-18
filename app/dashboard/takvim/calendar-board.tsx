'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AppointmentFormDrawer } from '@/components/dashboard/appointment-form-drawer'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_DOT, formatTime } from '@/lib/format'

type Event = {
  id: string
  patientId: string
  patientName: string
  serviceId: string
  serviceName: string
  serviceColor: string
  staffId: string | null
  staffName: string | null
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

type View = 'day' | 'week' | 'month'

const VIEW_LABEL: Record<View, string> = { day: 'Gün', week: 'Hafta', month: 'Ay' }
const HOUR_START = 8
const HOUR_END = 21

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0..6, Sunday=0
  const diff = (day + 6) % 7 // make Monday = 0
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const WEEK_DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function CalendarBoard({
  events,
  patients,
  services,
  staff,
  canCreate,
}: {
  events: Event[]
  patients: { id: string; label: string }[]
  services: { id: string; name: string; durationMin: number; color: string }[]
  staff: { id: string; name: string; color: string }[]
  canCreate: boolean
}) {
  const [view, setView] = useState<View>('week')
  const [cursor, setCursor] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [staffFilter, setStaffFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [create, setCreate] = useState<{ open: boolean; date?: string; startTime?: string }>({ open: false })

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (staffFilter === 'all' || e.staffId === staffFilter) &&
          (serviceFilter === 'all' || e.serviceId === serviceFilter)
      ),
    [events, staffFilter, serviceFilter]
  )

  const days: Date[] = useMemo(() => {
    if (view === 'day') return [cursor]
    if (view === 'week') {
      const start = startOfWeek(cursor)
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    }
    const startMonth = startOfMonth(cursor)
    const start = startOfWeek(startMonth)
    return Array.from({ length: 42 }, (_, i) => addDays(start, i))
  }, [view, cursor])

  function navigate(direction: 1 | -1) {
    const delta = view === 'day' ? 1 : view === 'week' ? 7 : 0
    if (view === 'month') {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1))
    } else {
      setCursor(addDays(cursor, direction * delta))
    }
  }

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>()
    for (const ev of filtered) {
      if (!map.has(ev.date)) map.set(ev.date, [])
      map.get(ev.date)!.push(ev)
    }
    for (const v of map.values()) v.sort((a, b) => a.startTime.localeCompare(b.startTime))
    return map
  }, [filtered])

  const title = useMemo(() => {
    const tr = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' })
    if (view === 'month') return tr.format(cursor)
    if (view === 'week') {
      const start = startOfWeek(cursor)
      const end = addDays(start, 6)
      return `${start.getDate()} ${tr.format(start).split(' ')[0]} – ${end.getDate()} ${tr.format(end)}`
    }
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(cursor)
  }, [view, cursor])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C1D36]">Takvim</h1>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border bg-white p-1">
            {(['day', 'week', 'month'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  view === v ? 'bg-[#12C8AD] text-white' : 'text-muted-foreground hover:text-[#0C1D36]'
                }`}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date(new Date().setHours(0, 0, 0, 0)))}>
              Bugün
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate(1)} className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-3 grid gap-2 md:grid-cols-2">
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger><SelectValue placeholder="Personel filtrele" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm personel</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger><SelectValue placeholder="Hizmet filtrele" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm hizmetler</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {view === 'month' ? (
            <MonthGrid
              cursor={cursor}
              days={days}
              eventsByDate={eventsByDate}
              onSlotClick={(date) => canCreate && setCreate({ open: true, date })}
            />
          ) : (
            <DayWeekGrid
              days={days}
              eventsByDate={eventsByDate}
              onSlotClick={(date, time) => canCreate && setCreate({ open: true, date, startTime: time })}
            />
          )}
        </CardContent>
      </Card>

      <AppointmentFormDrawer
        open={create.open}
        onOpenChange={(v) => setCreate({ open: v })}
        patients={patients}
        services={services.map((s) => ({ id: s.id, label: s.name, durationMin: s.durationMin }))}
        staff={staff.map((s) => ({ id: s.id, label: s.name }))}
        defaultDate={create.date}
        defaultStartTime={create.startTime}
      />
    </div>
  )
}

function MonthGrid({
  cursor,
  days,
  eventsByDate,
  onSlotClick,
}: {
  cursor: Date
  days: Date[]
  eventsByDate: Map<string, Event[]>
  onSlotClick: (date: string) => void
}) {
  const today = toISODate(new Date())
  return (
    <div className="grid grid-cols-7 text-xs">
      {WEEK_DAY_LABELS.map((d) => (
        <div key={d} className="px-3 py-2 text-center text-[11px] uppercase text-muted-foreground bg-[#F7F9FB] border-b">
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
            onClick={() => onSlotClick(iso)}
            className={`text-left min-h-[110px] border-b border-r p-2 hover:bg-[#F7F9FB] ${
              !inMonth ? 'bg-[#FAFBFC] text-muted-foreground' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${iso === today ? 'rounded-full bg-[#12C8AD] text-white px-2' : ''}`}>
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
                  style={{ background: `${ev.serviceColor}1f`, color: '#0C1D36' }}
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

function DayWeekGrid({
  days,
  eventsByDate,
  onSlotClick,
}: {
  days: Date[]
  eventsByDate: Map<string, Event[]>
  onSlotClick: (date: string, time: string) => void
}) {
  const today = toISODate(new Date())
  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(160px, 1fr))` }}>
        <div className="bg-[#F7F9FB] border-b border-r" />
        {days.map((d) => {
          const iso = toISODate(d)
          return (
            <div
              key={iso}
              className={`px-3 py-3 text-center border-b border-r bg-[#F7F9FB] ${
                iso === today ? 'text-[#12C8AD]' : 'text-[#0C1D36]'
              }`}
            >
              <p className="text-[11px] uppercase text-muted-foreground">{WEEK_DAY_LABELS[(d.getDay() + 6) % 7]}</p>
              <p className="text-lg font-semibold">{d.getDate()}</p>
            </div>
          )
        })}

        {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i).map((hour) => (
          <>
            <div key={`h${hour}`} className="text-[10px] text-muted-foreground border-b border-r px-2 py-3 text-right">
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
                  onClick={() => onSlotClick(iso, `${String(hour).padStart(2, '0')}:00`)}
                  className="relative min-h-[60px] border-b border-r p-1 text-left hover:bg-[#F7F9FB]"
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
                      <p className="font-medium text-[#0C1D36] truncate">{ev.patientName}</p>
                      <p className="text-muted-foreground truncate">
                        {formatTime(ev.startTime)} - {formatTime(ev.endTime)} • {APPOINTMENT_STATUS_LABELS[ev.status]}
                      </p>
                    </Link>
                  ))}
                </button>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}
