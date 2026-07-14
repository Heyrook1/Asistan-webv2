import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  getFeaturedGuide,
  GUIDES,
  readingTimeLabel,
} from '@/lib/resources/guides'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/kaynaklar', {
  title: 'Kaynaklar',
  description:
    'Klinikler için randevu yönetimi, hasta iletişimi ve ekip takibi hakkında pratik Asistan rehberleri.',
})

const topics = [
  { label: 'Randevu yönetimi', href: '/kaynaklar/randevu-takibini-duzenlemek' },
  { label: 'Hasta iletişimi', href: '/kaynaklar/hasta-hatirlatmalari' },
  { label: 'Ekip takibi', href: '/kaynaklar/sekreter-doktor-takvimi' },
  { label: 'Veri gizliliği', href: '/kaynaklar/veri-gizliligi-aliskanliklari' },
] as const


export default function ResourcesPage() {
  const featured = getFeaturedGuide()

  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-20 pt-28">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-24 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <FadeUp>
              <Badge className="mb-6 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">
                Kaynaklar
              </Badge>
              <h1 className="font-heading text-4xl font-black leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
                Klinik yönetimi için sade rehberler.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                Randevu takibi, hasta iletişimi ve ekip düzeni hakkında kısa, uygulanabilir içerikler.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {topics.map((topic, index) => (
                  <ScaleIn key={topic.href} delay={0.05 * index}>
                    <Link
                      href={topic.href}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:text-brand-blue hover:ring-brand-blue/30"
                    >
                      {topic.label}
                    </Link>
                  </ScaleIn>
                ))}
              </div>
            </FadeUp>

            <ScaleIn>
              <Card className="rounded-3xl border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                <CardContent className="p-6 md:p-8">
                  <p className="text-sm font-semibold text-brand-blue">Öne çıkan rehber</p>
                  <h2 className="mt-3 text-2xl font-bold text-brand-navy">{featured.title}</h2>
                  <p className="mt-4 leading-relaxed text-slate-500">{featured.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild className="min-h-11 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-hover">
                      <Link href={`/kaynaklar/${featured.slug}`}>
                        Rehberi oku
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="min-h-11 rounded-xl">
                      <Link href={DEMO_CONTACT_PATH} aria-label={`${ENTRY_CTA.demoRequest.tr} — kaynaklar`}>
                        {ENTRY_CTA.demoRequest.tr}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-black text-brand-navy">Son içerikler</h2>
              <p className="mt-3 max-w-2xl text-slate-500">
                Klinik operasyonlarına odaklanan kısa rehberler — her kart gerçek bir sayfaya gider.
              </p>
            </div>
            <Button asChild variant="outline" className="min-h-11 rounded-xl border-slate-300 text-brand-navy">
              <Link href="/cozumler/health" aria-label="Asistan Health çözümünü incele">
                Asistan Health çözümünü incele
              </Link>
            </Button>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide, index) => {
              const href = `/kaynaklar/${guide.slug}`
              const time = readingTimeLabel(guide)
              return (
                <ScaleIn key={guide.slug} delay={0.05 * index}>
                  <Card className="h-full rounded-2xl border-slate-200 transition-all hover:border-brand-blue/40 hover:shadow-lg">
                    <CardContent className="flex h-full flex-col p-6">
                      <Link href={href} className="flex flex-1 flex-col outline-none">
                        <div className="mb-5 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10">
                            <guide.icon className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                            {guide.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold leading-snug text-brand-navy">
                          {guide.title}
                        </h3>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
                          {guide.description}
                        </p>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {time}
                          </span>
                          <span className="inline-flex items-center text-sm font-semibold text-brand-blue">
                            Oku
                            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                </ScaleIn>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-dashboard-surface py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <FadeUp>
            <Badge className="mb-5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">
              E-posta listesi
            </Badge>
            <h2 className="font-heading text-3xl font-black text-brand-navy">
              Yeni rehberleri kaçırmayın.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500">
              Ürün notları ve klinik operasyon rehberleri hazır oldukça e-posta ile paylaşalım.
            </p>
            <form
              action={`mailto:merhaba@asistan.online?subject=${encodeURIComponent('Kaynaklar e-posta listesi')}`}
              method="get"
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <label className="sr-only" htmlFor="resources-email">
                E-posta adresi
              </label>
              <Input
                id="resources-email"
                type="email"
                name="body"
                required
                placeholder="E-posta adresiniz"
                className="min-h-11 rounded-xl border-slate-300"
                autoComplete="email"
              />
              <Button type="submit" className="min-h-11 rounded-xl bg-brand-blue text-white hover:bg-brand-blue-hover">
                Haberdar Ol
              </Button>
            </form>
            <p className="mt-3 text-xs text-slate-400">
              Form e-posta istemcinizi açar; sadece ürün ve rehber duyuruları için kullanılır.
            </p>
          </FadeUp>
        </div>
      </section>
    </MarketingPageShell>
  )
}
