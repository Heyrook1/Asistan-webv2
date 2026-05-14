'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { 
  Play,
  Shield,
  Users,
  Lightbulb,
  Heart,
  Eye,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

const stats = [
  { value: '500+', label: 'Profesyonel', sublabel: 'Bize güveniyor', icon: Users },
  { value: '100.000+', label: 'Randevu', sublabel: 'Yönetildi', icon: Calendar },
  { value: '%98', label: 'Müşteri', sublabel: 'Memnuniyeti', icon: Star },
  { value: '10.000+', label: 'Saat', sublabel: 'Kazandırıldı', icon: Clock },
]

const values = [
  {
    icon: Shield,
    title: 'Güvenlik',
    description: 'Verilerinizin güvenliği bizim önceliğimizdir.',
  },
  {
    icon: Users,
    title: 'Kullanıcı Odaklılık',
    description: 'İhtiyaçlarınızı dinler, sizin için geliştiririz.',
  },
  {
    icon: Lightbulb,
    title: 'Yenilikçilik',
    description: 'Teknolojiyi yakından takip eder, sürekli daha iyisini üretiriz.',
  },
  {
    icon: Heart,
    title: 'İnsana Değer',
    description: 'Zamanınıza değer veriyor, işinizi kolaylaştırıyoruz.',
  },
  {
    icon: Eye,
    title: 'Şeffaflık',
    description: 'Açık iletişim ve şeffaf çözümler sunarız.',
  },
]

export default function HakkimizdaPage() {
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
                <span className="text-[#1BD1B5] text-sm font-semibold tracking-wider uppercase">HAKKIMIZDA</span>
                <div className="w-8 h-px bg-[#1BD1B5]" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0B1828] leading-[1.1] mb-6">
                İşinize yarayan
                <br />
                <span className="text-[#1BD1B5]">akıllı asistanız.</span>
              </h1>
              
              <p className="text-[#5E6A78] text-lg mb-6 leading-relaxed">
                Asistan, randevu yönetimi, hatırlatmalar ve hasta iletişimi süreçlerini
                tek bir platformda birleştirir. Profesyonellerin zamanını geri kazandırır,
                randevu akışını düzenler, hatırlatmaları otomatikleştirir ve hasta
                memnuniyetini artırır.
              </p>

              <p className="text-[#5E6A78] text-base mb-8 leading-relaxed">
                Kliniklerden muayenehanelere, diş hekimlerinden fizyoterapistlere
                kadar binlerce profesyonelin günlük iş yükünü hafifletiyoruz.
              </p>

              <p className="text-[#0B1828] font-medium mb-8">
                Siz işinize odaklanın, Asistan gerisini halletsin.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-6 py-6 rounded-full text-base">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Vizyonumuzu İzleyin
                </Button>
                <Link href="/">
                  <Button variant="outline" className="border-gray-300 text-[#0B1828] font-medium px-6 py-6 rounded-full text-base">
                    Platformu Keşfedin
                  </Button>
                </Link>
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

              {/* Floating Card - Today's Appointments */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="text-xs text-[#5E6A78] mb-1">Bugünkü Randevular</div>
                <div className="text-3xl font-bold text-[#0B1828]">24</div>
                <div className="text-xs text-[#1BD1B5]">+%18 bu hafta</div>
              </div>

              {/* Floating Card - Approval Rate */}
              <div className="absolute bottom-32 -left-8 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
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
              <div className="absolute -bottom-4 right-8 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#1BD1B5]" />
                  <span className="text-xs font-semibold text-[#0B1828]">Boş Saatler</span>
                </div>
                <div className="text-xl font-bold text-[#0B1828]">2</div>
                <div className="text-xs text-[#5E6A78]">Öncelikler mevcut</div>
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

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1828] mb-4">
              Değerlerimiz
            </h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {values.map((value, i) => (
              <div 
                key={i} 
                className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-[#1BD1B5]/20 transition-all"
              >
                <div className="w-12 h-12 bg-[#1BD1B5]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <h3 className="text-base font-semibold text-[#0B1828] mb-2">{value.title}</h3>
                <p className="text-sm text-[#5E6A78] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ekibimize katılın
          </h2>
          <p className="text-[#8A9AAA] text-lg mb-8">
            Asistan&apos;ın büyüyen ailesinin bir parçası olun.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-8 py-6 rounded-full text-base">
                Ücretsiz Deneyin
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-medium px-8 py-6 rounded-full text-base">
              Bize Ulaşın
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
