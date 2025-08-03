// notion-validation.js - Script de validation des connexions Notion MCP
// Ce fichier teste toutes les connexions aux bases de données Notion

const NotionValidation = {
  // Configuration des tests
  testResults: new Map(),
  
  // Initialiser les tests de validation
  async init() {
    console.log('🔍 DÉBUT VALIDATION CONNEXIONS NOTION MCP');
    console.log('==========================================');
    
    // Vérifier que l'API MCP Notion est disponible
    if (!window.mcp_notion) {
      console.error('❌ API MCP Notion non disponible');
      this.testResults.set('mcp_availability', false);
      return false;
    }
    
    console.log('✅ API MCP Notion détectée');
    this.testResults.set('mcp_availability', true);
    
    // Tester toutes les bases de données
    await this.validateAllDatabases();
    
    // Tester les fonctions du connecteur
    await this.validateConnectorFunctions();
    
    // Afficher le rapport final
    this.displayFinalReport();
    
    return this.getOverallStatus();
  },
  
  // Valider toutes les bases de données
  async validateAllDatabases() {
    console.log('\n📊 VALIDATION DES BASES DE DONNÉES');
    console.log('----------------------------------');
    
    const databases = window.NotionConnector?.DATABASES || {};
    
    for (const [dbName, dbId] of Object.entries(databases)) {
      await this.validateDatabase(dbName, dbId);
    }
  },
  
  // Valider une base de données spécifique
  async validateDatabase(name, id) {
    try {
      console.log(`🔍 Test ${name} (${id})...`);
      
      // Tenter de récupérer les informations de la base
      const response = await window.mcp_notion.databases.retrieve({
        database_id: id
      });
      
      if (response && response.id) {
        console.log(`✅ ${name}: Base accessible`);
        console.log(`   - Titre: ${response.title?.[0]?.text?.content || 'Titre non disponible'}`);
        console.log(`   - Propriétés: ${Object.keys(response.properties || {}).length}`);
        this.testResults.set(`db_${name}`, {
          status: true,
          title: response.title?.[0]?.text?.content,
          properties: Object.keys(response.properties || {}),
          propertyCount: Object.keys(response.properties || {}).length
        });
      } else {
        throw new Error('Réponse invalide de l\'API');
      }
      
    } catch (error) {
      console.error(`❌ ${name}: Erreur - ${error.message}`);
      this.testResults.set(`db_${name}`, {
        status: false,
        error: error.message
      });
    }
  },
  
  // Valider les fonctions du connecteur
  async validateConnectorFunctions() {
    console.log('\n🔧 VALIDATION DES FONCTIONS CONNECTEUR');
    console.log('-------------------------------------');
    
    // Tester les fonctions client
    await this.testClientFunctions();
    
    // Tester les fonctions prestataire
    await this.testPrestataireFunctions();
    
    // Tester les fonctions revendeur
    await this.testRevendeurFunctions();
    
    // Tester les fonctions communes
    await this.testCommonFunctions();
  },
  
  // Tester les fonctions client
  async testClientFunctions() {
    console.log('\n👤 Test fonctions CLIENT');
    
    const testClientId = 'test_client_id';
    const testProjectId = 'test_project_id';
    
    const tests = [
      {
        name: 'getClientProjects',
        fn: () => window.NotionConnector.client.getClientProjects(testClientId)
      },
      {
        name: 'getProjectTasks',
        fn: () => window.NotionConnector.client.getProjectTasks(testProjectId)
      },
      {
        name: 'getProjectDocuments',
        fn: () => window.NotionConnector.client.getProjectDocuments(testProjectId)
      },
      {
        name: 'getClientFinances',
        fn: () => window.NotionConnector.client.getClientFinances(testClientId)
      }
    ];
    
    for (const test of tests) {
      await this.runFunctionTest('client', test.name, test.fn);
    }
  },
  
  // Tester les fonctions prestataire
  async testPrestataireFunctions() {
    console.log('\n🔨 Test fonctions PRESTATAIRE');
    
    const testPrestataireId = 'test_prestataire_id';
    const testMissionId = 'test_mission_id';
    
    const tests = [
      {
        name: 'getPrestataireMissions',
        fn: () => window.NotionConnector.prestataire.getPrestataireMissions(testPrestataireId)
      },
      {
        name: 'getPrestatairePerformance',
        fn: () => window.NotionConnector.prestataire.getPrestatairePerformance(testPrestataireId)
      },
      {
        name: 'getPrestataireRewards',
        fn: () => window.NotionConnector.prestataire.getPrestataireRewards(testPrestataireId)
      }
    ];
    
    for (const test of tests) {
      await this.runFunctionTest('prestataire', test.name, test.fn);
    }
  },
  
  // Tester les fonctions revendeur
  async testRevendeurFunctions() {
    console.log('\n💼 Test fonctions REVENDEUR');
    
    const testRevendeurId = 'test_revendeur_id';
    
    const tests = [
      {
        name: 'getSalesPipeline',
        fn: () => window.NotionConnector.revendeur.getSalesPipeline(testRevendeurId)
      },
      {
        name: 'getRevendeurSales',
        fn: () => window.NotionConnector.revendeur.getRevendeurSales(testRevendeurId)
      },
      {
        name: 'getRevendeurCommissions',
        fn: () => window.NotionConnector.revendeur.getRevendeurCommissions(testRevendeurId)
      },
      {
        name: 'getGeographicZones',
        fn: () => window.NotionConnector.revendeur.getGeographicZones(testRevendeurId)
      }
    ];
    
    for (const test of tests) {
      await this.runFunctionTest('revendeur', test.name, test.fn);
    }
  },
  
  // Tester les fonctions communes
  async testCommonFunctions() {
    console.log('\n🔗 Test fonctions COMMUNES');
    
    const tests = [
      {
        name: 'getMessageHistory',
        fn: () => window.NotionConnector.common.getMessageHistory('test_context', 'project')
      }
    ];
    
    for (const test of tests) {
      await this.runFunctionTest('common', test.name, test.fn);
    }
  },
  
  // Exécuter un test de fonction
  async runFunctionTest(module, functionName, testFn) {
    try {
      console.log(`  🔍 Test ${module}.${functionName}...`);
      
      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      // Vérifier que le résultat n'est pas null/undefined
      if (result !== null && result !== undefined) {
        console.log(`  ✅ ${functionName}: OK (${duration}ms)`);
        console.log(`     - Type: ${Array.isArray(result) ? 'Array' : typeof result}`);
        if (Array.isArray(result)) {
          console.log(`     - Éléments: ${result.length}`);
        } else if (typeof result === 'object') {
          console.log(`     - Propriétés: ${Object.keys(result).length}`);
        }
        
        this.testResults.set(`fn_${module}_${functionName}`, {
          status: true,
          duration,
          resultType: Array.isArray(result) ? 'Array' : typeof result,
          resultSize: Array.isArray(result) ? result.length : Object.keys(result || {}).length
        });
      } else {
        throw new Error('Résultat null ou undefined');
      }
      
    } catch (error) {
      console.error(`  ❌ ${functionName}: ${error.message}`);
      this.testResults.set(`fn_${module}_${functionName}`, {
        status: false,
        error: error.message
      });
    }
  },
  
  // Afficher le rapport final
  displayFinalReport() {
    console.log('\n📋 RAPPORT FINAL DE VALIDATION');
    console.log('==============================');
    
    const dbTests = Array.from(this.testResults.entries()).filter(([key]) => key.startsWith('db_'));
    const fnTests = Array.from(this.testResults.entries()).filter(([key]) => key.startsWith('fn_'));
    
    // Rapport des bases de données
    console.log('\n📊 BASES DE DONNÉES:');
    let dbSuccess = 0;
    dbTests.forEach(([key, result]) => {
      const dbName = key.replace('db_', '');
      if (result.status) {
        console.log(`✅ ${dbName}: Accessible (${result.propertyCount} propriétés)`);
        dbSuccess++;
      } else {
        console.log(`❌ ${dbName}: Erreur - ${result.error}`);
      }
    });
    console.log(`📊 Bases de données: ${dbSuccess}/${dbTests.length} accessibles`);
    
    // Rapport des fonctions
    console.log('\n🔧 FONCTIONS:');
    let fnSuccess = 0;
    fnTests.forEach(([key, result]) => {
      const fnName = key.replace('fn_', '').replace(/_/g, '.');
      if (result.status) {
        console.log(`✅ ${fnName}: OK (${result.duration}ms)`);
        fnSuccess++;
      } else {
        console.log(`❌ ${fnName}: Erreur - ${result.error}`);
      }
    });
    console.log(`🔧 Fonctions: ${fnSuccess}/${fnTests.length} opérationnelles`);
    
    // Statut global
    const overallSuccess = this.getOverallStatus();
    console.log('\n🎯 STATUT GLOBAL:');
    if (overallSuccess) {
      console.log('✅ TOUTES LES CONNEXIONS NOTION SONT OPÉRATIONNELLES');
    } else {
      console.log('⚠️ CERTAINES CONNEXIONS PRÉSENTENT DES PROBLÈMES');
    }
    
    // Recommandations
    this.displayRecommendations();
  },
  
  // Afficher les recommandations
  displayRecommendations() {
    console.log('\n💡 RECOMMANDATIONS:');
    
    const failedTests = Array.from(this.testResults.entries()).filter(([, result]) => !result.status);
    
    if (failedTests.length === 0) {
      console.log('✅ Aucune action requise - Toutes les connexions fonctionnent');
      return;
    }
    
    failedTests.forEach(([key, result]) => {
      if (key.startsWith('db_')) {
        const dbName = key.replace('db_', '');
        console.log(`🔧 ${dbName}: Vérifier l'ID de la base de données dans NOTION_DBS`);
        console.log(`   - ID actuel: ${window.NotionConnector?.DATABASES?.[dbName] || 'Non trouvé'}`);
        console.log(`   - Erreur: ${result.error}`);
      } else if (key.startsWith('fn_')) {
        const fnName = key.replace('fn_', '').replace(/_/g, '.');
        console.log(`🔧 ${fnName}: Problème dans l'implémentation de la fonction`);
        console.log(`   - Erreur: ${result.error}`);
      }
    });
    
    console.log('\n🚀 ACTIONS À EFFECTUER:');
    console.log('1. Vérifier les IDs des bases Notion dans le workspace');
    console.log('2. S\'assurer que les propriétés attendues existent dans les bases');
    console.log('3. Vérifier les permissions d\'accès aux bases de données');
    console.log('4. Tester avec de vrais IDs d\'utilisateurs/projets');
  },
  
  // Obtenir le statut global
  getOverallStatus() {
    const allTests = Array.from(this.testResults.values());
    const successfulTests = allTests.filter(result => result.status);
    return successfulTests.length === allTests.length && allTests.length > 0;
  },
  
  // Exporter les résultats
  exportResults() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.size,
        successful: Array.from(this.testResults.values()).filter(r => r.status).length,
        failed: Array.from(this.testResults.values()).filter(r => !r.status).length,
        overallStatus: this.getOverallStatus()
      },
      details: Object.fromEntries(this.testResults)
    };
    
    console.log('\n📤 EXPORT RÉSULTATS JSON:');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
};

// Auto-exécution si chargé dans le navigateur
if (typeof window !== 'undefined') {
  window.NotionValidation = NotionValidation;
  
  // Fonction d'aide pour lancer la validation
  window.validateNotionConnections = () => {
    return NotionValidation.init();
  };
  
  // Afficher les instructions dans la console
  console.log('🔧 VALIDATION NOTION MCP CHARGÉE');
  console.log('Pour lancer la validation, exécutez: validateNotionConnections()');
}

// Export pour Node.js si nécessaire
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotionValidation;
}