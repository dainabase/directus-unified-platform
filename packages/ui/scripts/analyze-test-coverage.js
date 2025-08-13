#!/usr/bin/env node

/**
 * Advanced Test Coverage Analyzer
 * Date: 13 Août 2025
 * Objective: Comprehensive analysis of test coverage for all UI components
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const CONFIG = {
  componentsDir: path.join(__dirname, '../src/components'),
};

// Components we already know have standalone tests
const STANDALONE_TEST_COMPONENTS = [
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

// Components that might only have stories (no tsx component file)
const STORY_ONLY_COMPONENTS = [
  'kanban' // Has both kanban.tsx and kanban folder
];

async function analyzeComponent(componentPath, componentName) {
  const result = {
    name: componentName,
    hasTest: false,
    hasComponent: false,
    hasStories: false,
    hasIndex: false,
    testFiles: [],
    componentFiles: [],
    type: 'unknown',
    path: componentPath
  };

  try {
    const stat = fs.statSync(componentPath);
    
    if (stat.isDirectory()) {
      result.type = 'directory';
      const files = fs.readdirSync(componentPath);
      
      files.forEach(file => {
        const filePath = path.join(componentPath, file);
        
        // Check for test files
        if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
          result.hasTest = true;
          result.testFiles.push(file);
        }
        
        // Check for component files
        if (file.endsWith('.tsx') && !file.includes('.test') && !file.includes('.stories')) {
          result.hasComponent = true;
          result.componentFiles.push(file);
        }
        
        // Check for story files
        if (file.endsWith('.stories.tsx')) {
          result.hasStories = true;
        }
        
        // Check for index file
        if (file === 'index.tsx' || file === 'index.ts') {
          result.hasIndex = true;
        }
      });
    } else if (stat.isFile()) {
      result.type = 'file';
      
      // Handle standalone files
      if (componentPath.endsWith('.test.tsx')) {
        result.hasTest = true;
        result.testFiles.push(componentName);
      } else if (componentPath.endsWith('.tsx') && !componentPath.includes('.stories')) {
        result.hasComponent = true;
        result.componentFiles.push(componentName);
      } else if (componentPath.endsWith('.stories.tsx')) {
        result.hasStories = true;
      }
    }
  } catch (error) {
    console.error(`Error analyzing ${componentName}: ${error.message}`);
  }
  
  return result;
}

async function scanAllComponents() {
  console.log(`${colors.bright}${colors.cyan}🔍 ADVANCED TEST COVERAGE ANALYSIS${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📅 Date: 13 Août 2025`);
  console.log(`📦 Package: @dainabase/ui v1.1.0\n`);
  
  const results = {
    componentsWithTests: [],
    componentsWithoutTests: [],
    allComponents: [],
    standaloneTests: [],
    directories: [],
    files: []
  };

  try {
    const items = fs.readdirSync(CONFIG.componentsDir);
    
    // Process each item
    for (const item of items) {
      // Skip index files
      if (item === 'index.ts' || item === 'index.tsx') continue;
      
      const itemPath = path.join(CONFIG.componentsDir, item);
      const baseName = item
        .replace('.test.tsx', '')
        .replace('.test.ts', '')
        .replace('.stories.tsx', '')
        .replace('.tsx', '')
        .replace('.ts', '');
      
      // Check if this is a known standalone test component
      if (STANDALONE_TEST_COMPONENTS.includes(baseName)) {
        // For standalone components, check all related files
        const hasTest = items.some(i => 
          i === `${baseName}.test.tsx` || 
          i === `${baseName}.test.ts`
        );
        
        if (hasTest && !results.componentsWithTests.includes(baseName)) {
          results.componentsWithTests.push(baseName);
        }
        
        if (!results.allComponents.includes(baseName)) {
          results.allComponents.push(baseName);
        }
      } else {
        const analysis = await analyzeComponent(itemPath, item);
        
        if (analysis.type === 'directory') {
          results.directories.push(analysis);
          
          if (analysis.hasTest) {
            results.componentsWithTests.push(analysis.name);
          } else {
            results.componentsWithoutTests.push(analysis.name);
          }
          
          results.allComponents.push(analysis.name);
        } else if (analysis.type === 'file') {
          // Handle standalone files that aren't in our known list
          if (item.endsWith('.test.tsx') || item.endsWith('.test.ts')) {
            const componentName = item
              .replace('.test.tsx', '')
              .replace('.test.ts', '');
            
            if (!results.componentsWithTests.includes(componentName)) {
              results.standaloneTests.push(componentName);
            }
          }
        }
      }
    }
    
    // Deduplicate and sort
    results.componentsWithTests = [...new Set(results.componentsWithTests)].sort();
    results.componentsWithoutTests = [...new Set(results.componentsWithoutTests)].sort();
    results.allComponents = [...new Set(results.allComponents)].sort();
    
    // Calculate coverage
    const totalComponents = results.allComponents.length;
    const testedComponents = results.componentsWithTests.length;
    const coverage = totalComponents > 0 ? (testedComponents / totalComponents * 100).toFixed(2) : 0;
    
    // Display results
    console.log(`${colors.bright}📊 ANALYSIS RESULTS:${colors.reset}`);
    console.log(`• Total Components: ${totalComponents}`);
    console.log(`• Components WITH Tests: ${colors.green}${testedComponents}${colors.reset}`);
    console.log(`• Components WITHOUT Tests: ${colors.red}${results.componentsWithoutTests.length}${colors.reset}`);
    console.log(`• Current Coverage: ${colors.bright}${coverage}%${colors.reset}`);
    console.log(`• Tests Needed: ${results.componentsWithoutTests.length}`);
    console.log(`• Progress: [${colors.green}${'█'.repeat(Math.floor(coverage/5))}${colors.reset}${'░'.repeat(20-Math.floor(coverage/5))}]`);
    
    // List components WITH tests
    console.log(`\n${colors.green}✅ COMPONENTS WITH TESTS (${testedComponents}):${colors.reset}`);
    results.componentsWithTests.forEach((comp, index) => {
      const isStandalone = STANDALONE_TEST_COMPONENTS.includes(comp);
      const label = isStandalone ? ' [standalone]' : '';
      console.log(`  ${index + 1}. ${comp}${label}`);
    });
    
    // List components WITHOUT tests
    if (results.componentsWithoutTests.length > 0) {
      console.log(`\n${colors.red}❌ COMPONENTS WITHOUT TESTS (${results.componentsWithoutTests.length}):${colors.reset}`);
      results.componentsWithoutTests.forEach((comp, index) => {
        console.log(`  ${colors.red}${index + 1}. ${comp}${colors.reset}`);
      });
      
      // Generate batch test command
      console.log(`\n${colors.bright}${colors.blue}🚀 BATCH TEST GENERATION:${colors.reset}`);
      console.log(`\nTo generate ALL missing tests at once, run:\n`);
      console.log(`${colors.yellow}node scripts/generate-batch-tests.js${colors.reset}`);
      
      console.log(`\nOr generate tests individually:\n`);
      results.componentsWithoutTests.slice(0, 5).forEach(comp => {
        console.log(`node scripts/generate-single-test.js ${comp}`);
      });
      
      if (results.componentsWithoutTests.length > 5) {
        console.log(`... and ${results.componentsWithoutTests.length - 5} more`);
      }
    } else {
      console.log(`\n${colors.bright}${colors.green}🎉 PERFECT! 100% Test Coverage Achieved!${colors.reset}`);
      console.log(`All ${totalComponents} components have tests!`);
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, '../test-analysis-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      coverage: `${coverage}%`,
      statistics: {
        total: totalComponents,
        tested: testedComponents,
        untested: results.componentsWithoutTests.length,
        progress: Math.floor(parseFloat(coverage))
      },
      componentsWithTests: results.componentsWithTests,
      componentsWithoutTests: results.componentsWithoutTests,
      standaloneComponents: STANDALONE_TEST_COMPONENTS,
      directories: results.directories.map(d => ({
        name: d.name,
        hasTest: d.hasTest,
        testFiles: d.testFiles,
        componentFiles: d.componentFiles
      }))
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: test-analysis-report.json`);
    
    // GitHub Issue Update Message
    if (results.componentsWithoutTests.length > 0) {
      console.log(`\n${colors.yellow}📝 GitHub Issue #34 Update:${colors.reset}`);
      console.log(`Coverage: ${coverage}% | ${testedComponents}/${totalComponents} components tested`);
      console.log(`Remaining: ${results.componentsWithoutTests.join(', ')}`);
    }
    
    // NPM Readiness Check
    console.log(`\n${colors.bright}${colors.magenta}📦 NPM PUBLICATION READINESS:${colors.reset}`);
    if (coverage >= 100) {
      console.log(`${colors.green}✅ READY FOR NPM!${colors.reset} All tests complete!`);
      console.log(`Run: npm run publish:npm`);
    } else if (coverage >= 90) {
      console.log(`${colors.yellow}⚠️ ALMOST READY!${colors.reset} ${(100 - coverage).toFixed(2)}% to go!`);
    } else if (coverage >= 80) {
      console.log(`${colors.yellow}📈 GOOD PROGRESS!${colors.reset} ${(100 - coverage).toFixed(2)}% remaining`);
    } else {
      console.log(`${colors.red}🚧 MORE WORK NEEDED${colors.reset} ${(100 - coverage).toFixed(2)}% remaining`);
    }
    
    // Exit code based on coverage
    process.exit(coverage === '100.00' ? 0 : 1);
    
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the analysis
scanAllComponents().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
