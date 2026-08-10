'use client'

import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  Building2,
  LockKeyhole,
  Link2,
  Sparkles,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

import { useLandingLocale } from '@/components/sections/landing-locale'
import {
  OUTCOME_CASES_DISCLAIMER,
  listPublicOutcomeCases,
  type PublicOutcomeCase,
} from '@/lib/brand/outcome-cases'
import type { PlatformOutcomeSnapshot } from '@/lib/trust/platform-outcomes'
import { revealSoft, staggerContainer, appleEase } from '@/lib/animations'
import { Button } from '@/components/ui/button'

const COPY = {
  tr: {
    badge: 'Pilot sonuçları',
    title: 'Üç klinik tipi. Aynı net dönüşüm.',
    description: 'Anonim erken erişim pilotları — sahte logo veya uydurma yüzde yok.',
    before: 'Önce',
    after: 'Sonra',
    cta: 'Tüm sonuçları gör',
    liveTitle: 'Canlı platform sinyali',
    liveEmpty: 'Yeterli randevu örneği birikince burada açılır.',
    liveNoShow: 'No-show oranı',
    liveSample: 'örnek',
    liveClinics: 'Aktif klinik',
    liveReviews: 'Yorum ort.',
  },
  en: {
    badge: 'Pilot outcomes',
    title: 'Three clinic types. One clear shift.',
    description: 'Anonymized early-access pilots — no fake logos or invented percentages.',
    before: 'Before',
    after: 'After',
    cta: 'See all outcomes',
    liveTitle: 'Live platform signal',
    liveEmpty: 'Unlocks once enough appointment samples exist.',
    liveNoShow: 'No-show rate',
    liveSample: 'sample',
    liveClinics: 'Active clinics',
    liveReviews: 'Review avg.',
  },
} as const

const CASE_ICONS: Record<PublicOutcomeCase['iconKey'], typeof Building2> = {
  dental: Sparkles,
  roles: LockKeyhole,
  booking: Link2,
  generic: Building2,
}

/** Split "A + B → C" headlines into before/after for faster scanning. */
function splitHeadline(headline: string): { before: string; after: string } | null {
  const parts = headline.split(/\s*→\s*/)
  if (parts.length !== 2) return null
  return { before: parts[0].trim(), after: parts[1].trim() }
}

function CaseCard({
  item,
  locale,
  beforeLabel,
  afterLabel,
}: {
  item: PublicOutcomeCase
  locale: 'tr' | 'en'
  beforeLabel: string
  afterLabel: string
}) {
  const reduceMotion = useReducedMotion()
  const Icon = CASE_ICONS[item.iconKey] ?? Building2
  const split = splitHeadline(item.headline[locale])
  // Show at most 2 metrics on the card — keep scan easy
  const metrics = item.metrics.slice(0, 2)

  return (
    <motion.article
      variants={revealSoft}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]"
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#EEF6FF] text-[#0071E3]">
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0071E3]">
            {item.clinicType[locale]}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        {split ? (
          <div className="space-y-2">
            <div className="rounded-xl bg-slate-50 px-3.5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {beforeLabel}
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug text-slate-500 line-through decoration-slate-300">
                {split.before}
              </p>
            </div>
            <div className="flex justify-center" aria-hidden>
              <span className="flex size-7 items-center justify-center rounded-full bg-[#0071E3] text-white shadow-sm shadow-[#0071E3]/30">
                <ArrowDown className="size-3.5" />
              </span>
            </div>
            <div className="rounded-xl border border-[#0071E3]/20 bg-[#EEF6FF]/70 px-3.5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#0071E3]">
                {afterLabel}
              </p>
              <p className="mt-1 text-base font-extrabold leading-snug text-[#1D1D1F]">
                {split.after}
              </p>
            </div>
          </div>
        ) : (
          <h3 className="text-lg font-extrabold leading-snug text-[#1D1D1F]">
            {item.headline[locale]}
          </h3>
        )}

        <p className="text-sm leading-relaxed text-[#5D6068]">{item.summary[locale]}</p>

        <ul className="mt-auto space-y-2">
          {metrics.map((metric) => (
            <li
              key={`${metric.label[locale]}-${metric.before}-${metric.after}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-slate-100 bg-[#FAFBFC] px-2.5 py-2.5"
            >
              <div className="min-w-0 text-left">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  {beforeLabel}
                </p>
                <p className="truncate text-[12px] font-semibold text-slate-500">{metric.before}</p>
              </div>
              <ArrowRight className="size-3.5 shrink-0 text-[#0071E3]" aria-hidden />
              <div className="min-w-0 text-right">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#0071E3]">
                  {afterLabel}
                </p>
                <p className="truncate text-[12px] font-extrabold text-[#1D1D1F]">{metric.after}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-[11px] text-slate-400">
          {item.region[locale]} · {item.period[locale]}
        </p>
      </div>
    </motion.article>
  )
}

export function OutcomeCasesSection({
  live,
  cases = listPublicOutcomeCases(),
  showDetailCta = true,
}: {
  live?: PlatformOutcomeSnapshot | null
  cases?: PublicOutcomeCase[]
  showDetailCta?: boolean
}) {
  const { locale: landingLocale } = useLandingLocale()
  const locale = landingLocale === 'en' ? 'en' : 'tr'
  const copy = COPY[locale]
  const reduceMotion = useReducedMotion()

  return (
    <section id="stories" className="relative scroll-mt-28 overflow-hidden py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,113,227,0.06),_transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-10 max-w-2xl text-center"
          variants={revealSoft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: appleEase }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">
            {copy.badge}
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#1D1D1F] md:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#5D6068]">{copy.description}</p>
        </motion.div>

        <motion.div
          className="grid gap-5 md:grid-cols-3"
          variants={reduceMotion ? undefined : staggerContainer(0.1, 0.02)}
          initial={reduceMotion ? undefined : 'hidden'}
          whileInView={reduceMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.15 }}
        >
          {cases.map((item, index) => (
            <CaseCard
              key={`${item.iconKey}-${index}`}
              item={item}
              locale={locale}
              beforeLabel={copy.before}
              afterLabel={copy.after}
            />
          ))}
        </motion.div>

        {live ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm font-bold text-[#1D1D1F]">{copy.liveTitle}</p>
            {live.ready && live.noShowRatePct != null ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.liveNoShow}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1D1D1F]">%{live.noShowRatePct}</p>
                  <p className="text-[11px] text-slate-500">
                    {live.sampleSize} {copy.liveSample}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.liveClinics}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1D1D1F]">{live.activeClinics}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {copy.liveReviews}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#1D1D1F]">
                    {live.averageRating != null ? live.averageRating.toFixed(1) : '—'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">{copy.liveEmpty}</p>
            )}
          </div>
        ) : null}

        <p className="mx-auto mt-6 max-w-2xl text-center text-[11px] leading-5 text-slate-400">
          {OUTCOME_CASES_DISCLAIMER[locale]}
        </p>

        {showDetailCta ? (
          <div className="mt-8 text-center">
            <Button asChild className="rounded-xl bg-[#0071E3] text-white hover:bg-[#0063C8]">
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
