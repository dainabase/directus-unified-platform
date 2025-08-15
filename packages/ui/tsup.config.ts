import { defineConfig } from 'tsup';
import { resolve } from 'path';

export default defineConfig({
  // Entry points - main export and lazy bundles
  entry: {
    index: 'src/index.ts',
    // Core utilities only
    'utils/index': 'src/lib/utils.ts',
    'utils/cn': 'src/lib/cn.ts',
    // Ultra-lazy loading with dynamic imports
    'lazy/forms': 'src/components/forms-bundle.ts',
    'lazy/overlays': 'src/components/overlays-bundle.ts',
    'lazy/data': 'src/components/data-bundle.ts',
    'lazy/navigation': 'src/components/navigation-bundle.ts',
    'lazy/feedback': 'src/components/feedback-bundle.ts',
    'lazy/advanced': 'src/components/advanced-bundle.ts',
    // Heavy components as separate chunks
    'lazy/pdf-viewer': 'src/components/pdf-viewer/index.tsx',
    'lazy/image-cropper': 'src/components/image-cropper/index.tsx',
    'lazy/code-editor': 'src/components/code-editor/index.tsx',
    'lazy/theme-builder': 'src/components/theme-builder/index.tsx',
    'lazy/rich-text-editor': 'src/components/rich-text-editor/index.tsx',
  },
  
  // Output formats - ESM only for smaller size
  format: ['esm'],
  
  // Generate TypeScript declarations separately
  dts: {
    resolve: true,
    entry: 'src/index.ts',
    only: true, // Generate d.ts in separate process
  },
  
  // External dependencies - maximize externalization
  external: [
    'react',
    'react-dom',
    /^@radix-ui\//,
    // External ALL optional dependencies
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
    // Additional heavy dependencies
    'clsx',
    'tailwind-merge',
    /^class-variance-authority/,
    /^@hookform/,
    /^react-aria/,
  ],
  
  // MAXIMUM optimization settings
  minify: 'terser', // Use terser for better minification
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      passes: 3, // Multiple compression passes
      unsafe: true,
      unsafe_arrows: true,
      unsafe_comps: true,
      unsafe_Function: true,
      unsafe_math: true,
      unsafe_symbols: true,
      unsafe_methods: true,
      unsafe_proto: true,
      unsafe_regexp: true,
      unsafe_undefined: true,
      unused: true,
      dead_code: true,
      conditionals: true,
      evaluate: true,
      booleans: true,
      loops: true,
      toplevel: true,
      top_retain: null,
      hoist_funs: true,
      if_return: true,
      join_vars: true,
      collapse_vars: true,
      reduce_vars: true,
      side_effects: false,
      pure_getters: true,
      keep_fargs: false,
      keep_fnames: false,
      keep_infinity: false,
      negate_iife: true,
    },
    mangle: {
      properties: {
        regex: /^_/,
        reserved: [],
      },
      toplevel: true,
      eval: true,
      keep_classnames: false,
      keep_fnames: false,
      safari10: false,
    },
    format: {
      comments: false,
      ascii_only: true,
      wrap_iife: false,
      wrap_func_args: false,
    },
    module: true,
    toplevel: true,
  },
  
  splitting: true,
  treeshake: {
    preset: 'smallest',
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false,
  },
  
  // Clean output directory
  clean: true,
  
  // No source maps in production for size
  sourcemap: false,
  
  // Target modern browsers only
  target: 'es2022',
  
  // Platform
  platform: 'browser',
  
  // Replace environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    '__DEV__': 'false',
    '__PROD__': 'true',
  },
  
  // ESBuild options for MAXIMUM optimization
  esbuildOptions(options) {
    options.conditions = ['import', 'module', 'browser', 'default'];
    options.mainFields = ['module', 'main'];
    options.drop = ['console', 'debugger'];
    options.dropLabels = ['DEV', 'DEBUG'];
    options.legalComments = 'none';
    options.charset = 'utf8';
    options.mangleProps = /^_/;
    options.mangleCache = {};
    options.treeShaking = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
    options.lineLimit = 80; // Aggressive line limit
    options.pure = [
      'console.log',
      'console.info',
      'console.debug',
      'console.warn',
      'console.error',
    ];
    options.reserveProps = /^($$|__)/, // Reserve only critical props
  },
  
  // Custom esbuild plugins
  esbuildPlugins: [
    {
      name: 'size-reporter',
      setup(build) {
        build.onEnd(result => {
          if (!result.errors.length && result.metafile) {
            const files = Object.keys(result.metafile.outputs || {});
            let totalSize = 0;
            let coreSize = 0;
            
            console.log('\n📊 Bundle Size Report:\n');
            console.log('Core Bundle:');
            
            files.forEach(file => {
              if (file.endsWith('.js') || file.endsWith('.mjs')) {
                const size = result.metafile.outputs[file].bytes;
                const sizeKB = (size / 1024).toFixed(2);
                
                if (file.includes('index')) {
                  coreSize += size;
                  console.log(`  📦 ${file}: ${sizeKB}KB`);
                } else if (file.includes('utils')) {
                  coreSize += size;
                  console.log(`  🔧 ${file}: ${sizeKB}KB`);
                }
                
                totalSize += size;
              }
            });
            
            console.log('\nLazy Chunks:');
            files.forEach(file => {
              if ((file.endsWith('.js') || file.endsWith('.mjs')) && file.includes('lazy')) {
                const size = result.metafile.outputs[file].bytes;
                const sizeKB = (size / 1024).toFixed(2);
                console.log(`  📂 ${file}: ${sizeKB}KB`);
              }
            });
            
            const coreKB = (coreSize / 1024).toFixed(2);
            const totalKB = (totalSize / 1024).toFixed(2);
            
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`  🎯 Core Bundle: ${coreKB}KB`);
            console.log(`  📊 Total (with lazy): ${totalKB}KB`);
            
            if (coreSize > 40 * 1024) {
              console.error(`\n  🔴 FAIL: Core bundle (${coreKB}KB) exceeds 40KB target!`);
              process.exit(1);
            } else if (coreSize > 35 * 1024) {
              console.warn(`\n  🟡 WARNING: Core bundle (${coreKB}KB) approaching 40KB limit!`);
            } else {
              console.log(`\n  ✅ SUCCESS: Core bundle (${coreKB}KB) is within target!`);
            }
          }
        });
      },
    },
    {
      name: 'component-splitter',
      setup(build) {
        // Automatically split heavy components
        build.onResolve({ filter: /\/(pdf-viewer|image-cropper|code-editor|theme-builder|rich-text-editor)/ }, args => {
          return {
            path: args.path,
            external: false,
            sideEffects: false,
          };
        });
      },
    },
  ],
  
  // Watch mode configuration
  onSuccess: 'echo "✅ Build completed! Core bundle optimized!"',
  
  // Bundle configuration
  bundle: true,
  keepNames: false,
  
  // No CSS injection - keep CSS separate for better caching
  injectStyle: false,
  
  // No legacy support - modern browsers only
  legacyOutput: false,
  
  // Metafile for bundle analysis
  metafile: true,
  
  // Skip node_modules bundling
  skipNodeModulesBundle: true,
  
  // Output configuration
  outDir: 'dist',
  
  // Mark as side-effect free
  sideEffects: false,
  
  // No shims
  shims: false,
  
  // Entry points naming
  entryNames: '[name]',
  
  // Chunk naming for code splitting
  chunkNames: 'chunks/[name]-[hash]',
  
  // Minimal banner
  banner: {
    js: '/*!@dainabase/ui v1.3.0*/',
  },
  
  // Experimental options for further size reduction
  experimentalDts: true,
  
  // Additional rollup options
  rollupOptions: {
    output: {
      compact: true,
      generatedCode: {
        arrowFunctions: true,
        constBindings: true,
        objectShorthand: true,
        reservedNamesAsProps: false,
      },
      manualChunks(id) {
        // Split heavy components into separate chunks
        if (id.includes('pdf-viewer')) return 'heavy/pdf';
        if (id.includes('image-cropper')) return 'heavy/image';
        if (id.includes('code-editor')) return 'heavy/code';
        if (id.includes('theme-builder')) return 'heavy/theme';
        if (id.includes('rich-text-editor')) return 'heavy/editor';
        if (id.includes('data-grid')) return 'heavy/grid';
        if (id.includes('chart')) return 'heavy/chart';
        if (id.includes('calendar')) return 'heavy/calendar';
      },
    },
  },
});
