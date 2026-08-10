'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck, CalendarPlus, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { APPOINTMENT_STATUS_LABELS, formatTime } from '@/lib/format'
import { allowedNextStatuses } from '@/lib/appointment-transitions'
import { cn } from '@/lib/utils'

export type MobileAgendaAppointment = {
  id: string
  patientId: string
  patientName: string
  serviceName: string
  serviceColor: string
  staffName: string | null
  date: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
}

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function shiftIso(iso: string, delta: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const next = new Date(y, m - 1, d + delta)
  const yy = next.getFullYear()
  const mm = String(next.getMonth() + 1).padStart(2, '0')
  const dd = String(next.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function labelDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Mobile-only ajanda shell (md:hidden): day list + sticky Bugün + primary Onayla/İptal.
 * Desktop layout stays on AppointmentsBoard / CalendarBoard.
 */
export function MobileAgendaShell({
  appointments,
  canManage,
  pending,
  onConfirm,
  onCancel,
  onCreate,
}: {
  appointments: MobileAgendaAppointment[]
  canManage: boolean
  pending: boolean
  onConfirm: (appointment: MobileAgendaAppointment) => void
  onCancel: (appointment: MobileAgendaAppointment) => void
  onCreate?: () => void
}) {
  const [day, setDay] = useState(todayIso)
  const isToday = day === todayIso()

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.date === day && a.status !== 'CANCELLED')
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments, day],
  )

  const pendingToday = useMemo(
    () => appointments.filter((a) => a.date === day && a.status === 'SCHEDULED').length,
    [appointments, day],
  )

  return (
    <div className="md:hidden space-y-3" data-testid="mobile-agenda-shell">
      <div className="sticky top-14 z-20 -mx-4 border-b border-border/40 bg-dashboard-bg/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDay((d) => shiftIso(d, -1))}
            className="tap-target flex items-center justify-center rounded-xl border bg-white text-muted-foreground"
            aria-label="Önceki gün"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-bold capitalize text-brand-ink">{labelDay(day)}</p>
            {pendingToday > 0 ? (
              <p className="text-[11px] font-medium text-amber-800">
                {pendingToday} onay bekliyor
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Günlük ajanda</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDay((d) => shiftIso(d, 1))}
            className="tap-target flex items-center justify-center rounded-xl border bg-white text-muted-foreground"
            aria-label="Sonraki gün"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          {!isToday ? (
            <button
              type="button"
              onClick={() => setDay(todayIso())}
              className="rounded-full bg-brand-teal px-4 py-1.5 text-xs font-bold text-white shadow-sm"
            >
              Bugün
            </button>
          ) : (
            <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
              Bugün
            </span>
          )}
          {canManage && onCreate ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={onCreate}
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Yeni
            </Button>
          ) : null}
        </div>
      </div>

      {dayAppointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white px-4 py-10 text-center">
          <p className="text-sm font-semibold text-brand-ink">Bu gün için randevu yok</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Takvim görünümü Menü → Ajanda → Takvim’den açılır.
          </p>
          {canManage && onCreate ? (
            <Button
              type="button"
              className="mt-4 bg-brand-teal text-white hover:bg-brand-teal-hover"
              onClick={onCreate}
            >
              Randevu oluştur
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {dayAppointments.map((appointment) => {
            const next = allowedNextStatuses(appointment.status)
            const canConfirm = canManage && next.includes('CONFIRMED')
            const canCancelStatus =
              canManage && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED')
            return (
              <li key={appointment.id} id={`mobile-appointment-${appointment.id}`}>
                <article className="rounded-2xl border border-border/60 bg-white p-3.5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/hastalar/${appointment.patientId}`}
                        className="block truncate text-[15px] font-bold text-brand-ink hover:text-brand-teal"
                      >
                        {appointment.patientName}
                      </Link>
                      <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: appointment.serviceColor || 'var(--brand-teal)' }}
                        />
                        <span className="truncate">{appointment.serviceName}</span>
                      </p>
                      {appointment.staffName ? (
                        <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                          {appointment.staffName}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="inline-flex items-center gap-1 text-sm font-bold text-brand-ink">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatTime(appointment.startTime)}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-muted-foreground">
                        {APPOINTMENT_STATUS_LABELS[appointment.status]}
                      </p>
                    </div>
                  </div>

                  {(canConfirm || canCancelStatus) && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {canConfirm ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          className="h-11 gap-1.5 bg-sky-600 text-white hover:bg-sky-700"
                          onClick={() => onConfirm(appointment)}
                          data-testid="mobile-agenda-confirm"
                        >
                          <CalendarCheck className="h-4 w-4" />
                          Onayla
                        </Button>
                      ) : (
                        <span />
                      )}
                      {canCancelStatus ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          className={cn(
                            'h-11 gap-1.5 text-rose-700',
                            !canConfirm && 'col-span-2',
                          )}
                          onClick={() => onCancel(appointment)}
                          data-testid="mobile-agenda-cancel"
                        >
                          <XCircle className="h-4 w-4" />
                          İptal
                        </Button>
                      ) : null}
                    </div>
                  )}
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
