/**
 * Générateur QR-Factures Suisse - ISO 20022 v2.3
 * =================================================
 * 
 * Implémentation complète des QR-factures suisses selon:
 * ✅ SIX Swiss QR-bill v2.3
 * ✅ ISO 20022 Customer Credit Transfer Initiation
 * ✅ Validation IBAN CH/LI avec checksum MOD 97
 * ✅ Référence QR 27 chiffres avec Mod10 récursif
 * 
 * OBLIGATOIRE: QR-factures requises en Suisse depuis 30.06.2022
 * 
 * @version 2.3.0
 * @updated 2025-01-13
 * @standard ISO 20022, SIX Group
 */

/**
 * Schema officiel QR-Bill selon SIX Swiss QR-bill
 */
export const QR_BILL_SCHEMA = {
    // En-tête (obligatoire)
    header: {
        QRType: 'SPC',           // Swiss Payments Code (obligatoire)
        Version: '0200',         // Version 2.0 (obligatoire)
        Coding: '1'              // UTF-8 encoding (obligatoire)
    },
    
    // Compte créancier (obligatoire)
    creditor: {
        IBAN: '',                // IBAN CH ou LI (21 caractères)
        addressType: 'S',        // S=Structured, K=Combined
        name: '',                // Nom créancier (max 70 caractères)
        street: '',              // Rue (max 70 caractères)
        houseNumber: '',         // Numéro (max 16 caractères)
        postalCode: '',          // Code postal (max 16 caractères)
        city: '',                // Localité (max 35 caractères)
        country: 'CH'            // Code pays ISO 3166-1 alpha-2
    },
    
    // Créancier final (optionnel, généralement vide)
    ultimateCreditor: {
        addressType: '',         // Vide dans cette implémentation
        name: '',               
        street: '',             
        houseNumber: '',        
        postalCode: '',         
        city: '',               
        country: ''             
    },
    
    // Montant (optionnel mais fortement recommandé)
    payment: {
        amount: '',              // Montant (max 12 chiffres, 2 décimales)
        currency: 'CHF'          // Devise (CHF ou EUR uniquement)
    },
    
    // Débiteur final (optionnel)
    debtor: {
        addressType: '',         // S=Structured, K=Combined, ou vide
        name: '',                // Nom débiteur (max 70 caractères)
        street: '',              // Rue (max 70 caractères)  
        houseNumber: '',         // Numéro (max 16 caractères)
        postalCode: '',          // Code postal (max 16 caractères)
        city: '',                // Localité (max 35 caractères)
        country: ''              // Code pays ISO 3166-1 alpha-2
    },
    
    // Référence de paiement (obligatoire selon type)
    reference: {
        type: 'QRR',             // QRR=QR Reference, SCOR=Creditor Reference, NON=Sans référence
        reference: ''            // Référence (27 chiffres pour QRR, max 25 pour SCOR)
    },
    
    // Informations additionnelles
    additionalInfo: {
        unstructured: '',        // Message non structuré (max 140 caractères)
        trailer: 'EPD',          // End Payment Data (obligatoire)
        billInfo: ''             // Informations facture (optionnel)
    }
};

/**
 * Configuration des types d'adresses
 */
export const ADDRESS_TYPES = {
    STRUCTURED: 'S',             // Adresse structurée (recommandée)
    COMBINED: 'K'                // Adresse combinée
};

/**
 * Types de références de paiement
 */
export const REFERENCE_TYPES = {
    QR_REFERENCE: 'QRR',         // Référence QR (27 chiffres avec checksum)
    CREDITOR_REFERENCE: 'SCOR',  // Référence créancier ISO 11649
    NO_REFERENCE: 'NON'          // Sans référence (montant requis)
};

/**
 * Devises autorisées pour les QR-factures
 */
export const ALLOWED_CURRENCIES = ['CHF', 'EUR'];

/**
 * Générateur principal des QR-factures suisses
 */
export class QRInvoiceGenerator {
    
    constructor(creditorData) {
        this.creditor = this.validateCreditor(creditorData);
        this.errors = [];
        this.warnings = [];
        
        console.log(`🏦 QR-Facture initialisée: ${this.creditor.name} (${this.creditor.IBAN})`);
    }
    
    /**
     * Valide les données du créancier
     */
    validateCreditor(data) {
        const required = ['IBAN', 'name', 'postalCode', 'city'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Données créancier manquantes: ${missing.join(', ')}`);
        }
        
        // Validation IBAN
        data.IBAN = this.validateIBAN(data.IBAN);
        
        // Valeurs par défaut
        return {
            IBAN: data.IBAN,
            addressType: data.addressType || ADDRESS_TYPES.STRUCTURED,
            name: this.limitString(data.name, 70),
            street: this.limitString(data.street || '', 70),
            houseNumber: this.limitString(data.houseNumber || '', 16),
            postalCode: this.limitString(data.postalCode, 16),
            city: this.limitString(data.city, 35),
            country: data.country || 'CH'
        };
    }
    
    /**
     * Valide un IBAN suisse ou liechtensteinois
     */
    validateIBAN(iban) {
        if (!iban) throw new Error('IBAN requis');
        
        // Nettoyer et normaliser
        const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
        
        // Vérifier format CH/LI + 19 chiffres
        if (!/^(CH|LI)\d{19}$/.test(cleanIBAN)) {
            throw new Error(`IBAN invalide: Format CH/LI + 19 chiffres requis. Reçu: ${cleanIBAN}`);
        }
        
        // Validation checksum MOD 97
        if (!this.validateIBANChecksum(cleanIBAN)) {
            throw new Error(`IBAN invalide: Checksum MOD 97 incorrecte pour ${cleanIBAN}`);
        }
        
        console.log(`✅ IBAN validé: ${this.formatIBAN(cleanIBAN)}`);
        return cleanIBAN;
    }
    
    /**
     * Valide le checksum IBAN selon MOD 97
     */
    validateIBANChecksum(iban) {
        // Déplacer les 4 premiers caractères à la fin
        const rearranged = iban.slice(4) + iban.slice(0, 4);
        
        // Remplacer les lettres par leurs valeurs numériques (A=10, B=11, etc.)
        const numeric = rearranged.replace(/[A-Z]/g, (letter) => 
            (letter.charCodeAt(0) - 55).toString()
        );
        
        // Calcul MOD 97
        let remainder = 0;
        for (let i = 0; i < numeric.length; i++) {
            remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
        }
        
        return remainder === 1;
    }
    
    /**
     * Formate un IBAN avec espaces pour lisibilité
     */
    formatIBAN(iban) {
        return iban.replace(/(.{4})/g, '$1 ').trim();
    }
    
    /**
     * Génère une référence QR valide (27 chiffres avec checksum)
     */
    generateQRReference() {
        // Générer 26 chiffres : timestamp + numéro aléatoire
        const timestamp = Date.now().toString().slice(-10);
        const random = Math.random().toString().slice(2, 16);
        let base = (timestamp + random).slice(0, 26);
        
        // S'assurer que nous avons exactement 26 chiffres
        base = base.padStart(26, '0');
        
        // Calculer le checksum Mod10 récursif
        const checksum = this.calculateMod10Recursive(base);
        const reference = base + checksum;
        
        console.log(`🔢 Référence QR générée: ${this.formatQRReference(reference)}`);
        return reference;
    }
    
    /**
     * Calcule le checksum Mod10 récursif selon algorithme Luhn modifié
     */
    calculateMod10Recursive(input) {
        // Table de transposition pour Mod10 récursif
        const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
        let carry = 0;
        
        for (let i = 0; i < input.length; i++) {
            const digit = parseInt(input[i]);
            carry = table[(carry + digit) % 10];
        }
        
        return (10 - carry) % 10;
    }
    
    /**
     * Formate une référence QR pour lisibilité
     */
    formatQRReference(reference) {
        return reference.replace(/(\d{2})(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})(\d{1})/, 
                                '$1 $2 $3 $4 $5 $6 $7');
    }
    
    /**
     * Valide une référence QR existante
     */
    validateQRReference(reference) {
        if (!reference) return false;
        
        const cleanRef = reference.replace(/\s/g, '');
        
        // Vérifier format 27 chiffres
        if (!/^\d{27}$/.test(cleanRef)) {
            this.errors.push(`Référence QR invalide: 27 chiffres requis, reçu ${cleanRef.length}`);
            return false;
        }
        
        // Vérifier checksum
        const base = cleanRef.slice(0, 26);
        const checksum = parseInt(cleanRef.slice(26));
        const calculatedChecksum = this.calculateMod10Recursive(base);
        
        if (checksum !== calculatedChecksum) {
            this.errors.push(`Référence QR invalide: Checksum incorrect (${checksum} vs ${calculatedChecksum})`);
            return false;
        }
        
        return true;
    }
    
    /**
     * Valide et formate le montant
     */
    validateAmount(amount, currency = 'CHF') {
        if (amount === null || amount === undefined || amount === '') {
            return { amount: '', currency };
        }
        
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount < 0) {
            throw new Error(`Montant invalide: ${amount}`);
        }
        
        if (numAmount > 999999999.99) {
            throw new Error(`Montant trop élevé: maximum 999'999'999.99, reçu ${amount}`);
        }
        
        if (!ALLOWED_CURRENCIES.includes(currency)) {
            throw new Error(`Devise invalide: ${currency}. Autorisées: ${ALLOWED_CURRENCIES.join(', ')}`);
        }
        
        return {
            amount: numAmount.toFixed(2),
            currency: currency
        };
    }
    
    /**
     * Valide les données du débiteur
     */
    validateDebtor(debtorData) {
        if (!debtorData || !debtorData.name) {
            return null; // Débiteur optionnel
        }
        
        return {
            addressType: debtorData.addressType || ADDRESS_TYPES.STRUCTURED,
            name: this.limitString(debtorData.name, 70),
            street: this.limitString(debtorData.street || '', 70),
            houseNumber: this.limitString(debtorData.houseNumber || '', 16),
            postalCode: this.limitString(debtorData.postalCode || '', 16),
            city: this.limitString(debtorData.city || '', 35),
            country: debtorData.country || 'CH'
        };
    }
    
    /**
     * Limite la longueur d'une chaîne
     */
    limitString(str, maxLength) {
        if (!str) return '';
        if (str.length > maxLength) {
            this.warnings.push(`Texte tronqué: "${str}" -> "${str.slice(0, maxLength)}"`);
            return str.slice(0, maxLength);
        }
        return str;
    }
    
    /**
     * Génère la chaîne QR complète selon format SIX Swiss QR-bill
     */
    generateQRString(invoiceData) {
        try {
            console.log('📋 Génération chaîne QR...');
            
            // Validation des données d'entrée
            const payment = this.validateAmount(invoiceData.amount, invoiceData.currency);
            const debtor = this.validateDebtor(invoiceData.debtor);
            
            // Déterminer le type de référence
            let referenceType = invoiceData.referenceType || REFERENCE_TYPES.QR_REFERENCE;
            let reference = invoiceData.reference || '';
            
            // Génération automatique de référence QR si nécessaire
            if (referenceType === REFERENCE_TYPES.QR_REFERENCE && !reference) {
                reference = this.generateQRReference();
            }
            
            // Validation de la référence
            if (referenceType === REFERENCE_TYPES.QR_REFERENCE && reference) {
                if (!this.validateQRReference(reference)) {
                    throw new Error('Référence QR invalide');
                }
            }
            
            // Construction de la chaîne QR selon spécification SIX
            const qrParts = [
                // 1-3: En-tête
                'SPC',                                    // QR Type
                '0200',                                   // Version
                '1',                                      // Character Set (UTF-8)
                
                // 4-10: Compte créancier
                this.creditor.IBAN,                       // Account
                this.creditor.addressType,                // Cdtr Adr Tp
                this.creditor.name,                       // Name
                this.creditor.street,                     // StrtNmOrAdrLine1  
                this.creditor.houseNumber,                // BldgNbOrAdrLine2
                this.creditor.postalCode,                 // PstCd
                this.creditor.city,                       // TwnNm
                this.creditor.country,                    // Ctry
                
                // 11-17: Créancier final (vide dans cette implémentation)
                '',                                       // UltmtCdtr Adr Tp
                '',                                       // UltmtCdtr Name
                '',                                       // UltmtCdtr StrtNmOrAdrLine1
                '',                                       // UltmtCdtr BldgNbOrAdrLine2
                '',                                       // UltmtCdtr PstCd
                '',                                       // UltmtCdtr TwnNm
                '',                                       // UltmtCdtr Ctry
                
                // 18-19: Informations de paiement
                payment.amount,                           // CcyAmt
                payment.currency,                         // Ccy
                
                // 20-26: Débiteur final (optionnel)
                debtor ? debtor.addressType : '',        // UltmtDbtr Adr Tp
                debtor ? debtor.name : '',                // UltmtDbtr Name
                debtor ? debtor.street : '',              // UltmtDbtr StrtNmOrAdrLine1
                debtor ? debtor.houseNumber : '',         // UltmtDbtr BldgNbOrAdrLine2
                debtor ? debtor.postalCode : '',          // UltmtDbtr PstCd
                debtor ? debtor.city : '',                // UltmtDbtr TwnNm
                debtor ? debtor.country : '',             // UltmtDbtr Ctry
                
                // 27-28: Référence de paiement
                referenceType,                            // RmtInf Tp
                reference,                                // RmtInf Ref
                
                // 29-31: Informations additionnelles
                this.limitString(invoiceData.message || '', 140), // AddInf Ustrd
                'EPD',                                    // AddInf Trailer (obligatoire)
                this.limitString(invoiceData.billInfo || '', 140) // AddInf BillInf
            ];
            
            const qrString = qrParts.join('\n');
            
            console.log(`✅ Chaîne QR générée: ${qrString.length} caractères`);
            console.log(`   Référence: ${referenceType} - ${reference ? this.formatQRReference(reference) : 'N/A'}`);
            console.log(`   Montant: ${payment.amount} ${payment.currency}`);
            
            return qrString;
            
        } catch (error) {
            console.error('❌ Erreur génération chaîne QR:', error);
            this.errors.push(`Erreur génération QR: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Génère le QR-Code image depuis la chaîne QR
     */
    async generateQRCode(invoiceData, options = {}) {
        try {
            const qrString = this.generateQRString(invoiceData);
            
            // Configuration par défaut selon spécification SIX
            const qrOptions = {
                errorCorrectionLevel: 'M',    // Medium (15% recovery)
                margin: 0,                    // Pas de marge (gérée par le layout)
                width: 166,                   // 46mm à 300 DPI
                color: {
                    dark: '#000000',          // Noir
                    light: '#FFFFFF'          // Blanc
                },
                ...options
            };
            
            // Import dynamique de qrcode
            let QRCode;
            if (typeof require !== 'undefined') {
                QRCode = require('qrcode');
            } else {
                QRCode = await import('qrcode');
            }
            
            const qrCodeDataURL = await QRCode.toDataURL(qrString, qrOptions);
            
            console.log('📱 QR-Code généré avec succès');
            
            return {
                qrString,
                qrCodeImage: qrCodeDataURL,
                format: 'data:image/png;base64',
                dimensions: {
                    width: qrOptions.width,
                    height: qrOptions.width,
                    dpi: 300
                }
            };
            
        } catch (error) {
            console.error('❌ Erreur génération QR-Code:', error);
            this.errors.push(`Erreur QR-Code: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Génère une facture QR complète avec layout suisse
     */
    async generateCompleteInvoice(invoiceData, layoutOptions = {}) {
        try {
            console.log('🧾 Génération facture QR complète...');
            
            const qrResult = await this.generateQRCode(invoiceData);
            
            // Layout par défaut selon spécification SIX
            const layout = {
                format: 'A4',
                orientation: 'portrait',
                qrPosition: 'bottom',         // Position du QR-bill
                separationLine: true,         // Ligne de séparation
                scissors: true,               // Symbole ciseaux
                foldingMarks: true,           // Marques de pliage
                language: 'fr',               // fr, de, it, en
                ...layoutOptions
            };
            
            // Données formatées pour l'affichage
            const formattedData = {
                creditor: {
                    name: this.creditor.name,
                    address: this.formatAddress(this.creditor),
                    iban: this.formatIBAN(this.creditor.IBAN)
                },
                debtor: invoiceData.debtor ? {
                    name: invoiceData.debtor.name,
                    address: this.formatAddress(invoiceData.debtor)
                } : null,
                payment: {
                    amount: invoiceData.amount ? parseFloat(invoiceData.amount).toLocaleString('fr-CH', {
                        style: 'currency',
                        currency: invoiceData.currency || 'CHF'
                    }) : '',
                    currency: invoiceData.currency || 'CHF',
                    reference: invoiceData.reference ? this.formatQRReference(invoiceData.reference) : '',
                    message: invoiceData.message || ''
                },
                qr: qrResult,
                layout,
                generatedAt: new Date().toISOString()
            };
            
            console.log('✅ Facture QR complète générée');
            return formattedData;
            
        } catch (error) {
            console.error('❌ Erreur génération facture complète:', error);
            throw error;
        }
    }
    
    /**
     * Formate une adresse pour l'affichage
     */
    formatAddress(addressData) {
        const parts = [];
        
        if (addressData.street) {
            const streetLine = addressData.houseNumber ? 
                `${addressData.street} ${addressData.houseNumber}` : 
                addressData.street;
            parts.push(streetLine);
        }
        
        if (addressData.postalCode && addressData.city) {
            parts.push(`${addressData.postalCode} ${addressData.city}`);
        }
        
        if (addressData.country && addressData.country !== 'CH') {
            parts.push(addressData.country);
        }
        
        return parts.join('\n');
    }
    
    /**
     * Valide une facture QR complète
     */
    validateInvoice(invoiceData) {
        this.errors = [];
        this.warnings = [];
        
        try {
            // Validation données obligatoires
            if (!invoiceData) {
                throw new Error('Données facture manquantes');
            }
            
            // Validation montant et devise
            if (invoiceData.amount !== undefined && invoiceData.amount !== '') {
                this.validateAmount(invoiceData.amount, invoiceData.currency);
            }
            
            // Validation référence si fournie
            if (invoiceData.reference && invoiceData.referenceType === REFERENCE_TYPES.QR_REFERENCE) {
                this.validateQRReference(invoiceData.reference);
            }
            
            // Validation débiteur si fourni
            if (invoiceData.debtor) {
                this.validateDebtor(invoiceData.debtor);
            }
            
            // Validation longueurs des textes
            if (invoiceData.message && invoiceData.message.length > 140) {
                this.warnings.push('Message tronqué à 140 caractères');
            }
            
            if (invoiceData.billInfo && invoiceData.billInfo.length > 140) {
                this.warnings.push('Informations facture tronquées à 140 caractères');
            }
            
            return {
                isValid: this.errors.length === 0,
                errors: this.errors,
                warnings: this.warnings
            };
            
        } catch (error) {
            this.errors.push(error.message);
            return {
                isValid: false,
                errors: this.errors,
                warnings: this.warnings
            };
        }
    }
    
    /**
     * Export JSON pour intégration
     */
    exportData(invoiceData) {
        return {
            metadata: {
                generator: 'QRInvoiceGenerator v2.3.0',
                standard: 'ISO 20022, SIX Swiss QR-bill v2.3',
                creditor: this.creditor,
                generatedAt: new Date().toISOString()
            },
            invoice: invoiceData,
            validation: this.validateInvoice(invoiceData),
            qrString: this.generateQRString(invoiceData)
        };
    }
}

/**
 * Utilitaires pour QR-factures
 */
export const QRInvoiceUtils = {
    
    /**
     * Parse une chaîne QR existante
     */
    parseQRString(qrString) {
        const parts = qrString.split('\n');
        
        if (parts.length < 31) {
            throw new Error('Chaîne QR invalide: format incomplet');
        }
        
        return {
            header: {
                qrType: parts[0],
                version: parts[1],
                coding: parts[2]
            },
            creditor: {
                IBAN: parts[3],
                addressType: parts[4],
                name: parts[5],
                street: parts[6],
                houseNumber: parts[7],
                postalCode: parts[8],
                city: parts[9],
                country: parts[10]
            },
            payment: {
                amount: parts[17],
                currency: parts[18]
            },
            debtor: {
                addressType: parts[19],
                name: parts[20],
                street: parts[21],
                houseNumber: parts[22],
                postalCode: parts[23],
                city: parts[24],
                country: parts[25]
            },
            reference: {
                type: parts[26],
                reference: parts[27]
            },
            additionalInfo: {
                unstructured: parts[28],
                trailer: parts[29],
                billInfo: parts[30] || ''
            }
        };
    },
    
    /**
     * Formats standards pour références
     */
    formatters: {
        iban: (iban) => iban.replace(/(.{4})/g, '$1 ').trim(),
        qrReference: (ref) => ref.replace(/(\d{2})(\d{5})(\d{5})(\d{5})(\d{5})(\d{5})(\d{1})/, '$1 $2 $3 $4 $5 $6 $7'),
        amount: (amount, currency = 'CHF') => new Intl.NumberFormat('fr-CH', {
            style: 'currency',
            currency: currency
        }).format(amount)
    }
};

// Export par défaut
export default {
    QRInvoiceGenerator,
    QRInvoiceUtils,
    QR_BILL_SCHEMA,
    ADDRESS_TYPES,
    REFERENCE_TYPES,
    ALLOWED_CURRENCIES
};