// Service worker for caching static assets
const CACHE_NAME = 'unfoldd-v1'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/_next/static/',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Cache static assets
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(res => {
          if (!res || res.status !== 200 || res.type !== 'basic') {
            return res
          }
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone)
          })
          return res
        })
      })
    )
    return
  }

  // Network first for API calls and other requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }
})
