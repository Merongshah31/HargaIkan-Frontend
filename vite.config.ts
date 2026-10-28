/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

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
  plugins: [react()],
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
