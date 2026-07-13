import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Scale,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'

import { MarketingPageShell } from '@/components/marketing/page-shell'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'

type IndustryConfig = {
  icon: typeof HeartPulse
  title: string
  subtitle: string
  description: string
  longDescription: string
  accent: string
  accentSoft: string
  accentText: string
  features: string[]
  benefits: { icon: typeof Clock; title: string; description: string }[]
  useCases: string[]
}

const industries: Record<string, IndustryConfig> = {
  health: {
    icon: HeartPulse,
    title: 'Asistan Health',
    subtitle: 'Saglik Sektoru',
    description: 'Klinik, dis hekimi ve muayenehaneler icin randevu ile hasta yonetimi.',
    longDescription:
      'Doktorlar, dis hekimleri, psikologlar ve tum saglik profesyonelleri icin tasarlanan akis. Hasta kayitlari, randevu plani, ekip rolleri ve raporlama tek panelde.',
    accent: 'bg-brand-teal',
    accentSoft: 'bg-brand-teal/10',
    accentText: 'text-brand-teal-dark',
    features: [
      'Hasta kartlari ve gecmis kayitlar',
      'Online randevu ve takvim plani',
      'SMS webhook entegrasyonuna hazir hatirlatma altyapisi',
      'Rol bazli ekip yonetimi',
      'KVKK odakli veri ayrimi',
      'Detayli klinik raporlari',
    ],
    benefits: [
      { icon: Clock, title: 'Daha net takip', description: 'Randevu ve ekip gorevleri ayni panelde izlenir.' },
      { icon: Users, title: 'Daha az karisiklik', description: 'Sekreter ve doktor tek bilgi akisini gorur.' },
      { icon: Shield, title: 'Guvenli veri modeli', description: 'Rol bazli erisim ve tenant izolasyonu.' },
      { icon: BarChart3, title: 'Olculebilir kararlar', description: 'Gunluk doluluk ve performans takibi.' },
    ],
    useCases: [
      'Ozel muayenehaneler',
      'Poliklinikler',
      'Dis merkezleri',
      'Psikoloji klinikleri',
      'Fizyoterapi merkezleri',
      'Estetik klinikleri',
    ],
  },
  saglik: {} as IndustryConfig,
  beauty: {
    icon: Sparkles,
    title: 'Asistan Beauty',
    subtitle: 'Guzellik & Wellness',
    description: 'Salonlar ve guzellik merkezleri icin musteri, paket ve randevu yonetimi.',
    longDescription:
      'Paket satislari, tekrarli seans planlari, musteri notlari ve ekip cizelgesini tek panelde toplar. Moda hizina degil operasyon duzenine odaklanir.',
    accent: 'bg-fuchsia-500',
    accentSoft: 'bg-fuchsia-100',
    accentText: 'text-fuchsia-700',
    features: [
      'Paket ve seans takibi',
      'Musteri sadakat akislarina hazir panel',
      'Online rezervasyon gorunumu',
      'Personel uygunluk planlama',
      'Kasa ve fiyat listesi yonetimi',
      'Performans raporlamasi',
    ],
    benefits: [
      { icon: Clock, title: 'Planli gun akisleri', description: 'Yogun saatlerde rezervasyon dagilim dengesi.' },
      { icon: Users, title: 'Musteri deneyimi', description: 'Daha duzenli takip ve geri donus sureci.' },
      { icon: Shield, title: 'Guvenli veri tutarliligi', description: 'Musteri verileri rol bazinda sinirlanir.' },
      { icon: BarChart3, title: 'Satis gorunurlugu', description: 'Paket ve hizmet bazli gelir gorunumu.' },
    ],
    useCases: [
      'Kuafor salonlari',
      'Guzellik merkezleri',
      'Spa ve wellness',
      'Nail art studyo',
      'Cilt bakim merkezleri',
      'Masaj salonlari',
    ],
  },
  legal: {
    icon: Scale,
    title: 'Asistan Legal',
    subtitle: 'Hukuk Sektoru',
    description: 'Hukuk burolari icin gorusme, dosya ve takvim duzeni.',
    longDescription:
      'Muvekkil dosyalari, gorusme ajandasi ve operasyon notlarini tek yerde toplar. Hukuk ekiplerinin dairesel takip yukunu azaltir.',
    accent: 'bg-amber-500',
    accentSoft: 'bg-amber-100',
    accentText: 'text-amber-700',
    features: [
      'Muvekkil dosya kartlari',
      'Gorusme ve durusma plani',
      'Saat bazli takip notlari',
      'Belge yonetim alanlari',
      'Yetki bazli ekip gorunumu',
      'Operasyon raporlari',
    ],
    benefits: [
      { icon: Clock, title: 'Sure takibi', description: 'Oncelikli dosyalar tek gorunumde listelenir.' },
      { icon: Users, title: 'Ekip koordinasyonu', description: 'Sekreter ve avukat ortak ajanda ile calisir.' },
      { icon: Shield, title: 'Muvekkil gizliligi', description: 'Yetkisiz veri goruntuleme engellenir.' },
      { icon: BarChart3, title: 'Is yuku gorunumu', description: 'Dosya yogunlugu ve zaman dagilimi olculur.' },
    ],
    useCases: [
      'Avukatlik burolari',
      'Hukuk danismanligi',
      'Arabuluculuk merkezleri',
      'Patent marka burolari',
      'Noter ofisleri',
      'Mali danismanlik',
    ],
  },
  pro: {
    icon: Briefcase,
    title: 'Asistan Pro',
    subtitle: 'Profesyonel Hizmetler',
    description: 'Danismanlik ve randevu bazli profesyonel hizmet ekipleri icin esnek akis.',
    longDescription:
      'Danismanlar ve profesyonel hizmet ekipleri icin gorusme, is plani ve musteri iletisimini tek panelde toplar.',
    accent: 'bg-violet-500',
    accentSoft: 'bg-violet-100',
    accentText: 'text-violet-700',
    features: [
      'Esnek takvim plani',
      'Online gorusme link akislari',
      'Musteri karti ve notlari',
      'Teklif takip alanlari',
      'Rol bazli ekip erisimi',
      'Hizmet performans raporu',
    ],
    benefits: [
      { icon: Clock, title: 'Esnek planlama', description: 'Takvim degisiklikleri hizli yonetilir.' },
      { icon: Users, title: 'Musteri akisi', description: 'Gorusme oncesi/sonrasi takip adimlari netlesir.' },
      { icon: Shield, title: 'Tutarlı veri', description: 'Tum kayitlar ayni standartta saklanir.' },
      { icon: BarChart3, title: 'Buyume gorunumu', description: 'Hizmet bazli doluluk ve ciro analizi.' },
    ],
    useCases: [
      'Is danismanlari',
      'Koclar',
      'Egitmenler',
      'Freelancer ekipleri',
      'Fotografcilar',
      'Tercumanlik ofisleri',
    ],
  },
}

industries.saglik = industries.health

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params
  const current = industries[industry]

  if (!current) {
    notFound()
  }

  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-28 md:pt-32">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10">
          <Link href="/cozumler" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-navy">
            <ArrowLeft className="size-4" />
            Tum Cozumler
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <FadeUp>
              <Badge className={`mb-5 border-0 ${current.accentSoft} ${current.accentText}`}>{current.subtitle}</Badge>
              <h1 className="font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl">{current.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{current.longDescription}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild className={`h-11 rounded-lg px-5 text-sm font-semibold text-white ${current.accent}`}>
                  <Link href={getClinicTrialPath('tr')}>
                    {ENTRY_CTA.clinicTrial.tr}
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-lg border-brand-blue/20 px-5 text-sm font-semibold text-brand-navy">
                  <Link href="/fiyatlandirma">Fiyatlari Incele</Link>
                </Button>
              </div>
            </FadeUp>

            <ScaleIn>
              <Card className="marketing-surface rounded-2xl border-brand-blue/10">
                <CardContent className="p-6">
                  <div className={`mb-5 inline-flex size-14 items-center justify-center rounded-2xl ${current.accentSoft} ${current.accentText}`}>
                    <current.icon className="size-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">{current.description}</p>
                  <div className="mt-5 grid gap-2">
                    {['Aktif', 'Rol Bazli Erisim', 'Tek Panel Akis'].map((chip) => (
                      <span key={chip} className="inline-flex w-fit items-center rounded-full border border-brand-blue/15 bg-brand-light px-3 py-1 text-xs font-semibold text-brand-navy">
                        {chip}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScaleIn>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="marketing-container">
          <FadeUp className="mb-10">
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">One cikan ozellikler</h2>
          </FadeUp>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {current.features.map((feature, index) => (
              <ScaleIn key={feature} delay={0.05 * index}>
                <article className="marketing-surface marketing-card-hover rounded-2xl p-5">
                  <div className={`mb-3 inline-flex size-9 items-center justify-center rounded-lg ${current.accentSoft} ${current.accentText}`}>
                    <CheckCircle2 className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-brand-navy">{feature}</p>
                </article>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-dashboard-surface py-20">
        <div className="marketing-container">
          <FadeUp className="mb-10">
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Neden {current.title}?</h2>
          </FadeUp>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {current.benefits.map((benefit, index) => (
              <FadeUp key={benefit.title} delay={0.05 * index}>
                <article className="marketing-surface marketing-card-hover h-full rounded-2xl p-5">
                  <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-lg ${current.accentSoft} ${current.accentText}`}>
                    <benefit.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-extrabold text-brand-navy">{benefit.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{benefit.description}</p>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="marketing-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <FadeUp>
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Kimler icin uygun?</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {current.useCases.map((item, index) => (
                <ScaleIn key={item} delay={0.04 * index}>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-brand-blue/15 bg-brand-light px-3 py-2 text-sm font-medium text-slate-700">
                    <Calendar className="size-4 text-brand-blue" />
                    {item}
                  </span>
                </ScaleIn>
              ))}
            </div>
          </FadeUp>

          <ScaleIn>
            <Card className="rounded-2xl bg-brand-navy text-white">
              <CardContent className="p-7">
                <h3 className="text-2xl font-black">{ENTRY_CTA.clinicTrial.tr}</h3>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  Kayit olarak paneli deneyin veya demo icin iletisime gecin.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="h-10 rounded-lg bg-white text-brand-navy hover:bg-white/90">
                    <Link href={getClinicTrialPath('tr')}>{ENTRY_CTA.clinicTrial.tr}</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-10 rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10">
                    <Link href={DEMO_CONTACT_PATH}>{ENTRY_CTA.demoRequest.tr}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScaleIn>
        </div>
      </section>
    </MarketingPageShell>
  )
}
