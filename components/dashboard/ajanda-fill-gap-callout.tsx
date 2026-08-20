'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { CalendarClock } from 'lucide-react'

import type { FillGapSlotCluster, FillGapReturningPatient } from '@/lib/ops/fill-the-gap-copy'
import { clustersForDate } from '@/lib/ops/fill-the-gap-copy'

export function AjandaFillGapCallout({
  dateIso,
  clusters,
  patients,
}: {
  dateIso: string
  clusters: FillGapSlotCluster[]
  patients: FillGapReturningPatient[]
}) {
  const dayClusters = useMemo(() => clustersForDate(clusters, dateIso), [clusters, dateIso])
  if (dayClusters.length === 0) return null

  const top = dayClusters[0]
  const time = top.sampleTimes[0]
  const title =
    top.slotCount === 1
      ? `${top.weekdayLabel}${time ? ` ${time}` : ''} — 1 boş slot`
      : `${top.weekdayLabel}${time ? ` ${time}` : ''} — ${top.slotCount} boş slot`

  return (
    <div className="rounded-xl border border-brand-teal/25 bg-brand-teal/5 px-3 py-2.5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-semibold text-brand-ink">
            <CalendarClock className="h-4 w-4 shrink-0 text-brand-teal" aria-hidden />
            {title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {top.doctorName} · {top.serviceName}
            {patients.length > 0
              ? ` · ${patients.length} dönen hasta kısa listesi Genel Bakış’ta`
              : ''}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="shrink-0 text-xs font-semibold text-brand-teal hover:underline"
        >
          Öneri listesi
        </Link>
      </div>
    </div>
  )
}
