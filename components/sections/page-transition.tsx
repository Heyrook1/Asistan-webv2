'use client'

import type { ReactNode } from 'react'

/**
 * Marketing page enter — CSS only (no framer-motion on the LCP path).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="marketing-page-enter">{children}</div>
}
