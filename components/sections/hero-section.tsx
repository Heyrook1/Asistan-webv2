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
  Search,
  MapPin,
  Star,
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
    badge: 'Yeni Nesil Sağlık Ekosistemi',
    headline: 'Klinik operasyonlarında modern, güvenilir ve hızlı deneyim',
    subheadline:
      'Klinikler ve hastalar için eksiksiz ekosistem — web panel + mobil uygulama (yakında). Kliniğinizi profesyonelce yönetin, hastalar saniyeler içinde randevu oluştursun.',
    startTrial: 'Ücretsiz Deneyin',
    joinPatient: 'Hasta Olarak Katıl',
    ribbon: 'Akıllı Klinik Çözümleri',
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
    dashboard: 'Klinik Yönetim Paneli v2',
    newBookings: '18 Yeni Randevu',
    appTitle: 'Asistan Rezervasyon',
    dermatology: 'Cildiye & Dermatoloji',
    live: 'Canlı Uygun',
    nearby: 'Lefkoşa · 1.2 km uzakta',
    oneTap: 'Anında Randevu Al',
    reminders: 'Akıllı Hatırlatıcılar',
    mockupDoctor: 'Dr. Selim Kaya',
    mockupDoctorTitle: 'Dermatoloji Uzmanı',
    mockupRating: '4.9 (184 Değerlendirme)',
    mockupNextSlot: 'Bugün 14:30',
  },
  en: {
    badge: 'Next-Gen Health Ecosystem',
    headline: 'Healthcare operations, elevated by one connected platform',
    subheadline:
      'The complete ecosystem for clinics and patients — web dashboard + mobile app (coming soon). Run your clinic with confidence and let patients book care in seconds.',
    startTrial: 'Start Free Trial',
    joinPatient: 'Join as Patient',
    ribbon: 'Smart Clinic Solutions',
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
    dashboard: 'Clinic Management Dashboard v2',
    newBookings: '18 New Bookings',
    appTitle: 'Asistan Rezervasyon',
    dermatology: 'Dermatology & Skin Care',
    live: 'Available Now',
    nearby: 'Nicosia · 1.2 km away',
    oneTap: 'One-Tap Booking',
    reminders: 'Smart Reminders',
    mockupDoctor: 'Dr. Selim Kaya',
    mockupDoctorTitle: 'Dermatology Specialist',
    mockupRating: '4.9 (184 Reviews)',
    mockupNextSlot: 'Today 14:30',
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
    }, 5500)

    return () => window.clearInterval(timer)
  }, [stories.length])

  const active = stories[activeStory]
  const ActiveIcon = iconMap[active.icon]

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:pb-32 lg:pt-38 bg-[#FFFFFF] selection:bg-[#0071E3]/18">
      {/* Liquid Glass Background Elements */}
      <div className="absolute inset-0 bg-[#FBFBFA]/50 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,113,227,0.06),rgba(255,255,255,0))]" />
      
      {/* Slow floating liquid glass orbs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-10%] top-[10%] h-[450px] w-[450px] rounded-full bg-[#0071E3]/5 blur-[120px]"
        animate={{
          y: [0, -40, 0],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 15,
          ease: 'easeInOut',
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'mirror',
        }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-5%] top-[25%] h-[500px] w-[500px] rounded-full bg-[#60A5FA]/6 blur-[130px]"
        animate={{
          y: [0, 50, 0],
          x: [0, -35, 0],
        }}
        transition={{
          duration: 18,
          ease: 'easeInOut',
          repeat: Number.POSITIVE_INFINITY,
          repeatType: 'mirror',
        }}
      />

      <div className="mx-auto w-full max-w-[1220px] relative z-10">
        <AnimatedHero headline={copy.headline} subheadline={copy.subheadline} badge={copy.badge} />

        <motion.div
          variants={revealSoft}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild className="h-13 rounded-2xl bg-[#0071E3] hover:bg-[#0063C8] px-7 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(0,113,227,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
            <Link href="/auth/sign-up">
              {copy.startTrial}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-13 rounded-2xl border-black/10 bg-white/60 hover:bg-white/95 px-7 text-sm font-semibold text-[#1D1D1F] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <a href="#waitlist">{copy.joinPatient}</a>
          </Button>
        </motion.div>

        {/* Stories Ribbon / Value Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: appleEase }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <GlassCard className="border-[#0071E3]/8 p-5 sm:p-6 bg-white/40 shadow-xl backdrop-blur-xl" tone="neutral">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-black/5 pb-4">
              <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#0071E3]/20 bg-[#EEF6FF]/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0071E3]">
                <Sparkles className="h-3.5 w-3.5" />
                {copy.ribbon}
              </p>
              
              <div className="flex items-center gap-1.5">
                {stories.map((story, index) => (
                  <button
                    key={story.title}
                    type="button"
                    onClick={() => setActiveStory(index)}
                    aria-label={story.title}
                    className={`h-2.5 rounded-full transition-all duration-500 ${index === activeStory ? 'w-9 bg-[#0071E3]' : 'w-2.5 bg-black/15 hover:bg-black/30'}`}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${locale}-${activeStory}`}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.4, ease: appleEase }}
                className="grid gap-4 md:grid-cols-[64px_1fr]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0071E3]/8 text-[#0071E3] shadow-inner">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#0071E3]">{active.title}</p>
                  <p className="mt-1.5 text-sm text-[#4B4C52] leading-relaxed">
                    <span className="font-semibold text-[#1D1D1F]">Sorun:</span> {active.problem}
                  </p>
                  <p className="mt-1.5 text-sm text-[#1D1D1F] leading-relaxed">
                    <span className="font-semibold text-[#0071E3]">Çözüm:</span> {active.solution}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {active.impact}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Premium Side-by-Side Mockup Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.3, ease: appleEase }}
          className="relative mx-auto mt-20 max-w-[1150px] px-2"
        >
          {/* Back Glowing Effect */}
          <div className="absolute top-[20%] left-[20%] right-[20%] bottom-[10%] bg-[#0071E3]/8 blur-[80px] rounded-full pointer-events-none -z-10" />

          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-center">
            
            {/* Desktop Dashboard Frame (Left/Back) */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0071E3]/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl -z-10" />
              
              <GlassCard className="p-2 sm:p-3 bg-white/40 border-white/50 shadow-2xl backdrop-blur-xl" tone="neutral">
                {/* Safari style window headers */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-400/90" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-400/90" />
                    <span className="w-3.5 h-3.5 rounded-full bg-green-400/90" />
                  </div>
                  
                  {/* Pseudo URL bar */}
                  <div className="flex-1 max-w-sm mx-auto bg-white/60 border border-black/5 rounded-lg py-1 px-4 text-center text-[10px] text-[#5F6370] font-mono tracking-tight shadow-inner">
                    kktc.asistan.online
                  </div>

                  <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    {copy.newBookings}
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden mt-2 border border-black/10">
                  <Image
                    src="/images/asistan-main.png"
                    alt="Asistan Dashboard Panel"
                    width={1200}
                    height={750}
                    priority
                    unoptimized
                    className="h-auto w-full object-cover shadow-lg"
                  />
                </div>
              </GlassCard>
            </div>

            {/* Mobile App Frame (Right/Front Floating) */}
            <div className="relative flex justify-center lg:justify-start lg:-ml-12 lg:-mt-20 z-20">
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 6,
                  ease: 'easeInOut',
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: 'mirror',
                }}
                className="w-full max-w-[285px] rounded-[2.8rem] border-8 border-slate-900 bg-slate-900 p-2 shadow-2xl relative"
              >
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                  <div className="w-12 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Simulated App View */}
                <div className="w-full aspect-[9/19.5] rounded-[2.4rem] overflow-hidden bg-[#FAFAFC] border border-black/5 p-4 flex flex-col justify-between text-left select-none relative">
                  
                  {/* Top Header */}
                  <div className="pt-4 pb-2 border-b border-black/5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold text-[#1D1D1F] tracking-tight">{copy.appTitle}</p>
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
                        Beta
                      </span>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 mt-3 space-y-3.5">
                    {/* Search Component */}
                    <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-2 text-slate-400 border border-slate-200 shadow-inner">
                      <Search className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[10px] font-medium">{locale === 'tr' ? 'Doktor veya klinik ara...' : 'Search doctor or clinic...'}</span>
                    </div>

                    {/* Booking Card */}
                    <div className="rounded-xl border border-black/6 bg-white p-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-[#0071E3]">{copy.dermatology}</span>
                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{copy.live}</span>
                      </div>
                      
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 relative overflow-hidden border border-black/5">
                          <Image src="/images/medical-team.jpg" alt="Doctor" fill className="object-cover" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#1D1D1F] leading-tight">{copy.mockupDoctor}</p>
                          <p className="text-[9px] text-slate-400 leading-none mt-0.5">{copy.mockupDoctorTitle}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-1 text-[9px] text-[#5F6370]">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-[#1D1D1F]">4.9</span>
                        <span>{locale === 'tr' ? '(184 Yorum)' : '(184 Reviews)'}</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">{locale === 'tr' ? 'EN YAKIN SAAT' : 'NEXT SLOT'}</p>
                          <p className="text-[10px] font-bold text-[#1D1D1F]">{copy.mockupNextSlot}</p>
                        </div>
                        <button className="bg-[#0071E3] hover:bg-[#0063C8] text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg shadow-sm">
                          {locale === 'tr' ? 'Seç' : 'Select'}
                        </button>
                      </div>
                    </div>

                    {/* App Highlights mini grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-black/5 bg-white p-2 text-left shadow-sm">
                        <CalendarClock className="h-3.5 w-3.5 text-[#0071E3] mb-1" />
                        <p className="text-[9px] font-bold text-[#1D1D1F] leading-snug">{copy.oneTap}</p>
                      </div>
                      <div className="rounded-xl border border-black/5 bg-white p-2 text-left shadow-sm">
                        <Bell className="h-3.5 w-3.5 text-[#0071E3] mb-1" />
                        <p className="text-[9px] font-bold text-[#1D1D1F] leading-snug">{copy.reminders}</p>
                      </div>
                    </div>
                  </div>

                  {/* App Bottom Navigation Bar */}
                  <div className="border-t border-black/5 pt-2 flex justify-around text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-[#0071E3]/15 flex items-center justify-center"><Smartphone className="h-3 w-3 text-[#0071E3]" /></span>
                    <span className="w-4 h-4 rounded-full bg-slate-100" />
                    <span className="w-4 h-4 rounded-full bg-slate-100" />
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  )
}
