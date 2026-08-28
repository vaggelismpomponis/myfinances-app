// vite.config.js
import { defineConfig } from "file:///C:/Projects/SpendWise/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Projects/SpendWise/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///C:/Projects/SpendWise/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  server: {
    headers: {
      // Allow Google Sign-In popup to postMessage back to the opener
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
    }
  },
  plugins: [
    react(),
    // Remove modulepreload hints for non-critical vendor chunks.
    // These chunks are still loaded when needed, but won't compete
    // for bandwidth with the LCP-critical CSS and main JS bundle.
    {
      name: "remove-non-critical-modulepreload",
      enforce: "post",
      transformIndexHtml(html) {
        return html.replace(
          /\s*<link rel="modulepreload"[^>]*(vendor-sentry|vendor-supabase|vendor-motion)[^>]*>\n?/g,
          ""
        );
      }
    },
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "SpendWise",
        short_name: "SpendWise",
        description: "Track your income and expenses easily.",
        theme_color: "#4f46e5",
        background_color: "#0f0f0f",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "spendwise-logo.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable"
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
    target: "esnext",
    // Raise warning threshold (Capacitor apps naturally bundle more)
    chunkSizeWarningLimit: 2e3,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and smaller initial bundle
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-recharts": ["recharts"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-sentry": ["@sentry/react"],
          "vendor-tesseract": ["tesseract.js"]
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
    css: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/**", "**/e2e/**"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxQcm9qZWN0c1xcXFxTcGVuZFdpc2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFByb2plY3RzXFxcXFNwZW5kV2lzZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovUHJvamVjdHMvU3BlbmRXaXNlL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhlYWRlcnM6IHtcclxuICAgICAgLy8gQWxsb3cgR29vZ2xlIFNpZ24tSW4gcG9wdXAgdG8gcG9zdE1lc3NhZ2UgYmFjayB0byB0aGUgb3BlbmVyXHJcbiAgICAgICdDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeSc6ICdzYW1lLW9yaWdpbi1hbGxvdy1wb3B1cHMnLFxyXG4gICAgfVxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIC8vIFJlbW92ZSBtb2R1bGVwcmVsb2FkIGhpbnRzIGZvciBub24tY3JpdGljYWwgdmVuZG9yIGNodW5rcy5cclxuICAgIC8vIFRoZXNlIGNodW5rcyBhcmUgc3RpbGwgbG9hZGVkIHdoZW4gbmVlZGVkLCBidXQgd29uJ3QgY29tcGV0ZVxyXG4gICAgLy8gZm9yIGJhbmR3aWR0aCB3aXRoIHRoZSBMQ1AtY3JpdGljYWwgQ1NTIGFuZCBtYWluIEpTIGJ1bmRsZS5cclxuICAgIHtcclxuICAgICAgbmFtZTogJ3JlbW92ZS1ub24tY3JpdGljYWwtbW9kdWxlcHJlbG9hZCcsXHJcbiAgICAgIGVuZm9yY2U6ICdwb3N0JyxcclxuICAgICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcclxuICAgICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKFxyXG4gICAgICAgICAgL1xccyo8bGluayByZWw9XCJtb2R1bGVwcmVsb2FkXCJbXj5dKih2ZW5kb3Itc2VudHJ5fHZlbmRvci1zdXBhYmFzZXx2ZW5kb3ItbW90aW9uKVtePl0qPlxcbj8vZyxcclxuICAgICAgICAgICcnXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdhcHBsZS10b3VjaC1pY29uLnBuZycsICdtYXNrLWljb24uc3ZnJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1NwZW5kV2lzZScsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ1NwZW5kV2lzZScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdUcmFjayB5b3VyIGluY29tZSBhbmQgZXhwZW5zZXMgZWFzaWx5LicsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjNGY0NmU1JyxcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzBmMGYwZicsXHJcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxyXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJ3B3YS0xOTJ4MTkyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnc3BlbmR3aXNlLWxvZ28ucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxMDI0eDEwMjQnLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgZGV2T3B0aW9uczoge1xyXG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuICBidWlsZDoge1xyXG4gICAgLy8gRGlzYWJsZSBzb3VyY2UgbWFwcyBpbiBwcm9kdWN0aW9uIChzZWN1cml0eSBcdTIwMTQgYXZvaWRzIGV4cG9zaW5nIHNvdXJjZSBjb2RlKVxyXG4gICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgIC8vIFRhcmdldCBtb2Rlcm4gYnJvd3NlcnMgZm9yIHNtYWxsZXIsIGZhc3RlciBvdXRwdXRcclxuICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICAvLyBSYWlzZSB3YXJuaW5nIHRocmVzaG9sZCAoQ2FwYWNpdG9yIGFwcHMgbmF0dXJhbGx5IGJ1bmRsZSBtb3JlKVxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBNYW51YWwgY2h1bmsgc3BsaXR0aW5nIGZvciBiZXR0ZXIgY2FjaGluZyBhbmQgc21hbGxlciBpbml0aWFsIGJ1bmRsZVxyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6ICAgIFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgICAgICAgICAndmVuZG9yLW1vdGlvbic6ICAgWydmcmFtZXItbW90aW9uJ10sXHJcbiAgICAgICAgICAndmVuZG9yLXJlY2hhcnRzJzogWydyZWNoYXJ0cyddLFxyXG4gICAgICAgICAgJ3ZlbmRvci1zdXBhYmFzZSc6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXHJcbiAgICAgICAgICAndmVuZG9yLXNlbnRyeSc6ICAgWydAc2VudHJ5L3JlYWN0J10sXHJcbiAgICAgICAgICAndmVuZG9yLXRlc3NlcmFjdCc6IFsndGVzc2VyYWN0LmpzJ10sXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICBzZXR1cEZpbGVzOiAnLi9zcmMvdGVzdHMvc2V0dXAuanMnLFxyXG4gICAgY3NzOiB0cnVlLFxyXG4gICAgZXhjbHVkZTogWycqKi9ub2RlX21vZHVsZXMvKionLCAnKiovZGlzdC8qKicsICcqKi90ZXN0cy8qKicsICcqKi9lMmUvKionXSxcclxuICB9XHJcbn0pXHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXVQLFNBQVMsb0JBQW9CO0FBQ3BSLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBO0FBQUEsTUFFUCw4QkFBOEI7QUFBQSxJQUNoQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlOO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixTQUFTO0FBQUEsTUFDVCxtQkFBbUIsTUFBTTtBQUN2QixlQUFPLEtBQUs7QUFBQSxVQUNWO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsd0JBQXdCLGVBQWU7QUFBQSxNQUN0RSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFVBQ1I7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBQUEsSUFFTCxXQUFXO0FBQUE7QUFBQSxJQUVYLFFBQVE7QUFBQTtBQUFBLElBRVIsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsUUFFTixjQUFjO0FBQUEsVUFDWixnQkFBbUIsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUN4QyxpQkFBbUIsQ0FBQyxlQUFlO0FBQUEsVUFDbkMsbUJBQW1CLENBQUMsVUFBVTtBQUFBLFVBQzlCLG1CQUFtQixDQUFDLHVCQUF1QjtBQUFBLFVBQzNDLGlCQUFtQixDQUFDLGVBQWU7QUFBQSxVQUNuQyxvQkFBb0IsQ0FBQyxjQUFjO0FBQUEsUUFDckM7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLEtBQUs7QUFBQSxJQUNMLFNBQVMsQ0FBQyxzQkFBc0IsY0FBYyxlQUFlLFdBQVc7QUFBQSxFQUMxRTtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
