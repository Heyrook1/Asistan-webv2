'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bell,
  CalendarClock,
  ChartNoAxesCombined,
  Compass,
  Database,
  MapPinned,
  ShieldCheck,
  Star,
  UsersRound,
  History,
  ArrowRight,
} from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getClinicTrialPath, PATIENT_BOOK_PATH, ENTRY_CTA } from '@/lib/entry-routes'
import { revealSoft, staggerContainer } from '@/lib/animations'

type FeatureItem = {
  icon: ComponentType<{ className?: string }>
  title: string
  detail: string
}

const CLINIC_ITEMS: ReadonlyArray<FeatureItem> = [
  { icon: CalendarClock, title: 'Appointment management', detail: 'Unified scheduling with booking updates from web and mobile channels.' },
  { icon: Database, title: 'Patient records', detail: 'Patient timelines, notes, and documentation in one secure workflow.' },
  { icon: ChartNoAxesCombined, title: 'Ops analytics', detail: 'Track occupancy, cancellations, and basic revenue summaries for daily decisions.' },
  { icon: ShieldCheck, title: 'Role-based security', detail: 'Clinic-level data isolation and permission-aware access by role.' },
  { icon: UsersRound, title: 'Multi-staff support', detail: 'Coordinate doctors, assistants, and front desk from one operating view.' },
]

const PATIENT_ITEMS: ReadonlyArray<FeatureItem> = [
  { icon: MapPinned, title: 'GPS clinic discovery', detail: 'Find nearby clinics quickly with location-aware listing and distance context.' },
  { icon: Star, title: 'Reviews & ratings', detail: 'Read reviews tied to completed appointments before choosing a clinic or doctor.' },
  { icon: Compass, title: 'Booking requests', detail: 'Pick a service and available slot; confirmation follows clinic auto/manual settings.' },
  { icon: Bell, title: 'Status updates', detail: 'Get in-app updates on confirmation, changes, and upcoming visits.' },
  { icon: History, title: 'History & repeat', detail: 'Review prior appointments and rebook preferred clinics in seconds.' },
]

const FEATURES_COPY = {
  tr: {
    badge: 'Kapsamlı özellikler',
    title: 'Klinik paneli ve hasta randevusu aynı Asistan ekosisteminde',
    clinicTab: 'Klinik paneli',
    patientTab: 'Hasta randevusu',
    clinicCta: ENTRY_CTA.clinicTrial.tr,
    patientCta: ENTRY_CTA.patientBook.tr,
    clinicFoot: 'Web panel',
    patientFoot: 'Web + mobil',
    clinicItems: [
      { icon: CalendarClock, title: 'Randevu yönetimi', detail: 'Web ve mobil kanallardan gelen rezervasyonları tek akışta yönetin.' },
      { icon: Database, title: 'Hasta kayıtları', detail: 'Hasta geçmişini, tedavi notlarını ve belgeleri güvenli şekilde tek panelde tutun.' },
      { icon: ChartNoAxesCombined, title: 'Operasyon analitiği', detail: 'Doluluk, iptal ve temel ciro özetlerini günlük kararlar için izleyin.' },
      { icon: ShieldCheck, title: 'Rol bazlı güvenlik', detail: 'İşletme bazlı veri ayrımı ve role göre erişim yetkileri.' },
      { icon: UsersRound, title: 'Çoklu personel', detail: 'Hekim, asistan ve ön masayı tek ortak operasyon ekranında koordine edin.' },
    ],
    patientItems: [
      { icon: MapPinned, title: 'Klinik keşfi', detail: 'Yakınınızdaki klinikleri konum, puan ve mesafe bilgileriyle bulun.' },
      { icon: Star, title: 'Gerçek yorumlar', detail: 'Tamamlanmış randevuya bağlı yorumları randevu almadan önce okuyun.' },
      { icon: Compass, title: 'Randevu talebi', detail: 'Hizmet ve uygun saati seçin; klinik ayarına göre otomatik veya manuel onayla ilerleyin.' },
      { icon: Bell, title: 'Durum bildirimleri', detail: 'Onay, değişiklik ve yaklaşan randevular için bildirim alın.' },
      { icon: History, title: 'Geçmiş ve tekrar', detail: 'Geçmiş randevularınızı görün, tercih ettiğiniz klinikten tekrar talep oluşturun.' },
    ],
  },
  en: {
    badge: 'Product features',
    title: 'Clinic panel and patient booking in one Asistan ecosystem',
    clinicTab: 'Clinic panel',
    patientTab: 'Patient booking',
    clinicCta: ENTRY_CTA.clinicTrial.en,
    patientCta: ENTRY_CTA.patientBook.en,
    clinicFoot: 'Web dashboard',
    patientFoot: 'Web + mobile',
    clinicItems: CLINIC_ITEMS,
    patientItems: PATIENT_ITEMS,
  },
} as const

export function FeaturesSection() {
  const { locale } = useLandingLocale()
  const copy = FEATURES_COPY[locale]

  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:py-28 bg-[#FFFFFF]">
      <div className="mx-auto w-full max-w-[1220px]">
        
        {/* Header Block */}
        <motion.div
          variants={staggerContainer(0.08, 0.02)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-14 text-center"
        >
          <motion.p variants={revealSoft} className="text-xs font-bold uppercase tracking-[0.18em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mt-3 text-balance font-display text-[clamp(1.8rem,4.1vw,3rem)] font-bold tracking-[-0.035em] text-[#1D1D1F] leading-[1.1]">
            {copy.title}
          </motion.h2>
        </motion.div>

        {/* Tab Controls */}
        <Tabs defaultValue="clinic" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="grid h-13 w-full max-w-lg grid-cols-2 rounded-2xl border border-black/10 bg-white/70 p-1 shadow-md backdrop-blur-md">
              <TabsTrigger
                value="clinic"
                className="rounded-xl text-sm font-bold text-slate-700 data-[state=active]:bg-[#0071E3] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300"
              >
                {copy.clinicTab}
              </TabsTrigger>
              <TabsTrigger
                value="patient"
                className="rounded-xl text-sm font-bold text-slate-700 data-[state=active]:bg-[#0071E3] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300"
              >
                {copy.patientTab}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="clinic" className="mt-0 outline-none">
            <FeatureGrid items={copy.clinicItems} foot={copy.clinicFoot} />
            <div className="mt-8 flex justify-center">
              <Button asChild className="h-11 rounded-xl bg-[#0071E3] px-5 font-semibold text-white hover:bg-[#0063C8]">
                <Link href={getClinicTrialPath(locale)}>
                  {copy.clinicCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="patient" className="mt-0 outline-none">
            <FeatureGrid items={copy.patientItems} foot={copy.patientFoot} />
            <div className="mt-8 flex justify-center">
              <Button asChild variant="outline" className="h-11 rounded-xl border-[#0071E3]/30 px-5 font-semibold text-[#0071E3]">
                <Link href={PATIENT_BOOK_PATH}>
                  {copy.patientCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </section>
  )
}

function FeatureGrid({
  items,
  foot,
}: {
  items: ReadonlyArray<FeatureItem>
  foot: string
}) {
  return (
    <motion.div
      variants={staggerContainer(0.06, 0.02)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8% 0px' }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item) => {
        const Icon = item.icon

        return (
          <motion.div key={item.title} variants={revealSoft}>
            <GlassCard
              interactive
              className="flex h-full flex-col justify-between border-white/50 bg-white/40 p-6 shadow-md transition-all duration-300 hover:scale-[1.025]"
            >
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-[#EEF6FF] text-[#0071E3] shadow-inner">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F]">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#5D6068]">{item.detail}</p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/5 pt-3 text-xs font-medium text-slate-400">
                <span>{foot}</span>
              </div>
            </GlassCard>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
