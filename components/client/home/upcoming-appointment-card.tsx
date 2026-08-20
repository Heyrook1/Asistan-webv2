'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarClock, ChevronRight, MapPin } from 'lucide-react'

import { StatusBadge } from '@/components/client/ui'
import { clientFetch } from '@/lib/client-marketplace/client-fetch'
import { useLanguage } from '@/hooks/useLanguage'
import {
  isUpcomingRow,
  appointmentStartsAtMs,
  type AppointmentRow,
} from '@/components/client/bookings/appointment-model'

/**
 * Signed-in patient's next upcoming appointment, surfaced at the top of Home.
 * Renders nothing for guests / when there is no upcoming appointment (no fake data,
 * no clutter). Soft-fails silently so Home never breaks on this optional module.
 */
export function UpcomingAppointmentCard() {
  const { t } = useLanguage()
  const [row, setRow] = useState<AppointmentRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const data = await clientFetch<{ appointments: AppointmentRow[] }>(
          '/api/client/appointments',
        )
        if (cancelled) return
        const next = data.appointments
          .filter((item) => isUpcomingRow(item))
          .sort(
            (a, b) =>
              appointmentStartsAtMs(a.date, a.startTime) -
              appointmentStartsAtMs(b.date, b.startTime),
          )[0]
        setRow(next ?? null)
      } catch {
        // Guest (AUTH_REQUIRED) or transient error — keep Home clean.
        if (!cancelled) setRow(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div
        aria-hidden
        className="h-[104px] animate-pulse rounded-2xl border border-[var(--rz-border)] bg-white/70"
      />
    )
  }

  if (!row) return null

  const dateLabel = new Date(`${row.date}T${row.startTime}`).toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
    <Link
      href={`/client/bookings?id=${row.id}`}
      className="rz-press block rounded-2xl border border-[var(--rz-border)] bg-white p-4 shadow-[var(--rz-shadow-soft)] transition hover:border-[var(--rz-border-strong)] hover:shadow-[var(--rz-shadow-card)]"
      aria-label={t({ tr: 'Yaklaşan randevunuzu görüntüleyin', en: 'View your upcoming appointment' })}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rz-metadata text-[var(--rz-blue)]">
          {t({ tr: 'Yaklaşan randevu', en: 'Upcoming appointment' })}
        </span>
        <StatusBadge status={row.status} />
      </div>

      <p className="rz-card-title mt-2 truncate text-slate-900">
        {row.doctor?.fullName ?? row.service.name}
      </p>
      <p className="rz-secondary truncate">
        {[row.doctor?.specialty, row.clinic.name].filter(Boolean).join(' · ')}
      </p>

      <div className="mt-3 flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <CalendarClock className="size-4 text-[var(--rz-blue)]" aria-hidden />
          {dateLabel} · {row.startTime}
        </span>
        {row.location?.name ? (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{row.location.name}</span>
          </span>
        ) : null}
        <ChevronRight className="ml-auto size-5 shrink-0 text-slate-300" aria-hidden />
      </div>
    </Link>
  )
}
