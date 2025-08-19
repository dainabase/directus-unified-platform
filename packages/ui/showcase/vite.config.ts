import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, '../../ui/src/components'),
      '@/lib': path.resolve(__dirname, '../../ui/src/lib'),
      '@/styles': path.resolve(__dirname, '../../ui/src/styles'),
      '@/hooks': path.resolve(__dirname, '../../ui/src/hooks'),
      '@/providers': path.resolve(__dirname, '../../ui/src/providers'),
      '@/types': path.resolve(__dirname, '../../ui/src/types'),
      '@dainabase/ui': path.resolve(__dirname, '../../ui/src'),
    },
  },
  server: {
    port: 3001,
    open: true,
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