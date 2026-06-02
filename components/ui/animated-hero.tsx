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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 35, 
      filter: 'blur(4px)',
      scale: 0.96 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 0.8,
        ease: appleEase,
      },
    },
  }

  return (
    <div className="mx-auto max-w-5xl text-center select-none">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: appleEase } }
        }}
        className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/72 px-4.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0071E3] backdrop-blur-md shadow-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        {badge}
      </motion.div>

      <motion.h1
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={containerVariants}
        className="text-balance font-display text-[clamp(2.2rem,6.8vw,5.2rem)] font-bold leading-[1.05] tracking-[-0.035em] text-[#1D1D1F]"
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-1 mr-[0.26em]">
            <motion.span
              variants={wordVariants}
              className="inline-block origin-bottom"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.45, ease: appleEase }}
        className="mx-auto mt-7 max-w-3xl text-balance text-[clamp(1.05rem,2.1vw,1.3rem)] leading-relaxed text-[#4B4C52] font-medium"
      >
        {subheadline}
      </motion.p>
    </div>
  )
}
