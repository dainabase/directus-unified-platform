/**
 * Migration Script: SUBSCRIPTIONS
 * Migre les abonnements depuis Notion vers Directus
 * Calcule annual_cost selon billing_cycle
 * Détecte les renouvellements < 30 jours
 */

const { Client: NotionClient } = require('@notionhq/client');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const NOTION_DATABASE_ID = '231adb95-3c6f-80ba-9608-c9e5fdd4baf9';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

class SubscriptionsMigration {
  constructor() {
    this.notion = new NotionClient({ auth: NOTION_TOKEN });
    this.stats = {
      total: 0,
      migrated: 0,
      failed: 0,
      expiring: 0,
      alerts: []
    };
    this.errors = [];
    this.logFile = path.join(process.cwd(), 'migration/logs/subscriptions.log');
  }

  async createCollection() {
    const spinner = ora('Creating subscriptions collection...').start();
    
    try {
      const schema = JSON.parse(
        await fs.readFile(
          path.join(process.cwd(), 'migration/schemas/subscriptions.json'),
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

      spinner.succeed(chalk.green('✓ Subscriptions collection created'));
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

  async extractFromNotion() {
    const spinner = ora('Extracting subscriptions from Notion...').start();
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
            spinner.text = `Extracted ${items.length} subscriptions...`;
          }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor;
      }

      this.stats.total = items.length;
      spinner.succeed(chalk.green(`✓ Extracted ${items.length} subscriptions`));
      return items;
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to extract from Notion'));
      throw error;
    }
  }

  calculateAnnualCost(monthlyCost, billingCycle) {
    const cost = parseFloat(monthlyCost) || 0;
    
    switch (billingCycle) {
      case 'monthly':
        return Math.round(cost * 12 * 100) / 100;
      case 'quarterly':
        return Math.round(cost * 4 * 100) / 100;
      case 'annual':
      case 'yearly':
        return Math.round(cost * 100) / 100;
      default:
        return Math.round(cost * 12 * 100) / 100; // Default to monthly
    }
  }

  checkRenewalAlert(renewalDate) {
    if (!renewalDate) return { status: 'active', alert: false };
    
    const today = new Date();
    const renewal = new Date(renewalDate);
    const daysUntilRenewal = Math.floor((renewal - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal < 0) {
      return { status: 'expired', alert: true, days: daysUntilRenewal };
    } else if (daysUntilRenewal <= 30) {
      return { status: 'expiring', alert: true, days: daysUntilRenewal };
    }
    
    return { status: 'active', alert: false, days: daysUntilRenewal };
  }

  validateUrl(url) {
    if (!url) return null;
    
    try {
      new URL(url);
      return url;
    } catch {
      // Try adding https://
      try {
        new URL(`https://${url}`);
        return `https://${url}`;
      } catch {
        return null;
      }
    }
  }

  async transformItem(notionItem) {
    try {
      const props = notionItem.properties;
      
      // Extract base values
      const serviceName = this.getPropertyValue(props['Service Name'] || props.Name || props.Title, 'title');
      const monthlyCost = this.getPropertyValue(props['Monthly Cost'] || props.Cost || props.Price, 'number') || 0;
      const billingCycle = this.getPropertyValue(props['Billing Cycle'] || props.Billing, 'select') || 'monthly';
      const renewalDate = this.getPropertyValue(props['Renewal Date'] || props.Renewal, 'date');
      
      // Calculate derived values
      const annualCost = this.calculateAnnualCost(monthlyCost, billingCycle.toLowerCase());
      const renewalCheck = this.checkRenewalAlert(renewalDate);
      
      // Track expiring subscriptions
      if (renewalCheck.alert) {
        this.stats.expiring++;
        this.stats.alerts.push({
          service: serviceName,
          days_until_renewal: renewalCheck.days,
          renewal_date: renewalDate
        });
      }

      return {
        service_name: serviceName,
        provider: this.getPropertyValue(props.Provider || props.Company, 'text'),
        subscription_type: this.mapSubscriptionType(this.getPropertyValue(props.Type || props.Category, 'select')),
        monthly_cost: Math.round(monthlyCost * 100) / 100,
        annual_cost: annualCost,
        billing_cycle: billingCycle.toLowerCase(),
        start_date: this.getPropertyValue(props['Start Date'] || props.Started, 'date'),
        renewal_date: renewalDate,
        status: renewalCheck.status,
        category: this.mapCategory(this.getPropertyValue(props.Category || props.Department, 'select')),
        user_count: this.getPropertyValue(props['User Count'] || props.Users || props.Seats, 'number'),
        service_url: this.validateUrl(this.getPropertyValue(props.URL || props.Link || props.Website, 'url')),
        alert_renewal: renewalCheck.alert,
        notion_id: notionItem.id
      };
    } catch (error) {
      console.error('Transform error:', error);
      this.errors.push({ item: notionItem.id, error: error.message });
      return null;
    }
  }

  mapSubscriptionType(notionType) {
    const typeMap = {
      'saas': 'saas',
      'software': 'saas',
      'license': 'license',
      'support': 'support',
      'hosting': 'hosting',
      'infrastructure': 'hosting',
      'other': 'other'
    };
    
    const normalizedType = (notionType || '').toLowerCase();
    return typeMap[normalizedType] || 'saas';
  }

  mapCategory(notionCategory) {
    const categoryMap = {
      'tool': 'tool',
      'tools': 'tool',
      'service': 'service',
      'services': 'service',
      'infrastructure': 'infrastructure',
      'infra': 'infrastructure',
      'marketing': 'marketing',
      'other': 'other'
    };
    
    const normalizedCategory = (notionCategory || '').toLowerCase();
    return categoryMap[normalizedCategory] || 'other';
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
      case 'checkbox':
        return property.checkbox || false;
      default:
        return null;
    }
  }

  async loadToDirectus(items) {
    const spinner = ora('Loading subscriptions to Directus...').start();
    const batchSize = 50;

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        try {
          await axios.post(
            `${DIRECTUS_URL}/items/subscriptions`,
            batch,
            {
              headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );

          this.stats.migrated += batch.length;
          spinner.text = `Loaded ${this.stats.migrated}/${items.length} subscriptions...`;
        } catch (error) {
          this.stats.failed += batch.length;
          this.errors.push({
            batch: `${i}-${i + batch.length}`,
            error: error.response?.data?.errors || error.message
          });
        }
      }

      spinner.succeed(chalk.green(`✓ Loaded ${this.stats.migrated} subscriptions`));
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to load to Directus'));
      throw error;
    }
  }

  async validate() {
    const spinner = ora('Validating migration...').start();

    try {
      const response = await axios.get(
        `${DIRECTUS_URL}/items/subscriptions`,
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
        spinner.succeed(chalk.green(`✓ Validation passed: ${count} subscriptions in Directus`));
      } else {
        spinner.warn(chalk.yellow(`⚠ Count mismatch: Expected ${this.stats.migrated}, found ${count}`));
      }

      // Show renewal alerts
      if (this.stats.alerts.length > 0) {
        console.log(chalk.yellow('\n⚠ Subscriptions requiring attention:'));
        this.stats.alerts.forEach(alert => {
          const daysText = alert.days_until_renewal < 0 
            ? `EXPIRED ${Math.abs(alert.days_until_renewal)} days ago`
            : `${alert.days_until_renewal} days until renewal`;
          console.log(chalk.yellow(`   • ${alert.service}: ${daysText}`));
        });
      }

      return count;
    } catch (error) {
      spinner.fail(chalk.red('✗ Validation failed'));
      throw error;
    }
  }

  async generateReport() {
    const report = {
      migration: 'subscriptions',
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
      `subscriptions-${new Date().toISOString().split('T')[0]}.json`
    );

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.cyan('\n📊 Migration Report:'));
    console.log(chalk.white(`   Total items: ${this.stats.total}`));
    console.log(chalk.green(`   ✓ Migrated: ${this.stats.migrated}`));
    console.log(chalk.yellow(`   ⚠ Expiring/Expired: ${this.stats.expiring}`));
    console.log(chalk.red(`   ✗ Failed: ${this.stats.failed}`));
    console.log(chalk.gray(`   Report saved: ${reportPath}`));
  }

  async run() {
    console.log(chalk.bold.blue('\n🚀 Starting Subscriptions Migration\n'));

    try {
      // 1. Create collection
      await this.createCollection();

      // 2. Extract from Notion
      const items = await this.extractFromNotion();

      if (items.length === 0) {
        console.log(chalk.yellow('No items to migrate'));
        return;
      }

      // 3. Load to Directus
      await this.loadToDirectus(items);

      // 4. Validate
      await this.validate();

      // 5. Generate report
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
  const migration = new SubscriptionsMigration();
  migration.run().catch(console.error);
}

module.exports = SubscriptionsMigration;