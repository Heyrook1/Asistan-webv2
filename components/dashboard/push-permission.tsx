'use client'

import { useEffect, useState, useTransition } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from '@/lib/actions/push-subscriptions'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY ?? ''

type Permission = 'default' | 'granted' | 'denied' | 'unsupported'

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = typeof window !== 'undefined' ? window.atob(normalized) : ''
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

/**
 * Surfaces a button that registers the browser for Web Push. Subscription rows
 * are stored server-side; actual *delivery* is gated on a VAPID-enabled backend
 * (see TODOs in `public/sw.js`). Until then this still saves the subscription
 * for later use without breaking the UI.
 */
export function PushPermissionToggle() {
  const [permission, setPermission] = useState<Permission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as Permission)
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      setSubscribed(Boolean(sub))
    })
  }, [])

  async function ensureRegistration() {
    let reg = await navigator.serviceWorker.getRegistration('/sw.js')
    if (!reg) reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  }

  function handleEnable() {
    startTransition(async () => {
      try {
        const result = await Notification.requestPermission()
        setPermission(result as Permission)
        if (result !== 'granted') {
          toast.error('Bildirim izni reddedildi')
          return
        }
        const reg = await ensureRegistration()
        let sub = await reg.pushManager.getSubscription()
        if (!sub && VAPID_PUBLIC_KEY) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          })
        }
        if (!sub) {
          toast.message('Tarayıcı bildirimleri kayıt edildi', {
            description: 'Web Push sunucusu yapılandırıldıktan sonra etkinleşecek.',
          })
          setSubscribed(false)
          return
        }
        const payload = sub.toJSON() as { endpoint: string; keys?: { p256dh?: string; auth?: string } }
        const res = await registerPushSubscription({
          endpoint: payload.endpoint,
          p256dh: payload.keys?.p256dh ?? '',
          auth: payload.keys?.auth ?? '',
          userAgent: navigator.userAgent,
        })
        if (!res.ok) {
          toast.error(res.error)
          return
        }
        setSubscribed(true)
        toast.success('Tarayıcı bildirimleri açıldı')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Bildirimler etkinleştirilemedi')
      }
    })
  }

  function handleDisable() {
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js')
        const sub = await reg?.pushManager.getSubscription()
        if (sub) {
          await unregisterPushSubscription({ endpoint: sub.endpoint })
          await sub.unsubscribe()
        }
        setSubscribed(false)
        toast.success('Tarayıcı bildirimleri kapatıldı')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'İşlem tamamlanamadı')
      }
    })
  }

  if (permission === 'unsupported') return null

  if (subscribed) {
    return (
      <Button variant="outline" size="sm" onClick={handleDisable} disabled={pending} className="gap-1">
        <BellOff className="h-4 w-4" />
        Tarayıcı bildirimleri kapalı
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleEnable} disabled={pending} className="gap-1">
      <Bell className="h-4 w-4" />
      Tarayıcı bildirimlerini aç
    </Button>
  )
}
