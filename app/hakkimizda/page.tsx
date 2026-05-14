'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play,
  Shield,
  Users,
  Lightbulb,
  Heart,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { AsistanLogo } from '@/components/asistan-logo'

const stats = [
  { value: '500+', label: 'Profesyonel', sublabel: 'Bize güveniyor', icon: Users },
  { value: '100.000+', label: 'Randevu', sublabel: 'Yönetildi', icon: Calendar },
  { value: '%98', label: 'Müşteri', sublabel: 'Memnuniyeti', icon: TrendingUp },
  { value: '10.000+', label: 'Saat', sublabel: 'Kazandırıldı', icon: Clock },
]

const values = [
  {
    icon: Shield,
    title: 'Güvenlik',
    description: 'Verilerinizin güvenliği bizim önceliğimizdir.',
    color: 'text-[#1BD1B5]',
    bg: 'bg-[#1BD1B5]/10'
  },
  {
    icon: Users,
    title: 'Kullanıcı Odaklılık',
    description: 'İhtiyaçlarınızı dinler, sizin için geliştiriz.',
    color: 'text-[#207FF5]',
    bg: 'bg-[#207FF5]/10'
  },
  {
    icon: Lightbulb,
    title: 'Yenilikçilik',
    description: 'Teknolojiyi yakından takip eder, sürekli daha iyisini üretiriz.',
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10'
  },
  {
    icon: Heart,
    title: 'İnsana Değer',
    description: 'Zamanınıza değer verir, işinizi kolaylaştırırız.',
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10'
  },
  {
    icon: Eye,
    title: 'Şeffaflık',
    description: 'Açık iletişim ve şeffaf çözümler sunarız.',
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/10'
  },
]

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link href="/">
                <AsistanLogo variant="dark" />
              </Link>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="/#features" className="text-[#5E6A78] hover:text-[#0B1828] transition-colors text-sm font-medium">
                  Ürün
                </a>
                <a href="#" className="text-[#5E6A78] hover:text-[#0B1828] transition-colors text-sm font-medium">
                  Çözümler
                </a>
                <a href="/#pricing" className="text-[#5E6A78] hover:text-[#0B1828] transition-colors text-sm font-medium">
                  Fiyatlandırma
                </a>
                <a href="#" className="text-[#5E6A78] hover:text-[#0B1828] transition-colors text-sm font-medium">
                  Kaynaklar
                </a>
                <a href="/hakkimizda" className="text-[#0B1828] font-semibold text-sm border-b-2 border-[#1BD1B5] pb-0.5">
                  Hakkımızda
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-[#0B1828] hover:bg-gray-100 text-sm font-medium">
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
      <section className="py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[#1BD1B5] text-sm font-semibold uppercase tracking-wider">
                  HAKKIMIZDA
                </span>
                <div className="h-px w-12 bg-[#1BD1B5]" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0B1828] leading-[1.1] mb-6">
                İşinize yarayan
                <br />
                akıllı asistanız.
              </h1>
              
              <p className="text-[#5E6A78] text-lg leading-relaxed mb-4 max-w-lg">
                Asistan, randevu yönetiminden hatırlatmalara, hasta iletişiminden 
                ekip organizasyonuna kadar işinizi kolaylaştıran yapay zeka 
                destekli bir platformdur.
              </p>
              
              <p className="text-[#5E6A78] text-lg leading-relaxed mb-8 max-w-lg">
                Amacımız, profesyonellerin zamanını geri kazandırmak 
                ve daha iyi hizmet sunmalarını sağlamaktır.
              </p>
              
              <Button 
                size="lg"
                className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold text-base px-8 py-6 rounded-full group"
              >
                <Play className="w-5 h-5 mr-2 fill-white" />
                Vizyonumuzu İzleyin
              </Button>
            </div>
            
            {/* Right Content - Image with floating cards */}
            <div className="relative">
              <div className="relative">
                <Image
                  src="/images/medical-team.jpg"
                  alt="Medical Professionals"
                  width={600}
                  height={500}
                  className="rounded-2xl w-full h-auto"
                  priority
                />
                
                {/* Floating Stats Cards */}
                <div className="absolute top-4 right-4 md:top-8 md:-right-4 bg-white rounded-xl shadow-xl p-4 min-w-[180px]">
                  <div className="text-xs text-[#5E6A78] mb-1">Bugünkü Randevular</div>
                  <div className="text-3xl font-bold text-[#0B1828]">24</div>
                  <div className="text-xs text-[#1BD1B5] mt-1">+%8 bu hafta</div>
                </div>
                
                <div className="absolute top-1/3 right-4 md:-right-8 bg-white rounded-xl shadow-xl p-4 min-w-[160px]">
                  <div className="text-xs text-[#5E6A78] mb-1">Onay Oranı</div>
                  <div className="text-3xl font-bold text-[#0B1828]">%98</div>
                  <div className="text-xs text-[#1BD1B5] mt-1">+%2 artış</div>
                </div>
                
                <div className="absolute bottom-8 right-4 md:-right-4 bg-white rounded-xl shadow-xl p-4 min-w-[160px] flex items-center gap-3">
                  <div>
                    <div className="text-xs text-[#5E6A78] mb-1">Boş Saatler</div>
                    <div className="text-2xl font-bold text-[#0B1828]">2</div>
                    <div className="text-xs text-[#5E6A78]">Öneriler mevcut</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#1BD1B5]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1BD1B5]/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[#0B1828]">{stat.value}</div>
                  <div className="text-sm text-[#0B1828] font-medium">{stat.label}</div>
                  <div className="text-xs text-[#5E6A78]">{stat.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828]">
              Değerlerimiz
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {values.map((value, i) => (
              <Card key={i} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-xl ${value.bg} flex items-center justify-center mx-auto mb-4`}>
                    <value.icon className={`w-7 h-7 ${value.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0B1828] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-[#5E6A78] leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siz de dijital dönüşüme katılın
          </h2>
          <p className="text-[#8A9AAA] text-lg mb-10 max-w-2xl mx-auto">
            Kliniğinizi geleceğe taşıyın. Asistan ile randevu yönetimini otomatikleştirin 
            ve hastalarınıza daha iyi hizmet verin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold text-base px-8 py-6 rounded-full"
              >
                14 Gün Ücretsiz Dene
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg"
                variant="outline"
                className="border-[#2A3F52] text-white hover:bg-[#152535] font-medium text-base px-8 py-6 rounded-full"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0B1828] border-t border-[#1E3448]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <AsistanLogo variant="light" />
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
