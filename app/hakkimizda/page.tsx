import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, HeartHandshake, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeLeft, FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
  title: 'Hakkimizda',
  description: "Asistan, KKTC'deki klinikler ve hizmet isletmeleri icin gelistirilen AI destekli is yonetim platformudur.",
}

const principles = [
  {
    icon: MapPin,
    title: 'Yerel ihtiyac',
    description: "Urun kararlarini KKTC'deki isletmelerin gercek operasyon sorunlarina gore sekillendiriyoruz.",
  },
  {
    icon: HeartHandshake,
    title: 'Sade kullanim',
    description: 'Teknik bilgi gerektirmeyen, sekreter ve yonetici ekiplerinin hizli kavrayacagi akislar tasarliyoruz.',
  },
  {
    icon: ShieldCheck,
    title: 'Guvenli ve uyumlu',
    description: 'Hasta ve musteri bilgisinin hassasiyetini urun deneyiminin merkezinde tutuyoruz.',
  },
  {
    icon: Building2,
    title: 'Sektorel odak',
    description: 'Once saglik, ardindan guzellik, hukuk ve emlak gibi dikeylerde net cozumler gelistiriyoruz.',
  },
]

const missionVision = [
  {
    title: 'Misyon',
    description:
      'Randevu yonetimini daha kolay, daha guvenli ve daha duzenli hale getirerek saglik ekiplerinin idari yukunu azaltmak.',
  },
  {
    title: 'Vizyon',
    description:
      "KKTC odakli randevu ve hizmet altyapisini sagliktan baslayip diger profesyonel dikeylere genisleten guvenilir bir SaaS standardi olmak.",
  },
]

const team = [
  { name: 'Dr. Can Aygen', role: 'Kurucu & CEO' },
  { name: 'Selin Karagolu', role: 'Urun Direktoru' },
  { name: 'Mehmet Dervis', role: 'CTO' },
  { name: 'Ece Yilmaz', role: 'Musteri Basarisi' },
]

const contactItems = [
  { label: 'Adres', value: 'Lefkosa, KKTC' },
  { label: 'Telefon', value: '+90 392 000 00 00' },
  { label: 'E-posta', value: 'merhaba@asistan.online' },
  { label: 'Calisma', value: 'Pzt-Cum 09:00 - 18:00' },
]

export default function AboutPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-20 pt-28">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 top-24 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
          <FadeUp>
            <Badge className="mb-6 bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/10">Hakkimizda</Badge>
            <h1 className="font-heading text-4xl font-black leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Daha iyi bir saglik deneyimi icin buradayiz.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Asistan, kliniklerin tum is akislarini tek platformda toplayan, yapay zeka destekli is yonetim platformudur.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="min-h-11 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover">
                <Link href="/auth/sign-up" aria-label="Asistan erken erisim basvurusu yap">
                  Ekibimizle Tanisin
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 rounded-xl border-slate-300 text-brand-navy hover:bg-white">
                <Link href="/cozumler/health">Health'i Incele</Link>
              </Button>
            </div>
          </FadeUp>

          <FadeLeft>
            <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-3 shadow-2xl backdrop-blur">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src="/images/medical-team.jpg" alt="Asistan Health ekip calismasi" fill className="object-cover" priority />
              </div>
            </div>
          </FadeLeft>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Misyonumuz</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Saglik profesyonellerinin is yukunu azaltan, insan odakli ve olceklenebilir bir deneyim sunmak.
            </p>
          </FadeUp>
          <div className="mb-10 grid gap-4 md:grid-cols-2">
            {missionVision.map((item, index) => (
              <ScaleIn key={item.title} delay={0.05 * index}>
                <div className="rounded-2xl border border-brand-blue/15 bg-dashboard-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{item.description}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <ScaleIn key={member.name} delay={0.06 * index}>
                <Card className="rounded-2xl border-slate-100 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-lg font-bold text-brand-blue">
                      {member.name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')}
                    </div>
                    <p className="font-semibold text-brand-navy">{member.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dashboard-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Neden Asistan?</h2>
          </FadeUp>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle, index) => (
              <ScaleIn key={principle.title} delay={0.06 * index}>
                <Card className="h-full rounded-2xl border-slate-100 bg-white">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/10">
                      <principle.icon className="h-6 w-6 text-brand-blue" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-navy">{principle.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{principle.description}</p>
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <FadeUp>
            <h2 className="font-heading text-3xl font-black text-brand-navy">Iletisim Bilgilerimiz</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {contactItems.map((item, index) => (
                <ScaleIn key={item.label} delay={0.05 * index}>
                  <div className="rounded-xl border border-slate-200 bg-dashboard-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-teal">{item.label}</p>
                    <p className="mt-2 text-sm font-medium text-brand-navy">{item.value}</p>
                  </div>
                </ScaleIn>
              ))}
            </div>
          </FadeUp>

          <ScaleIn>
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-brand-navy">Bize Ulasin / Demo Talep Edin</h3>
                <p className="mt-2 text-sm text-slate-500">Ekibimiz size en kisa surede donus yapacaktir.</p>
                <form className="mt-6 space-y-3">
                  <Input id="contact-name" name="name" placeholder="Ad Soyad" autoComplete="name" />
                  <Input id="contact-email" name="email" type="email" placeholder="E-posta" autoComplete="email" />
                  <Input id="contact-company" name="company" placeholder="Klinik / Kurum Adi" autoComplete="organization" />
                  <Textarea id="contact-message" name="message" placeholder="Mesajiniz" rows={4} />
                  <Button className="w-full rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover">Gonder</Button>
                </form>
              </CardContent>
            </Card>
          </ScaleIn>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <FadeUp className="mx-auto max-w-7xl rounded-3xl bg-brand-navy p-8 text-white md:p-12">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-heading text-3xl font-black">Asistan ile kliniginizi gelecege tasiyin.</h2>
              <p className="mt-4 max-w-2xl text-white/75">Daha az idari is, daha fazla hasta odagi.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="min-h-11 rounded-xl bg-white text-brand-navy hover:bg-white/90">
                <Link href="/auth/sign-up">Ekran Erisim</Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11 rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link href="/auth/sign-up">Demo Talep Et</Link>
              </Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </MarketingPageShell>
  )
}
