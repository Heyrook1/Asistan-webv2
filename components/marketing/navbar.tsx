'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AsistanLogo } from '@/components/asistan-logo'
import { ChevronDown, Menu, X } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Ürün', hasDropdown: false },
  { href: '/cozumler', label: 'Çözümler', hasDropdown: true },
  { href: '/fiyatlandirma', label: 'Fiyatlandırma', hasDropdown: false },
  { href: '/kaynaklar', label: 'Kaynaklar', hasDropdown: true },
  { href: '/hakkimizda', label: 'Hakkımızda', hasDropdown: false },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <AsistanLogo variant="dark" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-[#12C8AD]' 
                      : 'text-gray-600 hover:text-[#06142A]'
                  }`}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#12C8AD]" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-600 hover:text-[#06142A] font-medium">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-[#12C8AD] hover:bg-[#10b89e] text-white font-semibold rounded-full px-6 shadow-lg shadow-[#12C8AD]/20">
                Ücretsiz Dene
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#06142A]" />
            ) : (
              <Menu className="w-6 h-6 text-[#06142A]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 shadow-lg">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                    isActive 
                      ? 'text-[#12C8AD] bg-[#12C8AD]/5' 
                      : 'text-gray-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </Link>
              )
            })}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 mt-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full rounded-full">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="w-full bg-[#12C8AD] hover:bg-[#10b89e] text-white rounded-full">
                  Ücretsiz Dene
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
