'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AsistanIcon } from '@/components/asistan-logo'
import { ChevronDown, Menu, X } from 'lucide-react'

const navItems = [
  { href: '/urun', label: 'Ürün' },
  { href: '/cozumler', label: 'Çözümler' },
  { href: '/fiyatlandirma', label: 'Fiyatlandırma' },
  { href: '/kaynaklar', label: 'Kaynaklar' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
]

const solutionItems = [
  { href: '/cozumler/health', label: 'Asistan Health', status: 'Aktif' },
  { href: '/cozumler', label: 'Beauty', status: 'Yakında' },
  { href: '/cozumler', label: 'Hukuk', status: 'Yakında' },
  { href: '/cozumler', label: 'Emlak', status: 'Yakında' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const solutionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setSolutionsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSolutionsOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-xl' : 'bg-white/95 backdrop-blur-md'
      }`}
      aria-label="Ana menü"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Asistan ana sayfa">
            <AsistanIcon size={34} priority />
            <span className="text-lg font-bold tracking-tight text-[#06142A]">Asistan</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const isSolutions = item.href === '/cozumler'

              if (isSolutions) {
                return (
                  <div
                    key={item.href}
                    className="relative"
                    ref={solutionsRef}
                    onMouseEnter={() => setSolutionsOpen(true)}
                  >
                    <button
                      type="button"
                      className={`relative flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                        active ? 'text-[#0B7F6F]' : 'text-gray-600 hover:text-[#06142A]'
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={solutionsOpen}
                      onClick={() => setSolutionsOpen((open) => !open)}
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
                      {active && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#0B7F6F]" />}
                    </button>
                    {solutionsOpen && (
                      <div className="absolute left-0 top-full mt-2 w-64 origin-top rounded-2xl border border-gray-100 bg-white p-2 shadow-xl transition-all duration-200">
                        <Link
                          href="/cozumler"
                          className="mb-1 block rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:bg-gray-50"
                          onClick={() => setSolutionsOpen(false)}
                        >
                          Tüm çözümler
                        </Link>
                        {solutionItems.map((solution) => (
                          <Link
                            key={`${solution.label}-${solution.status}`}
                            href={solution.href}
                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-[#06142A] hover:bg-gray-50"
                            onClick={() => setSolutionsOpen(false)}
                          >
                            <span>{solution.label}</span>
                            <span className="rounded-full bg-[#0B7F6F]/10 px-2 py-0.5 text-[10px] font-semibold text-[#0B7F6F]">
                              {solution.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-[#0B7F6F]' : 'text-gray-600 hover:text-[#06142A]'
                  }`}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#0B7F6F]" />}
                </Link>
              )
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium text-gray-600 hover:text-[#06142A]">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="rounded-full bg-[#0B7F6F] px-6 font-semibold text-white shadow-lg shadow-[#0B7F6F]/20 hover:bg-[#09685C]">
                Erken Erişim
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-[#06142A]" /> : <Menu className="h-6 w-6 text-[#06142A]" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-11 items-center justify-between rounded-xl px-4 py-3 ${
                    active ? 'bg-[#0B7F6F]/5 text-[#0B7F6F]' : 'text-gray-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="mt-2 border-t border-gray-100 pt-4">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Çözümler</p>
              {solutionItems.map((solution) => (
                <Link
                  key={`${solution.label}-mobile`}
                  href={solution.href}
                  className="flex min-h-11 items-center justify-between rounded-xl px-4 py-2 text-sm text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{solution.label}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px]">{solution.status}</span>
                </Link>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-4">
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-[#0B7F6F] text-white hover:bg-[#09685C]">
                  Erken Erişim
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
