import Link from 'next/link'
import { ArrowRight, CalendarDays, Lock, ShieldCheck, Sparkles, Users } from 'lucide-react'
import type { CSSProperties } from 'react'

import { FadeLeft, FadeUp, MouseParallax, ScaleIn } from '@/components/marketing/motion-wrappers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const trustBadges = [
  { icon: ShieldCheck, text: 'Guvenli Randevu Yonetimi' },
  { icon: Users, text: 'Doktor ve Uzman Paneli' },
  { icon: CalendarDays, text: 'Mobil Uyumlu Sistem' },
  { icon: Lock, text: 'KKTC Odakli Platform' },
  { icon: Sparkles, text: 'Premium SaaS Altyapisi' },
]

const miniCards = [
  { title: 'Bugunku Randevular', value: '12', trend: '+18%' },
  { title: 'Onay Bekleyen', value: '3', trend: '+4%' },
  { title: 'Yeni Basvuru', value: '26', trend: '+9%' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-32">
      <div className="marketing-hero-bg absolute inset-0" />
      <div className="soft-grid absolute inset-0 opacity-60" />

      <div className="marketing-container relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <FadeUp>
              <Badge className="marketing-chip mb-5 border-0">Asistan Health</Badge>
            </FadeUp>
            <FadeUp delay={0.06}>
              <h1 className="max-w-xl font-heading text-4xl font-black leading-[1.08] text-brand-navy md:text-5xl lg:text-6xl">
                Saglik ekibinizi, randevu ve hasta surecini birlikte yonetin.
              </h1>
            </FadeUp>
            <FadeUp delay={0.12}>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
                Asistan, kliniginizin tum is akisini tek platformda toplar. Yapay zeka destekli
                cizelgeyle daha verimli, daha sakin bir operasyon kurarsiniz.
              </p>
            </FadeUp>

            <FadeUp delay={0.18} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="h-12 w-full rounded-xl bg-brand-blue px-5 text-sm font-semibold text-white hover:bg-brand-blue/90 sm:w-auto">
                <Link href="/auth/sign-up">
                  Randevu Al
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full rounded-xl border-brand-blue/20 px-5 text-sm font-semibold text-brand-navy sm:w-auto">
                <Link href="/auth/sign-up">Saglayici Olarak Katil</Link>
              </Button>
              <Button asChild variant="ghost" className="h-12 w-full rounded-xl border border-brand-blue/15 bg-white/70 px-5 text-sm font-semibold text-brand-navy hover:bg-white sm:w-auto">
                <Link href="/fiyatlandirma">Demo Gor</Link>
              </Button>
            </FadeUp>

            <FadeUp delay={0.22} className="mt-7 flex flex-wrap gap-3">
              {trustBadges.map((item) => (
                <span key={item.text} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <item.icon className="size-4 text-brand-cyan" />
                  {item.text}
                </span>
              ))}
            </FadeUp>
          </div>

          <FadeLeft delay={0.16} className="w-full lg:justify-self-end">
            <MouseParallax strength={12}>
              <div className="marketing-surface relative overflow-hidden rounded-3xl p-3">
                <div className="rounded-2xl border border-brand-blue/10 bg-white p-4 md:p-5">
                  <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                    <p className="text-sm font-bold text-brand-navy">Hos geldiniz, Dr. Can</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <Sparkles className="size-3" />
                      Aktif
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {miniCards.map((card, index) => (
                      <ScaleIn key={card.title} delay={0.03 * index}>
                        <div className="rounded-xl border border-brand-blue/10 bg-brand-light p-3">
                          <p className="text-[11px] font-semibold text-slate-500">{card.title}</p>
                          <p className="mt-1 text-2xl font-black text-brand-navy">{card.value}</p>
                          <p className="text-[11px] font-semibold text-brand-teal">{card.trend}</p>
                        </div>
                      </ScaleIn>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-brand-blue/10 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Doluluk grafigi</span>
                      <CalendarDays className="size-4 text-brand-blue" />
                    </div>
                    <div className="flex h-24 items-end gap-2">
                      {[35, 62, 48, 72, 58, 44].map((value, index) => (
                        <div
                          key={`bar-${index}`}
                          className="asistan-bar flex-1 rounded-t-md bg-gradient-to-t from-brand-blue to-brand-cyan"
                          style={{ ['--bar-height' as string]: `${value}%` } as CSSProperties}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="marketing-surface absolute -right-5 top-8 hidden rounded-xl p-3 lg:block">
                  <p className="text-[11px] font-semibold text-slate-500">Yeni Randevu</p>
                  <p className="mt-1 text-sm font-bold text-brand-navy">Ayse Akin</p>
                  <p className="text-xs text-slate-500">15:30 - Kontrol</p>
                </div>
              </div>
            </MouseParallax>
          </FadeLeft>
        </div>
      </div>
    </section>
  )
}
