'use client'

import { useEffect } from 'react'

/**
 * Registers the shared PWA / push service worker sitewide.
 * Skips registration in development and clears any existing SW/caches so
 * Turbopack HMR cannot hydrate against stale `/_next` chunks.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister()
      })
      if ('caches' in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) void caches.delete(key)
        })
      }
      return
    }

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
