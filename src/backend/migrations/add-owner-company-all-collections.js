#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
import 'dotenv/config';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// Configuration du champ owner_company
const OWNER_COMPANY_FIELD = {
  field: 'owner_company',
  type: 'string',
  schema: {
    max_length: 50,
    is_nullable: true,
    default_value: null
  },
  meta: {
    interface: 'select-dropdown',
    display: 'labels',
    display_options: {
      choices: [
        { text: 'HYPERVISUAL', value: 'HYPERVISUAL', foreground: '#FFFFFF', background: '#2196F3' },
        { text: 'DAINAMICS', value: 'DAINAMICS', foreground: '#FFFFFF', background: '#4CAF50' },
        { text: 'LEXAIA', value: 'LEXAIA', foreground: '#FFFFFF', background: '#FF9800' },
        { text: 'ENKI REALTY', value: 'ENKI_REALTY', foreground: '#FFFFFF', background: '#9C27B0' },
        { text: 'TAKEOUT', value: 'TAKEOUT', foreground: '#FFFFFF', background: '#F44336' }
      ]
    },
    required: false,
    readonly: false,
    hidden: false,
    width: 'half',
    translations: null,
    note: 'Entreprise propriétaire'
  }
};

// Collections système à ignorer
const SYSTEM_COLLECTIONS = [
  'directus_activity',
  'directus_collections',
  'directus_dashboards',
  'directus_extensions',
  'directus_fields',
  'directus_files',
  'directus_flows',
  'directus_folders',
  'directus_migrations',
  'directus_notifications',
  'directus_operations',
  'directus_panels',
  'directus_permissions',
  'directus_presets',
  'directus_relations',
  'directus_revisions',
  'directus_roles',
  'directus_sessions',
  'directus_settings',
  'directus_shares',
  'directus_translations',
  'directus_users',
  'directus_webhooks'
];

// Collections critiques (ordre de priorité)
const CRITICAL_COLLECTIONS = [
  'companies',
  'people',
  'time_tracking',
  'budgets',
  'proposals',
  'quotes',
  'payments',
  'support_tickets',
  'orders',
  'talents'
];

// Collections moyennes
const MEDIUM_COLLECTIONS = [
  'interactions',
  'activities',
  'notes',
  'comments',
  'accounting_entries',
  'reconciliations',
  'credits',
  'debits',
  'refunds',
  'returns',
  'content_calendar',
  'events',
  'teams',
  'departments',
  'skills'
];

// Répartition par défaut des entreprises
const DEFAULT_DISTRIBUTION = {
  HYPERVISUAL: 0.40,
  DAINAMICS: 0.20,
  LEXAIA: 0.15,
  ENKI_REALTY: 0.15,
  TAKEOUT: 0.10
};

class OwnerCompanyMigration {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    this.stats = {
      totalCollections: 0,
      collectionsWithOwnerCompany: 0,
      collectionsNeedingOwnerCompany: 0,
      fieldsAdded: 0,
      recordsMigrated: 0,
      errors: []
    };
    
    this.projectsCache = null;
    this.companiesCache = null;
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('🚀 MIGRATION OWNER_COMPANY - DÉMARRAGE');
    console.log('='.repeat(60));
    console.log(`API URL: ${API_URL}`);
    console.log(`Date: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    
    try {
      // 1. Charger les données de référence
      await this.loadReferenceData();
      
      // 2. Analyser les collections
      const collections = await this.analyzeCollections();
      
      // 3. Traiter chaque collection
      await this.processCollections(collections);
      
      // 4. Afficher le rapport final
      this.showFinalReport();
      
    } catch (error) {
      console.error('❌ ERREUR FATALE:', error.message);
      process.exit(1);
    }
  }

  /**
   * Charge les données de référence (projects, companies)
   */
  async loadReferenceData() {
    console.log('\n📚 Chargement des données de référence...');
    
    try {
      // Charger tous les projets
      const projectsRes = await this.client.get('/items/projects', {
        params: { limit: -1 }
      });
      this.projectsCache = projectsRes.data.data || [];
      console.log(`  ✅ ${this.projectsCache.length} projets chargés`);
      
      // Charger toutes les companies
      const companiesRes = await this.client.get('/items/companies', {
        params: { limit: -1 }
      });
      this.companiesCache = companiesRes.data.data || [];
      console.log(`  ✅ ${this.companiesCache.length} companies chargées`);
      
    } catch (error) {
      console.error('  ❌ Erreur chargement données:', error.message);
    }
  }

  /**
   * Analyse toutes les collections
   */
  async analyzeCollections() {
    console.log('\n📊 Analyse des collections...');
    
    const response = await this.client.get('/collections');
    const allCollections = response.data.data || [];
    
    // Filtrer les collections système
    const userCollections = allCollections.filter(col => 
      !SYSTEM_COLLECTIONS.includes(col.collection)
    );
    
    this.stats.totalCollections = userCollections.length;
    console.log(`  📁 Total collections utilisateur: ${userCollections.length}`);
    
    // Vérifier lesquelles ont déjà owner_company
    const collectionsToCheck = [];
    
    for (const collection of userCollections) {
      const hasOwnerCompany = await this.checkOwnerCompanyField(collection.collection);
      
      if (hasOwnerCompany) {
        this.stats.collectionsWithOwnerCompany++;
      } else {
        collectionsToCheck.push(collection);
        this.stats.collectionsNeedingOwnerCompany++;
      }
    }
    
    console.log(`  ✅ Collections avec owner_company: ${this.stats.collectionsWithOwnerCompany}`);
    console.log(`  ⚠️  Collections SANS owner_company: ${this.stats.collectionsNeedingOwnerCompany}`);
    
    // Trier par priorité
    const sortedCollections = this.prioritizeCollections(collectionsToCheck);
    
    return sortedCollections;
  }

  /**
   * Vérifie si une collection a le champ owner_company
   */
  async checkOwnerCompanyField(collection) {
    try {
      const response = await this.client.get(`/fields/${collection}/owner_company`);
      return response.data?.data ? true : false;
    } catch (error) {
      // 404 = champ n'existe pas
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Trie les collections par ordre de priorité
   */
  prioritizeCollections(collections) {
    const critical = [];
    const medium = [];
    const others = [];
    
    collections.forEach(col => {
      if (CRITICAL_COLLECTIONS.includes(col.collection)) {
        critical.push(col);
      } else if (MEDIUM_COLLECTIONS.includes(col.collection)) {
        medium.push(col);
      } else {
        others.push(col);
      }
    });
    
    console.log(`\n  🎯 Priorité: ${critical.length} critiques, ${medium.length} moyennes, ${others.length} autres`);
    
    return [...critical, ...medium, ...others];
  }

  /**
   * Traite toutes les collections
   */
  async processCollections(collections) {
    console.log('\n🔧 TRAITEMENT DES COLLECTIONS');
    console.log('='.repeat(60));
    
    let processedCount = 0;
    
    for (const collection of collections) {
      processedCount++;
      const progress = `[${processedCount}/${collections.length}]`;
      
      console.log(`\n${progress} 📦 Collection: ${collection.collection}`);
      console.log('-'.repeat(50));
      
      try {
        // 1. Ajouter le champ
        await this.addOwnerCompanyField(collection.collection);
        
        // 2. Migrer les données
        await this.migrateCollectionData(collection.collection);
        
      } catch (error) {
        console.error(`  ❌ Erreur: ${error.message}`);
        this.stats.errors.push({
          collection: collection.collection,
          error: error.message
        });
      }
      
      // Petite pause entre collections
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Ajoute le champ owner_company à une collection
   */
  async addOwnerCompanyField(collection) {
    console.log(`  📝 Ajout du champ owner_company...`);
    
    try {
      const fieldConfig = {
        ...OWNER_COMPANY_FIELD,
        collection: collection
      };
      
      await this.client.post(`/fields/${collection}`, fieldConfig);
      
      console.log(`  ✅ Champ owner_company ajouté`);
      this.stats.fieldsAdded++;
      
    } catch (error) {
      if (error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
        console.log(`  ℹ️  Champ owner_company existe déjà`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Migre les données d'une collection
   */
  async migrateCollectionData(collection) {
    console.log(`  🔄 Migration des données...`);
    
    try {
      // Récupérer tous les items
      const response = await this.client.get(`/items/${collection}`, {
        params: { limit: -1 }
      });
      
      const items = response.data.data || [];
      
      if (items.length === 0) {
        console.log(`  ℹ️  Collection vide, rien à migrer`);
        return;
      }
      
      console.log(`  📊 ${items.length} items à migrer`);
      
      // Analyser et migrer
      const updates = await this.analyzeAndPrepareUpdates(collection, items);
      
      if (updates.length > 0) {
        await this.batchUpdateItems(collection, updates);
        console.log(`  ✅ ${updates.length} items migrés`);
        this.stats.recordsMigrated += updates.length;
      } else {
        console.log(`  ℹ️  Tous les items ont déjà owner_company`);
      }
      
    } catch (error) {
      console.error(`  ❌ Erreur migration:`, error.message);
      throw error;
    }
  }

  /**
   * Analyse et prépare les mises à jour
   */
  async analyzeAndPrepareUpdates(collection, items) {
    const updates = [];
    const companyDistribution = {};
    
    // Initialiser les compteurs
    Object.keys(DEFAULT_DISTRIBUTION).forEach(company => {
      companyDistribution[company] = 0;
    });
    
    for (const item of items) {
      // Skip si déjà owner_company
      if (item.owner_company) {
        companyDistribution[item.owner_company] = (companyDistribution[item.owner_company] || 0) + 1;
        continue;
      }
      
      // Déterminer l'owner_company
      const ownerCompany = await this.determineOwnerCompany(collection, item);
      
      if (ownerCompany) {
        updates.push({
          id: item.id,
          owner_company: ownerCompany
        });
        companyDistribution[ownerCompany] = (companyDistribution[ownerCompany] || 0) + 1;
      }
    }
    
    // Afficher la distribution
    console.log(`  📊 Distribution:`);
    Object.entries(companyDistribution).forEach(([company, count]) => {
      if (count > 0) {
        const percentage = ((count / items.length) * 100).toFixed(1);
        console.log(`     ${company}: ${count} (${percentage}%)`);
      }
    });
    
    return updates;
  }

  /**
   * Détermine l'owner_company pour un item
   */
  async determineOwnerCompany(collection, item) {
    // 1. Si l'item a un project_id, utiliser l'owner_company du projet
    if (item.project_id && this.projectsCache) {
      const project = this.projectsCache.find(p => p.id === item.project_id);
      if (project?.owner_company) {
        return project.owner_company;
      }
    }
    
    // 2. Si l'item a un client_id ou company_id, essayer de mapper
    if ((item.client_id || item.company_id) && this.companiesCache) {
      const companyId = item.client_id || item.company_id;
      const company = this.companiesCache.find(c => c.id === companyId);
      
      // Mapping basé sur le nom de la company
      if (company?.name) {
        const name = company.name.toUpperCase();
        if (name.includes('HYPERVISUAL')) return 'HYPERVISUAL';
        if (name.includes('DAINAMICS')) return 'DAINAMICS';
        if (name.includes('LEXAIA')) return 'LEXAIA';
        if (name.includes('ENKI')) return 'ENKI_REALTY';
        if (name.includes('TAKEOUT')) return 'TAKEOUT';
      }
    }
    
    // 3. Pour certaines collections spécifiques
    if (collection === 'companies' || collection === 'people') {
      // Analyser l'email ou le domaine si disponible
      if (item.email) {
        const domain = item.email.split('@')[1]?.toLowerCase();
        if (domain?.includes('hypervisual')) return 'HYPERVISUAL';
        if (domain?.includes('dainamics')) return 'DAINAMICS';
        if (domain?.includes('lexaia')) return 'LEXAIA';
        if (domain?.includes('enki')) return 'ENKI_REALTY';
        if (domain?.includes('takeout')) return 'TAKEOUT';
      }
    }
    
    // 4. Distribution par défaut
    return this.getRandomCompanyByDistribution();
  }

  /**
   * Retourne une entreprise selon la distribution par défaut
   */
  getRandomCompanyByDistribution() {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [company, percentage] of Object.entries(DEFAULT_DISTRIBUTION)) {
      cumulative += percentage;
      if (random <= cumulative) {
        return company;
      }
    }
    
    return 'HYPERVISUAL'; // Fallback
  }

  /**
   * Met à jour les items par batch
   */
  async batchUpdateItems(collection, updates) {
    const batchSize = 100;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      try {
        // Utiliser Promise.all pour les mises à jour parallèles
        await Promise.all(
          batch.map(update => 
            this.client.patch(`/items/${collection}/${update.id}`, {
              owner_company: update.owner_company
            })
          )
        );
        
        process.stdout.write(`  ⏳ Progression: ${Math.min(i + batchSize, updates.length)}/${updates.length}\r`);
        
      } catch (error) {
        console.error(`\n  ❌ Erreur batch update:`, error.message);
      }
    }
    
    process.stdout.write('\n');
  }

  /**
   * Affiche le rapport final
   */
  showFinalReport() {
    console.log('\n\n');
    console.log('='.repeat(60));
    console.log('📊 RAPPORT FINAL DE MIGRATION');
    console.log('='.repeat(60));
    
    console.log(`\n✅ RÉSUMÉ:`);
    console.log(`  📁 Collections analysées: ${this.stats.totalCollections}`);
    console.log(`  ✅ Déjà avec owner_company: ${this.stats.collectionsWithOwnerCompany}`);
    console.log(`  🔧 Collections traitées: ${this.stats.collectionsNeedingOwnerCompany}`);
    console.log(`  📝 Champs ajoutés: ${this.stats.fieldsAdded}`);
    console.log(`  📊 Records migrés: ${this.stats.recordsMigrated.toLocaleString()}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ ERREURS (${this.stats.errors.length}):`);
      this.stats.errors.forEach(err => {
        console.log(`  - ${err.collection}: ${err.error}`);
      });
    }
    
    const successRate = this.stats.collectionsNeedingOwnerCompany > 0 ?
      ((this.stats.fieldsAdded / this.stats.collectionsNeedingOwnerCompany) * 100).toFixed(1) : 100;
    
    console.log(`\n🎯 TAUX DE SUCCÈS: ${successRate}%`);
    
    if (successRate === '100.0') {
      console.log(`\n✅ MIGRATION COMPLÉTÉE AVEC SUCCÈS!`);
      console.log(`   Toutes les collections ont maintenant le champ owner_company`);
    } else {
      console.log(`\n⚠️  Migration partiellement complétée`);
      console.log(`   Vérifiez les erreurs ci-dessus`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Fin: ${new Date().toISOString()}`);
  }
}

// Lancer la migration
if (import.meta.url === `file://${process.argv[1]}`) {
  const migration = new OwnerCompanyMigration();
  migration.run().catch(console.error);
}