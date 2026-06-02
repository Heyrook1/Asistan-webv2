'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRightLeft,
  BellRing,
  ChartNoAxesCombined,
  ClipboardList,
  History,
  RefreshCw,
  Star,
  Users,
} from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { revealSoft, rotateLoopTransition, staggerContainer } from '@/lib/animations'

const FLOW_COPY = {
  tr: {
    badge: 'Çift Yönlü Ekosistem Döngüsü',
    title: 'Klinik büyümesi ve hasta erişimi için tek bağlı döngü',
    description: 'Herkese fayda üreten eksiksiz bir döngü. Klinikler pratiklerini büyütür, hastalar ihtiyaç duyduğu anda premium bakıma ulaşır.',
    clinicTitle: 'Klinik Yönetim Paneli',
    clinicDesc: 'Klinikler randevu, hasta kayıtları, hekim takvimleri ve analiz süreçlerini yönetir; mobil uygulamadan gelen rezervasyonları anlık alır.',
    clinicFlow: [
      'Randevu, kayıt, analiz ve ekip planlamasını tek panelden yönetin.',
      'Mobil uygulamadan gelen rezervasyonları gerçek zamanlı alın.',
      'Hatırlatmaları otomatikleştirerek ön masa yükünü azaltın.',
    ],
    patientTitle: 'Hasta Mobil Uygulaması',
    patientDesc: 'Hastalar yakındaki klinikleri keşfeder, doğrulanmış yorumları okur, anında randevu alır ve hizmeti değerlendirir.',
    patientFlow: [
      'Yakın klinik ve doktorları puanlar ile yorumlarla birlikte keşfedin.',
      'Gerçek uygunluk saatine göre anında randevu oluşturun.',
      'Hatırlatma alın, randevuya gidin, güvenilir geri bildirim bırakın.',
    ],
    multiStaff: 'Çoklu Ekip',
    analytics: 'Derin Analiz',
    liveQueue: 'Canlı Kuyruk',
    reminders: 'Hatırlatıcılar',
    ratings: 'Değerlendirme',
    rebook: 'Tekrar Randevu',
    flow: 'Döngü',
    center: 'Klinik ⇄ Hasta',
    loop: ['Rezervasyon', 'Bildirim', 'Randevu', 'Yorum', 'Tekrar'],
  },
  en: {
    badge: 'Marketplace Ecosystem Loop',
    title: 'One connected loop for clinic growth and better patient access',
    description: 'A complete loop that benefits everyone. Clinics grow their practice, patients get care when they need it.',
    clinicTitle: 'Clinic Dashboard',
    clinicDesc: 'Clinics manage appointments, patient records, analytics, and receive bookings from the app.',
    clinicFlow: [
      'Manage appointments, records, analytics, and staff in one dashboard.',
      'Receive direct bookings coming from the customer app in real-time.',
      'Automate reminders and reduce front desk load with unified scheduling.',
    ],
    patientTitle: 'Patient Mobile App',
    patientDesc: 'Patients discover clinics, read reviews, book instantly, and rate service after visits.',
    patientFlow: [
      'Discover nearby clinics and doctors with clear ratings and reviews.',
      'Book instantly based on real slot availability and preference.',
      'Receive reminders, attend appointments, then leave trusted feedback.',
    ],
    multiStaff: 'Multi Staff',
    analytics: 'Deep Analytics',
    liveQueue: 'Live Queue',
    reminders: 'Reminders',
    ratings: 'Ratings',
    rebook: 'Rebook',
    flow: 'Flow',
    center: 'Clinic ⇄ Customer',
    loop: ['Booking', 'Notification', 'Appointment', 'Review', 'Repeat'],
  },
} as const

export function EcosystemFlowSection() {
  const { locale } = useLandingLocale()
  const copy = FLOW_COPY[locale]

  return (
    <section id="ecosystem" className="relative px-4 py-20 sm:px-6 lg:py-28 bg-[#FFFFFF]">
      <div className="mx-auto w-full max-w-[1220px]">
        
        {/* Header Block */}
        <motion.div
          variants={staggerContainer(0.08, 0.04)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-16 text-center"
        >
          <motion.p variants={revealSoft} className="text-xs font-bold uppercase tracking-[0.18em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mx-auto mt-3 max-w-3xl text-balance font-display text-[clamp(1.8rem,4.2vw,3.05rem)] font-bold tracking-[-0.035em] text-[#1D1D1F] leading-[1.1]">
            {copy.title}
          </motion.h2>
          <motion.p variants={revealSoft} className="mx-auto mt-4 max-w-3xl text-[1.1rem] leading-relaxed text-[#5D6068] font-medium">
            {copy.description}
          </motion.p>
        </motion.div>

        {/* Grid Block */}
        <div className="relative grid gap-8 lg:gap-20 lg:grid-cols-2 items-stretch">
          
          {/* Clinic Dashboard Card */}
          <GlassCard interactive className="p-6 sm:p-8 bg-white/40 border-white/50 shadow-lg relative flex flex-col justify-between">
            <div className="lg:pr-14">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EEF6FF] rounded-xl border border-blue-100 text-[#0071E3] shadow-inner">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">{copy.clinicTitle}</h3>
              </div>
              <p className="mt-4 text-sm text-[#5D6068] leading-relaxed font-medium">
                {copy.clinicDesc}
              </p>
              
              <ul className="mt-6 space-y-3">
                {copy.clinicFlow.map((line) => (
                  <li key={line} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-3 text-sm text-[#2E3138] shadow-sm">
                    <ArrowRightLeft className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#0071E3]" />
                    <span className="font-medium">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs font-bold text-[#1D1D1F]">
              <div className="rounded-xl border border-black/5 bg-[#F4F7FC] p-3 shadow-inner flex flex-col items-center">
                <Users className="mb-1.5 h-5 w-5 text-[#0071E3]" />
                {copy.multiStaff}
              </div>
              <div className="rounded-xl border border-black/5 bg-[#F4F7FC] p-3 shadow-inner flex flex-col items-center">
                <ChartNoAxesCombined className="mb-1.5 h-5 w-5 text-[#0071E3]" />
                {copy.analytics}
              </div>
              <div className="rounded-xl border border-black/5 bg-[#F4F7FC] p-3 shadow-inner flex flex-col items-center">
                <Activity className="mb-1.5 h-5 w-5 text-[#0071E3]" />
                {copy.liveQueue}
              </div>
            </div>
          </GlassCard>

          {/* Patient App Card */}
          <GlassCard interactive className="p-6 sm:p-8 bg-white/40 border-white/50 shadow-lg relative flex flex-col justify-between">
            <div className="lg:pl-14">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EEF6FF] rounded-xl border border-blue-100 text-[#0071E3] shadow-inner">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">{copy.patientTitle}</h3>
              </div>
              <p className="mt-4 text-sm text-[#5D6068] leading-relaxed font-medium">
                {copy.patientDesc}
              </p>
              
              <ul className="mt-6 space-y-3">
                {copy.patientFlow.map((line) => (
                  <li key={line} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/80 px-4 py-3 text-sm text-[#2E3138] shadow-sm">
                    <ArrowRightLeft className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#0071E3]" />
                    <span className="font-medium">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs font-bold text-[#1D1D1F]">
              <div className="rounded-xl border border-black/5 bg-[#F4F7FC] p-3 shadow-inner flex flex-col items-center">
                <BellRing className="mb-1.5 h-5 w-5 text-[#0071E3]" />
                {copy.reminders}
              </div>
              <div className="rounded-xl border border-black/5 bg-[#F4F7FC] p-3 shadow-inner flex flex-col items-center">
                <Star className="mb-1.5 h-5 w-5 text-[#0071E3]" />
                {copy.ratings}
              </div>
              <div className="rounded-xl border border-black/5 bg-[#F4F7FC] p-3 shadow-inner flex flex-col items-center">
                <RefreshCw className="mb-1.5 h-5 w-5 text-[#0071E3]" />
                {copy.rebook}
              </div>
            </div>
          </GlassCard>

          {/* Central Loop Connection Ring */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-2 border-white/80 bg-white/90 shadow-2xl backdrop-blur-xl">
              
              {/* Rotating Circular Dotted SVG */}
              <motion.div
                className="absolute inset-0 w-full h-full"
                animate={{ rotate: 360 }}
                transition={rotateLoopTransition}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="#0071E3"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                    opacity="0.6"
                  />
                </svg>
              </motion.div>
              
              <motion.div
                className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)]"
                animate={{ rotate: -360 }}
                transition={{ ...rotateLoopTransition, duration: 20 }}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#1D1D1F"
                    strokeWidth="1"
                    strokeDasharray="3 8"
                    opacity="0.3"
                  />
                </svg>
              </motion.div>

              <div className="text-center p-4">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-ping mb-1" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0071E3]">{copy.flow}</p>
                <p className="mt-1 text-sm font-extrabold tracking-tight text-[#1D1D1F]">{copy.center}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Loop steps */}
        <div className="mt-10 grid gap-3 sm:grid-cols-5">
          {copy.loop.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3.5 text-center text-sm font-bold text-[#1D1D1F] backdrop-blur-md shadow-sm flex items-center justify-center gap-2 group transition duration-300 hover:border-[#0071E3]/20"
            >
              <span className="text-xs text-[#0071E3] font-mono">0{index + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
