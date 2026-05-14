'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  Bell, 
  Star,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const facilities = [
  {
    icon: Calendar,
    title: 'Randevu Yönetimi',
    description: 'Tüm randevularınızı tek bir yerden kolayca yönetin ve takip edin.'
  },
  {
    icon: Users,
    title: 'Müşteri Takibi',
    description: 'Müşteri profillerini, geçmişini ve tercihlerini detaylı görüntüleyin.'
  },
  {
    icon: BarChart3,
    title: 'Analitik ve Raporlar',
    description: 'İş performansınızı detaylı grafikler ve raporlarla analiz edin.'
  },
  {
    icon: Clock,
    title: 'Çalışma Saatleri',
    description: 'Esnek çalışma saatlerinizi ve müsaitlik durumunuzu ayarlayın.'
  },
  {
    icon: Bell,
    title: 'Bildirimler',
    description: 'Randevu hatırlatmaları ve güncellemeler için otomatik bildirimler.'
  },
  {
    icon: Star,
    title: 'Değerlendirmeler',
    description: 'Müşteri yorumlarını ve puanlamalarını takip edin, yanıtlayın.'
  }
]

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: '0',
    description: 'Küçük işletmeler için ideal başlangıç',
    features: [
      'Aylık 50 randevu',
      '1 personel hesabı',
      'Temel raporlar',
      'E-posta bildirimleri',
      'Mobil uygulama erişimi'
    ],
    popular: false
  },
  {
    name: 'Profesyonel',
    price: '299',
    description: 'Büyüyen işletmeler için en popüler seçim',
    features: [
      'Sınırsız randevu',
      '5 personel hesabı',
      'Gelişmiş analitik',
      'SMS + E-posta bildirimleri',
      'Öncelikli destek',
      'API erişimi',
      'Özel raporlar'
    ],
    popular: true
  },
  {
    name: 'Kurumsal',
    price: '799',
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
    popular: false
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1828]/95 backdrop-blur-sm border-b border-[#1E3448]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image
                src="/images/asistan-icon.png"
                alt="Asistan"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-white font-semibold text-lg tracking-tight">asistan</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#facilities" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                Özellikler
              </a>
              <a href="#pricing" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                Fiyatlandırma
              </a>
              <a href="#contact" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                İletişim
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-[#1BD1B5] hover:bg-[#1BD1B5]/10"
                >
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="gradient-mint-blue text-[#0B1828] font-semibold hover:opacity-90 transition-opacity">
                  Ücretsiz Başla
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dark Theme */}
      <section className="relative min-h-screen bg-[#0B1828] pt-16 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#1BD1B5]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#207FF5]/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <Badge 
              variant="outline" 
              className="mb-8 px-4 py-1.5 border-[#1BD1B5]/30 bg-[#1BD1B5]/5 text-[#1BD1B5] font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              SAAS PLATFORM - KKTC - TR
            </Badge>

            {/* Logo Icon - First Image */}
            <div className="mb-8">
              <Image
                src="/images/asistan-icon.png"
                alt="Asistan Logo"
                width={120}
                height={120}
                className="w-24 h-24 md:w-32 md:h-32"
                priority
              />
            </div>

            {/* Full Logo with Slogan - Second Image */}
            <div className="mb-12">
              <Image
                src="/images/asistan-full-logo.png"
                alt="Asistan - İşini Yöneten Akıllı Asistan"
                width={500}
                height={150}
                className="w-[280px] md:w-[400px] lg:w-[500px] h-auto"
                priority
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 max-w-4xl">
              İşini yöneten{' '}
              <span className="text-gradient-mint-blue">akıllı asistan.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[#8A9AAA] max-w-2xl mb-10 leading-relaxed">
              Klinikler için tasarlanmış AI-destekli operasyon platformu — marka, 
              ürün, mobil ve oturum akışlarının hi-fi tasarımları.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link href="/auth/sign-up">
                <Button 
                  size="lg" 
                  className="gradient-mint-blue text-[#0B1828] font-semibold text-lg px-8 py-6 hover:opacity-90 transition-opacity"
                >
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-[#1E3448] bg-transparent text-white hover:bg-[#152538] hover:text-white text-lg px-8 py-6"
                >
                  Giriş Yap
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-[#1E3448]">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1BD1B5] font-mono">500+</div>
                <div className="text-sm text-[#5E6A78] mt-1">Aktif Klinik</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1BD1B5] font-mono">50K+</div>
                <div className="text-sm text-[#5E6A78] mt-1">Aylık Randevu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#1BD1B5] font-mono">99.9%</div>
                <div className="text-sm text-[#5E6A78] mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-[#1E3448] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#1BD1B5] rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 lg:py-32 bg-[#F4F0EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#1BD1B5] text-[#1BD1B5]">
              OZELLİKLER
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1828] mb-4">
              Tüm ihtiyaçlarınız için{' '}
              <span className="text-gradient-mint-blue">tek platform</span>
            </h2>
            <p className="text-lg text-[#5E6A78] max-w-2xl mx-auto">
              Randevu yönetiminden müşteri takibine, analitikten bildirimlere kadar 
              tüm iş süreçlerinizi kolaylaştırın.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <Card 
                key={index}
                className="bg-white border-[#E8E4E0] hover:border-[#1BD1B5]/50 hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl gradient-mint-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <facility.icon className="w-6 h-6 text-[#0B1828]" />
                  </div>
                  <CardTitle className="text-[#0B1828] text-xl">{facility.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#5E6A78] text-base leading-relaxed">
                    {facility.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-[#0B1828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#1BD1B5]/30 bg-[#1BD1B5]/5 text-[#1BD1B5]">
              FİYATLANDIRMA
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              İşletmenize uygun{' '}
              <span className="text-gradient-mint-blue">plan seçin</span>
            </h2>
            <p className="text-lg text-[#8A9AAA] max-w-2xl mx-auto">
              Her ölçekteki işletme için esnek fiyatlandırma seçenekleri. 
              Dilediğiniz zaman planınızı değiştirin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative bg-[#0F1F30] border-[#1E3448] ${
                  plan.popular 
                    ? 'border-[#1BD1B5] ring-2 ring-[#1BD1B5]/20 scale-105' 
                    : 'hover:border-[#1BD1B5]/50'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-mint-blue text-[#0B1828] font-semibold px-4">
                      En Popüler
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-[#8A9AAA]">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl md:text-5xl font-bold text-white font-mono">{plan.price}</span>
                    <span className="text-[#8A9AAA] ml-2">TL/ay</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-[#D4D0CC]">
                        <Check className="w-5 h-5 text-[#1BD1B5] shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/sign-up" className="block pt-4">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'gradient-mint-blue text-[#0B1828] font-semibold hover:opacity-90' 
                          : 'bg-[#152538] text-white hover:bg-[#1E3448]'
                      }`}
                    >
                      Planı Seç
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-[#F4F0EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1828] mb-6">
            İşinizi büyütmeye{' '}
            <span className="text-gradient-mint-blue">hazır mısınız?</span>
          </h2>
          <p className="text-lg text-[#5E6A78] mb-10 max-w-2xl mx-auto">
            Hemen ücretsiz hesap oluşturun ve Asistan ile tanışın. 
            Kredi kartı gerektirmez, dilediğiniz zaman iptal edebilirsiniz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button 
                size="lg" 
                className="gradient-mint-blue text-[#0B1828] font-semibold text-lg px-10 py-6 hover:opacity-90 transition-opacity"
              >
                Ücretsiz Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg" 
                variant="outline"
                className="border-[#0B1828] text-[#0B1828] hover:bg-[#0B1828] hover:text-white text-lg px-10 py-6"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#0B1828] border-t border-[#1E3448] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/images/asistan-icon.png"
                  alt="Asistan"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-white font-semibold text-lg">asistan</span>
              </div>
              <p className="text-[#8A9AAA] mb-6 max-w-md">
                Klinikler için tasarlanmış AI-destekli operasyon platformu. 
                İşinizi yöneten akıllı asistanınız.
              </p>
              <p className="text-[#5E6A78] text-sm">
                asistan.com.tr - 2026
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-[#8A9AAA]">
                <li><a href="#facilities" className="hover:text-[#1BD1B5] transition-colors">Özellikler</a></li>
                <li><a href="#pricing" className="hover:text-[#1BD1B5] transition-colors">Fiyatlandırma</a></li>
                <li><Link href="/auth/login" className="hover:text-[#1BD1B5] transition-colors">Giriş Yap</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-[#1BD1B5] transition-colors">Kayıt Ol</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Destek</h4>
              <ul className="space-y-3 text-[#8A9AAA]">
                <li><a href="#" className="hover:text-[#1BD1B5] transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-[#1BD1B5] transition-colors">API Dokümantasyonu</a></li>
                <li><a href="#" className="hover:text-[#1BD1B5] transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-[#1BD1B5] transition-colors">Kullanım Koşulları</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
