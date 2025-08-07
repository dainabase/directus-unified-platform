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
      '/api': {
        target: 'http://localhost:8055',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
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