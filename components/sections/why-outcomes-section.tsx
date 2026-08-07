'use client'

import { CalendarCheck2, LineChart, Smartphone } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'
import { revealSoft, staggerContainer } from '@/lib/animations'

export function WhyOutcomesSection() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()

  const beats = [
    {
      icon: CalendarCheck2,
      title: t({ tr: 'Sakin operasyon', en: 'Ops calm' }),
      body: t({
        tr: 'Boş slotlar azalır. Gün daha okunur olur.',
        en: 'Fewer empty slots. A day you can actually read.',
      }),
    },
    {
      icon: Smartphone,
      title: t({ tr: 'Hasta kanalı', en: 'Patient channel' }),
      body: t({
        tr: 'Hastalar sizi bulur, talep eder, hatırlatma alır.',
        en: 'Patients find you, request, and get reminded.',
      }),
    },
    {
      icon: LineChart,
      title: t({ tr: 'Ölçülen gün', en: 'Measured day' }),
      body: t({
        tr: 'Randevu ve ciroyu aynı yerden görün.',
        en: 'See appointments and revenue in one place.',
      }),
    },
  ]

  return (
    <section
      id="why"
      className="bg-[#F6F7F9] scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="why-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading
          titleId="why-heading"
          eyebrow={t({ tr: 'Neden Asistan', en: 'Why Asistan' })}
          title={t({
            tr: 'Özellik listesi değil — iş sonucu.',
            en: 'Not a feature list — business outcomes.',
          })}
          description={t({
            tr: 'Asistan Health klinik gününü sakinleştirir; Asistan Rezervasyon hastayı içeri getirir.',
            en: 'Asistan Health calms the clinic day; Asistan Booking brings patients in.',
          })}
        />
        <motion.ul
          className="mt-10 grid gap-5 md:grid-cols-3"
          variants={reduceMotion ? undefined : staggerContainer(0.04)}
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, margin: '-10%' }}
        >
          {beats.map((beat) => (
            <motion.li
              key={beat.title}
              variants={reduceMotion ? undefined : revealSoft}
              className="rounded-2xl border border-slate-200/80 bg-white p-6"
            >
              <beat.icon className="size-6 text-[#0071E3]" aria-hidden />
              <h3 className="mt-3 text-lg font-bold text-[#1D1D1F]">{beat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5D6068]">{beat.body}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
