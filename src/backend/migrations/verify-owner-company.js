#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
import 'dotenv/config';
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

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

const COMPANIES = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI_REALTY', 'TAKEOUT'];

class OwnerCompanyVerifier {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    this.report = {
      totalCollections: 0,
      collectionsWithOwnerCompany: 0,
      collectionsWithoutOwnerCompany: 0,
      totalRecords: 0,
      recordsWithOwnerCompany: 0,
      recordsWithoutOwnerCompany: 0,
      distributionByCompany: {},
      collectionDetails: [],
      issues: []
    };
    
    // Initialiser les compteurs par entreprise
    COMPANIES.forEach(company => {
      this.report.distributionByCompany[company] = 0;
    });
  }

  /**
   * Lance la vérification
   */
  async run() {
    console.log('🔍 VÉRIFICATION OWNER_COMPANY - DÉMARRAGE');
    console.log('='.repeat(60));
    console.log(`API URL: ${API_URL}`);
    console.log(`Date: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
    
    try {
      // 1. Récupérer toutes les collections
      const collections = await this.getCollections();
      
      // 2. Analyser chaque collection
      await this.analyzeCollections(collections);
      
      // 3. Générer le rapport
      this.generateReport();
      
    } catch (error) {
      console.error('❌ ERREUR FATALE:', error.message);
      process.exit(1);
    }
  }

  /**
   * Récupère toutes les collections utilisateur
   */
  async getCollections() {
    console.log('\n📁 Récupération des collections...');
    
    const response = await this.client.get('/collections');
    const allCollections = response.data.data || [];
    
    // Filtrer les collections système
    const userCollections = allCollections.filter(col => 
      !SYSTEM_COLLECTIONS.includes(col.collection)
    );
    
    this.report.totalCollections = userCollections.length;
    console.log(`  ✅ ${userCollections.length} collections utilisateur trouvées`);
    
    return userCollections;
  }

  /**
   * Analyse toutes les collections
   */
  async analyzeCollections(collections) {
    console.log('\n📊 Analyse des collections...\n');
    
    let processedCount = 0;
    
    for (const collection of collections) {
      processedCount++;
      const progress = `[${processedCount}/${collections.length}]`;
      
      process.stdout.write(`\r${progress} Analyse de ${collection.collection}...`.padEnd(60));
      
      try {
        await this.analyzeCollection(collection);
      } catch (error) {
        this.report.issues.push({
          collection: collection.collection,
          error: error.message
        });
      }
      
      // Petite pause pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n'); // Nouvelle ligne après la progression
  }

  /**
   * Analyse une collection spécifique
   */
  async analyzeCollection(collection) {
    const collectionName = collection.collection;
    const analysis = {
      name: collectionName,
      hasOwnerCompanyField: false,
      totalRecords: 0,
      recordsByCompany: {},
      recordsWithoutOwnerCompany: 0,
      percentageWithOwnerCompany: 0,
      issues: []
    };
    
    // Initialiser les compteurs
    COMPANIES.forEach(company => {
      analysis.recordsByCompany[company] = 0;
    });
    
    // 1. Vérifier si le champ owner_company existe
    try {
      await this.client.get(`/fields/${collectionName}/owner_company`);
      analysis.hasOwnerCompanyField = true;
      this.report.collectionsWithOwnerCompany++;
    } catch (error) {
      if (error.response?.status === 404) {
        analysis.hasOwnerCompanyField = false;
        this.report.collectionsWithoutOwnerCompany++;
        analysis.issues.push('Champ owner_company manquant');
      } else {
        throw error;
      }
    }
    
    // 2. Compter les enregistrements
    try {
      const countResponse = await this.client.get(`/items/${collectionName}`, {
        params: {
          aggregate: { count: '*' }
        }
      });
      
      analysis.totalRecords = countResponse.data?.data?.[0]?.count || 0;
      this.report.totalRecords += analysis.totalRecords;
      
      // Si la collection a le champ owner_company et des données
      if (analysis.hasOwnerCompanyField && analysis.totalRecords > 0) {
        // 3. Analyser la distribution par entreprise
        for (const company of COMPANIES) {
          try {
            const companyResponse = await this.client.get(`/items/${collectionName}`, {
              params: {
                filter: { owner_company: { _eq: company } },
                aggregate: { count: '*' }
              }
            });
            
            const count = companyResponse.data?.data?.[0]?.count || 0;
            analysis.recordsByCompany[company] = count;
            this.report.distributionByCompany[company] += count;
            
          } catch (error) {
            // Ignorer les erreurs de permission
          }
        }
        
        // 4. Compter les enregistrements sans owner_company
        try {
          const nullResponse = await this.client.get(`/items/${collectionName}`, {
            params: {
              filter: { owner_company: { _null: true } },
              aggregate: { count: '*' }
            }
          });
          
          analysis.recordsWithoutOwnerCompany = nullResponse.data?.data?.[0]?.count || 0;
          this.report.recordsWithoutOwnerCompany += analysis.recordsWithoutOwnerCompany;
          
        } catch (error) {
          // Ignorer les erreurs de permission
        }
        
        // Calculer le total des enregistrements avec owner_company
        const totalWithOwnerCompany = Object.values(analysis.recordsByCompany)
          .reduce((sum, count) => sum + count, 0);
        
        this.report.recordsWithOwnerCompany += totalWithOwnerCompany;
        
        // Calculer le pourcentage
        if (analysis.totalRecords > 0) {
          analysis.percentageWithOwnerCompany = 
            ((totalWithOwnerCompany / analysis.totalRecords) * 100).toFixed(1);
        }
        
        // Vérifier la cohérence
        const expectedTotal = totalWithOwnerCompany + analysis.recordsWithoutOwnerCompany;
        if (Math.abs(expectedTotal - analysis.totalRecords) > 1) {
          analysis.issues.push(`Incohérence: Total=${analysis.totalRecords}, Somme=${expectedTotal}`);
        }
      }
      
    } catch (error) {
      analysis.issues.push(`Erreur de comptage: ${error.message}`);
    }
    
    this.report.collectionDetails.push(analysis);
  }

  /**
   * Génère le rapport final
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT DE VÉRIFICATION OWNER_COMPANY');
    console.log('='.repeat(80));
    
    // 1. Résumé global
    console.log('\n📈 RÉSUMÉ GLOBAL:');
    console.log(`  📁 Total collections: ${this.report.totalCollections}`);
    console.log(`  ✅ Avec owner_company: ${this.report.collectionsWithOwnerCompany} (${this.getPercentage(this.report.collectionsWithOwnerCompany, this.report.totalCollections)}%)`);
    console.log(`  ❌ Sans owner_company: ${this.report.collectionsWithoutOwnerCompany} (${this.getPercentage(this.report.collectionsWithoutOwnerCompany, this.report.totalCollections)}%)`);
    
    console.log(`\n  📊 Total enregistrements: ${this.report.totalRecords.toLocaleString()}`);
    console.log(`  ✅ Avec owner_company: ${this.report.recordsWithOwnerCompany.toLocaleString()} (${this.getPercentage(this.report.recordsWithOwnerCompany, this.report.totalRecords)}%)`);
    console.log(`  ❌ Sans owner_company: ${this.report.recordsWithoutOwnerCompany.toLocaleString()} (${this.getPercentage(this.report.recordsWithoutOwnerCompany, this.report.totalRecords)}%)`);
    
    // 2. Distribution par entreprise
    console.log('\n🏢 DISTRIBUTION PAR ENTREPRISE:');
    const sortedCompanies = Object.entries(this.report.distributionByCompany)
      .sort((a, b) => b[1] - a[1]);
    
    sortedCompanies.forEach(([company, count]) => {
      const percentage = this.getPercentage(count, this.report.recordsWithOwnerCompany);
      const bar = this.getProgressBar(percentage);
      console.log(`  ${company.padEnd(15)} ${bar} ${count.toLocaleString().padStart(8)} (${percentage}%)`);
    });
    
    // 3. Collections sans owner_company
    const collectionsWithoutField = this.report.collectionDetails
      .filter(col => !col.hasOwnerCompanyField && col.totalRecords > 0)
      .sort((a, b) => b.totalRecords - a.totalRecords);
    
    if (collectionsWithoutField.length > 0) {
      console.log('\n❌ COLLECTIONS SANS OWNER_COMPANY (avec données):');
      collectionsWithoutField.forEach(col => {
        console.log(`  - ${col.name}: ${col.totalRecords.toLocaleString()} enregistrements`);
      });
    }
    
    // 4. Collections avec données non migrées
    const collectionsWithUnmigratedData = this.report.collectionDetails
      .filter(col => col.hasOwnerCompanyField && col.recordsWithoutOwnerCompany > 0)
      .sort((a, b) => b.recordsWithoutOwnerCompany - a.recordsWithoutOwnerCompany);
    
    if (collectionsWithUnmigratedData.length > 0) {
      console.log('\n⚠️  COLLECTIONS AVEC DONNÉES NON MIGRÉES:');
      collectionsWithUnmigratedData.forEach(col => {
        const percentage = this.getPercentage(col.recordsWithoutOwnerCompany, col.totalRecords);
        console.log(`  - ${col.name}: ${col.recordsWithoutOwnerCompany.toLocaleString()}/${col.totalRecords.toLocaleString()} sans owner_company (${percentage}%)`);
      });
    }
    
    // 5. Top 10 des collections par volume
    console.log('\n📊 TOP 10 COLLECTIONS PAR VOLUME:');
    const topCollections = this.report.collectionDetails
      .filter(col => col.totalRecords > 0)
      .sort((a, b) => b.totalRecords - a.totalRecords)
      .slice(0, 10);
    
    topCollections.forEach((col, index) => {
      const status = col.hasOwnerCompanyField ? '✅' : '❌';
      const coverage = col.hasOwnerCompanyField ? ` (${col.percentageWithOwnerCompany}% couvert)` : '';
      console.log(`  ${(index + 1).toString().padStart(2)}. ${status} ${col.name}: ${col.totalRecords.toLocaleString()} enregistrements${coverage}`);
    });
    
    // 6. Problèmes détectés
    if (this.report.issues.length > 0) {
      console.log('\n⚠️  PROBLÈMES DÉTECTÉS:');
      this.report.issues.forEach(issue => {
        console.log(`  - ${issue.collection}: ${issue.error}`);
      });
    }
    
    // 7. Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    
    if (this.report.collectionsWithoutOwnerCompany > 0) {
      console.log(`  🔧 Exécuter la migration pour ajouter owner_company aux ${this.report.collectionsWithoutOwnerCompany} collections manquantes`);
    }
    
    if (this.report.recordsWithoutOwnerCompany > 0) {
      console.log(`  🔄 Migrer les ${this.report.recordsWithoutOwnerCompany.toLocaleString()} enregistrements sans owner_company`);
    }
    
    const coveragePercentage = this.getPercentage(this.report.collectionsWithOwnerCompany, this.report.totalCollections);
    if (coveragePercentage === 100) {
      console.log('  ✅ Toutes les collections ont le champ owner_company!');
    }
    
    // 8. Score final
    const fieldScore = this.getPercentage(this.report.collectionsWithOwnerCompany, this.report.totalCollections);
    const dataScore = this.report.totalRecords > 0 ? 
      this.getPercentage(this.report.recordsWithOwnerCompany, this.report.totalRecords) : 100;
    const globalScore = ((parseFloat(fieldScore) + parseFloat(dataScore)) / 2).toFixed(1);
    
    console.log('\n🎯 SCORE GLOBAL:');
    console.log(`  📋 Couverture des champs: ${fieldScore}%`);
    console.log(`  📊 Couverture des données: ${dataScore}%`);
    console.log(`  🏆 Score final: ${globalScore}%`);
    
    // Évaluation finale
    if (globalScore >= 95) {
      console.log('\n✅ EXCELLENT! Le système de filtrage multi-entreprises est opérationnel.');
    } else if (globalScore >= 80) {
      console.log('\n🟡 BON. Quelques améliorations sont nécessaires.');
    } else {
      console.log('\n🔴 ATTENTION! Le système nécessite une migration importante.');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`Fin: ${new Date().toISOString()}`);
    
    // Sauvegarder le rapport dans un fichier
    this.saveReport();
  }

  /**
   * Calcule un pourcentage
   */
  getPercentage(value, total) {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  }

  /**
   * Génère une barre de progression
   */
  getProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Sauvegarde le rapport dans un fichier JSON
   */
  async saveReport() {
    try {
      const fs = await import('fs/promises');
      const reportPath = './owner-company-report.json';
      
      await fs.writeFile(
        reportPath,
        JSON.stringify(this.report, null, 2)
      );
      
      console.log(`\n📄 Rapport détaillé sauvegardé dans: ${reportPath}`);
    } catch (error) {
      console.error('\n❌ Erreur sauvegarde rapport:', error.message);
    }
  }
}

// Lancer la vérification
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new OwnerCompanyVerifier();
  verifier.run().catch(console.error);
}