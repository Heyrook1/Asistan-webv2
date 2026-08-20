'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { getRegisterPath } from '@/lib/auth-routes'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'

export function FinalCtaBand() {
  const { t, language } = useLanguage()

  return (
    <section
      id="cta"
      className="relative scroll-mt-28 overflow-hidden bg-white px-4 py-20 sm:px-6 lg:py-24"
      aria-labelledby="final-cta-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,113,227,0.14),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">
          Asistan Health
        </p>
        <h2
          id="final-cta-heading"
          className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-4xl"
        >
          {t({
            tr: 'Klinik gününüzü dijitale taşıyın.',
            en: 'Take your clinic day digital.',
          })}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#5D6068]">
          {t({
            tr: 'Hemen denemeye başlayın; ihtiyaç olursa ekiple 20 dakikalık bir demo planlayın.',
            en: 'Start a trial now, then plan a 20-minute demo with the team if you need one.',
          })}
        </p>

        <div
          data-testid="home-final-conversion-ctas"
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            variant="ctaPrimary"
            className="h-14 min-w-[14rem] rounded-2xl px-8 text-base font-bold"
          >
            <Link href={getRegisterPath(language)} data-cta-priority="primary" className="flex items-center gap-2">
              {t(ENTRY_CTA.clinicTrial)}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="ctaSecondary"
            className="h-14 min-w-[14rem] rounded-2xl px-6 text-base font-semibold"
          >
            <Link href={DEMO_CONTACT_PATH} data-cta-priority="secondary">
              {t(ENTRY_CTA.demoRequest)}
            </Link>
          </Button>
        </div>

        <p className="mt-5 text-sm text-[#5D6068]">
          <Link
            href="/fiyatlandirma"
            className="font-semibold text-[#1D1D1F] underline-offset-4 hover:text-[#0071E3] hover:underline"
          >
            {t({ tr: 'Fiyatlandırmayı incele', en: 'Review pricing' })}
          </Link>
        </p>
      </div>
    </section>
  )
}
