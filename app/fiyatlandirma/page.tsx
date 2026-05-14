'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'
import { 
  Check,
  ArrowRight,
  Shield,
  CreditCard,
  RefreshCw,
  Lock,
  HelpCircle
} from 'lucide-react'

const plans = [
  {
    name: 'Başlangıç',
    description: 'Tek başına çalışanlar için ideal.',
    price: { monthly: 399, yearly: 319 },
    features: [
      'Randevu ve Takvim Yönetimi',
      'Hatırlatmalar (SMS & E-posta)',
      'Müşteri Profilleri ve Geçmişi',
      'Temel Raporlar',
      'E-posta & Canlı Destek'
    ],
    cta: 'Başlangıç Planını Seç',
    popular: false
  },
  {
    name: 'Pro',
    description: 'Klinikler ve küçük ekipler için.',
    price: { monthly: 899, yearly: 719 },
    features: [
      'Başlangıç planındaki tüm özellikler',
      'Ekip Yönetimi & Yetkilendirme',
      'Gelişmiş Raporlama',
      'Online Ödeme Entegrasyonu',
      'Özel Alanlar & Formlar',
      'Öncelikli Destek'
    ],
    cta: 'Pro Planını Seç',
    popular: true
  },
  {
    name: 'Kurumsal',
    description: 'Büyüyen ekipler ve kurumlar için.',
    price: { monthly: null, yearly: null },
    customPrice: 'Özel Fiyat',
    subtitle: 'İhtiyaçlarınıza özel teklif',
    features: [
      'Pro planındaki tüm özellikler',
      'Sınırsız Kullanıcı & Rol Yönetimi',
      'API Erişimi',
      'Özel Entegrasyonlar',
      'Veri Taşıma & Özel Eğitim',
      '7/24 Öncelikli Destek'
    ],
    cta: 'Teklif Al',
    popular: false
  }
]

const trustItems = [
  {
    icon: Shield,
    title: 'Şeffaf ve Güvenilir',
    description: 'Ücretsiz deneme ile başlayın, memnun kalmazsanız iptal edin.'
  },
  {
    icon: CreditCard,
    title: 'Ücretsiz deneme var mı?',
    description: 'Evet! Tüm planlar için 14 gün ücretsiz deneme sunuyoruz.'
  },
  {
    icon: RefreshCw,
    title: 'İptal edebilir miyim?',
    description: 'Evet, dilediğiniz zaman iptal edebilir veya planınızı değiştirebilirsiniz.'
  },
  {
    icon: Lock,
    title: 'Verilerim güvende mi?',
    description: 'Verileriniz 256 bit şifreleme ile korunur ve KVKK\'ya uygundur.'
  },
  {
    icon: HelpCircle,
    title: 'Ödeme yöntemleri neler?',
    description: 'Kredi kartı ve güvenli ödeme yöntemlerini kullanabilirsiniz.'
  }
]

export default function FiyatlandirmaPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-[#F8FAFB] to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1828] mb-4">
            İşinize uygun <span className="text-[#1BD1B5]">sade fiyatlandırma.</span>
          </h1>
          <p className="text-lg text-[#5E6A78] max-w-2xl mx-auto mb-8">
            İhtiyacınıza göre esnek planlar. Tek başınıza, kliniğinizde ya da büyüyen ekibinizle
            Asistan her aşamada yanınızda.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-gray-100 rounded-full p-1.5 mb-12">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly ? 'bg-white shadow-sm text-[#0B1828]' : 'text-[#5E6A78]'
              }`}
            >
              Aylık
              <span className="text-xs text-[#8A9AAA] ml-1">Aylık faturalama</span>
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                isYearly ? 'bg-white shadow-sm text-[#0B1828]' : 'text-[#5E6A78]'
              }`}
            >
              Yıllık
              <span className="text-xs text-[#1BD1B5] ml-1">%20 tasarruf edin</span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`relative bg-white rounded-2xl p-6 text-left border ${
                  plan.popular 
                    ? 'border-[#1BD1B5] shadow-xl shadow-[#1BD1B5]/10' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1BD1B5] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    En Popüler
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    plan.popular ? 'bg-[#1BD1B5]/10' : 'bg-gray-100'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      plan.popular ? 'bg-[#1BD1B5]' : 'bg-gray-400'
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0B1828]">{plan.name}</h3>
                </div>

                <p className="text-sm text-[#5E6A78] mb-4">{plan.description}</p>

                <div className="mb-6">
                  {plan.price.monthly ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#0B1828]">
                        ₺{isYearly ? plan.price.yearly : plan.price.monthly}
                      </span>
                      <span className="text-[#5E6A78]">/ay</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xl font-bold text-[#0B1828]">{plan.customPrice}</div>
                      <div className="text-sm text-[#5E6A78]">{plan.subtitle}</div>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#5E6A78]">
                      <Check className="w-4 h-4 text-[#1BD1B5] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full rounded-full py-5 font-medium ${
                    plan.popular 
                      ? 'bg-[#1BD1B5] hover:bg-[#17b8a0] text-white' 
                      : 'bg-white border border-gray-300 text-[#0B1828] hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            {trustItems.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-[#1BD1B5]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-[#1BD1B5]" />
                </div>
                <h4 className="font-semibold text-[#0B1828] mb-2 text-sm">{item.title}</h4>
                <p className="text-xs text-[#5E6A78] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0B1828]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Hala kararsız mısınız?
          </h2>
          <p className="text-[#8A9AAA] text-lg mb-8">
            14 gün ücretsiz deneyin, kredi kartı gerekmez.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button className="bg-[#1BD1B5] hover:bg-[#17b8a0] text-white font-semibold px-8 py-6 rounded-full text-base">
                Ücretsiz Başla
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-medium px-8 py-6 rounded-full text-base">
              Satış Ekibiyle Konuşun
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
