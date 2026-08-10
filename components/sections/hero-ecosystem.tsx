'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { AsistanLogo } from '@/components/asistan-logo'
import { HomeCTA } from '@/components/sections/HomeCTA'
import {
  BookingPhoneMock,
  ClinicDashboardMock,
} from '@/components/sections/landing-device-mocks'
import { useLanguage } from '@/hooks/useLanguage'
import { getClaim } from '@/lib/brand/claim-bank'

export function HeroEcosystem() {
  const { t, language } = useLanguage()
  const reduceMotion = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  })
  const dashY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [12, -12])
  const phoneY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-10, 14])
  const phoneRotate = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-2, 2])

  const stats = [
    {
      label: t({ tr: 'Odak', en: 'Focus' }),
      value: t({ tr: 'KKTC poliklinik', en: 'KKTC outpatient' }),
    },
    {
      label: t({ tr: 'Aşama', en: 'Stage' }),
      value: getClaim('early-access', language),
    },
    {
      label: t({ tr: 'Güven', en: 'Trust' }),
      value: getClaim('kvkk-controls', language),
    },
  ]

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden px-4 pb-20 pt-8 sm:px-6 lg:pb-28 lg:pt-10"
      aria-labelledby="hero-heading"
    >
      {/* Full-bleed atmosphere plane */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/images/rezervasyon-clinic-hero.jpg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[center_35%] opacity-[0.34] sm:opacity-[0.42]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,#F6F7F9_0%,rgba(246,247,249,0.92)_38%,rgba(246,247,249,0.55)_58%,rgba(246,247,249,0.78)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_35%,rgba(0,113,227,0.22),transparent_52%)]" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#0071E3]/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <AsistanLogo size="lg" priority />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#0071E3]">
            Asistan Health
          </p>
          <h1
            id="hero-heading"
            className="mt-3 max-w-xl font-display text-[2rem] font-extrabold leading-[1.12] tracking-tight text-[#1D1D1F] sm:text-5xl lg:text-[3.25rem]"
          >
            {t({
              tr: 'Klinik gününüzü sakinleştiren dijital sağlık altyapısı.',
              en: 'The digital clinic layer that calms your day.',
            })}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[#5D6068] sm:text-lg">
            {t({
              tr: 'Randevu, hasta ve ekip — tek panelde. Hastalar Asistan Rezervasyon ile gelir.',
              en: 'Scheduling, patients, and team — one panel. Patients arrive via Asistan Booking.',
            })}
          </p>
          <HomeCTA />
          <ul className="mt-10 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <li
                key={stat.label}
                className="rounded-2xl border border-white/80 bg-white/80 px-3 py-3 text-left shadow-sm backdrop-blur-md"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm font-bold leading-snug text-[#1D1D1F]">{stat.value}</p>
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={stageRef}
          className="relative mx-auto w-full max-w-[560px] pb-10 pt-4 lg:max-w-none lg:pb-6"
        >
          {/* Soft stage plate under devices */}
          <div
            className="pointer-events-none absolute inset-x-6 bottom-2 top-16 rounded-[2.5rem] bg-gradient-to-b from-white/50 to-transparent blur-sm sm:inset-x-10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.16),transparent_65%)]"
            aria-hidden
          />

          <motion.div
            style={{ y: dashY }}
            className="relative z-10"
            initial={reduceMotion ? false : { y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ClinicDashboardMock lang={language === 'en' ? 'en' : 'tr'} className="w-full" />
          </motion.div>

          <motion.div
            style={{ y: phoneY, rotate: phoneRotate }}
            className="absolute -bottom-2 right-0 z-20 w-[42%] min-w-[132px] max-w-[190px] sm:right-3 sm:min-w-[148px] md:right-6"
            initial={reduceMotion ? false : { y: 36, scale: 0.94 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <BookingPhoneMock lang={language === 'en' ? 'en' : 'tr'} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
