#!/usr/bin/env node

/**
 * Cleanup Empty Workflows Script
 * 
 * This script identifies and reports empty workflow files that should be deleted.
 * Since GitHub API doesn't support direct deletion, it provides the commands to run.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of empty workflow files to clean up
const EMPTY_WORKFLOWS = [
  '.gitkeep',
  'auto-fix-deps.yml',
  'auto-publish-v040.yml',
  'fix-and-publish.yml',
  'force-publish.yml',
  'manual-publish.yml',
  'npm-monitor.yml',
  'publish-manual.yml',
  'publish-ui.yml',
  'quick-npm-publish.yml',
  'simple-publish.yml',
  'ui-100-coverage-publish.yml'
];

// Files to move
const FILES_TO_MOVE = [
  { from: 'EMERGENCY_AUDIT.sh', to: '../../scripts/emergency-audit.sh' },
  { from: 'MAINTENANCE_LOG.md', to: '../../docs/maintenance-log.md' }
];

console.log('🧹 Workflow Cleanup Script\n');
console.log('=' .repeat(50));

// Check current directory
const workflowsDir = path.resolve(__dirname, '../../../.github/workflows');
if (!fs.existsSync(workflowsDir)) {
  console.error('❌ Error: .github/workflows directory not found!');
  console.log('   Please run this script from packages/ui/scripts/');
  process.exit(1);
}

console.log(`📁 Checking workflows in: ${workflowsDir}\n`);

// Check empty files
console.log('🔍 Empty files to delete:');
console.log('-'.repeat(50));

let emptyCount = 0;
let commands = [];

EMPTY_WORKFLOWS.forEach(file => {
  const filePath = path.join(workflowsDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      console.log(`  ❌ ${file} (0 bytes)`);
      commands.push(`git rm .github/workflows/${file}`);
      emptyCount++;
    } else {
      console.log(`  ⚠️  ${file} (${stats.size} bytes) - Not empty!`);
    }
  } else {
    console.log(`  ✅ ${file} - Already deleted`);
  }
});

console.log(`\n📊 Found ${emptyCount} empty files\n`);

// Check files to move
console.log('📦 Files to relocate:');
console.log('-'.repeat(50));

FILES_TO_MOVE.forEach(({ from, to }) => {
  const fromPath = path.join(workflowsDir, from);
  const toPath = path.resolve(workflowsDir, to);
  const toDir = path.dirname(toPath);
  
  if (fs.existsSync(fromPath)) {
    console.log(`  📁 ${from}`);
    console.log(`     → ${to}`);
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(toDir)) {
      commands.push(`mkdir -p ${path.relative(process.cwd(), toDir)}`);
    }
    
    commands.push(`git mv .github/workflows/${from} ${path.relative(process.cwd(), toPath)}`);
  } else {
    console.log(`  ✅ ${from} - Already moved or deleted`);
  }
});

// Generate cleanup commands
if (commands.length > 0) {
  console.log('\n🚀 Cleanup Commands:');
  console.log('-'.repeat(50));
  console.log('\n# Run these commands from the repository root:\n');
  
  commands.forEach(cmd => {
    console.log(cmd);
  });
  
  console.log('\n# Then commit the changes:');
  console.log('git add .');
  console.log('git commit -m "chore: Clean up empty workflows and reorganize files"');
  console.log('git push origin main');
  
  // Option to create a shell script
  const scriptPath = path.join(__dirname, 'cleanup-workflows.sh');
  const scriptContent = `#!/bin/bash
# Auto-generated cleanup script
# Run from repository root

echo "🧹 Cleaning up workflows..."

${commands.join('\n')}

echo "✅ Cleanup complete!"
echo "Don't forget to commit and push the changes."
`;
  
  fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
  console.log(`\n📝 Shell script created: ${scriptPath}`);
  console.log('   Run it with: bash packages/ui/scripts/cleanup-workflows.sh');
} else {
  console.log('\n✅ All workflows are already clean!');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`  • Empty files found: ${emptyCount}`);
console.log(`  • Files to move: ${FILES_TO_MOVE.length}`);
console.log(`  • Total actions needed: ${commands.length}`);

if (commands.length > 0) {
  console.log('\n⚠️  Action Required: Run the commands above to complete cleanup');
} else {
  console.log('\n✅ No action needed - workflows are clean!');
}
