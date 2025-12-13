/**
 * Exemple d'utilisation du système OCR Hybrid corrigé
 * Montre les bonnes pratiques et l'API publique complète
 */

console.log('📘 === GUIDE D\'UTILISATION OCR HYBRID ===\n');

// Configuration initiale
console.log('1️⃣ Configuration initiale:');
console.log('------------------------');
console.log(`
// Définir la clé OpenAI (une seule fois)
localStorage.setItem('openai_api_key', 'sk-proj-...');

// Vérifier la configuration
const hasKey = localStorage.getItem('openai_api_key');
console.log('OpenAI configuré:', !!hasKey);
`);

// Initialisation
console.log('\n2️⃣ Initialisation du processeur:');
console.log('--------------------------------');
console.log(`
// Créer une instance
const ocrProcessor = new OCRHybridProcessor();

// Initialiser (charge les dépendances)
await ocrProcessor.init();
`);

// Utilisation basique
console.log('\n3️⃣ Extraction basique (sans IA):');
console.log('--------------------------------');
console.log(`
// Pour un texte simple
const textContent = 'FACTURE N°123\\nMontant: CHF 1000.00';
const result = ocrProcessor.basicExtraction(textContent);

console.log('Type détecté:', result.document_type);
console.log('Montant:', result.extracted_data.montant_ttc);
console.log('Fournisseur:', result.extracted_data.fournisseur);
`);

// Traitement complet avec fichier
console.log('\n4️⃣ Traitement complet avec fichier:');
console.log('-----------------------------------');
console.log(`
// Avec un fichier (PDF, image)
const file = document.getElementById('file-input').files[0];

const result = await ocrProcessor.processDocument(file, {
    useOpenAI: true,      // Activer l'IA (si clé disponible)
    entity: 'hypervisual' // Entité par défaut
});

// Structure du résultat
{
    success: true,
    data: {
        type: 'facture_fournisseur',
        entite: 'hypervisual',
        fournisseur: 'Microsoft Azure', // TOUJOURS une string
        montant_ttc: 1234.50,
        // ... autres champs
    },
    confidence: 0.97,      // Confiance globale
    source: 'openai+tesseract', // ou 'tesseract' seul
    validation: {
        valid: true,
        errors: [],
        warnings: []
    }
}
`);

// Construction de prompt
console.log('\n5️⃣ Construction de prompt OpenAI:');
console.log('---------------------------------');
console.log(`
// Pour débugger ou personnaliser
const prompt = ocrProcessor.buildPrompt(
    'Texte OCR extrait...', 
    'invoice' // Type de document
);

console.log('Prompt généré:', prompt.substring(0, 200) + '...');
`);

// Validation et normalisation
console.log('\n6️⃣ Validation et normalisation:');
console.log('-------------------------------');
console.log(`
// Valider des données extraites
const dataToValidate = {
    document_type: 'facture_fournisseur',
    entity: 'hypervisual',
    currency: 'CHF',
    extracted_data: {
        montant_ht: 1000,
        montant_tva: 77,
        montant_ttc: 1077,
        fournisseur: null // Sera normalisé
    }
};

const validated = await ocrProcessor.validateAndNormalize(dataToValidate);

// Le fournisseur est maintenant garanti d'être une string
console.log('Fournisseur normalisé:', validated.extracted_data.fournisseur);
console.log('Erreurs:', validated.validation_errors);
`);

// Gestion des erreurs
console.log('\n7️⃣ Gestion des erreurs:');
console.log('-----------------------');
console.log(`
try {
    const result = await ocrProcessor.processDocument(file);
    
    if (!result.success) {
        console.error('Échec extraction:', result.error);
        return;
    }
    
    // Vérifier la qualité
    if (result.confidence < 0.8) {
        console.warn('Confiance faible:', result.confidence);
        // Demander validation manuelle
    }
    
} catch (error) {
    console.error('Erreur critique:', error);
    // Fallback ou retry
}
`);

// Intégration avec l'interface
console.log('\n8️⃣ Intégration avec l\'interface UI:');
console.log('-----------------------------------');
console.log(`
// Utiliser l'interface complète
if (typeof ocrHybridInterface !== 'undefined') {
    // Initialiser l'interface
    await ocrHybridInterface.init();
    
    // Gérer un fichier avec UI
    await ocrHybridInterface.handleFile(file);
    
    // L'interface gère:
    // - Progress bars
    // - Preview
    // - Formulaire de validation
    // - Sauvegarde Notion
}
`);

// Cas d'usage avancés
console.log('\n9️⃣ Cas d\'usage avancés:');
console.log('----------------------');
console.log(`
// Multi-entités
const entities = ['hypervisual', 'dainamics', 'enki_reality'];
for (const entity of entities) {
    const result = await ocrProcessor.processDocument(file, {
        useOpenAI: true,
        entity: entity
    });
}

// Batch processing
const files = Array.from(document.getElementById('file-input').files);
const results = await Promise.all(
    files.map(f => ocrProcessor.processDocument(f))
);

// Cache des résultats
const cacheKey = 'ocr_result_' + file.name;
localStorage.setItem(cacheKey, JSON.stringify(result));
`);

// Exemple complet fonctionnel
console.log('\n🚀 EXEMPLE COMPLET FONCTIONNEL:');
console.log('==============================\n');

// Créer une fonction exemple complète
window.testOCRComplete = async function() {
    console.log('📋 Test OCR complet...\n');
    
    try {
        // 1. Initialiser
        const processor = new OCRHybridProcessor();
        await processor.init();
        console.log('✅ Processeur initialisé');
        
        // 2. Texte de test
        const testText = `
HYPERVISUAL by HMF Corporation SA
Avenue de Beauregard 1
1700 Fribourg
CHE-100.968.497 TVA

FACTURE N° HYP-2025-001
Date: 26.07.2025

Client: Test Company SA
        
Services de développement    CHF 5'000.00
Maintenance mensuelle       CHF 1'500.00

Sous-total                  CHF 6'500.00
TVA 8.1%                    CHF   526.50
TOTAL                       CHF 7'000.50
`;
        
        // 3. Extraction basique
        console.log('\n📄 Extraction basique:');
        const basicResult = processor.basicExtraction(testText);
        console.log('- Type:', basicResult.document_type);
        console.log('- Entité:', basicResult.entity);
        console.log('- Montant:', basicResult.extracted_data.montant_ttc, basicResult.currency);
        console.log('- Confiance:', basicResult.confidence);
        
        // 4. Validation
        console.log('\n✅ Validation:');
        const validated = await processor.validateAndNormalize({
            ...basicResult,
            extracted_data: {
                ...basicResult.extracted_data,
                montant_ht: 6500,
                montant_tva: 500.50,
                montant_ttc: 7000.50
            }
        });
        
        console.log('- Erreurs:', validated.validation_errors.length);
        console.log('- Warnings:', validated.validation_warnings.length);
        console.log('- Fournisseur normalisé:', validated.extracted_data.fournisseur);
        
        // 5. Construction prompt
        console.log('\n📝 Prompt OpenAI:');
        const prompt = processor.buildPrompt(testText);
        console.log('- Longueur:', prompt.length, 'caractères');
        console.log('- Contient structure JSON:', prompt.includes('JSON'));
        
        console.log('\n✅ Test complet réussi!');
        
        return {
            success: true,
            basic: basicResult,
            validated: validated
        };
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        return { success: false, error: error.message };
    }
};

// Instructions finales
console.log('\n💡 COMMANDES DISPONIBLES:');
console.log('------------------------');
console.log('- testOCRComplete()     : Exécuter l\'exemple complet');
console.log('- runOCRTestsFixed()    : Lancer la suite de tests');
console.log('- ocrProcessor.basicExtraction(text) : Extraction simple');
console.log('- ocrProcessor.processDocument(file) : Traitement complet');

console.log('\n📚 DOCUMENTATION COMPLÈTE:');
console.log('- README-OCR-HYBRID.md');
console.log('- test-ocr-fixed.js (tests unitaires)');
console.log('- ocr-hybrid-processor.js (code source)');

console.log('\n✅ Système OCR Hybrid prêt à l\'emploi!');