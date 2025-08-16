import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom'
  ],
  noExternal: [
    '@radix-ui/*',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
    'cmdk',
    '@tanstack/react-table',
    'date-fns',
    'embla-carousel-react',
    'lucide-react',
    'react-day-picker',
    'react-dropzone',
    'react-hook-form',
    'recharts',
    'vaul',
    'zod',
    'i18next',
    'react-i18next',
    'tailwindcss-animate'
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxDev = false
    options.minify = true
    options.target = 'es2020'
    options.platform = 'browser'
    options.conditions = ['import', 'module', 'browser', 'default']
    options.mainFields = ['module', 'main']
  },
  treeshake: true,
  minify: true,
  bundle: true,
  skipNodeModulesBundle: false,
  metafile: false,
  shims: false,
  outDir: 'dist',
  onSuccess: 'echo "✅ Build completed successfully!"'
})