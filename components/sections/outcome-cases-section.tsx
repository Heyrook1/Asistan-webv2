'use client'

import Link from 'next/link'
import { ArrowRight, ArrowRightLeft } from 'lucide-react'
import { motion } from 'framer-motion'

import { useLandingLocale } from '@/components/sections/landing-locale'
import {
  OUTCOME_CASES_DISCLAIMER,
  listPublishedOutcomeCases,
  type OutcomeCase,
} from '@/lib/brand/outcome-cases'
import type { PlatformOutcomeSnapshot } from '@/lib/trust/platform-outcomes'
import { revealSoft, staggerContainer, appleEase } from '@/lib/animations'
import { Button } from '@/components/ui/button'

const COPY = {
  tr: {
    badge: 'Ölçülen operasyon',
    title: 'KKTC pilot sonuç çerçeveleri',
    description:
      'Sahte logo yok. Anonim süreç pilotları: tek ajanda, rol erişimi, genel randevu linki — yüzdelik no-show/NPS yalnızca imzalı kayıtla eklenir.',
    before: 'Önce',
    after: 'Sonra',
    cta: 'Tüm sonuç çerçevesini gör',
    liveTitle: 'Canlı platform sinyali',
    liveEmpty: 'Yeterli randevu örneği birikince platform no-show oranı burada açılır.',
    liveNoShow: 'Platform no-show oranı',
    liveSample: 'örnek (tamamlanan + gelinmedi)',
    liveClinics: 'Aktif klinik',
    liveReviews: 'Doğrulanmış yorum ort.',
  },
  en: {
    badge: 'Measured operations',
    title: 'Northern Cyprus pilot outcome frames',
    description:
      'No fake logos. Anonymized process pilots: one agenda, role access, public book link — percentage no-show/NPS only via signed records.',
    before: 'Before',
    after: 'After',
    cta: 'See full outcomes page',
    liveTitle: 'Live platform signal',
    liveEmpty: 'Platform no-show rate unlocks once enough appointment samples exist.',
    liveNoShow: 'Platform no-show rate',
    liveSample: 'sample (completed + no-show)',
    liveClinics: 'Active clinics',
    liveReviews: 'Verified review avg.',
  },
} as const

function CaseCard({
  item,
  locale,
  beforeLabel,
  afterLabel,
}: {
  item: OutcomeCase
  locale: 'tr' | 'en'
  beforeLabel: string
  afterLabel: string
}) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]">
        {item.clinicType[locale]}
      </p>
      <h3 className="mt-2 text-lg font-bold leading-snug text-[#1D1D1F]">{item.headline[locale]}</h3>
      <p className="mt-1 text-xs text-slate-500">
        {item.region[locale]} · {item.period[locale]}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary[locale]}</p>

      <ul className="mt-5 space-y-3">
        {item.metrics.map((metric) => (
          <li key={metric.id} className="rounded-2xl border border-slate-100 bg-[#F8FAFC] px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {metric.label[locale]}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-[#1D1D1F]">
              <span className="text-slate-500">
                <span className="text-[10px] font-medium uppercase text-slate-400">{beforeLabel}</span>{' '}
                {metric.before}
              </span>
              <ArrowRightLeft className="size-3.5 shrink-0 text-[#0071E3]" aria-hidden />
              <span>
                <span className="text-[10px] font-medium uppercase text-[#0071E3]">{afterLabel}</span>{' '}
                {metric.after}
              </span>
            </div>
            {metric.note ? <p className="mt-1 text-[11px] text-slate-500">{metric.note[locale]}</p> : null}
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-4 text-[11px] leading-4 text-slate-400">{item.sourceLabel[locale]}</p>
    </article>
  )
}

export function OutcomeCasesSection({
  live,
  cases = listPublishedOutcomeCases(),
  showDetailCta = true,
}: {
  live?: PlatformOutcomeSnapshot | null
  cases?: OutcomeCase[]
  /** Hide “full page” CTA when already on /sonuclar */
  showDetailCta?: boolean
}) {
  const { locale: landingLocale } = useLandingLocale()
  const locale = landingLocale === 'en' ? 'en' : 'tr'
  const copy = COPY[locale]

  return (
    <section id="sonuclar" className="relative overflow-hidden py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,113,227,0.06),_transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-10 max-w-3xl text-center"
          variants={revealSoft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: appleEase }}
        >
          <p className="mb-4 inline-block rounded-full bg-[#0071E3]/10 px-4 py-1.5 text-sm font-bold text-[#0071E3]">
            {copy.badge}
          </p>
          <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] md:text-5xl">{copy.title}</h2>
          <p className="mt-5 text-base leading-7 text-slate-600">{copy.description}</p>
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-3"
          variants={staggerContainer(0.08, 0.02)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {cases.map((item) => (
            <motion.div key={item.id} variants={revealSoft}>
              <CaseCard item={item} locale={locale} beforeLabel={copy.before} afterLabel={copy.after} />
            </motion.div>
          ))}
        </motion.div>

        {live ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm font-bold text-[#1D1D1F]">{copy.liveTitle}</p>
            {live.ready && live.noShowRatePct != null ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.liveNoShow}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1D1D1F]">%{live.noShowRatePct}</p>
                  <p className="text-[11px] text-slate-500">
                    {live.sampleSize} {copy.liveSample}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.liveClinics}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1D1D1F]">{live.activeClinics}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.liveReviews}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1D1D1F]">
                    {live.averageRating != null ? live.averageRating.toFixed(1) : '—'}
                  </p>
                  <p className="text-[11px] text-slate-500">{live.reviewCount} kayıt</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">{copy.liveEmpty}</p>
            )}
          </div>
        ) : null}

        <p className="mx-auto mt-6 max-w-3xl text-center text-[11px] leading-5 text-slate-400">
          {OUTCOME_CASES_DISCLAIMER[locale]}
        </p>

        {showDetailCta ? (
          <div className="mt-8 text-center">
            <Button asChild className="rounded-xl bg-[#0071E3] text-white hover:bg-[#0071E3]/90">
              <Link href="/sonuclar">
                {copy.cta}
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
