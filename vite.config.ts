import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { setupSyncServer } from './src/services/syncServer.ts'

function realtimeSyncPlugin(): Plugin {
  return {
    name: 'realtime-sync-plugin',
    configureServer(server) {
      setupSyncServer(server)
    },
    configurePreviewServer(server) {
      setupSyncServer(server)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    realtimeSyncPlugin()
  ],
  optimizeDeps: {
    exclude: ['sql.js', '@xenova/transformers']
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'leaflet-maps';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
          if (id.includes('node_modules/@xenova/transformers')) {
            return 'transformers-ai';
          }
          if (id.includes('node_modules/sql.js')) {
            return 'sql-wasm-db';
          }
        }
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    watch: {
      ignored: ['**/dist/**', '**/scratch/**', '**/.git/**', '**/android/**']
    }
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true
  }
})
