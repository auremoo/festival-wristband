const CACHE_NAME = 'festival-wristband-v1'
const BASE = '/festival-wristband/'

// Populated at build time by scripts/inject-sw-precache.mjs
const PRECACHE_URLS = []

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS.length ? PRECACHE_URLS : [BASE + 'manifest.json'])
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Never cache third-party requests (map tiles, weather API) — let them hit the network.
  if (url.origin !== self.location.origin) return

  // Navigation requests (HTML pages): network-first so new deploys are always picked up
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // All other same-origin assets: cache-first (precached), stale-while-revalidate for the rest
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()))
          }
          return response
        })
        .catch(() => cached)

      return cached || fetchPromise
    })
  )
})
