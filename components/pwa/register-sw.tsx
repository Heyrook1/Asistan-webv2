'use client'

import { useEffect } from 'react'

/**
 * Registers the shared PWA / push service worker sitewide.
 * Safe to mount in root layout; no-ops when SW unsupported.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Ignore registration failures (private mode, unsupported, etc.)
      })
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
    }
  }, [])

  return null
}
