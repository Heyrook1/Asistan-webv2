import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Briefcase, CalendarCheck, HeartPulse, Landmark, Scissors, Shield, Users } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeLeft, FadeUp, MouseParallax, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { productName } from '@/lib/brand/masterbrand'
import { ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/cozumler', {
  title: 'Çözümler | Asistan Health ve sektör yol haritası',
  description:
    'Asistan Health önce sağlık profesyonelleri için geliştirildi. Güzellik, hukuk ve emlak çözümleri sıradaki sektörlerdir.',
})

const sectors = [
  {
    icon: HeartPulse,
    title: productName('health', 'tr'),
    subtitle: 'Aktif · ilk odak',
    description:
      'Doktorlar, klinikler, diş hekimleri, psikologlar ve sağlık ekipleri için randevu ve hasta takibi.',
    image: '/images/industry-health.jpg',
    href: '/cozumler/health',
    active: true,
  },
  {
    icon: Scissors,
    title: 'Asistan Beauty',
    subtitle: 'Yakında',
    description: 'Güzellik merkezleri, kuaförler ve wellness ekipleri için müşteri ve randevu düzeni.',
    image: '/images/industry-beauty.jpg',
    href: '/cozumler/beauty',
    active: false,
  },
  {
    icon: Landmark,
    title: 'Asistan Legal',
    subtitle: 'Yakında',
    description: 'Hukuk büroları için görüşme, müvekkil ve dosya takibini sadeleştiren yapı.',
    image: '/images/industry-legal.jpg',
    href: '/cozumler/legal',
    active: false,
  },
  {
    icon: Briefcase,
    title: 'Asistan Emlak',
    subtitle: 'Planlanıyor',
    description: 'Emlak ofisleri için müşteri görüşmesi, portföy ve ekip takibi.',
    image: '/images/industry-pro.jpg',
    href: '/cozumler/pro',
    active: false,
  },
]

const sharedBenefits = [
  {
    icon: CalendarCheck,
    title: 'Randevu düzeni',
    description: 'Takvim, onay ve takip akışı tek panelde toplanır.',
  },
  {
    icon: Users,
    title: 'Ekip görünürlüğü',
    description: 'Sekreter, uzman ve yönetici aynı bilgiyi görür.',
  },
  {
    icon: Shield,
    title: 'Gizlilik odağı',
    description: 'Erişim rolleri ve veri düzeni kontrollü ilerler.',
  },
]

const roadmap = [
  ['Şimdi', productName('health', 'tr'), 'Sağlık profesyonelleri için randevu ve hasta takibi.'],
  ['Sırada', 'Asistan Beauty', 'Salon ve güzellik merkezi operasyonları.'],
  ['Planlanıyor', 'Hukuk ve emlak', 'Müvekkil, müşteri ve görüşme takibi.'],
] as const

export default function SolutionsPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-16 pt-10 md:pb-24 md:pt-12">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-32 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1fr] lg:px-8">
          <FadeUp>
            <Badge className="mb-5 border-0 bg-white text-brand-blue">Çözümler</Badge>
            <h1 className="mb-6 font-heading text-4xl font-black leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-6xl">
              İlk olarak sağlık profesyonelleri için geliştirildi.
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-8 text-slate-600">
              {productName('health', 'tr')} aktif. Güzellik, hukuk ve emlak çözümleri aynı iş yönetimi
              yaklaşımıyla sıradaki sektörlerdir — “yakında” olanlar tamamlanmış sayılmaz.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/cozumler/health">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-brand-blue px-6 font-semibold text-white hover:bg-brand-blue/90"
                >
                  Asistan Health’i incele
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={getClinicTrialPath('tr')}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-brand-blue/30 px-6 text-brand-blue hover:bg-brand-blue/5"
                >
                  {ENTRY_CTA.clinicTrial.tr}
                </Button>
              </Link>
            </div>
          </FadeUp>

          <FadeLeft>
            <MouseParallax strength={10}>
              <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur">
                <div className="relative h-72 overflow-hidden rounded-2xl">
                  <Image
                    src="/images/industry-health.jpg"
                    alt="Klinik randevu yönetimi"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <Badge className="mb-3 border-0 bg-white text-brand-blue">Öncelikli sektör</Badge>
                    <h2 className="text-2xl font-bold text-white">Sağlıkta randevu ve hasta takibi</h2>
                  </div>
                </div>
              </div>
            </MouseParallax>
          </FadeLeft>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">
              Sektörünüze uygun Asistan.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Gerçek olmayan kullanıcı sayıları yerine, hangi sektörün hangi ihtiyacına
              odaklandığımızı açık söylüyoruz.
            </p>
          </FadeUp>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sectors.map((sector, index) => (
              <ScaleIn key={sector.title} delay={0.06 * index}>
                <Card
                  className={`h-full overflow-hidden rounded-2xl border-slate-100 shadow-sm ${
                    sector.active ? 'ring-2 ring-brand-blue/20' : ''
                  }`}
                >
                  <div className="relative h-40">
                    <Image src={sector.image} alt={sector.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-navy">
                      {sector.subtitle}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <sector.icon className="mb-4 h-7 w-7 text-brand-blue" />
                    <h3 className="mb-2 text-lg font-bold text-brand-navy">{sector.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-slate-600">{sector.description}</p>
                    <Link
                      href={sector.href}
                      className="inline-flex items-center text-sm font-semibold text-brand-blue hover:underline"
                    >
                      {sector.active ? 'Detayları incele' : 'Yol haritasında gör'}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dashboard-surface py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <FadeUp>
              <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">
                Her sektörde aynı temel düzen.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Sektöre göre ekranlar değişir; ana hedef aynı kalır: randevu, müşteri/hasta ve ekip
                takibini sadeleştirmek.
              </p>
            </FadeUp>
            <div className="grid gap-5 md:grid-cols-3">
              {sharedBenefits.map((benefit, index) => (
                <ScaleIn key={benefit.title} delay={0.08 * index}>
                  <Card className="h-full rounded-2xl border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <benefit.icon className="mb-4 h-7 w-7 text-brand-blue" />
                      <h3 className="mb-2 font-bold text-brand-navy">{benefit.title}</h3>
                      <p className="text-sm leading-6 text-slate-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </ScaleIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <FadeUp className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Yol haritası</h2>
            <p className="mt-4 text-lg text-slate-600">Önce sağlık, sonra yakın sektörler.</p>
          </FadeUp>
          <div className="space-y-4">
            {roadmap.map(([phase, title, description], index) => (
              <ScaleIn key={title} delay={0.06 * index}>
                <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:grid-cols-[140px_1fr]">
                  <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-semibold text-brand-blue md:w-fit">
                    {phase}
                  </span>
                  <div>
                    <h3 className="font-bold text-brand-navy">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>
    </MarketingPageShell>
  )
}
