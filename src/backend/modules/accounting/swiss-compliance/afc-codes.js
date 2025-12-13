/**
 * Codes AFC pour Formulaire 200 - Déclaration TVA Suisse 2025
 * ==========================================================
 * 
 * Source: Administration Fédérale des Contributions (AFC)
 * Norme: eCH-0217 v2.0 (transmission électronique)
 * 
 * ✅ Conformité: Ordonnance régissant la TVA (OTVA)
 * ✅ Validation: Art. 72-82 LTVA
 * ✅ Formats: PDF et XML eCH-0217
 * 
 * @version 1.0.0
 * @updated 2025-01-13
 */

/**
 * Codes officiels AFC pour Formulaire 200 TVA
 * Chaque code correspond à une ligne spécifique du formulaire
 */
export const AFC_FORM_200_CODES = {
    // ===== SECTION 1: CHIFFRE D'AFFAIRES =====
    
    // Ligne 200: Chiffre d'affaires total (CHF)
    cifra200: {
        code: '200',
        description: 'Chiffre d\'affaires total',
        section: 'turnover',
        required: true,
        validation: 'positive_amount',
        help: 'Montant total de toutes les prestations fournies (art. 18 LTVA)'
    },
    
    // Ligne 220: Prestations exclues du champ de l'impôt (art. 21 LTVA)
    cifra220: {
        code: '220',
        description: 'Prestations exclues du champ de l\'impôt (art. 21)',
        section: 'turnover',
        required: false,
        validation: 'positive_amount',
        help: 'Prestations médicales, d\'assurance, postales, etc.'
    },
    
    // Ligne 221: Prestations fournies à l'étranger (art. 23 LTVA)
    cifra221: {
        code: '221', 
        description: 'Prestations fournies à l\'étranger (art. 23)',
        section: 'turnover',
        required: false,
        validation: 'positive_amount',
        help: 'Exportations, prestations à l\'étranger'
    },
    
    // Ligne 225: Transferts avec procédure de déclaration (art. 38 LTVA)
    cifra225: {
        code: '225',
        description: 'Transferts avec procédure de déclaration (art. 38)',
        section: 'turnover', 
        required: false,
        validation: 'positive_amount',
        help: 'Transferts dans le cadre de la procédure de déclaration'
    },
    
    // Ligne 230: Prestations non rémunérées (donations, etc.)
    cifra230: {
        code: '230',
        description: 'Prestations non rémunérées (art. 18 al. 2 let. c LTVA)',
        section: 'turnover',
        required: false,
        validation: 'positive_amount', 
        help: 'Donations, prestations à titre gratuit avec droit à déduction'
    },
    
    // Ligne 235: Diminutions de la contre-prestation
    cifra235: {
        code: '235',
        description: 'Diminutions de la contre-prestation (art. 17 al. 4 LTVA)',
        section: 'turnover',
        required: false,
        validation: 'positive_amount',
        help: 'Rabais, escomptes, ristournes accordés après facturation'
    },
    
    // Ligne 280: Divers (corrections, arrondissements)
    cifra280: {
        code: '280',
        description: 'Divers (corrections, arrondissements)',
        section: 'turnover',
        required: false,
        validation: 'amount',
        help: 'Corrections, arrondissements, autres ajustements'
    },
    
    // ===== SECTION 2: CALCUL DE L'IMPÔT =====
    
    // Ligne 302: Prestations imposables au taux normal 8.1%
    cifra302: {
        code: '302',
        description: 'Prestations imposables au taux normal (8.1%)',
        section: 'tax_calculation',
        required: false,
        validation: 'positive_amount',
        rate: 0.081,
        help: 'Base de calcul pour l\'impôt au taux normal'
    },
    
    // Ligne 312: Prestations imposables au taux réduit 2.6%
    cifra312: {
        code: '312',
        description: 'Prestations imposables au taux réduit (2.6%)',
        section: 'tax_calculation', 
        required: false,
        validation: 'positive_amount',
        rate: 0.026,
        help: 'Base de calcul pour l\'impôt au taux réduit (alimentation, médicaments, etc.)'
    },
    
    // Ligne 342: Prestations imposables au taux hébergement 3.8%
    cifra342: {
        code: '342',
        description: 'Prestations imposables au taux pour l\'hébergement (3.8%)',
        section: 'tax_calculation',
        required: false,
        validation: 'positive_amount', 
        rate: 0.038,
        help: 'Base de calcul pour l\'impôt sur l\'hébergement'
    },
    
    // Ligne 382: Acquisitions soumises au taux normal (art. 45 LTVA)
    cifra382: {
        code: '382',
        description: 'Acquisitions soumises au taux normal (art. 45 LTVA)',
        section: 'tax_calculation',
        required: false,
        validation: 'positive_amount',
        rate: 0.081,
        help: 'Impôt sur les acquisitions de services de l\'étranger'
    },
    
    // Ligne 399: Total de l'impôt dû
    cifra399: {
        code: '399',
        description: 'Total de l\'impôt dû',
        section: 'tax_calculation',
        required: true,
        validation: 'positive_amount',
        calculated: true,
        help: 'Somme des impôts calculés (302*8.1% + 312*2.6% + 342*3.8% + 382*8.1%)'
    },
    
    // ===== SECTION 3: IMPÔT PRÉALABLE =====
    
    // Ligne 400: Impôt préalable sur les coûts de matériel et de prestations
    cifra400: {
        code: '400', 
        description: 'Impôt préalable sur les coûts de matériel et de prestations',
        section: 'input_tax',
        required: false,
        validation: 'positive_amount',
        help: 'TVA payée sur les achats et investissements'
    },
    
    // Ligne 405: Correction de l'impôt préalable: usage mixte (art. 30 LTVA)
    cifra405: {
        code: '405',
        description: 'Correction de l\'impôt préalable: usage mixte (art. 30 LTVA)',
        section: 'input_tax',
        required: false,
        validation: 'amount',
        help: 'Correction pour usage privé ou non soumis à l\'impôt'
    },
    
    // Ligne 410: Dégrèvement ultérieur de l'impôt préalable (art. 32 LTVA)
    cifra410: {
        code: '410',
        description: 'Dégrèvement ultérieur de l\'impôt préalable (art. 32 LTVA)',
        section: 'input_tax',
        required: false,
        validation: 'positive_amount',
        help: 'Corrections d\'impôt préalable des exercices antérieurs'
    },
    
    // Ligne 415: Réduction de la déduction: subventions (art. 33 al. 2 LTVA)
    cifra415: {
        code: '415',
        description: 'Réduction de la déduction: subventions (art. 33 al. 2 LTVA)',
        section: 'input_tax',
        required: false,
        validation: 'positive_amount',
        help: 'Réduction due aux subventions reçues'
    },
    
    // Ligne 420: Autres corrections de l'impôt préalable
    cifra420: {
        code: '420',
        description: 'Autres corrections de l\'impôt préalable',
        section: 'input_tax',
        required: false,
        validation: 'amount',
        help: 'Autres ajustements et corrections'
    },
    
    // Ligne 479: Total de l'impôt préalable déductible
    cifra479: {
        code: '479',
        description: 'Total de l\'impôt préalable déductible',
        section: 'input_tax',
        required: true,
        validation: 'positive_amount',
        calculated: true,
        help: 'Total des impôts préalables à déduire (400+405+410-415+420)'
    },
    
    // ===== SECTION 4: MONTANT À PAYER =====
    
    // Ligne 500: Montant dû à l'AFC ou créance envers l'AFC
    cifra500: {
        code: '500',
        description: 'Montant dû à l\'AFC ou créance envers l\'AFC',
        section: 'payment',
        required: true,
        validation: 'amount',
        calculated: true,
        help: 'Différence entre impôt dû et impôt préalable (399-479)'
    },
    
    // Ligne 510: Crédit d'impôt reporté de la période fiscale précédente
    cifra510: {
        code: '510',
        description: 'Crédit d\'impôt reporté de la période fiscale précédente',
        section: 'payment',
        required: false,
        validation: 'positive_amount',
        help: 'Report de crédit de la déclaration précédente'
    },
    
    // ===== SECTION 5: AUTRES FLUX DE FONDS =====
    
    // Ligne 900: Subventions, dons collectés par des institutions (art. 18 al. 2 let. a et b LTVA)  
    cifra900: {
        code: '900',
        description: 'Subventions, dons collectés par des institutions (art. 18 al. 2 let. a et b LTVA)',
        section: 'other_flows',
        required: false,
        validation: 'positive_amount',
        help: 'Subventions et dons collectés avec droit à déduction partielle'
    },
    
    // Ligne 910: Dons, dividendes, parts de bénéfice et autres prestations similaires (art. 18 al. 2 let. c à l LTVA)
    cifra910: {
        code: '910', 
        description: 'Dons, dividendes, parts de bénéfice et autres prestations similaires (art. 18 al. 2 let. c à l LTVA)',
        section: 'other_flows',
        required: false,
        validation: 'positive_amount',
        help: 'Revenus non soumis à l\'impôt avec droit à déduction partielle'
    }
};

/**
 * Correspondances taux TVA vers codes AFC
 */
export const VAT_RATE_TO_CODE = {
    normal: 'cifra302',        // 8.1%
    reduced: 'cifra312',       // 2.6% 
    accommodation: 'cifra342', // 3.8%
    acquisition: 'cifra382'    // 8.1% acquisitions art. 45
};

/**
 * Correspondances codes comptables vers codes AFC
 */
export const ACCOUNT_TO_AFC_MAPPING = {
    // Comptes de ventes -> codes AFC
    '3000': 'cifra302',  // Ventes marchandises Suisse (8.1%)
    '3001': 'cifra221',  // Ventes marchandises Export (0%)
    '3200': 'cifra302',  // Prestations de services (8.1%)
    '3201': 'cifra302',  // Prestations développement (8.1%)
    '3202': 'cifra302',  // Prestations consulting (8.1%)
    '3203': 'cifra312',  // Prestations formation (2.6% possible)
    
    // Comptes d'achats -> impôt préalable
    '4000': 'cifra400',  // Achats marchandises
    '4200': 'cifra400',  // Achats prestations tiers
    '4201': 'cifra400',  // Achats développement
    
    // Investissements -> impôt préalable  
    '1500': 'cifra400',  // Machines et équipements
    '1510': 'cifra400',  // Mobilier et installations
    '1520': 'cifra400',  // Véhicules
    '1530': 'cifra400'   // Informatique
};

/**
 * Sections du formulaire 200
 */
export const FORM_SECTIONS = {
    turnover: {
        name: 'Chiffre d\'affaires',
        description: 'Déclaration du chiffre d\'affaires total et exclusions',
        codes: ['200', '220', '221', '225', '230', '235', '280']
    },
    tax_calculation: {
        name: 'Calcul de l\'impôt',
        description: 'Calcul de l\'impôt dû selon les différents taux',
        codes: ['302', '312', '342', '382', '399']
    },
    input_tax: {
        name: 'Impôt préalable',
        description: 'Déduction de l\'impôt préalable',
        codes: ['400', '405', '410', '415', '420', '479']
    },
    payment: {
        name: 'Montant à payer',
        description: 'Calcul du montant final dû ou créance',
        codes: ['500', '510']
    },
    other_flows: {
        name: 'Autres flux de fonds',
        description: 'Subventions, dons et autres prestations',
        codes: ['900', '910']
    }
};

/**
 * Validation des montants selon les règles AFC
 */
export const VALIDATION_RULES = {
    positive_amount: (value) => value >= 0,
    amount: (value) => typeof value === 'number',
    percentage: (value) => value >= 0 && value <= 100,
    required: (value) => value !== null && value !== undefined && value !== ''
};

/**
 * Calculs automatiques pour les totaux
 */
export const CALCULATION_FORMULAS = {
    // Ligne 399: Total impôt dû
    cifra399: (data) => {
        const normal = (data.cifra302 || 0) * 0.081;
        const reduced = (data.cifra312 || 0) * 0.026; 
        const accommodation = (data.cifra342 || 0) * 0.038;
        const acquisition = (data.cifra382 || 0) * 0.081;
        return normal + reduced + accommodation + acquisition;
    },
    
    // Ligne 479: Total impôt préalable déductible
    cifra479: (data) => {
        return (data.cifra400 || 0) + 
               (data.cifra405 || 0) + 
               (data.cifra410 || 0) - 
               (data.cifra415 || 0) + 
               (data.cifra420 || 0);
    },
    
    // Ligne 500: Montant dû/créance
    cifra500: (data) => {
        const totalDue = data.cifra399 || 0;
        const totalDeductible = data.cifra479 || 0;
        const previousCredit = data.cifra510 || 0;
        return totalDue - totalDeductible - previousCredit;
    }
};

/**
 * Configuration pour export eCH-0217 (transmission électronique)
 */
export const ECH_0217_CONFIG = {
    version: '2.0',
    namespace: 'http://www.ech.ch/xmlns/eCH-0217/2',
    schemaLocation: 'http://www.ech.ch/xmlns/eCH-0217/2/eCH-0217-2-0.xsd',
    documentType: 'VAT_Declaration',
    transmissionType: 'electronic'
};

/**
 * Périodes de déclaration TVA
 */
export const DECLARATION_PERIODS = {
    monthly: { code: 'M', description: 'Mensuelle', dueDate: '15' },
    quarterly: { code: 'Q', description: 'Trimestrielle', dueDate: '15' },
    halfyearly: { code: 'S', description: 'Semestrielle', dueDate: '15' },
    yearly: { code: 'Y', description: 'Annuelle', dueDate: '31.03' }
};

// Export par défaut
export default {
    AFC_FORM_200_CODES,
    VAT_RATE_TO_CODE,
    ACCOUNT_TO_AFC_MAPPING,
    FORM_SECTIONS,
    VALIDATION_RULES,
    CALCULATION_FORMULAS,
    ECH_0217_CONFIG,
    DECLARATION_PERIODS
};