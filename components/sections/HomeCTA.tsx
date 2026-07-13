// components/sections/HomeCTA.tsx
'use client'

import Link from 'next/link'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'
import { getLoginPath, getRegisterPath } from '@/lib/auth-routes'
import { ENTRY_CTA, PATIENT_BOOK_PATH } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'

export function HomeCTA() {
  const { t, language } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
    >
      <Button
        asChild
        className="group relative h-14 w-full rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#00b4d8] px-8 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition duration-300 hover:scale-102 hover:shadow-blue-500/35 active:scale-98 sm:w-auto"
      >
        <Link href={getRegisterPath(language)} className="flex items-center justify-center gap-2">
          <span>{t(ENTRY_CTA.clinicTrial)}</span>
          <ArrowRight className="size-5 transition duration-300 group-hover:translate-x-1" />
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="h-14 w-full rounded-2xl border border-black/10 bg-white/40 px-8 text-base font-bold text-[#1D1D1F] shadow-sm backdrop-blur-md transition duration-300 hover:border-black/20 hover:bg-white/60 active:scale-98 sm:w-auto"
      >
        <Link href={PATIENT_BOOK_PATH} className="flex items-center justify-center gap-2">
          <span>{t(ENTRY_CTA.patientBook)}</span>
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className="h-12 w-full rounded-2xl px-6 text-sm font-semibold text-[#5D6068] hover:bg-white/50 hover:text-[#1D1D1F] sm:w-auto"
      >
        <Link href={getLoginPath(language)} className="flex items-center justify-center gap-2">
          <LockKeyhole className="size-4 text-[#5D6068]" />
          <span>{t(ENTRY_CTA.clinicLogin)}</span>
        </Link>
      </Button>
    </motion.div>
  )
}
