'use client'

import Link from 'next/link'
import { Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useLiveAvailability } from '@/hooks/use-live-availability'
import { addCalendarDays, calendarDateInTimeZone, formatNextSlotLabelStable } from '@/lib/datetime/calendar-label'
import { cn } from '@/lib/utils'

type Props = {
  businessId: string
  doctorId: string
  serviceId: string
  bookBase: string
  /** SSR seed so first paint is not empty while live fetch runs. */
  initialSlots?: Array<{ date: string; startTime: string; endTime: string }>
}

/**
 * Live empty slots for clinic detail — same agenda source as /book.
 * Hydration-safe: SSR shows seed times only; live poll starts after mount.
 */
export function DoctorLiveSlotChips({
  businessId,
  doctorId,
  serviceId,
  bookBase,
  initialSlots = [],
}: Props) {
  const [mounted, setMounted] = useState(false)
  const [dayOffset, setDayOffset] = useState(0)

  const [todayIso, setTodayIso] = useState<string | null>(null)
  useEffect(() => {
    setTodayIso(calendarDateInTimeZone())
    setMounted(true)
  }, [])

  const date = todayIso ? addCalendarDays(todayIso, dayOffset) : ''

  const { slots, loading, syncedAt } = useLiveAvailability({
    businessId,
    doctorId,
    serviceId,
    date,
    enabled: mounted && Boolean(date),
    pollMs: 20_000,
  })

  useEffect(() => {
    if (!mounted) return
    if (loading) return
    if (slots.length > 0) return
    if (dayOffset >= 6) return
    setDayOffset((n) => n + 1)
  }, [mounted, loading, slots.length, dayOffset])

  const seedSlots = initialSlots.slice(0, 6)
  const liveSlots = slots.slice(0, 6).map((slot) => ({
    date,
    startTime: slot.startTime,
    endTime: slot.endTime,
  }))
  const displaySlots = !mounted
    ? seedSlots
    : liveSlots.length > 0
      ? liveSlots
      : dayOffset === 0
        ? seedSlots
        : []

  const first = displaySlots[0]
  const firstLabel =
    mounted && first
      ? formatNextSlotLabelStable(`${first.date}T${first.startTime}:00`, 'tr')
      : first
        ? first.startTime
        : null

  if (mounted && !loading && displaySlots.length === 0 && dayOffset >= 6) {
    return (
      <p className="mt-2 text-[12px] text-slate-500">Yakın tarihte açık slot yok</p>
    )
  }

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          <Clock3 className="size-3" aria-hidden />
          Boş saatler
          {firstLabel ? (
            <span className="normal-case tracking-normal text-slate-500">· {firstLabel}</span>
          ) : null}
        </p>
        {mounted && syncedAt ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            Canlı
          </span>
        ) : null}
      </div>
      {mounted && loading && displaySlots.length === 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-[4.25rem] animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {displaySlots.map((slot) => {
            const href = `${bookBase}?${new URLSearchParams({
              doctorId,
              serviceId,
              date: slot.date,
            }).toString()}`
            return (
              <Link
                key={`${slot.date}-${slot.startTime}`}
                href={href}
                className={cn(
                  'rz-press inline-flex h-9 min-w-[4.25rem] items-center justify-center rounded-full px-3',
                  'bg-slate-50 text-[12.5px] font-bold text-slate-800 ring-1 ring-slate-200',
                  'hover:bg-[#0071E3]/8 hover:text-[#0071E3] hover:ring-[#0071E3]/25',
                )}
              >
                {slot.startTime}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
