/**
 * Générateur Formulaire 200 TVA - Administration Fédérale des Contributions
 * ========================================================================
 * 
 * Génération automatique du Formulaire 200 pour la déclaration TVA suisse.
 * Supports:
 * ✅ Export PDF conforme AFC
 * ✅ Export XML eCH-0217 v2.0 (transmission électronique)
 * ✅ Calculs automatiques avec validation
 * ✅ Support multi-périodes (mensuel, trimestriel, semestriel, annuel)
 * 
 * @version 1.0.0
 * @updated 2025-01-13
 */

import { 
    AFC_FORM_200_CODES, 
    VAT_RATE_TO_CODE,
    ACCOUNT_TO_AFC_MAPPING,
    FORM_SECTIONS,
    VALIDATION_RULES,
    CALCULATION_FORMULAS,
    ECH_0217_CONFIG,
    DECLARATION_PERIODS
} from './afc-codes.js';

/**
 * Générateur principal du Formulaire 200 TVA
 */
export class Form200Generator {
    constructor(companyData, periodStart, periodEnd, declarationType = 'quarterly') {
        this.company = this.validateCompanyData(companyData);
        this.period = {
            start: new Date(periodStart),
            end: new Date(periodEnd),
            type: declarationType
        };
        this.entries = {};
        this.errors = [];
        this.warnings = [];
        
        // Données calculées automatiquement
        this.calculatedFields = new Set(['399', '479', '500']);
        
        console.log(`📋 Formulaire 200 initialisé: ${this.company.name} (${periodStart} → ${periodEnd})`);
    }
    
    /**
     * Valide les données de l'entreprise
     */
    validateCompanyData(data) {
        const required = ['name', 'cheNumber', 'address', 'zip', 'city'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Données entreprise manquantes: ${missing.join(', ')}`);
        }
        
        // Validation numéro CHE
        if (!/^CHE-\d{3}\.\d{3}\.\d{3}$/.test(data.cheNumber)) {
            throw new Error(`Numéro CHE invalide: ${data.cheNumber}`);
        }
        
        return data;
    }
    
    /**
     * Ajoute un chiffre d'affaires selon le taux TVA
     */
    addRevenue(amount, vatRate, description = '', accountCode = null) {
        try {
            // Convertir le taux en code AFC
            let afcCode;
            if (typeof vatRate === 'string' && VAT_RATE_TO_CODE[vatRate]) {
                afcCode = VAT_RATE_TO_CODE[vatRate];
            } else if (accountCode && ACCOUNT_TO_AFC_MAPPING[accountCode]) {
                afcCode = ACCOUNT_TO_AFC_MAPPING[accountCode];
            } else {
                // Détection automatique par taux
                switch (vatRate) {
                    case 0.081:
                    case 8.1:
                        afcCode = 'cifra302';
                        break;
                    case 0.026:
                    case 2.6:
                        afcCode = 'cifra312';
                        break;
                    case 0.038:
                    case 3.8:
                        afcCode = 'cifra342';
                        break;
                    case 0:
                        afcCode = 'cifra221'; // Export par défaut
                        break;
                    default:
                        afcCode = 'cifra302'; // Taux normal par défaut
                }
            }
            
            this.addEntry(afcCode, amount, description);
            
            // Ajouter au chiffre d'affaires total
            this.addEntry('cifra200', amount, 'CA total');
            
            console.log(`💰 Chiffre d'affaires ajouté: ${amount} CHF (${afcCode}) - ${description}`);
            
        } catch (error) {
            this.errors.push(`Erreur ajout CA: ${error.message}`);
            console.error('❌ Erreur ajout chiffre d\'affaires:', error);
        }
    }
    
    /**
     * Ajoute un montant d'impôt préalable
     */
    addInputVAT(amount, description = 'Impôt préalable', correctionType = null) {
        try {
            let afcCode = 'cifra400'; // Code par défaut
            
            // Gestion des corrections spécifiques
            switch (correctionType) {
                case 'mixed_use':
                    afcCode = 'cifra405'; // Usage mixte
                    break;
                case 'subsequent_relief':
                    afcCode = 'cifra410'; // Dégrèvement ultérieur
                    break;
                case 'subsidy_reduction':
                    afcCode = 'cifra415'; // Réduction pour subventions
                    amount = -Math.abs(amount); // Toujours négatif
                    break;
                case 'other_correction':
                    afcCode = 'cifra420'; // Autres corrections
                    break;
            }
            
            this.addEntry(afcCode, amount, description);
            console.log(`🏷️ Impôt préalable ajouté: ${amount} CHF (${afcCode}) - ${description}`);
            
        } catch (error) {
            this.errors.push(`Erreur ajout impôt préalable: ${error.message}`);
            console.error('❌ Erreur ajout impôt préalable:', error);
        }
    }
    
    /**
     * Ajoute une écriture pour un code AFC spécifique
     */
    addEntry(afcCode, amount, description = '') {
        // Validation du code AFC
        const codeInfo = AFC_FORM_200_CODES[afcCode];
        if (!codeInfo) {
            throw new Error(`Code AFC invalide: ${afcCode}`);
        }
        
        // Validation du montant
        const validator = VALIDATION_RULES[codeInfo.validation];
        if (validator && !validator(amount)) {
            throw new Error(`Montant invalide pour ${afcCode}: ${amount}`);
        }
        
        // Initialiser si nécessaire
        if (!this.entries[afcCode]) {
            this.entries[afcCode] = {
                code: codeInfo.code,
                description: codeInfo.description,
                amount: 0,
                details: []
            };
        }
        
        // Ajouter le montant
        this.entries[afcCode].amount += amount;
        if (description) {
            this.entries[afcCode].details.push({
                amount,
                description,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    /**
     * Ajoute des prestations exonérées ou exportations
     */
    addExemptRevenue(amount, exemptType, description = '') {
        const afcCodes = {
            'excluded': 'cifra220',    // Prestations exclues (art. 21)
            'export': 'cifra221',      // Prestations à l'étranger (art. 23)
            'transfer': 'cifra225',    // Transferts avec procédure
            'unpaid': 'cifra230'       // Prestations non rémunérées
        };
        
        const afcCode = afcCodes[exemptType];
        if (!afcCode) {
            throw new Error(`Type d'exonération invalide: ${exemptType}`);
        }
        
        this.addEntry(afcCode, amount, description);
        this.addEntry('cifra200', amount, 'CA total (exonéré)');
        
        console.log(`🚫 Prestation exonérée ajoutée: ${amount} CHF (${afcCode}) - ${description}`);
    }
    
    /**
     * Ajoute des diminutions de contre-prestations (rabais, escomptes)
     */
    addDeductions(amount, description = 'Diminution contre-prestation') {
        this.addEntry('cifra235', amount, description);
        // Ne pas ajouter au CA total car c'est une diminution
        console.log(`📉 Diminution ajoutée: ${amount} CHF - ${description}`);
    }
    
    /**
     * Calcule automatiquement tous les totaux
     */
    calculate() {
        try {
            console.log('🧮 Calcul automatique du Formulaire 200...');
            
            // Calcul ligne 399: Total impôt dû
            const totalTaxDue = CALCULATION_FORMULAS.cifra399(this.getAmounts());
            this.entries['cifra399'] = {
                code: '399',
                description: 'Total de l\'impôt dû',
                amount: this.roundCHF(totalTaxDue),
                calculated: true,
                details: [
                    {
                        description: 'Calculé automatiquement',
                        amount: totalTaxDue,
                        formula: '302*8.1% + 312*2.6% + 342*3.8% + 382*8.1%',
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            
            // Calcul ligne 479: Total impôt préalable déductible
            const totalInputTax = CALCULATION_FORMULAS.cifra479(this.getAmounts());
            this.entries['cifra479'] = {
                code: '479',
                description: 'Total de l\'impôt préalable déductible',
                amount: this.roundCHF(totalInputTax),
                calculated: true,
                details: [
                    {
                        description: 'Calculé automatiquement',
                        amount: totalInputTax,
                        formula: '400 + 405 + 410 - 415 + 420',
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            
            // Calcul ligne 500: Montant dû ou créance
            const finalAmount = CALCULATION_FORMULAS.cifra500(this.getAmounts());
            this.entries['cifra500'] = {
                code: '500',
                description: finalAmount >= 0 ? 'Montant dû à l\'AFC' : 'Créance envers l\'AFC',
                amount: this.roundCHF(finalAmount),
                calculated: true,
                details: [
                    {
                        description: 'Calculé automatiquement',
                        amount: finalAmount,
                        formula: '399 - 479 - 510',
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            
            // Validation finale
            this.validateDeclaration();
            
            console.log(`✅ Calculs terminés - Montant final: ${finalAmount} CHF`);
            return this.entries;
            
        } catch (error) {
            this.errors.push(`Erreur calcul: ${error.message}`);
            console.error('❌ Erreur lors du calcul:', error);
            throw error;
        }
    }
    
    /**
     * Valide la cohérence de la déclaration
     */
    validateDeclaration() {
        const amounts = this.getAmounts();
        
        // Vérification cohérence CA total
        const declaredTotal = amounts.cifra200 || 0;
        const calculatedTotal = (amounts.cifra302 || 0) + 
                               (amounts.cifra312 || 0) + 
                               (amounts.cifra342 || 0) +
                               (amounts.cifra220 || 0) +
                               (amounts.cifra221 || 0) +
                               (amounts.cifra225 || 0) +
                               (amounts.cifra230 || 0) -
                               (amounts.cifra235 || 0);
        
        const difference = Math.abs(declaredTotal - calculatedTotal);
        if (difference > 0.05) { // Tolérance de 5 centimes
            this.warnings.push(`Incohérence CA total: déclaré ${declaredTotal}, calculé ${calculatedTotal}`);
        }
        
        // Vérification montants négatifs inappropriés
        Object.entries(amounts).forEach(([code, amount]) => {
            const codeInfo = AFC_FORM_200_CODES[code];
            if (codeInfo && codeInfo.validation === 'positive_amount' && amount < 0) {
                this.errors.push(`Montant négatif inapproprié: ${code} = ${amount}`);
            }
        });
        
        // Vérification champs obligatoires
        const requiredCodes = Object.entries(AFC_FORM_200_CODES)
            .filter(([_, info]) => info.required)
            .map(([code, _]) => code);
        
        const missingRequired = requiredCodes.filter(code => 
            !this.entries[code] || this.entries[code].amount === 0
        );
        
        if (missingRequired.length > 0) {
            this.warnings.push(`Champs obligatoires vides: ${missingRequired.join(', ')}`);
        }
    }
    
    /**
     * Extrait les montants pour les calculs
     */
    getAmounts() {
        const amounts = {};
        Object.entries(this.entries).forEach(([code, entry]) => {
            amounts[code] = entry.amount || 0;
        });
        return amounts;
    }
    
    /**
     * Arrondit selon les règles suisses (5 centimes)
     */
    roundCHF(amount) {
        return Math.round(amount * 20) / 20;
    }
    
    /**
     * Génère un rapport de validation
     */
    getValidationReport() {
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            summary: {
                totalTurnover: this.entries['cifra200']?.amount || 0,
                totalTaxDue: this.entries['cifra399']?.amount || 0,
                totalInputTax: this.entries['cifra479']?.amount || 0,
                finalAmount: this.entries['cifra500']?.amount || 0,
                isDue: (this.entries['cifra500']?.amount || 0) > 0
            }
        };
    }
    
    /**
     * Génère les données pour export PDF
     */
    generatePDFData() {
        const validation = this.getValidationReport();
        if (!validation.isValid) {
            throw new Error(`Déclaration invalide: ${validation.errors.join(', ')}`);
        }
        
        return {
            company: this.company,
            period: this.period,
            declarationType: DECLARATION_PERIODS[this.period.type],
            sections: this.formatSections(),
            summary: validation.summary,
            generatedAt: new Date().toISOString(),
            generator: 'Directus Unified Platform - Accounting Engine v2.1.0'
        };
    }
    
    /**
     * Formate les sections pour l'affichage
     */
    formatSections() {
        const formatted = {};
        
        Object.entries(FORM_SECTIONS).forEach(([sectionKey, section]) => {
            formatted[sectionKey] = {
                name: section.name,
                description: section.description,
                entries: section.codes
                    .map(code => {
                        const afcCode = `cifra${code}`;
                        const entry = this.entries[afcCode];
                        return entry ? {
                            code: code,
                            description: entry.description,
                            amount: entry.amount,
                            calculated: entry.calculated || false,
                            details: entry.details || []
                        } : null;
                    })
                    .filter(Boolean)
            };
        });
        
        return formatted;
    }
    
    /**
     * Génère XML eCH-0217 pour transmission électronique
     */
    generateECH0217XML() {
        const validation = this.getValidationReport();
        if (!validation.isValid) {
            throw new Error(`Déclaration invalide pour transmission: ${validation.errors.join(', ')}`);
        }
        
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eCH-0217:VAT_Declaration 
    xmlns:eCH-0217="${ECH_0217_CONFIG.namespace}"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="${ECH_0217_CONFIG.namespace} ${ECH_0217_CONFIG.schemaLocation}"
    version="${ECH_0217_CONFIG.version}">
    
    <eCH-0217:Header>
        <eCH-0217:CompanyData>
            <eCH-0217:Name>${this.escapeXML(this.company.name)}</eCH-0217:Name>
            <eCH-0217:CHE_Number>${this.company.cheNumber}</eCH-0217:CHE_Number>
            <eCH-0217:Address>${this.escapeXML(this.company.address)}</eCH-0217:Address>
            <eCH-0217:ZIP>${this.company.zip}</eCH-0217:ZIP>
            <eCH-0217:City>${this.escapeXML(this.company.city)}</eCH-0217:City>
        </eCH-0217:CompanyData>
        <eCH-0217:Period>
            <eCH-0217:StartDate>${this.period.start.toISOString().split('T')[0]}</eCH-0217:StartDate>
            <eCH-0217:EndDate>${this.period.end.toISOString().split('T')[0]}</eCH-0217:EndDate>
            <eCH-0217:Type>${this.period.type}</eCH-0217:Type>
        </eCH-0217:Period>
        <eCH-0217:GeneratedAt>${new Date().toISOString()}</eCH-0217:GeneratedAt>
    </eCH-0217:Header>
    
    <eCH-0217:Declaration>
        ${Object.entries(this.entries)
            .filter(([_, entry]) => entry.amount !== 0)
            .map(([code, entry]) => `
        <eCH-0217:Entry>
            <eCH-0217:Code>${entry.code}</eCH-0217:Code>
            <eCH-0217:Amount>${entry.amount.toFixed(2)}</eCH-0217:Amount>
            <eCH-0217:Description>${this.escapeXML(entry.description)}</eCH-0217:Description>
        </eCH-0217:Entry>`).join('')}
    </eCH-0217:Declaration>
    
    <eCH-0217:Summary>
        <eCH-0217:TotalTurnover>${validation.summary.totalTurnover.toFixed(2)}</eCH-0217:TotalTurnover>
        <eCH-0217:TotalTaxDue>${validation.summary.totalTaxDue.toFixed(2)}</eCH-0217:TotalTaxDue>
        <eCH-0217:TotalInputTax>${validation.summary.totalInputTax.toFixed(2)}</eCH-0217:TotalInputTax>
        <eCH-0217:FinalAmount>${validation.summary.finalAmount.toFixed(2)}</eCH-0217:FinalAmount>
        <eCH-0217:PaymentDue>${validation.summary.isDue}</eCH-0217:PaymentDue>
    </eCH-0217:Summary>
    
</eCH-0217:VAT_Declaration>`;
        
        return xml;
    }
    
    /**
     * Échappe les caractères XML spéciaux
     */
    escapeXML(text) {
        if (!text) return '';
        return text.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    /**
     * Exporte les données au format JSON pour intégration
     */
    exportJSON() {
        return {
            metadata: {
                generator: 'Form200Generator v1.0.0',
                company: this.company,
                period: this.period,
                generatedAt: new Date().toISOString()
            },
            declaration: this.entries,
            validation: this.getValidationReport(),
            exports: {
                pdf: this.generatePDFData(),
                ech0217: this.generateECH0217XML()
            }
        };
    }
}

/**
 * Utilitaires pour génération automatique depuis écritures comptables
 */
export class AutoForm200Generator extends Form200Generator {
    
    /**
     * Génère un Formulaire 200 automatiquement depuis les écritures comptables
     */
    static fromAccountingEntries(companyData, entries, periodStart, periodEnd, declarationType = 'quarterly') {
        const generator = new AutoForm200Generator(companyData, periodStart, periodEnd, declarationType);
        
        // Filtrer les écritures dans la période
        const periodEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date_ecriture);
            return entryDate >= generator.period.start && entryDate <= generator.period.end;
        });
        
        console.log(`🔄 Génération automatique depuis ${periodEntries.length} écritures comptables...`);
        
        // Analyser chaque écriture
        periodEntries.forEach(entry => {
            entry.lignes.forEach(line => {
                generator.processAccountingLine(line, entry);
            });
        });
        
        // Calculs automatiques
        generator.calculate();
        
        console.log('✅ Formulaire 200 généré automatiquement');
        return generator;
    }
    
    /**
     * Traite une ligne d'écriture comptable
     */
    processAccountingLine(line, entry) {
        const account = line.compte;
        const amount = line.credit - line.debit; // Montant net
        
        // Traitement des comptes de vente (classe 3)
        if (account.startsWith('3')) {
            if (amount > 0) { // Crédit = vente
                // Déterminer le taux TVA depuis les lignes TVA de la même écriture
                const vatLine = entry.lignes.find(l => l.compte === '2200'); // TVA due
                let vatRate = 'normal';
                
                if (vatLine && amount > 0) {
                    const calculatedRate = vatLine.credit / amount;
                    if (Math.abs(calculatedRate - 0.026) < 0.001) vatRate = 'reduced';
                    else if (Math.abs(calculatedRate - 0.038) < 0.001) vatRate = 'accommodation';
                }
                
                this.addRevenue(amount, vatRate, line.libelle, account);
            }
        }
        
        // Traitement de la TVA récupérable (impôt préalable)
        else if (account === '1170') {
            if (amount > 0) { // Débit = TVA récupérable
                this.addInputVAT(amount, line.libelle);
            }
        }
        
        // Traitement des comptes d'achat (classe 4) - détecter l'impôt préalable associé
        else if (account.startsWith('4')) {
            // L'impôt préalable sera traité par le compte 1170
        }
    }
}

// Export par défaut
export default { Form200Generator, AutoForm200Generator };