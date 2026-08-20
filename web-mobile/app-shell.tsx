'use client'

import type { ReactNode } from 'react'

import { ClientBottomNav } from '@/components/client/bottom-nav'
import { ClientConnectivityBanner } from '@/components/pwa/connectivity-banner'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { RezervasyonTopBar } from '@/web-mobile/top-bar'
import { cn } from '@/lib/utils'

/** Optional client chrome helper — prefer `app/client/layout.tsx` for the live shell. */
export function RezervasyonAppShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      data-rz-shell="v3"
      className={cn(
        'rezervasyon-shell relative min-h-dvh overflow-x-hidden bg-[#F7F9FC]',
        className,
      )}
    >
      <div className="relative mx-auto flex w-full max-w-[480px] flex-col px-4 pb-[var(--rz-dock-clearance)] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <RezervasyonTopBar />
        <div className="mt-3">
          <ClientConnectivityBanner />
        </div>
        <div className="mt-4 flex-1">{children}</div>
      </div>
      <InstallPrompt placement="above-dock" requireEngagement className="mt-0" />
      <ClientBottomNav />
    </div>
  )
}
