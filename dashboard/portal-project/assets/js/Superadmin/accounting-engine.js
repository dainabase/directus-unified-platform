// accounting-engine.js - Moteur de comptabilité générale
// Plan comptable PME suisse, écritures automatiques, balance et rapports

window.AccountingEngine = (function() {
    'use strict';
    
    // Configuration TVA Suisse 2025
    const TVA_RATES = {
        // Taux en vigueur depuis 01.01.2024 (applicable 2025)
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
    };

    // Codes TVA comptables (Formulaire 200 AFC)
    const TVA_CODES = {
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
        AEX: { 
            code: 'AEX',
            rate: 0, 
            percent: 0,
            type: 'input', 
            description_fr: 'Achats exonérés de TVA',
            description_de: 'MWST-befreite Einkäufe',
            formField: null,
            accountDebit: null,
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
        },
        I26: { 
            code: 'I26',
            rate: 0.026, 
            percent: 2.6,
            type: 'input', 
            description_fr: 'Investissements taux réduit 2.6%',
            description_de: 'Investitionen red. Satz 2.6%',
            formField: '405',
            accountDebit: '1170',
            accountCredit: '2000'
        },

        // ===== ACQUISITIONS (Services de l'étranger - art. 45) =====
        ACQ81: { 
            code: 'ACQ81',
            rate: 0.081, 
            percent: 8.1,
            type: 'acquisition', 
            description_fr: 'Impôt sur acquisitions 8.1%',
            description_de: 'Bezugssteuer 8.1%',
            formField: '382',
            accountDebit: '1170',
            accountCredit: '2200'
        },
        ACQ26: { 
            code: 'ACQ26',
            rate: 0.026, 
            percent: 2.6,
            type: 'acquisition', 
            description_fr: 'Impôt sur acquisitions 2.6%',
            description_de: 'Bezugssteuer 2.6%',
            formField: '382',
            accountDebit: '1170',
            accountCredit: '2200'
        },

        // ===== HORS CHAMP =====
        NA: { 
            code: 'NA',
            rate: 0, 
            percent: 0,
            type: 'none', 
            description_fr: 'Non soumis à la TVA',
            description_de: 'Nicht MWST-pflichtig',
            formField: null,
            accountDebit: null,
            accountCredit: null
        }
    };

    // Fonctions de calcul TVA mises à jour
    /**
     * Calcule la TVA depuis un montant HT
     */
    function calculateVATFromNet(netAmount, tvaCode = 'V81') {
        const tvaInfo = TVA_CODES[tvaCode] || TVA_CODES.V81;
        const vatAmount = netAmount * tvaInfo.rate;
        const grossAmount = netAmount + vatAmount;
        
        return {
            net: roundCHF(netAmount),
            vat: roundCHF(vatAmount),
            gross: roundCHF(grossAmount),
            rate: tvaInfo.rate,
            percent: tvaInfo.percent,
            code: tvaCode
        };
    }

    /**
     * Calcule la TVA depuis un montant TTC
     */
    function calculateVATFromGross(grossAmount, tvaCode = 'V81') {
        const tvaInfo = TVA_CODES[tvaCode] || TVA_CODES.V81;
        const vatAmount = grossAmount * tvaInfo.rate / (1 + tvaInfo.rate);
        const netAmount = grossAmount - vatAmount;
        
        return {
            net: roundCHF(netAmount),
            vat: roundCHF(vatAmount),
            gross: roundCHF(grossAmount),
            rate: tvaInfo.rate,
            percent: tvaInfo.percent,
            code: tvaCode
        };
    }

    /**
     * Arrondi au centime suisse (5 centimes)
     */
    function roundCHF(amount) {
        return Math.round(amount * 20) / 20;
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
                case 'reduced': return TVA_RATES.REDUCED;
                case 'accommodation': return TVA_RATES.ACCOMMODATION;
                default: return TVA_RATES.NORMAL;
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

    // Configuration
    const config = {
        // Plan comptable PME suisse (basé sur Sterchi)
        planComptable: {
            // CLASSE 1 - ACTIFS
            "1": {
                nom: "ACTIFS",
                comptes: {
                    // 10 - Liquidités
                    "10": { nom: "Liquidités", type: "actif", nature: "debit" },
                    "1000": { nom: "Caisse CHF", parent: "10", nature: "debit" },
                    "1020": { nom: "Banque - compte courant", parent: "10", nature: "debit" },
                    "1021": { nom: "Revolut Hypervisual", parent: "1020", nature: "debit" },
                    "1022": { nom: "Revolut Dainamics", parent: "1020", nature: "debit" },
                    "1023": { nom: "Revolut Waveform", parent: "1020", nature: "debit" },
                    "1024": { nom: "Revolut Particule", parent: "1020", nature: "debit" },
                    "1025": { nom: "Revolut Holding", parent: "1020", nature: "debit" },
                    
                    // 11 - Créances
                    "11": { nom: "Créances", type: "actif", nature: "debit" },
                    "1100": { nom: "Créances clients", parent: "11", nature: "debit" },
                    "1109": { nom: "Ducroire", parent: "11", nature: "credit", correctif: true },
                    "1170": { nom: "TVA à récupérer", parent: "11", nature: "debit" },
                    "1176": { nom: "Impôt anticipé", parent: "11", nature: "debit" },
                    
                    // 12 - Stocks
                    "12": { nom: "Stocks", type: "actif", nature: "debit" },
                    "1200": { nom: "Stock marchandises", parent: "12", nature: "debit" },
                    "1260": { nom: "Stock matériel", parent: "12", nature: "debit" },
                    
                    // 13 - Actifs transitoires
                    "13": { nom: "Actifs transitoires", type: "actif", nature: "debit" },
                    "1300": { nom: "Charges payées d'avance", parent: "13", nature: "debit" },
                    "1301": { nom: "Produits à recevoir", parent: "13", nature: "debit" },
                    
                    // 15 - Immobilisations corporelles
                    "15": { nom: "Immobilisations corporelles", type: "actif", nature: "debit" },
                    "1500": { nom: "Machines et équipements", parent: "15", nature: "debit" },
                    "1509": { nom: "Amort. cumulés machines", parent: "15", nature: "credit", correctif: true },
                    "1510": { nom: "Mobilier et installations", parent: "15", nature: "debit" },
                    "1519": { nom: "Amort. cumulés mobilier", parent: "15", nature: "credit", correctif: true },
                    "1520": { nom: "Véhicules", parent: "15", nature: "debit" },
                    "1529": { nom: "Amort. cumulés véhicules", parent: "15", nature: "credit", correctif: true },
                    "1530": { nom: "Informatique", parent: "15", nature: "debit" },
                    "1539": { nom: "Amort. cumulés informatique", parent: "15", nature: "credit", correctif: true },
                    
                    // 16 - Immobilisations incorporelles
                    "16": { nom: "Immobilisations incorporelles", type: "actif", nature: "debit" },
                    "1600": { nom: "Brevets, licences", parent: "16", nature: "debit" },
                    "1609": { nom: "Amort. cumulés brevets", parent: "16", nature: "credit", correctif: true }
                }
            },
            
            // CLASSE 2 - PASSIFS
            "2": {
                nom: "PASSIFS",
                comptes: {
                    // 20 - Dettes à court terme
                    "20": { nom: "Dettes à court terme", type: "passif", nature: "credit" },
                    "2000": { nom: "Dettes fournisseurs", parent: "20", nature: "credit" },
                    "2030": { nom: "Acomptes clients", parent: "20", nature: "credit" },
                    "2100": { nom: "Dettes bancaires CT", parent: "20", nature: "credit" },
                    
                    // 21 - Passifs transitoires
                    "21": { nom: "Passifs transitoires", type: "passif", nature: "credit" },
                    "2300": { nom: "Charges à payer", parent: "21", nature: "credit" },
                    "2301": { nom: "Produits reçus d'avance", parent: "21", nature: "credit" },
                    
                    // 22 - Dettes fiscales et sociales
                    "22": { nom: "Dettes fiscales et sociales", type: "passif", nature: "credit" },
                    "2200": { nom: "TVA due", parent: "22", nature: "credit" },
                    "2201": { nom: "TVA sur acomptes reçus", parent: "22", nature: "credit" },
                    "2206": { nom: "Impôt anticipé dû", parent: "22", nature: "credit" },
                    "2270": { nom: "AVS/AI/APG/AC à payer", parent: "22", nature: "credit" },
                    "2271": { nom: "LPP à payer", parent: "22", nature: "credit" },
                    "2279": { nom: "Impôts dus", parent: "22", nature: "credit" },
                    
                    // 24 - Dettes à long terme
                    "24": { nom: "Dettes à long terme", type: "passif", nature: "credit" },
                    "2400": { nom: "Emprunts bancaires LT", parent: "24", nature: "credit" },
                    "2450": { nom: "Prêts actionnaires", parent: "24", nature: "credit" },
                    
                    // 28 - Capitaux propres
                    "28": { nom: "Capitaux propres", type: "passif", nature: "credit" },
                    "2800": { nom: "Capital social", parent: "28", nature: "credit" },
                    "2850": { nom: "Réserves légales", parent: "28", nature: "credit" },
                    "2900": { nom: "Bénéfice/Perte reporté", parent: "28", nature: "credit" },
                    "2991": { nom: "Bénéfice de l'exercice", parent: "28", nature: "credit" },
                    "2992": { nom: "Perte de l'exercice", parent: "28", nature: "debit" }
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
                    "3210": { nom: "Produits de licences", type: "produit", nature: "credit" },
                    "3400": { nom: "Variations stocks", type: "produit", nature: "credit" },
                    "3700": { nom: "Ventes annexes", type: "produit", nature: "credit" },
                    "3800": { nom: "Escomptes obtenus", type: "produit", nature: "credit" },
                    "3900": { nom: "Rabais et ristournes obtenus", type: "produit", nature: "credit" }
                }
            },
            
            // CLASSE 4 - CHARGES MARCHANDISES
            "4": {
                nom: "CHARGES MARCHANDISES",
                comptes: {
                    "4000": { nom: "Achats marchandises", type: "charge", nature: "debit" },
                    "4200": { nom: "Achats prestations tiers", type: "charge", nature: "debit" },
                    "4201": { nom: "Achats développement", type: "charge", nature: "debit" },
                    "4400": { nom: "Charges directes ventes", type: "charge", nature: "debit" },
                    "4500": { nom: "Variations stocks marchandises", type: "charge", nature: "debit" },
                    "4900": { nom: "Rabais et escomptes accordés", type: "charge", nature: "debit" }
                }
            },
            
            // CLASSE 5 - CHARGES PERSONNEL
            "5": {
                nom: "CHARGES PERSONNEL",
                comptes: {
                    "5000": { nom: "Salaires", type: "charge", nature: "debit" },
                    "5700": { nom: "Charges sociales patronales", type: "charge", nature: "debit" },
                    "5720": { nom: "LPP patronale", type: "charge", nature: "debit" },
                    "5730": { nom: "LAA", type: "charge", nature: "debit" },
                    "5740": { nom: "Allocations familiales", type: "charge", nature: "debit" },
                    "5800": { nom: "Autres charges personnel", type: "charge", nature: "debit" },
                    "5810": { nom: "Formation personnel", type: "charge", nature: "debit" },
                    "5900": { nom: "Charges personnel temporaire", type: "charge", nature: "debit" }
                }
            },
            
            // CLASSE 6 - AUTRES CHARGES D'EXPLOITATION
            "6": {
                nom: "AUTRES CHARGES D'EXPLOITATION",
                comptes: {
                    "6000": { nom: "Loyer", type: "charge", nature: "debit" },
                    "6100": { nom: "Entretien et réparations", type: "charge", nature: "debit" },
                    "6200": { nom: "Frais de véhicules", type: "charge", nature: "debit" },
                    "6260": { nom: "Leasing", type: "charge", nature: "debit" },
                    "6300": { nom: "Assurances", type: "charge", nature: "debit" },
                    "6400": { nom: "Électricité, eau, chauffage", type: "charge", nature: "debit" },
                    "6500": { nom: "Frais administration", type: "charge", nature: "debit" },
                    "6501": { nom: "Téléphone, internet", type: "charge", nature: "debit" },
                    "6502": { nom: "Frais postaux", type: "charge", nature: "debit" },
                    "6503": { nom: "Honoraires fiduciaire", type: "charge", nature: "debit" },
                    "6510": { nom: "Licences logiciels", type: "charge", nature: "debit" },
                    "6520": { nom: "Frais bancaires", type: "charge", nature: "debit" },
                    "6570": { nom: "Frais informatiques", type: "charge", nature: "debit" },
                    "6600": { nom: "Publicité, marketing", type: "charge", nature: "debit" },
                    "6700": { nom: "Autres charges exploitation", type: "charge", nature: "debit" },
                    "6800": { nom: "Amortissements", type: "charge", nature: "debit" },
                    "6900": { nom: "Charges financières", type: "charge", nature: "debit" },
                    "6901": { nom: "Intérêts bancaires", type: "charge", nature: "debit" },
                    "6940": { nom: "Pertes de change", type: "charge", nature: "debit" },
                    "6950": { nom: "Escomptes accordés", type: "charge", nature: "debit" }
                }
            },
            
            // CLASSE 7 - PRODUITS HORS EXPLOITATION
            "7": {
                nom: "PRODUITS HORS EXPLOITATION",
                comptes: {
                    "7000": { nom: "Produits financiers", type: "produit", nature: "credit" },
                    "7010": { nom: "Intérêts créanciers", type: "produit", nature: "credit" },
                    "7400": { nom: "Gains de change", type: "produit", nature: "credit" },
                    "7500": { nom: "Produits immeubles", type: "produit", nature: "credit" },
                    "7900": { nom: "Produits exceptionnels", type: "produit", nature: "credit" }
                }
            },
            
            // CLASSE 8 - CHARGES HORS EXPLOITATION
            "8": {
                nom: "CHARGES HORS EXPLOITATION",
                comptes: {
                    "8000": { nom: "Charges exceptionnelles", type: "charge", nature: "debit" },
                    "8500": { nom: "Charges immeubles", type: "charge", nature: "debit" },
                    "8900": { nom: "Impôts directs", type: "charge", nature: "debit" }
                }
            },
            
            // CLASSE 9 - CLÔTURE
            "9": {
                nom: "COMPTES DE CLÔTURE",
                comptes: {
                    "9000": { nom: "Compte de résultat", type: "cloture", nature: "variable" },
                    "9100": { nom: "Bilan de clôture", type: "cloture", nature: "variable" },
                    "9200": { nom: "Bilan d'ouverture", type: "cloture", nature: "variable" }
                }
            }
        },
        
        // Règles de génération automatique d'écritures
        reglesAutomatiques: {
            // Facture client créée
            "invoice_out_created": {
                description: "Création facture client",
                generer: function(data) {
                    // Utiliser le nouveau système de codes TVA
                    const tvaCode = data.vatCode || 'V81'; // Par défaut 8.1%
                    const vatInfo = TVA_CODES[tvaCode] || TVA_CODES.V81;
                    
                    return {
                        lignes: [
                            {
                                compte: "1100",
                                libelle: `${data.client} - Facture ${data.numero}`,
                                debit: data.total_ttc,
                                credit: 0
                            },
                            {
                                compte: data.compte_produit || "3200",
                                libelle: data.description,
                                debit: 0,
                                credit: data.total_ht
                            },
                            {
                                compte: "2200",
                                libelle: `TVA ${vatInfo.percent}%`,
                                debit: 0,
                                credit: data.tva
                            }
                        ]
                    };
                }
            },
            
            // Paiement client reçu
            "payment_received": {
                description: "Encaissement client",
                generer: function(data) {
                    const comptesBanque = {
                        "hypervisual": "1021",
                        "dainamics": "1022",
                        "waveform": "1023",
                        "particule": "1024",
                        "holding": "1025"
                    };
                    
                    return {
                        lignes: [
                            {
                                compte: comptesBanque[data.entity] || "1020",
                                libelle: `Encaissement ${data.client}`,
                                debit: data.montant,
                                credit: 0
                            },
                            {
                                compte: "1100",
                                libelle: `${data.client} - Règlement facture ${data.facture}`,
                                debit: 0,
                                credit: data.montant
                            }
                        ]
                    };
                }
            },
            
            // Facture fournisseur validée
            "invoice_in_validated": {
                description: "Validation facture fournisseur",
                generer: function(data) {
                    // Utiliser le nouveau système de codes TVA
                    const tvaCode = data.vatCode || 'A81'; // Par défaut achats 8.1%
                    const vatInfo = TVA_CODES[tvaCode] || TVA_CODES.A81;
                    
                    return {
                        lignes: [
                            {
                                compte: data.compte_charge || "4200",
                                libelle: data.description,
                                debit: data.total_ht,
                                credit: 0
                            },
                            {
                                compte: "1170",
                                libelle: `TVA récupérable ${vatInfo.percent}%`,
                                debit: data.tva,
                                credit: 0
                            },
                            {
                                compte: "2000",
                                libelle: `${data.fournisseur} - Facture ${data.numero}`,
                                debit: 0,
                                credit: data.total_ttc
                            }
                        ]
                    };
                }
            },
            
            // Paiement fournisseur
            "payment_sent": {
                description: "Paiement fournisseur",
                generer: function(data) {
                    const comptesBanque = {
                        "hypervisual": "1021",
                        "dainamics": "1022",
                        "waveform": "1023",
                        "particule": "1024",
                        "holding": "1025"
                    };
                    
                    return {
                        lignes: [
                            {
                                compte: "2000",
                                libelle: `${data.fournisseur} - Règlement facture ${data.facture}`,
                                debit: data.montant,
                                credit: 0
                            },
                            {
                                compte: comptesBanque[data.entity] || "1020",
                                libelle: `Paiement ${data.fournisseur}`,
                                debit: 0,
                                credit: data.montant
                            }
                        ]
                    };
                }
            },
            
            // Salaires
            "payroll_processed": {
                description: "Traitement paie mensuelle",
                generer: function(data) {
                    return {
                        lignes: [
                            {
                                compte: "5000",
                                libelle: `Salaires ${data.mois}/${data.annee}`,
                                debit: data.salaires_bruts,
                                credit: 0
                            },
                            {
                                compte: "5700",
                                libelle: `Charges sociales patronales ${data.mois}/${data.annee}`,
                                debit: data.charges_patronales,
                                credit: 0
                            },
                            {
                                compte: "2270",
                                libelle: "Charges sociales à payer",
                                debit: 0,
                                credit: data.charges_sociales_totales
                            },
                            {
                                compte: "1020",
                                libelle: `Salaires nets ${data.mois}/${data.annee}`,
                                debit: 0,
                                credit: data.salaires_nets
                            }
                        ]
                    };
                }
            },
            
            // Note de frais approuvée
            "expense_approved": {
                description: "Note de frais approuvée",
                generer: function(data) {
                    const comptesCharges = {
                        "Repas affaires": "6700",
                        "Transport": "6200",
                        "Hébergement": "6700",
                        "Matériel/Fournitures": "6570",
                        "Formation": "5810",
                        "Marketing": "6600"
                    };
                    
                    return {
                        lignes: [
                            {
                                compte: comptesCharges[data.categorie] || "6700",
                                libelle: data.description,
                                debit: data.montant_ht,
                                credit: 0
                            },
                            {
                                compte: "1170",
                                libelle: `TVA récupérable ${data.tva_percent || '8.1'}%`,
                                debit: data.tva,
                                credit: 0
                            },
                            {
                                compte: data.remboursable ? "2000" : "1020",
                                libelle: data.remboursable ? `Remboursement dû - ${data.employe}` : "Paiement par carte entreprise",
                                debit: 0,
                                credit: data.montant_ttc
                            }
                        ]
                    };
                }
            }
        },
        
        // Configuration exercice
        exercice: {
            actuel: "2025",
            debut: "2025-01-01",
            fin: "2025-12-31",
            periodes_cloturees: []
        }
    };
    
    // État du module
    let state = {
        ecritures: [],
        balances: {},
        currentView: 'balance',
        filters: {
            periode: '2025-01',
            status: '',
            entity: ''
        },
        currentUser: null,
        nextEntryNumber: 1
    };
    
    // Initialisation
    async function init() {
        try {
            console.log('📊 Initialisation moteur comptable...');
            
            // Vérifier permissions
            if (!await window.PermissionsSuperadmin.hasPermission('superadmin.finance.accounting')) {
                throw new Error('Permissions insuffisantes');
            }
            
            // Récupérer utilisateur actuel
            state.currentUser = window.AuthSuperadmin.getCurrentUser();
            
            // Charger les données
            await loadEcritures();
            await calculateBalances();
            
            // Initialiser l'interface
            initializeInterface();
            attachEventListeners();
            
            // Afficher vue par défaut
            showView('balance');
            
            console.log('✅ Moteur comptable initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation comptabilité:', error);
            showNotification('Erreur lors du chargement de la comptabilité', 'error');
        }
    }
    
    // Charger écritures
    async function loadEcritures() {
        try {
            // Données de démonstration - En production: const response = await fetch('/api/accounting/entries');
            state.ecritures = [
                {
                    ecriture_id: "ECR-2025-00001",
                    numero_piece: "HYP-2025-0042",
                    date_ecriture: "2025-01-20",
                    periode: "2025-01",
                    exercice: "2025",
                    libelle: "Facture client Rolex SA - Production vidéo",
                    reference: "HYP-2025-0042",
                    lignes: [
                        {
                            compte: "1100",
                            libelle: "Rolex SA - Facture HYP-2025-0042",
                            debit: 13462.50,
                            credit: 0,
                            devise: "CHF"
                        },
                        {
                            compte: "3201",
                            libelle: "Production vidéo 4K",
                            debit: 0,
                            credit: 12500.00,
                            devise: "CHF"
                        },
                        {
                            compte: "2200",
                            libelle: "TVA 8.1%",
                            debit: 0,
                            credit: 962.50,
                            devise: "CHF"
                        }
                    ],
                    statut: "validee",
                    total_debit: 13462.50,
                    total_credit: 13462.50,
                    balance: 0,
                    source: "auto",
                    module_origine: "invoices-out",
                    entity: "hypervisual",
                    created_at: "2025-01-20T10:00:00Z",
                    created_by: "system",
                    validated_at: "2025-01-20T10:01:00Z",
                    validated_by: "Marie Dubois"
                },
                {
                    ecriture_id: "ECR-2025-00002",
                    numero_piece: "BANK-001",
                    date_ecriture: "2025-01-20",
                    periode: "2025-01",
                    exercice: "2025",
                    libelle: "Encaissement facture Rolex SA",
                    reference: "Virement SEPA",
                    lignes: [
                        {
                            compte: "1021",
                            libelle: "Encaissement Rolex SA",
                            debit: 13462.50,
                            credit: 0,
                            devise: "CHF"
                        },
                        {
                            compte: "1100",
                            libelle: "Rolex SA - Règlement facture HYP-2025-0042",
                            debit: 0,
                            credit: 13462.50,
                            devise: "CHF"
                        }
                    ],
                    statut: "validee",
                    total_debit: 13462.50,
                    total_credit: 13462.50,
                    balance: 0,
                    source: "auto",
                    module_origine: "banking",
                    entity: "hypervisual",
                    created_at: "2025-01-20T14:00:00Z",
                    created_by: "system"
                },
                {
                    ecriture_id: "ECR-2025-00003",
                    numero_piece: "SUP-2025-0156",
                    date_ecriture: "2025-01-19",
                    periode: "2025-01",
                    exercice: "2025",
                    libelle: "Facture fournisseur Jean Dupont - Freelance production",
                    reference: "SUP-2025-0156",
                    lignes: [
                        {
                            compte: "4201",
                            libelle: "Prestations développement externe",
                            debit: 15000.00,
                            credit: 0,
                            devise: "CHF"
                        },
                        {
                            compte: "1170",
                            libelle: "TVA récupérable 8.1%",
                            debit: 1155.00,
                            credit: 0,
                            devise: "CHF"
                        },
                        {
                            compte: "2000",
                            libelle: "Jean Dupont - Facture SUP-2025-0156",
                            debit: 0,
                            credit: 16155.00,
                            devise: "CHF"
                        }
                    ],
                    statut: "validee",
                    total_debit: 16155.00,
                    total_credit: 16155.00,
                    balance: 0,
                    source: "auto",
                    module_origine: "invoices-in",
                    entity: "waveform",
                    created_at: "2025-01-19T16:00:00Z",
                    created_by: "system"
                },
                {
                    ecriture_id: "ECR-2025-00004",
                    numero_piece: "PAIE-01-2025",
                    date_ecriture: "2025-01-25",
                    periode: "2025-01",
                    exercice: "2025",
                    libelle: "Salaires janvier 2025",
                    reference: "Paie mensuelle",
                    lignes: [
                        {
                            compte: "5000",
                            libelle: "Salaires bruts janvier 2025",
                            debit: 85000.00,
                            credit: 0,
                            devise: "CHF"
                        },
                        {
                            compte: "5700",
                            libelle: "Charges sociales patronales",
                            debit: 17000.00,
                            credit: 0,
                            devise: "CHF"
                        },
                        {
                            compte: "2270",
                            libelle: "Charges sociales à payer",
                            debit: 0,
                            credit: 27000.00,
                            devise: "CHF"
                        },
                        {
                            compte: "1020",
                            libelle: "Salaires nets janvier 2025",
                            debit: 0,
                            credit: 75000.00,
                            devise: "CHF"
                        }
                    ],
                    statut: "validee",
                    total_debit: 102000.00,
                    total_credit: 102000.00,
                    balance: 0,
                    source: "manuel",
                    module_origine: "payroll",
                    entity: "holding",
                    created_at: "2025-01-25T09:00:00Z",
                    created_by: "Claire Dubois"
                },
                {
                    ecriture_id: "ECR-2025-00005",
                    numero_piece: "LOYER-01-2025",
                    date_ecriture: "2025-01-05",
                    periode: "2025-01",
                    exercice: "2025",
                    libelle: "Loyer janvier 2025",
                    reference: "Contrat bail",
                    lignes: [
                        {
                            compte: "6000",
                            libelle: "Loyer bureaux janvier",
                            debit: 8500.00,
                            credit: 0,
                            devise: "CHF"
                        },
                        {
                            compte: "1020",
                            libelle: "Paiement loyer janvier",
                            debit: 0,
                            credit: 8500.00,
                            devise: "CHF"
                        }
                    ],
                    statut: "validee",
                    total_debit: 8500.00,
                    total_credit: 8500.00,
                    balance: 0,
                    source: "auto",
                    module_origine: "recurring",
                    entity: "holding",
                    created_at: "2025-01-05T08:00:00Z",
                    created_by: "system"
                }
            ];
            
            // Calculer prochain numéro
            const maxNumber = Math.max(
                ...state.ecritures.map(ecr => 
                    parseInt(ecr.ecriture_id.split('-')[2]) || 0
                )
            );
            state.nextEntryNumber = maxNumber + 1;
            
            console.log(`📋 ${state.ecritures.length} écritures chargées`);
            
        } catch (error) {
            console.error('❌ Erreur chargement écritures:', error);
            throw error;
        }
    }
    
    // Calculer balances
    async function calculateBalances() {
        try {
            // Réinitialiser balances
            state.balances = {};
            
            // Parcourir toutes les écritures
            state.ecritures.forEach(ecriture => {
                if (ecriture.statut !== 'validee') return;
                
                ecriture.lignes.forEach(ligne => {
                    if (!state.balances[ligne.compte]) {
                        state.balances[ligne.compte] = {
                            debit: 0,
                            credit: 0,
                            solde: 0
                        };
                    }
                    
                    state.balances[ligne.compte].debit += ligne.debit;
                    state.balances[ligne.compte].credit += ligne.credit;
                });
            });
            
            // Calculer soldes selon nature du compte
            Object.keys(state.balances).forEach(compte => {
                const balance = state.balances[compte];
                const compteInfo = getCompteInfo(compte);
                
                if (compteInfo && compteInfo.nature === 'debit') {
                    balance.solde = balance.debit - balance.credit;
                } else {
                    balance.solde = balance.credit - balance.debit;
                }
            });
            
            console.log('💰 Balances calculées');
            
        } catch (error) {
            console.error('❌ Erreur calcul balances:', error);
            throw error;
        }
    }
    
    // Obtenir infos compte
    function getCompteInfo(numeroCompte) {
        // Chercher dans toutes les classes
        for (const [classe, data] of Object.entries(config.planComptable)) {
            if (data.comptes && data.comptes[numeroCompte]) {
                return data.comptes[numeroCompte];
            }
        }
        return null;
    }
    
    // Obtenir tous les comptes
    function getAllComptes() {
        const comptes = [];
        
        Object.entries(config.planComptable).forEach(([classe, data]) => {
            if (data.comptes) {
                Object.entries(data.comptes).forEach(([numero, compte]) => {
                    comptes.push({
                        numero,
                        ...compte,
                        classe
                    });
                });
            }
        });
        
        return comptes;
    }
    
    // Initialiser interface
    function initializeInterface() {
        // Date du jour
        document.getElementById('balance-date').textContent = new Date().toLocaleDateString('fr-CH');
        document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];
        
        // Remplir sélecteur comptes grand livre
        populateLedgerAccounts();
    }
    
    // Attacher événements
    function attachEventListeners() {
        // Navigation vues
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                showView(this.dataset.view);
            });
        });
        
        // Actions rapides
        document.getElementById('new-entry')?.addEventListener('click', openNewEntry);
        document.getElementById('close-period')?.addEventListener('click', closePeriod);
        
        document.getElementById('action-import')?.addEventListener('click', () => showNotification('Import en développement', 'info'));
        document.getElementById('action-export')?.addEventListener('click', exportCresus);
        document.getElementById('action-budget')?.addEventListener('click', () => showNotification('Module budget en développement', 'info'));
        document.getElementById('action-analytics')?.addEventListener('click', () => showNotification('Analytique en développement', 'info'));
        document.getElementById('action-audit')?.addEventListener('click', showAuditTrail);
        document.getElementById('action-reports')?.addEventListener('click', () => showNotification('Rapports en développement', 'info'));
        
        // Modal écriture
        document.getElementById('add-entry-line')?.addEventListener('click', addEntryLine);
        document.getElementById('save-draft')?.addEventListener('click', () => saveEntry(true));
        document.getElementById('validate-entry')?.addEventListener('click', () => saveEntry(false));
        
        // Filtres journal
        document.getElementById('filter-period')?.addEventListener('change', applyFilters);
        document.getElementById('filter-status')?.addEventListener('change', applyFilters);
        document.getElementById('filter-entity')?.addEventListener('change', applyFilters);
        document.getElementById('search-journal')?.addEventListener('input', applyFilters);
        
        // Recherche comptes
        document.getElementById('search-accounts')?.addEventListener('input', filterAccounts);
        
        // Sélection compte grand livre
        document.getElementById('ledger-account')?.addEventListener('change', showLedger);
        
        // Calculer totaux en temps réel
        document.addEventListener('input', function(e) {
            if (e.target.matches('.entry-debit, .entry-credit')) {
                calculateEntryTotals();
            }
        });
    }
    
    // Afficher vue
    function showView(viewName) {
        // Masquer toutes les vues
        document.querySelectorAll('.view-content').forEach(view => {
            view.style.display = 'none';
        });
        
        // Afficher vue sélectionnée
        const view = document.getElementById(`${viewName}-view`);
        if (view) {
            view.style.display = 'block';
            view.classList.add('fade-in');
        }
        
        // Mettre à jour navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        
        state.currentView = viewName;
        
        // Rafraîchir contenu selon vue
        switch (viewName) {
            case 'balance':
                renderBalance();
                break;
            case 'journal':
                renderJournal();
                break;
            case 'accounts':
                renderAccounts();
                break;
            case 'ledger':
                if (document.getElementById('ledger-account').value) {
                    showLedger();
                }
                break;
            case 'bilan':
                renderBilan();
                break;
            case 'pl':
                renderPL();
                break;
        }
    }
    
    // Rendre balance générale
    function renderBalance() {
        // Calculer totaux par classe
        const totaux = {
            actifs: 0,
            passifs: 0,
            produits: 0,
            charges: 0
        };
        
        const details = {};
        
        // Grouper par classe
        Object.entries(state.balances).forEach(([compte, balance]) => {
            const classe = compte.charAt(0);
            const compteInfo = getCompteInfo(compte);
            
            if (!details[classe]) {
                details[classe] = {
                    nom: config.planComptable[classe]?.nom || `Classe ${classe}`,
                    comptes: [],
                    total: 0
                };
            }
            
            details[classe].comptes.push({
                numero: compte,
                nom: compteInfo?.nom || 'Compte inconnu',
                solde: balance.solde
            });
            
            details[classe].total += Math.abs(balance.solde);
            
            // Ajouter aux totaux
            if (classe === '1') totaux.actifs += Math.abs(balance.solde);
            else if (classe === '2') totaux.passifs += Math.abs(balance.solde);
            else if (classe === '3' || classe === '7') totaux.produits += Math.abs(balance.solde);
            else if (classe === '4' || classe === '5' || classe === '6' || classe === '8') totaux.charges += Math.abs(balance.solde);
        });
        
        // Calculer résultat
        const resultat = totaux.produits - totaux.charges;
        
        // Mettre à jour résumé
        document.getElementById('total-actifs').textContent = `CHF ${formatSwissAmount(totaux.actifs)}`;
        document.getElementById('total-passifs').textContent = `CHF ${formatSwissAmount(totaux.passifs)}`;
        document.getElementById('total-produits').textContent = `CHF ${formatSwissAmount(totaux.produits)}`;
        document.getElementById('total-charges').textContent = `CHF ${formatSwissAmount(totaux.charges)}`;
        document.getElementById('resultat').textContent = `CHF ${resultat >= 0 ? '+' : ''}${formatSwissAmount(resultat)}`;
        
        // Rendre détails
        const container = document.getElementById('balance-details');
        container.innerHTML = '';
        
        Object.entries(details).forEach(([classe, data]) => {
            if (data.comptes.length === 0) return;
            
            const card = document.createElement('div');
            card.className = 'balance-card';
            card.innerHTML = `
                <div class="balance-header">
                    <div class="balance-class">Classe ${classe} - ${data.nom}</div>
                    <div class="balance-amount">${formatSwissAmount(data.total)} CHF</div>
                </div>
                <div class="account-tree">
                    ${data.comptes.map(compte => `
                        <div class="account-item" data-compte="${compte.numero}">
                            <div class="line-account">
                                <span class="account-code">${compte.numero}</span>
                                <span class="account-name">${compte.nom}</span>
                            </div>
                            <div class="account-balance ${compte.solde >= 0 ? 'balance-positive' : 'balance-negative'}">
                                ${formatSwissAmount(Math.abs(compte.solde))}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(card);
        });
    }
    
    // Rendre journal
    function renderJournal() {
        const container = document.getElementById('journal-entries');
        const filteredEntries = applyFilters();
        
        if (filteredEntries.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">Aucune écriture trouvée</p>';
            return;
        }
        
        container.innerHTML = filteredEntries.map(ecriture => `
            <div class="journal-entry">
                <div class="entry-header">
                    <div>
                        <span class="entry-number">${ecriture.ecriture_id}</span>
                        <span class="entry-date ms-2">${formatDate(ecriture.date_ecriture)}</span>
                        ${ecriture.numero_piece ? `<span class="text-muted ms-2">• ${ecriture.numero_piece}</span>` : ''}
                    </div>
                    <span class="entry-status status-${ecriture.statut}">${ecriture.statut}</span>
                </div>
                <div class="fw-bold mb-2">${ecriture.libelle}</div>
                <div class="entry-lines">
                    ${ecriture.lignes.map(ligne => `
                        <div class="entry-line">
                            <div class="line-account">
                                <span class="account-code">${ligne.compte}</span>
                                <span class="text-muted">${ligne.libelle}</span>
                            </div>
                            <div class="line-amounts">
                                <div class="amount-debit">${ligne.debit > 0 ? formatSwissAmount(ligne.debit) : ''}</div>
                                <div class="amount-credit">${ligne.credit > 0 ? formatSwissAmount(ligne.credit) : ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    // Rendre plan comptable
    function renderAccounts() {
        const container = document.getElementById('accounts-tree');
        const searchTerm = document.getElementById('search-accounts').value.toLowerCase();
        
        let html = '';
        
        Object.entries(config.planComptable).forEach(([classe, data]) => {
            const comptes = Object.entries(data.comptes || {})
                .filter(([numero, compte]) => 
                    !searchTerm || 
                    numero.includes(searchTerm) || 
                    compte.nom.toLowerCase().includes(searchTerm)
                );
            
            if (comptes.length === 0) return;
            
            html += `
                <div class="balance-card">
                    <div class="balance-header">
                        <div class="balance-class">Classe ${classe} - ${data.nom}</div>
                    </div>
                    <div class="account-tree">
                        ${comptes.map(([numero, compte]) => {
                            const balance = state.balances[numero];
                            const hasBalance = balance && balance.solde !== 0;
                            
                            return `
                                <div class="account-item ${hasBalance ? 'has-balance' : ''}" data-compte="${numero}">
                                    <div class="line-account">
                                        <span class="account-code">${numero}</span>
                                        <span class="account-name">${compte.nom}</span>
                                        ${compte.correctif ? '<span class="badge bg-secondary ms-2">Correctif</span>' : ''}
                                    </div>
                                    ${hasBalance ? `
                                        <div class="account-balance ${balance.solde >= 0 ? 'balance-positive' : 'balance-negative'}">
                                            ${formatSwissAmount(Math.abs(balance.solde))}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<p class="text-muted text-center">Aucun compte trouvé</p>';
    }
    
    // Rendre bilan
    function renderBilan() {
        const actifs = [];
        const passifs = [];
        
        // Grouper comptes par type
        getAllComptes().forEach(compte => {
            const balance = state.balances[compte.numero];
            if (!balance || balance.solde === 0) return;
            
            const item = {
                numero: compte.numero,
                nom: compte.nom,
                solde: Math.abs(balance.solde)
            };
            
            if (compte.type === 'actif') {
                actifs.push(item);
            } else if (compte.type === 'passif') {
                passifs.push(item);
            }
        });
        
        // Calculer résultat pour l'ajouter aux passifs
        const totalActifs = actifs.reduce((sum, item) => sum + item.solde, 0);
        const totalPassifs = passifs.reduce((sum, item) => sum + item.solde, 0);
        const resultat = calculateResultat();
        
        if (resultat !== 0) {
            passifs.push({
                numero: resultat > 0 ? '2991' : '2992',
                nom: resultat > 0 ? 'Bénéfice de l\'exercice' : 'Perte de l\'exercice',
                solde: Math.abs(resultat)
            });
        }
        
        // Rendre actifs
        const actifsContainer = document.getElementById('bilan-actifs');
        actifsContainer.innerHTML = `
            ${actifs.map(item => `
                <div class="bilan-row">
                    <div class="bilan-account">${item.numero} - ${item.nom}</div>
                    <div class="bilan-amount">${formatSwissAmount(item.solde)}</div>
                </div>
            `).join('')}
            <div class="bilan-row total">
                <div class="bilan-account">TOTAL ACTIFS</div>
                <div class="bilan-amount">${formatSwissAmount(totalActifs)}</div>
            </div>
        `;
        
        // Rendre passifs
        const passifsContainer = document.getElementById('bilan-passifs');
        passifsContainer.innerHTML = `
            ${passifs.map(item => `
                <div class="bilan-row">
                    <div class="bilan-account">${item.numero} - ${item.nom}</div>
                    <div class="bilan-amount">${formatSwissAmount(item.solde)}</div>
                </div>
            `).join('')}
            <div class="bilan-row total">
                <div class="bilan-account">TOTAL PASSIFS</div>
                <div class="bilan-amount">${formatSwissAmount(totalPassifs + Math.abs(resultat))}</div>
            </div>
        `;
    }
    
    // Rendre compte de résultat
    function renderPL() {
        const produits = [];
        const charges = [];
        
        // Grouper comptes par type
        getAllComptes().forEach(compte => {
            const balance = state.balances[compte.numero];
            if (!balance || balance.solde === 0) return;
            
            const item = {
                numero: compte.numero,
                nom: compte.nom,
                solde: Math.abs(balance.solde)
            };
            
            if (compte.type === 'produit') {
                produits.push(item);
            } else if (compte.type === 'charge') {
                charges.push(item);
            }
        });
        
        const totalProduits = produits.reduce((sum, item) => sum + item.solde, 0);
        const totalCharges = charges.reduce((sum, item) => sum + item.solde, 0);
        const resultat = totalProduits - totalCharges;
        
        // Rendre produits
        const produitsContainer = document.getElementById('pl-produits');
        produitsContainer.innerHTML = `
            ${produits.map(item => `
                <div class="bilan-row">
                    <div class="bilan-account">${item.numero} - ${item.nom}</div>
                    <div class="bilan-amount">${formatSwissAmount(item.solde)}</div>
                </div>
            `).join('')}
            <div class="bilan-row total">
                <div class="bilan-account">TOTAL PRODUITS</div>
                <div class="bilan-amount">${formatSwissAmount(totalProduits)}</div>
            </div>
        `;
        
        // Rendre charges
        const chargesContainer = document.getElementById('pl-charges');
        chargesContainer.innerHTML = `
            ${charges.map(item => `
                <div class="bilan-row">
                    <div class="bilan-account">${item.numero} - ${item.nom}</div>
                    <div class="bilan-amount">${formatSwissAmount(item.solde)}</div>
                </div>
            `).join('')}
            <div class="bilan-row total">
                <div class="bilan-account">TOTAL CHARGES</div>
                <div class="bilan-amount">${formatSwissAmount(totalCharges)}</div>
            </div>
        `;
        
        // Afficher résultat
        const resultatEl = document.getElementById('resultat-net');
        resultatEl.textContent = `CHF ${resultat >= 0 ? '+' : ''}${formatSwissAmount(resultat)}`;
        resultatEl.className = `bilan-amount ${resultat >= 0 ? 'result-positive' : 'result-negative'}`;
    }
    
    // Calculer résultat
    function calculateResultat() {
        let produits = 0;
        let charges = 0;
        
        Object.entries(state.balances).forEach(([compte, balance]) => {
            const compteInfo = getCompteInfo(compte);
            if (!compteInfo) return;
            
            if (compteInfo.type === 'produit') {
                produits += Math.abs(balance.solde);
            } else if (compteInfo.type === 'charge') {
                charges += Math.abs(balance.solde);
            }
        });
        
        return produits - charges;
    }
    
    // Ouvrir nouvelle écriture
    function openNewEntry() {
        const modal = document.getElementById('newEntryModal');
        if (!modal) return;
        
        // Reset formulaire
        document.getElementById('entryForm').reset();
        document.getElementById('entry-date').value = new Date().toISOString().split('T')[0];
        
        // Ajouter 2 lignes par défaut
        const tbody = document.getElementById('entry-lines');
        tbody.innerHTML = '';
        addEntryLine();
        addEntryLine();
        
        new bootstrap.Modal(modal).show();
    }
    
    // Ajouter ligne écriture
    function addEntryLine() {
        const tbody = document.getElementById('entry-lines');
        const lineNumber = tbody.children.length + 1;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <select class="form-select form-select-sm entry-compte" required>
                    <option value="">Sélectionner...</option>
                    ${getAllComptes().map(compte => 
                        `<option value="${compte.numero}">${compte.numero} - ${compte.nom}</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm entry-libelle" placeholder="Libellé ligne">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm entry-debit" step="0.01" min="0" value="0">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm entry-credit" step="0.01" min="0" value="0">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove(); window.AccountingEngine.calculateEntryTotals();">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 6l-12 12" />
                        <path d="M6 6l12 12" />
                    </svg>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    }
    
    // Calculer totaux écriture
    function calculateEntryTotals() {
        let totalDebit = 0;
        let totalCredit = 0;
        
        document.querySelectorAll('.entry-debit').forEach(input => {
            totalDebit += parseFloat(input.value) || 0;
        });
        
        document.querySelectorAll('.entry-credit').forEach(input => {
            totalCredit += parseFloat(input.value) || 0;
        });
        
        document.getElementById('total-debit').textContent = formatSwissAmount(totalDebit);
        document.getElementById('total-credit').textContent = formatSwissAmount(totalCredit);
        
        const balance = totalDebit - totalCredit;
        const balanceEl = document.getElementById('entry-balance');
        balanceEl.textContent = formatSwissAmount(Math.abs(balance));
        balanceEl.className = balance === 0 ? 'text-center text-success' : 'text-center text-danger';
    }
    
    // Sauvegarder écriture
    async function saveEntry(isDraft = false) {
        try {
            // Valider formulaire
            const form = document.getElementById('entryForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Vérifier balance
            const totalDebit = Array.from(document.querySelectorAll('.entry-debit'))
                .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
            const totalCredit = Array.from(document.querySelectorAll('.entry-credit'))
                .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
            
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                showNotification('L\'écriture n\'est pas équilibrée', 'error');
                return;
            }
            
            // Collecter données
            const lignes = [];
            const rows = document.querySelectorAll('#entry-lines tr');
            
            rows.forEach(row => {
                const compte = row.querySelector('.entry-compte').value;
                const libelle = row.querySelector('.entry-libelle').value || document.getElementById('entry-libelle').value;
                const debit = parseFloat(row.querySelector('.entry-debit').value) || 0;
                const credit = parseFloat(row.querySelector('.entry-credit').value) || 0;
                
                if (compte && (debit > 0 || credit > 0)) {
                    lignes.push({ compte, libelle, debit, credit, devise: 'CHF' });
                }
            });
            
            if (lignes.length < 2) {
                showNotification('Une écriture doit avoir au moins 2 lignes', 'error');
                return;
            }
            
            const ecritureData = {
                ecriture_id: `ECR-2025-${state.nextEntryNumber.toString().padStart(5, '0')}`,
                numero_piece: document.getElementById('entry-piece').value,
                date_ecriture: document.getElementById('entry-date').value,
                periode: document.getElementById('entry-date').value.substring(0, 7),
                exercice: document.getElementById('entry-date').value.substring(0, 4),
                libelle: document.getElementById('entry-libelle').value,
                reference: '',
                lignes: lignes,
                statut: isDraft ? 'brouillon' : 'validee',
                total_debit: totalDebit,
                total_credit: totalCredit,
                balance: 0,
                source: 'manuel',
                module_origine: 'accounting',
                entity: document.getElementById('entry-entity').value,
                created_at: new Date().toISOString(),
                created_by: state.currentUser.name
            };
            
            if (!isDraft) {
                ecritureData.validated_at = new Date().toISOString();
                ecritureData.validated_by = state.currentUser.name;
            }
            
            // Ajouter à la liste
            state.ecritures.unshift(ecritureData);
            state.nextEntryNumber++;
            
            // Recalculer balances si validée
            if (!isDraft) {
                await calculateBalances();
            }
            
            // Logger action
            await window.AuthSuperadmin.logAuditEvent('ACCOUNTING_ENTRY_CREATED', {
                ecritureId: ecritureData.ecriture_id,
                isDraft: isDraft,
                totalAmount: totalDebit
            });
            
            showNotification(`Écriture ${isDraft ? 'sauvegardée en brouillon' : 'validée'} avec succès`, 'success');
            
            // Fermer modal et rafraîchir
            const modal = bootstrap.Modal.getInstance(document.getElementById('newEntryModal'));
            modal.hide();
            
            showView(state.currentView);
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde écriture:', error);
            showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    // Appliquer filtres
    function applyFilters() {
        const periode = document.getElementById('filter-period')?.value || '';
        const status = document.getElementById('filter-status')?.value || '';
        const entity = document.getElementById('filter-entity')?.value || '';
        const search = document.getElementById('search-journal')?.value.toLowerCase() || '';
        
        return state.ecritures.filter(ecriture => {
            if (periode && ecriture.periode !== periode) return false;
            if (status && ecriture.statut !== status) return false;
            if (entity && ecriture.entity !== entity) return false;
            if (search && !ecriture.libelle.toLowerCase().includes(search) && 
                !ecriture.numero_piece.toLowerCase().includes(search)) return false;
            
            return true;
        });
    }
    
    // Filtrer comptes
    function filterAccounts() {
        renderAccounts();
    }
    
    // Peupler comptes grand livre
    function populateLedgerAccounts() {
        const select = document.getElementById('ledger-account');
        if (!select) return;
        
        select.innerHTML = '<option value="">Sélectionner un compte...</option>';
        
        // Ajouter seulement les comptes avec mouvements
        const comptesAvecMouvements = Object.keys(state.balances).sort();
        
        comptesAvecMouvements.forEach(numero => {
            const compteInfo = getCompteInfo(numero);
            const option = document.createElement('option');
            option.value = numero;
            option.textContent = `${numero} - ${compteInfo?.nom || 'Compte inconnu'}`;
            select.appendChild(option);
        });
    }
    
    // Afficher grand livre
    function showLedger() {
        const compte = document.getElementById('ledger-account').value;
        if (!compte) return;
        
        const compteInfo = getCompteInfo(compte);
        const movements = [];
        let solde = 0;
        
        // Collecter tous les mouvements du compte
        state.ecritures.forEach(ecriture => {
            ecriture.lignes.forEach(ligne => {
                if (ligne.compte === compte) {
                    if (compteInfo.nature === 'debit') {
                        solde += ligne.debit - ligne.credit;
                    } else {
                        solde += ligne.credit - ligne.debit;
                    }
                    
                    movements.push({
                        date: ecriture.date_ecriture,
                        piece: ecriture.numero_piece,
                        libelle: ligne.libelle,
                        debit: ligne.debit,
                        credit: ligne.credit,
                        solde: solde
                    });
                }
            });
        });
        
        // Trier par date
        movements.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Rendre grand livre
        const container = document.getElementById('ledger-content');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">Grand livre - ${compte} ${compteInfo?.nom || ''}</h4>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Pièce</th>
                                    <th>Libellé</th>
                                    <th class="text-end">Débit</th>
                                    <th class="text-end">Crédit</th>
                                    <th class="text-end">Solde</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${movements.map(mvt => `
                                    <tr>
                                        <td>${formatDate(mvt.date)}</td>
                                        <td>${mvt.piece || '-'}</td>
                                        <td>${mvt.libelle}</td>
                                        <td class="text-end">${mvt.debit > 0 ? formatSwissAmount(mvt.debit) : ''}</td>
                                        <td class="text-end">${mvt.credit > 0 ? formatSwissAmount(mvt.credit) : ''}</td>
                                        <td class="text-end fw-bold ${mvt.solde >= 0 ? 'text-success' : 'text-danger'}">
                                            ${formatSwissAmount(Math.abs(mvt.solde))}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Clôturer période
    async function closePeriod() {
        if (!confirm('Êtes-vous sûr de vouloir clôturer la période actuelle ?')) {
            return;
        }
        
        showNotification('Module de clôture en développement', 'info');
    }
    
    // Export Crésus
    async function exportCresus() {
        try {
            showNotification('Génération export Crésus...', 'info');
            
            // Format Crésus simplifié
            const lines = ['Date;Piece;Compte;Libelle;Debit;Credit'];
            
            state.ecritures.forEach(ecriture => {
                if (ecriture.statut !== 'validee') return;
                
                ecriture.lignes.forEach(ligne => {
                    lines.push([
                        formatDate(ecriture.date_ecriture, 'DD.MM.YYYY'),
                        ecriture.numero_piece || '',
                        ligne.compte,
                        `"${ligne.libelle}"`,
                        ligne.debit.toFixed(2),
                        ligne.credit.toFixed(2)
                    ].join(';'));
                });
            });
            
            const csv = lines.join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `export_cresus_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            await window.AuthSuperadmin.logAuditEvent('ACCOUNTING_EXPORT', {
                format: 'cresus',
                entriesCount: state.ecritures.length
            });
            
            showNotification('Export Crésus généré avec succès', 'success');
            
        } catch (error) {
            console.error('❌ Erreur export:', error);
            showNotification('Erreur lors de l\'export', 'error');
        }
    }
    
    // Afficher piste d'audit
    function showAuditTrail() {
        showNotification('Piste d\'audit en développement', 'info');
    }
    
    // Créer écriture automatique
    async function createAutomaticEntry(type, data) {
        try {
            const regle = config.reglesAutomatiques[type];
            if (!regle) {
                console.warn(`Règle automatique '${type}' non trouvée`);
                return null;
            }
            
            const ecritureData = regle.generer(data);
            if (!ecritureData || !ecritureData.lignes) return null;
            
            // Vérifier équilibre
            const totalDebit = ecritureData.lignes.reduce((sum, ligne) => sum + ligne.debit, 0);
            const totalCredit = ecritureData.lignes.reduce((sum, ligne) => sum + ligne.credit, 0);
            
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                console.error('Écriture automatique non équilibrée');
                return null;
            }
            
            const ecriture = {
                ecriture_id: `ECR-2025-${state.nextEntryNumber.toString().padStart(5, '0')}`,
                numero_piece: data.numero_piece || '',
                date_ecriture: data.date || new Date().toISOString().split('T')[0],
                periode: (data.date || new Date().toISOString()).substring(0, 7),
                exercice: (data.date || new Date().toISOString()).substring(0, 4),
                libelle: data.libelle || regle.description,
                reference: data.reference || '',
                lignes: ecritureData.lignes,
                statut: 'validee',
                total_debit: totalDebit,
                total_credit: totalCredit,
                balance: 0,
                source: 'auto',
                module_origine: data.module || 'system',
                entity: data.entity || 'holding',
                created_at: new Date().toISOString(),
                created_by: 'system',
                validated_at: new Date().toISOString(),
                validated_by: 'system'
            };
            
            state.ecritures.unshift(ecriture);
            state.nextEntryNumber++;
            
            await calculateBalances();
            
            console.log(`✅ Écriture automatique créée: ${ecriture.ecriture_id}`);
            return ecriture;
            
        } catch (error) {
            console.error('❌ Erreur création écriture automatique:', error);
            return null;
        }
    }
    
    // Fonctions utilitaires
    function formatSwissAmount(amount) {
        return Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }
    
    function formatDate(dateString, format = 'DD.MM.YYYY') {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        if (format === 'DD.MM.YYYY') {
            return date.toLocaleDateString('fr-CH');
        }
        
        return dateString;
    }
    
    function showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    // Interface publique
    return {
        init,
        createAutomaticEntry,
        calculateEntryTotals,
        getBalances: () => state.balances,
        getEcritures: () => state.ecritures,
        // Nouvelles fonctions TVA 2025
        TVA_RATES,
        TVA_CODES,
        calculateVATFromNet,
        calculateVATFromGross,
        roundCHF,
        getVATRateForDate,
        autoDetectVATCode
    };
    
})();