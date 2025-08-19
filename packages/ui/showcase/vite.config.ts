import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dainabase/ui': path.resolve(__dirname, '../src'),
      // Ne pas utiliser d'alias pour @/components mais utiliser les chemins relatifs directs
    },
    // Ajout des extensions pour la résolution
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    // Forcer la résolution des index files
    mainFields: ['module', 'main', 'index'],
  },
  optimizeDeps: {
    // Inclure explicitement les dépendances à pré-bundler
    include: ['react', 'react-dom', 'lucide-react', 'framer-motion', 'prism-react-renderer'],
  },
  server: {
    port: 3001,
    open: true,
    // Forcer le rafraîchissement complet
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-components': ['lucide-react'],
        },
      },
    },
  },
  publicDir: 'public',
  css: {
    postcss: './postcss.config.js',
  },
})