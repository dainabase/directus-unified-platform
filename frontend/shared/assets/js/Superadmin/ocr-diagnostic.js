/**
 * OCR Diagnostic Complet - Script d'analyse approfondie
 * @version 1.0.0
 */

console.log('🔍 === DIAGNOSTIC OCR COMPLET ===');

// 1. TEST DES EVENT LISTENERS
console.log('\n📌 1. TEST EVENT LISTENERS');
const dropzone = document.getElementById('dropzone');
console.log('Dropzone trouvée:', dropzone);

if (dropzone) {
  // Vérifier les listeners (méthode alternative car getEventListeners n'existe que dans Chrome DevTools)
  const events = ['dragenter', 'dragover', 'dragleave', 'drop', 'click'];
  events.forEach(event => {
    const hasListener = dropzone['on' + event] !== null;
    console.log(`Event ${event}:`, hasListener ? '✅ Handler défini' : '❌ Pas de handler');
  });
}

// 2. TEST SÉLECTION FICHIER
console.log('\n📌 2. TEST SÉLECTION FICHIER');
const fileInputs = document.querySelectorAll('input[type="file"]');
console.log('Inputs fichier trouvés:', fileInputs.length);
fileInputs.forEach((input, idx) => {
  console.log(`Input ${idx}:`, {
    id: input.id,
    accept: input.accept,
    multiple: input.multiple,
    files: input.files?.length || 0
  });
});

// 3. VÉRIFICATION WORKFLOW COMPLET
console.log('\n📌 3. VÉRIFICATION WORKFLOW');
console.log('OCRProcessor existe:', typeof window.OCRProcessor);
console.log('OCRProcessor.dropzone:', window.OCRProcessor?.dropzone);
console.log('Dropzone.js chargé:', typeof window.Dropzone);
console.log('Tesseract chargé:', typeof window.Tesseract);

// 4. ÉTAT DES MODULES
console.log('\n📌 4. ÉTAT DES MODULES');
console.log('OCRFallback:', typeof window.OCRFallback);
console.log('SwissPatterns:', typeof window.SwissPatterns);
console.log('OCRMetrics:', typeof window.OCRMetrics);
console.log('OCRDragDropFix:', typeof window.OCRDragDropFix);

// 5. VÉRIFICATION DROPZONE INSTANCE
console.log('\n📌 5. DROPZONE INSTANCE');
if (window.Dropzone && dropzone) {
  console.log('Dropzone instances:', Dropzone.instances);
  const dzInstance = dropzone.dropzone;
  console.log('Instance sur element:', dzInstance);
  if (dzInstance) {
    console.log('Files queue:', dzInstance.files);
    console.log('Options:', dzInstance.options);
  }
}

// 6. TEST DRAG & DROP MANUEL
console.log('\n📌 6. TEST DRAG & DROP');
window.testDragDrop = function() {
  const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  console.log('Fichier test créé:', testFile);
  
  if (window.OCRProcessor && window.OCRProcessor.processSingleFile) {
    console.log('Lancement traitement OCR...');
    window.OCRProcessor.processSingleFile(testFile)
      .then(result => console.log('✅ Résultat OCR:', result))
      .catch(err => console.error('❌ Erreur OCR:', err));
  } else {
    console.error('❌ OCRProcessor.processSingleFile non disponible');
  }
};

// 7. VÉRIFICATION CONFIGURATION
console.log('\n📌 7. CONFIGURATION');
console.log('Service URL:', window.OCRProcessor?.OCR_SERVICE_URL);
console.log('Max file size:', window.OCRProcessor?.MAX_FILE_SIZE);
console.log('Auth token:', localStorage.getItem('auth_token') ? '✅ Présent' : '❌ Absent');

// 8. TEST INITIALISATION FORCÉE
console.log('\n📌 8. INITIALISATION FORCÉE');
window.forceInitOCR = function() {
  console.log('Forçage initialisation OCR...');
  if (window.OCRProcessor && window.OCRProcessor.init) {
    window.OCRProcessor.init();
    console.log('✅ OCRProcessor.init() appelé');
  } else {
    console.error('❌ OCRProcessor.init non disponible');
  }
};

// 9. ANALYSE DES ERREURS
console.log('\n📌 9. RECHERCHE D\'ERREURS');
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 ERREUR CAPTURÉE:', ...args);
  originalError.apply(console, args);
};

// 10. RÉSUMÉ
console.log('\n📊 RÉSUMÉ DIAGNOSTIC');
const summary = {
  dropzoneElement: !!dropzone,
  ocrProcessor: !!window.OCRProcessor,
  dropzoneJS: !!window.Dropzone,
  dropzoneInstance: !!(dropzone?.dropzone),
  tesseractJS: !!window.Tesseract,
  modules: {
    fallback: !!window.OCRFallback,
    patterns: !!window.SwissPatterns,
    metrics: !!window.OCRMetrics,
    dragdrop: !!window.OCRDragDropFix
  }
};

console.table(summary);

console.log('\n💡 ACTIONS DISPONIBLES:');
console.log('- testDragDrop() : Tester le traitement OCR avec un fichier factice');
console.log('- forceInitOCR() : Forcer l\'initialisation du module OCR');

console.log('\n🔍 === FIN DIAGNOSTIC OCR ===');