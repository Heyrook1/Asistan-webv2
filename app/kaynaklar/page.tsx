"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { ArrowRight, Play, FileText, BookOpen, MessageSquare, Clock, TrendingUp, CheckCircle2, Star, Sparkles } from "lucide-react"

const featuredArticle = {
  tag: "Öne Çıkan İçerik",
  category: "REHBER",
  title: "Dijital randevu yönetimiyle kliniğinizde verimliliği artırın",
  description: "Dijital dönüşümün sağlık sektörüne etkilerini, randevu yönetimini kolaylaştıran yöntemleri ve en iyi uygulamaları keşfedin.",
  image: "/images/industry-health.jpg",
  cta: "Yazıyı Oku"
}

const articles = [
  {
    type: "BLOG",
    icon: FileText,
    title: "Randevu yönetiminde 5 yaygın hata ve çözümleri",
    description: "Kliniklerde sık yapılan hataları ve bu hatalardan kaçınmanın yollarını öğrenin.",
    time: "5 dk okuma"
  },
  {
    type: "REHBERLER",
    icon: BookOpen,
    title: "Hasta iletişimini güçlendiren en iyi uygulamalar",
    description: "Hasta memnuniyetini artıran iletişim stratejileri ve örnek senaryolar.",
    time: "8 dk okuma"
  },
  {
    type: "SIK SORULAN SORULAR",
    icon: MessageSquare,
    title: "Asistan hakkında merak edilen tüm sorular",
    description: "Ürünle ilgili en çok sorulan soruların yanıtlarını bulabilirsiniz.",
    time: "3 dk okuma"
  },
  {
    type: "WEBİNAR",
    icon: Play,
    title: "Uzmanlarla randevu yönetimi üzerine canlı oturumlar",
    description: "Alanında uzman konuklarla gerçekleştirilen webinar kaydları ve özetler.",
    time: "45 dk izleme"
  },
  {
    type: "BAŞARI HİKAYELERİ",
    icon: Star,
    title: "Asistan kullanan kliniklerin başarı hikayeleri",
    description: "Gerçek kullanıcıların deneyimlerini ve elde ettikleri sonuçları keşfedin.",
    time: "7 dk okuma"
  },
  {
    type: "ÜRÜN GÜNCELLEMELERİ",
    icon: Sparkles,
    title: "Yeni özellikler ve ürün güncellemeleri",
    description: "Asistan'a eklenen güncellikler ve iyileştirmeleri ilk siz öğrenin.",
    time: "4 dk okuma"
  }
]

const categories = [
  { name: "Tümü", count: 24, active: true },
  { name: "Blog", count: 12, active: false },
  { name: "Rehberler", count: 5, active: false },
  { name: "Webinarlar", count: 4, active: false },
  { name: "Başarı Hikayeleri", count: 3, active: false }
]

export default function ResourcesPage() {
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
                <span className="text-xs font-semibold text-[#12C8AD] uppercase tracking-wider">Kaynaklar</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06142A] leading-tight">
                Bilgi merkezi,{" "}
                <span className="text-[#12C8AD]">rehberler ve güncel içerikler.</span>
              </h1>
              
              <p className="text-lg text-[#475569] max-w-xl leading-relaxed">
                Randevu yönetimi, hasta iletişimi ve ekip organizasyonu konularında uzman içeriklerle işinizi daha verimli hale getirin. Pratik rehberler, ipuçları ve güncel gelişmeler burada.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-[#12C8AD] hover:bg-[#0EA894] text-white px-8 py-6 text-base rounded-xl shadow-lg shadow-[#12C8AD]/25"
                >
                  İçerikleri Keşfet
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
            
            {/* Right - Featured Article Card */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#12C8AD] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {featuredArticle.tag}
                  </span>
                </div>
                <div className="relative h-48">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-[#12C8AD] font-semibold mb-2">{featuredArticle.category}</div>
                  <h3 className="text-xl font-bold text-[#06142A] mb-3">{featuredArticle.title}</h3>
                  <p className="text-sm text-[#64748B] mb-4 leading-relaxed">{featuredArticle.description}</p>
                  <Button variant="outline" className="border-[#12C8AD] text-[#12C8AD] hover:bg-[#12C8AD]/5">
                    {featuredArticle.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] mb-1">Randevu Başarı</div>
                <div className="text-2xl font-bold text-[#12C8AD]">+%32</div>
              </div>
              
              <div className="absolute bottom-20 -left-4 bg-white rounded-xl shadow-lg p-4 border border-[#E2E8F0]">
                <div className="text-xs text-[#64748B] mb-1">Onay Oranı</div>
                <div className="text-2xl font-bold text-[#16A9E8]">%98</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Content Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category.active
                    ? 'bg-[#12C8AD] text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
          
          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-lg hover:border-[#12C8AD]/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#12C8AD]/10 flex items-center justify-center">
                    <article.icon className="w-5 h-5 text-[#12C8AD]" />
                  </div>
                  <span className="text-xs font-semibold text-[#12C8AD] uppercase tracking-wider">
                    {article.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-[#06142A] mb-2 group-hover:text-[#12C8AD] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-[#64748B] mb-4 leading-relaxed">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {article.time}
                  </span>
                  <span className="text-sm font-medium text-[#12C8AD] flex items-center gap-1 group-hover:gap-2 transition-all">
                    Oku
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-[#E2E8F0] text-[#06142A] px-8 rounded-xl">
              Daha Fazla Göster
            </Button>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E2E8F0] shadow-lg text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#12C8AD]/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-[#12C8AD]" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-[#06142A] mb-4">
              Yeni içerikleri kaçırmayın
            </h2>
            <p className="text-[#64748B] mb-8 max-w-lg mx-auto">
              Randevu yönetimi, hasta iletişimi ve verimlilik konularında en yeni içerikleri e-posta kutunuzda alın.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="E-posta adresiniz" 
                className="flex-1 h-12 rounded-xl border-[#E2E8F0]"
              />
              <Button className="bg-[#12C8AD] hover:bg-[#0EA894] text-white h-12 px-6 rounded-xl">
                Abone Ol
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <p className="text-xs text-[#94A3B8] mt-4">
              E-postanız güvende. İstediğiniz zaman abonelikten çıkabilirsiniz.
            </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
