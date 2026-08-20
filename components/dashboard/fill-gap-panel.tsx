'use client'

import Link from 'next/link'
import { CalendarClock, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/format'

export type FillGapPanelCluster = {
  date: string
  weekdayLabel: string
  doctorName: string
  serviceName: string
  slotCount: number
  sampleTimes: string[]
}

export type FillGapPanelPatient = {
  id: string
  fullName: string
  phone: string | null
  lastVisitDate: string
  lastServiceName: string | null
}

export function FillGapPanel({
  headline,
  detail,
  ajandaHref,
  clusters,
  patients,
}: {
  headline: string
  detail: string | null
  ajandaHref: string
  clusters: FillGapPanelCluster[]
  patients: FillGapPanelPatient[]
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-4 p-4 lg:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-teal">
              Operasyon önerisi
            </p>
            <h2 className="mt-1 flex items-start gap-2 text-base font-bold text-brand-ink lg:text-lg">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" aria-hidden />
              <span>{headline}</span>
            </h2>
            {detail && <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{detail}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              Kural tabanlı kısa liste — iptalde boşalan saat için otomatik teklif denemesi (SMS/WA
              bağlıysa). Tahmin yüzdesi veya gelir zekâsı paneli değil.
            </p>
          </div>
          <Button asChild className="h-10 shrink-0 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover">
            <Link href={ajandaHref}>Ajandaya git</Link>
          </Button>
        </div>

        {clusters.length > 1 && (
          <ul className="flex flex-wrap gap-2">
            {clusters.slice(0, 4).map((c) => (
              <li
                key={`${c.date}-${c.doctorName}-${c.serviceName}`}
                className="rounded-lg border border-border/70 bg-dashboard-surface px-2.5 py-1.5 text-xs text-brand-ink"
              >
                <span className="font-semibold">
                  {c.weekdayLabel} {c.sampleTimes[0] ?? ''}
                </span>
                <span className="text-muted-foreground">
                  {' '}
                  · {c.slotCount} slot · {c.doctorName}
                </span>
              </li>
            ))}
          </ul>
        )}

        {patients.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Bekleme / dönen hastalar ({patients.length})
            </div>
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70 bg-white">
              {patients.slice(0, 8).map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-ink">{p.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      Son ziyaret: {p.lastVisitDate ? formatDate(p.lastVisitDate) : '—'}
                      {p.lastServiceName ? ` · ${p.lastServiceName}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {p.phone && (
                      <a
                        href={`https://wa.me/${p.phone.replace(/\D/g, '').replace(/^0/, '90')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-brand-teal hover:underline"
                      >
                        WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/dashboard/hastalar/${p.id}`}
                      className="text-xs font-semibold text-muted-foreground hover:text-brand-teal hover:underline"
                    >
                      Kart
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
