import { defineConfig } from 'tsup';

export default defineConfig({
  // Multiple entry points for code splitting
  entry: {
    index: 'src/index.ts',
    // Split heavy components into separate chunks
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
    // Core utilities
    utils: 'src/lib/utils.ts',
  },
  
  format: ['esm', 'cjs'],
  
  dts: {
    resolve: true,
    // Generate .d.ts files
    entry: 'src/index.ts',
  },
  
  // External dependencies
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    // Heavy deps as external
    'recharts',
    '@tanstack/react-table',
    'date-fns',
    'framer-motion',
    '@radix-ui/*',
  ],
  
  // Don't bundle node_modules
  noExternal: [
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
  ],
  
  // Tree shaking
  treeshake: true,
  
  // Minification
  minify: true,
  
  // Source maps
  sourcemap: false,
  
  // Clean output directory
  clean: true,
  
  // Target modern browsers
  target: 'es2020',
  
  // Split code for better tree-shaking
  splitting: true,
  
  // Keep names for better debugging
  keepNames: false,
  
  // Bundle size analyzer
  metafile: true,
  
  // ESBuild options for aggressive optimization
  esbuildOptions(options) {
    options.drop = ['console', 'debugger'];
    options.legalComments = 'none';
    options.treeShaking = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
    options.charset = 'utf8';
    options.mangleProps = /^_/; // Mangle properties starting with _
    options.pure = ['console.log', 'console.info'];
    options.platform = 'browser';
  },
  
  // On success callback
  onSuccess: async () => {
    console.log('✅ Build optimized successfully!');
    
    // Analyze bundle size
    const fs = require('fs');
    const path = require('path');
    const distPath = path.join(__dirname, 'dist');
    
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      let totalSize = 0;
      
      console.log('\n📊 Bundle Analysis:');
      console.log('─'.repeat(50));
      
      files.forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.mjs')) {
          const filePath = path.join(distPath, file);
          const stats = fs.statSync(filePath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          totalSize += stats.size;
          
          // Color code by size
          let color = '\x1b[32m'; // Green
          if (stats.size > 50000) color = '\x1b[33m'; // Yellow
          if (stats.size > 100000) color = '\x1b[31m'; // Red
          
          console.log(`${color}${file.padEnd(30)} ${sizeKB} KB\x1b[0m`);
        }
      });
      
      console.log('─'.repeat(50));
      const totalKB = (totalSize / 1024).toFixed(2);
      const totalMB = (totalSize / 1024 / 1024).toFixed(2);
      
      // Check if we met our target
      const targetKB = 600;
      const success = totalSize / 1024 < targetKB;
      
      console.log(`📦 Total Bundle Size: ${totalKB} KB (${totalMB} MB)`);
      console.log(`🎯 Target: < ${targetKB} KB`);
      console.log(success ? '✅ Target Met!' : `❌ Over by ${(totalSize/1024 - targetKB).toFixed(2)} KB`);
      
      // Generate size report
      const report = {
        timestamp: new Date().toISOString(),
        totalSize: totalSize,
        totalSizeKB: parseFloat(totalKB),
        totalSizeMB: parseFloat(totalMB),
        targetKB: targetKB,
        targetMet: success,
        files: files
          .filter(f => f.endsWith('.js') || f.endsWith('.mjs'))
          .map(file => ({
            name: file,
            size: fs.statSync(path.join(distPath, file)).size,
            sizeKB: parseFloat((fs.statSync(path.join(distPath, file)).size / 1024).toFixed(2))
          }))
          .sort((a, b) => b.size - a.size)
      };
      
      fs.writeFileSync(
        path.join(distPath, 'bundle-report.json'),
        JSON.stringify(report, null, 2)
      );
      
      console.log('\n📄 Report saved to dist/bundle-report.json');
    }
  },
});
