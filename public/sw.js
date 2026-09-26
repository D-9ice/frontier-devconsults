// Frontier DevConsults service worker.
// Dynamic HTML, Next.js RSC payloads and mutable public media must always come from the network.
const CACHE_NAME = 'frontier-devconsults-v4';
const STATIC_CACHE = 'frontier-static-v4';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((name) => {
        if (name !== CACHE_NAME && name !== STATIC_CACHE) return caches.delete(name);
        return Promise.resolve(false);
      })))
      .then(() => self.clients.claim())
  );
});

function isNextDataRequest(request, url) {
  return request.headers.get('RSC') === '1'
    || request.headers.has('Next-Router-Prefetch')
    || url.searchParams.has('_rsc');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  // Authenticated/admin/API traffic is never intercepted.
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/')) return;

  // Never cache pages or Next.js data. This prevents mobile/PWA clients from
  // showing an older Projects page, hero configuration or other stale UI.
  if (request.mode === 'navigate' || request.destination === 'document' || isNextDataRequest(request, url)) {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Mutable public images/media (including hero assets) must stay fresh.
  if (request.destination === 'image' || request.destination === 'video') {
    event.respondWith(fetch(request));
    return;
  }

  // Only immutable Next.js build assets are cached.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      })
    );
  }
});
