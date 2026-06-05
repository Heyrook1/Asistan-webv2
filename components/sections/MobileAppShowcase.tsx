// components/sections/MobileAppShowcase.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Clock, 
  Calendar, 
  HeartPulse, 
  Star, 
  CalendarCheck2, 
  BellRing, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useLanguage, Language } from '@/contexts/LanguageContext'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  badgeText?: string
  badgeType?: 'success' | 'warning' | 'primary' | 'neutral'
}

interface PhoneScreenProps {
  title: string
  description: string
  icon: React.ReactNode
  screenIndex: number
}

// Sub-component for features
const FeatureCard = ({ icon, title, description, badgeText, badgeType = 'primary' }: FeatureCardProps) => {
  const badgeColors = {
    primary: 'bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20',
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    neutral: 'bg-slate-500/10 text-slate-600 border border-slate-500/20',
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/70 shadow-lg flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-[#0071E3]">
            {icon}
          </div>
          {badgeText && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${badgeColors[badgeType]}`}>
              {badgeText}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold tracking-tight text-[#1D1D1F]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#5D6068]">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

// Sub-component for the inner phone screens
const PhoneScreen = ({ title, description, icon, screenIndex }: PhoneScreenProps) => {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full h-full flex flex-col justify-between p-5 bg-slate-900 text-white"
    >
      {/* Top Phone Status bar */}
      <div className="flex justify-between items-center text-[10px] text-white/60 font-medium">
        <span>09:41</span>
        <div className="flex items-center gap-1">
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* App Nav Bar Mockup */}
      <div className="mt-2 flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-[11px] font-extrabold tracking-tight text-white/90">
          {t({ tr: 'Asistan Rezervasyon', en: 'Asistan Booking' })}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {/* Screen Body */}
      <div className="flex-1 flex flex-col justify-center items-center py-6 text-center space-y-4">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="p-4 rounded-full bg-white/10 border border-white/20 text-[#0071E3] shadow-inner"
        >
          {icon}
        </motion.div>

        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-widest text-[#0071E3] font-bold">
            {screenIndex === 0 
              ? t({ tr: 'Yakın Keşif', en: 'Nearby Clinics' }) 
              : screenIndex === 1 
                ? t({ tr: 'Müsaitlik', en: 'Availability' }) 
                : t({ tr: 'Onay', en: 'Confirmation' })}
          </p>
          <h4 className="text-base font-extrabold tracking-tight text-white">
            {title}
          </h4>
          <p className="text-xs text-white/60 font-medium max-w-[180px] mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Screen App Footer bar */}
      <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[9px] text-white/40">
        <span>{t({ tr: 'Keşfet', en: 'Explore' })}</span>
        <span>{t({ tr: 'Randevularım', en: 'Bookings' })}</span>
        <span>{t({ tr: 'Profilim', en: 'Account' })}</span>
      </div>
    </motion.div>
  )
}

export function MobileAppShowcase() {
  const { t, language } = useLanguage()
  const [activeScreen, setActiveScreen] = useState<number>(0)
  const [email, setEmail] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)

  // Auto-rotate phone mockup screen every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setEmail('')
  }

  // Bilingual dataset for inner phone mockup screens
  const phoneScreens = [
    {
      title: t({ tr: 'Yakındaki Klinikler', en: 'Nearby Clinics' }),
      description: t({ tr: 'Diş Hekimi • 4.9 ★ • 300m', en: 'Dentist • 4.9 ★ • 300m' }),
      icon: <MapPin className="h-7 w-7 text-white" />
    },
    {
      title: t({ tr: 'Hekim Müsaitliği', en: 'Doctor Availability' }),
      description: t({ tr: 'Bugün 14:30 • Uygun ✅', en: 'Today 14:30 • Available ✅' }),
      icon: <Clock className="h-7 w-7 text-white" />
    },
    {
      title: t({ tr: 'Anında Rezervasyon', en: 'Instant Booking' }),
      description: t({ tr: '1 saniyede onaylandı', en: 'Confirmed in 1 second' }),
      icon: <Calendar className="h-7 w-7 text-white" />
    }
  ]

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:py-28 bg-[#FFFFFF] overflow-hidden select-none">
      
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0071E3]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto w-full max-w-[1220px] relative z-10">
        
        {/* Header block */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0071E3]/20 bg-[#0071E3]/5 px-4.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0071E3]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0071E3]"></span>
            </span>
            {t({
              tr: 'ASİSTAN REZERVASYON • ÇOK YAKINDA',
              en: 'ASISTAN RESERVATION • COMING SOON'
            })}
          </div>
          <h2 className="mx-auto max-w-3xl text-balance font-display text-[clamp(2rem,4.5vw,3.4rem)] font-bold tracking-[-0.04em] text-[#1D1D1F] leading-[1.08]">
            {t({
              tr: 'Mobilde sağlık randevusunu yeniden tasarladık',
              en: 'Redesigned healthcare appointments on mobile'
            })}
          </h2>
          <p className="mx-auto max-w-3xl text-[1.1rem] leading-relaxed text-[#5D6068] font-medium">
            {t({
              tr: 'Yemek siparişi verir gibi, ama doktorlar ve klinikler için. Yakındaki klinikleri keşfedin, gerçek yorumları okuyun ve saniyeler içinde randevu oluşturun.',
              en: 'Like ordering food, but for doctors and clinics. Discover nearby clinics, read real reviews, and make appointments in seconds.'
            })}
          </p>
        </div>

        {/* Two-Column Layout (Phone left, Features right) */}
        <div className="grid gap-12 lg:grid-cols-[400px_1fr] items-center mb-20">
          
          {/* LEFT: Phone Mockup Container */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-[280px] h-[560px] rounded-[3.2rem] border-[10px] border-slate-950 bg-slate-950 shadow-2xl overflow-hidden flex flex-col justify-between">
              
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-14 h-1.5 bg-neutral-900 rounded-full" />
              </div>

              {/* Dynamic screen display */}
              <div className="w-full h-full relative z-10 rounded-[2.6rem] overflow-hidden">
                <AnimatePresence mode="wait">
                  <PhoneScreen 
                    key={activeScreen + '-' + language}
                    title={phoneScreens[activeScreen].title}
                    description={phoneScreens[activeScreen].description}
                    icon={phoneScreens[activeScreen].icon}
                    screenIndex={activeScreen}
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Carousel Navigation dots */}
            <div className="flex gap-2 mt-6">
              {phoneScreens.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveScreen(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeScreen ? 'w-6 bg-[#0071E3]' : 'w-2 bg-slate-200'
                  }`}
                  aria-label={`Go to mockup slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: 4 Glassmorphic Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard 
              icon={<HeartPulse className="h-6 w-6" />}
              title={t({ tr: 'Canlı Uygunluk', en: 'Live Availability' })}
              description={t({
                tr: 'Yeşil, sarı ve kırmızı durum rozetleriyle anlık boşlukları inceleyin.',
                en: 'Browse real-time slots colored with green, yellow, and red status tags.'
              })}
              badgeText={t({ tr: '4.9/5 Puan', en: '4.9/5 Rating' })}
              badgeType="success"
            />
            <FeatureCard 
              icon={<Star className="h-6 w-6" />}
              title={t({ tr: 'Klinik & Doktor Profilleri', en: 'Clinic & Doctor Profiles' })}
              description={t({
                tr: 'Randevu öncesinde hekim özgeçmişini, puanları ve doğrulanmış yorumları karşılaştırın.',
                en: 'Compare physician curriculum vitae, user scores, and trusted patient reviews before booking.'
              })}
              badgeText={t({ tr: 'Doğrulanmış', en: 'Verified' })}
              badgeType="primary"
            />
            <FeatureCard 
              icon={<CalendarCheck2 className="h-6 w-6" />}
              title={t({ tr: 'Tek Dokunuşla Randevu', en: 'One-Tap Booking' })}
              description={t({
                tr: 'Hizmetinizi seçin, istediğiniz saati işaretleyin ve takviminize otomatik ekleyin.',
                en: 'Choose your desired service, pick an open hour, and sync automatically to your schedule.'
              })}
              badgeText={t({ tr: '1 Saniye', en: '1 Second' })}
              badgeType="warning"
            />
            <FeatureCard 
              icon={<BellRing className="h-6 w-6" />}
              title={t({ tr: 'Akıllı Bildirim & Takip', en: 'Smart Notifications' })}
              description={t({
                tr: 'Randevu onayları, hatırlatmalar ve kontrol hekim takipleri için anlık bildirimler alın.',
                en: 'Receive instant push updates for booking confirmations, reminders, and control appointments.'
              })}
              badgeText={t({ tr: 'Takip', en: 'Follow-up' })}
              badgeType="neutral"
            />
          </div>

        </div>

        {/* Waitlist signup form */}
        <div className="mx-auto max-w-xl text-center">
          <GlassCard className="p-8 sm:p-10 bg-white/40 border-white/60 shadow-xl rounded-3xl relative overflow-hidden">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                {t({ tr: 'Erken erişim bekleme listesi', en: 'Early Access Waitlist' })}
              </h3>
              
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="flex flex-col sm:flex-row gap-2 mt-4"
                  >
                    <input 
                      type="email"
                      required
                      placeholder={t({ tr: 'E-posta adresiniz', en: 'Your email address' })}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white/80 px-4.5 text-sm text-[#1D1D1F] outline-none shadow-sm focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all duration-300"
                    />
                    <button 
                      type="submit"
                      className="h-12 rounded-2xl bg-[#0071E3] px-6 text-sm font-semibold text-white hover:bg-[#0063C8] transition-all duration-300 shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>{t({ tr: 'Bekleme Listesine Katıl', en: 'Join Waitlist' })}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm mt-4"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>
                      {t({ 
                        tr: 'Tebrikler! Bekleme listesine kaydınız başarıyla tamamlandı.', 
                        en: 'Congratulations! You have successfully joined the early access waitlist.' 
                      })}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868B] gap-2">
                <span>{t({ tr: 'Spam yok. Sadece ürün lansman haberleri.', en: 'No spam. Launch announcements only.' })}</span>
                <div className="flex items-center gap-1.5 font-mono text-[10px] bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">
                    {t({ 
                      tr: 'Güvenli Onboarding Protokolü v1.0.0-beta', 
                      en: 'Secure Onboarding Protocol v1.0.0-beta' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </section>
  )
}

// Keep the old export as alias for backward compatibility
export const MobileAppShowcaseSection = MobileAppShowcase;
