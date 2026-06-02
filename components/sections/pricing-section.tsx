'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarDays, Check, CircleX } from 'lucide-react'

import { useLandingLocale } from '@/components/sections/landing-locale'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { baseSpring, revealSoft, staggerContainer } from '@/lib/animations'
import { cn } from '@/lib/utils'

type BillingCycle = 'monthly' | 'annual'

const BASE_PLANS = [
  {
    name: 'Başlangıç',
    monthlyPrice: 1290,
    annualPrice: 1090,
    popular: false,
  },
  {
    name: 'Standart',
    monthlyPrice: 2490,
    annualPrice: 2140,
    popular: true,
  },
  {
    name: 'Kurumsal',
    monthlyPrice: null,
    annualPrice: null,
    popular: false,
  },
] as const

const PRICING_COPY = {
  tr: {
    badge: 'Fiyatlandırma',
    title: 'Klinikler için öngörülebilir fiyatlar, hastalar için ücretsiz mobil uygulama',
    description: 'Asistan Rezervasyon hastalar için ücretsizdir. Klinikler ekip büyüklüğüne ve hedeflerine göre plan seçer.',
    monthly: 'Aylık',
    annual: 'Yıllık',
    annualLabel: 'aylık, yıllık faturalandırılır',
    monthlyLabel: 'aylık',
    customLabel: 'Satış ekibiyle görüşün',
    popular: 'En çok tercih edilen',
    plans: [
      {
        note: 'Tek klinik için başlangıç paketi',
        features: ['1 lokasyon', 'Temel randevu akışı', 'Hasta kayıtları', 'Temel analiz'],
        cta: 'Başlangıç ile başla',
      },
      {
        note: 'Büyüyen ekipler için ideal',
        features: ['5 personele kadar', 'Uygulamadan rezervasyon', 'Otomatik hatırlatma', 'Rol bazlı yetki'],
        cta: 'Standart seç',
      },
      {
        note: 'Çoklu lokasyon ve kurumsal yapı',
        features: ['Özel onboarding', 'İleri güvenlik kontrolleri', 'Özel destek', 'Özel raporlama'],
        cta: 'Özel demo iste',
      },
    ],
    tableHeader: 'Özellik',
    tablePlans: ['Başlangıç', 'Standart', 'Kurumsal'],
    rows: [
      { label: 'Web panel', starter: true, standard: true, enterprise: true },
      { label: 'Hasta uygulamasında listelenme', starter: false, standard: true, enterprise: true },
      { label: 'RLS ve rol bazlı yetki', starter: false, standard: true, enterprise: true },
      { label: 'Özel onboarding', starter: false, standard: false, enterprise: true },
    ],
    demoText: 'Ekibiniz için yönlendirmeli bir kurulum görüşmesi ister misiniz?',
    demoCta: 'Demo görüşmesi planla',
  },
  en: {
    badge: 'Pricing',
    title: 'Predictable pricing for clinics, free app for patients',
    description: 'The Asistan Rezervasyon app is free to download for patients. Clinics choose a plan based on team size and growth goals.',
    monthly: 'Monthly',
    annual: 'Annual',
    annualLabel: 'per month, billed yearly',
    monthlyLabel: 'per month',
    customLabel: 'Contact sales',
    popular: 'Most popular',
    plans: [
      {
        note: 'Single clinic launch',
        features: ['1 location', 'Core booking flow', 'Patient records', 'Basic analytics'],
        cta: 'Start with Baslangic',
      },
      {
        note: 'Best for growing teams',
        features: ['Up to 5 staff', 'App-sourced bookings', 'Automation reminders', 'Role permissions'],
        cta: 'Choose Standart',
      },
      {
        note: 'Multi-location enterprise',
        features: ['Custom onboarding', 'Advanced security controls', 'Dedicated support', 'Custom reporting'],
        cta: 'Request custom demo',
      },
    ],
    tableHeader: 'Feature',
    tablePlans: ['Baslangic', 'Standart', 'Kurumsal'],
    rows: [
      { label: 'Web dashboard', starter: true, standard: true, enterprise: true },
      { label: 'Patient mobile listing', starter: false, standard: true, enterprise: true },
      { label: 'Custom permissions / RLS tiers', starter: false, standard: true, enterprise: true },
      { label: 'Dedicated onboarding', starter: false, standard: false, enterprise: true },
    ],
    demoText: 'Need a guided walkthrough for your team setup?',
    demoCta: 'Book demo call',
  },
} as const

function formatPrice(value: number | null) {
  if (value == null) return 'Özel'
  return `${value.toLocaleString('tr-TR')} TL`
}

export function PricingSection() {
  const { locale } = useLandingLocale()
  const copy = PRICING_COPY[locale]

  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const annualDiscount = useMemo(() => cycle === 'annual', [cycle])

  return (
    <section id="pricing" className="px-4 py-14 sm:px-6 lg:py-20">
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
          <motion.h2 variants={revealSoft} className="mt-3 text-balance font-display text-[clamp(1.85rem,4.3vw,3.05rem)] font-semibold tracking-[-0.02em] text-[#1D1D1F]">
            {copy.title}
          </motion.h2>
          <motion.p variants={revealSoft} className="mx-auto mt-3 max-w-3xl text-[1.03rem] leading-relaxed text-[#4B4C52]">
            {copy.description}
          </motion.p>
        </motion.div>

        <div className="mb-5 flex justify-center">
          <div className="inline-flex rounded-2xl border border-black/10 bg-white/78 p-1 shadow-glass-soft backdrop-blur-md">
            {(['monthly', 'annual'] as const).map((item) => {
              const active = cycle === item
              return (
                <motion.button
                  key={item}
                  type="button"
                  layout
                  transition={baseSpring}
                  onClick={() => setCycle(item)}
                  className={cn(
                    'tap-target rounded-xl px-4 py-2 text-sm font-semibold transition',
                    active ? 'bg-[#0071E3] text-white shadow-md' : 'text-[#4B4C52] hover:bg-black/5',
                  )}
                >
                  {item === 'monthly' ? copy.monthly : copy.annual}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {BASE_PLANS.map((plan, index) => {
            const content = copy.plans[index]
            const value = cycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice

            return (
              <GlassCard
                key={plan.name}
                tone={plan.popular ? 'accent' : 'neutral'}
                interactive
                className={cn('p-5 sm:p-6', plan.popular && 'ring-1 ring-[#0071E3]/32')}
              >
                {plan.popular && (
                  <p className="mb-4 inline-flex rounded-full bg-[#0071E3]/13 px-3 py-1 text-xs font-semibold text-[#0071E3]">
                    {copy.popular}
                  </p>
                )}

                <h3 className="text-2xl font-semibold tracking-[-0.01em] text-[#1D1D1F]">{plan.name}</h3>
                <p className="mt-1 text-sm text-[#5F6370]">{content.note}</p>
                <div className="mt-5">
                  <p className="text-[2rem] font-semibold tracking-[-0.03em] text-[#1D1D1F]">{formatPrice(value)}</p>
                  <p className="text-sm text-[#5F6370]">{value == null ? copy.customLabel : annualDiscount ? copy.annualLabel : copy.monthlyLabel}</p>
                </div>

                <ul className="mt-4 space-y-2">
                  {content.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#2E3138]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    'mt-6 h-11 w-full rounded-2xl text-sm font-semibold active:scale-[0.98]',
                    plan.popular ? 'bg-[#0071E3] text-white hover:bg-[#0063C8]' : 'bg-[#1D1D1F] text-white hover:bg-black',
                  )}
                >
                  <Link href={plan.name === 'Kurumsal' ? '/contact' : '/auth/sign-up'}>{content.cta}</Link>
                </Button>
              </GlassCard>
            )
          })}
        </div>

        <GlassCard className="mt-6 overflow-x-auto p-4 sm:p-5">
          <div className="min-w-[680px]">
            <div className="grid grid-cols-[1.3fr_repeat(3,1fr)] items-center gap-2 border-b border-black/8 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5F6370]">
              <p>{copy.tableHeader}</p>
              <p className="text-center">{copy.tablePlans[0]}</p>
              <p className="text-center">{copy.tablePlans[1]}</p>
              <p className="text-center">{copy.tablePlans[2]}</p>
            </div>
            <div className="mt-2 space-y-2">
              {copy.rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[1.3fr_repeat(3,1fr)] items-center gap-2 rounded-xl bg-white/78 px-2 py-2.5 text-sm">
                  <p className="text-[#2E3138]">{row.label}</p>
                  <StatusCell enabled={row.starter} />
                  <StatusCell enabled={row.standard} />
                  <StatusCell enabled={row.enterprise} />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/9 bg-white/72 px-4 py-3 text-sm shadow-glass-soft backdrop-blur-md">
          <p className="text-[#2E3138]">{copy.demoText}</p>
          <Button asChild className="h-10 rounded-xl bg-[#0071E3] px-4 text-sm font-semibold text-white hover:bg-[#0063C8]">
            <Link href="/contact">
              <CalendarDays className="h-4 w-4" />
              {copy.demoCta}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function StatusCell({ enabled }: { enabled: boolean }) {
  return (
    <p className="flex justify-center">
      {enabled ? (
        <Check className="h-4 w-4 text-emerald-600" />
      ) : (
        <CircleX className="h-4 w-4 text-slate-400" />
      )}
    </p>
  )
}
