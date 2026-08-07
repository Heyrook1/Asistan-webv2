'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'

/** Hero CTA budget: primary demo + secondary trial + login chip. */
export function HomeCTA() {
  const { t, language } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 flex w-full max-w-lg flex-col items-center gap-3 sm:items-start"
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          asChild
          className="group relative h-14 w-full rounded-2xl bg-[#0071E3] px-8 text-base font-bold text-white shadow-lg shadow-[#0071E3]/25 transition duration-300 hover:bg-[#0063C8] hover:shadow-[#0071E3]/35 active:scale-[0.98] sm:w-auto sm:min-w-[14rem]"
        >
          <Link href={DEMO_CONTACT_PATH} className="flex items-center justify-center gap-2">
            <span>{t(ENTRY_CTA.demoRequest)}</span>
            <ArrowRight className="size-5 transition duration-300 group-hover:translate-x-1" aria-hidden />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-14 w-full rounded-2xl border-[#0071E3]/25 bg-white/80 px-6 text-base font-semibold text-[#1D1D1F] backdrop-blur-sm hover:bg-[#EEF6FF] hover:text-[#0071E3] sm:w-auto"
        >
          <Link href={getRegisterPath(language)}>{t(ENTRY_CTA.clinicTrial)}</Link>
        </Button>
      </div>

      <p className="max-w-md text-center text-sm font-medium text-[#5D6068] sm:text-left">
        {t(ENTRY_CTA.demoRiskReducer)}
        {' · '}
        {t(ENTRY_CTA.clinicTrialRiskReducer)}
      </p>

      <p className="text-center text-sm text-[#5D6068] sm:text-left">
        <Link
          href="/fiyatlandirma"
          className="font-semibold text-[#1D1D1F] underline-offset-4 hover:text-[#0071E3] hover:underline"
        >
          {t({ tr: 'Fiyatlandırmayı gör', en: 'See pricing' })}
        </Link>
        {' · '}
        <Link
          href={getLoginPath(language)}
          className="font-semibold text-[#5D6068] underline-offset-4 hover:text-[#1D1D1F] hover:underline"
        >
          {t(ENTRY_CTA.clinicLogin)}
        </Link>
      </p>
    </motion.div>
  )
}
