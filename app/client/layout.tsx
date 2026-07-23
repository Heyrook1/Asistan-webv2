import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { ClientBottomNav } from '@/components/client/bottom-nav'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { normalizeAuthLanguage } from '@/lib/auth-routes'
import { withCanonical } from '@/lib/seo'
import { ClientLanguageBoundary } from '@/web-mobile/client-language-boundary'
import { RezervasyonTopBar } from '@/web-mobile/top-bar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = withCanonical('/client', {
  title: {
    default: 'Klinik bul ve randevu al',
    template: '%s | Asistan Rezervasyon',
  },
  description:
    'Asistan Rezervasyon: KKTC klinikleri puan, fiyat ve müsaitliğe göre karşılaştırın; randevu talebi oluşturun. Ana ekrana ekleyerek uygulama gibi kullanın.',
  appleWebApp: {
    capable: true,
    title: 'Asistan Rezervasyon',
    statusBarStyle: 'default',
  },
  openGraph: {
    locale: 'tr_CY',
    title: 'Klinik bul ve randevu al | Asistan Rezervasyon',
    description:
      'Hasta randevusu PWA — ana ekrana ekleyin. Klinik paneli ile aynı ekosistemde keşfedin, müsaitlik görün, randevu alın.',
  },
})

/**
 * Server-rendered shell frame + client islands (top bar / install / dock).
 * Local LanguageProvider keeps Turbopack from desyncing root context vs /client islands.
 */
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const lang = normalizeAuthLanguage(cookieStore.get('asistan-lang')?.value)

  return (
    <ClientLanguageBoundary initialLanguage={lang}>
      <div
        data-rz-shell="v3"
        className="rezervasyon-shell relative min-h-dvh overflow-x-hidden bg-[#F4F6F9]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[52vh] bg-[radial-gradient(85%_65%_at_50%_-8%,rgba(0,113,227,0.14),transparent_68%)]"
        />
        <div className="relative mx-auto flex w-full max-w-screen-sm flex-col px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] md:max-w-[480px] md:px-5 md:shadow-[0_0_40px_rgba(15,23,42,0.08)]">
          <RezervasyonTopBar />
          <div className="mt-3 flex-1 space-y-4 md:mt-4">
            {children}
            <InstallPrompt />
          </div>
        </div>
        <ClientBottomNav />
      </div>
    </ClientLanguageBoundary>
  )
}
