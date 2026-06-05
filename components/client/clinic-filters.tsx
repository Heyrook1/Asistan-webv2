'use client'

import { useCallback, useMemo } from 'react'
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
import { cn } from '@/lib/utils'

type Chip = {
  key: string
  label: string
  param: string
  value: string
}

const CHIPS: Chip[] = [
  { key: 'today', label: 'Available today', param: 'availableToday', value: 'true' },
  { key: 'rating', label: 'Rating 4.5+', param: 'minRating', value: '4.5' },
  { key: 'near', label: 'Within 5 km', param: 'maxDistanceKm', value: '5' },
  { key: 'budget', label: 'Under ₺1500', param: 'maxPrice', value: '1500' },
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

export function ClinicFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
    const qs = next.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="sticky top-0 z-20 -mx-4 bg-background/80 px-4 pb-3 pt-2 backdrop-blur md:mx-0 md:px-0">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-2 overflow-x-auto pb-1 pr-2 no-scrollbar">
          {CHIPS.map((chip) => {
            const active = chipState.get(chip.key) ?? false
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => toggleChip(chip)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold',
                  'transition-all duration-150 active:scale-95',
                  active
                    ? 'bg-primary text-white shadow-[0_2px_8px_rgba(14,154,167,0.3)] ring-1 ring-primary/20'
                    : 'bg-white text-foreground ring-1 ring-border hover:ring-primary/30 hover:bg-primary-soft',
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        <Select value={currentSort} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger className="h-10 w-[150px] shrink-0 rounded-xl bg-card text-sm shadow-sm">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nearest">Nearest</SelectItem>
            <SelectItem value="highest-rated">Highest rated</SelectItem>
            <SelectItem value="earliest-available">Earliest available</SelectItem>
            <SelectItem value="most-reviewed">Most reviewed</SelectItem>
          </SelectContent>
        </Select>

        {hasAnyFilter && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearFilters}
            className="h-10 w-10 shrink-0 rounded-xl bg-card shadow-sm"
            aria-label="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

