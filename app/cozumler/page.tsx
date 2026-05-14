'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AsistanLogo } from '@/components/asistan-logo'
import { 
  Play, 
  ChevronDown, 
  ArrowRight,
  Calendar,
  Bell,
  Users,
  Heart,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react'

export default function SolutionsPage() {
  const industries = [
    {
      name: 'Asistan Health',
      description: 'Klinik, hastane ve muayenehaneler için randevu ve hasta yönetimi kolaylaştırın.',
      image: '/images/industry-health.jpg',
      color: 'from-[#1BD1B5]/20 to-[#207FF5]/20'
    },
    {
      name: 'Asistan Beauty',
      description: 'Güzellik merkezleri ve salonlar için randevu, paket ve müşteri yönetimini optimize edin.',
      image: '/images/industry-beauty.jpg',
      color: 'from-pink-200/50 to-purple-200/50'
    },
    {
      name: 'Asistan Legal',
      description: 'Hukuk büroları için dava, görüşme ve müvekkil yönetimini düzenli hale getirin.',
      image: '/images/industry-legal.jpg',
      color: 'from-amber-200/50 to-orange-200/50'
    },
    {
      name: 'Asistan Pro',
      description: 'Danışmanlar ve hizmet profesyonelleri için esnek randevu çözümleri sunun.',
      image: '/images/industry-pro.jpg',
      color: 'from-blue-200/50 to-indigo-200/50'
    }
  ]

  const features = [
    {
      icon: Calendar,
      title: 'Randevu Yönetimi',
      description: 'Akıllı takvim ile çakışmaları önleyin, randevuları kolayca yönetin.'
    },
    {
      icon: Bell,
      title: 'Hatırlatmalar',
      description: 'Otomatik SMS, e-posta ve WhatsApp hatırlatmaları ile no-show\'ları azaltın.'
    },
    {
      icon: Users,
      title: 'Ekip Takibi',
      description: 'Ekip performansını izleyin, görevleri atayın ve süreçleri verimli yönetin.'
    },
    {
      icon: Heart,
      title: 'Müşteri Deneyimi',
      description: 'Kişiselleştirilmiş iletişim ve hızlı hizmetle müşteri memnuniyetini artırın.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-12">
              <Link href="/">
                <AsistanLogo variant="dark" />
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-[#5E6A78] hover:text-[#0B1828] text-sm font-medium transition-colors">
                  Ürün
                </Link>
                <Link href="/cozumler" className="text-[#0B1828] text-sm font-medium border-b-2 border-[#1BD1B5] pb-0.5">
                  Çözümler
                </Link>
                <Link href="/fiyatlandirma" className="text-[#5E6A78] hover:text-[#0B1828] text-sm font-medium transition-colors">
                  Fiyatlandırma
                </Link>
                <button className="flex items-center gap-1 text-[#5E6A78] hover:text-[#0B1828] text-sm font-medium transition-colors">
                  Kaynaklar
                  <ChevronDown className="w-4 h-4" />
                </button>
                <Link href="/hakkimizda" className="text-[#5E6A78] hover:text-[#0B1828] text-sm font-medium transition-colors">
                  Hakkımızda
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-[#5E6A78] hover:text-[#0B1828] text-sm font-medium transition-colors">
                Giriş Yap
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
      <section className="pt-16 pb-12 bg-gradient-to-b from-white to-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <span className="text-[#1BD1B5] text-sm font-semibold tracking-wider uppercase mb-4 block">
                ÇÖZÜMLER
              </span>
              
              <h1 className="text-4xl md:text-5xl font-bold text-[#0B1828] leading-tight mb-6">
                Her sektör için
                <br />
                uyarlanmış{' '}
                <span className="text-[#1BD1B5]">akıllı çözümler.</span>
              </h1>
              
              <p className="text-[#5E6A78] text-lg mb-8 leading-relaxed max-w-lg">
                Asistan, farklı sektörlerin ihtiyaçlarına göre özelleştirilmiş iş akışları ve 
                akıllı otomasyonlarla profesyonellerin işlerini kolaylaştırır. 
                Daha verimli süreçler, daha mutlu müşteriler, daha güçlü sonuçlar.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-medium px-6 h-12 rounded-full">
                    Çözümleri Keşfedin
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-300 text-[#0B1828] font-medium px-6 h-12 rounded-full hover:bg-gray-50">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Demo İzle
                </Button>
              </div>
            </div>

            {/* Right - Floating UI Cards */}
            <div className="relative h-[450px] hidden lg:block">
              {/* Calendar Card */}
              <div className="absolute top-0 left-0 bg-white rounded-xl shadow-lg p-4 w-[220px]">
                <div className="text-xs text-[#5E6A78] mb-3">Randevu Takvimi</div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs mb-3">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum'].map((day, i) => (
                    <div key={day} className="text-[#8A9AAA]">{day}</div>
                  ))}
                  {[10, 11, 12, 13, 14].map((num, i) => (
                    <div 
                      key={num} 
                      className={`py-1.5 rounded-lg ${num === 13 ? 'bg-[#1BD1B5] text-white' : 'text-[#0B1828]'}`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1BD1B5]" />
                    <span className="text-[#5E6A78]">09:30</span>
                    <span className="text-[#0B1828]">Ayşe Yılmaz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#207FF5]" />
                    <span className="text-[#5E6A78]">11:00</span>
                    <span className="text-[#0B1828]">Mehmet Demir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E]" />
                    <span className="text-[#5E6A78]">14:30</span>
                    <span className="text-[#0B1828]">Zeynep Kaya</span>
                  </div>
                </div>
              </div>

              {/* Approval Rate Card */}
              <div className="absolute top-0 right-0 bg-white rounded-xl shadow-lg p-4 w-[160px]">
                <div className="text-xs text-[#5E6A78] mb-2">Onay Oranı</div>
                <div className="text-3xl font-bold text-[#1BD1B5] mb-1">%98</div>
                <div className="text-xs text-[#1BD1B5] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  + %12 artış
                </div>
              </div>

              {/* Customer Satisfaction Card */}
              <div className="absolute top-28 right-0 bg-white rounded-xl shadow-lg p-4 w-[180px]">
                <div className="text-xs text-[#5E6A78] mb-2">Müşteri Memnuniyeti</div>
                <div className="text-3xl font-bold text-[#0B1828] mb-1">%98</div>
                <div className="text-xs text-[#1BD1B5] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  + %10 artış
                </div>
              </div>

              {/* Analytics Chart Card */}
              <div className="absolute bottom-24 right-8 bg-white rounded-xl shadow-lg p-4 w-[180px]">
                <div className="text-xs text-[#5E6A78] mb-3">Ocak Analizi</div>
                <div className="flex items-end gap-1 h-16">
                  {[40, 60, 45, 80, 55, 70, 90, 65, 75, 85, 50, 95].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-[#1BD1B5] to-[#207FF5] rounded-t opacity-70"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-[#8A9AAA] mt-2">Oca-Ara</div>
              </div>

              {/* Reminder Notification */}
              <div className="absolute bottom-0 left-8 bg-white rounded-xl shadow-lg p-4 w-[240px]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1BD1B5]/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-[#1BD1B5]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#0B1828]">Otomatik Hatırlatma</div>
                    <div className="text-xs text-[#5E6A78]">Ayşe Yılmaz</div>
                    <div className="text-xs text-[#1BD1B5] mt-1">Yarın 09:30</div>
                    <span className="inline-block mt-2 text-[10px] bg-[#1BD1B5]/10 text-[#1BD1B5] px-2 py-0.5 rounded-full">
                      Gönderildi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => (
              <div 
                key={industry.name}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                <div className={`h-40 bg-gradient-to-br ${industry.color} relative overflow-hidden`}>
                  <Image
                    src={industry.image}
                    alt={industry.name}
                    fill
                    className="object-cover mix-blend-overlay opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-[#0B1828] mb-2">{industry.name}</h3>
                  <p className="text-sm text-[#5E6A78] mb-4 leading-relaxed">{industry.description}</p>
                  <button className="text-[#1BD1B5] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    Detayları İncele
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[#1BD1B5]/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <h3 className="font-semibold text-[#0B1828] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#5E6A78] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0B1828] to-[#152535]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Sektörünüze uygun çözümü keşfedin
          </h2>
          <p className="text-[#8A9AAA] mb-8">
            İşiniz için en doğru çözümü birlikte belirleyelim.
          </p>
          <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-medium px-8 h-12 rounded-full">
            Bizimle İletişime Geçin
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0B1828] border-t border-[#1E3448]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <AsistanLogo variant="light" />
            <p className="text-sm text-[#5E6A78]">
              © 2026 Asistan. Tüm hakları saklıdır.
            </p>
            <a href="https://asistan.com.tr" className="text-sm text-[#1BD1B5] hover:text-[#1BD1B5]/80 transition-colors">
              asistan.com.tr
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
