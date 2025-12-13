/**
 * Tests OCR corrigés - Vérification du système OCR Hybrid
 * Version avec toutes les corrections appliquées
 */

console.log('🧪 === TESTS OCR HYBRID CORRIGÉS ===\n');

// Classe de test mise à jour
class OCRHybridTesterFixed {
    constructor() {
        this.results = [];
        this.processor = null;
    }

    async init() {
        try {
            this.processor = new OCRHybridProcessor();
            await this.processor.init();
            return true;
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            return false;
        }
    }

    async runAllTests() {
        console.log('🚀 Démarrage des tests OCR corrigés...\n');
        
        // Initialiser le processeur
        const initialized = await this.init();
        if (!initialized) {
            console.error('❌ Impossible d\'initialiser le processeur OCR');
            return;
        }
        
        // 1. Test des méthodes publiques
        await this.testPublicMethods();
        
        // 2. Test extraction basique
        await this.testBasicExtraction();
        
        // 3. Test construction prompt
        await this.testBuildPrompt();
        
        // 4. Test validation et normalisation
        await this.testValidateAndNormalize();
        
        // 5. Test structure de données
        await this.testDataStructure();
        
        // Afficher le résumé
        this.showSummary();
    }

    async testPublicMethods() {
        console.log('🔧 Test 1: Vérification des méthodes publiques...');
        
        const methods = {
            'processDocument': typeof this.processor.processDocument === 'function',
            'basicExtraction': typeof this.processor.basicExtraction === 'function',
            'buildPrompt': typeof this.processor.buildPrompt === 'function',
            'validateAndNormalize': typeof this.processor.validateAndNormalize === 'function'
        };
        
        let allOk = true;
        for (const [name, exists] of Object.entries(methods)) {
            console.log(`  ${exists ? '✅' : '❌'} ${name}()`);
            if (!exists) allOk = false;
        }
        
        this.results.push({
            test: 'Méthodes publiques',
            success: allOk,
            details: methods
        });
        
        console.log('');
    }

    async testBasicExtraction() {
        console.log('📄 Test 2: Extraction basique...');
        
        try {
            const testText = `
HYPERVISUAL by HMF Corporation SA
Avenue de Beauregard 1
1700 Fribourg

FACTURE N° HYP-2025-001
Date: 15.01.2025

Microsoft Azure
Redmond, WA

Services cloud                CHF 5'000.00
Support technique            CHF 3'500.00

Sous-total                   CHF 8'500.00
TVA 8.1%                     CHF   688.50
TOTAL                        CHF 9'154.50
`;
            
            const result = this.processor.basicExtraction(testText);
            
            console.log('  Résultats extraction:');
            console.log(`  - Type: ${result.document_type}`);
            console.log(`  - Entité: ${result.entity}`);
            console.log(`  - Fournisseur: ${result.extracted_data.fournisseur}`);
            console.log(`  - Montant TTC: ${result.extracted_data.montant_ttc} ${result.currency}`);
            console.log(`  - Confiance: ${result.confidence}`);
            
            // Vérifications
            const checks = {
                type_correct: result.document_type === 'facture_fournisseur',
                entity_correct: result.entity === 'hypervisual',
                fournisseur_string: typeof result.extracted_data.fournisseur === 'string',
                montant_correct: result.extracted_data.montant_ttc === 9154.50,
                confidence_number: typeof result.confidence === 'number'
            };
            
            const success = Object.values(checks).every(v => v === true);
            
            this.results.push({
                test: 'Extraction basique',
                success: success,
                details: checks
            });
            
            console.log(`  ${success ? '✅ Test réussi' : '❌ Test échoué'}\n`);
            
        } catch (error) {
            console.error('  ❌ Erreur:', error.message);
            this.results.push({
                test: 'Extraction basique',
                success: false,
                error: error.message
            });
        }
    }

    async testBuildPrompt() {
        console.log('📝 Test 3: Construction de prompt...');
        
        try {
            const testText = 'FACTURE test avec montant CHF 1000';
            const prompt = this.processor.buildPrompt(testText, 'invoice');
            
            console.log('  Prompt généré (extrait):');
            console.log(`  ${prompt.substring(0, 100)}...`);
            
            const checks = {
                prompt_string: typeof prompt === 'string',
                contains_text: prompt.includes(testText),
                contains_structure: prompt.includes('JSON'),
                min_length: prompt.length > 500
            };
            
            const success = Object.values(checks).every(v => v === true);
            
            this.results.push({
                test: 'Construction prompt',
                success: success,
                details: checks
            });
            
            console.log(`  ${success ? '✅ Test réussi' : '❌ Test échoué'}\n`);
            
        } catch (error) {
            console.error('  ❌ Erreur:', error.message);
            this.results.push({
                test: 'Construction prompt',
                success: false,
                error: error.message
            });
        }
    }

    async testValidateAndNormalize() {
        console.log('✅ Test 4: Validation et normalisation...');
        
        try {
            // Données avec erreur de calcul et fournisseur non-string
            const testData = {
                document_type: 'facture_fournisseur',
                entity: 'hypervisual',
                currency: 'CHF',
                extracted_data: {
                    montant_ht: 1000,
                    taux_tva: 8.1,
                    montant_tva: 77,
                    montant_ttc: 1076, // Erreur: devrait être 1077
                    fournisseur: null  // Test cas null
                }
            };
            
            const result = await this.processor.validateAndNormalize(testData);
            
            console.log('  Validation effectuée:');
            console.log(`  - Erreurs détectées: ${result.validation_errors.length}`);
            console.log(`  - Warnings: ${result.validation_warnings.length}`);
            console.log(`  - Fournisseur normalisé: "${result.extracted_data.fournisseur}"`);
            console.log(`  - Type fournisseur: ${typeof result.extracted_data.fournisseur}`);
            
            if (result.validation_errors.length > 0) {
                console.log('  - Correction appliquée:', result.extracted_data.montant_ttc);
            }
            
            const checks = {
                errors_detected: result.validation_errors.length === 1,
                amount_corrected: result.extracted_data.montant_ttc === 1077,
                fournisseur_string: typeof result.extracted_data.fournisseur === 'string',
                fournisseur_default: result.extracted_data.fournisseur === 'Fournisseur non identifié'
            };
            
            const success = Object.values(checks).every(v => v === true);
            
            this.results.push({
                test: 'Validation et normalisation',
                success: success,
                details: checks
            });
            
            console.log(`  ${success ? '✅ Test réussi' : '❌ Test échoué'}\n`);
            
        } catch (error) {
            console.error('  ❌ Erreur:', error.message);
            this.results.push({
                test: 'Validation et normalisation',
                success: false,
                error: error.message
            });
        }
    }

    async testDataStructure() {
        console.log('🏗️ Test 5: Structure de données cohérente...');
        
        try {
            // Test avec différents cas de fournisseur
            const testCases = [
                { fournisseur: 'Microsoft', expected: 'Microsoft' },
                { fournisseur: { nom: 'Apple Inc.' }, expected: 'Apple Inc.' },
                { fournisseur: null, expected: 'Fournisseur non identifié' },
                { fournisseur: undefined, expected: 'Fournisseur non identifié' },
                { fournisseur: 123, expected: '123' }
            ];
            
            let allPassed = true;
            
            for (const testCase of testCases) {
                const basicData = { 
                    fournisseur: 'Default',
                    montant_ttc: 100 
                };
                const smartData = { 
                    fournisseur: testCase.fournisseur,
                    montant_ttc: 200
                };
                
                const merged = this.processor.mergeResults(basicData, smartData);
                const isString = typeof merged.fournisseur === 'string';
                const isCorrect = merged.fournisseur === testCase.expected;
                
                console.log(`  - Fournisseur ${JSON.stringify(testCase.fournisseur)} → "${merged.fournisseur}" ${isCorrect ? '✅' : '❌'}`);
                
                if (!isString || !isCorrect) {
                    allPassed = false;
                }
            }
            
            this.results.push({
                test: 'Structure de données',
                success: allPassed,
                details: { tested_cases: testCases.length }
            });
            
            console.log(`  ${allPassed ? '✅ Tous les cas passent' : '❌ Certains cas échouent'}\n`);
            
        } catch (error) {
            console.error('  ❌ Erreur:', error.message);
            this.results.push({
                test: 'Structure de données',
                success: false,
                error: error.message
            });
        }
    }

    showSummary() {
        console.log('📊 === RÉSUMÉ DES TESTS ===\n');
        
        let passed = 0;
        let failed = 0;
        
        this.results.forEach(result => {
            if (result.success) {
                console.log(`✅ ${result.test}: RÉUSSI`);
                passed++;
            } else {
                console.log(`❌ ${result.test}: ÉCHOUÉ`);
                if (result.error) {
                    console.log(`   Erreur: ${result.error}`);
                }
                if (result.details) {
                    console.log(`   Détails:`, result.details);
                }
                failed++;
            }
        });
        
        const total = passed + failed;
        const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
        
        console.log(`\n📈 Score: ${passed}/${total} tests réussis (${percentage}%)`);
        
        if (failed === 0 && passed > 0) {
            console.log('\n🎉 Tous les tests sont passés avec succès !');
            console.log('✅ Le système OCR Hybrid est maintenant stable et fonctionnel.');
        } else if (failed > 0) {
            console.log('\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
        }
        
        return {
            passed,
            failed,
            total,
            percentage
        };
    }
}

// Fonction globale pour lancer les tests
window.runOCRTestsFixed = async function() {
    const tester = new OCRHybridTesterFixed();
    const results = await tester.runAllTests();
    return results;
};

// Documentation pour l'utilisateur
console.log('💡 UTILISATION:');
console.log('- runOCRTestsFixed() : Lancer tous les tests corrigés');
console.log('- Vérifier que OCRHybridProcessor est chargé');
console.log('');

// Auto-run si demandé
if (window.autoRunOCRTests) {
    console.log('🚀 Lancement automatique des tests...\n');
    runOCRTestsFixed();
}