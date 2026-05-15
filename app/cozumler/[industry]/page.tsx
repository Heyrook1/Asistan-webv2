"use client"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Calendar, Bell, Users, Heart, Sparkles, Scale, Briefcase, CheckCircle2, Clock, Star, MessageSquare, BarChart3, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

const industriesData: Record<string, {
  id: string
  icon: typeof Heart
  title: string
  subtitle: string
  description: string
  longDescription: string
  color: string
  features: string[]
  benefits: { icon: typeof CheckCircle2; title: string; description: string }[]
  useCases: string[]
  stats: { label: string; value: string }[]
}> = {
  health: {
    id: "health",
    icon: Heart,
    title: "Asistan Health",
    subtitle: "Sağlık Sektörü",
    description: "Klinik, hastane ve muayenehaneler için randevu ve hasta yönetimi.",
    longDescription: "Doktorlar, diş hekimleri, psikologlar, fizyoterapistler ve tüm sağlık profesyonelleri için tasarlandı. Hasta kayıtları, randevu yönetimi, hatırlatmalar ve raporlama tek platformda. KVKK uyumlu altyapı ile hasta verileriniz güvende.",
    color: "#12C8AD",
    features: [
      "Hasta kartları ve tıbbi geçmiş",
      "Online randevu alma sistemi",
      "SMS/E-posta/WhatsApp hatırlatmaları",
      "Reçete ve rapor yönetimi",
      "KVKK uyumlu veri saklama",
      "Çoklu doktor ve klinik desteği",
      "Hasta portal erişimi",
      "Sigorta entegrasyonları"
    ],
    benefits: [
      { icon: Clock, title: "Zaman Tasarrufu", description: "Günlük ortalama 2 saat idari iş yükünden kurtulun." },
      { icon: CheckCircle2, title: "Azalan No-Show", description: "Otomatik hatırlatmalar ile randevu iptalleri %70 azalır." },
      { icon: Shield, title: "Veri Güvenliği", description: "KVKK uyumlu altyapı ile hasta verileriniz güvende." },
      { icon: BarChart3, title: "Detaylı Raporlar", description: "Klinik performansınızı anlık takip edin." }
    ],
    useCases: [
      "Özel muayenehaneler",
      "Poliklinikler ve klinikler",
      "Diş hekimliği merkezleri",
      "Psikoloji ve terapi merkezleri",
      "Fizyoterapi merkezleri",
      "Estetik ve güzellik klinikleri"
    ],
    stats: [
      { label: "Aktif Kullanıcı", value: "200+" },
      { label: "Yönetilen Randevu", value: "50.000+" },
      { label: "Müşteri Memnuniyeti", value: "%99" }
    ]
  },
  beauty: {
    id: "beauty",
    icon: Sparkles,
    title: "Asistan Beauty",
    subtitle: "Güzellik & Wellness",
    description: "Güzellik merkezleri ve salonlar için randevu, paket ve müşteri yönetimi.",
    longDescription: "Kuaförler, güzellik salonları, spa merkezleri ve wellness profesyonelleri için özel olarak tasarlandı. Paket satışları, üyelik yönetimi, müşteri sadakat programları ve personel performans takibi tek platformda.",
    color: "#E879F9",
    features: [
      "Hizmet ve paket yönetimi",
      "Müşteri sadakat programları",
      "Online rezervasyon sistemi",
      "Personel performans takibi",
      "Kampanya ve indirim yönetimi",
      "Ürün stok takibi",
      "Kasa ve ödeme yönetimi",
      "Müşteri fotoğraf arşivi"
    ],
    benefits: [
      { icon: Users, title: "Müşteri Sadakati", description: "Sadakat programları ile tekrar ziyaret oranını artırın." },
      { icon: Zap, title: "Hızlı Rezervasyon", description: "Online randevu ile 7/24 rezervasyon alın." },
      { icon: BarChart3, title: "Performans Analizi", description: "Personel bazında gelir ve verimlilik takibi." },
      { icon: Star, title: "Müşteri Deneyimi", description: "Kişiselleştirilmiş hizmet önerileri sunun." }
    ],
    useCases: [
      "Kuaför ve berber salonları",
      "Güzellik merkezleri",
      "Spa ve wellness merkezleri",
      "Nail art stüdyoları",
      "Cilt bakım merkezleri",
      "Masaj salonları"
    ],
    stats: [
      { label: "Aktif Kullanıcı", value: "150+" },
      { label: "Yönetilen Randevu", value: "30.000+" },
      { label: "Müşteri Memnuniyeti", value: "%98" }
    ]
  },
  legal: {
    id: "legal",
    icon: Scale,
    title: "Asistan Legal",
    subtitle: "Hukuk Sektörü",
    description: "Hukuk büroları için dava, görüşme ve müvekkil yönetimi.",
    longDescription: "Avukatlar, hukuk danışmanları ve hukuk büroları için özel olarak tasarlandı. Müvekkil dosyaları, duruşma takvimleri, randevu yönetimi ve saat bazlı faturalandırma tek platformda.",
    color: "#F59E0B",
    features: [
      "Müvekkil dosya yönetimi",
      "Duruşma ve icra takvimi",
      "Randevu ve görüşme takibi",
      "Saat bazlı faturalandırma",
      "Belge ve evrak yönetimi",
      "Süre takibi ve hatırlatmalar",
      "Masraf ve gider takibi",
      "Raporlama ve analitik"
    ],
    benefits: [
      { icon: Clock, title: "Süre Yönetimi", description: "Çalışma saatlerini otomatik kaydedin." },
      { icon: Shield, title: "Gizlilik", description: "Müvekkil bilgileri güvenli altyapıda." },
      { icon: Calendar, title: "Takvim Entegrasyonu", description: "Duruşma ve icra tarihlerini asla kaçırmayın." },
      { icon: BarChart3, title: "Finansal Takip", description: "Masraf ve faturalandırmayı kolayca yönetin." }
    ],
    useCases: [
      "Avukatlık büroları",
      "Hukuk danışmanlık firmaları",
      "Arabuluculuk merkezleri",
      "Patent ve marka büroları",
      "Noterlikler",
      "Mali müşavirlik büroları"
    ],
    stats: [
      { label: "Aktif Kullanıcı", value: "80+" },
      { label: "Yönetilen Dosya", value: "15.000+" },
      { label: "Müşteri Memnuniyeti", value: "%97" }
    ]
  },
  pro: {
    id: "pro",
    icon: Briefcase,
    title: "Asistan Pro",
    subtitle: "Profesyonel Hizmetler",
    description: "Danışmanlar ve hizmet profesyonelleri için esnek çözümler.",
    longDescription: "Danışmanlar, koçlar, eğitmenler, freelancer'lar ve tüm hizmet profesyonelleri için tasarlandı. Esnek çalışma saatleri, online görüşmeler, proje yönetimi ve müşteri portal tek platformda.",
    color: "#8B5CF6",
    features: [
      "Esnek çalışma saatleri",
      "Online görüşme entegrasyonu",
      "Proje bazlı faturalandırma",
      "Müşteri portal erişimi",
      "Takvim senkronizasyonu",
      "Teklif ve sözleşme yönetimi",
      "Ödeme takibi",
      "Çoklu lokasyon desteği"
    ],
    benefits: [
      { icon: Zap, title: "Esneklik", description: "İstediğiniz yerden, istediğiniz zaman çalışın." },
      { icon: Users, title: "Müşteri Portal", description: "Müşterilerinize özel portal erişimi sunun." },
      { icon: Calendar, title: "Takvim Sync", description: "Google Calendar ile tam entegrasyon." },
      { icon: CheckCircle2, title: "Profesyonel İmaj", description: "Online rezervasyon ile profesyonel görünüm." }
    ],
    useCases: [
      "İş danışmanları",
      "Yaşam koçları",
      "Eğitmenler ve öğretmenler",
      "Freelancer'lar",
      "Fotoğrafçılar",
      "Tercümanlar"
    ],
    stats: [
      { label: "Aktif Kullanıcı", value: "100+" },
      { label: "Yönetilen Randevu", value: "20.000+" },
      { label: "Müşteri Memnuniyeti", value: "%98" }
    ]
  },
  saglik: {
    id: "saglik",
    icon: Heart,
    title: "Asistan Health",
    subtitle: "Sağlık Sektörü",
    description: "Klinik, hastane ve muayenehaneler için randevu ve hasta yönetimi.",
    longDescription: "Doktorlar, diş hekimleri, psikologlar, fizyoterapistler ve tüm sağlık profesyonelleri için tasarlandı. Hasta kayıtları, randevu yönetimi, hatırlatmalar ve raporlama tek platformda. KVKK uyumlu altyapı ile hasta verileriniz güvende.",
    color: "#12C8AD",
    features: [
      "Hasta kartları ve tıbbi geçmiş",
      "Online randevu alma sistemi",
      "SMS/E-posta/WhatsApp hatırlatmaları",
      "Reçete ve rapor yönetimi",
      "KVKK uyumlu veri saklama",
      "Çoklu doktor ve klinik desteği",
      "Hasta portal erişimi",
      "Sigorta entegrasyonları"
    ],
    benefits: [
      { icon: Clock, title: "Zaman Tasarrufu", description: "Günlük ortalama 2 saat idari iş yükünden kurtulun." },
      { icon: CheckCircle2, title: "Azalan No-Show", description: "Otomatik hatırlatmalar ile randevu iptalleri %70 azalır." },
      { icon: Shield, title: "Veri Güvenliği", description: "KVKK uyumlu altyapı ile hasta verileriniz güvende." },
      { icon: BarChart3, title: "Detaylı Raporlar", description: "Klinik performansınızı anlık takip edin." }
    ],
    useCases: [
      "Özel muayenehaneler",
      "Poliklinikler ve klinikler",
      "Diş hekimliği merkezleri",
      "Psikoloji ve terapi merkezleri",
      "Fizyoterapi merkezleri",
      "Estetik ve güzellik klinikleri"
    ],
    stats: [
      { label: "Aktif Kullanıcı", value: "200+" },
      { label: "Yönetilen Randevu", value: "50.000+" },
      { label: "Müşteri Memnuniyeti", value: "%99" }
    ]
  }
}

export default function IndustryPage({ params }: { params: { industry: string } }) {
  const industry = industriesData[params.industry]
  
  if (!industry) {
    notFound()
  }
  
  const IconComponent = industry.icon
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0FDFA] via-white to-[#F0F9FF] -z-10" />
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-10 -z-10"
          style={{ background: `radial-gradient(circle at 70% 30%, ${industry.color}, transparent 70%)` }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link 
            href="/cozumler" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#12C8AD] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tüm Çözümler
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${industry.color}15` }}
              >
                <IconComponent className="w-4 h-4" style={{ color: industry.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: industry.color }}>
                  {industry.subtitle}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#06142A] leading-tight">
                {industry.title}
              </h1>
              
              <p className="text-lg text-[#475569] max-w-xl leading-relaxed">
                {industry.longDescription}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/auth/sign-up">
                  <Button 
                    size="lg" 
                    className="text-white px-8 py-6 text-base rounded-xl shadow-lg"
                    style={{ backgroundColor: industry.color }}
                  >
                    Ücretsiz Başla
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/fiyatlandirma">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-[#E2E8F0] text-[#06142A] px-8 py-6 text-base rounded-xl hover:bg-[#F8FAFC]"
                  >
                    Fiyatları İncele
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-100 mt-6">
                {industry.stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold" style={{ color: industry.color }}>{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right - Icon Display */}
            <div className="relative flex items-center justify-center">
              <div 
                className="w-64 h-64 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${industry.color}15` }}
              >
                <div 
                  className="w-48 h-48 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${industry.color}25` }}
                >
                  <IconComponent className="w-24 h-24" style={{ color: industry.color }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Öne Çıkan Özellikler
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              {industry.subtitle} için özel olarak tasarlanmış özellikler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industry.features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:shadow-lg hover:border-transparent transition-all"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${industry.color}15` }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: industry.color }} />
                </div>
                <p className="font-medium text-[#06142A]">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-4">
              Neden Asistan?
            </h2>
            <p className="text-lg text-[#64748B] max-w-2xl mx-auto">
              İşinizi büyütmenize yardımcı olacak avantajlar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industry.benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${industry.color}15` }}
                  >
                    <benefit.icon className="w-6 h-6" style={{ color: industry.color }} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#06142A] mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#06142A] mb-6">
                Kimler İçin Uygun?
              </h2>
              <p className="text-lg text-[#64748B] mb-8">
                {industry.title}, aşağıdaki işletme ve profesyoneller için idealdir:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {industry.useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${industry.color}15` }}
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: industry.color }} />
                    </div>
                    <span className="text-[#06142A]">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#F0FDFA] to-[#F0F9FF] rounded-3xl p-8">
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: industry.color }}
                >
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#06142A] mb-4">
                  Hemen Başlayın
                </h3>
                <p className="text-[#64748B] mb-6">
                  14 gün ücretsiz deneyin. Kredi kartı gerekmez.
                </p>
                <Link href="/auth/sign-up">
                  <Button 
                    className="text-white px-8"
                    style={{ backgroundColor: industry.color }}
                  >
                    Ücretsiz Dene
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-[#06142A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {industry.title} ile tanışmaya hazır mısınız?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Hemen ücretsiz hesap oluşturun ve işinizi dijitalleştirmeye başlayın.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button 
                size="lg" 
                className="text-white px-8 py-6 text-base rounded-xl"
                style={{ backgroundColor: industry.color }}
              >
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/cozumler">
              <Button 
                variant="outline" 
                size="lg"
                className="border-gray-600 text-white px-8 py-6 text-base rounded-xl hover:bg-white/10"
              >
                Diğer Çözümler
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
