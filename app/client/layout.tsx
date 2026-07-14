import type { Metadata } from 'next'

import { ClientBottomNav } from '@/components/client/bottom-nav'
import { ClientBrandBar } from '@/components/client/client-brand-bar'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { withCanonical } from '@/lib/seo'

export const metadata: Metadata = withCanonical('/client', {
  title: {
    default: 'Klinik bul ve randevu al',
    template: '%s | Asistan',
  },
  description:
    'Asistan hasta randevusu: KKTC klinikleri puan, fiyat ve müsaitliğe göre karşılaştırın; randevu talebi oluşturun. Klinik paneli ile aynı ekosistem.',
  openGraph: {
    locale: 'tr_CY',
    title: 'Klinik bul ve randevu al | Asistan',
    description:
      'Hasta randevusu ve klinik paneli aynı Asistan ekosisteminde. Klinikleri keşfedin, müsaitlik görün, randevu alın.',
  },
})

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-screen-sm px-5 pb-[calc(68px+env(safe-area-inset-bottom)+16px)] pt-4 md:max-w-5xl md:px-6 md:pb-10 md:pt-6">
        <ClientBrandBar />
        <InstallPrompt />
        {children}
      </div>
      <ClientBottomNav />
    </div>
  )
}
