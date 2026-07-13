import Image from 'next/image'
import { BellRing, CalendarClock, ShieldCheck, UserRound } from 'lucide-react'

import { FadeUp } from '@/components/marketing/motion-wrappers'

const modules = [
  {
    icon: CalendarClock,
    title: 'Randevu Yonetimi',
    detail: 'Online randevu, takvim gorunumu ve hatirlatmalar tek merkezde.',
  },
  {
    icon: UserRound,
    title: 'Hasta Yonetimi',
    detail: 'Hasta kartlari, gecmis muayeneler ve notlar tek panelde.',
  },
  {
    icon: BellRing,
    title: 'Hatirlatmalar',
    detail: 'Panel ve e-posta hatirlatmalariyla randevu kacirmayi azaltin. SMS icin webhook kurulumu gerekir.',
  },
  {
    icon: ShieldCheck,
    title: 'Rol Bazli Erisim',
    detail: 'Yetkilere gore gorunum ve islem sinirlariyla guvenli kullanim.',
  },
]

export function FeatureShowcaseSection() {
  return (
    <section id="features" className="bg-dashboard-surface py-20 md:py-24">
      <div className="marketing-container">
        <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
          <p className="marketing-chip mb-4 border-0">Ozellikler</p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Klinik is akisinizi uctan uca yonetin.
          </h2>
        </FadeUp>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <FadeUp>
            <article className="marketing-surface overflow-hidden rounded-2xl">
              <div className="relative h-[300px] w-full md:h-[360px]">
                <Image
                  src="/images/industry-health.jpg"
                  alt="Asistan dashboard gorunumu"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 58vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/75 to-brand-navy/10" />
                <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-3">
                  {['Randevu Yonetimi', 'Hasta Yonetimi', 'Finans Raporlama'].map((chip) => (
                    <div
                      key={chip}
                      className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center text-xs font-bold text-white backdrop-blur-sm"
                    >
                      {chip}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </FadeUp>

          <div className="grid gap-4">
            {modules.map((item, index) => (
              <FadeUp key={item.title} delay={index * 0.06}>
                <article className="marketing-surface marketing-card-hover rounded-2xl p-5">
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-brand-cyan/10 text-brand-blue">
                    <item.icon className="size-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-brand-navy">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-7 text-slate-600">{item.detail}</p>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
