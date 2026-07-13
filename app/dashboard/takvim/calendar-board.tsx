'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CalendarDays, ChevronLeft, ChevronRight, Share2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { AppointmentFormDrawer } from '@/components/dashboard/appointment-form-drawer'
import { AjandaModeSwitch } from '@/components/dashboard/ajanda-mode-switch'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_DOT, formatTime } from '@/lib/format'
import {
  readUiPreference,
  UI_PREF_KEYS,
  writeUiPreference,
  type CalendarPrefs,
} from '@/lib/ui-preferences'
import { cn } from '@/lib/utils'

type Event = {
  id: string
  patientId: string
  patientName: string
  serviceId: string
  serviceName: string
  serviceColor: string
  staffId: string | null
  staffName: string | null
  locationId: string | null
  locationName: string | null
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

type View = 'day' | 'week' | 'month'

const VIEW_LABEL: Record<View, string> = { day: 'Gün', week: 'Hafta', month: 'Ay' }
const STATUS_FILTERS = [
  { value: 'agenda', label: 'Ajanda (bekleyen + onaylı)' },
  { value: 'all', label: 'Tüm durumlar' },
  { value: 'SCHEDULED', label: APPOINTMENT_STATUS_LABELS.SCHEDULED },
  { value: 'CONFIRMED', label: APPOINTMENT_STATUS_LABELS.CONFIRMED },
  { value: 'COMPLETED', label: APPOINTMENT_STATUS_LABELS.COMPLETED },
  { value: 'CANCELLED', label: APPOINTMENT_STATUS_LABELS.CANCELLED },
  { value: 'NO_SHOW', label: APPOINTMENT_STATUS_LABELS.NO_SHOW },
]
const HOUR_START = 8
const HOUR_END = 21

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
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
const FULL_WEEK_DAY_LABELS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

function formatAccessibleDate(date: Date) {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function hourSlotAriaLabel(date: Date, hour: number, eventCount: number, canCreateSlot: boolean) {
  const hourLabel = `${String(hour).padStart(2, '0')}:00`
  const dateLabel = formatAccessibleDate(date)
  if (eventCount > 0) return `${dateLabel}, ${hourLabel}, ${eventCount} randevu`
  if (canCreateSlot) return `${dateLabel}, ${hourLabel}, müsait, randevu oluştur`
  return `${dateLabel}, ${hourLabel}, müsait`
}

function dayCellAriaLabel(day: Date, eventCount: number) {
  const dateLabel = formatAccessibleDate(day)
  if (eventCount > 0) return `${dateLabel}, ${eventCount} randevu, güne git`
  return `${dateLabel}, randevu oluştur`
}

export function CalendarBoard({
  events,
  patients,
  services,
  staff,
  locations,
  canCreate,
  bookingSlug,
  defaultStaffId,
  pendingCount = 0,
  initialDate,
}: {
  events: Event[]
  patients: { id: string; label: string }[]
  services: { id: string; name: string; durationMin: number; color: string }[]
  staff: { id: string; name: string; color: string }[]
  locations: { id: string; label: string }[]
  canCreate: boolean
  bookingSlug: string
  defaultStaffId?: string
  pendingCount?: number
  initialDate?: string
}) {
  const [view, setView] = useState<View>('week')
  const [cursor, setCursor] = useState<Date>(() => {
    if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
      const parsed = new Date(`${initialDate}T00:00:00`)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [staffFilter, setStaffFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('agenda')
  const [create, setCreate] = useState<{ open: boolean; date?: string; startTime?: string }>({ open: false })
  const [shareOpen, setShareOpen] = useState(false)
  const prefsReady = useRef(false)

  useEffect(() => {
    if (prefsReady.current) return
    prefsReady.current = true
    const saved = readUiPreference<CalendarPrefs>(UI_PREF_KEYS.calendarPrefs)
    if (!saved) return
    if (saved.view === 'day' || saved.view === 'week' || saved.view === 'month') setView(saved.view)
    if (saved.staffFilter) setStaffFilter(saved.staffFilter)
    if (saved.serviceFilter) setServiceFilter(saved.serviceFilter)
    if (saved.statusFilter) setStatusFilter(saved.statusFilter)
  }, [])

  useEffect(() => {
    if (!prefsReady.current) return
    writeUiPreference<CalendarPrefs>(UI_PREF_KEYS.calendarPrefs, {
      view,
      staffFilter,
      serviceFilter,
      statusFilter,
    })
  }, [view, staffFilter, serviceFilter, statusFilter])

  const bookingLink = useMemo(() => {
    if (typeof window === 'undefined') return `/randevu/${bookingSlug}`
    return `${window.location.origin}/randevu/${bookingSlug}`
  }, [bookingSlug])

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (staffFilter !== 'all' && e.staffId !== staffFilter) return false
        if (serviceFilter !== 'all' && e.serviceId !== serviceFilter) return false
        if (statusFilter === 'agenda') return e.status === 'SCHEDULED' || e.status === 'CONFIRMED'
        if (statusFilter === 'all') return true
        return e.status === statusFilter
      }),
    [events, staffFilter, serviceFilter, statusFilter]
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
    <div className="space-y-3 lg:space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-brand-ink lg:text-2xl">Ajanda</h1>
              <p className="text-[12px] text-muted-foreground lg:text-sm">
                Takvim modu · {title}
                {pendingCount > 0 ? (
                  <>
                    {' '}
                    ·{' '}
                    <Link
                      href="/dashboard/ajanda?mode=liste&status=SCHEDULED"
                      className="font-semibold text-brand-teal hover:underline"
                    >
                      {pendingCount} onay bekliyor
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <AjandaModeSwitch mode="takvim" />
          </div>
        </div>
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <div className="flex rounded-xl border bg-white p-1">
            {(['day', 'week', 'month'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium',
                  view === v ? 'bg-brand-teal text-white' : 'text-muted-foreground hover:text-brand-ink'
                )}
              >
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9" aria-label="Önceki">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCursor(new Date(new Date().setHours(0, 0, 0, 0)))}>
              Bugün
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate(1)} className="h-9 w-9" aria-label="Sonraki">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)} className="gap-2">
            <Share2 className="h-4 w-4" />
            Takvimi Paylaş
          </Button>
        </div>
      </div>

      {/* Mobile-only agenda view */}
      <MobileAgenda
        cursor={cursor}
        setCursor={setCursor}
        events={eventsByDate.get(toISODate(cursor)) ?? []}
        canCreate={canCreate}
        onCreate={(date, startTime) => setCreate({ open: true, date, startTime })}
      />

      {/* Tablet+/desktop view */}
      <Card className="hidden md:block">
        <CardContent className="p-3 grid gap-2 md:grid-cols-3">
          <div>
            <label htmlFor="calendar-staff-filter" className="sr-only">Personel filtrele</label>
            <Select value={staffFilter} onValueChange={setStaffFilter}>
              <SelectTrigger id="calendar-staff-filter" aria-label="Personel filtrele"><SelectValue placeholder="Personel filtrele" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm personel</SelectItem>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="calendar-service-filter" className="sr-only">Hizmet filtrele</label>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger id="calendar-service-filter" aria-label="Hizmet filtrele"><SelectValue placeholder="Hizmet filtrele" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm hizmetler</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="calendar-status-filter" className="sr-only">Durum filtrele</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="calendar-status-filter" aria-label="Durum filtrele"><SelectValue placeholder="Durum filtrele" /></SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="hidden md:block">
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
        locations={locations}
        patients={patients}
        services={services.map((s) => ({ id: s.id, label: s.name, durationMin: s.durationMin }))}
        staff={staff.map((s) => ({ id: s.id, label: s.name }))}
        defaultDate={create.date}
        defaultStartTime={create.startTime}
        defaultStaffId={defaultStaffId}
      />

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Takvimi Paylaş</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <label htmlFor="calendar-share-link" className="sr-only">Online randevu bağlantısı</label>
            <Input id="calendar-share-link" readOnly value={bookingLink} aria-label="Online randevu bağlantısı" />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(bookingLink)
                toast.success('Bağlantı kopyalandı')
              }}
              className="bg-brand-teal hover:bg-brand-teal-hover text-white"
            >
              Bağlantıyı Kopyala
            </Button>
            <Button variant="outline" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(bookingLink)}`, '_blank')}>
              WhatsApp ile Paylaş
            </Button>
            <Button variant="outline" onClick={() => window.open(`mailto:?subject=Online Randevu&body=${encodeURIComponent(bookingLink)}`)}>
              E-posta ile Paylaş
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MobileAgenda({
  cursor,
  setCursor,
  events,
  canCreate,
  onCreate,
}: {
  cursor: Date
  setCursor: (date: Date) => void
  events: Event[]
  canCreate: boolean
  onCreate: (date: string, startTime?: string) => void
}) {
  const touch = useRef<{ x: number; y: number } | null>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const todayIso = toISODate(new Date())
  const cursorIso = toISODate(cursor)
  const isToday = cursorIso === todayIso
  const weekdayIndex = (cursor.getDay() + 6) % 7

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
                        <Link
                          key={ev.id}
                          href={`/dashboard/hastalar/${ev.patientId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block rounded-xl border bg-white px-3 py-2.5 text-[13px] active:bg-slate-50"
                          style={{
                            borderLeftColor: APPOINTMENT_STATUS_DOT[ev.status] ?? ev.serviceColor,
                            borderLeftWidth: 3,
                          }}
                        >
                          <span className="block font-semibold text-brand-ink">{ev.patientName}</span>
                          <span className="mt-0.5 block text-[12px] text-muted-foreground">
                            {ev.serviceName}{ev.staffName ? ` • ${ev.staffName}` : ''}
                          </span>
                          <span className="mt-1 inline-flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-brand-ink">
                              {formatTime(ev.startTime)} - {formatTime(ev.endTime)}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                background: `${APPOINTMENT_STATUS_DOT[ev.status] ?? ev.serviceColor}22`,
                                color: APPOINTMENT_STATUS_DOT[ev.status] ?? 'var(--brand-ink)',
                              }}
                            >
                              {APPOINTMENT_STATUS_LABELS[ev.status]}
                            </span>
                          </span>
                        </Link>
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
        <div className="bg-dashboard-surface border-b border-r" />
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
