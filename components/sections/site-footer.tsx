'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
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
        title: 'Ürün',
        links: [
          { href: '#features', label: 'Platform özellikleri' },
          { href: '#ecosystem', label: 'Ekosistem döngüsü' },
          { href: '#pricing', label: 'Fiyatlandırma' },
          { href: '/urun', label: 'Web panel detayları' },
        ],
      },
      {
        title: 'Kaynaklar',
        links: [
          { href: '/kaynaklar', label: 'Rehberler ve yazılar' },
          { href: '/contact', label: 'Demo talep et' },
          { href: '/fiyatlandirma#sss', label: 'Sıkça sorulan sorular' },
          { href: '/privacy', label: 'Gizlilik politikası' },
        ],
      },
      {
        title: 'Şirket',
        links: [
          { href: '/hakkimizda', label: 'Hakkımızda' },
          { href: '/terms', label: 'Kullanım koşulları' },
          { href: '/contact', label: 'İletişim' },
          { href: '/cozumler', label: 'Çözümler' },
        ],
      },
    ],
    summary:
      'Klinikler için premium operasyon platformu, hastalar içinse yakında çıkacak rezervasyon uygulaması.',
    appStore: 'Yakında',
    playStore: 'Yakında',
    soon: 'Yakında',
    queue: 'Asistan Rezervasyon beta kaydı açık',
    newsletter: 'Bülten',
    newsletterDesc: 'Ürün güncellemeleri, lansman notları ve randevu büyütme içerikleri.',
    placeholder: 'adiniz@ornek.com',
    subscribe: 'Abone Ol',
    saved: 'Teşekkürler. Bültene eklendiniz.',
    notSaved: 'Yalnızca faydalı güncellemeler göndeririz.',
    copyright: '© 2026 Asistan Health. Tüm hakları saklıdır.',
    language: 'Türkçe / English',
  },
  en: {
    groups: [
      {
        title: 'Product',
        links: [
          { href: '#features', label: 'Platform features' },
          { href: '#ecosystem', label: 'Ecosystem flow' },
          { href: '#pricing', label: 'Pricing' },
          { href: '/urun', label: 'Web dashboard details' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { href: '/kaynaklar', label: 'Guides and articles' },
          { href: '/contact', label: 'Book a demo' },
          { href: '/fiyatlandirma#sss', label: 'FAQ' },
          { href: '/privacy', label: 'Privacy policy' },
        ],
      },
      {
        title: 'Company',
        links: [
          { href: '/hakkimizda', label: 'About us' },
          { href: '/terms', label: 'Terms' },
          { href: '/contact', label: 'Contact' },
          { href: '/cozumler', label: 'Solutions' },
        ],
      },
    ],
    summary:
      'A premium operations stack for clinics, plus a coming-soon patient app that turns discovery into booked care.',
    appStore: 'Coming soon',
    playStore: 'Coming soon',
    soon: 'Soon',
    queue: 'Asistan Rezervasyon beta queue open',
    newsletter: 'Newsletter',
    newsletterDesc: 'Product updates, launch notes, and appointment-growth tactics.',
    placeholder: 'you@clinic.com',
    subscribe: 'Subscribe',
    saved: 'Thanks. You are in the loop.',
    notSaved: 'We only send useful updates.',
    copyright: '© 2026 Asistan Health. All rights reserved.',
    language: 'Turkish / English',
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
    <footer className="border-t border-black/8 bg-[#F4F5F7] px-4 pb-10 pt-12 sm:px-6">
      <div className="mx-auto w-full max-w-[1220px]">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <GlassCard className="p-5 sm:p-6">
            <Link href="/" className="inline-flex" aria-label="Asistan home">
              <AsistanLogo variant="dark" size="md" />
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#4B4C52]">
              {copy.summary}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-left backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <Apple className="h-4 w-4 text-[#1D1D1F]" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#5F6370]">App Store</p>
                    <p className="text-sm font-semibold text-[#1D1D1F]">{copy.appStore}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0071E3]/12 px-2 py-0.5 text-[10px] font-semibold text-[#0071E3]">{copy.soon}</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/75 px-4 py-3 text-left backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-[#1D1D1F]" />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-[#5F6370]">Google Play</p>
                    <p className="text-sm font-semibold text-[#1D1D1F]">{copy.playStore}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0071E3]/12 px-2 py-0.5 text-[10px] font-semibold text-[#0071E3]">{copy.soon}</span>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#5F6370]">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1">
                <Smartphone className="h-3.5 w-3.5 text-[#0071E3]" />
                {copy.queue}
              </span>
            </div>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-3">
            {copy.groups.map((group) => (
              <GlassCard key={group.title} className="p-4 sm:p-5">
                <p className="text-sm font-semibold text-[#1D1D1F]">{group.title}</p>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <a href={link.href} className="text-sm text-[#4B4C52] transition hover:text-[#1D1D1F]">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>

        <GlassCard className="mt-5 p-4 sm:p-5">
          <div className="grid items-center gap-4 lg:grid-cols-[1.1fr_0.9fr_auto]">
            <div>
              <p className="text-sm font-semibold text-[#1D1D1F]">{copy.newsletter}</p>
              <p className="mt-1 text-sm text-[#5F6370]">{copy.newsletterDesc}</p>
            </div>
            <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSaved(false)
                }}
                required
                placeholder={copy.placeholder}
                className="h-11 rounded-2xl border border-black/10 bg-white/82 px-4 text-sm outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20"
              />
              <Button type="submit" className="h-11 rounded-2xl bg-[#0071E3] px-5 text-sm font-semibold text-white hover:bg-[#0063C8]">
                {copy.subscribe}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <a href="https://instagram.com" className="tap-target rounded-xl border border-black/10 bg-white/75 p-2 text-[#1D1D1F] hover:bg-black/5" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" className="tap-target rounded-xl border border-black/10 bg-white/75 p-2 text-[#1D1D1F] hover:bg-black/5" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#5F6370]">{saved ? copy.saved : copy.notSaved}</p>
        </GlassCard>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F6370]">
          <p>{copy.copyright}</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5">
            <Globe className="h-3.5 w-3.5 text-[#0071E3]" />
            <span>{copy.language}</span>
            <div className="ml-1 inline-flex rounded-lg border border-black/10 p-0.5">
              <button
                type="button"
                className={cn(
                  'rounded-md px-2 py-0.5 font-semibold transition',
                  locale === 'tr' ? 'bg-[#0071E3] text-white' : 'hover:bg-black/5',
                )}
                onClick={() => setLocale('tr')}
              >
                TR
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-md px-2 py-0.5 font-semibold transition',
                  locale === 'en' ? 'bg-[#0071E3] text-white' : 'hover:bg-black/5',
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

