'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/useLanguage'
import { getClinicTrialPath } from '@/lib/entry-routes'
import { markPwaEngagement } from '@/lib/pwa/engagement'
import { cn } from '@/lib/utils'

export function ClientSearchHero() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [query, setQuery] = useState('')

  const canSubmit = useMemo(() => query.trim().length > 0, [query])

  const quickChips = [
    { label: t({ tr: 'Bugün müsait', en: 'Available today' }), params: { availableToday: 'true' } },
    { label: t({ tr: 'Lefkoşa', en: 'Nicosia' }), params: { city: 'Lefkoşa' } },
    { label: t({ tr: 'Girne', en: 'Kyrenia' }), params: { city: 'Girne' } },
  ] as const

  const highlights = [
    {
      title: t({ tr: 'Doğrulanmış klinikler', en: 'Verified clinics' }),
      desc: t({
        tr: 'Lisans bilgisi olan hekimler öne çıkar.',
        en: 'Clinicians with license details rank higher.',
      }),
    },
    {
      title: t({ tr: 'Gerçek müsaitlik', en: 'Real availability' }),
      desc: t({ tr: 'En erken açık saatleri görün.', en: 'See the earliest open slots.' }),
    },
    {
      title: t({ tr: 'Fiyat aralığı', en: 'Price range' }),
      desc: t({ tr: 'Randevu almadan önce karşılaştırın.', en: 'Compare before you book.' }),
    },
  ]

  function submit(extra?: Record<string, string>) {
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (extra) {
      for (const [key, value] of Object.entries(extra)) params.set(key, value)
    }
    markPwaEngagement('clinic_search')
    const qs = params.toString()
    router.push(qs ? `/client/clinics?${qs}` : '/client/clinics')
  }

  return (
    <main className="space-y-5 md:space-y-8">
      <header className="space-y-3">
        <p className="inline-flex w-fit items-center rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          {t({ tr: 'Hasta randevusu', en: 'Patient booking' })}
        </p>
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          {t({ tr: 'Doğru kliniği hızlı bulun.', en: 'Book the right clinic, fast.' })}
        </h1>
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground md:text-base">
          {t({
            tr: 'Asistan ile klinik bul — müsaitlik, bölge ve doğrulanmış profilleri karşılaştırın. Klinik paneli ile aynı ekosistem.',
            en: 'Find clinics with Asistan — compare availability, area, and verified profiles. Same ecosystem as the clinic panel.',
          })}
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
                placeholder={t({
                  tr: 'Dermatoloji, diş, MR...',
                  en: 'Dermatology, dentist, MRI...',
                })}
                inputMode="search"
                aria-label={t({ tr: 'Klinik ara', en: 'Search clinics' })}
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
              {t({ tr: 'Klinik ara', en: 'Search clinics' })}
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 pr-1 no-scrollbar">
            {quickChips.map((chip) => (
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
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_2px_12px_rgba(14,154,167,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(14,154,167,0.1)]"
          >
            <p className="text-[15px] font-bold leading-snug text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </section>

      <p className="text-center text-sm text-muted-foreground">
        {t({ tr: 'Klinik misiniz? ', en: 'Are you a clinic? ' })}
        <Link
          href={getClinicTrialPath(language)}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          {t({ tr: 'Panel denemesini başlatın', en: 'Start the clinic trial' })}
        </Link>
      </p>
    </main>
  )
}
