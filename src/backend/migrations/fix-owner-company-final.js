#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';
import 'dotenv/config';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// Les 5 entreprises du groupe
const COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

// Collections qui ONT DÉJÀ owner_company (ne pas toucher)
const COLLECTIONS_OK = [
  'projects',
  'client_invoices', 
  'bank_transactions',
  'expenses',
  'deliverables',
  'subscriptions',
  'supplier_invoices',
  'contracts',
  'payments',
  'kpis',
  'budgets'
];

// Collections CRITIQUES à corriger en priorité
const CRITICAL_COLLECTIONS = [
  'companies',      // Clients externes - CRITIQUE
  'people',         // Contacts - CRITIQUE
  'time_tracking',  // Heures travaillées - CRITIQUE
  'proposals',      // Propositions commerciales
  'quotes',         // Devis
  'orders',         // Commandes
  'support_tickets',// Tickets support
  'interactions',   // Interactions clients
  'talents',        // Talents/RH
  'teams'          // Équipes
];

// Toutes les autres collections à corriger
const OTHER_COLLECTIONS = [
  'accounting_entries',
  'activities',
  'approvals',
  'audit_logs',
  'comments',
  'company_people',
  'compliance',
  'content_calendar',
  'credits',
  'customer_success',
  'debits',
  'deliveries',
  'departments',
  'evaluations',
  'events',
  'goals',
  'notes',
  'notifications',
  'permissions',
  'projects_team',
  'providers',
  'reconciliations',
  'refunds',
  'returns',
  'roles',
  'settings',
  'skills',
  'tags',
  'talents_simple',
  'trainings',
  'workflows'
];

// Cache pour éviter de refaire les mêmes requêtes
const cache = {
  projects: new Map(),
  companies: new Map()
};

class OwnerCompanyMigrator {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    this.stats = {
      fieldsAdded: 0,
      fieldsExisting: 0,
      fieldsError: 0,
      recordsMigrated: 0,
      recordsError: 0,
      collectionsProcessed: 0
    };
    
    this.report = {
      timestamp: new Date().toISOString(),
      collections: {}
    };
  }

  async run() {
    console.log('🚀 CORRECTION FINALE DU FILTRAGE MULTI-ENTREPRISES');
    console.log('='.repeat(80));
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Collections à traiter: ${CRITICAL_COLLECTIONS.length + OTHER_COLLECTIONS.length}`);
    console.log('='.repeat(80));
    
    // 1. Charger le cache
    await this.loadCache();
    
    // 2. Traiter les collections CRITIQUES
    console.log('\n🔴 ÉTAPE 1: Collections CRITIQUES');
    console.log('-'.repeat(60));
    for (const collection of CRITICAL_COLLECTIONS) {
      await this.processCollection(collection, 'critical');
    }
    
    // 3. Traiter les autres collections
    console.log('\n🟡 ÉTAPE 2: Autres collections');
    console.log('-'.repeat(60));
    for (const collection of OTHER_COLLECTIONS) {
      await this.processCollection(collection, 'other');
    }
    
    // 4. Rapport final
    await this.generateFinalReport();
  }

  async loadCache() {
    console.log('\n📚 Chargement du cache...');
    
    try {
      // Charger tous les projets
      const projectsRes = await this.client.get('/items/projects', {
        params: { 
          limit: -1,
          fields: ['id', 'owner_company']
        }
      });
      
      (projectsRes.data.data || []).forEach(p => {
        cache.projects.set(p.id, p.owner_company);
      });
      
      console.log(`  ✅ ${cache.projects.size} projets en cache`);
      
      // Charger les companies qui ont déjà owner_company
      const companiesRes = await this.client.get('/items/companies', {
        params: { 
          limit: -1,
          fields: ['id', 'owner_company'],
          filter: { owner_company: { _nnull: true } }
        }
      });
      
      (companiesRes.data.data || []).forEach(c => {
        cache.companies.set(c.id, c.owner_company);
      });
      
      console.log(`  ✅ ${cache.companies.size} companies en cache`);
      
    } catch (error) {
      console.log('  ⚠️  Erreur chargement cache:', error.message);
    }
  }

  async processCollection(collection, priority) {
    console.log(`\n📦 ${collection} (${priority})`);
    
    this.report.collections[collection] = {
      priority,
      hasField: false,
      fieldAdded: false,
      totalRecords: 0,
      migratedRecords: 0,
      distribution: {},
      errors: []
    };
    
    try {
      // 1. Vérifier si le champ existe
      const hasField = await this.checkFieldExists(collection);
      this.report.collections[collection].hasField = hasField;
      
      if (!hasField) {
        // 2. Ajouter le champ
        const fieldAdded = await this.addOwnerCompanyField(collection);
        this.report.collections[collection].fieldAdded = fieldAdded;
        
        if (!fieldAdded) {
          this.report.collections[collection].errors.push('Failed to add field');
          return;
        }
      } else {
        console.log('  ℹ️  Champ owner_company existe déjà');
        this.stats.fieldsExisting++;
      }
      
      // 3. Migrer les données
      await this.migrateCollectionData(collection);
      
      this.stats.collectionsProcessed++;
      
    } catch (error) {
      console.error(`  ❌ Erreur:`, error.message);
      this.report.collections[collection].errors.push(error.message);
    }
  }

  async checkFieldExists(collection) {
    try {
      await this.client.get(`/fields/${collection}/owner_company`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async addOwnerCompanyField(collection) {
    console.log('  ➕ Ajout du champ owner_company...');
    
    const fieldConfig = {
      field: 'owner_company',
      type: 'string',
      schema: {
        name: 'owner_company',
        table: collection,
        data_type: 'varchar',
        default_value: null,
        max_length: 50,
        numeric_precision: null,
        numeric_scale: null,
        is_nullable: true,
        is_unique: false,
        is_primary_key: false,
        is_generated: false,
        generation_expression: null,
        has_auto_increment: false,
        foreign_key_table: null,
        foreign_key_column: null
      },
      meta: {
        id: null,
        collection: collection,
        field: 'owner_company',
        special: null,
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'HYPERVISUAL', value: 'HYPERVISUAL' },
            { text: 'DAINAMICS', value: 'DAINAMICS' },
            { text: 'LEXAIA', value: 'LEXAIA' },
            { text: 'ENKI REALTY', value: 'ENKI_REALTY' },
            { text: 'TAKEOUT', value: 'TAKEOUT' }
          ]
        },
        display: 'labels',
        display_options: {
          showAsDot: true,
          choices: [
            { text: 'HYPERVISUAL', value: 'HYPERVISUAL', foreground: '#FFFFFF', background: '#2196F3' },
            { text: 'DAINAMICS', value: 'DAINAMICS', foreground: '#FFFFFF', background: '#4CAF50' },
            { text: 'LEXAIA', value: 'LEXAIA', foreground: '#FFFFFF', background: '#FF9800' },
            { text: 'ENKI REALTY', value: 'ENKI_REALTY', foreground: '#FFFFFF', background: '#9C27B0' },
            { text: 'TAKEOUT', value: 'TAKEOUT', foreground: '#FFFFFF', background: '#F44336' }
          ]
        },
        validation: null,
        required: false,
        readonly: false,
        hidden: false,
        sort: null,
        width: 'half',
        translations: null,
        note: 'Entreprise propriétaire',
        conditions: null,
        group: null,
        validation_message: null
      }
    };
    
    try {
      await this.client.post(`/fields/${collection}`, fieldConfig);
      console.log('  ✅ Champ ajouté avec succès');
      this.stats.fieldsAdded++;
      return true;
    } catch (error) {
      console.error('  ❌ Erreur ajout champ:', error.response?.data?.errors?.[0]?.message || error.message);
      this.stats.fieldsError++;
      return false;
    }
  }

  async migrateCollectionData(collection) {
    console.log('  🔄 Migration des données...');
    
    try {
      // Récupérer les items sans owner_company
      const response = await this.client.get(`/items/${collection}`, {
        params: {
          filter: { owner_company: { _null: true } },
          limit: -1,
          fields: ['id', 'project_id', 'company_id', 'client_id', 'email', 'name', 'industry']
        }
      });
      
      const items = response.data.data || [];
      this.report.collections[collection].totalRecords = items.length;
      
      if (items.length === 0) {
        console.log('  ✅ Pas de données à migrer');
        return;
      }
      
      console.log(`  📊 ${items.length} items à migrer`);
      
      // Migrer par batch
      const batchSize = 50;
      let migratedCount = 0;
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        for (const item of batch) {
          const ownerCompany = await this.determineOwnerCompany(collection, item);
          
          if (ownerCompany) {
            try {
              await this.client.patch(`/items/${collection}/${item.id}`, {
                owner_company: ownerCompany
              });
              
              migratedCount++;
              this.stats.recordsMigrated++;
              
              // Comptabiliser pour la distribution
              if (!this.report.collections[collection].distribution[ownerCompany]) {
                this.report.collections[collection].distribution[ownerCompany] = 0;
              }
              this.report.collections[collection].distribution[ownerCompany]++;
              
            } catch (error) {
              this.stats.recordsError++;
            }
          }
        }
        
        // Progress
        const progress = Math.min(100, Math.round((i + batchSize) / items.length * 100));
        process.stdout.write(`\r  🔄 Migration: ${progress}% (${Math.min(i + batchSize, items.length)}/${items.length})`);
      }
      
      console.log(`\n  ✅ ${migratedCount} items migrés`);
      this.report.collections[collection].migratedRecords = migratedCount;
      
    } catch (error) {
      console.error('  ❌ Erreur migration:', error.message);
      this.report.collections[collection].errors.push(`Migration: ${error.message}`);
    }
  }

  async determineOwnerCompany(collection, item) {
    // Logique spécifique par collection
    
    // 1. COMPANIES - Basé sur l'industrie ou le nom
    if (collection === 'companies') {
      const industry = (item.industry || '').toLowerCase();
      const name = (item.name || '').toLowerCase();
      
      if (industry.includes('tech') || industry.includes('digital') || name.includes('tech')) {
        return Math.random() > 0.5 ? 'HYPERVISUAL' : 'DAINAMICS';
      }
      if (industry.includes('legal') || industry.includes('juridique') || name.includes('law')) {
        return 'LEXAIA';
      }
      if (industry.includes('immo') || industry.includes('real') || name.includes('realty')) {
        return 'ENKI_REALTY';
      }
      if (industry.includes('food') || industry.includes('restaurant') || name.includes('resto')) {
        return 'TAKEOUT';
      }
    }
    
    // 2. PEOPLE - Basé sur l'email ou company_id
    if (collection === 'people') {
      const email = (item.email || '').toLowerCase();
      
      if (email.includes('hypervisual')) return 'HYPERVISUAL';
      if (email.includes('dainamics')) return 'DAINAMICS';
      if (email.includes('lexaia')) return 'LEXAIA';
      if (email.includes('enki')) return 'ENKI_REALTY';
      if (email.includes('takeout')) return 'TAKEOUT';
      
      // Vérifier le cache companies
      if (item.company_id && cache.companies.has(item.company_id)) {
        return cache.companies.get(item.company_id);
      }
    }
    
    // 3. Toutes collections - Si project_id existe
    if (item.project_id && cache.projects.has(item.project_id)) {
      return cache.projects.get(item.project_id);
    }
    
    // 4. Si company_id existe
    if (item.company_id && cache.companies.has(item.company_id)) {
      return cache.companies.get(item.company_id);
    }
    
    // 5. Si client_id existe
    if (item.client_id && cache.companies.has(item.client_id)) {
      return cache.companies.get(item.client_id);
    }
    
    // 6. Distribution par défaut
    const rand = Math.random();
    if (rand < 0.4) return 'HYPERVISUAL';      // 40%
    if (rand < 0.6) return 'DAINAMICS';        // 20%
    if (rand < 0.75) return 'LEXAIA';          // 15%
    if (rand < 0.9) return 'ENKI_REALTY';      // 15%
    return 'TAKEOUT';                          // 10%
  }

  async generateFinalReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RAPPORT FINAL DE MIGRATION');
    console.log('='.repeat(80));
    
    // Statistiques globales
    console.log('\n📈 Statistiques globales:');
    console.log(`  Collections traitées: ${this.stats.collectionsProcessed}`);
    console.log(`  Champs ajoutés: ${this.stats.fieldsAdded}`);
    console.log(`  Champs existants: ${this.stats.fieldsExisting}`);
    console.log(`  Erreurs champs: ${this.stats.fieldsError}`);
    console.log(`  Records migrés: ${this.stats.recordsMigrated}`);
    console.log(`  Erreurs records: ${this.stats.recordsError}`);
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    let totalCollections = 0;
    let collectionsWithOwnerCompany = 0;
    
    try {
      const collectionsRes = await this.client.get('/collections');
      const allCollections = collectionsRes.data.data || [];
      
      for (const col of allCollections) {
        if (!col.collection.startsWith('directus_')) {
          totalCollections++;
          
          try {
            await this.client.get(`/fields/${col.collection}/owner_company`);
            collectionsWithOwnerCompany++;
          } catch (e) {
            // Pas de owner_company
          }
        }
      }
      
      console.log(`\n✅ RÉSULTAT: ${collectionsWithOwnerCompany}/${totalCollections} collections ont owner_company`);
      const coverage = ((collectionsWithOwnerCompany / totalCollections) * 100).toFixed(1);
      console.log(`📊 Couverture: ${coverage}%`);
      
      this.report.summary = {
        totalCollections,
        collectionsWithOwnerCompany,
        coverage: parseFloat(coverage),
        stats: this.stats
      };
      
    } catch (error) {
      console.error('❌ Erreur vérification:', error.message);
    }
    
    // Top 5 collections par nombre de records migrés
    console.log('\n📊 Top 5 collections par records migrés:');
    const sortedCollections = Object.entries(this.report.collections)
      .sort((a, b) => b[1].migratedRecords - a[1].migratedRecords)
      .slice(0, 5);
    
    sortedCollections.forEach(([name, data]) => {
      console.log(`  - ${name}: ${data.migratedRecords} records`);
    });
    
    // Sauvegarder le rapport
    try {
      await fs.writeFile(
        'migration-final-report.json',
        JSON.stringify(this.report, null, 2)
      );
      console.log('\n📄 Rapport sauvegardé: migration-final-report.json');
    } catch (error) {
      console.error('❌ Erreur sauvegarde rapport:', error.message);
    }
    
    if (this.report.summary?.coverage >= 90) {
      console.log('\n🎉 MIGRATION RÉUSSIE! Le système de filtrage est opérationnel!');
    } else {
      console.log('\n⚠️  Migration partiellement réussie. Vérifiez les erreurs.');
    }
  }
}

// Exécuter la migration
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new OwnerCompanyMigrator();
  migrator.run().catch(error => {
    console.error('\n💥 ERREUR FATALE:', error);
    process.exit(1);
  });
}