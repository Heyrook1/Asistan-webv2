'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AsistanLogo } from '@/components/asistan-logo'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  Bell, 
  Sparkles,
  Play,
  Star,
  ChevronDown,
  ArrowRight,
  Check,
  Clock,
  UserCheck,
  Brain,
  Shield,
  Heart,
  Target,
  Lightbulb,
  Eye
} from 'lucide-react'
import { useState, useEffect } from 'react'

const stats = [
  { icon: UserCheck, value: '500+', label: 'Profesyonel', sublabel: 'Bize güveniyor' },
  { icon: Calendar, value: '100.000+', label: 'Randevu', sublabel: 'Yönetildi' },
  { icon: Star, value: '%98', label: 'Müşteri', sublabel: 'Memnuniyeti' },
  { icon: Clock, value: '10.000+', label: 'Saat', sublabel: 'Kazandırıldık' },
]

const features = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Randevularınızı kolayca yönetin. Çakışmaları önleyin, doluluk oranınızı artırın.',
  },
  {
    icon: Bell,
    title: 'Hatırlatmalar',
    description: 'Otomatik hatırlatmalar ile randevu iptallerini azaltın, katılım oranını yükseltin.',
  },
  {
    icon: Users,
    title: 'Ekip Yönetimi',
    description: 'Ekibinizi organize edin, görevleri paylaşın ve performansı tek yerden takip edin.',
  },
  {
    icon: Brain,
    title: 'AI Önerileri',
    description: 'Yapay zeka destekli önerilerle randevu planlamanızı optimize edin ve verimliliğinizi artırın.',
  },
]

const industries = [
  {
    title: 'Asistan Health',
    description: 'Klinik, hastane ve muayenehaneler için randevu ve hasta yönetimi.',
    image: '/images/industry-health.jpg',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    title: 'Asistan Beauty',
    description: 'Güzellik merkezleri ve salonlar için randevu, paket ve müşteri yönetimi.',
    image: '/images/industry-beauty.jpg',
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Asistan Legal',
    description: 'Hukuk büroları için dava, görüşme ve müvekkil randevu yönetimi.',
    image: '/images/industry-legal.jpg',
    color: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Asistan Pro',
    description: 'Danışmanlar ve hizmet profesyonelleri için esnek randevu çözümleri.',
    image: '/images/industry-pro.jpg',
    color: 'from-violet-500 to-purple-500',
  },
]

const todayAppointments = [
  { time: '09:30', name: 'Ayşe Yılmaz', status: 'Onaylandı' },
  { time: '11:00', name: 'Mehmet Kaya', status: 'Beklemede' },
  { time: '14:00', name: 'Zeynep Kaya', status: 'İptal edildi' },
  { time: '16:00', name: 'Ahmet Şahin', status: 'Onaylandı' },
]

const availableSlots = [
  '12:00 - 12:30',
  '15:30 - 16:00',
  '17:00 - 17:30',
]

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: '0',
    period: '',
    description: 'Küçük işletmeler için ideal',
    features: ['Aylık 50 randevu', '1 personel hesabı', 'Temel raporlar', 'E-posta bildirimleri'],
    popular: false,
    cta: 'Ücretsiz Başla'
  },
  {
    name: 'Profesyonel',
    price: '₺37',
    period: '/gün',
    description: 'Büyüyen işletmeler için',
    features: ['Sınırsız randevu', '5 personel hesabı', 'Gelişmiş analitik', 'SMS + E-posta', 'Öncelikli destek', 'API erişimi'],
    popular: true,
    cta: 'Hemen Başla'
  },
  {
    name: 'Kurumsal',
    price: 'Özel',
    period: '',
    description: 'Büyük organizasyonlar için',
    features: ['Her şey dahil', 'Sınırsız personel', 'Özel entegrasyonlar', '7/24 destek', 'SLA garantisi'],
    popular: false,
    cta: 'İletişime Geç'
  },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link href="/">
                <AsistanLogo variant="dark" />
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                {[
                  { label: 'Ürün', hasDropdown: false },
                  { label: 'Çözümler', hasDropdown: true },
                  { label: 'Fiyatlandırma', hasDropdown: false },
                  { label: 'Kaynaklar', hasDropdown: true },
                  { label: 'Hakkımızda', hasDropdown: false },
                ].map((item) => (
                  <a 
                    key={item.label}
                    href={item.label === 'Hakkımızda' ? '/hakkimizda' : `#${item.label.toLowerCase()}`}
                    className="flex items-center gap-1 text-[#5E6A78] hover:text-[#0B1828] transition-colors text-sm font-medium"
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-[#5E6A78] hover:text-[#0B1828] text-sm font-medium">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-medium text-sm px-5 rounded-full">
                  Ücretsiz Dene
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-white to-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0B1828] leading-[1.1] tracking-tight mb-6">
                İşinize yarayan
                <br />
                <span className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] bg-clip-text text-transparent">
                  akıllı asistanınız.
                </span>
              </h1>
              
              <p className="text-lg text-[#5E6A78] mb-8 leading-relaxed max-w-lg">
                Asistan, randevu yönetimini, hatırlatmaları, müşteri iletişimini 
                ve ekip organizasyonunu kolaylaştırır. Zamandan tasarruf edin, 
                daha mutlu müşteriler kazanın.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link href="/auth/sign-up">
                  <Button 
                    size="lg"
                    className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold text-sm px-6 h-12 rounded-full"
                  >
                    Ücretsiz Dene
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-[#E2E8F0] text-[#0B1828] hover:bg-[#F8FAFB] font-medium text-sm px-6 h-12 rounded-full"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Demo İzle
                </Button>
              </div>
            </div>

            {/* Right - Image with floating cards */}
            <div className="relative">
              <Image
                src="/images/medical-team.jpg"
                alt="Medical professionals using Asistan"
                width={600}
                height={500}
                className="rounded-2xl object-cover w-full h-[400px] lg:h-[480px]"
                priority
              />
              
              {/* Floating Card - Today's Appointments */}
              <div className="absolute -right-4 top-4 bg-white rounded-xl shadow-xl p-4 w-64">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#0B1828]">Bugünkü Randevular</span>
                </div>
                <div className="space-y-2">
                  {todayAppointments.map((apt, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#5E6A78] font-mono">{apt.time}</span>
                        <span className="text-[#0B1828]">{apt.name}</span>
                      </div>
                      <span className={`text-[10px] font-medium ${
                        apt.status === 'Onaylandı' ? 'text-[#1BD1B5]' : 
                        apt.status === 'Beklemede' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card - Approval Rate */}
              <div className="absolute -left-4 bottom-32 bg-white rounded-xl shadow-xl p-4 w-40">
                <span className="text-xs text-[#5E6A78]">Onay Oranı</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold text-[#1BD1B5]">%98</span>
                  <span className="text-[10px] text-[#5E6A78]">Bu hafta</span>
                </div>
                <div className="mt-2 h-2 bg-[#E8F5F3] rounded-full overflow-hidden">
                  <div className="h-full w-[98%] bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] rounded-full" />
                </div>
              </div>

              {/* Floating Card - Available Slots */}
              <div className="absolute right-8 bottom-8 bg-white rounded-xl shadow-xl p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#1BD1B5]" />
                  <span className="text-xs font-semibold text-[#0B1828]">Boş Saatler</span>
                </div>
                <div className="space-y-1.5">
                  {availableSlots.map((slot, i) => (
                    <div key={i} className="text-xs text-[#5E6A78] bg-[#F8FAFB] px-2 py-1.5 rounded">
                      {slot}
                    </div>
                  ))}
                </div>
                <a href="#" className="text-[10px] text-[#1BD1B5] font-medium mt-2 inline-block">
                  Tümünü Gör
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-[#E8E4E0]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#E8F5F3] flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0B1828]">{stat.value}</div>
                  <div className="text-xs text-[#5E6A78]">
                    {stat.label}
                    <br />
                    {stat.sublabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Asistan Section */}
      <section className="py-20 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              Neden Asistan?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E8F5F3] flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#1BD1B5]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0B1828] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#5E6A78] leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              Sizin sektörünüze uyum sağlar
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, i) => (
              <Card key={i} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${industry.color} opacity-20`} />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-[#0B1828] mb-2">{industry.title}</h3>
                  <p className="text-xs text-[#5E6A78] leading-relaxed mb-3">{industry.description}</p>
                  <a href="#" className="inline-flex items-center text-xs font-medium text-[#1BD1B5] hover:text-[#17b8a0]">
                    Detayları İncele
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="fiyatlandırma" className="py-20 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              Size uygun planı seçin
            </h2>
            <p className="text-[#5E6A78] max-w-2xl mx-auto">
              Her büyüklükteki işletme için esnek fiyatlandırma seçenekleri
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <Card 
                key={i} 
                className={`relative border-0 ${plan.popular ? 'shadow-xl ring-2 ring-[#1BD1B5] scale-105' : 'shadow-sm'}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1BD1B5] text-white text-xs px-3">
                    En Popüler
                  </Badge>
                )}
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-[#0B1828] mb-1">{plan.name}</h3>
                  <p className="text-xs text-[#5E6A78] mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-[#0B1828]">{plan.price}</span>
                    <span className="text-[#5E6A78] text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-[#5E6A78]">
                        <Check className="w-4 h-4 text-[#1BD1B5] flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full rounded-full ${
                      plan.popular 
                        ? 'bg-[#1BD1B5] hover:bg-[#17b8a0] text-white' 
                        : 'bg-[#0B1828] hover:bg-[#152535] text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Asistan ile kliniğinizi sonraki seviyeye taşıyın
          </h2>
          <p className="text-[#8A9AAA] mb-8 max-w-2xl mx-auto">
            Hemen ücretsiz denemeye başlayın, farkı görün.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-8 rounded-full"
              >
                14 Gün Ücretsiz Dene
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg"
                className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-[#0B1828] font-semibold px-8 rounded-full"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#0B1828] border-t border-[#1E3448]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="mb-6">
                <AsistanLogo variant="light" />
              </div>
              <p className="text-[#5E6A78] leading-relaxed max-w-xs text-sm">
                Kuzey Kıbrıs&apos;ın ilk ve tek AI destekli klinik yönetim platformu. 
                Modern, güvenli ve kullanımı kolay.
              </p>
            </div>

            {[
              { title: 'Ürün', links: ['Özellikler', 'Fiyatlar', 'Entegrasyonlar', 'API'] },
              { title: 'Şirket', links: ['Hakkımızda', 'Blog', 'Kariyer', 'İletişim'] },
              { title: 'Destek', links: ['Yardım Merkezi', 'Dokümantasyon', 'SSS', 'İletişim'] }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-[#5E6A78] hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#1E3448] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#5E6A78]">
              &copy; 2026 Asistan. Tüm hakları saklıdır.
            </p>
            <a href="https://asistan.com.tr" className="text-sm text-[#1BD1B5] hover:text-[#1BD1B5]/80 transition-colors font-medium">
              asistan.com.tr
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
