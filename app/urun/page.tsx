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
import { DEMO_CONTACT_PATH, ENTRY_CTA, getClinicTrialPath } from '@/lib/entry-routes'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/urun', {
  title: 'Ürün | Asistan ile Randevu ve Hasta Takibi',
  description:
    'Asistan ile takvim, hasta kayıtları, hatırlatmalar, ekip rolleri ve operasyon önerilerini tek panelden yönetin.',
})

const coreFeatures = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Doktor, sekreter ve yönetici aynı randevu düzenini görür.',
    bullets: ['Bekleyen onaylar', 'Müsait saat takibi', 'Günlük randevu listesi'],
  },
  {
    icon: Bell,
    title: 'Hatırlatmalar',
    description: 'Randevu unutmalarını azaltmak için takip mesajlarını planlayın.',
    bullets: ['Randevu öncesi bildirim', 'Takip hatırlatması', 'Geciken işler'],
  },
  {
    icon: FileText,
    title: 'Hasta Kartları',
    description: 'Hasta bilgisi, randevu geçmişi ve notlar aynı yerde kalsın.',
    bullets: ['Hasta özeti', 'Klinik notlar', 'Dosya ve tahlil takibi'],
  },
  {
    icon: UserCog,
    title: 'Sekreter Hesabı',
    description: 'Ekip üyelerine görevlerine göre erişim verin.',
    bullets: ['Rol bazlı yetki', 'Ekip görünümü', 'İşletme kontrolü'],
  },
  {
    icon: Sparkles,
    title: 'Operasyon Önerileri',
    description:
      'Boş saat, bekleyen onay ve takip fırsatlarını kural tabanlı özetlerle daha hızlı görün.',
    bullets: ['Boş saat önerisi', 'Bekleyen hasta takibi', 'Günlük özet'],
  },
  {
    icon: Lock,
    title: 'Gizlilik Odağı',
    description: 'Hasta ve işletme verisini gizlilik prensipleriyle yönetin.',
    bullets: ['Erişim kontrolü', 'Kayıt düzeni', 'Güvenli oturum'],
  },
]

const dailyFlow = [
  {
    time: 'Sabah',
    title: 'Takvimi kontrol edin',
    description: 'Bugünkü randevuları, bekleyen onayları ve boş saatleri görün.',
  },
  {
    time: 'Gün içinde',
    title: 'Sekreter akışı yönetsin',
    description: 'Hasta ekleme, randevu planlama ve not alma aynı panelden ilerlesin.',
  },
  {
    time: 'Randevu öncesi',
    title: 'Hatırlatmaları takip edin',
    description: 'Unutulan randevu riskini azaltmak için bildirimleri düzenleyin.',
  },
  {
    time: 'Gün sonunda',
    title: 'Özeti görün',
    description:
      'Tamamlanan randevuları, takip gerektiren hastaları ve ekip işlerini kontrol edin.',
  },
]

const personas = [
  {
    icon: ClipboardList,
    title: 'Doktor',
    description: 'Hasta geçmişini ve takip notlarını hızlı görür.',
  },
  {
    icon: Users,
    title: 'Klinik yöneticisi',
    description: 'Randevu yoğunluğunu ve ekip düzenini takip eder.',
  },
  {
    icon: MessageSquare,
    title: 'Sekreter',
    description: 'Telefon, mesaj ve takvim akışını aynı yerden yönetir.',
  },
  {
    icon: Settings,
    title: 'İşletme sahibi',
    description: 'Günlük operasyonu daha az dağınıklıkla kontrol eder.',
  },
]

const roadmapItems = [
  {
    title: 'Online ödeme altyapısı',
    note: 'Aktif değil — satış paketinde yok; talep ile yol haritası',
  },
  {
    title: 'App Store / Google Play yayını',
    note: 'Bekleme listesi — mağaza yayını tamamlanmış sayılmaz',
  },
  {
    title: 'SMS sağlayıcı kurulumu',
    note: 'Aktif değil — hatırlatmalar e-posta / panel odaklı',
  },
  {
    title: 'Özel entegrasyonlar',
    note: 'Kuruma özel kapsam — demo görüşmesinde netleştirilir',
  },
] as const

export default function ProductPage() {
  return (
    <MarketingPageShell>
      <section className="relative overflow-hidden bg-brand-light pb-16 pt-10 md:pb-24 md:pt-12">
        <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70" />
        <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1fr] lg:px-8">
          <FadeUp>
            <Badge className="mb-5 border-0 bg-white text-brand-teal">Ürün</Badge>
            <h1 className="mb-6 font-heading text-4xl font-black leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-6xl">
              Kliniğinizin günlük işlerini tek panelden yönetin.
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-8 text-slate-600">
              Asistan; takvim, hasta kartları, hatırlatmalar, ekip rolleri ve operasyon
              önerilerini sade bir iş akışında birleştirir.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={getClinicTrialPath('tr')}>
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-brand-teal px-6 font-semibold text-white hover:bg-brand-teal-hover"
                >
                  {ENTRY_CTA.clinicTrial.tr}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={DEMO_CONTACT_PATH}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-brand-teal/30 px-6 text-brand-teal hover:bg-brand-teal/5"
                >
                  {ENTRY_CTA.demoRequest.tr}
                </Button>
              </Link>
            </div>
          </FadeUp>

          <FadeLeft className="w-full">
            <MouseParallax strength={12}>
              <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-bold text-brand-navy">Günlük akış</p>
                    <p className="text-xs text-slate-500">Örnek klinik görünümü</p>
                  </div>
                  <Clock className="h-5 w-5 text-brand-teal" />
                </div>
                <div className="space-y-3">
                  {dailyFlow.map((item, index) => (
                    <ScaleIn key={item.title} delay={0.04 * index}>
                      <div className="rounded-2xl bg-dashboard-surface p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-teal">
                          {item.time}
                        </p>
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
            <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">
              Asistan ile neleri yönetebilirsiniz?
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Her özellik tek bir amaca hizmet eder: günlük takip yükünü azaltmak.
            </p>
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
              <h2 className="font-heading text-3xl font-black text-brand-navy md:text-4xl">
                Kimler kullanır?
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Asistan, yalnızca yöneticinin değil, randevu akışına dokunan herkesin işini
                sadeleştirir.
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
                <Badge className="mb-4 border-0 bg-white/10 text-white">Yol haritası</Badge>
                <h2 className="font-heading text-3xl font-black md:text-4xl">
                  Henüz yayında olmayanlar satış vaadi değildir.
                </h2>
                <p className="mt-4 text-white/70">
                  Aşağıdakiler ürün yol haritasındadır; fiyatlandırmaya dahil edilmiş veya
                  teslim edilmiş özellik sayılmaz. Öncelik ve zamanlama klinik taleplerine göre
                  değişir.
                </p>
                <Link
                  href={DEMO_CONTACT_PATH}
                  className="mt-5 inline-flex text-sm font-semibold text-brand-cyan underline-offset-2 hover:underline"
                >
                  Yol haritası / öncelik için yazın
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {roadmapItems.map((feature, index) => (
                  <ScaleIn key={feature.title} delay={0.06 * index}>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold">{feature.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/55">{feature.note}</p>
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
