import type { Metadata } from 'next'

import { ClientBottomNav } from '@/components/client/bottom-nav'

export const metadata: Metadata = {
  title: {
    default: 'Find a clinic',
    template: '%s | Asistan',
  },
  description: 'Compare clinics by rating, price, and availability, then book an appointment.',
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-screen-sm px-5 pb-[calc(68px+env(safe-area-inset-bottom)+16px)] pt-5 md:max-w-5xl md:px-6 md:pb-10 md:pt-6">
        {children}
      </div>
      <ClientBottomNav />
    </div>
  )
}

