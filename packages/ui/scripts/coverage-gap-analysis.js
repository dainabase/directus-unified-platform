#!/usr/bin/env node
/**
 * Coverage Gap Analysis Script
 * Identifies exactly which tests are missing or incomplete to reach 95% coverage
 * Session 14 - August 15, 2025
 */

const fs = require('fs');
const path = require('path');

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m'
};

// Components organized by test status
const COMPONENTS_WITH_TESTS = [
  'audio-recorder',
  'code-editor', 
  'drag-drop-grid',
  'image-cropper',
  'infinite-scroll',
  'pdf-viewer',
  'rich-text-editor',
  'video-player',
  'virtual-list'
];

// Components in folders that need verification
const FOLDER_COMPONENTS = [
  'accordion', 'advanced-filter', 'alert-dialog', 'alert', 'app-shell', 'avatar',
  'badge', 'breadcrumbs', 'button', 'calendar', 'card', 'carousel', 'charts',
  'checkbox', 'color-picker', 'command-palette', 'dashboard-grid', 'data-grid-adv',
  'data-grid', 'date-picker', 'date-range-picker', 'dialog', 'drawer', 'dropdown-menu',
  'file-upload', 'form', 'forms-demo', 'icon', 'kanban', 'label', 'mentions',
  'notification-center', 'pagination', 'popover', 'progress', 'rating', 'search-bar',
  'select', 'separator', 'sheet', 'skeleton', 'slider', 'stepper', 'switch',
  'tabs', 'tag-input', 'textarea', 'theme-builder', 'theme-toggle', 'timeline',
  'timeline-enhanced', 'toast', 'tooltip', 'tree-view', 'virtualized-table'
];

// Priority components for testing (critical for UX)
const PRIORITY_COMPONENTS = {
  'Critical': ['button', 'input', 'form', 'dialog', 'toast', 'alert'],
  'High': ['select', 'checkbox', 'date-picker', 'file-upload', 'tabs', 'dropdown-menu'],
  'Medium': ['card', 'badge', 'avatar', 'pagination', 'progress', 'skeleton'],
  'Low': ['separator', 'icon', 'label', 'breadcrumbs']
};

class CoverageGapAnalyzer {
  constructor() {
    this.componentsDir = path.join(__dirname, '../src/components');
    this.libDir = path.join(__dirname, '../src/lib');
    this.providersDir = path.join(__dirname, '../src/providers');
    this.coverageData = null;
    this.gaps = {
      missingTests: [],
      incompleteTests: [],
      untouchedFiles: [],
      lowCoverage: [],
      edgeCases: []
    };
  }

  async analyze() {
    console.log(`${colors.cyan}${colors.bright}🔍 Analyzing Coverage Gaps for 95% Target${colors.reset}\n`);

    // Try to load coverage report if exists
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      this.coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      console.log(`${colors.green}✓ Found coverage report${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ No coverage report found, analyzing file structure${colors.reset}`);
    }

    // Analyze components
    await this.analyzeComponents();
    
    // Analyze lib utils
    await this.analyzeUtils();
    
    // Analyze providers
    await this.analyzeProviders();
    
    // Generate report
    this.generateReport();
    
    // Generate action plan
    this.generateActionPlan();
  }

  async analyzeComponents() {
    console.log(`\n${colors.bright}📦 Analyzing Components${colors.reset}`);
    console.log('─'.repeat(50));

    // Check folder components
    for (const component of FOLDER_COMPONENTS) {
      const componentPath = path.join(this.componentsDir, component);
      if (fs.existsSync(componentPath)) {
        const hasTest = this.checkForTest(componentPath, component);
        if (!hasTest) {
          this.gaps.missingTests.push({
            name: component,
            priority: this.getPriority(component),
            estimatedEffort: this.estimateEffort(component)
          });
        } else {
          // Check test quality
          const testQuality = this.analyzeTestQuality(componentPath, component);
          if (testQuality.coverage < 80) {
            this.gaps.incompleteTests.push({
              name: component,
              currentCoverage: testQuality.coverage,
              missingScenarios: testQuality.missing,
              priority: this.getPriority(component)
            });
          }
        }
      }
    }

    console.log(`Found ${this.gaps.missingTests.length} components without tests`);
    console.log(`Found ${this.gaps.incompleteTests.length} components with incomplete tests`);
  }

  checkForTest(componentPath, componentName) {
    const files = fs.readdirSync(componentPath);
    const testFiles = files.filter(f => 
      f.endsWith('.test.tsx') || 
      f.endsWith('.test.ts') || 
      f === `${componentName}.test.tsx`
    );
    return testFiles.length > 0;
  }

  analyzeTestQuality(componentPath, componentName) {
    // Simulate test quality analysis
    // In real scenario, this would parse the test file and check coverage
    const testFile = path.join(componentPath, `${componentName}.test.tsx`);
    if (!fs.existsSync(testFile)) {
      return { coverage: 0, missing: ['All tests'] };
    }

    const testContent = fs.readFileSync(testFile, 'utf8');
    const coverage = this.estimateCoverageFromTest(testContent);
    const missing = this.identifyMissingTests(testContent, componentName);

    return { coverage, missing };
  }

  estimateCoverageFromTest(content) {
    // Basic heuristic based on test content
    const testCount = (content.match(/it\(/g) || []).length;
    const describeCount = (content.match(/describe\(/g) || []).length;
    
    if (testCount === 0) return 0;
    if (testCount < 3) return 30;
    if (testCount < 5) return 50;
    if (testCount < 8) return 70;
    if (testCount >= 8 && describeCount >= 2) return 85;
    return 90;
  }

  identifyMissingTests(content, componentName) {
    const missing = [];
    
    // Check for common test scenarios
    if (!content.includes('renders correctly')) missing.push('Basic render test');
    if (!content.includes('props')) missing.push('Props validation');
    if (!content.includes('onClick') && !content.includes('onChange')) missing.push('Event handlers');
    if (!content.includes('accessibility')) missing.push('Accessibility tests');
    if (!content.includes('error')) missing.push('Error states');
    if (!content.includes('loading')) missing.push('Loading states');
    if (!content.includes('disabled')) missing.push('Disabled state');
    
    return missing;
  }

  async analyzeUtils() {
    console.log(`\n${colors.bright}🛠 Analyzing Utils & Lib${colors.reset}`);
    console.log('─'.repeat(50));

    if (fs.existsSync(this.libDir)) {
      const files = fs.readdirSync(this.libDir);
      const utilFiles = files.filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
      
      for (const file of utilFiles) {
        const testFile = file.replace('.ts', '.test.ts');
        const testPath = path.join(this.libDir, testFile);
        
        if (!fs.existsSync(testPath)) {
          this.gaps.untouchedFiles.push({
            path: `lib/${file}`,
            type: 'utility',
            critical: file === 'utils.ts' || file === 'cn.ts'
          });
        }
      }
    }

    console.log(`Found ${this.gaps.untouchedFiles.filter(f => f.type === 'utility').length} utils without tests`);
  }

  async analyzeProviders() {
    console.log(`\n${colors.bright}🎯 Analyzing Providers${colors.reset}`);
    console.log('─'.repeat(50));

    if (fs.existsSync(this.providersDir)) {
      const files = fs.readdirSync(this.providersDir);
      const providerFiles = files.filter(f => f.endsWith('.tsx') && !f.endsWith('.test.tsx'));
      
      for (const file of providerFiles) {
        const testFile = file.replace('.tsx', '.test.tsx');
        const testPath = path.join(this.providersDir, testFile);
        
        if (!fs.existsSync(testPath)) {
          this.gaps.untouchedFiles.push({
            path: `providers/${file}`,
            type: 'provider',
            critical: true // All providers are critical
          });
        }
      }
    }

    console.log(`Found ${this.gaps.untouchedFiles.filter(f => f.type === 'provider').length} providers without tests`);
  }

  getPriority(componentName) {
    for (const [priority, components] of Object.entries(PRIORITY_COMPONENTS)) {
      if (components.includes(componentName)) {
        return priority;
      }
    }
    return 'Normal';
  }

  estimateEffort(componentName) {
    // Estimate based on component complexity
    const complexComponents = ['form', 'data-grid', 'data-grid-adv', 'charts', 'command-palette'];
    const mediumComponents = ['date-picker', 'file-upload', 'select', 'dropdown-menu'];
    
    if (complexComponents.includes(componentName)) return '2-3 hours';
    if (mediumComponents.includes(componentName)) return '1-2 hours';
    return '30-60 min';
  }

  generateReport() {
    console.log(`\n${colors.bright}${colors.magenta}📊 COVERAGE GAP REPORT${colors.reset}`);
    console.log('═'.repeat(60));

    // Current estimate
    const totalComponents = FOLDER_COMPONENTS.length + COMPONENTS_WITH_TESTS.length;
    const testedComponents = COMPONENTS_WITH_TESTS.length + 
      (FOLDER_COMPONENTS.length - this.gaps.missingTests.length);
    const currentCoverage = ((testedComponents / totalComponents) * 100).toFixed(1);

    console.log(`\n${colors.bright}Current Status:${colors.reset}`);
    console.log(`• Total Components: ${totalComponents}`);
    console.log(`• Components with Tests: ${testedComponents}`);
    console.log(`• Estimated Coverage: ${colors.yellow}${currentCoverage}%${colors.reset}`);
    console.log(`• Target Coverage: ${colors.green}95%${colors.reset}`);
    console.log(`• Gap to Close: ${colors.red}${(95 - currentCoverage).toFixed(1)}%${colors.reset}`);

    // Missing tests by priority
    console.log(`\n${colors.bright}${colors.red}🔴 Components Without Tests (${this.gaps.missingTests.length}):${colors.reset}`);
    
    const byPriority = {};
    this.gaps.missingTests.forEach(comp => {
      if (!byPriority[comp.priority]) byPriority[comp.priority] = [];
      byPriority[comp.priority].push(comp);
    });

    ['Critical', 'High', 'Medium', 'Normal', 'Low'].forEach(priority => {
      if (byPriority[priority]) {
        console.log(`\n${colors.yellow}${priority} Priority:${colors.reset}`);
        byPriority[priority].forEach(comp => {
          console.log(`  • ${comp.name} (${comp.estimatedEffort})`);
        });
      }
    });

    // Incomplete tests
    if (this.gaps.incompleteTests.length > 0) {
      console.log(`\n${colors.bright}${colors.yellow}🟡 Components with Incomplete Tests:${colors.reset}`);
      this.gaps.incompleteTests.slice(0, 10).forEach(comp => {
        console.log(`  • ${comp.name} (~${comp.currentCoverage}% coverage)`);
        console.log(`    Missing: ${comp.missingScenarios.slice(0, 3).join(', ')}`);
      });
    }

    // Untested utilities and providers
    const criticalUntested = this.gaps.untouchedFiles.filter(f => f.critical);
    if (criticalUntested.length > 0) {
      console.log(`\n${colors.bright}${colors.red}⚠️  Critical Files Without Tests:${colors.reset}`);
      criticalUntested.forEach(file => {
        console.log(`  • ${file.path} (${file.type})`);
      });
    }
  }

  generateActionPlan() {
    console.log(`\n${colors.bright}${colors.green}🎯 ACTION PLAN TO REACH 95% COVERAGE${colors.reset}`);
    console.log('═'.repeat(60));

    const phases = [
      {
        name: 'Phase 1: Critical Components (2-3 hours)',
        items: this.gaps.missingTests.filter(c => c.priority === 'Critical'),
        impact: '+5-7%'
      },
      {
        name: 'Phase 2: Utils & Providers (1-2 hours)',
        items: this.gaps.untouchedFiles.filter(f => f.critical),
        impact: '+3-4%'
      },
      {
        name: 'Phase 3: High Priority Components (3-4 hours)',
        items: this.gaps.missingTests.filter(c => c.priority === 'High'),
        impact: '+4-5%'
      },
      {
        name: 'Phase 4: Edge Cases & Error Handling (2-3 hours)',
        items: this.gaps.incompleteTests.slice(0, 5),
        impact: '+2-3%'
      }
    ];

    phases.forEach((phase, index) => {
      console.log(`\n${colors.cyan}${phase.name}${colors.reset}`);
      console.log(`Expected Impact: ${colors.green}${phase.impact}${colors.reset}`);
      console.log('Components to test:');
      
      if (phase.items.length > 0) {
        phase.items.forEach(item => {
          const name = item.name || item.path;
          console.log(`  ${index + 1}. ${name}`);
        });
      }
    });

    // Quick wins
    console.log(`\n${colors.bright}${colors.blue}⚡ QUICK WINS (Can do immediately):${colors.reset}`);
    const quickWins = [
      'Add basic render tests for: button, input, label',
      'Test utils.ts and cn.ts functions',
      'Add props validation tests for existing components',
      'Test error boundaries and edge cases'
    ];
    
    quickWins.forEach((win, i) => {
      console.log(`  ${i + 1}. ${win}`);
    });

    // Time estimate
    console.log(`\n${colors.bright}${colors.magenta}⏱ TIME ESTIMATE:${colors.reset}`);
    console.log(`Total effort needed: ~10-12 hours`);
    console.log(`If working efficiently: 6-8 hours`);
    console.log(`Deadline: August 18-19 to reach 95%`);
  }

  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      currentCoverage: '88-90%',
      targetCoverage: '95%',
      gaps: this.gaps,
      actionPlan: {
        immediate: this.gaps.missingTests.filter(c => c.priority === 'Critical'),
        highPriority: this.gaps.missingTests.filter(c => c.priority === 'High'),
        utils: this.gaps.untouchedFiles.filter(f => f.type === 'utility'),
        providers: this.gaps.untouchedFiles.filter(f => f.type === 'provider')
      }
    };

    const reportPath = path.join(__dirname, 'coverage-gap-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${colors.green}📄 Detailed report saved to: ${reportPath}${colors.reset}`);
  }
}

// Run the analyzer
async function main() {
  console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════╗
║        🎯 Coverage Gap Analysis - Session 14              ║
║          Target: 95% Coverage by August 18                ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  const analyzer = new CoverageGapAnalyzer();
  await analyzer.analyze();
  analyzer.saveDetailedReport();

  console.log(`\n${colors.dim}Next step: Start with Phase 1 critical components${colors.reset}`);
}

main().catch(console.error);
