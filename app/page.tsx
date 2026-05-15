'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { 
  Calendar, 
  Users, 
  Bell, 
  Sparkles,
  Play,
  Star,
  ArrowRight,
  Check,
  Clock,
  UserCheck,
  Brain,
  Shield,
  Stethoscope,
  Scissors,
  Scale,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Zap,
  CheckCircle2
} from 'lucide-react'

const stats = [
  { icon: UserCheck, value: '500+', label: 'Profesyonel Bize Güveniyor' },
  { icon: Calendar, value: '100.000+', label: 'Randevu Yönetildi' },
  { icon: Star, value: '%98', label: 'Müşteri Memnuniyeti' },
  { icon: Clock, value: '10.000+', label: 'Saat Kazandırdık' },
]

const features = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Randevularınızı kolayca yönetin, çakışmaları önleyin ve doluluk oranınızı artırın. Tüm takvimlerinizi tek yerden görüntüleyin.',
  },
  {
    icon: Bell,
    title: 'Otomatik Hatırlatmalar',
    description: 'SMS, e-posta ve WhatsApp üzerinden otomatik hatırlatmalar gönderin. İptal oranlarını düşürün, katılımı artırın.',
  },
  {
    icon: Users,
    title: 'Ekip Yönetimi',
    description: 'Ekibinizi organize edin, görevleri paylaşın ve performansı tek yerden takip edin. Rol bazlı yetkilendirme ile güvenli erişim.',
  },
  {
    icon: Brain,
    title: 'AI Önerileri',
    description: 'Yapay zeka destekli önerilerle randevu planlamanızı optimize edin. Akıllı içgörüler ile verimliliğinizi artırın.',
  },
]

const aiSuggestions = [
  { icon: Clock, text: 'Bugün 2 boş zaman diliminiz var.', color: 'bg-[#12C8AD]/10 text-[#12C8AD]' },
  { icon: Bell, text: '3 randevu onay bekliyor.', color: 'bg-[#16A9E8]/10 text-[#16A9E8]' },
  { icon: TrendingUp, text: 'En yoğun gününüz Cuma.', color: 'bg-[#06142A]/10 text-[#06142A]' },
  { icon: MessageSquare, text: 'Bekleyen müşteriye boş slot önerebilirsiniz.', color: 'bg-[#12C8AD]/10 text-[#12C8AD]' },
]

const industries = [
  {
    title: 'Asistan Health',
    description: 'Doktorlar, klinikler, diş hekimleri, psikologlar ve sağlık profesyonelleri için.',
    image: '/images/industry-health.jpg',
    icon: Stethoscope,
    color: 'bg-[#12C8AD]',
    featured: true,
  },
  {
    title: 'Asistan Beauty',
    description: 'Güzellik merkezleri, kuaförler, berberler ve wellness profesyonelleri için.',
    image: '/images/industry-beauty.jpg',
    icon: Scissors,
    color: 'bg-pink-500',
    featured: false,
  },
  {
    title: 'Asistan Legal',
    description: 'Avukatlar, danışmanlar ve hukuk büroları için.',
    image: '/images/industry-legal.jpg',
    icon: Scale,
    color: 'bg-amber-500',
    featured: false,
  },
  {
    title: 'Asistan Pro',
    description: 'Teknisyenler, servis sağlayıcılar, serbest çalışanlar ve saha ekipleri için.',
    image: '/images/industry-pro.jpg',
    icon: Briefcase,
    color: 'bg-violet-500',
    featured: false,
  },
]

const todayAppointments = [
  { time: '09:30', name: 'Ayşe Yılmaz', status: 'Onaylandı' },
  { time: '11:00', name: 'Mehmet Kaya', status: 'Beklemede' },
  { time: '14:00', name: 'Zeynep Demir', status: 'Onaylandı' },
  { time: '16:00', name: 'Ahmet Şahin', status: 'Onaylandı' },
]

const availableSlots = [
  '12:00 - 12:30',
  '15:30 - 16:00',
  '17:00 - 17:30',
]

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: 'Ücretsiz',
    period: '',
    description: 'Basit randevu yönetimi ihtiyacı olan bağımsız profesyoneller için.',
    features: ['Aylık 50 randevu', '1 kullanıcı', 'Temel takvim', 'E-posta hatırlatmaları', 'Temel raporlar'],
    popular: false,
    cta: 'Ücretsiz Başla'
  },
  {
    name: 'Pro',
    price: '₺899',
    period: '/ay',
    description: 'Klinikler, ekipler ve büyüyen işletmeler için.',
    features: ['Sınırsız randevu', '10 kullanıcı', 'SMS + WhatsApp hatırlatma', 'Gelişmiş analitik', 'Ekip yönetimi', 'AI önerileri', 'Öncelikli destek'],
    popular: true,
    cta: 'Pro Planını Seç'
  },
  {
    name: 'Kurumsal',
    price: 'Özel Fiyat',
    period: '',
    description: 'Çoklu lokasyonlu ekipler ve özel iş akışı ihtiyacı olan organizasyonlar için.',
    features: ['Her şey dahil', 'Sınırsız kullanıcı', 'Özel entegrasyonlar', 'API erişimi', 'Veri taşıma desteği', '7/24 öncelikli destek', 'SLA garantisi'],
    popular: false,
    cta: 'Teklif Al'
  },
]

const trustPoints = [
  { icon: CheckCircle2, text: '14 gün ücretsiz deneme' },
  { icon: CheckCircle2, text: 'İstediğiniz zaman iptal' },
  { icon: Shield, text: 'Güvenli altyapı' },
  { icon: Shield, text: 'KVKK uyumlu veri koruma' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-white via-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[#06142A] leading-[1.15] tracking-tight mb-6">
                İşinizi yöneten{' '}
                <span className="bg-gradient-to-r from-[#12C8AD] to-[#16A9E8] bg-clip-text text-transparent">
                  akıllı asistanınız.
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Asistan, randevu yönetimi, hatırlatmalar, müşteri iletişimi ve ekip organizasyonunu 
                tek bir yapay zeka destekli iş yönetim platformunda bir araya getirir.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link href="/auth/sign-up">
                  <Button 
                    size="lg"
                    className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold text-sm px-7 h-12 rounded-full shadow-lg shadow-[#12C8AD]/25"
                  >
                    Ücretsiz Dene
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gray-200 text-[#06142A] hover:bg-gray-50 font-medium text-sm px-7 h-12 rounded-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Demo İzle
                </Button>
              </div>
            </div>

            {/* Right - Image with floating cards */}
            <div className="relative lg:ml-8">
              <Image
                src="/images/medical-team.jpg"
                alt="Professionals using Asistan"
                width={600}
                height={500}
                className="rounded-3xl object-cover w-full h-[420px] lg:h-[480px] shadow-2xl shadow-gray-200/50"
                priority
              />
              
              {/* Floating Card - Today's Appointments */}
              <div className="absolute -right-2 lg:-right-6 top-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 w-60 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#06142A]">Bugünkü Randevular</span>
                </div>
                <div className="space-y-2.5">
                  {todayAppointments.map((apt, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-mono w-10">{apt.time}</span>
                        <span className="text-[#06142A] font-medium">{apt.name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        apt.status === 'Onaylandı' ? 'text-[#12C8AD] bg-[#12C8AD]/10' : 'text-amber-600 bg-amber-50'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card - Approval Rate */}
              <div className="absolute -left-2 lg:-left-6 bottom-36 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 w-44 border border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Onay Oranı</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-[#12C8AD]">%98</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[98%] bg-gradient-to-r from-[#12C8AD] to-[#16A9E8] rounded-full" />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Bu hafta</span>
              </div>

              {/* Floating Card - Available Slots */}
              <div className="absolute right-4 lg:right-8 bottom-4 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 w-44 border border-gray-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#12C8AD]/10 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-[#12C8AD]" />
                  </div>
                  <span className="text-xs font-semibold text-[#06142A]">Boş Saatler</span>
                </div>
                <div className="space-y-1.5">
                  {availableSlots.map((slot, i) => (
                    <div key={i} className="text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg font-medium">
                      {slot}
                    </div>
                  ))}
                </div>
                <a href="#" className="text-[10px] text-[#12C8AD] font-semibold mt-2 inline-block hover:underline">
                  Tümünü Gör
                </a>
              </div>

              {/* Floating Card - Reminder Status */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 bg-white rounded-xl shadow-lg shadow-gray-200/50 px-4 py-2.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#12C8AD]/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-[#12C8AD]" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#06142A] block">Hatırlatma Gönderildi</span>
                    <span className="text-[10px] text-gray-500">3 hasta için otomatik SMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8 lg:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12C8AD]/10 to-[#16A9E8]/10 flex items-center justify-center">
                    <stat.icon className="w-7 h-7 text-[#12C8AD]" />
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-bold text-[#06142A]">{stat.value}</div>
                    <div className="text-sm text-gray-500 leading-tight">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Asistan Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Neden Asistan?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profesyoneller için tasarlanmış, yapay zeka destekli iş yönetim platformu.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="bg-white border-0 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12C8AD]/10 to-[#16A9E8]/10 flex items-center justify-center mb-5">
                    <feature.icon className="w-7 h-7 text-[#12C8AD]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#06142A] mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge className="bg-[#12C8AD]/10 text-[#12C8AD] border-0 mb-4 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Destekli
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-6">
                Asistan, iş akışınızı takip eder ve akıllı öneriler sunar.
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Yapay zeka destekli asistanınız, randevularınızı analiz eder, boşlukları tespit eder 
                ve işinizi daha verimli yönetmeniz için akıllı önerilerde bulunur.
              </p>
              <Link href="/auth/sign-up">
                <Button className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold rounded-full px-6">
                  AI Özelliklerini Keşfet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {aiSuggestions.map((suggestion, i) => (
                <Card key={i} className="bg-white border border-gray-100 shadow-lg shadow-gray-100/50 rounded-2xl hover:scale-[1.02] transition-transform">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl ${suggestion.color} flex items-center justify-center mb-3`}>
                      <suggestion.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-[#06142A]">{suggestion.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Her sektöre uygun çözümler
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sağlıktan güzelliğe, hukuktan danışmanlığa - her profesyonel için özelleştirilmiş çözümler.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, i) => (
              <Card 
                key={i} 
                className={`group overflow-hidden border-0 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all duration-300 rounded-2xl ${
                  industry.featured ? 'ring-2 ring-[#12C8AD] lg:scale-105' : ''
                }`}
              >
                {industry.featured && (
                  <div className="bg-[#12C8AD] text-white text-xs font-semibold text-center py-1.5">
                    Şimdi Aktif
                  </div>
                )}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={`absolute bottom-3 left-3 w-10 h-10 ${industry.color} rounded-xl flex items-center justify-center`}>
                    <industry.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-base font-bold text-[#06142A] mb-2">{industry.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{industry.description}</p>
                  <a href="#" className="inline-flex items-center text-sm font-semibold text-[#12C8AD] hover:text-[#10b89e]">
                    Detayları İncele
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="fiyatlandirma" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Her profesyonel için sade fiyatlandırma.
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              İhtiyacınıza göre esnek planlar. Tek başınıza, kliniğinizde ya da büyüyen ekibinizle - 
              Asistan her aşamada yanınızda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <Card 
                key={i} 
                className={`relative border-0 rounded-2xl ${
                  plan.popular 
                    ? 'shadow-2xl shadow-[#12C8AD]/20 ring-2 ring-[#12C8AD] lg:scale-105 bg-white' 
                    : 'shadow-lg shadow-gray-100/50 bg-white'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#12C8AD] text-white text-xs px-4 py-1 border-0">
                    En Popüler
                  </Badge>
                )}
                <CardContent className="p-7">
                  <h3 className="text-xl font-bold text-[#06142A] mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5 min-h-[40px]">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#06142A]">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-7">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="w-5 h-5 text-[#12C8AD] flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full rounded-full h-12 font-semibold ${
                      plan.popular 
                        ? 'bg-[#12C8AD] hover:bg-[#10b89e] text-white shadow-lg shadow-[#12C8AD]/25' 
                        : 'bg-[#06142A] hover:bg-[#0a1f3d] text-white'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Trust Points */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {trustPoints.map((point, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <point.icon className="w-5 h-5 text-[#12C8AD]" />
                {point.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner Section */}
      <section className="py-20 bg-[#06142A]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">
            İşinizi Asistan ile daha kolay yönetin.
          </h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg">
            Zamandan tasarruf edin, kaçırılan randevuları azaltın ve günlük iş akışınızı 
            tek bir akıllı platformdan yönetin.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg"
                className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold px-8 h-13 rounded-full shadow-lg shadow-[#12C8AD]/25"
              >
                Ücretsiz Dene
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-white/10 font-semibold px-8 h-13 rounded-full"
            >
              Demo Talep Et
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
