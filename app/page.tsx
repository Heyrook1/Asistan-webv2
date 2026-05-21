import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Landmark,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Scissors,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react'

import { Footer } from '@/components/marketing/footer'
import { Navbar } from '@/components/marketing/navbar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GlowEffect } from '@/components/ui/glow-effect'

export const metadata: Metadata = {
  title: 'Asistan | KKTC için AI Destekli Randevu ve İş Yönetimi',
  description:
    'Asistan, KKTC’deki klinikler ve hizmet işletmeleri için randevu, hasta takibi, hatırlatmalar ve ekip yönetimini tek panelde toplar.',
}

const trustBadges = [
  { icon: Stethoscope, text: 'Asistan Health aktif' },
  { icon: ClipboardList, text: 'Türkçe arayüz' },
  { icon: Users, text: 'Rol bazlı erişim' },
  { icon: Lock, text: 'Gizlilik prensipleri' },
]

const trustStripItems = [
  'KKTC odağı',
  'Asistan Health aktif',
  'Türkçe arayüz',
  'Rol bazlı erişim',
  'Gizlilik prensipleri',
  'Erken erişim',
]

const painPoints = [
  {
    icon: MessageSquare,
    title: 'Mesajlar dağılır',
    description: 'WhatsApp, telefon ve not defteri arasında randevu takibi kaçabilir.',
  },
  {
    icon: Bell,
    title: 'Randevu unutulur',
    description: 'Hatırlatma yapılmadığında iptal ve gelmeyen hasta riski artar.',
  },
  {
    icon: Users,
    title: 'Ekip zor koordine olur',
    description: 'Doktor, sekreter ve işletme sahibi aynı bilgiyi aynı anda göremez.',
  },
]

const productSignals = [
  {
    label: 'Randevu takibi',
    description: 'Randevu, hasta ve ekip takibi aynı yerde.',
  },
  {
    label: 'Sekreter rolü',
    description: 'Doktor, sekreter ve yönetici akışları.',
  },
  {
    label: 'Erken erişim',
    description: 'Health aktif; Beauty, Hukuk ve Emlak sırada.',
  },
]

const featureCards = [
  {
    icon: Calendar,
    title: 'Randevu ve takvim',
    description:
      'Randevuları, bekleyen onayları ve müsait saatleri tek panelde görün. Sekreter ve doktor aynı akıştan ilerlesin.',
    featured: true,
  },
  {
    icon: FileText,
    title: 'Hasta kartı',
    description: 'Notlar, geçmiş randevular ve takip bilgileri düzenli kalsın.',
  },
  {
    icon: Sparkles,
    title: 'AI önerileri',
    description: 'Boş saatleri ve takip fırsatlarını daha hızlı fark edin.',
  },
  {
    icon: Bell,
    title: 'Hatırlatma akışı',
    description: 'Randevu öncesi ve sonrası iletişimi daha planlı yürütün.',
  },
  {
    icon: Users,
    title: 'Ekip rolleri',
    description: 'Sekreter, doktor ve yönetici akışlarını ayrı yetkilerle düzenleyin.',
  },
]

const steps = [
  {
    title: 'Kur',
    description: 'Hizmetleri, ekip üyelerini ve çalışma düzeninizi ekleyin.',
  },
  {
    title: 'Topla',
    description: 'Sekreteriniz veya ekibiniz aynı panelden randevu akışını yönetsin.',
  },
  {
    title: 'Takip et',
    description: 'Hatırlatmalar, notlar ve AI önerileri günlük işleri sadeleştirsin.',
  },
]

const healthUseCases = [
  'Doktor ve diş hekimi muayenehaneleri',
  'Psikolog, diyetisyen ve fizyoterapistler',
  'Klinik yöneticileri ve sekreter ekipleri',
  'Hasta randevusu ve takip notu tutan sağlık işletmeleri',
]

const upcomingIndustries = [
  { icon: Scissors, title: 'Asistan Beauty', description: 'Güzellik merkezleri ve salonlar için randevu ve paket takibi.', status: 'Yakında' },
  { icon: Landmark, title: 'Asistan Legal', description: 'Hukuk büroları için görüşme, müvekkil ve dosya takibi.', status: 'Yakında' },
  { icon: Briefcase, title: 'Asistan Emlak', description: 'Emlak ekipleri için müşteri, portföy ve görüşme planlama.', status: 'Planlanıyor' },
]

const earlyAccessItems = [
  {
    title: 'Klinik iş akışı',
    description: 'Mevcut randevu, hasta kabul ve takip düzeninizi birlikte çıkarırız.',
  },
  {
    title: 'Sekreter yetkileri',
    description: 'Kim hangi hastayı, randevuyu ve notu görebilir sorusunu netleştiririz.',
  },
  {
    title: 'Hatırlatma düzeni',
    description: 'Randevu öncesi ve sonrası iletişim akışını kliniğinize göre planlarız.',
  },
  {
    title: 'Hasta takip notları',
    description: 'Hangi bilgilerin kartta tutulacağını ve ekip içinde nasıl kullanılacağını belirleriz.',
  },
]

const faqs = [
  {
    question: 'Asistan tam olarak ne yapar?',
    answer:
      'Asistan; randevu, hasta bilgisi, sekreter rolleri, hatırlatmalar ve takip notlarını tek panelde düzenlemeye yardımcı olur.',
  },
  {
    question: 'Asistan Health kimler için uygundur?',
    answer:
      'Doktorlar, klinik yöneticileri, sekreter ekipleri, diş hekimleri, psikologlar, diyetisyenler ve randevu ile çalışan sağlık hizmet sağlayıcıları için uygundur.',
  },
  {
    question: 'Hastalar için ne kolaylaşır?',
    answer:
      'Hastalar daha net randevu iletişimi, hızlı geri dönüş ve düzenli hatırlatma deneyimi yaşar. Klinik tarafında bilgi daha görünür olur.',
  },
  {
    question: 'Fiyatlandırma nasıl belirlenir?',
    answer:
      'Erken erişimde önce ihtiyaç görüşmesi yapılır. Klinik büyüklüğü, ekip rolleri ve kurulum kapsamına göre en uygun başlangıç planı netleştirilir.',
  },
  {
    question: 'Hasta verileri nasıl ele alınır?',
    answer:
      'Ürün rol bazlı erişim ve gizlilik prensipleriyle tasarlanır. Canlı kurulum öncesinde veri ve yetki kapsamı ayrıca değerlendirilir.',
  },
]

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-r from-[#12C8AD]/20 via-[#185FA5]/10 to-transparent blur-3xl" />
      <div className="glass-panel relative overflow-hidden rounded-[2rem] p-3">
        <div className="overflow-hidden rounded-3xl bg-[#0D1117] p-3 shadow-2xl">
          <div className="grid min-h-[420px] grid-cols-[72px_1fr] rounded-2xl bg-white">
            <aside className="hidden border-r border-gray-100 bg-[#F8FAFB] p-3 sm:block">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B7F6F]">
                <LayoutDashboard className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                {[Calendar, Users, MessageSquare, Bell].map((Icon, index) => (
                  <div
                    key={index}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      index === 0 ? 'bg-[#0B7F6F]/10 text-[#0B7F6F]' : 'text-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </aside>

            <div className="col-span-2 p-4 sm:col-span-1 sm:p-5">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm font-bold text-[#06142A]">Klinik Paneli</p>
                  <p className="text-xs text-gray-500">Örnek ürün görünümü</p>
                </div>
                <span className="rounded-full bg-[#0B7F6F]/10 px-3 py-1 text-xs font-semibold text-[#0B7F6F]">
                  Bugün
                </span>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-3">
                {[
                  ['12', 'Randevu'],
                  ['3', 'Onay'],
                  ['2', 'Boş saat'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-gray-100 bg-[#F8FAFB] p-3">
                    <p className="text-2xl font-bold text-[#06142A]">{value}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-2">
                  {[
                    ['09:30', 'Hasta kontrolü', 'Onaylandı'],
                    ['11:00', 'Klinik görüşme', 'Bekliyor'],
                    ['14:00', 'Takip randevusu', 'Onaylandı'],
                    ['15:30', 'Boş saat', 'Öneri'],
                  ].map(([time, name, status]) => (
                    <div key={`${time}-${name}`} className="flex items-center justify-between rounded-2xl bg-[#F8FAFB] px-3 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-11 shrink-0 font-mono text-xs text-gray-500">{time}</span>
                        <span className="truncate text-sm font-medium text-[#06142A]">{name}</span>
                      </div>
                      <span
                        className={
                          status === 'Onaylandı'
                            ? 'rounded-full bg-[#0B7F6F]/10 px-2 py-1 text-[10px] font-semibold text-[#0B7F6F]'
                            : 'rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700'
                        }
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#12C8AD]/20 bg-[#12C8AD]/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0B7F6F]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    AI önerisi
                  </div>
                  <p className="text-sm leading-6 text-gray-600">
                    Bekleyen hastaya bugün 15:30 için boş saat önerilebilir.
                  </p>
                  <div className="mt-4 rounded-xl bg-white p-3 text-xs text-gray-500 shadow-sm">
                    Sekreter onayı bekliyor
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section id="hero" className="mesh-hero overflow-hidden pb-16 pt-28 md:pb-24 md:pt-32" aria-label="Ana bölüm">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
            <div className="max-w-2xl">
              <Badge className="mb-5 border-0 bg-[#0B7F6F]/10 px-3 py-1.5 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
                KKTC odağıyla Asistan Health aktif
              </Badge>
              <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight text-[#06142A] md:text-5xl lg:text-6xl">
                KKTC’de randevu ve iş yönetimi için{' '}
                <span className="animated-gradient-text">akıllı asistanınız.</span>
              </h1>
              <p className="mb-8 max-w-xl text-base leading-8 text-gray-600 md:text-lg">
                Asistan; klinikler, doktorlar ve hizmet işletmeleri için randevu, hasta iletişimi,
                hatırlatmalar ve ekip takibini tek panelde toplar.
              </p>
              <div className="mb-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 w-full rounded-xl bg-[#0B7F6F] px-6 font-semibold text-white shadow-lg shadow-[#0B7F6F]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#09685C] sm:w-auto">
                  <Link href="/auth/sign-up" aria-label="Asistan erken erişim başvurusu yap">
                    Erken Erişime Katıl
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-xl border-[#0B7F6F]/30 px-6 font-semibold text-[#0B7F6F] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0B7F6F]/5 sm:w-auto">
                  <Link href="/cozumler/health" aria-label="Asistan Health çözümünü incele">
                    Asistan Health’i İncele
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {trustBadges.map((badge) => (
                  <span key={badge.text} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3 py-2 text-sm text-gray-600 shadow-sm ring-1 ring-gray-100">
                    <badge.icon className="h-4 w-4 shrink-0 text-[#0B7F6F]" aria-hidden="true" />
                    {badge.text}
                  </span>
                ))}
              </div>
            </div>

            <DashboardMockup />
          </div>
        </section>

        <section className="border-y border-gray-100 bg-white py-5" aria-label="Güven şeridi">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 sm:px-6 md:flex md:flex-wrap md:justify-center lg:px-8">
            {trustStripItems.map((item) => (
              <span
                key={item}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-100 bg-white px-4 text-center text-sm font-medium text-gray-600 shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section id="problem" className="bg-white py-20 md:py-28" aria-label="Sorunlar">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#06142A] md:text-4xl">Dağınık takibi tek düzene taşıyın.</h2>
              <p className="mt-4 text-base leading-8 text-gray-600 md:text-lg">
                Asistan, küçük ekiplerin günlük randevu yükünü azaltmak için tasarlandı.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {painPoints.map((card) => (
                <Card key={card.title} className="rounded-2xl border-gray-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-6">
                    <card.icon className="mb-4 h-7 w-7 text-[#0B7F6F]" aria-hidden="true" />
                    <h3 className="mb-2 text-lg font-bold text-[#06142A] md:text-xl">{card.title}</h3>
                    <p className="text-sm leading-6 text-gray-600">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="signals" className="bg-[#F8FAFB] py-14" aria-label="Mikro ürün kanıtları">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {productSignals.map((signal) => (
              <Card key={signal.label} className="rounded-3xl border-gray-100 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-full bg-[#0B7F6F]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0B7F6F]">
                    Mikro kanıt
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#06142A] md:text-xl">{signal.label}</h3>
                  <p className="text-sm leading-6 text-gray-600">{signal.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="features" className="bg-[#F8FAFB] py-20 md:py-28" aria-label="Özellikler">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 grid gap-6 lg:grid-cols-[0.75fr_1fr] lg:items-end">
              <div>
                <Badge className="mb-4 border-0 bg-white text-[#0B7F6F] hover:bg-white">Asistan nedir?</Badge>
                <h2 className="text-3xl font-bold tracking-tight text-[#06142A] md:text-4xl">
                  Randevu, takip ve ekip yönetimi aynı panelde.
                </h2>
              </div>
              <p className="text-base leading-8 text-gray-600 md:text-lg">
                Yeni bir teknoloji vitrini değil; kliniğinizdeki günlük takibi daha düzenli hale
                getiren pratik bir iş aracıdır.
              </p>
            </div>

            <div className="grid auto-rows-fr gap-5 md:grid-cols-4 lg:gap-6">
              {featureCards.map((card) => (
                <Card
                  key={card.title}
                  className={`rounded-3xl border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                    card.featured ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 lg:col-span-1'
                  }`}
                >
                  <CardContent className={`${card.featured ? 'p-7 md:p-8' : 'p-6'}`}>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B7F6F]/10">
                      <card.icon className="h-7 w-7 text-[#0B7F6F]" aria-hidden="true" />
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-[#06142A] md:text-xl">{card.title}</h3>
                    <p className="text-sm leading-6 text-gray-600 md:text-base">{card.description}</p>
                    {card.featured && (
                      <div className="mt-8 grid grid-cols-7 gap-2 rounded-2xl bg-[#F8FAFB] p-4">
                        {Array.from({ length: 14 }).map((_, index) => (
                          <div
                            key={index}
                            className={`h-10 rounded-xl ${
                              [2, 5, 9].includes(index) ? 'bg-[#0B7F6F]' : [4, 11].includes(index) ? 'bg-[#12C8AD]/35' : 'bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white py-20 md:py-28" aria-label="Nasıl çalışır">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-[#06142A] md:text-4xl">3 adımda kullanmaya başlayın.</h2>
              <p className="mt-4 text-base leading-8 text-gray-600 md:text-lg">
                Kurulum basit kalır; ekip günlük işlere hızlı döner.
              </p>
            </div>
            <div className="relative grid gap-5 md:grid-cols-3">
              <div className="absolute left-0 right-0 top-5 hidden h-px bg-gray-100 md:block" />
              {steps.map((step, index) => (
                <article key={step.title} className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#0B7F6F] text-sm font-bold text-white shadow-lg shadow-[#0B7F6F]/20">
                    {index + 1}
                  </span>
                  <h3 className="mb-2 text-xl font-bold text-[#06142A]">{step.title}</h3>
                  <p className="text-sm leading-6 text-gray-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="health" className="relative overflow-hidden bg-[#0D1117] py-20 text-white md:py-28" aria-label="Asistan Health">
          <GlowEffect className="right-10 top-10 h-72 w-72 bg-[#12C8AD]/20" />
          <GlowEffect className="bottom-0 left-10 h-56 w-56 bg-[#185FA5]/15" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <div>
              <Badge className="mb-4 border-0 bg-white/10 text-white hover:bg-white/10">Öncelikli sektör</Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Asistan Health ile başlayın.</h2>
              <p className="mt-4 text-base leading-8 text-white/70 md:text-lg">
                İlk odak sağlık. Hasta randevusu, takip notları, sekreter yetkisi ve hatırlatma
                akışı aynı panelde toplanır.
              </p>
              <Button asChild className="mt-7 h-12 rounded-xl bg-white px-6 font-semibold text-[#0D1117] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90">
                <Link href="/cozumler/health" aria-label="Asistan Health çözümünü incele">
                  Health çözümünü incele
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {healthUseCases.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#12C8AD]" aria-hidden="true" />
                  <span className="text-sm leading-6 text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="industries" className="bg-white py-20 md:py-28" aria-label="Sıradaki sektörler">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#06142A] md:text-4xl">Sıradaki sektörler yolda.</h2>
              <p className="mt-4 text-base leading-8 text-gray-600 md:text-lg">
                Health ile başlayan yapı, aynı düzeni farklı sektörlere taşıyacak şekilde planlanıyor.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {upcomingIndustries.map((industry) => (
                <Card key={industry.title} className="rounded-2xl border-gray-100 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <industry.icon className="h-7 w-7 text-[#0B7F6F]" aria-hidden="true" />
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{industry.status}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[#06142A] md:text-xl">{industry.title}</h3>
                    <p className="text-sm leading-6 text-gray-600">{industry.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="early-access" className="bg-[#F8FAFB] py-20 md:py-28" aria-label="Erken erişimde netleşenler">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <Badge className="mb-4 border-0 bg-white text-[#0B7F6F] hover:bg-white">Erken erişim</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-[#06142A] md:text-4xl">
                İlk görüşmede neyi birlikte netleştiriyoruz?
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-600 md:text-lg">
                Ürünü kliniğinizin gerçek akışına uydurmak için önce operasyonu anlarız.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {earlyAccessItems.map((item, index) => (
                <Card key={item.title} className="rounded-3xl border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#0B7F6F] text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-[#06142A] md:text-xl">{item.title}</h3>
                    <p className="text-sm leading-6 text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing-preview" className="bg-white px-4 py-16 sm:px-6 lg:px-8" aria-label="Erken erişim modeli">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-gray-100 bg-[#F8FAFB] p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <Badge className="mb-4 border-0 bg-white text-[#0B7F6F] hover:bg-white">Erken erişim modeli</Badge>
                <h2 className="text-2xl font-bold tracking-tight text-[#06142A] md:text-3xl">
                  İhtiyacınızı dinleyip uygun kurulum planını birlikte netleştiriyoruz.
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Keşif görüşmesi', 'Health odaklı kurulum', 'KKTC pazarı'].map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-600">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Button asChild className="h-12 rounded-xl bg-[#0B7F6F] px-6 font-semibold text-white hover:bg-[#09685C]">
                <Link href="/fiyatlandirma" aria-label="Asistan fiyatlandırma ve erken erişim modelini gör">
                  Paketleri Gör
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white py-20 md:py-28" aria-label="Sık sorulan sorular">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <div>
              <Badge className="mb-4 border-0 bg-[#0B7F6F]/10 text-[#0B7F6F] hover:bg-[#0B7F6F]/10">
                Sık sorulanlar
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-[#06142A] md:text-4xl">
                Başlamadan önce bilmek isteyecekleriniz.
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-600 md:text-lg">
                Asistan Health’in kliniğinizde nasıl konumlanacağını netleştiren temel sorular.
              </p>
            </div>
            <Card className="rounded-[2rem] border-gray-100 shadow-sm">
              <CardContent className="p-4 md:p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.question} value={`faq-${index}`} className="border-gray-100">
                      <AccordionTrigger className="text-left text-base font-bold text-[#06142A] hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-6 text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="cta" className="bg-[#F8FAFB] px-4 py-20 sm:px-6 md:py-28 lg:px-8" aria-label="Erken erişim çağrısı">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#0D1117] p-8 text-center text-white md:p-12">
            <div className="absolute inset-x-16 -top-24 h-48 rounded-full bg-[#12C8AD]/20 blur-3xl" />
            <div className="relative">
              <Stethoscope className="mx-auto mb-5 h-10 w-10 text-[#12C8AD]" aria-hidden="true" />
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Kliniğiniz için erken erişim talep edin.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                Asistan Health’i ilk kullanan ekiplerden biri olun. Kurulum ve ihtiyaç analizi için
                sizinle iletişime geçelim.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl bg-[#0B7F6F] px-6 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#09685C]">
                  <Link href="/auth/sign-up" aria-label="Asistan Health erken erişim başvurusu yap">
                    Erken Erişim Başvurusu
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10">
                  <Link href="/fiyatlandirma" aria-label="Asistan fiyatlandırma seçeneklerini gör">
                    Paketleri Gör
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:hidden">
        <Button asChild className="h-12 w-full rounded-xl bg-[#0B7F6F] font-semibold text-white hover:bg-[#09685C]">
          <Link href="/auth/sign-up" aria-label="Mobil erken erişim başvurusu yap">
            Erken Erişime Katıl
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <Footer />
    </div>
  )
}
