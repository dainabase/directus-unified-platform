import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry point simple - juste le fichier principal
  entry: ['src/index.ts'],
  
  // Formats de sortie
  format: ['cjs', 'esm'],
  
  // Génération des types TypeScript
  dts: true,
  
  // Nettoyer le dossier dist avant build
  clean: true,
  
  // Minification simple
  minify: true,
  
  // Source maps pour debug
  sourcemap: true,
  
  // Externals - ne pas bundler React et les dépendances
  external: [
    'react',
    'react-dom',
    /^@radix-ui\//,
  ],
  
  // Configuration simple pour le build
  target: 'es2020',
  platform: 'browser',
  
  // Nom de sortie
  outDir: 'dist',
  
  // Options ESBuild basiques
  esbuildOptions(options) {
    options.drop = ['console', 'debugger'];
  },
  
  // Message de succès
  onSuccess: 'echo "✅ Build completed successfully!"',
});
