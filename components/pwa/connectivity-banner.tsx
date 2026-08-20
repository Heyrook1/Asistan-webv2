'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

/**
 * Soft connectivity + stale-data hint for the patient shell.
 * Does not block navigation; clarifies when lists may be outdated.
 */
export function ClientConnectivityBanner() {
  const { t } = useLanguage()
  const [online, setOnline] = useState(true)
  const [reconnectedHint, setReconnectedHint] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setOnline(navigator.onLine)

    let reconnectTimer: number | undefined

    const onOffline = () => {
      setOnline(false)
      setReconnectedHint(false)
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
    }

    const onOnline = () => {
      setOnline(true)
      setReconnectedHint(true)
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      reconnectTimer = window.setTimeout(() => setReconnectedHint(false), 5000)
    }

    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
    }
  }, [])

  if (online && !reconnectedHint) return null

  return (
    <div
      className={cn(
        'mb-3 rounded-xl px-3 py-2.5 text-xs font-semibold leading-5',
        online
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border border-amber-200 bg-amber-50 text-amber-950',
      )}
      role="status"
      aria-live="polite"
    >
      {online ? (
        t({
          tr: 'Bağlantı geldi — müsaitlik ve randevu listeleri yenileniyor. Kısa süre eski veri görünebilir.',
          en: 'Back online — availability and bookings are refreshing. You may briefly see stale data.',
        })
      ) : (
        <span className="inline-flex items-start gap-2">
          <WifiOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            {t({
              tr: 'Çevrimdışısınız. Klinik arama ve randevu için bağlantı gerekir; açık sayfadaki bilgiler güncel olmayabilir.',
              en: 'You are offline. Clinic search and booking need a connection; data on this screen may be stale.',
            })}
          </span>
        </span>
      )}
    </div>
  )
}
