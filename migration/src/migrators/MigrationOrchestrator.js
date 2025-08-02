/**
 * MigrationOrchestrator - Gestionnaire principal de migration Notion → Directus
 * 
 * Approche hybride : API directe pour migration + MCP pour standardisation
 * Gère la migration de 62 bases Notion vers 48 collections Directus
 */

const { createDirectus, rest, staticToken, createItems, readItems } = require('@directus/sdk');
const { Client: NotionClient } = require('@notionhq/client');
const chalk = require('chalk');
const ora = require('ora');

class MigrationOrchestrator {
  constructor(config = {}) {
    this.config = {
      batchSize: config.batchSize || 50,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      rateLimitDelay: config.rateLimitDelay || 100,
      ...config
    };

    this.stats = {
      totalBases: 62,
      targetCollections: 48,
      migratedItems: 0,
      failedItems: 0,
      startTime: null,
      endTime: null
    };

    this.initializeClients();
  }

  /**
   * Initialiser les clients Directus et Notion
   */
  async initializeClients() {
    // Client Directus avec optimisations migration
    this.directus = createDirectus(process.env.DIRECTUS_URL || 'http://localhost:8055')
      .with(rest())
      .with(staticToken(process.env.DIRECTUS_TOKEN));

    // Client Notion
    this.notion = new NotionClient({
      auth: process.env.NOTION_API_KEY
    });

    console.log(chalk.blue('🔌 Clients initialisés'));
  }

  /**
   * Mapping intelligent 62 bases Notion → 48 collections Directus
   */
  getCollectionMapping() {
    return {
      // === MODULE CRM & CONTACTS (5→4) ===
      'crm_contacts': {
        sources: [
          process.env.NOTION_DB_CONTACTS_ENTREPRISES,
          process.env.NOTION_DB_CONTACTS_PERSONNES
        ],
        target: 'companies',
        transform: 'mergeContacts'
      },
      'people': {
        sources: [process.env.NOTION_DB_CONTACTS_PERSONNES],
        target: 'people',
        transform: 'standardPerson'
      },
      'providers': {
        sources: [
          process.env.NOTION_DB_PRESTATAIRES,
          process.env.NOTION_DB_FREELANCES,
          process.env.NOTION_DB_AGENCES,
          process.env.NOTION_DB_FOURNISSEURS_IT,
          process.env.NOTION_DB_CONSULTANTS
        ],
        target: 'providers',
        transform: 'unifyProviders'
      },
      'customer_success': {
        sources: [process.env.NOTION_DB_CUSTOMER_SUCCESS],
        target: 'customer_success',
        transform: 'standard'
      },

      // === MODULE FINANCE (9→6) ===
      'invoices': {
        sources: [
          process.env.NOTION_DB_FACTURES_CLIENTS,
          process.env.NOTION_DB_FACTURES_FOURNISSEURS
        ],
        target: 'invoices',
        transform: 'mergeInvoices'
      },
      'expenses': {
        sources: [process.env.NOTION_DB_NOTES_FRAIS],
        target: 'expenses',
        transform: 'standard'
      },
      'subscriptions': {
        sources: [process.env.NOTION_DB_SUIVI_ABONNEMENTS],
        target: 'subscriptions',
        transform: 'standard'
      },
      'bank_transactions': {
        sources: [
          process.env.NOTION_DB_TRANSACTIONS_BANCAIRES,
          process.env.NOTION_DB_COMPTES_BANCAIRES
        ],
        target: 'bank_transactions',
        transform: 'mergeBanking'
      },
      'accounting': {
        sources: [
          process.env.NOTION_DB_ECRITURES_COMPTABLES,
          process.env.NOTION_DB_TVA_DECLARATIONS,
          process.env.NOTION_DB_PREVISIONS_TRESORERIE
        ],
        target: 'accounting_entries',
        transform: 'consolidateAccounting'
      },

      // === MODULE PROJETS (3→3) ===
      'projects': {
        sources: [process.env.NOTION_DB_PROJETS],
        target: 'projects',
        transform: 'standard'
      },
      'deliverables': {
        sources: [process.env.NOTION_DB_LIVRAISONS],
        target: 'deliverables',
        transform: 'standard'
      },
      'support': {
        sources: [process.env.NOTION_DB_TICKETS_SUPPORT],
        target: 'support_tickets',
        transform: 'standard'
      }

      // ... Continuer avec les autres modules
    };
  }

  /**
   * Exécuter la migration complète
   */
  async execute() {
    console.log(chalk.bold.blue('\n🚀 Démarrage migration Notion → Directus\n'));
    console.log(chalk.yellow(`📊 ${this.stats.totalBases} bases Notion → ${this.stats.targetCollections} collections Directus\n`));

    this.stats.startTime = new Date();
    const mapping = this.getCollectionMapping();
    const results = [];

    for (const [module, config] of Object.entries(mapping)) {
      console.log(chalk.cyan(`\n📦 Module: ${module}`));
      
      try {
        const result = await this.migrateModule(module, config);
        results.push(result);
      } catch (error) {
        console.error(chalk.red(`❌ Échec module ${module}:`, error.message));
        results.push({ module, status: 'failed', error: error.message });
      }
    }

    this.stats.endTime = new Date();
    this.displaySummary(results);
    
    return results;
  }

  /**
   * Migrer un module spécifique
   */
  async migrateModule(moduleName, config) {
    const spinner = ora(`Migration ${moduleName}...`).start();
    const moduleStats = {
      module: moduleName,
      totalItems: 0,
      migrated: 0,
      failed: 0,
      startTime: new Date()
    };

    try {
      // 1. Extraire les données de toutes les sources Notion
      const notionData = await this.extractNotionData(config.sources);
      moduleStats.totalItems = notionData.length;
      
      spinner.text = `Transformation de ${notionData.length} items...`;
      
      // 2. Transformer selon la stratégie définie
      const transformedData = await this.transformData(
        notionData, 
        config.transform
      );
      
      spinner.text = `Migration vers ${config.target}...`;
      
      // 3. Migrer par lots vers Directus
      const migrationResult = await this.migrateToDirectus(
        transformedData,
        config.target
      );
      
      moduleStats.migrated = migrationResult.success;
      moduleStats.failed = migrationResult.failed;
      
      // 4. Valider la migration
      const isValid = await this.validateMigration(
        config.target,
        moduleStats.migrated
      );
      
      moduleStats.validated = isValid;
      moduleStats.endTime = new Date();
      moduleStats.duration = moduleStats.endTime - moduleStats.startTime;
      
      spinner.succeed(
        `✅ ${moduleName}: ${moduleStats.migrated}/${moduleStats.totalItems} migrés`
      );
      
      return moduleStats;
      
    } catch (error) {
      spinner.fail(`❌ ${moduleName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extraire les données depuis Notion
   */
  async extractNotionData(sourceIds) {
    const allData = [];
    
    for (const databaseId of sourceIds) {
      if (!databaseId) continue;
      
      try {
        let hasMore = true;
        let cursor = undefined;
        
        while (hasMore) {
          const response = await this.notion.databases.query({
            database_id: databaseId,
            page_size: 100,
            start_cursor: cursor
          });
          
          allData.push(...response.results);
          hasMore = response.has_more;
          cursor = response.next_cursor;
          
          // Respecter le rate limiting Notion
          await this.delay(50);
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ Impossible d'accéder à ${databaseId}`));
      }
    }
    
    return allData;
  }

  /**
   * Transformer les données selon la stratégie
   */
  async transformData(notionData, strategy) {
    const transformStrategies = {
      'standard': this.transformStandard.bind(this),
      'mergeContacts': this.transformMergeContacts.bind(this),
      'unifyProviders': this.transformUnifyProviders.bind(this),
      'mergeInvoices': this.transformMergeInvoices.bind(this),
      'mergeBanking': this.transformMergeBanking.bind(this),
      'consolidateAccounting': this.transformConsolidateAccounting.bind(this)
    };

    const transformer = transformStrategies[strategy] || transformStrategies['standard'];
    return transformer(notionData);
  }

  /**
   * Transformation standard (1:1)
   */
  transformStandard(notionData) {
    return notionData.map(page => {
      const item = { 
        notion_id: page.id,
        date_created: page.created_time,
        date_updated: page.last_edited_time
      };
      
      // Extraire toutes les propriétés
      for (const [key, prop] of Object.entries(page.properties)) {
        item[this.normalizeFieldName(key)] = this.extractPropertyValue(prop);
      }
      
      return item;
    });
  }

  /**
   * Fusionner contacts entreprises et personnes
   */
  transformMergeContacts(notionData) {
    const companies = [];
    const people = [];
    
    notionData.forEach(page => {
      const type = this.detectContactType(page);
      const transformed = this.transformStandard([page])[0];
      
      if (type === 'company') {
        companies.push({
          ...transformed,
          type: 'company'
        });
      } else {
        people.push({
          ...transformed,
          type: 'person'
        });
      }
    });
    
    return { companies, people };
  }

  /**
   * Migration par lots vers Directus
   */
  async migrateToDirectus(data, collection) {
    const results = { success: 0, failed: 0, errors: [] };
    
    // Gérer les données fusionnées (plusieurs collections)
    if (data.companies && data.people) {
      const companiesResult = await this.migrateBatch(data.companies, 'companies');
      const peopleResult = await this.migrateBatch(data.people, 'people');
      
      results.success = companiesResult.success + peopleResult.success;
      results.failed = companiesResult.failed + peopleResult.failed;
      results.errors = [...companiesResult.errors, ...peopleResult.errors];
    } else {
      return await this.migrateBatch(data, collection);
    }
    
    return results;
  }

  /**
   * Migrer un lot de données
   */
  async migrateBatch(data, collection) {
    const results = { success: 0, failed: 0, errors: [] };
    
    for (let i = 0; i < data.length; i += this.config.batchSize) {
      const batch = data.slice(i, i + this.config.batchSize);
      
      for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
        try {
          await this.directus.request(createItems(collection, batch));
          results.success += batch.length;
          this.stats.migratedItems += batch.length;
          
          // Respecter le rate limiting
          await this.delay(this.config.rateLimitDelay);
          break;
          
        } catch (error) {
          if (attempt === this.config.retryAttempts - 1) {
            results.failed += batch.length;
            this.stats.failedItems += batch.length;
            results.errors.push({
              batch: `${i}-${i + batch.length}`,
              error: error.message
            });
          } else {
            await this.delay(this.config.retryDelay * (attempt + 1));
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Valider la migration
   */
  async validateMigration(collection, expectedCount) {
    try {
      const items = await this.directus.request(
        readItems(collection, {
          aggregate: { count: '*' }
        })
      );
      
      const actualCount = items[0]?.count || 0;
      const isValid = actualCount >= expectedCount * 0.95; // 95% de tolérance
      
      if (!isValid) {
        console.warn(chalk.yellow(
          `⚠️ Validation ${collection}: ${actualCount}/${expectedCount} items`
        ));
      }
      
      return isValid;
    } catch (error) {
      console.error(chalk.red(`❌ Erreur validation ${collection}:`, error.message));
      return false;
    }
  }

  /**
   * Afficher le résumé de migration
   */
  displaySummary(results) {
    const duration = (this.stats.endTime - this.stats.startTime) / 1000;
    const successCount = results.filter(r => r.migrated > 0).length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    console.log(chalk.bold.blue('\n📊 RÉSUMÉ MIGRATION\n'));
    console.log(chalk.green(`✅ Modules réussis: ${successCount}/${results.length}`));
    console.log(chalk.yellow(`⚠️ Modules échoués: ${failedCount}`));
    console.log(chalk.cyan(`📦 Items migrés: ${this.stats.migratedItems}`));
    console.log(chalk.red(`❌ Items échoués: ${this.stats.failedItems}`));
    console.log(chalk.magenta(`⏱️ Durée totale: ${duration.toFixed(2)}s`));
    console.log(chalk.gray(`📈 Vitesse: ${(this.stats.migratedItems / duration).toFixed(2)} items/s`));
    
    // Détails par module
    console.log(chalk.bold.blue('\n📋 DÉTAILS PAR MODULE\n'));
    results.forEach(result => {
      if (result.status === 'failed') {
        console.log(chalk.red(`❌ ${result.module}: ${result.error}`));
      } else {
        const successRate = ((result.migrated / result.totalItems) * 100).toFixed(1);
        const statusIcon = result.validated ? '✅' : '⚠️';
        console.log(
          `${statusIcon} ${result.module}: ${result.migrated}/${result.totalItems} (${successRate}%)`
        );
      }
    });
  }

  // === Méthodes utilitaires ===

  normalizeFieldName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  extractPropertyValue(property) {
    switch (property.type) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'number':
        return property.number;
      case 'select':
        return property.select?.name;
      case 'multi_select':
        return property.multi_select?.map(s => s.name);
      case 'date':
        return property.date?.start;
      case 'checkbox':
        return property.checkbox;
      case 'url':
        return property.url;
      case 'email':
        return property.email;
      case 'phone_number':
        return property.phone_number;
      case 'relation':
        return property.relation?.map(r => r.id);
      case 'files':
        return property.files?.map(f => f.file?.url || f.external?.url);
      default:
        return null;
    }
  }

  detectContactType(page) {
    const hasCompanyFields = page.properties.Domain || 
                           page.properties.Industry || 
                           page.properties['Company Name'];
    return hasCompanyFields ? 'company' : 'person';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Stratégies de transformation additionnelles
  transformUnifyProviders(notionData) {
    return this.transformStandard(notionData).map(item => ({
      ...item,
      provider_type: this.detectProviderType(item),
      unified_rating: this.normalizeRating(item)
    }));
  }

  transformMergeInvoices(notionData) {
    return this.transformStandard(notionData).map(item => ({
      ...item,
      invoice_type: this.detectInvoiceType(item),
      unified_status: this.normalizeInvoiceStatus(item)
    }));
  }

  transformMergeBanking(notionData) {
    return this.transformStandard(notionData).map(item => ({
      ...item,
      transaction_type: item.amount < 0 ? 'debit' : 'credit',
      account_normalized: this.normalizeAccount(item)
    }));
  }

  transformConsolidateAccounting(notionData) {
    return this.transformStandard(notionData).map(item => ({
      ...item,
      accounting_category: this.detectAccountingCategory(item),
      fiscal_year: new Date(item.date_created).getFullYear()
    }));
  }

  detectProviderType(item) {
    if (item.freelance) return 'freelance';
    if (item.agency) return 'agency';
    if (item.consultant) return 'consultant';
    return 'supplier';
  }

  normalizeRating(item) {
    return item.rating || item.score || item.evaluation || 0;
  }

  detectInvoiceType(item) {
    return item.client ? 'client' : 'supplier';
  }

  normalizeInvoiceStatus(item) {
    const status = (item.status || '').toLowerCase();
    if (status.includes('paid') || status.includes('payé')) return 'paid';
    if (status.includes('sent') || status.includes('envoyé')) return 'sent';
    if (status.includes('draft') || status.includes('brouillon')) return 'draft';
    if (status.includes('overdue') || status.includes('retard')) return 'overdue';
    return 'pending';
  }

  normalizeAccount(item) {
    return item.account || item.bank_account || 'main';
  }

  detectAccountingCategory(item) {
    if (item.tva || item.vat) return 'vat';
    if (item.forecast || item.prevision) return 'forecast';
    return 'entry';
  }
}

module.exports = MigrationOrchestrator;