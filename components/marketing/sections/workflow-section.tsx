import { CalendarCheck2, ClipboardPlus, Headset, Route } from 'lucide-react'

import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'

const steps = [
  {
    icon: ClipboardPlus,
    label: '01',
    title: 'Hesabinizi olusturun',
    detail: 'Kliniginizi sisteme ekleyin ve ekibinizdeki rollerin erisimini tanimlayin.',
  },
  {
    icon: Route,
    label: '02',
    title: 'Ozellikleri tasiyin',
    detail: 'Mevcut hasta ve randevu verilerinizi kolayca sisteme aktarip akislari netlestirin.',
  },
  {
    icon: Headset,
    label: '03',
    title: 'Kullanmaya baslayin',
    detail: 'Tum moduller tek panelde calissin; ekip ortak takvim ve bildirimlerle ilerlesin.',
  },
]

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="bg-white py-20 md:py-24">
      <div className="marketing-container">
        <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
          <p className="marketing-chip mb-4 border-0">Nasil Calisir?</p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Uc adimla klinigi dijitallestirin.
          </h2>
        </FadeUp>

        <div className="relative">
          <div className="marketing-dash-line absolute left-10 right-10 top-14 hidden h-[3px] opacity-60 md:block" />
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <ScaleIn key={step.label} delay={0.06 * index}>
                <article className="marketing-surface marketing-card-hover relative h-full rounded-2xl p-5">
                  <span className="absolute right-4 top-4 text-[11px] font-bold text-brand-blue/70">{step.label}</span>
                  <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-navy">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{step.detail}</p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>

        <FadeUp delay={0.16} className="mt-8 rounded-2xl border border-brand-blue/10 bg-brand-light p-4 md:p-5">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
            <CalendarCheck2 className="size-4 text-brand-teal" />
            Kurulum sonrasi hatirlatma, randevu ve ekip akislariniz ayni panelden yonetilir.
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
