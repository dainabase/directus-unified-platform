#!/usr/bin/env node

/**
 * Migration script for DB-TALENTS → talents
 * Migrates talents and HR data from Notion to Directus
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
const NOTION_DATABASE_ID = '22eadb953c6f809d9845eb6f9ee659ee'; // From analysis

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
    this.logFile = path.join(process.cwd(), 'migration/logs/talents.log');
    this.talentMapping = new Map(); // For self-referencing manager relationships
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
    const spinner = ora('Creating talents collection in Directus...').start();
    
    try {
      // Check if collection exists
      const checkResponse = await axios.get(
        `${DIRECTUS_URL}/collections/talents`,
        {
          headers: { 'Authorization': `Bearer ${DIRECTUS_TOKEN}` }
        }
      ).catch(() => null);

      if (checkResponse?.data) {
        spinner.warn('Collection talents already exists');
        return true;
      }

      // Load schema
      const schemaPath = path.join(process.cwd(), 'migration/schemas/talents.json');
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

      spinner.succeed('Collection talents created successfully');
      await this.log('Collection created: talents', 'success');
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

  transformItem(notionItem, isFirstPass = true) {
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
        case 'email':
          return prop.email || null;
        case 'phone_number':
          return prop.phone_number || null;
        case 'checkbox':
          return prop.checkbox || false;
        case 'number':
          return prop.number || 0;
        case 'relation':
          // Return related page IDs for manager relationship
          return prop.relation.map(r => r.id);
        case 'people':
          return prop.people[0]?.name || null;
        default:
          return null;
      }
    };

    // Map level
    const mapLevel = (level) => {
      const levelMap = {
        'Junior': 'junior',
        'Mid': 'mid',
        'Mid-Level': 'mid',
        'Intermédiaire': 'mid',
        'Senior': 'senior',
        'Expert': 'expert',
        'Lead': 'expert',
        'Principal': 'expert'
      };
      return levelMap[level] || 'mid';
    };

    // Map department
    const mapDepartment = (dept) => {
      const deptMap = {
        'Technology': 'tech',
        'Tech': 'tech',
        'Technologie': 'tech',
        'IT': 'tech',
        'Engineering': 'tech',
        'Marketing': 'marketing',
        'Sales': 'sales',
        'Ventes': 'sales',
        'Commercial': 'sales',
        'Operations': 'operations',
        'Ops': 'operations',
        'Finance': 'finance',
        'Comptabilité': 'finance',
        'Accounting': 'finance',
        'Human Resources': 'hr',
        'HR': 'hr',
        'RH': 'hr',
        'Legal': 'legal',
        'Juridique': 'legal'
      };
      return deptMap[dept] || 'tech';
    };

    // Map status
    const mapStatus = (status) => {
      const statusMap = {
        'Active': 'active',
        'Actif': 'active',
        'Inactive': 'inactive',
        'Inactif': 'inactive',
        'Freelance': 'freelance',
        'Consultant': 'freelance',
        'Alumni': 'alumni',
        'Former': 'alumni',
        'Ancien': 'alumni'
      };
      return statusMap[status] || 'active';
    };

    // Extract name
    const extractName = () => {
      return getValue(props['Nom Complet']) || 
             getValue(props['Name']) || 
             getValue(props['Full Name']) || 
             getValue(props['Nom']) ||
             getValue(props['Candidate ID']) ||
             `${getValue(props['First Name']) || ''} ${getValue(props['Last Name']) || ''}`.trim() ||
             'Unknown';
    };

    // Extract skills
    const extractSkills = () => {
      const skills = getValue(props['Skills']) || 
                    getValue(props['Compétences']) || 
                    getValue(props['Technologies']) ||
                    getValue(props['Tech Stack']);
      
      if (Array.isArray(skills)) {
        return skills;
      } else if (typeof skills === 'string') {
        return skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      return null;
    };

    // Extract certifications
    const extractCertifications = () => {
      const certs = getValue(props['Certifications']) || 
                   getValue(props['Certificates']) ||
                   getValue(props['Diplômes']);
      
      if (Array.isArray(certs)) {
        return certs.map(cert => ({
          name: cert,
          date: new Date().toISOString().split('T')[0]
        }));
      } else if (typeof certs === 'string' && certs) {
        return certs.split(',').map(cert => ({
          name: cert.trim(),
          date: new Date().toISOString().split('T')[0]
        }));
      }
      return null;
    };

    // Transform to Directus format
    const transformed = {
      full_name: extractName(),
      role: getValue(props['Poste Visé']) || getValue(props['Role']) || getValue(props['Title']) || getValue(props['Poste']) || 'Employee',
      skills: extractSkills(),
      level: mapLevel(getValue(props['Level']) || getValue(props['Seniority']) || getValue(props['Niveau'])),
      department: mapDepartment(getValue(props['Département']) || getValue(props['Department']) || getValue(props['Team'])),
      status: mapStatus(getValue(props['Statut Pipeline']) || getValue(props['Status']) || getValue(props['Statut'])),
      start_date: getValue(props['Date Candidature']) || getValue(props['Start Date']) || getValue(props['Date Embauche']) || getValue(props['Joined']),
      location: getValue(props['Location']) || getValue(props['Office']) || getValue(props['Lieu']) || 'Remote',
      email: getValue(props['Email']) || getValue(props['Mail']),
      phone: getValue(props['Téléphone']) || getValue(props['Phone']) || getValue(props['Mobile']),
      certifications: extractCertifications(),
      notion_id: notionItem.id,
      date_created: notionItem.created_time,
      date_updated: notionItem.last_edited_time
    };

    // Handle performance rating
    const rating = getValue(props['Performance']) || getValue(props['Rating']) || getValue(props['Évaluation']);
    if (rating !== null && !isNaN(rating)) {
      transformed.performance_rating = Math.min(5, Math.max(0, parseFloat(rating)));
    }

    // Handle salary range (keep it masked/confidential)
    const salary = getValue(props['Salary']) || getValue(props['Salaire']) || getValue(props['Compensation']);
    if (salary) {
      // Mask the actual value for privacy
      if (typeof salary === 'number') {
        const range = Math.floor(salary / 10000) * 10000;
        transformed.salary_range = `${range}-${range + 10000}`;
      } else {
        transformed.salary_range = salary.toString();
      }
    }

    // Handle manager relationship (will be processed in second pass)
    if (!isFirstPass) {
      const managerRelation = getValue(props['Manager']) || getValue(props['Reports To']) || getValue(props['Responsable']);
      if (managerRelation && Array.isArray(managerRelation) && managerRelation.length > 0) {
        // Look up the manager's Directus ID from our mapping
        const managerNotionId = managerRelation[0];
        const managerDirectusId = this.talentMapping.get(managerNotionId);
        if (managerDirectusId) {
          transformed.manager_id = managerDirectusId;
        }
      }
    }

    return transformed;
  }

  async loadToDirectus(items) {
    const spinner = ora('Loading data to Directus...').start();
    const batchSize = 50;
    
    try {
      // First pass: Create all talents without manager relationships
      spinner.text = 'First pass: Creating talent records...';
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        spinner.text = `First pass: ${i + batch.length}/${items.length}`;
        
        // Transform batch (first pass - no manager relationships)
        const transformedBatch = batch.map(item => {
          try {
            return this.transformItem(item, true);
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
        for (const item of transformedBatch) {
          try {
            const response = await axios.post(
              `${DIRECTUS_URL}/items/talents`,
              item,
              {
                headers: {
                  'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            
            // Store the mapping of Notion ID to Directus ID
            if (response.data?.data?.id) {
              this.talentMapping.set(item.notion_id, response.data.data.id);
            }
            
            this.stats.migrated++;
          } catch (error) {
            const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
            this.errors.push({
              title: item.full_name,
              error: errorMsg
            });
            this.stats.failed++;
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Second pass: Update manager relationships
      spinner.text = 'Second pass: Updating manager relationships...';
      let updatedCount = 0;
      
      for (const notionItem of items) {
        const props = notionItem.properties;
        const managerRelation = props['Manager']?.relation || 
                               props['Reports To']?.relation || 
                               props['Responsable']?.relation;
        
        if (managerRelation && managerRelation.length > 0) {
          const managerNotionId = managerRelation[0].id;
          const managerDirectusId = this.talentMapping.get(managerNotionId);
          const talentDirectusId = this.talentMapping.get(notionItem.id);
          
          if (managerDirectusId && talentDirectusId) {
            try {
              await axios.patch(
                `${DIRECTUS_URL}/items/talents/${talentDirectusId}`,
                { manager_id: managerDirectusId },
                {
                  headers: {
                    'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              updatedCount++;
            } catch (error) {
              await this.log(`Failed to update manager for ${talentDirectusId}: ${error.message}`, 'warn');
            }
          }
        }
      }

      if (updatedCount > 0) {
        await this.log(`Updated ${updatedCount} manager relationships`, 'success');
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
      
      if (directusCount === this.stats.total) {
        spinner.succeed(`Validation passed: ${directusCount} items in Directus (${managedCount} with managers)`);
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
      managerMappings: this.talentMapping.size,
      errors: this.errors
    };

    const reportPath = path.join(process.cwd(), 'migration/reports', `talents_${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    await this.log(`Report saved to: ${reportPath}`, 'info');
    
    return report;
  }

  async run() {
    console.log(chalk.cyan.bold('\n👥 TALENTS MIGRATION\n'));
    console.log(chalk.gray('DB-TALENTS → talents\n'));

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

      // Step 3: Load to Directus (with two-pass for self-referencing)
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
      console.log(chalk.cyan(`🔗 Manager mappings: ${this.talentMapping.size}`));

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
  const migration = new TalentsMigration();
  migration.run().catch(console.error);
}

module.exports = TalentsMigration;