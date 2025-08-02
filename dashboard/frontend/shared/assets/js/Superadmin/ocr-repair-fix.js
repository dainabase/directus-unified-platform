/**
 * OCR Repair Script
 * Corrige les erreurs de syntaxe et de structure
 */

console.log('🔧 OCR Repair Script - Starting...');

// Vérification des dépendances
const checkDependencies = () => {
    const deps = {
        'Tesseract': typeof Tesseract !== 'undefined',
        'pdfjsLib': typeof pdfjsLib !== 'undefined',
        'OCRHybridProcessor': typeof OCRHybridProcessor !== 'undefined',
        'OCRAPIClient': typeof OCRAPIClient !== 'undefined',
        'OCRPremiumInterface': typeof OCRPremiumInterface !== 'undefined'
    };
    
    console.log('📋 Dépendances:', deps);
    return deps;
};

// Correction de la classe OCRPremiumInterface si nécessaire
const fixOCRPremiumInterface = () => {
    if (typeof OCRPremiumInterface === 'undefined') {
        console.error('❌ OCRPremiumInterface non trouvée - Impossible de réparer');
        return false;
    }
    
    // Vérifier si les méthodes sont présentes
    const proto = OCRPremiumInterface.prototype;
    const requiredMethods = ['showSettingsModal', 'testBackendConnection', 'saveSettings'];
    
    const missingMethods = requiredMethods.filter(method => 
        typeof proto[method] !== 'function'
    );
    
    if (missingMethods.length > 0) {
        console.error('❌ Méthodes manquantes:', missingMethods);
        
        // Ajouter les méthodes manquantes temporairement
        if (!proto.showSettingsModal) {
            proto.showSettingsModal = function() {
                console.warn('⚠️ showSettingsModal temporaire - La vraie méthode est manquante');
                alert('La configuration backend nécessite une réparation du fichier ocr-premium-interface.js');
            };
        }
        
        if (!proto.testBackendConnection) {
            proto.testBackendConnection = async function() {
                console.warn('⚠️ testBackendConnection temporaire');
            };
        }
        
        if (!proto.saveSettings) {
            proto.saveSettings = function() {
                console.warn('⚠️ saveSettings temporaire');
            };
        }
        
        console.log('✅ Méthodes temporaires ajoutées');
        return true;
    }
    
    console.log('✅ Toutes les méthodes sont présentes');
    return true;
};

// Initialisation sécurisée
const safeInitOCR = () => {
    try {
        // Vérifier les dépendances
        const deps = checkDependencies();
        
        if (!deps.OCRPremiumInterface) {
            throw new Error('OCRPremiumInterface non disponible');
        }
        
        // Corriger si nécessaire
        fixOCRPremiumInterface();
        
        // Créer l'instance
        if (!window.ocrPremium) {
            window.ocrPremium = new OCRPremiumInterface();
            console.log('✅ OCRPremiumInterface initialisée avec succès');
        } else {
            console.log('ℹ️ OCRPremiumInterface déjà initialisée');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur initialisation OCR:', error);
        
        // Créer un fallback minimal
        window.ocrPremium = {
            showSettingsModal: () => {
                alert('Interface OCR en cours de réparation. Veuillez recharger la page.');
            },
            isProcessing: false
        };
        
        return false;
    }
};

// Diagnostic complet
const runDiagnostic = () => {
    console.log('🔍 === DIAGNOSTIC OCR ===');
    
    // 1. Vérifier les scripts chargés
    const scripts = Array.from(document.querySelectorAll('script[src*="ocr"]'));
    console.log('📜 Scripts OCR chargés:', scripts.map(s => s.src));
    
    // 2. Vérifier les classes
    checkDependencies();
    
    // 3. Tester l'initialisation
    const initSuccess = safeInitOCR();
    
    // 4. Rapport
    console.log('📊 === RAPPORT ===');
    console.log('Initialisation:', initSuccess ? '✅ Succès' : '❌ Échec');
    console.log('Interface disponible:', window.ocrPremium ? '✅ Oui' : '❌ Non');
    
    if (window.ocrPremium && typeof window.ocrPremium.showSettingsModal === 'function') {
        console.log('showSettingsModal:', '✅ Disponible');
    } else {
        console.log('showSettingsModal:', '❌ Non disponible');
    }
    
    return initSuccess;
};

// Auto-exécution si la page est prête
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostic);
} else {
    runDiagnostic();
}

// Export pour utilisation externe
window.OCRRepair = {
    checkDependencies,
    fixOCRPremiumInterface,
    safeInitOCR,
    runDiagnostic
};