import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analyzer
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@dainabase/ui',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          // Core components (always loaded)
          'core': [
            './src/components/button/index.ts',
            './src/components/card/index.ts',
            './src/components/icon/index.ts',
            './src/components/badge/index.ts',
            './src/components/avatar/index.ts',
          ],
          // Layout components
          'layout': [
            './src/components/app-shell/index.ts',
            './src/components/tabs/index.ts',
            './src/components/breadcrumbs/index.ts',
            './src/components/dropdown-menu/index.ts',
          ],
          // Form components
          'forms': [
            './src/components/form/index.ts',
            './src/components/input/index.ts',
            './src/components/textarea/index.ts',
            './src/components/select/index.ts',
            './src/components/checkbox/index.ts',
            './src/components/switch/index.ts',
          ],
          // Data components (heavy)
          'data': [
            './src/components/data-grid/index.ts',
            './src/components/data-grid-adv/index.ts',
          ],
          // Date components
          'date': [
            './src/components/calendar/index.ts',
            './src/components/date-picker/index.ts',
            './src/components/date-range-picker/index.ts',
          ],
          // Overlay components
          'overlays': [
            './src/components/dialog/index.ts',
            './src/components/sheet/index.ts',
            './src/components/popover/index.ts',
            './src/components/tooltip/index.ts',
            './src/components/toast/index.ts',
          ],
          // Visualization
          'viz': [
            './src/components/charts/index.ts',
            './src/components/progress/index.ts',
            './src/components/skeleton/index.ts',
          ],
          // Theme
          'theme': [
            './src/components/theme-provider/index.ts',
            './src/components/theme-toggle/index.ts',
          ],
          // Utils
          'utils': [
            './src/lib/utils.ts',
            './src/lib/cn.ts',
          ],
        },
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    // Optimize
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Source maps for debugging
    sourcemap: true,
    // Report compressed size
    reportCompressedSize: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 50, // 50kb per chunk max
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  // Optimize deps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'class-variance-authority',
      'tailwind-merge',
    ],
    exclude: ['@dainabase/ui'],
  },
});