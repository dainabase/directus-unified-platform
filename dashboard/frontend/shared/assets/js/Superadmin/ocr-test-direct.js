/**
 * Test Direct OCR - Test Tesseract sans Worker complexe
 * @version 1.0.0
 */

console.log('🧪 === TEST DIRECT OCR ===');

// Test direct simple avec Tesseract
window.testOCRDirect = async function() {
  console.log('\n🚀 TEST TESSERACT DIRECT');
  
  const fileInput = document.getElementById('file-input');
  if (!fileInput || !fileInput.files[0]) {
    console.error('❌ Aucun fichier sélectionné');
    console.log('💡 Sélectionnez d\'abord un fichier');
    return;
  }
  
  const file = fileInput.files[0];
  console.log('📄 Fichier:', file.name, `(${(file.size/1024/1024).toFixed(2)} MB)`);
  
  try {
    console.log('🔄 Démarrage OCR...');
    const startTime = Date.now();
    
    // Test 1: Reconnaissance simple
    const result = await Tesseract.recognize(
      file,
      'fra+eng',
      {
        logger: info => console.log('OCR:', info)
      }
    );
    
    const duration = Date.now() - startTime;
    console.log(`✅ OCR terminé en ${duration}ms`);
    console.log('Confiance:', result.data.confidence + '%');
    console.log('\n📄 TEXTE EXTRAIT (200 premiers caractères):');
    console.log(result.data.text.substring(0, 200) + '...');
    
    // Extraction des données
    const text = result.data.text;
    console.log('\n🔍 EXTRACTION DES DONNÉES:');
    
    // Montants
    const montants = text.match(/CHF\s*[\d']+(?:[.,]\d{2})?/gi);
    if (montants) {
      console.log('Montants trouvés:', montants);
    }
    
    // Numéro de facture
    const numeroFacture = text.match(/(?:facture|invoice|rechnung)\s*(?:n°|nr\.?|#)?\s*:?\s*([A-Z0-9\-\/]+)/i);
    if (numeroFacture) {
      console.log('Numéro facture:', numeroFacture[1]);
    }
    
    // IBAN
    const iban = text.match(/CH\d{2}\s?(?:\d{4}\s?){4}\d/i);
    if (iban) {
      console.log('IBAN:', iban[0]);
    }
    
    // TVA
    const tva = text.match(/CHE[-\s]?(\d{3})[-.]?(\d{3})[-.]?(\d{3})/i);
    if (tva) {
      console.log('Numéro TVA:', tva[0]);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur OCR:', error);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifiez que le fichier est un PDF/image valide');
    console.log('2. Essayez avec un fichier plus petit');
    console.log('3. Rechargez la page et réessayez');
  }
};

// Test avec Worker simplifié
window.testOCRWorker = async function() {
  console.log('\n🤖 TEST AVEC WORKER SIMPLIFIÉ');
  
  try {
    // Créer un worker basique
    const worker = await Tesseract.createWorker({
      logger: console.log, // Logger très simple
      errorHandler: err => console.error('Worker error:', err)
    });
    
    await worker.loadLanguage('fra');
    await worker.initialize('fra');
    
    const fileInput = document.getElementById('file-input');
    if (!fileInput || !fileInput.files[0]) {
      console.error('❌ Aucun fichier sélectionné');
      await worker.terminate();
      return;
    }
    
    const result = await worker.recognize(fileInput.files[0]);
    console.log('✅ Résultat:', result.data.text.substring(0, 100) + '...');
    
    await worker.terminate();
    
  } catch (error) {
    console.error('❌ Erreur Worker:', error);
  }
};

// Instructions
console.log('\n💡 COMMANDES DISPONIBLES:');
console.log('testOCRDirect()  - Test OCR direct sans worker complexe');
console.log('testOCRWorker()  - Test avec worker simplifié');
console.log('\n🎯 COMMENCEZ PAR: testOCRDirect()');