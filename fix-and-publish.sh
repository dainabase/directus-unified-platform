#!/bin/bash

# Script SIMPLE ET DIRECT pour publier @dainabase/ui

echo "🔧 FIX ET PUBLICATION de @dainabase/ui"
echo "======================================="

# 1. FIXER tsconfig.json pour compiler correctement
echo "📝 Fix du tsconfig.json..."
cat > packages/ui/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "commonjs",
    "target": "ES2020",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.stories.tsx"]
}
EOF

# 2. S'assurer que l'index.ts existe
echo "📝 Création de l'index.ts si manquant..."
if [ ! -f "packages/ui/src/index.ts" ]; then
  echo "export * from './components';" > packages/ui/src/index.ts
fi

# 3. BUILD
echo "🔨 Build du package..."
cd packages/ui
rm -rf dist
npx tsc

# 4. Vérifier que ça a marché
if [ ! -f "dist/index.js" ]; then
  echo "❌ ERREUR: dist/index.js n'existe pas"
  echo "Contenu de dist:"
  ls -la dist/
  exit 1
fi

echo "✅ Build OK! Contenu de dist:"
ls -la dist/

# 5. PUBLIER
echo "📦 Publication sur GitHub Packages..."
npm config set @dainabase:registry https://npm.pkg.github.com/
npm config set //npm.pkg.github.com/:_authToken ${GITHUB_TOKEN}

npm publish --access public

echo "✅ TERMINÉ !"