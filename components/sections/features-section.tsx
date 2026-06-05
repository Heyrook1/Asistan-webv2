'use client'

import type { ComponentType } from 'react'
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
} from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { revealSoft, staggerContainer, baseSpring } from '@/lib/animations'

type FeatureItem = {
  icon: ComponentType<{ className?: string }>
  title: string
  detail: string
}

const CLINIC_ITEMS: ReadonlyArray<FeatureItem> = [
  { icon: CalendarClock, title: 'Appointment management', detail: 'Unified scheduling with live booking updates from web and mobile channels.' },
  { icon: Database, title: 'Patient records', detail: 'Patient timelines, notes, and documentation in one secure workflow.' },
  { icon: ChartNoAxesCombined, title: 'Analytics dashboard', detail: 'Track demand, no-show trends, and conversion from discovery to booking.' },
  { icon: ShieldCheck, title: 'RLS security', detail: 'Multi-tenant data isolation and permission-aware access by role.' },
  { icon: UsersRound, title: 'Multi-staff support', detail: 'Coordinate doctors, assistants, and front desk from one operating view.' },
]

const PATIENT_ITEMS: ReadonlyArray<FeatureItem> = [
  { icon: MapPinned, title: 'GPS clinic discovery', detail: 'Find nearby clinics quickly with location-aware listing and distance context.' },
  { icon: Star, title: 'Reviews & ratings', detail: 'Read trusted patient experiences before choosing a clinic or doctor.' },
  { icon: Compass, title: 'Instant booking', detail: 'Pick a service and available time slot with one-tap appointment creation.' },
  { icon: Bell, title: 'Appointment reminders', detail: 'Get updates before visits and after care milestones without manual follow-up.' },
  { icon: History, title: 'History & repeat', detail: 'Review prior appointments and rebook preferred clinics in seconds.' },
]

const FEATURES_COPY = {
  tr: {
    badge: 'Kapsamlı Özellikler',
    title: 'İki farklı platform, tek bağlı sağlık pazarı',
    clinicTab: 'Klinikler İçin (Web Panel)',
    patientTab: 'Hastalar İçin (Mobil Uygulama)',
    clinicItems: [
      { icon: CalendarClock, title: 'Randevu Orkestrasyonu', detail: 'Web ve mobil kanallardan gelen rezervasyonları tek akışta yönetin.' },
      { icon: Database, title: 'Hasta Sağlık Kayıtları', detail: 'Hasta geçmişini, tedavi notlarını ve belgeleri güvenli şekilde tek panelde tutun.' },
      { icon: ChartNoAxesCombined, title: 'Derin Analiz Paneli', detail: 'Talep yoğunluğunu, no-show oranlarını ve randevu doluluk trendlerini izleyin.' },
      { icon: ShieldCheck, title: 'RLS Veri Güvenliği', detail: 'Postgres RLS tabanlı gelişmiş veri izolasyonu ve rol bazlı erişim yetkileri.' },
      { icon: UsersRound, title: 'Çoklu Personel Desteği', detail: 'Hekimleri, asistanları ve ön masayı tek ortak operasyon ekranında koordine edin.' },
    ],
    patientItems: [
      { icon: MapPinned, title: 'GPS Tabanlı Klinik Keşfi', detail: 'Yakınınızdaki klinikleri konum, hekim ve mesafe bilgileriyle anında bulun.' },
      { icon: Star, title: 'Güvenilir Yorum & Puanlar', detail: 'Randevu almadan önce gerçek hastaların tedavi deneyimlerini karşılaştırın.' },
      { icon: Compass, title: 'Anlık Randevu Rezervasyonu', detail: 'İstediğiniz sağlık hizmetini ve uygun saati seçip tek dokunuşla randevu oluşturun.' },
      { icon: Bell, title: 'Akıllı Randevu Bildirimleri', detail: 'Randevu öncesi hatırlatmalar ve kontrol hekim takipleri için otomatik uyarılar alın.' },
      { icon: History, title: 'Randevu Geçmişi & Tekrarı', detail: 'Geçmiş tedavilerinizi görüntüleyin, beğendiğiniz klinikten saniyeler içinde tekrar randevu alın.' },
    ],
  },
  en: {
    badge: 'Features Spec Sheet',
    title: 'Two products, one connected healthcare ecosystem',
    clinicTab: 'For Clinics (Web)',
    patientTab: 'For Patients (Mobile App)',
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
            <FeatureGrid items={copy.clinicItems} />
          </TabsContent>
          
          <TabsContent value="patient" className="mt-0 outline-none">
            <FeatureGrid items={copy.patientItems} />
          </TabsContent>
        </Tabs>

      </div>
    </section>
  )
}

function FeatureGrid({ items }: { items: ReadonlyArray<FeatureItem> }) {
  return (
    <motion.div
      variants={staggerContainer(0.06, 0.02)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8% 0px' }}
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item, index) => {
        const Icon = item.icon
        // Bento grid column spans
        const isBentoWide = index === 3 || index === 4
        const colSpan = isBentoWide ? 'lg:col-span-1' : 'lg:col-span-1'

        return (
          <motion.div
            key={item.title}
            variants={revealSoft}
            className={colSpan}
          >
            <GlassCard
              interactive
              className="p-6 bg-white/40 border-white/50 shadow-md h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.025]"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EEF6FF] border border-blue-100 flex items-center justify-center text-[#0071E3] shadow-inner mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-[#1D1D1F]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5D6068] font-medium">{item.detail}</p>
              </div>
              
              <div className="mt-6 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Enterprise ready</span>
                <span>✨</span>
              </div>
            </GlassCard>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
