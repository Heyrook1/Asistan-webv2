import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

import { FadeUp } from '@/components/marketing/motion-wrappers'
import { Button } from '@/components/ui/button'

const plans = [
  { name: 'Baslangic', price: '1.290', features: ['1 kullanici', '500 hasta', 'Randevu yonetimi'] },
  { name: 'Standart', price: '2.490', features: ['5 kullanici', '2.000 hasta', 'Gelismis raporlama'] },
  { name: 'Profesyonel', price: '4.890', features: ['Sinirsiz kullanici', 'Sinirsiz hasta', 'API erisimi'], highlight: true },
]

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 md:py-24">
      <div className="marketing-container">
        <FadeUp className="mx-auto mb-10 max-w-3xl text-center">
          <p className="marketing-chip mb-4 border-0">Fiyatlandirma</p>
          <h2 className="font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Kliniginiz icin dogru plani secin.
          </h2>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan, index) => (
            <FadeUp key={plan.name} delay={index * 0.06}>
              <article
                className={`marketing-surface marketing-card-hover relative h-full rounded-2xl p-5 ${
                  plan.highlight ? 'border-brand-blue/35 shadow-[0_18px_36px_rgba(24,95,165,0.16)]' : ''
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-3 py-1 text-[11px] font-bold text-white">
                    En Populer
                  </span>
                )}
                <h3 className="text-lg font-extrabold text-brand-navy">{plan.name}</h3>
                <p className="mt-3 text-3xl font-black text-brand-navy">
                  TL {plan.price}
                  <span className="ml-1 text-sm font-semibold text-slate-500">/ ay</span>
                </p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="size-4 text-brand-teal" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 h-10 w-full rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90">
                  <Link href="/fiyatlandirma">Plani Sec</Link>
                </Button>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
