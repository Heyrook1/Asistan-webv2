import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { OutcomeCasesSectionServer } from '@/components/sections/outcome-cases-section-server'
import {
  OUTCOME_CASES_DISCLAIMER,
  SIGNED_METRIC_CASE_TEMPLATE,
  listPublishedOutcomeCases,
} from '@/lib/brand/outcome-cases'
import { withCanonical } from '@/lib/seo'
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = withCanonical('/sonuclar', {
  title: 'KKTC operasyon sonuçları',
  description:
    'Anonimleştirilmiş KKTC erken erişim süreç pilotları: tek ajanda, rol erişimi, genel randevu linki. Sahte testimonial yok.',
})

export default function SonuclarPage() {
  const cases = listPublishedOutcomeCases()

  return (
    <MarketingPageShell>
      <section className="border-b border-slate-200/80 bg-white px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">Asistan Health</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Ölçülen operasyon sonuçları</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Innovation pillar için satış kanıtı: isimli logo yerine anonim süreç pilotları ve (örnek yeterliyse)
            canlı platform sinyali. Yüzdelik no-show / ekip NPS yalnızca imzalı pilot kaydıyla yayınlanır.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild className="rounded-xl bg-[#0071E3] text-white hover:bg-[#0071E3]/90">
              <Link href={getClinicTrialPath('tr')}>{ENTRY_CTA.clinicTrial.tr}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={DEMO_CONTACT_PATH}>Demo talep et</Link>
            </Button>
          </div>
        </div>
      </section>

      <OutcomeCasesSectionServer showDetailCta={false} />

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-slate-300 bg-white p-6">
          <p className="text-sm font-bold text-[#1D1D1F]">İmzalı metrik şablonu (draft)</p>
          <p className="mt-2 text-sm text-slate-600">{SIGNED_METRIC_CASE_TEMPLATE.summary.tr}</p>
          <p className="mt-3 font-mono text-xs text-slate-400">{SIGNED_METRIC_CASE_TEMPLATE.id} · status=draft</p>
          <p className="mt-4 text-[11px] leading-5 text-slate-400">{OUTCOME_CASES_DISCLAIMER.tr}</p>
          <p className="mt-2 text-xs text-slate-500">
            Yayında {cases.length} süreç kartı · imzalı % kartı: 0 (onay bekliyor)
          </p>
        </div>
      </section>
    </MarketingPageShell>
  )
}
