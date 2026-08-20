'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'
import { getClaim } from '@/lib/brand/claim-bank'
import { revealSoft } from '@/lib/animations'
import { cn } from '@/lib/utils'

type PhaseStatus = 'active' | 'target' | 'vision'

export function RoadmapTimelineSection() {
  const { t, language } = useLanguage()
  const reduceMotion = useReducedMotion()

  const phases: {
    phase: string
    title: string
    status: PhaseStatus
  }[] = [
    {
      phase: '1',
      title: t({
        tr: 'Klinik yönetimi · Randevu · Hasta uygulaması',
        en: 'Clinic ops · Booking · Patient app',
      }),
      status: 'active',
    },
    {
      phase: '2',
      title: getClaim('asistan-passport', language),
      status: 'target',
    },
    {
      phase: '3',
      title: t({
        tr: 'Elektronik reçete ağı (hedef)',
        en: 'Electronic prescription network (target)',
      }),
      status: 'target',
    },
    {
      phase: '4',
      title: t({ tr: 'e-Fatura (hedef)', en: 'e-Invoice (target)' }),
      status: 'target',
    },
    {
      phase: '5',
      title: t({
        tr: 'Klinik asistan — akıllı yardım (hedef)',
        en: 'Clinic assistant — smart help (target)',
      }),
      status: 'target',
    },
    {
      phase: '∞',
      title: t({
        tr: 'Ulusal dijital sağlık altyapısı (vizyon)',
        en: 'National digital health infrastructure (vision)',
      }),
      status: 'vision',
    },
  ]

  const statusLabel: Record<PhaseStatus, string> = {
    active: t({ tr: 'Aktif', en: 'Active' }),
    target: t({ tr: 'Hedef', en: 'Target' }),
    vision: t({ tr: 'Vizyon', en: 'Vision' }),
  }

  return (
    <section
      id="roadmap"
      className="bg-[#F6F7F9] scroll-mt-28 px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="roadmap-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading
          titleId="roadmap-heading"
          eyebrow={t({ tr: 'Yol haritası', en: 'Roadmap' })}
          title={t({
            tr: 'Bugün poliklinik. Yarın ekosistem.',
            en: 'Outpatient today. Ecosystem tomorrow.',
          })}
          description={t({
            tr: 'Hedef ve vizyon aşamaları sevkiyat iddiası değildir.',
            en: 'Target and vision phases are not shipping claims.',
          })}
        />

        <ol className="relative mt-12 space-y-4">
          <div
            className="absolute left-[1.15rem] top-3 bottom-3 w-px bg-slate-200 sm:left-[1.35rem]"
            aria-hidden
          />
          {phases.map((item, index) => (
            <motion.li
              key={item.phase}
              initial={reduceMotion ? false : { x: -12 }}
              whileInView={reduceMotion ? undefined : { x: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="relative flex gap-4 pl-0"
            >
              <span
                className={cn(
                  'relative z-10 mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:size-11 sm:text-sm',
                  item.status === 'active' &&
                    'bg-[#0F9F6E] text-white shadow-[0_0_0_4px_rgba(15,159,110,0.18)]',
                  item.status === 'target' && 'bg-white text-[#0071E3] ring-2 ring-[#0071E3]/25',
                  item.status === 'vision' && 'bg-slate-200 text-slate-600',
                )}
              >
                {item.phase}
              </span>
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                      item.status === 'active' && 'bg-[#0F9F6E]/12 text-[#0F9F6E]',
                      item.status === 'target' && 'bg-[#EEF6FF] text-[#0071E3]',
                      item.status === 'vision' && 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {statusLabel[item.status]}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-[#1D1D1F] sm:text-base">{item.title}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <motion.p
          variants={reduceMotion ? undefined : revealSoft}
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true }}
          className="mt-6 text-center text-xs text-slate-500"
        >
          {t({
            tr: 'Elektronik reçete, e-fatura ve ulusal altyapı — yalnızca yol haritası / vizyon.',
            en: 'Electronic prescription, e-invoice, and national infrastructure — roadmap / vision only.',
          })}
        </motion.p>
      </div>
    </section>
  )
}
