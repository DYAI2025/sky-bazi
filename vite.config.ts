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
    },
  },
  preview: { port: 3002 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          markdown: ["react-markdown", "remark-gfm"],
        },
      },
    },
  },
});
