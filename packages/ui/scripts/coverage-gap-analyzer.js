#!/usr/bin/env node

/**
 * Test Coverage Gap Analyzer
 * Identifies components and functions with missing or low test coverage
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COMPONENTS_DIR = path.join(__dirname, '..', 'src', 'components');
const COVERAGE_FILE = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');
const REPORT_FILE = path.join(__dirname, '..', 'coverage-gaps.md');

/**
 * Component test requirements
 */
const TEST_REQUIREMENTS = {
  essential: [
    'renders without crashing',
    'handles required props',
    'handles optional props',
    'accessibility attributes',
    'keyboard navigation',
    'event handlers',
    'error states',
    'loading states'
  ],
  advanced: [
    'responsive behavior',
    'theme variants',
    'internationalization',
    'animations',
    'edge cases',
    'performance',
    'memory leaks'
  ]
};

/**
 * Find all components
 */
function findComponents() {
  const components = [];
  
  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(chalk.red(`Components directory not found: ${COMPONENTS_DIR}`));
    return components;
  }

  const dirs = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  dirs.forEach(dir => {
    const componentPath = path.join(COMPONENTS_DIR, dir);
    const files = fs.readdirSync(componentPath);
    
    const component = {
      name: dir,
      path: componentPath,
      hasComponent: false,
      hasTest: false,
      hasStory: false,
      hasTypes: false,
      hasDocs: false,
      testFile: null,
      componentFile: null,
      coverage: null
    };

    files.forEach(file => {
      if (file.endsWith('.tsx') && !file.includes('.test') && !file.includes('.stories')) {
        component.hasComponent = true;
        component.componentFile = path.join(componentPath, file);
      }
      if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
        component.hasTest = true;
        component.testFile = path.join(componentPath, file);
      }
      if (file.endsWith('.stories.tsx') || file.endsWith('.stories.ts')) {
        component.hasStory = true;
      }
      if (file === 'types.ts' || file === 'types.tsx') {
        component.hasTypes = true;
      }
      if (file.endsWith('.md')) {
        component.hasDocs = true;
      }
    });

    components.push(component);
  });

  return components;
}

/**
 * Load coverage data
 */
function loadCoverage() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.warn(chalk.yellow(`Coverage file not found: ${COVERAGE_FILE}`));
    console.log(chalk.gray('Run "npm run test:coverage" first to generate coverage data'));
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
  } catch (error) {
    console.error(chalk.red('Error reading coverage file:'), error.message);
    return null;
  }
}

/**
 * Analyze test file for coverage gaps
 */
function analyzeTestFile(testFile) {
  if (!fs.existsSync(testFile)) {
    return { exists: false, tests: [] };
  }

  const content = fs.readFileSync(testFile, 'utf8');
  const tests = [];
  
  // Find test descriptions
  const testMatches = content.match(/(?:it|test)\(['"`](.*?)['"`]/g) || [];
  testMatches.forEach(match => {
    const description = match.match(/['"`](.*?)['"`]/)[1];
    tests.push(description);
  });

  // Check for essential tests
  const missingEssential = TEST_REQUIREMENTS.essential.filter(req => {
    return !tests.some(test => 
      test.toLowerCase().includes(req.toLowerCase().replace(' ', ''))
    );
  });

  return {
    exists: true,
    tests,
    testCount: tests.length,
    missingEssential,
    hasAsync: content.includes('async') || content.includes('await'),
    hasMocking: content.includes('mock') || content.includes('jest.fn'),
    hasSnapshot: content.includes('toMatchSnapshot'),
    hasIntegration: content.includes('integration') || content.includes('e2e')
  };
}

/**
 * Calculate coverage percentage for a component
 */
function getComponentCoverage(componentName, coverageData) {
  if (!coverageData) return null;

  // Look for coverage data for this component
  for (const [filePath, data] of Object.entries(coverageData)) {
    if (filePath.includes(componentName)) {
      const lines = data.lines || {};
      const statements = data.statements || {};
      const functions = data.functions || {};
      const branches = data.branches || {};

      return {
        lines: lines.pct || 0,
        statements: statements.pct || 0,
        functions: functions.pct || 0,
        branches: branches.pct || 0,
        overall: (
          (lines.pct || 0) + 
          (statements.pct || 0) + 
          (functions.pct || 0) + 
          (branches.pct || 0)
        ) / 4
      };
    }
  }

  return null;
}

/**
 * Generate recommendations
 */
function generateRecommendations(component, testAnalysis, coverage) {
  const recommendations = [];

  if (!component.hasTest) {
    recommendations.push({
      priority: 'HIGH',
      type: 'MISSING_TEST',
      message: 'Create test file',
      action: `Create ${component.name}.test.tsx`
    });
  }

  if (testAnalysis.exists && testAnalysis.testCount < 3) {
    recommendations.push({
      priority: 'HIGH',
      type: 'LOW_TEST_COUNT',
      message: 'Add more test cases',
      action: `Current: ${testAnalysis.testCount} tests, Recommended: 5+ tests`
    });
  }

  if (testAnalysis.missingEssential && testAnalysis.missingEssential.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      type: 'MISSING_ESSENTIAL',
      message: 'Add essential test cases',
      action: `Missing: ${testAnalysis.missingEssential.join(', ')}`
    });
  }

  if (coverage && coverage.overall < 80) {
    recommendations.push({
      priority: 'HIGH',
      type: 'LOW_COVERAGE',
      message: 'Increase test coverage',
      action: `Current: ${coverage.overall.toFixed(1)}%, Target: 80%+`
    });
  }

  if (!component.hasStory) {
    recommendations.push({
      priority: 'LOW',
      type: 'MISSING_STORY',
      message: 'Create Storybook story',
      action: `Create ${component.name}.stories.tsx`
    });
  }

  if (!testAnalysis.hasSnapshot) {
    recommendations.push({
      priority: 'LOW',
      type: 'NO_SNAPSHOT',
      message: 'Add snapshot test',
      action: 'Add toMatchSnapshot() test'
    });
  }

  return recommendations;
}

/**
 * Main analysis function
 */
async function analyze() {
  console.log(chalk.blue.bold('\n🔍 Test Coverage Gap Analyzer'));
  console.log(chalk.gray('=' .repeat(50)));

  const components = findComponents();
  const coverageData = loadCoverage();
  
  console.log(chalk.cyan(`\nFound ${components.length} components to analyze\n`));

  const results = {
    total: components.length,
    withTests: 0,
    withoutTests: 0,
    withFullCoverage: 0,
    withPartialCoverage: 0,
    withNoCoverage: 0,
    gaps: [],
    recommendations: []
  };

  const componentResults = [];

  components.forEach(component => {
    const testAnalysis = analyzeTestFile(component.testFile);
    const coverage = getComponentCoverage(component.name, coverageData);
    const recommendations = generateRecommendations(component, testAnalysis, coverage);

    component.testAnalysis = testAnalysis;
    component.coverage = coverage;
    component.recommendations = recommendations;

    // Update statistics
    if (component.hasTest) results.withTests++;
    else results.withoutTests++;

    if (coverage) {
      if (coverage.overall >= 95) results.withFullCoverage++;
      else if (coverage.overall >= 50) results.withPartialCoverage++;
      else results.withNoCoverage++;
    }

    // Identify gaps
    if (!component.hasTest || (coverage && coverage.overall < 80)) {
      results.gaps.push(component);
    }

    componentResults.push(component);
  });

  // Sort by priority (components without tests first, then by coverage)
  componentResults.sort((a, b) => {
    if (!a.hasTest && b.hasTest) return -1;
    if (a.hasTest && !b.hasTest) return 1;
    if (a.coverage && b.coverage) {
      return a.coverage.overall - b.coverage.overall;
    }
    return 0;
  });

  // Display results
  console.log(chalk.green.bold('📊 Overall Statistics:'));
  console.log(`  Total Components: ${chalk.cyan(results.total)}`);
  console.log(`  With Tests: ${chalk.green(results.withTests)} (${(results.withTests/results.total*100).toFixed(1)}%)`);
  console.log(`  Without Tests: ${chalk.red(results.withoutTests)} (${(results.withoutTests/results.total*100).toFixed(1)}%)`);
  
  if (coverageData) {
    console.log(`  Full Coverage (95%+): ${chalk.green(results.withFullCoverage)}`);
    console.log(`  Partial Coverage: ${chalk.yellow(results.withPartialCoverage)}`);
    console.log(`  Low/No Coverage: ${chalk.red(results.withNoCoverage)}`);
  }

  // Display top gaps
  console.log(chalk.red.bold('\n🔴 Top Priority Gaps:'));
  const topGaps = componentResults.slice(0, 10);
  
  topGaps.forEach((component, index) => {
    const coverage = component.coverage ? `${component.coverage.overall.toFixed(1)}%` : 'N/A';
    const status = component.hasTest ? chalk.yellow('⚠️') : chalk.red('❌');
    
    console.log(`  ${index + 1}. ${status} ${chalk.white(component.name)} - Coverage: ${coverage}`);
    
    if (component.recommendations.length > 0) {
      const highPriority = component.recommendations.filter(r => r.priority === 'HIGH');
      if (highPriority.length > 0) {
        console.log(chalk.gray(`     → ${highPriority[0].message}: ${highPriority[0].action}`));
      }
    }
  });

  // Generate detailed report
  generateDetailedReport(componentResults, results);

  console.log(chalk.gray(`\n📄 Detailed report saved to: ${REPORT_FILE}`));
  console.log(chalk.green.bold('\n✨ Analysis complete!\n'));

  // Return summary for CI
  return {
    success: results.withoutTests === 0 && results.withNoCoverage === 0,
    coverage: ((results.withTests / results.total) * 100).toFixed(1),
    gaps: results.gaps.length,
    components: results.total
  };
}

/**
 * Generate detailed markdown report
 */
function generateDetailedReport(components, stats) {
  const report = `# Test Coverage Gap Analysis Report

**Generated:** ${new Date().toISOString()}  
**Total Components:** ${stats.total}  
**Components with Tests:** ${stats.withTests} (${(stats.withTests/stats.total*100).toFixed(1)}%)  
**Coverage Goal:** 100%

## 📊 Summary Statistics

| Metric | Count | Percentage |
|--------|-------|------------|
| Components with Tests | ${stats.withTests} | ${(stats.withTests/stats.total*100).toFixed(1)}% |
| Components without Tests | ${stats.withoutTests} | ${(stats.withoutTests/stats.total*100).toFixed(1)}% |
| Full Coverage (95%+) | ${stats.withFullCoverage} | ${(stats.withFullCoverage/stats.total*100).toFixed(1)}% |
| Partial Coverage | ${stats.withPartialCoverage} | ${(stats.withPartialCoverage/stats.total*100).toFixed(1)}% |
| Low/No Coverage | ${stats.withNoCoverage} | ${(stats.withNoCoverage/stats.total*100).toFixed(1)}% |

## 🔴 Components Requiring Immediate Attention

${components
  .filter(c => !c.hasTest || (c.coverage && c.coverage.overall < 50))
  .slice(0, 10)
  .map((c, i) => {
    const coverage = c.coverage ? `${c.coverage.overall.toFixed(1)}%` : 'No data';
    return `### ${i + 1}. ${c.name}

- **Status:** ${c.hasTest ? '⚠️ Low Coverage' : '❌ No Tests'}
- **Coverage:** ${coverage}
- **Path:** \`${c.path}\`

**Recommendations:**
${c.recommendations.map(r => `- **[${r.priority}]** ${r.message}: ${r.action}`).join('\n')}
`;
  }).join('\n')}

## ✅ Components with Good Coverage

${components
  .filter(c => c.coverage && c.coverage.overall >= 95)
  .slice(0, 5)
  .map(c => `- ✅ **${c.name}** - ${c.coverage.overall.toFixed(1)}% coverage`)
  .join('\n')}

## 📋 Action Items

1. **Immediate (This Week):**
   - Create test files for components without any tests
   - Add essential test cases for components with < 50% coverage
   
2. **Short-term (Next Sprint):**
   - Achieve 80% coverage for all core components
   - Add integration tests for complex components
   
3. **Long-term (This Quarter):**
   - Reach 95%+ coverage across all components
   - Implement visual regression testing
   - Add performance benchmarks

## 🎯 Coverage Targets

| Component Type | Current | Target | Gap |
|----------------|---------|--------|-----|
| Core UI | ${calculateTypeAverage(components, 'core')}% | 100% | ${100 - calculateTypeAverage(components, 'core')}% |
| Forms | ${calculateTypeAverage(components, 'form')}% | 95% | ${Math.max(0, 95 - calculateTypeAverage(components, 'form'))}% |
| Data Display | ${calculateTypeAverage(components, 'data')}% | 90% | ${Math.max(0, 90 - calculateTypeAverage(components, 'data'))}% |
| Navigation | ${calculateTypeAverage(components, 'nav')}% | 95% | ${Math.max(0, 95 - calculateTypeAverage(components, 'nav'))}% |

---

*Generated by coverage-gap-analyzer.js*
`;

  fs.writeFileSync(REPORT_FILE, report);
}

/**
 * Calculate average coverage for component type
 */
function calculateTypeAverage(components, type) {
  const typeComponents = components.filter(c => {
    const name = c.name.toLowerCase();
    switch(type) {
      case 'core': return ['button', 'icon', 'label'].includes(name);
      case 'form': return name.includes('input') || name.includes('select') || name.includes('form');
      case 'data': return name.includes('table') || name.includes('grid') || name.includes('list');
      case 'nav': return name.includes('nav') || name.includes('menu') || name.includes('tab');
      default: return false;
    }
  });

  if (typeComponents.length === 0) return 0;

  const total = typeComponents.reduce((sum, c) => 
    sum + (c.coverage ? c.coverage.overall : 0), 0
  );

  return (total / typeComponents.length).toFixed(1);
}

// Run analyzer
if (require.main === module) {
  analyze().catch(error => {
    console.error(chalk.red('Analysis failed:'), error);
    process.exit(1);
  });
}

module.exports = { analyze, findComponents, analyzeTestFile };
