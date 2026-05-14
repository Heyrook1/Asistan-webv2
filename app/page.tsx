'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Bell, 
  ArrowRight,
  Play,
  Shield,
  Cloud,
  Lock,
  Star,
  UserCircle,
  Sparkles,
  Clock,
  ChevronDown
} from 'lucide-react'
import { AsistanLogo } from '@/components/asistan-logo'

const features = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Randevularınızı kolayca yönetin. Çakışmaları önleyin, doluluk oranınızı artırın.'
  },
  {
    icon: Bell,
    title: 'Otomatik Hatırlatmalar',
    description: 'SMS, e-posta ve bildirimlerle müşterilerinize zamanında hatırlatmalar gönderin, iptalleri azaltın.'
  },
  {
    icon: UserCircle,
    title: 'Müşteri Kartları',
    description: 'Tüm müşteri bilgilerini tek yerde tutun. Geçmiş randevulara ve notlara kolayca erişin.'
  },
  {
    icon: Users,
    title: 'Sekreter Hesabı',
    description: 'Sekreter veya ön büro çalışanlarınız, müşteri yönetimi ve randevulamayı yapsın.'
  },
  {
    icon: BarChart3,
    title: 'Ekip Yönetimi',
    description: 'Çalışanlarınızı ve hizmetlerinizi yönetin, performanslarını takip edin, yetkilerini düzenleyin.'
  },
  {
    icon: Sparkles,
    title: 'AI Önerileri',
    description: 'AI destekli önerilerle doluluk oranını artırın, iptal oranlarını azaltın ve geliri optimize edin.'
  }
]

const stats = [
  { value: '500+', label: 'Profesyonel', sublabel: 'Bize güveniyor', icon: Users },
  { value: '100.000+', label: 'Randevu', sublabel: 'Yönetildi', icon: Calendar },
  { value: '%98', label: 'Müşteri', sublabel: 'Memnuniyeti', icon: Star },
  { value: '10.000+', label: 'Saat', sublabel: 'Kazandırıldı', icon: Clock }
]

const trustBadges = [
  { icon: Shield, title: 'KVKK Uyumlu', subtitle: 'Güvenlik alt yapısı' },
  { icon: Cloud, title: 'Bulut Tabanlı', subtitle: 'Her yerden erişim' },
  { icon: Lock, title: 'Verileriniz Güvende', subtitle: 'Şifreli & güvenli' }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center">
                <AsistanLogo variant="dark" />
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  href="#" 
                  className="px-4 py-2 text-sm font-medium text-[#1BD1B5] border-b-2 border-[#1BD1B5]"
                >
                  Ürün
                </Link>
                <Link 
                  href="#" 
                  className="px-4 py-2 text-sm font-medium text-[#5E6A78] hover:text-[#0B1828] transition-colors flex items-center gap-1"
                >
                  Çözümler
                  <ChevronDown className="w-4 h-4" />
                </Link>
                <Link 
                  href="#" 
                  className="px-4 py-2 text-sm font-medium text-[#5E6A78] hover:text-[#0B1828] transition-colors"
                >
                  Fiyatlandırma
                </Link>
                <Link 
                  href="#" 
                  className="px-4 py-2 text-sm font-medium text-[#5E6A78] hover:text-[#0B1828] transition-colors flex items-center gap-1"
                >
                  Kaynaklar
                  <ChevronDown className="w-4 h-4" />
                </Link>
                <Link 
                  href="/hakkimizda" 
                  className="px-4 py-2 text-sm font-medium text-[#5E6A78] hover:text-[#0B1828] transition-colors"
                >
                  Hakkımızda
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-[#5E6A78] hover:text-[#0B1828] font-medium">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-medium rounded-full px-6">
                  Ücretsiz Dene
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="pt-8">
              <span className="text-[#1BD1B5] text-sm font-semibold tracking-wider uppercase mb-4 block">
                ÜRÜN
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0B1828] leading-[1.1] mb-6">
                İş akışınızı tek
                <br />
                <span className="text-[#1BD1B5]">platformdan yönetin.</span>
              </h1>
              
              <p className="text-lg text-[#5E6A78] mb-8 leading-relaxed max-w-lg">
                Randevularınızı düzenleyin, hatırlatmalarla iptalleri azaltın, 
                müşterilerinizle etkili iletişim kurun, ekibinizi yönetin ve 
                AI destekli önerilerle işinizi büyütün.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link href="/auth/sign-up">
                  <Button 
                    size="lg"
                    className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-8 rounded-full h-12"
                  >
                    Ücretsiz Dene
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-[#0B1828] hover:bg-gray-50 font-medium px-6 rounded-full h-12"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Demo İzle
                </Button>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <badge.icon className="w-5 h-5 text-[#1BD1B5]" />
                    <div>
                      <div className="text-sm font-medium text-[#0B1828]">{badge.title}</div>
                      <div className="text-xs text-[#8A9AAA]">{badge.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right: Dashboard Mockup */}
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-500 border border-gray-200">
                      asistan.com.tr/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-4">
                  <div className="flex gap-4">
                    {/* Sidebar */}
                    <div className="w-48 bg-[#0B1828] rounded-xl p-4 text-white shrink-0">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1BD1B5] to-[#207FF5] flex items-center justify-center text-xs font-bold">A</div>
                        <span className="text-sm font-semibold">asistan</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>Takvim</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 text-white/60 text-sm">
                          <Users className="w-4 h-4" />
                          <span>Müşteriler</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 text-white/60 text-sm">
                          <BarChart3 className="w-4 h-4" />
                          <span>Raporlar</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="text-xs text-white/40 mb-2">Bugünkü randevular</div>
                        <div className="text-3xl font-bold">24</div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white/5 rounded-lg">
                        <div className="text-xs text-white/40">Toplam Gelir</div>
                        <div className="text-lg font-semibold">2.846 ₺</div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1BD1B5]/20 flex items-center justify-center text-[#1BD1B5] text-xs">M</div>
                        <span className="text-sm">Müşteri Listesi</span>
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 space-y-4">
                      {/* Calendar Grid */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-[#0B1828]">Takvim</h3>
                          <span className="text-sm text-[#5E6A78]">14 Mayıs 2024, Salı</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                            <div key={day} className="text-[#8A9AAA] py-1">{day}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                          {Array.from({ length: 14 }, (_, i) => i + 1).map(day => (
                            <div 
                              key={day} 
                              className={`py-2 rounded-lg ${day === 14 ? 'bg-[#1BD1B5] text-white font-semibold' : 'text-[#5E6A78] hover:bg-gray-100'}`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Appointments List */}
                      <div className="bg-white border border-gray-100 rounded-xl p-4">
                        <h4 className="font-medium text-[#0B1828] mb-3 text-sm">Yaklaşan Randevular</h4>
                        <div className="space-y-2">
                          {[
                            { time: '09:30', name: 'Ayşe Yılmaz', status: 'Onaylandı', color: 'bg-green-100 text-green-700' },
                            { time: '11:00', name: 'Mehmet Kaya', status: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
                            { time: '14:00', name: 'Zeynep Demir', status: 'Onaylandı', color: 'bg-green-100 text-green-700' }
                          ].map((apt, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#1BD1B5]">{apt.time}</span>
                                <span className="text-sm text-[#0B1828]">{apt.name}</span>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${apt.color}`}>{apt.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Stats Panel */}
                    <div className="w-40 space-y-3 shrink-0">
                      <div className="bg-white border border-gray-100 rounded-xl p-3">
                        <div className="text-xs text-[#8A9AAA] mb-1">Hatırlatma</div>
                        <div className="text-2xl font-bold text-[#0B1828]">56</div>
                        <div className="text-xs text-[#8A9AAA]">+18 arama</div>
                      </div>
                      
                      <div className="bg-white border border-gray-100 rounded-xl p-3">
                        <div className="text-xs text-[#8A9AAA] mb-1">Bugün gönderilenler</div>
                        <div className="text-lg font-semibold text-[#0B1828]">56</div>
                      </div>
                      
                      <div className="bg-[#0B1828] rounded-xl p-3 text-white">
                        <div className="text-xs text-white/60 mb-1">İade Oranı</div>
                        <div className="text-2xl font-bold">₺125.430</div>
                        <div className="text-xs text-[#1BD1B5]">+5.8% artış</div>
                      </div>
                      
                      <div className="bg-white border border-gray-100 rounded-xl p-3">
                        <div className="text-xs text-[#8A9AAA] mb-1">Yeni müşteri</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-semibold text-[#0B1828]">435.464</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 lg:px-8 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-none bg-transparent hover:bg-gray-50 transition-colors group cursor-pointer">
                <CardContent className="p-4">
                  <div className="w-10 h-10 rounded-xl bg-[#E8FAF7] flex items-center justify-center mb-4 group-hover:bg-[#1BD1B5]/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-[#1BD1B5]" />
                  </div>
                  <h3 className="font-semibold text-[#0B1828] text-sm mb-2">{feature.title}</h3>
                  <p className="text-xs text-[#5E6A78] leading-relaxed mb-3">{feature.description}</p>
                  <Link href="#" className="text-xs text-[#1BD1B5] font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Detayları İncele
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#E8FAF7] flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[#0B1828]">{stat.value}</div>
                  <div className="text-sm text-[#5E6A78]">{stat.label}</div>
                  <div className="text-xs text-[#8A9AAA]">{stat.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-4">
            {/* Preview Cards */}
            {[
              { title: 'Akıllı Takvim', desc: 'Tüm randevularını görün.' },
              { title: 'Otomatik Hatırlatmalar', desc: 'Tek tıkla hatırlatma gönderin.' },
              { title: 'Müşteri Kartları', desc: 'Tüm bilgileri tek yerde.' },
              { title: 'Raporlar', desc: 'Gelişmiş ve performansınızı detaylı analiz edin.' }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-full h-24 bg-white rounded-lg border border-gray-100 mb-3 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1BD1B5]/20 to-[#207FF5]/20 rounded-lg"></div>
                </div>
                <h4 className="font-medium text-[#0B1828] text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-[#5E6A78]">{item.desc}</p>
              </div>
            ))}
            
            {/* Stats Card */}
            <div className="bg-[#0B1828] rounded-xl p-4 text-white">
              <div className="mb-4">
                <div className="text-xs text-white/60 mb-1">Ayşe Yılmaz</div>
                <div className="text-xs text-white/40">27/05/2022, 09:52</div>
              </div>
              <div className="h-16 flex items-end gap-1 mb-4">
                {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#1BD1B5]/40 rounded-t" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="text-xs text-white/60">Grafik ve performansınızı detaylı analiz edin.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Kliniğinizi dijitalleştirmeye hazır mısınız?
          </h2>
          <p className="text-lg text-[#8A9AAA] mb-8">
            14 gün ücretsiz deneyin. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-8 rounded-full"
              >
                Ücretsiz Başla
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button 
                size="lg"
                className="bg-white hover:bg-gray-100 text-[#0B1828] font-semibold px-8 rounded-full"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-[#0B1828] border-t border-[#1E3448]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <AsistanLogo variant="light" />
              </div>
              <p className="text-[#5E6A78] text-sm leading-relaxed max-w-xs">
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
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-[#5E6A78] hover:text-white transition-colors text-sm">{link}</a>
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
