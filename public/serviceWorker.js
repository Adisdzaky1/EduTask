// public/sw.js
const VERSION = 2;
const CACHE_NAME = `edutask-v${VERSION}`;

// precache: masukkan file di /public yang namanya tidak berubah
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
];

// install -> precache
self.addEventListener("install", (event) => {
  console.log("[SW] install");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => {
        console.warn("[SW] precache gagal:", err);
      })
      .then(() => self.skipWaiting())
  );
});

// activate -> hapus cache lama dan klaim klien
self.addEventListener("activate", (event) => {
  console.log("[SW] activate");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// fetch -> strategi:
// - navigation (HTML): network-first, fallback ke cache (berguna untuk SPA)
// - asset requests: cache-first
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // only handle GET requests
  if (req.method !== "GET") return;

  // navigation requests (HTML pages)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // jika berhasil, update cache
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match("/offline.html").then((cached) => cached || caches.match("/index.html"))
        )
    );
    return;
  }

  // for same-origin static assets: cache-first
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          // cache furtively (don't block response)
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // ignore opaque responses if you want
            try { cache.put(req, resClone); } catch (e) {}
          });
          return res;
        }).catch(() => {
          // optional: return offline image for images, etc.
          return caches.match("/offline.html");
        });
      })
    );
  }
});
