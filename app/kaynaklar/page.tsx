'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { 
  ArrowRight,
  Play,
  FileText,
  BookOpen,
  MessageSquare,
  Clock,
  TrendingUp,
  CheckCircle2,
  Star
} from 'lucide-react'

const featuredArticle = {
  tag: 'REHBER',
  title: 'Dijital randevu yönetimiyle kliniğinizde verimliliği artırın',
  description: 'Dijital dönüşümün sağlık sektörüne etkilerini, randevu yönetimini kolaylaştıran yöntemleri ve en iyi uygulamaları keşfedin.',
  cta: 'Yazıyı Oku'
}

const articles = [
  {
    type: 'BLOG',
    icon: FileText,
    title: 'Randevu yönetiminde 5 yaygın hata ve çözümleri',
    description: 'Kliniklerde sık yapılan hataları ve bu hatalardan kaçınmanın yollarını öğrenin.',
    time: '5 dk okuma'
  },
  {
    type: 'REHBERLER',
    icon: BookOpen,
    title: 'Hasta iletişimini güçlendiren en iyi uygulamalar',
    description: 'Hasta memnuniyetini artıran iletişim stratejileri ve örnek senaryolar.',
    time: '8 dk okuma'
  },
  {
    type: 'SIK SORULAN SORULAR',
    icon: MessageSquare,
    title: 'Asistan hakkında merak edilen tüm sorular',
    description: 'Ürünle ilgili en çok sorulan soruların yanıtlarını bulabilirsiniz.',
    time: '3 dk okuma'
  },
  {
    type: 'WEBİNAR',
    icon: Play,
    title: 'Uzmanlarla randevu yönetimi üzerine canlı oturumlar',
    description: 'Alanında uzman konuşmacılarla gerçekleştirilen webinar kayıtları ve slayt.',
    time: '45 dk izleme'
  },
  {
    type: 'BAŞARI HİKAYELERİ',
    icon: Star,
    title: 'Asistan kullanan kliniklerin başarı hikayeleri',
    description: 'Gerçek kullanıcıların deneyimlerini ve elde edilen sonuçları keşfedin.',
    time: '7 dk okuma'
  },
  {
    type: 'ÜRÜN GÜNCELLEMELERİ',
    icon: TrendingUp,
    title: 'Yeni özellikler ve ürün güncellemeleri',
    description: 'Asistan\'ın yenilenen özellikleri ve iyileştirmeleri hk. içerikler.',
    time: '4 dk okuma'
  },
]

export default function KaynaklarPage() {
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
                <span className="text-[#1BD1B5] text-sm font-semibold tracking-wider uppercase">KAYNAKLAR</span>
                <div className="w-8 h-px bg-[#1BD1B5]" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-[#0B1828] leading-[1.1] mb-6">
                Bilgi merkezi,
                <br />
                rehberler ve
                <br />
                <span className="text-[#1BD1B5]">güncel içerikler.</span>
              </h1>
              
              <p className="text-[#5E6A78] text-lg mb-8 leading-relaxed max-w-lg">
                Randevu yönetimi, hasta iletişimi ve ekip organizasyonu
                konularında uzman içeriklerle işinizi daha verimli hale getirin.
                Pratik rehberler, ipuçları ve güncel gelişmeler burada.
              </p>
            </div>

            {/* Right - Featured Article */}
            <div className="relative">
              {/* Featured Article Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-3 bg-[#1BD1B5]/10 border-b border-gray-100">
                  <span className="text-[#1BD1B5] text-xs font-semibold">Öne Çıkan İçerik</span>
                </div>
                <div className="p-6">
                  <span className="inline-block text-xs font-semibold text-[#1BD1B5] bg-[#1BD1B5]/10 px-3 py-1 rounded-full mb-4">
                    {featuredArticle.tag}
                  </span>
                  <h3 className="text-xl font-bold text-[#0B1828] mb-3">{featuredArticle.title}</h3>
                  <p className="text-sm text-[#5E6A78] leading-relaxed mb-4">{featuredArticle.description}</p>
                  <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-medium rounded-full">
                    {featuredArticle.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-[#5E6A78] mb-1">Randevu Başarı</div>
                    <div className="text-2xl font-bold text-[#1BD1B5]">+32%</div>
                  </div>
                  <div className="w-12 h-12 bg-[#1BD1B5]/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#1BD1B5]" />
                  </div>
                </div>
              </div>

              {/* Floating Approval Card */}
              <div className="absolute -bottom-4 right-8 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-xs text-[#5E6A78] mb-1">Onay Oranı</div>
                    <div className="text-xl font-bold text-[#0B1828]">%98</div>
                    <div className="text-xs text-[#1BD1B5]">+%10 artış</div>
                  </div>
                  <div className="w-10 h-10 bg-[#1BD1B5]/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#1BD1B5]" />
                  </div>
                </div>
              </div>

              {/* Doctor Image */}
              <div className="absolute bottom-0 right-0 w-32 h-48 overflow-hidden rounded-xl">
                <Image
                  src="/images/medical-team.jpg"
                  alt="Doctor"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-[#1BD1B5]/20 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1BD1B5]/10 rounded-xl flex items-center justify-center">
                    <article.icon className="w-5 h-5 text-[#1BD1B5]" />
                  </div>
                  <span className="text-xs font-semibold text-[#1BD1B5]">{article.type}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#0B1828] mb-2 group-hover:text-[#1BD1B5] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-[#5E6A78] leading-relaxed mb-4">{article.description}</p>
                <div className="flex items-center gap-2 text-xs text-[#8A9AAA]">
                  <Clock className="w-3 h-3" />
                  <span>{article.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-[#F8FAFB]">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1828] mb-4">
            Yeni içerikleri kaçırmayın
          </h2>
          <p className="text-[#5E6A78] mb-8">
            Randevu yönetimi, hasta iletişimi ve verimlilik konularında
            en yeni içerikleri e-posta kutunuza alın.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              placeholder="E-posta adresinizi girin" 
              className="rounded-full px-5 py-6 border-gray-300"
            />
            <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-6 rounded-full whitespace-nowrap">
              Abone Ol
            </Button>
          </div>
          <p className="text-xs text-[#8A9AAA] mt-4">
            E-postanız güvenle saklanır, istediğiniz zaman abonelikten çıkabilirsiniz.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
