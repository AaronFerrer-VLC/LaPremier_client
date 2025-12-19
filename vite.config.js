import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'LA PREMIERE - Encuentra tu peli favorita',
        short_name: 'LA PREMIERE',
        description: 'Descubre las mejores películas y cines. Busca tu película favorita y encuentra el cine perfecto para disfrutarla.',
        theme_color: '#000000',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'https://res.cloudinary.com/dhluctrie/image/upload/v1731516947/favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'https://res.cloudinary.com/dhluctrie/image/upload/v1731516947/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['entertainment', 'movies'],
        screenshots: [],
        shortcuts: [
          {
            name: 'Películas',
            short_name: 'Películas',
            description: 'Ver todas las películas',
            url: '/peliculas',
            icons: [{ src: 'https://res.cloudinary.com/dhluctrie/image/upload/v1731516947/favicon.png', sizes: '96x96' }]
          },
          {
            name: 'Cines',
            short_name: 'Cines',
            description: 'Ver todos los cines',
            url: '/cines',
            icons: [{ src: 'https://res.cloudinary.com/dhluctrie/image/upload/v1731516947/favicon.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tmdb-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Disable PWA in dev mode for faster development
      }
    })
  ],
  server: {
    port: 5173,
    open: false,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          bootstrap: ['bootstrap', 'react-bootstrap'],
        },
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
})
