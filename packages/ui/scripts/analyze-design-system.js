#!/usr/bin/env node

/**
 * ANALYSE COMPLÈTE DU DESIGN SYSTEM
 * Ce script vérifie TOUS les composants déclarés vs existants
 * Et génère un rapport détaillé + actions correctives
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Liste complète des 132 composants déclarés dans index.ts
const DECLARED_COMPONENTS = [
  // Core Components (75)
  'Button', 'Input', 'Label', 'Card', 'Badge', 'Icon', 'Separator',
  'Accordion', 'Alert', 'Avatar', 'Breadcrumb', 'Calendar', 'Carousel',
  'Chart', 'Checkbox', 'Collapsible', 'ColorPicker', 'CommandPalette',
  'ContextMenu', 'DataGrid', 'DataGridAdvanced', 'DatePicker', 'DateRangePicker',
  'Dialog', 'DropdownMenu', 'ErrorBoundary', 'FileUpload', 'Form', 'FormsDemo',
  'HoverCard', 'Menubar', 'NavigationMenu', 'Pagination', 'Popover', 'Progress',
  'RadioGroup', 'Rating', 'Resizable', 'ScrollArea', 'Select', 'Sheet',
  'Skeleton', 'Slider', 'Sonner', 'Stepper', 'Switch', 'Table', 'Tabs',
  'TextAnimations', 'Textarea', 'Timeline', 'Toast', 'Toggle', 'ToggleGroup',
  'Tooltip', 'UIProvider',
  
  // Advanced Components (22)
  'AdvancedFilter', 'AlertDialog', 'AppShell', 'DashboardGrid', 'Drawer',
  'NotificationCenter', 'SearchBar', 'TagInput', 'ThemeBuilder', 'ThemeToggle',
  'TreeView', 'VirtualizedTable', 'Mentions', 'Charts', 'Breadcrumbs',
  'DataGridAdv', 'TimelineEnhanced', 'ChromaticTest',
  
  // File Components (10)
  'AudioRecorder', 'VideoPlayer', 'ImageCropper', 'PdfViewer', 'CodeEditor',
  'RichTextEditor', 'DragDropGrid', 'InfiniteScroll', 'Kanban', 'VirtualList'
];

// Mapping des noms de composants vers les chemins de fichiers/dossiers
const COMPONENT_PATHS = {
  // Core - Dossiers
  'Button': 'button',
  'Input': 'input',
  'Label': 'label',
  'Card': 'card',
  'Badge': 'badge',
  'Icon': 'icon',
  'Separator': 'separator',
  'Accordion': 'accordion',
  'Alert': 'alert',
  'Avatar': 'avatar',
  'Breadcrumb': 'breadcrumb',
  'Calendar': 'calendar',
  'Carousel': 'carousel',
  'Chart': 'chart',
  'Checkbox': 'checkbox',
  'Collapsible': 'collapsible',
  'ColorPicker': 'color-picker',
  'CommandPalette': 'command-palette',
  'ContextMenu': 'context-menu',
  'DataGrid': 'data-grid',
  'DataGridAdvanced': 'data-grid-advanced',
  'DatePicker': 'date-picker',
  'DateRangePicker': 'date-range-picker',
  'Dialog': 'dialog',
  'DropdownMenu': 'dropdown-menu',
  'ErrorBoundary': 'error-boundary',
  'FileUpload': 'file-upload',
  'Form': 'form',
  'FormsDemo': 'forms-demo',
  'HoverCard': 'hover-card',
  'Menubar': 'menubar',
  'NavigationMenu': 'navigation-menu',
  'Pagination': 'pagination',
  'Popover': 'popover',
  'Progress': 'progress',
  'RadioGroup': 'radio-group',
  'Rating': 'rating',
  'Resizable': 'resizable',
  'ScrollArea': 'scroll-area',
  'Select': 'select',
  'Sheet': 'sheet',
  'Skeleton': 'skeleton',
  'Slider': 'slider',
  'Sonner': 'sonner',
  'Stepper': 'stepper',
  'Switch': 'switch',
  'Table': 'table',
  'Tabs': 'tabs',
  'TextAnimations': 'text-animations',
  'Textarea': 'textarea',
  'Timeline': 'timeline',
  'Toast': 'toast',
  'Toggle': 'toggle',
  'ToggleGroup': 'toggle-group',
  'Tooltip': 'tooltip',
  'UIProvider': 'ui-provider',
  
  // Advanced - Dossiers
  'AdvancedFilter': 'advanced-filter',
  'AlertDialog': 'alert-dialog',
  'AppShell': 'app-shell',
  'DashboardGrid': 'dashboard-grid',
  'Drawer': 'drawer',
  'NotificationCenter': 'notification-center',
  'SearchBar': 'search-bar',
  'TagInput': 'tag-input',
  'ThemeBuilder': 'theme-builder',
  'ThemeToggle': 'theme-toggle',
  'TreeView': 'tree-view',
  'VirtualizedTable': 'virtualized-table',
  'Mentions': 'mentions',
  'Charts': 'charts',
  'Breadcrumbs': 'breadcrumbs',
  'DataGridAdv': 'data-grid-adv',
  'TimelineEnhanced': 'timeline-enhanced',
  'ChromaticTest': 'chromatic-test',
  
  // File Components
  'AudioRecorder': 'audio-recorder',
  'VideoPlayer': 'video-player',
  'ImageCropper': 'image-cropper',
  'PdfViewer': 'pdf-viewer',
  'CodeEditor': 'code-editor',
  'RichTextEditor': 'rich-text-editor',
  'DragDropGrid': 'drag-drop-grid',
  'InfiniteScroll': 'infinite-scroll',
  'Kanban': 'kanban',
  'VirtualList': 'virtual-list'
};

function analyzeDesignSystem() {
  console.log(`\n${colors.cyan}${colors.bold}🔍 ANALYSE COMPLÈTE DU DESIGN SYSTEM${colors.reset}\n`);
  console.log('=' .repeat(80));
  
  const componentsPath = path.join(__dirname, '../src/components');
  const report = {
    total: DECLARED_COMPONENTS.length,
    existing: [],
    missing: [],
    fileComponents: [],
    folderComponents: [],
    emptyFolders: [],
    validComponents: [],
    invalidComponents: []
  };
  
  // Analyser chaque composant
  DECLARED_COMPONENTS.forEach(componentName => {
    const componentPath = COMPONENT_PATHS[componentName];
    if (!componentPath) {
      report.missing.push(componentName);
      report.invalidComponents.push({
        name: componentName,
        issue: 'No path mapping defined'
      });
      return;
    }
    
    const fullPath = path.join(componentsPath, componentPath);
    
    // Vérifier si c'est un fichier .tsx
    const tsxFile = `${fullPath}.tsx`;
    const tsFile = `${fullPath}.ts`;
    
    if (fs.existsSync(tsxFile)) {
      report.existing.push(componentName);
      report.fileComponents.push({
        name: componentName,
        path: componentPath + '.tsx',
        size: fs.statSync(tsxFile).size
      });
      report.validComponents.push(componentName);
    } else if (fs.existsSync(tsFile)) {
      report.existing.push(componentName);
      report.fileComponents.push({
        name: componentName,
        path: componentPath + '.ts',
        size: fs.statSync(tsFile).size
      });
      report.validComponents.push(componentName);
    } else if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      // C'est un dossier, vérifier s'il contient index.tsx ou index.ts
      const indexTsx = path.join(fullPath, 'index.tsx');
      const indexTs = path.join(fullPath, 'index.ts');
      const componentTsx = path.join(fullPath, `${componentPath}.tsx`);
      
      if (fs.existsSync(indexTsx) || fs.existsSync(indexTs)) {
        report.existing.push(componentName);
        report.folderComponents.push({
          name: componentName,
          path: componentPath + '/',
          hasIndex: true
        });
        report.validComponents.push(componentName);
      } else if (fs.existsSync(componentTsx)) {
        // Le composant existe mais pas d'index
        report.existing.push(componentName);
        report.folderComponents.push({
          name: componentName,
          path: componentPath + '/',
          hasIndex: false,
          needsIndex: true
        });
        report.invalidComponents.push({
          name: componentName,
          issue: 'Missing index file'
        });
      } else {
        // Dossier vide
        report.emptyFolders.push(componentName);
        report.invalidComponents.push({
          name: componentName,
          issue: 'Empty folder'
        });
      }
    } else {
      // N'existe pas du tout
      report.missing.push(componentName);
      report.invalidComponents.push({
        name: componentName,
        issue: 'Does not exist'
      });
    }
  });
  
  // Afficher le rapport
  console.log(`\n${colors.bold}📊 RÉSUMÉ${colors.reset}`);
  console.log('-'.repeat(40));
  console.log(`Total déclarés: ${colors.cyan}${report.total}${colors.reset}`);
  console.log(`✅ Existants: ${colors.green}${report.existing.length}${colors.reset}`);
  console.log(`❌ Manquants: ${colors.red}${report.missing.length}${colors.reset}`);
  console.log(`📁 Dossiers vides: ${colors.yellow}${report.emptyFolders.length}${colors.reset}`);
  console.log(`📄 Fichiers isolés: ${colors.magenta}${report.fileComponents.length}${colors.reset}`);
  console.log(`✨ Valides: ${colors.green}${report.validComponents.length}${colors.reset}`);
  console.log(`⚠️ Invalides: ${colors.red}${report.invalidComponents.length}${colors.reset}`);
  
  // Détails des composants fichiers
  if (report.fileComponents.length > 0) {
    console.log(`\n${colors.bold}📄 COMPOSANTS FICHIERS (${report.fileComponents.length})${colors.reset}`);
    console.log('-'.repeat(40));
    report.fileComponents.forEach(comp => {
      const sizeKB = (comp.size / 1024).toFixed(1);
      console.log(`• ${comp.name}: ${colors.cyan}${sizeKB}KB${colors.reset} (${comp.path})`);
    });
  }
  
  // Détails des composants invalides
  if (report.invalidComponents.length > 0) {
    console.log(`\n${colors.bold}⚠️ COMPOSANTS PROBLÉMATIQUES (${report.invalidComponents.length})${colors.reset}`);
    console.log('-'.repeat(40));
    report.invalidComponents.forEach(comp => {
      console.log(`• ${comp.name}: ${colors.red}${comp.issue}${colors.reset}`);
    });
  }
  
  // Actions recommandées
  console.log(`\n${colors.bold}🔧 ACTIONS RECOMMANDÉES${colors.reset}`);
  console.log('-'.repeat(40));
  
  let actionCount = 1;
  
  // Pour les fichiers isolés
  if (report.fileComponents.length > 0) {
    console.log(`\n${actionCount}. ${colors.yellow}Créer des dossiers pour les composants fichiers:${colors.reset}`);
    report.fileComponents.forEach(comp => {
      const componentPath = COMPONENT_PATHS[comp.name];
      console.log(`   mkdir ${componentPath}/`);
      console.log(`   mv ${comp.path} ${componentPath}/`);
      console.log(`   echo "export { default as ${comp.name} } from './${path.basename(comp.path, '.tsx')}';" > ${componentPath}/index.ts`);
    });
    actionCount++;
  }
  
  // Pour les dossiers vides
  if (report.emptyFolders.length > 0) {
    console.log(`\n${actionCount}. ${colors.yellow}Créer des stubs pour les dossiers vides:${colors.reset}`);
    report.emptyFolders.forEach(comp => {
      const componentPath = COMPONENT_PATHS[comp];
      console.log(`   • ${comp} → Créer ${componentPath}/index.tsx avec stub`);
    });
    actionCount++;
  }
  
  // Pour les composants manquants
  if (report.missing.length > 0) {
    console.log(`\n${actionCount}. ${colors.yellow}Créer les composants manquants:${colors.reset}`);
    report.missing.forEach(comp => {
      console.log(`   • ${comp} → Créer complètement`);
    });
    actionCount++;
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, 'design-system-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n${colors.green}✅ Rapport sauvegardé dans: ${reportPath}${colors.reset}`);
  
  // Résumé final
  console.log(`\n${colors.bold}${colors.cyan}📋 BILAN FINAL${colors.reset}`);
  console.log('='.repeat(80));
  const percentValid = ((report.validComponents.length / report.total) * 100).toFixed(1);
  const percentInvalid = ((report.invalidComponents.length / report.total) * 100).toFixed(1);
  
  console.log(`${colors.green}✅ ${percentValid}% des composants sont valides${colors.reset}`);
  console.log(`${colors.red}❌ ${percentInvalid}% des composants ont des problèmes${colors.reset}`);
  
  if (report.invalidComponents.length > 0) {
    console.log(`\n${colors.yellow}⚠️ ATTENTION: ${report.invalidComponents.length} composants nécessitent une intervention${colors.reset}`);
    console.log(`${colors.yellow}Exécutez 'npm run fix-components' pour corriger automatiquement${colors.reset}`);
  } else {
    console.log(`\n${colors.green}🎉 Tous les composants sont correctement configurés !${colors.reset}`);
  }
  
  return report;
}

// Exécuter l'analyse
if (require.main === module) {
  analyzeDesignSystem();
}

module.exports = { analyzeDesignSystem };
