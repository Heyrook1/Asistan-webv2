'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Apple, ArrowRight, Globe, Instagram, Linkedin, Loader2, Play, Smartphone } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { useLandingLocale } from '@/components/sections/landing-locale'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'
import { copyrightLine, productName, socialLinks, MASTERBRAND } from '@/lib/brand/masterbrand'

const FOOTER_COPY = {
  tr: {
    groups: [
      {
        title: 'Ürün & Çözümler',
        links: [
          { href: '/cozumler', label: 'Çözümler' },
          { href: '/urun', label: 'Özellikler' },
          { href: '/fiyatlandirma', label: 'Klinik Fiyatlandırma' },
          { href: '/guven', label: 'Güven Merkezi' },
        ],
      },
      {
        title: 'Kaynaklar',
        links: [
          { href: '/kaynaklar', label: 'Eğitim & Kılavuzlar' },
          { href: '/client', label: 'Hasta randevusu' },
          { href: '/contact', label: 'Demo talep et' },
          { href: '/fiyatlandirma#sss', label: 'Sıkça Sorulan Sorular' },
          { href: '/privacy', label: 'Gizlilik Politikası' },
        ],
      },
      {
        title: 'Kurumsal',
        links: [
          { href: '/hakkimizda', label: 'Hakkımızda' },
          { href: '/terms', label: 'Kullanım Koşulları' },
          { href: '/contact', label: 'İletişim' },
          { href: '/guven', label: 'Güven Merkezi' },
        ],
      },
    ],
    summary:
      `${productName('company', 'tr')}; klinik paneli ${productName('health', 'tr')} ve hasta randevusu ${productName('booking', 'tr')} aynı ekosistemde — web panel, keşif ve rezervasyon.`,
    appStore: 'Mağaza bekleme listesi',
    playStore: 'Mağaza bekleme listesi',
    queue: 'Mağaza yayını için bekleme listesi açık',
    newsletter: 'Bültene Abone Olun',
    newsletterDesc: 'Ürün güncellemeleri, operasyonel rehberler ve hekim büyüme taktikleri.',
    placeholder: 'E-posta adresiniz...',
    subscribe: 'Abone Ol',
    saved: 'Teşekkürler! Bültene başarıyla eklendiniz.',
    notSaved: 'Sadece önemli ürün gelişmelerini paylaşırız.',
    copyright: copyrightLine(2026, 'tr'),
    language: 'Türkçe / English',
  },
  en: {
    groups: [
      {
        title: 'Product & Solutions',
        links: [
          { href: '/cozumler', label: 'Solutions' },
          { href: '/urun', label: 'Features' },
          { href: '/fiyatlandirma', label: 'Clinic Pricing' },
          { href: '/guven', label: 'Trust Center' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { href: '/kaynaklar', label: 'Guides & Academy' },
          { href: '/client', label: 'Patient booking' },
          { href: '/contact', label: 'Request a demo' },
          { href: '/fiyatlandirma#sss', label: 'FAQ' },
          { href: '/privacy', label: 'Privacy Policy' },
        ],
      },
      {
        title: 'Company',
        links: [
          { href: '/hakkimizda', label: 'About Us' },
          { href: '/terms', label: 'Terms of Use' },
          { href: '/contact', label: 'Contact' },
          { href: '/guven', label: 'Trust Center' },
        ],
      },
    ],
    summary:
      `${productName('company', 'en')}; clinic panel ${productName('health', 'en')} and patient booking ${productName('booking', 'en')} in one ecosystem — web panel, discovery, and reservations.`,
    appStore: 'Join store waitlist',
    playStore: 'Join store waitlist',
    queue: 'Join the waitlist for store release updates',
    newsletter: 'Subscribe to Newsletter',
    newsletterDesc: 'Product milestones, operational guides, and growth tactics.',
    placeholder: 'you@clinic.com',
    subscribe: 'Subscribe',
    saved: 'Thanks! You’re subscribed to our newsletter.',
    notSaved: 'We only send useful updates.',
    copyright: copyrightLine(2026, 'en'),
    language: 'English / Turkish',
  },
} as const

export function SiteFooter() {
  const { locale, setLocale } = useLandingLocale()
  const copy = FOOTER_COPY[locale]

  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data: { success?: boolean; error?: string } = await res.json()

      if (!res.ok || !data.success) {
        setError(
          data.error ??
            (locale === 'tr'
              ? 'Abonelik oluşturulamadı. Lütfen tekrar deneyin.'
              : 'Could not subscribe. Please try again.')
        )
        return
      }

      setSaved(true)
      setEmail('')
    } catch {
      setError(
        locale === 'tr'
          ? 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.'
          : 'Connection error. Please check your connection.'
      )
    } finally {
      setLoading(false)
    }
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
              <Link
                href="/#waitlist"
                className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm transition-colors hover:border-[#0071E3]/30 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <Apple className="h-5 w-5 text-[#1D1D1F]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">App Store</p>
                    <p className="text-xs font-bold text-[#1D1D1F]">{copy.appStore}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#0071E3]" />
              </Link>

              <Link
                href="/#waitlist"
                className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-4 py-3 shadow-sm transition-colors hover:border-[#0071E3]/30 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-[#1D1D1F]" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Google Play</p>
                    <p className="text-xs font-bold text-[#1D1D1F]">{copy.playStore}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#0071E3]" />
              </Link>
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
                    setError('')
                  }}
                  required
                  disabled={loading}
                  placeholder={copy.placeholder}
                  className="h-11 rounded-xl border border-black/10 bg-white/80 px-4 text-sm outline-none transition focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/10 flex-1 disabled:opacity-60"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 rounded-xl bg-[#0071E3] hover:bg-[#0063C8] px-5 text-sm font-bold text-white transition active:scale-[0.98] shrink-0 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      {locale === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {copy.subscribe}
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="flex flex-col items-stretch gap-2 lg:items-end">
                <p className="text-xs font-semibold text-[#5D6068]">{MASTERBRAND.socialHandle}</p>
                <div className="flex items-center gap-2 lg:justify-end">
                  {socialLinks().map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="tap-target rounded-xl border border-black/5 bg-white/80 p-2.5 text-[#1D1D1F] shadow-sm transition duration-300 hover:scale-[1.05] hover:bg-slate-100"
                      aria-label={link.label}
                    >
                      {link.label === 'LinkedIn' ? (
                        <Linkedin className="h-4.5 w-4.5" />
                      ) : (
                        <Instagram className="h-4.5 w-4.5" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {saved && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-3 text-xs font-bold text-emerald-700"
                >
                  {copy.saved}
                </motion.p>
              )}
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
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
