// public/sw.js
const VERSION = 1;
const CACHE_NAME = `edutask-cache-v${VERSION}`;

const PRECACHE_ASSETS = [
  '/',                // sangat penting: root
  '/index.html',
  '/offline.html',    // halaman fallback saat offline
  '/favicon.ico',
  '/manifest.json',
  // tambahkan file statis lain yang ada di /public, misalnya:
  // '/styles.css',
  // '/main.js',
  // '/icons/icon_192.png',
];

// Install: precache assets
self.addEventListener('install', (event) => {
  console.log('[SW] install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error('[SW] precache gagal:', err);
      })
  );
});

// Activate: hapus cache lama dan ambil alih klien segera
self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] delete old cache', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: strategi
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // hanya GET yang kita tangani
  if (req.method !== 'GET') return;

  // Treat navigation requests (HTML) specially:
  // - check cache first (ignore search/query)
  // - if cached -> return cache
  // - else try network and cache the result
  // - if network fails -> return /offline.html
  const isNavigation = req.mode === 'navigate' ||
    (req.headers.get('accept') && req.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        if (cached) {
          return cached;
        }
        // not in cache -> try network
        return fetch(req)
          .then((networkRes) => {
            // cache network response (non-blocking)
            try {
              const copy = networkRes.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
            } catch (e) {
              // ignore cache put errors
            }
            return networkRes;
          })
          .catch(() => {
            // network failed -> fallback ke index.html kalau ada, jika tidak ada -> offline.html
            return caches.match('/offline.html', { ignoreSearch: true }).then((i) => i || caches.match('/offline.html'));
          });
      })
    );
    return;
  }

  // For other same-origin requests (assets), try cache first, then network
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((networkRes) => {
            // cache non-html assets for future use
            try {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
            } catch (e) { /* ignore */ }
            return networkRes;
          })
          .catch(() => {
            // fallback for image or other asset could be /offline.html or nothing
            // return caches.match('/offline.html');
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
    );
  }
});
