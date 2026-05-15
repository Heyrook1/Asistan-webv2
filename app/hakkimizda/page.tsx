"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Shield, Users, Lightbulb, Heart, Target, Calendar, Clock, TrendingUp, Star, Zap } from "lucide-react"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

const stats = [
  { value: "500+", label: "Profesyonel", sublabel: "Bize güveniyor", icon: Users },
  { value: "100.000+", label: "Randevu", sublabel: "Yönetildi", icon: Calendar },
  { value: "%98", label: "Müşteri", sublabel: "Memnuniyeti", icon: TrendingUp },
  { value: "10.000+", label: "Saat", sublabel: "Kazandırıldı", icon: Clock }
]

const values = [
  {
    icon: Shield,
    title: "Güvenlik",
    description: "Verilerinizin güvenliği bizim önceliğimizdir. KVKK uyumlu altyapı ve şifreli veri saklama.",
    color: "#12C8AD"
  },
  {
    icon: Users,
    title: "Kullanıcı Odaklılık",
    description: "İhtiyaçlarınızı dinler, sizin için geliştiriz. Kullanıcı geri bildirimleri ürün yol haritamızı şekillendirir.",
    color: "#16A9E8"
  },
  {
    icon: Lightbulb,
    title: "Yenilikçilik",
    description: "Teknolojiyi yakından takip eder, sürekli daha iyisini üretiriz. AI destekli özelliklerle sektöre yön veririz.",
    color: "#F59E0B"
  },
  {
    icon: Heart,
    title: "Şeffaflık",
    description: "Açık iletişim ve dürüst fiyatlandırma ile güven inşa ederiz. Gizli maliyet yoktur.",
    color: "#EF4444"
  }
]

const timeline = [
  { year: "2022", title: "Kuruluş", description: "Asistan fikri doğdu ve ilk prototip geliştirildi." },
  { year: "2023", title: "İlk Müşteriler", description: "Beta sürümü ile ilk 50 klinik Asistan kullanmaya başladı." },
  { year: "2024", title: "Büyüme", description: "500+ profesyonel ve 100.000+ randevu yönetim sistemine ulaşıldı." },
  { year: "2025", title: "AI Entegrasyonu", description: "Yapay zeka destekli öneriler ve akıllı otomasyon özellikleri eklendi." }
]

const team = [
  { name: "Ahmet Yılmaz", role: "Kurucu & CEO", image: "/images/team-1.jpg" },
  { name: "Elif Demir", role: "Ürün Direktörü", image: "/images/team-2.jpg" },
  { name: "Mehmet Kaya", role: "Teknik Lider", image: "/images/team-3.jpg" },
  { name: "Zeynep Şahin", role: "Müşteri Başarısı", image: "/images/team-4.jpg" }
]

export default function AboutPage() {
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
                <span className="text-xs font-semibold text-[#12C8AD] uppercase tracking-wider">Hakkımızda</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06142A] leading-tight">
                İşinizi kolaylaştırmak için{" "}
                <span className="text-[#12C8AD]">buradayız.</span>
              </h1>
              
              <p className="text-lg text-[#475569] max-w-xl leading-relaxed">
                Asistan, profesyonellerin işlerini daha verimli yönetmeleri için tasarlandı. Randevu yönetiminden ekip koordinasyonuna, yapay zeka destekli önerilerden müşteri iletişimine kadar tüm süreçlerinizi tek platformda bir araya getiriyoruz.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#12C8AD] hover:bg-[#0EA894] text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-[#12C8AD]/25"
                >
                  Bize Ulaşın
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-[#E2E8F0] text-[#06142A] px-8 py-6 text-base rounded-xl hover:bg-[#F8FAFC]"
                >
                  <Play className="w-5 h-5 mr-2 fill-[#06142A]" />
                  Hikayemizi İzle
                </Button>
              </div>
            </div>
            
            {/* Right - Image */}
            <div className="relative">
              <Image
                src="/images/medical-team.jpg"
                alt="Asistan Ekibi"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-5 border border-[#E2E8F0]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#12C8AD]/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-[#12C8AD]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#06142A]">Misyonumuz</div>
                    <div className="text-xs text-[#64748B]">Profesyonellere zaman kazandırmak</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-lg border border-[#E2E8F0] p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#12C8AD]/10 rounded-xl mb-4">
                    <stat.icon className="w-6 h-6 text-[#12C8AD]" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-[#06142A]">{stat.value}</div>
                  <div className="text-sm text-[#64748B] mt-1">
                    {stat.label}<br />{stat.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#06142A] rounded-2xl p-8 md:p-10">
              <div className="w-12 h-12 rounded-xl bg-[#12C8AD]/20 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[#12C8AD]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Vizyonumuz</h3>
              <p className="text-[#94A3B8] leading-relaxed">
                Profesyonellerin zamanını en değerli kaynak olarak gören, yapay zeka destekli çözümlerle iş süreçlerini dönüştüren küresel bir platform olmak. Her profesyonelin yanında akıllı bir asistan olmasını sağlamak.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#12C8AD] to-[#16A9E8] rounded-2xl p-8 md:p-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Misyonumuz</h3>
              <p className="text-white/90 leading-relaxed">
                Profesyonellerin randevu yönetiminden müşteri iletişimine, ekip koordinasyonundan raporlamaya kadar tüm operasyonel süreçlerini basitleştirmek ve onlara işlerini büyütmeleri için zaman kazandırmak.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Değerlerimiz
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              Bizi yönlendiren temel ilkeler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-lg transition-shadow"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${value.color}15` }}
                >
                  <value.icon className="w-6 h-6" style={{ color: value.color }} />
                </div>
                <h3 className="text-lg font-semibold text-[#06142A] mb-2">{value.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Yolculuğumuz
            </h2>
            <p className="text-lg text-[#64748B]">
              Asistan'ın hikayesi
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-[#E2E8F0]" />
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-lg transition-shadow">
                      <div className="text-[#12C8AD] font-bold text-lg mb-2">{item.year}</div>
                      <h3 className="font-semibold text-[#06142A] mb-1">{item.title}</h3>
                      <p className="text-sm text-[#64748B]">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Center Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#12C8AD] rounded-full border-4 border-white shadow" />
                  
                  <div className="w-5/12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
