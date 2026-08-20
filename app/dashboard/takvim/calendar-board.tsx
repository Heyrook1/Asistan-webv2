'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AppointmentFormDrawer } from '@/components/dashboard/appointment-form-drawer'
import { AjandaFillGapCallout } from '@/components/dashboard/ajanda-fill-gap-callout'
import type { FillGapReturningPatient, FillGapSlotCluster } from '@/lib/ops/fill-the-gap-copy'
import {
  readUiPreference,
  UI_PREF_KEYS,
  writeUiPreference,
  type CalendarPrefs,
} from '@/lib/ui-preferences'
import type { CalendarEvent, View } from './calendar-types'
import { addDays, startOfMonth, startOfWeek, toISODate } from './calendar-date-utils'
import { MobileAgenda } from './calendar-mobile-agenda'
import { MonthGrid } from './calendar-month-grid'
import { DayWeekGrid } from './calendar-day-week-grid'
import { CalendarToolbar } from './calendar-toolbar'
import { CalendarFilters } from './calendar-filters'
import { CalendarShareDialog } from './calendar-share-dialog'

export function CalendarBoard({
  events,
  patients,
  services,
  staff,
  locations,
  canCreate,
  canManage = canCreate,
  bookingSlug,
  defaultStaffId,
  pendingCount = 0,
  initialDate,
  fillGapClusters = [],
  fillGapPatients = [],
}: {
  events: CalendarEvent[]
  patients: { id: string; label: string }[]
  services: { id: string; name: string; durationMin: number; color: string }[]
  staff: { id: string; name: string; color: string }[]
  locations: { id: string; label: string }[]
  canCreate: boolean
  canManage?: boolean
  bookingSlug: string
  defaultStaffId?: string
  pendingCount?: number
  initialDate?: string
  fillGapClusters?: FillGapSlotCluster[]
  fillGapPatients?: FillGapReturningPatient[]
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
    if (typeof window === 'undefined') return `/book/${bookingSlug}`
    return `${window.location.origin}/book/${bookingSlug}`
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
    const map = new Map<string, CalendarEvent[]>()
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
      <CalendarToolbar
        title={title}
        pendingCount={pendingCount}
        view={view}
        onViewChange={setView}
        onNavigate={navigate}
        onToday={() => setCursor(new Date(new Date().setHours(0, 0, 0, 0)))}
        onShare={() => setShareOpen(true)}
      />

      {fillGapClusters.length > 0 && (
        <AjandaFillGapCallout
          dateIso={toISODate(cursor)}
          clusters={fillGapClusters}
          patients={fillGapPatients}
        />
      )}

      <MobileAgenda
        cursor={cursor}
        setCursor={setCursor}
        weekDays={view === 'week' ? days : undefined}
        eventsByDate={eventsByDate}
        events={eventsByDate.get(toISODate(cursor)) ?? []}
        canCreate={canCreate}
        canManage={canManage}
        onCreate={(date, startTime) => setCreate({ open: true, date, startTime })}
      />

      <CalendarFilters
        staff={staff}
        services={services}
        staffFilter={staffFilter}
        serviceFilter={serviceFilter}
        statusFilter={statusFilter}
        onStaffFilterChange={setStaffFilter}
        onServiceFilterChange={setServiceFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <Card className="hidden md:block">
        <CardContent className="p-0">
          {view === 'month' ? (
            <MonthGrid
              cursor={cursor}
              days={days}
              eventsByDate={eventsByDate}
              canManage={canManage}
              onSlotClick={(date) => canCreate && setCreate({ open: true, date })}
            />
          ) : (
            <DayWeekGrid
              days={days}
              eventsByDate={eventsByDate}
              canManage={canManage}
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

      <CalendarShareDialog open={shareOpen} onOpenChange={setShareOpen} bookingLink={bookingLink} />
    </div>
  )
}
