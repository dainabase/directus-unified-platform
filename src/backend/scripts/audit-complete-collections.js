import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_URL = 'http://localhost:8055';
import 'dotenv/config';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// Liste complète des 62 collections
const ALL_COLLECTIONS = [
  'accounting_entries', 'activities', 'approvals', 'audit_logs',
  'bank_transactions', 'budgets', 'client_invoices', 'comments',
  'companies', 'company_people', 'compliance', 'content_calendar',
  'contracts', 'credits', 'customer_success', 'debits',
  'deliverables', 'deliveries', 'departments', 'evaluations',
  'events', 'expenses', 'goals', 'interactions',
  'kpis', 'notes', 'notifications', 'orders',
  'owner_companies', 'payments', 'people', 'permissions',
  'projects', 'projects_team', 'proposals', 'providers',
  'quotes', 'reconciliations', 'refunds', 'returns',
  'roles', 'settings', 'skills', 'subscriptions',
  'supplier_invoices', 'support_tickets', 'tags', 'talents',
  'talents_simple', 'teams', 'time_tracking', 'trainings',
  'workflows'
];

// Champs critiques pour le Dashboard CEO
const CRITICAL_FIELDS = {
  projects: ['name', 'status', 'budget', 'start_date', 'end_date', 'client_id', 'owner_company'],
  client_invoices: ['invoice_number', 'amount', 'status', 'date_created', 'project_id', 'owner_company'],
  bank_transactions: ['transaction_date', 'amount', 'transaction_type', 'description', 'owner_company'],
  expenses: ['amount', 'expense_date', 'category', 'description', 'project_id', 'owner_company'],
  deliverables: ['title', 'status', 'due_date', 'project_id', 'assigned_to', 'owner_company'],
  companies: ['name', 'industry', 'is_client', 'owner_company'],
  people: ['first_name', 'last_name', 'email', 'company_id', 'owner_company'],
  kpis: ['metric_name', 'value', 'date', 'owner_company'],
  budgets: ['title', 'amount', 'period', 'owner_company'],
  payments: ['amount', 'payment_date', 'invoice_id', 'owner_company']
};

// Relations critiques
const CRITICAL_RELATIONS = {
  projects: {
    client_id: 'companies',
    project_manager_id: 'people',
    company_id: 'companies'
  },
  client_invoices: {
    project_id: 'projects',
    company_id: 'companies',
    contact_id: 'people'
  },
  deliverables: {
    project_id: 'projects',
    assigned_to: 'people',
    reviewed_by: 'people'
  },
  people: {
    company_id: 'companies',
    manager_id: 'people',
    department_id: 'departments',
    team_id: 'teams'
  },
  payments: {
    invoice_id: 'client_invoices',
    supplier_invoice_id: 'supplier_invoices'
  }
};

// Entreprises pour le filtrage
const OWNER_COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

// Client Axios
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

class DirectusAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total_collections: ALL_COLLECTIONS.length,
        accessible_collections: 0,
        collections_with_errors: [],
        collections_with_owner_company: 0,
        collections_missing_owner_company: [],
        critical_issues: []
      },
      collections: {},
      relations_matrix: {},
      recommendations: []
    };
  }

  async auditCollection(collectionName) {
    console.log(`\n📊 Auditing collection: ${collectionName}`);
    
    const collectionResult = {
      accessible: false,
      error: null,
      record_count: 0,
      has_owner_company: false,
      fields: [],
      missing_fields: [],
      relations: {},
      broken_relations: [],
      data_distribution: {
        HYPERVISUAL: 0,
        DAINAMICS: 0,
        LEXAIA: 0,
        ENKI_REALTY: 0,
        TAKEOUT: 0,
        null: 0
      }
    };

    try {
      // 1. Vérifier l'accès à la collection
      const itemsResponse = await client.get(`/items/${collectionName}?limit=1`);
      collectionResult.accessible = true;
      this.results.summary.accessible_collections++;

      // 2. Compter les enregistrements
      try {
        const countResponse = await client.get(`/items/${collectionName}?aggregate[count]=*`);
        collectionResult.record_count = countResponse.data.data[0]?.count || 0;
      } catch (e) {
        console.log(`   ⚠️  Impossible de compter les enregistrements`);
      }

      // 3. Récupérer les champs
      try {
        const fieldsResponse = await client.get(`/fields/${collectionName}`);
        collectionResult.fields = fieldsResponse.data.data.map(f => f.field);
        
        // Vérifier owner_company
        if (collectionResult.fields.includes('owner_company')) {
          collectionResult.has_owner_company = true;
          this.results.summary.collections_with_owner_company++;
        } else {
          this.results.summary.collections_missing_owner_company.push(collectionName);
        }

        // Vérifier les champs critiques
        if (CRITICAL_FIELDS[collectionName]) {
          const missingFields = CRITICAL_FIELDS[collectionName].filter(
            field => !collectionResult.fields.includes(field)
          );
          if (missingFields.length > 0) {
            collectionResult.missing_fields = missingFields;
            this.results.summary.critical_issues.push({
              collection: collectionName,
              issue: 'missing_critical_fields',
              fields: missingFields
            });
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Impossible de récupérer les champs`);
      }

      // 4. Vérifier les relations
      try {
        const relationsResponse = await client.get(`/relations?filter[many_collection][_eq]=${collectionName}`);
        const relations = relationsResponse.data.data;
        
        relations.forEach(rel => {
          collectionResult.relations[rel.many_field] = {
            collection: rel.one_collection,
            field: rel.one_field
          };
        });

        // Vérifier les relations critiques
        if (CRITICAL_RELATIONS[collectionName]) {
          for (const [field, targetCollection] of Object.entries(CRITICAL_RELATIONS[collectionName])) {
            const relationExists = relations.some(
              rel => rel.many_field === field && rel.one_collection === targetCollection
            );
            if (!relationExists && collectionResult.fields.includes(field)) {
              collectionResult.broken_relations.push({
                field,
                expected_target: targetCollection
              });
            }
          }
        }
      } catch (e) {
        console.log(`   ⚠️  Impossible de vérifier les relations`);
      }

      // 5. Analyser la distribution des données par owner_company
      if (collectionResult.has_owner_company && collectionResult.record_count > 0) {
        try {
          for (const company of OWNER_COMPANIES) {
            const companyResponse = await client.get(
              `/items/${collectionName}?filter[owner_company][_eq]=${company}&aggregate[count]=*`
            );
            collectionResult.data_distribution[company] = companyResponse.data.data[0]?.count || 0;
          }
          
          // Compter les enregistrements sans owner_company
          const nullResponse = await client.get(
            `/items/${collectionName}?filter[owner_company][_null]=true&aggregate[count]=*`
          );
          collectionResult.data_distribution.null = nullResponse.data.data[0]?.count || 0;
        } catch (e) {
          console.log(`   ⚠️  Impossible d'analyser la distribution des données`);
        }
      }

      console.log(`   ✅ Accessible - ${collectionResult.record_count} enregistrements`);
      
    } catch (error) {
      collectionResult.accessible = false;
      collectionResult.error = error.response?.data?.errors?.[0]?.message || error.message;
      this.results.summary.collections_with_errors.push({
        collection: collectionName,
        error: collectionResult.error
      });
      console.log(`   ❌ Erreur: ${collectionResult.error}`);
    }

    this.results.collections[collectionName] = collectionResult;
    return collectionResult;
  }

  async generateRelationsMatrix() {
    console.log('\n🔗 Génération de la matrice des relations...');
    
    for (const collection of ALL_COLLECTIONS) {
      const collectionData = this.results.collections[collection];
      if (collectionData && collectionData.accessible) {
        this.results.relations_matrix[collection] = {
          outgoing: collectionData.relations,
          incoming: {}
        };
      }
    }

    // Ajouter les relations entrantes
    for (const [fromCollection, data] of Object.entries(this.results.relations_matrix)) {
      for (const [field, relation] of Object.entries(data.outgoing)) {
        const targetCollection = relation.collection;
        if (this.results.relations_matrix[targetCollection]) {
          this.results.relations_matrix[targetCollection].incoming[fromCollection] = {
            field: field,
            collection: fromCollection
          };
        }
      }
    }
  }

  generateRecommendations() {
    console.log('\n💡 Génération des recommandations...');

    // 1. Collections sans owner_company
    if (this.results.summary.collections_missing_owner_company.length > 0) {
      this.results.recommendations.push({
        priority: 'HIGH',
        type: 'missing_owner_company',
        message: `${this.results.summary.collections_missing_owner_company.length} collections n'ont pas de champ owner_company`,
        collections: this.results.summary.collections_missing_owner_company,
        action: 'Exécuter le script SQL pour ajouter owner_company à ces collections'
      });
    }

    // 2. Collections inaccessibles
    const inaccessibleCollections = this.results.summary.collections_with_errors
      .filter(e => e.error.includes('You don\'t have permission'))
      .map(e => e.collection);
    
    if (inaccessibleCollections.length > 0) {
      this.results.recommendations.push({
        priority: 'CRITICAL',
        type: 'permissions',
        message: `${inaccessibleCollections.length} collections sont inaccessibles`,
        collections: inaccessibleCollections,
        action: 'Vérifier les permissions Directus ou utiliser un token admin'
      });
    }

    // 3. Relations manquantes
    const collectionsWithBrokenRelations = Object.entries(this.results.collections)
      .filter(([_, data]) => data.broken_relations && data.broken_relations.length > 0)
      .map(([collection, _]) => collection);
    
    if (collectionsWithBrokenRelations.length > 0) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        type: 'broken_relations',
        message: `${collectionsWithBrokenRelations.length} collections ont des relations manquantes`,
        collections: collectionsWithBrokenRelations,
        action: 'Créer les relations manquantes via l\'API Directus'
      });
    }

    // 4. Données sans owner_company
    const collectionsWithNullOwner = Object.entries(this.results.collections)
      .filter(([_, data]) => data.data_distribution && data.data_distribution.null > 0)
      .map(([collection, data]) => ({
        collection,
        count: data.data_distribution.null
      }));
    
    if (collectionsWithNullOwner.length > 0) {
      this.results.recommendations.push({
        priority: 'HIGH',
        type: 'null_owner_company',
        message: `${collectionsWithNullOwner.length} collections ont des données sans owner_company`,
        details: collectionsWithNullOwner,
        action: 'Mettre à jour les enregistrements pour assigner une valeur owner_company'
      });
    }
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsDir = path.join(__dirname, '..', '..', '..', 'audit-results');
    
    // Créer le dossier s'il n'existe pas
    await fs.mkdir(resultsDir, { recursive: true });

    // 1. Sauvegarder le JSON
    const jsonPath = path.join(resultsDir, `audit-report-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));
    console.log(`\n✅ Rapport JSON sauvegardé: ${jsonPath}`);

    // 2. Générer et sauvegarder le rapport Markdown
    const mdContent = this.generateMarkdownReport();
    const mdPath = path.join(resultsDir, 'AUDIT_REPORT.md');
    await fs.writeFile(mdPath, mdContent);
    console.log(`✅ Rapport Markdown sauvegardé: ${mdPath}`);

    // 3. Générer et sauvegarder le script SQL
    const sqlContent = this.generateSQLScript();
    const sqlPath = path.join(resultsDir, 'fix-collections.sql');
    await fs.writeFile(sqlPath, sqlContent);
    console.log(`✅ Script SQL sauvegardé: ${sqlPath}`);
  }

  generateMarkdownReport() {
    const { summary, collections, recommendations } = this.results;
    
    let md = `# 📊 RAPPORT D'AUDIT COMPLET - COLLECTIONS DIRECTUS\n`;
    md += `## Date : ${new Date().toLocaleString('fr-FR')}\n\n`;

    md += `## 📈 RÉSUMÉ EXÉCUTIF\n`;
    md += `- Collections totales : ${summary.total_collections}\n`;
    md += `- Collections accessibles : ${summary.accessible_collections}/${summary.total_collections}\n`;
    md += `- Collections avec owner_company : ${summary.collections_with_owner_company}/${summary.total_collections}\n`;
    md += `- Problèmes critiques : ${summary.critical_issues.length}\n\n`;

    // Problèmes critiques
    if (summary.critical_issues.length > 0) {
      md += `## 🔴 PROBLÈMES CRITIQUES\n`;
      summary.critical_issues.forEach(issue => {
        md += `- **${issue.collection}** : ${issue.issue}`;
        if (issue.fields) {
          md += ` (${issue.fields.join(', ')})`;
        }
        md += `\n`;
      });
      md += `\n`;
    }

    // Collections avec erreurs
    if (summary.collections_with_errors.length > 0) {
      md += `## ⚠️ COLLECTIONS AVEC ERREURS\n`;
      md += `| Collection | Erreur |\n`;
      md += `|------------|--------|\n`;
      summary.collections_with_errors.forEach(({ collection, error }) => {
        md += `| ${collection} | ${error} |\n`;
      });
      md += `\n`;
    }

    // Collections fonctionnelles
    const functionalCollections = Object.entries(collections)
      .filter(([_, data]) => data.accessible && !data.error)
      .map(([name, _]) => name);
    
    if (functionalCollections.length > 0) {
      md += `## ✅ COLLECTIONS FONCTIONNELLES (${functionalCollections.length})\n`;
      md += functionalCollections.join(', ') + '\n\n';
    }

    // Recommandations
    if (recommendations.length > 0) {
      md += `## 🔧 PLAN DE CORRECTION\n`;
      recommendations.sort((a, b) => {
        const priority = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priority[a.priority] - priority[b.priority];
      });
      
      recommendations.forEach(rec => {
        md += `\n### ${rec.priority} - ${rec.message}\n`;
        md += `**Type**: ${rec.type}\n`;
        md += `**Action**: ${rec.action}\n`;
        if (rec.collections) {
          md += `**Collections concernées**: ${rec.collections.join(', ')}\n`;
        }
        if (rec.details) {
          md += `**Détails**:\n`;
          rec.details.forEach(d => {
            md += `- ${d.collection}: ${d.count} enregistrements\n`;
          });
        }
      });
    }

    // Détails par collection
    md += `\n## 📊 DÉTAILS PAR COLLECTION\n\n`;
    md += `| Collection | Accessible | Records | Owner Company | Champs | Relations | Distribution |\n`;
    md += `|------------|------------|---------|---------------|--------|-----------|-------------|\n`;
    
    Object.entries(collections).forEach(([name, data]) => {
      const accessible = data.accessible ? '✅' : '❌';
      const hasOwner = data.has_owner_company ? '✅' : '❌';
      const fieldsCount = data.fields.length;
      const relationsCount = Object.keys(data.relations).length;
      const distribution = data.has_owner_company && data.record_count > 0 
        ? `H:${data.data_distribution.HYPERVISUAL} D:${data.data_distribution.DAINAMICS} L:${data.data_distribution.LEXAIA}`
        : '-';
      
      md += `| ${name} | ${accessible} | ${data.record_count} | ${hasOwner} | ${fieldsCount} | ${relationsCount} | ${distribution} |\n`;
    });

    return md;
  }

  generateSQLScript() {
    let sql = `-- Script SQL de correction pour les collections Directus\n`;
    sql += `-- Généré le ${new Date().toLocaleString('fr-FR')}\n\n`;

    // 1. Ajouter owner_company aux collections qui ne l'ont pas
    if (this.results.summary.collections_missing_owner_company.length > 0) {
      sql += `-- 1. AJOUTER LE CHAMP owner_company AUX COLLECTIONS MANQUANTES\n`;
      sql += `DO $$\n`;
      sql += `DECLARE\n`;
      sql += `    tbl RECORD;\n`;
      sql += `BEGIN\n`;
      sql += `    FOR tbl IN\n`;
      sql += `        SELECT unnest(ARRAY[\n`;
      
      const collections = this.results.summary.collections_missing_owner_company
        .map(c => `            '${c}'`)
        .join(',\n');
      sql += collections + '\n';
      
      sql += `        ]) AS table_name\n`;
      sql += `    LOOP\n`;
      sql += `        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl.table_name) THEN\n`;
      sql += `            IF NOT EXISTS (\n`;
      sql += `                SELECT 1 FROM information_schema.columns \n`;
      sql += `                WHERE table_name = tbl.table_name AND column_name = 'owner_company'\n`;
      sql += `            ) THEN\n`;
      sql += `                EXECUTE format('ALTER TABLE %I ADD COLUMN owner_company VARCHAR(50) DEFAULT ''HYPERVISUAL''', tbl.table_name);\n`;
      sql += `                RAISE NOTICE 'Added owner_company to %', tbl.table_name;\n`;
      sql += `            END IF;\n`;
      sql += `        END IF;\n`;
      sql += `    END LOOP;\n`;
      sql += `END $$;\n\n`;
    }

    // 2. Mettre à jour les enregistrements sans owner_company
    const collectionsWithNullOwner = Object.entries(this.results.collections)
      .filter(([_, data]) => data.data_distribution && data.data_distribution.null > 0);
    
    if (collectionsWithNullOwner.length > 0) {
      sql += `-- 2. METTRE À JOUR LES ENREGISTREMENTS SANS owner_company\n`;
      collectionsWithNullOwner.forEach(([collection, data]) => {
        sql += `UPDATE ${collection} SET owner_company = 'HYPERVISUAL' WHERE owner_company IS NULL; -- ${data.data_distribution.null} enregistrements\n`;
      });
      sql += `\n`;
    }

    // 3. Créer des index sur owner_company
    sql += `-- 3. CRÉER DES INDEX POUR OPTIMISER LES PERFORMANCES\n`;
    const collectionsWithOwner = Object.entries(this.results.collections)
      .filter(([_, data]) => data.has_owner_company && data.accessible);
    
    collectionsWithOwner.forEach(([collection, _]) => {
      sql += `CREATE INDEX IF NOT EXISTS idx_${collection}_owner_company ON ${collection}(owner_company);\n`;
    });

    return sql;
  }

  async run() {
    console.log('🚀 Démarrage de l\'audit complet des collections Directus...\n');
    
    // Auditer chaque collection
    for (const collection of ALL_COLLECTIONS) {
      await this.auditCollection(collection);
    }

    // Générer la matrice des relations
    await this.generateRelationsMatrix();

    // Générer les recommandations
    this.generateRecommendations();

    // Sauvegarder les résultats
    await this.saveResults();

    // Afficher le résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE L\'AUDIT');
    console.log('='.repeat(60));
    console.log(`Total collections: ${this.results.summary.total_collections}`);
    console.log(`Collections accessibles: ${this.results.summary.accessible_collections}`);
    console.log(`Collections avec owner_company: ${this.results.summary.collections_with_owner_company}`);
    console.log(`Problèmes critiques: ${this.results.summary.critical_issues.length}`);
    console.log(`Recommandations: ${this.results.recommendations.length}`);
    console.log('='.repeat(60));
  }
}

// Exécution
const auditor = new DirectusAuditor();
auditor.run().catch(console.error);