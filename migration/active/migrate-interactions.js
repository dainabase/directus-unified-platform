/**
 * Migration Script: INTERACTIONS
 * Migre les interactions clients depuis Notion vers Directus
 * Gère les relations avec la collection companies
 */

const { Client: NotionClient } = require('@notionhq/client');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const NOTION_DATABASE_ID = '226adb95-3c6f-805f-9095-d4c6278a5f5b';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

class InteractionsMigration {
  constructor() {
    this.notion = new NotionClient({ auth: NOTION_TOKEN });
    this.stats = {
      total: 0,
      migrated: 0,
      failed: 0,
      skipped: 0
    };
    this.errors = [];
    this.companiesMap = new Map();
    this.logFile = path.join(process.cwd(), 'migration/logs/interactions.log');
  }

  async createCollection() {
    const spinner = ora('Creating interactions collection...').start();
    
    try {
      const schema = JSON.parse(
        await fs.readFile(
          path.join(process.cwd(), 'migration/schemas/interactions.json'),
          'utf8'
        )
      );

      // Create collection
      await axios.post(
        `${DIRECTUS_URL}/collections`,
        schema,
        {
          headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      spinner.succeed(chalk.green('✓ Interactions collection created'));
      return true;
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        spinner.info(chalk.yellow('⚠ Collection already exists, continuing...'));
        return true;
      }
      spinner.fail(chalk.red('✗ Failed to create collection'));
      throw error;
    }
  }

  async loadCompaniesMapping() {
    const spinner = ora('Loading companies mapping...').start();
    
    try {
      const response = await axios.get(
        `${DIRECTUS_URL}/items/companies`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` },
          params: {
            fields: 'id,name,notion_id',
            limit: -1
          }
        }
      );

      response.data.data.forEach(company => {
        if (company.notion_id) {
          this.companiesMap.set(company.notion_id, company.id);
        }
      });

      spinner.succeed(chalk.green(`✓ Loaded ${this.companiesMap.size} companies`));
    } catch (error) {
      spinner.warn(chalk.yellow('⚠ No companies found, relations will be null'));
    }
  }

  async extractFromNotion() {
    const spinner = ora('Extracting interactions from Notion...').start();
    const items = [];

    try {
      let hasMore = true;
      let startCursor = undefined;

      while (hasMore) {
        const response = await this.notion.databases.query({
          database_id: NOTION_DATABASE_ID,
          start_cursor: startCursor,
          page_size: 100
        });

        for (const page of response.results) {
          const transformed = await this.transformItem(page);
          if (transformed) {
            items.push(transformed);
            spinner.text = `Extracted ${items.length} interactions...`;
          }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor;
      }

      this.stats.total = items.length;
      spinner.succeed(chalk.green(`✓ Extracted ${items.length} interactions`));
      return items;
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to extract from Notion'));
      throw error;
    }
  }

  async transformItem(notionItem) {
    try {
      const props = notionItem.properties;
      
      // Map client relation
      let clientId = null;
      if (props.Client?.relation?.[0]?.id) {
        clientId = this.companiesMap.get(props.Client.relation[0].id) || null;
      }

      // Get title with fallback
      const title = this.getPropertyValue(props.Title || props.Name || props.Titre, 'title') || 
                    this.getPropertyValue(props.Description, 'rich_text') ||
                    'Interaction sans titre';

      // Get date with fallback to today
      const interactionDate = this.getPropertyValue(props.Date || props['Interaction Date'] || props['Date création'], 'date') || 
                              new Date().toISOString().split('T')[0];

      return {
        title: title,
        interaction_type: this.getPropertyValue(props['Type'] || props['Interaction Type'], 'select') || 'call',
        client_id: clientId,
        contact_person: this.getPropertyValue(props['Contact Person'] || props.Contact || props.Personne, 'text'),
        interaction_date: interactionDate,
        duration_minutes: this.getPropertyValue(props.Duration || props['Duration (min)'] || props.Durée, 'number'),
        notes: this.getPropertyValue(props.Notes || props.Description || props.Remarques, 'rich_text'),
        status: this.mapStatus(this.getPropertyValue(props.Status || props.Statut, 'select')),
        notion_id: notionItem.id
      };
    } catch (error) {
      console.error('Transform error:', error);
      this.errors.push({ item: notionItem.id, error: error.message });
      return null;
    }
  }

  mapStatus(notionStatus) {
    const statusMap = {
      'completed': 'completed',
      'done': 'completed',
      'scheduled': 'scheduled',
      'planned': 'scheduled',
      'cancelled': 'cancelled',
      'canceled': 'cancelled'
    };
    
    const normalizedStatus = (notionStatus || '').toLowerCase();
    return statusMap[normalizedStatus] || 'scheduled';
  }

  getPropertyValue(property, type) {
    if (!property) return null;

    switch (type) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'text':
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'number':
        return property.number || 0;
      case 'select':
        return property.select?.name || null;
      case 'date':
        return property.date?.start || null;
      case 'url':
        return property.url || null;
      default:
        return null;
    }
  }

  async loadToDirectus(items) {
    const spinner = ora('Loading interactions to Directus...').start();
    const batchSize = 50;

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        try {
          await axios.post(
            `${DIRECTUS_URL}/items/interactions`,
            batch,
            {
              headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );

          this.stats.migrated += batch.length;
          spinner.text = `Loaded ${this.stats.migrated}/${items.length} interactions...`;
        } catch (error) {
          this.stats.failed += batch.length;
          this.errors.push({
            batch: `${i}-${i + batch.length}`,
            error: error.response?.data?.errors || error.message
          });
        }
      }

      spinner.succeed(chalk.green(`✓ Loaded ${this.stats.migrated} interactions`));
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to load to Directus'));
      throw error;
    }
  }

  async validate() {
    const spinner = ora('Validating migration...').start();

    try {
      const response = await axios.get(
        `${DIRECTUS_URL}/items/interactions`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` },
          params: { 
            aggregate: { count: 'id' },
            limit: 1
          }
        }
      );

      const count = response.data.data?.[0]?.count?.id || 0;
      
      if (count === this.stats.migrated) {
        spinner.succeed(chalk.green(`✓ Validation passed: ${count} interactions in Directus`));
      } else {
        spinner.warn(chalk.yellow(`⚠ Count mismatch: Expected ${this.stats.migrated}, found ${count}`));
      }

      return count;
    } catch (error) {
      spinner.fail(chalk.red('✗ Validation failed'));
      throw error;
    }
  }

  async generateReport() {
    const report = {
      migration: 'interactions',
      timestamp: new Date().toISOString(),
      database_id: NOTION_DATABASE_ID,
      stats: this.stats,
      errors: this.errors,
      validation: {
        directus_count: await this.validate().catch(() => 'Failed')
      }
    };

    const reportPath = path.join(
      process.cwd(),
      'migration/reports',
      `interactions-${new Date().toISOString().split('T')[0]}.json`
    );

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.cyan('\n📊 Migration Report:'));
    console.log(chalk.white(`   Total items: ${this.stats.total}`));
    console.log(chalk.green(`   ✓ Migrated: ${this.stats.migrated}`));
    console.log(chalk.red(`   ✗ Failed: ${this.stats.failed}`));
    console.log(chalk.gray(`   Report saved: ${reportPath}`));
  }

  async run() {
    console.log(chalk.bold.blue('\n🚀 Starting Interactions Migration\n'));

    try {
      // 1. Create collection
      await this.createCollection();

      // 2. Load companies mapping
      await this.loadCompaniesMapping();

      // 3. Extract from Notion
      const items = await this.extractFromNotion();

      if (items.length === 0) {
        console.log(chalk.yellow('No items to migrate'));
        return;
      }

      // 4. Load to Directus
      await this.loadToDirectus(items);

      // 5. Validate
      await this.validate();

      // 6. Generate report
      await this.generateReport();

      console.log(chalk.bold.green('\n✅ Migration completed successfully!\n'));
    } catch (error) {
      console.error(chalk.bold.red('\n❌ Migration failed:'), error);
      await this.generateReport().catch(console.error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const migration = new InteractionsMigration();
  migration.run().catch(console.error);
}

module.exports = InteractionsMigration;