// components/sections/MobileAppShowcase.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
import { productName } from '@/lib/brand/masterbrand'

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
          {t({
            tr: productName('booking', 'tr'),
            en: productName('booking', 'en'),
          })}
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
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // Auto-rotate phone mockup screen every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        data?: { success?: boolean }
      }
      if (!res.ok || data.ok === false) {
        setError(
          data.error ??
            t({
              tr: 'Kayıt tamamlanamadı. Lütfen tekrar deneyin.',
              en: 'Could not join the waitlist. Please try again.',
            })
        )
        return
      }
      setSubmitted(true)
      setEmail('')
    } catch {
      setError(
        t({
          tr: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
          en: 'Connection error. Please check your connection.',
        })
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Bilingual dataset for inner phone mockup screens
  const phoneScreens = [
    {
      title: t({ tr: 'Yakındaki Klinikler', en: 'Nearby Clinics' }),
      description: t({ tr: 'Diş Hekimi • Lefkoşa • 300m', en: 'Dentist • Nicosia • 300m' }),
      icon: <MapPin className="h-7 w-7 text-white" />
    },
    {
      title: t({ tr: 'Hekim Müsaitliği', en: 'Doctor Availability' }),
      description: t({ tr: 'Bugün 14:30 • Uygun', en: 'Today 14:30 • Available' }),
      icon: <Clock className="h-7 w-7 text-white" />
    },
    {
      title: t({ tr: 'Randevu Talebi', en: 'Booking Request' }),
      description: t({ tr: 'Klinik onayına gönderildi', en: 'Sent for clinic confirmation' }),
      icon: <Calendar className="h-7 w-7 text-white" />
    }
  ]

  return (
    <section id="waitlist" className="relative px-4 py-20 sm:px-6 lg:py-28 bg-[#FFFFFF] overflow-hidden select-none">
      
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
              tr: 'ASİSTAN REZERVASYON • HASTA UYGULAMASI',
              en: 'ASISTAN BOOKING · PATIENT APP'
            })}
          </div>
          <h2 className="mx-auto max-w-3xl text-balance font-display text-[clamp(2rem,4.5vw,3.4rem)] font-bold tracking-[-0.04em] text-[#1D1D1F] leading-[1.08]">
            {t({
              tr: 'Mobilde sağlık randevusunu yeniden tasarladık',
              en: 'Healthcare booking redesigned for mobile'
            })}
          </h2>
          <p className="mx-auto max-w-3xl text-[1.1rem] leading-relaxed text-[#5D6068] font-medium">
            {t({
              tr: 'Yakındaki klinikleri keşfedin, gerçek yorumları okuyun ve saniyeler içinde randevu talebi oluşturun.',
              en: 'Discover nearby clinics, read real reviews, and request appointments in seconds.'
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
                en: 'Browse real-time availability colored with green, yellow, and red status tags.'
              })}
              badgeText={t({ tr: 'Canlı müsaitlik', en: 'Live availability' })}
              badgeType="success"
            />
            <FeatureCard 
              icon={<Star className="h-6 w-6" />}
              title={t({ tr: 'Klinik & Doktor Profilleri', en: 'Clinic & Doctor Profiles' })}
              description={t({
                tr: 'Randevu öncesinde hekim bilgilerini ve tamamlanmış randevuya bağlı gerçek yorumları görün.',
                en: 'See doctor profiles and real reviews tied to completed appointments before booking.'
              })}
              badgeText={t({ tr: 'Gerçek yorum', en: 'Real reviews' })}
              badgeType="primary"
            />
            <FeatureCard 
              icon={<CalendarCheck2 className="h-6 w-6" />}
              title={t({ tr: 'Randevu Talebi', en: 'Booking Request' })}
              description={t({
                tr: 'Hizmet ve saati seçin; klinik ayarına göre otomatik veya manuel onayla ilerleyin.',
                en: 'Pick a service and time; proceed with auto or manual confirmation based on clinic settings.'
              })}
              badgeText={t({ tr: 'Web + mobil', en: 'Web + mobile' })}
              badgeType="warning"
            />
            <FeatureCard 
              icon={<BellRing className="h-6 w-6" />}
              title={t({ tr: 'Bildirim & Hatırlatma', en: 'Alerts & Reminders' })}
              description={t({
                tr: 'Randevu durumu ve panel bildirimleriyle takip edin. SMS için webhook kurulumu gerekir.',
                en: 'Follow appointment status via in-app alerts. SMS requires webhook setup.'
              })}
              badgeText={t({ tr: 'Panel', en: 'In-app' })}
              badgeType="neutral"
            />
          </div>

        </div>

        {/* Waitlist signup form */}
        <div className="mx-auto max-w-xl text-center">
          <GlassCard className="p-8 sm:p-10 bg-white/40 border-white/60 shadow-xl rounded-3xl relative overflow-hidden">
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                {t({ tr: 'Mağaza yayını için bekleme listesi', en: 'Store release waitlist' })}
              </h3>
              <p className="text-sm text-[#5D6068]">
                {t({
                  tr: 'Web randevusu bugün açık. App Store / Google Play duyurusu için e-posta bırakın.',
                  en: 'Web booking is live today. Leave your email for App Store / Google Play updates.',
                })}
              </p>
              
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="mt-4 space-y-2"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row">
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
                        disabled={submitting}
                        className="h-12 rounded-2xl bg-[#0071E3] px-6 text-sm font-semibold text-white hover:bg-[#0063C8] transition-all duration-300 shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                      >
                        <span>
                          {submitting
                            ? t({ tr: 'Kaydediliyor…', en: 'Saving…' })
                            : t({ tr: 'Mağaza bekleme listesine katıl', en: 'Join store waitlist' })}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    {error ? (
                      <p className="text-left text-xs font-medium text-red-600">{error}</p>
                    ) : null}
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
                <span>{t({ tr: 'Spam yok. Sadece mağaza lansman haberleri.', en: 'No spam. Store launch updates only.' })}</span>
                <Link
                  href="/client"
                  className="inline-flex items-center gap-1 font-semibold text-[#0071E3] hover:underline"
                >
                  {t({ tr: 'Webden hasta randevusu al →', en: 'Book as patient on web →' })}
                </Link>
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
