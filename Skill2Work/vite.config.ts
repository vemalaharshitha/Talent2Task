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
  server: {
    host: true,
    port: 5173,
    allowedHosts: true
  },
  preview: {
    host: true,
    port: 5173,
    allowedHosts: true
  }
})
