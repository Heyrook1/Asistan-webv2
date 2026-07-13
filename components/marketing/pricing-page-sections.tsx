'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'

type BillingMode = 'monthly' | 'yearly'

type Plan = {
  name: string
  eyebrow: string
  description: string
  monthlyPrice: number | null
  cta: string
  href: string
  highlighted?: boolean
  features: string[]
  matrix: {
    users: string
    patients: string
    reminders: boolean
    analytics: boolean
    api: boolean
    onboarding: boolean
  }
}

const clinicTrialHref = getClinicTrialPath('tr')

const plans: Plan[] = [
  {
    name: 'Baslangic',
    eyebrow: 'Kucuk klinikler',
    description: 'Tek hekim veya kucuk ekipler icin sade randevu ve hasta yonetimi.',
    monthlyPrice: 1290,
    cta: ENTRY_CTA.clinicTrial.tr,
    href: clinicTrialHref,
    features: ['1 kullanici', '500 hasta', 'Randevu yonetimi', 'Temel raporlama'],
    matrix: {
      users: '1',
      patients: '500',
      reminders: true,
      analytics: false,
      api: false,
      onboarding: false,
    },
  },
  {
    name: 'Standart',
    eyebrow: 'Buyuyen ekipler',
    description: 'Sekreter + doktor yapisinda ekip koordinasyonunu guclendirir.',
    monthlyPrice: 2490,
    cta: ENTRY_CTA.clinicTrial.tr,
    href: clinicTrialHref,
    features: ['5 kullanici', '2.000 hasta', 'Gelismis raporlama', 'Panel + e-posta hatirlatma'],
    matrix: {
      users: '5',
      patients: '2.000',
      reminders: true,
      analytics: true,
      api: false,
      onboarding: false,
    },
  },
  {
    name: 'Profesyonel',
    eyebrow: 'En populer',
    description: 'Operasyon otomasyonu ve ileri panel ihtiyaci olan klinikler icin.',
    monthlyPrice: 4890,
    cta: ENTRY_CTA.clinicTrial.tr,
    href: clinicTrialHref,
    highlighted: true,
    features: ['Sinirsiz kullanici', 'Sinirsiz hasta', 'Otomasyon akislari', 'API erisimi'],
    matrix: {
      users: 'Sinirsiz',
      patients: 'Sinirsiz',
      reminders: true,
      analytics: true,
      api: true,
      onboarding: true,
    },
  },
  {
    name: 'Kurumsal',
    eyebrow: 'Ozel kurulum',
    description: 'Cok subeli yapilar ve ozel guvenlik/entegrasyon talepleri.',
    monthlyPrice: null,
    cta: ENTRY_CTA.demoRequest.tr,
    href: DEMO_CONTACT_PATH,
    features: ['Ozel entegrasyonlar', 'KVKK odakli destek', 'Egitim + danismanlik', 'Ozel raporlama'],
    matrix: {
      users: 'Sinirsiz',
      patients: 'Sinirsiz',
      reminders: true,
      analytics: true,
      api: true,
      onboarding: true,
    },
  },
]

const trustItems = ['KVKK uyumu', 'Guvenli altyapi', 'Veri yedekleme', '%99.9 uptime', 'TR/KKTC veri bolgesi']

const faqs = [
  {
    question: 'Planimi istedigim zaman degistirebilir miyim?',
    answer: 'Evet. Paket gecisleri donem sonunda veya ihtiyac aninda planli sekilde yapilabilir.',
  },
  {
    question: 'Yillik odemede indirim var mi?',
    answer: 'Yillik mod secildiginde aylik liste fiyatina gore %20 avantaj uygulanir.',
  },
  {
    question: 'Kurumsal fiyat nasil belirleniyor?',
    answer: 'Sube sayisi, entegrasyon ihtiyaci ve guvenlik kapsamiyla birlikte ozel teklif cikartilir.',
  },
  {
    question: 'Hasta verileri nasil korunuyor?',
    answer: 'Rol bazli erisim, tenant ayrimi ve audit izleriyle guvenli veri modeli uygulanir.',
  },
]

function formatPrice(value: number | null, mode: BillingMode) {
  if (value === null) return 'Iletisime Gecin'
  if (mode === 'monthly') return `TL ${value.toLocaleString('tr-TR')}`
  const yearly = Math.round(value * 12 * 0.8)
  return `TL ${yearly.toLocaleString('tr-TR')}`
}

function valueOrDash(enabled: boolean) {
  return enabled ? <Check className="mx-auto h-4 w-4 text-brand-teal" aria-hidden="true" /> : <span className="mx-auto block h-4 w-4 text-slate-300">-</span>
}

export function PricingPageSections() {
  const [mode, setMode] = useState<BillingMode>('monthly')

  const modeLabel = useMemo(
    () => (mode === 'monthly' ? 'Aylik Faturalandirma' : 'Yillik Faturalandirma (%20 avantaj)'),
    [mode]
  )

  return (
    <>
      <section id="sss" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="inline-flex rounded-xl border border-brand-blue/15 bg-white p-1">
              <button
                type="button"
                onClick={() => setMode('monthly')}
                className={`min-h-10 rounded-lg px-4 text-sm font-semibold ${mode === 'monthly' ? 'bg-brand-blue text-white' : 'text-slate-600'}`}
              >
                Aylik
              </button>
              <button
                type="button"
                onClick={() => setMode('yearly')}
                className={`min-h-10 rounded-lg px-4 text-sm font-semibold ${mode === 'yearly' ? 'bg-brand-blue text-white' : 'text-slate-600'}`}
              >
                Yillik
              </button>
            </div>
            <p className="text-xs font-semibold text-brand-blue">{modeLabel}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`relative h-full rounded-2xl border bg-white p-6 transition-shadow hover:shadow-lg ${plan.highlighted ? 'border-brand-blue shadow-lg shadow-brand-blue/10' : 'border-slate-200'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-4 py-1.5 text-xs font-semibold text-white">
                    En Populer
                  </div>
                )}
                <p className="text-sm font-semibold text-brand-teal">{plan.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold text-brand-navy">{plan.name}</h2>
                <p className="mt-3 min-h-16 text-sm leading-relaxed text-slate-500">{plan.description}</p>

                <div className="mb-6 mt-6 rounded-2xl bg-dashboard-surface p-5">
                  <p className="text-3xl font-black text-brand-navy">{formatPrice(plan.monthlyPrice, mode)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{plan.monthlyPrice === null ? 'Kuruma ozel fiyatlandirma' : mode === 'monthly' ? '/ ay' : '/ yil'}</p>
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-slate-600">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-auto min-h-11 w-full rounded-xl ${plan.highlighted ? 'bg-brand-teal text-white hover:bg-brand-teal-hover' : 'border-slate-300 bg-white text-brand-navy hover:bg-dashboard-surface'}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  <Link href={plan.href} aria-label={`${plan.name} icin ${plan.cta}`}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dashboard-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-brand-blue/10 bg-white p-4">
            <h3 className="text-lg font-bold text-brand-navy">Plan Karsilastirmasi</h3>
            <p className="mt-1 text-sm text-slate-500">Kliniginizin olcegine gore hangi planin uygun oldugunu hizlica karsilastirin.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-dashboard-surface">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Ozellik</th>
                  {plans.map((plan) => (
                    <th key={`head-${plan.name}`} className="px-4 py-3 text-center font-semibold text-brand-navy">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-600">Kullanici</td>
                  {plans.map((plan) => (
                    <td key={`users-${plan.name}`} className="px-4 py-3 text-center text-brand-navy">{plan.matrix.users}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-600">Hasta kapasitesi</td>
                  {plans.map((plan) => (
                    <td key={`patients-${plan.name}`} className="px-4 py-3 text-center text-brand-navy">{plan.matrix.patients}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-600">Panel / e-posta hatirlatma</td>
                  {plans.map((plan) => (
                    <td key={`reminders-${plan.name}`} className="px-4 py-3 text-center">{valueOrDash(plan.matrix.reminders)}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-600">Gelismis analitik</td>
                  {plans.map((plan) => (
                    <td key={`analytics-${plan.name}`} className="px-4 py-3 text-center">{valueOrDash(plan.matrix.analytics)}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-600">API erisimi</td>
                  {plans.map((plan) => (
                    <td key={`api-${plan.name}`} className="px-4 py-3 text-center">{valueOrDash(plan.matrix.api)}</td>
                  ))}
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-600">Oncelikli onboarding</td>
                  {plans.map((plan) => (
                    <td key={`onboarding-${plan.name}`} className="px-4 py-3 text-center">{valueOrDash(plan.matrix.onboarding)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl bg-white p-4">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-teal" aria-hidden="true" />
                <span className="text-xs font-semibold text-brand-navy">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 className="font-heading text-3xl font-black text-brand-navy">Sik Sorulanlar</h2>
            <p className="mt-4 leading-relaxed text-slate-500">
              Satin alma oncesi en kritik konulari tek ekranda cevapladik.
            </p>
            <Button asChild className="mt-8 min-h-11 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover">
              <Link href={DEMO_CONTACT_PATH}>
                {ENTRY_CTA.demoRequest.tr}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 px-5">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`pricing-faq-${index}`} className="border-slate-200">
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-brand-navy hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-7 text-slate-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}
