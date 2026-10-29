/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
  // Cloudflare Pages bakes VITE_ variables into the browser bundle at build time.
  // A loopback URL would point to each visitor's own machine after deployment.
  const env = loadEnv(mode, ".", ["CF_PAGES", "VITE_"]);
  if (command === "build" && env.CF_PAGES === "1") {
    const value = env.VITE_API_BASE_URL?.trim();
    let apiUrl: URL;
    try {
      apiUrl = new URL(value ?? "");
    } catch {
      throw new Error("Set VITE_API_BASE_URL in Cloudflare Pages to your public HTTPS backend origin.");
    }
    if (apiUrl.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(apiUrl.hostname) ||
      apiUrl.pathname.replace(/\/+$/, "") !== "") {
      throw new Error("VITE_API_BASE_URL must be a public HTTPS backend origin without /api/v1.");
    }
  }

  return {
  plugins: [
    react(),
    // Installable PWA. `injectRegister: "auto"` adds /registerSW.js to index.html at build time, so
    // nothing in src/ imports the virtual service-worker module and the jsdom tests stay untouched.
    // `registerType: "autoUpdate"` lets a new deployment take over on the next visit.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      // Icons are cropped from public/favicon.svg; keep them listed so they are precached too.
      includeAssets: [
        "favicon.svg",
        "hargaikan-logo.png",
        "pwa-64x64.png",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        id: "/",
        name: "HargaIkan",
        short_name: "HargaIkan",
        description:
          "Reference prices for fish in Kuala Lumpur: historical price ranges, forecasts and travel cost.",
        lang: "en",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#f5f5f7",
        background_color: "#f5f5f7",
        categories: ["food", "shopping", "finance"],
        icons: [
          { src: "/pwa-64x64.png", sizes: "64x64", type: "image/png", purpose: "any" },
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          // Full-bleed artwork, so an Android launcher may crop it to any mask shape.
          { src: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Fish finder", short_name: "Fish finder", url: "/cari" },
          { name: "Travel cost", short_name: "Travel", url: "/perjalanan" },
        ],
      },
      workbox: {
        // The app shell only. API responses are deliberately NOT cached: a price or forecast served
        // from the cache would appear without the period it was published for.
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        // The Three.js chunk on the homepage is larger than Workbox's 2 MiB default.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // A stale map tile is harmless (it is imagery, not a price), and this keeps the map
            // usable offline for areas the visitor has already looked at.
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles",
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  // Keeps module ids at the symlinked path when node_modules is a junction on another drive.
  resolve: { preserveSymlinks: true },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  preview: { port: 4173 },
  build: { outDir: "dist", sourcemap: false },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
  };
});
