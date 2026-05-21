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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: 'Ürün | Asistan ile Randevu ve Hasta Takibi',
  description:
    'Asistan ile takvim, hasta/müşteri kartları, hatırlatmalar, ekip rolleri ve AI önerilerini tek panelden yönetin.',
}

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
    title: 'AI Önerileri',
    description: 'Boş saat, bekleyen onay ve takip fırsatlarını daha hızlı görün.',
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
    description: 'Tamamlanan randevuları, takip gerektiren hastaları ve ekip işlerini kontrol edin.',
  },
]

const personas = [
  { icon: ClipboardList, title: 'Doktor', description: 'Hasta geçmişini ve takip notlarını hızlı görür.' },
  { icon: Users, title: 'Klinik yöneticisi', description: 'Randevu yoğunluğunu ve ekip düzenini takip eder.' },
  { icon: MessageSquare, title: 'Sekreter', description: 'Telefon, mesaj ve takvim akışını aynı yerden yönetir.' },
  { icon: Settings, title: 'İşletme sahibi', description: 'Günlük operasyonu daha az dağınıklıkla kontrol eder.' },
]

const upcomingFeatures = [
  'Online ödeme altyapısı',
  'Mobil uygulama',
  'Özel entegrasyonlar',
]

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="bg-gradient-to-b from-[#F4FBFA] to-white pb-16 pt-28 lg:pb-24 lg:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1fr] lg:px-8">
            <div>
              <Badge className="mb-5 border-0 bg-white text-[#0B7F6F]">Ürün</Badge>
              <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-[#06142A] md:text-5xl lg:text-6xl">
                Kliniğinizin günlük işlerini tek panelden yönetin.
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-8 text-gray-600">
                Asistan; takvim, hasta kartları, hatırlatmalar, ekip rolleri ve AI önerilerini sade bir iş akışında birleştirir.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="h-12 rounded-xl bg-[#0B7F6F] px-6 font-semibold text-white hover:bg-[#09685C]">
                    Erken Erişime Katıl
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/cozumler/health">
                  <Button size="lg" variant="outline" className="h-12 rounded-xl border-[#0B7F6F]/30 px-6 text-[#0B7F6F] hover:bg-[#0B7F6F]/5">
                    Sağlık Çözümünü Gör
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#06142A]">Günlük akış</p>
                  <p className="text-xs text-gray-500">Örnek klinik görünümü</p>
                </div>
                <Clock className="h-5 w-5 text-[#0B7F6F]" />
              </div>
              <div className="space-y-3">
                {dailyFlow.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#0B7F6F]">{item.time}</p>
                    <h3 className="font-bold text-[#06142A]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-[#06142A] md:text-4xl">Asistan ile neleri yönetebilirsiniz?</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Her özellik tek bir amaca hizmet eder: günlük takip yükünü azaltmak.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {coreFeatures.map((feature) => (
                <Card key={feature.title} className="rounded-2xl border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <feature.icon className="mb-4 h-8 w-8 text-[#0B7F6F]" />
                    <h3 className="mb-2 text-xl font-bold text-[#06142A]">{feature.title}</h3>
                    <p className="mb-4 text-sm leading-6 text-gray-600">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0B7F6F]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-bold text-[#06142A] md:text-4xl">Kimler kullanır?</h2>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  Asistan, sadece yöneticinin değil, randevu akışına dokunan herkesin işini sadeleştirir.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {personas.map((persona) => (
                  <Card key={persona.title} className="rounded-2xl border-gray-100 bg-white shadow-sm">
                    <CardContent className="p-6">
                      <persona.icon className="mb-4 h-7 w-7 text-[#0B7F6F]" />
                      <h3 className="mb-2 font-bold text-[#06142A]">{persona.title}</h3>
                      <p className="text-sm leading-6 text-gray-600">{persona.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="rounded-3xl bg-[#06142A] p-8 text-white md:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
                <div>
                  <Badge className="mb-4 border-0 bg-white/10 text-white">Daha sonra gelecekler</Badge>
                  <h2 className="text-3xl font-bold md:text-4xl">Vaatleri sırayla yayına alıyoruz.</h2>
                  <p className="mt-4 text-white/70">
                    Henüz aktif olmayan özellikleri gerçek fiyat veya kesin tarih vermeden yol haritasında tutuyoruz.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {upcomingFeatures.map((feature) => (
                    <div key={feature} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold">{feature}</p>
                      <p className="mt-1 text-xs text-white/55">Yakında</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
