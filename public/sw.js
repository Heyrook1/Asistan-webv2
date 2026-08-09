// Asistan Health service worker — push notifications + light offline shell.
//
// Push delivery is handled server-side when VAPID keys are configured.
// Offline: precache shell assets only. Never cache /_next/* (avoids stale
// JS vs fresh SSR hydration mismatches under Turbopack / deploys).

const CACHE_VERSION = 'asistan-shell-v4'
const PRECACHE = ['/offline.html', '/images/icon-192.png', '/images/icon-512.png', '/images/apple-touch-icon.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

function isExcludedPath(pathname) {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/client') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/tr/') ||
    pathname.startsWith('/en/') ||
    pathname.startsWith('/auth')
  )
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/images/') ||
    pathname === '/offline.html' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.woff2')
  )
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isExcludedPath(url.pathname)) return

  // Navigations: network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/offline.html')
        return cached || Response.error()
      }),
    )
    return
  }

  // Same-origin static assets (images/fonts only): cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response
          const clone = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone))
          return response
        })
      }),
    )
  }
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
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    tag: data.tag || 'asistan-notification',
    data: { url: data.url },
  }
  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/dashboard/bildirimler'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client && client.url.includes(url)) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
