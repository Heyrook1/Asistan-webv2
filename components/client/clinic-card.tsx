'use client'

import { MapPin, Star, Timer } from 'lucide-react'

import type { ClientDiscoveryItem } from '@/lib/client-marketplace/types'
import { formatCurrency } from '@/lib/format'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function formatDistanceKm(km: number | null) {
  if (km == null) return null
  const value = Math.round(km * 10) / 10
  return `${value} km`
}

function formatNextSlotLabel(
  nextAvailableAt: string | null,
  labels: { none: string; today: string; tomorrow: string },
  locale: string,
) {
  if (!nextAvailableAt) return labels.none
  const d = new Date(nextAvailableAt)
  if (Number.isNaN(d.getTime())) return labels.none

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
  return `${dayLabel} ${timeLabel}`
}

export function ClinicCard({ item }: { item: ClientDiscoveryItem }) {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en-GB' : 'tr-TR'

  const ratingLabel =
    item.ratingAverage != null
      ? `${item.ratingAverage.toFixed(1)}`
      : t({ tr: 'Yeni', en: 'New' })

  const distanceLabel = formatDistanceKm(item.businessDistanceKm)

  const priceLabel =
    item.minPrice != null
      ? t({
          tr: `Başlangıç ${formatCurrency(item.minPrice)}`,
          en: `From ${formatCurrency(item.minPrice)}`,
        })
      : t({ tr: 'Fiyat değişir', en: 'Price varies' })

  const nextSlotLabel = formatNextSlotLabel(
    item.nextAvailableAt,
    {
      none: t({ tr: 'Saat yok', en: 'No slots' }),
      today: t({ tr: 'Bugün', en: 'Today' }),
      tomorrow: t({ tr: 'Yarın', en: 'Tomorrow' }),
    },
    locale,
  )

  return (
    <Card
      className={cn(
        'group relative gap-0 overflow-hidden rounded-2xl border border-border/60',
        'bg-card py-0 shadow-[0_2px_12px_rgba(14,154,167,0.06)]',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(14,154,167,0.12)]',
        'hover:border-primary/20',
      )}
    >
      <div className="h-1 w-full bg-gradient-to-r from-primary to-accent-pop" />

      <CardContent className="p-4 md:p-5">
        <div className="flex items-start gap-3.5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent-pop/10 text-base font-bold text-primary ring-2 ring-primary/15">
            {item.businessName.slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-bold leading-snug text-foreground">
                  {item.businessName}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {item.specialty ? `${item.specialty} · ` : ''}
                  {item.doctorName}
                </p>
              </div>

              <div className="shrink-0 space-y-2 text-right">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200/60">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{ratingLabel}</span>
                  {item.reviewCount > 0 && (
                    <span className="text-amber-500/70">({item.reviewCount})</span>
                  )}
                </div>

                <div
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    item.openNow
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', item.openNow ? 'bg-emerald-500' : 'bg-slate-400')} />
                  {item.openNow
                    ? t({ tr: 'Şu an açık', en: 'Open now' })
                    : t({ tr: 'Kapalı', en: 'Closed' })}
                </div>
              </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 md:grid-cols-3">
              <div className="rounded-xl bg-primary-soft px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                  {t({ tr: 'Fiyat', en: 'Price' })}
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground">{priceLabel}</p>
              </div>

              <div className="rounded-xl bg-blue-50 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent-pop/70">
                  {t({ tr: 'Sonraki saat', en: 'Next slot' })}
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground">{nextSlotLabel}</p>
              </div>

              <div className="hidden rounded-xl bg-slate-50 px-3 py-2.5 md:block">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t({ tr: 'Mesafe', en: 'Distance' })}
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {distanceLabel ?? '—'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <Button className="h-11 flex-1 rounded-xl bg-primary font-semibold text-white shadow-[0_2px_8px_rgba(14,154,167,0.25)] transition-all hover:bg-primary-hover hover:shadow-[0_4px_16px_rgba(14,154,167,0.3)] active:scale-[0.98]">
                {t({ tr: 'Randevu al', en: 'Book appointment' })}
              </Button>
              <Button variant="outline" className="h-11 rounded-xl border-border/80 px-5 text-muted-foreground hover:border-primary/30 hover:text-primary">
                {t({ tr: 'Detay', en: 'Details' })}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {(item.businessCity || item.businessAddress || distanceLabel) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {[
                    item.businessCity,
                    item.businessAddress,
                    distanceLabel ? `(${distanceLabel})` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              )}
              {item.nextAvailableAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" />
                  {t({ tr: 'Güncel müsaitlik', en: 'Updated availability' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
