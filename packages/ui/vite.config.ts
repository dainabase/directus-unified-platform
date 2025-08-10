import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10KB
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    // Bundle analyzer in analyze mode
    mode === 'analyze' && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Better visualization
    }),
  ].filter(Boolean),
  
  build: {
    lib: {
      entry: {
        // Main entry with core components only
        index: resolve(__dirname, 'src/index.ts'),
        // Lazy loaded heavy components
        'components-lazy': resolve(__dirname, 'src/components-lazy.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => 
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    
    rollupOptions: {
      // Externalize ALL heavy dependencies
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // Externalize heavy deps to reduce bundle
        'recharts',
        '@tanstack/react-table',
        'date-fns',
        'framer-motion',
        // Keep only core Radix components internal
        /^@radix-ui\/(?!react-(slot|primitive))/,
      ],
      
      output: {
        // Preserve modules for tree-shaking
        preserveModules: mode !== 'production',
        preserveModulesRoot: 'src',
        
        // Manual chunks for production only
        ...(mode === 'production' && {
          manualChunks(id) {
            // Core utilities - always bundled
            if (id.includes('/lib/')) {
              return 'utils';
            }
            
            // Heavy components - separate chunks
            if (id.includes('data-grid')) {
              return 'data-grid';
            }
            if (id.includes('charts')) {
              return 'charts';
            }
            if (id.includes('calendar') || id.includes('date')) {
              return 'date';
            }
            if (id.includes('form')) {
              return 'forms';
            }
            
            // Core components - main bundle
            const coreComponents = [
              'button', 'card', 'icon', 'badge', 
              'avatar', 'tooltip', 'skeleton'
            ];
            if (coreComponents.some(comp => id.includes(comp))) {
              return 'core';
            }
            
            // Everything else in vendors
            if (id.includes('node_modules')) {
              // Radix components grouped
              if (id.includes('@radix-ui')) {
                return 'radix';
              }
              // Other vendors
              return 'vendor';
            }
          },
        }),
        
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'recharts': 'Recharts',
          '@tanstack/react-table': 'ReactTable',
          'date-fns': 'DateFns',
          'framer-motion': 'FramerMotion',
        },
        
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.split('.')[0] : 
            'chunk';
          return `chunks/${facadeModuleId}-[hash].js`;
        },
      },
    },
    
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2, // Multiple passes for better compression
        unsafe: true, // Enable unsafe optimizations
        unsafe_comps: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        conditionals: true,
        comparisons: true,
        if_return: true,
        join_vars: true,
        reduce_vars: true,
        collapse_vars: true,
        dead_code: true,
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/, // Mangle properties starting with _
        },
      },
      format: {
        comments: false,
        ecma: 2020,
      },
    },
    
    // Target modern browsers for smaller bundle
    target: 'es2020',
    
    // Source maps only in dev
    sourcemap: mode === 'development',
    
    // Report compressed size
    reportCompressedSize: true,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 25, // 25kb per chunk max
    
    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4kb
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Use production builds of libraries
      'react': mode === 'production' ? 
        'react/cjs/react.production.min.js' : 'react',
      'react-dom': mode === 'production' ? 
        'react-dom/cjs/react-dom.production.min.js' : 'react-dom',
    },
  },
  
  // Optimize deps
  optimizeDeps: {
    include: [
      'lucide-react',
      'class-variance-authority',
      'tailwind-merge',
      'cmdk',
      'zod',
    ],
    exclude: [
      '@dainabase/ui',
      // Exclude heavy deps from optimization
      'recharts',
      '@tanstack/react-table',
      'date-fns',
      'framer-motion',
    ],
  },
}));
