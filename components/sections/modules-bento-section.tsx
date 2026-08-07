'use client'

import {
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LineChart,
  Smartphone,
  Stethoscope,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'
import { getClaim } from '@/lib/brand/claim-bank'
import { revealSoft, staggerContainer } from '@/lib/animations'

export function ModulesBentoSection() {
  const { t, language } = useLanguage()
  const reduceMotion = useReducedMotion()

  const modules = [
    {
      icon: CalendarDays,
      title: t({ tr: 'Online randevu', en: 'Online booking' }),
      body: t({
        tr: 'Müsaitlik gerçekten müsaitlik — public book ve panel aynı motor.',
        en: 'Availability that is real — public book and panel share one engine.',
      }),
      wide: true,
    },
    {
      icon: Stethoscope,
      title: t({ tr: 'Klinik yönetimi', en: 'Clinic management' }),
      body: t({
        tr: 'Hasta, ekip, not ve dosya — gününüz tek ekranda.',
        en: 'Patients, team, notes, and files — your day on one screen.',
      }),
    },
    {
      icon: Smartphone,
      title: t({ tr: 'Hasta mobil', en: 'Patient mobile' }),
      body: t({
        tr: 'Asistan Rezervasyon — keşif ve talep · PWA / Expo.',
        en: 'Asistan Booking — discover and request · PWA / Expo.',
      }),
    },
    {
      icon: Bell,
      title: t({ tr: 'Bildirimler', en: 'Notifications' }),
      body: getClaim('patient-channels-webhook', language),
    },
    {
      icon: LineChart,
      title: t({ tr: 'Analitik', en: 'Analytics' }),
      body: getClaim('ops-report', language),
    },
    {
      icon: CreditCard,
      title: t({ tr: 'Ödemeler', en: 'Payments' }),
      body: t({
        tr: 'Depozito yolu aşamalı — “hazır” iddiası yok.',
        en: 'Deposit path in stages — no “ready” overclaim.',
      }),
    },
    {
      icon: ClipboardList,
      title: t({ tr: 'Klinik reçete', en: 'Clinic prescription' }),
      body: t({
        tr: 'Yazdırılabilir klinik reçete taslağı — resmi reçete ağı iddiası yok.',
        en: 'Printable clinic prescription draft — no official Rx network claim.',
      }),
    },
  ]

  return (
    <section
      id="modules"
      className="bg-white scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="modules-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading
          titleId="modules-heading"
          eyebrow={t({ tr: 'Çekirdek modüller', en: 'Core modules' })}
          title={t({
            tr: 'Bugün kullandığınız klinik işletim sistemi.',
            en: 'The clinic operating system you use today.',
          })}
          description={t({
            tr: 'Yol haritası vaatleri buraya karışmaz — yalnızca sevkiyatta olanlar.',
            en: 'Roadmap aspirations stay out — only what ships.',
          })}
        />
        <motion.ul
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={reduceMotion ? undefined : staggerContainer(0.04)}
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-8%' }}
        >
          {modules.map((mod) => (
            <motion.li
              key={mod.title}
              variants={reduceMotion ? undefined : revealSoft}
              className={
                mod.wide
                  ? 'rounded-2xl border border-[#0071E3]/20 bg-[#EEF6FF]/50 p-5 sm:col-span-2 lg:col-span-3'
                  : 'rounded-2xl border border-slate-200/80 bg-[#F6F7F9]/50 p-5'
              }
            >
              <mod.icon className="size-5 text-[#0071E3]" aria-hidden />
              <h3 className="mt-3 text-base font-bold text-[#1D1D1F]">{mod.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5D6068]">{mod.body}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
