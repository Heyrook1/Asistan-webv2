'use client'

import { useEffect, useState } from 'react'
import type { ToasterProps } from 'sonner'

import { Toaster } from '@/components/ui/sonner'

/**
 * Mounts Sonner only after client hydration — safe to import from Server Components
 * (unlike next/dynamic with ssr: false).
 */
export function ClientToaster(props: ToasterProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return <Toaster {...props} />
}
