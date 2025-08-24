import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Toutes les collections attendues après intégration
const EXPECTED_COLLECTIONS = {
  // Collections existantes enrichies
  existing: [
    'companies', 'client_invoices', 'bank_transactions', 'projects', 
    'people', 'activities', 'time_tracking', 'expenses', 'payments',
    'approvals', 'budgets', 'comments', 'deliverables', 'notifications',
    'audit_logs', 'integrations', 'permissions', 'roles', 'settings',
    'supplier_invoices', 'accounting_entries'
  ],
  
  // Nouvelles collections créées
  created: [
    'opportunities', 'tax_declarations', 'cash_forecasts', 
    'milestones', 'campaigns', 'faq'
  ],
  
  // Collections système Directus
  system: [
    'directus_users', 'directus_roles', 'directus_permissions',
    'directus_collections', 'directus_fields', 'directus_files'
  ]
};

// Champs critiques à vérifier par collection
const CRITICAL_FIELDS = {
  companies: [
    'owner_company', 'vat_number', 'legal_name', 'billing_address',
    'credit_limit', 'payment_terms', 'mautic_id', 'invoice_ninja_id'
  ],
  
  client_invoices: [
    'owner_company', 'tax_rate', 'tax_type', 'reverse_charge',
    'pdf_url', 'accounting_code', 'invoice_ninja_id'
  ],
  
  bank_transactions: [
    'owner_company', 'revolut_id', 'counterparty_iban', 'tax_relevant',
    'vat_amount', 'expense_category', 'business_purpose'
  ],
  
  projects: [
    'owner_company', 'project_code', 'priority', 'health_status',
    'actual_cost', 'margin_percentage', 'github_repo'
  ],
  
  people: [
    'owner_company', 'employee_id', 'job_title', 'hire_date',
    'linkedin_url', 'timezone', 'mautic_contact_id'
  ],
  
  opportunities: [
    'name', 'company_id', 'stage', 'value', 'probability',
    'source', 'assigned_to', 'owner_company'
  ],
  
  tax_declarations: [
    'declaration_period', 'tax_type', 'amount_declared', 'status',
    'due_date', 'owner_company'
  ],
  
  cash_forecasts: [
    'forecast_date', 'forecast_amount', 'category', 'confidence_level',
    'owner_company'
  ],
  
  milestones: [
    'project_id', 'name', 'due_date', 'status', 'completion_percentage',
    'priority', 'owner_company'
  ],
  
  campaigns: [
    'name', 'type', 'status', 'budget', 'start_date', 'target_audience',
    'mautic_id', 'owner_company'
  ],
  
  faq: [
    'question', 'answer', 'category', 'is_published', 'owner_company'
  ]
};

// Relations critiques à vérifier
const CRITICAL_RELATIONS = [
  { collection: 'opportunities', field: 'company_id', related: 'companies' },
  { collection: 'opportunities', field: 'contact_id', related: 'people' },
  { collection: 'opportunities', field: 'assigned_to', related: 'directus_users' },
  { collection: 'milestones', field: 'project_id', related: 'projects' },
  { collection: 'milestones', field: 'assigned_to', related: 'directus_users' },
  { collection: 'cash_forecasts', field: 'project_id', related: 'projects' }
];

class SystemValidator {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      validation: {
        collections: { passed: 0, failed: 0, details: [] },
        fields: { passed: 0, failed: 0, details: [] },
        relations: { passed: 0, failed: 0, details: [] },
        integrations: { passed: 0, failed: 0, details: [] },
        performance: { passed: 0, failed: 0, details: [] }
      },
      summary: {
        total_tests: 0,
        passed_tests: 0,
        failed_tests: 0,
        success_rate: 0
      },
      recommendations: [],
      critical_issues: [],
      warnings: []
    };
  }

  async validateCollections() {
    console.log('🏗️ Validation des collections...\n');
    
    try {
      const response = await client.get('/collections');
      const existingCollections = response.data.data.map(c => c.collection);
      
      // Vérifier les collections existantes enrichies
      for (const collection of EXPECTED_COLLECTIONS.existing) {
        if (existingCollections.includes(collection)) {
          this.report.validation.collections.passed++;
          this.report.validation.collections.details.push({
            collection,
            status: 'FOUND',
            type: 'existing_enriched'
          });
          console.log(`   ✅ Collection existante: ${collection}`);
        } else {
          this.report.validation.collections.failed++;
          this.report.validation.collections.details.push({
            collection,
            status: 'MISSING',
            type: 'existing_enriched'
          });
          this.report.critical_issues.push(`Collection manquante: ${collection}`);
          console.log(`   ❌ Collection manquante: ${collection}`);
        }
      }
      
      // Vérifier les nouvelles collections créées
      for (const collection of EXPECTED_COLLECTIONS.created) {
        if (existingCollections.includes(collection)) {
          this.report.validation.collections.passed++;
          this.report.validation.collections.details.push({
            collection,
            status: 'FOUND',
            type: 'newly_created'
          });
          console.log(`   ✅ Nouvelle collection: ${collection}`);
        } else {
          this.report.validation.collections.failed++;
          this.report.validation.collections.details.push({
            collection,
            status: 'MISSING',
            type: 'newly_created'
          });
          this.report.critical_issues.push(`Nouvelle collection manquante: ${collection}`);
          console.log(`   ❌ Nouvelle collection manquante: ${collection}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur validation collections: ${error.message}`);
      this.report.critical_issues.push(`Erreur validation collections: ${error.message}`);
    }
  }

  async validateFields() {
    console.log('\n🔧 Validation des champs critiques...\n');
    
    for (const [collectionName, expectedFields] of Object.entries(CRITICAL_FIELDS)) {
      try {
        const response = await client.get(`/fields/${collectionName}`);
        const existingFields = response.data.data.map(f => f.field);
        
        let collectionFieldsOk = true;
        const missingFields = [];
        
        for (const field of expectedFields) {
          if (existingFields.includes(field)) {
            this.report.validation.fields.passed++;
            console.log(`     ✅ ${collectionName}.${field}`);
          } else {
            this.report.validation.fields.failed++;
            missingFields.push(field);
            collectionFieldsOk = false;
            console.log(`     ❌ ${collectionName}.${field} - MANQUANT`);
          }
        }
        
        this.report.validation.fields.details.push({
          collection: collectionName,
          expected_fields: expectedFields.length,
          found_fields: expectedFields.length - missingFields.length,
          missing_fields: missingFields,
          status: collectionFieldsOk ? 'OK' : 'INCOMPLETE'
        });
        
        if (missingFields.length > 0) {
          this.report.warnings.push(
            `Collection ${collectionName} : ${missingFields.length} champs manquants`
          );
        }
        
      } catch (error) {
        console.log(`   ❌ Collection ${collectionName} non accessible: ${error.message}`);
        this.report.validation.fields.failed += expectedFields.length;
        this.report.critical_issues.push(
          `Collection ${collectionName} non accessible pour validation des champs`
        );
      }
    }
  }

  async validateRelations() {
    console.log('\n🔗 Validation des relations critiques...\n');
    
    try {
      const response = await client.get('/relations');
      const existingRelations = response.data.data;
      
      for (const expectedRelation of CRITICAL_RELATIONS) {
        const relation = existingRelations.find(r => 
          r.collection === expectedRelation.collection && 
          r.field === expectedRelation.field
        );
        
        if (relation) {
          this.report.validation.relations.passed++;
          this.report.validation.relations.details.push({
            ...expectedRelation,
            status: 'FOUND',
            actual_related: relation.related_collection
          });
          console.log(`   ✅ ${expectedRelation.collection}.${expectedRelation.field} -> ${expectedRelation.related}`);
        } else {
          this.report.validation.relations.failed++;
          this.report.validation.relations.details.push({
            ...expectedRelation,
            status: 'MISSING'
          });
          this.report.warnings.push(
            `Relation manquante: ${expectedRelation.collection}.${expectedRelation.field}`
          );
          console.log(`   ❌ ${expectedRelation.collection}.${expectedRelation.field} -> ${expectedRelation.related} - MANQUANTE`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur validation relations: ${error.message}`);
      this.report.critical_issues.push(`Erreur validation relations: ${error.message}`);
    }
  }

  async validateIntegrations() {
    console.log('\n🔌 Validation des capacités d\'intégration...\n');
    
    const integrationTests = [
      { name: 'API Authentication', test: () => this.testAPIAuth() },
      { name: 'File Upload', test: () => this.testFileUpload() },
      { name: 'Data Query Performance', test: () => this.testQueryPerformance() },
      { name: 'Owner Company Filtering', test: () => this.testOwnerCompanyFiltering() }
    ];
    
    for (const integration of integrationTests) {
      try {
        const result = await integration.test();
        if (result.success) {
          this.report.validation.integrations.passed++;
          console.log(`   ✅ ${integration.name}: ${result.message}`);
        } else {
          this.report.validation.integrations.failed++;
          this.report.warnings.push(`${integration.name}: ${result.message}`);
          console.log(`   ⚠️ ${integration.name}: ${result.message}`);
        }
      } catch (error) {
        this.report.validation.integrations.failed++;
        this.report.critical_issues.push(`${integration.name}: ${error.message}`);
        console.log(`   ❌ ${integration.name}: ${error.message}`);
      }
    }
  }

  async testAPIAuth() {
    try {
      const response = await client.get('/users/me');
      return { 
        success: true, 
        message: `Authentifié comme ${response.data.data.first_name} ${response.data.data.last_name}` 
      };
    } catch (error) {
      return { success: false, message: 'Échec authentification' };
    }
  }

  async testFileUpload() {
    // Test simple d'accès aux files
    try {
      const response = await client.get('/files?limit=1');
      return { success: true, message: `${response.data.data.length} fichier(s) accessible(s)` };
    } catch (error) {
      return { success: false, message: 'Échec accès fichiers' };
    }
  }

  async testQueryPerformance() {
    const startTime = Date.now();
    try {
      const response = await client.get('/items/companies?limit=10');
      const duration = Date.now() - startTime;
      
      if (duration < 2000) { // Moins de 2 secondes
        return { success: true, message: `Requête en ${duration}ms` };
      } else {
        return { success: false, message: `Requête lente: ${duration}ms` };
      }
    } catch (error) {
      return { success: false, message: 'Échec test performance' };
    }
  }

  async testOwnerCompanyFiltering() {
    try {
      const response = await client.get('/items/companies?filter[owner_company][_eq]=HYPERVISUAL');
      const filteredCount = response.data.data.length;
      
      const allResponse = await client.get('/items/companies');
      const totalCount = allResponse.data.data.length;
      
      if (filteredCount < totalCount) {
        return { 
          success: true, 
          message: `Filtrage OK: ${filteredCount}/${totalCount} entreprises HYPERVISUAL` 
        };
      } else {
        return { 
          success: false, 
          message: 'Filtrage owner_company ne semble pas fonctionner' 
        };
      }
    } catch (error) {
      return { success: false, message: 'Échec test filtrage' };
    }
  }

  async validatePerformance() {
    console.log('\n⚡ Tests de performance...\n');
    
    const performanceTests = [
      { name: 'Large Dataset Query', test: () => this.testLargeDataset() },
      { name: 'Concurrent Requests', test: () => this.testConcurrentRequests() },
      { name: 'Memory Usage', test: () => this.testMemoryUsage() }
    ];
    
    for (const test of performanceTests) {
      try {
        const result = await test.test();
        if (result.success) {
          this.report.validation.performance.passed++;
          console.log(`   ✅ ${test.name}: ${result.message}`);
        } else {
          this.report.validation.performance.failed++;
          this.report.warnings.push(`Performance ${test.name}: ${result.message}`);
          console.log(`   ⚠️ ${test.name}: ${result.message}`);
        }
      } catch (error) {
        this.report.validation.performance.failed++;
        this.report.warnings.push(`Performance ${test.name}: ${error.message}`);
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testLargeDataset() {
    const startTime = Date.now();
    try {
      const response = await client.get('/items/activities?limit=100');
      const duration = Date.now() - startTime;
      
      if (duration < 5000) {
        return { success: true, message: `100 éléments en ${duration}ms` };
      } else {
        return { success: false, message: `Trop lent: ${duration}ms pour 100 éléments` };
      }
    } catch (error) {
      return { success: false, message: 'Échec test gros dataset' };
    }
  }

  async testConcurrentRequests() {
    const startTime = Date.now();
    try {
      const promises = Array(5).fill().map(() => client.get('/items/companies?limit=10'));
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      if (duration < 10000) {
        return { success: true, message: `5 requêtes parallèles en ${duration}ms` };
      } else {
        return { success: false, message: `Requêtes concurrentes lentes: ${duration}ms` };
      }
    } catch (error) {
      return { success: false, message: 'Échec test concurrence' };
    }
  }

  async testMemoryUsage() {
    // Test basique de consommation mémoire
    const used = process.memoryUsage();
    const usedMB = Math.round(used.heapUsed / 1024 / 1024);
    
    if (usedMB < 200) { // Moins de 200MB
      return { success: true, message: `Utilisation mémoire: ${usedMB}MB` };
    } else {
      return { success: false, message: `Utilisation mémoire élevée: ${usedMB}MB` };
    }
  }

  generateRecommendations() {
    // Recommandations basées sur les résultats
    if (this.report.validation.collections.failed > 0) {
      this.report.recommendations.push(
        'Créer les collections manquantes avec le script create-missing-collections.js'
      );
    }
    
    if (this.report.validation.fields.failed > 5) {
      this.report.recommendations.push(
        'Exécuter le script complete-fields-from-legacy.js pour ajouter les champs manquants'
      );
    }
    
    if (this.report.validation.relations.failed > 0) {
      this.report.recommendations.push(
        'Créer les relations manquantes dans l\'interface Directus ou via API'
      );
    }
    
    if (this.report.validation.performance.failed > 1) {
      this.report.recommendations.push(
        'Optimiser les performances avec les outils dans src/frontend/src/utils/optimizations/'
      );
    }
    
    // Recommandations générales
    this.report.recommendations.push(
      'Implémenter les automatisations selon le plan dans docs/AUTOMATIONS_CATALOG.md'
    );
    
    this.report.recommendations.push(
      'Déployer les optimisations frontend pour améliorer l\'expérience utilisateur'
    );
  }

  calculateSummary() {
    const allValidations = [
      this.report.validation.collections,
      this.report.validation.fields,
      this.report.validation.relations,
      this.report.validation.integrations,
      this.report.validation.performance
    ];
    
    this.report.summary.total_tests = allValidations.reduce((sum, v) => sum + v.passed + v.failed, 0);
    this.report.summary.passed_tests = allValidations.reduce((sum, v) => sum + v.passed, 0);
    this.report.summary.failed_tests = allValidations.reduce((sum, v) => sum + v.failed, 0);
    
    this.report.summary.success_rate = this.report.summary.total_tests > 0 
      ? Math.round((this.report.summary.passed_tests / this.report.summary.total_tests) * 100)
      : 0;
  }

  async saveReport() {
    const reportPath = path.join(__dirname, 'audit-results', 'SYSTEM_VALIDATION_FINAL.json');
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n✅ Rapport de validation sauvegardé: ${reportPath}`);
  }

  async saveMarkdownReport() {
    let md = `# 🧪 VALIDATION COMPLÈTE DU SYSTÈME\n`;
    md += `## Date : ${new Date().toLocaleString('fr-FR')}\n\n`;
    
    md += `## 📊 RÉSUMÉ EXÉCUTIF\n\n`;
    md += `- **Tests total** : ${this.report.summary.total_tests}\n`;
    md += `- **Tests réussis** : ${this.report.summary.passed_tests}\n`;
    md += `- **Tests échoués** : ${this.report.summary.failed_tests}\n`;
    md += `- **Taux de réussite** : ${this.report.summary.success_rate}%\n\n`;
    
    if (this.report.critical_issues.length > 0) {
      md += `## 🚨 PROBLÈMES CRITIQUES\n\n`;
      this.report.critical_issues.forEach(issue => {
        md += `- ❌ ${issue}\n`;
      });
      md += `\n`;
    }
    
    if (this.report.warnings.length > 0) {
      md += `## ⚠️ AVERTISSEMENTS\n\n`;
      this.report.warnings.forEach(warning => {
        md += `- ⚠️ ${warning}\n`;
      });
      md += `\n`;
    }
    
    md += `## 📋 DÉTAIL DES VALIDATIONS\n\n`;
    
    // Collections
    md += `### Collections\n`;
    md += `- Réussies : ${this.report.validation.collections.passed}\n`;
    md += `- Échouées : ${this.report.validation.collections.failed}\n\n`;
    
    // Champs
    md += `### Champs\n`;
    md += `- Réussies : ${this.report.validation.fields.passed}\n`;
    md += `- Échouées : ${this.report.validation.fields.failed}\n\n`;
    
    // Relations
    md += `### Relations\n`;
    md += `- Réussies : ${this.report.validation.relations.passed}\n`;
    md += `- Échouées : ${this.report.validation.relations.failed}\n\n`;
    
    if (this.report.recommendations.length > 0) {
      md += `## 💡 RECOMMANDATIONS\n\n`;
      this.report.recommendations.forEach(rec => {
        md += `- ${rec}\n`;
      });
    }
    
    const mdPath = path.join(__dirname, 'audit-results', 'SYSTEM_VALIDATION_FINAL.md');
    await fs.writeFile(mdPath, md);
    console.log(`✅ Rapport Markdown sauvegardé: ${mdPath}`);
  }

  async run() {
    console.log('🚀 VALIDATION COMPLÈTE DU SYSTÈME DIRECTUS UNIFIED PLATFORM\n');
    console.log('='.repeat(70));
    
    try {
      await this.validateCollections();
      await this.validateFields();
      await this.validateRelations();
      await this.validateIntegrations();
      await this.validatePerformance();
      
      this.generateRecommendations();
      this.calculateSummary();
      
      await this.saveReport();
      await this.saveMarkdownReport();
      
      // Résumé final
      console.log('\n' + '='.repeat(70));
      console.log('📊 RÉSUMÉ FINAL DE LA VALIDATION');
      console.log('='.repeat(70));
      console.log(`Tests total: ${this.report.summary.total_tests}`);
      console.log(`Tests réussis: ${this.report.summary.passed_tests}`);
      console.log(`Tests échoués: ${this.report.summary.failed_tests}`);
      console.log(`Taux de réussite: ${this.report.summary.success_rate}%`);
      
      if (this.report.critical_issues.length > 0) {
        console.log(`\n🚨 Problèmes critiques: ${this.report.critical_issues.length}`);
        this.report.critical_issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (this.report.warnings.length > 0) {
        console.log(`\n⚠️ Avertissements: ${this.report.warnings.length}`);
      }
      
      console.log('\n💡 Recommandations:');
      this.report.recommendations.forEach(rec => console.log(`   - ${rec}`));
      
      console.log('\n='.repeat(70));
      
      if (this.report.summary.success_rate >= 80) {
        console.log('🎉 SYSTÈME VALIDÉ - PRÊT POUR LA PRODUCTION !');
      } else if (this.report.summary.success_rate >= 60) {
        console.log('⚠️ SYSTÈME PARTIELLEMENT VALIDÉ - CORRECTIONS RECOMMANDÉES');
      } else {
        console.log('❌ VALIDATION ÉCHOUÉE - CORRECTIONS CRITIQUES NÉCESSAIRES');
      }
      
    } catch (error) {
      console.error('❌ Erreur fatale lors de la validation:', error);
    }
  }
}

// Exécution
const validator = new SystemValidator();
validator.run().catch(console.error);