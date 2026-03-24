import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3002,
    proxy: {
      // Proxy JPL Sentry API to avoid CORS in dev
      "/api/sentry": {
        target: "https://ssd-api.jpl.nasa.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sentry/, "/sentry.api"),
      },
      // Proxy NOAA space weather APIs to avoid CORS in dev
      "/api/noaa-xray": {
        target: "https://services.swpc.noaa.gov",
        changeOrigin: true,
        rewrite: () => "/json/goes_xray_flux.json",
      },
      "/api/noaa-proton": {
        target: "https://services.swpc.noaa.gov",
        changeOrigin: true,
        rewrite: () => "/json/goes_proton_flux.json",
      },
    },
  },
  preview: { port: 3002 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          markdown: ["react-markdown", "remark-gfm"],
          astronomy: ["astronomy-engine"],
        },
      },
    },
  },
});
