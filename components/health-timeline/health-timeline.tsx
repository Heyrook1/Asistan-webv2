'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  Pill,
  Stethoscope,
  StickyNote,
  TriangleAlert,
} from 'lucide-react'

import {
  HEALTH_TIMELINE_KIND_LABELS,
  HEALTH_TIMELINE_KINDS,
  groupHealthTimelineByDay,
  type HealthTimelineItem,
  type HealthTimelineKind,
} from '@/lib/health-timeline'
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from '@/lib/format'
import { cn } from '@/lib/utils'

const KIND_ICON: Record<HealthTimelineKind, typeof CalendarDays> = {
  visit: CalendarDays,
  lab: FlaskConical,
  medication: Pill,
  allergy: TriangleAlert,
  treatment: Stethoscope,
  note: StickyNote,
  file: FileText,
  intake: ClipboardList,
  activity: Activity,
}

const KIND_TONE: Record<HealthTimelineKind, string> = {
  visit: 'bg-[#0071E3]/12 text-[#0071E3]',
  lab: 'bg-violet-100 text-violet-700',
  medication: 'bg-emerald-100 text-emerald-700',
  allergy: 'bg-amber-100 text-amber-800',
  treatment: 'bg-sky-100 text-sky-800',
  note: 'bg-slate-100 text-slate-700',
  file: 'bg-indigo-100 text-indigo-700',
  intake: 'bg-teal-100 text-teal-800',
  activity: 'bg-slate-100 text-slate-600',
}

type HealthTimelineProps = {
  items: HealthTimelineItem[]
  variant: 'clinic' | 'patient'
  locale?: 'tr' | 'en'
  /** Business.timezone — day grouping + fallback clock format (default Asia/Nicosia). */
  timeZone?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionHref?: string
  emptyActionLabel?: string
  className?: string
}

export function HealthTimeline({
  items,
  variant,
  locale = 'tr',
  timeZone = 'Asia/Nicosia',
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  className,
}: HealthTimelineProps) {
  const [filter, setFilter] = useState<HealthTimelineKind | 'all'>('all')
  const zone = timeZone.trim() || 'Asia/Nicosia'

  const availableKinds = useMemo(() => {
    const present = new Set(items.map((item) => item.kind))
    return HEALTH_TIMELINE_KINDS.filter((kind) => present.has(kind))
  }, [items])

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.kind === filter)),
    [items, filter]
  )

  const groups = useMemo(() => groupHealthTimelineByDay(filtered, zone), [filtered, zone])

  const defaultEmptyTitle =
    locale === 'en' ? 'No timeline events yet' : 'Henüz zaman çizelgesi kaydı yok'
  const defaultEmptyDescription =
    variant === 'patient'
      ? locale === 'en'
        ? 'Your visit history across clinics will appear here after you book.'
        : 'Randevu aldıkça klinikler arası ziyaret geçmişiniz burada görünür.'
      : locale === 'en'
        ? 'Appointments, labs, medications and notes will form this longitudinal record.'
        : 'Randevu, tahlil, ilaç ve notlar burada boylamsal kayıt olarak birikir.'

  if (items.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center',
          className
        )}
      >
        <p className="text-sm font-semibold text-slate-800">{emptyTitle ?? defaultEmptyTitle}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {emptyDescription ?? defaultEmptyDescription}
        </p>
        {emptyActionHref && emptyActionLabel ? (
          <Link
            href={emptyActionHref}
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0071E3] px-4 text-sm font-bold text-white"
          >
            {emptyActionLabel}
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {availableKinds.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label={locale === 'en' ? 'All' : 'Tümü'}
          />
          {availableKinds.map((kind) => (
            <FilterChip
              key={kind}
              active={filter === kind}
              onClick={() => setFilter(kind)}
              label={HEALTH_TIMELINE_KIND_LABELS[kind][locale]}
            />
          ))}
        </div>
      ) : null}

      {groups.length === 0 ? (
        <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {locale === 'en' ? 'No events for this filter.' : 'Bu filtrede kayıt yok.'}
        </p>
      ) : (
        <ol className="relative space-y-6 pl-1">
          <span
            aria-hidden
            className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200"
          />
          {groups.map((group) => (
            <li key={group.dayKey} className="relative">
              <div className="mb-3 flex items-center gap-3 pl-10">
                <span className="absolute left-0 flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {group.dayKey.slice(8)}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{group.label}</p>
                  {variant === 'patient' ? (
                    <p className="text-[11px] font-medium text-slate-400">{group.monthLabel}</p>
                  ) : null}
                </div>
              </div>

              <ul className="space-y-2 pl-10">
                {group.items.map((item) => (
                  <TimelineRow
                    key={item.id}
                    item={item}
                    variant={variant}
                    locale={locale}
                    timeZone={zone}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'bg-[#0071E3] text-white'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  )
}

function TimelineRow({
  item,
  variant,
  locale,
  timeZone,
}: {
  item: HealthTimelineItem
  variant: 'clinic' | 'patient'
  locale: 'tr' | 'en'
  timeZone: string
}) {
  const Icon = KIND_ICON[item.kind]
  const occurred = new Date(item.occurredAt)
  // Prefer stored wall-clock (appointment HH:mm) — never re-parse host locale.
  const timeLabel = item.clockTime
    ? item.clockTime
    : Number.isNaN(occurred.getTime())
      ? null
      : occurred.toLocaleTimeString(locale === 'en' ? 'en-GB' : 'tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone,
        })
  const statusLabel =
    item.status && item.kind === 'visit'
      ? APPOINTMENT_STATUS_LABELS[item.status] ?? item.status
      : null

  const body = (
    <article
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm',
        variant === 'patient' && 'active:scale-[0.99]'
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl',
            KIND_TONE[item.kind]
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {HEALTH_TIMELINE_KIND_LABELS[item.kind][locale]}
                {timeLabel ? ` · ${timeLabel}` : ''}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-900">{item.title}</p>
            </div>
            {statusLabel ? (
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                  APPOINTMENT_STATUS_COLORS[item.status!] ?? 'bg-slate-100 text-slate-700'
                )}
              >
                {statusLabel}
              </span>
            ) : null}
          </div>
          {item.clinicName ? (
            <p className="mt-1 text-xs font-semibold text-[#0071E3]">{item.clinicName}</p>
          ) : null}
          {item.subtitle ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{item.subtitle}</p>
          ) : null}
        </div>
      </div>
    </article>
  )

  if (item.href) {
    return (
      <li>
        <Link href={item.href} className="block">
          {body}
        </Link>
      </li>
    )
  }

  return <li>{body}</li>
}
