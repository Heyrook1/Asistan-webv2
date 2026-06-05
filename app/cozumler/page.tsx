import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Briefcase, CalendarCheck, HeartPulse, Landmark, Scissors, Shield, Users } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeLeft, FadeUp, MouseParallax, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Cozumler | Asistan Health ve Sektor Yol Haritasi',
  description: 'Asistan ilk olarak saglik profesyonelleri icin gelistirildi. Guzellik, hukuk ve emlak cozumleri siradaki sektorlerdir.',
}

const sectors = [
  {
    icon: HeartPulse,
    title: 'Asistan Health',
    subtitle: 'Aktif / Ilk odak sektor',
    description: 'Doktorlar, klinikler, dis hekimleri, psikologlar ve saglik ekipleri icin randevu ve hasta takibi.',
    image: '/images/industry-health.jpg',
    href: '/cozumler/health',
    active: true,
  },
  {
    icon: Scissors,
    title: 'Asistan Beauty',
    subtitle: 'Yakinda',
    description: 'Guzellik merkezleri, kuaforler ve wellness ekipleri icin musteri ve randevu duzeni.',
    image: '/images/industry-beauty.jpg',
    href: '/cozumler/beauty',
    active: false,
  },
  {
    icon: Landmark,
    title: 'Asistan Legal',
    subtitle: 'Yakinda',
    description: 'Hukuk burolari icin gorusme, muvekkil ve dosya takibini sadelestiren yapi.',
    image: '/images/industry-legal.jpg',
    href: '/cozumler/legal',
    active: false,
  },
  {
    icon: Briefcase,
    title: 'Asistan Emlak',
    subtitle: 'Planlaniyor',
    description: 'Emlak ofisleri icin musteri gorusmesi, portfoy ve ekip takibi.',
    image: '/images/industry-pro.jpg',
    href: '/cozumler/pro',
    active: false,
  },
]

const sharedBenefits = [
  { icon: CalendarCheck, title: 'Randevu duzeni', description: 'Takvim, onay ve takip akisi tek panelde toplanir.' },
  { icon: Users, title: 'Ekip gorunurlugu', description: 'Sekreter, uzman ve yonetici ayni bilgiyi gorur.' },
  { icon: Shield, title: 'Gizlilik odagi', description: 'Erisim rolleri ve veri duzeni kontrollu ilerler.' },
]

const roadmap = [
  ['Simdi', 'Asistan Health', 'Saglik profesyonelleri icin randevu ve hasta takibi.'],
  ['Sirada', 'Asistan Beauty', 'Salon ve guzellik merkezi operasyonlari.'],
  ['Planlaniyor', 'Hukuk ve Emlak', 'Muvekkil, musteri ve gorusme takibi.'],
]

export default function SolutionsPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-16 pt-28 md:pb-24 md:pt-32">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-32 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1fr] lg:px-8">
          <FadeUp>
            <Badge className="mb-5 border-0 bg-white text-brand-teal">Cozumler</Badge>
            <h1 className="mb-6 font-heading text-4xl font-black leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-6xl">
              Ilk olarak saglik profesyonelleri icin gelistirildi.
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-8 text-slate-600">
              Asistan Health aktif. Guzellik, hukuk ve emlak cozumleri ayni is yonetimi yaklasimiyla siradaki sektorlerdir.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/cozumler/health">
                <Button size="lg" className="h-12 rounded-xl bg-brand-teal px-6 font-semibold text-white hover:bg-brand-teal-hover">
                  Health'i Incele
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="outline" className="h-12 rounded-xl border-brand-teal/30 px-6 text-brand-teal hover:bg-brand-teal/5">
                  Erken Erisim Talep Et
                </Button>
              </Link>
            </div>
          </FadeUp>

          <FadeLeft>
            <MouseParallax strength={10}>
              <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur">
                <div className="relative h-72 overflow-hidden rounded-2xl">
                  <Image src="/images/industry-health.jpg" alt="Klinik randevu yonetimi" fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <Badge className="mb-3 border-0 bg-white text-brand-teal">Oncelikli sektor</Badge>
                    <h2 className="text-2xl font-bold text-white">Saglikta randevu ve hasta takibi</h2>
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
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Sektorunuze uygun Asistan.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Gercek olmayan kullanici sayilari yerine, hangi sektorun hangi ihtiyacina odaklandigimizi acik soyluyoruz.
            </p>
          </FadeUp>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sectors.map((sector, index) => (
              <ScaleIn key={sector.title} delay={0.06 * index}>
                <Card className={`h-full overflow-hidden rounded-2xl border-slate-100 shadow-sm ${sector.active ? 'ring-2 ring-brand-teal/20' : ''}`}>
                  <div className="relative h-40">
                    <Image src={sector.image} alt={sector.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-navy">
                      {sector.subtitle}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <sector.icon className="mb-4 h-7 w-7 text-brand-teal" />
                    <h3 className="mb-2 text-lg font-bold text-brand-navy">{sector.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-slate-600">{sector.description}</p>
                    <Link href={sector.href} className="inline-flex items-center text-sm font-semibold text-brand-teal hover:underline">
                      {sector.active ? 'Detaylari incele' : 'Yol haritasinda gor'}
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
              <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Her sektorde ayni temel duzen.</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Sektore gore ekranlar degisir; ana hedef ayni kalir: randevu, musteri/hasta ve ekip takibini sadelestirmek.
              </p>
            </FadeUp>
            <div className="grid gap-5 md:grid-cols-3">
              {sharedBenefits.map((benefit, index) => (
                <ScaleIn key={benefit.title} delay={0.08 * index}>
                  <Card className="h-full rounded-2xl border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <benefit.icon className="mb-4 h-7 w-7 text-brand-teal" />
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
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Yol haritasi</h2>
            <p className="mt-4 text-lg text-slate-600">Once saglik, sonra yakin sektorler.</p>
          </FadeUp>
          <div className="space-y-4">
            {roadmap.map(([phase, title, description], index) => (
              <ScaleIn key={title} delay={0.06 * index}>
                <div className="grid gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:grid-cols-[140px_1fr]">
                  <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-sm font-semibold text-brand-teal md:w-fit">{phase}</span>
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
