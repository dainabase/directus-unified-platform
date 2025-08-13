#!/usr/bin/env node

/**
 * GitHub Pages Status Checker & Enabler Guide
 * Checks if GitHub Pages is enabled and provides instructions
 */

const https = require('https');
const chalk = require('chalk');

const REPO_OWNER = 'dainabase';
const REPO_NAME = 'directus-unified-platform';
const EXPECTED_URL = `https://${REPO_OWNER}.github.io/${REPO_NAME}/`;

console.log(chalk.blue.bold('\n🌐 GitHub Pages Status Check'));
console.log(chalk.gray('=' .repeat(50)));

// Check if GitHub Pages is accessible
https.get(EXPECTED_URL, (res) => {
  const { statusCode } = res;
  
  if (statusCode === 200) {
    console.log(chalk.green.bold('\n✅ GitHub Pages is ACTIVE!'));
    console.log(chalk.cyan(`📚 Storybook URL: ${EXPECTED_URL}`));
    console.log(chalk.gray('\nYour Storybook is live and accessible!'));
  } else if (statusCode === 404) {
    console.log(chalk.yellow.bold('\n⚠️ GitHub Pages needs activation'));
    displayActivationInstructions();
  } else {
    console.log(chalk.yellow(`\n⚠️ Unexpected status: ${statusCode}`));
    displayActivationInstructions();
  }
}).on('error', (err) => {
  console.log(chalk.red.bold('\n❌ GitHub Pages is NOT configured'));
  displayActivationInstructions();
});

function displayActivationInstructions() {
  console.log(chalk.cyan.bold('\n📋 How to Enable GitHub Pages:'));
  console.log(chalk.white(`
  1. Go to: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/pages
  
  2. Under "Source", select:
     ${chalk.green('• Deploy from a branch')}
  
  3. Under "Branch", select:
     ${chalk.green('• gh-pages')} (will be created on first workflow run)
     ${chalk.green('• / (root)')}
  
  4. Click ${chalk.green('Save')}
  
  5. Run the Storybook deployment workflow:
     ${chalk.yellow('gh workflow run deploy-storybook.yml')}
     
  Or trigger manually from GitHub Actions:
     https://github.com/${REPO_OWNER}/${REPO_NAME}/actions/workflows/deploy-storybook.yml
  
  6. Wait 2-5 minutes for deployment
  
  7. Access your Storybook at:
     ${chalk.cyan(EXPECTED_URL)}
  `));
  
  console.log(chalk.gray('\n💡 Tip: The first deployment creates the gh-pages branch automatically'));
  console.log(chalk.gray('💡 Tip: GitHub Pages can take up to 10 minutes to activate initially'));
}

console.log(chalk.blue.bold('\n📊 Current Workflow Status:'));
console.log(chalk.gray(`
  • Workflow File: ${chalk.green('✓')} .github/workflows/deploy-storybook.yml
  • Trigger: Push to main or manual dispatch
  • Build Command: npm run build-storybook
  • Deploy Branch: gh-pages (auto-created)
`));

// Check if we can trigger the workflow
console.log(chalk.cyan.bold('\n🚀 Quick Deploy Commands:'));
console.log(chalk.white(`
  # Option 1: Trigger via GitHub CLI (if installed)
  ${chalk.gray('gh workflow run deploy-storybook.yml')}
  
  # Option 2: Push a small change to trigger
  ${chalk.gray('echo "# Trigger Storybook" >> packages/ui/README.md')}
  ${chalk.gray('git add . && git commit -m "chore: trigger storybook deploy"')}
  ${chalk.gray('git push')}
  
  # Option 3: Manual trigger from GitHub UI
  ${chalk.gray('https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/actions')}
`));

console.log(chalk.green.bold('\n✨ Next Steps:'));
console.log(chalk.white(`
  1. Enable GitHub Pages (if not already done)
  2. Trigger the deployment workflow
  3. Wait for deployment to complete
  4. Visit ${chalk.cyan(EXPECTED_URL)}
`));

process.exit(0);
