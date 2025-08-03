/**
 * OCR Test Manuel - Script de test direct
 * @version 1.0.0
 */

console.log('🧪 === TEST MANUEL OCR ===');

// Test automatique au chargement
window.addEventListener('DOMContentLoaded', () => {
  console.log('\n📁 TEST 1 - Vérification des éléments');
  
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  
  console.log('Dropzone:', dropzone ? '✅ Trouvée' : '❌ Manquante');
  console.log('File Input:', fileInput ? '✅ Trouvé' : '❌ Manquant');
  
  if (dropzone && fileInput) {
    console.log('\n📁 TEST 2 - Vérification des listeners');
    
    // Vérifier si le click fonctionne
    let clickWorked = false;
    const testClickHandler = () => {
      clickWorked = true;
      console.log('✅ Click détecté sur dropzone!');
    };
    
    dropzone.addEventListener('click', testClickHandler, { once: true });
    dropzone.click();
    
    if (!clickWorked) {
      console.error('❌ Click non détecté');
    }
    
    // Vérifier le file input
    fileInput.addEventListener('change', (e) => {
      console.log('✅ Change event détecté!');
      console.log('Fichiers:', e.target.files);
    });
  }
});

// Fonctions globales pour tests manuels
window.testOCRManual = {
  // Test 1: Click direct
  testClick: function() {
    console.log('\n🖱️ TEST CLICK');
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      dropzone.click();
      console.log('✅ Click envoyé');
    } else {
      console.error('❌ Dropzone non trouvée');
    }
  },
  
  // Test 2: Sélecteur fichier
  testFileInput: function() {
    console.log('\n📂 TEST FILE INPUT');
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
      console.log('✅ Sélecteur ouvert');
    } else {
      console.error('❌ File input non trouvé');
    }
  },
  
  // Test 3: Traitement forcé
  testProcess: async function() {
    console.log('\n🤖 TEST TRAITEMENT FORCÉ');
    const fileInput = document.getElementById('file-input');
    
    if (!fileInput || !fileInput.files[0]) {
      console.error('❌ Aucun fichier sélectionné');
      console.log('💡 Sélectionnez d\'abord un fichier avec testFileInput()');
      return;
    }
    
    const file = fileInput.files[0];
    console.log('📄 Fichier:', file.name, `(${(file.size/1024/1024).toFixed(2)} MB)`);
    
    // Méthode 1: OCRDragDropFix
    if (window.OCRDragDropFix && window.OCRDragDropFix.handleFiles) {
      console.log('Tentative 1: OCRDragDropFix.handleFiles');
      try {
        await window.OCRDragDropFix.handleFiles([file], document.getElementById('dropzone'));
        console.log('✅ Traitement lancé avec OCRDragDropFix');
      } catch (e) {
        console.error('❌ Erreur:', e);
      }
    }
    
    // Méthode 2: OCRProcessor direct
    else if (window.OCRProcessor && window.OCRProcessor.processSingleFile) {
      console.log('Tentative 2: OCRProcessor.processSingleFile');
      try {
        file.previewElement = document.createElement('div');
        await window.OCRProcessor.processSingleFile(file);
        console.log('✅ Traitement lancé avec OCRProcessor');
      } catch (e) {
        console.error('❌ Erreur:', e);
      }
    }
    
    else {
      console.error('❌ Aucun processeur OCR disponible');
    }
  },
  
  // Test 4: Créer fichier test
  testWithFakeFile: async function() {
    console.log('\n🧪 TEST AVEC FICHIER FACTICE');
    
    const content = 'TEST OCR CONTENT\nFacture #12345\nMontant: CHF 1\'234.56';
    const blob = new Blob([content], { type: 'text/plain' });
    const testFile = new File([blob], 'test-ocr.txt', { type: 'text/plain' });
    
    console.log('📄 Fichier test créé:', testFile.name);
    
    if (window.OCRProcessor && window.OCRProcessor.processSingleFile) {
      try {
        testFile.previewElement = document.createElement('div');
        await window.OCRProcessor.processSingleFile(testFile);
        console.log('✅ Traitement terminé');
      } catch (e) {
        console.error('❌ Erreur:', e);
      }
    }
  },
  
  // Test 5: Vérifier modules
  checkModules: function() {
    console.log('\n🔍 VÉRIFICATION MODULES');
    const modules = {
      'OCRProcessor': window.OCRProcessor,
      'OCRFallback': window.OCRFallback,
      'SwissPatterns': window.SwissPatterns,
      'OCRMetrics': window.OCRMetrics,
      'OCRDragDropFix': window.OCRDragDropFix,
      'Tesseract': window.Tesseract
    };
    
    Object.entries(modules).forEach(([name, module]) => {
      console.log(`${name}:`, module ? '✅ Chargé' : '❌ Manquant');
    });
    
    // Charger les modules manquants
    if (!window.OCRFallback || !window.SwissPatterns || !window.OCRMetrics) {
      console.log('\n🔄 Chargement des modules manquants...');
      if (window.OCRProcessor && window.OCRProcessor.loadDependencies) {
        window.OCRProcessor.loadDependencies().then(() => {
          console.log('✅ Modules chargés');
          this.checkModules();
        });
      }
    }
  }
};

// Instructions
console.log('\n💡 COMMANDES DISPONIBLES:');
console.log('testOCRManual.testClick()      - Tester le click sur dropzone');
console.log('testOCRManual.testFileInput()  - Ouvrir le sélecteur de fichier');
console.log('testOCRManual.testProcess()    - Traiter le fichier sélectionné');
console.log('testOCRManual.testWithFakeFile() - Test avec fichier factice');
console.log('testOCRManual.checkModules()   - Vérifier/charger les modules');
console.log('\n🎯 COMMENCEZ PAR: testOCRManual.checkModules()');