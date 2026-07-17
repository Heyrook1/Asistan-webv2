'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Check,
  CircleX,
  Smartphone,
  Calendar,
  Clock,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { getRegisterPath } from '@/lib/auth-routes'
import { revealSoft, staggerContainer, appleEase } from '@/lib/animations'
import { DEMO_CONTACT_PATH } from '@/lib/entry-routes'
import {
  formatPublicPlanPrice,
  listPublicMarketingPlanCards,
  publicPlanDisplayName,
  publicPlanMonthlyAmount,
  PUBLIC_PRICING_MATRIX_ROWS,
  type PublicBillingCycle,
} from '@/lib/pricing/public-catalog'
import { cn } from '@/lib/utils'

const PRICING_COPY = {
  tr: {
    badge: 'Asistan Health — klinik planları',
    title: 'Klinikler için Asistan Health; hastalar için ücretsiz Asistan Rezervasyon',
    description:
      'Klinik aboneliği Asistan Health’tir. Hastalar Asistan Rezervasyon ile keşif ve randevu talebini ücretsiz kullanır; klinik ekip büyüklüğüne göre plan seçer.',
    freeAlert:
      'Asistan Rezervasyon hastalar için ücretsizdir (web + PWA). Ana ekrana ekleyerek kullanın; native mağaza duyurusu isteğe bağlıdır. Klinik paneli ve fiyatlandırma Asistan Health kapsamındadır.',
    monthly: 'Aylık Fatura',
    annual: 'Yıllık Fatura (Tasarruflu)',
    trialBanner:
      '14 günlük ücretsiz klinik denemesi — kayıt ile başlayın, kredi kartı gerekmez.',
    annualLabel: 'aylık, yıllık faturalandırılır',
    monthlyLabel: 'aylık',
    popular: 'Popüler plan',
    tableHeader: 'Özellik karşılaştırma matrisi',
    demoText: 'Kliniğinizin kurulum süreçlerini detaylıca görüşmek ister misiniz?',
    demoCta: 'Demo talep et',
    registerCta: 'Klinik denemesini başlat',
    demoPlanCta: 'Demo talep et',
    schedulerTitle: 'Asistan demo görüşmesi',
    schedulerSub:
      'Kliniğinize özel kurulum ve ürün yeteneklerini 15 dakikalık bir görüşmede canlı gösterelim.',
    selectDate: 'Tarih Seçin',
    selectTime: 'Saat Seçin',
    formName: 'Adınız Soyadınız',
    formClinic: 'Klinik İsmi',
    formEmail: 'E-posta Adresiniz',
    bookingSuccessTitle: 'Demo talebiniz alındı!',
    bookingSuccessSub:
      'Seçtiğiniz tarih ve saatte demo görüşme linki e-postanıza (ve takviminize) gönderilmiştir. Sizinle görüşmek için sabırsızlanıyoruz.',
    submitBooking: 'Demo talebini gönder',
  },
  en: {
    badge: 'Asistan Health — clinic plans',
    title: 'Asistan Health for clinics; free Asistan Booking for patients',
    description:
      'Clinic subscription is Asistan Health. Patients use Asistan Booking for discovery and requests at no cost; clinics pick a plan by team size.',
    freeAlert:
      'Asistan Booking is free for patients (web + PWA). Add to home screen today; native store updates are optional. Clinic panel and pricing are Asistan Health.',
    monthly: 'Billed Monthly',
    annual: 'Billed Annually (Save)',
    trialBanner: '14-day free clinic trial — start with registration, no credit card required.',
    annualLabel: 'per month, billed annually',
    monthlyLabel: 'per month',
    popular: 'Most Popular Plan',
    tableHeader: 'Detailed Feature Matrix',
    demoText: 'Would you like a customized walkthrough of the platform?',
    demoCta: 'Request a demo',
    registerCta: 'Start clinic trial',
    demoPlanCta: 'Request a demo',
    schedulerTitle: 'Request an Asistan demo',
    schedulerSub:
      'Let us show you how Asistan can optimize your clinic operations in a quick 15-minute live screen share.',
    selectDate: 'Select Date',
    selectTime: 'Select Time Slot',
    formName: 'Full Name',
    formClinic: 'Clinic Name',
    formEmail: 'Email Address',
    bookingSuccessTitle: 'Demo request received!',
    bookingSuccessSub:
      'The calendar invitation and screen-share link have been sent to your email. We look forward to meeting you.',
    submitBooking: 'Submit demo request',
  },
} as const

export function PricingSection() {
  const { locale } = useLandingLocale()
  const copy = PRICING_COPY[locale]
  const plans = useMemo(() => listPublicMarketingPlanCards(), [])

  const [cycle, setCycle] = useState<PublicBillingCycle>('monthly')
  const annualDiscount = cycle === 'annual'

  const [showScheduler, setShowScheduler] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [name, setName] = useState('')
  const [clinic, setClinic] = useState('')
  const [email, setEmail] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const mockDates = useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(today)
      nextDate.setDate(today.getDate() + i)
      if (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) {
        dates.push(
          nextDate.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })
        )
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
      <div className="absolute inset-x-0 bottom-0 h-[600px] bg-[radial-gradient(circle_at_50%_100%,rgba(0,113,227,0.04),transparent)] pointer-events-none" />

      <div className="mx-auto w-full max-w-[1220px] relative z-10">
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
          <motion.h2
            variants={revealSoft}
            className="mt-3 text-balance font-display text-[clamp(1.85rem,4.3vw,3.05rem)] font-bold tracking-[-0.035em] text-[#1D1D1F] leading-[1.1]"
          >
            {copy.title}
          </motion.h2>
          <motion.p
            variants={revealSoft}
            className="mx-auto mt-4 max-w-3xl text-[1.1rem] leading-relaxed text-[#5D6068] font-medium"
          >
            {copy.description}
          </motion.p>
        </motion.div>

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
                    active ? 'bg-[#0071E3] text-white shadow-sm' : 'text-[#5D6068] hover:bg-black/5'
                  )}
                >
                  {item === 'monthly' ? copy.monthly : copy.annual}
                </button>
              )
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: appleEase }}
          className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[#0071E3]/15 bg-[#EEF6FF]/70 px-5 py-4 text-center shadow-sm backdrop-blur-md"
        >
          <p className="text-sm font-bold text-[#1D1D1F]">{copy.trialBanner}</p>
          <Button
            asChild
            className="mt-3 h-10 rounded-xl bg-[#0071E3] px-5 text-sm font-bold text-white hover:bg-[#0063C8]"
          >
            <Link href={getRegisterPath(locale)}>{copy.registerCta}</Link>
          </Button>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {plans.map((plan, index) => {
            const value = publicPlanMonthlyAmount(plan, cycle)
            const ctaLabel =
              plan.marketing.ctaKind === 'demo' ? copy.demoPlanCta : copy.registerCta

            return (
              <motion.div
                key={plan.code}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: appleEase }}
                className="h-full"
              >
                <GlassCard
                  tone={plan.marketing.popular ? 'accent' : 'neutral'}
                  interactive
                  className={cn(
                    'p-6 sm:p-8 h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.025] bg-white/40 border-white/50 relative overflow-hidden',
                    plan.marketing.popular &&
                      'border-[#0071E3]/35 shadow-[0_20px_40px_-20px_rgba(0,113,227,0.25)] ring-1 ring-[#0071E3]/20'
                  )}
                >
                  <div>
                    {plan.marketing.popular && (
                      <p className="mb-5 inline-flex rounded-full bg-[#0071E3]/12 border border-[#0071E3]/20 px-3.5 py-1 text-xs font-bold text-[#0071E3]">
                        {copy.popular}
                      </p>
                    )}

                    <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">
                      {publicPlanDisplayName(plan, locale)}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#5D6068] font-medium leading-normal">
                      {plan.marketing.note[locale]}
                    </p>

                    <div className="mt-6 border-b border-black/5 pb-5">
                      <p className="text-[2.2rem] font-bold tracking-tight text-[#1D1D1F] leading-none">
                        {formatPublicPlanPrice(value, locale)}
                      </p>
                      <p className="text-xs text-[#5D6068] font-semibold mt-1">
                        {plan.demoOnly
                          ? plan.marketing.note[locale]
                          : annualDiscount
                            ? copy.annualLabel
                            : copy.monthlyLabel}
                      </p>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {plan.marketing.features[locale].map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-[#2E3138] font-medium leading-normal"
                        >
                          <Check className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    {plan.marketing.ctaKind === 'demo' ? (
                      <Button
                        type="button"
                        onClick={() => setShowScheduler(true)}
                        className="h-12 w-full rounded-2xl bg-[#1D1D1F] hover:bg-black text-sm font-bold text-white transition-all duration-300"
                      >
                        {ctaLabel}
                      </Button>
                    ) : (
                      <Button
                        asChild
                        className={cn(
                          'h-12 w-full rounded-2xl text-sm font-bold transition-all duration-300 active:scale-[0.98]',
                          plan.marketing.popular
                            ? 'bg-[#0071E3] hover:bg-[#0063C8] text-white shadow-md'
                            : 'bg-[#1D1D1F] hover:bg-black text-white'
                        )}
                      >
                        <Link href={getRegisterPath(locale)}>{ctaLabel}</Link>
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: appleEase }}
          className="mt-14"
        >
          <GlassCard className="overflow-x-auto p-5 sm:p-6 bg-white/40 border-white/50 shadow-xl backdrop-blur-xl">
            <div className="min-w-[760px]">
              <div
                className="grid items-center gap-4 border-b border-black/8 pb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#5D6068]"
                style={{ gridTemplateColumns: `1.4fr repeat(${plans.length}, 1fr)` }}
              >
                <p>{copy.tableHeader}</p>
                {plans.map((plan) => (
                  <p key={plan.code} className="text-center">
                    {publicPlanDisplayName(plan, locale)}
                  </p>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {PUBLIC_PRICING_MATRIX_ROWS.map((row) => (
                  <div
                    key={row.id}
                    className="grid items-center gap-4 rounded-2xl bg-white/70 px-3 py-3.5 text-sm font-medium border border-black/3 shadow-sm hover:border-[#0071E3]/10 transition-colors duration-250"
                    style={{ gridTemplateColumns: `1.4fr repeat(${plans.length}, 1fr)` }}
                  >
                    <p className="text-[#1D1D1F]">{row.label[locale]}</p>
                    {plans.map((plan) =>
                      row.kind === 'users' ? (
                        <p key={plan.code} className="text-center text-[#1D1D1F]">
                          {plan.marketing.matrix.users[locale]}
                        </p>
                      ) : (
                        <StatusCell
                          key={plan.code}
                          enabled={Boolean(plan.marketing.matrix[row.key])}
                        />
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

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

      <AnimatePresence>
        {showScheduler && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetScheduler}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: appleEase }}
              className="relative w-full max-w-lg rounded-3xl border border-white/60 bg-white/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl z-10 max-h-[92vh] overflow-y-auto"
            >
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
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
                      {copy.schedulerTitle}
                    </h3>
                    <p className="text-sm text-[#5D6068] leading-relaxed font-medium">
                      {copy.schedulerSub}
                    </p>
                  </div>

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

                  <p className="text-center text-xs text-slate-400">
                    <Link href={DEMO_CONTACT_PATH} className="underline underline-offset-2">
                      {locale === 'tr' ? 'veya iletişim formu' : 'or contact form'}
                    </Link>
                  </p>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-500/10 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                    <Check className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
                      {copy.bookingSuccessTitle}
                    </h3>
                    <p className="text-sm text-[#5D6068] leading-relaxed font-medium max-w-sm mx-auto">
                      {copy.bookingSuccessSub}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-black/5 rounded-2xl px-5 py-3.5 inline-flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {locale === 'tr' ? 'RANDEVU DETAYI' : 'APPOINTMENT DETAIL'}
                    </span>
                    <span className="text-sm font-bold text-[#1D1D1F]">
                      {selectedDate} - {selectedTime}
                    </span>
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
