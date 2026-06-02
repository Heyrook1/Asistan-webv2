'use client'

import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BellRing,
  CalendarCheck2,
  HeartPulse,
  MapPin,
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { revealSoft, staggerContainer } from '@/lib/animations'

const MOBILE_COPY = {
  tr: {
    badge: 'Asistan Rezervasyon',
    comingSoon: 'Yakında',
    title: 'Mobilde sağlık randevusunu yeniden tasarladık',
    description:
      'Yemek uygulamaları gibi, ama doktorlar ve klinikler için. Yakındaki klinikleri keşfedin, gerçek hasta yorumlarını okuyun, doktor uygunluklarını görün ve telefondan anında randevu oluşturun.',
    cards: [
      {
        title: 'Gerçek zamanlı uygunluk',
        description: 'Yeşil, sarı, kırmızı durum rozetleriyle anlık boşlukları görün.',
        badge: 'Canlı',
      },
      {
        title: 'Klinik ve doktor profilleri',
        description: 'Randevu öncesinde doktor, hizmet, puan ve yorum geçmişini karşılaştırın.',
        badge: '4.9 puan',
      },
      {
        title: 'Tek dokunuşla randevu',
        description: 'Hizmeti seçin, saati seçin, takvime otomatik ekleyin.',
        badge: 'Hızlı',
      },
      {
        title: 'Bildirim ve hatırlatma',
        description: 'Randevu güncellemeleri ve takip süreçleri için uygulama içi bildirim alın.',
        badge: 'Sürekli',
      },
    ],
    findNearby: 'Yakınımdaki klinikleri bul',
    openNow: 'Şu an açık',
    away: '1.2 km uzakta',
    slot: 'Sıradaki uygun saat: Bugün 16:30',
    slotText: 'Tek dokunuşla ayır, takvime eşitle',
    earlyAccess: 'Erken erişim al',
    earlyAccessText: 'Bekleme listesine katılın; Asistan Rezervasyon beta açılışından ilk siz haberdar olun.',
    placeholder: 'adiniz@ornek.com',
    submit: 'Erken erişim al',
    submitted: 'Teşekkürler. Beta açılınca size haber vereceğiz.',
    notSubmitted: 'Spam yok. Sadece ürün gelişmeleri.',
    secure: 'Güvenli kayıt akışı',
  },
  en: {
    badge: 'Asistan Rezervasyon',
    comingSoon: 'Coming soon',
    title: 'Healthcare booking, reimagined for mobile',
    description:
      'Like food delivery, but for doctors and clinics. Browse nearby clinics, read real patient reviews, check doctor availability, and book appointments instantly - all from your phone.',
    cards: [
      {
        title: 'Real-time availability',
        description: 'See available slots instantly with green, yellow, red urgency badges.',
        badge: 'Live',
      },
      {
        title: 'Clinic and doctor profiles',
        description: 'Compare verified doctors, services, ratings, and review history before booking.',
        badge: '4.9 rating',
      },
      {
        title: 'One-tap booking',
        description: 'Choose a service, pick a slot, and sync to your calendar in a few seconds.',
        badge: 'Fast',
      },
      {
        title: 'Notifications and reminders',
        description: 'Stay on track with in-app reminders for appointment updates and follow-ups.',
        badge: 'Always on',
      },
    ],
    findNearby: 'Find clinics near me',
    openNow: 'Open now',
    away: '1.2 km away',
    slot: 'Next slot: Today 16:30',
    slotText: 'One tap to reserve and sync to calendar',
    earlyAccess: 'Get early access',
    earlyAccessText: 'Join the waiting list and be first to test Asistan Rezervasyon.',
    placeholder: 'name@clinic.com',
    submit: 'Get early access',
    submitted: 'Thanks. We will notify you when the beta opens.',
    notSubmitted: 'No spam. Product milestones only.',
    secure: 'Secure onboarding flow',
  },
} as const

const badgeClasses = [
  'bg-emerald-500/18 text-emerald-700',
  'bg-amber-400/22 text-amber-800',
  'bg-sky-500/18 text-sky-700',
  'bg-violet-500/18 text-violet-700',
] as const

const icons = [HeartPulse, Star, CalendarCheck2, BellRing] as const

export function MobileAppShowcaseSection() {
  const { locale } = useLandingLocale()
  const copy = MOBILE_COPY[locale]

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section id="waitlist" className="px-4 py-14 sm:px-6 lg:py-20">
      <motion.div
        variants={staggerContainer(0.07, 0.02)}
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: '-8% 0px -6% 0px' }}
        className="mx-auto grid w-full max-w-[1220px] gap-6 xl:grid-cols-[1.15fr_0.85fr]"
      >
        <motion.div variants={revealSoft} className="space-y-5">
          <p className="inline-flex items-center rounded-full border border-black/10 bg-white/78 px-3 py-1 text-xs font-semibold uppercase tracking-[0.13em] text-[#0071E3] backdrop-blur-md">
            {copy.badge}
            <span className="ml-2 rounded-full bg-[#0071E3]/12 px-2 py-0.5 text-[10px] tracking-[0.08em] text-[#0071E3]">
              {copy.comingSoon}
            </span>
          </p>
          <h2 className="text-balance font-display text-[clamp(1.85rem,4.6vw,3.2rem)] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
            {copy.title}
          </h2>
          <p className="max-w-3xl text-[1.05rem] leading-relaxed text-[#4B4C52]">
            {copy.description}
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {copy.cards.map((feature, index) => {
              const Icon = icons[index]
              return (
                <GlassCard key={feature.title} interactive className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Icon className="h-5 w-5 text-[#0071E3]" />
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClasses[index]}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[1.02rem] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#5F6370]">{feature.description}</p>
                </GlassCard>
              )
            })}
          </div>
        </motion.div>

        <motion.div variants={revealSoft} className="space-y-4">
          <GlassCard tone="accent" className="p-4 sm:p-5">
            <div className="mx-auto w-full max-w-[320px] rounded-[2.2rem] border border-black/8 bg-[#FAFAFC] p-3 shadow-[0_22px_44px_-30px_rgba(0,113,227,0.62)]">
              <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-black/12" />
              <div className="space-y-3 rounded-[1.6rem] border border-black/7 bg-white p-3">
                <div className="flex items-center gap-2 rounded-xl bg-[#EEF6FF] p-2.5">
                  <Search className="h-4 w-4 text-[#0071E3]" />
                  <p className="text-xs font-semibold text-[#1D1D1F]">{copy.findNearby}</p>
                </div>
                <div className="rounded-xl border border-black/7 p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#1D1D1F]">Northcare Clinic</p>
                    <span className="text-[11px] font-semibold text-emerald-700">{copy.openNow}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[#5F6370]">
                    <MapPin className="h-3.5 w-3.5" />
                    {copy.away}
                    <span className="mx-1 h-1 w-1 rounded-full bg-black/20" />
                    4.8 (214)
                  </div>
                </div>
                <div className="rounded-xl border border-black/7 p-2.5">
                  <p className="text-xs font-semibold text-[#1D1D1F]">{copy.slot}</p>
                  <p className="mt-1 text-[11px] text-[#5F6370]">{copy.slotText}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5">
            <p className="text-sm font-semibold text-[#1D1D1F]">{copy.earlyAccess}</p>
            <p className="mt-1 text-sm text-[#5F6370]">
              {copy.earlyAccessText}
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSubmitted(false)
                }}
                placeholder={copy.placeholder}
                className="h-11 flex-1 rounded-2xl border border-black/10 bg-white/75 px-4 text-sm text-[#1D1D1F] shadow-inner outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
              />
              <Button type="submit" className="h-11 rounded-2xl bg-[#0071E3] px-5 text-sm font-semibold text-white hover:bg-[#0063C8] active:scale-[0.98]">
                {copy.submit}
              </Button>
            </form>
            <p className="mt-2 text-xs text-[#5F6370]">
              {submitted ? copy.submitted : copy.notSubmitted}
            </p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {copy.secure}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  )
}
