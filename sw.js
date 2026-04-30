// Service Worker for Frontier Tech Investment Landscape
// Bump CACHE_VERSION whenever HTML is updated to force re-cache
const CACHE_VERSION = 'landscape-v1';

const PRECACHE_URLS = [
  './',
  './index.html'
];

// Install: precache the page itself
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Same-origin: stale-while-revalidate (instant cache, refresh in background)
// - Google Fonts: cache-first (rarely changes)
// - Everything else: network-first
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFonts = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';

  if (isSameOrigin) {
    // Stale-while-revalidate: serve cache immediately, update in background
    event.respondWith(
      caches.open(CACHE_VERSION).then(cache =>
        cache.match(req).then(cached => {
          const networkFetch = fetch(req).then(response => {
            if (response && response.ok) {
              cache.put(req, response.clone());
            }
            return response;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
  } else if (isGoogleFonts) {
    // Cache-first: fonts rarely change, serve from cache forever once loaded
    event.respondWith(
      caches.open(CACHE_VERSION).then(cache =>
        cache.match(req).then(cached => {
          if (cached) return cached;
          return fetch(req).then(response => {
            if (response && response.ok) {
              cache.put(req, response.clone());
            }
            return response;
          });
        })
      )
    );
  }
  // Other cross-origin requests: pass through to network as default
});
