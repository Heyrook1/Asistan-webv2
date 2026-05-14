'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { 
  Play, 
  ArrowRight,
  Calendar,
  Bell,
  Users,
  Heart,
  CheckCircle2,
  Clock,
  Star
} from 'lucide-react'

const industries = [
  {
    icon: '🏥',
    name: 'Asistan Health',
    description: 'Klinik, hastane ve muayenehaneler için randevu ve hasta yönetimi kolaylaştırın.',
    image: '/images/industry-health.jpg',
  },
  {
    icon: '💇',
    name: 'Asistan Beauty',
    description: 'Güzellik merkezleri ve salonlar için randevu, paket ve müşteri yönetimini optimize eder.',
    image: '/images/industry-beauty.jpg',
  },
  {
    icon: '⚖️',
    name: 'Asistan Legal',
    description: 'Hukuk büroları için dava, görüşme ve müvekkil yönetimini düzenli hale getirir.',
    image: '/images/industry-legal.jpg',
  },
  {
    icon: '💼',
    name: 'Asistan Pro',
    description: 'Danışmanlar ve hizmet profesyonelleri için esnek randevu çözümleri sunar.',
    image: '/images/industry-pro.jpg',
  },
]

const features = [
  {
    icon: Calendar,
    title: 'Randevu Yönetimi',
    description: 'Akıllı takvim ile çakışmaları önleyin, randevularınızı kolayca yönetin.'
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
    description: 'Kişiselleştirilmiş iletişim ve hızlı hizmetle müşteri memnuniyetinizi artırın.'
  },
]

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-[#F8FAFB] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#1BD1B5] text-sm font-semibold tracking-wider uppercase">ÇÖZÜMLER</span>
                <div className="w-8 h-px bg-[#1BD1B5]" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0B1828] leading-[1.1] mb-6">
                Her sektör için
                <br />
                uyarlanmış <span className="text-[#1BD1B5]">akıllı çözümler.</span>
              </h1>
              
              <p className="text-[#5E6A78] text-lg mb-8 leading-relaxed max-w-lg">
                Asistan, farklı sektörlerin ihtiyaçlarına göre özelleştirilmiş iş akışları ve
                akıllı otomasyonlarla profesyonellerin işlerini kolaylaştırır.
                Daha verimli süreçler, daha mutlu müşteriler, daha güçlü sonuçlar.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-6 py-6 rounded-full text-base">
                    Çözümleri Keşfedin
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-300 text-[#0B1828] font-medium px-6 py-6 rounded-full text-base">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Demo İzle
                </Button>
              </div>
            </div>

            {/* Right - Floating UI Elements */}
            <div className="relative h-[400px]">
              {/* Calendar Widget */}
              <div className="absolute top-0 left-0 bg-white rounded-xl shadow-xl p-4 border border-gray-100 w-[200px]">
                <div className="text-xs font-semibold text-[#0B1828] mb-3">Randevu Takvimi</div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                    <div key={day} className="text-[#8A9AAA] py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {[10, 11, 12, 13, 14, 15, 16].map(day => (
                    <div 
                      key={day} 
                      className={`py-1.5 rounded ${day === 13 ? 'bg-[#1BD1B5] text-white font-semibold' : 'text-[#5E6A78]'}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#1BD1B5] font-mono">09:00</span>
                    <span className="text-[#5E6A78]">Ayşe Yılmaz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1BD1B5] font-mono">11:00</span>
                    <span className="text-[#5E6A78]">Mehmet Demir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1BD1B5] font-mono">14:30</span>
                    <span className="text-[#5E6A78]">Zeynep Kaya</span>
                  </div>
                </div>
              </div>

              {/* Approval Rate Card */}
              <div className="absolute top-0 right-0 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-[#5E6A78] mb-1">Onay Oranı</div>
                    <div className="text-2xl font-bold text-[#0B1828]">%98</div>
                    <div className="text-xs text-[#1BD1B5]">+%12 artış</div>
                  </div>
                  <div className="w-12 h-12 bg-[#1BD1B5]/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#1BD1B5]" />
                  </div>
                </div>
              </div>

              {/* Satisfaction Card */}
              <div className="absolute top-24 right-0 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-[#5E6A78] mb-1">Müşteri Memnuniyeti</div>
                    <div className="text-2xl font-bold text-[#0B1828]">%98</div>
                    <div className="text-xs text-[#1BD1B5]">+%10 artış</div>
                  </div>
                  <div className="w-12 h-12 bg-[#1BD1B5]/10 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-[#1BD1B5]" />
                  </div>
                </div>
              </div>

              {/* Chart Card */}
              <div className="absolute bottom-20 left-12 bg-white rounded-xl shadow-xl p-4 border border-gray-100 w-[160px]">
                <div className="text-xs text-[#5E6A78] mb-2">Ocak Analizi</div>
                <div className="h-16 flex items-end gap-1">
                  {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#1BD1B5]/30 rounded-t" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="text-xs text-[#5E6A78] mt-2">Bu Ay →</div>
              </div>

              {/* Notification Card */}
              <div className="absolute bottom-0 right-12 bg-white rounded-xl shadow-xl p-4 border border-gray-100 w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-[#1BD1B5]" />
                  <span className="text-xs font-semibold text-[#0B1828]">Otomatik Hatırlatma</span>
                </div>
                <div className="text-xs text-[#5E6A78]">
                  <span className="font-medium text-[#0B1828]">Ayşe Yılmaz</span>
                  <br />
                  Yarın 09:30
                </div>
                <div className="text-xs text-[#1BD1B5] mt-2">Gönderildi ✓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-md">
                    {industry.icon}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#0B1828] mb-2">{industry.name}</h3>
                  <p className="text-sm text-[#5E6A78] leading-relaxed mb-4">{industry.description}</p>
                  <Link href="#" className="inline-flex items-center gap-1 text-sm text-[#1BD1B5] font-medium hover:gap-2 transition-all">
                    Detayları İncele
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1BD1B5]/10 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-[#1BD1B5]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#0B1828] mb-1">{feature.title}</h4>
                  <p className="text-sm text-[#5E6A78] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1BD1B5]/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Sektörünüze uygun çözümü keşfedin</h3>
                <p className="text-[#8A9AAA] text-sm">İşiniz için en doğru çözümü birlikte belirleyelim.</p>
              </div>
            </div>
            <Link href="/auth/sign-up">
              <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-6 py-5 rounded-full whitespace-nowrap">
                Bizimle İletişime Geçin
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
