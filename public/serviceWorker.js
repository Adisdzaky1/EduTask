const VERSION = 7;
const CACHE_NAME = `edutask-v${VERSION}`;
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",    // optional
  "/manifest.json",
  "/robots.txt",
  "/sitemap.xml",
  "/Screenshot_2025-08-31-06-30-37-12.jpg",
  "/icons/icon_384.png",
  "/icons/icon_512.png",
  "/icons/icon_1024.png",
  // tambahkan file statis di public lain jika perlu
];

self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // hanya GET
  if (req.method !== "GET") return;

  // Navigation (HTML)
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then(cached => {
        if (cached) {
          return cached; // cache-first
        }
        return fetch(req)
          .then(networkRes => {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
            return networkRes;
          })
          .catch(() => caches.match("/offline.html"));
      })
    );
    return;
  }

  // Static assets cache-first
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(networkRes => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
          return networkRes;
        });
      })
    );
  }
});
