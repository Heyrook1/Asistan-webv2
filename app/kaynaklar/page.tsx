import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, CalendarCheck, Clock, FileText, MessageSquare, Shield } from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export const metadata: Metadata = {
  title: 'Kaynaklar',
  description: 'Klinikler icin randevu yonetimi, hasta iletisimi ve ekip takibi hakkinda pratik Asistan rehberleri.',
}

const guides = [
  {
    type: 'Rehber',
    icon: CalendarCheck,
    title: 'Kliniklerde randevu takibini duzenlemenin yollari',
    description: 'Takvim, hatirlatma ve takip sorumlulugunu daha net bir akisa yerlestirin.',
    time: '6 dk okuma',
  },
  {
    type: 'Hasta iletisimi',
    icon: MessageSquare,
    title: 'Hasta hatirlatmalari neden onemlidir?',
    description: 'Gelmeyen randevulari azaltmak icin hatirlatma dilini ve zamanlamayi planlayin.',
    time: '5 dk okuma',
  },
  {
    type: 'Ekip',
    icon: BookOpen,
    title: 'Sekreter ve doktor takvimini ayni panelden yonetmek',
    description: 'Rol bazli gorunumle ekip ici karisikligi azaltan temel kullanim senaryolari.',
    time: '7 dk okuma',
  },
  {
    type: 'Gizlilik',
    icon: Shield,
    title: 'Kliniklerde veri gizliligi icin temel aliskanliklar',
    description: 'Hasta bilgisi, yetki ve erisim sureclerinde dikkat edilmesi gereken noktalar.',
    time: '4 dk okuma',
  },
  {
    type: 'Operasyon',
    icon: Clock,
    title: 'Gelmeyen randevulari azaltmak icin takip akisi',
    description: 'Randevu oncesi ve sonrasi yapilacak kucuk kontrollerle takibi guclendirin.',
    time: '6 dk okuma',
  },
  {
    type: 'Urun notlari',
    icon: FileText,
    title: 'Asistan Health urun notlari',
    description: 'Erken erisim doneminde oncelik verilen saglik sektoru ihtiyaclarini takip edin.',
    time: '3 dk okuma',
  },
]

const topics = ['Randevu yonetimi', 'Hasta iletisimi', 'Ekip takibi', 'Veri gizliligi']

export default function ResourcesPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-20 pt-28">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-24 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <FadeUp>
              <Badge className="mb-6 bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/10">Kaynaklar</Badge>
              <h1 className="font-heading text-4xl font-black leading-tight text-brand-navy sm:text-5xl lg:text-6xl">
                Klinik yonetimi icin sade rehberler.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                Randevu takibi, hasta iletisimi ve ekip duzeni hakkinda kisa, uygulanabilir ve saglik ekiplerinin gunluk diline yakin icerikler.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {topics.map((topic, index) => (
                  <ScaleIn key={topic} delay={0.05 * index}>
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600">{topic}</span>
                  </ScaleIn>
                ))}
              </div>
            </FadeUp>

            <ScaleIn>
              <Card className="rounded-3xl border-slate-200 bg-white shadow-xl shadow-slate-200/60">
                <CardContent className="p-6 md:p-8">
                  <p className="text-sm font-semibold text-brand-teal">One cikan rehber</p>
                  <h2 className="mt-3 text-2xl font-bold text-brand-navy">Excel ve WhatsApp ile randevu takibi nerede zorlasir?</h2>
                  <p className="mt-4 leading-relaxed text-slate-500">
                    Randevu degisiklikleri, hasta hatirlatmalari ve ekip ici bilgi paylasimi ayni anda buyudugunde operasyon dagilmaya baslar.
                  </p>
                  <Button asChild className="mt-6 min-h-11 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover">
                    <Link href="/auth/sign-up" aria-label="One cikan rehber hakkinda demo talep et">
                      Demo Talep Et
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
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
              <h2 className="font-heading text-3xl font-black text-brand-navy">Son icerikler</h2>
              <p className="mt-3 max-w-2xl text-slate-500">Erken erisim doneminde ozellikle klinik operasyonlarina odaklanan icerikler.</p>
            </div>
            <Button asChild variant="outline" className="min-h-11 rounded-xl border-slate-300 text-brand-navy">
              <Link href="/cozumler/health" aria-label="Asistan Health cozumunu incele">
                Health Cozumunu Incele
              </Link>
            </Button>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide, index) => (
              <ScaleIn key={guide.title} delay={0.05 * index}>
                <Card className="rounded-2xl border-slate-200 transition-all hover:border-brand-teal/40 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/10">
                        <guide.icon className="h-5 w-5 text-brand-teal" aria-hidden="true" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-teal">{guide.type}</span>
                    </div>
                    <h3 className="text-lg font-semibold leading-snug text-brand-navy">{guide.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{guide.description}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {guide.time}
                      </span>
                      <span className="inline-flex items-center text-sm font-semibold text-brand-teal">
                        Oku
                        <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dashboard-surface py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <FadeUp>
            <Badge className="mb-5 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/10">E-posta listesi</Badge>
            <h2 className="font-heading text-3xl font-black text-brand-navy">Yeni rehberleri kacirmayin.</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-500">
              Asistan Health urun notlari ve klinik operasyon rehberleri hazir oldukca e-posta ile paylasalim.
            </p>
            <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="resources-email">
                E-posta adresi
              </label>
              <Input
                id="resources-email"
                type="email"
                name="email"
                placeholder="E-posta adresiniz"
                className="min-h-11 rounded-xl border-slate-300"
                autoComplete="email"
              />
              <Button className="min-h-11 rounded-xl bg-brand-teal text-white hover:bg-brand-teal-hover">Haberdar Ol</Button>
            </form>
            <p className="mt-3 text-xs text-slate-400">Sadece urun ve rehber duyurulari gonderilir.</p>
          </FadeUp>
        </div>
      </section>
    </MarketingPageShell>
  )
}
