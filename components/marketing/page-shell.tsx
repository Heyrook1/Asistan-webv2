import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/sections/site-footer'
import { SiteHeader } from '@/components/sections/site-header'
import { SmoothScroll } from '@/components/marketing/motion-wrappers'
import { cn } from '@/lib/utils'

export function MarketingPageShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <SmoothScroll>
      <div
        className={cn(
          'min-h-screen bg-[#F6F7F9] text-[#1D1D1F] selection:bg-[#0071E3]/18',
          className,
        )}
      >
        <div className="noise-overlay pointer-events-none fixed inset-0 opacity-[0.18]" />
        <SiteHeader variant="site" />
        <main id="main-content" tabIndex={-1} className="marketing-page-enter">{children}</main>
        <SiteFooter />
      </div>
    </SmoothScroll>
  )
}
