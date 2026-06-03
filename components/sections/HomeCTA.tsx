// components/sections/HomeCTA.tsx
'use client'

import Link from 'next/link'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/hooks/useLanguage'

export function HomeCTA() {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
    >
      <Link href="/register" className="w-full sm:w-auto">
        <button
          type="button"
          className="group relative flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#00b4d8] px-8 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition duration-300 hover:scale-102 hover:shadow-blue-500/35 active:scale-98 sm:w-auto cursor-pointer"
        >
          <span>
            {t({
              tr: 'Ücretsiz Deneme Başlat',
              en: 'Start Free Trial',
            })}
          </span>
          <ArrowRight className="size-5 transition duration-300 group-hover:translate-x-1" />
        </button>
      </Link>

      <Link href="/login" className="w-full sm:w-auto">
        <button
          type="button"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/40 px-8 text-base font-bold text-[#1D1D1F] shadow-sm backdrop-blur-md transition duration-300 hover:border-black/20 hover:bg-white/60 active:scale-98 sm:w-auto cursor-pointer"
        >
          <LockKeyhole className="size-4.5 text-[#5D6068]" />
          <span>
            {t({
              tr: 'Giriş Yap',
              en: 'Login',
            })}
          </span>
        </button>
      </Link>
    </motion.div>
  )
}
