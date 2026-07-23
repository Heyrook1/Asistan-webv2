// components/sections/HeroCoverFlow.tsx
'use client'

import React, { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarClock,
  Users,
  TrendingUp,
  Calendar,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useLanguage, Language } from '@/contexts/LanguageContext'
import { HomeCTA } from '@/components/sections/HomeCTA'
import { AsistanLogo } from '@/components/asistan-logo'
import { getClaim } from '@/lib/brand/claim-bank'

interface CarouselItem {
  id: number
  icon: React.ReactNode
  title: Record<Language, string>
  bullets: Record<Language, string[]>
  badgeText: Record<Language, string>
}

function buildHeroItems(): CarouselItem[] {
  return [
    {
      id: 1,
      icon: <CalendarClock className="h-8 w-8 text-[#0071E3]" />,
      title: { tr: 'Randevu Yönetimi', en: 'Appointment Management' },
      badgeText: { tr: 'Klinik Takvim', en: 'Clinic Calendar' },
      bullets: {
        tr: [
          'Çift rezervasyonu engelleyen takvim altyapısı',
          'Hasta randevu geçmişine anlık erişim',
          'Panel içi hatırlatmalar ve bildirimler',
          'Mobil ve webden gelen rezervasyon taleplerini yakalama',
        ],
        en: [
          'Calendar with double-booking prevention',
          'Instant access to patient appointment history',
          'In-panel reminders and notifications',
          'Capture booking requests from mobile and web',
        ],
      },
    },
    {
      id: 2,
      icon: <Users className="h-8 w-8 text-[#0071E3]" />,
      title: { tr: 'Hasta Kayıtları', en: 'Patient Records' },
      badgeText: {
        tr: getClaim('kvkk-controls', 'tr'),
        en: getClaim('kvkk-controls', 'en'),
      },
      bullets: {
        tr: [
          'Tüm hasta geçmişi ve klinik notlar tek yerde',
          'Rol bazlı erişimle hassas alan kontrolü',
          'Tedavi süreçlerine dair dosya, reçete ve döküman yükleme',
          'İşletme bazlı veri ayrımı',
        ],
        en: [
          'Patient history and clinical notes in one place',
          'Sensitive fields guarded by role-based access',
          'Upload files, prescriptions, and documents',
          'Business-level data isolation',
        ],
      },
    },
    {
      id: 3,
      icon: <TrendingUp className="h-8 w-8 text-[#0071E3]" />,
      title: { tr: 'Genel Bakış Özeti', en: 'Overview Summary' },
      badgeText: { tr: 'Operasyon Özeti', en: 'Operations summary' },
      bullets: {
        tr: [
          'Bugünkü randevu, bekleyen ve aktif hasta sayıları',
          'Genel bakışta aylık ciro özeti',
          'Boş slot ve dönen hasta önerileri',
          'Günlük operasyon için sade görünüm',
        ],
        en: [
          "Today's appointments, pending, and active patients",
          'Monthly turnover summary on the overview',
          'Open-slot and returning-patient suggestions',
          'A simple view for daily operations',
        ],
      },
    },
    {
      id: 4,
      icon: <Calendar className="h-8 w-8 text-[#0071E3]" />,
      title: { tr: 'Çoklu Ekip ve Takvim', en: 'Multi-staff & Calendar' },
      badgeText: { tr: 'Ekip Koordinasyonu', en: 'Staff Sync' },
      bullets: {
        tr: [
          'Hekim ve personel takvimlerini tek yerden yönetin',
          'Ortak takvimler ve görev takibi',
          'Çalışma saatleri ve müsaitlik kuralları',
          'Rol bazlı yetkilendirme (doktor, sekreter, personel)',
        ],
        en: [
          'Manage doctor and staff calendars in one place',
          'Shared calendars and task tracking',
          'Working hours and availability rules',
          'Role-based permissions (doctor, secretary, staff)',
        ],
      },
    },
    {
      id: 5,
      icon: <Smartphone className="h-8 w-8 text-[#0071E3]" />,
      title: { tr: 'Mobil Entegrasyon', en: 'Mobile App Integration' },
      badgeText: { tr: 'Mobil ve Web', en: 'Mobile & Web' },
      bullets: {
        tr: [
          'Mobil ve webden gelen rezervasyon taleplerini işleyin',
          'Tamamlanan randevuya bağlı hasta yorumları',
          'Randevu onay, iptal ve yeniden planlama takibi',
          'Klinik ayarına göre otomatik veya manuel onay',
        ],
        en: [
          'Process booking requests from mobile and web',
          'Patient reviews tied to completed appointments',
          'Track confirmations, cancellations, and reschedules',
          'Auto or manual approval based on clinic settings',
        ],
      },
    },
  ]
}

function FeatureCoverFlow({ language, t }: { language: Language; t: ReturnType<typeof useLanguage>['t'] }) {
  const reduceMotion = useReducedMotion()
  const items = useMemo(() => buildHeroItems(), [])
  const [currentIndex, setCurrentIndex] = useState(2)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev))
  }

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    if (reduceMotion) return
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold && currentIndex > 0) handlePrev()
    else if (info.offset.x < -swipeThreshold && currentIndex < items.length - 1) handleNext()
  }

  return (
    <div className="relative flex h-[520px] w-full flex-col items-center justify-center">
      <div className="relative flex h-[460px] w-full items-center justify-center" style={{ perspective: 1000 }}>
        <motion.div
          drag={reduceMotion ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="relative flex h-full w-full cursor-grab items-center justify-center active:cursor-grabbing"
        >
          {items.map((item, index) => {
            const offset = index - currentIndex
            const isCenter = offset === 0
            const xOffset = offset * 180
            const rotateY = reduceMotion ? 0 : isCenter ? 0 : offset > 0 ? -38 : 38
            const scale = isCenter ? 1.05 : reduceMotion ? 0.92 : 0.82
            const z = isCenter ? 160 : 0
            const opacity = isCenter ? 1 : 0.45
            const blurValue = reduceMotion || isCenter ? 0 : 2

            return (
              <motion.div
                key={item.id}
                className="absolute z-10 h-[410px] w-[290px] origin-center sm:h-[450px] sm:w-[325px]"
                animate={{
                  x: xOffset,
                  scale,
                  rotateY,
                  z,
                  opacity,
                  filter: `blur(${blurValue}px)`,
                }}
                transition={
                  reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 24 }
                }
                style={{
                  transformStyle: 'preserve-3d',
                  zIndex: 10 - Math.abs(offset),
                }}
              >
                <GlassCard
                  className={`flex h-full w-full flex-col justify-between rounded-3xl border-white/60 bg-white/40 p-8 shadow-2xl transition-all duration-500 ${
                    isCenter ? 'shadow-blue-500/5 ring-1 ring-[#0071E3]/20' : ''
                  }`}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div>
                      <div className="mb-5 flex items-start justify-between">
                        <div className="rounded-2xl border border-slate-100 bg-white p-3.5 text-[#0071E3] shadow-sm">
                          {item.icon}
                        </div>
                        <span className="rounded-full border border-[#0071E3]/15 bg-[#0071E3]/10 px-2.5 py-1 text-[9px] font-extrabold tracking-widest text-[#0071E3] uppercase">
                          {item.badgeText[language]}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold tracking-tight text-[#1D1D1F]">
                        {item.title[language]}
                      </h3>
                      <ul className="mt-5 space-y-2.5">
                        {item.bullets[language].map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2 text-xs leading-relaxed font-semibold text-[#5D6068]"
                          >
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <div className="z-20 mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#0071E3] hover:text-[#0071E3] active:scale-95 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
          aria-label={t({ tr: 'Önceki kart', en: 'Previous card' })}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          className="flex gap-1.5"
          role="tablist"
          aria-label={t({ tr: 'Özellik slaytları', en: 'Feature slides' })}
        >
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIndex}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-5 bg-[#0071E3]' : 'w-1.5 bg-slate-200'
              }`}
              aria-label={t({
                tr: `Slayt ${idx + 1}`,
                en: `Go to slide ${idx + 1}`,
              })}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === items.length - 1}
          className="flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-[#0071E3] hover:text-[#0071E3] active:scale-95 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400"
          aria-label={t({ tr: 'Sonraki kart', en: 'Next card' })}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

/**
 * Marketing hero = conversion/composition, not Loading/Error/Empty.
 * First viewport budget: brand + one H1 + one support + CTA group.
 * Feature coverflow lives below the fold.
 */
export function HeroCoverFlow() {
  const { language, t } = useLanguage()
  const reduceMotion = useReducedMotion()

  return (
    <>
      <section className="relative flex min-h-[min(100svh,880px)] flex-col justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 px-4 pt-28 pb-16 select-none sm:px-6 sm:pb-20">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-[#0071E3]/5 blur-[130px]" />

        <div className="relative mx-auto w-full max-w-[1220px]">
          <motion.div
            className="mx-auto flex max-w-3xl flex-col items-center space-y-5 text-center"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.45 }}
          >
            <AsistanLogo variant="dark" size="lg" priority className="mx-auto" />
            <h1 className="text-balance font-display text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.1] font-extrabold tracking-[-0.04em] text-[#1D1D1F]">
              {t({
                tr: 'Asistan ile KKTC kliniğinde randevuyu tek takvimde tutun',
                en: 'Keep Northern Cyprus clinic bookings on one Asistan calendar',
              })}
            </h1>
            <p className="max-w-2xl text-[1.05rem] leading-relaxed font-medium text-[#5D6068]">
              {t({
                tr: 'Hasta kimliği kliniklerde Person ile bağlanır; poliklinik operasyonu KKTC’ye odaklı. Hastane HIS, resmi e-reçete veya telehealth iddiası yok — dürüst sınır.',
                en: 'Patient identity links across clinics via Person; outpatient ops built for Northern Cyprus. No hospital HIS, official e-prescription, or telehealth claims — honest boundary.',
              })}
            </p>
            <HomeCTA />
          </motion.div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white px-4 pb-20 select-none sm:px-6"
        aria-labelledby="hero-features-heading"
      >
        <div className="mx-auto w-full max-w-[1220px]">
          <div className="mb-8 space-y-2 text-center">
            <h2
              id="hero-features-heading"
              className="font-display text-2xl font-extrabold tracking-tight text-[#1D1D1F] sm:text-3xl"
            >
              {t({
                tr: 'Panelde neler var',
                en: 'What you get in the panel',
              })}
            </h2>
            <p className="mx-auto max-w-xl text-sm font-medium text-[#5D6068]">
              {t({
                tr: 'Randevu, hasta kartı, ekip ve mobil talepler — kaydırarak bakın.',
                en: 'Appointments, records, team, and mobile requests — swipe through.',
              })}
            </p>
          </div>
          <FeatureCoverFlow language={language} t={t} />
        </div>
      </section>
    </>
  )
}
