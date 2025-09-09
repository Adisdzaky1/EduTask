// public/sw.js
const VERSION = 2; // naikkan saat update
const CACHE_NAME = `edutask-cache-v${VERSION}`;

const PRECACHE_ASSETS = [
  '/',                // root
  '/index.html',
  '/offline.html',    // wajib ada
  '/favicon.ico',
  '/manifest.json',
  // tambahkan file public lain kalau perlu:
  // '/styles.css', '/icons/icon_192.png', ...
];

// INSTALL: precache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] precache error', err))
  );
});

// ACTIVATE: hapus cache lama, klaim client
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// FETCH: strategi navigasi -> cache-first then network then offline.html
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // hanya handle GET
  if (req.method !== 'GET') return;

  // Deteksi navigasi (halaman)
  const isNavigation = req.mode === 'navigate' ||
    (req.headers.get('accept') && req.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      // 1) coba ambil dari cache (ignore query)
      caches.match(req, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;

        // 2) coba network
        return fetch(req).then(networkRes => {
          // simpan copy ke cache (non-blocking)
          try {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          } catch (e) {}
          return networkRes;
        }).catch(() => {
          // 3) jika network gagal -> fallback ke /offline.html
          return caches.match('/offline.html', { ignoreSearch: true });
        });
      })
    );
    return;
  }

  // Untuk asset same-origin: cache-first lalu network
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(networkRes => {
          try {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          } catch (e) {}
          return networkRes;
        }).catch(() => {
          // fallback kosong untuk asset
          return new Response('', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
  }
});
