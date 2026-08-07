'use client'

import Link from 'next/link'
import { MapPin, Star, ArrowRight } from 'lucide-react'

import type { ClientDiscoveryItem } from '@/lib/client-marketplace/types'
import { formatCurrency } from '@/lib/format'
import { useLanguage } from '@/hooks/useLanguage'
import { getPublicBookPath } from '@/lib/public-booking/paths'
import { cn } from '@/lib/utils'

function formatDistanceKm(km: number | null) {
  if (km == null) return null
  const value = Math.round(km * 10) / 10
  return `${value} km`
}

function formatNextSlotLabel(
  nextAvailableAt: string | null,
  labels: { today: string; tomorrow: string },
  locale: string,
): string | null {
  if (!nextAvailableAt) return null
  const d = new Date(nextAvailableAt)
  if (Number.isNaN(d.getTime())) return null

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTomorrow = new Date(startOfToday)
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const dayLabel =
    startOfTarget.getTime() === startOfToday.getTime()
      ? labels.today
      : startOfTarget.getTime() === startOfTomorrow.getTime()
        ? labels.tomorrow
        : d.toLocaleDateString(locale, { month: 'short', day: 'numeric' })

  const timeLabel = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  return `${dayLabel} · ${timeLabel}`
}

export function ClinicCard({ item }: { item: ClientDiscoveryItem }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-GB' : 'tr-TR'
  const detailHref = `/client/clinics/${item.businessId}`
  const params = new URLSearchParams()
  if (item.doctorId) params.set('doctorId', item.doctorId)
  const qs = params.toString()
  const bookHref = qs
    ? `${getPublicBookPath(item.businessSlug)}?${qs}`
    : getPublicBookPath(item.businessSlug)

  const ratingLabel =
    item.ratingAverage != null ? item.ratingAverage.toFixed(1) : t({ tr: 'Yeni', en: 'New' })
  const distanceLabel = formatDistanceKm(item.businessDistanceKm)
  const priceLabel =
    item.minPrice != null
      ? formatCurrency(item.minPrice)
      : t({ tr: 'Fiyat sorulur', en: 'Ask clinic' })
  const nextSlotLabel = formatNextSlotLabel(
    item.nextAvailableAt,
    {
      today: t({ tr: 'Bugün', en: 'Today' }),
      tomorrow: t({ tr: 'Yarın', en: 'Tomorrow' }),
    },
    locale,
  )

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[1.25rem] bg-white ring-1 ring-slate-200/80',
        'shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
      )}
    >
      <div className="flex gap-3 p-3">
        <Link
          href={detailHref}
          className="relative size-[88px] shrink-0 overflow-hidden rounded-[1rem] bg-gradient-to-br from-[#0071E3] to-[#38BDF8]"
          aria-label={item.businessName}
        >
          {item.businessLogoUrl ? (
            <img src={item.businessLogoUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-bold text-white">
              {item.businessName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <Link href={detailHref} className="min-w-0">
              <h3 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">
                {item.businessName}
              </h3>
              <p className="mt-0.5 truncate text-[12px] text-slate-500">
                {[item.specialty, item.doctorName].filter(Boolean).join(' · ')}
              </p>
            </Link>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
              {ratingLabel}
              {item.reviewCount > 0 ? (
                <span className="font-medium text-slate-400">({item.reviewCount})</span>
              ) : null}
            </span>
            {distanceLabel ? (
              <span className="inline-flex items-center gap-0.5 text-slate-500">
                <MapPin className="size-3.5" aria-hidden />
                {distanceLabel}
              </span>
            ) : item.businessCity ? (
              <span className="text-slate-500">{item.businessCity}</span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span
              className={cn(
                'rounded-full px-2 py-0.5',
                item.openNow ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
              )}
            >
              {item.openNow ? t({ tr: 'Açık', en: 'Open' }) : t({ tr: 'Kapalı', en: 'Closed' })}
            </span>
            {nextSlotLabel ? (
              <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[#0071E3]">
                {nextSlotLabel}
              </span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{priceLabel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-slate-100">
        <Link
          href={detailHref}
          className="rz-press flex h-11 items-center justify-center gap-1.5 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
        >
          {t({ tr: 'Detay', en: 'Details' })}
        </Link>
        <Link
          href={bookHref}
          className="rz-press flex h-11 items-center justify-center gap-1.5 border-l border-slate-100 text-[13px] font-bold text-[#0071E3] transition hover:bg-[#0071E3]/5"
        >
          {t({ tr: 'Randevu Al', en: 'Book' })}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
