'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, ArrowRight, Mail, Phone, Shield, Award, Lock } from 'lucide-react'

const footerLinks = [
  {
    title: 'Ürün',
    links: [
      { label: 'Takvim', href: '/#takvim' },
      { label: 'Randevu Yönetimi', href: '/#randevu' },
      { label: 'Hatırlatmalar', href: '/#hatirlatmalar' },
      { label: 'AI Asistan', href: '/#ai' },
    ]
  },
  {
    title: 'Çözümler',
    links: [
      { label: 'Asistan Health', href: '/cozumler#health' },
      { label: 'Asistan Beauty', href: '/cozumler#beauty' },
      { label: 'Asistan Legal', href: '/cozumler#legal' },
      { label: 'Asistan Pro', href: '/cozumler#pro' },
    ]
  },
  {
    title: 'Şirket',
    links: [
      { label: 'Hakkımızda', href: '/hakkimizda' },
      { label: 'Fiyatlandırma', href: '/fiyatlandirma' },
      { label: 'İletişim', href: '/iletisim' },
      { label: 'Blog', href: '/kaynaklar' },
    ]
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Gizlilik Politikası', href: '/gizlilik' },
      { label: 'Kullanım Şartları', href: '/kullanim-sartlari' },
      { label: 'KVKK', href: '/kvkk' },
      { label: 'Çerez Politikası', href: '/cerez-politikasi' },
    ]
  },
]

export function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-white">
      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-[#E8FAF7] to-[#F0FBF9] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Calendar className="w-8 h-8 text-[#12C8AD]" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-[#06142A] mb-1">
                İşinizi Asistan ile daha kolay yönetin.
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Randevu yönetimi, hatırlatmalar ve ekip organizasyonu için akıllı çözümünüz.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/sign-up">
              <Button className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold h-12 px-6 rounded-full shadow-lg shadow-[#12C8AD]/20">
                Ücretsiz Dene
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" className="border-[#06142A] text-[#06142A] hover:bg-[#06142A] hover:text-white font-semibold h-12 px-6 rounded-full">
                Demo Talep Et
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-7 gap-8 lg:gap-12">
            {/* Logo & Description */}
            <div className="col-span-2">
              <AsistanLogo variant="dark" className="mb-5" />
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Profesyoneller için yapay zeka destekli randevu ve iş yönetim platformu.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <Shield className="w-4 h-4 text-[#12C8AD]" />
                  <span className="text-xs font-semibold text-[#06142A]">KVKK Uyumlu</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <Lock className="w-4 h-4 text-[#12C8AD]" />
                  <span className="text-xs font-semibold text-[#06142A]">Güvenli Altyapı</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <Award className="w-4 h-4 text-[#12C8AD]" />
                  <span className="text-xs font-semibold text-[#06142A]">ISO 27001</span>
                </div>
              </div>

              {/* App Store Badges */}
              <div className="flex gap-3">
                <Link href="#" className="flex items-center gap-2 px-3 py-2 bg-[#06142A] rounded-xl hover:bg-[#0a1f3d] transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">App Store&apos;dan</div>
                    <div className="text-xs font-semibold text-white">indirin</div>
                  </div>
                </Link>
                <Link href="#" className="flex items-center gap-2 px-3 py-2 bg-[#06142A] rounded-xl hover:bg-[#0a1f3d] transition-colors">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">Google Play&apos;den</div>
                    <div className="text-xs font-semibold text-white">alın</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Links */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-[#06142A] font-bold mb-4 text-sm">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-gray-600 hover:text-[#12C8AD] transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div className="col-span-2 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#12C8AD]/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#12C8AD]" />
                </div>
                <h4 className="text-[#06142A] font-bold text-sm">Güncel kalın</h4>
              </div>
              <p className="text-gray-600 text-xs mb-4 leading-relaxed">
                Ürün güncellemeleri, ipuçları ve profesyonel iş akışı içgörüleri için abone olun.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm border-gray-200 rounded-xl focus:border-[#12C8AD] focus:ring-[#12C8AD]"
                />
                <Button 
                  size="icon"
                  className="h-10 w-10 bg-[#12C8AD] hover:bg-[#10b89e] shrink-0 rounded-xl"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-400 text-[10px] mt-2">
                E-postanız güvende. İstediğiniz zaman abonelikten çıkabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="text-sm text-gray-500">
                © 2026 Asistan. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center gap-6">
                <a href="mailto:hello@asistan.com.tr" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#12C8AD] transition-colors">
                  <Mail className="w-4 h-4" />
                  hello@asistan.com.tr
                </a>
                <a href="tel:+908501234567" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#12C8AD] transition-colors">
                  <Phone className="w-4 h-4" />
                  +90 850 123 45 67
                </a>
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* LinkedIn */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#12C8AD] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#12C8AD] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#12C8AD] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z"/>
                </svg>
              </a>
              {/* X (Twitter) */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#12C8AD] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
