/**
 * OCR Templates Final - Templates Notion EXACTS
 * Structures complètes pour les 6 types de documents
 */

// Template FACTURE_CLIENT
const FACTURE_CLIENT_TEMPLATE = {
    database_id: "226adb95-3c6f-8011-a9bb-ca31f7da8e6a",
    database_name: "DB-FACTURES-CLIENTS", 
    fields: [
        { key: "numero", label: "Numéro", required: true, type: "text" },
        { key: "client", label: "Client", required: true, type: "text" },
        { key: "date_emission", label: "Date Émission", required: true, type: "date" },
        { key: "montant_ttc", label: "Montant TTC", required: true, type: "number" },
        { key: "prix_client_ht", label: "Prix Client HT", required: true, type: "number" },
        { key: "montant_tva", label: "Montant TVA", required: true, type: "number" },
        { key: "tva_pourcent", label: "TVA %", required: true, type: "select", options: ["0%", "8.1%", "20%", "Non soumis", "Exonéré"], default: "8.1%" },
        { key: "statut", label: "Statut", required: true, type: "select", options: ["Brouillon", "Envoyé", "Accepté", "Payé", "Refusé", "Annulé"], default: "Envoyé" },
        { key: "mode_paiement", label: "Mode Paiement", type: "select", options: ["Virement", "Carte bancaire", "Espèces", "PayPal", "Crypto"], default: "Virement" },
        { key: "date_echeance", label: "Date Échéance", type: "date" },
        { key: "devise", label: "Devise", type: "select", options: ["EUR", "CHF", "USD", "GBP"], required: true, default: "CHF" },
        { key: "entite_groupe", label: "Entité du Groupe", type: "select", options: ["HYPERVISUAL", "DAINAMICS", "ENKI REALITY", "TAKEOUT", "LEXAIA"], required: true },
        { key: "type_operation", label: "Type Opération", type: "select", options: ["COMMISSION", "SAAS", "LOCATION", "VENTE"], required: true },
        { key: "type_document", label: "Type Document", type: "select", options: [
            "Facture Client",
            "Facture Fournisseur", 
            "Devis",
            "Avoir",
            "Ticket Carte Bancaire",
            "Contrat",
            "Document Administratif",
            "Document Général"
        ], default: "Facture Client" }
    ]
};

// Template FACTURE_FOURNISSEUR
const FACTURE_FOURNISSEUR_TEMPLATE = {
    database_id: "237adb95-3c6f-80de-9f92-c795334e5561",
    database_name: "DB-FACTURES-FOURNISSEURS",
    fields: [
        { key: "numero_facture", label: "Numéro Facture", required: true, type: "text" },
        { key: "fournisseur", label: "Fournisseur", required: true, type: "text" },
        { key: "date_facture", label: "Date Facture", required: true, type: "date" },
        { key: "montant_ht", label: "Montant HT", required: true, type: "number" },
        { key: "tva", label: "TVA", required: true, type: "number" },
        { key: "montant_ttc", label: "Montant TTC", required: true, type: "number" },
        { key: "taux_tva", label: "Taux TVA", type: "select", options: ["0%", "2.6%", "3.8%", "8.1%", "Exonéré"] },
        { key: "statut", label: "Statut", type: "select", options: ["Brouillon", "À valider", "Validée", "Payée", "Litige", "Annulée"] },
        { key: "categorie", label: "Catégorie", type: "select", options: ["Services", "Matériel", "Licences", "Marketing", "Sous-traitance", "Loyer", "Autres"] },
        { key: "date_echeance", label: "Date Échéance", type: "date" },
        { key: "compte_comptable", label: "Compte Comptable", type: "text" },
        { key: "notes", label: "Notes", type: "textarea" },
        { key: "date_validation", label: "Date Validation", type: "date" },
        { key: "date_paiement", label: "Date Paiement", type: "date" },
        { key: "methode_paiement", label: "Méthode Paiement", type: "select", options: ["Virement", "Carte", "Espèces", "Compensation"] }
    ]
};

// Template NOTE_FRAIS
const NOTE_FRAIS_TEMPLATE = {
    database_id: "237adb95-3c6f-804b-a530-e44d07ac9f7b",
    database_name: "DB-NOTES-FRAIS",
    fields: [
        { key: "description", label: "Description", required: true, type: "textarea" },
        { key: "montant", label: "Montant", required: true, type: "number" },
        { key: "date_depense", label: "Date Dépense", required: true, type: "date" },
        { key: "categorie", label: "Catégorie", type: "select", options: ["Repas affaires", "Transport", "Hébergement", "Matériel/Fournitures", "Formation", "Marketing/Communication", "Abonnements", "Autres"] },
        { key: "employe", label: "Employé", type: "text" },
        { key: "motif_business", label: "Motif Business", type: "textarea" },
        { key: "carte_utilisee", label: "Carte Utilisée", type: "select", options: ["CB Entreprise", "CB Personnelle", "Revolut Business", "Espèces", "Virement"] },
        { key: "tva_incluse", label: "TVA Incluse", type: "number" },
        { key: "devise_original", label: "Devise Original", type: "select", options: ["CHF", "EUR", "USD", "GBP", "JPY", "CAD"] },
        { key: "date_soumission", label: "Date Soumission", type: "date" },
        { key: "statut_validation", label: "Statut Validation", type: "select", options: ["Brouillon", "Soumise", "En cours d'examen", "Approuvée", "Rejetée", "Remboursée"] }
    ]
};

// Template CONTRAT
const CONTRAT_TEMPLATE = {
    database_id: "22eadb95-3c6f-8099-81fe-d4890db02d9c",
    database_name: "DB-CONTRATS",
    fields: [
        { key: "nom_contrat", label: "Nom Contrat", required: true, type: "text" },
        { key: "type_contrat", label: "Type de Contrat", type: "select", options: ["Client/Vente", "Fournisseur/Achat", "Travail/Employment", "Location/Bail", "Prestation Services", "NDA/Confidentialité", "Licence Software", "Partnership", "Financier/Prêt", "Juridique/Avocat", "Assurance", "Maintenance"] },
        { key: "valeur_contrat", label: "Valeur Contrat", type: "number" },
        { key: "devise", label: "Devise", type: "select", options: ["EUR €", "USD $", "GBP £", "CHF ₣"] },
        { key: "date_debut", label: "Date Début", type: "date" },
        { key: "date_fin", label: "Date Fin", type: "date" },
        { key: "date_signature", label: "Date Signature", type: "date" },
        { key: "statut", label: "Statut", type: "select", options: ["📝 Brouillon", "🔍 En Révision", "⏳ En Négociation", "✍️ À Signer", "✅ Actif", "🔄 Renouvellement", "⚠️ Expiration Proche", "📅 Expiré", "❌ Résilié", "🚫 Annulé"] },
        { key: "entite_groupe", label: "Entité Groupe", type: "select", options: ["HYPERVISUAL", "DAINAMICS", "ENKI REALITY", "TAKEOUT", "LEXAIA"] },
        { key: "juridiction", label: "Juridiction", type: "select", options: ["🇨🇭 Droit Suisse", "🇫🇷 Droit Français", "🇺🇸 Droit US", "🇪🇺 Droit EU", "🌍 International"] },
        { key: "niveau_risque", label: "Niveau de Risque", type: "select", options: ["🟢 Faible", "🟡 Modéré", "🟠 Élevé", "🔴 Critique"] }
    ]
};

// Template DOCUMENT_GENERAL
const DOCUMENT_GENERAL_TEMPLATE = {
    database_id: "230adb95-3c6f-80eb-9903-ff117c2a518f",
    database_name: "DB-DOCUMENTS-GENERAUX",
    fields: [
        { key: "nom_document", label: "Nom du Document", required: true, type: "text" },
        { key: "type_document", label: "Type de Document", type: "select", options: ["📋 Fiche Projet Prestataire", "📋 Fiche Projet Client", "📄 Contrat", "📋 Cahier des charges", "📊 Rapport", "🎨 Design", "📸 Visuel", "💻 Code", "📞 Compte-rendu", "💰 Devis", "🧾 Facture", "📚 Documentation", "📧 Email", "🔐 Légal", "📋 Fiche Client"] },
        { key: "categorie", label: "Catégorie", type: "select", options: ["📋 Administratif", "💼 Commercial", "🔧 Technique", "🎨 Créatif", "💰 Financier", "📞 Communication", "🔐 Juridique", "📚 Formation"] },
        { key: "statut", label: "Statut", type: "select", options: ["📝 Brouillon", "🔄 En cours", "👀 En révision", "✅ Validé", "📤 Envoyé", "📥 Reçu", "📎 Archivé", "❌ Obsolète"] },
        { key: "confidentialite", label: "Confidentialité", type: "select", options: ["🔓 Public", "🏢 Interne seulement", "👥 Équipe", "👤 Personnel", "🔒 Confidentiel", "🔐 Très confidentiel"] },
        { key: "priorite", label: "Priorité", type: "select", options: ["🔴 Critique", "🟠 Haute", "🟡 Moyenne", "🟢 Basse"] },
        { key: "langue", label: "Langue", type: "select", options: ["🇫🇷 Français", "🇬🇧 Anglais", "🇪🇸 Espagnol", "🇩🇪 Allemand", "🇮🇹 Italien", "🌍 Multilingue"] },
        { key: "format", label: "Format", type: "select", options: ["PDF", "Word", "Excel", "PowerPoint", "Image", "Video", "Audio", "Code", "Web", "Archive"] }
    ]
};

// Template TRANSACTION_BANCAIRE
const TRANSACTION_BANCAIRE_TEMPLATE = {
    database_id: "237adb95-3c6f-803c-9ead-e6156b991db4",
    database_name: "DB-TRANSACTIONS-BANCAIRES",
    fields: [
        { key: "description", label: "Description", required: true, type: "text" },
        { key: "montant", label: "Montant", required: true, type: "number" },
        { key: "date", label: "Date Transaction", required: true, type: "date" },
        { key: "type", label: "Type", required: true, type: "select", options: ["Débit", "Crédit"] },
        { key: "compte", label: "Compte", type: "select", options: ["Revolut CHF", "Revolut EUR", "Revolut USD"] },
        { key: "categorie", label: "Catégorie", type: "select", options: ["Client", "Fournisseur", "Salaire", "Frais bancaires", "TVA", "Transfert interne", "Autre"] },
        { key: "contrepartie", label: "Contrepartie", type: "text" },
        { key: "reference", label: "Référence", type: "text" },
        { key: "methode_paiement", label: "Méthode de Paiement", type: "select", options: ["Carte", "Virement", "Prélèvement", "Espèces", "Chèque", "Autre"] },
        { key: "devise_original", label: "Devise Original", type: "select", options: ["CHF", "EUR", "USD", "GBP"] },
        { key: "entite", label: "Entité", type: "text" },
        { key: "departement", label: "Département", type: "select", options: ["Finance", "Comptabilité", "Ventes", "Marketing", "Ressources Humaines", "Informatique", "Direction", "Opérations"] }
    ]
};

// Tous les templates
const DOCUMENT_TYPES = {
    'FACTURE_CLIENT': FACTURE_CLIENT_TEMPLATE,
    'FACTURE_FOURNISSEUR': FACTURE_FOURNISSEUR_TEMPLATE,
    'NOTE_FRAIS': NOTE_FRAIS_TEMPLATE,
    'CONTRAT': CONTRAT_TEMPLATE,
    'DOCUMENT_GENERAL': DOCUMENT_GENERAL_TEMPLATE,
    'TRANSACTION_BANCAIRE': TRANSACTION_BANCAIRE_TEMPLATE
};

/**
 * Classe de gestion des templates
 */
class OCRTemplateManager {
    constructor() {
        this.templates = DOCUMENT_TYPES;
    }
    
    /**
     * Obtenir un template par type
     */
    getTemplate(documentType) {
        return this.templates[documentType] || this.templates['DOCUMENT_GENERAL'];
    }
    
    /**
     * Mapper les données extraites vers le template
     */
    mapExtractedDataToTemplate(documentType, extractedData) {
        const template = this.getTemplate(documentType);
        const mappedData = {};
        
        // Debug pour vérifier les données
        console.log('🔍 DEBUG mapExtractedDataToTemplate:');
        console.log('documentType:', documentType);
        console.log('extractedData:', extractedData);
        
        // Mappings directs pour chaque champ du template
        template.fields.forEach(field => {
            let value = null;
            
            // Mappings spécifiques par clé
            switch (field.key) {
                case 'numero':
                    value = extractedData.numero || extractedData.numero_document;
                    break;
                case 'client':
                    value = extractedData.client || extractedData.destinataire;
                    break;
                case 'date_emission':
                    value = extractedData.date_emission;
                    break;
                case 'date_echeance':
                    value = extractedData.date_echeance;
                    break;
                case 'montant_ttc':
                    value = extractedData.montant_ttc;
                    break;
                case 'prix_client_ht':
                    value = extractedData.prix_client_ht;
                    break;
                case 'montant_tva':
                    value = extractedData.montant_tva;
                    // Si TVA = 0% ou vide, forcer montant_tva à "0"
                    if (!value && (extractedData.tva_pourcent === '0%' || extractedData.tva_pourcent === '0' || !extractedData.tva_pourcent)) {
                        value = '0';
                        console.log('  → TVA 0% détectée, montant_tva forcé à "0"');
                    }
                    break;
                case 'tva_pourcent':
                    value = extractedData.tva_pourcent;
                    break;
                case 'mode_paiement':
                    value = extractedData.mode_paiement || field.default || 'Virement';
                    break;
                case 'statut':
                    value = extractedData.statut || field.default || 'Envoyé';
                    break;
                case 'entite_groupe':
                    value = extractedData.entite_groupe;
                    break;
                case 'type_operation':
                    value = extractedData.type_operation;
                    break;
                case 'type_document':
                    value = extractedData.type_document || field.default || 'Facture Client';
                    break;
                case 'description':
                    value = extractedData.description;
                    break;
                case 'devise':
                case 'devise_original':
                    // La devise sera ajoutée après la boucle
                    value = null;
                    break;
                default:
                    // Essayer de trouver la valeur directement
                    value = extractedData[field.key];
                    break;
            }
            
            // Si pas de valeur, utiliser la valeur par défaut
            if (!value && field.default) {
                value = field.default;
            }
            
            // Assigner la valeur mappée
            if (value !== null && value !== undefined && value !== 'NON_VISIBLE') {
                mappedData[field.key] = value;
                console.log(`✅ Mapped ${field.key}: ${value}`);
            } else if (field.default) {
                mappedData[field.key] = field.default;
                console.log(`📌 Default ${field.key}: ${field.default}`);
            }
        });

        // SYSTÈME ADAPTATIF DE DÉTECTION DEVISE
        // Fonctionne pour TOUS les documents OCR peu importe la base

        const detectCurrencyFromAmount = (value) => {
            if (!value) return null;
            const valueStr = value.toString().toUpperCase();
            
            // Patterns de détection pour EUR, CHF, USD, GBP
            const patterns = {
                'EUR': ['EUR', '€', 'EURO', 'EUROS'],
                'CHF': ['CHF', 'FR.', 'FS', 'SFR', 'FRANC', 'FRANCS'],
                'USD': ['USD', '$', 'US$', 'DOLLAR', 'DOLLARS'],
                'GBP': ['GBP', '£', 'POUND', 'STERLING', 'LIVRE']
            };
            
            for (const [currency, matches] of Object.entries(patterns)) {
                for (const match of matches) {
                    if (valueStr.includes(match)) {
                        console.log(`  → ${currency} détecté: "${match}" dans "${value}"`);
                        return currency;
                    }
                }
            }
            return null;
        };

        // Chercher dans TOUS les champs monétaires possibles
        const monetaryFields = [
            mappedData.montant_ttc,
            mappedData.prix_client_ht,
            mappedData.prix_fournisseur_ht,
            mappedData.montant_tva,
            mappedData.montant,
            extractedData.montant_ttc,
            extractedData.prix_client_ht,
            extractedData.montant_total,
            extractedData.total,
            extractedData.montant,
            extractedData.prix_unitaire
        ];

        let detectedCurrency = null;
        for (const field of monetaryFields) {
            if (field && !detectedCurrency) {
                detectedCurrency = detectCurrencyFromAmount(field);
                if (detectedCurrency) break;
            }
        }

        // Défaut CHF si rien trouvé
        if (!detectedCurrency) {
            detectedCurrency = 'CHF';
            console.log('⚠️ Aucune devise détectée, défaut: CHF');
        }

        // TOUJOURS ajouter la devise dans mappedData
        mappedData.devise = detectedCurrency;
        
        // Adapter selon le type de document
        if (documentType === 'NOTE_FRAIS' || documentType === 'TRANSACTION_BANCAIRE') {
            mappedData.devise_original = detectedCurrency;
            console.log(`💱 [${documentType}] Devise Original: ${mappedData.devise_original}`);
        } else {
            console.log(`💱 [${documentType}] Devise: ${mappedData.devise}`);
        }
        
        console.log('mappedData final:', mappedData);
        return mappedData;
    }
    
    /**
     * Ancienne méthode de mapping conservée pour rétrocompatibilité
     */
    mapExtractedDataToTemplate_OLD(documentType, extractedData) {
        const template = this.getTemplate(documentType);
        const mappedData = {};
        
        // Mappings intelligents selon le type de document
        const fieldMappings = {
            // FACTURE_CLIENT
            'numero': ['numero', 'numero_facture', 'invoice_number'],
            'client': ['client', 'destinataire', 'customer'],
            'date_emission': ['date_emission', 'date', 'invoice_date'],
            'montant_ttc': ['montant_ttc', 'total', 'amount_total'],
            'prix_client_ht': ['prix_client_ht', 'montant_ht', 'amount_ht'],
            'montant_tva': ['montant_tva', 'tva_montant', 'vat_amount'],
            'tva_pourcent': ['tva_pourcent', 'tva_taux', 'vat_rate'],
            'mode_paiement': ['mode_paiement', 'payment_method'],
            'entite_groupe': ['entite_groupe', 'entity'],
            'type_operation': ['type_operation', 'operation_type'],
            'statut': ['statut', 'status'],
            'type_document': ['type_document', 'document_type'],
            
            // FACTURE_FOURNISSEUR
            'numero_facture': ['numero', 'numero_facture', 'invoice_number'],
            'fournisseur': ['emetteur', 'fournisseur', 'supplier'],
            'date_facture': ['date_emission', 'date', 'invoice_date'],
            'montant_ht': ['montant_ht', 'subtotal', 'amount_ht'],
            'tva': ['tva_montant', 'vat_amount', 'tax'],
            
            // NOTE_FRAIS
            'description': ['description', 'objet', 'subject'],
            'montant': ['montant_ttc', 'montant', 'amount'],
            'date_depense': ['date', 'date_depense', 'expense_date'],
            
            // Champs communs
            'date_echeance': ['date_echeance', 'due_date', 'payment_due'],
            'reference': ['reference', 'ref', 'numero_reference'],
            'mode_paiement': ['mode_paiement', 'payment_method', 'methode_paiement']
        };
        
        // Mapper chaque champ du template
        template.fields.forEach(field => {
            const possibleKeys = fieldMappings[field.key] || [field.key];
            
            // Chercher la valeur dans les données extraites
            let value = null;
            for (const key of possibleKeys) {
                if (extractedData[key] !== undefined) {
                    value = extractedData[key];
                    break;
                }
            }
            
            // Assigner la valeur mappée
            if (value !== null && value !== undefined) {
                mappedData[field.key] = this.formatValue(value, field.type);
            }
        });
        
        return mappedData;
    }
    
    /**
     * Formater une valeur selon son type
     */
    formatValue(value, type) {
        switch (type) {
            case 'number':
                return parseFloat(value) || 0;
                
            case 'date':
                // Convertir en format YYYY-MM-DD
                if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
                    return value.split('T')[0];
                }
                // Essayer de parser d'autres formats
                const date = new Date(value);
                if (!isNaN(date)) {
                    return date.toISOString().split('T')[0];
                }
                return value;
                
            case 'select':
                // La valeur doit correspondre à une option
                return value;
                
            case 'text':
            case 'textarea':
            default:
                return String(value);
        }
    }
    
    /**
     * Valider les données selon le template
     */
    validateData(documentType, data) {
        const template = this.getTemplate(documentType);
        const errors = [];
        const warnings = [];
        
        // Vérifier les champs requis
        template.fields.forEach(field => {
            if (field.required && !data[field.key]) {
                errors.push({
                    field: field.key,
                    message: `Le champ "${field.label}" est obligatoire`
                });
            }
            
            // Vérifier les valeurs de select
            if (field.type === 'select' && data[field.key] && field.options) {
                if (!field.options.includes(data[field.key])) {
                    warnings.push({
                        field: field.key,
                        message: `La valeur "${data[field.key]}" n'est pas dans les options disponibles`
                    });
                }
            }
        });
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * Générer un formulaire HTML pour un type de document
     */
    generateFormHTML(documentType, data = {}) {
        const template = this.getTemplate(documentType);
        let html = '<form class="row g-3">';
        
        // Debug
        console.log('🔍 DEBUG generateFormHTML:');
        console.log('documentType:', documentType);
        console.log('data:', data);
        
        // Récupérer la devise détectée par l'OCR (ne pas forcer CHF)
        const devise = data.devise || data.currency || 'EUR'; // Préférer EUR par défaut pour la Suisse
        
        template.fields.forEach(field => {
            // Utiliser la valeur par défaut si pas de données
            let value = data[field.key] || field.default || '';
            
            // Gestion spéciale pour montant_tva - mettre 0 si vide
            if (field.key === 'montant_tva' && (!value || value === '' || value === undefined || value === null)) {
                value = '0';
                console.log(`  → montant_tva vide, défini à: "${value}"`);
            }
            
            console.log(`Field ${field.key}: raw value = "${value}"`);
            
            // Formatage spécial pour les montants - PRÉSERVER LA DEVISE
            if (field.type === 'number' && value && typeof value === 'string') {
                // Détecter la devise dans la valeur originale
                const currencyMatch = value.match(/(EUR|CHF|USD|GBP|[€$£₣])/i);
                const detectedCurrency = currencyMatch ? currencyMatch[1].toUpperCase() : null;
                
                // Extraire le nombre uniquement pour l'input
                const cleanValue = value.replace(/[^\d.-]/g, '');
                console.log(`  → original value: "${value}"`);
                console.log(`  → detected currency: "${detectedCurrency}"`);
                console.log(`  → cleaned number: "${cleanValue}"`);
                
                // Si on détecte une devise spécifique, la stocker pour l'affichage
                if (detectedCurrency && ['montant_ttc', 'prix_client_ht', 'montant_ht', 'montant_tva'].includes(field.key)) {
                    // Stocker la devise détectée dans les données
                    data[`${field.key}_currency`] = detectedCurrency;
                    // Mettre à jour la devise globale si c'est EUR (pour respecter la facture)
                    if (detectedCurrency === 'EUR' && devise !== 'EUR') {
                        devise = 'EUR';
                        console.log(`  → Devise globale changée à EUR suite à détection`);
                    }
                }
                
                // Pour l'input number, on ne peut mettre que le nombre
                value = cleanValue;
            }
            
            const colSize = field.type === 'textarea' ? 'col-12' : 'col-md-6';
            
            html += `<div class="${colSize}">`;
            html += `<label class="form-label" for="${field.key}">${field.label}`;
            if (field.required) html += ' <span class="text-danger">*</span>';
            
            // Ajouter badge devise pour les montants
            if (['montant_ttc', 'prix_client_ht', 'montant_tva'].includes(field.key)) {
                html += ` <span class="badge bg-blue ms-2">${devise}</span>`;
            }
            
            html += '</label>';
            
            switch (field.type) {
                case 'text':
                    html += `<input type="text" class="form-control" id="${field.key}" name="${field.key}" value="${value}" ${field.required ? 'required' : ''} data-field="${field.key}">`;
                    break;
                    
                case 'number':
                    // Pour les montants, ajouter un input group avec devise
                    if (['montant_ttc', 'prix_client_ht', 'montant_tva'].includes(field.key)) {
                        // Utiliser la devise spécifique du champ si elle a été détectée
                        const fieldCurrency = data[`${field.key}_currency`] || devise;
                        html += `<div class="input-group">`;
                        html += `<input type="number" class="form-control" id="${field.key}" name="${field.key}" value="${value}" step="0.01" ${field.required ? 'required' : ''} data-field="${field.key}" data-currency="${fieldCurrency}">`;
                        html += `<span class="input-group-text">${fieldCurrency}</span>`;
                        html += `</div>`;
                    } else {
                        html += `<input type="number" class="form-control" id="${field.key}" name="${field.key}" value="${value}" step="0.01" ${field.required ? 'required' : ''} data-field="${field.key}">`;
                    }
                    break;
                    
                case 'date':
                    html += `<input type="date" class="form-control" id="${field.key}" name="${field.key}" value="${value}" ${field.required ? 'required' : ''} data-field="${field.key}">`;
                    break;
                    
                case 'select':
                    html += `<select class="form-select" id="${field.key}" name="${field.key}" ${field.required ? 'required' : ''} data-field="${field.key}">`;
                    
                    // Option vide seulement si pas requis et pas de valeur par défaut
                    if (!field.required && !field.default) {
                        html += '<option value="">Sélectionner...</option>';
                    }
                    
                    if (field.options) {
                        field.options.forEach(option => {
                            // Sélectionner si c'est la valeur actuelle OU la valeur par défaut
                            const isSelected = (value && value === option) || (!value && field.default === option);
                            console.log(`  Option ${option}: selected = ${isSelected} (value="${value}", default="${field.default}")`);
                            html += `<option value="${option}" ${isSelected ? 'selected' : ''}>${option}</option>`;
                        });
                    }
                    html += '</select>';
                    break;
                    
                case 'textarea':
                    html += `<textarea class="form-control" id="${field.key}" name="${field.key}" rows="3" ${field.required ? 'required' : ''} data-field="${field.key}">${value}</textarea>`;
                    break;
            }
            
            html += '</div>';
        });
        
        html += '</form>';
        return html;
    }
}

// Export global
window.OCRTemplateManager = OCRTemplateManager;
window.DOCUMENT_TYPES = DOCUMENT_TYPES;