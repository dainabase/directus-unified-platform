#!/usr/bin/env node

/**
 * Simplified migration script for DB-TALENTS → talents
 * Handles recruitment candidates data
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

// Notion database ID for DB-TALENTS
const NOTION_DATABASE_ID = '22eadb953c6f809d9845eb6f9ee659ee';

// Initialize clients
const notion = new NotionClient({ auth: NOTION_TOKEN });

class TalentsMigration {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      failed: 0,
      skipped: 0
    };
    this.errors = [];
    this.logFile = path.join(process.cwd(), 'migration/logs/talents-simple.log');
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    if (level === 'error') {
      console.error(chalk.red(message));
    } else if (level === 'warn') {
      console.warn(chalk.yellow(message));
    } else if (level === 'success') {
      console.log(chalk.green(message));
    } else {
      console.log(chalk.gray(message));
    }
    
    await fs.appendFile(this.logFile, logEntry).catch(() => {});
  }

  async extractFromNotion() {
    const spinner = ora('Extracting data from DB-TALENTS...').start();
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
    
    // Simple value extraction
    const getValue = (prop) => {
      if (!prop) return null;
      
      switch (prop.type) {
        case 'title':
          return prop.title?.[0]?.plain_text || '';
        case 'rich_text':
          return prop.rich_text?.[0]?.plain_text || '';
        case 'select':
          return prop.select?.name || null;
        case 'status':
          return prop.status?.name || null;
        case 'date':
          return prop.date?.start || null;
        case 'email':
          return prop.email || null;
        case 'phone_number':
          return prop.phone_number || null;
        case 'url':
          return prop.url || null;
        case 'multi_select':
          return prop.multi_select?.map(s => s.name) || [];
        default:
          return null;
      }
    };

    // Simple mappings
    const mapDepartment = (dept) => {
      if (!dept) return 'tech';
      if (dept.includes('Tech') || dept.includes('IT')) return 'tech';
      if (dept.includes('Marketing')) return 'marketing';
      if (dept.includes('Sales') || dept.includes('Commercial')) return 'sales';
      if (dept.includes('Finance')) return 'finance';
      if (dept.includes('HR') || dept.includes('RH')) return 'hr';
      return 'tech';
    };

    const mapStatus = (status) => {
      if (!status) return 'active';
      if (status.includes('Présélection') || status.includes('Active')) return 'active';
      if (status.includes('Rejeté') || status.includes('Inactive')) return 'inactive';
      return 'active';
    };

    // Build transformed object
    const transformed = {
      full_name: getValue(props['Nom Complet']) || getValue(props['Candidate ID']) || 'Unknown',
      role: getValue(props['Poste Visé']) || 'Candidate',
      skills: getValue(props['Entreprise Cible']) || [], // Using multi-select as skills placeholder
      level: 'mid', // Default level
      department: mapDepartment(getValue(props['Département'])),
      status: mapStatus(getValue(props['Statut Pipeline'])),
      start_date: getValue(props['Date Candidature']),
      location: 'Remote', // Default location
      email: getValue(props['Email']),
      phone: getValue(props['Téléphone']),
      notion_id: notionItem.id,
      date_created: notionItem.created_time,
      date_updated: notionItem.last_edited_time
    };

    // Handle LinkedIn as additional info
    const linkedin = getValue(props['LinkedIn']);
    if (linkedin) {
      transformed.certifications = [{
        name: 'LinkedIn Profile',
        date: new Date().toISOString().split('T')[0],
        url: linkedin
      }];
    }

    return transformed;
  }

  async loadToDirectus(items) {
    const spinner = ora('Loading data to Directus...').start();
    
    try {
      for (const item of items) {
        spinner.text = `Loading... ${this.stats.migrated + 1}/${items.length}`;
        
        try {
          const transformed = this.transformItem(item);
          
          await axios.post(
            `${DIRECTUS_URL}/items/talents`,
            transformed,
            {
              headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          this.stats.migrated++;
        } catch (error) {
          const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
          this.errors.push({
            title: item.properties['Nom Complet']?.rich_text?.[0]?.plain_text || 'Unknown',
            error: errorMsg
          });
          this.stats.failed++;
          await this.log(`Failed to migrate item: ${errorMsg}`, 'error');
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
      const response = await axios.get(
        `${DIRECTUS_URL}/items/talents?aggregate[count]=*`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      );
      
      const directusCount = response.data.data[0]?.count || 0;
      
      if (directusCount >= this.stats.migrated) {
        spinner.succeed(`Validation passed: ${directusCount} items in Directus`);
        await this.log(`Validation passed: ${directusCount} items in Directus`, 'success');
        return true;
      } else {
        spinner.warn(`Validation warning: ${directusCount} in Directus vs ${this.stats.total} in Notion`);
        await this.log(`Validation warning: ${directusCount} in Directus vs ${this.stats.total} in Notion`, 'warn');
        return false;
      }
    } catch (error) {
      spinner.fail(`Validation failed: ${error.message}`);
      await this.log(`Validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async run() {
    console.log(chalk.cyan.bold('\n👥 TALENTS MIGRATION (SIMPLIFIED)\n'));
    console.log(chalk.gray('DB-TALENTS → talents\n'));

    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      await fs.writeFile(this.logFile, `Migration started at ${new Date().toISOString()}\n`);

      const notionItems = await this.extractFromNotion();

      if (notionItems.length === 0) {
        await this.log('No items to migrate', 'warn');
        return;
      }

      await this.loadToDirectus(notionItems);
      await this.validate();

      console.log(chalk.blue.bold('\n📊 MIGRATION SUMMARY\n'));
      console.log(chalk.white(`Total items: ${this.stats.total}`));
      console.log(chalk.green(`✅ Migrated: ${this.stats.migrated}`));
      if (this.stats.failed > 0) {
        console.log(chalk.red(`❌ Failed: ${this.stats.failed}`));
      }

      if (this.errors.length > 0) {
        console.log(chalk.red('\n❌ Errors:'));
        this.errors.forEach(err => {
          console.log(chalk.red(`  - ${err.title}: ${err.error}`));
        });
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
  const migration = new TalentsMigration();
  migration.run().catch(console.error);
}

module.exports = TalentsMigration;