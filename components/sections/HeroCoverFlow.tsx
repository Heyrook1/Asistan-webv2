// components/sections/HeroCoverFlow.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarClock, 
  Users, 
  TrendingUp, 
  Calendar, 
  Smartphone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Globe
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useLanguage, Language } from '@/contexts/LanguageContext'

interface CarouselItem {
  id: number
  icon: React.ReactNode
  title: Record<Language, string>
  bullets: Record<Language, string[]>
  badgeText: Record<Language, string>
}

export function HeroCoverFlow() {
  const { language, setLanguage, t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState<number>(2) // Center on 3rd card initially

  const items: CarouselItem[] = [
    {
      id: 1,
      icon: <CalendarClock className="h-8 w-8 text-[#0071E3]" />,
      title: {
        tr: 'Randevu Yönetimi',
        en: 'Appointment Management'
      },
      badgeText: {
        tr: 'Akıllı Takvim',
        en: 'Smart Calendar'
      },
      bullets: {
        tr: [
          'Çift rezervasyonu engelleyen akıllı takvim altyapısı',
          'Hasta randevu geçmişine anlık ve dinamik erişim',
          'SMS/e-posta yoluyla otomatik hasta hatırlatmaları',
          'Mobil uygulamadan gelen rezervasyonları canlı yakalama'
        ],
        en: [
          'Smart calendar with double-booking prevention engine',
          'Instant access to patient appointment history',
          'Automated SMS/email patient reminders',
          'Reservations from mobile app captured live'
        ]
      }
    },
    {
      id: 2,
      icon: <Users className="h-8 w-8 text-[#0071E3]" />,
      title: {
        tr: 'Hasta Kayıtları',
        en: 'Patient Records'
      },
      badgeText: {
        tr: 'KVKK Uyumlu',
        en: 'Secure Data'
      },
      bullets: {
        tr: [
          'Tüm hasta geçmişi ve tıbbi notlar tek ve güvenli yerde',
          'Kişisel sağlık verileri, kronik hastalık ve alerji uyarıları',
          'Tedavi süreçlerine dair hızlı dosya, reçete ve döküman yükleme',
          'Güvenli ve şifreli veri tabanı altyapısıyla veri arşivleme'
        ],
        en: [
          'All patient history and medical notes in one secure hub',
          'Personal health metrics, chronic illness, and allergy alerts',
          'Quickly upload medical files, prescriptions, and history',
          'Secure and encrypted database archiving protocol'
        ]
      }
    },
    {
      id: 3,
      icon: <TrendingUp className="h-8 w-8 text-[#0071E3]" />,
      title: {
        tr: 'Analiz ve Raporlar',
        en: 'Analytics & Reports'
      },
      badgeText: {
        tr: 'Derin Öngörü',
        en: 'Deep Insights'
      },
      bullets: {
        tr: [
          'Gelir tahmini, klinik doluluk oranları ve hekim performansı',
          'Aylık ve yıllık gelişim ile büyüme grafikleri analizi',
          'Klinik gider kalemleri, operasyonel maliyet ve ciro takibi',
          'Detaylı hekim hakediş ve çalışma süresi raporlaması'
        ],
        en: [
          'Revenue forecasting, occupancy rates, and doctor metrics',
          'Monthly and annual progress charts and growth analytics',
          'Clinic expense tracking and financial turnover reporting',
          'Detailed physician commission and schedule statistics'
        ]
      }
    },
    {
      id: 4,
      icon: <Calendar className="h-8 w-8 text-[#0071E3]" />,
      title: {
        tr: 'Çoklu Ekip ve Takvim',
        en: 'Multi-staff & Calendar'
      },
      badgeText: {
        tr: 'Ekip Koordinasyonu',
        en: 'Staff Sync'
      },
      bullets: {
        tr: [
          'Personel, oda, tıbbi ekipman ve cihaz planlaması',
          'Ortak takvimler, anlık görev dağılımları ve takip panelleri',
          'Çalışma saatleri, esnek vardiyalar ve izin günü koordinasyonu',
          'Gelişmiş yetkilendirme ve rol tanımlama modülleri'
        ],
        en: [
          'Staff, consultation room, and medical device coordination',
          'Shared calendars, quick task assignments, and monitoring',
          'Working hours, dynamic shifts, and vacation scheduling',
          'Advanced permission access control and custom roles'
        ]
      }
    },
    {
      id: 5,
      icon: <Smartphone className="h-8 w-8 text-[#0071E3]" />,
      title: {
        tr: 'Mobil Entegrasyon',
        en: 'Mobile App Integration'
      },
      badgeText: {
        tr: 'Canlı Ekosistem',
        en: 'Live Ecosystem'
      },
      bullets: {
        tr: [
          'Mobil uygulamadan gelen rezervasyonların otomatik işlenmesi',
          'Hastaların yaptığı doğrulanmış geri bildirim ve değerlendirmeler',
          'Randevu onay, iptal veya değişiklik durum takibi',
          'Klinik yoğunluğuna göre akıllı bekleme listesi yönetimi'
        ],
        en: [
          'Direct booking feed processed instantly from the mobile app',
          'Verified patient reviews and feedback loops updated live',
          'Real-time tracking of booking confirmations and modifications',
          'Smart waitlist queue management during peak clinical hours'
        ]
      }
    }
  ]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev))
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold && currentIndex > 0) {
      handlePrev()
    } else if (info.offset.x < -swipeThreshold && currentIndex < items.length - 1) {
      handleNext()
    }
  }

  return (
    <section className="relative pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50 overflow-hidden select-none">
      
      {/* Top right language switcher */}
      <div className="absolute top-6 right-6 z-30">
        <button
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0071E3] hover:text-[#0071E3] transition duration-300 shadow-sm cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{language === 'tr' ? 'EN' : 'TR'}</span>
        </button>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0071E3]/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="mx-auto w-full max-w-[1220px]">
        
        {/* Header Block */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0071E3] shadow-sm backdrop-blur-md">
            {t({
              tr: 'ASİSTAN SAĞLIK EKOSİSTEMİ',
              en: 'ASISTAN HEALTH ECOSYSTEM'
            })}
          </div>
          <h1 className="mx-auto max-w-4xl text-balance font-display text-[clamp(2.1rem,5vw,3.8rem)] font-extrabold tracking-[-0.04em] text-[#1D1D1F] leading-[1.08]">
            {t({
              tr: 'Klinik operasyonlarında modern, güvenilir ve hızlı deneyim',
              en: 'Modern, Reliable & Fast Clinic Operations'
            })}
          </h1>
          <p className="mx-auto max-w-3xl text-[1.1rem] leading-relaxed text-[#5D6068] font-medium">
            {t({
              tr: 'Klinikler ve hastalar için eksiksiz ekosistem – web panel + mobil uygulama (yakında). Kliniğinizi profesyonelce yönetin, hastalar saniyeler içinde randevu oluştursun.',
              en: 'Complete ecosystem for clinics and patients — web dashboard + mobile app (coming soon). Manage your clinic professionally, let patients book in seconds.'
            })}
          </p>
        </div>

        {/* 3D Cover Flow Carousel Container */}
        <div className="relative flex flex-col items-center justify-center h-[520px] w-full">
          
          {/* 3D perspective wrapper */}
          <div 
            className="relative w-full h-[460px] flex items-center justify-center"
            style={{ perspective: 1000 }}
          >
            <motion.div 
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {items.map((item, index) => {
                const offset = index - currentIndex
                const isCenter = offset === 0

                // Spacing and 3D rotation formulas
                const xOffset = offset * 180
                const rotateY = isCenter ? 0 : offset > 0 ? -38 : 38
                const scale = isCenter ? 1.05 : 0.82
                const z = isCenter ? 160 : 0
                const opacity = isCenter ? 1 : 0.45
                const blurValue = isCenter ? 0 : 2

                return (
                  <motion.div
                    key={item.id}
                    className="absolute w-[290px] h-[410px] sm:w-[325px] sm:h-[450px] origin-center z-10"
                    animate={{
                      x: xOffset,
                      scale: scale,
                      rotateY: rotateY,
                      z: z,
                      opacity: opacity,
                      filter: `blur(${blurValue}px)`
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 24,
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      zIndex: 10 - Math.abs(offset)
                    }}
                  >
                    <GlassCard 
                      className={`w-full h-full p-8 bg-white/40 border-white/60 shadow-2xl flex flex-col justify-between transition-all duration-500 rounded-3xl ${
                        isCenter ? 'ring-1 ring-[#0071E3]/20 shadow-blue-500/5' : ''
                      }`}
                    >
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          {/* Card Icon & Badge */}
                          <div className="flex items-start justify-between mb-5">
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-[#0071E3]">
                              {item.icon}
                            </div>
                            <span className="text-[9px] font-extrabold tracking-widest uppercase bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/15 px-2.5 py-1 rounded-full">
                              {item.badgeText[language]}
                            </span>
                          </div>

                          {/* Card Title */}
                          <h3 className="text-lg font-extrabold tracking-tight text-[#1D1D1F]">
                            {item.title[language]}
                          </h3>

                          {/* Dynamic detailed bullets */}
                          <ul className="mt-5 space-y-2.5">
                            {item.bullets[language].map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-[#5D6068] font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
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

          {/* Navigation Controls */}
          <div className="flex items-center gap-4 mt-6 z-20">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full border border-slate-200 bg-white shadow-sm hover:border-[#0071E3] hover:text-[#0071E3] disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all duration-300 active:scale-95"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex gap-1.5">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-5 bg-[#0071E3]' : 'w-1.5 bg-slate-200'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === items.length - 1}
              className="p-3 rounded-full border border-slate-200 bg-white shadow-sm hover:border-[#0071E3] hover:text-[#0071E3] disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all duration-300 active:scale-95"
              aria-label="Next card"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}
