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
  CheckCircle2,
  Lock,
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  Layers
} from 'lucide-react'

// Trust/Value cards instead of fake metrics
const trustValueCards = [
  { 
    icon: Layers, 
    title: 'Tek panel', 
    description: 'Randevu, müşteri ve ekip yönetimi'
  },
  { 
    icon: Brain, 
    title: 'AI destekli', 
    description: 'Akıllı öneriler ve otomatik takip'
  },
  { 
    icon: Briefcase, 
    title: 'Çok sektörlü', 
    description: 'Sağlık, güzellik, hukuk ve hizmet sektörü'
  },
  { 
    icon: Shield, 
    title: 'Güvenli altyapı', 
    description: 'Rol bazlı erişim ve veri gizliliği'
  },
]

// Asistan nedir? cards
const asistanNedirCards = [
  {
    icon: Calendar,
    title: 'Randevuları düzenler',
    description: 'Tüm randevularınızı tek takvimde yönetin, çakışmaları önleyin.'
  },
  {
    icon: MessageSquare,
    title: 'Müşteri iletişimini toplar',
    description: 'Mesajlar, notlar ve geçmiş tek müşteri kartında.'
  },
  {
    icon: Zap,
    title: 'İş akışını otomatikleştirir',
    description: 'Hatırlatmalar, onaylar ve takipler otomatik çalışır.'
  },
]

// Product modules for "Asistan programı neler sunar?"
const productModules = [
  {
    icon: Calendar,
    title: 'Akıllı Takvim',
    description: 'Tüm randevularınızı tek yerden yönetin, çakışmaları önleyin.',
  },
  {
    icon: UserCheck,
    title: 'Online Randevu Yönetimi',
    description: 'Müşterileriniz online randevu alsın, siz onaylayın.',
  },
  {
    icon: Bell,
    title: 'Otomatik Hatırlatmalar',
    description: 'SMS, e-posta ve WhatsApp ile otomatik bildirimler.',
  },
  {
    icon: FileText,
    title: 'Müşteri Kartları',
    description: 'Her müşterinin geçmişi, notları ve iletişimi tek yerde.',
  },
  {
    icon: Users,
    title: 'Ekip & Sekreter Yönetimi',
    description: 'Ekibinizi organize edin, görevleri paylaşıp takip edin.',
  },
  {
    icon: Brain,
    title: 'AI Asistan Önerileri',
    description: 'Yapay zeka ile akıllı öneriler ve verimlilik içgörüleri.',
  },
  {
    icon: BarChart3,
    title: 'Raporlama',
    description: 'Performans, doluluk ve gelir raporları tek bakışta.',
  },
  {
    icon: Settings,
    title: 'Güvenlik & Yetkilendirme',
    description: 'Rol bazlı erişim kontrolü ve veri gizliliği.',
  },
]

// AI suggestions for the feed panel
const aiSuggestions = [
  { icon: Clock, text: 'Bugün 2 boş saatiniz var.', color: 'bg-[#12C8AD]/10 text-[#12C8AD]' },
  { icon: Bell, text: '3 randevu onay bekliyor.', color: 'bg-amber-500/10 text-amber-600' },
  { icon: TrendingUp, text: 'Cuma günleri talebiniz daha yüksek.', color: 'bg-[#16A9E8]/10 text-[#16A9E8]' },
  { icon: MessageSquare, text: 'Bekleyen müşteriye boş saat önerilebilir.', color: 'bg-violet-500/10 text-violet-600' },
  { icon: CheckCircle2, text: 'Bu hafta iptal oranı geçen haftaya göre azaldı.', color: 'bg-green-500/10 text-green-600' },
]

const industries = [
  {
    title: 'Asistan Health',
    description: 'Doktorlar, klinikler, diş hekimleri, psikologlar ve sağlık profesyonelleri için.',
    icon: Stethoscope,
    color: 'bg-[#12C8AD]',
    featured: true,
  },
  {
    title: 'Asistan Beauty',
    description: 'Güzellik merkezleri, kuaförler, berberler ve wellness profesyonelleri için.',
    icon: Scissors,
    color: 'bg-pink-500',
    featured: false,
  },
  {
    title: 'Asistan Legal',
    description: 'Avukatlar, danışmanlar ve hukuk büroları için.',
    icon: Scale,
    color: 'bg-amber-500',
    featured: false,
  },
  {
    title: 'Asistan Pro',
    description: 'Teknisyenler, servis sağlayıcılar, serbest çalışanlar ve saha ekipleri için.',
    icon: Briefcase,
    color: 'bg-violet-500',
    featured: false,
  },
]

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: 'Ücretsiz',
    period: '',
    description: 'Platformu keşfetmek isteyen bağımsız profesyoneller için.',
    features: ['Aylık 30 randevu', '1 kullanıcı', 'Temel takvim', 'E-posta hatırlatmaları', 'Temel raporlar'],
    popular: false,
    cta: 'Ücretsiz Başla'
  },
  {
    name: 'Pro',
    price: 'Erken Erişim',
    period: '',
    description: 'İlk kullanıcılar için özel fiyatlandırma.',
    features: ['Sınırsız randevu', 'Çoklu kullanıcı', 'SMS + WhatsApp hatırlatma', 'Gelişmiş analitik', 'Ekip yönetimi', 'AI önerileri', 'Öncelikli destek'],
    popular: true,
    cta: 'Beni Bilgilendir'
  },
  {
    name: 'Kurumsal',
    price: 'Özel Teklif',
    period: '',
    description: 'Çoklu lokasyonlu ekipler ve özel ihtiyaçlar için.',
    features: ['Her şey dahil', 'Sınırsız kullanıcı', 'Özel entegrasyonlar', 'API erişimi', 'Veri taşıma desteği', '7/24 öncelikli destek'],
    popular: false,
    cta: 'Teklif Al'
  },
]

const trustPoints = [
  { icon: CheckCircle2, text: 'Ücretsiz başlangıç planı' },
  { icon: CheckCircle2, text: 'Kredi kartı gerekmez' },
  { icon: Shield, text: 'KVKK odaklı veri koruma' },
  { icon: Lock, text: 'Güvenli altyapı' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-white via-white to-gray-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
<h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#06142A] leading-[1.1] tracking-tight mb-6">
                  İşinizi kolaylaştıran{' '}
                  <span className="bg-gradient-to-r from-[#12C8AD] to-[#16A9E8] bg-clip-text text-transparent">
                    akıllı asistanız.
                  </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Asistan; randevu yönetimi, müşteri iletişimi, hatırlatmalar, ekip takibi ve 
                günlük iş akışlarını tek panelde birleştiren AI destekli iş yönetim platformudur.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Link href="/auth/sign-up">
                  <Button 
                    size="lg"
                    className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold text-sm px-7 h-12 rounded-full shadow-lg shadow-[#12C8AD]/25 transition-all hover:shadow-xl hover:shadow-[#12C8AD]/30"
                  >
                    Ücretsiz Dene
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-gray-200 text-[#06142A] hover:bg-gray-50 font-medium text-sm px-7 h-12 rounded-full transition-all hover:border-gray-300"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Demo İzle
                </Button>
              </div>

              {/* Trust line */}
              <p className="text-sm text-gray-500">
                KKTC&apos;den başlayarak profesyonellerin dijital iş yönetimini kolaylaştırmak için geliştirildi.
              </p>
            </div>

            {/* Right - Dashboard Mockup */}
            <div className="relative lg:ml-8">
              {/* Background gradient blob */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#12C8AD]/5 via-[#16A9E8]/5 to-[#12C8AD]/5 rounded-[3rem] blur-3xl" />
              
              {/* Main Dashboard */}
              <div className="relative bg-gradient-to-br from-[#06142A] to-[#0a1f3d] rounded-3xl p-5 shadow-2xl shadow-[#06142A]/20">
                <div className="bg-white/95 backdrop-blur rounded-2xl p-4 shadow-inner">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#12C8AD] to-[#16A9E8] flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-[#06142A] text-sm">Asistan Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#12C8AD]" />
                      <span className="text-xs text-gray-500">Canlı</span>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Bugün</div>
                      <div className="text-2xl font-bold text-[#06142A]">12</div>
                      <div className="text-[10px] text-gray-400">Randevu</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-3 border border-amber-100">
                      <div className="text-xs text-gray-500 mb-1">Bekleyen</div>
                      <div className="text-2xl font-bold text-amber-500">3</div>
                      <div className="text-[10px] text-gray-400">Onay</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#12C8AD]/10 to-white rounded-xl p-3 border border-[#12C8AD]/20">
                      <div className="text-xs text-gray-500 mb-1">Bu Hafta</div>
                      <div className="text-2xl font-bold text-[#12C8AD]">47</div>
                      <div className="text-[10px] text-gray-400">Toplam</div>
                    </div>
                  </div>
                  
                  {/* Today's Appointments */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-[#06142A] mb-2">Bugünkü Randevular</div>
                    <div className="space-y-2">
                      {[
                        { time: '09:30', name: 'Müşteri Görüşmesi', status: 'Onaylandı' },
                        { time: '11:00', name: 'Danışmanlık', status: 'Bekliyor' },
                        { time: '14:00', name: 'Takip Randevusu', status: 'Onaylandı' },
                      ].map((apt, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500 w-10">{apt.time}</span>
                            <span className="text-xs font-medium text-[#06142A]">{apt.name}</span>
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

                  {/* AI Suggestion Preview */}
                  <div className="bg-gradient-to-r from-[#12C8AD]/5 to-[#16A9E8]/5 rounded-xl p-3 border border-[#12C8AD]/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#12C8AD]" />
                      <span className="text-[10px] font-semibold text-[#12C8AD]">AI Önerisi</span>
                    </div>
                    <p className="text-xs text-gray-600">Bugün 2 boş saatiniz var. Bekleyen müşteriye önerilebilir.</p>
                  </div>
                </div>
              </div>

              {/* Floating Card - Customer Cards */}
              <div className="absolute -right-2 lg:-right-4 top-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 w-48 border border-gray-100 backdrop-blur">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-[#16A9E8]/10 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-[#16A9E8]" />
                  </div>
                  <span className="text-xs font-semibold text-[#06142A]">Müşteri Kartları</span>
                </div>
                <div className="space-y-2">
                  {['Ayse Y.', 'Mehmet K.', 'Zeynep D.'].map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#12C8AD] to-[#16A9E8] flex items-center justify-center text-[10px] font-semibold text-white">
                        {name.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-600">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card - Reminder Queue */}
              <div className="absolute -left-2 lg:-left-4 bottom-24 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 w-44 border border-gray-100 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-[#12C8AD]/10 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-[#12C8AD]" />
                  </div>
                  <span className="text-xs font-semibold text-[#06142A]">Hatırlatmalar</span>
                </div>
                <div className="text-2xl font-bold text-[#12C8AD] mb-1">5</div>
                <div className="text-[10px] text-gray-500">Otomatik SMS gönderildi</div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[100%] bg-gradient-to-r from-[#12C8AD] to-[#16A9E8] rounded-full" />
                </div>
              </div>

              {/* Floating Card - Performance Summary */}
              <div className="absolute right-4 lg:right-8 -bottom-2 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 w-40 border border-gray-100 backdrop-blur">
                <span className="text-xs text-gray-500 font-medium">Onay Oranı</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#12C8AD]">%94</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-gradient-to-r from-[#12C8AD] to-[#16A9E8] rounded-full" />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Bu ay</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Asistan Nedir Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-6">
              Asistan nedir?
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Asistan, profesyonellerin randevu, müşteri, ekip ve günlük iş akışlarını tek panelden 
              yönetmesini sağlayan AI destekli bir iş yönetim platformudur. Dağınık mesajları, 
              unutulan randevuları ve manuel takipleri tek bir düzenli sisteme taşır.
            </p>
          </div>
          
          {/* Three modern cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {asistanNedirCards.map((card, i) => (
              <Card key={i} className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:border-[#12C8AD]/20 transition-all duration-300 rounded-2xl group">
                <CardContent className="p-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12C8AD]/10 to-[#16A9E8]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <card.icon className="w-7 h-7 text-[#12C8AD]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#06142A] mb-3">{card.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust/Value Cards */}
          <div className="bg-gradient-to-r from-[#06142A] to-[#0a1f3d] rounded-3xl p-8 lg:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
              {trustValueCards.map((card, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <card.icon className="w-7 h-7 text-[#12C8AD]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-400 leading-tight">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Modules Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Asistan programı neler sunar?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profesyoneller için tasarlanmış, yapay zeka destekli iş yönetim modülleri.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {productModules.map((module, i) => (
              <Card key={i} className="bg-white border-0 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#12C8AD]/10 to-[#16A9E8]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <module.icon className="w-6 h-6 text-[#12C8AD]" />
                  </div>
                  <h3 className="text-base font-bold text-[#06142A] mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-[#12C8AD]/10 to-[#16A9E8]/10 text-[#12C8AD] border-0 mb-4 px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                AI Destekli
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-6">
                Sizin yerinize takip eder, size önerir.
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Asistan, günlük iş akışınızı analiz ederek onay bekleyen randevuları, boş saatleri, 
                yoğun günleri ve takip edilmesi gereken müşterileri size bildirir.
              </p>
              <Link href="/auth/sign-up">
                <Button className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold rounded-full px-6 shadow-lg shadow-[#12C8AD]/25 hover:shadow-xl hover:shadow-[#12C8AD]/30 transition-all">
                  AI Özelliklerini Keşfet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            {/* AI Assistant Feed Panel */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#12C8AD]/5 via-[#16A9E8]/5 to-[#12C8AD]/5 rounded-[2rem] blur-2xl" />
              <div className="relative bg-gradient-to-br from-[#06142A] to-[#0a1f3d] rounded-3xl p-6 shadow-2xl shadow-[#06142A]/20">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#12C8AD] to-[#16A9E8] flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm block">AI Asistan</span>
                    <span className="text-xs text-gray-400">Akıllı öneriler</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, i) => (
                    <div key={i} className="bg-white/95 backdrop-blur rounded-xl p-4 hover:scale-[1.02] transition-transform cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg ${suggestion.color} flex items-center justify-center flex-shrink-0`}>
                          <suggestion.icon className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-[#06142A] pt-1.5">{suggestion.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              Sağlıktan güzelliğe, hukuktan danışmanlığa - her profesyonel için özelleştirilebilir çözümler.
            </p>
          </div>
          
          {/* Featured Health + Others Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Featured Asistan Health - Large Card */}
            <Card className="lg:col-span-2 lg:row-span-2 group overflow-hidden border-0 shadow-xl shadow-[#12C8AD]/10 hover:shadow-2xl transition-all duration-300 rounded-3xl ring-2 ring-[#12C8AD]/20">
              <div className="bg-[#12C8AD] text-white text-sm font-semibold text-center py-2">
                Şimdi Aktif - İlk Lansmanlar
              </div>
              <div className="relative h-64 lg:h-80 overflow-hidden bg-gradient-to-br from-[#12C8AD]/10 to-[#16A9E8]/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-[#12C8AD]/20 flex items-center justify-center">
                    <Stethoscope className="w-16 h-16 text-[#12C8AD]" />
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#06142A] mb-3">Asistan Health</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Doktorlar, klinikler, diş hekimleri, psikologlar ve tüm sağlık profesyonelleri için 
                  tasarlanmış özel çözümler. Hasta randevuları, hatırlatmalar ve sağlık kayıtları 
                  tek panelde.
                </p>
                <Link href="/cozumler/saglik">
                  <Button className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold rounded-full px-6">
                    Detayları İncele
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Other Industries - Smaller Cards */}
            {industries.filter(ind => !ind.featured).map((industry, i) => (
              <Card key={i} className="group overflow-hidden border-0 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-all duration-300 rounded-2xl">
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-16 h-16 ${industry.color} rounded-2xl flex items-center justify-center`}>
                      <industry.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-base font-bold text-[#06142A] mb-2">{industry.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{industry.description}</p>
                  <a href="#" className="inline-flex items-center text-sm font-semibold text-[#12C8AD] hover:text-[#10b89e] transition-colors">
                    Yakında
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
                className={`relative border-0 rounded-2xl transition-all duration-300 ${
                  plan.popular 
                    ? 'shadow-2xl shadow-[#12C8AD]/20 ring-2 ring-[#12C8AD] lg:scale-105 bg-white hover:shadow-3xl' 
                    : 'shadow-lg shadow-gray-100/50 bg-white hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#12C8AD] to-[#16A9E8] text-white text-xs px-4 py-1 border-0">
                    Önerilen
                  </Badge>
                )}
                <CardContent className="p-7">
                  <h3 className="text-xl font-bold text-[#06142A] mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5 min-h-[40px]">{plan.description}</p>
                  <div className="mb-6">
                    <span className={`text-3xl font-bold ${plan.popular ? 'text-[#12C8AD]' : 'text-[#06142A]'}`}>{plan.price}</span>
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
                    className={`w-full rounded-full h-12 font-semibold transition-all ${
                      plan.popular 
                        ? 'bg-[#12C8AD] hover:bg-[#10b89e] text-white shadow-lg shadow-[#12C8AD]/25 hover:shadow-xl hover:shadow-[#12C8AD]/30' 
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

      <Footer />
    </div>
  )
}
