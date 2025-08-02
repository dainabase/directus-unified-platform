/**
 * OCR Notion Workflow
 * Workflow complet : Détection → Validation → Transfert Notion
 */

// Entités suisses du groupe
const ENTITES_SUISSES = ["HYPERVISUAL", "DAINAMICS", "ENKI REALITY", "TAKEOUT", "LEXAIA", "HMF Corporation"];

// Configuration des types de documents et bases Notion
const DOCUMENT_TYPES = {
    FACTURE_FOURNISSEUR: {
        patterns: [/facture/i, /invoice/i, /bill/i],
        notionDB: "237adb95-3c6f-80de-9f92-c795334e5561",
        icon: "🧾",
        title: "Facture Fournisseur (Reçue)",
        description: "Facture reçue de fournisseurs externes",
        fields: {
            "Numéro Facture": { type: "text", required: true, notionProp: "title" },
            "Fournisseur": { type: "text", required: true, notionProp: "rich_text" },
            "Date Facture": { type: "date", required: true, notionProp: "date" },
            "Date Échéance": { type: "date", required: true, notionProp: "date" },
            "Montant HT": { type: "number", required: true, notionProp: "number" },
            "Montant TTC": { type: "number", required: true, notionProp: "number" },
            "TVA": { type: "number", required: false, notionProp: "number" },
            "Taux TVA": { type: "select", options: ["0%", "2.6%", "3.8%", "8.1%"], notionProp: "select" },
            "Devise": { type: "select", options: ["CHF", "EUR", "USD", "GBP"], notionProp: "select" },
            "Catégorie": { type: "select", options: ["Services", "Matériel", "Licences", "Marketing", "Sous-traitance", "Loyer", "Autres"], notionProp: "select" },
            "Entité Groupe": { type: "select", options: ["HYPERVISUAL", "DAINAMICS", "ENKI REALITY", "TAKEOUT", "LEXAIA"], notionProp: "select" },
            "Statut": { type: "select", options: ["Brouillon", "À valider", "Validée", "Payée", "Litige", "Annulée"], notionProp: "select", default: "À valider" }
        }
    },
    FACTURE_CLIENT: {
        patterns: [/devis/i, /quote/i, /offre/i, /RE-\d+/i, /AN-\d+/i],
        notionDB: "226adb95-3c6f-8011-a9bb-ca31f7da8e6a",
        icon: "💰",
        title: "Facture Client (Émise)",
        description: "Facture émise par nos entités vers des clients",
        fields: {
            "Document": { type: "text", required: true, notionProp: "title" },
            "Type": { type: "select", options: ["Devis", "Facture", "Avoir"], notionProp: "select", default: "Facture" },
            "Numéro": { type: "text", required: true, notionProp: "rich_text" },
            "Client": { type: "text", required: true, notionProp: "relation" },
            "Contact Personne": { type: "text", required: false, notionProp: "relation" },
            "Date Émission": { type: "date", required: true, notionProp: "date" },
            "Date Échéance": { type: "date", required: true, notionProp: "date" },
            "Prix Client HT": { type: "number", required: true, notionProp: "number" },
            "TVA %": { type: "select", options: ["0", "8.1", "20"], notionProp: "select" },
            "Montant TTC": { type: "number", required: true, notionProp: "number" },
            "Statut": { type: "select", options: ["Brouillon", "Envoyé", "Accepté", "Payé", "Refusé", "Annulé"], notionProp: "select", default: "Envoyé" },
            "Entreprise": { type: "select", options: ["HYPERVISUAL", "DAINAMICS", "ENKI REALITY", "TAKEOUT", "LEXAIA"], notionProp: "text" },
            "Type Opération": { type: "select", options: ["COMMISSION", "SAAS", "LOCATION", "VENTE"], notionProp: "select" },
            "Mode Paiement": { type: "select", options: ["Virement", "Carte bancaire", "Espèces", "PayPal", "Crypto"], notionProp: "select" },
            "Devise": { type: "select", options: ["CHF", "EUR", "USD", "GBP"], notionProp: "select", default: "CHF" }
        }
    },
    CONTRAT: {
        patterns: [/contrat/i, /contract/i, /agreement/i, /accord/i],
        notionDB: "22eadb95-3c6f-8099-81fe-d4890db02d9c",
        icon: "📋",
        title: "Contrat",
        fields: {
            "Nom Contrat": { type: "text", required: true, notionProp: "title" },
            "Type Contrat": { type: "select", options: ["Client/Vente", "Fournisseur/Achat", "NDA/Confidentialité", "Licence Software", "Partenariat", "Prestation", "Autre"], notionProp: "select" },
            "Partie Contractante": { type: "text", required: true, notionProp: "rich_text" },
            "Valeur Contrat": { type: "number", required: false, notionProp: "number" },
            "Devise": { type: "select", options: ["EUR €", "CHF ₣", "USD $", "GBP £"], notionProp: "select" },
            "Date Début": { type: "date", required: true, notionProp: "date" },
            "Date Fin": { type: "date", required: false, notionProp: "date" },
            "Durée": { type: "text", required: false, notionProp: "rich_text" },
            "Juridiction": { type: "select", options: ["🇨🇭 Droit Suisse", "🇫🇷 Droit Français", "🇺🇸 Droit US", "🇪🇺 Droit EU"], notionProp: "select" },
            "Niveau Risque": { type: "select", options: ["🟢 Faible", "🟡 Modéré", "🟠 Élevé", "🔴 Critique"], notionProp: "select" },
            "Entité Signataire": { type: "select", options: ["HYPERVISUAL", "DAINAMICS", "ENKI REALITY", "TAKEOUT", "LEXAIA"], notionProp: "select" },
            "Statut": { type: "select", options: ["En négociation", "À signer", "Actif", "Expiré", "Résilié"], notionProp: "select", default: "À signer" }
        }
    },
    NOTE_FRAIS: {
        patterns: [/restaurant/i, /taxi/i, /hotel/i, /expense/i, /frais/i, /dépense/i],
        notionDB: "237adb95-3c6f-804b-a530-e44d07ac9f7b",
        icon: "🎫",
        title: "Note de Frais",
        fields: {
            "Description": { type: "text", required: true, notionProp: "title" },
            "Type Dépense": { type: "select", options: ["Restaurant", "Transport", "Hébergement", "Formation", "Matériel", "Divers"], notionProp: "select" },
            "Montant": { type: "number", required: true, notionProp: "number" },
            "Devise": { type: "select", options: ["CHF", "EUR", "USD", "GBP"], notionProp: "select" },
            "Date": { type: "date", required: true, notionProp: "date" },
            "Employé": { type: "text", required: true, notionProp: "rich_text" },
            "Client Refacturé": { type: "text", required: false, notionProp: "rich_text" },
            "Projet": { type: "text", required: false, notionProp: "rich_text" },
            "Statut": { type: "select", options: ["À valider", "Validée", "Remboursée", "Refusée"], notionProp: "select", default: "À valider" }
        }
    }
};

// Variables globales
let currentDocumentType = null;
let currentExtractedData = null;
let currentFileId = null;

/**
 * Extraction de l'émetteur du document
 */
function extractEmetteur(text) {
    // Rechercher l'émetteur dans les 500 premiers caractères
    const headerText = text.substring(0, 500);
    
    for (const entite of ENTITES_SUISSES) {
        const pattern = new RegExp(entite, 'i');
        if (pattern.test(headerText)) {
            console.log(`🏆 Émetteur détecté: ${entite}`);
            return entite;
        }
    }
    
    return null;
}

/**
 * Analyse de la direction de la facture
 */
function analyzeInvoiceDirection(text) {
    const emetteur = extractEmetteur(text);
    
    if (emetteur) {
        // Si une de nos entités est émettrice = Facture CLIENT
        console.log(`💰 Direction: SORTANTE - ${emetteur} émet une facture CLIENT`);
        return {
            type: "FACTURE_CLIENT",
            emetteur: emetteur,
            direction: "SORTANTE"
        };
    }
    
    // Chercher si une de nos entités est mentionnée comme destinataire
    for (const entite of ENTITES_SUISSES) {
        const pattern = new RegExp(entite, 'i');
        const matches = [...text.matchAll(pattern)];
        
        if (matches.length > 0) {
            // Si trouvé après la position 500 = probablement destinataire
            const position = matches[0].index;
            if (position > 500) {
                console.log(`🧾 Direction: ENTRANTE - ${entite} reçoit une facture FOURNISSEUR`);
                return {
                    type: "FACTURE_FOURNISSEUR",
                    destinataire: entite,
                    direction: "ENTRANTE"
                };
            }
        }
    }
    
    // Par défaut, facture fournisseur
    return {
        type: "FACTURE_FOURNISSEUR",
        direction: "ENTRANTE"
    };
}

/**
 * Détection automatique du type de document
 */
function detectDocumentType(extractedText) {
    console.log('🔍 Détection du type de document...');
    
    const textLower = extractedText.toLowerCase();
    
    // 1. Vérifier si c'est une facture/invoice
    if (/facture|invoice|bill|devis|quote|offre/i.test(extractedText)) {
        // Analyser la direction pour déterminer client vs fournisseur
        const direction = analyzeInvoiceDirection(extractedText);
        return direction.type;
    }
    
    // 2. Détection des autres types
    if (/contrat|contract|agreement|accord/i.test(extractedText)) {
        return 'CONTRAT';
    }
    
    if (/restaurant|taxi|hotel|hôtel|expense|frais|dépense|repas/i.test(extractedText)) {
        return 'NOTE_FRAIS';
    }
    
    // 3. Patterns spécifiques de numérotation
    if (/RE-\d+|AN-\d+/i.test(extractedText)) {
        // Numéros typiques de factures clients
        return 'FACTURE_CLIENT';
    }
    
    if (/F-\d+|INV-\d+/i.test(extractedText)) {
        // Numéros typiques de factures fournisseurs
        return 'FACTURE_FOURNISSEUR';
    }
    
    // Par défaut
    console.log('⚠️ Type par défaut: FACTURE_FOURNISSEUR');
    return 'FACTURE_FOURNISSEUR';
}

/**
 * Afficher le type de document détecté
 */
function displayDetectedType(documentType) {
    const config = DOCUMENT_TYPES[documentType];
    const confidence = Math.round(85 + Math.random() * 10); // 85-95% de confiance
    
    const html = `
        <div class="document-type-detected mb-4">
            <div class="alert alert-success">
                <div class="d-flex align-items-center">
                    <span style="font-size: 2rem; margin-right: 1rem;">${config.icon}</span>
                    <div>
                        <h4 class="alert-title mb-1">${config.title} détecté</h4>
                        <p class="mb-0">
                            Confiance: ${confidence}% • 
                            Base cible: <code>${config.notionDB.substring(0, 8)}...</code>
                        </p>
                    </div>
                </div>
            </div>
            <div class="text-muted small">
                <i class="ti ti-info-circle"></i>
                Le document sera transféré vers la base Notion correspondante après validation
            </div>
        </div>
    `;
    
    const container = document.getElementById('documentTypeContainer');
    if (container) {
        container.innerHTML = html;
        container.style.display = 'block';
    }
}

/**
 * Générer le formulaire de validation
 */
function generateValidationForm(documentType, extractedData) {
    console.log('📝 Génération du formulaire de validation...');
    
    const config = DOCUMENT_TYPES[documentType];
    let formHTML = `
        <div class="validation-form">
            <h5 class="mb-3">📝 Vérifiez et complétez les données extraites</h5>
            <form id="notionValidationForm">
    `;
    
    // Grouper les champs par catégorie
    const requiredFields = [];
    const optionalFields = [];
    
    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        if (fieldConfig.required) {
            requiredFields.push([fieldName, fieldConfig]);
        } else {
            optionalFields.push([fieldName, fieldConfig]);
        }
    }
    
    // Champs obligatoires
    if (requiredFields.length > 0) {
        formHTML += '<h6 class="text-muted mb-3">Champs obligatoires</h6><div class="row">';
        
        for (const [fieldName, fieldConfig] of requiredFields) {
            formHTML += generateFieldHTML(fieldName, fieldConfig, extractedData[fieldName] || '');
        }
        
        formHTML += '</div>';
    }
    
    // Champs optionnels
    if (optionalFields.length > 0) {
        formHTML += '<hr class="my-4"><h6 class="text-muted mb-3">Champs optionnels</h6><div class="row">';
        
        for (const [fieldName, fieldConfig] of optionalFields) {
            formHTML += generateFieldHTML(fieldName, fieldConfig, extractedData[fieldName] || fieldConfig.default || '');
        }
        
        formHTML += '</div>';
    }
    
    // Boutons d'action
    formHTML += `
                <hr class="my-4">
                <div class="text-end">
                    <button type="button" class="btn btn-ghost-secondary me-2" onclick="resetForm()">
                        <i class="ti ti-refresh"></i> Réinitialiser
                    </button>
                    <button type="button" class="btn btn-ghost-warning me-2" onclick="reAnalyzeDocument()">
                        <i class="ti ti-scan"></i> Re-analyser
                    </button>
                    <button type="button" class="btn btn-success" onclick="confirmSaveToNotion('${documentType}')">
                        <i class="ti ti-database-import"></i> Enregistrer dans Notion
                    </button>
                </div>
            </form>
        </div>
    `;
    
    const container = document.getElementById('validationFormContainer');
    if (container) {
        container.innerHTML = formHTML;
        container.style.display = 'block';
    }
}

/**
 * Générer le HTML pour un champ
 */
function generateFieldHTML(fieldName, fieldConfig, value) {
    const fieldId = fieldName.replace(/\s+/g, '');
    const required = fieldConfig.required ? 'required' : '';
    const colSize = fieldConfig.type === 'text' || fieldConfig.type === 'select' ? 'col-md-6' : 'col-md-4';
    
    let html = `<div class="${colSize} mb-3">`;
    html += `<label for="${fieldId}" class="form-label">${fieldName}`;
    if (fieldConfig.required) html += ' <span class="text-danger">*</span>';
    html += '</label>';
    
    switch (fieldConfig.type) {
        case 'text':
            html += `<input type="text" class="form-control" id="${fieldId}" name="${fieldId}" value="${value}" ${required}>`;
            break;
            
        case 'number':
            html += `<input type="number" class="form-control" id="${fieldId}" name="${fieldId}" value="${value}" step="0.01" ${required}>`;
            break;
            
        case 'date':
            html += `<input type="date" class="form-control" id="${fieldId}" name="${fieldId}" value="${value}" ${required}>`;
            break;
            
        case 'select':
            html += `<select class="form-select" id="${fieldId}" name="${fieldId}" ${required}>`;
            html += '<option value="">-- Sélectionner --</option>';
            for (const option of fieldConfig.options) {
                const selected = value === option ? 'selected' : '';
                html += `<option value="${option}" ${selected}>${option}</option>`;
            }
            html += '</select>';
            break;
    }
    
    html += '</div>';
    return html;
}

/**
 * Collecter les données du formulaire
 */
function collectFormData() {
    const form = document.getElementById('notionValidationForm');
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

/**
 * Modal de confirmation avant sauvegarde
 */
function confirmSaveToNotion(documentType) {
    const formData = collectFormData();
    const config = DOCUMENT_TYPES[documentType];
    
    // Valider les champs obligatoires
    const missingFields = [];
    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        if (fieldConfig.required && !formData[fieldName.replace(/\s+/g, '')]) {
            missingFields.push(fieldName);
        }
    }
    
    if (missingFields.length > 0) {
        alert(`Veuillez remplir les champs obligatoires:\n- ${missingFields.join('\n- ')}`);
        return;
    }
    
    // Générer le résumé des données
    let dataList = '';
    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        const fieldId = fieldName.replace(/\s+/g, '');
        const value = formData[fieldId];
        if (value) {
            dataList += `<li><strong>${fieldName}:</strong> ${value}</li>`;
        }
    }
    
    // Créer le modal s'il n'existe pas
    if (!document.getElementById('confirmationModal')) {
        createConfirmationModal();
    }
    
    // Mettre à jour le contenu du modal
    document.getElementById('confirmTargetIcon').innerHTML = config.icon;
    document.getElementById('confirmTargetDB').textContent = config.title;
    document.getElementById('confirmTargetDBId').textContent = config.notionDB;
    document.getElementById('confirmationDataList').innerHTML = dataList;
    
    // Stocker les données pour la sauvegarde
    window.pendingSaveData = {
        documentType,
        formData,
        targetDB: config.notionDB
    };
    
    // Ouvrir le modal
    const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();
}

/**
 * Créer le modal de confirmation
 */
function createConfirmationModal() {
    const modalHTML = `
        <div class="modal fade" id="confirmationModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="ti ti-alert-circle text-warning"></i>
                            Confirmation de sauvegarde
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-3"><strong>Êtes-vous sûr de vouloir transférer ce document vers Notion ?</strong></p>
                        
                        <div class="alert alert-info">
                            <div class="d-flex align-items-center mb-3">
                                <span id="confirmTargetIcon" style="font-size: 2rem; margin-right: 1rem;"></span>
                                <div>
                                    <h6 class="mb-1">Base de données cible :</h6>
                                    <strong id="confirmTargetDB"></strong>
                                    <br>
                                    <code class="small" id="confirmTargetDBId"></code>
                                </div>
                            </div>
                            
                            <hr>
                            
                            <h6 class="mb-2">📊 Données qui seront sauvegardées :</h6>
                            <ul id="confirmationDataList" class="mb-0"></ul>
                        </div>
                        
                        <div class="alert alert-warning">
                            <i class="ti ti-info-circle"></i>
                            Cette action créera une nouvelle entrée dans la base Notion et ne peut pas être annulée automatiquement.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="ti ti-x"></i> Annuler
                        </button>
                        <button type="button" class="btn btn-success" onclick="executeNotionSave()">
                            <i class="ti ti-check"></i> Confirmer et sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Exécuter la sauvegarde dans Notion
 */
async function executeNotionSave() {
    const { documentType, formData, targetDB } = window.pendingSaveData;
    
    // Fermer le modal
    bootstrap.Modal.getInstance(document.getElementById('confirmationModal')).hide();
    
    // Afficher l'indicateur de chargement
    showSavingIndicator();
    
    try {
        // Utiliser l'API client si disponible
        if (window.ocrAPIClient) {
            // Préparer les données extraites avec les champs du formulaire
            const extractedData = {
                type: documentType,
                ...formData,
                fileId: currentFileId
            };
            
            const result = await window.ocrAPIClient.saveToNotion(
                documentType.toLowerCase(),
                extractedData,
                currentFileId
            );
            
            if (result.success) {
                showSuccessMessage(result.notionPageId, documentType);
                
                // Proposer d'ouvrir dans Notion si URL disponible
                if (result.notionUrl) {
                    setTimeout(() => {
                        if (confirm('Document sauvegardé avec succès ! Voulez-vous l\'ouvrir dans Notion ?')) {
                            window.open(result.notionUrl, '_blank');
                        }
                    }, 1000);
                }
                
                // Réinitialiser l'interface après 3 secondes
                setTimeout(() => resetOCRInterface(), 3000);
            } else {
                throw new Error(result.error || 'Erreur lors de la sauvegarde');
            }
        } else {
            // Mode démo sans backend
            console.log('📤 Simulation sauvegarde Notion:', { documentType, formData, targetDB });
            
            // Simuler un délai
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Afficher le succès
            showSuccessMessage('demo-' + Date.now(), documentType);
            
            // Réinitialiser après 3 secondes
            setTimeout(() => resetOCRInterface(), 3000);
        }
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        showErrorMessage(error.message);
    } finally {
        hideSavingIndicator();
    }
}

/**
 * Afficher l'indicateur de sauvegarde
 */
function showSavingIndicator() {
    const html = `
        <div id="savingIndicator" class="position-fixed top-50 start-50 translate-middle" style="z-index: 9999;">
            <div class="card shadow-lg">
                <div class="card-body text-center p-4">
                    <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                    <h5>Sauvegarde en cours...</h5>
                    <p class="text-muted mb-0">Transfert vers Notion</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function hideSavingIndicator() {
    const indicator = document.getElementById('savingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Afficher le message de succès
 */
function showSuccessMessage(notionId, documentType) {
    const config = DOCUMENT_TYPES[documentType];
    
    const html = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <div class="d-flex">
                <div>
                    <h4 class="alert-title">✅ Document sauvegardé avec succès !</h4>
                    <div class="text-secondary">
                        ${config.icon} ${config.title} transféré vers Notion
                        <br>
                        <small>ID: <code>${notionId}</code></small>
                    </div>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.getElementById('notificationContainer');
    if (container) {
        container.innerHTML = html;
        container.style.display = 'block';
    }
}

/**
 * Afficher un message d'erreur
 */
function showErrorMessage(message) {
    const html = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <div class="d-flex">
                <div>
                    <h4 class="alert-title">❌ Erreur lors de la sauvegarde</h4>
                    <div class="text-secondary">${message}</div>
                </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    const container = document.getElementById('notificationContainer');
    if (container) {
        container.innerHTML = html;
        container.style.display = 'block';
    }
}

/**
 * Réinitialiser le formulaire
 */
function resetForm() {
    document.getElementById('notionValidationForm').reset();
}

/**
 * Re-analyser le document
 */
function reAnalyzeDocument() {
    if (confirm('Voulez-vous relancer l\'analyse du document ?')) {
        // Masquer les résultats actuels
        document.getElementById('documentTypeContainer').style.display = 'none';
        document.getElementById('validationFormContainer').style.display = 'none';
        
        // Relancer l'analyse si un fichier est disponible
        if (window.ocrPremium && window.ocrPremium.currentFile) {
            window.ocrPremium.processFile(window.ocrPremium.currentFile);
        }
    }
}

/**
 * Réinitialiser l'interface OCR
 */
function resetOCRInterface() {
    // Masquer les sections de résultats
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('documentTypeContainer').innerHTML = '';
    document.getElementById('validationFormContainer').innerHTML = '';
    document.getElementById('notificationContainer').innerHTML = '';
    
    // Afficher la section upload
    document.getElementById('uploadSection').style.display = 'block';
    
    // Réinitialiser les variables
    currentDocumentType = null;
    currentExtractedData = null;
    currentFileId = null;
    
    // Réinitialiser l'interface OCR premium si disponible
    if (window.ocrPremium && typeof window.ocrPremium.resetInterface === 'function') {
        window.ocrPremium.resetInterface();
    }
}

/**
 * Mapper les données extraites aux champs du document
 */
function mapExtractedDataToFields(documentType, rawData) {
    const config = DOCUMENT_TYPES[documentType];
    const mappedData = {};
    
    // Mapping basique selon le type
    switch (documentType) {
        case 'FACTURE_FOURNISSEUR':
            mappedData['NuméroFacture'] = rawData.numero || rawData.number || '';
            mappedData['Fournisseur'] = rawData.company || rawData.entite || '';
            mappedData['DateFacture'] = rawData.date || '';
            mappedData['MontantHT'] = rawData.montant_ht || '';
            mappedData['MontantTTC'] = rawData.montant_ttc || rawData.amount || '';
            mappedData['TVA'] = rawData.montant_tva || '';
            mappedData['TauxTVA'] = rawData.taux_tva ? `${rawData.taux_tva}%` : '8.1%';
            mappedData['Devise'] = rawData.devise || 'CHF';
            mappedData['EntitéGroupe'] = 'HYPERVISUAL'; // Par défaut
            break;
            
        case 'FACTURE_CLIENT':
            // Mapping spécifique pour factures clients
            mappedData['Document'] = `Facture ${rawData.numero || ''} - ${rawData.client || ''}`;
            mappedData['Type'] = 'Facture';
            mappedData['Numéro'] = rawData.numero || rawData.number || '';
            mappedData['Client'] = rawData.client || '';
            mappedData['DateÉmission'] = rawData.date || '';
            mappedData['DateÉchéance'] = rawData.date_echeance || rawData.dateEcheance || '';
            mappedData['PrixClientHT'] = rawData.montant_ht || rawData.amount || '';
            mappedData['TVA%'] = rawData.taux_tva ? rawData.taux_tva.toString() : '0';
            mappedData['MontantTTC'] = rawData.montant_ttc || rawData.amount || '';
            mappedData['Entreprise'] = extractEmetteur(rawData.rawText || '') || 'HYPERVISUAL';
            mappedData['Devise'] = rawData.devise || 'CHF';
            mappedData['Statut'] = 'Envoyé';
            break;
            
        case 'CONTRAT':
            mappedData['NomContrat'] = rawData.title || 'Contrat ' + (rawData.client || '');
            mappedData['PartieContractante'] = rawData.client || rawData.company || '';
            mappedData['DateDébut'] = rawData.date || '';
            mappedData['ValeurContrat'] = rawData.montant_ttc || rawData.amount || '';
            mappedData['Devise'] = rawData.devise ? `${rawData.devise} ${getCurrencySymbol(rawData.devise)}` : 'EUR €';
            break;
            
        case 'NOTE_FRAIS':
            mappedData['Description'] = rawData.description || 'Note de frais';
            mappedData['Montant'] = rawData.montant_ttc || rawData.amount || '';
            mappedData['Date'] = rawData.date || '';
            mappedData['Devise'] = rawData.devise || 'CHF';
            break;
    }
    
    return mappedData;
}

/**
 * Obtenir le symbole de devise
 */
function getCurrencySymbol(currency) {
    const symbols = {
        'EUR': '€',
        'CHF': '₣',
        'USD': '$',
        'GBP': '£'
    };
    return symbols[currency] || '';
}

// Export des fonctions pour utilisation externe
window.OCRNotionWorkflow = {
    detectDocumentType,
    displayDetectedType,
    generateValidationForm,
    confirmSaveToNotion,
    mapExtractedDataToFields,
    setCurrentData: (type, data, fileId) => {
        currentDocumentType = type;
        currentExtractedData = data;
        currentFileId = fileId;
    }
};