'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

const STATUS_LABEL: Record<AppointmentStatus, { tr: string; en: string }> = {
  SCHEDULED: { tr: 'Onay bekliyor', en: 'Awaiting confirmation' },
  CONFIRMED: { tr: 'Onaylandı', en: 'Confirmed' },
  COMPLETED: { tr: 'Tamamlandı', en: 'Completed' },
  CANCELLED: { tr: 'İptal edildi', en: 'Cancelled' },
  NO_SHOW: { tr: 'Gelinmedi', en: 'No-show' },
}

// Status is communicated by label + a colored dot (not color alone) for colorblind safety.
const STATUS_CLASS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-amber-50 text-amber-800 ring-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-800 ring-sky-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-800 ring-rose-200',
  NO_SHOW: 'bg-slate-100 text-slate-700 ring-slate-200',
}

const DOT_CLASS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'bg-amber-500',
  CONFIRMED: 'bg-sky-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
  NO_SHOW: 'bg-slate-400',
}

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus
  className?: string
}) {
  const { t } = useLanguage()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        STATUS_CLASS[status],
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', DOT_CLASS[status])} />
      {t(STATUS_LABEL[status])}
    </span>
  )
}
