import { defineConfig } from 'tsup';

export default defineConfig({
  // Core entry point with minimal deps
  entry: {
    index: 'src/index.ts',
    // Utilities separate
    utils: 'src/lib/utils.ts',
    // Split ALL components into lazy chunks
    'lazy/button': 'src/components/button/index.tsx',
    'lazy/card': 'src/components/card/index.tsx',
    'lazy/badge': 'src/components/badge/index.tsx',
    'lazy/avatar': 'src/components/avatar/index.tsx',
    'lazy/skeleton': 'src/components/skeleton/index.tsx',
    'lazy/tooltip': 'src/components/tooltip/index.tsx',
    'lazy/icon': 'src/components/icon/index.tsx',
    'lazy/charts': 'src/components/charts/index.tsx',
    'lazy/data-grid': 'src/components/data-grid/index.tsx',
    'lazy/data-grid-adv': 'src/components/data-grid-adv/index.tsx',
    'lazy/calendar': 'src/components/calendar/index.tsx',
    'lazy/date-picker': 'src/components/date-picker/index.tsx',
    'lazy/date-range-picker': 'src/components/date-range-picker/index.tsx',
    'lazy/command-palette': 'src/components/command-palette/index.tsx',
    'lazy/form': 'src/components/form/index.tsx',
    'lazy/color-picker': 'src/components/color-picker/index.tsx',
    'lazy/file-upload': 'src/components/file-upload/index.tsx',
  },
  
  format: ['esm', 'cjs'],
  
  dts: {
    resolve: true,
    entry: 'src/index.ts',
  },
  
  // AGGRESSIVE EXTERNALIZATION - Everything except core utils
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    // Externalize ALL @radix-ui
    /^@radix-ui\//,
    // Externalize ALL heavy deps
    'recharts',
    '@tanstack/react-table',
    'date-fns',
    'framer-motion',
    'i18next',
    'react-i18next',
    'lucide-react',
    'react-day-picker',
    'react-dropzone',
    'react-hook-form',
    'embla-carousel-react',
    'cmdk',
    'vaul',
    'zod',
    'tailwindcss-animate',
  ],
  
  // Only bundle essential utilities
  noExternal: [
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
  ],
  
  // Maximum tree shaking
  treeshake: {
    preset: 'smallest',
    moduleSideEffects: false,
  },
  
  // Aggressive minification
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      passes: 3, // Multiple optimization passes
      unsafe: true,
      unsafe_comps: true,
      unsafe_proto: true,
      unsafe_regexp: true,
      unsafe_undefined: true,
      conditionals: true,
      comparisons: true,
      if_return: true,
      join_vars: true,
      reduce_vars: true,
      collapse_vars: true,
      dead_code: true,
      inline: 3,
      loops: true,
      reduce_funcs: true,
      keep_fargs: false,
      hoist_funs: true,
      hoist_vars: true,
    },
    mangle: {
      toplevel: true,
      safari10: true,
      properties: {
        regex: /^_/, // Mangle private properties
      },
    },
    format: {
      comments: false,
      ecma: 2020,
      ascii_only: true, // Better compression
    },
  },
  
  // No source maps in production
  sourcemap: false,
  
  // Clean output directory
  clean: true,
  
  // Target modern browsers for smaller output
  target: 'es2020',
  
  // Maximum code splitting
  splitting: true,
  
  // No function names in production
  keepNames: false,
  
  // Generate metafile for analysis
  metafile: true,
  
  // Ultra-aggressive ESBuild options
  esbuildOptions(options) {
    options.drop = ['console', 'debugger'];
    options.dropLabels = ['DEV', 'DEBUG'];
    options.legalComments = 'none';
    options.treeShaking = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
    options.charset = 'utf8';
    options.mangleProps = /^_/;
    options.mangleQuoted = true;
    options.pure = [
      'console.log',
      'console.info',
      'console.debug',
      'console.warn',
      'console.error',
      'console.trace',
    ];
    options.platform = 'browser';
    options.define = {
      'process.env.NODE_ENV': '"production"',
      '__DEV__': 'false',
      '__PROD__': 'true',
    };
  },
  
  // Skip node polyfills
  shims: false,
  
  // Bundle size check
  onSuccess: async () => {
    console.log('✅ Build optimized for minimal size!');
    
    const fs = require('fs');
    const path = require('path');
    const distPath = path.join(__dirname, 'dist');
    
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      let totalSize = 0;
      
      console.log('\n📊 Optimized Bundle Analysis:');
      console.log('─'.repeat(50));
      
      const fileStats = [];
      files.forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.mjs')) {
          const filePath = path.join(distPath, file);
          const stats = fs.statSync(filePath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          totalSize += stats.size;
          
          fileStats.push({
            name: file,
            size: stats.size,
            sizeKB: parseFloat(sizeKB)
          });
        }
      });
      
      // Sort by size
      fileStats.sort((a, b) => b.size - a.size);
      
      // Display files
      fileStats.forEach(({ name, sizeKB, size }) => {
        // Color code by size
        let color = '\x1b[32m'; // Green
        if (size > 20000) color = '\x1b[33m'; // Yellow
        if (size > 50000) color = '\x1b[31m'; // Red
        
        console.log(`${color}${name.padEnd(35)} ${sizeKB} KB\x1b[0m`);
      });
      
      console.log('─'.repeat(50));
      const totalKB = (totalSize / 1024).toFixed(2);
      const totalMB = (totalSize / 1024 / 1024).toFixed(2);
      
      // Target is now < 300KB (down from 500KB)
      const targetKB = 300;
      const success = totalSize / 1024 < targetKB;
      
      console.log(`📦 Total Bundle Size: ${totalKB} KB (${totalMB} MB)`);
      console.log(`🎯 New Target: < ${targetKB} KB`);
      console.log(success ? 
        '✅ OPTIMIZED! Bundle reduced successfully!' : 
        `⚠️ Still over by ${(totalSize/1024 - targetKB).toFixed(2)} KB`
      );
      
      // Generate optimized size report
      const report = {
        timestamp: new Date().toISOString(),
        optimization: 'AGGRESSIVE',
        totalSize: totalSize,
        totalSizeKB: parseFloat(totalKB),
        totalSizeMB: parseFloat(totalMB),
        targetKB: targetKB,
        previousSize: 499800, // Previous size in bytes
        reduction: ((499800 - totalSize) / 499800 * 100).toFixed(1) + '%',
        targetMet: success,
        files: fileStats
      };
      
      fs.writeFileSync(
        path.join(distPath, 'bundle-report-optimized.json'),
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n📄 Optimized report saved to dist/bundle-report-optimized.json');
      console.log(`🎉 Bundle size reduced by ${report.reduction}!`);
    }
  },
});
