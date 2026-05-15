"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { Check, ArrowRight, Shield, CreditCard, RefreshCw, Lock, HelpCircle, X } from "lucide-react"

const plans = [
  {
    name: "Başlangıç",
    description: "Platformu keşfetmek isteyen profesyoneller için.",
    price: { monthly: 0, yearly: 0, label: "Ücretsiz" },
    features: [
      "Aylık 30 randevu",
      "1 kullanıcı",
      "Temel takvim yönetimi",
      "E-posta hatırlatmaları",
      "Temel raporlar"
    ],
    notIncluded: ["Ekip Yönetimi", "AI Önerileri", "API Erişimi"],
    cta: "Ücretsiz Başla",
    popular: false
  },
  {
    name: "Profesyonel",
    description: "Ekipler ve büyüyen işletmeler için.",
    price: { monthly: null, yearly: null, label: "Yakında" },
    features: [
      "Sınırsız randevu",
      "Çoklu kullanıcı desteği",
      "SMS + WhatsApp hatırlatma",
      "Gelişmiş analitik",
      "Ekip yönetimi",
      "AI destekli öneriler",
      "Öncelikli destek"
    ],
    notIncluded: [],
    cta: "Beni Bilgilendir",
    popular: true
  },
  {
    name: "Kurumsal",
    description: "Çoklu lokasyon ve özel ihtiyaçlar için.",
    price: { monthly: null, yearly: null, label: "Özel Fiyat" },
    features: [
      "Profesyonel planın tüm özellikleri",
      "Sınırsız kullanıcı",
      "API erişimi",
      "Özel entegrasyonlar",
      "Veri taşıma desteği",
      "7/24 öncelikli destek"
    ],
    notIncluded: [],
    cta: "Teklif Al",
    popular: false
  }
]

const faqs = [
  {
    question: "Şeffaf ve Güvenli",
    answer: "Ücretsiz deneme ile başlayın, memnun kalmazsanız iptal edin."
  },
  {
    question: "Ücretsiz deneme var mı?",
    answer: "Evet! Tüm planlar için 14 gün ücretsiz deneme sunuyoruz. Kredi kartı gerekmez."
  },
  {
    question: "İptal edebilir miyim?",
    answer: "Evet, dilediğiniz zaman iptal edebilir veya planınızı değiştirebilirsiniz."
  },
  {
    question: "Verilerim güvende mi?",
    answer: "Verileriniz 256-bit şifreleme ile korunur ve KVKK'ya uygun şekilde saklanır."
  },
  {
    question: "Ödeme yöntemleri neler?",
    answer: "Kredi kartı ve güvenli ödeme yöntemleriyle ödeme yapabilirsiniz."
  }
]

const comparisonFeatures = [
  { name: "Randevu Yönetimi", starter: true, pro: true, enterprise: true },
  { name: "SMS Hatırlatmaları", starter: true, pro: true, enterprise: true },
  { name: "Müşteri Kartları", starter: true, pro: true, enterprise: true },
  { name: "Temel Raporlar", starter: true, pro: true, enterprise: true },
  { name: "Ekip Yönetimi", starter: false, pro: true, enterprise: true },
  { name: "Gelişmiş Raporlama", starter: false, pro: true, enterprise: true },
  { name: "Online Ödeme", starter: false, pro: true, enterprise: true },
  { name: "AI Önerileri", starter: false, pro: true, enterprise: true },
  { name: "API Erişimi", starter: false, pro: false, enterprise: true },
  { name: "Özel Entegrasyonlar", starter: false, pro: false, enterprise: true },
  { name: "7/24 Destek", starter: false, pro: false, enterprise: true },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#F8FAFC] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#12C8AD]/10 rounded-full mb-6">
              <span className="text-xs font-semibold text-[#12C8AD] uppercase tracking-wider">Fiyatlandırma</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-[#06142A] mb-6 leading-tight">
              İşinize uygun{" "}
              <span className="text-[#12C8AD]">sade fiyatlandırma.</span>
            </h1>
            
            <p className="text-lg text-[#64748B] mb-10 leading-relaxed">
              İhtiyacınıza göre esnek planlar. Tek başınıza, kliniğinizde ya da büyüyen ekibinizle Asistan her aşamada yanınızda.
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 bg-[#F1F5F9] rounded-full">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !isYearly 
                    ? 'bg-white text-[#06142A] shadow-sm' 
                    : 'text-[#64748B] hover:text-[#06142A]'
                }`}
              >
                Aylık
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isYearly 
                    ? 'bg-white text-[#06142A] shadow-sm' 
                    : 'text-[#64748B] hover:text-[#06142A]'
                }`}
              >
                Yıllık
                <span className="bg-[#12C8AD] text-white text-xs px-2 py-0.5 rounded-full">
                  %20 tasarruf edin
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-white border-2 border-[#12C8AD] shadow-xl shadow-[#12C8AD]/10 relative lg:scale-105' 
                    : 'bg-white border border-[#E2E8F0] hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#12C8AD] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                      En Popüler
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[#06142A] mb-2">{plan.name}</h3>
                  <p className="text-sm text-[#64748B]">{plan.description}</p>
                </div>
                
                <div className="mb-6">
                  {plan.price.label === "Ücretsiz" ? (
                    <>
                      <span className={`text-4xl font-bold ${plan.popular ? 'text-[#12C8AD]' : 'text-[#06142A]'}`}>
                        Ücretsiz
                      </span>
                      <p className="text-xs text-[#64748B] mt-1">Hemen başlayın</p>
                    </>
                  ) : plan.price.label === "Yakında" ? (
                    <>
                      <span className={`text-3xl font-bold ${plan.popular ? 'text-[#12C8AD]' : 'text-[#06142A]'}`}>
                        Yakında
                      </span>
                      <p className="text-xs text-[#64748B] mt-1">Lansman için bizi takip edin</p>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-[#06142A]">Özel Fiyat</span>
                      <p className="text-xs text-[#64748B] mt-1">İhtiyacınıza özel teklif</p>
                    </>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#475569]">
                      <Check className="w-5 h-5 text-[#12C8AD] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                      <X className="w-5 h-5 text-[#CBD5E1] flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-6 rounded-xl ${
                    plan.popular 
                      ? 'bg-[#12C8AD] hover:bg-[#0EA894] text-white' 
                      : 'bg-white border border-[#E2E8F0] text-[#06142A] hover:bg-[#F8FAFC]'
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Trust Badges */}
      <section className="py-12 border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {faqs.slice(0, 5).map((faq, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-[#64748B]">
                <Check className="w-4 h-4 text-[#12C8AD]" />
                <span>{faq.question}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Feature Comparison Table */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#06142A] mb-4">
              Planları Karşılaştırın
            </h2>
            <p className="text-[#64748B]">
              İhtiyacınıza en uygun planı seçin
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="grid grid-cols-4 border-b border-[#E2E8F0]">
              <div className="p-6 font-semibold text-[#06142A]">Özellikler</div>
              <div className="p-6 text-center font-semibold text-[#06142A]">Başlangıç</div>
              <div className="p-6 text-center font-semibold text-[#12C8AD] bg-[#12C8AD]/5">Pro</div>
              <div className="p-6 text-center font-semibold text-[#06142A]">Kurumsal</div>
            </div>
            
            {comparisonFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-4 ${index !== comparisonFeatures.length - 1 ? 'border-b border-[#E2E8F0]' : ''}`}
              >
                <div className="p-4 text-sm text-[#475569]">{feature.name}</div>
                <div className="p-4 text-center">
                  {feature.starter ? (
                    <Check className="w-5 h-5 text-[#12C8AD] mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-[#CBD5E1] mx-auto" />
                  )}
                </div>
                <div className="p-4 text-center bg-[#12C8AD]/5">
                  {feature.pro ? (
                    <Check className="w-5 h-5 text-[#12C8AD] mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-[#CBD5E1] mx-auto" />
                  )}
                </div>
                <div className="p-4 text-center">
                  {feature.enterprise ? (
                    <Check className="w-5 h-5 text-[#12C8AD] mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-[#CBD5E1] mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#06142A] mb-4">
              Sıkça Sorulan Sorular
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-[#12C8AD] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-[#06142A] mb-2">{faq.question}</h3>
                    <p className="text-sm text-[#64748B]">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#06142A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hemen başlayın
          </h2>
          <p className="text-[#94A3B8] mb-8">
            14 gün ücretsiz deneyin. Kredi kartı gerekmez.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-[#12C8AD] hover:bg-[#0EA894] text-white px-8 py-6 rounded-xl"
            >
              Ücretsiz Dene
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-[#1E3A5F] text-white px-8 py-6 rounded-xl hover:bg-[#0A1F3D]"
            >
              Satış Ekibiyle Görüşün
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
