#!/usr/bin/env node
/**
 * NPM Package Monitor for @dainabase/ui
 * Tracks downloads, versions, and package metrics
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

const PACKAGE_NAME = '@dainabase/ui';
const NPM_API = 'https://api.npmjs.org';
const REGISTRY_API = 'https://registry.npmjs.org';

// Helper function for API requests
function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Calculate time ago
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

async function monitorPackage() {
  console.log(chalk.cyan('\n📊 NPM Package Monitor'));
  console.log(chalk.gray('='.repeat(50)));
  console.log(chalk.yellow(`Package: ${PACKAGE_NAME}`));
  console.log(chalk.gray('='.repeat(50)));

  try {
    // 1. Fetch package metadata
    console.log(chalk.blue('\n📦 Fetching package information...'));
    const packageData = await fetchData(`${REGISTRY_API}/${PACKAGE_NAME}`);
    
    if (!packageData || packageData.error) {
      console.log(chalk.red('❌ Package not found on NPM registry'));
      console.log(chalk.yellow('📝 Make sure to publish the package first!'));
      return;
    }

    // 2. Display current version info
    const latestVersion = packageData['dist-tags']?.latest || 'none';
    const betaVersion = packageData['dist-tags']?.beta || 'none';
    const versions = Object.keys(packageData.versions || {});
    
    console.log(chalk.green('\n✅ Package Found!'));
    console.log(chalk.white(`├─ Latest: ${chalk.bold(latestVersion)}`));
    console.log(chalk.white(`├─ Beta: ${chalk.bold(betaVersion)}`));
    console.log(chalk.white(`├─ Total Versions: ${chalk.bold(versions.length)}`));
    console.log(chalk.white(`└─ License: ${chalk.bold(packageData.license || 'N/A')}`));

    // 3. Display version history
    if (versions.length > 0) {
      console.log(chalk.blue('\n📝 Recent Versions:'));
      const recentVersions = versions.slice(-5).reverse();
      recentVersions.forEach((v, i) => {
        const versionData = packageData.versions[v];
        const publishTime = versionData._time || packageData.time[v];
        const isLast = i === recentVersions.length - 1;
        const prefix = isLast ? '└─' : '├─';
        
        let versionLabel = v;
        if (v === latestVersion) versionLabel += chalk.green(' (latest)');
        if (v === betaVersion) versionLabel += chalk.yellow(' (beta)');
        
        console.log(chalk.white(`${prefix} ${versionLabel} - ${timeAgo(publishTime)}`));
      });
    }

    // 4. Fetch download stats
    console.log(chalk.blue('\n📈 Download Statistics:'));
    
    // Last day
    const dayStats = await fetchData(`${NPM_API}/downloads/point/last-day/${PACKAGE_NAME}`);
    // Last week  
    const weekStats = await fetchData(`${NPM_API}/downloads/point/last-week/${PACKAGE_NAME}`);
    // Last month
    const monthStats = await fetchData(`${NPM_API}/downloads/point/last-month/${PACKAGE_NAME}`);
    
    console.log(chalk.white(`├─ Last Day: ${chalk.bold(formatNumber(dayStats.downloads || 0))}`));
    console.log(chalk.white(`├─ Last Week: ${chalk.bold(formatNumber(weekStats.downloads || 0))}`));
    console.log(chalk.white(`└─ Last Month: ${chalk.bold(formatNumber(monthStats.downloads || 0))}`));

    // 5. Package details
    const latest = packageData.versions[latestVersion] || packageData.versions[betaVersion];
    if (latest) {
      console.log(chalk.blue('\n📋 Package Details:'));
      
      // Calculate unpacked size
      const unpackedSize = latest.dist?.unpackedSize;
      if (unpackedSize) {
        const sizeKB = (unpackedSize / 1024).toFixed(2);
        const sizeMB = (unpackedSize / 1024 / 1024).toFixed(2);
        const sizeStr = unpackedSize > 1024 * 1024 
          ? `${sizeMB} MB` 
          : `${sizeKB} KB`;
        console.log(chalk.white(`├─ Unpacked Size: ${chalk.bold(sizeStr)}`));
      }
      
      // File count
      const fileCount = latest.dist?.fileCount;
      if (fileCount) {
        console.log(chalk.white(`├─ File Count: ${chalk.bold(fileCount)}`));
      }
      
      // Dependencies
      const deps = Object.keys(latest.dependencies || {}).length;
      const devDeps = Object.keys(latest.devDependencies || {}).length;
      const peerDeps = Object.keys(latest.peerDependencies || {}).length;
      const optDeps = Object.keys(latest.optionalDependencies || {}).length;
      
      console.log(chalk.white(`├─ Dependencies: ${chalk.bold(deps)}`));
      console.log(chalk.white(`├─ Dev Dependencies: ${chalk.bold(devDeps)}`));
      console.log(chalk.white(`├─ Peer Dependencies: ${chalk.bold(peerDeps)}`));
      console.log(chalk.white(`└─ Optional Dependencies: ${chalk.bold(optDeps)}`));
    }

    // 6. Repository info
    if (packageData.repository) {
      console.log(chalk.blue('\n🔗 Links:'));
      console.log(chalk.white(`├─ NPM: ${chalk.cyan(`https://npmjs.com/package/${PACKAGE_NAME}`)}`));
      
      const repoUrl = typeof packageData.repository === 'string' 
        ? packageData.repository 
        : packageData.repository.url;
      if (repoUrl) {
        const cleanUrl = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '');
        console.log(chalk.white(`├─ GitHub: ${chalk.cyan(cleanUrl)}`));
      }
      
      if (packageData.homepage) {
        console.log(chalk.white(`└─ Homepage: ${chalk.cyan(packageData.homepage)}`));
      }
    }

    // 7. Health check
    console.log(chalk.blue('\n💚 Package Health:'));
    const hasReadme = !!packageData.readme;
    const hasLicense = !!packageData.license;
    const hasRepository = !!packageData.repository;
    const hasKeywords = packageData.keywords && packageData.keywords.length > 0;
    
    console.log(chalk.white(`├─ README: ${hasReadme ? chalk.green('✓') : chalk.red('✗')}`));
    console.log(chalk.white(`├─ License: ${hasLicense ? chalk.green('✓') : chalk.red('✗')}`));
    console.log(chalk.white(`├─ Repository: ${hasRepository ? chalk.green('✓') : chalk.red('✗')}`));
    console.log(chalk.white(`└─ Keywords: ${hasKeywords ? chalk.green('✓') : chalk.red('✗')}`));

    // 8. Installation commands
    console.log(chalk.blue('\n📥 Installation Commands:'));
    const installVersion = betaVersion !== 'none' ? betaVersion : latestVersion;
    const tag = betaVersion !== 'none' ? 'beta' : 'latest';
    
    console.log(chalk.gray('# NPM'));
    console.log(chalk.white(`npm install ${PACKAGE_NAME}@${tag}`));
    console.log(chalk.gray('\n# Yarn'));
    console.log(chalk.white(`yarn add ${PACKAGE_NAME}@${tag}`));
    console.log(chalk.gray('\n# PNPM'));
    console.log(chalk.white(`pnpm add ${PACKAGE_NAME}@${tag}`));

    // 9. Save report
    const reportDir = path.join(process.cwd(), 'metrics');
    await fs.mkdir(reportDir, { recursive: true });
    
    const report = {
      timestamp: new Date().toISOString(),
      package: PACKAGE_NAME,
      versions: {
        latest: latestVersion,
        beta: betaVersion,
        total: versions.length
      },
      downloads: {
        day: dayStats.downloads || 0,
        week: weekStats.downloads || 0,
        month: monthStats.downloads || 0
      },
      health: {
        hasReadme,
        hasLicense,
        hasRepository,
        hasKeywords
      }
    };
    
    const reportPath = path.join(reportDir, 'npm-monitor.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.green(`\n✅ Report saved to: ${reportPath}`));
    
    // 10. Summary
    console.log(chalk.cyan('\n📊 Summary'));
    console.log(chalk.gray('='.repeat(50)));
    
    if (betaVersion !== 'none') {
      console.log(chalk.green('✅ Beta version is published and available!'));
      console.log(chalk.yellow(`🚀 Version ${betaVersion} is ready for testing`));
    } else if (latestVersion !== 'none') {
      console.log(chalk.green('✅ Package is published and available!'));
      console.log(chalk.yellow(`📦 Latest version: ${latestVersion}`));
    } else {
      console.log(chalk.yellow('⚠️ Package needs to be published to NPM'));
      console.log(chalk.white('Run the GitHub Actions workflow to publish'));
    }

  } catch (error) {
    console.error(chalk.red('\n❌ Error monitoring package:'), error.message);
    console.log(chalk.yellow('\n💡 Tips:'));
    console.log(chalk.white('1. Make sure the package is published to NPM'));
    console.log(chalk.white('2. Check your internet connection'));
    console.log(chalk.white('3. Verify the package name is correct'));
  }
}

// Run monitor
monitorPackage().then(() => {
  console.log(chalk.gray('\n' + '='.repeat(50)));
  console.log(chalk.cyan('Monitor completed at:', new Date().toLocaleString()));
}).catch(console.error);
