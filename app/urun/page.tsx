import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Lock,
  MessageSquare,
  Settings,
  Sparkles,
  UserCog,
  Users,
} from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeLeft, FadeUp, MouseParallax, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Urun | Asistan ile Randevu ve Hasta Takibi',
  description: 'Asistan ile takvim, hasta kayitlari, hatirlatmalar, ekip rolleri ve AI onerilerini tek panelden yonetin.',
}

const coreFeatures = [
  {
    icon: Calendar,
    title: 'Akilli Takvim',
    description: 'Doktor, sekreter ve yonetici ayni randevu duzenini gorur.',
    bullets: ['Bekleyen onaylar', 'Musait saat takibi', 'Gunluk randevu listesi'],
  },
  {
    icon: Bell,
    title: 'Hatirlatmalar',
    description: 'Randevu unutmalarini azaltmak icin takip mesajlarini planlayin.',
    bullets: ['Randevu oncesi bildirim', 'Takip hatirlatmasi', 'Geciken isler'],
  },
  {
    icon: FileText,
    title: 'Hasta Kartlari',
    description: 'Hasta bilgisi, randevu gecmisi ve notlar ayni yerde kalsin.',
    bullets: ['Hasta ozeti', 'Klinik notlar', 'Dosya ve tahlil takibi'],
  },
  {
    icon: UserCog,
    title: 'Sekreter Hesabi',
    description: 'Ekip uyelerine gorevlerine gore erisim verin.',
    bullets: ['Rol bazli yetki', 'Ekip gorunumu', 'Isletme kontrolu'],
  },
  {
    icon: Sparkles,
    title: 'AI Onerileri',
    description: 'Bos saat, bekleyen onay ve takip firsatlarini daha hizli gorun.',
    bullets: ['Bos saat onerisi', 'Bekleyen hasta takibi', 'Gunluk ozet'],
  },
  {
    icon: Lock,
    title: 'Gizlilik Odagi',
    description: 'Hasta ve isletme verisini gizlilik prensipleriyle yonetin.',
    bullets: ['Erisim kontrolu', 'Kayit duzeni', 'Guvenli oturum'],
  },
]

const dailyFlow = [
  {
    time: 'Sabah',
    title: 'Takvimi kontrol edin',
    description: 'Bugunku randevulari, bekleyen onaylari ve bos saatleri gorun.',
  },
  {
    time: 'Gun icinde',
    title: 'Sekreter akis yonetsin',
    description: 'Hasta ekleme, randevu planlama ve not alma ayni panelden ilerlesin.',
  },
  {
    time: 'Randevu oncesi',
    title: 'Hatirlatmalari takip edin',
    description: 'Unutulan randevu riskini azaltmak icin bildirimleri duzenleyin.',
  },
  {
    time: 'Gun sonunda',
    title: 'Ozeti gorun',
    description: 'Tamamlanan randevulari, takip gerektiren hastalari ve ekip islerini kontrol edin.',
  },
]

const personas = [
  { icon: ClipboardList, title: 'Doktor', description: 'Hasta gecmisini ve takip notlarini hizli gorur.' },
  { icon: Users, title: 'Klinik yoneticisi', description: 'Randevu yogunlugunu ve ekip duzenini takip eder.' },
  { icon: MessageSquare, title: 'Sekreter', description: 'Telefon, mesaj ve takvim akisini ayni yerden yonetir.' },
  { icon: Settings, title: 'Isletme sahibi', description: 'Gunluk operasyonu daha az daginiklikla kontrol eder.' },
]

const upcomingFeatures = ['Online odeme altyapisi', 'Mobil uygulama', 'Ozel entegrasyonlar']

export default function ProductPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-16 pt-28 md:pb-24 md:pt-32">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1fr] lg:px-8">
          <FadeUp>
            <Badge className="mb-5 border-0 bg-white text-brand-teal">Urun</Badge>
            <h1 className="mb-6 font-heading text-4xl font-black leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-6xl">
              Kliniginizin gunluk islerini tek panelden yonetin.
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-8 text-slate-600">
              Asistan; takvim, hasta kartlari, hatirlatmalar, ekip rolleri ve AI onerilerini sade bir is akisinda birlestirir.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/sign-up">
                <Button size="lg" className="h-12 rounded-xl bg-brand-teal px-6 font-semibold text-white hover:bg-brand-teal-hover">
                  Erken Erisime Katil
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cozumler/health">
                <Button size="lg" variant="outline" className="h-12 rounded-xl border-brand-teal/30 px-6 text-brand-teal hover:bg-brand-teal/5">
                  Saglik Cozumunu Gor
                </Button>
              </Link>
            </div>
          </FadeUp>

          <FadeLeft className="w-full">
            <MouseParallax strength={12}>
              <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-bold text-brand-navy">Gunluk akis</p>
                    <p className="text-xs text-slate-500">Ornek klinik gorunumu</p>
                  </div>
                  <Clock className="h-5 w-5 text-brand-teal" />
                </div>
                <div className="space-y-3">
                  {dailyFlow.map((item, index) => (
                    <ScaleIn key={item.title} delay={0.04 * index}>
                      <div className="rounded-2xl bg-dashboard-surface p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-teal">{item.time}</p>
                        <h3 className="font-bold text-brand-navy">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                      </div>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </MouseParallax>
          </FadeLeft>
        </div>
      </section>

      <section id="moduller" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeUp className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Asistan ile neleri yonetebilirsiniz?</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">Her ozellik tek bir amaca hizmet eder: gunluk takip yukunu azaltmak.</p>
          </FadeUp>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature, index) => (
              <ScaleIn key={feature.title} delay={0.06 * index}>
                <Card className="h-full rounded-2xl border-slate-100 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <feature.icon className="mb-4 h-8 w-8 text-brand-teal" />
                    <h3 className="mb-2 text-xl font-bold text-brand-navy">{feature.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-slate-600">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-teal" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="bg-dashboard-surface py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <FadeUp>
              <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Kimler kullanir?</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Asistan, sadece yoneticinin degil, randevu akisina dokunan herkesin isini sadelestirir.
              </p>
            </FadeUp>
            <div className="grid gap-5 sm:grid-cols-2">
              {personas.map((persona, index) => (
                <ScaleIn key={persona.title} delay={0.06 * index}>
                  <Card className="h-full rounded-2xl border-slate-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <persona.icon className="mb-4 h-7 w-7 text-brand-teal" />
                      <h3 className="mb-2 font-bold text-brand-navy">{persona.title}</h3>
                      <p className="text-sm leading-6 text-slate-600">{persona.description}</p>
                    </CardContent>
                  </Card>
                </ScaleIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <FadeUp className="rounded-3xl bg-brand-navy p-8 text-white md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <div>
                <Badge className="mb-4 border-0 bg-white/10 text-white">Daha sonra gelecekler</Badge>
                <h2 className="font-heading text-3xl font-black md:text-4xl">Vaatleri sirayla yayina aliyoruz.</h2>
                <p className="mt-4 text-white/70">
                  Henuz aktif olmayan ozellikleri gercek fiyat veya kesin tarih vermeden yol haritasinda tutuyoruz.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {upcomingFeatures.map((feature, index) => (
                  <ScaleIn key={feature} delay={0.06 * index}>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold">{feature}</p>
                      <p className="mt-1 text-xs text-white/55">Yakinda</p>
                    </div>
                  </ScaleIn>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </MarketingPageShell>
  )
}
