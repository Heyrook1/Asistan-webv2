'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'
import {
  formatPublicPlanPrice,
  listPublicMarketingPlanCards,
  publicPlanAnnualPrepaidAmount,
  publicPlanDisplayName,
  publicPlanMonthlyAmount,
  PUBLIC_PRICING_BILLING_DISCLOSURE,
  PUBLIC_PRICING_PROOF_GATE,
  PUBLIC_PRICING_MATRIX_ROWS,
  type PublicBillingCycle,
} from '@/lib/pricing/public-catalog'
import { cn } from '@/lib/utils'

const clinicTrialHref = getClinicTrialPath('tr')

const trustItems = [
  'KVKK odaklı kontroller',
  'Rol bazlı erişim',
  'Denetim günlüğü',
  'İşletme bazlı veri ayrımı',
  'Erken erişim — abartısız yol haritası',
]

const faqs = [
  {
    question: 'Neden önce demo veya deneme?',
    answer:
      'Liste fiyatı (€149–€499) olgun SaaS beklentisi yaratabilir. Erken erişimde imzalı pilot, ölçülebilir ROI ve kanıtlanmış canlı bildirim paketi olmadan ücretli abonelik itiraz üretebilir. Önce randevu akışını ve desteği görün; uyum netleşince plan seçin.',
  },
  {
    question: 'Planımı istediğim zaman değiştirebilir miyim?',
    answer:
      'Evet. Paket geçişleri dönem sonunda veya ihtiyaç anında planlı şekilde yapılabilir.',
  },
  {
    question: 'Yıllık ödemede ne kadar peşin öderim?',
    answer:
      'Yıllık seçimde indirimli aylık eşdeğer gösterilir; karttan/faturadan çekilen tutar 12× bu orandır (ör. Profesyonel €199/ay eşdeğeri → €2.388 yıllık peşin).',
  },
  {
    question: 'Fiyatlara KDV dahil mi? TL ödeyebilir miyim?',
    answer:
      'Listelenen tutarlar EUR ve vergi hariçtir (faturada aksi yazılmadıkça). Varsayılan tahsilat EUR’dur. TL ödeme fatura anında kur ile ayrıca anlaşılabilir; anlık TL checkout ve sabit kur garantisi yoktur.',
  },
  {
    question: 'Kurumsal plan ne zaman gerekir?',
    answer:
      'Çoklu şube, özel entegrasyon veya gelişmiş yetki ihtiyacında Kurumsal yalnızca demo ile başlar; liste fiyatı tek başına sipariş değildir.',
  },
  {
    question: 'Hasta verileri nasıl korunuyor?',
    answer:
      'İşletme bazlı veri ayrımı, temel rol güvenliği ve zorunlu gizlilik / ürün içi denetim günlüğü tüm planlarda standarttır. Gelişmiş denetim dışa aktarma veya özel yönetişim Kurumsal pakette yer alabilir — temel güvenlik paket farkı değildir.',
  },
]

export function PricingPageSections() {
  const [cycle, setCycle] = useState<PublicBillingCycle>('monthly')
  const plans = useMemo(() => listPublicMarketingPlanCards(), [])
  const billingDisclosure = PUBLIC_PRICING_BILLING_DISCLOSURE.tr
  const proofGate = PUBLIC_PRICING_PROOF_GATE.tr

  const modeLabel =
    cycle === 'monthly' ? 'Aylık faturalandırma' : 'Yıllık faturalandırma — peşin yıllık tutar gösterilir'

  return (
    <>
      <section id="plans" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <aside
            className="mb-10 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-5 py-5 sm:px-6"
            aria-labelledby="pricing-proof-gate-title"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800">
              Erken erişim
            </p>
            <h2 id="pricing-proof-gate-title" className="mt-1 text-base font-bold text-brand-navy">
              {proofGate.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{proofGate.body}</p>
            <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-slate-600">
              {proofGate.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-700" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="inline-flex rounded-xl border border-brand-blue/15 bg-white p-1">
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={cn(
                  'min-h-10 rounded-lg px-4 text-sm font-semibold',
                  cycle === 'monthly' ? 'bg-brand-blue text-white' : 'text-slate-600'
                )}
              >
                Aylık
              </button>
              <button
                type="button"
                onClick={() => setCycle('annual')}
                className={cn(
                  'min-h-10 rounded-lg px-4 text-sm font-semibold',
                  cycle === 'annual' ? 'bg-brand-blue text-white' : 'text-slate-600'
                )}
              >
                Yıllık
              </button>
            </div>
            <p className="text-xs font-semibold text-brand-blue">{modeLabel}</p>
          </div>

          <div className="mb-8 rounded-2xl border border-brand-blue/15 bg-brand-blue/5 px-5 py-5 text-center">
            <p className="text-sm font-semibold text-brand-navy">
              Erken erişimde önerilen yol: önce demo veya 14 gün deneme — kredi kartı gerekmez.
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Liste fiyatları planlama içindir; ücretli abonelik uyum netleşince.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button asChild className="min-h-10 rounded-xl bg-brand-blue text-white hover:bg-brand-blue/90">
                <Link href={DEMO_CONTACT_PATH}>{ENTRY_CTA.demoRequest.tr}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-10 rounded-xl border-brand-blue/25 bg-white text-brand-navy"
              >
                <Link href={clinicTrialHref}>{ENTRY_CTA.clinicTrial.tr}</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const monthlyEquivalent = publicPlanMonthlyAmount(plan, cycle)
              const annualPrepaid =
                cycle === 'annual' ? publicPlanAnnualPrepaidAmount(plan) : null
              const href = plan.marketing.ctaKind === 'demo' ? DEMO_CONTACT_PATH : clinicTrialHref
              const cta =
                plan.marketing.ctaKind === 'demo'
                  ? ENTRY_CTA.demoRequest.tr
                  : ENTRY_CTA.clinicTrial.tr

              return (
                <article
                  key={plan.code}
                  className={cn(
                    'relative h-full rounded-2xl border bg-white p-6 transition-shadow hover:shadow-lg',
                    plan.marketing.popular
                      ? 'border-brand-blue shadow-lg shadow-brand-blue/10'
                      : 'border-slate-200'
                  )}
                >
                  {plan.marketing.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-4 py-1.5 text-xs font-semibold text-white">
                      Popüler plan
                    </div>
                  )}
                  <p className="text-sm font-semibold text-brand-teal">{plan.marketing.note.tr}</p>
                  <h2 className="mt-2 text-2xl font-bold text-brand-navy">
                    {publicPlanDisplayName(plan, 'tr')}
                  </h2>
                  <p className="mt-3 min-h-16 text-sm leading-relaxed text-slate-500">
                    {plan.description}
                  </p>

                  <div className="mb-6 mt-6 rounded-2xl bg-dashboard-surface p-5">
                    {cycle === 'annual' && annualPrepaid != null && monthlyEquivalent != null ? (
                      <>
                        <p className="text-3xl font-black text-brand-navy">
                          {formatPublicPlanPrice(monthlyEquivalent, 'tr')}
                          <span className="ml-1 text-base font-semibold text-slate-500">/ ay</span>
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          eşdeğeri · yıllık faturalandırılır
                        </p>
                        <p className="mt-3 text-sm font-bold text-brand-navy">
                          {formatPublicPlanPrice(annualPrepaid, 'tr')}{' '}
                          <span className="font-semibold text-slate-600">
                            yıllık peşin faturalandırılır
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] leading-snug text-slate-500">
                          Karttan / faturadan çekilecek tutar (KDV hariç, EUR). Liste fiyatı —
                          erken erişimde önce demo/deneme.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-black text-brand-navy">
                          {formatPublicPlanPrice(monthlyEquivalent, 'tr')}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {plan.demoOnly ? '14 gün deneme' : '/ ay · aylık faturalandırılır'}
                        </p>
                        <p className="mt-2 text-[11px] leading-snug text-slate-500">
                          KDV/vergi hariç · EUR · erken erişim liste fiyatı
                        </p>
                      </>
                    )}
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.marketing.features.tr.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm text-slate-600">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={cn(
                      'mt-auto min-h-11 w-full rounded-xl',
                      plan.marketing.popular
                        ? 'bg-brand-teal text-white hover:bg-brand-teal-hover'
                        : 'border-slate-300 bg-white text-brand-navy hover:bg-dashboard-surface'
                    )}
                    variant={plan.marketing.popular ? 'default' : 'outline'}
                  >
                    <Link href={href} aria-label={`${publicPlanDisplayName(plan, 'tr')} için ${cta}`}>
                      {cta}
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </article>
              )
            })}
          </div>

          <aside
            className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 sm:px-6"
            aria-labelledby="billing-disclosure-title"
          >
            <h3 id="billing-disclosure-title" className="text-sm font-bold text-brand-navy">
              {billingDisclosure.title}
            </h3>
            <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-slate-600">
              {billingDisclosure.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-blue" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="bg-dashboard-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-2xl border border-brand-blue/10 bg-white p-4">
            <h3 className="text-lg font-bold text-brand-navy">Plan karşılaştırması</h3>
            <p className="mt-1 text-sm text-slate-500">
              Temel güvenlik (veri ayrımı, rol erişimi, gizlilik / ürün içi denetim) tüm planlarda
              standarttır. Gelişmiş denetim dışa aktarma yalnızca Kurumsal’da farklılaşır.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-dashboard-surface">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Özellik</th>
                  {plans.map((plan) => (
                    <th
                      key={`head-${plan.code}`}
                      className="px-4 py-3 text-center font-semibold text-brand-navy"
                    >
                      {publicPlanDisplayName(plan, 'tr')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PUBLIC_PRICING_MATRIX_ROWS.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-slate-600">{row.label.tr}</td>
                    {plans.map((plan) => (
                      <td key={`${row.id}-${plan.code}`} className="px-4 py-3 text-center text-brand-navy">
                        {row.kind === 'users' ? (
                          plan.marketing.matrix.users.tr
                        ) : plan.marketing.matrix[row.key] ? (
                          <Check className="mx-auto h-4 w-4 text-brand-teal" aria-hidden="true" />
                        ) : (
                          <span className="mx-auto block h-4 w-4 text-slate-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
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

      <section id="sss" className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 className="font-heading text-3xl font-black text-brand-navy">Sık sorulanlar</h2>
            <p className="mt-4 leading-relaxed text-slate-500">
              Satın alma öncesi en kritik konuları tek ekranda cevapladık.
            </p>
            <Button
              asChild
              className="mt-8 min-h-11 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover"
            >
              <Link href={DEMO_CONTACT_PATH}>
                {ENTRY_CTA.demoRequest.tr}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Accordion type="single" collapsible className="rounded-2xl border border-slate-200 px-5">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`pricing-faq-${index}`}
                className="border-slate-200"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-brand-navy hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-7 text-slate-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}
