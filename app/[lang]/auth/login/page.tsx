// app/[lang]/auth/login/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { AsistanLogo } from '@/components/asistan-logo'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

export default function LoginPage() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="relative min-h-screen bg-[#F6F7F9] text-[#1D1D1F] flex flex-col justify-between selection:bg-[#0071E3]/18">
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0071E3]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.15]" />

      {/* Header Bar */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" aria-label="Asistan home" className="inline-flex flex-col items-start">
          <AsistanLogo variant="dark" size="md" />
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0071E3]/70">
            Asistan Health
          </span>
        </Link>

        {/* Localized Lang switcher in auth header */}
        <button
          onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0071E3] hover:text-[#0071E3] transition duration-300 shadow-sm cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{language === 'tr' ? 'EN' : 'TR'}</span>
        </button>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <React.Suspense fallback={<div className="text-sm text-slate-500">…</div>}>
          <LoginForm />
        </React.Suspense>
      </main>

      {/* Small Clean Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-[#86868B] border-t border-slate-200 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>
            © {new Date().getFullYear()} Asistan Health. {t({ tr: 'Tüm hakları saklıdır.', en: 'All rights reserved.' })}
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
