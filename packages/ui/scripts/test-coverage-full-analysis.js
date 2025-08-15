#!/usr/bin/env node
/**
 * Complete Test Coverage Analysis Script
 * Analyzes all components in the Design System and generates a detailed report
 * 
 * Usage: node scripts/test-coverage-full-analysis.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Component categories for better organization
const COMPONENT_CATEGORIES = {
  'Core': ['icon', 'label', 'separator'],
  'Layout': ['card', 'app-shell', 'drawer', 'sheet'],
  'Forms': ['input', 'select', 'checkbox', 'textarea', 'form', 'switch', 'slider', 'date-picker', 'date-range-picker', 'color-picker', 'tag-input', 'file-upload', 'rating'],
  'Data Display': ['virtualized-table', 'data-grid', 'data-grid-adv', 'charts', 'timeline', 'timeline-enhanced', 'tree-view'],
  'Navigation': ['tabs', 'stepper', 'pagination', 'breadcrumbs', 'search-bar'],
  'Feedback': ['alert', 'toast', 'progress', 'skeleton', 'notification-center', 'badge'],
  'Overlays': ['dialog', 'alert-dialog', 'popover', 'tooltip', 'dropdown-menu', 'sheet'],
  'Advanced': ['command-palette', 'carousel', 'accordion', 'kanban', 'mentions', 'theme-builder', 'theme-toggle', 'dashboard-grid', 'advanced-filter', 'rich-text-editor', 'code-editor', 'pdf-viewer', 'video-player', 'audio-recorder', 'image-cropper', 'virtual-list', 'infinite-scroll', 'drag-drop-grid']
};

class TestCoverageAnalyzer {
  constructor() {
    this.componentsDir = path.join(__dirname, '../src/components');
    this.results = {
      total: 0,
      withTests: 0,
      withoutTests: 0,
      withStories: 0,
      components: [],
      byCategory: {}
    };
  }

  analyzeComponent(componentPath, componentName) {
    const isDirectory = fs.statSync(componentPath).isDirectory();
    let hasTest = false;
    let hasStory = false;
    let testFile = null;
    let storyFile = null;
    let testSize = 0;
    let componentSize = 0;
    let estimatedCoverage = 0;

    if (isDirectory) {
      // Check for test files in directory
      const files = fs.readdirSync(componentPath);
      
      // Find test file
      const testFiles = files.filter(f => f.endsWith('.test.tsx') || f.endsWith('.test.ts'));
      if (testFiles.length > 0) {
        hasTest = true;
        testFile = testFiles[0];
        const testPath = path.join(componentPath, testFile);
        testSize = fs.statSync(testPath).size;
      }

      // Find story file
      const storyFiles = files.filter(f => f.endsWith('.stories.tsx') || f.endsWith('.stories.ts'));
      if (storyFiles.length > 0) {
        hasStory = true;
        storyFile = storyFiles[0];
      }

      // Find main component file
      const mainFile = files.find(f => f === 'index.tsx' || f === 'index.ts' || f === `${componentName}.tsx`);
      if (mainFile) {
        const mainPath = path.join(componentPath, mainFile);
        componentSize = fs.statSync(mainPath).size;
      }
    } else if (componentName.endsWith('.tsx') || componentName.endsWith('.ts')) {
      // Handle standalone component files
      const baseName = componentName.replace(/\.(tsx?|jsx?)$/, '');
      
      // Check for corresponding test file
      const testFileName = `${baseName}.test.tsx`;
      const testPath = path.join(this.componentsDir, testFileName);
      if (fs.existsSync(testPath)) {
        hasTest = true;
        testFile = testFileName;
        testSize = fs.statSync(testPath).size;
      }

      // Check for story file
      const storyFileName = `${baseName}.stories.tsx`;
      const storyPath = path.join(this.componentsDir, storyFileName);
      if (fs.existsSync(storyPath)) {
        hasStory = true;
        storyFile = storyFileName;
      }

      componentSize = fs.statSync(componentPath).size;
    }

    // Estimate coverage based on test file size vs component size
    if (hasTest && componentSize > 0) {
      const ratio = testSize / componentSize;
      if (ratio >= 0.8) estimatedCoverage = 90;
      else if (ratio >= 0.5) estimatedCoverage = 70;
      else if (ratio >= 0.3) estimatedCoverage = 50;
      else if (ratio >= 0.1) estimatedCoverage = 30;
      else estimatedCoverage = 10;
    }

    return {
      name: componentName,
      hasTest,
      hasStory,
      testFile,
      storyFile,
      testSize,
      componentSize,
      estimatedCoverage,
      category: this.findCategory(componentName)
    };
  }

  findCategory(componentName) {
    const cleanName = componentName.replace(/\.(tsx?|jsx?)$/, '').replace(/-/g, '');
    
    for (const [category, components] of Object.entries(COMPONENT_CATEGORIES)) {
      if (components.some(comp => cleanName.includes(comp.replace(/-/g, '')))) {
        return category;
      }
    }
    return 'Other';
  }

  async analyze() {
    console.log(`${colors.cyan}${colors.bright}🔍 Analyzing Test Coverage for Design System Components${colors.reset}\n`);

    const items = fs.readdirSync(this.componentsDir);
    
    // Filter and analyze each component
    for (const item of items) {
      if (item.startsWith('.') || item === 'index.ts' || item === 'index.tsx') continue;
      
      const itemPath = path.join(this.componentsDir, item);
      const componentInfo = this.analyzeComponent(itemPath, item);
      
      this.results.components.push(componentInfo);
      this.results.total++;
      
      if (componentInfo.hasTest) this.results.withTests++;
      else this.results.withoutTests++;
      
      if (componentInfo.hasStory) this.results.withStories++;

      // Group by category
      if (!this.results.byCategory[componentInfo.category]) {
        this.results.byCategory[componentInfo.category] = {
          total: 0,
          withTests: 0,
          components: []
        };
      }
      this.results.byCategory[componentInfo.category].total++;
      if (componentInfo.hasTest) {
        this.results.byCategory[componentInfo.category].withTests++;
      }
      this.results.byCategory[componentInfo.category].components.push(componentInfo);
    }

    // Sort components
    this.results.components.sort((a, b) => {
      if (a.hasTest !== b.hasTest) return b.hasTest ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  }

  generateReport() {
    const coveragePercent = ((this.results.withTests / this.results.total) * 100).toFixed(1);
    const storiesPercent = ((this.results.withStories / this.results.total) * 100).toFixed(1);

    console.log(`${colors.bright}📊 OVERALL STATISTICS${colors.reset}`);
    console.log(`${colors.bright}${'─'.repeat(50)}${colors.reset}`);
    console.log(`Total Components: ${colors.cyan}${this.results.total}${colors.reset}`);
    console.log(`With Tests: ${colors.green}${this.results.withTests}${colors.reset} (${coveragePercent}%)`);
    console.log(`Without Tests: ${colors.red}${this.results.withoutTests}${colors.reset}`);
    console.log(`With Stories: ${colors.blue}${this.results.withStories}${colors.reset} (${storiesPercent}%)`);
    console.log();

    // Report by category
    console.log(`${colors.bright}📂 COVERAGE BY CATEGORY${colors.reset}`);
    console.log(`${colors.bright}${'─'.repeat(50)}${colors.reset}`);
    
    for (const [category, data] of Object.entries(this.results.byCategory)) {
      const categoryPercent = ((data.withTests / data.total) * 100).toFixed(0);
      const bar = this.generateProgressBar(categoryPercent);
      console.log(`${colors.yellow}${category}:${colors.reset} ${bar} ${categoryPercent}% (${data.withTests}/${data.total})`);
    }
    console.log();

    // Components with tests
    console.log(`${colors.bright}${colors.green}✅ COMPONENTS WITH TESTS (${this.results.withTests})${colors.reset}`);
    console.log(`${colors.bright}${'─'.repeat(50)}${colors.reset}`);
    
    const componentsWithTests = this.results.components.filter(c => c.hasTest);
    componentsWithTests.forEach(comp => {
      const sizeKB = (comp.testSize / 1024).toFixed(1);
      const coverage = comp.estimatedCoverage > 0 ? `~${comp.estimatedCoverage}%` : '';
      const storyIcon = comp.hasStory ? '📖' : '  ';
      console.log(`  ${storyIcon} ${colors.green}✓${colors.reset} ${comp.name.padEnd(25)} ${colors.dim}(${sizeKB}KB) ${coverage}${colors.reset}`);
    });
    console.log();

    // Components without tests (priority list)
    console.log(`${colors.bright}${colors.red}❌ COMPONENTS WITHOUT TESTS (${this.results.withoutTests}) - PRIORITY LIST${colors.reset}`);
    console.log(`${colors.bright}${'─'.repeat(50)}${colors.reset}`);
    
    const componentsWithoutTests = this.results.components.filter(c => !c.hasTest);
    
    // Prioritize by category importance
    const priorityOrder = ['Forms', 'Core', 'Navigation', 'Data Display', 'Feedback', 'Layout', 'Overlays', 'Advanced', 'Other'];
    
    componentsWithoutTests.sort((a, b) => {
      const aPriority = priorityOrder.indexOf(a.category);
      const bPriority = priorityOrder.indexOf(b.category);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.name.localeCompare(b.name);
    });

    componentsWithoutTests.forEach((comp, index) => {
      const priority = index < 10 ? '🔴' : index < 20 ? '🟡' : '⚪';
      const storyIcon = comp.hasStory ? '📖' : '  ';
      const sizeKB = comp.componentSize > 0 ? `(${(comp.componentSize / 1024).toFixed(1)}KB)` : '';
      console.log(`  ${priority} ${storyIcon} ${comp.name.padEnd(25)} ${colors.dim}[${comp.category}] ${sizeKB}${colors.reset}`);
    });
    console.log();

    // Generate actionable next steps
    console.log(`${colors.bright}${colors.magenta}🎯 RECOMMENDED NEXT STEPS${colors.reset}`);
    console.log(`${colors.bright}${'─'.repeat(50)}${colors.reset}`);
    
    const top10Missing = componentsWithoutTests.slice(0, 10);
    console.log(`${colors.cyan}Priority Components to Test:${colors.reset}`);
    top10Missing.forEach((comp, index) => {
      console.log(`  ${index + 1}. ${comp.name} (${comp.category})`);
    });
    
    console.log(`\n${colors.cyan}Quick Win Opportunities:${colors.reset}`);
    const smallComponents = componentsWithoutTests
      .filter(c => c.componentSize > 0 && c.componentSize < 5000)
      .slice(0, 5);
    smallComponents.forEach(comp => {
      console.log(`  • ${comp.name} - Small component (${(comp.componentSize / 1024).toFixed(1)}KB)`);
    });

    // Save detailed JSON report
    this.saveJsonReport();
  }

  generateProgressBar(percent) {
    const width = 20;
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    
    let color = colors.red;
    if (percent >= 80) color = colors.green;
    else if (percent >= 60) color = colors.yellow;
    
    return `${color}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}`;
  }

  saveJsonReport() {
    const reportPath = path.join(__dirname, 'test-coverage-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        withTests: this.results.withTests,
        withoutTests: this.results.withoutTests,
        withStories: this.results.withStories,
        coveragePercent: ((this.results.withTests / this.results.total) * 100).toFixed(1)
      },
      byCategory: this.results.byCategory,
      components: this.results.components
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${colors.green}📄 Detailed JSON report saved to: ${reportPath}${colors.reset}`);
  }

  async checkIfTestsPass() {
    console.log(`\n${colors.cyan}${colors.bright}🧪 Running Tests to Check Status...${colors.reset}`);
    
    try {
      execSync('npm test -- --passWithNoTests --maxWorkers=2', { 
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      console.log(`${colors.green}✅ All tests are passing!${colors.reset}`);
      return true;
    } catch (error) {
      console.log(`${colors.red}❌ Some tests are failing. Run 'npm test' for details.${colors.reset}`);
      return false;
    }
  }
}

// Run the analyzer
async function main() {
  const analyzer = new TestCoverageAnalyzer();
  
  console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════╗
║     🎯 Design System Test Coverage Analysis Tool          ║
║           Comprehensive Component Testing Report          ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  await analyzer.analyze();
  analyzer.generateReport();
  
  // Optional: Check if tests pass
  if (process.argv.includes('--check-tests')) {
    await analyzer.checkIfTestsPass();
  }

  console.log(`\n${colors.dim}Run with --check-tests flag to also verify test execution${colors.reset}`);
}

main().catch(console.error);
