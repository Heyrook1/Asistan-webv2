import type { ReactNode } from 'react'

import { Footer } from '@/components/marketing/footer'
import { SmoothScroll } from '@/components/marketing/motion-wrappers'
import { Navbar } from '@/components/marketing/navbar'
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
      <div className={cn('min-h-screen bg-white font-sans text-brand-dark selection:bg-brand-blue/20', className)}>
        <Navbar />
        <main className="marketing-page-enter">{children}</main>
        <Footer />
      </div>
    </SmoothScroll>
  )
}
