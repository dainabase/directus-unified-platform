// audit-notion-databases.js
// Script d'audit complet des bases de données Notion via MCP
// Date: 2025-01-22

const NotionDatabaseAudit = {
  // Configuration des bases de données à vérifier
  databases: {
    'Contacts': '226adb95-3c6f-8006-b411-cfe20c8239f2',
    'Entreprises': '226adb95-3c6f-8008-a3e5-f992fbe83f01',
    'Factures Clients': '226adb95-3c6f-8011-a9bb-ca31f7da8e6a',
    'Devis & Factures Fournisseurs': '226adb95-3c6f-8016-9379-e959ff862d5a',
    'TVA Déclarations': '237adb95-3c6f-801f-a746-c0f0560f8d67',
    'Notes de Frais': '237adb95-3c6f-804b-a530-e44d07ac9f7b',
    'Écritures Comptables': '226adb95-3c6f-8054-aed2-d646e93f96f5',
    'Cashflow': '226adb95-3c6f-8057-b4de-d1e853b31529',
    'Gestion Stock': '226adb95-3c6f-805e-bd30-cebd93e5ea31',
    'Projets Clients': '226adb95-3c6f-806e-9e61-e263baf7af69',
    'Sales Pipeline': '226adb95-3c6f-805b-8cf1-d13fc59e8e68'
  },

  // Résultats de l'audit
  results: {
    accessible: [],
    inaccessible: [],
    errors: [],
    summary: {}
  },

  // Méthode principale d'audit
  async runAudit() {
    console.log('=================================================');
    console.log('AUDIT COMPLET DES BASES DE DONNÉES NOTION');
    console.log('Date:', new Date().toISOString());
    console.log('=================================================\n');

    // Vérifier la disponibilité de l'API MCP
    if (!window.mcp_notion) {
      console.error('❌ ERREUR CRITIQUE: API MCP Notion non disponible');
      console.log('\nPour utiliser ce script, assurez-vous que:');
      console.log('1. Le serveur MCP Notion est démarré');
      console.log('2. La connexion au serveur est établie');
      console.log('3. window.mcp_notion est correctement initialisé');
      return false;
    }

    console.log('✅ API MCP Notion détectée\n');

    // Tester chaque base de données
    for (const [name, id] of Object.entries(this.databases)) {
      await this.testDatabase(name, id);
    }

    // Générer le rapport
    this.generateReport();
    
    return this.results;
  },

  // Tester une base de données spécifique
  async testDatabase(name, id) {
    console.log(`📊 Test de "${name}" (${id})...`);
    
    try {
      // Tentative 1: Récupérer les métadonnées de la base
      let dbInfo = null;
      try {
        dbInfo = await window.mcp_notion.databases?.retrieve?.({
          database_id: id
        });
      } catch (retrieveError) {
        console.log(`   ⚠️ Impossible de récupérer les métadonnées: ${retrieveError.message}`);
      }

      // Tentative 2: Query sur la base
      const queryResult = await window.mcp_notion.databases?.query?.({
        database_id: id,
        page_size: 5 // Limiter à 5 enregistrements pour le test
      }) || await window.mcp_notion.query_database?.({
        database_id: id,
        page_size: 5
      });

      if (queryResult && queryResult.results) {
        // Base accessible
        const recordCount = queryResult.results.length;
        const hasMore = queryResult.has_more || false;
        
        console.log(`   ✅ Base accessible`);
        console.log(`   📝 Enregistrements trouvés: ${recordCount}${hasMore ? '+' : ''}`);
        
        // Analyser la structure si des enregistrements existent
        if (recordCount > 0) {
          const firstRecord = queryResult.results[0];
          const properties = Object.keys(firstRecord.properties || {});
          console.log(`   🔧 Propriétés: ${properties.length}`);
          console.log(`      ${properties.slice(0, 5).join(', ')}${properties.length > 5 ? '...' : ''}`);
        }

        this.results.accessible.push({
          name,
          id,
          recordCount,
          hasMore,
          properties: recordCount > 0 ? Object.keys(queryResult.results[0].properties || {}) : [],
          dbInfo: dbInfo || null
        });

      } else {
        throw new Error('Aucune donnée retournée par la requête');
      }

    } catch (error) {
      // Base inaccessible
      console.log(`   ❌ Base inaccessible`);
      console.log(`   💬 Erreur: ${error.message}`);
      
      this.results.inaccessible.push({
        name,
        id,
        error: error.message,
        errorType: error.code || 'unknown'
      });
      
      this.results.errors.push({
        database: name,
        id,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(''); // Ligne vide pour la lisibilité
  },

  // Générer le rapport d'audit
  generateReport() {
    console.log('\n=================================================');
    console.log('RAPPORT D\'AUDIT');
    console.log('=================================================\n');

    const total = Object.keys(this.databases).length;
    const accessible = this.results.accessible.length;
    const inaccessible = this.results.inaccessible.length;

    // Résumé
    console.log('📊 RÉSUMÉ:');
    console.log(`   Total bases à vérifier: ${total}`);
    console.log(`   ✅ Bases accessibles: ${accessible} (${Math.round(accessible/total*100)}%)`);
    console.log(`   ❌ Bases inaccessibles: ${inaccessible} (${Math.round(inaccessible/total*100)}%)`);

    // Bases accessibles
    if (accessible > 0) {
      console.log('\n✅ BASES ACCESSIBLES:');
      this.results.accessible.forEach(db => {
        console.log(`\n   📁 ${db.name}`);
        console.log(`      ID: ${db.id}`);
        console.log(`      Enregistrements: ${db.recordCount}${db.hasMore ? '+' : ''}`);
        console.log(`      Propriétés: ${db.properties.length}`);
        if (db.properties.length > 0) {
          console.log(`      Exemples: ${db.properties.slice(0, 3).join(', ')}...`);
        }
      });
    }

    // Bases inaccessibles
    if (inaccessible > 0) {
      console.log('\n❌ BASES INACCESSIBLES:');
      this.results.inaccessible.forEach(db => {
        console.log(`\n   📁 ${db.name}`);
        console.log(`      ID: ${db.id}`);
        console.log(`      Erreur: ${db.error}`);
        console.log(`      Type: ${db.errorType}`);
      });
    }

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    if (inaccessible > 0) {
      console.log('   1. Vérifier que les IDs des bases correspondent bien à votre workspace Notion');
      console.log('   2. S\'assurer que l\'intégration a les permissions nécessaires');
      console.log('   3. Vérifier que les bases n\'ont pas été supprimées ou archivées');
      console.log('   4. Contrôler les paramètres de partage des bases dans Notion');
    } else {
      console.log('   ✅ Toutes les bases sont accessibles!');
    }

    // Sauvegarder le résumé
    this.results.summary = {
      timestamp: new Date().toISOString(),
      total,
      accessible,
      inaccessible,
      successRate: Math.round(accessible/total*100) + '%'
    };

    // Export JSON
    console.log('\n📤 EXPORT JSON:');
    console.log('Pour exporter les résultats en JSON, utilisez:');
    console.log('NotionDatabaseAudit.exportResults()');
  },

  // Exporter les résultats en JSON
  exportResults() {
    const exportData = {
      audit: {
        timestamp: new Date().toISOString(),
        databases: this.databases,
        results: this.results
      }
    };
    
    // Afficher dans la console
    console.log(JSON.stringify(exportData, null, 2));
    
    // Créer un fichier téléchargeable
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notion-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    return exportData;
  },

  // Tester une requête spécifique
  async testQuery(databaseId, filter = null) {
    console.log('\n🔍 Test de requête personnalisée...');
    console.log(`Database ID: ${databaseId}`);
    if (filter) {
      console.log('Filter:', JSON.stringify(filter, null, 2));
    }

    try {
      const result = await window.mcp_notion.query_database({
        database_id: databaseId,
        filter: filter,
        page_size: 10
      });

      console.log('✅ Requête réussie');
      console.log(`Résultats: ${result.results?.length || 0}`);
      
      if (result.results && result.results.length > 0) {
        console.log('\nPremier enregistrement:');
        console.log(JSON.stringify(result.results[0], null, 2));
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      return null;
    }
  }
};

// Rendre disponible globalement
window.NotionDatabaseAudit = NotionDatabaseAudit;

// Instructions
console.log('🔧 AUDIT NOTION CHARGÉ');
console.log('');
console.log('Pour lancer l\'audit complet:');
console.log('  NotionDatabaseAudit.runAudit()');
console.log('');
console.log('Pour tester une requête spécifique:');
console.log('  NotionDatabaseAudit.testQuery("database-id", filter)');
console.log('');
console.log('Pour exporter les résultats:');
console.log('  NotionDatabaseAudit.exportResults()');