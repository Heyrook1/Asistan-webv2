import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Database, LockKeyhole, ShieldCheck, Users } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Gizlilik',
  description: 'Asistan platformunun gizlilik, yetki ve veri guvenligi yaklasimi.',
}

const principles = [
  {
    icon: LockKeyhole,
    title: 'Veri minimizasyonu',
    description:
      'Klinik operasyonu icin gerekli olmayan kisisel verileri toplamamaya oncelik veririz.',
  },
  {
    icon: Users,
    title: 'Rol bazli erisim',
    description:
      'Doktor, sekreter ve yonetici rollerinin erisim kapsamlarini ayri olarak yonetiriz.',
  },
  {
    icon: Database,
    title: 'Izlenebilir veri akisi',
    description:
      'Kayit degisiklikleri denetlenebilir bicimde tutulur, operasyon adimlari geriye donuk izlenebilir.',
  },
  {
    icon: ShieldCheck,
    title: 'Guvenli operasyon',
    description:
      'Kimlik dogrulama, tenant ayrimi ve yetki kontrolleri urun mimarisinin temel katmanidir.',
  },
]

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10">
          <FadeUp className="mx-auto max-w-3xl text-center">
            <Badge className="marketing-chip mb-5 border-0">Gizlilik</Badge>
            <h1 className="font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">
              Hasta ve isletme verisi icin guvenli bir temel.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
              Bu sayfa, Asistan icindeki veri toplama, erisim ve isleme prensiplerini genel seviyede
              ozetler. Kurulum ozelindeki kapsam, canliya gecis oncesinde ayrica netlestirilir.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="marketing-container grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((item, index) => (
            <ScaleIn key={item.title} delay={0.05 * index}>
              <article className="marketing-surface marketing-card-hover h-full rounded-2xl p-5">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-extrabold text-brand-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            </ScaleIn>
          ))}
        </div>
      </section>

      <section className="bg-dashboard-surface py-16">
        <div className="marketing-container">
          <FadeUp className="rounded-2xl bg-brand-navy p-7 text-white md:p-9">
            <h2 className="text-2xl font-black md:text-3xl">Sorulariniz varsa dogrudan ulasin.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
              Gizlilik, veri saklama veya erisim politikasiyla ilgili sorulariniz icin ekibimizle iletisime
              gecebilirsiniz.
            </p>
            <Link
              href="mailto:merhaba@asistan.online"
              className="mt-6 inline-flex items-center text-sm font-semibold text-brand-cyan hover:text-white"
            >
              merhaba@asistan.online
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </FadeUp>
        </div>
      </section>
    </MarketingPageShell>
  )
}
