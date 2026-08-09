'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Building2,
  ClipboardList,
  Fingerprint,
  Smartphone,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { SectionHeading } from '@/components/sections/section-heading'
import { useLanguage } from '@/hooks/useLanguage'
import { getClaim } from '@/lib/brand/claim-bank'
import { PATIENT_BOOK_PATH } from '@/lib/entry-routes'
import { appleEase } from '@/lib/animations'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    icon: UserRound,
    tr: 'Hasta',
    en: 'Patient',
    hint: { tr: 'Keşif başlar', en: 'Discovery starts' },
    tone: 'slate' as const,
  },
  {
    icon: Smartphone,
    tr: 'Asistan Rezervasyon',
    en: 'Asistan Booking',
    hint: { tr: 'Talep gönderilir', en: 'Request sent' },
    tone: 'blue' as const,
  },
  {
    icon: Building2,
    tr: 'Klinik',
    en: 'Clinic',
    hint: { tr: 'Panelde görünür', en: 'Visible in panel' },
    tone: 'blue' as const,
  },
  {
    icon: Stethoscope,
    tr: 'Hekim',
    en: 'Doctor',
    hint: { tr: 'Muayene', en: 'Visit' },
    tone: 'blue' as const,
  },
  {
    icon: ClipboardList,
    tr: 'Ziyaret özeti',
    en: 'Visit summary',
    hint: { tr: 'Kayıt oluşur', en: 'Record created' },
    tone: 'emerald' as const,
  },
  {
    icon: Fingerprint,
    tr: 'Pasaport (hedef)',
    en: 'Passport (target)',
    hint: { tr: 'Yol haritası', en: 'Roadmap' },
    tone: 'dashed' as const,
  },
] as const

export function PatientJourneySection() {
  const { t, language } = useLanguage()
  const reduceMotionPref = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const inView = useInView(trackRef, { once: true, margin: '-12% 0px' })
  // Always start at -1 so SSR and first client paint both show "00" (React #418).
  const [active, setActive] = useState(-1)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  // Treat null/undefined as false until mount — never seed visible text from prefers-reduced-motion.
  const reduceMotion = mounted && reduceMotionPref === true

  useEffect(() => {
    if (!mounted || !inView) return
    if (reduceMotion) {
      setActive(STEPS.length - 1)
      return
    }

    setActive(0)
    const timers: number[] = []
    for (let i = 1; i < STEPS.length; i += 1) {
      timers.push(
        window.setTimeout(() => {
          setActive(i)
        }, i * 520),
      )
    }
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [mounted, inView, reduceMotion])

  const progress = active < 0 ? 0 : (active / (STEPS.length - 1)) * 100

  return (
    <section
      id="uygulama"
      className="relative scroll-mt-28 overflow-hidden px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="journey-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/images/rezervasyon-clinic-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.1]"
        />
        <div className="absolute inset-0 bg-[#F6F7F9]/94" />
        <div className="absolute inset-x-0 top-1/3 h-40 bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.08),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-[1180px]">
        <SectionHeading
          titleId="journey-heading"
          eyebrow={t({ tr: 'Hasta yolculuğu', en: 'Patient journey' })}
          title={t({
            tr: 'Keşiften ziyaret özetine — tek akış.',
            en: 'From discovery to visit summary — one flow.',
          })}
          description={t({
            tr: 'Hasta kanalı Asistan Rezervasyon; klinik tarafı Asistan Health.',
            en: 'Patient channel is Asistan Booking; clinic side is Asistan Health.',
          })}
        />

        {/* Filmstrip */}
        <div ref={trackRef} className="relative mt-12">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {t({ tr: 'Film şeridi', en: 'Filmstrip' })}
            </p>
            <p className="text-[11px] font-semibold tabular-nums text-[#0071E3]">
              {active < 0 ? '00' : String(active + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
            </p>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white/80 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] backdrop-blur-md">
            {/* Sprocket rail */}
            <div className="flex gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2" aria-hidden>
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 w-3 rounded-sm',
                    i <= Math.round((Math.max(active, 0) / (STEPS.length - 1)) * 23)
                      ? 'bg-[#0071E3]/55'
                      : 'bg-slate-200',
                  )}
                />
              ))}
            </div>

            <div className="relative px-3 py-6 sm:px-5 sm:py-8">
              {/* Progress line */}
              <div
                className="pointer-events-none absolute left-8 right-8 top-[4.75rem] hidden h-[2px] bg-slate-200 xl:block"
                aria-hidden
              >
                <motion.div
                  className="h-full origin-left bg-[#0071E3]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.45, ease: appleEase }}
                />
              </div>

              <ol className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] xl:grid xl:grid-cols-6 xl:overflow-visible [&::-webkit-scrollbar]:hidden">
                {STEPS.map((step, index) => {
                  const reached = active >= index
                  const isCurrent = active === index
                  const Icon = step.icon

                  return (
                    <motion.li
                      key={step.en}
                      className="relative w-[min(200px,72vw)] shrink-0 xl:w-auto"
                      initial={reduceMotion ? false : { opacity: 0, x: 28, filter: 'blur(4px)' }}
                      animate={
                        reached
                          ? { opacity: 1, x: 0, filter: 'blur(0px)' }
                          : reduceMotion
                            ? { opacity: 1, x: 0, filter: 'blur(0px)' }
                            : { opacity: 0.25, x: 16, filter: 'blur(2px)' }
                      }
                      transition={{ duration: 0.45, ease: appleEase }}
                    >
                      <div
                        className={cn(
                          'relative flex h-full min-h-[168px] flex-col rounded-2xl border bg-white p-4 transition-shadow duration-300',
                          reached ? 'shadow-md' : 'shadow-none',
                          isCurrent && 'ring-2 ring-[#0071E3]/30 shadow-[0_16px_40px_-20px_rgba(0,113,227,0.45)]',
                          step.tone === 'blue' && reached && 'border-[#0071E3]/25',
                          step.tone === 'emerald' && reached && 'border-emerald-200',
                          step.tone === 'dashed' && 'border-dashed border-[#0071E3]/45',
                          step.tone === 'slate' && reached && 'border-slate-200',
                          !reached && 'border-slate-100',
                        )}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span
                            className={cn(
                              'flex size-10 items-center justify-center rounded-xl transition-colors',
                              isCurrent
                                ? 'bg-[#0071E3] text-white'
                                : reached
                                  ? 'bg-[#EEF6FF] text-[#0071E3]'
                                  : 'bg-slate-50 text-slate-300',
                            )}
                          >
                            <Icon className="size-5" aria-hidden />
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-black tabular-nums',
                              isCurrent
                                ? 'bg-[#0071E3] text-white'
                                : reached
                                  ? 'bg-[#EEF6FF] text-[#0071E3]'
                                  : 'bg-slate-50 text-slate-300',
                            )}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <p className="text-sm font-bold leading-snug text-[#1D1D1F]">{step[language]}</p>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">
                          {step.hint[language]}
                        </p>
                        {index === STEPS.length - 1 ? (
                          <p className="mt-auto pt-3 text-[10px] leading-snug text-[#0071E3]/90">
                            {getClaim('asistan-passport', language)}
                          </p>
                        ) : (
                          <span className="mt-auto pt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                            {t({ tr: 'Kare', en: 'Frame' })} {index + 1}
                          </span>
                        )}

                        {isCurrent && !reduceMotion ? (
                          <motion.span
                            className="pointer-events-none absolute inset-0 rounded-2xl bg-[#0071E3]/5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.15, 0, 0.15] }}
                            transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
                            aria-hidden
                          />
                        ) : null}
                      </div>

                      {index < STEPS.length - 1 ? (
                        <motion.div
                          className="absolute -right-2.5 top-[3.4rem] z-10 hidden xl:flex"
                          initial={false}
                          animate={{ opacity: active > index ? 1 : 0.2, scale: active > index ? 1 : 0.85 }}
                          transition={{ duration: 0.3 }}
                          aria-hidden
                        >
                          <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#0071E3] shadow-sm ring-1 ring-[#0071E3]/20">
                            <ArrowRight className="size-3" />
                          </span>
                        </motion.div>
                      ) : null}
                    </motion.li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center">
          <Link
            href={PATIENT_BOOK_PATH}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#0071E3] px-5 text-sm font-semibold text-white transition hover:bg-[#0063C8]"
          >
            {t({ tr: 'Hasta olarak keşfet', en: 'Explore as patient' })}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  )
}
