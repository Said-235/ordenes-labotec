import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      devOptions: { enabled: false },
      manifest: {
        name: 'LABOTEC Órdenes de Servicio',
        short_name: 'LABOTEC',
        description: 'Sistema de Órdenes de Servicio — LABOTEC Engineering Services',
        theme_color: '#4ECDC4',
        background_color: '#111111',
        display: 'standalone',
        start_url: '/',
        lang: 'es',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,jpg,jpeg,png,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: { outDir: 'dist' },
})
