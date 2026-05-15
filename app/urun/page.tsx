"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play, Calendar, Bell, Users, Brain, Shield, Cloud, CheckCircle2, BarChart3, MessageSquare, CreditCard, FileText, Settings, Clock, Zap, Lock, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

const coreFeatures = [
  {
    icon: Calendar,
    title: "Akıllı Takvim",
    description: "Randevularınızı kolayca yönetin. Çakışmaları önleyin, doluluk oranınızı artırın.",
    details: ["Sürükle-bırak ile randevu yönetimi", "Çoklu takvim görünümü", "Otomatik çakışma kontrolü", "Tekrarlayan randevular"],
    color: "#12C8AD"
  },
  {
    icon: Bell,
    title: "Otomatik Hatırlatmalar",
    description: "SMS, e-posta ve WhatsApp üzerinden müşterilerinize zamanında hatırlatmalar gönderin. İptalleri azaltın.",
    details: ["SMS hatırlatmaları", "E-posta bildirimleri", "WhatsApp entegrasyonu", "Özelleştirilebilir şablonlar"],
    color: "#16A9E8"
  },
  {
    icon: Users,
    title: "Müşteri Kartları",
    description: "Tüm müşteri bilgilerini tek yerde tutun. Geçmiş randevuları ve notları kolayca erişin.",
    details: ["Detaylı müşteri profilleri", "Randevu geçmişi", "Notlar ve etiketler", "Özel alanlar"],
    color: "#12C8AD"
  },
  {
    icon: Settings,
    title: "Sekreter Hesabı",
    description: "Sekreter veya iş ortaklarınızı ekleyin, müşteri yönetimi ve randevuları paylaşın.",
    details: ["Rol bazlı erişim", "Yetki yönetimi", "Aktivite takibi", "Güvenli paylaşım"],
    color: "#16A9E8"
  },
  {
    icon: BarChart3,
    title: "Ekip Yönetimi",
    description: "Çalışanlarınızı ve terapistlerinizi yönetin, performansı takip edin, yetkileri düzenleyin.",
    details: ["Ekip performans raporları", "Görev atama", "Çalışma saatleri", "İzin yönetimi"],
    color: "#12C8AD"
  },
  {
    icon: Brain,
    title: "AI Önerileri",
    description: "AI destekli önerilerle doluluk oranınızı artırın, iptal risklerini azaltın ve gelirinizi optimize edin.",
    details: ["Boş zaman optimizasyonu", "İptal riski tahmini", "Müşteri davranış analizi", "Gelir önerileri"],
    color: "#16A9E8"
  },
]

const additionalFeatures = [
  { icon: CreditCard, title: "Online Ödeme", description: "Stripe ve iyzico entegrasyonu ile güvenli online ödeme" },
  { icon: FileText, title: "Raporlama", description: "Detaylı analitik ve özelleştirilebilir raporlar" },
  { icon: MessageSquare, title: "Mesajlaşma", description: "Müşterilerinizle uygulama içi mesajlaşma" },
  { icon: Smartphone, title: "Mobil Uygulama", description: "iOS ve Android için native mobil uygulama" },
  { icon: Lock, title: "Güvenlik", description: "KVKK uyumlu, şifreli veri depolama" },
  { icon: Zap, title: "API Erişimi", description: "Özel entegrasyonlar için REST API" },
]

const trustBadges = [
  { icon: Shield, text: "KVKK Uyumlu", description: "Güvenlik 45 yıla kadar" },
  { icon: Cloud, text: "Bulut Tabanlı", description: "Her yerden erişim" },
  { icon: Lock, text: "Verileriniz Güvende", description: "Şifreli & yedekli" },
]

export default function ProductPage() {
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
                <span className="text-xs font-semibold text-[#12C8AD] uppercase tracking-wider">Ürün</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06142A] leading-tight">
                İş akışınızı tek{" "}
                <span className="text-[#12C8AD]">platformdan yönetin.</span>
              </h1>
              
              <p className="text-lg text-[#475569] max-w-xl leading-relaxed">
                Randevularınızı düzenleyin, hatırlatmalarla iptalleri azaltın, müşterilerinizle etkili iletişim kurun, ekibinizi yönetin ve AI destekli önerilerle işinizi büyütün.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#12C8AD] hover:bg-[#0EA894] text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-[#12C8AD]/25"
                >
                  Ücretsiz Dene
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
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-[#64748B]">
                    <badge.icon className="w-4 h-4 text-[#12C8AD]" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right - Dashboard Preview */}
            <div className="relative">
              <div className="bg-[#06142A] rounded-2xl shadow-2xl p-6 border border-[#1E3A5F]">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#12C8AD] rounded-xl flex items-center justify-center text-white font-bold">A</div>
                    <div>
                      <div className="text-white font-semibold">asistan</div>
                      <div className="text-[#64748B] text-xs">Takvim</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
                      <Bell className="w-4 h-4 text-[#64748B]" />
                    </div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0A1F3D] rounded-xl p-4">
                    <div className="text-[#64748B] text-xs mb-1">Bugünkü</div>
                    <div className="text-white text-2xl font-bold">24</div>
                  </div>
                  <div className="bg-[#0A1F3D] rounded-xl p-4">
                    <div className="text-[#64748B] text-xs mb-1">Müşteri</div>
                    <div className="text-white text-2xl font-bold">2.846</div>
                  </div>
                  <div className="bg-[#0A1F3D] rounded-xl p-4">
                    <div className="text-[#64748B] text-xs mb-1">Gelir</div>
                    <div className="text-[#12C8AD] text-2xl font-bold">₺125K</div>
                  </div>
                </div>
                
                {/* Calendar Grid Preview */}
                <div className="bg-[#0A1F3D] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Mayıs 2025</span>
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded bg-[#1E3A5F] flex items-center justify-center text-[#64748B] text-xs">&lt;</div>
                      <div className="w-6 h-6 rounded bg-[#1E3A5F] flex items-center justify-center text-[#64748B] text-xs">&gt;</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                      <div key={day} className="text-[#64748B] py-1">{day}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 3
                      const isToday = day === 15
                      const hasAppointment = [5, 8, 12, 15, 18, 22, 25].includes(day)
                      return (
                        <div 
                          key={i} 
                          className={`py-2 rounded-lg text-sm ${
                            day < 1 || day > 31 ? 'text-[#1E3A5F]' :
                            isToday ? 'bg-[#12C8AD] text-white font-semibold' :
                            hasAppointment ? 'bg-[#12C8AD]/20 text-[#12C8AD]' :
                            'text-[#94A3B8]'
                          }`}
                        >
                          {day > 0 && day <= 31 ? day : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#12C8AD]/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#12C8AD]" />
                  </div>
                  <span className="text-sm font-semibold text-[#06142A]">Hatırlatma</span>
                </div>
                <p className="text-xs text-[#64748B]">56 bildirim gönderildi</p>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] mb-1">Gelir Özeti</div>
                <div className="text-xl font-bold text-[#12C8AD]">₺125.430</div>
                <div className="text-xs text-[#12C8AD]">+%18 artış</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Temel Özellikler
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              İşinizi büyütmenize yardımcı olan güçlü araçlar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-xl hover:border-[#12C8AD]/30 transition-all duration-300 group"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold text-[#06142A] mb-3">{feature.title}</h3>
                <p className="text-[#64748B] mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#475569]">
                      <CheckCircle2 className="w-4 h-4 text-[#12C8AD] flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="#" 
                  className="inline-flex items-center text-sm font-medium mt-5 group-hover:text-[#12C8AD] transition-colors"
                  style={{ color: feature.color }}
                >
                  Detayları İncele
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Additional Features */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Daha Fazla Özellik
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              İşinizi bir üst seviyeye taşıyacak ek özellikler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 bg-white rounded-xl p-5 border border-[#E2E8F0] hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#12C8AD]/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-[#12C8AD]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#06142A] mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#64748B]">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
