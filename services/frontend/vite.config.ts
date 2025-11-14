import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // expose dev server to Docker network
    port: parseInt(process.env.VITE_DEV_PORT || "8080"),
    middlewareMode: false,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: parseInt(process.env.FRONTEND_DEV_PORT || "8080"),
    }
  }
})
