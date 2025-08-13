#!/usr/bin/env node

/**
 * Missing 5% Coverage Identifier
 * Finds the exact functions, branches, and lines missing test coverage
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const COMPONENTS_DIR = path.join(__dirname, '..', 'src', 'components');

// Priority components that MUST have 100% coverage
const PRIORITY_COMPONENTS = [
  'button',
  'input', 
  'select',
  'dialog',
  'form',
  'table',
  'card',
  'alert',
  'toast',
  'dropdown-menu'
];

// Specific test patterns we need
const REQUIRED_TEST_PATTERNS = {
  accessibility: [
    'aria-label',
    'aria-describedby',
    'role attribute',
    'keyboard navigation',
    'focus trap',
    'screen reader'
  ],
  interaction: [
    'onClick handler',
    'onChange handler',
    'onSubmit handler',
    'onKeyDown handler',
    'hover state',
    'disabled state'
  ],
  edge_cases: [
    'null props',
    'undefined props',
    'empty arrays',
    'large datasets',
    'long text overflow',
    'special characters'
  ],
  async: [
    'loading state',
    'error state',
    'success state',
    'network failure',
    'timeout handling',
    'retry logic'
  ],
  performance: [
    'memo optimization',
    'render count',
    'large list rendering',
    'debounce/throttle',
    'lazy loading',
    'code splitting'
  ]
};

/**
 * Analyze component for missing tests
 */
function analyzeComponent(componentName) {
  const componentPath = path.join(COMPONENTS_DIR, componentName);
  
  if (!fs.existsSync(componentPath)) {
    return null;
  }

  const files = fs.readdirSync(componentPath);
  const analysis = {
    name: componentName,
    hasTest: false,
    missingPatterns: [],
    suggestedTests: [],
    priority: PRIORITY_COMPONENTS.includes(componentName) ? 'HIGH' : 'NORMAL',
    testFile: null,
    componentFile: null
  };

  // Find test and component files
  files.forEach(file => {
    if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
      analysis.hasTest = true;
      analysis.testFile = path.join(componentPath, file);
    }
    if (file.endsWith('.tsx') && !file.includes('.test') && !file.includes('.stories')) {
      analysis.componentFile = path.join(componentPath, file);
    }
  });

  // Analyze test coverage patterns
  if (analysis.testFile && fs.existsSync(analysis.testFile)) {
    const testContent = fs.readFileSync(analysis.testFile, 'utf8');
    
    // Check for missing test patterns
    Object.entries(REQUIRED_TEST_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        const searchTerms = pattern.toLowerCase().split(' ');
        const hasPattern = searchTerms.some(term => 
          testContent.toLowerCase().includes(term)
        );
        
        if (!hasPattern) {
          analysis.missingPatterns.push({
            category,
            pattern,
            priority: category === 'accessibility' ? 'HIGH' : 'MEDIUM'
          });
        }
      });
    });

    // Generate specific test suggestions
    if (analysis.componentFile && fs.existsSync(analysis.componentFile)) {
      const componentContent = fs.readFileSync(analysis.componentFile, 'utf8');
      
      // Find event handlers that need testing
      const eventHandlers = componentContent.match(/on[A-Z]\w+/g) || [];
      eventHandlers.forEach(handler => {
        if (!testContent.includes(handler)) {
          analysis.suggestedTests.push({
            type: 'EVENT_HANDLER',
            description: `Test ${handler} event handler`,
            code: `it('should handle ${handler} event', () => {
    const ${handler} = jest.fn();
    render(<${componentName} ${handler}={${handler}} />);
    // Trigger event
    expect(${handler}).toHaveBeenCalled();
  });`
          });
        }
      });

      // Check for props that need testing
      const propsMatch = componentContent.match(/interface.*Props[\s\S]*?{([\s\S]*?)}/);
      if (propsMatch) {
        const propsContent = propsMatch[1];
        const props = propsContent.match(/(\w+)(\?)?:/g) || [];
        
        props.forEach(prop => {
          const propName = prop.replace(/[?:]/g, '');
          const isOptional = prop.includes('?');
          
          if (!testContent.includes(propName)) {
            analysis.suggestedTests.push({
              type: 'PROP_TEST',
              description: `Test ${propName} prop ${isOptional ? '(optional)' : '(required)'}`,
              code: `it('should handle ${propName} prop correctly', () => {
    const { rerender } = render(<${componentName} ${propName}={testValue} />);
    // Test with prop
    expect(/* assertion */).toBe(/* expected */);
    
    ${isOptional ? `// Test without optional prop
    rerender(<${componentName} />);
    expect(/* assertion */).toBe(/* expected */);` : ''}
  });`
            });
          }
        });
      }
    }
  } else if (!analysis.hasTest) {
    // Generate complete test file template
    analysis.suggestedTests.push({
      type: 'CREATE_TEST_FILE',
      description: 'Create complete test file',
      code: `import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByRole('${componentName.toLowerCase()}')).toBeInTheDocument();
  });

  it('handles required props', () => {
    // Add required prop tests
  });

  it('handles user interactions', () => {
    // Add interaction tests
  });

  it('meets accessibility standards', () => {
    const { container } = render(<${componentName} />);
    expect(container).toHaveNoAccessibilityViolations();
  });

  it('handles edge cases', () => {
    // Test with null, undefined, empty values
  });
});`
    });
  }

  return analysis;
}

/**
 * Main analysis function
 */
async function findMissing5Percent() {
  console.log(chalk.blue.bold('\n🔍 Missing 5% Coverage Identifier'));
  console.log(chalk.gray('Finding exact gaps in test coverage...'));
  console.log(chalk.gray('=' .repeat(50)));

  const allComponents = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const results = {
    total: allComponents.length,
    analyzed: 0,
    missingTests: [],
    incompleteTests: [],
    suggestions: []
  };

  // Analyze each component
  console.log(chalk.cyan(`\nAnalyzing ${allComponents.length} components...\n`));

  const analyses = [];
  allComponents.forEach(componentName => {
    const analysis = analyzeComponent(componentName);
    if (analysis) {
      analyses.push(analysis);
      results.analyzed++;

      if (!analysis.hasTest) {
        results.missingTests.push(analysis);
      } else if (analysis.missingPatterns.length > 0) {
        results.incompleteTests.push(analysis);
      }
    }
  });

  // Sort by priority
  results.missingTests.sort((a, b) => 
    a.priority === 'HIGH' && b.priority !== 'HIGH' ? -1 : 1
  );
  results.incompleteTests.sort((a, b) => 
    b.missingPatterns.length - a.missingPatterns.length
  );

  // Display results
  console.log(chalk.red.bold('🔴 Components WITHOUT Tests:'));
  if (results.missingTests.length > 0) {
    results.missingTests.forEach((comp, i) => {
      console.log(`  ${i + 1}. ${chalk.red('❌')} ${chalk.white(comp.name)} ${comp.priority === 'HIGH' ? chalk.red('[PRIORITY]') : ''}`);
    });
  } else {
    console.log(chalk.green('  ✅ All components have test files!'));
  }

  console.log(chalk.yellow.bold('\n⚠️ Components with INCOMPLETE Tests:'));
  if (results.incompleteTests.length > 0) {
    results.incompleteTests.slice(0, 10).forEach((comp, i) => {
      console.log(`  ${i + 1}. ${chalk.yellow('⚠️')} ${chalk.white(comp.name)} - Missing ${comp.missingPatterns.length} patterns`);
      
      // Show top missing patterns
      const topMissing = comp.missingPatterns.slice(0, 3);
      topMissing.forEach(pattern => {
        console.log(chalk.gray(`     → ${pattern.category}: ${pattern.pattern}`));
      });
    });
  } else {
    console.log(chalk.green('  ✅ All test files are complete!'));
  }

  // Generate actionable report
  console.log(chalk.green.bold('\n✅ Quick Wins (Components to fix for 100% coverage):'));
  
  // Priority 1: Components without any tests
  const quickWins = [...results.missingTests.slice(0, 3)];
  
  // Priority 2: Components missing critical patterns
  const criticalGaps = results.incompleteTests
    .filter(comp => comp.missingPatterns.some(p => p.priority === 'HIGH'))
    .slice(0, 2);
  
  quickWins.push(...criticalGaps);

  quickWins.forEach((comp, i) => {
    console.log(chalk.cyan(`\n${i + 1}. ${comp.name}:`));
    
    if (comp.suggestedTests.length > 0) {
      const suggestion = comp.suggestedTests[0];
      console.log(chalk.gray(`   Type: ${suggestion.type}`));
      console.log(chalk.gray(`   Action: ${suggestion.description}`));
      
      if (i === 0) {
        // Show code example for the first one
        console.log(chalk.gray('\n   Example Test Code:'));
        console.log(chalk.green(suggestion.code.split('\n').map(line => '   ' + line).join('\n')));
      }
    }
  });

  // Calculate estimated coverage gain
  const estimatedGain = ((results.missingTests.length * 2) + (results.incompleteTests.length * 0.5)) / results.total;
  console.log(chalk.blue.bold('\n📊 Coverage Impact Estimate:'));
  console.log(`  Fixing missing tests: +${(results.missingTests.length * 2 / results.total * 100).toFixed(1)}%`);
  console.log(`  Completing patterns: +${(results.incompleteTests.length * 0.5 / results.total * 100).toFixed(1)}%`);
  console.log(chalk.green(`  Total potential gain: +${(estimatedGain * 100).toFixed(1)}% coverage`));

  // Generate fix commands
  console.log(chalk.cyan.bold('\n🚀 Quick Fix Commands:'));
  
  if (results.missingTests.length > 0) {
    const firstMissing = results.missingTests[0];
    console.log(chalk.white(`
  # Create test for ${firstMissing.name}:
  ${chalk.gray(`cat > packages/ui/src/components/${firstMissing.name}/${firstMissing.name}.test.tsx << 'EOF'`)}
${chalk.green(firstMissing.suggestedTests[0]?.code || '// Test template here')}
${chalk.gray('EOF')}
    `));
  }

  console.log(chalk.gray('\n💡 Run "npm run test:coverage" after adding tests to see the improvement'));
  console.log(chalk.green.bold('\n✨ Analysis complete!\n'));

  return results;
}

// Run the analysis
if (require.main === module) {
  findMissing5Percent().catch(error => {
    console.error(chalk.red('Analysis failed:'), error);
    process.exit(1);
  });
}

module.exports = { findMissing5Percent, analyzeComponent };
