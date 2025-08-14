#!/usr/bin/env node

/**
 * Test Coverage Gap Analyzer
 * Identifies components without tests and generates a report
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const COVERAGE_REPORT = path.join(__dirname, '../coverage-gaps-report.md');

// List of all 58 components in the Design System
const ALL_COMPONENTS = [
  'accordion', 'alert', 'avatar', 'badge', 'breadcrumb',
  'button', 'calendar', 'card', 'carousel', 'chart',
  'checkbox', 'collapsible', 'color-picker', 'command-palette', 'context-menu',
  'data-grid', 'data-grid-advanced', 'date-picker', 'date-range-picker', 'dialog',
  'dropdown-menu', 'error-boundary', 'file-upload', 'form', 'forms-demo',
  'hover-card', 'icon', 'input', 'label', 'menubar',
  'navigation-menu', 'pagination', 'popover', 'progress', 'radio-group',
  'rating', 'resizable', 'scroll-area', 'select', 'separator',
  'sheet', 'skeleton', 'slider', 'sonner', 'stepper',
  'switch', 'table', 'tabs', 'text-animations', 'textarea',
  'timeline', 'toast', 'toggle', 'toggle-group', 'tooltip',
  'ui-provider'
];

function analyzeTestCoverage() {
  console.log(chalk.cyan('\n📊 Analyzing Test Coverage Gaps...\n'));
  
  const results = {
    tested: [],
    untested: [],
    missing: [],
    testFiles: [],
    coverage: {}
  };

  // Check each component
  ALL_COMPONENTS.forEach(component => {
    const componentPath = path.join(COMPONENTS_DIR, component);
    const testPath = path.join(componentPath, `${component}.test.tsx`);
    const altTestPath = path.join(componentPath, `${component}.test.ts`);
    const indexPath = path.join(componentPath, 'index.tsx');
    const altIndexPath = path.join(componentPath, 'index.ts');

    // Check if component exists
    if (!fs.existsSync(componentPath)) {
      results.missing.push(component);
      return;
    }

    // Check if test file exists
    if (fs.existsSync(testPath) || fs.existsSync(altTestPath)) {
      results.tested.push(component);
      const testFile = fs.existsSync(testPath) ? testPath : altTestPath;
      const stats = fs.statSync(testFile);
      results.testFiles.push({
        component,
        file: path.relative(process.cwd(), testFile),
        size: (stats.size / 1024).toFixed(2) + 'KB'
      });
    } else {
      results.untested.push(component);
    }
  });

  // Calculate statistics
  const totalComponents = ALL_COMPONENTS.length;
  const testedCount = results.tested.length;
  const untestedCount = results.untested.length;
  const missingCount = results.missing.length;
  const coveragePercent = ((testedCount / totalComponents) * 100).toFixed(2);

  // Display results
  console.log(chalk.green(`✅ Components with tests: ${testedCount}/${totalComponents} (${coveragePercent}%)`));
  console.log(chalk.red(`❌ Components without tests: ${untestedCount}`));
  console.log(chalk.yellow(`⚠️  Missing components: ${missingCount}`));

  console.log('\n' + chalk.cyan('📋 Tested Components:'));
  results.tested.forEach(comp => {
    const testFile = results.testFiles.find(tf => tf.component === comp);
    console.log(chalk.green(`  ✓ ${comp}`) + (testFile ? chalk.gray(` (${testFile.size})`) : ''));
  });

  if (results.untested.length > 0) {
    console.log('\n' + chalk.red('🔴 Components needing tests:'));
    results.untested.forEach(comp => {
      console.log(chalk.red(`  ✗ ${comp}`));
    });
  }

  if (results.missing.length > 0) {
    console.log('\n' + chalk.yellow('⚠️  Missing components:'));
    results.missing.forEach(comp => {
      console.log(chalk.yellow(`  ? ${comp}`));
    });
  }

  // Generate markdown report
  const report = generateMarkdownReport(results, coveragePercent, totalComponents, testedCount, untestedCount);
  fs.writeFileSync(COVERAGE_REPORT, report);
  console.log(chalk.blue(`\n📄 Report saved to: ${path.relative(process.cwd(), COVERAGE_REPORT)}`));

  // Priority list for testing
  const priorityComponents = ['select', 'dialog', 'form', 'table', 'tabs', 'toast', 'tooltip'];
  const priorityUntested = results.untested.filter(comp => priorityComponents.includes(comp));
  
  if (priorityUntested.length > 0) {
    console.log('\n' + chalk.magenta('🎯 Priority Components to Test:'));
    priorityUntested.forEach(comp => {
      console.log(chalk.magenta(`  ⭐ ${comp}`));
    });
  }

  return results;
}

function generateMarkdownReport(results, coveragePercent, total, tested, untested) {
  const timestamp = new Date().toISOString();
  
  return `# Test Coverage Gap Analysis Report

Generated: ${timestamp}

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Total Components** | ${total} |
| **Tested** | ${tested} (${coveragePercent}%) |
| **Untested** | ${untested} |
| **Missing** | ${results.missing.length} |

## ✅ Components with Tests (${tested})

| Component | Test File | Size |
|-----------|-----------|------|
${results.testFiles.map(tf => `| ${tf.component} | ${tf.file} | ${tf.size} |`).join('\n')}

## ❌ Components Without Tests (${untested})

${results.untested.length > 0 ? results.untested.map(comp => `- [ ] ${comp}`).join('\n') : 'All components have tests! 🎉'}

## 🎯 Testing Priority

### High Priority (Core Components)
${['button', 'input', 'select', 'form', 'dialog'].map(comp => 
  `- [${results.tested.includes(comp) ? 'x' : ' '}] ${comp}`
).join('\n')}

### Medium Priority (Layout & Navigation)
${['card', 'table', 'tabs', 'navigation-menu', 'pagination'].map(comp => 
  `- [${results.tested.includes(comp) ? 'x' : ' '}] ${comp}`
).join('\n')}

### Low Priority (Advanced Features)
${['command-palette', 'color-picker', 'data-grid-advanced', 'text-animations'].map(comp => 
  `- [${results.tested.includes(comp) ? 'x' : ' '}] ${comp}`
).join('\n')}

## 📝 Next Steps

1. Run \`npm run test:coverage\` to generate detailed coverage report
2. Focus on high-priority untested components
3. Aim for minimum 80% coverage per component
4. Update this report regularly

## 🚀 Commands

\`\`\`bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Generate this report
npm run test:gaps
\`\`\`
`;
}

// Run the analyzer
analyzeTestCoverage();
