import { CalendarCheck2, ClipboardCheck, Shield, UserRound } from 'lucide-react'

import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'

const patientSteps = [
  'Uygun uzman veya hizmeti secer.',
  'Bos saatleri gorup randevu talebi olusturur.',
  'Onay ve hatirlatma bildirimlerini tek yerden alir.',
]

const providerSteps = [
  'Takvimde tum ekip uygunlugunu gorur.',
  'Hasta notu, hizmet ve randevu detayini ayni panelde yonetir.',
  'Yoneticiler gunluk doluluk ve performans metriklerini izler.',
]

const trustPills = [
  { icon: Shield, label: 'Guvenli Randevu Yonetimi' },
  { icon: UserRound, label: 'Doktor ve Uzman Paneli' },
  { icon: CalendarCheck2, label: 'Hasta Için Kolay Akis' },
]

export function JourneySection() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="marketing-container">
        <FadeUp className="mx-auto mb-10 max-w-3xl text-center">
          <p className="marketing-chip mb-4 border-0">Yolculuk</p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Hasta, saglayici ve admin ayni duzende bulusur.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
            Asistan, randevu olusturmadan klinik operasyonuna kadar tum taraflarin akislarini tek platformda birlestirir.
          </p>
        </FadeUp>

        <div className="grid gap-4 lg:grid-cols-2">
          <ScaleIn>
            <article className="marketing-surface rounded-2xl p-6">
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                <UserRound className="size-5" />
              </div>
              <h3 className="text-xl font-extrabold text-brand-navy">Hasta Yolculugu</h3>
              <ul className="mt-4 space-y-2">
                {patientSteps.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-sm leading-7 text-slate-600">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-teal" />
                    {step}
                  </li>
                ))}
              </ul>
            </article>
          </ScaleIn>

          <ScaleIn delay={0.08}>
            <article className="marketing-surface rounded-2xl p-6">
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                <ClipboardCheck className="size-5" />
              </div>
              <h3 className="text-xl font-extrabold text-brand-navy">Saglayici ve Admin Paneli</h3>
              <ul className="mt-4 space-y-2">
                {providerSteps.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-sm leading-7 text-slate-600">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-teal" />
                    {step}
                  </li>
                ))}
              </ul>
            </article>
          </ScaleIn>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {trustPills.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue/15 bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-navy"
            >
              <item.icon className="size-3.5 text-brand-teal" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
