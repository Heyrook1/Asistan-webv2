import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Kullanim Kosullari',
  description: 'Asistan platformunun kullanim kosullarina ait genel cerceve.',
}

const terms = [
  'Asistan, kliniklerin randevu, hasta takibi ve ekip operasyonunu dijital olarak yonetmesi icin tasarlanmistir.',
  'Panel erisimi sadece yetkili ekip uyeleri tarafindan kullanilmali; hesap guvenligi isletme sorumlulugunda tutulmalidir.',
  'Erken erisim doneminde ozellik kapsaminda urun yol haritasina gore kontrollu degisiklikler olabilir.',
  'Veri guvenligi katmani rol bazli erisim, tenant ayrimi ve oturum denetimi ilkeleriyle uygulanir.',
]

const complianceNotes = [
  {
    icon: ShieldCheck,
    title: 'Yetki modeli',
    description: 'Her ekip uyesi sadece goreviyle ilgili ekran ve islemlere erisebilir.',
  },
  {
    icon: FileText,
    title: 'Kurulum sozlesmesi',
    description: 'Canliya gecis oncesi hizmet kapsami ve yukumlulukler yazili olarak netlestirilir.',
  },
]

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-32">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10">
          <FadeUp className="mx-auto max-w-3xl text-center">
            <Badge className="marketing-chip mb-5 border-0">Kullanim Kosullari</Badge>
            <h1 className="font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">
              Asistan kullanim cercevesi.
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
              Bu sayfa platformun genel kullanim beklentilerini ozetler. Kuruma ozel detaylar,
              canli kurulum oncesi resmi kapsamla birlikte paylasilir.
            </p>
          </FadeUp>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="marketing-container grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <FadeUp className="marketing-surface rounded-2xl p-6 md:p-7">
            <h2 className="text-2xl font-black text-brand-navy">Temel kosullar</h2>
            <div className="mt-5 space-y-4">
              {terms.map((item, index) => (
                <ScaleIn key={item} delay={0.04 * index}>
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-teal" />
                    <p className="text-sm leading-7 text-slate-600">{item}</p>
                  </div>
                </ScaleIn>
              ))}
            </div>
          </FadeUp>

          <div className="space-y-4">
            {complianceNotes.map((note, index) => (
              <ScaleIn key={note.title} delay={0.06 * index}>
                <article className="marketing-surface marketing-card-hover rounded-2xl p-5">
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                    <note.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-navy">{note.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{note.description}</p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dashboard-surface py-16">
        <div className="marketing-container">
          <FadeUp className="rounded-2xl bg-brand-navy p-7 text-white md:p-9">
            <h2 className="text-2xl font-black md:text-3xl">Kurulum oncesi kosullari birlikte netlestirelim.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
              Asistan ekibi, kuruma ozel kullanim modeli ve operasyon kurallarini onboarding surecinde adim
              adim yazarak netlestirir.
            </p>
            <Link href="/contact" className="mt-6 inline-flex items-center text-sm font-semibold text-brand-cyan hover:text-white">
              Iletisime Gec
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </FadeUp>
        </div>
      </section>
    </MarketingPageShell>
  )
}
