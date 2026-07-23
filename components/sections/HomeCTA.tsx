// components/sections/HomeCTA.tsx
'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { ENTRY_CTA } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'
import {
  formatPublicPlanPrice,
  listPublicMarketingPlanCards,
  publicPlanDisplayName,
  publicPlanMonthlyAmount,
} from '@/lib/pricing/public-catalog'

/** Hero CTA budget: one primary + risk reducer + price teaser (matrix Fiyat). */
export function HomeCTA() {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en' : 'tr'
  const starter =
    listPublicMarketingPlanCards().find((p) => p.code === 'STARTER') ??
    listPublicMarketingPlanCards()[0]
  const starterAmount = starter ? publicPlanMonthlyAmount(starter, 'monthly') : null
  const starterName = starter ? publicPlanDisplayName(starter, locale) : 'Starter'
  const starterPrice = formatPublicPlanPrice(starterAmount, locale)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 flex w-full max-w-md flex-col items-center gap-3"
    >
      <Button
        asChild
        className="group relative h-14 w-full rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#2563EB] px-8 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition duration-300 hover:scale-102 hover:shadow-blue-500/35 active:scale-98 sm:w-auto sm:min-w-[16rem]"
      >
        <Link href={getRegisterPath(language)} className="flex items-center justify-center gap-2">
          <span>{t(ENTRY_CTA.clinicTrial)}</span>
          <ArrowRight className="size-5 transition duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      </Button>

      <p className="max-w-sm text-center text-sm font-medium text-[#5D6068]">
        {t(ENTRY_CTA.clinicTrialRiskReducer)}
      </p>

      <p className="text-center text-sm text-[#5D6068]">
        <Link
          href="#pricing"
          className="font-semibold text-[#1D1D1F] underline-offset-4 hover:text-[#0071E3] hover:underline"
        >
          {t({
            tr: `${starterName} ${starterPrice}/ay · 14 gün, kart yok`,
            en: `${starterName} ${starterPrice}/mo · 14 days, no card`,
          })}
        </Link>
      </p>

      <p className="text-center text-sm text-[#5D6068]">
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
