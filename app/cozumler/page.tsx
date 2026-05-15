"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play, Calendar, Bell, Users, Heart, Sparkles, Scale, Briefcase, CheckCircle2, Clock, Star, MessageSquare, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

const industries = [
  {
    id: "health",
    icon: Heart,
    title: "Asistan Health",
    subtitle: "Sağlık Sektörü",
    description: "Klinik, hastane ve muayenehaneler için randevu ve hasta yönetimi kolaylaştırın.",
    longDescription: "Doktorlar, diş hekimleri, psikologlar, fizyoterapistler ve tüm sağlık profesyonelleri için tasarlandı. Hasta kayıtları, randevu yönetimi, hatırlatmalar ve raporlama tek platformda.",
    image: "/images/industry-health.jpg",
    color: "#12C8AD",
    features: ["Hasta kartları ve geçmişi", "Online randevu alma", "SMS/E-posta hatırlatmaları", "Reçete ve rapor yönetimi", "KVKK uyumlu veri saklama"],
    stats: { users: "200+", appointments: "50.000+", satisfaction: "%99" },
    featured: true
  },
  {
    id: "beauty",
    icon: Sparkles,
    title: "Asistan Beauty",
    subtitle: "Güzellik & Wellness",
    description: "Güzellik merkezleri ve salonlar için randevu, paket ve müşteri yönetimini optimize edin.",
    longDescription: "Kuaförler, güzellik salonları, spa merkezleri ve wellness profesyonelleri için. Paket satışları, üyelik yönetimi ve müşteri sadakat programları.",
    image: "/images/industry-beauty.jpg",
    color: "#E879F9",
    features: ["Hizmet ve paket yönetimi", "Müşteri sadakat programları", "Online rezervasyon", "Personel performans takibi", "Kampanya yönetimi"],
    stats: { users: "150+", appointments: "30.000+", satisfaction: "%98" },
    featured: false
  },
  {
    id: "legal",
    icon: Scale,
    title: "Asistan Legal",
    subtitle: "Hukuk Sektörü",
    description: "Hukuk büroları için dava, görüşme ve müvekkil yönetimini düzenli hale getirin.",
    longDescription: "Avukatlar, hukuk danışmanları ve hukuk büroları için. Müvekkil dosyaları, duruşma takvimleri, randevu yönetimi ve faturalandırma.",
    image: "/images/industry-legal.jpg",
    color: "#F59E0B",
    features: ["Müvekkil dosya yönetimi", "Duruşma takvimi", "Randevu ve görüşme takibi", "Saat bazlı faturalandırma", "Belge yönetimi"],
    stats: { users: "80+", appointments: "15.000+", satisfaction: "%97" },
    featured: false
  },
  {
    id: "pro",
    icon: Briefcase,
    title: "Asistan Pro",
    subtitle: "Profesyonel Hizmetler",
    description: "Danışmanlar ve hizmet profesyonelleri için esnek randevu çözümleri sunun.",
    longDescription: "Danışmanlar, koçlar, eğitmenler, freelancer'lar ve tüm hizmet profesyonelleri için. Esnek çalışma saatleri, online görüşmeler ve proje yönetimi.",
    image: "/images/industry-pro.jpg",
    color: "#8B5CF6",
    features: ["Esnek çalışma saatleri", "Online görüşme entegrasyonu", "Proje bazlı faturalandırma", "Müşteri portal", "Takvim senkronizasyonu"],
    stats: { users: "100+", appointments: "20.000+", satisfaction: "%98" },
    featured: false
  }
]

const commonFeatures = [
  {
    icon: Calendar,
    title: "Randevu Yönetimi",
    description: "Akıllı takvim ile çakışmaları önleyin, randevularınızı kolayca yönetin."
  },
  {
    icon: Bell,
    title: "Hatırlatmalar",
    description: "Otomatik SMS, e-posta ve WhatsApp hatırlatmaları ile no-show oranını azaltın."
  },
  {
    icon: Users,
    title: "Ekip Takibi",
    description: "Ekip performansını izleyin, görevleri atayın ve süreçleri verimli yönetin."
  },
  {
    icon: Star,
    title: "Müşteri Deneyimi",
    description: "Kişiselleştirilmiş iletişim ve hızlı hizmetle müşteri memnuniyetini artırın."
  }
]

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDFA] via-white to-[#F0F9FF] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#12C8AD]/10 rounded-full">
                <span className="text-xs font-semibold text-[#12C8AD] uppercase tracking-wider">Çözümler</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06142A] leading-tight">
                Her sektör için uyarlanmış{" "}
                <span className="text-[#12C8AD]">akıllı çözümler.</span>
              </h1>
              
              <p className="text-lg text-[#475569] max-w-xl leading-relaxed">
                Asistan, farklı sektörlerin ihtiyaçlarına göre özelleştirilmiş iş akışları ve akıllı otomasyonlarla profesyonellerin işlerini kolaylaştırır. Daha verimli süreçler, daha mutlu müşteriler, daha güçlü sonuçlar.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#12C8AD] hover:bg-[#0EA894] text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-[#12C8AD]/25"
                >
                  Çözümleri Keşfedin
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-[#E2E8F0] text-[#06142A] px-8 py-6 text-base rounded-xl hover:bg-[#F8FAFC]"
                >
                  <Play className="w-5 h-5 mr-2 fill-[#06142A]" />
                  Demo İzle
                </Button>
              </div>
            </div>
            
            {/* Right - Floating UI Elements */}
            <div className="relative h-[500px]">
              {/* Calendar Widget */}
              <div className="absolute top-0 left-0 bg-white rounded-2xl shadow-xl p-5 border border-[#E2E8F0] w-64">
                <div className="text-sm font-semibold text-[#06142A] mb-3">Randevu Takvimi</div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                    <div key={day} className="text-[#94A3B8] py-1">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {[10, 11, 12, 13, 14, 15, 16].map((day) => (
                    <div 
                      key={day} 
                      className={`py-2 rounded-lg ${
                        day === 13 ? 'bg-[#12C8AD] text-white font-semibold' : 'text-[#475569]'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Approval Rate */}
              <div className="absolute top-4 right-0 bg-white rounded-2xl shadow-xl p-5 border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] mb-1">Onay Oranı</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#12C8AD]">%98</span>
                  <span className="text-xs text-[#12C8AD]">+%12 artış</span>
                </div>
              </div>
              
              {/* Satisfaction Rate */}
              <div className="absolute top-32 right-4 bg-white rounded-2xl shadow-xl p-5 border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] mb-1">Müşteri Memnuniyeti</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#16A9E8]">%98</span>
                  <span className="text-xs text-[#16A9E8]">+%10 artış</span>
                </div>
              </div>
              
              {/* Chart */}
              <div className="absolute bottom-24 left-4 bg-white rounded-2xl shadow-xl p-5 border border-[#E2E8F0] w-48">
                <div className="text-xs text-[#64748B] mb-3">Gelir Analizi</div>
                <div className="flex items-end gap-1 h-20">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-[#12C8AD] to-[#16A9E8] rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="text-right mt-2 text-xs text-[#64748B]">Bu Ay</div>
              </div>
              
              {/* Notification */}
              <div className="absolute bottom-4 right-0 bg-white rounded-2xl shadow-xl p-4 border border-[#E2E8F0] w-56">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#12C8AD]/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#12C8AD]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#06142A]">Otomatik Hatırlatma</div>
                    <div className="text-xs text-[#64748B]">Ayşe Yılmaz - Yarın 09:30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Industry Solutions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Sektörünüze Özel Çözümler
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Her sektörün kendine özgü ihtiyaçları için tasarlanmış özelleştirilmiş çözümler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry) => (
              <div 
                key={industry.id}
                className={`group rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                  industry.featured 
                    ? 'border-[#12C8AD] shadow-lg shadow-[#12C8AD]/10' 
                    : 'border-[#E2E8F0] hover:border-[#12C8AD]/30'
                }`}
              >
                {industry.featured && (
                  <div className="bg-[#12C8AD] text-white text-xs font-semibold text-center py-1.5">
                    En Popüler
                  </div>
                )}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: industry.color }}
                    >
                      <industry.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <div className="text-xs text-[#64748B] mb-1">{industry.subtitle}</div>
                  <h3 className="text-lg font-semibold text-[#06142A] mb-2">{industry.title}</h3>
                  <p className="text-sm text-[#64748B] mb-4 leading-relaxed">{industry.description}</p>
                  <Link 
                    href={`/cozumler/${industry.id}`}
                    className="inline-flex items-center text-sm font-medium"
                    style={{ color: industry.color }}
                  >
                    Detayları İncele
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Common Features */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Tüm Sektörlerde Ortak Özellikler
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Hangi sektörde olursanız olun, bu temel özellikler her zaman yanınızda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commonFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#12C8AD]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#12C8AD]" />
                </div>
                <h3 className="text-lg font-semibold text-[#06142A] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#06142A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0A1F3D] to-[#06142A] rounded-3xl p-8 md:p-12 border border-[#1E3A5F]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Sektörünüze uygun çözümü keşfedin
                </h2>
                <p className="text-[#94A3B8]">
                  İşiniz için en doğru çözümü birlikte belirleyelim.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#12C8AD] hover:bg-[#0EA894] text-white px-8 rounded-xl"
                >
                  Bizimle İletişime Geçin
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
