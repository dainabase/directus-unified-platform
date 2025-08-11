#!/usr/bin/env node

/**
 * Batch Test Creator for directus-unified-platform
 * Uses the test generator to create multiple test files via GitHub API
 */

const { generateTests, COMPONENTS, getStatistics } = require('./generate-tests');

// Configuration
const BATCH_SIZE = 10; // Number of tests to create per batch
const GITHUB_API_URL = 'https://api.github.com';
const OWNER = 'dainabase';
const REPO = 'directus-unified-platform';
const BRANCH = 'main';

// Priority order for component testing
const PRIORITY_ORDER = [
  // Core components (high priority)
  'icon',
  'input', 
  'checkbox',
  'switch',
  'select',
  
  // Layout components
  'accordion',
  'tabs',
  'dialog',
  'drawer',
  'sheet',
  
  // Feedback components
  'toast',
  'popover',
  'tooltip',
  'progress',
  'skeleton',
  
  // Navigation
  'breadcrumbs',
  'pagination',
  'stepper',
  
  // Form components
  'textarea',
  'date-picker',
  'file-upload',
  'slider',
  'rating',
  
  // Display components
  'avatar',
  'badge',
  'carousel',
  
  // Complex components
  'data-grid',
  'kanban',
  'rich-text-editor',
  'code-editor',
  
  // Remaining components
];

// Get next batch of components to test
function getNextBatch(batchSize = BATCH_SIZE) {
  const untested = [];
  
  // First add priority components that haven't been tested
  for (const name of PRIORITY_ORDER) {
    if (COMPONENTS[name] && !COMPONENTS[name].tested && !COMPONENTS[name].skip) {
      untested.push(name);
      if (untested.length >= batchSize) break;
    }
  }
  
  // If we still need more, add any remaining untested components
  if (untested.length < batchSize) {
    for (const [name, info] of Object.entries(COMPONENTS)) {
      if (!info.tested && !info.skip && !untested.includes(name)) {
        untested.push(name);
        if (untested.length >= batchSize) break;
      }
    }
  }
  
  return untested;
}

// Create test files structure for batch creation
function createBatchTestFiles(componentNames) {
  const tests = generateTests(componentNames);
  const files = [];
  
  tests.forEach(test => {
    files.push({
      path: test.path,
      content: test.content
    });
  });
  
  return files;
}

// Generate batch creation script
function generateBatchScript() {
  const stats = getStatistics();
  const nextBatch = getNextBatch();
  const files = createBatchTestFiles(nextBatch);
  
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          BATCH TEST CREATION SCRIPT                       ║
╠════════════════════════════════════════════════════════════╣
║  Current Coverage: ${stats.percentage}% (${stats.tested}/${stats.total})${' '.repeat(36 - stats.percentage.length - stats.tested.toString().length - stats.total.toString().length)}║
║  Next Batch: ${nextBatch.length} components${' '.repeat(40 - nextBatch.length.toString().length)}║
║  After This Batch: ${((stats.tested + nextBatch.length) / stats.total * 100).toFixed(1)}%${' '.repeat(36 - ((stats.tested + nextBatch.length) / stats.total * 100).toFixed(1).length)}║
╚════════════════════════════════════════════════════════════╝

📋 Components in this batch:
${nextBatch.map((name, i) => `  ${i + 1}. ${name}`).join('\n')}

📁 Files to be created:
${files.map(f => `  - ${f.path}`).join('\n')}

🎯 Recommended GitHub API command structure:
`);

  // Output the batch creation info
  return {
    stats,
    batch: nextBatch,
    files,
    estimatedCoverage: ((stats.tested + nextBatch.length) / stats.total * 100).toFixed(1)
  };
}

// Generate test creation summary
function generateSummary() {
  const stats = getStatistics();
  const remainingBatches = Math.ceil(stats.remaining / BATCH_SIZE);
  
  console.log(`
📊 FULL TEST GENERATION PLAN
════════════════════════════════════════════════

Current Status:
  • Total Components: ${stats.total}
  • Already Tested: ${stats.tested} (${stats.percentage}%)
  • Remaining: ${stats.remaining}
  • Skip Components: ${Object.values(COMPONENTS).filter(c => c.skip).length}

Batch Plan:
  • Batch Size: ${BATCH_SIZE} components
  • Estimated Batches: ${remainingBatches}
  • Time per Batch: ~2-3 minutes
  • Total Time: ~${remainingBatches * 2.5} minutes

Priority Categories:
  1. Core Components (form inputs, buttons)
  2. Layout Components (accordion, tabs, dialogs)
  3. Feedback Components (toasts, alerts, modals)
  4. Navigation Components (menus, breadcrumbs)
  5. Complex Components (grids, editors)

Next Steps:
  1. Run batch creation for priority components
  2. Verify tests pass with 'npm test'
  3. Update Issue #30 with progress
  4. Continue with next batch
`);
}

// Export batch info for GitHub API usage
function exportBatchInfo() {
  const batchInfo = generateBatchScript();
  
  // Create a JSON output for automation
  const output = {
    owner: OWNER,
    repo: REPO,
    branch: BRANCH,
    batchNumber: Math.floor(batchInfo.stats.tested / BATCH_SIZE) + 1,
    components: batchInfo.batch,
    files: batchInfo.files,
    coverage: {
      before: batchInfo.stats.percentage,
      after: batchInfo.estimatedCoverage
    },
    commitMessage: `test: Add tests for ${batchInfo.batch.join(', ')} components (Batch #${Math.floor(batchInfo.stats.tested / BATCH_SIZE) + 1})`
  };
  
  return output;
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'summary':
      generateSummary();
      break;
    case 'batch':
      const batchInfo = exportBatchInfo();
      console.log('\n📦 Batch Information (JSON):');
      console.log(JSON.stringify(batchInfo, null, 2));
      break;
    case 'next':
      const nextBatch = getNextBatch();
      console.log('Next components to test:');
      nextBatch.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
      });
      break;
    default:
      generateBatchScript();
      console.log(`
Usage:
  node batch-create-tests.js          # Show next batch
  node batch-create-tests.js summary  # Show full plan
  node batch-create-tests.js batch    # Export batch JSON
  node batch-create-tests.js next     # List next components
      `);
  }
}

module.exports = {
  getNextBatch,
  createBatchTestFiles,
  generateBatchScript,
  exportBatchInfo
};
