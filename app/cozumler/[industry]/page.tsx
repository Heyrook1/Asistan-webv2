import Link from 'next/link'
import type { Metadata } from 'next'
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
import { withCanonical } from '@/lib/seo'

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
    subtitle: 'Sağlık sektörü',
    description: 'Klinik, diş hekimi ve muayenehaneler için randevu ile hasta yönetimi.',
    longDescription:
      'Doktorlar, diş hekimleri, psikologlar ve tüm sağlık profesyonelleri için tasarlanan akış. Hasta kayıtları, randevu planı, ekip rolleri ve raporlama tek panelde.',
    accent: 'bg-brand-blue',
    accentSoft: 'bg-brand-blue/10',
    accentText: 'text-brand-blue',
    features: [
      'Hasta kartları ve geçmiş kayıtlar',
      'Online randevu ve takvim planı',
      'Panel ve e-posta hatırlatma altyapısı',
      'Rol bazlı ekip yönetimi',
      'KVKK odaklı işletme bazlı veri ayrımı',
      'Klinik operasyon özetleri',
    ],
    benefits: [
      { icon: Clock, title: 'Daha net takip', description: 'Randevu ve ekip görevleri aynı panelde izlenir.' },
      { icon: Users, title: 'Daha az karışıklık', description: 'Sekreter ve doktor tek bilgi akışını görür.' },
      { icon: Shield, title: 'Güvenli veri modeli', description: 'Rol bazlı erişim ve işletme ayrımı.' },
      { icon: BarChart3, title: 'Ölçülebilir kararlar', description: 'Günlük doluluk ve performans takibi.' },
    ],
    useCases: [
      'Özel muayenehaneler',
      'Poliklinikler',
      'Diş merkezleri',
      'Psikoloji klinikleri',
      'Fizyoterapi merkezleri',
      'Estetik klinikleri',
    ],
  },
  saglik: {} as IndustryConfig,
  beauty: {
    icon: Sparkles,
    title: 'Asistan Beauty',
    subtitle: 'Güzellik & wellness',
    description: 'Salonlar ve güzellik merkezleri için müşteri, paket ve randevu yönetimi.',
    longDescription:
      'Paket satışları, tekrarlı seans planları, müşteri notları ve ekip çizelgesini tek panelde toplar. Moda hızına değil operasyon düzenine odaklanır.',
    accent: 'bg-fuchsia-500',
    accentSoft: 'bg-fuchsia-100',
    accentText: 'text-fuchsia-700',
    features: [
      'Paket ve seans takibi',
      'Müşteri sadakat akışlarına hazır panel',
      'Online rezervasyon görünümü',
      'Personel uygunluk planlama',
      'Kasa ve fiyat listesi yönetimi',
      'Performans raporlaması',
    ],
    benefits: [
      { icon: Clock, title: 'Planlı gün akışları', description: 'Yoğun saatlerde rezervasyon dağılım dengesi.' },
      { icon: Users, title: 'Müşteri deneyimi', description: 'Daha düzenli takip ve geri dönüş süreci.' },
      { icon: Shield, title: 'Güvenli veri tutarlılığı', description: 'Müşteri verileri rol bazında sınırlanır.' },
      { icon: BarChart3, title: 'Satış görünürlüğü', description: 'Paket ve hizmet bazlı gelir görünümü.' },
    ],
    useCases: [
      'Kuaför salonları',
      'Güzellik merkezleri',
      'Spa ve wellness',
      'Nail art stüdyo',
      'Cilt bakım merkezleri',
      'Masaj salonları',
    ],
  },
  legal: {
    icon: Scale,
    title: 'Asistan Legal',
    subtitle: 'Hukuk sektörü',
    description: 'Hukuk büroları için görüşme, dosya ve takvim düzeni.',
    longDescription:
      'Müvekkil dosyaları, görüşme ajandası ve operasyon notlarını tek yerde toplar. Hukuk ekiplerinin dairesel takip yükünü azaltır.',
    accent: 'bg-amber-500',
    accentSoft: 'bg-amber-100',
    accentText: 'text-amber-700',
    features: [
      'Müvekkil dosya kartları',
      'Görüşme ve duruşma planı',
      'Saat bazlı takip notları',
      'Belge yönetim alanları',
      'Yetki bazlı ekip görünümü',
      'Operasyon raporları',
    ],
    benefits: [
      { icon: Clock, title: 'Süre takibi', description: 'Öncelikli dosyalar tek görünümde listelenir.' },
      { icon: Users, title: 'Ekip koordinasyonu', description: 'Sekreter ve avukat ortak ajanda ile çalışır.' },
      { icon: Shield, title: 'Müvekkil gizliliği', description: 'Yetkisiz veri görüntüleme engellenir.' },
      { icon: BarChart3, title: 'İş yükü görünümü', description: 'Dosya yoğunluğu ve zaman dağılımı ölçülür.' },
    ],
    useCases: [
      'Avukatlık büroları',
      'Hukuk danışmanlığı',
      'Arabuluculuk merkezleri',
      'Patent marka büroları',
      'Noter ofisleri',
      'Mali danışmanlık',
    ],
  },
  pro: {
    icon: Briefcase,
    title: 'Asistan Pro',
    subtitle: 'Profesyonel hizmetler',
    description: 'Danışmanlık ve randevu bazlı profesyonel hizmet ekipleri için esnek akış.',
    longDescription:
      'Danışmanlar ve profesyonel hizmet ekipleri için görüşme, iş planı ve müşteri iletişimini tek panelde toplar.',
    accent: 'bg-violet-500',
    accentSoft: 'bg-violet-100',
    accentText: 'text-violet-700',
    features: [
      'Esnek takvim planı',
      'Online görüşme link akışları',
      'Müşteri kartı ve notları',
      'Teklif takip alanları',
      'Rol bazlı ekip erişimi',
      'Hizmet performans raporu',
    ],
    benefits: [
      { icon: Clock, title: 'Esnek planlama', description: 'Takvim değişiklikleri hızlı yönetilir.' },
      { icon: Users, title: 'Müşteri akışı', description: 'Görüşme öncesi/sonrası takip adımları netleşir.' },
      { icon: Shield, title: 'Tutarlı veri', description: 'Tüm kayıtlar aynı standartta saklanır.' },
      { icon: BarChart3, title: 'Büyüme görünümü', description: 'Hizmet bazlı doluluk ve ciro analizi.' },
    ],
    useCases: [
      'İş danışmanları',
      'Koçlar',
      'Eğitmenler',
      'Freelance ekipler',
      'Fotoğrafçılar',
      'Tercümanlık ofisleri',
    ],
  },
}

industries.saglik = industries.health

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>
}): Promise<Metadata> {
  const { industry } = await params
  const current = industries[industry]
  if (!current?.title) {
    return { title: 'Çözüm bulunamadı' }
  }
  const canonicalIndustry = industry === 'saglik' ? 'health' : industry
  return withCanonical(`/cozumler/${canonicalIndustry}`, {
    title: `${current.title} | Çözümler`,
    description: current.description,
  })
}

export default async function IndustryPage({ params }: { params: Promise<{ industry: string }> }) {
  const { industry } = await params
  const current = industries[industry]

  if (!current) {
    notFound()
  }

  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden pb-16 pt-10 md:pt-12">
        <div className="marketing-hero-bg absolute inset-0" />
        <div className="soft-grid absolute inset-0 opacity-60" />
        <div className="marketing-container relative z-10">
          <Link href="/cozumler" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-navy">
            <ArrowLeft className="size-4" />
            Tüm Çözümler
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <FadeUp>
              <Badge className={`mb-5 border-0 ${current.accentSoft} ${current.accentText}`}>{current.subtitle}</Badge>
              <h1 className="font-heading text-4xl font-black leading-[1.16] tracking-tight text-brand-navy md:text-5xl">{current.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#6B7280] md:text-lg">{current.longDescription}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="ctaPrimary" className="h-11 rounded-lg px-5 text-sm font-semibold">
                  <Link href={getClinicTrialPath('tr')} data-cta-priority="primary">
                    {ENTRY_CTA.clinicTrial.tr}
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="ctaSecondary" className="h-11 rounded-lg px-5 text-sm font-semibold">
                  <Link href="/fiyatlandirma">Fiyatları incele</Link>
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
                    {['Aktif', 'Rol bazlı erişim', 'Tek panel akışı'].map((chip) => (
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
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Öne çıkan özellikler</h2>
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
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">Kimler için uygun?</h2>
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
                  Kayıt olarak paneli deneyin veya demo için iletişime geçin.
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
