import Link from 'next/link'
import { ArrowRight, CalendarCheck, Mail } from 'lucide-react'

import { FadeUp } from '@/components/marketing/motion-wrappers'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section id="contact" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-blue">
            <CalendarCheck className="size-7" aria-hidden="true" />
          </div>
          <h2 className="mt-6 font-heading text-3xl font-black text-brand-navy md:text-5xl">
            Demo isteyin, kurulum planini birlikte cikaralim.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Klinik akislarinizi birlikte degerlendirelim; size uygun ekip yetkisi, randevu senaryosu ve ilk canliya gecis adimlarini netlestirelim.
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 rounded-xl bg-brand-blue px-7 text-sm font-bold text-white hover:bg-brand-blue/90">
            <Link href="/auth/sign-up">
              Ucretsiz Demo Talep Et
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-slate-200 px-7 text-sm font-bold text-brand-navy">
            <Link href="/auth/sign-up">Hesap Ac</Link>
          </Button>
        </FadeUp>

        <FadeUp delay={0.16} className="mt-4">
          <a
            href="mailto:merhaba@asistan.online"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-brand-navy"
          >
            <Mail className="size-4" aria-hidden="true" />
            merhaba@asistan.online
          </a>
        </FadeUp>
      </div>
    </section>
  )
}
