import { Quote, Star } from 'lucide-react'

import { FadeUp } from '@/components/marketing/motion-wrappers'

const logos = [
  'Lefkosa Tip Merkezi',
  'Kyrenia Dental Group',
  'Magusa Fizyoterapi',
  'Nicosia Estetik',
  'Girne Klinik Plus',
  'Medpoint KKTC',
]

const testimonials = [
  {
    quote:
      'Sekreter ekibimiz gunluk randevu takibini tek panelden yonetmeye basladi. Iptal ve bos slot kacirma ciddi bicimde azaldi.',
    name: 'Dr. S. Karaman',
    role: 'Klinik Yoneticisi, Lefkosa',
  },
  {
    quote:
      'Dis kliniginde kontrol cagrilarini manuel takipten cikardik. Hatirlatma akisi duzenli calisiyor ve ekip yuku hissedilir sekilde dustu.',
    name: 'Dt. E. Aydin',
    role: 'Dis Hekimi, Girne',
  },
  {
    quote:
      'Fizyoterapi seanslarini paket bazinda daha net goruyoruz. Danisan iletisimi ve planlama daha sakin bir ritme girdi.',
    name: 'Uzm. Fzt. N. Ozer',
    role: 'Fizyoterapist, Magusa',
  },
]

export function SocialProofSection() {
  return (
    <section id="social-proof" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-brand-cyan/10 px-4 py-1.5 text-sm font-bold text-brand-blue">
            Sosyal Kanit
          </p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Klinik ekiplerinden gercek geri bildirimler.
          </h2>
        </FadeUp>

        <FadeUp className="mb-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => (
              <div
                key={logo}
                className="flex min-h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-center text-xs font-bold text-slate-600"
              >
                {logo}
              </div>
            ))}
          </div>
        </FadeUp>

        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <FadeUp key={item.name} delay={index * 0.08}>
              <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <Quote className="size-5 text-brand-blue" aria-hidden="true" />
                  <div className="flex items-center gap-0.5 text-brand-cyan">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-7 text-slate-700">{item.quote}</p>
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-sm font-extrabold text-brand-navy">{item.name}</p>
                  <p className="text-xs font-medium text-slate-500">{item.role}</p>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
