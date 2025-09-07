// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const manifest = {
  name: "EduTask",
  description: "EduTask adalah aplikasi yang mempermudah dalam mengelola tugas harian anda",
  theme_color: "#ffffff",
  background_color: "#ffffff",
  display: "standalone",
  orientation: "any",
  scope: "/",
  start_url: "/",
  icons: [
    { src: "icons/icon_72.png", sizes: "72x72", type: "image/png", purpose: "any" },
    { src: "icons/icon_96.png", sizes: "96x96", type: "image/png", purpose: "any" },
    { src: "icons/icon_128.png", sizes: "128x128", type: "image/png", purpose: "any" },
    { src: "icons/icon_144.png", sizes: "144x144", type: "image/png", purpose: "any" },
    { src: "icons/icon_152.png", sizes: "152x152", type: "image/png", purpose: "any" },
    { src: "icons/icon_192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "icons/icon_384.png", sizes: "384x384", type: "image/png", purpose: "any" },
    { src: "icons/icon_512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "icons/icon_1024.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
    { src: "icons/maskable_192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: "icons/maskable_512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ],
  short_name: "EduTask",
  id: "EduTask",
  dir: "auto",
  lang: "id",
  categories: ["books","personalization"]
};

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        // pastikan icon di bawah ada di folder public/icons/
        "icons/icon_72.png",
        "icons/icon_96.png",
        "icons/icon_128.png",
        "icons/icon_144.png",
        "icons/icon_152.png",
        "icons/icon_192.png",
        "icons/icon_384.png",
        "icons/icon_512.png",
        "icons/icon_1024.png",
        "icons/maskable_192.png",
        "icons/maskable_512.png",
        "offline.html"
      ],
      manifest,
      workbox: {
        // precache semua asset build sesuai pola
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        // fallback navigation untuk SPA:
        // gunakan index.html (default SPA). Jika mau pakai offline.html untuk route tak ter-cache,
        // ubah navigateFallback ke "/offline.html"
        navigateFallback: "/offline.html",

        // runtime caching: hanya asset (images/fonts) — **tidak ada** api/restApi
        runtimeCaching: [
          {
            // images: cache-first
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // fonts: stale-while-revalidate
            urlPattern: ({ request }) => request.destination === "font",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "fonts-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      },

      devOptions: {
        enabled: false // set true hanya jika mau uji PWA di dev server
      }
    })
  ]
});
