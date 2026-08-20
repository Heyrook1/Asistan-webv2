'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'

/** Hero CTA budget: primary trial + secondary demo + login chip. */
export function HomeCTA() {
  const { t, language } = useLanguage()

  return (
    <motion.div
      data-testid="home-hero-conversion-ctas"
      initial={{ y: 12 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 flex w-full max-w-lg flex-col items-center gap-4 sm:items-start"
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          asChild
          variant="ctaPrimary"
          className="group relative h-auto min-h-14 w-full !whitespace-normal rounded-2xl px-8 py-3 text-sm font-bold leading-tight sm:h-14 sm:min-h-0 sm:whitespace-nowrap sm:py-2 sm:text-base sm:w-auto sm:min-w-[14rem]"
        >
          <Link
            href={getRegisterPath(language)}
            data-cta-priority="primary"
            className="flex items-center justify-center gap-2"
          >
            <span className="min-w-0">{t(ENTRY_CTA.clinicTrial)}</span>
            <ArrowRight className="size-5 transition duration-[var(--motion-interaction-duration)] ease-[var(--motion-interaction-ease)] group-hover:translate-x-1" aria-hidden />
          </Link>
        </Button>

        <Button
          asChild
          variant="ctaSecondary"
          className="h-14 w-full rounded-2xl bg-white/95 px-6 text-base font-semibold sm:w-auto"
        >
          <Link href={DEMO_CONTACT_PATH} data-cta-priority="secondary">
            {t(ENTRY_CTA.demoRequest)}
          </Link>
        </Button>
      </div>

      <p className="max-w-md text-center text-sm font-medium text-[#6B7280] sm:text-left">
        {t(ENTRY_CTA.clinicTrialRiskReducer)}
        {' · '}
        {t(ENTRY_CTA.demoRiskReducer)}
      </p>

      <p className="text-center text-sm text-[#6B7280] sm:text-left">
        <Link
          href="/fiyatlandirma"
          className="font-semibold text-[#1D1D1F] underline-offset-4 hover:text-[#0071E3] hover:underline"
        >
          {t({ tr: 'Fiyatlandırmayı gör', en: 'See pricing' })}
        </Link>
        {' · '}
        <Link
          href={getLoginPath(language)}
          className="font-semibold text-[#6B7280] underline-offset-4 hover:text-[#1D1D1F] hover:underline"
        >
          {t(ENTRY_CTA.clinicLogin)}
        </Link>
      </p>
    </motion.div>
  )
}
