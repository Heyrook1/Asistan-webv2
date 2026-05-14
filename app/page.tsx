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
  Building2,
  Check,
  ArrowRight,
  Play,
  FileText,
  Zap
} from 'lucide-react'

const facilities = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Randevularınızı otomatik senkronize edin ve çakışmaları önleyin.'
  },
  {
    icon: Clock,
    title: 'Bekleme Listesi',
    description: 'İptal durumunda otomatik bildirim ile bekleme listesi yönetimi.'
  },
  {
    icon: Users,
    title: 'Personel Yönetimi',
    description: 'Çalışanlarınızın programlarını ve izinlerini kolayca yönetin.'
  },
  {
    icon: FileText,
    title: 'Hasta Notları',
    description: 'Hasta geçmişi ve notlarını güvenli bir şekilde saklayın.'
  },
  {
    icon: BarChart3,
    title: 'Analitik',
    description: 'Detaylı raporlar ve iş zekası ile büyümenizi takip edin.'
  },
  {
    icon: Building2,
    title: 'Çoklu Şube',
    description: 'Tüm şubelerinizi tek bir panel üzerinden yönetin.'
  }
]

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: '0',
    description: 'Küçük klinikler için',
    features: [
      'Aylık 50 randevu',
      '1 personel hesabı',
      'Temel raporlar',
      'E-posta bildirimleri',
      'Mobil erişim'
    ],
    popular: false
  },
  {
    name: 'Profesyonel',
    price: '₺37',
    period: '/gün',
    description: 'Büyüyen klinikler için',
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
    price: 'Özel',
    description: 'Büyük klinikler ve zincirler',
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

const trustedLogos = [
  'Ünlüer Dental', 'Özel Mediplus', 'Istanbul Klinik', 'Healty Prs Güzellik', 'Akvaryum Pet Kliniği', 'Özel Yıldız Kliniği'
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F4F0EC]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1828]/98 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Image
                src="/images/asistan-icon.png"
                alt="Asistan"
                width={28}
                height={28}
                className="w-7 h-7"
              />
              <span className="text-white font-semibold text-lg tracking-tight">asistan</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#hiz" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                Hız
              </a>
              <a href="#facilities" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                Özellikler
              </a>
              <a href="#pricing" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                Fiyatlandırma
              </a>
              <a href="#about" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                Hakkında
              </a>
              <a href="#support" className="text-[#8A9AAA] hover:text-white transition-colors text-sm font-medium">
                Destek
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  className="text-[#8A9AAA] hover:text-white hover:bg-transparent text-sm"
                >
                  Giriş yap
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-[#1BD1B5] hover:bg-[#15B89E] text-[#0B1828] font-medium text-sm px-4">
                  Randevu al
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-[#0B1828] pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <Badge 
                variant="outline" 
                className="mb-6 px-3 py-1 border-[#1BD1B5]/40 bg-[#1BD1B5]/10 text-[#1BD1B5] text-xs font-medium rounded-full"
              >
                KKTC&apos;nin ilk klinik yönetim sistemi
              </Badge>

              {/* Logo Icon - First Image */}
              <div className="mb-6">
                <Image
                  src="/images/asistan-icon.png"
                  alt="Asistan Logo"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                  priority
                />
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Klinik işinizi<br />
                yöneten{' '}
                <span className="text-[#1BD1B5]">akıllı<br />asistan.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base text-[#8A9AAA] max-w-md mb-8 leading-relaxed">
                Randevular, fatalar ve daha bir çok işletme ihtiyaçları, sayılı mobil uygulama, 
                web paneli ve çağrı sistemleri bi-fi tasarımlara sahip modern çözümler.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/auth/sign-up">
                  <Button 
                    className="bg-[#1BD1B5] hover:bg-[#15B89E] text-[#0B1828] font-semibold px-6 py-5"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ücretsiz Deneyin
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  className="border-[#2A3F55] bg-[#152535] text-white hover:bg-[#1E3448] hover:text-white px-6 py-5"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Canlı demo izle
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-[#1E3448]">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">840+</div>
                  <div className="text-xs text-[#5E6A78] uppercase tracking-wide">Klinik</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">₺37</div>
                  <div className="text-xs text-[#5E6A78] uppercase tracking-wide">Günlük</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">2.4 sa</div>
                  <div className="text-xs text-[#5E6A78] uppercase tracking-wide">Tasarruf</div>
                </div>
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative">
              <div className="bg-[#0F1F30] border border-[#1E3448] rounded-2xl p-4 shadow-2xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E3448]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27CA40]"></div>
                  </div>
                  <div className="text-xs text-[#5E6A78]">asistan.com.tr</div>
                </div>
                
                {/* Mock Appointments List */}
                <div className="space-y-3">
                  <div className="text-sm text-[#8A9AAA] mb-2">Bugünkü Randevular</div>
                  {[
                    { time: '09:00', name: 'Ali Yılmaz', service: 'Diş Kontrolü', status: 'confirmed' },
                    { time: '10:30', name: 'Ayşe Demir', service: 'Dolgu', status: 'pending' },
                    { time: '14:00', name: 'Mehmet Kaya', service: 'Kanal Tedavisi', status: 'confirmed' },
                    { time: '15:30', name: 'Zeynep Ak', service: 'Diş Beyazlatma', status: 'confirmed' },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#152535] rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-mono text-[#1BD1B5]">{apt.time}</div>
                        <div>
                          <div className="text-sm text-white">{apt.name}</div>
                          <div className="text-xs text-[#5E6A78]">{apt.service}</div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${apt.status === 'confirmed' ? 'bg-[#1BD1B5]' : 'bg-[#F59E0B]'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#1BD1B5] text-[#0B1828] px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
                +12 yeni randevu
              </div>
            </div>
          </div>
        </div>

        {/* Trust Logos */}
        <div className="border-t border-[#1E3448] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {trustedLogos.map((logo, i) => (
                <div key={i} className="text-[#5E6A78] text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Second Image - Full Logo with Slogan */}
      <section className="py-12 bg-[#F4F0EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Image
            src="/images/asistan-full-logo.png"
            alt="Asistan - İşini Yöneten Akıllı Asistan"
            width={400}
            height={120}
            className="w-[300px] md:w-[400px] h-auto"
          />
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section id="hiz" className="py-16 lg:py-24 bg-[#F4F0EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <Badge className="mb-4 bg-[#1BD1B5]/10 text-[#0B1828] border-0 hover:bg-[#1BD1B5]/10">
                ASİSTAN&apos;LA tanışın
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] leading-tight mb-6">
                Sekreterin yapamadığı<br />her şeyi yapan<br />
                <span className="text-[#1BD1B5]">dijital çalışan.</span>
              </h2>
              <p className="text-[#5E6A78] mb-8 leading-relaxed">
                ASİSTAN, klinik yonetım için bir dönüm noktasıdır. Beklenti üste değerleriyele 
                entegre, kullanıcı dostu platform ile henüz birkaç dakikada tüm süreçleri 
                yönetebilirsiniz.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1BD1B5] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#0B1828]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0B1828]">Otomatik hatırlatma mesajı</div>
                    <div className="text-sm text-[#5E6A78]">Hastalarınıza otomatik SMS ve e-posta ile randevu hatırlatması gönderin.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1BD1B5] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#0B1828]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0B1828]">7/24 online randevu</div>
                    <div className="text-sm text-[#5E6A78]">Hastalarınız dilediği zaman online randevu alabilir.</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1BD1B5] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#0B1828]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0B1828]">Sekter tanıma</div>
                    <div className="text-sm text-[#5E6A78]">Farklı sektörlere özel hazırlanmış şablonlar ile hızlı başlangıç.</div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Right - Feature Cards */}
            <div className="bg-[#0B1828] rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Bell, label: 'Anında bildirimdir', color: 'bg-[#1BD1B5]' },
                  { icon: Calendar, label: 'Randevuları hatırlat', color: 'bg-[#207FF5]' },
                  { icon: BarChart3, label: 'Analizler', color: 'bg-[#8B5CF6]' },
                  { icon: Clock, label: 'Çalışma hukz', color: 'bg-[#F59E0B]' },
                ].map((item, i) => (
                  <div key={i} className="bg-[#152535] rounded-xl p-4 flex flex-col items-center text-center">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm text-white">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0B1828] mb-4">
              <Zap className="w-6 h-6 text-[#1BD1B5]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              Bir kliniği yönetmek için<br />
              ihtiyacınız olan her şey.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <Card 
                key={index}
                className="bg-[#F4F0EC] border-0 hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-[#0B1828] flex items-center justify-center mb-3 group-hover:bg-[#1BD1B5] transition-colors">
                    <facility.icon className="w-5 h-5 text-[#1BD1B5] group-hover:text-[#0B1828]" />
                  </div>
                  <CardTitle className="text-[#0B1828] text-lg">{facility.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-[#5E6A78] text-sm leading-relaxed">
                    {facility.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24 bg-[#F4F0EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#1BD1B5]/10 text-[#0B1828] border-0 hover:bg-[#1BD1B5]/10">
              Fiyatlandırma
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              İşletmenize uygun plan seçin
            </h2>
            <p className="text-[#5E6A78] max-w-xl mx-auto">
              Her ölçekteki klinik için esnek fiyatlandırma. Dilediğiniz zaman planınızı değiştirin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative bg-white border ${
                  plan.popular 
                    ? 'border-[#1BD1B5] ring-2 ring-[#1BD1B5]/20' 
                    : 'border-[#E8E4E0]'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#1BD1B5] text-[#0B1828] font-semibold px-3">
                      En Popüler
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-[#0B1828] text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-[#5E6A78]">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-[#0B1828] font-mono">{plan.price}</span>
                    {plan.period && <span className="text-[#5E6A78] text-sm">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-[#5E6A78] text-sm">
                        <Check className="w-4 h-4 text-[#1BD1B5] shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/sign-up" className="block pt-4">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-[#1BD1B5] hover:bg-[#15B89E] text-[#0B1828] font-semibold' 
                          : 'bg-[#0B1828] hover:bg-[#152535] text-white'
                      }`}
                    >
                      Başla
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 lg:py-24 bg-[#0B1828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#5E6A78] text-sm uppercase tracking-wide mb-4">KKTC • TÜRK</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
                Sezgiyle değil,<br />
                <span className="text-[#1BD1B5]">veriyle yönetin.</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#1BD1B5] hover:bg-[#15B89E] text-[#0B1828] font-semibold">
                    Hemen üye olun
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="link" className="text-[#1BD1B5] hover:text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Canlı demo izleyin
                </Button>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="bg-[#0F1F30] border border-[#1E3448] rounded-xl p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#152535] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#1BD1B5] font-mono">156</div>
                  <div className="text-xs text-[#5E6A78]">Bu Hafta</div>
                </div>
                <div className="bg-[#152535] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white font-mono">89%</div>
                  <div className="text-xs text-[#5E6A78]">Doluluk</div>
                </div>
                <div className="bg-[#152535] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#207FF5] font-mono">₺24K</div>
                  <div className="text-xs text-[#5E6A78]">Gelir</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="support" className="bg-[#0B1828] border-t border-[#1E3448] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/images/asistan-icon.png"
                alt="Asistan"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-white font-semibold">asistan</span>
              <span className="text-[#5E6A78] text-sm ml-4">asistan.com.tr • 2026</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-[#5E6A78]">
              <a href="#" className="hover:text-[#1BD1B5] transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-[#1BD1B5] transition-colors">Kullanım</a>
              <a href="#" className="hover:text-[#1BD1B5] transition-colors">Destek</a>
              <Link href="/auth/login" className="hover:text-[#1BD1B5] transition-colors">Giriş</Link>
            </div>

            {/* Color dots */}
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full bg-[#0B1828] border border-[#1E3448]"></div>
              <div className="w-4 h-4 rounded-full bg-[#1BD1B5]"></div>
              <div className="w-4 h-4 rounded-full bg-[#207FF5]"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
