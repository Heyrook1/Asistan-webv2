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

const CHIPS: Chip[] = [
  { key: 'today', labelKey: 'today', param: 'availableToday', value: 'true' },
  { key: 'rating', labelKey: 'rating', param: 'minRating', value: '4.5' },
  // maxDistanceKm (5 km) hidden until client location permission is wired (Faz 2).
  { key: 'budget', labelKey: 'budget', param: 'maxPrice', value: '1500' },
]

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

export function ClinicFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const restored = useRef(false)

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
    const saved = readUiPreference<ClientDiscoveryPref>(UI_PREF_KEYS.clientDiscovery)
    if (!saved) return
    const next = new URLSearchParams(searchParams.toString())
    let changed = false
    if (saved.sort) {
      next.set('sort', saved.sort)
      changed = true
    }
    if (saved.availableToday) {
      next.set('availableToday', 'true')
      changed = true
    }
    if (saved.minRating) {
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
  }, [pathname, router, searchParams])

  const currentSort = searchParams.get('sort') ?? 'nearest'

  const chipState = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const chip of CHIPS) {
      map.set(chip.key, searchParams.get(chip.param) === chip.value)
    }
    return map
  }, [searchParams])

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
      persistFromParams(next)
      const qs = next.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams],
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

  return (
    <div className="sticky top-0 z-20 -mx-1 bg-[#E8EEF6]/80 px-1 pb-3 pt-1 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-0.5 pr-1 no-scrollbar">
          {CHIPS.map((chip) => {
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

        <Select value={currentSort} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger
            className="h-10 w-[140px] shrink-0 rounded-full border-0 bg-white/90 text-sm shadow-none ring-1 ring-slate-900/5"
            aria-label={t({ tr: 'Sıralama', en: 'Sort' })}
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
            <SelectValue placeholder={t({ tr: 'Sırala', en: 'Sort' })} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nearest">{t({ tr: 'En yakın', en: 'Nearest' })}</SelectItem>
            <SelectItem value="highest-rated">{t({ tr: 'En yüksek puan', en: 'Highest rated' })}</SelectItem>
            <SelectItem value="earliest-available">{t({ tr: 'En erken müsait', en: 'Earliest available' })}</SelectItem>
            <SelectItem value="most-reviewed">{t({ tr: 'En çok yorum', en: 'Most reviewed' })}</SelectItem>
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
    </div>
  )
}
