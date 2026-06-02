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
    badge: 'Ekosistem Döngüsü',
    title: 'Klinik büyümesi ve hasta erişimi için tek bağlı döngü',
    description: 'Herkese fayda üreten eksiksiz bir döngü. Klinikler büyür, hastalar ihtiyaç duyduğu anda bakıma ulaşır.',
    clinicTitle: 'Klinik Paneli',
    clinicDesc: 'Klinikler randevu, hasta kaydı ve analiz süreçlerini yönetir; uygulamadan gelen rezervasyonları anlık alır.',
    clinicFlow: [
      'Randevu, kayıt, analiz ve ekip planlamasını tek panelden yönetin.',
      'Mobil uygulamadan gelen rezervasyonları gerçek zamanlı alın.',
      'Hatırlatmaları otomatikleştirerek ön masa yükünü azaltın.',
    ],
    patientTitle: 'Hasta Uygulaması',
    patientDesc: 'Hastalar klinikleri keşfeder, yorumları okur, anında randevu alır ve hizmeti puanlar.',
    patientFlow: [
      'Yakın klinik ve doktorları puanlar ile yorumlarla birlikte keşfedin.',
      'Gerçek uygunluk saatine göre anında randevu oluşturun.',
      'Hatırlatma alın, randevuya gidin, güvenilir geri bildirim bırakın.',
    ],
    multiStaff: 'Çoklu ekip',
    analytics: 'Analiz',
    liveQueue: 'Canlı kuyruk',
    reminders: 'Hatırlatma',
    ratings: 'Puanlama',
    rebook: 'Tekrar randevu',
    flow: 'Döngü',
    center: 'Klinik ↔ Hasta',
    loop: ['Rezervasyon', 'Bildirim', 'Randevu', 'Yorum', 'Tekrar'],
  },
  en: {
    badge: 'Marketplace Loop',
    title: 'One connected loop for clinic growth and better patient access',
    description: 'A complete loop that benefits everyone. Clinics grow their practice, patients get care when they need it.',
    clinicTitle: 'Clinic Dashboard',
    clinicDesc: 'Clinics manage appointments, patient records, analytics, and receive bookings from the app.',
    clinicFlow: [
      'Manage appointments, records, analytics, and staff in one dashboard.',
      'Receive direct bookings coming from the customer app in real-time.',
      'Automate reminders and reduce front desk load with unified scheduling.',
    ],
    patientTitle: 'Patient App',
    patientDesc: 'Patients discover clinics, read reviews, book instantly, and rate service after visits.',
    patientFlow: [
      'Discover nearby clinics and doctors with clear ratings and reviews.',
      'Book instantly based on real slot availability and preference.',
      'Receive reminders, attend appointments, then leave trusted feedback.',
    ],
    multiStaff: 'Multi staff',
    analytics: 'Analytics',
    liveQueue: 'Live queue',
    reminders: 'Reminders',
    ratings: 'Ratings',
    rebook: 'Rebook',
    flow: 'Flow',
    center: 'Clinic <-> Customer',
    loop: ['Booking', 'Notification', 'Appointment', 'Review', 'Repeat'],
  },
} as const

export function EcosystemFlowSection() {
  const { locale } = useLandingLocale()
  const copy = FLOW_COPY[locale]

  return (
    <section id="ecosystem" className="relative px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto w-full max-w-[1220px]">
        <motion.div
          variants={staggerContainer(0.07, 0.05)}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-8 text-center"
        >
          <motion.p variants={revealSoft} className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mx-auto mt-3 max-w-3xl text-balance font-display text-[clamp(1.8rem,4.2vw,3.05rem)] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
            {copy.title}
          </motion.h2>
          <motion.p variants={revealSoft} className="mx-auto mt-4 max-w-3xl text-[1.02rem] leading-relaxed text-[#4B4C52]">
            {copy.description}
          </motion.p>
        </motion.div>

        <div className="relative grid gap-5 lg:grid-cols-2">
          <GlassCard interactive className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#0071E3]" />
              <h3 className="text-xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">{copy.clinicTitle}</h3>
            </div>
            <p className="mt-2 text-sm text-[#5F6370]">
              {copy.clinicDesc}
            </p>
            <ul className="mt-5 space-y-3">
              {copy.clinicFlow.map((line) => (
                <li key={line} className="flex items-start gap-2 rounded-2xl border border-black/6 bg-white/80 px-3 py-2.5 text-sm text-[#2E3138]">
                  <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-[#0071E3]" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-[#F4F7FC] p-2.5">
                <Users className="mx-auto mb-1 h-4 w-4 text-[#0071E3]" />
                {copy.multiStaff}
              </div>
              <div className="rounded-xl bg-[#F4F7FC] p-2.5">
                <ChartNoAxesCombined className="mx-auto mb-1 h-4 w-4 text-[#0071E3]" />
                {copy.analytics}
              </div>
              <div className="rounded-xl bg-[#F4F7FC] p-2.5">
                <Activity className="mx-auto mb-1 h-4 w-4 text-[#0071E3]" />
                {copy.liveQueue}
              </div>
            </div>
          </GlassCard>

          <GlassCard interactive className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#0071E3]" />
              <h3 className="text-xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">{copy.patientTitle}</h3>
            </div>
            <p className="mt-2 text-sm text-[#5F6370]">
              {copy.patientDesc}
            </p>
            <ul className="mt-5 space-y-3">
              {copy.patientFlow.map((line) => (
                <li key={line} className="flex items-start gap-2 rounded-2xl border border-black/6 bg-white/80 px-3 py-2.5 text-sm text-[#2E3138]">
                  <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-[#0071E3]" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-[#F4F7FC] p-2.5">
                <BellRing className="mx-auto mb-1 h-4 w-4 text-[#0071E3]" />
                {copy.reminders}
              </div>
              <div className="rounded-xl bg-[#F4F7FC] p-2.5">
                <Star className="mx-auto mb-1 h-4 w-4 text-[#0071E3]" />
                {copy.ratings}
              </div>
              <div className="rounded-xl bg-[#F4F7FC] p-2.5">
                <RefreshCw className="mx-auto mb-1 h-4 w-4 text-[#0071E3]" />
                {copy.rebook}
              </div>
            </div>
          </GlassCard>

          <div className="pointer-events-none lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <div className="mx-auto mt-2 flex h-44 w-44 items-center justify-center rounded-full border border-black/10 bg-white/80 shadow-glass-soft backdrop-blur-xl lg:mt-0">
              <motion.div
                aria-hidden="true"
                className="absolute h-34 w-34 rounded-full border border-dashed border-[#0071E3]/50"
                animate={{ rotate: 360 }}
                transition={rotateLoopTransition}
              />
              <motion.div
                aria-hidden="true"
                className="absolute h-24 w-24 rounded-full border border-dashed border-[#1D1D1F]/26"
                animate={{ rotate: -360 }}
                transition={{ ...rotateLoopTransition, duration: 13 }}
              />
              <div className="z-10 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0071E3]">{copy.flow}</p>
                <p className="mt-1 text-sm font-semibold tracking-[-0.01em] text-[#1D1D1F]">{copy.center}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-5">
          {copy.loop.map((step, index) => (
            <div key={step} className="rounded-2xl border border-black/8 bg-white/70 px-3 py-2 text-center text-sm font-medium text-[#30333B] backdrop-blur-md">
              <span className="mr-2 text-xs text-[#0071E3]">0{index + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
