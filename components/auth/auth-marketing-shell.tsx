'use client'

import React, { type ReactNode } from 'react'
import Link from 'next/link'
import { Globe } from 'lucide-react'

import { AsistanLogo } from '@/components/asistan-logo'
import { useLanguage } from '@/hooks/useLanguage'

/** Shared chrome for /tr/kayit, /tr/giris, /en/register, /en/login */
export function AuthMarketingShell({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#F6F7F9] text-[#1D1D1F] selection:bg-[#0071E3]/18">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-[#0071E3]/5 blur-[120px]" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.15]" />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Asistan home" className="inline-flex flex-col items-start">
          <AsistanLogo variant="dark" size="md" />
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]/70">
            Asistan Health
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition duration-[var(--motion-interaction-duration)] ease-[var(--motion-interaction-ease)] hover:border-[#0071E3] hover:text-[#0071E3]"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{language === 'tr' ? 'EN' : 'TR'}</span>
        </button>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      >
        {children}
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white/30 py-6 text-center text-xs text-[#86868B] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span>
            © 2026 Asistan Health.{' '}
            {t({ tr: 'Tüm hakları saklıdır.', en: 'All rights reserved.' })}
          </span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">
              {t({ tr: 'Gizlilik Sözleşmesi', en: 'Privacy Policy' })}
            </Link>
            <Link href="/terms" className="hover:underline">
              {t({ tr: 'Kullanım Koşulları', en: 'Terms of Service' })}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
