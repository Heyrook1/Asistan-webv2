'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FadeUp } from '@/components/marketing/motion-wrappers'

const features = [
  'Sınırsız hasta kaydı ve yönetimi',
  'Rol bazlı ekip yönetimi (Doktor, Sekreter)',
  'AI destekli boş saat optimizasyon önerileri',
  'Gelişmiş takvim ve randevu sistemi',
  'KVKK uyumlu güvenli veri barındırma',
  'Otomatik SMS / Email hatırlatmaları',
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true)

  return (
    <section id="pricing" className="bg-[#F8FAFC] py-24 md:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <FadeUp className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block rounded-full bg-[#2563EB]/10 px-4 py-1.5 mb-6 text-sm font-bold text-[#2563EB]">
            Erken Erişim Fiyatlandırması
          </div>
          <h2 className="font-heading text-3xl font-black md:text-5xl text-[#0B1020]">
            Net ve Basit Yatırım.
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            Sadece ihtiyacınız olan özellikler için ödeme yapın. Kredi kartı gerekmeden, kliniğinizin ihtiyacına uygun paketi kurulum aşamasında belirleyin.
          </p>
        </FadeUp>

        <FadeUp delay={0.2} className="flex justify-center mb-12">
          <div className="flex p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm relative">
            <button 
              onClick={() => setIsYearly(false)}
              className={`relative px-8 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 ${!isYearly ? 'text-white' : 'text-slate-500 hover:text-[#0B1020]'}`}
            >
              {!isYearly && (
                <motion.div layoutId="pricing-tab" className="absolute inset-0 bg-[#0B1020] rounded-lg shadow-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">Aylık</span>
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`relative px-8 py-2.5 rounded-lg text-sm font-bold transition-colors duration-300 ${isYearly ? 'text-white' : 'text-slate-500 hover:text-[#0B1020]'}`}
            >
              {isYearly && (
                <motion.div layoutId="pricing-tab" className="absolute inset-0 bg-[#0B1020] rounded-lg shadow-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <span className="relative z-10">Yıllık <span className={`ml-1 transition-colors ${isYearly ? 'text-[#06B6D4]' : 'text-[#06B6D4]'}`}>-20%</span></span>
            </button>
          </div>
        </FadeUp>

        <div className="max-w-lg mx-auto">
          <FadeUp delay={0.3}>
            {/* Glowing Featured Card */}
            <div className="relative group rounded-[2.5rem] bg-white shadow-2xl shadow-[#2563EB]/10 p-10 border border-slate-200 hover:border-[#2563EB]/50 hover:shadow-[#2563EB]/20 transition-all duration-500">
              {/* Internal Glow Effect */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#2563EB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-[#0B1020]">Profesyonel Klinik</h3>
                    <p className="text-sm text-slate-500 mt-2">Tüm ekip için tam erişim</p>
                  </div>
                  <div className="bg-gradient-to-r from-[#2563EB]/10 to-[#06B6D4]/10 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold border border-[#2563EB]/20">
                    Önerilen
                  </div>
                </div>

                <div className="mb-10 flex items-baseline gap-2">
                  <span className="text-6xl font-black text-[#0B1020] tracking-tight">
                    €{isYearly ? '119' : '149'}
                  </span>
                  <span className="text-slate-500 font-semibold">/ kullanıcı</span>
                </div>

                <Button asChild className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:opacity-90 text-white text-base font-bold transition-opacity shadow-lg shadow-[#2563EB]/25 mb-10">
                  <Link href="/auth/sign-up">Ücretsiz Kurulum Başlat</Link>
                </Button>

                <div className="space-y-5">
                  <p className="text-sm font-bold text-[#0B1020] mb-2 uppercase tracking-wider">Erken Erişİme Dahİl Olanlar</p>
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 rounded-full bg-[#06B6D4]/10 p-1 text-[#0891B2]">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="text-sm font-medium text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

      </div>
    </section>
  )
}
