'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const QUICK_CHIPS = [
  { label: 'Available today', params: { availableToday: 'true' } },
  { label: 'Rating 4.5+', params: { minRating: '4.5' } },
  { label: 'Within 5 km', params: { maxDistanceKm: '5' } },
] as const

export function ClientSearchHero() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const canSubmit = useMemo(() => query.trim().length > 0, [query])

  function submit(extra?: Record<string, string>) {
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (extra) {
      for (const [key, value] of Object.entries(extra)) params.set(key, value)
    }
    const qs = params.toString()
    router.push(qs ? `/client/clinics?${qs}` : '/client/clinics')
  }

  return (
    <main className="space-y-5 md:space-y-8">
      <header className="space-y-3">
        <p className="inline-flex w-fit items-center rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          Patient booking
        </p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Book the right clinic, fast.
        </h1>
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground md:text-base">
          Compare ratings, prices, and the earliest available appointments in one place.
        </p>
      </header>

      <section className="rounded-2xl border bg-card p-3 shadow-sm md:p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="space-y-3"
        >
          <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 search-glow">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Dermatology, dentist, MRI..."
                inputMode="search"
              />
            </div>

            <Button
              type="submit"
              className={cn(
                'h-11 rounded-xl px-5 font-semibold shadow-sm transition',
                'active:scale-[0.99]',
              )}
              disabled={!canSubmit}
            >
              Search clinics
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 pr-1 no-scrollbar">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => submit(chip.params)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold',
                  'bg-white text-foreground ring-1 ring-border transition-all duration-150',
                  'hover:ring-primary/30 hover:bg-primary-soft active:scale-95',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          { title: 'Verified clinics', desc: 'Transparent ratings and reviews.' },
          { title: 'Real availability', desc: 'See the earliest open slots.' },
          { title: 'Price range', desc: 'Compare before you book.' },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_2px_12px_rgba(14,154,167,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(14,154,167,0.1)]">
            <p className="text-[15px] font-bold leading-snug text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

