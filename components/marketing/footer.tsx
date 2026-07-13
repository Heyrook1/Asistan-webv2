'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Mail, Shield, Users, Globe, Lock } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/hooks/useLanguage'
import { DEMO_CONTACT_PATH, ENTRY_CTA } from '@/lib/entry-routes'

function buildFooterLinks(_language: 'tr' | 'en') {
  return [
  {
    title: 'Urun',
    links: [
      { label: 'Ozellikler', href: '/urun' },
      { label: 'Nasil Calisir?', href: '/urun#nasil-calisir' },
      { label: 'Fiyatlandirma', href: '/fiyatlandirma' },
      { label: 'Guncellemeler', href: '/kaynaklar' },
    ],
  },
  {
    title: 'Cozumler',
    links: [
      { label: 'Klinik Sahipleri', href: '/cozumler/health' },
      { label: 'Doktorlar', href: '/cozumler/health' },
      { label: 'Sekreterler', href: '/cozumler/health' },
      { label: 'Tum Cozumler', href: '/cozumler' },
    ],
  },
  {
    title: 'Sirket',
    links: [
      { label: 'Hakkimizda', href: '/hakkimizda' },
      { label: 'Guven Merkezi', href: '/guven' },
      { label: 'Gizlilik Politikasi', href: '/privacy' },
      { label: 'Kullanim Kosullari', href: '/terms' },
      { label: 'Iletisim', href: '/contact' },
    ],
  },
  {
    title: 'Destek',
    links: [
      { label: 'SSS', href: '/fiyatlandirma#sss' },
      { label: 'Destek Merkezi', href: '/kaynaklar' },
      { label: 'İletişim', href: DEMO_CONTACT_PATH },
      { label: ENTRY_CTA.demoRequest.tr, href: DEMO_CONTACT_PATH },
    ],
  },
]
}

const trustBadges = [
  { icon: Shield, label: 'KVKK' },
  { icon: Lock, label: 'Guvenli Altyapi' },
  { icon: Users, label: 'Rol Bazli Erisim' },
  { icon: Globe, label: 'KKTC Odakli' },
]

export function Footer() {
  const { language } = useLanguage()
  const footerLinks = buildFooterLinks(language)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  return (
    <footer className="bg-brand-navy text-white">
      <div className="border-t border-white/10">
        <div className="marketing-container py-14">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))]">
            <div>
              <Link href="/" className="inline-flex items-center" aria-label="Asistan ana sayfa">
                <AsistanLogo variant="light" size="md" />
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
                Klinik ve randevu yonetim platformu. Saglik ekiplerinin gunluk operasyonunu daha sakin hale getirir.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {trustBadges.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/80"
                  >
                    <item.icon className="size-3.5 text-brand-cyan" aria-hidden="true" />
                    {item.label}
                  </span>
                ))}
              </div>
              <a
                href="mailto:merhaba@asistan.online"
                className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <Mail className="size-4" aria-hidden="true" />
                merhaba@asistan.online
              </a>
            </div>

            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="mb-4 text-sm font-bold text-white">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Bultene abone olun</h4>
              <p className="mb-4 text-xs leading-6 text-white/60">Yenilikleri ve urun duyurularini e-posta ile alin.</p>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  setEmail('')
                  setStatus('success')
                }}
              >
                <Input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setStatus('idle')
                  }}
                  placeholder="E-posta adresiniz"
                  autoComplete="email"
                  className="h-10 rounded-lg border-white/15 bg-white/10 text-sm text-white placeholder:text-white/50 focus:border-brand-cyan focus:ring-brand-cyan"
                  required
                />
                <Button type="submit" size="icon" className="size-10 rounded-lg bg-brand-blue text-white hover:bg-brand-blue/90" aria-label="Abone ol">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </form>
              <p className="mt-2 text-xs text-brand-cyan" role="status">
                {status === 'success' ? 'Kaydiniz alindi.' : 'Istediginiz zaman cikabilirsiniz.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="marketing-container flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 md:flex-row">
          <p>© 2026 Asistan. Tum haklari saklidir.</p>
          <div className="flex items-center gap-4">
            <Link href="/guven" className="hover:text-white">
              Guven Merkezi
            </Link>
            <Link href="/privacy" className="hover:text-white">
              KVKK
            </Link>
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3.5" />
              TR
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
