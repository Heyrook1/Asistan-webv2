'use client'

import type { ReactNode } from 'react'
import { AlertTriangle, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPhone } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Mobile-only patient chart shell (md:hidden): sticky identity strip + chart tabs/content.
 * Desktop header + layout stay on the patient detail page.
 */
export function MobilePatientChart({
  fullName,
  patientNumber,
  isArchived,
  ageLabel,
  phone,
  allergySummary,
  actions,
  children,
  className,
}: {
  fullName: string
  patientNumber: string | number
  isArchived: boolean
  ageLabel?: string | null
  phone?: string | null
  allergySummary?: string | null
  actions?: ReactNode
  children?: ReactNode
  className?: string
}) {
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className={cn('md:hidden space-y-3', className)} data-testid="mobile-patient-chart">
      <div className="sticky top-14 z-20 -mx-4 border-b border-border/40 bg-dashboard-bg/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-hover text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="truncate text-base font-bold text-brand-ink">{fullName}</h2>
              <Badge
                className={
                  isArchived
                    ? 'border-0 bg-rose-100 text-rose-800'
                    : 'border-0 bg-emerald-100 text-emerald-800'
                }
              >
                {isArchived ? 'Arşivli' : 'Aktif'}
              </Badge>
              <span className="text-[12px] font-medium text-brand-teal">#{patientNumber}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              {ageLabel ? <span>{ageLabel}</span> : null}
              {phone ? (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3 text-brand-teal" />
                  {formatPhone(phone)}
                </span>
              ) : null}
            </div>
            {allergySummary ? (
              <p className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-[11px] font-medium text-amber-800">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span className="truncate">Alerji: {allergySummary}</span>
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
      {children}
    </div>
  )
}
