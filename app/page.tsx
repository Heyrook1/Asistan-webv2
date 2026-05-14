'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
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
  CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Randevularınızı kolayca yönetin. Çakışmaları önleyin, doluluk oranınızı artırın.'
  },
  {
    icon: Bell,
    title: 'Hatırlatmalar',
    description: 'Otomatik hatırlatmalar ile randevu iptallerini azaltın, katılım oranını yükseltin.'
  },
  {
    icon: Users,
    title: 'Ekip Yönetimi',
    description: 'Ekibinizi organize edin, görevleri paylaşın ve performansı tek yerden takip edin.'
  },
  {
    icon: Sparkles,
    title: 'AI Önerileri',
    description: 'Yapay zeka destekli önerilerle randevu planlamanızı optimize edin ve verimliliğinizi artırın.'
  },
]

const stats = [
  { value: '500+', label: 'Profesyonel', sublabel: 'Bize güveniyor', icon: Users },
  { value: '100.000+', label: 'Randevu', sublabel: 'Yönetildi', icon: Calendar },
  { value: '%98', label: 'Müşteri', sublabel: 'Memnuniyeti', icon: Star },
  { value: '10.000+', label: 'Saat', sublabel: 'Kazandırıldı', icon: Clock }
]

const industries = [
  {
    icon: '🏥',
    title: 'Asistan Health',
    description: 'Klinik, hastane ve muayenehaneler için randevu ve hasta yönetimi kolaylaştırılıyor.',
    image: '/images/industry-health.jpg'
  },
  {
    icon: '💇',
    title: 'Asistan Beauty',
    description: 'Güzellik merkezleri ve salonlar için randevu, paket ve müşteri yönetimini optimize eder.',
    image: '/images/industry-beauty.jpg'
  },
  {
    icon: '⚖️',
    title: 'Asistan Legal',
    description: 'Hukuk büroları için dava, görüşme ve müvekkil yönetimini düzenli hale getirir.',
    image: '/images/industry-legal.jpg'
  },
  {
    icon: '💼',
    title: 'Asistan Pro',
    description: 'Danışmanlar ve hizmet profesyonelleri için esnek randevu çözümleri sunar.',
    image: '/images/industry-pro.jpg'
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-[#F8FAFB] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0B1828] leading-[1.1] mb-6">
                İşinize yarayan
                <br />
                <span className="text-[#1BD1B5]">akıllı asistanınız.</span>
              </h1>
              
              <p className="text-[#5E6A78] text-lg mb-8 max-w-lg leading-relaxed">
                Asistan, randevu yönetimini, hatırlatmaları, müşteri iletişimini
                ve ekip organizasyonunu kolaylaştırır. Zamandan tasarruf edin,
                daha mutlu müşteriler kazanın.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link href="/auth/sign-up">
                  <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-6 py-6 rounded-full text-base">
                    Ücretsiz Dene
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-[#0B1828] font-medium px-6 py-6 rounded-full text-base"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Demo İzle
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-[#5E6A78]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1BD1B5]" />
                  <span>KVKK Uyumlu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#1BD1B5]" />
                  <span>Bulut Tabanlı</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#1BD1B5]" />
                  <span>Verileriniz Güvende</span>
                </div>
              </div>
            </div>

            {/* Right - Hero Image with Floating Cards */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/medical-team.jpg"
                  alt="Medical professionals"
                  width={600}
                  height={450}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Floating Card - Appointments */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 min-w-[220px] border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#0B1828]">Bugünkü Randevular</span>
                </div>
                <div className="space-y-2">
                  {[
                    { time: '09:30', name: 'Ayşe Yılmaz', status: 'Onaylandı' },
                    { time: '11:00', name: 'Mehmet Demir', status: 'Onaylandı' },
                    { time: '14:30', name: 'Zeynep Kaya', status: 'Beklemede' },
                    { time: '16:00', name: 'Ahmet Şahin', status: 'Onaylandı' },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[#1BD1B5] font-mono">{apt.time}</span>
                        <span className="text-[#0B1828]">{apt.name}</span>
                      </div>
                      <span className={apt.status === 'Onaylandı' ? 'text-[#1BD1B5]' : 'text-orange-500'}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card - Approval Rate */}
              <div className="absolute bottom-20 -left-8 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-[#5E6A78] mb-1">Onay Oranı</div>
                    <div className="text-2xl font-bold text-[#0B1828]">%98</div>
                    <div className="text-xs text-[#1BD1B5]">+%12 artış</div>
                  </div>
                  <div className="w-14 h-14 bg-[#1BD1B5]/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-[#1BD1B5]" />
                  </div>
                </div>
              </div>

              {/* Floating Card - Available Hours */}
              <div className="absolute -bottom-4 right-8 bg-white rounded-xl shadow-xl p-4 min-w-[160px] border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#1BD1B5]" />
                  <span className="text-xs font-semibold text-[#0B1828]">Boş Saatler</span>
                </div>
                <div className="space-y-1 text-xs text-[#5E6A78]">
                  <div>12:00 - 12:30</div>
                  <div>15:30 - 16:00</div>
                  <div>17:00 - 17:30</div>
                </div>
                <div className="mt-2 text-xs text-[#1BD1B5] font-medium">Tümünü Gör</div>
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
                <div className="w-12 h-12 bg-[#1BD1B5]/10 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0B1828]">{stat.value}</div>
                  <div className="text-xs text-[#5E6A78]">
                    {stat.label}<br />{stat.sublabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              Neden Asistan?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#1BD1B5]/20 transition-all"
              >
                <div className="w-12 h-12 bg-[#1BD1B5]/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1828] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#5E6A78] leading-relaxed">{feature.description}</p>
                <Link href="#" className="inline-flex items-center gap-1 text-sm text-[#1BD1B5] font-medium mt-4 hover:gap-2 transition-all">
                  Detayları İncele
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-20 bg-[#F8FAFB]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              Sizin sektörünüze uyum sağlar
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-md">
                    {industry.icon}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#0B1828] mb-2">{industry.title}</h3>
                  <p className="text-sm text-[#5E6A78] leading-relaxed mb-4">{industry.description}</p>
                  <Link href="/cozumler" className="inline-flex items-center gap-1 text-sm text-[#1BD1B5] font-medium hover:gap-2 transition-all">
                    Detayları İncele
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Asistan ile kliniğinizi bir sonraki seviyeye taşıyın.
          </h2>
          <p className="text-[#8A9AAA] text-lg mb-8">
            Hemen ücretsiz denemeye başlayın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button className="bg-white text-[#0B1828] hover:bg-gray-100 font-semibold px-8 py-6 rounded-full text-base">
                14 Gün Ücretsiz Dene
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-8 py-6 rounded-full text-base">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
