'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AsistanLogo } from '@/components/asistan-logo'
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
  Smartphone,
  Play,
  Star
} from 'lucide-react'
import { useState, useEffect } from 'react'

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
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <AsistanLogo variant={scrolled ? 'dark' : 'light'} />
            </Link>
            
            <div className="hidden lg:flex items-center gap-10">
              {[
                { label: 'Özellikler', href: '#ozellikler' },
                { label: 'Fiyatlar', href: '#fiyatlar' },
                { label: 'Hakkımızda', href: '#hakkimizda' },
                { label: 'İletişim', href: '#iletisim' }
              ].map((item) => (
                <a 
                  key={item.label}
                  href={item.href} 
                  className="text-[#5E6A78] hover:text-[#0B1828] transition-colors text-[15px] font-medium"
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  className="text-[#0B1828] hover:bg-[#F4F0EC] text-[15px] font-medium h-11 px-5"
                >
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] hover:opacity-90 text-white font-semibold text-[15px] h-11 px-6 rounded-full shadow-lg shadow-[#1BD1B5]/25 transition-all hover:shadow-xl hover:shadow-[#1BD1B5]/30">
                  Ücretsiz Dene
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B1828] via-[#0F2132] to-[#0B1828]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#1BD1B5]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#207FF5]/10 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#1BD1B5]/5 to-[#207FF5]/5 rounded-full blur-[150px]" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxQkQxQjUiIGZpbGwtb3BhY2l0eT0iLjAyIiBkPSJNMCAwaDYwdjYwSDB6Ii8+PHBhdGggZD0iTTYwIDBIMHY2MCIgc3Ryb2tlPSIjMUJEMUI1IiBzdHJva2Utb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            {/* Logo with Tagline */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] rounded-3xl blur-3xl opacity-20 scale-150" />
                <AsistanLogo 
                  variant="light" 
                  showTagline={true} 
                  className="relative scale-150 md:scale-[1.75]"
                />
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-8 max-w-4xl mx-auto">
              Klinik işinizi yöneten
              <br />
              <span className="bg-gradient-to-r from-[#1BD1B5] via-[#20E3C2] to-[#207FF5] bg-clip-text text-transparent">
                akıllı asistan.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[#8A9AAA] max-w-2xl mx-auto mb-12 leading-relaxed">
              Klinikler için tasarlanmış AI-destekli operasyon platformu. 
              Randevu, hasta ve ekip yönetimini tek yerden yapın.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/auth/sign-up">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] hover:opacity-90 text-white font-semibold text-base h-14 px-8 rounded-full shadow-2xl shadow-[#1BD1B5]/30 transition-all hover:shadow-[#1BD1B5]/40 hover:scale-[1.02] group"
                >
                  14 Gün Ücretsiz Başla
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-[#2A3F52] bg-[#0B1828]/50 backdrop-blur-sm text-white hover:bg-[#152535] hover:border-[#3A5169] font-medium text-base h-14 px-8 rounded-full transition-all group"
              >
                <Play className="w-5 h-5 mr-2 fill-[#1BD1B5] text-[#1BD1B5]" />
                Demo İzle
              </Button>
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              {[
                { value: '840+', label: 'Aktif Klinik' },
                { value: '₺37', label: 'Günlük' },
                { value: '2.4 sa', label: 'Tasarruf/Gün' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">{stat.value}</div>
                  <div className="text-sm text-[#5E6A78] uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-[#2A3F52] flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-[#1BD1B5] rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 bg-[#FAFAF9] border-y border-[#E8E4E0]/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm text-[#8A9AAA] mb-8 font-medium uppercase tracking-wider">
            Kuzey Kıbrıs&apos;ın önde gelen klinikleri tarafından tercih ediliyor
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {['Ünlüer Dental', 'Özel Mediplus', 'Istanbul Klinik', 'Healty Prs', 'Akvaryum Pet', 'Yıldız Kliniği'].map((name, i) => (
              <span key={i} className="text-[#0B1828]/40 text-base font-semibold tracking-wide hover:text-[#0B1828]/70 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ozellikler" className="py-24 lg:py-32 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#1BD1B5]/10 text-[#0B1828] border-0 rounded-full px-5 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2 text-[#1BD1B5]" />
              Özellikler
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B1828] mb-6 leading-tight">
              Bir kliniği yönetmek için
              <br />
              <span className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] bg-clip-text text-transparent">
                ihtiyacınız olan her şey.
              </span>
            </h2>
            <p className="text-lg text-[#5E6A78] max-w-xl mx-auto">
              Modern araçlar ile operasyonlarınızı otomatikleştirin ve büyümeye odaklanın.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <Card 
                key={index}
                className="group relative bg-white border border-[#E8E4E0] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#0B1828]/8 hover:-translate-y-2 hover:border-transparent cursor-pointer"
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${facility.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    <facility.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1828] mb-3">{facility.title}</h3>
                  <p className="text-[#5E6A78] leading-relaxed">{facility.description}</p>
                  <div className="mt-6 flex items-center text-[#1BD1B5] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Daha fazla
                    <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Asistan Section */}
      <section className="py-24 lg:py-32 bg-[#0B1828] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1BD1B5]/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
              <Badge className="mb-6 bg-[#1BD1B5]/10 text-[#1BD1B5] border-0 rounded-full px-5 py-2 text-sm font-semibold">
                Neden Asistan?
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                Sekreterin yapamadığı
                <br />
                her şeyi yapan
                <br />
                <span className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] bg-clip-text text-transparent">dijital çalışan.</span>
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
                  <div key={i} className="flex items-start gap-5 group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1BD1B5]/20 to-[#207FF5]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
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
              <div className="absolute -inset-4 bg-gradient-to-r from-[#1BD1B5]/20 to-[#207FF5]/20 rounded-[2.5rem] blur-2xl opacity-50" />
              <div className="relative bg-[#0F2132] border border-[#1E3448] rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27CA40]"></div>
                  </div>
                  <div className="text-xs text-[#5E6A78] font-mono">asistan.com.tr</div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-[#8A9AAA]">Bugünkü Randevular</div>
                    <Badge className="bg-[#1BD1B5]/10 text-[#1BD1B5] border-0 text-xs">+12 yeni</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { time: '09:00', name: 'Ali Yılmaz', service: 'Diş Kontrolü', status: 'confirmed' },
                      { time: '10:30', name: 'Ayşe Demir', service: 'Dolgu', status: 'confirmed' },
                      { time: '14:00', name: 'Mehmet Kaya', service: 'Kanal Tedavisi', status: 'pending' },
                      { time: '15:30', name: 'Zeynep Ak', service: 'Temizlik', status: 'confirmed' },
                    ].map((apt, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#152535] rounded-xl p-4 hover:bg-[#1A3042] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-mono text-[#1BD1B5] font-semibold w-12">{apt.time}</div>
                          <div>
                            <div className="text-sm text-white font-medium">{apt.name}</div>
                            <div className="text-xs text-[#5E6A78]">{apt.service}</div>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${apt.status === 'confirmed' ? 'bg-[#1BD1B5]' : 'bg-[#F59E0B]'}`}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Bugün', value: '18', icon: Calendar },
                    { label: 'Bekleyen', value: '3', icon: Clock },
                    { label: 'Gelir', value: '₺4.2k', icon: BarChart3 }
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#152535] rounded-xl p-3 text-center">
                      <stat.icon className="w-4 h-4 text-[#5E6A78] mx-auto mb-1" />
                      <div className="text-lg font-bold text-white font-mono">{stat.value}</div>
                      <div className="text-xs text-[#5E6A78]">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="fiyatlar" className="py-24 lg:py-32 px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-[#0B1828] text-white border-0 rounded-full px-5 py-2 text-sm font-semibold">
              Fiyatlandırma
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0B1828] mb-6">
              Basit, şeffaf
              <br />
              <span className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] bg-clip-text text-transparent">fiyatlandırma.</span>
            </h2>
            <p className="text-lg text-[#5E6A78] max-w-xl mx-auto">
              Gizli ücret yok. İstediğiniz zaman iptal edin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative bg-white rounded-3xl transition-all duration-500 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-2 border-[#1BD1B5] shadow-2xl shadow-[#1BD1B5]/15 scale-105' 
                    : 'border border-[#E8E4E0] hover:shadow-xl hover:border-[#1BD1B5]/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] text-white font-semibold px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      En Popüler
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8 pt-12">
                  <h3 className="text-xl font-bold text-[#0B1828] mb-2">{plan.name}</h3>
                  <p className="text-sm text-[#5E6A78] mb-6 h-10">{plan.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-bold text-[#0B1828] font-mono">{plan.price}</span>
                    <span className="text-[#5E6A78] text-lg">{plan.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-[#5E6A78]">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-[#1BD1B5]' : 'bg-[#1BD1B5]/10'}`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-[#1BD1B5]'}`} />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/auth/sign-up">
                    <Button 
                      className={`w-full h-12 rounded-full font-semibold transition-all ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] hover:opacity-90 text-white shadow-lg shadow-[#1BD1B5]/25' 
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
      <section className="py-24 lg:py-32 bg-[#0B1828] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-[#1BD1B5]/10 via-[#207FF5]/10 to-[#1BD1B5]/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative">
          <Badge className="mb-6 bg-[#1BD1B5]/10 text-[#1BD1B5] border-0 rounded-full px-5 py-2 text-sm font-semibold">
            Başlamaya Hazır mısınız?
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Sezgiyle değil,
            <br />
            <span className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] bg-clip-text text-transparent">veriyle yönetin.</span>
          </h2>
          <p className="text-lg text-[#8A9AAA] mb-10 max-w-2xl mx-auto">
            Asistan ile kliniğinizi bir sonraki seviyeye taşıyın. 
            Bugün ücretsiz denemeye başlayın, farkı hemen görün.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#1BD1B5] to-[#207FF5] hover:opacity-90 text-white font-semibold text-base h-14 px-10 rounded-full shadow-2xl shadow-[#1BD1B5]/30 transition-all hover:shadow-[#1BD1B5]/40 hover:scale-[1.02] group"
              >
                14 Gün Ücretsiz Dene
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg"
                className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-[#0B1828] font-semibold text-base h-14 px-10 rounded-full transition-all"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050D14] py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-12">
            <div className="max-w-sm">
              <div className="mb-6">
                <AsistanLogo variant="light" />
              </div>
              <p className="text-[#5E6A78] leading-relaxed">
                Kuzey Kıbrıs&apos;ın ilk ve tek AI destekli klinik yönetim platformu. 
                Modern, güvenli ve kullanımı kolay.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-white font-semibold mb-4">Ürün</h4>
                <ul className="space-y-3">
                  {['Özellikler', 'Fiyatlar', 'Entegrasyonlar', 'API'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[#5E6A78] hover:text-white transition-colors text-sm">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Şirket</h4>
                <ul className="space-y-3">
                  {['Hakkımızda', 'Blog', 'Kariyer', 'İletişim'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[#5E6A78] hover:text-white transition-colors text-sm">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Destek</h4>
                <ul className="space-y-3">
                  {['Yardım Merkezi', 'Dokümantasyon', 'SSS', 'İletişim'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[#5E6A78] hover:text-white transition-colors text-sm">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#1E3448] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#5E6A78] text-sm">
              &copy; 2026 Asistan. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[#1BD1B5] text-sm font-medium">asistan.com.tr</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
