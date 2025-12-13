/**
 * Unified Accounting Engine - Master Module
 * ============================================
 * 
 * Moteur comptable unifié pour toutes les entités:
 * - Hypervisual SA (1021)
 * - Dainamics GmbH (1022)  
 * - Waveform AG (1023)
 * - Particule SÀRL (1024)
 * - Holding Corp (1025)
 * 
 * Conformité suisse 2025:
 * ✅ TVA 8.1% / 2.6% / 3.8% (entrée en vigueur 01.01.2024)
 * ✅ Plan comptable PME suisse (modèle Sterchi)
 * ✅ Formulaire TVA 200 AFC
 * ✅ QR-Factures v2.3
 * ✅ Normes Swiss GAAP FER
 * 
 * @version 2.1.0
 * @updated 2025-01-13
 */

// Import modules (conditional for browser/Node.js compatibility)
let SwissCompliance, AccountingServices, AccountingUtils, Form200Generator, AFCCodes, QRInvoiceGenerator;

if (typeof require !== 'undefined') {
    SwissCompliance = require('../swiss-compliance/tva-engine');
    AccountingServices = require('../services/entry-automation');
    AccountingUtils = require('../utils/formatters');
    const { Form200Generator: F200, AutoForm200Generator } = require('../swiss-compliance/form-200-generator');
    Form200Generator = F200;
    AFCCodes = require('../swiss-compliance/afc-codes');
    const { QRInvoiceGenerator: QRGen, QRInvoiceUtils } = require('../swiss-compliance/qr-invoice');
    QRInvoiceGenerator = QRGen;
} else {
    // Browser fallback - modules will be loaded separately
    SwissCompliance = window.SwissCompliance || {};
    AccountingServices = window.AccountingServices || {};
    AccountingUtils = window.AccountingUtils || {};
    Form200Generator = window.Form200Generator || null;
    AFCCodes = window.AFCCodes || {};
    QRInvoiceGenerator = window.QRInvoiceGenerator || null;
}

const AccountingEngine = (function() {
    'use strict';
    
    // Configuration centralisée TVA Suisse 2025
    const TVA_CONFIG = {
        // Taux en vigueur depuis 01.01.2024 (applicable 2025)
        RATES: {
            NORMAL: 0.081,        // 8.1% - Taux normal
            REDUCED: 0.026,       // 2.6% - Taux réduit (alimentation, médicaments, etc.)
            ACCOMMODATION: 0.038, // 3.8% - Hébergement
            EXEMPT: 0,            // 0% - Exonéré
            
            // Pourcentages pour affichage
            NORMAL_PERCENT: 8.1,
            REDUCED_PERCENT: 2.6,
            ACCOMMODATION_PERCENT: 3.8,
            
            // Taux par défaut pour les calculs
            DEFAULT: 0.081,
            DEFAULT_PERCENT: 8.1,
            
            // Historique (pour recalcul factures antérieures au 01.01.2024)
            PREVIOUS: {
                NORMAL: 0.077,
                REDUCED: 0.025,
                ACCOMMODATION: 0.037,
                validUntil: '2023-12-31'
            }
        },
        
        // Codes TVA comptables (Formulaire 200 AFC)
        CODES: {
            // ===== VENTES (Output VAT) =====
            V81: { 
                code: 'V81',
                rate: 0.081, 
                percent: 8.1,
                type: 'output', 
                description_fr: 'Ventes taux normal 8.1%',
                description_de: 'Umsätze Normalsatz 8.1%',
                formField: '302',
                accountDebit: '1100',  // Clients
                accountCredit: '2200'  // TVA due
            },
            V26: { 
                code: 'V26',
                rate: 0.026, 
                percent: 2.6,
                type: 'output', 
                description_fr: 'Ventes taux réduit 2.6%',
                description_de: 'Umsätze red. Satz 2.6%',
                formField: '312',
                accountDebit: '1100',
                accountCredit: '2200'
            },
            V38: { 
                code: 'V38',
                rate: 0.038, 
                percent: 3.8,
                type: 'output', 
                description_fr: 'Ventes hébergement 3.8%',
                description_de: 'Umsätze Beherbergung 3.8%',
                formField: '342',
                accountDebit: '1100',
                accountCredit: '2200'
            },
            VEX: { 
                code: 'VEX',
                rate: 0, 
                percent: 0,
                type: 'output', 
                description_fr: 'Ventes exonérées (art. 21)',
                description_de: 'Steuerbefreit (Art. 21)',
                formField: '220',
                accountDebit: '1100',
                accountCredit: null
            },
            VEXP: { 
                code: 'VEXP',
                rate: 0, 
                percent: 0,
                type: 'output', 
                description_fr: 'Exportations (art. 23)',
                description_de: 'Exporte (Art. 23)',
                formField: '221',
                accountDebit: '1100',
                accountCredit: null
            },

            // ===== ACHATS (Input VAT - Impôt préalable) =====
            A81: { 
                code: 'A81',
                rate: 0.081, 
                percent: 8.1,
                type: 'input', 
                description_fr: 'Achats taux normal 8.1%',
                description_de: 'Einkäufe Normalsatz 8.1%',
                formField: '400',
                accountDebit: '1170',  // TVA récupérable
                accountCredit: '2000'  // Fournisseurs
            },
            A26: { 
                code: 'A26',
                rate: 0.026, 
                percent: 2.6,
                type: 'input', 
                description_fr: 'Achats taux réduit 2.6%',
                description_de: 'Einkäufe red. Satz 2.6%',
                formField: '400',
                accountDebit: '1170',
                accountCredit: '2000'
            },
            A38: { 
                code: 'A38',
                rate: 0.038, 
                percent: 3.8,
                type: 'input', 
                description_fr: 'Achats hébergement 3.8%',
                description_de: 'Einkäufe Beherbergung 3.8%',
                formField: '400',
                accountDebit: '1170',
                accountCredit: '2000'
            },

            // ===== INVESTISSEMENTS =====
            I81: { 
                code: 'I81',
                rate: 0.081, 
                percent: 8.1,
                type: 'input', 
                description_fr: 'Investissements taux normal 8.1%',
                description_de: 'Investitionen Normalsatz 8.1%',
                formField: '405',
                accountDebit: '1170',
                accountCredit: '2000'
            }
        }
    };

    // Plan comptable PME suisse unifié
    const CHART_OF_ACCOUNTS = {
        // CLASSE 1 - ACTIFS
        "1": {
            nom: "ACTIFS",
            comptes: {
                // 10 - Liquidités
                "1000": { nom: "Caisse CHF", nature: "debit" },
                "1020": { nom: "Banque - compte courant", nature: "debit" },
                "1021": { nom: "Revolut Hypervisual", parent: "1020", nature: "debit" },
                "1022": { nom: "Revolut Dainamics", parent: "1020", nature: "debit" },
                "1023": { nom: "Revolut Waveform", parent: "1020", nature: "debit" },
                "1024": { nom: "Revolut Particule", parent: "1020", nature: "debit" },
                "1025": { nom: "Revolut Holding", parent: "1020", nature: "debit" },
                
                // 11 - Créances
                "1100": { nom: "Créances clients", nature: "debit" },
                "1109": { nom: "Ducroire", nature: "credit", correctif: true },
                "1170": { nom: "TVA à récupérer", nature: "debit" },
                "1176": { nom: "Impôt anticipé", nature: "debit" },
                
                // 12 - Stocks
                "1200": { nom: "Stock marchandises", nature: "debit" },
                "1260": { nom: "Stock matériel", nature: "debit" },
                
                // 13 - Actifs transitoires
                "1300": { nom: "Charges payées d'avance", nature: "debit" },
                "1301": { nom: "Produits à recevoir", nature: "debit" },
                
                // 15 - Immobilisations corporelles
                "1500": { nom: "Machines et équipements", nature: "debit" },
                "1509": { nom: "Amort. cumulés machines", nature: "credit", correctif: true },
                "1510": { nom: "Mobilier et installations", nature: "debit" },
                "1519": { nom: "Amort. cumulés mobilier", nature: "credit", correctif: true },
                "1520": { nom: "Véhicules", nature: "debit" },
                "1529": { nom: "Amort. cumulés véhicules", nature: "credit", correctif: true },
                "1530": { nom: "Informatique", nature: "debit" },
                "1539": { nom: "Amort. cumulés informatique", nature: "credit", correctif: true }
            }
        },
        
        // CLASSE 2 - PASSIFS
        "2": {
            nom: "PASSIFS",
            comptes: {
                // 20 - Dettes à court terme
                "2000": { nom: "Dettes fournisseurs", nature: "credit" },
                "2030": { nom: "Acomptes clients", nature: "credit" },
                "2100": { nom: "Dettes bancaires CT", nature: "credit" },
                
                // 21 - Passifs transitoires
                "2300": { nom: "Charges à payer", nature: "credit" },
                "2301": { nom: "Produits reçus d'avance", nature: "credit" },
                
                // 22 - Dettes fiscales et sociales
                "2200": { nom: "TVA due", nature: "credit" },
                "2201": { nom: "TVA sur acomptes reçus", nature: "credit" },
                "2206": { nom: "Impôt anticipé dû", nature: "credit" },
                "2270": { nom: "AVS/AI/APG/AC à payer", nature: "credit" },
                "2271": { nom: "LPP à payer", nature: "credit" },
                "2279": { nom: "Impôts dus", nature: "credit" },
                
                // 28 - Capitaux propres
                "2800": { nom: "Capital social", nature: "credit" },
                "2850": { nom: "Réserves légales", nature: "credit" },
                "2900": { nom: "Bénéfice/Perte reporté", nature: "credit" },
                "2991": { nom: "Bénéfice de l'exercice", nature: "credit" },
                "2992": { nom: "Perte de l'exercice", nature: "debit" }
            }
        },
        
        // CLASSE 3 - PRODUITS D'EXPLOITATION
        "3": {
            nom: "PRODUITS D'EXPLOITATION",
            comptes: {
                "3000": { nom: "Ventes marchandises Suisse", type: "produit", nature: "credit" },
                "3001": { nom: "Ventes marchandises Export", type: "produit", nature: "credit" },
                "3200": { nom: "Prestations de services", type: "produit", nature: "credit" },
                "3201": { nom: "Prestations développement", type: "produit", nature: "credit" },
                "3202": { nom: "Prestations consulting", type: "produit", nature: "credit" },
                "3203": { nom: "Prestations formation", type: "produit", nature: "credit" },
                "3210": { nom: "Produits de licences", type: "produit", nature: "credit" }
            }
        },
        
        // CLASSE 4 - CHARGES MARCHANDISES
        "4": {
            nom: "CHARGES MARCHANDISES",
            comptes: {
                "4000": { nom: "Achats marchandises", type: "charge", nature: "debit" },
                "4200": { nom: "Achats prestations tiers", type: "charge", nature: "debit" },
                "4201": { nom: "Achats développement", type: "charge", nature: "debit" }
            }
        },
        
        // CLASSE 5 - CHARGES PERSONNEL
        "5": {
            nom: "CHARGES PERSONNEL",
            comptes: {
                "5000": { nom: "Salaires", type: "charge", nature: "debit" },
                "5700": { nom: "Charges sociales patronales", type: "charge", nature: "debit" },
                "5720": { nom: "LPP patronale", type: "charge", nature: "debit" },
                "5810": { nom: "Formation personnel", type: "charge", nature: "debit" }
            }
        },
        
        // CLASSE 6 - AUTRES CHARGES D'EXPLOITATION
        "6": {
            nom: "AUTRES CHARGES D'EXPLOITATION",
            comptes: {
                "6000": { nom: "Loyer", type: "charge", nature: "debit" },
                "6200": { nom: "Frais de véhicules", type: "charge", nature: "debit" },
                "6300": { nom: "Assurances", type: "charge", nature: "debit" },
                "6501": { nom: "Téléphone, internet", type: "charge", nature: "debit" },
                "6503": { nom: "Honoraires fiduciaire", type: "charge", nature: "debit" },
                "6520": { nom: "Frais bancaires", type: "charge", nature: "debit" },
                "6570": { nom: "Frais informatiques", type: "charge", nature: "debit" },
                "6600": { nom: "Publicité, marketing", type: "charge", nature: "debit" },
                "6800": { nom: "Amortissements", type: "charge", nature: "debit" }
            }
        }
    };

    // État du module
    let state = {
        ecritures: [],
        balances: {},
        currentUser: null,
        nextEntryNumber: 1
    };

    /**
     * Calcule la TVA depuis un montant HT
     */
    function calculateVATFromNet(netAmount, tvaCode = 'V81') {
        const tvaInfo = TVA_CONFIG.CODES[tvaCode] || TVA_CONFIG.CODES.V81;
        const vatAmount = netAmount * tvaInfo.rate;
        const grossAmount = netAmount + vatAmount;
        
        return {
            net: AccountingUtils.roundCHF(netAmount),
            vat: AccountingUtils.roundCHF(vatAmount),
            gross: AccountingUtils.roundCHF(grossAmount),
            rate: tvaInfo.rate,
            percent: tvaInfo.percent,
            code: tvaCode
        };
    }

    /**
     * Calcule la TVA depuis un montant TTC
     */
    function calculateVATFromGross(grossAmount, tvaCode = 'V81') {
        const tvaInfo = TVA_CONFIG.CODES[tvaCode] || TVA_CONFIG.CODES.V81;
        const vatAmount = grossAmount * tvaInfo.rate / (1 + tvaInfo.rate);
        const netAmount = grossAmount - vatAmount;
        
        return {
            net: AccountingUtils.roundCHF(netAmount),
            vat: AccountingUtils.roundCHF(vatAmount),
            gross: AccountingUtils.roundCHF(grossAmount),
            rate: tvaInfo.rate,
            percent: tvaInfo.percent,
            code: tvaCode
        };
    }

    /**
     * Obtient le taux TVA applicable à une date
     */
    function getVATRateForDate(date, rateType = 'normal') {
        const d = new Date(date);
        const cutoffDate = new Date('2024-01-01');
        
        if (d < cutoffDate) {
            // Anciens taux (avant 2024)
            switch (rateType) {
                case 'reduced': return 0.025;
                case 'accommodation': return 0.037;
                default: return 0.077;
            }
        } else {
            // Nouveaux taux (2024+)
            switch (rateType) {
                case 'reduced': return TVA_CONFIG.RATES.REDUCED;
                case 'accommodation': return TVA_CONFIG.RATES.ACCOMMODATION;
                default: return TVA_CONFIG.RATES.NORMAL;
            }
        }
    }

    /**
     * Détermine automatiquement le code TVA selon le type de transaction
     */
    function autoDetectVATCode(transaction) {
        const { type, rate, isExport, isExempt } = transaction;
        
        // Exportations
        if (isExport) return 'VEXP';
        
        // Exonérations
        if (isExempt) return type === 'sale' ? 'VEX' : 'AEX';
        
        // Par taux
        if (rate === 0.081 || rate === 8.1) {
            return type === 'sale' ? 'V81' : 'A81';
        } else if (rate === 0.026 || rate === 2.6) {
            return type === 'sale' ? 'V26' : 'A26';
        } else if (rate === 0.038 || rate === 3.8) {
            return type === 'sale' ? 'V38' : 'A38';
        }
        
        // Par défaut: taux normal
        return type === 'sale' ? 'V81' : 'A81';
    }

    /**
     * Obtient le nom d'un compte
     */
    function getAccountName(accountNumber) {
        for (const [classe, data] of Object.entries(CHART_OF_ACCOUNTS)) {
            if (data.comptes && data.comptes[accountNumber]) {
                return data.comptes[accountNumber].nom;
            }
        }
        return 'Compte inconnu';
    }

    /**
     * Valide une écriture comptable
     */
    function validateEntry(entry) {
        const errors = [];
        
        // Vérifier équilibre
        const totalDebit = entry.lignes.reduce((sum, ligne) => sum + ligne.debit, 0);
        const totalCredit = entry.lignes.reduce((sum, ligne) => sum + ligne.credit, 0);
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            errors.push('Écriture non équilibrée');
        }
        
        // Vérifier nombre de lignes
        if (entry.lignes.length < 2) {
            errors.push('Au moins 2 lignes requises');
        }
        
        // Vérifier comptes valides
        entry.lignes.forEach((ligne, index) => {
            if (!getAccountName(ligne.compte)) {
                errors.push(`Ligne ${index + 1}: Compte ${ligne.compte} invalide`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Crée une écriture automatique basée sur un modèle
     */
    async function createAutomaticEntry(template, data) {
        try {
            return await AccountingServices.createAutomaticEntry(template, data, {
                TVA_CONFIG,
                CHART_OF_ACCOUNTS,
                state
            });
        } catch (error) {
            console.error('Erreur création écriture automatique:', error);
            return null;
        }
    }

    /**
     * Calcule les balances de tous les comptes
     */
    async function calculateBalances() {
        return SwissCompliance.calculateBalances(state.ecritures, CHART_OF_ACCOUNTS);
    }

    /**
     * Génère automatiquement le Formulaire 200 TVA depuis les écritures
     */
    async function generateForm200(companyData, periodStart, periodEnd, declarationType = 'quarterly') {
        try {
            if (!Form200Generator) {
                throw new Error('Form200Generator non disponible');
            }
            
            console.log(`📋 Génération Formulaire 200 TVA: ${periodStart} → ${periodEnd}`);
            
            // Utiliser le générateur automatique
            const { AutoForm200Generator } = require('../swiss-compliance/form-200-generator');
            const form200 = AutoForm200Generator.fromAccountingEntries(
                companyData, 
                state.ecritures, 
                periodStart, 
                periodEnd, 
                declarationType
            );
            
            // Génération des exports
            const exports = {
                json: form200.exportJSON(),
                pdf: form200.generatePDFData(),
                xml: form200.generateECH0217XML()
            };
            
            console.log(`✅ Formulaire 200 généré - Montant final: ${form200.entries.cifra500?.amount || 0} CHF`);
            
            return {
                form200,
                exports,
                validation: form200.getValidationReport()
            };
            
        } catch (error) {
            console.error('❌ Erreur génération Formulaire 200:', error);
            throw error;
        }
    }

    /**
     * Mappe un compte comptable vers un code AFC
     */
    function mapAccountToAFCCode(accountNumber, transactionType = 'sale') {
        if (!AFCCodes?.ACCOUNT_TO_AFC_MAPPING) return null;
        
        // Mapping direct
        let afcCode = AFCCodes.ACCOUNT_TO_AFC_MAPPING[accountNumber];
        
        // Si pas de mapping direct, déduction par classe de compte
        if (!afcCode) {
            const accountClass = accountNumber.charAt(0);
            
            switch (accountClass) {
                case '3': // Comptes de produits
                    afcCode = 'cifra302'; // Taux normal par défaut
                    break;
                case '4': // Comptes de charges
                    afcCode = 'cifra400'; // Impôt préalable
                    break;
                case '1': // Actifs (investissements possibles)
                    if (['1500', '1510', '1520', '1530'].includes(accountNumber)) {
                        afcCode = 'cifra400'; // Impôt préalable investissements
                    }
                    break;
            }
        }
        
        return afcCode;
    }

    /**
     * Valide la conformité AFC d'une écriture
     */
    function validateAFCCompliance(entry) {
        const validation = {
            isCompliant: true,
            warnings: [],
            errors: []
        };
        
        // Vérifier si l'écriture concerne la TVA
        const hasVATAccount = entry.lignes.some(ligne => 
            ligne.compte === '2200' || ligne.compte === '1170'
        );
        
        if (hasVATAccount) {
            // Vérifier cohérence des taux TVA
            const tvaLine = entry.lignes.find(l => l.compte === '2200' || l.compte === '1170');
            const baseLine = entry.lignes.find(l => l.compte.startsWith('3') || l.compte.startsWith('4'));
            
            if (tvaLine && baseLine && baseLine.credit > 0) {
                const calculatedRate = tvaLine.credit / baseLine.credit;
                const expectedRates = [0.081, 0.026, 0.038];
                
                const isValidRate = expectedRates.some(rate => 
                    Math.abs(calculatedRate - rate) < 0.001
                );
                
                if (!isValidRate) {
                    validation.warnings.push(
                        `Taux TVA inhabituel: ${(calculatedRate * 100).toFixed(2)}% (attendu: 8.1%, 2.6% ou 3.8%)`
                    );
                }
            }
        }
        
        return validation;
    }

    /**
     * Génère une QR-facture suisse ISO 20022 v2.3
     */
    async function generateQRInvoice(creditorData, invoiceData, options = {}) {
        try {
            if (!QRInvoiceGenerator) {
                throw new Error('QRInvoiceGenerator non disponible');
            }

            console.log(`🧾 Génération QR-facture: ${creditorData.name} -> ${invoiceData.amount || 'montant libre'} CHF`);

            // Initialiser le générateur avec les données du créancier
            const qrGenerator = new QRInvoiceGenerator(creditorData);

            // Validation de la facture
            const validation = qrGenerator.validateInvoice(invoiceData);
            if (!validation.isValid) {
                throw new Error(`Facture invalide: ${validation.errors.join(', ')}`);
            }

            // Génération selon le type demandé
            const exports = {};

            if (options.includeQRString !== false) {
                exports.qrString = qrGenerator.generateQRString(invoiceData);
            }

            if (options.includeQRCode !== false) {
                exports.qrCode = await qrGenerator.generateQRCode(invoiceData, options.qrCodeOptions);
            }

            if (options.includeCompleteInvoice) {
                exports.completeInvoice = await qrGenerator.generateCompleteInvoice(invoiceData, options.layoutOptions);
            }

            if (options.includeJSON !== false) {
                exports.jsonData = qrGenerator.exportData(invoiceData);
            }

            console.log(`✅ QR-facture générée - Référence: ${invoiceData.reference ? qrGenerator.formatQRReference(invoiceData.reference) : 'Auto-générée'}`);

            return {
                validation,
                exports,
                generator: qrGenerator
            };

        } catch (error) {
            console.error('❌ Erreur génération QR-facture:', error);
            throw error;
        }
    }

    /**
     * Génère automatiquement une QR-facture depuis une écriture comptable
     */
    async function generateQRInvoiceFromEntry(entry, creditorData, options = {}) {
        try {
            // Extraire les informations de facturation depuis l'écriture
            const salesLine = entry.lignes.find(ligne => ligne.compte.startsWith('3'));
            const vatLine = entry.lignes.find(ligne => ligne.compte === '2200');
            const clientLine = entry.lignes.find(ligne => ligne.compte === '1100');

            if (!salesLine || !clientLine) {
                throw new Error('Écriture incompatible: lignes vente et client requises');
            }

            // Calculer le montant net (HT)
            const netAmount = salesLine.credit;
            const vatAmount = vatLine ? vatLine.credit : 0;
            const grossAmount = netAmount + vatAmount;

            // Déterminer le taux TVA
            let vatRate = 'normal';
            if (vatLine && netAmount > 0) {
                const calculatedRate = vatAmount / netAmount;
                if (Math.abs(calculatedRate - 0.026) < 0.001) vatRate = 'reduced';
                else if (Math.abs(calculatedRate - 0.038) < 0.001) vatRate = 'accommodation';
            }

            // Construire les données de facture
            const invoiceData = {
                amount: grossAmount,
                currency: 'CHF',
                referenceType: 'QRR',
                message: entry.libelle || `Facture ${entry.numero_piece || ''}`,
                billInfo: `Écriture ${entry.numero_ecriture} du ${entry.date_ecriture}`,
                ...options.invoiceOverrides
            };

            // Ajouter les données du débiteur si disponibles
            if (options.debtorData) {
                invoiceData.debtor = options.debtorData;
            }

            console.log(`🔄 Génération QR-facture automatique depuis écriture ${entry.numero_ecriture}`);
            return await generateQRInvoice(creditorData, invoiceData, options);

        } catch (error) {
            console.error('❌ Erreur génération QR-facture automatique:', error);
            throw error;
        }
    }

    /**
     * Valide un IBAN suisse ou liechtensteinois
     */
    function validateSwissIBAN(iban) {
        if (!QRInvoiceGenerator) return null;

        try {
            const tempGenerator = { validateIBAN: QRInvoiceGenerator.prototype.validateIBAN };
            return tempGenerator.validateIBAN.call({ errors: [] }, iban);
        } catch (error) {
            console.error('Erreur validation IBAN:', error);
            return null;
        }
    }

    /**
     * Génère une référence QR valide
     */
    function generateQRReference() {
        if (!QRInvoiceGenerator) return null;

        try {
            const tempGenerator = { 
                generateQRReference: QRInvoiceGenerator.prototype.generateQRReference,
                calculateMod10Recursive: QRInvoiceGenerator.prototype.calculateMod10Recursive,
                formatQRReference: QRInvoiceGenerator.prototype.formatQRReference
            };
            return tempGenerator.generateQRReference.call({});
        } catch (error) {
            console.error('Erreur génération référence QR:', error);
            return null;
        }
    }

    // Interface publique du module
    return {
        // Configuration
        TVA_CONFIG,
        CHART_OF_ACCOUNTS,
        AFC_CODES: AFCCodes || {},
        
        // Fonctions TVA
        calculateVATFromNet,
        calculateVATFromGross,
        getVATRateForDate,
        autoDetectVATCode,
        
        // Fonctions comptables
        validateEntry,
        createAutomaticEntry,
        calculateBalances,
        getAccountName,
        
        // Fonctions AFC (Administration Fédérale des Contributions)
        generateForm200,
        mapAccountToAFCCode,
        validateAFCCompliance,
        
        // Fonctions QR-Factures ISO 20022 v2.3
        generateQRInvoice,
        generateQRInvoiceFromEntry,
        validateSwissIBAN,
        generateQRReference,
        
        // Utilitaires
        roundCHF: AccountingUtils.roundCHF,
        formatAmount: AccountingUtils.formatSwissAmount,
        formatDate: AccountingUtils.formatDate,
        
        // État
        getState: () => state,
        setState: (newState) => { state = { ...state, ...newState }; }
    };

})();

// Export pour Node.js et navigateur
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountingEngine;
} else if (typeof window !== 'undefined') {
    window.AccountingEngine = AccountingEngine;
}