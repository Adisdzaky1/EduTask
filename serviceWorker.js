// serviceWorker.js
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");

// Hanya aktifkan debug di development
if (new URL(self.registration.scope).hostname === 'localhost') {
  workbox.setConfig({ debug: true });
}

const {
  routing: { registerRoute, setCatchHandler },
  strategies: { CacheFirst, NetworkFirst, StaleWhileRevalidate },
  cacheableResponse: { CacheableResponsePlugin },
  expiration: { ExpirationPlugin },
  precaching: { matchPrecache, precacheAndRoute },
} = workbox;

// Precaching
precacheAndRoute([
  { url: "/offline.html", revision: null },
  { url: "/icons/icon_512.png", revision: null },
  { url: "/manifest.json", revision: null }
]);

// Cache page navigations with Network First strategy
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 10 })
    ],
  })
);

// Cache static assets
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "worker",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 })
    ],
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ],
  })
);

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts",
    plugins: [new ExpirationPlugin({ maxEntries: 10 })]
  })
);

// Fallback untuk offline
setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    return matchPrecache("/offline.html");
  }
  return Response.error();
});

// Event listener untuk install
self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("Service Worker installed");
});

// Event listener untuk activate
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  console.log("Service Worker activated");
});
