#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs/promises';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
const COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

// Collections confirmées avec owner_company
const WORKING_COLLECTIONS = [
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

// Collections critiques à tester
const CRITICAL_COLLECTIONS = [
  'companies',
  'people',
  'time_tracking',
  'support_tickets',
  'proposals',
  'quotes'
];

class FilteringTester {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    this.results = {
      timestamp: new Date().toISOString(),
      workingCollections: {},
      criticalCollections: {},
      dashboardMetrics: {},
      summary: {
        totalTested: 0,
        totalWorking: 0,
        totalFailed: 0
      }
    };
  }

  async run() {
    console.log('🧪 TEST COMPLET DU FILTRAGE MULTI-ENTREPRISES');
    console.log('='.repeat(80));
    console.log(`Date: ${new Date().toISOString()}`);
    console.log('='.repeat(80));
    
    // 1. Tester les collections qui fonctionnent
    console.log('\n✅ TEST DES COLLECTIONS FONCTIONNELLES');
    console.log('-'.repeat(60));
    await this.testWorkingCollections();
    
    // 2. Tester les collections critiques
    console.log('\n❌ TEST DES COLLECTIONS CRITIQUES (potentiellement bloquées)');
    console.log('-'.repeat(60));
    await this.testCriticalCollections();
    
    // 3. Simuler le dashboard CEO
    console.log('\n🎯 SIMULATION DASHBOARD CEO');
    console.log('-'.repeat(60));
    await this.testDashboardMetrics();
    
    // 4. Générer le rapport
    await this.generateReport();
  }

  async testWorkingCollections() {
    for (const collection of WORKING_COLLECTIONS) {
      console.log(`\n📊 ${collection}:`);
      
      const collectionResult = {
        hasOwnerCompany: false,
        totalRecords: 0,
        distribution: {},
        filteringWorks: false,
        errors: []
      };
      
      try {
        // Vérifier si le champ existe
        try {
          await this.client.get(`/fields/${collection}/owner_company`);
          collectionResult.hasOwnerCompany = true;
          console.log('  ✅ Champ owner_company présent');
        } catch (e) {
          console.log('  ❌ Champ owner_company absent');
        }
        
        // Compter total
        const totalRes = await this.client.get(`/items/${collection}`, {
          params: { aggregate: { count: '*' } }
        });
        collectionResult.totalRecords = totalRes.data?.data?.[0]?.count || 0;
        console.log(`  📊 Total: ${collectionResult.totalRecords} enregistrements`);
        
        // Tester filtrage par entreprise
        let totalFiltered = 0;
        for (const company of COMPANIES) {
          try {
            const filteredRes = await this.client.get(`/items/${collection}`, {
              params: {
                filter: { owner_company: { _eq: company } },
                aggregate: { count: '*' }
              }
            });
            
            const count = filteredRes.data?.data?.[0]?.count || 0;
            collectionResult.distribution[company] = count;
            totalFiltered += count;
            
            if (count > 0) {
              const percentage = ((count / collectionResult.totalRecords) * 100).toFixed(1);
              console.log(`  ${company}: ${count} (${percentage}%)`);
            }
          } catch (e) {
            collectionResult.errors.push(`Filter ${company}: ${e.message}`);
          }
        }
        
        // Vérifier si le filtrage fonctionne
        if (totalFiltered > 0 && collectionResult.hasOwnerCompany) {
          collectionResult.filteringWorks = true;
          console.log('  ✅ Filtrage opérationnel');
          this.results.summary.totalWorking++;
        } else {
          console.log('  ❌ Filtrage non fonctionnel');
          this.results.summary.totalFailed++;
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
        collectionResult.errors.push(error.message);
        this.results.summary.totalFailed++;
      }
      
      this.results.workingCollections[collection] = collectionResult;
      this.results.summary.totalTested++;
    }
  }

  async testCriticalCollections() {
    for (const collection of CRITICAL_COLLECTIONS) {
      console.log(`\n📊 ${collection}:`);
      
      const collectionResult = {
        hasOwnerCompany: false,
        canRead: false,
        totalRecords: 0,
        errors: []
      };
      
      try {
        // Test lecture
        const testRes = await this.client.get(`/items/${collection}`, {
          params: { limit: 1 }
        });
        collectionResult.canRead = true;
        console.log('  ✅ Peut lire la collection');
        
        // Compter total
        const totalRes = await this.client.get(`/items/${collection}`, {
          params: { aggregate: { count: '*' } }
        });
        collectionResult.totalRecords = totalRes.data?.data?.[0]?.count || 0;
        console.log(`  📊 Total: ${collectionResult.totalRecords} enregistrements`);
        
        // Vérifier owner_company
        try {
          await this.client.get(`/fields/${collection}/owner_company`);
          collectionResult.hasOwnerCompany = true;
          console.log('  ✅ Champ owner_company présent');
        } catch (e) {
          console.log('  ❌ Champ owner_company ABSENT - Filtrage impossible');
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur accès: ${error.response?.status} - ${error.message}`);
        collectionResult.errors.push(error.message);
      }
      
      this.results.criticalCollections[collection] = collectionResult;
    }
  }

  async testDashboardMetrics() {
    for (const company of ['all', ...COMPANIES]) {
      console.log(`\n🏢 ${company === 'all' ? 'TOUTES ENTREPRISES' : company}:`);
      
      const metrics = {
        projects: { total: 0, active: 0 },
        revenue: { total: 0, invoices: 0 },
        expenses: { total: 0 },
        clients: { total: 0, active: 0 },
        time: { hours: 0, billable: 0 }
      };
      
      const filter = company === 'all' ? {} : { owner_company: { _eq: company } };
      
      try {
        // Projets
        const projectsRes = await this.client.get('/items/projects', {
          params: {
            filter: {
              ...filter,
              status: { _in: ['active', 'in_progress'] }
            },
            aggregate: { count: '*' }
          }
        });
        metrics.projects.active = projectsRes.data?.data?.[0]?.count || 0;
        
        // Revenue
        const invoicesRes = await this.client.get('/items/client_invoices', {
          params: {
            filter: filter,
            aggregate: { count: '*', sum: ['amount'] }
          }
        });
        const invoiceData = invoicesRes.data?.data?.[0] || {};
        metrics.revenue.invoices = invoiceData.count || 0;
        metrics.revenue.total = Math.round(invoiceData.sum?.amount || 0);
        
        // Dépenses
        const expensesRes = await this.client.get('/items/expenses', {
          params: {
            filter: filter,
            aggregate: { sum: ['amount'] }
          }
        });
        metrics.expenses.total = Math.round(expensesRes.data?.data?.[0]?.sum?.amount || 0);
        
        // Afficher les métriques
        console.log(`  Projets actifs: ${metrics.projects.active}`);
        console.log(`  Revenue: €${metrics.revenue.total.toLocaleString()} (${metrics.revenue.invoices} factures)`);
        console.log(`  Dépenses: €${metrics.expenses.total.toLocaleString()}`);
        console.log(`  Profit: €${(metrics.revenue.total - metrics.expenses.total).toLocaleString()}`);
        
      } catch (error) {
        console.log(`  ❌ Erreur métriques: ${error.message}`);
      }
      
      this.results.dashboardMetrics[company] = metrics;
    }
  }

  async generateReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RAPPORT DE TEST COMPLET');
    console.log('='.repeat(80));
    
    // Résumé
    console.log('\n📈 RÉSUMÉ:');
    console.log(`  Collections testées: ${this.results.summary.totalTested}`);
    console.log(`  ✅ Fonctionnelles: ${this.results.summary.totalWorking}`);
    console.log(`  ❌ Non fonctionnelles: ${this.results.summary.totalFailed}`);
    
    // Collections critiques manquantes
    console.log('\n❌ COLLECTIONS CRITIQUES SANS owner_company:');
    Object.entries(this.results.criticalCollections).forEach(([name, data]) => {
      if (!data.hasOwnerCompany && data.canRead) {
        console.log(`  - ${name}: ${data.totalRecords} enregistrements SANS filtrage`);
      }
    });
    
    // Impact dashboard
    console.log('\n📊 IMPACT SUR LE DASHBOARD CEO:');
    const allMetrics = this.results.dashboardMetrics['all'] || {};
    const hypervisualMetrics = this.results.dashboardMetrics['HYPERVISUAL'] || {};
    
    if (allMetrics.revenue && hypervisualMetrics.revenue) {
      const revenuePercentage = ((hypervisualMetrics.revenue.total / allMetrics.revenue.total) * 100).toFixed(1);
      console.log(`  HYPERVISUAL représente ${revenuePercentage}% du revenue total`);
    }
    
    // Sauvegarder le rapport
    try {
      await fs.writeFile(
        'test-complete-results.json',
        JSON.stringify(this.results, null, 2)
      );
      console.log('\n📄 Rapport détaillé sauvegardé: test-complete-results.json');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error.message);
    }
    
    // Conclusion
    console.log('\n🎯 CONCLUSION:');
    if (this.results.summary.totalWorking >= 10) {
      console.log('✅ Le filtrage fonctionne sur les collections principales');
      console.log('⚠️  Mais certaines collections critiques manquent owner_company');
      console.log('💡 Corrigez les permissions pour finaliser la migration');
    } else {
      console.log('❌ Le système de filtrage nécessite des corrections');
    }
  }
}

// Exécuter les tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new FilteringTester();
  tester.run().catch(error => {
    console.error('\n💥 ERREUR FATALE:', error);
    process.exit(1);
  });
}