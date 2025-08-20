#!/usr/bin/env node

/**
 * FIX ALL COMPONENTS - Script de correction automatique
 * Corrige TOUS les problèmes du Design System en une seule fois
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Composants fichiers qui ont besoin d'être organisés
const FILE_COMPONENTS = [
  { name: 'CodeEditor', file: 'code-editor.tsx', folder: 'code-editor' },
  { name: 'DragDropGrid', file: 'drag-drop-grid.tsx', folder: 'drag-drop-grid' },
  { name: 'ImageCropper', file: 'image-cropper.tsx', folder: 'image-cropper' },
  { name: 'InfiniteScroll', file: 'infinite-scroll.tsx', folder: 'infinite-scroll' },
  { name: 'Kanban', file: 'kanban.tsx', folder: 'kanban' },
  { name: 'PdfViewer', file: 'pdf-viewer.tsx', folder: 'pdf-viewer' },
  { name: 'RichTextEditor', file: 'rich-text-editor.tsx', folder: 'rich-text-editor' },
  { name: 'VideoPlayer', file: 'video-player.tsx', folder: 'video-player' },
  { name: 'VirtualList', file: 'virtual-list.tsx', folder: 'virtual-list' }
];

// Template pour créer un composant stub
const createStubComponent = (name) => `import React from 'react';

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * ${name} Component
 * @generated Stub component - To be implemented
 */
export const ${name}: React.FC<${name}Props> = ({ className, children }) => {
  return (
    <div className={\`dainabase-${name.toLowerCase()} \${className || ''}\`}>
      <div style={{ 
        padding: '20px', 
        border: '2px dashed #ccc', 
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        textAlign: 'center'
      }}>
        <h3>${name} Component</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          This is a stub component. Implementation pending.
        </p>
        {children}
      </div>
    </div>
  );
};

export default ${name};
`;

// Template pour index.ts
const createIndexFile = (componentName, fileName) => `// ${componentName} Component Export
export { default as ${componentName} } from './${fileName.replace('.tsx', '')}';
export type { ${componentName}Props } from './${fileName.replace('.tsx', '')}';
`;

// Template pour index.ts des fichiers existants
const createIndexForExistingFile = (componentName) => `// ${componentName} Component Export
export { default as ${componentName} } from '../${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)}';
export type { ${componentName}Props } from '../${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase().slice(1)}';
`;

function fixAllComponents() {
  console.log(`\n${colors.cyan}${colors.bold}🔧 CORRECTION AUTOMATIQUE DU DESIGN SYSTEM${colors.reset}\n`);
  console.log('='.repeat(80));
  
  const componentsPath = path.join(__dirname, '../src/components');
  let fixed = 0;
  let created = 0;
  let organized = 0;
  
  // 1. Organiser les composants fichiers
  console.log(`\n${colors.bold}📁 Organisation des composants fichiers...${colors.reset}`);
  FILE_COMPONENTS.forEach(comp => {
    const filePath = path.join(componentsPath, comp.file);
    const folderPath = path.join(componentsPath, comp.folder);
    
    if (fs.existsSync(filePath)) {
      // Créer le dossier s'il n'existe pas
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`✅ Dossier créé: ${comp.folder}/`);
      }
      
      // Créer l'index.ts
      const indexPath = path.join(folderPath, 'index.ts');
      if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, createIndexForExistingFile(comp.name));
        console.log(`✅ Index créé: ${comp.folder}/index.ts`);
        organized++;
      }
    }
  });
  
  // 2. Vérifier et corriger tous les dossiers de composants
  console.log(`\n${colors.bold}🔍 Vérification des dossiers de composants...${colors.reset}`);
  const ALL_COMPONENTS = [
    // Core
    'button', 'input', 'label', 'card', 'badge', 'icon', 'separator',
    'accordion', 'alert', 'avatar', 'breadcrumb', 'calendar', 'carousel',
    'chart', 'checkbox', 'collapsible', 'color-picker', 'command-palette',
    'context-menu', 'data-grid', 'data-grid-advanced', 'date-picker',
    'date-range-picker', 'dialog', 'dropdown-menu', 'error-boundary',
    'file-upload', 'form', 'forms-demo', 'hover-card', 'menubar',
    'navigation-menu', 'pagination', 'popover', 'progress', 'radio-group',
    'rating', 'resizable', 'scroll-area', 'select', 'sheet', 'skeleton',
    'slider', 'sonner', 'stepper', 'switch', 'table', 'tabs',
    'text-animations', 'textarea', 'timeline', 'toast', 'toggle',
    'toggle-group', 'tooltip', 'ui-provider',
    // Advanced
    'advanced-filter', 'alert-dialog', 'app-shell', 'dashboard-grid',
    'drawer', 'notification-center', 'search-bar', 'tag-input',
    'theme-builder', 'theme-toggle', 'tree-view', 'virtualized-table',
    'mentions', 'charts', 'breadcrumbs', 'data-grid-adv',
    'timeline-enhanced', 'chromatic-test'
  ];
  
  ALL_COMPONENTS.forEach(folder => {
    const folderPath = path.join(componentsPath, folder);
    const componentName = folder.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`📁 Dossier créé: ${folder}/`);
      created++;
    }
    
    // Vérifier l'index
    const indexPath = path.join(folderPath, 'index.tsx');
    const indexTsPath = path.join(folderPath, 'index.ts');
    const componentPath = path.join(folderPath, `${folder}.tsx`);
    
    if (!fs.existsSync(indexPath) && !fs.existsSync(indexTsPath)) {
      // Vérifier si le composant existe
      if (fs.existsSync(componentPath)) {
        // Créer l'index pour le composant existant
        fs.writeFileSync(indexTsPath, createIndexFile(componentName, `${folder}.tsx`));
        console.log(`✅ Index créé pour: ${folder}/`);
        fixed++;
      } else {
        // Créer un stub complet
        fs.writeFileSync(componentPath, createStubComponent(componentName));
        fs.writeFileSync(indexTsPath, createIndexFile(componentName, `${folder}.tsx`));
        console.log(`🆕 Stub créé: ${folder}/ (composant + index)`);
        created++;
      }
    }
  });
  
  // 3. Résumé
  console.log(`\n${colors.bold}${colors.green}✨ CORRECTION TERMINÉE !${colors.reset}`);
  console.log('='.repeat(80));
  console.log(`📁 Composants organisés: ${colors.cyan}${organized}${colors.reset}`);
  console.log(`✅ Index corrigés: ${colors.green}${fixed}${colors.reset}`);
  console.log(`🆕 Stubs créés: ${colors.yellow}${created}${colors.reset}`);
  console.log(`\n${colors.bold}Prochaines étapes:${colors.reset}`);
  console.log('1. npm run build - Pour vérifier que tout compile');
  console.log('2. npm run dev - Pour tester le showcase');
  console.log('3. Implémenter les stubs un par un');
  
  return {
    organized,
    fixed,
    created,
    total: organized + fixed + created
  };
}

// Exécuter
if (require.main === module) {
  const result = fixAllComponents();
  process.exit(result.total > 0 ? 0 : 1);
}

module.exports = { fixAllComponents };
