import Link from 'next/link'
import { ArrowRight, BadgeCheck, Database, LockKeyhole, ShieldCheck } from 'lucide-react'

import { FadeUp } from '@/components/marketing/motion-wrappers'

const proofPoints = [
  {
    icon: ShieldCheck,
    title: 'KVKK + tenant ayrimi',
    detail: 'Klinik verisi isletme bazinda izole edilir; rol bazli izinler erisimi sinirlar.',
  },
  {
    icon: LockKeyhole,
    title: 'Sunucu tarafi oturum',
    detail: 'Dashboard erisimi sunucuda dogrulanir; hassas aksiyonlar denetim gunlugune yazilir.',
  },
  {
    icon: Database,
    title: 'Hekim profil dogrulama',
    detail: 'Ruhsat / diploma / kimlik alanlari doldukca profil dogrulama durumu yukselir.',
  },
  {
    icon: BadgeCheck,
    title: 'Randevu bagli yorum',
    detail: 'Herkese acik yorumlar yalnizca tamamlanmis randevuya bagli gercek kayitlardan gelir.',
  },
]

export function SocialProofSection() {
  return (
    <section id="social-proof" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-brand-cyan/10 px-4 py-1.5 text-sm font-bold text-brand-blue">
            Guven Kaniti
          </p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Sahte logo ve uydurma testimonial yok.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600">
            Guveni rozetle degil, urunde gorunen kontrollerle gosteriyoruz. Detaylar icin Guven Merkezi&apos;ni inceleyin.
          </p>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-2">
          {proofPoints.map((item, index) => (
            <FadeUp key={item.title} delay={index * 0.06}>
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-extrabold text-brand-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.detail}</p>
              </article>
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-8 text-center">
          <Link
            href="/guven"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
          >
            Guven Merkezini Ac
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </FadeUp>
      </div>
    </section>
  )
}
