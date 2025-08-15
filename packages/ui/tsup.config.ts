import { defineConfig } from 'tsup';
import { resolve } from 'path';

export default defineConfig({
  // Entry points - main export and individual components
  entry: {
    index: 'src/index.ts',
    // Core utilities
    'utils/index': 'src/lib/utils.ts',
    'utils/cn': 'src/lib/cn.ts',
    // Lazy-loaded component bundles by category
    'lazy/forms': 'src/components/forms-bundle.ts',
    'lazy/overlays': 'src/components/overlays-bundle.ts',
    'lazy/data': 'src/components/data-bundle.ts',
    'lazy/navigation': 'src/components/navigation-bundle.ts',
    'lazy/feedback': 'src/components/feedback-bundle.ts',
    'lazy/advanced': 'src/components/advanced-bundle.ts',
  },
  
  // Output formats
  format: ['cjs', 'esm'],
  
  // Generate TypeScript declarations
  dts: {
    resolve: true,
    entry: 'src/index.ts',
  },
  
  // External dependencies - don't bundle these
  external: [
    'react',
    'react-dom',
    /^@radix-ui\//,
    // Mark all optional dependencies as external
    '@tanstack/react-table',
    'cmdk',
    'date-fns',
    'embla-carousel-react',
    'i18next',
    'lucide-react',
    'react-day-picker',
    'react-dropzone',
    'react-hook-form',
    'react-i18next',
    'recharts',
    'tailwindcss-animate',
    'vaul',
    'zod',
  ],
  
  // Optimization settings
  minify: true,
  splitting: true,
  treeshake: {
    preset: 'smallest',
    moduleSideEffects: false,
  },
  
  // Clean output directory
  clean: true,
  
  // Source maps for debugging
  sourcemap: true,
  
  // Target modern browsers
  target: 'es2020',
  
  // Platform
  platform: 'browser',
  
  // Replace environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  
  // ESBuild options for further optimization
  esbuildOptions(options) {
    options.conditions = ['import', 'module', 'browser', 'default'];
    options.mainFields = ['module', 'main'];
    options.drop = ['console', 'debugger'];
    options.legalComments = 'none';
    options.charset = 'utf8';
    options.mangleProps = /^_/; // Mangle private properties
    options.mangleCache = {};
    options.treeShaking = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
  },
  
  // Custom esbuild plugins
  esbuildPlugins: [
    {
      name: 'size-reporter',
      setup(build) {
        build.onEnd(result => {
          if (!result.errors.length) {
            const files = Object.keys(result.metafile?.outputs || {});
            let totalSize = 0;
            
            console.log('\n📊 Bundle Size Report:\n');
            files.forEach(file => {
              if (file.endsWith('.js') || file.endsWith('.mjs')) {
                const size = result.metafile.outputs[file].bytes;
                totalSize += size;
                const sizeKB = (size / 1024).toFixed(2);
                console.log(`  ${file}: ${sizeKB}KB`);
              }
            });
            
            const totalKB = (totalSize / 1024).toFixed(2);
            console.log(`\n  📦 Total: ${totalKB}KB`);
            
            if (totalSize > 40 * 1024) {
              console.warn(`\n  ⚠️  Bundle size (${totalKB}KB) exceeds 40KB target!`);
            } else {
              console.log(`\n  ✅ Bundle size (${totalKB}KB) is within target!`);
            }
          }
        });
      },
    },
  ],
  
  // Watch mode configuration
  onSuccess: 'echo "✅ Build completed successfully!"',
  
  // Additional optimization flags
  bundle: true,
  keepNames: false,
  
  // Inject CSS into JS (reduces requests)
  injectStyle: true,
  
  // Legacy browser support (if needed)
  legacyOutput: false,
  
  // Metafile for bundle analysis
  metafile: true,
  
  // Skip node_modules bundling
  skipNodeModulesBundle: true,
  
  // Output configuration
  outDir: 'dist',
  
  // Generate package.json sideEffects hints
  sideEffects: false,
  
  // Shims (not needed for browser)
  shims: false,
  
  // Entry points naming
  entryNames: '[name]',
  
  // Chunk naming for code splitting
  chunkNames: 'chunks/[name]-[hash]',
  
  // Banner for license
  banner: {
    js: '/*! @dainabase/ui v1.3.0 | MIT License | https://github.com/dainabase/directus-unified-platform */',
  },
  
  // Footer
  footer: {
    js: '//# sourceMappingURL=[name].js.map',
  },
});
