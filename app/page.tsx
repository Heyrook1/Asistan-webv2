'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  Bell, 
  Building2,
  Check,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react'
import { useState } from 'react'

const facilities = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Randevularınızı otomatik senkronize edin ve çakışmaları önleyin.',
    gradient: 'from-[#1BD1B5] to-[#207FF5]'
  },
  {
    icon: Clock,
    title: 'Bekleme Listesi',
    description: 'İptal durumunda otomatik bildirim ile bekleme listesi yönetimi.',
    gradient: 'from-[#207FF5] to-[#8B5CF6]'
  },
  {
    icon: Users,
    title: 'Personel Yönetimi',
    description: 'Çalışanlarınızın programlarını ve izinlerini kolayca yönetin.',
    gradient: 'from-[#1BD1B5] to-[#10B981]'
  },
  {
    icon: Bell,
    title: 'Otomatik Bildirimler',
    description: 'SMS ve e-posta ile hasta hatırlatmaları otomatik gönderilir.',
    gradient: 'from-[#F59E0B] to-[#EF4444]'
  },
  {
    icon: BarChart3,
    title: 'Gelişmiş Analitik',
    description: 'Detaylı raporlar ve iş zekası ile büyümenizi takip edin.',
    gradient: 'from-[#8B5CF6] to-[#EC4899]'
  },
  {
    icon: Building2,
    title: 'Çoklu Şube',
    description: 'Tüm şubelerinizi tek bir panel üzerinden yönetin.',
    gradient: 'from-[#10B981] to-[#1BD1B5]'
  }
]

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: '0',
    period: '',
    description: 'Küçük klinikler için ideal başlangıç',
    features: [
      'Aylık 50 randevu',
      '1 personel hesabı',
      'Temel raporlar',
      'E-posta bildirimleri',
      'Mobil erişim'
    ],
    popular: false,
    cta: 'Ücretsiz Başla'
  },
  {
    name: 'Profesyonel',
    price: '₺37',
    period: '/gün',
    description: 'Büyüyen klinikler için en popüler seçim',
    features: [
      'Sınırsız randevu',
      '5 personel hesabı',
      'Gelişmiş analitik',
      'SMS + E-posta bildirimleri',
      'Öncelikli destek',
      'API erişimi',
      'Özel raporlar'
    ],
    popular: true,
    cta: 'Hemen Başla'
  },
  {
    name: 'Kurumsal',
    price: 'Özel',
    period: '',
    description: 'Büyük klinikler ve zincirler için',
    features: [
      'Sınırsız her şey',
      'Sınırsız personel',
      'Çoklu şube yönetimi',
      'Özel entegrasyonlar',
      '7/24 öncelikli destek',
      'Özel eğitim',
      'SLA garantisi'
    ],
    popular: false,
    cta: 'İletişime Geç'
  }
]

const trustedBy = [
  'Ünlüer Dental', 
  'Özel Mediplus', 
  'Istanbul Klinik', 
  'Healty Prs', 
  'Akvaryum Pet', 
  'Yıldız Kliniği'
]

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E8E4E0]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/images/asistan-icon.png"
                alt="Asistan"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-[#0B1828] font-semibold text-xl tracking-tight">asistan</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Özellikler', 'Fiyatlar', 'Müşteriler', 'Hakkında'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-[#5E6A78] hover:text-[#0B1828] transition-colors text-sm font-medium"
                >
                  {item}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  className="text-[#0B1828] hover:bg-[#F4F0EC] text-sm font-medium"
                >
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-[#0B1828] hover:bg-[#152535] text-white font-medium text-sm px-5 rounded-full">
                  Ücretsiz Dene
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Minimal */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8">
            <Badge 
              variant="outline" 
              className="px-4 py-2 bg-[#1BD1B5]/5 border-[#1BD1B5]/20 text-[#0B1828] rounded-full font-medium cursor-pointer hover:bg-[#1BD1B5]/10 transition-colors group"
            >
              <Sparkles className="w-4 h-4 mr-2 text-[#1BD1B5]" />
              KKTC&apos;nin ilk AI destekli klinik yönetim sistemi
              <ArrowUpRight className="w-4 h-4 ml-2 text-[#1BD1B5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Badge>
          </div>

          {/* Logo Display */}
          <div className="flex justify-center mb-10">
            <Image
              src="/images/asistan-icon.png"
              alt="Asistan Logo"
              width={80}
              height={80}
              className="w-20 h-20"
              priority
            />
          </div>

          {/* Main Headline - Bold Typography */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center text-[#0B1828] leading-[0.95] tracking-tight mb-8">
            Klinik yönetimi
            <br />
            <span className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] bg-clip-text text-transparent">
              artık çok kolay.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#5E6A78] text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            Randevu yönetimi, hasta takibi ve analitik - hepsi tek bir platformda. 
            Kliniğinizi dijitalleştirin, zamandan tasarruf edin.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-[#0B1828] hover:bg-[#152535] text-white font-semibold text-base px-8 py-6 rounded-full shadow-lg shadow-[#0B1828]/20 hover:shadow-xl hover:shadow-[#0B1828]/30 transition-all"
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg"
              variant="outline"
              className="border-[#E8E4E0] hover:border-[#0B1828] text-[#0B1828] font-medium text-base px-8 py-6 rounded-full hover:bg-[#F4F0EC] transition-all"
            >
              Demo İzle
            </Button>
          </div>

          {/* Trust Logos */}
          <div className="text-center">
            <p className="text-sm text-[#8A9AAA] mb-6 font-medium">840+ klinik tarafından güveniliyor</p>
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 opacity-50">
              {trustedBy.map((logo, i) => (
                <span key={i} className="text-[#0B1828] text-sm font-semibold tracking-wide">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logo Section */}
      <section className="py-12 bg-white border-y border-[#E8E4E0]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-center">
          <Image
            src="/images/asistan-full-logo.png"
            alt="Asistan - İşini Yöneten Akıllı Asistan"
            width={400}
            height={120}
            className="w-[280px] md:w-[360px] h-auto opacity-90"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#0B1828]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: '840+', label: 'Aktif Klinik' },
              { value: '₺37', label: 'Günlük Maliyet' },
              { value: '2.4 sa', label: 'Günlük Tasarruf' },
              { value: '%99.9', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white font-mono mb-2">{stat.value}</div>
                <div className="text-sm text-[#8A9AAA] uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="özellikler" className="py-24 px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#1BD1B5]/10 text-[#0B1828] border-0 rounded-full px-4 py-2">
              Özellikler
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1828] mb-6">
              Kliniğiniz için ihtiyacınız
              <br />
              olan her şey.
            </h2>
            <p className="text-lg text-[#5E6A78] max-w-xl mx-auto">
              Modern araçlar ile kliniğinizi daha verimli yönetin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <Card 
                key={index}
                className={`group relative bg-white border border-[#E8E4E0]/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0B1828]/5 hover:-translate-y-1 cursor-pointer ${
                  hoveredFeature === index ? 'scale-[1.02]' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${facility.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <facility.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B1828] mb-3">{facility.title}</h3>
                  <p className="text-[#5E6A78] leading-relaxed">{facility.description}</p>
                  <ArrowUpRight className="w-5 h-5 text-[#1BD1B5] mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Asistan Section */}
      <section className="py-24 bg-[#0B1828]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-[#1BD1B5]/10 text-[#1BD1B5] border-0 rounded-full px-4 py-2">
                Neden Asistan?
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
                Sekreterin yapamadığı
                <br />
                <span className="text-[#1BD1B5]">her şeyi yapan</span>
                <br />
                dijital çalışan.
              </h2>
              <p className="text-lg text-[#8A9AAA] mb-10 leading-relaxed">
                Asistan, kliniğinizin tüm operasyonel süreçlerini otomatikleştirir. 
                7/24 çalışır, hata yapmaz ve sürekli öğrenir.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Zap, title: 'Anında Kurulum', desc: '5 dakikada kliniğinizi sisteme ekleyin' },
                  { icon: Shield, title: 'Güvenli & Uyumlu', desc: 'KVKK uyumlu, şifreli veri saklama' },
                  { icon: Smartphone, title: 'Her Yerden Erişim', desc: 'Mobil uygulama ile dilediğiniz yerden yönetin' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-[#1BD1B5]/10 flex items-center justify-center group-hover:bg-[#1BD1B5]/20 transition-colors">
                      <item.icon className="w-6 h-6 text-[#1BD1B5]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-[#8A9AAA]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <div className="bg-[#152535] border border-[#1E3448] rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27CA40]"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm text-[#8A9AAA] mb-3">Bugünkü Randevular</div>
                  {[
                    { time: '09:00', name: 'Ali Yılmaz', service: 'Diş Kontrolü' },
                    { time: '10:30', name: 'Ayşe Demir', service: 'Dolgu' },
                    { time: '14:00', name: 'Mehmet Kaya', service: 'Kanal Tedavisi' },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#1E3448] rounded-xl p-4 hover:bg-[#253649] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-mono text-[#1BD1B5] font-medium">{apt.time}</div>
                        <div>
                          <div className="text-sm text-white font-medium">{apt.name}</div>
                          <div className="text-xs text-[#5E6A78]">{apt.service}</div>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-[#1BD1B5]"></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl">
                +12 yeni randevu bugün
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="fiyatlar" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#0B1828] text-white border-0 rounded-full px-4 py-2">
              Fiyatlandırma
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1828] mb-6">
              Basit, şeffaf fiyatlar.
            </h2>
            <p className="text-lg text-[#5E6A78] max-w-xl mx-auto">
              Gizli ücret yok. Dilediğiniz zaman iptal edin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative bg-white rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-2 border-[#1BD1B5] shadow-xl shadow-[#1BD1B5]/10' 
                    : 'border border-[#E8E4E0]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] text-white font-semibold px-4 py-1 rounded-full shadow-lg">
                      En Popüler
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8 pt-10">
                  <h3 className="text-xl font-semibold text-[#0B1828] mb-2">{plan.name}</h3>
                  <p className="text-sm text-[#5E6A78] mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-[#0B1828] font-mono">{plan.price}</span>
                    <span className="text-[#5E6A78] text-lg">{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-[#5E6A78]">
                        <div className="w-5 h-5 rounded-full bg-[#1BD1B5]/10 flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#1BD1B5]" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/auth/sign-up">
                    <Button 
                      className={`w-full py-6 rounded-full font-semibold ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] hover:opacity-90 text-white' 
                          : 'bg-[#0B1828] hover:bg-[#152535] text-white'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-[#1BD1B5] text-sm font-semibold uppercase tracking-wider mb-4">Başlamaya Hazır mısınız?</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sezgiyle değil,
            <br />
            <span className="text-[#1BD1B5]">veriyle yönetin.</span>
          </h2>
          <p className="text-lg text-[#8A9AAA] mb-10 max-w-2xl mx-auto">
            Asistan ile kliniğinizi bir sonraki seviyeye taşıyın. Hemen ücretsiz denemeye başlayın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-[#1BD1B5] hover:bg-[#15B89E] text-[#0B1828] font-semibold text-base px-10 py-6 rounded-full"
              >
                14 Gün Ücretsiz Dene
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg"
                variant="outline"
                className="border-[#1E3448] text-white hover:bg-[#152535] hover:text-white font-medium text-base px-10 py-6 rounded-full"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#050D15] border-t border-[#1E3448]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/images/asistan-icon.png"
                  alt="Asistan"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-white font-semibold text-xl">asistan</span>
              </div>
              <p className="text-sm text-[#5E6A78] leading-relaxed">
                İşini yöneten akıllı asistan.
                <br />
                KKTC&apos;nin ilk klinik yönetim sistemi.
              </p>
            </div>

            {[
              { title: 'Ürün', links: ['Özellikler', 'Fiyatlar', 'Entegrasyonlar', 'API'] },
              { title: 'Şirket', links: ['Hakkımızda', 'Kariyer', 'Blog', 'İletişim'] },
              { title: 'Destek', links: ['Yardım Merkezi', 'Dokümantasyon', 'Güvenlik', 'Gizlilik'] }
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-[#5E6A78] hover:text-white transition-colors">
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
              &copy; 2024 Asistan. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[#5E6A78] hover:text-white transition-colors">Gizlilik</a>
              <a href="#" className="text-sm text-[#5E6A78] hover:text-white transition-colors">Şartlar</a>
              <a href="#" className="text-sm text-[#5E6A78] hover:text-white transition-colors">Çerezler</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
