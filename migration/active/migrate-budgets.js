/**
 * Migration Script: BUDGETS
 * Migre les budgets depuis Notion vers Directus
 * Calcule automatiquement remaining_amount
 * Valide les montants financiers
 */

const { Client: NotionClient } = require('@notionhq/client');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const NOTION_DATABASE_ID = '22eadb95-3c6f-809e-b4d8-f937b3bc8bd9';
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

class BudgetsMigration {
  constructor() {
    this.notion = new NotionClient({ auth: NOTION_TOKEN });
    this.stats = {
      total: 0,
      migrated: 0,
      failed: 0,
      overBudget: 0,
      warnings: []
    };
    this.errors = [];
    this.logFile = path.join(process.cwd(), 'migration/logs/budgets.log');
  }

  async createCollection() {
    const spinner = ora('Creating budgets collection...').start();
    
    try {
      const schema = JSON.parse(
        await fs.readFile(
          path.join(process.cwd(), 'migration/schemas/budgets.json'),
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

      spinner.succeed(chalk.green('✓ Budgets collection created'));
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
    const spinner = ora('Extracting budgets from Notion...').start();
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
            spinner.text = `Extracted ${items.length} budgets...`;
          }
        }

        hasMore = response.has_more;
        startCursor = response.next_cursor;
      }

      this.stats.total = items.length;
      spinner.succeed(chalk.green(`✓ Extracted ${items.length} budgets`));
      return items;
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to extract from Notion'));
      throw error;
    }
  }

  roundToTwoDecimals(value) {
    return Math.round((parseFloat(value) || 0) * 100) / 100;
  }

  validateBudget(amount, spentAmount) {
    const amountRounded = this.roundToTwoDecimals(amount);
    const spentRounded = this.roundToTwoDecimals(spentAmount);
    
    if (spentRounded > amountRounded) {
      this.stats.overBudget++;
      this.stats.warnings.push({
        type: 'over_budget',
        amount: amountRounded,
        spent: spentRounded,
        overage: spentRounded - amountRounded
      });
    }
    
    return {
      amount: amountRounded,
      spent: spentRounded,
      remaining: amountRounded - spentRounded
    };
  }

  parseDepartments(multiSelect) {
    if (!multiSelect) return null;
    
    const departments = multiSelect.multi_select?.map(item => item.name) || [];
    return departments.length > 0 ? departments : null;
  }

  async transformItem(notionItem) {
    try {
      const props = notionItem.properties;
      
      // Get title with fallback
      const title = this.getPropertyValue(props.Title || props.Name || props.Titre || props.Budget, 'title') || 
                    'Budget sans titre';

      // Extract financial values
      const amount = this.getPropertyValue(props.Amount || props.Budget || props.Montant, 'number') || 0;
      const spentAmount = this.getPropertyValue(props['Spent Amount'] || props.Spent || props.Dépensé || props['Montant dépensé'], 'number') || 0;
      
      // Validate and calculate
      const financial = this.validateBudget(amount, spentAmount);
      
      // Parse departments from multi-select
      const departments = this.parseDepartments(props.Department || props.Departments || props.Service);

      return {
        title: title,
        category: this.mapCategory(this.getPropertyValue(props.Category || props.Catégorie, 'select')),
        budget_type: this.mapBudgetType(this.getPropertyValue(props.Type || props['Budget Type'], 'select')),
        amount: financial.amount,
        spent_amount: financial.spent,
        remaining_amount: financial.remaining,
        period: this.mapPeriod(this.getPropertyValue(props.Period || props.Période || props.Quarter, 'select')),
        year: this.getPropertyValue(props.Year || props.Année, 'number') || new Date().getFullYear(),
        department: departments,
        status: this.mapStatus(this.getPropertyValue(props.Status || props.Statut, 'select')),
        notes: this.getPropertyValue(props.Notes || props.Description, 'rich_text'),
        notion_id: notionItem.id
      };
    } catch (error) {
      console.error('Transform error:', error);
      this.errors.push({ item: notionItem.id, error: error.message });
      return null;
    }
  }

  mapCategory(notionCategory) {
    const categoryMap = {
      'marketing': 'marketing',
      'it': 'it',
      'informatique': 'it',
      'operations': 'operations',
      'opérations': 'operations',
      'hr': 'hr',
      'rh': 'hr',
      'r&d': 'rd',
      'rd': 'rd',
      'sales': 'sales',
      'ventes': 'sales',
      'other': 'other',
      'autre': 'other'
    };
    
    const normalizedCategory = (notionCategory || '').toLowerCase();
    return categoryMap[normalizedCategory] || 'operations';
  }

  mapBudgetType(notionType) {
    const typeMap = {
      'annual': 'annual',
      'annuel': 'annual',
      'quarterly': 'quarterly',
      'trimestriel': 'quarterly',
      'monthly': 'monthly',
      'mensuel': 'monthly',
      'project': 'project',
      'projet': 'project'
    };
    
    const normalizedType = (notionType || '').toLowerCase();
    return typeMap[normalizedType] || 'annual';
  }

  mapPeriod(notionPeriod) {
    const periodMap = {
      'q1': 'q1',
      'q2': 'q2',
      'q3': 'q3',
      'q4': 'q4',
      'year': 'year',
      'année': 'year',
      'full year': 'year'
    };
    
    const normalizedPeriod = (notionPeriod || '').toLowerCase();
    return periodMap[normalizedPeriod] || null;
  }

  mapStatus(notionStatus) {
    const statusMap = {
      'draft': 'draft',
      'brouillon': 'draft',
      'approved': 'approved',
      'approuvé': 'approved',
      'active': 'active',
      'actif': 'active',
      'closed': 'closed',
      'fermé': 'closed',
      'clos': 'closed'
    };
    
    const normalizedStatus = (notionStatus || '').toLowerCase();
    return statusMap[normalizedStatus] || 'draft';
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
      default:
        return null;
    }
  }

  async loadToDirectus(items) {
    const spinner = ora('Loading budgets to Directus...').start();
    const batchSize = 50;

    try {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        try {
          await axios.post(
            `${DIRECTUS_URL}/items/budgets`,
            batch,
            {
              headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );

          this.stats.migrated += batch.length;
          spinner.text = `Loaded ${this.stats.migrated}/${items.length} budgets...`;
        } catch (error) {
          this.stats.failed += batch.length;
          this.errors.push({
            batch: `${i}-${i + batch.length}`,
            error: error.response?.data?.errors || error.message
          });
        }
      }

      spinner.succeed(chalk.green(`✓ Loaded ${this.stats.migrated} budgets`));
    } catch (error) {
      spinner.fail(chalk.red('✗ Failed to load to Directus'));
      throw error;
    }
  }

  async validate() {
    const spinner = ora('Validating migration...').start();

    try {
      const response = await axios.get(
        `${DIRECTUS_URL}/items/budgets`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` },
          params: { 
            aggregate: { count: 'id', sum: ['amount', 'spent_amount', 'remaining_amount'] },
            limit: 1
          }
        }
      );

      const data = response.data.data?.[0] || {};
      const count = data.count?.id || 0;
      const totalAmount = data.sum?.amount || 0;
      const totalSpent = data.sum?.spent_amount || 0;
      const totalRemaining = data.sum?.remaining_amount || 0;
      
      if (count === this.stats.migrated) {
        spinner.succeed(chalk.green(`✓ Validation passed: ${count} budgets in Directus`));
      } else {
        spinner.warn(chalk.yellow(`⚠ Count mismatch: Expected ${this.stats.migrated}, found ${count}`));
      }

      // Show financial summary
      console.log(chalk.cyan('\n💰 Financial Summary:'));
      console.log(chalk.white(`   Total Budget: €${this.roundToTwoDecimals(totalAmount)}`));
      console.log(chalk.white(`   Total Spent: €${this.roundToTwoDecimals(totalSpent)}`));
      console.log(chalk.white(`   Total Remaining: €${this.roundToTwoDecimals(totalRemaining)}`));
      
      if (this.stats.overBudget > 0) {
        console.log(chalk.yellow(`   ⚠ ${this.stats.overBudget} budgets are over limit`));
      }

      return count;
    } catch (error) {
      spinner.fail(chalk.red('✗ Validation failed'));
      throw error;
    }
  }

  async generateReport() {
    const report = {
      migration: 'budgets',
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
      `budgets-${new Date().toISOString().split('T')[0]}.json`
    );

    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.cyan('\n📊 Migration Report:'));
    console.log(chalk.white(`   Total items: ${this.stats.total}`));
    console.log(chalk.green(`   ✓ Migrated: ${this.stats.migrated}`));
    console.log(chalk.yellow(`   ⚠ Over budget: ${this.stats.overBudget}`));
    console.log(chalk.red(`   ✗ Failed: ${this.stats.failed}`));
    console.log(chalk.gray(`   Report saved: ${reportPath}`));
  }

  async run() {
    console.log(chalk.bold.blue('\n🚀 Starting Budgets Migration\n'));

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
  const migration = new BudgetsMigration();
  migration.run().catch(console.error);
}

module.exports = BudgetsMigration;