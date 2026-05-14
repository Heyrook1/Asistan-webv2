import Link from 'next/link'
import { AsistanLogo } from '@/components/asistan-logo'

const footerLinks = [
  {
    title: 'Ürün',
    links: [
      { label: 'Özellikler', href: '/#ozellikler' },
      { label: 'Fiyatlar', href: '/fiyatlandirma' },
      { label: 'Entegrasyonlar', href: '/#entegrasyonlar' },
      { label: 'API', href: '/#api' },
    ]
  },
  {
    title: 'Şirket',
    links: [
      { label: 'Hakkımızda', href: '/hakkimizda' },
      { label: 'Blog', href: '/kaynaklar' },
      { label: 'Kariyer', href: '#' },
      { label: 'İletişim', href: '#' },
    ]
  },
  {
    title: 'Destek',
    links: [
      { label: 'Yardım Merkezi', href: '#' },
      { label: 'Dokümantasyon', href: '#' },
      { label: 'SSS', href: '#' },
      { label: 'İletişim', href: '#' },
    ]
  },
]

export function Footer() {
  return (
    <footer className="bg-[#0B1828] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <AsistanLogo variant="light" className="mb-6" />
            <p className="text-[#5E6A78] text-sm leading-relaxed max-w-sm">
              Kuzey Kıbrıs&apos;ın ilk ve tek AI destekli klinik yönetim platformu. 
              Modern, güvenli ve kullanımı kolay.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link 
                      href={link.href}
                      className="text-[#5E6A78] hover:text-[#1BD1B5] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#1E3448] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5E6A78]">
            © 2026 Asistan. Tüm hakları saklıdır.
          </p>
          <Link 
            href="https://asistan.com.tr" 
            className="text-sm text-[#1BD1B5] hover:text-[#1BD1B5]/80 transition-colors font-medium"
          >
            asistan.com.tr
          </Link>
        </div>
      </div>
    </footer>
  )
}
