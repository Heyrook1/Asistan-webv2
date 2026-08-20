import type { Metadata } from 'next'
import { cookies } from 'next/headers'

import { ClientBottomNav } from '@/components/client/bottom-nav'
import { ClientConnectivityBanner } from '@/components/pwa/connectivity-banner'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { normalizeAuthLanguage } from '@/lib/auth-routes'
import { withCanonical } from '@/lib/seo'
import { ClientLanguageBoundary } from '@/web-mobile/client-language-boundary'
import { RezervasyonTopBar } from '@/web-mobile/top-bar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = withCanonical('/client', {
  title: {
    default: 'Klinik bul ve randevu al',
    template: '%s | Asistan',
  },
  description:
    'Asistan ile KKTC klinikleri, hizmetleri ve gerçek müsaitliği karşılaştırın; randevu talebi oluşturun. Ana ekrana ekleyerek uygulama gibi kullanın.',
  appleWebApp: {
    capable: true,
    title: 'Asistan',
    statusBarStyle: 'default',
  },
  openGraph: {
    locale: 'tr_CY',
    title: 'Klinik bul ve randevu al | Asistan',
    description:
      'Doğru kliniği bulun. Randevunuzu kolayca alın. KKTC’deki klinikleri, hizmetleri ve gerçek müsaitliği karşılaştırın.',
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
        className="rezervasyon-shell relative isolate min-h-dvh overflow-x-clip bg-[#F4F7FB]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[58vh] bg-[radial-gradient(78%_58%_at_50%_-6%,rgba(0,113,227,0.16),transparent_72%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] bg-[radial-gradient(72%_54%_at_50%_108%,rgba(14,165,233,0.08),transparent_72%)]"
        />
        <div className="relative mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col px-4 pb-[var(--rz-dock-clearance)] pt-0 md:max-w-[480px] md:bg-white/35 md:px-5 md:shadow-[0_0_50px_rgba(15,23,42,0.08)] md:ring-1 md:ring-white/70 md:backdrop-blur-sm">
          <RezervasyonTopBar />
          <div
            id="main-content"
            tabIndex={-1}
            className="mt-3 flex-1 space-y-4 outline-none has-[[data-rz-home]]:mt-0 md:mt-4 md:has-[[data-rz-home]]:mt-0"
          >
            <ClientConnectivityBanner />
            {children}
          </div>
        </div>
        <InstallPrompt placement="above-dock" requireEngagement />
        <ClientBottomNav />
      </div>
    </ClientLanguageBoundary>
  )
}
