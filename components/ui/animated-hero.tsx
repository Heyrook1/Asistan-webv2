'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { appleEase } from '@/lib/animations'

interface AnimatedHeroProps {
  badge?: string
  headline: string
  subheadline: string
}

export function AnimatedHero({
  badge = 'Asistan Health',
  headline,
  subheadline,
}: AnimatedHeroProps) {
  const words = useMemo(() => headline.split(' '), [headline])

  return (
    <div className="mx-auto max-w-5xl text-center">
      <motion.p
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: appleEase }}
        className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.19em] text-[#0071E3] backdrop-blur-md"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {badge}
      </motion.p>

      <h1 className="text-balance font-display text-[clamp(2.2rem,7vw,5.7rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-[#1D1D1F]">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            initial={false}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.6,
              delay: 0.04 * index,
              ease: appleEase,
            }}
            className="mr-[0.28em] inline-block"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28, ease: appleEase }}
        className="mx-auto mt-6 max-w-3xl text-balance text-[clamp(1rem,2.3vw,1.35rem)] leading-relaxed text-[#4B4C52]"
      >
        {subheadline}
      </motion.p>
    </div>
  )
}
