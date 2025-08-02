/**
 * OCR Test Suite - Tests de performance et qualité
 * @version 1.0.0
 */
const OCRTestSuite = {
  testResults: [],
  isRunning: false,
  
  /**
   * Configuration des tests
   */
  testConfigs: [
    {
      name: 'Facture simple PDF',
      file: 'simple_invoice.pdf',
      expectedTime: 2000,
      minAccuracy: 0.95,
      requiredFields: ['supplier.name', 'invoice.number', 'amounts.total'],
      testData: {
        type: 'application/pdf',
        size: 500000, // 500KB
        content: 'mock' // Sera remplacé par un vrai fichier
      }
    },
    {
      name: 'Facture complexe multi-pages',
      file: 'complex_invoice.pdf',
      expectedTime: 5000,
      minAccuracy: 0.85,
      requiredFields: ['supplier.name', 'supplier.vatNumber', 'invoice.number', 'amounts.total', 'banking.iban'],
      testData: {
        type: 'application/pdf',
        size: 2000000, // 2MB
        content: 'mock'
      }
    },
    {
      name: 'Image JPG haute résolution',
      file: 'hires_invoice.jpg',
      expectedTime: 3000,
      minAccuracy: 0.90,
      requiredFields: ['supplier.name', 'amounts.total'],
      testData: {
        type: 'image/jpeg',
        size: 3000000, // 3MB
        content: 'mock'
      }
    },
    {
      name: 'Document manuscrit',
      file: 'handwritten.jpg',
      expectedTime: 8000,
      minAccuracy: 0.70,
      requiredFields: ['amounts.total'],
      testData: {
        type: 'image/jpeg',
        size: 1000000, // 1MB
        content: 'mock'
      }
    },
    {
      name: 'Facture Swisscom',
      file: 'swisscom_invoice.pdf',
      expectedTime: 3000,
      minAccuracy: 0.95,
      requiredFields: ['supplier.name', 'supplier.vatNumber', 'invoice.number', 'amounts.total'],
      expectedValues: {
        'supplier.name': /Swisscom/i,
        'supplier.vatNumber': /CHE-\d{3}\.\d{3}\.\d{3}/
      },
      testData: {
        type: 'application/pdf',
        size: 800000,
        content: 'mock'
      }
    },
    {
      name: 'QR-Facture',
      file: 'qr_bill.pdf',
      expectedTime: 2500,
      minAccuracy: 0.98,
      requiredFields: ['banking.iban', 'amounts.total', 'reference.qr'],
      testData: {
        type: 'application/pdf',
        size: 400000,
        content: 'mock'
      }
    }
  ],
  
  /**
   * Lancer tous les tests
   */
  async runAllTests() {
    if (this.isRunning) {
      console.warn('Tests déjà en cours');
      return;
    }
    
    this.isRunning = true;
    this.testResults = [];
    
    console.log('🧪 Démarrage de la suite de tests OCR...');
    this.showTestUI();
    
    for (const testConfig of this.testConfigs) {
      await this.runSingleTest(testConfig);
    }
    
    this.isRunning = false;
    this.showSummary();
    
    // Sauvegarder les résultats
    this.saveResults();
    
    return this.testResults;
  },
  
  /**
   * Exécuter un test unique
   */
  async runSingleTest(config) {
    console.log(`\n📋 Test: ${config.name}`);
    
    const result = {
      name: config.name,
      timestamp: new Date().toISOString(),
      status: 'running',
      duration: 0,
      accuracy: 0,
      passed: false,
      errors: [],
      extractedData: null
    };
    
    this.updateTestUI(config.name, 'running');
    
    try {
      // Créer un fichier de test
      const testFile = await this.createTestFile(config);
      
      const startTime = performance.now();
      
      // Appeler OCR Processor
      const ocrResult = await this.processWithOCR(testFile);
      
      result.duration = performance.now() - startTime;
      result.extractedData = ocrResult.extractedData;
      result.accuracy = ocrResult.confidence || 0;
      
      // Vérifier les critères
      result.passed = this.validateResult(config, result, ocrResult);
      result.status = result.passed ? 'passed' : 'failed';
      
    } catch (error) {
      result.status = 'error';
      result.errors.push(error.message);
      console.error(`❌ Erreur test ${config.name}:`, error);
    }
    
    this.testResults.push(result);
    this.updateTestUI(config.name, result.status, result);
    
    // Pause entre les tests
    await this.sleep(500);
    
    return result;
  },
  
  /**
   * Traiter avec OCR
   */
  async processWithOCR(file) {
    // Simuler l'appel OCR ou utiliser le vrai processor
    if (window.OCRProcessor) {
      return new Promise((resolve, reject) => {
        // Intercepter le résultat
        const originalHandler = window.OCRProcessor.handleOCRResult;
        
        window.OCRProcessor.handleOCRResult = (file, result) => {
          window.OCRProcessor.handleOCRResult = originalHandler;
          resolve(result);
        };
        
        // Lancer le traitement
        window.OCRProcessor.processSingleFile(file).catch(reject);
      });
    } else {
      // Mode simulation
      return this.simulateOCR(file);
    }
  },
  
  /**
   * Valider le résultat d'un test
   */
  validateResult(config, result, ocrResult) {
    const errors = [];
    
    // Vérifier le temps
    if (result.duration > config.expectedTime) {
      errors.push(`Temps dépassé: ${Math.round(result.duration)}ms > ${config.expectedTime}ms`);
    }
    
    // Vérifier la précision
    if (result.accuracy < config.minAccuracy) {
      errors.push(`Précision insuffisante: ${result.accuracy} < ${config.minAccuracy}`);
    }
    
    // Vérifier les champs requis
    if (config.requiredFields) {
      for (const field of config.requiredFields) {
        const value = this.getNestedValue(ocrResult.extractedData, field);
        if (!value) {
          errors.push(`Champ manquant: ${field}`);
        }
      }
    }
    
    // Vérifier les valeurs attendues
    if (config.expectedValues) {
      for (const [field, pattern] of Object.entries(config.expectedValues)) {
        const value = this.getNestedValue(ocrResult.extractedData, field);
        if (!value || !pattern.test(value)) {
          errors.push(`Valeur incorrecte pour ${field}: ${value}`);
        }
      }
    }
    
    result.errors = errors;
    return errors.length === 0;
  },
  
  /**
   * Interface de test
   */
  showTestUI() {
    // Créer ou mettre à jour l'UI
    let testUI = document.getElementById('ocr-test-ui');
    if (!testUI) {
      testUI = document.createElement('div');
      testUI.id = 'ocr-test-ui';
      testUI.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        max-height: 80vh;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        overflow: hidden;
      `;
      document.body.appendChild(testUI);
    }
    
    testUI.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #eee;">
        <h3 style="margin: 0;">🧪 Tests OCR en cours...</h3>
        <div style="margin-top: 10px;">
          <div style="background: #e3f2fd; height: 4px; border-radius: 2px;">
            <div id="test-progress" style="background: #2196f3; height: 100%; width: 0%; transition: width 0.3s;"></div>
          </div>
        </div>
      </div>
      <div id="test-results" style="padding: 20px; max-height: 400px; overflow-y: auto;">
        ${this.testConfigs.map(config => `
          <div class="test-item" data-test="${config.name}" style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
            <div style="display: flex; align-items: center;">
              <span class="test-status" style="margin-right: 10px;">⏳</span>
              <span style="flex: 1;">${config.name}</span>
              <span class="test-time" style="color: #666; font-size: 12px;"></span>
            </div>
            <div class="test-details" style="display: none; margin-top: 10px; font-size: 12px; color: #666;"></div>
          </div>
        `).join('')}
      </div>
      <div style="padding: 20px; border-top: 1px solid #eee;">
        <button onclick="OCRTestSuite.closeTestUI()" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Fermer
        </button>
      </div>
    `;
  },
  
  /**
   * Mettre à jour l'UI d'un test
   */
  updateTestUI(testName, status, result = null) {
    const testItem = document.querySelector(`[data-test="${testName}"]`);
    if (!testItem) return;
    
    const statusEl = testItem.querySelector('.test-status');
    const timeEl = testItem.querySelector('.test-time');
    const detailsEl = testItem.querySelector('.test-details');
    
    const statusIcons = {
      running: '⏳',
      passed: '✅',
      failed: '❌',
      error: '⚠️'
    };
    
    statusEl.textContent = statusIcons[status] || '❓';
    
    if (result) {
      timeEl.textContent = `${Math.round(result.duration)}ms`;
      
      if (result.errors && result.errors.length > 0) {
        detailsEl.style.display = 'block';
        detailsEl.innerHTML = result.errors.map(e => `<div>• ${e}</div>`).join('');
      }
    }
    
    // Mettre à jour la progression
    const completed = this.testResults.length;
    const total = this.testConfigs.length;
    const progress = (completed / total) * 100;
    
    const progressBar = document.getElementById('test-progress');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  },
  
  /**
   * Afficher le résumé
   */
  showSummary() {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const avgDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / total;
    const avgAccuracy = this.testResults.reduce((sum, r) => sum + r.accuracy, 0) / total;
    
    const summary = `
      <div style="padding: 20px; background: #e8f5e9; border-radius: 8px; margin: 20px;">
        <h3 style="margin: 0 0 15px 0;">📊 Résumé des tests</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>Tests réussis:</strong> ${passed}/${total}</div>
          <div><strong>Taux de réussite:</strong> ${Math.round(passed/total * 100)}%</div>
          <div><strong>Temps moyen:</strong> ${Math.round(avgDuration)}ms</div>
          <div><strong>Précision moyenne:</strong> ${Math.round(avgAccuracy * 100)}%</div>
        </div>
      </div>
    `;
    
    const testUI = document.getElementById('ocr-test-ui');
    if (testUI) {
      const resultsDiv = testUI.querySelector('#test-results');
      resultsDiv.innerHTML = summary + resultsDiv.innerHTML;
    }
    
    console.log('📊 Résumé des tests OCR:');
    console.table(this.testResults.map(r => ({
      Test: r.name,
      Statut: r.passed ? '✅' : '❌',
      Durée: `${Math.round(r.duration)}ms`,
      Précision: `${Math.round(r.accuracy * 100)}%`,
      Erreurs: r.errors.length
    })));
  },
  
  /**
   * Sauvegarder les résultats
   */
  saveResults() {
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.passed).length,
        failed: this.testResults.filter(r => !r.passed).length
      },
      details: this.testResults
    };
    
    localStorage.setItem('ocr_test_results', JSON.stringify(results));
    
    // Envoyer au système de metrics si disponible
    if (window.OCRMetrics) {
      window.OCRMetrics.trackProcessing({
        mode: 'test',
        duration: results.details.reduce((sum, r) => sum + r.duration, 0),
        success: results.summary.passed === results.summary.total,
        metadata: results
      });
    }
  },
  
  // Utilitaires
  createTestFile(config) {
    // Créer un fichier mock pour les tests
    const blob = new Blob(['Test content'], { type: config.testData.type });
    const file = new File([blob], config.file, { type: config.testData.type });
    
    // Ajouter les propriétés nécessaires
    Object.defineProperty(file, 'size', { value: config.testData.size });
    
    return file;
  },
  
  simulateOCR(file) {
    // Simulation pour les tests
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          confidence: 0.85 + Math.random() * 0.15,
          text: 'Simulated OCR text...',
          extractedData: {
            supplier: { name: 'Test Supplier', vatNumber: 'CHE-123.456.789' },
            invoice: { number: 'INV-2025-001', date: '25.07.2025' },
            amounts: { total: { value: 1234.56, formatted: 'CHF 1\'234.56' } },
            banking: { iban: 'CH93 0076 2011 6238 5295 7' }
          },
          metadata: {
            processingTime: Math.random() * 2000,
            language: 'fra'
          }
        });
      }, Math.random() * 3000);
    });
  },
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  },
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  closeTestUI() {
    const testUI = document.getElementById('ocr-test-ui');
    if (testUI) testUI.remove();
  }
};

// Export global
window.OCRTestSuite = OCRTestSuite;