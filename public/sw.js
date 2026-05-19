// Asistan Health — Web Push service worker (placeholder).
//
// Real Web Push delivery requires a VAPID key pair plus a backend that signs
// POSTs to each subscription's endpoint. This file is the browser-side piece;
// it stays passive until the backend starts sending notifications.
//
// TODO(backend): when external VAPID keys land, wire a server action to
// dispatch payloads via `web-push` (Node) and store the VAPID public key in
// `NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY`. Do **not** commit the private key —
// it must be a server-only env var.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data = { title: 'Asistan', body: 'Yeni bildiriminiz var', url: '/dashboard/bildirimler' }
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() }
    } catch (_err) {
      data = { ...data, body: event.data.text() }
    }
  }
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'asistan-notification',
    data: { url: data.url },
  }
  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/dashboard/bildirimler'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client && client.url.includes(url)) return client.focus()
        }
        if (self.clients.openWindow) return self.clients.openWindow(url)
      })
  )
})
