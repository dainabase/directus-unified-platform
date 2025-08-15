#!/usr/bin/env node

/**
 * Script de vérification finale avant publication NPM
 * Vérifie que tout est prêt pour la release v1.3.0
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification pré-publication @dainabase/ui v1.3.0\n');
console.log('=' .repeat(50));

let errors = 0;
let warnings = 0;

// 1. Vérifier package.json
console.log('\n📦 Vérification du package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Version
  if (pkg.version === '1.3.0') {
    console.log('  ✅ Version: 1.3.0');
  } else {
    console.log(`  ❌ Version incorrecte: ${pkg.version} (attendu: 1.3.0)`);
    errors++;
  }
  
  // Name
  if (pkg.name === '@dainabase/ui') {
    console.log('  ✅ Package name: @dainabase/ui');
  } else {
    console.log(`  ❌ Package name incorrect: ${pkg.name}`);
    errors++;
  }
  
  // Files
  if (pkg.files && pkg.files.includes('dist')) {
    console.log('  ✅ Files: dist inclus');
  } else {
    console.log('  ⚠️  Files: dist non spécifié');
    warnings++;
  }
  
  // PublishConfig
  if (pkg.publishConfig?.access === 'public') {
    console.log('  ✅ PublishConfig: public');
  } else {
    console.log('  ❌ PublishConfig non configuré pour public');
    errors++;
  }
  
} catch (e) {
  console.log('  ❌ Erreur lecture package.json:', e.message);
  errors++;
}

// 2. Vérifier le build
console.log('\n🔨 Vérification du build...');
if (fs.existsSync('dist')) {
  const files = fs.readdirSync('dist');
  if (files.length > 0) {
    console.log(`  ✅ Dossier dist existe (${files.length} fichiers)`);
    
    // Vérifier les fichiers essentiels
    const essentialFiles = ['index.js', 'index.mjs', 'index.d.ts'];
    essentialFiles.forEach(file => {
      if (files.includes(file)) {
        const stats = fs.statSync(path.join('dist', file));
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`  ✅ ${file}: ${sizeKB}KB`);
      } else {
        console.log(`  ⚠️  ${file}: manquant`);
        warnings++;
      }
    });
  } else {
    console.log('  ❌ Dossier dist vide');
    errors++;
  }
} else {
  console.log('  ⚠️  Dossier dist n\'existe pas (sera créé au build)');
  warnings++;
}

// 3. Vérifier les dépendances
console.log('\n📚 Vérification des dépendances...');
if (fs.existsSync('package-lock.json')) {
  const stats = fs.statSync('package-lock.json');
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`  ✅ package-lock.json existe (${sizeMB}MB)`);
} else if (fs.existsSync('pnpm-lock.yaml')) {
  console.log('  ⚠️  pnpm-lock.yaml trouvé (utiliser npm recommandé)');
  warnings++;
} else {
  console.log('  ❌ Aucun lockfile trouvé');
  errors++;
}

// 4. Vérifier les tests
console.log('\n🧪 Vérification des tests...');
const testDirs = ['src/components', 'tests', 'e2e'];
let totalTests = 0;

testDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    // Compter les fichiers de test récursivement
    const countTests = (dirPath) => {
      let count = 0;
      const items = fs.readdirSync(dirPath);
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          count += countTests(fullPath);
        } else if (item.includes('.test.') || item.includes('.spec.')) {
          count++;
        }
      });
      return count;
    };
    
    const testCount = countTests(dir);
    if (testCount > 0) {
      totalTests += testCount;
      console.log(`  ✅ ${dir}: ${testCount} fichiers de test`);
    }
  }
});

if (totalTests === 0) {
  console.log('  ⚠️  Aucun test trouvé');
  warnings++;
} else {
  console.log(`  ✅ Total: ${totalTests} fichiers de test`);
}

// 5. Vérifier les fichiers importants
console.log('\n📄 Vérification des fichiers requis...');
const requiredFiles = {
  'README.md': true,
  'LICENSE': false,
  'CHANGELOG.md': false,
  'tsconfig.json': true,
  '.npmignore': false
};

Object.entries(requiredFiles).forEach(([file, critical]) => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else if (critical) {
    console.log(`  ❌ ${file} manquant (critique)`);
    errors++;
  } else {
    console.log(`  ⚠️  ${file} manquant (optionnel)`);
    warnings++;
  }
});

// 6. Résumé
console.log('\n' + '=' .repeat(50));
console.log('📊 RÉSUMÉ\n');

if (errors === 0 && warnings === 0) {
  console.log('✅ PARFAIT! Prêt pour publication!');
  console.log('\n🚀 Pour publier:');
  console.log('   1. Aller sur GitHub Actions');
  console.log('   2. Lancer "NPM Publish UI Simple v1.3.0"');
  console.log('   3. Version: 1.3.0, Tag: latest');
} else if (errors === 0) {
  console.log(`⚠️  PRÊT avec ${warnings} avertissement(s)`);
  console.log('   Les avertissements ne bloquent pas la publication');
  console.log('\n🚀 Pour publier:');
  console.log('   1. Aller sur GitHub Actions');
  console.log('   2. Lancer "NPM Publish UI Simple v1.3.0"');
} else {
  console.log(`❌ NON PRÊT: ${errors} erreur(s), ${warnings} avertissement(s)`);
  console.log('\n🔧 Corriger les erreurs avant de publier');
}

console.log('\n' + '=' .repeat(50));
console.log('📅 Date: ' + new Date().toISOString());
console.log('📦 Package: @dainabase/ui v1.3.0');
console.log('🏷️  NPM: https://www.npmjs.com/package/@dainabase/ui');

// Exit code
process.exit(errors > 0 ? 1 : 0);
