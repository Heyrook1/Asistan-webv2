'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  CalendarClock,
  Clock3,
  Smartphone,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { Button } from '@/components/ui/button'
import { AnimatedHero } from '@/components/ui/animated-hero'
import { GlassCard } from '@/components/ui/glass-card'
import { appleEase, orbFloatTransition, revealSoft } from '@/lib/animations'

type HeroStory = {
  title: string
  problem: string
  solution: string
  impact: string
  icon: 'clock' | 'bell' | 'patient' | 'growth'
}

const iconMap = {
  clock: Clock3,
  bell: Bell,
  patient: UserRoundCheck,
  growth: TrendingUp,
} as const

const HERO_COPY = {
  tr: {
    headline: 'Klinik operasyonlarında modern, güvenilir ve hızlı deneyim',
    subheadline:
      'Klinikler ve hastalar için eksiksiz ekosistem: web panel + mobil uygulama (yakında). Kliniğinizi profesyonelce yönetin, hastalar saniyeler içinde randevu oluştursun.',
    startTrial: 'Ücretsiz Deneyin',
    joinPatient: 'Hasta Olarak Katıl',
    ribbon: 'Günlük sorunları çözen akıllı vitrin',
    stories: [
      {
        title: 'Ön masada telefon trafiği',
        problem: 'Yoğun saatlerde gelen aramalar randevu akışını yavaşlatıyor.',
        solution: 'Asistan Rezervasyon ile hastalar uygun saatleri doğrudan uygulamadan seçiyor.',
        impact: 'Daha az çağrı, daha yüksek doluluk',
        icon: 'clock',
      },
      {
        title: 'No-show ve geç kalmalar',
        problem: 'Hatırlatma eksikliği nedeniyle randevu kayıpları yaşanıyor.',
        solution: 'Otomatik bildirim ve hatırlatma akışı ile hastalar zamanında bilgilendiriliyor.',
        impact: 'Daha düzenli ajanda',
        icon: 'bell',
      },
      {
        title: 'Doğru doktoru bulamayan hastalar',
        problem: 'Hastalar hizmet, puan ve uzmanlık kıyaslamasında zorlanıyor.',
        solution: 'Doktor/klinik profilleri, yorumlar ve filtrelerle doğru eşleşme hızlanıyor.',
        impact: 'Daha iyi hasta deneyimi',
        icon: 'patient',
      },
      {
        title: 'Büyüme fırsatlarının kaçırılması',
        problem: 'Klinikler talep trendlerini net okuyamadığı için kapasiteyi verimli planlayamıyor.',
        solution: 'Paneldeki analizler ve canlı randevu akışıyla kararlar veri odaklı alınıyor.',
        impact: 'Öngörülebilir gelir artışı',
        icon: 'growth',
      },
    ] as HeroStory[],
    dashboard: 'Klinik Paneli',
    newBookings: '18 yeni randevu',
    appTitle: 'Asistan Rezervasyon',
    dermatology: 'Dermatoloji',
    live: 'Canlı',
    nearby: 'Yakındaki 4 klinik · 2 anlık uygunluk',
    oneTap: 'Tek dokunuşla randevu',
    reminders: 'Hatırlatma bildirimleri',
  },
  en: {
    headline: 'Healthcare operations, elevated by one connected platform',
    subheadline:
      'The complete ecosystem for clinics and patients - web dashboard + mobile app (coming soon). Run your clinic with confidence and let patients book care in seconds.',
    startTrial: 'Start Free Trial',
    joinPatient: 'Join as Patient',
    ribbon: 'Smart showcase for everyday clinic problems',
    stories: [
      {
        title: 'Front desk call overload',
        problem: 'High call volume slows down appointment flow during peak hours.',
        solution: 'With Asistan Rezervasyon, patients pick available slots directly in the app.',
        impact: 'Fewer calls, higher slot utilization',
        icon: 'clock',
      },
      {
        title: 'No-shows and delays',
        problem: 'Missed reminders lead to avoidable appointment loss.',
        solution: 'Automated reminders keep patients informed before each visit.',
        impact: 'More predictable daily schedule',
        icon: 'bell',
      },
      {
        title: 'Patients can’t find the right doctor',
        problem: 'Comparing service quality and expertise is difficult.',
        solution: 'Profiles, ratings, and filters speed up better clinic-doctor matching.',
        impact: 'Higher patient confidence',
        icon: 'patient',
      },
      {
        title: 'Growth opportunities are missed',
        problem: 'Demand patterns are hard to read without consistent visibility.',
        solution: 'Dashboard analytics and live booking flow support data-driven decisions.',
        impact: 'More reliable revenue growth',
        icon: 'growth',
      },
    ] as HeroStory[],
    dashboard: 'Clinic Dashboard',
    newBookings: '18 new bookings',
    appTitle: 'Asistan Rezervasyon',
    dermatology: 'Dermatology',
    live: 'Live',
    nearby: '4 clinics nearby - 2 instant slots',
    oneTap: 'Book in 1 tap',
    reminders: 'Reminder alerts',
  },
} as const

export function HeroSection() {
  const { locale } = useLandingLocale()
  const copy = HERO_COPY[locale]
  const stories = useMemo(() => copy.stories, [copy.stories])
  const [activeStory, setActiveStory] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStory((prev) => (prev + 1) % stories.length)
    }, 4800)

    return () => window.clearInterval(timer)
  }, [stories.length])

  const active = stories[activeStory]
  const ActiveIcon = iconMap[active.icon]

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-34 sm:px-6 lg:pb-24 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,113,227,0.14),transparent_54%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-18 top-28 h-52 w-52 rounded-full bg-[#0071E3]/16 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
        transition={orbFloatTransition}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-44 h-60 w-60 rounded-full bg-cyan-200/30 blur-3xl"
        animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
        transition={{ ...orbFloatTransition, duration: 8.2 }}
      />

      <div className="mx-auto w-full max-w-[1220px]">
        <AnimatedHero headline={copy.headline} subheadline={copy.subheadline} badge="Asistan Health" />

        <motion.div
          variants={revealSoft}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-12% 0px -10% 0px' }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild className="h-12 rounded-2xl bg-[#0071E3] px-6 text-sm font-semibold text-white hover:bg-[#0063C8] active:scale-[0.98]">
            <Link href="/auth/sign-up">
              {copy.startTrial}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-2xl border-black/10 bg-white/75 px-6 text-sm font-semibold text-[#1D1D1F] backdrop-blur-md active:scale-[0.98]"
          >
            <a href="#waitlist">{copy.joinPatient}</a>
          </Button>
        </motion.div>

        <motion.div
          variants={revealSoft}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mx-auto mt-7 max-w-4xl"
        >
          <GlassCard className="border-[#0071E3]/15 p-4 sm:p-5" tone="accent">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0071E3]/20 bg-[#EEF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0071E3]">
              <Sparkles className="h-3.5 w-3.5" />
              {copy.ribbon}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${locale}-${activeStory}`}
                initial={false}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                transition={{ duration: 0.36, ease: appleEase }}
                className="grid gap-4 md:grid-cols-[auto_1fr]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071E3]/12 text-[#0071E3]">
                  <ActiveIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.1em] text-[#0071E3]">{active.title}</p>
                  <p className="mt-2 text-sm text-[#4B4C52]">
                    {active.problem}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-[#1D1D1F]">
                    {active.solution}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-700">{active.impact}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-4 flex items-center gap-2">
              {stories.map((story, index) => (
                <button
                  key={story.title}
                  type="button"
                  onClick={() => setActiveStory(index)}
                  aria-label={story.title}
                  className={`h-2 rounded-full transition-all ${index === activeStory ? 'w-8 bg-[#0071E3]' : 'w-2 bg-black/20 hover:bg-black/35'}`}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          variants={revealSoft}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-8% 0px -6% 0px' }}
          className="relative mx-auto mt-8 grid max-w-[1130px] gap-5 lg:grid-cols-[1.2fr_0.85fr]"
        >
          <GlassCard className="p-4 sm:p-5" tone="neutral">
            <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-glass-soft">
              <div className="mb-3 flex items-center justify-between rounded-xl border border-black/6 bg-[#F8F8FA] px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5F6370]">{copy.dashboard}</p>
                <span className="rounded-full bg-emerald-500/14 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                  {copy.newBookings}
                </span>
              </div>
              <Image
                src="/images/asistan-main.png"
                alt="Asistan dashboard preview"
                width={1100}
                height={680}
                priority
                unoptimized
                className="h-auto w-full rounded-xl border border-black/8 object-cover"
              />
            </div>
          </GlassCard>

          <GlassCard className="relative p-4 sm:p-5" tone="accent">
            <div className="mx-auto w-full max-w-[290px] rounded-[2rem] border border-black/8 bg-[#FAFAFC] p-3 shadow-[0_16px_40px_-26px_rgba(0,113,227,0.6)]">
              <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-black/12" />
              <div className="space-y-2 rounded-[1.4rem] border border-black/6 bg-white p-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#EEF6FF] p-2">
                  <Smartphone className="h-4 w-4 text-[#0071E3]" />
                  <p className="text-xs font-semibold text-[#1D1D1F]">{copy.appTitle}</p>
                </div>
                <div className="rounded-xl border border-black/6 p-2.5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-[#1D1D1F]">{copy.dermatology}</p>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{copy.live}</span>
                  </div>
                  <p className="text-[11px] text-[#5F6370]">{copy.nearby}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#F5F7FB] p-2">
                    <CalendarClock className="mb-1 h-3.5 w-3.5 text-[#0071E3]" />
                    <p className="text-[10px] text-[#5F6370]">{copy.oneTap}</p>
                  </div>
                  <div className="rounded-xl bg-[#F5F7FB] p-2">
                    <Bell className="mb-1 h-3.5 w-3.5 text-[#0071E3]" />
                    <p className="text-[10px] text-[#5F6370]">{copy.reminders}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
