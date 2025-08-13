#!/usr/bin/env node

/**
 * NPM Package Analytics Monitor
 * Tracks downloads, version adoption, and other metrics for @dainabase/ui
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const PACKAGE_NAME = '@dainabase/ui';
const METRICS_FILE = path.join(__dirname, '..', 'metrics', 'npm-stats.json');
const REPORT_FILE = path.join(__dirname, '..', 'metrics', 'npm-report.md');

// Ensure metrics directory exists
const metricsDir = path.join(__dirname, '..', 'metrics');
if (!fs.existsSync(metricsDir)) {
  fs.mkdirSync(metricsDir, { recursive: true });
}

/**
 * Fetch data from NPM registry
 */
function fetchNpmData(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.npmjs.org/${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Fetch download stats from NPM
 */
function fetchDownloadStats(period = 'last-week') {
  return new Promise((resolve, reject) => {
    const url = `https://api.npmjs.org/downloads/point/${period}/${PACKAGE_NAME}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Fetch package metadata
 */
async function fetchPackageInfo() {
  return new Promise((resolve, reject) => {
    https.get(`https://registry.npmjs.org/${PACKAGE_NAME}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Calculate growth rate
 */
function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return 100;
  return ((current - previous) / previous * 100).toFixed(2);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Main monitoring function
 */
async function monitor() {
  console.log(chalk.blue.bold('\n📊 NPM Package Analytics Monitor'));
  console.log(chalk.gray('Package: ') + chalk.yellow(PACKAGE_NAME));
  console.log(chalk.gray('Timestamp: ') + new Date().toISOString());
  console.log(chalk.gray('─'.repeat(50)));

  try {
    // Fetch all data
    const [lastDay, lastWeek, lastMonth, packageInfo] = await Promise.all([
      fetchDownloadStats('last-day'),
      fetchDownloadStats('last-week'),
      fetchDownloadStats('last-month'),
      fetchPackageInfo()
    ]);

    // Extract key metrics
    const latestVersion = packageInfo['dist-tags'].latest;
    const publishTime = packageInfo.time[latestVersion];
    const versions = Object.keys(packageInfo.versions).length;
    const keywords = packageInfo.keywords || [];
    const maintainers = packageInfo.maintainers || [];
    
    // Calculate additional metrics
    const daysSincePublish = Math.floor((new Date() - new Date(publishTime)) / (1000 * 60 * 60 * 24));
    const avgDailyDownloads = Math.floor(lastMonth.downloads / 30);

    // Load previous metrics
    let previousMetrics = {};
    if (fs.existsSync(METRICS_FILE)) {
      previousMetrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    }

    // Current metrics
    const currentMetrics = {
      timestamp: new Date().toISOString(),
      package: PACKAGE_NAME,
      version: latestVersion,
      downloads: {
        lastDay: lastDay.downloads,
        lastWeek: lastWeek.downloads,
        lastMonth: lastMonth.downloads,
        avgDaily: avgDailyDownloads
      },
      growth: {
        daily: calculateGrowth(lastDay.downloads, previousMetrics.downloads?.lastDay),
        weekly: calculateGrowth(lastWeek.downloads, previousMetrics.downloads?.lastWeek),
        monthly: calculateGrowth(lastMonth.downloads, previousMetrics.downloads?.lastMonth)
      },
      package: {
        versions: versions,
        keywords: keywords.length,
        maintainers: maintainers.length,
        daysSincePublish: daysSincePublish,
        publishDate: publishTime
      },
      history: previousMetrics.history || []
    };

    // Add to history (keep last 30 records)
    currentMetrics.history.unshift({
      date: new Date().toISOString(),
      downloads: lastDay.downloads
    });
    currentMetrics.history = currentMetrics.history.slice(0, 30);

    // Display results
    console.log(chalk.green.bold('\n📈 Download Statistics:'));
    console.log(`  Last Day:   ${chalk.cyan(formatNumber(lastDay.downloads))} ${chalk.gray(`(${currentMetrics.growth.daily > 0 ? '+' : ''}${currentMetrics.growth.daily}%)`)}`);
    console.log(`  Last Week:  ${chalk.cyan(formatNumber(lastWeek.downloads))} ${chalk.gray(`(${currentMetrics.growth.weekly > 0 ? '+' : ''}${currentMetrics.growth.weekly}%)`)}`);
    console.log(`  Last Month: ${chalk.cyan(formatNumber(lastMonth.downloads))} ${chalk.gray(`(${currentMetrics.growth.monthly > 0 ? '+' : ''}${currentMetrics.growth.monthly}%)`)}`);
    console.log(`  Avg Daily:  ${chalk.cyan(formatNumber(avgDailyDownloads))}`);

    console.log(chalk.green.bold('\n📦 Package Info:'));
    console.log(`  Latest Version: ${chalk.yellow(latestVersion)}`);
    console.log(`  Total Versions: ${chalk.yellow(versions)}`);
    console.log(`  Published: ${chalk.gray(daysSincePublish + ' days ago')}`);
    console.log(`  Maintainers: ${chalk.yellow(maintainers.length)}`);

    // Performance indicators
    console.log(chalk.green.bold('\n🎯 Performance Indicators:'));
    const performanceScore = calculatePerformanceScore(currentMetrics);
    console.log(`  Overall Score: ${getScoreEmoji(performanceScore)} ${chalk.cyan(performanceScore + '/100')}`);
    console.log(`  Trend: ${getTrendIndicator(currentMetrics.growth.weekly)}`);
    console.log(`  Health: ${getHealthStatus(currentMetrics)}`);

    // Save metrics
    fs.writeFileSync(METRICS_FILE, JSON.stringify(currentMetrics, null, 2));
    console.log(chalk.gray(`\n✅ Metrics saved to ${METRICS_FILE}`));

    // Generate markdown report
    generateMarkdownReport(currentMetrics);
    console.log(chalk.gray(`📄 Report generated at ${REPORT_FILE}`));

    return currentMetrics;

  } catch (error) {
    console.error(chalk.red('\n❌ Error fetching NPM data:'), error.message);
    process.exit(1);
  }
}

/**
 * Calculate performance score (0-100)
 */
function calculatePerformanceScore(metrics) {
  let score = 50; // Base score

  // Downloads scoring (max 30 points)
  if (metrics.downloads.lastDay > 100) score += 10;
  if (metrics.downloads.lastWeek > 500) score += 10;
  if (metrics.downloads.lastMonth > 2000) score += 10;

  // Growth scoring (max 20 points)
  if (metrics.growth.daily > 0) score += 5;
  if (metrics.growth.weekly > 0) score += 5;
  if (metrics.growth.weekly > 10) score += 5;
  if (metrics.growth.weekly > 50) score += 5;

  return Math.min(100, score);
}

/**
 * Get emoji for score
 */
function getScoreEmoji(score) {
  if (score >= 90) return '🏆';
  if (score >= 70) return '⭐';
  if (score >= 50) return '✅';
  return '📊';
}

/**
 * Get trend indicator
 */
function getTrendIndicator(growth) {
  const g = parseFloat(growth);
  if (g > 50) return chalk.green('📈 Rapid Growth');
  if (g > 10) return chalk.green('↗️ Growing');
  if (g > 0) return chalk.yellow('→ Stable');
  if (g > -10) return chalk.yellow('↘️ Slight Decline');
  return chalk.red('📉 Declining');
}

/**
 * Get health status
 */
function getHealthStatus(metrics) {
  const score = calculatePerformanceScore(metrics);
  if (score >= 80) return chalk.green('💚 Excellent');
  if (score >= 60) return chalk.green('✅ Good');
  if (score >= 40) return chalk.yellow('⚠️ Fair');
  return chalk.red('🔴 Needs Attention');
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(metrics) {
  const report = `# NPM Package Analytics Report

**Package:** ${PACKAGE_NAME}  
**Version:** ${metrics.version}  
**Generated:** ${new Date().toISOString()}

## 📊 Download Statistics

| Period | Downloads | Growth |
|--------|-----------|--------|
| Last Day | ${formatNumber(metrics.downloads.lastDay)} | ${metrics.growth.daily}% |
| Last Week | ${formatNumber(metrics.downloads.lastWeek)} | ${metrics.growth.weekly}% |
| Last Month | ${formatNumber(metrics.downloads.lastMonth)} | ${metrics.growth.monthly}% |
| Daily Average | ${formatNumber(metrics.downloads.avgDaily)} | - |

## 📈 Performance Score

**Overall Score:** ${calculatePerformanceScore(metrics)}/100  
**Health Status:** ${getHealthStatus(metrics).replace(/\x1b\[[0-9;]*m/g, '')}  
**Trend:** ${getTrendIndicator(metrics.growth.weekly).replace(/\x1b\[[0-9;]*m/g, '')}

## 📅 Historical Data (Last 7 Days)

\`\`\`
${metrics.history.slice(0, 7).map(h => 
  `${new Date(h.date).toLocaleDateString()}: ${formatNumber(h.downloads)} downloads`
).join('\n')}
\`\`\`

## 🎯 Key Metrics

- **Days Since Latest Release:** ${metrics.package.daysSincePublish}
- **Total Versions Published:** ${metrics.package.versions}
- **Number of Keywords:** ${metrics.package.keywords}
- **Maintainers:** ${metrics.package.maintainers}

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/${PACKAGE_NAME})
- [Unpkg CDN](https://unpkg.com/${PACKAGE_NAME})
- [jsDelivr CDN](https://cdn.jsdelivr.net/npm/${PACKAGE_NAME})
- [Package Phobia](https://packagephobia.com/result?p=${PACKAGE_NAME})
- [Bundlephobia](https://bundlephobia.com/package/${PACKAGE_NAME})

---

*Report generated automatically by npm-monitor.js*
`;

  fs.writeFileSync(REPORT_FILE, report);
}

// Run monitor
if (require.main === module) {
  monitor().then(() => {
    console.log(chalk.green.bold('\n✨ Monitoring complete!\n'));
  }).catch(error => {
    console.error(chalk.red('Failed:'), error);
    process.exit(1);
  });
}

module.exports = { monitor, fetchDownloadStats, fetchPackageInfo };
