import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { OutcomeCasesSectionServer } from '@/components/sections/outcome-cases-section-server'
import { OUTCOME_CASES_DISCLAIMER, listPublicOutcomeCases } from '@/lib/brand/outcome-cases'
import { withCanonical } from '@/lib/seo'
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = withCanonical('/sonuclar', {
  title: 'KKTC operasyon sonuçları',
  description:
    'Doğrulanmış klinik ölçüm ve onay olmadan sonuç kartı yayınlamıyoruz. Demo ile paneli görün; kanıt kapısı açılınca sonuçlar burada paylaşılır.',
})

export default function SonuclarPage() {
  const publishedCount = listPublicOutcomeCases().length

  return (
    <MarketingPageShell>
      <section className="border-b border-slate-200/80 bg-white px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">Asistan Health</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Operasyon sonuçları</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {publishedCount === 0
              ? 'Şu an kamuya açık, doğrulanmış klinik sonuç kartı yayınlamıyoruz. Süre veya yüzde iddiası yalnızca belgelenmiş pilot ve klinik onayıyla eklenir.'
              : 'Erken erişim kliniklerinde doğrulanmış operasyonel değişimleri şeffaf biçimde paylaşıyoruz. Yüzdelik sonuçlar yalnızca onaylı ölçümle yayınlanır.'}
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
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-6">
          <p className="text-sm leading-6 text-slate-600">{OUTCOME_CASES_DISCLAIMER.tr}</p>
        </div>
      </section>
    </MarketingPageShell>
  )
}
