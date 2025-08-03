#!/usr/bin/env node

/**
 * Migration script for DB-CONTENT-CALENDAR → content_calendar
 * Migrates content calendar data from Notion to Directus
 */

const { Client: NotionClient } = require('@notionhq/client');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const NOTION_TOKEN = process.env.NOTION_API_KEY;
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

// Notion database ID for DB-CONTENT-CALENDAR
const NOTION_DATABASE_ID = '22eadb953c6f8036bf76f7ebaa40aba2'; // From analysis

// Initialize clients
const notion = new NotionClient({ auth: NOTION_TOKEN });

class ContentCalendarMigration {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      failed: 0,
      skipped: 0
    };
    this.errors = [];
    this.logFile = path.join(process.cwd(), 'migration/logs/content_calendar.log');
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    // Console output
    if (level === 'error') {
      console.error(chalk.red(message));
    } else if (level === 'warn') {
      console.warn(chalk.yellow(message));
    } else if (level === 'success') {
      console.log(chalk.green(message));
    } else {
      console.log(chalk.gray(message));
    }
    
    // File output
    await fs.appendFile(this.logFile, logEntry).catch(() => {});
  }

  async createCollection() {
    const spinner = ora('Creating content_calendar collection in Directus...').start();
    
    try {
      // Check if collection exists
      const checkResponse = await axios.get(
        `${DIRECTUS_URL}/collections/content_calendar`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      ).catch(() => null);

      if (checkResponse?.data) {
        spinner.warn('Collection content_calendar already exists');
        return true;
      }

      // Load schema
      const schemaPath = path.join(process.cwd(), 'migration/schemas/content_calendar.json');
      const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));

      // Create collection
      const response = await axios.post(
        `${DIRECTUS_URL}/collections`,
        schema,
        {
          headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      spinner.succeed('Collection content_calendar created successfully');
      await this.log('Collection created: content_calendar', 'success');
      return true;
    } catch (error) {
      spinner.fail(`Failed to create collection: ${error.message}`);
      await this.log(`Failed to create collection: ${error.message}`, 'error');
      throw error;
    }
  }

  async extractFromNotion() {
    const spinner = ora('Extracting data from DB-CONTENT-CALENDAR...').start();
    const items = [];

    try {
      let hasMore = true;
      let cursor = undefined;

      while (hasMore) {
        const response = await notion.databases.query({
          database_id: NOTION_DATABASE_ID,
          start_cursor: cursor,
          page_size: 100
        });

        items.push(...response.results);
        hasMore = response.has_more;
        cursor = response.next_cursor;

        spinner.text = `Extracting... ${items.length} items found`;
      }

      spinner.succeed(`Extracted ${items.length} items from Notion`);
      await this.log(`Extracted ${items.length} items from Notion`, 'success');
      this.stats.total = items.length;
      
      return items;
    } catch (error) {
      spinner.fail(`Failed to extract from Notion: ${error.message}`);
      await this.log(`Failed to extract from Notion: ${error.message}`, 'error');
      throw error;
    }
  }

  transformItem(notionItem) {
    const props = notionItem.properties;
    
    // Helper function to extract property value
    const getValue = (prop) => {
      if (!prop) return null;
      
      switch (prop.type) {
        case 'title':
          return prop.title[0]?.plain_text || '';
        case 'rich_text':
          return prop.rich_text[0]?.plain_text || '';
        case 'select':
          return prop.select?.name || null;
        case 'date':
          return prop.date?.start || null;
        case 'multi_select':
          return prop.multi_select.map(s => s.name);
        case 'url':
          return prop.url || null;
        case 'number':
          return prop.number || 0;
        default:
          return null;
      }
    };

    // Map content type
    const mapContentType = (type) => {
      const typeMap = {
        'Post': 'post',
        'Story': 'story',
        'Reel': 'reel',
        'Video': 'video',
        'Article': 'article'
      };
      return typeMap[type] || 'post';
    };

    // Map status
    const mapStatus = (status) => {
      const statusMap = {
        'Draft': 'draft',
        'Scheduled': 'scheduled',
        'Published': 'published',
        'Archived': 'archived'
      };
      return statusMap[status] || 'draft';
    };

    // Map platform
    const mapPlatform = (platform) => {
      const platformMap = {
        'Instagram': 'instagram',
        'LinkedIn': 'linkedin',
        'Twitter': 'twitter',
        'X': 'twitter',
        'Blog': 'blog',
        'YouTube': 'youtube'
      };
      return platformMap[platform] || 'blog';
    };

    // Transform to Directus format
    const transformed = {
      title: getValue(props['Name']) || getValue(props['Title']) || 'Untitled',
      content_type: mapContentType(getValue(props['Type'])),
      status: mapStatus(getValue(props['Status'])),
      publish_date: getValue(props['Publication Date']) || getValue(props['Publish Date']),
      platform: mapPlatform(getValue(props['Platform'])),
      content_text: getValue(props['Content']) || getValue(props['Description']),
      notion_id: notionItem.id,
      date_created: notionItem.created_time,
      date_updated: notionItem.last_edited_time
    };

    // Handle media URLs
    const mediaUrl = getValue(props['Media']) || getValue(props['Media URL']);
    if (mediaUrl) {
      transformed.media_urls = Array.isArray(mediaUrl) ? mediaUrl : [mediaUrl];
    }

    // Handle hashtags
    const hashtags = getValue(props['Hashtags']) || getValue(props['Tags']);
    if (hashtags) {
      transformed.hashtags = Array.isArray(hashtags) ? hashtags : hashtags.split(',').map(h => h.trim());
    }

    // Handle performance metrics if available
    const views = getValue(props['Views']);
    const likes = getValue(props['Likes']);
    const shares = getValue(props['Shares']);
    const comments = getValue(props['Comments']);
    
    if (views || likes || shares || comments) {
      transformed.performance_metrics = {
        views: views || 0,
        likes: likes || 0,
        shares: shares || 0,
        comments: comments || 0,
        engagement_rate: 0
      };
      
      // Calculate engagement rate if we have views
      if (views > 0) {
        const totalEngagement = (likes || 0) + (shares || 0) + (comments || 0);
        transformed.performance_metrics.engagement_rate = (totalEngagement / views * 100).toFixed(2);
      }
    }

    return transformed;
  }

  async loadToDirectus(items) {
    const spinner = ora('Loading data to Directus...').start();
    const batchSize = 50;
    
    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        spinner.text = `Loading... ${i + batch.length}/${items.length}`;
        
        // Transform batch
        const transformedBatch = batch.map(item => {
          try {
            return this.transformItem(item);
          } catch (error) {
            this.errors.push({
              notion_id: item.id,
              error: error.message
            });
            this.stats.failed++;
            return null;
          }
        }).filter(item => item !== null);

        if (transformedBatch.length === 0) continue;

        // Insert batch into Directus
        try {
          await axios.post(
            `${DIRECTUS_URL}/items/content_calendar`,
            transformedBatch,
            {
              headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          this.stats.migrated += transformedBatch.length;
        } catch (error) {
          const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
          await this.log(`Batch insert failed: ${errorMsg}`, 'error');
          this.stats.failed += transformedBatch.length;
          
          // Try individual inserts for failed batch
          for (const item of transformedBatch) {
            try {
              await axios.post(
                `${DIRECTUS_URL}/items/content_calendar`,
                item,
                {
                  headers: {
                    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              this.stats.migrated++;
              this.stats.failed--;
            } catch (individualError) {
              this.errors.push({
                title: item.title,
                error: individualError.response?.data?.errors?.[0]?.message || individualError.message
              });
            }
          }
        }
      }

      spinner.succeed(`Loaded ${this.stats.migrated} items to Directus`);
      await this.log(`Migration completed: ${this.stats.migrated}/${this.stats.total} items migrated`, 'success');
    } catch (error) {
      spinner.fail(`Loading failed: ${error.message}`);
      await this.log(`Loading failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async validate() {
    const spinner = ora('Validating migration...').start();
    
    try {
      // Count items in Directus
      const response = await axios.get(
        `${DIRECTUS_URL}/items/content_calendar?aggregate[count]=*`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      );
      
      const directusCount = response.data.data[0]?.count || 0;
      
      if (directusCount === this.stats.total) {
        spinner.succeed(`Validation passed: ${directusCount} items in Directus`);
        await this.log(`Validation passed: All ${directusCount} items migrated successfully`, 'success');
        return true;
      } else {
        spinner.warn(`Validation warning: ${directusCount} in Directus vs ${this.stats.total} in Notion`);
        await this.log(`Validation warning: Count mismatch - ${directusCount} in Directus vs ${this.stats.total} in Notion`, 'warn');
        return false;
      }
    } catch (error) {
      spinner.fail(`Validation failed: ${error.message}`);
      await this.log(`Validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    const report = {
      collection: 'content_calendar',
      source: 'DB-CONTENT-CALENDAR',
      timestamp: new Date().toISOString(),
      stats: this.stats,
      validation: {
        passed: this.stats.migrated === this.stats.total,
        message: this.stats.migrated === this.stats.total 
          ? 'All items migrated successfully' 
          : `${this.stats.failed} items failed to migrate`
      },
      errors: this.errors
    };

    const reportPath = path.join(process.cwd(), 'migration/reports', `content_calendar_${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    await this.log(`Report saved to: ${reportPath}`, 'info');
    
    return report;
  }

  async run() {
    console.log(chalk.cyan.bold('\n📅 CONTENT CALENDAR MIGRATION\n'));
    console.log(chalk.gray('DB-CONTENT-CALENDAR → content_calendar\n'));

    try {
      // Initialize log
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      await fs.writeFile(this.logFile, `Migration started at ${new Date().toISOString()}\n`);

      // Step 1: Create collection
      await this.createCollection();

      // Step 2: Extract from Notion
      const notionItems = await this.extractFromNotion();

      if (notionItems.length === 0) {
        await this.log('No items to migrate', 'warn');
        return;
      }

      // Step 3: Load to Directus
      await this.loadToDirectus(notionItems);

      // Step 4: Validate
      await this.validate();

      // Step 5: Generate report
      const report = await this.generateReport();

      // Display summary
      console.log(chalk.blue.bold('\n📊 MIGRATION SUMMARY\n'));
      console.log(chalk.white(`Total items: ${this.stats.total}`));
      console.log(chalk.green(`✅ Migrated: ${this.stats.migrated}`));
      if (this.stats.failed > 0) {
        console.log(chalk.red(`❌ Failed: ${this.stats.failed}`));
      }
      if (this.stats.skipped > 0) {
        console.log(chalk.yellow(`⏭️  Skipped: ${this.stats.skipped}`));
      }

      if (this.errors.length > 0) {
        console.log(chalk.red('\n❌ Errors:'));
        this.errors.slice(0, 5).forEach(err => {
          console.log(chalk.red(`  - ${err.title || err.notion_id}: ${err.error}`));
        });
        if (this.errors.length > 5) {
          console.log(chalk.gray(`  ... and ${this.errors.length - 5} more errors (see report)`));
        }
      }

      console.log(chalk.green.bold('\n✅ Migration completed!'));
      console.log(chalk.gray(`Check logs at: ${this.logFile}`));

    } catch (error) {
      console.error(chalk.red.bold('\n❌ Migration failed!'));
      console.error(chalk.red(error.message));
      await this.log(`Migration failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run migration
if (require.main === module) {
  const migration = new ContentCalendarMigration();
  migration.run().catch(console.error);
}

module.exports = ContentCalendarMigration;