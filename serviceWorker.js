const version = 3;
const cacheName = `edutask-v${version}`;

const cacheAssets = [
  "index.html",
];

self.addEventListener("install", (event) => {
  console.log("Service worker is installed");

  /* caching all the assets during install event, this is also known as precaching */

  /* caches.open(cacheName) - this will create a new entry in the cache storage with the given cache name */

  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Caching assets");
        cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});
