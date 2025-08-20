#!/usr/bin/env node

/**
 * Script de diagnostic et correction automatique pour le showcase
 * Identifie et corrige les problèmes d'imports et de composants manquants
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DESIGN_SYSTEM_PATH = path.join(__dirname, '../../src/components');
const SHOWCASE_PATH = path.join(__dirname, '../src');
const COMPONENTS_FILE = path.join(SHOWCASE_PATH, 'components.tsx');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Vérifier si un composant existe
function checkComponentExists(componentName) {
  const componentPath = path.join(DESIGN_SYSTEM_PATH, componentName.toLowerCase());
  const indexPath = path.join(componentPath, 'index.tsx');
  const tsxPath = path.join(componentPath, `${componentName.toLowerCase()}.tsx`);
  
  if (fs.existsSync(componentPath)) {
    if (fs.existsSync(indexPath)) {
      return { exists: true, path: indexPath, type: 'folder' };
    }
    if (fs.existsSync(tsxPath)) {
      return { exists: true, path: tsxPath, type: 'folder' };
    }
    return { exists: true, path: componentPath, type: 'folder-incomplete' };
  }
  
  // Vérifier les fichiers directs
  const directTsxPath = `${DESIGN_SYSTEM_PATH}/${componentName.toLowerCase()}.tsx`;
  if (fs.existsSync(directTsxPath)) {
    return { exists: true, path: directTsxPath, type: 'file' };
  }
  
  return { exists: false };
}

// Créer un composant stub si nécessaire
function createComponentStub(componentName) {
  const componentPath = path.join(DESIGN_SYSTEM_PATH, componentName.toLowerCase());
  const indexPath = path.join(componentPath, 'index.tsx');
  
  if (!fs.existsSync(componentPath)) {
    fs.mkdirSync(componentPath, { recursive: true });
  }
  
  const stubContent = `/**
 * ${componentName} Component - Auto-generated stub
 * TODO: Implement this component
 */

import React from 'react';

export interface ${componentName}Props {
  children?: React.ReactNode;
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={\`dainabase-${componentName.toLowerCase()} \${className}\`}>
      {children || \`${componentName} Component (Stub)\`}
    </div>
  );
};

// Export all related components
export default ${componentName};
`;

  fs.writeFileSync(indexPath, stubContent);
  log(`  ✓ Created stub for ${componentName}`, 'green');
  return true;
}

// Analyser les imports dans les sections
function analyzeImports() {
  const sections = [
    'buttons-section.tsx',
    'forms-section.tsx',
    'data-section.tsx',
    'navigation-section.tsx',
    'feedback-section.tsx',
    'layout-section.tsx',
    'media-section.tsx',
    'advanced-section.tsx',
  ];
  
  const requiredComponents = new Set();
  
  sections.forEach(sectionFile => {
    const sectionPath = path.join(SHOWCASE_PATH, 'sections', sectionFile);
    if (fs.existsSync(sectionPath)) {
      const content = fs.readFileSync(sectionPath, 'utf-8');
      
      // Extraire les imports depuis '../components'
      const importRegex = /import\s*{([^}]+)}\s*from\s*['"]\.\.\/components['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const imports = match[1].split(',').map(imp => imp.trim());
        imports.forEach(imp => {
          // Nettoyer l'import (enlever les alias, etc.)
          const cleanImport = imp.split(' as ')[0].trim();
          requiredComponents.add(cleanImport);
        });
      }
    }
  });
  
  return Array.from(requiredComponents).sort();
}

// Fonction principale
async function diagnoseAndFix() {
  log('\\n🔍 DIAGNOSTIC DU SHOWCASE DAINABASE\\n', 'cyan');
  
  // 1. Analyser les composants requis
  log('1. Analyse des composants requis...', 'blue');
  const requiredComponents = analyzeImports();
  log(`   Trouvé ${requiredComponents.length} composants utilisés dans le showcase`, 'yellow');
  
  // 2. Vérifier l'existence de chaque composant
  log('\\n2. Vérification des composants dans le Design System...', 'blue');
  const missingComponents = [];
  const incompleteComponents = [];
  const workingComponents = [];
  
  requiredComponents.forEach(componentName => {
    const result = checkComponentExists(componentName);
    
    if (!result.exists) {
      missingComponents.push(componentName);
      log(`  ✗ ${componentName} - MANQUANT`, 'red');
    } else if (result.type === 'folder-incomplete') {
      incompleteComponents.push(componentName);
      log(`  ⚠ ${componentName} - INCOMPLET (dossier sans index.tsx)`, 'yellow');
    } else {
      workingComponents.push(componentName);
      log(`  ✓ ${componentName} - OK`, 'green');
    }
  });
  
  // 3. Créer les stubs pour les composants manquants
  if (missingComponents.length > 0) {
    log(`\\n3. Création de stubs pour ${missingComponents.length} composants manquants...`, 'blue');
    
    missingComponents.forEach(componentName => {
      createComponentStub(componentName);
    });
  }
  
  // 4. Corriger les composants incomplets
  if (incompleteComponents.length > 0) {
    log(`\\n4. Correction de ${incompleteComponents.length} composants incomplets...`, 'blue');
    
    incompleteComponents.forEach(componentName => {
      createComponentStub(componentName);
    });
  }
  
  // 5. Rapport final
  log('\\n📊 RAPPORT FINAL\\n', 'cyan');
  log(`Composants fonctionnels : ${workingComponents.length}`, 'green');
  log(`Composants créés (stubs) : ${missingComponents.length}`, 'yellow');
  log(`Composants corrigés : ${incompleteComponents.length}`, 'yellow');
  log(`Total : ${requiredComponents.length}`, 'blue');
  
  // 6. Instructions pour l'utilisateur
  log('\\n📝 PROCHAINES ÉTAPES\\n', 'magenta');
  log('1. Exécutez: npm install', 'yellow');
  log('2. Exécutez: npm run dev', 'yellow');
  log('3. Ouvrez: http://localhost:3001', 'yellow');
  log('4. Le showcase devrait maintenant fonctionner !', 'green');
  
  if (missingComponents.length > 0 || incompleteComponents.length > 0) {
    log('\\n⚠️  ATTENTION: Des composants ont été créés comme stubs.', 'yellow');
    log('   Ils doivent être implémentés correctement pour une version production.', 'yellow');
  }
}

// Exécuter le diagnostic
diagnoseAndFix().catch(error => {
  log(`\\n❌ ERREUR: ${error.message}`, 'red');
  process.exit(1);
});
