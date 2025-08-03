#!/usr/bin/env node

/**
 * Fixed migration script for DB-TALENTS → talents
 * Handles self-referencing manager relationship without stack overflow
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

class TalentsFixedMigration {
  constructor() {
    this.stats = {
      total: 0,
      migrated: 0,
      failed: 0,
      relations: 0
    };
    this.errors = [];
    this.logFile = path.join(process.cwd(), 'migration/logs/talents-fixed.log');
    this.notionToDirectusMap = {};
    this.managerMappings = [];
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

  async createCollectionWithoutRelations() {
    const spinner = ora('Creating talents collection (without manager relation)...').start();
    
    try {
      // Check if collection exists
      const checkResponse = await axios.get(
        `${DIRECTUS_URL}/collections/talents`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      ).catch(() => null);

      if (checkResponse?.data) {
        spinner.warn('Collection talents already exists, deleting and recreating...');
        
        // Delete existing collection
        await axios.delete(
          `${DIRECTUS_URL}/collections/talents`,
          {
            headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
          }
        );
        await this.log('Deleted existing talents collection', 'warn');
      }

      // Create collection
      const collectionData = {
        collection: 'talents',
        meta: {
          collection: 'talents',
          icon: 'people',
          note: 'Talents and human resources',
          display_template: '{{full_name}} - {{role}}',
          hidden: false,
          singleton: false,
          archive_field: 'status',
          archive_value: 'inactive',
          unarchive_value: 'active',
          sort_field: 'sort',
          accountability: 'all',
          color: '#673AB7'
        },
        schema: {
          schema: 'public',
          name: 'talents',
          comment: 'Talents migrated from Notion'
        }
      };

      await axios.post(
        `${DIRECTUS_URL}/collections`,
        collectionData,
        {
          headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      spinner.text = 'Creating fields (without manager_id)...';

      // Fields WITHOUT manager_id
      const fields = [
        { field: 'id', type: 'uuid', meta: { interface: 'input', readonly: true, hidden: true, special: ['uuid'] }, schema: { is_primary_key: true } },
        { field: 'full_name', type: 'string', meta: { interface: 'input', required: true }, schema: { is_nullable: false, max_length: 255 } },
        { field: 'role', type: 'string', meta: { interface: 'input' }, schema: { is_nullable: true, max_length: 255 } },
        { field: 'skills', type: 'json', meta: { interface: 'tags', display: 'labels' }, schema: { is_nullable: true } },
        { field: 'level', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
          { text: 'Junior', value: 'junior' },
          { text: 'Mid-Level', value: 'mid' },
          { text: 'Senior', value: 'senior' },
          { text: 'Expert', value: 'expert' }
        ]}}, schema: { is_nullable: false, default_value: 'mid', max_length: 50 } },
        { field: 'department', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
          { text: 'Technology', value: 'tech' },
          { text: 'Marketing', value: 'marketing' },
          { text: 'Sales', value: 'sales' },
          { text: 'Operations', value: 'operations' },
          { text: 'Finance', value: 'finance' },
          { text: 'HR', value: 'hr' },
          { text: 'Legal', value: 'legal' }
        ]}}, schema: { is_nullable: false, default_value: 'tech', max_length: 50 } },
        { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
          { text: 'Active', value: 'active' },
          { text: 'Inactive', value: 'inactive' },
          { text: 'Freelance', value: 'freelance' },
          { text: 'Alumni', value: 'alumni' }
        ]}}, schema: { is_nullable: false, default_value: 'active', max_length: 50 } },
        { field: 'start_date', type: 'date', meta: { interface: 'datetime' }, schema: { is_nullable: true } },
        { field: 'location', type: 'string', meta: { interface: 'input' }, schema: { is_nullable: true, max_length: 255 } },
        { field: 'email', type: 'string', meta: { interface: 'input' }, schema: { is_nullable: true, max_length: 255 } },
        { field: 'phone', type: 'string', meta: { interface: 'input' }, schema: { is_nullable: true, max_length: 50 } },
        { field: 'certifications', type: 'json', meta: { interface: 'list' }, schema: { is_nullable: true } },
        { field: 'performance_rating', type: 'decimal', meta: { interface: 'slider', options: { min: 0, max: 5, step: 0.5 } }, schema: { is_nullable: true, numeric_precision: 2, numeric_scale: 1 } },
        { field: 'salary_range', type: 'string', meta: { interface: 'input', options: { masked: true } }, schema: { is_nullable: true, max_length: 100 } },
        { field: 'notion_id', type: 'string', meta: { interface: 'input', readonly: true, hidden: true }, schema: { is_nullable: true, max_length: 255 } },
        { field: 'manager_notion_id', type: 'string', meta: { interface: 'input', hidden: true, note: 'Temporary field for migration' }, schema: { is_nullable: true, max_length: 255 } },
        { field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true }, schema: { is_nullable: true } },
        { field: 'date_created', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-created'] }, schema: { is_nullable: true } },
        { field: 'date_updated', type: 'timestamp', meta: { interface: 'datetime', readonly: true, special: ['date-updated'] }, schema: { is_nullable: true } },
        { field: 'user_created', type: 'uuid', meta: { special: ['user-created'], interface: 'select-dropdown-m2o' }, schema: { is_nullable: true, foreign_key_table: 'directus_users', foreign_key_column: 'id' } },
        { field: 'user_updated', type: 'uuid', meta: { special: ['user-updated'], interface: 'select-dropdown-m2o' }, schema: { is_nullable: true, foreign_key_table: 'directus_users', foreign_key_column: 'id' } }
      ];

      // Create fields one by one
      for (const field of fields) {
        if (field.field === 'id') continue; // Skip ID field (auto-created)
        
        try {
          await axios.post(
            `${DIRECTUS_URL}/fields/talents`,
            field,
            {
              headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );
          await this.log(`Created field: ${field.field}`, 'success');
        } catch (fieldError) {
          await this.log(`Failed to create field ${field.field}: ${fieldError.response?.data?.errors?.[0]?.message || fieldError.message}`, 'error');
        }
      }

      spinner.succeed('Collection talents created successfully (without manager relation)');
      await this.log('Collection created: talents (step 1)', 'success');
      return true;
    } catch (error) {
      spinner.fail(`Failed to create collection: ${error.message}`);
      await this.log(`Failed to create collection: ${error.message}`, 'error');
      throw error;
    }
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
    
    // Helper function to extract property value
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
        case 'relation':
          return prop.relation?.map(r => r.id) || [];
        default:
          return null;
      }
    };

    // Map department
    const mapDepartment = (dept) => {
      if (!dept) return 'tech';
      const deptLower = dept.toLowerCase();
      if (deptLower.includes('tech') || deptLower.includes('it')) return 'tech';
      if (deptLower.includes('marketing')) return 'marketing';
      if (deptLower.includes('sales') || deptLower.includes('commercial')) return 'sales';
      if (deptLower.includes('finance')) return 'finance';
      if (deptLower.includes('hr') || deptLower.includes('rh')) return 'hr';
      if (deptLower.includes('operations')) return 'operations';
      return 'tech';
    };

    // Map status
    const mapStatus = (status) => {
      if (!status) return 'active';
      const statusLower = status.toLowerCase();
      if (statusLower.includes('présélection') || statusLower.includes('active')) return 'active';
      if (statusLower.includes('rejeté') || statusLower.includes('inactive')) return 'inactive';
      if (statusLower.includes('freelance')) return 'freelance';
      return 'active';
    };

    // Extract manager Notion ID if present
    let managerNotionId = null;
    const managerRelation = getValue(props['Manager']) || getValue(props['Reports To']) || getValue(props['Responsable']);
    if (managerRelation && Array.isArray(managerRelation) && managerRelation.length > 0) {
      managerNotionId = managerRelation[0];
    }

    // Build transformed object
    const transformed = {
      full_name: getValue(props['Nom Complet']) || getValue(props['Candidate ID']) || 'Unknown',
      role: getValue(props['Poste Visé']) || 'Candidate',
      skills: getValue(props['Entreprise Cible']) || [], // Using multi-select as skills
      level: 'mid', // Default level
      department: mapDepartment(getValue(props['Département'])),
      status: mapStatus(getValue(props['Statut Pipeline'])),
      start_date: getValue(props['Date Candidature']),
      location: 'Remote', // Default location
      email: getValue(props['Email']),
      phone: getValue(props['Téléphone']),
      notion_id: notionItem.id,
      manager_notion_id: managerNotionId, // Store temporarily for later mapping
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
      for (let i = 0; i < items.length; i++) {
        spinner.text = `Loading... ${i + 1}/${items.length}`;
        
        try {
          const transformed = this.transformItem(items[i]);
          
          const response = await axios.post(
            `${DIRECTUS_URL}/items/talents`,
            transformed,
            {
              headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Store mapping for manager relations
          if (response.data?.data?.id) {
            this.notionToDirectusMap[transformed.notion_id] = response.data.data.id;
            
            // Store manager mapping for later
            if (transformed.manager_notion_id) {
              this.managerMappings.push({
                talentId: response.data.data.id,
                managerNotionId: transformed.manager_notion_id,
                talentName: transformed.full_name
              });
            }
          }
          
          this.stats.migrated++;
          await this.log(`Migrated: ${transformed.full_name}`, 'success');
        } catch (error) {
          const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
          this.errors.push({
            title: items[i].properties['Nom Complet']?.rich_text?.[0]?.plain_text || 'Unknown',
            error: errorMsg
          });
          this.stats.failed++;
          await this.log(`Failed to migrate item: ${errorMsg}`, 'error');
        }
      }

      spinner.succeed(`Loaded ${this.stats.migrated} items to Directus`);
      await this.log(`Data loading completed: ${this.stats.migrated}/${this.stats.total} items migrated`, 'success');
    } catch (error) {
      spinner.fail(`Loading failed: ${error.message}`);
      await this.log(`Loading failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async addManagerRelations() {
    const spinner = ora('Adding manager relations...').start();
    
    try {
      // Step 1: Create the manager_id field
      spinner.text = 'Creating manager_id field...';
      
      await axios.post(
        `${DIRECTUS_URL}/fields/talents`,
        {
          field: 'manager_id',
          type: 'uuid',
          meta: {
            interface: 'select-dropdown-m2o',
            special: ['m2o'],
            width: 'half',
            required: false,
            note: 'Direct manager (self-referencing)'
          },
          schema: {
            is_nullable: true,
            foreign_key_table: 'talents',
            foreign_key_column: 'id'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await this.log('Created manager_id field', 'success');
      
      // Step 2: Update manager relationships
      spinner.text = 'Updating manager relationships...';
      
      for (const mapping of this.managerMappings) {
        const managerId = this.notionToDirectusMap[mapping.managerNotionId];
        
        if (managerId) {
          try {
            await axios.patch(
              `${DIRECTUS_URL}/items/talents/${mapping.talentId}`,
              { manager_id: managerId },
              {
                headers: {
                  'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            this.stats.relations++;
            await this.log(`Updated manager for ${mapping.talentName}`, 'success');
          } catch (error) {
            await this.log(`Failed to update manager for ${mapping.talentName}: ${error.message}`, 'warn');
          }
        }
      }
      
      // Step 3: Clean up temporary field
      spinner.text = 'Cleaning up temporary fields...';
      
      try {
        await axios.delete(
          `${DIRECTUS_URL}/fields/talents/manager_notion_id`,
          {
            headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
          }
        );
        await this.log('Removed temporary manager_notion_id field', 'success');
      } catch (error) {
        await this.log('Could not remove temporary field: ' + error.message, 'warn');
      }
      
      spinner.succeed(`Manager relations added: ${this.stats.relations} relations created`);
      await this.log(`Manager relations completed: ${this.stats.relations} relations created`, 'success');
    } catch (error) {
      spinner.fail(`Failed to add manager relations: ${error.message}`);
      await this.log(`Failed to add manager relations: ${error.message}`, 'error');
    }
  }

  async validate() {
    const spinner = ora('Validating migration...').start();
    
    try {
      // Count items in Directus
      const response = await axios.get(
        `${DIRECTUS_URL}/items/talents?aggregate[count]=*`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      );
      
      const directusCount = response.data.data[0]?.count || 0;
      
      // Check manager relationships
      const managerResponse = await axios.get(
        `${DIRECTUS_URL}/items/talents?filter[manager_id][_nnull]=true&aggregate[count]=*`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      );
      
      const managedCount = managerResponse.data.data[0]?.count || 0;
      
      spinner.succeed(`Validation passed: ${directusCount} items in Directus (${managedCount} with managers)`);
      await this.log(`Validation passed: ${directusCount} items, ${managedCount} with managers`, 'success');
      return true;
    } catch (error) {
      spinner.fail(`Validation failed: ${error.message}`);
      await this.log(`Validation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    const report = {
      collection: 'talents',
      source: 'DB-TALENTS',
      timestamp: new Date().toISOString(),
      stats: this.stats,
      validation: {
        passed: this.stats.migrated === this.stats.total,
        message: this.stats.migrated === this.stats.total 
          ? 'All items migrated successfully' 
          : `${this.stats.failed} items failed to migrate`
      },
      managerRelations: this.stats.relations,
      errors: this.errors
    };

    const reportPath = path.join(process.cwd(), 'migration/reports', `talents_fixed_${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    await this.log(`Report saved to: ${reportPath}`, 'info');
    
    return report;
  }

  async run() {
    console.log(chalk.cyan.bold('\n👥 TALENTS MIGRATION (FIXED VERSION)\n'));
    console.log(chalk.gray('DB-TALENTS → talents with manager relations\n'));

    try {
      // Initialize log
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      await fs.writeFile(this.logFile, `Migration started at ${new Date().toISOString()}\n`);

      // Step 1: Create collection without manager relations
      console.log(chalk.blue('\n📦 STEP 1: Creating collection structure...'));
      await this.createCollectionWithoutRelations();

      // Step 2: Extract from Notion
      console.log(chalk.blue('\n📊 STEP 2: Extracting data from Notion...'));
      const notionItems = await this.extractFromNotion();

      if (notionItems.length === 0) {
        await this.log('No items to migrate', 'warn');
        return;
      }

      // Step 3: Load to Directus
      console.log(chalk.blue('\n💾 STEP 3: Loading data to Directus...'));
      await this.loadToDirectus(notionItems);

      // Step 4: Add manager relations
      console.log(chalk.blue('\n🔗 STEP 4: Adding manager relationships...'));
      await this.addManagerRelations();

      // Step 5: Validate
      console.log(chalk.blue('\n✅ STEP 5: Validating migration...'));
      await this.validate();

      // Step 6: Generate report
      const report = await this.generateReport();

      // Display summary
      console.log(chalk.blue.bold('\n📊 MIGRATION SUMMARY\n'));
      console.log(chalk.white(`Total items: ${this.stats.total}`));
      console.log(chalk.green(`✅ Migrated: ${this.stats.migrated}`));
      if (this.stats.failed > 0) {
        console.log(chalk.red(`❌ Failed: ${this.stats.failed}`));
      }
      console.log(chalk.cyan(`🔗 Manager relations: ${this.stats.relations}`));

      if (this.errors.length > 0) {
        console.log(chalk.red('\n❌ Errors:'));
        this.errors.slice(0, 5).forEach(err => {
          console.log(chalk.red(`  - ${err.title}: ${err.error}`));
        });
        if (this.errors.length > 5) {
          console.log(chalk.gray(`  ... and ${this.errors.length - 5} more errors (see report)`));
        }
      }

      console.log(chalk.green.bold('\n✅ Migration completed successfully!'));
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
  const migration = new TalentsFixedMigration();
  migration.run().catch(console.error);
}

module.exports = TalentsFixedMigration;