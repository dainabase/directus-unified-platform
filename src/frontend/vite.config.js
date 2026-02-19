import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@portals': path.resolve(__dirname, './src/portals')
    }
  },
  server: {
    port: 5173,
    open: true,
    cors: true, // Activer CORS
    proxy: {
      // Finance, Legal, Collection API → Backend Node.js (port 3000)
      '/api/finance': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error (finance):', err.message);
          });
        }
      },
      '/api/legal': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/api/collection': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/api/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/api/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/api/commercial': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/api/revolut': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      // Autres API → Directus (port 8055)
      '/api': {
        target: 'http://localhost:8055',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error (directus):', err.message);
          });
        }
      },
      '/items': {
        target: 'http://localhost:8055',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error (items):', err.message);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Supprimer les warnings de dépendances
  optimizeDeps: {
    exclude: ['lucide-react']
  }
})