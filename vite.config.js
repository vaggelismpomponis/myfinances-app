import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({

  // Force Vite to pre-bundle CJS packages that lack an ESM default export
  optimizeDeps: {
    include: ['react-joyride'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon.svg', 'spendwise-logo.png', 'spendwise-logo.webp', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'SpendWise',
        short_name: 'SpendWise',
        description: 'Track your income and expenses easily.',
        theme_color: '#ffffff',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'spendwise-logo.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Add Expense',
            short_name: 'Expense',
            description: 'Quickly log a new expense',
            url: '/?action=add-expense',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Add Income',
            short_name: 'Income',
            description: 'Quickly log a new income',
            url: '/?action=add-income',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  build: {
    // Disable source maps in production (security — avoids exposing source code)
    sourcemap: false,
    // Target ES2020 and Safari 14+ for flawless iOS WebKit compatibility
    target: ['es2020', 'safari14', 'ios14'],
    // Raise warning threshold (Capacitor apps naturally bundle more)
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and smaller initial bundle
        manualChunks: {
          'vendor-react':    ['react', 'react-dom'],
          'vendor-motion':   ['framer-motion'],
          'vendor-recharts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-sentry':   ['@sentry/react'],
          'vendor-tesseract': ['tesseract.js'],
          'vendor-tour':     ['react-joyride'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**', '**/e2e/**'],
  }
})

