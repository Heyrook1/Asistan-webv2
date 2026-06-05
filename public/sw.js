// Asistan Health web push service worker.
//
// Delivery is handled by the server-side notification pipeline when VAPID
// environment variables are configured. This worker renders incoming payloads
// and deep-links users back into the dashboard.

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
