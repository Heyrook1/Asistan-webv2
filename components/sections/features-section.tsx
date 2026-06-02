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
} from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { GlassCard } from '@/components/ui/glass-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { revealSoft, staggerContainer } from '@/lib/animations'

type FeatureItem = {
  icon: ComponentType<{ className?: string }>
  title: string
  detail: string
}

const CLINIC_ITEMS: ReadonlyArray<FeatureItem> = [
  { icon: CalendarClock, title: 'Appointment orchestration', detail: 'Unified scheduling with live booking updates from web and mobile channels.' },
  { icon: Database, title: 'Patient records', detail: 'Patient timelines, notes, and documentation in one secure workflow.' },
  { icon: ChartNoAxesCombined, title: 'Analytics dashboard', detail: 'Track demand, no-show trends, and conversion from discovery to booking.' },
  { icon: ShieldCheck, title: 'RLS-first security', detail: 'Multi-tenant data isolation and permission-aware access by role.' },
  { icon: UsersRound, title: 'Multi-staff support', detail: 'Coordinate doctors, assistants, and front desk from one operating view.' },
]

const PATIENT_ITEMS: ReadonlyArray<FeatureItem> = [
  { icon: MapPinned, title: 'GPS clinic discovery', detail: 'Find nearby clinics quickly with location-aware listing and distance context.' },
  { icon: Star, title: 'Reviews and ratings', detail: 'Read trusted patient experiences before choosing a clinic or doctor.' },
  { icon: Compass, title: 'Instant booking', detail: 'Pick a service and available time slot with one-tap appointment creation.' },
  { icon: Bell, title: 'Reminder notifications', detail: 'Get updates before visits and after care milestones without manual follow-up.' },
  { icon: CalendarClock, title: 'History and repeat', detail: 'Review prior appointments and rebook preferred clinics in seconds.' },
]

const FEATURES_COPY = {
  tr: {
    badge: 'Özellikler',
    title: 'İki ürün, tek bağlı değer sistemi',
    clinicTab: 'Klinikler İçin (Web)',
    patientTab: 'Hastalar İçin (Mobil)',
    clinicItems: [
      { ...CLINIC_ITEMS[0], title: 'Randevu orkestrasyonu', detail: 'Web ve mobil kanallardan gelen rezervasyonları tek akışta yönetin.' },
      { ...CLINIC_ITEMS[1], title: 'Hasta kayıtları', detail: 'Hasta geçmişini, notları ve belgeleri güvenli şekilde tek yerde tutun.' },
      { ...CLINIC_ITEMS[2], title: 'Analiz paneli', detail: 'Talep, gelmeme oranı ve rezervasyona dönüşüm trendlerini takip edin.' },
      { ...CLINIC_ITEMS[3], title: 'RLS güvenliği', detail: 'Multi-tenant veri izolasyonu ve rol bazlı yetki kontrolü.' },
      { ...CLINIC_ITEMS[4], title: 'Çoklu personel desteği', detail: 'Doktor, asistan ve ön masayı tek operasyon ekranında koordine edin.' },
    ],
    patientItems: [
      { ...PATIENT_ITEMS[0], title: 'GPS tabanlı klinik keşfi', detail: 'Yakın klinikleri konum ve mesafe bağlamıyla hızlıca bulun.' },
      { ...PATIENT_ITEMS[1], title: 'Yorum ve puanlar', detail: 'Klinik seçmeden önce güvenilir hasta deneyimlerini inceleyin.' },
      { ...PATIENT_ITEMS[2], title: 'Anında randevu', detail: 'Hizmeti seçin, uygun saati seçin, tek dokunuşla randevu oluşturun.' },
      { ...PATIENT_ITEMS[3], title: 'Hatırlatma bildirimleri', detail: 'Randevu öncesi ve sonrası süreçlerde otomatik bildirim alın.' },
      { ...PATIENT_ITEMS[4], title: 'Geçmiş ve tekrar', detail: 'Geçmiş randevuları görün, aynı klinikten saniyeler içinde tekrar randevu alın.' },
    ],
  },
  en: {
    badge: 'Features',
    title: 'Two products, one connected value system',
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
    <section id="features" className="px-4 py-14 sm:px-6 lg:py-20">
      <div className="mx-auto w-full max-w-[1220px]">
        <motion.div
          variants={staggerContainer(0.08, 0.02)}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-8 text-center"
        >
          <motion.p variants={revealSoft} className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mt-3 text-balance font-display text-[clamp(1.8rem,4.1vw,3rem)] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
            {copy.title}
          </motion.h2>
        </motion.div>

        <Tabs defaultValue="clinic" className="w-full">
          <TabsList className="mx-auto mb-5 grid h-12 w-full max-w-md grid-cols-2 rounded-2xl border border-black/10 bg-white/72 p-1 shadow-glass-soft backdrop-blur-md">
            <TabsTrigger value="clinic" className="rounded-xl text-sm font-semibold data-[state=active]:bg-[#0071E3] data-[state=active]:text-white">
              {copy.clinicTab}
            </TabsTrigger>
            <TabsTrigger value="patient" className="rounded-xl text-sm font-semibold data-[state=active]:bg-[#0071E3] data-[state=active]:text-white">
              {copy.patientTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="mt-0">
            <FeatureGrid items={copy.clinicItems} />
          </TabsContent>
          <TabsContent value="patient" className="mt-0">
            <FeatureGrid items={copy.patientItems} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function FeatureGrid({ items }: { items: ReadonlyArray<FeatureItem> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GlassCard key={item.title} interactive className="p-4">
          <item.icon className="h-5 w-5 text-[#0071E3]" />
          <h3 className="mt-3 text-lg font-semibold tracking-[-0.01em] text-[#1D1D1F]">{item.title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#5F6370]">{item.detail}</p>
        </GlassCard>
      ))}
    </div>
  )
}
