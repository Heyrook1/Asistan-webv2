'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/hooks/useLanguage'
import { CLIENT_GEOLOCATION_ENABLED } from '@/lib/client-marketplace/geolocation-policy'
import {
  readUiPreference,
  UI_PREF_KEYS,
  writeUiPreference,
  type ClientDiscoveryPref,
} from '@/lib/ui-preferences'
import { cn } from '@/lib/utils'

type Chip = {
  key: string
  labelKey: 'today' | 'rating' | 'budget'
  param: string
  value: string
}

const BASE_CHIPS: Chip[] = [
  { key: 'today', labelKey: 'today', param: 'availableToday', value: 'true' },
  // maxDistanceKm (5 km) hidden until client location permission is wired (Faz 2).
  { key: 'budget', labelKey: 'budget', param: 'maxPrice', value: '1500' },
]

const RATING_CHIP: Chip = {
  key: 'rating',
  labelKey: 'rating',
  param: 'minRating',
  value: '4.5',
}

const FILTER_PARAMS = new Set([
  'availableToday',
  'minRating',
  'maxDistanceKm',
  'minPrice',
  'maxPrice',
  'city',
  'specialty',
  'serviceId',
  'sort',
])

function persistFromParams(params: URLSearchParams) {
  writeUiPreference<ClientDiscoveryPref>(UI_PREF_KEYS.clientDiscovery, {
    sort: params.get('sort') ?? undefined,
    availableToday: params.get('availableToday') === 'true',
    minRating: params.get('minRating') ?? undefined,
    maxDistanceKm: params.get('maxDistanceKm') ?? undefined,
    maxPrice: params.get('maxPrice') ?? undefined,
    city: params.get('city') ?? undefined,
  })
}

export function ClinicFilters({
  ratingFilterEnabled = false,
}: {
  /** Hide “Puan 4.5+” when the public catalog has no appointment-backed reviews. */
  ratingFilterEnabled?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const restored = useRef(false)

  const chips = useMemo(
    () =>
      ratingFilterEnabled
        ? [...BASE_CHIPS.slice(0, 1), RATING_CHIP, ...BASE_CHIPS.slice(1)]
        : BASE_CHIPS,
    [ratingFilterEnabled],
  )

  const chipLabels = {
    today: t({ tr: 'Bugün müsait', en: 'Available today' }),
    rating: t({ tr: 'Puan 4.5+', en: 'Rating 4.5+' }),
    budget: t({ tr: '₺1500 altı', en: 'Under ₺1500' }),
  }

  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const hasFilter = [...FILTER_PARAMS].some((key) => searchParams.get(key))
    if (hasFilter) {
      persistFromParams(searchParams)
      return
    }
    // Branş / free-text search from home — do not re-apply saved "Bugün müsait" etc.
    // (those chips often empty the KKTC catalog and feel like content is blocked).
    if (searchParams.get('query') || searchParams.get('specialty')) {
      return
    }
    const saved = readUiPreference<ClientDiscoveryPref>(UI_PREF_KEYS.clientDiscovery)
    if (!saved) return
    const next = new URLSearchParams(searchParams.toString())
    let changed = false
    if (saved.sort) {
      // Never restore "nearest" while geolocation is blocked (Permissions-Policy).
      next.set('sort', saved.sort === 'nearest' ? 'highest-rated' : saved.sort)
      changed = true
    }
    // Never auto-restore availableToday — slots are sparse; empties every branş.
    if (saved.minRating && ratingFilterEnabled) {
      next.set('minRating', saved.minRating)
      changed = true
    }
    // Do not restore maxDistanceKm — unsupported without location.
    if (saved.maxPrice) {
      next.set('maxPrice', saved.maxPrice)
      changed = true
    }
    if (saved.city) {
      next.set('city', saved.city)
      changed = true
    }
    if (!changed) return
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [pathname, ratingFilterEnabled, router, searchParams])

  // Drop stale minRating / most-reviewed when catalog has no ratings.
  useEffect(() => {
    if (ratingFilterEnabled) return
    const hasMin = Boolean(searchParams.get('minRating'))
    const hasMost = searchParams.get('sort') === 'most-reviewed'
    if (!hasMin && !hasMost) return
    const next = new URLSearchParams(searchParams.toString())
    next.delete('minRating')
    if (hasMost) next.set('sort', 'highest-rated')
    persistFromParams(next)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [pathname, ratingFilterEnabled, router, searchParams])

  const currentSort = searchParams.get('sort') ?? 'highest-rated'
  const city = searchParams.get('city')
  // Permissions-Policy: geolocation=() — do not offer "En yakın" until location ships.
  const nearestAvailable = CLIENT_GEOLOCATION_ENABLED

  const cityOptions = [
    { value: 'Lefkoşa', label: { tr: 'Lefkoşa', en: 'Nicosia' } },
    { value: 'Girne', label: { tr: 'Girne', en: 'Kyrenia' } },
    { value: 'Gazimağusa', label: { tr: 'Gazimağusa', en: 'Famagusta' } },
    { value: 'Güzelyurt', label: { tr: 'Güzelyurt', en: 'Morphou' } },
  ] as const

  const chipState = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const chip of chips) {
      map.set(chip.key, searchParams.get(chip.param) === chip.value)
    }
    return map
  }, [chips, searchParams])

  const hasAnyFilter = useMemo(() => {
    for (const key of FILTER_PARAMS) {
      if (searchParams.get(key)) return true
    }
    return false
  }, [searchParams])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === '') next.delete(key)
        else next.set(key, value)
      }
      if (next.get('sort') === 'nearest') {
        next.set('sort', 'highest-rated')
      }
      if (!ratingFilterEnabled) {
        next.delete('minRating')
        if (next.get('sort') === 'most-reviewed') next.set('sort', 'highest-rated')
      }
      persistFromParams(next)
      const qs = next.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, ratingFilterEnabled, router, searchParams],
  )

  function toggleChip(chip: Chip) {
    const active = searchParams.get(chip.param) === chip.value
    updateParams({ [chip.param]: active ? null : chip.value })
  }

  function clearFilters() {
    const next = new URLSearchParams(searchParams.toString())
    for (const key of FILTER_PARAMS) next.delete(key)
    writeUiPreference<ClientDiscoveryPref>(UI_PREF_KEYS.clientDiscovery, {})
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function onSortChange(v: string) {
    if (v === 'nearest' && !nearestAvailable) {
      updateParams({ sort: 'highest-rated' })
      return
    }
    updateParams({ sort: v })
  }

  const sortValue = currentSort === 'nearest' && !nearestAvailable ? 'highest-rated' : currentSort

  return (
    <div className="sticky top-0 z-20 -mx-1 bg-[#E8EEF6]/80 px-1 pb-3 pt-1 backdrop-blur-xl">
      <div className="mb-2 flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {cityOptions.map((opt) => {
          const active = city === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateParams({ city: active ? null : opt.value })}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition active:scale-95',
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/90 text-slate-600 ring-1 ring-slate-900/5',
              )}
              aria-pressed={active}
            >
              {t(opt.label)}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-0.5 pr-1 no-scrollbar">
          {chips.map((chip) => {
            const active = chipState.get(chip.key) ?? false
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => toggleChip(chip)}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition duration-150 active:scale-95',
                  active
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-white/90 text-slate-700 ring-1 ring-slate-900/5 hover:ring-[#0071E3]/25',
                )}
              >
                {chipLabels[chip.labelKey]}
              </button>
            )
          })}
        </div>

        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger
            className="h-10 w-[148px] shrink-0 rounded-full border-0 bg-white/90 text-sm shadow-none ring-1 ring-slate-900/5"
            aria-label={t({ tr: 'Sıralama', en: 'Sort' })}
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
            <SelectValue placeholder={t({ tr: 'Sırala', en: 'Sort' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="highest-rated">{t({ tr: 'Önerilen', en: 'Recommended' })}</SelectItem>
            <SelectItem value="earliest-available">{t({ tr: 'En erken müsait', en: 'Earliest available' })}</SelectItem>
            {ratingFilterEnabled ? (
              <SelectItem value="most-reviewed">{t({ tr: 'En çok yorum', en: 'Most reviewed' })}</SelectItem>
            ) : null}
            {nearestAvailable ? (
              <SelectItem value="nearest">{t({ tr: 'En yakın', en: 'Nearest' })}</SelectItem>
            ) : null}
          </SelectContent>
        </Select>

        {hasAnyFilter && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10 shrink-0 rounded-full border-0 bg-white/90 shadow-none ring-1 ring-slate-900/5"
            aria-label={t({ tr: 'Filtreleri temizle', en: 'Clear filters' })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="mt-2 px-0.5 text-[11px] leading-snug text-slate-500">
        {t({
          tr: 'Önerilen sıra: doğrulanmış hekim → gerçek müsaitlik → bölge → yorum puanı → profil tamamlığı. Mesafe sıralaması konum izni açılınca gelir; şimdilik şehir filtresi kullanın.',
          en: 'Recommended order: verified doctor → real availability → area → review score → profile completeness. Distance sort arrives with location permission; use city chips for now.',
        })}
      </p>
    </div>
  )
}
