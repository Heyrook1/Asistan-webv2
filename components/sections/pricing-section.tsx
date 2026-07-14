'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Check, CircleX, Smartphone, Calendar, Clock, X, ChevronRight, Loader2, AlertCircle } from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { getRegisterPath } from '@/lib/auth-routes'
import { baseSpring, revealSoft, staggerContainer, appleEase } from '@/lib/animations'
import { cn } from '@/lib/utils'

type BillingCycle = 'monthly' | 'annual'

const BASE_PLANS = [
  {
    name: { tr: 'Ücretsiz Deneme', en: 'Free Trial' },
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    trial: true,
  },
  {
    name: { tr: 'Başlangıç', en: 'Starter' },
    monthlyPrice: 1290,
    annualPrice: 1090,
    popular: false,
  },
  {
    name: { tr: 'Standart', en: 'Standard' },
    monthlyPrice: 2490,
    annualPrice: 2140,
    popular: true,
  },
  {
    name: { tr: 'Kurumsal', en: 'Enterprise' },
    monthlyPrice: null,
    annualPrice: null,
    popular: false,
  },
] as const

const PRICING_COPY = {
  tr: {
    badge: 'Asistan Health — klinik planları',
    title: 'Klinikler için Asistan Health; hastalar için ücretsiz Asistan Rezervasyon',
    description:
      'Klinik aboneliği Asistan Health’tir. Hastalar Asistan Rezervasyon ile keşif ve randevu talebini ücretsiz kullanır; klinik ekip büyüklüğüne göre plan seçer.',
    freeAlert:
      'Asistan Rezervasyon hastalar için ücretsizdir (web + mobil). Mağaza yayını için bekleme listesine katılabilirsiniz. Klinik paneli ve fiyatlandırma Asistan Health kapsamındadır.',
    monthly: 'Aylık Fatura',
    annual: 'Yıllık Fatura (Tasarruflu)',
    annualLabel: 'aylık, yıllık faturalandırılır',
    monthlyLabel: 'aylık',
    customLabel: 'Satış ekibiyle görüşün',
    popular: 'Popüler plan',
    plans: [
      {
        note: '14 Günlük deneme süreci',
        features: ['1 Klinik Lokasyonu', '1 Doktor / Hekim', 'Sınırlı Randevu Akışı', 'Temel Hasta Kayıtları'],
        cta: 'Klinik denemesini başlat',
      },
      {
        note: 'Tek muayenehane veya hekim için',
        features: ['1 Klinik lokasyonu', 'Temel randevu düzeni', 'Hasta kayıtları', 'Temel raporlama'],
        cta: 'Klinik denemesini başlat',
      },
      {
        note: 'Büyüyen poliklinikler & merkezler',
        features: ['5 hekim / personele kadar', 'Mobil uygulamada listelenme', 'Panel & e-posta hatırlatmaları', 'İşletme bazlı veri ayrımı'],
        cta: 'Klinik denemesini başlat',
      },
      {
        note: 'Çoklu lokasyon & hastane grupları',
        features: ['Sınırsız lokasyon & personel', 'Özel kurulum desteği', 'Denetim günlüğü + KVKK iş akışları', 'Güven Merkezi & kurumsal kontroller'],
        cta: 'Demo talep et',
      },
    ],
    tableHeader: 'Özellik karşılaştırma matrisi',
    tablePlans: ['Başlangıç', 'Standart', 'Kurumsal'],
    rows: [
      { label: 'Web operasyon paneli', starter: true, standard: true, enterprise: true },
      { label: 'Hasta mobil uygulamasında listelenme', starter: false, standard: true, enterprise: true },
      { label: 'Panel / e-posta hatırlatma (+ SMS kurulum desteği)', starter: false, standard: true, enterprise: true },
      { label: 'İşletme bazlı veri ayrımı', starter: false, standard: true, enterprise: true },
      { label: 'Denetim günlüğü & KVKK silme iş akışı', starter: false, standard: false, enterprise: true },
      { label: 'Çoklu şube & lokasyon desteği', starter: false, standard: false, enterprise: true },
      { label: 'Özel API entegrasyonu', starter: false, standard: false, enterprise: true },
      { label: 'Özel kurulum / personel eğitimleri', starter: false, standard: false, enterprise: true },
    ],
    demoText: 'Kliniğinizin kurulum süreçlerini detaylıca görüşmek ister misiniz?',
    demoCta: 'Demo talep et',
    
    // Scheduler UI Copy
    schedulerTitle: 'Asistan demo görüşmesi',
    schedulerSub: 'Kliniğinize özel kurulum ve ürün yeteneklerini 15 dakikalık bir görüşmede canlı gösterelim.',
    selectDate: 'Tarih Seçin',
    selectTime: 'Saat Seçin',
    formName: 'Adınız Soyadınız',
    formClinic: 'Klinik İsmi',
    formEmail: 'E-posta Adresiniz',
    bookingSuccessTitle: 'Demo talebiniz alındı!',
    bookingSuccessSub: 'Seçtiğiniz tarih ve saatte demo görüşme linki e-postanıza (ve takviminize) gönderilmiştir. Sizinle görüşmek için sabırsızlanıyoruz.',
    submitBooking: 'Demo talebini gönder',
  },
  en: {
    badge: 'Asistan Health — clinic plans',
    title: 'Asistan Health for clinics; free Asistan Booking for patients',
    description:
      'Clinic subscription is Asistan Health. Patients use Asistan Booking for discovery and requests at no cost; clinics pick a plan by team size.',
    freeAlert:
      'Asistan Booking is free for patients (web + mobile). Join the store waitlist for App Store / Play release. Clinic panel and pricing are Asistan Health.',
    monthly: 'Billed Monthly',
    annual: 'Billed Annually (Save)',
    annualLabel: 'per month, billed annually',
    monthlyLabel: 'per month',
    customLabel: 'Contact sales',
    popular: 'Most Popular Plan',
    plans: [
      {
        note: '14-day risk-free trial',
        features: ['1 Clinic Location', '1 Doctor / Practitioner', 'Limited Appointment Volume', 'Basic Patient Records'],
        cta: 'Start clinic trial',
      },
      {
        note: 'Single practitioner setup',
        features: ['1 Clinic Location', 'Core Appointment Flow', 'Patient Records', 'Basic Reports'],
        cta: 'Start clinic trial',
      },
      {
        note: 'Best for growing multi-staff clinics',
        features: ['Up to 5 Doctors / Staff', 'App Listing & Discovery', 'In-panel & email reminders', 'Business data isolation'],
        cta: 'Start clinic trial',
      },
      {
        note: 'Hospitals & multi-branch groups',
        features: ['Unlimited Staff & Locations', 'Custom setup support', 'Audit log + KVKK workflows', 'Trust Center & enterprise controls'],
        cta: 'Request a demo',
      },
    ],
    tableHeader: 'Detailed Feature Matrix',
    tablePlans: ['Starter', 'Standard', 'Enterprise'],
    rows: [
      { label: 'Web administration panel', starter: true, standard: true, enterprise: true },
      { label: 'Listing in patient booking app', starter: false, standard: true, enterprise: true },
      { label: 'In-panel / email reminders (+ SMS setup support)', starter: false, standard: true, enterprise: true },
      { label: 'Business data isolation', starter: false, standard: true, enterprise: true },
      { label: 'Audit log & KVKK deletion workflow', starter: false, standard: false, enterprise: true },
      { label: 'Multi-branch & chain support', starter: false, standard: false, enterprise: true },
      { label: 'Custom API endpoints', starter: false, standard: false, enterprise: true },
      { label: 'Custom setup & staff training', starter: false, standard: false, enterprise: true },
    ],
    demoText: 'Would you like a customized walkthrough of the platform?',
    demoCta: 'Request a demo',

    // Scheduler UI Copy
    schedulerTitle: 'Request an Asistan demo',
    schedulerSub: 'Let us show you how Asistan can optimize your clinic operations in a quick 15-minute live screen share.',
    selectDate: 'Select Date',
    selectTime: 'Select Time Slot',
    formName: 'Full Name',
    formClinic: 'Clinic Name',
    formEmail: 'Email Address',
    bookingSuccessTitle: 'Demo request received!',
    bookingSuccessSub: 'The calendar invitation and screen-share link have been sent to your email. We look forward to meeting you.',
    submitBooking: 'Submit demo request',
  },
} as const

function formatPrice(value: number | null, locale: string) {
  if (value == null) return locale === 'tr' ? 'Özel' : 'Custom'
  return locale === 'tr'
    ? `${value.toLocaleString('tr-TR')} TL`
    : `${value.toLocaleString('en-US')} TL`
}

export function PricingSection() {
  const { locale } = useLandingLocale()
  const copy = PRICING_COPY[locale]

  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const annualDiscount = useMemo(() => cycle === 'annual', [cycle])

  // Scheduler Dialog State
  const [showScheduler, setShowScheduler] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [name, setName] = useState('')
  const [clinic, setClinic] = useState('')
  const [email, setEmail] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Mock slots
  const mockDates = useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(today)
      nextDate.setDate(today.getDate() + i)
      // Skip weekends
      if (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) {
        dates.push(nextDate.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }))
      }
    }
    return dates
  }, [locale])

  const mockTimes = ['10:00', '11:30', '14:00', '15:30', '16:45']

  async function handleBookDemo(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !name || !clinic || !email) return

    setBookingLoading(true)
    setBookingError('')

    try {
      const res = await fetch('/api/demo-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clinic, email, date: selectedDate, time: selectedTime }),
      })

      const data: { success?: boolean; error?: string } = await res.json()

      if (!res.ok || !data.success) {
        setBookingError(
          data.error ??
            (locale === 'tr'
              ? 'Rezervasyon oluşturulamadı. Lütfen tekrar deneyin.'
              : 'Could not create booking. Please try again.')
        )
        return
      }

      setBookingSuccess(true)
    } catch {
      setBookingError(
        locale === 'tr'
          ? 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
          : 'Connection error. Please check your internet connection.'
      )
    } finally {
      setBookingLoading(false)
    }
  }

  function resetScheduler() {
    setShowScheduler(false)
    setBookingSuccess(false)
    setBookingLoading(false)
    setBookingError('')
    setSelectedDate('')
    setSelectedTime('')
    setName('')
    setClinic('')
    setEmail('')
  }

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 lg:py-28 bg-[#FBFBFA] relative overflow-hidden">
      
      {/* Visual background accents */}
      <div className="absolute inset-x-0 bottom-0 h-[600px] bg-[radial-gradient(circle_at_50%_100%,rgba(0,113,227,0.04),transparent)] pointer-events-none" />

      <div className="mx-auto w-full max-w-[1220px] relative z-10">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer(0.08, 0.02)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -8% 0px' }}
          className="mb-12 text-center"
        >
          <motion.p variants={revealSoft} className="text-xs font-bold uppercase tracking-[0.18em] text-[#0071E3]">
            {copy.badge}
          </motion.p>
          <motion.h2 variants={revealSoft} className="mt-3 text-balance font-display text-[clamp(1.85rem,4.3vw,3.05rem)] font-bold tracking-[-0.035em] text-[#1D1D1F] leading-[1.1]">
            {copy.title}
          </motion.h2>
          <motion.p variants={revealSoft} className="mx-auto mt-4 max-w-3xl text-[1.1rem] leading-relaxed text-[#5D6068] font-medium">
            {copy.description}
          </motion.p>
        </motion.div>

        {/* Patient App Banner announcement */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: appleEase }}
          className="mx-auto mb-10 max-w-3xl rounded-2xl border border-[#0071E3]/15 bg-[#EEF6FF]/60 px-4 py-3 text-center shadow-sm backdrop-blur-md flex items-center justify-center gap-2.5 text-xs sm:text-sm text-[#0071E3] font-bold"
        >
          <Smartphone className="h-4.5 w-4.5 shrink-0" />
          <span>{copy.freeAlert}</span>
        </motion.div>

        {/* Toggle Switch */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-black/10 bg-white/70 p-1 shadow-md backdrop-blur-md">
            {(['monthly', 'annual'] as const).map((item) => {
              const active = cycle === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCycle(item)}
                  className={cn(
                    'tap-target rounded-xl px-5 py-2 text-sm font-bold transition-all duration-300',
                    active ? 'bg-[#0071E3] text-white shadow-sm' : 'text-[#5D6068] hover:bg-black/5',
                  )}
                >
                  {item === 'monthly' ? copy.monthly : copy.annual}
                </button>
              )
            })}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {BASE_PLANS.map((plan, index) => {
            const content = copy.plans[index]
            const value = cycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice

            return (
              <motion.div
                key={plan.name.tr}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: appleEase }}
                className="h-full"
              >
                <GlassCard
                  tone={plan.popular ? 'accent' : 'neutral'}
                  interactive
                  className={cn(
                    'p-6 sm:p-8 h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.025] bg-white/40 border-white/50 relative overflow-hidden',
                    plan.popular && 'border-[#0071E3]/35 shadow-[0_20px_40px_-20px_rgba(0,113,227,0.25)] ring-1 ring-[#0071E3]/20'
                  )}
                >
                  <div>
                    {plan.popular && (
                      <p className="mb-5 inline-flex rounded-full bg-[#0071E3]/12 border border-[#0071E3]/20 px-3.5 py-1 text-xs font-bold text-[#0071E3]">
                        {copy.popular}
                      </p>
                    )}

                    <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">{plan.name[locale]}</h3>
                    <p className="mt-1.5 text-sm text-[#5D6068] font-medium leading-normal">{content.note}</p>
                    
                    <div className="mt-6 border-b border-black/5 pb-5">
                      <p className="text-[2.2rem] font-bold tracking-tight text-[#1D1D1F] leading-none">
                        {formatPrice(value, locale)}
                      </p>
                      <p className="text-xs text-[#5D6068] font-semibold mt-1">
                        {value == null ? copy.customLabel : annualDiscount ? copy.annualLabel : copy.monthlyLabel}
                      </p>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {content.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-[#2E3138] font-medium leading-normal">
                          <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    {plan.name.tr === 'Kurumsal' ? (
                      <Button
                        type="button"
                        onClick={() => setShowScheduler(true)}
                        className="h-12 w-full rounded-2xl bg-[#1D1D1F] hover:bg-black text-sm font-bold text-white transition-all duration-300"
                      >
                        {content.cta}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className={cn(
                          'h-12 w-full rounded-2xl text-sm font-bold transition-all duration-300 active:scale-[0.98]',
                          plan.popular ? 'bg-[#0071E3] hover:bg-[#0063C8] text-white shadow-md' : 'bg-[#1D1D1F] hover:bg-black text-white'
                        )}
                      >
                        <Link href={getRegisterPath(locale)}>{content.cta}</Link>
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: appleEase }}
          className="mt-14"
        >
          <GlassCard className="overflow-x-auto p-5 sm:p-6 bg-white/40 border-white/50 shadow-xl backdrop-blur-xl">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] items-center gap-4 border-b border-black/8 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#5D6068]">
                <p>{copy.tableHeader}</p>
                <p className="text-center">{copy.tablePlans[0]}</p>
                <p className="text-center">{copy.tablePlans[1]}</p>
                <p className="text-center">{copy.tablePlans[2]}</p>
              </div>
              <div className="mt-3 space-y-2">
                {copy.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1.4fr_repeat(3,1fr)] items-center gap-4 rounded-2xl bg-white/70 px-3 py-3.5 text-sm font-medium border border-black/3 shadow-sm hover:border-[#0071E3]/10 transition-colors duration-250">
                    <p className="text-[#1D1D1F]">{row.label}</p>
                    <StatusCell enabled={row.starter} />
                    <StatusCell enabled={row.standard} />
                    <StatusCell enabled={row.enterprise} />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Footer Demo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: appleEase }}
          className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/60 px-6 py-4.5 text-sm shadow-md backdrop-blur-md"
        >
          <p className="text-[#1D1D1F] font-bold text-base">{copy.demoText}</p>
          <Button
            type="button"
            onClick={() => setShowScheduler(true)}
            className="h-11 rounded-xl bg-[#0071E3] hover:bg-[#0063C8] px-5 text-sm font-bold text-white shadow-sm transition-all duration-300"
          >
            <CalendarDays className="h-4.5 w-4.5 mr-1.5" />
            {copy.demoCta}
          </Button>
        </motion.div>
      </div>

      {/* Scheduler Modal Popup */}
      <AnimatePresence>
        {showScheduler && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetScheduler}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: appleEase }}
              className="relative w-full max-w-lg rounded-3xl border border-white/60 bg-white/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl z-10 max-h-[92vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={resetScheduler}
                className="absolute top-5 right-5 p-1.5 rounded-full border border-black/5 bg-white hover:bg-slate-100 text-slate-500 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>

              {!bookingSuccess ? (
                <form onSubmit={handleBookDemo} className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">{copy.schedulerTitle}</h3>
                    <p className="text-sm text-[#5D6068] leading-relaxed font-medium">{copy.schedulerSub}</p>
                  </div>

                  {/* Pick Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {copy.selectDate}
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {mockDates.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            'px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all duration-300',
                            selectedDate === date
                              ? 'border-[#0071E3] bg-[#EEF6FF] text-[#0071E3] shadow-sm'
                              : 'border-black/5 bg-white text-[#2E3138] hover:bg-slate-50'
                          )}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pick Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {copy.selectTime}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {mockTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            'px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-300',
                            selectedTime === time
                              ? 'border-[#0071E3] bg-[#EEF6FF] text-[#0071E3] shadow-sm'
                              : 'border-black/5 bg-white text-[#2E3138] hover:bg-slate-50'
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-3.5 pt-1">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={copy.formName}
                      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
                    />
                    <input
                      type="text"
                      required
                      value={clinic}
                      onChange={(e) => setClinic(e.target.value)}
                      placeholder={copy.formClinic}
                      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={copy.formEmail}
                      className="h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
                    />
                  </div>

                  {bookingError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedDate || !selectedTime || bookingLoading}
                    className="h-12 w-full rounded-2xl bg-[#0071E3] hover:bg-[#0063C8] text-sm font-bold text-white shadow-md transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {locale === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        {copy.submitBooking}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-500/10 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                    <Check className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">{copy.bookingSuccessTitle}</h3>
                    <p className="text-sm text-[#5D6068] leading-relaxed font-medium max-w-sm mx-auto">{copy.bookingSuccessSub}</p>
                  </div>
                  
                  {/* Selected Slot summary */}
                  <div className="bg-slate-50 border border-black/5 rounded-2xl px-5 py-3.5 inline-flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{locale === 'tr' ? 'RANDEVU DETAYI' : 'APPOINTMENT DETAIL'}</span>
                    <span className="text-sm font-bold text-[#1D1D1F]">{selectedDate} - {selectedTime}</span>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      onClick={resetScheduler}
                      className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold px-6"
                    >
                      {locale === 'tr' ? 'Kapat' : 'Close'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  )
}

function StatusCell({ enabled }: { enabled: boolean }) {
  return (
    <p className="flex justify-center">
      {enabled ? (
        <Check className="h-4.5 w-4.5 text-emerald-600" />
      ) : (
        <CircleX className="h-4.5 w-4.5 text-slate-300" />
      )}
    </p>
  )
}
