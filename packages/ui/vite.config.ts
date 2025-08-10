import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DainabaseUI',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        manualChunks: (id) => {
          // Optimize chunking for better tree-shaking
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('@tanstack/react-table')) {
            return 'data-grid';
          }
          if (id.includes('cmdk')) {
            return 'command';
          }
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date';
          }
        },
        // Preserve modules for better tree-shaking
        preserveModules: false,
        compact: true
      }
    },
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: true,
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 200,
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,
    // Report compressed size
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@dainabase/ui']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
