'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AsistanIcon } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Mail, Shield, Users, Lock, MapPin } from 'lucide-react'

const footerLinks = [
  {
    title: 'Ürün',
    links: [
      { label: 'Özellikler', href: '/urun' },
      { label: 'Fiyatlandırma', href: '/fiyatlandirma' },
      { label: 'Kaynaklar', href: '/kaynaklar' },
    ],
  },
  {
    title: 'Çözümler',
    links: [
      { label: 'Asistan Health', href: '/cozumler/health' },
      { label: 'Beauty Yakında', href: '/cozumler' },
      { label: 'Hukuk Yakında', href: '/cozumler' },
      { label: 'Emlak Yakında', href: '/cozumler' },
    ],
  },
  {
    title: 'Şirket',
    links: [
      { label: 'Hakkımızda', href: '/hakkimizda' },
      { label: 'İletişim', href: '/contact' },
      { label: 'Erken Erişim', href: '/auth/sign-up' },
      { label: 'Giriş Yap', href: '/auth/login' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Gizlilik', href: '/privacy' },
      { label: 'Kullanım Koşulları', href: '/terms' },
    ],
  },
]

const trustBadges = [
  { icon: Shield, text: 'KVKK odaklı' },
  { icon: Lock, text: 'Gizlilik öncelikli' },
  { icon: Users, text: 'Rol bazlı erişim' },
  { icon: MapPin, text: 'KKTC odağı' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  return (
    <footer className="bg-[#06142A] text-white">
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-2">
              <Link href="/" className="mb-5 inline-flex items-center gap-3" aria-label="Asistan ana sayfa">
                <AsistanIcon size={36} />
                <span className="text-lg font-bold tracking-tight text-white">Asistan</span>
              </Link>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/65">
                KKTC’den başlayan, sağlık ve hizmet işletmeleri için AI destekli randevu ve iş yönetim platformu.
              </p>

              <div className="mb-6 flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <div key={badge.text} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5">
                    <badge.icon className="h-3.5 w-3.5 text-[#12C8AD]" />
                    <span className="text-[11px] font-semibold text-white/80">{badge.text}</span>
                  </div>
                ))}
              </div>

              <a
                href="mailto:merhaba@asistan.online"
                className="inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                merhaba@asistan.online
              </a>
            </div>

            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="mb-4 text-sm font-bold text-white">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.label}`}>
                      <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Mail className="h-4 w-4 text-[#12C8AD]" />
                </div>
                <h4 className="text-sm font-bold text-white">Güncel kalın</h4>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-white/60">
                Asistan Health ve yeni sektör duyurularını e-posta ile alın.
              </p>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  setEmail('')
                  setStatus('success')
                }}
              >
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setStatus('idle')
                  }}
                  className="h-10 rounded-xl border-white/10 bg-white/10 text-sm text-white placeholder:text-white/45 focus:border-[#12C8AD] focus:ring-[#12C8AD]"
                  aria-label="E-posta adresiniz"
                  required
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-[#0B7F6F] hover:bg-[#09685C]" aria-label="Abone ol">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
              {status === 'success' ? (
                <p className="mt-2 text-xs font-medium text-[#12C8AD]" role="status">
                  Kaydınız alındı.
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-white/45">İstediğiniz zaman abonelikten çıkabilirsiniz.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row lg:px-8">
          <p className="text-sm text-white/50">© 2026 Asistan. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-5 text-sm text-white/50">
            <Link href="/hakkimizda" className="hover:text-white">
              Şirket
            </Link>
            <Link href="/kaynaklar" className="hover:text-white">
              Kaynaklar
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Gizlilik
            </Link>
            <Link href="/terms" className="hover:text-white">
              Koşullar
            </Link>
            <Link href="/auth/sign-up" className="font-medium text-[#12C8AD] hover:text-white">
              Erken Erişim
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
