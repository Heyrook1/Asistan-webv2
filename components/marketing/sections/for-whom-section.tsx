import { Activity, HeartPulse, Scissors, Stethoscope } from 'lucide-react'

import { FadeUp } from '@/components/marketing/motion-wrappers'

const sectors = [
  {
    icon: Stethoscope,
    title: 'Genel Klinik',
    summary: 'Hasta kabul, takip ve ekip koordinasyonunu tek panelde toplar.',
    points: ['Hasta kabul', 'Randevu akisi', 'Rol bazli gorev'],
  },
  {
    icon: HeartPulse,
    title: 'Dis Hekimligi',
    summary: 'Kontrol cagrilari ve seans takvimini dagitmadan yonetir.',
    points: ['Kontrol hatirlatma', 'Islem gecmisi', 'No-show azalimi'],
  },
  {
    icon: Activity,
    title: 'Fizyoterapi',
    summary: 'Tekrarli seanslari, paketleri ve program uyumunu gorunur tutar.',
    points: ['Seans plani', 'Paket sureci', 'Takip notlari'],
  },
  {
    icon: Scissors,
    title: 'Estetik Klinigi',
    summary: 'Danisan iletisimi ve randevu yogunlugunu olceklenebilir hale getirir.',
    points: ['Danisan karti', 'Takvim dengesi', 'Hizli ekip islemi'],
  },
]

export function ForWhomSection() {
  return (
    <section id="for-whom" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-brand-cyan/10 px-4 py-1.5 text-sm font-bold text-brand-blue">
            Kimin Icin
          </p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Klinik tipine gore net operasyon akisi.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Asistan Health saglik ekiplerinin gercek gunluk ritmine gore tasarlandi. Klinik turune gore ayni
            altyapi ustunde farkli kullanim akislari sunar.
          </p>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sector, index) => (
            <FadeUp key={sector.title} delay={index * 0.08}>
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-blue">
                  <sector.icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-extrabold text-brand-navy">{sector.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{sector.summary}</p>
                <div className="mt-4 space-y-2">
                  {sector.points.map((point) => (
                    <p key={point} className="text-xs font-semibold text-slate-700">
                      {point}
                    </p>
                  ))}
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
