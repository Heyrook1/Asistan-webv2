import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getGuideBySlug,
  GUIDES,
  readingTimeLabel,
} from '@/lib/resources/guides'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'
import { absoluteUrl, SITE_URL } from '@/lib/seo'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return { title: 'Rehber bulunamadı' }
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/kaynaklar/${guide.slug}` },
    openGraph: { url: `/kaynaklar/${guide.slug}` },
  }
}

export default async function GuideArticlePage({ params }: PageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const Icon = guide.icon
  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3)
  const articleUrl = absoluteUrl(`/kaynaklar/${guide.slug}`)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    inLanguage: 'tr',
    url: articleUrl,
    author: { '@type': 'Organization', name: 'Asistan Health', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Asistan Health', url: SITE_URL },
    mainEntityOfPage: articleUrl,
  }

  return (
    <MarketingPageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="bg-white pb-20 pt-10">
        <div className="marketing-container max-w-3xl">
          <FadeUp>
            <Link
              href="/kaynaklar"
              className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-brand-blue"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Kaynaklar
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge className="border-0 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">
                {guide.type}
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {readingTimeLabel(guide)}
              </span>
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-black leading-tight text-brand-navy md:text-4xl">
                  {guide.title}
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600 md:text-lg">
                  {guide.description}
                </p>
              </div>
            </div>
          </FadeUp>

          <div className="mt-10 space-y-6 border-t border-slate-200 pt-10">
            {guide.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-[15px] leading-8 text-slate-600">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-10 space-y-8">
            {guide.sections.map((section, index) => (
              <section key={section.heading} id={`bolum-${index + 1}`} className="scroll-mt-28">
                <h2 className="text-xl font-bold text-brand-navy">
                  {index + 1}. {section.heading}
                </h2>
                <p className="mt-3 text-[15px] leading-8 text-slate-600">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-brand-navy p-6 text-white md:p-8">
            <h2 className="text-xl font-black">Kliniğinizde denemek ister misiniz?</h2>
            <p className="mt-2 text-sm leading-7 text-white/75">
              Ajanda, hasta kartı ve ekip yetkilerini Asistan panelinde birlikte kurabiliriz.
            </p>
            <Button asChild className="mt-5 rounded-xl bg-white text-brand-navy hover:bg-white/90">
              <Link href={DEMO_CONTACT_PATH}>
                {ENTRY_CTA.demoRequest.tr}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="text-lg font-bold text-brand-navy">İlgili rehberler</h2>
              <ul className="mt-4 space-y-3">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/kaynaklar/${item.slug}`}
                      className="group flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-brand-blue/40"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                          {item.type}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-brand-navy group-hover:text-brand-blue">
                          {item.title}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 group-hover:text-brand-blue" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </MarketingPageShell>
  )
}
