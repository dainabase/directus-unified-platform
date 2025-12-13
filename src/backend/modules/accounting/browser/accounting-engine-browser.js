/**
 * Browser-Compatible Accounting Engine
 * ====================================
 * 
 * Version navigateur du moteur comptable unifié.
 * Inclut tous les modules nécessaires en une seule fois.
 * 
 * @version 2.1.0
 * @updated 2025-01-13
 */

// Swiss Compliance utilities embedded
const SwissCompliance = {
    validateCHENumber(cheNumber) {
        const regex = /^CHE-\d{3}\.\d{3}\.\d{3}$/;
        return regex.test(cheNumber);
    },
    
    calculateBalances(ecritures, chartOfAccounts) {
        const balances = {};
        
        ecritures.forEach(ecriture => {
            if (ecriture.statut !== 'validee') return;
            
            ecriture.lignes.forEach(ligne => {
                if (!balances[ligne.compte]) {
                    balances[ligne.compte] = { debit: 0, credit: 0, solde: 0 };
                }
                balances[ligne.compte].debit += ligne.debit;
                balances[ligne.compte].credit += ligne.credit;
            });
        });
        
        // Calculate soldes according to account nature
        Object.keys(balances).forEach(compte => {
            const balance = balances[compte];
            const compteInfo = getCompteInfo(compte, chartOfAccounts);
            
            if (compteInfo && compteInfo.nature === 'debit') {
                balance.solde = balance.debit - balance.credit;
            } else {
                balance.solde = balance.credit - balance.debit;
            }
        });
        
        return balances;
    }
};

// Utils embedded
const AccountingUtils = {
    roundCHF(amount) { return Math.round(amount * 20) / 20; },
    formatSwissAmount(amount) { return Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'"); },
    formatDate(dateString, format = 'DD.MM.YYYY') {
        if (!dateString) return '';
        const date = new Date(dateString);
        return format === 'DD.MM.YYYY' ? date.toLocaleDateString('fr-CH') : dateString;
    }
};

// Entry automation embedded
const AccountingServices = {
    async createAutomaticEntry(templateName, data, context) {
        // Simplified browser version
        console.log(`Creating automatic entry: ${templateName}`);
        return null;
    }
};

function getCompteInfo(numeroCompte, chartOfAccounts) {
    for (const [classe, data] of Object.entries(chartOfAccounts)) {
        if (data.comptes && data.comptes[numeroCompte]) {
            return data.comptes[numeroCompte];
        }
    }
    return null;
}

// Main Accounting Engine (from core module)
window.AccountingEngine = (function() {
    'use strict';
    
    // Configuration centralisée TVA Suisse 2025
    const TVA_CONFIG = {
        RATES: {
            NORMAL: 0.081,
            REDUCED: 0.026,
            ACCOMMODATION: 0.038,
            EXEMPT: 0,
            NORMAL_PERCENT: 8.1,
            REDUCED_PERCENT: 2.6,
            ACCOMMODATION_PERCENT: 3.8,
            DEFAULT: 0.081,
            DEFAULT_PERCENT: 8.1
        },
        
        CODES: {
            V81: { code: 'V81', rate: 0.081, percent: 8.1, type: 'output', description_fr: 'Ventes taux normal 8.1%' },
            V26: { code: 'V26', rate: 0.026, percent: 2.6, type: 'output', description_fr: 'Ventes taux réduit 2.6%' },
            V38: { code: 'V38', rate: 0.038, percent: 3.8, type: 'output', description_fr: 'Ventes hébergement 3.8%' },
            A81: { code: 'A81', rate: 0.081, percent: 8.1, type: 'input', description_fr: 'Achats taux normal 8.1%' },
            A26: { code: 'A26', rate: 0.026, percent: 2.6, type: 'input', description_fr: 'Achats taux réduit 2.6%' },
            A38: { code: 'A38', rate: 0.038, percent: 3.8, type: 'input', description_fr: 'Achats hébergement 3.8%' }
        }
    };

    // Plan comptable PME suisse unifié (shortened for browser)
    const CHART_OF_ACCOUNTS = {
        "1": {
            nom: "ACTIFS",
            comptes: {
                "1000": { nom: "Caisse CHF", nature: "debit" },
                "1020": { nom: "Banque - compte courant", nature: "debit" },
                "1021": { nom: "Revolut Hypervisual", parent: "1020", nature: "debit" },
                "1022": { nom: "Revolut Dainamics", parent: "1020", nature: "debit" },
                "1023": { nom: "Revolut Waveform", parent: "1020", nature: "debit" },
                "1024": { nom: "Revolut Particule", parent: "1020", nature: "debit" },
                "1025": { nom: "Revolut Holding", parent: "1020", nature: "debit" },
                "1100": { nom: "Créances clients", nature: "debit" },
                "1170": { nom: "TVA à récupérer", nature: "debit" }
            }
        },
        "2": {
            nom: "PASSIFS",
            comptes: {
                "2000": { nom: "Dettes fournisseurs", nature: "credit" },
                "2200": { nom: "TVA due", nature: "credit" },
                "2800": { nom: "Capital social", nature: "credit" }
            }
        },
        "3": {
            nom: "PRODUITS D'EXPLOITATION",
            comptes: {
                "3000": { nom: "Ventes marchandises Suisse", type: "produit", nature: "credit" },
                "3200": { nom: "Prestations de services", type: "produit", nature: "credit" },
                "3201": { nom: "Prestations développement", type: "produit", nature: "credit" }
            }
        },
        "4": {
            nom: "CHARGES MARCHANDISES",
            comptes: {
                "4000": { nom: "Achats marchandises", type: "charge", nature: "debit" },
                "4200": { nom: "Achats prestations tiers", type: "charge", nature: "debit" }
            }
        },
        "5": {
            nom: "CHARGES PERSONNEL",
            comptes: {
                "5000": { nom: "Salaires", type: "charge", nature: "debit" },
                "5700": { nom: "Charges sociales patronales", type: "charge", nature: "debit" }
            }
        },
        "6": {
            nom: "AUTRES CHARGES D'EXPLOITATION",
            comptes: {
                "6000": { nom: "Loyer", type: "charge", nature: "debit" },
                "6520": { nom: "Frais bancaires", type: "charge", nature: "debit" }
            }
        }
    };

    // État du module
    let state = {
        ecritures: [],
        balances: {},
        currentView: 'balance',
        filters: { periode: '2025-01', status: '', entity: '' },
        currentUser: null,
        nextEntryNumber: 1
    };

    // Core functions
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

    function getVATRateForDate(date, rateType = 'normal') {
        const d = new Date(date);
        const cutoffDate = new Date('2024-01-01');
        
        if (d < cutoffDate) {
            switch (rateType) {
                case 'reduced': return 0.025;
                case 'accommodation': return 0.037;
                default: return 0.077;
            }
        } else {
            switch (rateType) {
                case 'reduced': return TVA_CONFIG.RATES.REDUCED;
                case 'accommodation': return TVA_CONFIG.RATES.ACCOMMODATION;
                default: return TVA_CONFIG.RATES.NORMAL;
            }
        }
    }

    function autoDetectVATCode(transaction) {
        const { type, rate, isExport, isExempt } = transaction;
        
        if (isExport) return 'VEXP';
        if (isExempt) return type === 'sale' ? 'VEX' : 'AEX';
        
        if (rate === 0.081 || rate === 8.1) {
            return type === 'sale' ? 'V81' : 'A81';
        } else if (rate === 0.026 || rate === 2.6) {
            return type === 'sale' ? 'V26' : 'A26';
        } else if (rate === 0.038 || rate === 3.8) {
            return type === 'sale' ? 'V38' : 'A38';
        }
        
        return type === 'sale' ? 'V81' : 'A81';
    }

    async function calculateBalances() {
        state.balances = SwissCompliance.calculateBalances(state.ecritures, CHART_OF_ACCOUNTS);
        return state.balances;
    }

    function calculateEntryTotals() {
        let totalDebit = 0;
        let totalCredit = 0;
        
        document.querySelectorAll('.entry-debit').forEach(input => {
            totalDebit += parseFloat(input.value) || 0;
        });
        
        document.querySelectorAll('.entry-credit').forEach(input => {
            totalCredit += parseFloat(input.value) || 0;
        });
        
        if (document.getElementById('total-debit')) {
            document.getElementById('total-debit').textContent = AccountingUtils.formatSwissAmount(totalDebit);
        }
        if (document.getElementById('total-credit')) {
            document.getElementById('total-credit').textContent = AccountingUtils.formatSwissAmount(totalCredit);
        }
        
        const balance = totalDebit - totalCredit;
        const balanceEl = document.getElementById('entry-balance');
        if (balanceEl) {
            balanceEl.textContent = AccountingUtils.formatSwissAmount(Math.abs(balance));
            balanceEl.className = balance === 0 ? 'text-center text-success' : 'text-center text-danger';
        }
    }

    // Interface publique (compatible avec l'ancienne API)
    return {
        // Configuration
        TVA_RATES: TVA_CONFIG.RATES,
        TVA_CODES: TVA_CONFIG.CODES,
        
        // Fonctions TVA
        calculateVATFromNet,
        calculateVATFromGross,
        getVATRateForDate,
        autoDetectVATCode,
        
        // Fonctions comptables
        calculateBalances,
        calculateEntryTotals,
        
        // Utilitaires
        roundCHF: AccountingUtils.roundCHF,
        formatSwissAmount: AccountingUtils.formatSwissAmount,
        formatDate: AccountingUtils.formatDate,
        
        // État
        getBalances: () => state.balances,
        getEcritures: () => state.ecritures,
        getState: () => state,
        
        // Initialisation (vide pour compatibilité)
        init: async function() {
            console.log('📊 Unified Accounting Engine initialized (browser mode)');
            return true;
        },
        
        // Création d'écriture automatique (placeholder)
        createAutomaticEntry: async function(type, data) {
            console.log(`Creating automatic entry: ${type}`, data);
            return null;
        }
    };

})();