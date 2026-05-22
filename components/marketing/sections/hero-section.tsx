'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Stethoscope, LockKeyhole, BadgeCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeUp, FadeLeft, MouseParallax } from '@/components/marketing/motion-wrappers'

const trustBadges = [
  { icon: Stethoscope, text: 'Asistan Health aktif' },
  { icon: ShieldCheck, text: 'Rol bazlı erişim' },
  { icon: LockKeyhole, text: 'KVKK odaklı kurulum' },
  { icon: BadgeCheck, text: 'KKTC iş akışına göre' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pb-12 pt-32 md:pb-20 md:pt-40 bg-[#F8FAFC]">
      {/* Animated Mesh Grid Background */}
      <div className="absolute inset-0 z-0 mesh-hero soft-grid opacity-70"></div>
      
      {/* Aurora Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563EB]/20 blur-[120px] mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#06B6D4]/20 blur-[100px] mix-blend-multiply pointer-events-none"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl">
            <FadeUp delay={0.1}>
              <Badge className="mb-6 border-0 bg-white/80 px-4 py-2 text-[#2563EB] shadow-sm ring-1 ring-[#2563EB]/10 hover:bg-white backdrop-blur-md">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse"></span>
                  AI Destekli Yeni Nesil Platform
                </span>
              </Badge>
            </FadeUp>
            
            <FadeUp delay={0.2}>
              <h1 className="font-heading text-5xl font-black leading-[1.1] tracking-tight text-[#0B1020] md:text-6xl lg:text-[4rem]">
                Medikal Operasyonunuz <br/>
                <span className="animated-gradient-text">Yapay Zeka ile <br/>Otopilotta.</span>
              </h1>
            </FadeUp>
            
            <FadeUp delay={0.3}>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Randevular, hasta kayıtları, ekip yönetimi ve otomatik hatırlatmalar. Asistan Health ile kliniğinizin tüm operasyonunu tek bir akıllı panelden yönetin.
              </p>
            </FadeUp>
            
            <FadeUp delay={0.4} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] px-8 text-base font-bold text-white shadow-xl shadow-[#2563EB]/25 transition-all hover:scale-[1.02]">
                <Link href="/auth/sign-up">
                  Ücretsiz Demo Talep Et
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white/50 px-8 text-base font-bold text-[#0B1020] shadow-sm backdrop-blur-md transition-all hover:bg-white">
                <Link href="#how-it-works">
                  Nasıl Çalışır?
                </Link>
              </Button>
            </FadeUp>

            <FadeUp delay={0.5} className="mt-12 pt-8 border-t border-slate-200/60">
              <p className="text-sm font-semibold text-slate-500 mb-4">Güvenilir ve Uyumlu Altyapı</p>
              <div className="flex flex-wrap gap-4">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <badge.icon className="size-4 text-[#06B6D4]" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right Content - Mockup */}
          <FadeLeft delay={0.4} className="relative lg:ml-auto w-full max-w-[600px]">
            <MouseParallax strength={15}>
              <div className="relative">
                {/* AI Pulse Bubble */}
                <div className="absolute -top-6 -right-6 z-20 flex items-center gap-3 rounded-2xl glass-panel p-3 shadow-2xl animate-float-card">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-white">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0B1020]">AI Asistan</p>
                    <p className="text-[10px] text-slate-500">15:30 boşluğunu doldurabilirim.</p>
                  </div>
                </div>

                {/* Dashboard Image / Mock */}
                <div className="glass-panel overflow-hidden rounded-3xl border border-white/60 p-2 shadow-2xl brand-glow">
                  <div className="rounded-2xl border border-slate-100/50 bg-[#F8FAFC]/90 p-4">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-xs">Dr</div>
                        <div className="h-4 w-24 rounded bg-slate-200"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 rounded-full bg-[#06B6D4]/10 text-[10px] font-bold text-[#0891B2] flex items-center justify-center">Canlı</div>
                      </div>
                    </div>
                    
                    {/* Simulated Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        {v: '12', l: 'Bugün Randevu'},
                        {v: '3', l: 'Bekleyen Onay'},
                        {v: '2', l: 'Boş Saat'},
                        {v: '%94', l: 'Doluluk Oranı'}
                      ].map((item, i) => (
                        <div key={i} className="h-24 rounded-xl bg-white shadow-sm border border-slate-100 p-4 flex flex-col justify-center">
                           <div className="text-2xl font-black text-[#0B1020] mb-1">{item.v}</div>
                           <div className="text-xs font-medium text-slate-500">{item.l}</div>
                        </div>
                      ))}
                    </div>

                    {/* Simulated Chart */}
                    <div className="h-32 rounded-xl bg-gradient-to-r from-[#2563EB]/5 to-[#06B6D4]/5 border border-[#2563EB]/10 flex items-end p-4 gap-2">
                       {[40, 70, 45, 90, 60, 30].map((h, i) => (
                         <div key={i} className="flex-1 bg-gradient-to-t from-[#2563EB] to-[#06B6D4] rounded-t-sm opacity-80 transition-all hover:opacity-100 hover:h-[110%]" style={{ height: `${h}%` }}></div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Floating Notification */}
                <div className="absolute -bottom-8 -left-6 z-20 flex items-center gap-3 rounded-2xl glass-panel p-4 shadow-xl" style={{ animation: 'float-slow 6s ease-in-out infinite' }}>
                  <div className="relative flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <span className="absolute top-0 right-0 size-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                    <BadgeCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0B1020]">Yeni Randevu Onayı</p>
                    <p className="text-[10px] text-slate-500">Ayşe Y. SMS ile onayladı</p>
                  </div>
                </div>

              </div>
            </MouseParallax>
          </FadeLeft>

        </div>
      </div>
    </section>
  )
}
