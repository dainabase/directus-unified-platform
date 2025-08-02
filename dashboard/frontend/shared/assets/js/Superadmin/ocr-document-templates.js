/**
 * OCR Document Templates
 * Templates adaptatifs pour tous les types de documents
 * 6 types principaux avec mapping Notion complet
 */

const DOCUMENT_TEMPLATES = {
    'FACTURE_CLIENT': {
        title: '🧾 Facture Client',
        database: '226adb95-3c6f-8011-a9bb-ca31f7da8e6a',
        icon: 'receipt',
        color: 'success',
        description: 'Factures émises par HYPERVISUAL et entités du groupe',
        fields: [
            { key: 'numero', label: 'Numéro Facture', type: 'text', required: true, placeholder: 'F-2025-001' },
            { key: 'client', label: 'Client', type: 'text', required: true, placeholder: 'Nom du client' },
            { key: 'date_emission', label: 'Date Émission', type: 'date', required: true },
            { key: 'montant_ttc', label: 'Montant TTC', type: 'currency', required: true, currency: 'CHF' },
            { key: 'tva_pourcent', label: 'TVA %', type: 'select', options: ['0', '8.1', '20'], required: true },
            { key: 'statut', label: 'Statut', type: 'select', options: ['Brouillon', 'Envoyé', 'Accepté', 'Payé', 'Refusé'], default: 'Brouillon' },
            { key: 'mode_paiement', label: 'Mode de Paiement', type: 'select', options: ['Virement', 'Carte bancaire', 'Espèces', 'PayPal'] },
            { key: 'date_echeance', label: 'Date Échéance', type: 'date' },
            { key: 'projet', label: 'Projet Associé', type: 'relation', database: 'DB-PROJETS' }
        ],
        detection: {
            keywords: ['facture', 'invoice', 'bill'],
            emetteurs: ['HYPERVISUAL', 'DAINAMICS', 'ENKI REALITY', 'TAKEOUT', 'LEXAIA']
        }
    },
    
    'FACTURE_FOURNISSEUR': {
        title: '📥 Facture Fournisseur',
        database: '237adb95-3c6f-80de-9f92-c795334e5561',
        icon: 'file-invoice',
        color: 'warning',
        description: 'Factures reçues par HYPERVISUAL et entités du groupe',
        fields: [
            { key: 'numero_facture', label: 'Numéro Facture', type: 'text', required: true },
            { key: 'fournisseur', label: 'Fournisseur', type: 'text', required: true },
            { key: 'date_facture', label: 'Date Facture', type: 'date', required: true },
            { key: 'montant_ht', label: 'Montant HT', type: 'currency', required: true, currency: 'CHF' },
            { key: 'tva', label: 'TVA', type: 'number', required: true },
            { key: 'montant_ttc', label: 'Montant TTC', type: 'currency', required: true, currency: 'CHF' },
            { key: 'taux_tva', label: 'Taux TVA', type: 'select', options: ['0%', '2.6%', '3.8%', '8.1%', 'Exonéré'] },
            { key: 'categorie', label: 'Catégorie', type: 'select', options: ['Services', 'Matériel', 'Licences', 'Marketing', 'Sous-traitance', 'Loyer', 'Autres'] },
            { key: 'date_echeance', label: 'Date Échéance', type: 'date' },
            { key: 'entite_groupe', label: 'Entité Groupe', type: 'select', options: ['HYPERVISUAL', 'DAINAMICS', 'ENKI REALITY', 'TAKEOUT', 'LEXAIA'] },
            { key: 'compte_comptable', label: 'Compte Comptable', type: 'text' }
        ],
        detection: {
            keywords: ['facture', 'invoice', 'bill'],
            destinataires: ['HYPERVISUAL', 'DAINAMICS', 'ENKI REALITY', 'TAKEOUT', 'LEXAIA']
        }
    },
    
    'NOTE_FRAIS': {
        title: '💸 Note de Frais',
        database: '237adb95-3c6f-804b-a530-e44d07ac9f7b',
        icon: 'receipt-2',
        color: 'info',
        description: 'Notes de frais et dépenses professionnelles',
        fields: [
            { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Déjeuner client, transport, etc.' },
            { key: 'montant', label: 'Montant', type: 'currency', required: true, currency: 'CHF' },
            { key: 'date_depense', label: 'Date Dépense', type: 'date', required: true },
            { key: 'categorie', label: 'Catégorie', type: 'select', options: ['Repas affaires', 'Transport', 'Hébergement', 'Matériel/Fournitures', 'Formation', 'Marketing/Communication', 'Abonnements', 'Autres'] },
            { key: 'employe', label: 'Employé', type: 'text', required: true },
            { key: 'motif_business', label: 'Motif Business', type: 'textarea' },
            { key: 'carte_utilisee', label: 'Carte Utilisée', type: 'select', options: ['CB Entreprise', 'CB Personnelle', 'Revolut Business', 'Espèces', 'Virement'] },
            { key: 'tva_incluse', label: 'TVA Incluse', type: 'currency', currency: 'CHF' },
            { key: 'devise_original', label: 'Devise', type: 'select', options: ['CHF', 'EUR', 'USD', 'GBP', 'JPY', 'CAD'] },
            { key: 'projet', label: 'Projet Associé', type: 'relation', database: 'DB-PROJETS' }
        ],
        detection: {
            keywords: ['restaurant', 'taxi', 'frais', 'hôtel', 'transport', 'dépense', 'expense']
        }
    },
    
    'CONTRAT': {
        title: '📜 Contrat',
        database: '22eadb95-3c6f-8099-81fe-d4890db02d9c',
        icon: 'file-text',
        color: 'purple',
        description: 'Contrats et documents juridiques',
        fields: [
            { key: 'nom_contrat', label: 'Nom Contrat', type: 'text', required: true },
            { key: 'type_contrat', label: 'Type de Contrat', type: 'select', options: ['Client/Vente', 'Fournisseur/Achat', 'Travail/Employment', 'Location/Bail', 'Prestation Services', 'NDA/Confidentialité', 'Licence Software', 'Partnership', 'Financier/Prêt', 'Juridique/Avocat', 'Assurance', 'Maintenance'] },
            { key: 'valeur_contrat', label: 'Valeur Contrat', type: 'currency', currency: 'CHF' },
            { key: 'devise', label: 'Devise', type: 'select', options: ['EUR €', 'USD $', 'GBP £', 'CHF ₣'] },
            { key: 'date_debut', label: 'Date Début', type: 'date' },
            { key: 'date_fin', label: 'Date Fin', type: 'date' },
            { key: 'date_signature', label: 'Date Signature', type: 'date' },
            { key: 'statut', label: 'Statut', type: 'select', options: ['📝 Brouillon', '🔍 En Révision', '⏳ En Négociation', '✍️ À Signer', '✅ Actif', '🔄 Renouvellement', '⚠️ Expiration Proche', '📅 Expiré', '❌ Résilié', '🚫 Annulé'] },
            { key: 'entite_groupe', label: 'Entité Groupe', type: 'select', options: ['HYPERVISUAL', 'DAINAMICS', 'ENKI REALITY', 'TAKEOUT', 'LEXAIA'] },
            { key: 'juridiction', label: 'Juridiction', type: 'select', options: ['🇨🇭 Droit Suisse', '🇫🇷 Droit Français', '🇺🇸 Droit US', '🇪🇺 Droit EU', '🌍 International'] },
            { key: 'niveau_risque', label: 'Niveau de Risque', type: 'select', options: ['🟢 Faible', '🟡 Modéré', '🟠 Élevé', '🔴 Critique'] }
        ],
        detection: {
            keywords: ['contrat', 'agreement', 'accord', 'convention', 'contract']
        }
    },
    
    'DOCUMENT_GENERAL': {
        title: '📄 Document Général',
        database: '230adb95-3c6f-80eb-9903-ff117c2a518f',
        icon: 'file',
        color: 'secondary',
        description: 'Documents généraux et fallback',
        fields: [
            { key: 'nom_document', label: 'Nom du Document', type: 'text', required: true },
            { key: 'type_document', label: 'Type de Document', type: 'select', options: ['📋 Fiche Projet Prestataire', '📋 Fiche Projet Client', '📄 Contrat', '📋 Cahier des charges', '📊 Rapport', '🎨 Design', '📸 Visuel', '💻 Code', '📞 Compte-rendu', '💰 Devis', '🧾 Facture', '📚 Documentation', '📧 Email', '🔐 Légal', '📋 Fiche Client'] },
            { key: 'categorie', label: 'Catégorie', type: 'select', options: ['📋 Administratif', '💼 Commercial', '🔧 Technique', '🎨 Créatif', '💰 Financier', '📞 Communication', '🔐 Juridique', '📚 Formation'] },
            { key: 'statut', label: 'Statut', type: 'select', options: ['📝 Brouillon', '🔄 En cours', '👀 En révision', '✅ Validé', '📤 Envoyé', '📥 Reçu', '📎 Archivé', '❌ Obsolète'] },
            { key: 'confidentialite', label: 'Confidentialité', type: 'select', options: ['🔓 Public', '🏢 Interne seulement', '👥 Équipe', '👤 Personnel', '🔒 Confidentiel', '🔐 Très confidentiel'] },
            { key: 'priorite', label: 'Priorité', type: 'select', options: ['🔴 Critique', '🟠 Haute', '🟡 Moyenne', '🟢 Basse'] },
            { key: 'langue', label: 'Langue', type: 'select', options: ['🇫🇷 Français', '🇬🇧 Anglais', '🇪🇸 Espagnol', '🇩🇪 Allemand', '🇮🇹 Italien', '🌍 Multilingue'] },
            { key: 'format', label: 'Format', type: 'select', options: ['PDF', 'Word', 'Excel', 'PowerPoint', 'Image', 'Video', 'Audio', 'Code', 'Web', 'Archive'] }
        ],
        detection: {
            keywords: [],
            fallback: true
        }
    },
    
    'TRANSACTION_BANCAIRE': {
        title: '💳 Transaction Bancaire',
        database: '237adb95-3c6f-803c-9ead-e6156b991db4',
        icon: 'credit-card',
        color: 'cyan',
        description: 'Relevés bancaires et transactions',
        fields: [
            { key: 'description', label: 'Description', type: 'text', required: true },
            { key: 'montant', label: 'Montant', type: 'currency', required: true, currency: 'CHF' },
            { key: 'date', label: 'Date Transaction', type: 'date', required: true },
            { key: 'type', label: 'Type', type: 'select', options: ['Débit', 'Crédit'], required: true },
            { key: 'compte', label: 'Compte', type: 'select', options: ['Revolut CHF', 'Revolut EUR', 'Revolut USD'] },
            { key: 'categorie', label: 'Catégorie', type: 'select', options: ['Client', 'Fournisseur', 'Salaire', 'Frais bancaires', 'TVA', 'Transfert interne', 'Autre'] },
            { key: 'contrepartie', label: 'Contrepartie', type: 'text' },
            { key: 'reference', label: 'Référence', type: 'text' },
            { key: 'methode_paiement', label: 'Méthode de Paiement', type: 'select', options: ['Carte', 'Virement', 'Prélèvement', 'Espèces', 'Chèque', 'Autre'] },
            { key: 'entite', label: 'Entité', type: 'text' },
            { key: 'departement', label: 'Département', type: 'select', options: ['Finance', 'Comptabilité', 'Ventes', 'Marketing', 'Ressources Humaines', 'Informatique', 'Direction', 'Opérations'] }
        ],
        detection: {
            keywords: ['transaction', 'virement', 'payment', 'debit', 'credit', 'carte']
        }
    }
};

/**
 * Classe de gestion des templates
 */
class DocumentTemplateManager {
    constructor() {
        this.templates = DOCUMENT_TEMPLATES;
    }
    
    /**
     * Détecter automatiquement le type de document
     */
    detectDocumentType(extractedData) {
        console.log('🔍 Détection automatique du type de document...');
        
        // Analyser le texte extrait
        const text = JSON.stringify(extractedData).toLowerCase();
        
        // Vérifier les émetteurs/destinataires pour factures
        const entities = ['hypervisual', 'dainamics', 'enki reality', 'takeout', 'lexaia'];
        
        // Émetteur = une de nos entités → FACTURE_CLIENT
        if (extractedData.emetteur) {
            const emetteurNom = (extractedData.emetteur.nom || extractedData.emetteur).toLowerCase();
            if (entities.some(entity => emetteurNom.includes(entity))) {
                console.log('✅ Type détecté: FACTURE_CLIENT (émetteur groupe)');
                return 'FACTURE_CLIENT';
            }
        }
        
        // Destinataire = une de nos entités → FACTURE_FOURNISSEUR
        if (extractedData.destinataire || extractedData.client) {
            const destNom = ((extractedData.destinataire || extractedData.client).nom || 
                           (extractedData.destinataire || extractedData.client)).toLowerCase();
            if (entities.some(entity => destNom.includes(entity))) {
                console.log('✅ Type détecté: FACTURE_FOURNISSEUR (destinataire groupe)');
                return 'FACTURE_FOURNISSEUR';
            }
        }
        
        // Détecter par mots-clés
        for (const [type, config] of Object.entries(this.templates)) {
            const detection = config.detection;
            if (!detection || detection.fallback) continue;
            
            if (detection.keywords && detection.keywords.length > 0) {
                const hasKeyword = detection.keywords.some(keyword => 
                    text.includes(keyword.toLowerCase())
                );
                
                if (hasKeyword) {
                    console.log(`✅ Type détecté: ${type} (mot-clé trouvé)`);
                    return type;
                }
            }
        }
        
        // Fallback
        console.log('⚠️ Type non détecté, utilisation du fallback: DOCUMENT_GENERAL');
        return 'DOCUMENT_GENERAL';
    }
    
    /**
     * Obtenir un template par type
     */
    getTemplate(documentType) {
        return this.templates[documentType] || this.templates['DOCUMENT_GENERAL'];
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
            if (field.required && (!data[field.key] || data[field.key] === '')) {
                errors.push({
                    field: field.key,
                    message: `${field.label} est obligatoire`
                });
            }
        });
        
        // Validations spécifiques
        if (documentType.includes('FACTURE')) {
            // Vérifier la cohérence des montants
            if (data.montant_ht && data.tva && data.montant_ttc) {
                const calculated = parseFloat(data.montant_ht) + parseFloat(data.tva);
                const ttc = parseFloat(data.montant_ttc);
                
                if (Math.abs(calculated - ttc) > 0.02) {
                    warnings.push({
                        field: 'montant_ttc',
                        message: `Incohérence: ${calculated.toFixed(2)} ≠ ${ttc.toFixed(2)}`
                    });
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * Mapper les données extraites vers le schéma Notion
     */
    mapToNotionSchema(documentType, extractedData) {
        const template = this.getTemplate(documentType);
        const mappedData = {
            _metadata: {
                documentType,
                databaseId: template.database,
                extractedAt: new Date().toISOString()
            }
        };
        
        // Mapper chaque champ
        template.fields.forEach(field => {
            const value = this.findFieldValue(field.key, extractedData);
            if (value !== undefined && value !== null && value !== '') {
                mappedData[field.key] = this.formatFieldValue(value, field);
            } else if (field.default) {
                mappedData[field.key] = field.default;
            }
        });
        
        return mappedData;
    }
    
    /**
     * Rechercher la valeur d'un champ dans les données extraites
     */
    findFieldValue(fieldKey, data) {
        // Recherche directe
        if (data[fieldKey] !== undefined) {
            return data[fieldKey];
        }
        
        // Mappings intelligents
        const mappings = {
            'numero': ['numero_facture', 'invoice_number', 'bill_number'],
            'client': ['client.nom', 'destinataire', 'customer'],
            'fournisseur': ['emetteur.nom', 'supplier', 'vendor'],
            'montant_ttc': ['total', 'amount_total', 'gross_amount'],
            'date_emission': ['date', 'invoice_date', 'bill_date'],
            'date_facture': ['date', 'invoice_date', 'bill_date']
        };
        
        const possibleKeys = mappings[fieldKey] || [];
        for (const key of possibleKeys) {
            const value = this.getNestedValue(data, key);
            if (value !== undefined && value !== null) {
                return value;
            }
        }
        
        return undefined;
    }
    
    /**
     * Obtenir une valeur imbriquée
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }
    
    /**
     * Formater une valeur selon le type de champ
     */
    formatFieldValue(value, field) {
        switch (field.type) {
            case 'currency':
                return parseFloat(value) || 0;
                
            case 'date':
                if (value instanceof Date) {
                    return value.toISOString().split('T')[0];
                }
                return value;
                
            case 'number':
                return parseFloat(value) || 0;
                
            default:
                return String(value);
        }
    }
    
    /**
     * Générer un aperçu formaté des données
     */
    generatePreview(documentType, data) {
        const template = this.getTemplate(documentType);
        const preview = {
            title: template.title,
            database: template.database,
            fields: []
        };
        
        template.fields.forEach(field => {
            const value = data[field.key];
            if (value !== undefined && value !== null && value !== '') {
                preview.fields.push({
                    label: field.label,
                    value: this.formatDisplayValue(value, field),
                    type: field.type,
                    required: field.required
                });
            }
        });
        
        return preview;
    }
    
    /**
     * Formater une valeur pour l'affichage
     */
    formatDisplayValue(value, field) {
        switch (field.type) {
            case 'currency':
                const amount = parseFloat(value) || 0;
                return `${amount.toFixed(2)} ${field.currency || 'CHF'}`;
                
            case 'date':
                return new Date(value).toLocaleDateString('fr-CH');
                
            case 'select':
                return value;
                
            default:
                return String(value);
        }
    }
}

// Export global
window.DOCUMENT_TEMPLATES = DOCUMENT_TEMPLATES;
window.DocumentTemplateManager = DocumentTemplateManager;