import { defineConfig } from 'tsup';
import { compress } from 'esbuild-plugin-compress';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'lazy/charts': 'src/components/chart/index.tsx',
    'lazy/data-grid': 'src/components/data-grid-advanced/index.tsx',
    'lazy/virtualized-table': 'src/components/virtualized-table/index.tsx',
    'lazy/advanced-filter': 'src/components/advanced-filter/index.tsx',
    'lazy/dashboard-grid': 'src/components/dashboard-grid/index.tsx',
    'lazy/notification-center': 'src/components/notification-center/index.tsx',
    'lazy/theme-builder': 'src/components/theme-builder/index.tsx',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: true,
  external: [
    'react',
    'react-dom',
    'lucide-react',
    'recharts',
    'date-fns',
    '@radix-ui/*',
    '@tanstack/react-table',
    'react-hook-form',
    'zod'
  ],
  esbuildOptions(options) {
    options.drop = ['console', 'debugger'];
    options.pure = ['console.log'];
    options.legalComments = 'none';
    options.treeShaking = true;
    options.minifyWhitespace = true;
    options.minifyIdentifiers = true;
    options.minifySyntax = true;
  },
  onSuccess() {
    console.log('✅ Build optimized successfully! Bundle target: < 45KB');
  }
});