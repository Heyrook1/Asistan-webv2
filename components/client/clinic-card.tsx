'use client'

import Link from 'next/link'
import { BadgeCheck, MapPin, Star, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { ClientDiscoveryItem } from '@/lib/client-marketplace/types'
import { formatNextSlotLabelStable } from '@/lib/datetime/calendar-label'
import { formatCurrency } from '@/lib/format'
import { useLanguage } from '@/hooks/useLanguage'
import { getPublicBookPath } from '@/lib/public-booking/paths'
import { cn } from '@/lib/utils'

function formatDistanceKm(km: number | null) {
  if (km == null) return null
  const value = Math.round(km * 10) / 10
  return `${value} km`
}

function rawSlotTime(nextAvailableAt: string | null): string | null {
  if (!nextAvailableAt) return null
  const match = /T(\d{2}:\d{2})/.exec(nextAvailableAt)
  return match?.[1] ?? null
}

function shortArea(item: ClientDiscoveryItem): string | null {
  const city = item.businessCity?.trim() || null
  const address = item.businessAddress?.trim() || null
  if (city && address) {
    // Prefer neighborhood-ish first segment when address already includes city.
    const first = address.split(',')[0]?.trim()
    if (first && first.length <= 42 && !first.toLocaleLowerCase('tr-TR').includes(city.toLocaleLowerCase('tr-TR'))) {
      return `${first}, ${city}`
    }
    return city
  }
  return city ?? address
}

export function ClinicCard({ item }: { item: ClientDiscoveryItem }) {
  const { t, language } = useLanguage()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

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
  const areaLabel = shortArea(item)
  const photoUrl = item.doctorAvatarUrl || item.businessLogoUrl
  const priceAmount =
    item.minPrice != null ? formatCurrency(item.minPrice) : t({ tr: 'Fiyat sorulur', en: 'Ask clinic' })
  const priceLabel =
    item.minPrice != null && item.fromPriceServiceName
      ? `${item.fromPriceServiceName} · ${priceAmount}`
      : priceAmount
  const nextSlotLabel = mounted
    ? formatNextSlotLabelStable(item.nextAvailableAt, language === 'en' ? 'en' : 'tr')
    : rawSlotTime(item.nextAvailableAt)

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
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="size-full object-cover"
              width={88}
              height={88}
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-bold text-white">
              {(item.doctorName || item.businessName).slice(0, 1).toLocaleUpperCase('tr-TR')}
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <Link href={detailHref} className="min-w-0">
              <h3 className="flex items-center gap-1 truncate text-[15px] font-extrabold tracking-tight text-slate-900">
                <span className="truncate">{item.businessName}</span>
                {item.doctorVerified ? (
                  <BadgeCheck
                    className="size-4 shrink-0 text-[#0071E3]"
                    aria-label={t({ tr: 'Doğrulanmış hekim', en: 'Verified doctor' })}
                  />
                ) : null}
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
              <span className="font-medium text-slate-400">
                {item.reviewCount > 0
                  ? t({
                      tr: `(${item.reviewCount} yorum)`,
                      en: `(${item.reviewCount} reviews)`,
                    })
                  : t({ tr: '(yorum yok)', en: '(no reviews)' })}
              </span>
            </span>
            {distanceLabel ? (
              <span className="tabular-nums text-slate-500">{distanceLabel}</span>
            ) : null}
            {areaLabel ? (
              <span className="inline-flex max-w-full items-center gap-0.5 truncate text-slate-500">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{areaLabel}</span>
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            {item.isSponsored ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800 ring-1 ring-amber-200/80">
                {t({ tr: 'Sponsorlu', en: 'Sponsored' })}
              </span>
            ) : null}
            {item.doctorVerified ? (
              <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[#0071E3]">
                {t({ tr: 'Doğrulanmış', en: 'Verified' })}
              </span>
            ) : null}
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
                {t({ tr: 'En erken', en: 'Earliest' })} · {nextSlotLabel}
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                {t({ tr: 'Müsait saat yok', en: 'No open slots' })}
              </span>
            )}
            <span
              className="max-w-full truncate rounded-full bg-slate-100 px-2 py-0.5 text-slate-600"
              title={priceLabel}
            >
              {priceLabel}
            </span>
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
          className="rz-press flex h-11 items-center justify-center gap-1.5 bg-[#0071E3]/8 text-[13px] font-bold text-[#0071E3] transition hover:bg-[#0071E3]/14"
        >
          {t({ tr: 'Randevu Al', en: 'Book' })}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  )
}
