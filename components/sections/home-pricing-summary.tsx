'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { SectionHeading } from '@/components/sections/section-heading'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/useLanguage'
import { getRegisterPath } from '@/lib/auth-routes'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'
import {
  formatPublicPlanPrice,
  listPublicMarketingPlanCards,
  publicPlanDisplayName,
  publicPlanMonthlyAmount,
} from '@/lib/pricing/public-catalog'

/** Compact pricing band for the B2B homepage — full matrix lives on /fiyatlandirma. */
export function HomePricingSummary() {
  const { t, language } = useLanguage()
  const locale = language === 'en' ? 'en' : 'tr'
  const plans = listPublicMarketingPlanCards()

  return (
    <section
      id="pricing"
      className="scroll-mt-28 bg-white px-4 py-16 sm:px-6 lg:py-20"
      aria-labelledby="home-pricing-heading"
    >
      <div className="mx-auto max-w-[1100px]">
        <SectionHeading
          titleId="home-pricing-heading"
          eyebrow={t({ tr: 'Fiyatlandırma', en: 'Pricing' })}
          title={t({
            tr: 'Liste fiyatı. Önce deneme.',
            en: 'List price. Trial first.',
          })}
          description={t({
            tr: 'Başlangıç 1.000 TRY, Profesyonel 2.500 TRY. Kurumsal paket için ekibimizle iletişime geçin.',
            en: 'Starter is 1,000 TRY and Professional is 2,500 TRY. Contact our team for Enterprise.',
          })}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => {
            const amount = publicPlanMonthlyAmount(plan, 'monthly')
            const price = formatPublicPlanPrice(amount, locale)
            const popular = plan.marketing.popular
            return (
              <li
                key={plan.code}
                className={
                  popular
                    ? 'rounded-2xl bg-white p-5 ring-2 ring-[#0071E3]/35 shadow-[0_12px_40px_rgba(0,113,227,0.08)]'
                    : 'rounded-2xl bg-white p-5 ring-1 ring-slate-200/90'
                }
              >
                <p className="text-sm font-bold text-[#1D1D1F]">
                  {publicPlanDisplayName(plan, locale)}
                </p>
                <p className="mt-1 text-xs text-[#5D6068]">{plan.marketing.note[locale]}</p>
                <p className="mt-4 font-display text-2xl font-extrabold tracking-tight text-[#1D1D1F]">
                  {price}
                  {amount != null && amount > 0 ? (
                    <span className="ml-1 text-sm font-semibold text-[#5D6068]">
                      {t({ tr: '/ ay', en: '/ mo' })}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-4 space-y-1.5 text-[13px] text-[#5D6068]">
                  {plan.marketing.features[locale].slice(0, 3).map((feature) => (
                    <li key={feature}>· {feature}</li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>

        <div data-testid="home-pricing-conversion-ctas" className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="ctaPrimary"
            className="h-12 rounded-2xl px-6 font-bold"
          >
            <Link href={getRegisterPath(locale)} data-cta-priority="primary" className="inline-flex items-center gap-2">
              {t(ENTRY_CTA.clinicTrial)}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ctaSecondary" className="h-12 rounded-2xl px-6 font-semibold">
            <Link href={DEMO_CONTACT_PATH} data-cta-priority="secondary">
              {t(ENTRY_CTA.demoRequest)}
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-12 rounded-2xl px-4 font-semibold text-[#0071E3]">
            <Link href="/fiyatlandirma">
              {t({ tr: 'Tüm fiyatları incele', en: 'See full pricing' })}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
