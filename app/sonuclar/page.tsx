import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, ClipboardCheck, Ruler, ShieldCheck } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
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

const verifiableNow = [
  {
    icon: ClipboardCheck,
    title: 'Pilot süreci',
    detail: 'Klinik hedefi, başlangıç durumu ve sorumlu kişi belgelenmeden sonuç iddiası yayınlanmaz.',
  },
  {
    icon: Ruler,
    title: 'Ölçüm yöntemi',
    detail: 'Bir oran paylaşılacaksa neyin, hangi veri kaynağından ve hangi payda ile ölçüldüğü kayda geçirilir.',
  },
  {
    icon: ShieldCheck,
    title: 'Erişim kontrolü',
    detail: 'İşletme ayrımı, rol bazlı erişim ve denetim izi gibi kontroller Güven Merkezi’nde açıkça incelenebilir.',
  },
  {
    icon: BadgeCheck,
    title: 'Sonraki kanıt adımı',
    detail: 'Belgelendirilmiş pilot ve yazılı klinik onayı tamamlandığında anonimleştirilmiş sonuç kartı değerlendirmeye açılır.',
  },
]

export default function SonuclarPage() {
  const publishedCount = listPublicOutcomeCases().length

  return (
    <MarketingPageShell>
      <section className="border-b border-slate-200/80 bg-white px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">Asistan Health</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.16] tracking-tight md:text-5xl">Operasyon sonuçları</h1>
          <p className="mt-6 text-base leading-7 text-[#6B7280]">
            {publishedCount === 0
              ? 'Şu an kamuya açık, doğrulanmış klinik sonuç kartı yayınlamıyoruz. Süre veya yüzde iddiası yalnızca belgelenmiş pilot ve klinik onayıyla eklenir.'
              : 'Erken erişim kliniklerinde doğrulanmış operasyonel değişimleri şeffaf biçimde paylaşıyoruz. Yüzdelik sonuçlar yalnızca onaylı ölçümle yayınlanır.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button asChild variant="ctaPrimary" className="rounded-xl">
              <Link href={getClinicTrialPath('tr')}>{ENTRY_CTA.clinicTrial.tr}</Link>
            </Button>
            <Button asChild variant="ctaSecondary" className="rounded-xl">
              <Link href={DEMO_CONTACT_PATH}>Demo talep et</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        data-testid="outcomes-verifiable-now"
        className="bg-[var(--section-surface-neutral)] px-4 py-16 sm:px-6 lg:py-20"
        aria-labelledby="outcomes-verifiable-heading"
      >
        <div className="mx-auto max-w-7xl">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">
              Kanıt standardı
            </p>
            <h2 id="outcomes-verifiable-heading" className="mt-3 text-3xl font-black tracking-tight text-[#1D1D1F] md:text-4xl">
              Şu anda doğrulayabileceğiniz şeyler
            </h2>
            <p className="mt-3 text-base leading-7 text-[#6B7280]">
              Sonuç kartları henüz açık değilken bile, kanıtın nasıl toplandığını ve hangi kontrolün bugün incelenebildiğini görebilirsiniz.
            </p>
          </FadeUp>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {verifiableNow.map((item, index) => (
              <ScaleIn key={item.title} delay={0.05 * index}>
                <article className="h-full rounded-2xl border border-[#E6EAF0] bg-white p-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.24)]">
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-[#0071E3]/10 text-[#0071E3]">
                    <item.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-[#1D1D1F]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <OutcomeCasesSectionServer showDetailCta={false} />

      <section className="bg-white px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0071E3]">Yayın kuralı</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{OUTCOME_CASES_DISCLAIMER.tr}</p>
        </div>
      </section>
    </MarketingPageShell>
  )
}
