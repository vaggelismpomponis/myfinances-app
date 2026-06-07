import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    headers: {
      // Allow Google Sign-In popup to postMessage back to the opener
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    }
  },
  plugins: [
    react(),
    // Remove modulepreload hints for non-critical vendor chunks.
    // These chunks are still loaded when needed, but won't compete
    // for bandwidth with the LCP-critical CSS and main JS bundle.
    {
      name: 'remove-non-critical-modulepreload',
      enforce: 'post',
      transformIndexHtml(html) {
        return html.replace(
          /\s*<link rel="modulepreload"[^>]*(vendor-sentry|vendor-supabase|vendor-motion)[^>]*>\n?/g,
          ''
        );
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SpendWise',
        short_name: 'SpendWise',
        description: 'Track your income and expenses easily.',
        theme_color: '#4f46e5',
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
    // Target modern browsers for smaller, faster output
    target: 'esnext',
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

