/**
 * Extraction Schemas
 * Définit les structures de données pour chaque type de document
 */

const extractionSchemas = {
    /**
     * Schema for Client Invoices
     */
    facture_client: {
        required: ['client', 'numero', 'date', 'montant_ttc'],
        properties: {
            // Client information (priorité haute)
            client: {
                type: 'string',
                description: 'Nom du client destinataire',
                extraction: 'between_emitter_and_document_number'
            },
            clientAddress: {
                type: 'string',
                description: 'Adresse complète du client'
            },
            clientCountry: {
                type: 'string',
                description: 'Pays du client'
            },
            clientVAT: {
                type: 'string',
                description: 'Numéro TVA du client',
                pattern: /[A-Z]{2}[0-9A-Z]+/
            },
            
            // Company information
            entite: {
                type: 'string',
                description: 'Entité émettrice',
                enum: ['HMF Corporation SA', 'HYPERVISUAL', 'Promidea Sarl']
            },
            company: {
                type: 'string',
                description: 'Société émettrice alternative'
            },
            
            // Document details
            numero: {
                type: 'string',
                description: 'Numéro de facture',
                pattern: /[A-Z]{2,3}-\d{4,6}/
            },
            date: {
                type: 'date',
                description: 'Date de la facture'
            },
            dateEcheance: {
                type: 'date',
                description: 'Date d\'échéance'
            },
            
            // Financial information
            montant_ht: {
                type: 'number',
                description: 'Montant hors taxes'
            },
            montant_tva: {
                type: 'number',
                description: 'Montant de la TVA'
            },
            montant_ttc: {
                type: 'number',
                description: 'Montant TTC'
            },
            devise: {
                type: 'string',
                description: 'Devise',
                enum: ['CHF', 'EUR', 'USD', 'GBP']
            },
            taux_tva: {
                type: 'number',
                description: 'Taux de TVA appliqué',
                enum: [0, 2.6, 3.8, 8.1, 16, 19, 20, 21, 22]
            },
            vat_status: {
                type: 'string',
                description: 'Statut TVA',
                enum: ['hors_tva', 'ttc', 'non_applicable', 'autoliquidation']
            },
            
            // Line items
            items: {
                type: 'array',
                description: 'Lignes de facturation',
                items: {
                    description: { type: 'string' },
                    quantity: { type: 'number' },
                    unitPrice: { type: 'number' },
                    total: { type: 'number' }
                }
            },
            
            // Banking information
            iban: {
                type: 'string',
                description: 'IBAN pour le paiement'
            },
            bic: {
                type: 'string',
                description: 'BIC/SWIFT'
            },
            
            // Additional
            reference: {
                type: 'string',
                description: 'Référence interne ou bon de commande'
            },
            conditions: {
                type: 'string',
                description: 'Conditions de paiement'
            }
        }
    },

    /**
     * Schema for Supplier Invoices
     */
    facture_fournisseur: {
        required: ['company', 'numero', 'date', 'montant_ttc'],
        properties: {
            // Supplier information
            company: {
                type: 'string',
                description: 'Nom du fournisseur'
            },
            companyAddress: {
                type: 'string',
                description: 'Adresse du fournisseur'
            },
            companyVAT: {
                type: 'string',
                description: 'Numéro TVA du fournisseur'
            },
            
            // Client facturé (nous)
            client: {
                type: 'string',
                description: 'Notre entité facturée',
                extraction: 'between_emitter_and_document_number'
            },
            
            // Document details
            numero: {
                type: 'string',
                description: 'Numéro de facture fournisseur'
            },
            date: {
                type: 'date',
                description: 'Date de la facture'
            },
            dateEcheance: {
                type: 'date',
                description: 'Date d\'échéance'
            },
            
            // Financial
            montant_ht: {
                type: 'number',
                description: 'Montant HT'
            },
            montant_tva: {
                type: 'number',
                description: 'Montant TVA'
            },
            montant_ttc: {
                type: 'number',
                description: 'Montant TTC'
            },
            devise: {
                type: 'string',
                description: 'Devise'
            },
            
            // Category
            category: {
                type: 'string',
                description: 'Catégorie de dépense',
                enum: ['Infrastructure', 'Marketing', 'Développement', 'Consulting', 'Matériel', 'Services', 'Autres']
            },
            
            // Payment
            paymentMethod: {
                type: 'string',
                description: 'Méthode de paiement',
                enum: ['virement', 'carte', 'prelevement', 'cheque', 'especes']
            },
            paymentStatus: {
                type: 'string',
                description: 'Statut de paiement',
                enum: ['en_attente', 'paye', 'partiel', 'en_retard']
            }
        }
    },

    /**
     * Schema for Quotes
     */
    devis: {
        required: ['client', 'numero', 'date', 'montant_ttc'],
        properties: {
            // Client
            client: {
                type: 'string',
                description: 'Client destinataire'
            },
            clientAddress: {
                type: 'string',
                description: 'Adresse client'
            },
            clientContact: {
                type: 'string',
                description: 'Contact client'
            },
            
            // Document
            numero: {
                type: 'string',
                description: 'Numéro de devis'
            },
            date: {
                type: 'date',
                description: 'Date du devis'
            },
            validite: {
                type: 'number',
                description: 'Durée de validité en jours',
                default: 30
            },
            
            // Financial
            montant_ht: {
                type: 'number',
                description: 'Montant HT'
            },
            montant_tva: {
                type: 'number',
                description: 'Montant TVA'
            },
            montant_ttc: {
                type: 'number',
                description: 'Montant TTC'
            },
            devise: {
                type: 'string',
                description: 'Devise'
            },
            
            // Items
            items: {
                type: 'array',
                description: 'Lignes du devis'
            },
            
            // Status
            status: {
                type: 'string',
                description: 'Statut du devis',
                enum: ['brouillon', 'envoye', 'accepte', 'refuse', 'expire']
            }
        }
    },

    /**
     * Schema for Expense Reports
     */
    note_frais: {
        required: ['date', 'montant_ttc'],
        properties: {
            // Employee
            employe: {
                type: 'string',
                description: 'Nom de l\'employé'
            },
            
            // Expense details
            date: {
                type: 'date',
                description: 'Date de la dépense'
            },
            description: {
                type: 'string',
                description: 'Description de la dépense'
            },
            category: {
                type: 'string',
                description: 'Catégorie',
                enum: ['Repas', 'Transport', 'Hébergement', 'Formation', 'Matériel', 'Représentation', 'Autres']
            },
            
            // Financial
            montant_ttc: {
                type: 'number',
                description: 'Montant total'
            },
            devise: {
                type: 'string',
                description: 'Devise'
            },
            taux_tva: {
                type: 'number',
                description: 'Taux TVA si applicable'
            },
            
            // Location
            lieu: {
                type: 'string',
                description: 'Lieu de la dépense'
            },
            
            // Project
            projet: {
                type: 'string',
                description: 'Projet associé'
            },
            client_refacture: {
                type: 'string',
                description: 'Client à refacturer si applicable'
            },
            
            // Status
            status: {
                type: 'string',
                description: 'Statut',
                enum: ['en_attente', 'approuve', 'refuse', 'rembourse']
            }
        }
    },

    /**
     * Schema for Credit Card Receipts
     */
    ticket_cb: {
        required: ['commercant', 'date', 'montant_ttc'],
        properties: {
            // Merchant
            commercant: {
                type: 'string',
                description: 'Nom du commerçant',
                aliases: ['company', 'merchant']
            },
            
            // Transaction
            date: {
                type: 'date',
                description: 'Date de transaction'
            },
            heure: {
                type: 'time',
                description: 'Heure de transaction'
            },
            montant_ttc: {
                type: 'number',
                description: 'Montant total'
            },
            devise: {
                type: 'string',
                description: 'Devise'
            },
            
            // Card info
            carte: {
                type: 'string',
                description: 'Carte utilisée',
                extraction: 'last_4_digits'
            },
            typeTransaction: {
                type: 'string',
                description: 'Type de transaction',
                enum: ['paiement', 'retrait', 'remboursement']
            },
            
            // Category
            category: {
                type: 'string',
                description: 'Catégorie automatique'
            },
            
            // Terminal
            terminal: {
                type: 'string',
                description: 'ID du terminal'
            },
            numeroAutorisation: {
                type: 'string',
                description: 'Numéro d\'autorisation'
            }
        }
    }
};

/**
 * Get extraction hints for OpenAI
 */
function getExtractionHints(documentType) {
    const hints = {
        facture_client: `
            Pour une facture client, extraire en priorité:
            1. Le CLIENT (entre l'émetteur et le numéro de document)
            2. Le numéro de facture (format AN-XXXXX ou similaire)
            3. La date et les montants
            4. La devise (CHF, EUR, USD, GBP)
            5. Le statut TVA et taux applicable
        `,
        facture_fournisseur: `
            Pour une facture fournisseur:
            1. Le nom du FOURNISSEUR (en haut du document)
            2. Notre entité facturée (client)
            3. Le numéro et la date
            4. Les montants et devise
            5. La catégorie de dépense
        `,
        devis: `
            Pour un devis:
            1. Le CLIENT destinataire
            2. Le numéro de devis
            3. La date et durée de validité
            4. Les lignes détaillées avec prix
            5. Le montant total
        `,
        note_frais: `
            Pour une note de frais:
            1. L'employé concerné (si mentionné)
            2. La date de la dépense
            3. La description et catégorie
            4. Le montant et devise
            5. Le lieu et projet associé
        `,
        ticket_cb: `
            Pour un ticket CB:
            1. Le nom du commerçant
            2. La date et heure
            3. Le montant total
            4. Les 4 derniers chiffres de la carte
            5. Le numéro d'autorisation
        `
    };
    
    return hints[documentType] || '';
}

/**
 * Validate extracted data against schema
 */
function validateExtractedData(documentType, data) {
    const schema = extractionSchemas[documentType];
    if (!schema) {
        return { valid: false, errors: ['Unknown document type'] };
    }
    
    const errors = [];
    
    // Check required fields
    for (const field of schema.required) {
        if (!data[field]) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    
    // Validate field types and patterns
    for (const [field, config] of Object.entries(schema.properties)) {
        if (data[field] !== undefined) {
            // Type validation
            if (config.type === 'number' && typeof data[field] !== 'number') {
                errors.push(`${field} should be a number`);
            }
            
            // Pattern validation
            if (config.pattern && !config.pattern.test(data[field])) {
                errors.push(`${field} doesn't match expected pattern`);
            }
            
            // Enum validation
            if (config.enum && !config.enum.includes(data[field])) {
                errors.push(`${field} should be one of: ${config.enum.join(', ')}`);
            }
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

module.exports = {
    extractionSchemas,
    getExtractionHints,
    validateExtractedData
};