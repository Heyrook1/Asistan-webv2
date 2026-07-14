import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp } from '@/components/marketing/motion-wrappers'
import { PricingPageSections } from '@/components/marketing/pricing-page-sections'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicLoginPath, getClinicTrialPath } from '@/lib/entry-routes'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/fiyatlandirma', {
  title: 'Fiyatlandırma',
  description: 'Asistan Health klinik planları, deneme ve demo seçeneklerini inceleyin.',
})

export default function PricingPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-20 pt-28">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-20 top-20 h-60 w-60 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-28 h-60 w-60 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">
              Fiyatlandırma
            </Badge>
            <h1 className="font-heading text-4xl font-black leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Kliniğiniz için doğru planı seçin.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              Şeffaf fiyatlandırma, ölçülebilir değer. İstediğiniz zaman yükseltin veya küçültün.
            </p>
          </FadeUp>
        </div>
      </section>

      <PricingPageSections />

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-7xl rounded-3xl bg-brand-navy p-8 text-white md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Sparkles className="mb-5 h-8 w-8 text-brand-cyan" aria-hidden="true" />
              <h2 className="font-heading text-3xl font-black">
                Kliniğiniz için en doğru çözümü birlikte bulalım.
              </h2>
              <p className="mt-4 max-w-2xl text-white/75">
                Demo talep edin veya klinik denemesini başlatın.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="min-h-11 rounded-xl bg-white text-brand-navy hover:bg-white/90"
              >
                <Link href={DEMO_CONTACT_PATH} aria-label={ENTRY_CTA.demoRequest.tr}>
                  {ENTRY_CTA.demoRequest.tr}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-11 rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={getClinicTrialPath('tr')}>{ENTRY_CTA.clinicTrial.short.tr}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-11 rounded-xl border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={getClinicLoginPath('tr')}>{ENTRY_CTA.clinicLogin.tr}</Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </MarketingPageShell>
  )
}
