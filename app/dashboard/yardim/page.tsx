import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Mail,
  Shield,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  HELP_FAQ,
  HELP_QUICK_LINKS,
  HELP_SUPPORT,
} from '@/lib/dashboard-help'
import { GUIDES, readingTimeLabel } from '@/lib/resources/guides'
import { requireSession } from '@/lib/session'

export const dynamic = 'force-dynamic'

export default async function YardimPage() {
  await requireSession()

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-teal">
          <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          Yardım Merkezi
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-brand-ink md:text-3xl">
          Klinik panelini hızlı kullanın
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Sık kullanılan ekranlar, kısa yanıtlar ve rehberler. Daha derin içerik için kaynaklara,
          güvenlik için Güven Merkezi’ne, insan desteği için iletişim kanalına gidin.
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="help-quick">
        <h2 id="help-quick" className="text-sm font-semibold text-brand-ink">
          Hızlı bağlantılar
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {HELP_QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border bg-white p-4 transition hover:border-brand-teal/40 hover:shadow-sm"
            >
              <p className="font-semibold text-brand-ink group-hover:text-brand-teal">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="help-faq">
        <h2 id="help-faq" className="text-sm font-semibold text-brand-ink">
          Sık sorulanlar
        </h2>
        <div className="space-y-2">
          {HELP_FAQ.map((item) => (
            <Card key={item.q} className="border-slate-200/80 shadow-none">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-semibold text-brand-ink">{item.q}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="help-guides">
        <div className="flex items-end justify-between gap-3">
          <h2 id="help-guides" className="text-sm font-semibold text-brand-ink">
            Rehberler
          </h2>
          <Link
            href={HELP_SUPPORT.resourcesPath}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal hover:underline"
          >
            Tüm kaynaklar
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {GUIDES.slice(0, 4).map((guide) => (
            <Link
              key={guide.slug}
              href={`/kaynaklar/${guide.slug}`}
              className="flex gap-3 rounded-2xl border bg-white p-4 transition hover:border-brand-teal/40 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                <guide.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-brand-ink">{guide.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {readingTimeLabel(guide)} · {guide.type}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2" aria-labelledby="help-support">
        <h2 id="help-support" className="sr-only">
          Destek kanalları
        </h2>
        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
              <LifeBuoy className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-brand-ink">İnsan desteği</p>
              <p className="text-sm text-muted-foreground">
                Kurulum, abonelik veya teknik sorun için ekibimize yazın.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Button asChild className="bg-brand-teal text-white hover:bg-brand-teal-hover">
                <a href={HELP_SUPPORT.mailto}>
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  E-posta
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href={HELP_SUPPORT.contactPath}>İletişim formu</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-none">
          <CardContent className="flex h-full flex-col gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
              <Shield className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-brand-ink">Güven & gizlilik</p>
              <p className="text-sm text-muted-foreground">
                Veri işleme, KVKK ve güvenlik uygulamaları için Güven Merkezi.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href={HELP_SUPPORT.trustPath}>
                  <BookOpen className="mr-2 h-4 w-4" aria-hidden />
                  Güven Merkezi
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/privacy">Gizlilik</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
