'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Apple, ArrowRight, Globe, Instagram, Linkedin, Play, Smartphone } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { useLandingLocale } from '@/components/sections/landing-locale'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

const FOOTER_COPY = {
  tr: {
    groups: [
      {
        title: 'Ürün & Çözümler',
        links: [
          { href: '#ecosystem', label: 'Platform Ekosistemi' },
          { href: '#features', label: 'Tüm Özellikler' },
          { href: '#pricing', label: 'Klinik Fiyatlandırma' },
          { href: '/urun', label: 'Web Panel Detayları' },
        ],
      },
      {
        title: 'Kaynaklar',
        links: [
          { href: '/kaynaklar', label: 'Eğitim & Kılavuzlar' },
          { href: '/contact', label: 'Demo Görüşmesi Talep Et' },
          { href: '/fiyatlandirma#sss', label: 'Sıkça Sorulan Sorular' },
          { href: '/privacy', label: 'Gizlilik ve Veri Güvenliği' },
        ],
      },
      {
        title: 'Kurumsal',
        links: [
          { href: '/hakkimizda', label: 'Hakkımızda' },
          { href: '/terms', label: 'Kullanım Koşulları' },
          { href: '/contact', label: 'İletişim Adresleri' },
          { href: '/cozumler', label: 'İş Ortaklıkları' },
        ],
      },
    ],
    summary:
      'Klinik yönetimi için bulut tabanlı modern panel, hastalar içinse yakında çıkacak olan GPS entegrasyonlu anlık rezervasyon mobil uygulaması.',
    appStore: 'Çok Yakında',
    playStore: 'Çok Yakında',
    soon: 'Yakında',
    queue: 'Asistan Rezervasyon bekleme listesi açık',
    newsletter: 'Bültene Abone Olun',
    newsletterDesc: 'Ürün güncellemeleri, operasyonel rehberler ve hekim büyüme taktikleri.',
    placeholder: 'E-posta adresiniz...',
    subscribe: 'Abone Ol',
    saved: 'Teşekkürler! Bültene başarıyla eklendiniz.',
    notSaved: 'Sadece önemli ürün gelişmelerini paylaşırız.',
    copyright: '© 2026 Asistan Health. Tüm hakları saklıdır.',
    language: 'Türkçe / English',
  },
  en: {
    groups: [
      {
        title: 'Product & Solutions',
        links: [
          { href: '#ecosystem', label: 'Platform Ecosystem' },
          { href: '#features', label: 'Platform Features' },
          { href: '#pricing', label: 'Clinic Pricing' },
          { href: '/urun', label: 'Web Dashboard Specs' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { href: '/kaynaklar', label: 'Guides & Academy' },
          { href: '/contact', label: 'Book a Live Demo' },
          { href: '/fiyatlandirma#sss', label: 'FAQ & Help Center' },
          { href: '/privacy', label: 'Privacy & Data Compliance' },
        ],
      },
      {
        title: 'Company',
        links: [
          { href: '/hakkimizda', label: 'About Us' },
          { href: '/terms', label: 'Terms of Use' },
          { href: '/contact', label: 'Contact Support' },
          { href: '/cozumler', label: 'Partnership Program' },
        ],
      },
    ],
    summary:
      'A premium cloud-native operations stack for clinics, plus a coming-soon patient mobile app that turns local search into booked appointments.',
    appStore: 'Coming Soon',
    playStore: 'Coming Soon',
    soon: 'Soon',
    queue: 'Asistan Rezervasyon waiting list open',
    newsletter: 'Subscribe to Newsletter',
    newsletterDesc: 'Product milestones, operational guides, and growth tactics.',
    placeholder: 'you@clinic.com',
    subscribe: 'Subscribe',
    saved: 'Thanks! You have been successfully added to our loop.',
    notSaved: 'We only send useful updates.',
    copyright: '© 2026 Asistan Health. All rights reserved.',
    language: 'English / Turkish',
  },
} as const

export function SiteFooter() {
  const { locale, setLocale } = useLandingLocale()
  const copy = FOOTER_COPY[locale]

  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
    setEmail('')
  }

  return (
    <footer className="border-t border-black/5 bg-[#FBFBFA] px-4 pb-12 pt-16 sm:px-6">
      <div className="mx-auto w-full max-w-[1220px]">
        
        {/* Top Grid Area */}
        <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr] border-b border-black/5 pb-10">
          
          {/* Logo & Brand Card */}
          <GlassCard className="p-6 sm:p-8 bg-white/40 border-white/50 shadow-md">
            <Link href="/" className="inline-flex" aria-label="Asistan home">
              <AsistanLogo variant="dark" size="md" />
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#5D6068] font-medium">
              {copy.summary}
            </p>

            {/* App download block */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm select-none">
                <div className="flex items-center gap-3">
                  <Apple className="h-5 w-5 text-[#1D1D1F]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">App Store</p>
                    <p className="text-xs font-bold text-[#1D1D1F]">{copy.appStore}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[9px] font-bold text-[#0071E3] uppercase tracking-wider">{copy.soon}</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm select-none">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-[#1D1D1F]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Google Play</p>
                    <p className="text-xs font-bold text-[#1D1D1F]">{copy.playStore}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0071E3]/10 px-2 py-0.5 text-[9px] font-bold text-[#0071E3] uppercase tracking-wider">{copy.soon}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF6FF]/80 border border-blue-100 px-3 py-1 font-bold text-[#0071E3]">
                <Smartphone className="h-3.5 w-3.5" />
                {copy.queue}
              </span>
            </div>
          </GlassCard>

          {/* Links Columns */}
          <div className="grid gap-4 sm:grid-cols-3">
            {copy.groups.map((group) => (
              <GlassCard key={group.title} className="p-5 sm:p-6 bg-white/40 border-white/50 shadow-sm h-full flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-[#1D1D1F] tracking-tight">{group.title}</p>
                  <ul className="mt-4 space-y-2.5">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}`}>
                        <a href={link.href} className="text-sm text-[#5D6068] font-medium transition duration-200 hover:text-[#0071E3]">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Links</div>
              </GlassCard>
            ))}
          </div>

        </div>

        {/* Newsletter & Social Links row */}
        <div className="mt-8">
          <GlassCard className="p-6 sm:p-8 bg-white/40 border-white/50 shadow-md">
            <div className="grid items-center gap-6 lg:grid-cols-[1.2fr_0.8fr_0.4fr]">
              <div>
                <p className="text-base font-bold text-[#1D1D1F]">{copy.newsletter}</p>
                <p className="mt-1 text-sm text-[#5D6068] font-medium">{copy.newsletterDesc}</p>
              </div>
              
              <form onSubmit={onSubmit} className="flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setSaved(false)
                  }}
                  required
                  placeholder={copy.placeholder}
                  className="h-11 rounded-xl border border-black/10 bg-white/80 px-4 text-sm outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/10 flex-1"
                />
                <Button type="submit" className="h-11 rounded-xl bg-[#0071E3] hover:bg-[#0063C8] px-5 text-sm font-bold text-white transition active:scale-[0.98] shrink-0">
                  {copy.subscribe}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </form>

              <div className="flex items-center gap-2 lg:justify-end">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="tap-target rounded-xl border border-black/5 bg-white/80 hover:bg-slate-100 p-2.5 text-[#1D1D1F] transition duration-300 hover:scale-[1.05] shadow-sm" aria-label="Instagram">
                  <Instagram className="h-4.5 w-4.5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="tap-target rounded-xl border border-black/5 bg-white/80 hover:bg-slate-100 p-2.5 text-[#1D1D1F] transition duration-300 hover:scale-[1.05] shadow-sm" aria-label="LinkedIn">
                  <Linkedin className="h-4.5 w-4.5" />
                </a>
              </div>
            </div>
            
            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs font-bold text-emerald-700"
                >
                  {copy.saved}
                </motion.p>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Bottom copyright & language switcher row */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-[#5D6068]">
          <p>{copy.copyright}</p>
          
          <div className="inline-flex items-center gap-3 rounded-full border border-black/5 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
            <Globe className="h-4 w-4 text-[#0071E3]" />
            <span>{copy.language}</span>
            <div className="ml-1 inline-flex rounded-lg border border-black/5 bg-slate-100/50 p-0.5">
              <button
                type="button"
                className={cn(
                  'rounded-md px-2.5 py-0.5 font-bold transition-all duration-300',
                  locale === 'tr' ? 'bg-[#0071E3] text-white shadow-sm' : 'hover:bg-black/5 text-[#5D6068]',
                )}
                onClick={() => setLocale('tr')}
              >
                TR
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-md px-2.5 py-0.5 font-bold transition-all duration-300',
                  locale === 'en' ? 'bg-[#0071E3] text-white shadow-sm' : 'hover:bg-black/5 text-[#5D6068]',
                )}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
