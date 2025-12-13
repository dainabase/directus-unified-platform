/**
 * Plan Comptable PME Suisse - Modèle Käfer
 * ========================================
 * 
 * Implémentation complète du plan comptable PME suisse selon:
 * ✅ Plan comptable PME Käfer/Sterchi
 * ✅ Code des obligations suisse (CO)
 * ✅ Swiss GAAP FER 
 * ✅ Directives AFC 2025
 * 
 * Structure:
 * - Classe 1: Actifs (Assets)
 * - Classe 2: Passifs et Capitaux propres (Liabilities & Equity)
 * - Classe 3: Produits d'exploitation (Operating Income)
 * - Classe 4: Charges marchandises (Cost of Goods)
 * - Classe 5: Charges de personnel (Personnel Expenses)
 * - Classe 6: Autres charges d'exploitation (Operating Expenses)
 * - Classe 8: Produits et charges hors exploitation (Non-Operating)
 * - Classe 9: Clôture (Closing Accounts)
 * 
 * @version 2.0.0
 * @updated 2025-12-13
 * @standard PME Käfer/Sterchi
 */

/**
 * Plan comptable complet PME Suisse
 */
export const SWISS_CHART_OF_ACCOUNTS = {
    // ===== CLASSE 1 - ACTIFS =====
    "1": {
        name: "ACTIFS",
        description: "Biens et créances de l'entreprise",
        type: "asset",
        accounts: {
            // 10 - Liquidités
            "1000": {
                name: "Caisse CHF",
                description: "Espèces en francs suisses",
                type: "asset",
                nature: "debit",
                category: "liquidity",
                balanceSheet: true
            },
            "1001": {
                name: "Caisse EUR",
                description: "Espèces en euros", 
                type: "asset",
                nature: "debit",
                category: "liquidity",
                balanceSheet: true
            },
            "1002": {
                name: "Caisse USD",
                description: "Espèces en dollars américains",
                type: "asset", 
                nature: "debit",
                category: "liquidity",
                balanceSheet: true
            },
            
            "1020": {
                name: "Banque - Compte courant",
                description: "Comptes bancaires principaux",
                type: "asset",
                nature: "debit", 
                category: "liquidity",
                balanceSheet: true
            },
            "1021": {
                name: "Revolut Business Hypervisual",
                description: "Compte Revolut Hypervisual SA",
                parent: "1020",
                type: "asset",
                nature: "debit",
                category: "liquidity", 
                balanceSheet: true
            },
            "1022": {
                name: "Revolut Business Dainamics",
                description: "Compte Revolut Dainamics GmbH", 
                parent: "1020",
                type: "asset",
                nature: "debit",
                category: "liquidity",
                balanceSheet: true
            },
            "1023": {
                name: "Revolut Business Waveform",
                description: "Compte Revolut Waveform AG",
                parent: "1020", 
                type: "asset",
                nature: "debit",
                category: "liquidity",
                balanceSheet: true
            },
            "1024": {
                name: "Revolut Business Particule",
                description: "Compte Revolut Particule SÀRL",
                parent: "1020",
                type: "asset", 
                nature: "debit",
                category: "liquidity",
                balanceSheet: true
            },
            "1025": {
                name: "Revolut Business Holding",
                description: "Compte Revolut Holding Corp",
                parent: "1020",
                type: "asset",
                nature: "debit", 
                category: "liquidity",
                balanceSheet: true
            },
            
            "1030": {
                name: "Banque - Compte épargne",
                description: "Comptes d'épargne bancaires",
                type: "asset",
                nature: "debit",
                category: "liquidity", 
                balanceSheet: true
            },
            "1040": {
                name: "PostFinance", 
                description: "Comptes PostFinance",
                type: "asset",
                nature: "debit",
                category: "liquidity",
                balanceSheet: true
            },
            
            // 11 - Créances
            "1100": {
                name: "Créances clients",
                description: "Factures clients en attente de paiement",
                type: "asset",
                nature: "debit",
                category: "receivables",
                balanceSheet: true
            },
            "1101": {
                name: "Créances clients Hypervisual", 
                description: "Créances spécifiques Hypervisual SA",
                parent: "1100",
                type: "asset",
                nature: "debit",
                category: "receivables",
                balanceSheet: true
            },
            "1102": {
                name: "Créances clients Dainamics",
                description: "Créances spécifiques Dainamics GmbH",
                parent: "1100", 
                type: "asset",
                nature: "debit",
                category: "receivables",
                balanceSheet: true
            },
            "1103": {
                name: "Créances clients Waveform",
                description: "Créances spécifiques Waveform AG",
                parent: "1100",
                type: "asset",
                nature: "debit", 
                category: "receivables",
                balanceSheet: true
            },
            "1104": {
                name: "Créances clients Particule",
                description: "Créances spécifiques Particule SÀRL",
                parent: "1100",
                type: "asset", 
                nature: "debit",
                category: "receivables",
                balanceSheet: true
            },
            
            "1109": {
                name: "Ducroire",
                description: "Provision pour créances douteuses",
                type: "asset",
                nature: "credit", 
                category: "receivables",
                balanceSheet: true,
                isContra: true
            },
            
            "1120": {
                name: "Autres créances",
                description: "Créances diverses court terme",
                type: "asset",
                nature: "debit",
                category: "receivables", 
                balanceSheet: true
            },
            "1130": {
                name: "Créances envers actionnaires",
                description: "Prêts et avances actionnaires",
                type: "asset",
                nature: "debit",
                category: "receivables",
                balanceSheet: true
            },
            "1140": {
                name: "Créances envers entreprises liées", 
                description: "Créances groupe",
                type: "asset",
                nature: "debit",
                category: "receivables",
                balanceSheet: true
            },
            
            "1170": {
                name: "TVA à récupérer",
                description: "Impôt préalable déductible",
                type: "asset", 
                nature: "debit",
                category: "tax",
                balanceSheet: true
            },
            "1171": {
                name: "TVA décompte en cours",
                description: "TVA du décompte en préparation",
                type: "asset",
                nature: "debit",
                category: "tax", 
                balanceSheet: true
            },
            "1176": {
                name: "Impôt anticipé",
                description: "Impôt anticipé récupérable",
                type: "asset",
                nature: "debit",
                category: "tax",
                balanceSheet: true
            },
            "1180": {
                name: "Impôts payés d'avance", 
                description: "Acomptes impôts directs",
                type: "asset",
                nature: "debit",
                category: "tax",
                balanceSheet: true
            },
            
            // 12 - Stocks
            "1200": {
                name: "Stock marchandises",
                description: "Marchandises en stock",
                type: "asset",
                nature: "debit",
                category: "inventory", 
                balanceSheet: true
            },
            "1210": {
                name: "Stock matières premières",
                description: "Matières premières en stock",
                type: "asset",
                nature: "debit",
                category: "inventory",
                balanceSheet: true
            },
            "1220": {
                name: "Stock produits semi-finis",
                description: "Produits en cours de fabrication", 
                type: "asset",
                nature: "debit",
                category: "inventory",
                balanceSheet: true
            },
            "1230": {
                name: "Stock produits finis",
                description: "Produits terminés en stock",
                type: "asset",
                nature: "debit",
                category: "inventory", 
                balanceSheet: true
            },
            "1260": {
                name: "Stock matériel d'exploitation",
                description: "Matériel et fournitures",
                type: "asset",
                nature: "debit",
                category: "inventory",
                balanceSheet: true
            },
            "1280": {
                name: "Stock emballages",
                description: "Emballages récupérables", 
                type: "asset",
                nature: "debit",
                category: "inventory",
                balanceSheet: true
            },
            
            // 13 - Actifs transitoires
            "1300": {
                name: "Charges payées d'avance",
                description: "Charges comptabilisées mais non encore dues",
                type: "asset",
                nature: "debit", 
                category: "accruals",
                balanceSheet: true
            },
            "1301": {
                name: "Produits à recevoir", 
                description: "Produits acquis mais non encore facturés",
                type: "asset",
                nature: "debit",
                category: "accruals",
                balanceSheet: true
            },
            "1302": {
                name: "Intérêts courus actifs",
                description: "Intérêts acquis non encaissés",
                type: "asset", 
                nature: "debit",
                category: "accruals",
                balanceSheet: true
            },
            
            // 14 - Valeurs mobilières
            "1400": {
                name: "Valeurs mobilières CT",
                description: "Titres négociables court terme",
                type: "asset",
                nature: "debit",
                category: "securities", 
                balanceSheet: true
            },
            "1410": {
                name: "Actions propres",
                description: "Rachat d'actions propres",
                type: "asset",
                nature: "debit",
                category: "securities",
                balanceSheet: true
            },
            
            // 15 - Immobilisations corporelles
            "1500": {
                name: "Machines et équipements",
                description: "Machines et équipements industriels", 
                type: "asset",
                nature: "debit",
                category: "fixed_assets",
                balanceSheet: true
            },
            "1509": {
                name: "Amort. cumulés machines",
                description: "Amortissements cumulés machines",
                type: "asset",
                nature: "credit",
                category: "fixed_assets", 
                balanceSheet: true,
                isContra: true
            },
            
            "1510": {
                name: "Mobilier et installations",
                description: "Mobilier de bureau et installations",
                type: "asset",
                nature: "debit",
                category: "fixed_assets",
                balanceSheet: true
            },
            "1519": {
                name: "Amort. cumulés mobilier", 
                description: "Amortissements cumulés mobilier",
                type: "asset",
                nature: "credit",
                category: "fixed_assets",
                balanceSheet: true,
                isContra: true
            },
            
            "1520": {
                name: "Véhicules",
                description: "Véhicules de transport",
                type: "asset", 
                nature: "debit",
                category: "fixed_assets",
                balanceSheet: true
            },
            "1529": {
                name: "Amort. cumulés véhicules",
                description: "Amortissements cumulés véhicules",
                type: "asset",
                nature: "credit",
                category: "fixed_assets",
                balanceSheet: true, 
                isContra: true
            },
            
            "1530": {
                name: "Informatique",
                description: "Matériel informatique et logiciels",
                type: "asset",
                nature: "debit",
                category: "fixed_assets",
                balanceSheet: true
            },
            "1539": {
                name: "Amort. cumulés informatique",
                description: "Amortissements cumulés informatique", 
                type: "asset",
                nature: "credit",
                category: "fixed_assets",
                balanceSheet: true,
                isContra: true
            },
            
            "1540": {
                name: "Outillage",
                description: "Outils et équipements",
                type: "asset",
                nature: "debit",
                category: "fixed_assets", 
                balanceSheet: true
            },
            "1549": {
                name: "Amort. cumulés outillage",
                description: "Amortissements cumulés outillage",
                type: "asset",
                nature: "credit",
                category: "fixed_assets",
                balanceSheet: true,
                isContra: true
            },
            
            // 16 - Immobilisations incorporelles
            "1600": {
                name: "Brevets et licences", 
                description: "Droits de propriété intellectuelle",
                type: "asset",
                nature: "debit",
                category: "intangible_assets",
                balanceSheet: true
            },
            "1609": {
                name: "Amort. cumulés brevets",
                description: "Amortissements cumulés brevets",
                type: "asset",
                nature: "credit",
                category: "intangible_assets", 
                balanceSheet: true,
                isContra: true
            },
            
            "1610": {
                name: "Goodwill",
                description: "Survaleur d'acquisition",
                type: "asset",
                nature: "debit",
                category: "intangible_assets",
                balanceSheet: true
            },
            "1619": {
                name: "Amort. cumulés goodwill",
                description: "Amortissements cumulés goodwill", 
                type: "asset",
                nature: "credit",
                category: "intangible_assets",
                balanceSheet: true,
                isContra: true
            },
            
            "1620": {
                name: "Logiciels",
                description: "Logiciels développés ou acquis",
                type: "asset",
                nature: "debit",
                category: "intangible_assets",
                balanceSheet: true
            },
            "1629": {
                name: "Amort. cumulés logiciels", 
                description: "Amortissements cumulés logiciels",
                type: "asset",
                nature: "credit",
                category: "intangible_assets",
                balanceSheet: true,
                isContra: true
            },
            
            // 17 - Participations et prêts LT
            "1700": {
                name: "Participations",
                description: "Participations dans autres entreprises",
                type: "asset", 
                nature: "debit",
                category: "investments",
                balanceSheet: true
            },
            "1710": {
                name: "Prêts accordés LT",
                description: "Prêts long terme accordés",
                type: "asset",
                nature: "debit",
                category: "investments",
                balanceSheet: true
            },
            "1720": {
                name: "Dépôts de garantie",
                description: "Cautionnements et garanties versés", 
                type: "asset",
                nature: "debit",
                category: "investments",
                balanceSheet: true
            }
        }
    },
    
    // ===== CLASSE 2 - PASSIFS ET CAPITAUX PROPRES =====
    "2": {
        name: "PASSIFS ET CAPITAUX PROPRES",
        description: "Dettes et fonds propres de l'entreprise",
        type: "liability",
        accounts: {
            // 20 - Dettes à court terme
            "2000": {
                name: "Dettes fournisseurs", 
                description: "Factures fournisseurs à payer",
                type: "liability",
                nature: "credit",
                category: "payables",
                balanceSheet: true
            },
            "2001": {
                name: "Dettes fournisseurs CHF",
                description: "Fournisseurs en francs suisses",
                parent: "2000",
                type: "liability",
                nature: "credit",
                category: "payables", 
                balanceSheet: true
            },
            "2002": {
                name: "Dettes fournisseurs EUR",
                description: "Fournisseurs en euros",
                parent: "2000",
                type: "liability",
                nature: "credit",
                category: "payables",
                balanceSheet: true
            },
            
            "2030": {
                name: "Acomptes clients",
                description: "Avances reçues des clients", 
                type: "liability",
                nature: "credit",
                category: "payables",
                balanceSheet: true
            },
            
            "2050": {
                name: "Autres dettes CT",
                description: "Autres dettes court terme",
                type: "liability",
                nature: "credit",
                category: "payables",
                balanceSheet: true
            },
            "2060": {
                name: "Dettes envers actionnaires",
                description: "Comptes courants actionnaires", 
                type: "liability",
                nature: "credit",
                category: "payables",
                balanceSheet: true
            },
            "2070": {
                name: "Dettes envers entreprises liées",
                description: "Dettes groupe court terme",
                type: "liability",
                nature: "credit",
                category: "payables",
                balanceSheet: true
            },
            
            // 21 - Dettes bancaires et financières
            "2100": {
                name: "Dettes bancaires CT", 
                description: "Crédits bancaires court terme",
                type: "liability",
                nature: "credit",
                category: "financial_debt",
                balanceSheet: true
            },
            "2110": {
                name: "Découvert bancaire",
                description: "Soldes négatifs comptes bancaires",
                type: "liability",
                nature: "credit",
                category: "financial_debt",
                balanceSheet: true
            },
            "2120": {
                name: "Crédits de construction", 
                description: "Financement construction",
                type: "liability",
                nature: "credit",
                category: "financial_debt",
                balanceSheet: true
            },
            
            "2140": {
                name: "Emprunts obligataires CT",
                description: "Part court terme emprunts obligataires",
                type: "liability",
                nature: "credit",
                category: "financial_debt",
                balanceSheet: true
            },
            
            // 22 - Dettes fiscales et sociales
            "2200": {
                name: "TVA due", 
                description: "TVA à verser à l'AFC",
                type: "liability",
                nature: "credit",
                category: "tax",
                balanceSheet: true
            },
            "2201": {
                name: "TVA sur acomptes reçus",
                description: "TVA sur avances clients",
                type: "liability",
                nature: "credit",
                category: "tax",
                balanceSheet: true
            },
            "2202": {
                name: "TVA acquisition",
                description: "TVA acquisition intracommunautaire", 
                type: "liability",
                nature: "credit",
                category: "tax",
                balanceSheet: true
            },
            "2206": {
                name: "Impôt anticipé dû",
                description: "Impôt anticipé à verser",
                type: "liability",
                nature: "credit",
                category: "tax",
                balanceSheet: true
            },
            
            "2270": {
                name: "AVS/AI/APG/AC à payer",
                description: "Cotisations sociales dues", 
                type: "liability",
                nature: "credit",
                category: "social",
                balanceSheet: true
            },
            "2271": {
                name: "LPP à payer",
                description: "Cotisations prévoyance professionnelle",
                type: "liability",
                nature: "credit",
                category: "social",
                balanceSheet: true
            },
            "2272": {
                name: "LAA/LAAC à payer",
                description: "Assurance accidents", 
                type: "liability",
                nature: "credit",
                category: "social",
                balanceSheet: true
            },
            "2273": {
                name: "IJM à payer",
                description: "Indemnités journalières maladie",
                type: "liability",
                nature: "credit",
                category: "social",
                balanceSheet: true
            },
            "2274": {
                name: "AFam à payer",
                description: "Allocations familiales", 
                type: "liability",
                nature: "credit",
                category: "social",
                balanceSheet: true
            },
            
            "2279": {
                name: "Impôts dus",
                description: "Impôts directs à payer",
                type: "liability",
                nature: "credit",
                category: "tax",
                balanceSheet: true
            },
            
            // 23 - Passifs transitoires
            "2300": {
                name: "Charges à payer", 
                description: "Charges dues non encore facturées",
                type: "liability",
                nature: "credit",
                category: "accruals",
                balanceSheet: true
            },
            "2301": {
                name: "Produits reçus d'avance",
                description: "Produits encaissés d'avance",
                type: "liability",
                nature: "credit",
                category: "accruals",
                balanceSheet: true
            },
            "2302": {
                name: "Intérêts courus passifs", 
                description: "Intérêts dus non encore payés",
                type: "liability",
                nature: "credit",
                category: "accruals",
                balanceSheet: true
            },
            
            // 24 - Provisions
            "2400": {
                name: "Provisions pour garanties",
                description: "Risques sur garanties produits",
                type: "liability",
                nature: "credit",
                category: "provisions",
                balanceSheet: true
            },
            "2410": {
                name: "Provisions pour restructuration", 
                description: "Coûts de restructuration",
                type: "liability",
                nature: "credit",
                category: "provisions",
                balanceSheet: true
            },
            "2420": {
                name: "Provisions pour litiges",
                description: "Risques de procès et litiges",
                type: "liability",
                nature: "credit",
                category: "provisions",
                balanceSheet: true
            },
            "2430": {
                name: "Provisions pour impôts", 
                description: "Risque fiscal estimé",
                type: "liability",
                nature: "credit",
                category: "provisions",
                balanceSheet: true
            },
            "2490": {
                name: "Autres provisions",
                description: "Autres risques et charges",
                type: "liability",
                nature: "credit",
                category: "provisions",
                balanceSheet: true
            },
            
            // 25 - Dettes à long terme
            "2500": {
                name: "Dettes bancaires LT", 
                description: "Crédits bancaires long terme",
                type: "liability",
                nature: "credit",
                category: "long_term_debt",
                balanceSheet: true
            },
            "2510": {
                name: "Emprunts hypothécaires",
                description: "Hypothèques sur immeubles",
                type: "liability",
                nature: "credit",
                category: "long_term_debt",
                balanceSheet: true
            },
            "2520": {
                name: "Emprunts obligataires", 
                description: "Obligations émises",
                type: "liability",
                nature: "credit",
                category: "long_term_debt",
                balanceSheet: true
            },
            "2530": {
                name: "Dettes de leasing",
                description: "Engagements de leasing financier",
                type: "liability",
                nature: "credit",
                category: "long_term_debt",
                balanceSheet: true
            },
            "2540": {
                name: "Prêts actionnaires LT", 
                description: "Prêts long terme actionnaires",
                type: "liability",
                nature: "credit",
                category: "long_term_debt",
                balanceSheet: true
            },
            
            // 28 - Capitaux propres
            "2800": {
                name: "Capital social",
                description: "Capital-actions nominal",
                type: "equity",
                nature: "credit",
                category: "share_capital",
                balanceSheet: true
            },
            "2810": {
                name: "Capital-actions série A", 
                description: "Actions ordinaires série A",
                parent: "2800",
                type: "equity",
                nature: "credit",
                category: "share_capital",
                balanceSheet: true
            },
            "2811": {
                name: "Capital-actions série B",
                description: "Actions ordinaires série B",
                parent: "2800",
                type: "equity",
                nature: "credit",
                category: "share_capital", 
                balanceSheet: true
            },
            "2820": {
                name: "Actions de priorité",
                description: "Actions avec droits privilégiés",
                parent: "2800",
                type: "equity",
                nature: "credit",
                category: "share_capital",
                balanceSheet: true
            },
            
            "2840": {
                name: "Capital non versé",
                description: "Capital souscrit non libéré", 
                type: "equity",
                nature: "debit",
                category: "share_capital",
                balanceSheet: true,
                isContra: true
            },
            
            "2850": {
                name: "Réserves légales",
                description: "Réserves générales obligatoires",
                type: "equity",
                nature: "credit",
                category: "reserves",
                balanceSheet: true
            },
            "2851": {
                name: "Réserves statutaires", 
                description: "Réserves prévues par statuts",
                type: "equity",
                nature: "credit",
                category: "reserves",
                balanceSheet: true
            },
            "2860": {
                name: "Réserves libres",
                description: "Réserves facultatives",
                type: "equity",
                nature: "credit",
                category: "reserves",
                balanceSheet: true
            },
            "2870": {
                name: "Prime d'émission", 
                description: "Surplus versé sur actions",
                type: "equity",
                nature: "credit",
                category: "reserves",
                balanceSheet: true
            },
            
            "2900": {
                name: "Bénéfice/Perte reporté",
                description: "Résultats reportés exercices antérieurs",
                type: "equity",
                nature: "credit",
                category: "retained_earnings",
                balanceSheet: true
            },
            "2991": {
                name: "Bénéfice de l'exercice", 
                description: "Bénéfice exercice en cours",
                type: "equity",
                nature: "credit",
                category: "current_earnings",
                balanceSheet: true
            },
            "2992": {
                name: "Perte de l'exercice",
                description: "Perte exercice en cours",
                type: "equity",
                nature: "debit",
                category: "current_earnings",
                balanceSheet: true
            }
        }
    },
    
    // ===== CLASSE 3 - PRODUITS D'EXPLOITATION =====
    "3": {
        name: "PRODUITS D'EXPLOITATION",
        description: "Revenus de l'activité principale", 
        type: "revenue",
        accounts: {
            // 30 - Ventes marchandises
            "3000": {
                name: "Ventes marchandises Suisse",
                description: "Ventes sur territoire suisse",
                type: "revenue",
                nature: "credit",
                category: "sales",
                incomeStatement: true
            },
            "3001": {
                name: "Ventes marchandises Export",
                description: "Exportations hors Suisse", 
                type: "revenue",
                nature: "credit",
                category: "sales",
                incomeStatement: true
            },
            "3002": {
                name: "Ventes marchandises UE",
                description: "Ventes Union Européenne",
                type: "revenue",
                nature: "credit",
                category: "sales",
                incomeStatement: true
            },
            
            "3005": {
                name: "Remises accordées",
                description: "Rabais et remises clients", 
                type: "revenue",
                nature: "debit",
                category: "sales",
                incomeStatement: true,
                isContra: true
            },
            "3006": {
                name: "Escomptes accordés",
                description: "Remises pour paiement anticipé",
                type: "revenue",
                nature: "debit",
                category: "sales",
                incomeStatement: true,
                isContra: true
            },
            "3008": {
                name: "Retours de marchandises", 
                description: "Marchandises retournées",
                type: "revenue",
                nature: "debit",
                category: "sales",
                incomeStatement: true,
                isContra: true
            },
            "3009": {
                name: "Variation stocks PF",
                description: "Variation stocks produits finis",
                type: "revenue",
                nature: "credit",
                category: "sales",
                incomeStatement: true
            },
            
            // 32 - Prestations de services
            "3200": {
                name: "Prestations de services", 
                description: "Services rendus aux clients",
                type: "revenue",
                nature: "credit",
                category: "services",
                incomeStatement: true
            },
            "3201": {
                name: "Prestations développement",
                description: "Services développement logiciel",
                type: "revenue",
                nature: "credit",
                category: "services",
                incomeStatement: true
            },
            "3202": {
                name: "Prestations consulting", 
                description: "Services conseil et expertise",
                type: "revenue",
                nature: "credit",
                category: "services",
                incomeStatement: true
            },
            "3203": {
                name: "Prestations formation",
                description: "Formation et accompagnement",
                type: "revenue",
                nature: "credit",
                category: "services",
                incomeStatement: true
            },
            "3204": {
                name: "Prestations maintenance", 
                description: "Maintenance et support technique",
                type: "revenue",
                nature: "credit",
                category: "services",
                incomeStatement: true
            },
            "3205": {
                name: "Prestations hébergement",
                description: "Services cloud et hébergement",
                type: "revenue",
                nature: "credit",
                category: "services",
                incomeStatement: true
            },
            
            "3210": {
                name: "Produits de licences", 
                description: "Revenus licences logicielles",
                type: "revenue",
                nature: "credit",
                category: "licenses",
                incomeStatement: true
            },
            "3211": {
                name: "Royalties",
                description: "Droits d'utilisation et redevances",
                type: "revenue",
                nature: "credit",
                category: "licenses",
                incomeStatement: true
            },
            
            // 34 - Autres produits d'exploitation
            "3400": {
                name: "Commissions reçues", 
                description: "Commissions et courtages",
                type: "revenue",
                nature: "credit",
                category: "other_operating",
                incomeStatement: true
            },
            "3410": {
                name: "Subventions d'exploitation",
                description: "Aides publiques reçues",
                type: "revenue",
                nature: "credit",
                category: "other_operating",
                incomeStatement: true
            },
            "3420": {
                name: "Produits accessoires", 
                description: "Revenus annexes",
                type: "revenue",
                nature: "credit",
                category: "other_operating",
                incomeStatement: true
            },
            "3430": {
                name: "Dégrèvement provisions",
                description: "Reprises provisions excédentaires",
                type: "revenue",
                nature: "credit",
                category: "other_operating",
                incomeStatement: true
            }
        }
    },
    
    // ===== CLASSE 4 - CHARGES MARCHANDISES =====
    "4": {
        name: "CHARGES MARCHANDISES",
        description: "Coûts des biens vendus", 
        type: "expense",
        accounts: {
            // 40 - Achats marchandises
            "4000": {
                name: "Achats marchandises",
                description: "Achats pour revente",
                type: "expense",
                nature: "debit",
                category: "purchases",
                incomeStatement: true
            },
            "4001": {
                name: "Achats matières premières",
                description: "Matières premières production", 
                type: "expense",
                nature: "debit",
                category: "purchases",
                incomeStatement: true
            },
            "4002": {
                name: "Achats composants",
                description: "Composants et sous-ensembles",
                type: "expense",
                nature: "debit",
                category: "purchases",
                incomeStatement: true
            },
            "4003": {
                name: "Achats emballages", 
                description: "Emballages et conditionnements",
                type: "expense",
                nature: "debit",
                category: "purchases",
                incomeStatement: true
            },
            
            "4005": {
                name: "Remises obtenues",
                description: "Rabais et remises fournisseurs",
                type: "expense",
                nature: "credit",
                category: "purchases",
                incomeStatement: true,
                isContra: true
            },
            "4006": {
                name: "Escomptes obtenus", 
                description: "Remises paiement anticipé",
                type: "expense",
                nature: "credit",
                category: "purchases",
                incomeStatement: true,
                isContra: true
            },
            "4008": {
                name: "Retours sur achats",
                description: "Marchandises retournées fournisseurs",
                type: "expense",
                nature: "credit",
                category: "purchases",
                incomeStatement: true,
                isContra: true
            },
            "4009": {
                name: "Variation stocks MP", 
                description: "Variation stocks matières premières",
                type: "expense",
                nature: "debit",
                category: "purchases",
                incomeStatement: true
            },
            
            // 41 - Frais d'achat
            "4100": {
                name: "Transports sur achats",
                description: "Frais transport marchandises",
                type: "expense",
                nature: "debit",
                category: "purchase_costs",
                incomeStatement: true
            },
            "4110": {
                name: "Assurances sur achats", 
                description: "Assurances transport",
                type: "expense",
                nature: "debit",
                category: "purchase_costs",
                incomeStatement: true
            },
            "4120": {
                name: "Commissions sur achats",
                description: "Commissions et courtages",
                type: "expense",
                nature: "debit",
                category: "purchase_costs",
                incomeStatement: true
            },
            "4130": {
                name: "Frais de douane", 
                description: "Droits douane et formalités",
                type: "expense",
                nature: "debit",
                category: "purchase_costs",
                incomeStatement: true
            },
            
            // 42 - Services et travaux
            "4200": {
                name: "Achats prestations tiers",
                description: "Prestations sous-traitées",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "4201": {
                name: "Achats développement", 
                description: "Développement externalisé",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "4202": {
                name: "Achats consulting",
                description: "Services conseil externes",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "4210": {
                name: "Travaux façonnage", 
                description: "Travaux de façonnage",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "4220": {
                name: "Sous-traitance générale",
                description: "Sous-traitance diverse",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            }
        }
    },
    
    // ===== CLASSE 5 - CHARGES DE PERSONNEL =====
    "5": {
        name: "CHARGES DE PERSONNEL",
        description: "Coûts liés au personnel", 
        type: "expense",
        accounts: {
            // 50 - Salaires et rémunérations
            "5000": {
                name: "Salaires",
                description: "Salaires bruts du personnel",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5001": {
                name: "Salaires cadres",
                description: "Rémunérations cadres dirigeants", 
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5002": {
                name: "Salaires employés",
                description: "Salaires employés administratifs",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5003": {
                name: "Salaires ouvriers", 
                description: "Salaires personnel production",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5004": {
                name: "Salaires apprentis",
                description: "Rémunérations apprentis",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            
            "5010": {
                name: "Heures supplémentaires", 
                description: "Majorations heures supplémentaires",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5020": {
                name: "Primes et gratifications",
                description: "Primes performance et gratifications",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5030": {
                name: "13ème salaire", 
                description: "13ème mois et gratifications annuelles",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5040": {
                name: "Indemnités",
                description: "Indemnités diverses personnel",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            "5050": {
                name: "Commissions personnel", 
                description: "Commissions vendeurs",
                type: "expense",
                nature: "debit",
                category: "salaries",
                incomeStatement: true
            },
            
            // 51 - Charges sociales patronales
            "5700": {
                name: "Charges sociales patronales",
                description: "Cotisations patronales totales",
                type: "expense",
                nature: "debit",
                category: "social_charges",
                incomeStatement: true
            },
            "5710": {
                name: "AVS/AI/APG/AC patronales", 
                description: "Assurances sociales fédérales",
                type: "expense",
                nature: "debit",
                category: "social_charges",
                incomeStatement: true
            },
            "5720": {
                name: "LPP patronale",
                description: "Prévoyance professionnelle",
                type: "expense",
                nature: "debit",
                category: "social_charges",
                incomeStatement: true
            },
            "5730": {
                name: "LAA/LAAC patronales", 
                description: "Assurance accidents",
                type: "expense",
                nature: "debit",
                category: "social_charges",
                incomeStatement: true
            },
            "5740": {
                name: "IJM patronales",
                description: "Indemnités journalières maladie",
                type: "expense",
                nature: "debit",
                category: "social_charges",
                incomeStatement: true
            },
            "5750": {
                name: "AFam patronales", 
                description: "Allocations familiales",
                type: "expense",
                nature: "debit",
                category: "social_charges",
                incomeStatement: true
            },
            
            // 58 - Autres charges de personnel
            "5800": {
                name: "Frais de personnel",
                description: "Frais divers personnel",
                type: "expense",
                nature: "debit",
                category: "other_personnel",
                incomeStatement: true
            },
            "5810": {
                name: "Formation personnel", 
                description: "Formation et perfectionnement",
                type: "expense",
                nature: "debit",
                category: "other_personnel",
                incomeStatement: true
            },
            "5820": {
                name: "Frais de recrutement",
                description: "Recrutement et sélection",
                type: "expense",
                nature: "debit",
                category: "other_personnel",
                incomeStatement: true
            },
            "5830": {
                name: "Frais de déplacement", 
                description: "Voyages et déplacements",
                type: "expense",
                nature: "debit",
                category: "other_personnel",
                incomeStatement: true
            },
            "5840": {
                name: "Frais de représentation",
                description: "Repas et représentation",
                type: "expense",
                nature: "debit",
                category: "other_personnel",
                incomeStatement: true
            },
            "5850": {
                name: "Vêtements de travail", 
                description: "EPI et uniformes",
                type: "expense",
                nature: "debit",
                category: "other_personnel",
                incomeStatement: true
            },
            "5860": {
                name: "Médecine du travail",
                description: "Examens et prévention",
                type: "expense",
                nature: "debit",
                category: "other_personnel",
                incomeStatement: true
            }
        }
    },
    
    // ===== CLASSE 6 - AUTRES CHARGES D'EXPLOITATION =====
    "6": {
        name: "AUTRES CHARGES D'EXPLOITATION",
        description: "Frais généraux d'exploitation", 
        type: "expense",
        accounts: {
            // 60 - Loyers et charges locatives
            "6000": {
                name: "Loyer",
                description: "Loyers bureaux et locaux",
                type: "expense",
                nature: "debit",
                category: "rent",
                incomeStatement: true
            },
            "6010": {
                name: "Charges locatives",
                description: "Charges et frais accessoires", 
                type: "expense",
                nature: "debit",
                category: "rent",
                incomeStatement: true
            },
            "6020": {
                name: "Location mobilier",
                description: "Leasing mobilier et équipements",
                type: "expense",
                nature: "debit",
                category: "rent",
                incomeStatement: true
            },
            "6030": {
                name: "Location véhicules", 
                description: "Leasing et location véhicules",
                type: "expense",
                nature: "debit",
                category: "rent",
                incomeStatement: true
            },
            
            // 61 - Entretien et maintenance
            "6100": {
                name: "Entretien locaux",
                description: "Maintenance bâtiments",
                type: "expense",
                nature: "debit",
                category: "maintenance",
                incomeStatement: true
            },
            "6110": {
                name: "Entretien machines", 
                description: "Maintenance équipements",
                type: "expense",
                nature: "debit",
                category: "maintenance",
                incomeStatement: true
            },
            "6120": {
                name: "Entretien véhicules",
                description: "Maintenance parc automobile",
                type: "expense",
                nature: "debit",
                category: "maintenance",
                incomeStatement: true
            },
            "6130": {
                name: "Entretien informatique", 
                description: "Maintenance matériel IT",
                type: "expense",
                nature: "debit",
                category: "maintenance",
                incomeStatement: true
            },
            "6140": {
                name: "Nettoyage",
                description: "Nettoyage et hygiène",
                type: "expense",
                nature: "debit",
                category: "maintenance",
                incomeStatement: true
            },
            
            // 62 - Frais de véhicules et transport
            "6200": {
                name: "Frais de véhicules", 
                description: "Carburant et frais automobiles",
                type: "expense",
                nature: "debit",
                category: "transport",
                incomeStatement: true
            },
            "6210": {
                name: "Carburant",
                description: "Essence et gasoil",
                type: "expense",
                nature: "debit",
                category: "transport",
                incomeStatement: true
            },
            "6220": {
                name: "Transports marchandises", 
                description: "Expéditions et livraisons",
                type: "expense",
                nature: "debit",
                category: "transport",
                incomeStatement: true
            },
            "6230": {
                name: "Frais de déplacement",
                description: "Voyages et missions",
                type: "expense",
                nature: "debit",
                category: "transport",
                incomeStatement: true
            },
            
            // 63 - Assurances
            "6300": {
                name: "Assurances", 
                description: "Primes assurances générales",
                type: "expense",
                nature: "debit",
                category: "insurance",
                incomeStatement: true
            },
            "6310": {
                name: "Assurance responsabilité civile",
                description: "RC entreprise",
                type: "expense",
                nature: "debit",
                category: "insurance",
                incomeStatement: true
            },
            "6320": {
                name: "Assurance véhicules", 
                description: "RC et casco véhicules",
                type: "expense",
                nature: "debit",
                category: "insurance",
                incomeStatement: true
            },
            "6330": {
                name: "Assurance bâtiments",
                description: "Assurance immobilière",
                type: "expense",
                nature: "debit",
                category: "insurance",
                incomeStatement: true
            },
            "6340": {
                name: "Assurance machines", 
                description: "Assurance équipements",
                type: "expense",
                nature: "debit",
                category: "insurance",
                incomeStatement: true
            },
            
            // 64 - Énergie et fournitures
            "6400": {
                name: "Électricité",
                description: "Consommation électrique",
                type: "expense",
                nature: "debit",
                category: "utilities",
                incomeStatement: true
            },
            "6410": {
                name: "Chauffage", 
                description: "Gaz, mazout, chauffage",
                type: "expense",
                nature: "debit",
                category: "utilities",
                incomeStatement: true
            },
            "6420": {
                name: "Eau",
                description: "Consommation eau",
                type: "expense",
                nature: "debit",
                category: "utilities",
                incomeStatement: true
            },
            "6450": {
                name: "Fournitures bureau", 
                description: "Papeterie et fournitures",
                type: "expense",
                nature: "debit",
                category: "supplies",
                incomeStatement: true
            },
            "6460": {
                name: "Fournitures atelier",
                description: "Outillage et consommables",
                type: "expense",
                nature: "debit",
                category: "supplies",
                incomeStatement: true
            },
            
            // 65 - Services extérieurs
            "6500": {
                name: "Services extérieurs", 
                description: "Services tiers généraux",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6501": {
                name: "Téléphone, internet",
                description: "Télécommunications",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6502": {
                name: "Honoraires d'avocat", 
                description: "Frais juridiques",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6503": {
                name: "Honoraires fiduciaire",
                description: "Comptabilité et révision",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6504": {
                name: "Honoraires notaire", 
                description: "Actes et formalités",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6505": {
                name: "Honoraires médecin",
                description: "Examens médicaux",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6506": {
                name: "Honoraires architecte", 
                description: "Services architecture",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6507": {
                name: "Honoraires ingénieur",
                description: "Services techniques",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            "6508": {
                name: "Autres honoraires", 
                description: "Autres services professionnels",
                type: "expense",
                nature: "debit",
                category: "services",
                incomeStatement: true
            },
            
            "6520": {
                name: "Frais bancaires",
                description: "Commissions et frais bancaires",
                type: "expense",
                nature: "debit",
                category: "financial",
                incomeStatement: true
            },
            "6521": {
                name: "Frais de change", 
                description: "Commissions change devises",
                type: "expense",
                nature: "debit",
                category: "financial",
                incomeStatement: true
            },
            
            "6570": {
                name: "Frais informatiques",
                description: "Licences et services IT",
                type: "expense",
                nature: "debit",
                category: "it",
                incomeStatement: true
            },
            "6571": {
                name: "Licences logiciels", 
                description: "Abonnements logiciels",
                type: "expense",
                nature: "debit",
                category: "it",
                incomeStatement: true
            },
            "6572": {
                name: "Hébergement web",
                description: "Serveurs et cloud",
                type: "expense",
                nature: "debit",
                category: "it",
                incomeStatement: true
            },
            "6573": {
                name: "Développement externe", 
                description: "Prestations développement",
                type: "expense",
                nature: "debit",
                category: "it",
                incomeStatement: true
            },
            
            // 66 - Frais commerciaux
            "6600": {
                name: "Publicité, marketing",
                description: "Frais publicitaires",
                type: "expense",
                nature: "debit",
                category: "marketing",
                incomeStatement: true
            },
            "6610": {
                name: "Documentation technique", 
                description: "Manuels et documentation",
                type: "expense",
                nature: "debit",
                category: "marketing",
                incomeStatement: true
            },
            "6620": {
                name: "Foires et expositions",
                description: "Participation salons",
                type: "expense",
                nature: "debit",
                category: "marketing",
                incomeStatement: true
            },
            "6630": {
                name: "Cadeaux d'affaires", 
                description: "Cadeaux clients",
                type: "expense",
                nature: "debit",
                category: "marketing",
                incomeStatement: true
            },
            
            // 67 - Frais administratifs
            "6700": {
                name: "Frais administratifs",
                description: "Frais administratifs généraux",
                type: "expense",
                nature: "debit",
                category: "admin",
                incomeStatement: true
            },
            "6710": {
                name: "Frais de justice", 
                description: "Procédures et contentieux",
                type: "expense",
                nature: "debit",
                category: "admin",
                incomeStatement: true
            },
            "6720": {
                name: "Pénalités et amendes",
                description: "Sanctions administratives",
                type: "expense",
                nature: "debit",
                category: "admin",
                incomeStatement: true
            },
            
            // 68 - Dotations aux amortissements
            "6800": {
                name: "Amortissements", 
                description: "Dotations amortissements",
                type: "expense",
                nature: "debit",
                category: "depreciation",
                incomeStatement: true
            },
            "6810": {
                name: "Amort. mobilier",
                description: "Amortissement mobilier",
                type: "expense",
                nature: "debit",
                category: "depreciation",
                incomeStatement: true
            },
            "6820": {
                name: "Amort. véhicules", 
                description: "Amortissement véhicules",
                type: "expense",
                nature: "debit",
                category: "depreciation",
                incomeStatement: true
            },
            "6830": {
                name: "Amort. informatique",
                description: "Amortissement matériel IT",
                type: "expense",
                nature: "debit",
                category: "depreciation",
                incomeStatement: true
            },
            "6840": {
                name: "Amort. machines", 
                description: "Amortissement machines",
                type: "expense",
                nature: "debit",
                category: "depreciation",
                incomeStatement: true
            },
            "6850": {
                name: "Amort. brevets",
                description: "Amortissement brevets",
                type: "expense",
                nature: "debit",
                category: "depreciation",
                incomeStatement: true
            },
            
            // 69 - Provisions et pertes
            "6900": {
                name: "Dotations provisions", 
                description: "Constitutions provisions",
                type: "expense",
                nature: "debit",
                category: "provisions",
                incomeStatement: true
            },
            "6910": {
                name: "Pertes sur créances",
                description: "Créances irrécouvrables",
                type: "expense",
                nature: "debit",
                category: "bad_debts",
                incomeStatement: true
            },
            "6920": {
                name: "Différences de change", 
                description: "Pertes de change",
                type: "expense",
                nature: "debit",
                category: "exchange_loss",
                incomeStatement: true
            }
        }
    },
    
    // ===== CLASSE 8 - PRODUITS ET CHARGES HORS EXPLOITATION =====
    "8": {
        name: "PRODUITS ET CHARGES HORS EXPLOITATION",
        description: "Éléments financiers et exceptionnels",
        type: "non_operating",
        accounts: {
            // 80 - Produits financiers
            "8000": {
                name: "Produits financiers", 
                description: "Revenus financiers totaux",
                type: "revenue",
                nature: "credit",
                category: "financial_income",
                incomeStatement: true
            },
            "8010": {
                name: "Intérêts actifs",
                description: "Intérêts sur placements",
                type: "revenue",
                nature: "credit",
                category: "financial_income",
                incomeStatement: true
            },
            "8020": {
                name: "Dividendes reçus", 
                description: "Dividendes participations",
                type: "revenue",
                nature: "credit",
                category: "financial_income",
                incomeStatement: true
            },
            "8030": {
                name: "Gains de change",
                description: "Profits sur devises",
                type: "revenue",
                nature: "credit",
                category: "financial_income",
                incomeStatement: true
            },
            "8040": {
                name: "Plus-values mobilières", 
                description: "Gains sur cessions titres",
                type: "revenue",
                nature: "credit",
                category: "financial_income",
                incomeStatement: true
            },
            
            // 81 - Charges financières
            "8100": {
                name: "Charges financières",
                description: "Frais financiers totaux",
                type: "expense",
                nature: "debit",
                category: "financial_expense",
                incomeStatement: true
            },
            "8110": {
                name: "Intérêts passifs", 
                description: "Intérêts sur emprunts",
                type: "expense",
                nature: "debit",
                category: "financial_expense",
                incomeStatement: true
            },
            "8120": {
                name: "Escomptes accordés",
                description: "Remises financières clients",
                type: "expense",
                nature: "debit",
                category: "financial_expense",
                incomeStatement: true
            },
            "8140": {
                name: "Moins-values mobilières", 
                description: "Pertes sur cessions titres",
                type: "expense",
                nature: "debit",
                category: "financial_expense",
                incomeStatement: true
            },
            
            // 85 - Produits exceptionnels
            "8500": {
                name: "Produits exceptionnels",
                description: "Revenus exceptionnels",
                type: "revenue",
                nature: "credit",
                category: "exceptional",
                incomeStatement: true
            },
            "8510": {
                name: "Plus-values sur cessions", 
                description: "Plus-values immobilisations",
                type: "revenue",
                nature: "credit",
                category: "exceptional",
                incomeStatement: true
            },
            "8520": {
                name: "Subventions d'équipement",
                description: "Aides investissement",
                type: "revenue",
                nature: "credit",
                category: "exceptional",
                incomeStatement: true
            },
            "8530": {
                name: "Reprises provisions exceptionnelles", 
                description: "Dégagements provisions",
                type: "revenue",
                nature: "credit",
                category: "exceptional",
                incomeStatement: true
            },
            
            // 86 - Charges exceptionnelles
            "8600": {
                name: "Charges exceptionnelles",
                description: "Dépenses exceptionnelles",
                type: "expense",
                nature: "debit",
                category: "exceptional",
                incomeStatement: true
            },
            "8610": {
                name: "Moins-values sur cessions", 
                description: "Moins-values immobilisations",
                type: "expense",
                nature: "debit",
                category: "exceptional",
                incomeStatement: true
            },
            "8620": {
                name: "Provisions exceptionnelles",
                description: "Dotations provisions exceptionnelles",
                type: "expense",
                nature: "debit",
                category: "exceptional",
                incomeStatement: true
            },
            
            // 87 - Participation et impôts
            "8700": {
                name: "Participation bénéfices", 
                description: "Participation personnel",
                type: "expense",
                nature: "debit",
                category: "taxes",
                incomeStatement: true
            },
            "8710": {
                name: "Impôts sur bénéfices",
                description: "Impôts directs",
                type: "expense",
                nature: "debit",
                category: "taxes",
                incomeStatement: true
            }
        }
    },
    
    // ===== CLASSE 9 - COMPTES DE CLÔTURE =====
    "9": {
        name: "COMPTES DE CLÔTURE",
        description: "Comptes de regroupement", 
        type: "closing",
        accounts: {
            "9000": {
                name: "Compte de résultat",
                description: "Regroupement charges et produits",
                type: "closing",
                nature: "both",
                category: "closing",
                incomeStatement: false
            },
            "9100": {
                name: "Compte bilan",
                description: "Regroupement actifs et passifs",
                type: "closing", 
                nature: "both",
                category: "closing",
                balanceSheet: false
            }
        }
    }
};

/**
 * Classe principale de gestion du plan comptable
 */
export class ChartOfAccountsCH {
    
    constructor() {
        this.chart = SWISS_CHART_OF_ACCOUNTS;
        this.cache = new Map();
        console.log('📊 Plan comptable PME Suisse initialisé');
    }
    
    /**
     * Obtient un compte par son numéro
     */
    getAccount(accountNumber) {
        if (this.cache.has(accountNumber)) {
            return this.cache.get(accountNumber);
        }
        
        for (const [classNumber, classData] of Object.entries(this.chart)) {
            if (classData.accounts && classData.accounts[accountNumber]) {
                const account = {
                    ...classData.accounts[accountNumber],
                    number: accountNumber,
                    class: classNumber,
                    className: classData.name
                };
                this.cache.set(accountNumber, account);
                return account;
            }
        }
        
        return null;
    }
    
    /**
     * Recherche des comptes par critères
     */
    searchAccounts(criteria = {}) {
        const { name, category, type, nature, class: classNumber } = criteria;
        const results = [];
        
        for (const [clsNum, classData] of Object.entries(this.chart)) {
            if (classNumber && clsNum !== classNumber) continue;
            
            if (classData.accounts) {
                for (const [accNum, account] of Object.entries(classData.accounts)) {
                    let matches = true;
                    
                    if (name && !account.name.toLowerCase().includes(name.toLowerCase())) {
                        matches = false;
                    }
                    if (category && account.category !== category) {
                        matches = false;
                    }
                    if (type && account.type !== type) {
                        matches = false;
                    }
                    if (nature && account.nature !== nature) {
                        matches = false;
                    }
                    
                    if (matches) {
                        results.push({
                            ...account,
                            number: accNum,
                            class: clsNum,
                            className: classData.name
                        });
                    }
                }
            }
        }
        
        return results.sort((a, b) => a.number.localeCompare(b.number));
    }
    
    /**
     * Obtient tous les comptes d'une classe
     */
    getAccountsByClass(classNumber) {
        const classData = this.chart[classNumber];
        if (!classData || !classData.accounts) return [];
        
        return Object.entries(classData.accounts).map(([accNum, account]) => ({
            ...account,
            number: accNum,
            class: classNumber,
            className: classData.name
        })).sort((a, b) => a.number.localeCompare(b.number));
    }
    
    /**
     * Obtient les comptes par catégorie
     */
    getAccountsByCategory(category) {
        return this.searchAccounts({ category });
    }
    
    /**
     * Valide l'existence d'un compte
     */
    isValidAccount(accountNumber) {
        return this.getAccount(accountNumber) !== null;
    }
    
    /**
     * Obtient la nature d'un compte
     */
    getAccountNature(accountNumber) {
        const account = this.getAccount(accountNumber);
        return account ? account.nature : null;
    }
    
    /**
     * Détermine si un compte est au bilan
     */
    isBalanceSheetAccount(accountNumber) {
        const account = this.getAccount(accountNumber);
        return account ? account.balanceSheet === true : false;
    }
    
    /**
     * Détermine si un compte est au compte de résultat
     */
    isIncomeStatementAccount(accountNumber) {
        const account = this.getAccount(accountNumber);
        return account ? account.incomeStatement === true : false;
    }
    
    /**
     * Obtient les comptes de TVA
     */
    getTVAAccounts() {
        return this.searchAccounts({ category: 'tax' });
    }
    
    /**
     * Obtient les comptes de liquidités
     */
    getLiquidityAccounts() {
        return this.searchAccounts({ category: 'liquidity' });
    }
    
    /**
     * Obtient les comptes clients/fournisseurs
     */
    getPayableReceivableAccounts() {
        const receivables = this.searchAccounts({ category: 'receivables' });
        const payables = this.searchAccounts({ category: 'payables' });
        return { receivables, payables };
    }
    
    /**
     * Mapping vers codes AFC pour Formulaire 200
     */
    mapToAFCCode(accountNumber, transactionType = 'sale') {
        const account = this.getAccount(accountNumber);
        if (!account) return null;
        
        // Mapping spécifique selon la catégorie et le type
        const mappingRules = {
            // Ventes - classe 3
            'sales': 'cifra302',        // Taux normal 8.1%
            'services': 'cifra302',     // Services standard
            'licenses': 'cifra302',     // Licences
            
            // Achats - classe 4
            'purchases': 'cifra400',    // Impôt préalable
            
            // Investissements
            'fixed_assets': 'cifra405'  // Investissements
        };
        
        // Règles spéciales par compte
        const specificMappings = {
            '3001': 'cifra221',    // Exportations
            '3002': 'cifra221',    // UE
            '1500': 'cifra405',    // Machines (investissement)
            '1510': 'cifra405',    // Mobilier (investissement)
            '1520': 'cifra405',    // Véhicules (investissement)
            '1530': 'cifra405'     // Informatique (investissement)
        };
        
        // Vérifier mapping spécifique d'abord
        if (specificMappings[accountNumber]) {
            return specificMappings[accountNumber];
        }
        
        // Mapping par catégorie
        return mappingRules[account.category] || null;
    }
    
    /**
     * Obtient la structure hiérarchique complète
     */
    getChartStructure() {
        const structure = {};
        
        Object.entries(this.chart).forEach(([classNum, classData]) => {
            structure[classNum] = {
                name: classData.name,
                description: classData.description,
                type: classData.type,
                accounts: classData.accounts ? Object.keys(classData.accounts).sort() : []
            };
        });
        
        return structure;
    }
    
    /**
     * Export complet du plan comptable
     */
    exportChart(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.chart, null, 2);
            
            case 'csv':
                return this.exportCSV();
                
            case 'excel':
                return this.exportExcel();
                
            default:
                return this.chart;
        }
    }
    
    /**
     * Export CSV du plan comptable
     */
    exportCSV() {
        const lines = [];
        lines.push(['Numéro', 'Nom', 'Classe', 'Type', 'Nature', 'Catégorie', 'Bilan', 'Résultat'].join(';'));
        
        Object.entries(this.chart).forEach(([classNum, classData]) => {
            if (classData.accounts) {
                Object.entries(classData.accounts).forEach(([accNum, account]) => {
                    lines.push([
                        accNum,
                        `"${account.name}"`,
                        classNum,
                        account.type || '',
                        account.nature || '',
                        account.category || '',
                        account.balanceSheet ? 'Oui' : 'Non',
                        account.incomeStatement ? 'Oui' : 'Non'
                    ].join(';'));
                });
            }
        });
        
        return lines.join('\n');
    }
    
    /**
     * Validation d'une écriture selon le plan comptable
     */
    validateEntry(entry) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        if (!entry.lines || entry.lines.length < 2) {
            validation.errors.push('Une écriture doit avoir au moins 2 lignes');
            validation.isValid = false;
        }
        
        let totalDebit = 0;
        let totalCredit = 0;
        
        entry.lines.forEach((line, index) => {
            // Vérifier compte existant
            const account = this.getAccount(line.account);
            if (!account) {
                validation.errors.push(`Ligne ${index + 1}: Compte ${line.account} inexistant`);
                validation.isValid = false;
            } else {
                // Vérifier cohérence nature compte
                if (line.debit > 0 && account.nature === 'credit') {
                    validation.warnings.push(`Ligne ${index + 1}: Débit sur compte de nature créditrice (${line.account})`);
                }
                if (line.credit > 0 && account.nature === 'debit') {
                    validation.warnings.push(`Ligne ${index + 1}: Crédit sur compte de nature débitrice (${line.account})`);
                }
            }
            
            totalDebit += line.debit || 0;
            totalCredit += line.credit || 0;
        });
        
        // Vérifier équilibre
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            validation.errors.push('Écriture non équilibrée');
            validation.isValid = false;
        }
        
        return validation;
    }
    
    /**
     * Statistiques du plan comptable
     */
    getStatistics() {
        let totalAccounts = 0;
        const statsByClass = {};
        const statsByCategory = {};
        const statsByType = {};
        
        Object.entries(this.chart).forEach(([classNum, classData]) => {
            const classAccounts = classData.accounts ? Object.keys(classData.accounts).length : 0;
            totalAccounts += classAccounts;
            
            statsByClass[classNum] = {
                name: classData.name,
                accounts: classAccounts
            };
            
            if (classData.accounts) {
                Object.values(classData.accounts).forEach(account => {
                    // Par catégorie
                    const category = account.category || 'non_classé';
                    statsByCategory[category] = (statsByCategory[category] || 0) + 1;
                    
                    // Par type
                    const type = account.type || 'non_défini';
                    statsByType[type] = (statsByType[type] || 0) + 1;
                });
            }
        });
        
        return {
            totalAccounts,
            statsByClass,
            statsByCategory,
            statsByType,
            generatedAt: new Date().toISOString()
        };
    }
}

// Utilitaires pour le plan comptable
export const ChartOfAccountsUtils = {
    
    /**
     * Détermine automatiquement le compte pour une transaction
     */
    suggestAccount(transactionType, amount, description = '') {
        const suggestions = [];
        
        switch (transactionType.toLowerCase()) {
            case 'sale':
            case 'vente':
                suggestions.push('3200'); // Prestations de services
                if (description.includes('export')) suggestions.push('3001');
                break;
                
            case 'purchase':
            case 'achat':
                suggestions.push('4000'); // Achats marchandises
                suggestions.push('6570'); // Frais informatiques
                break;
                
            case 'salary':
            case 'salaire':
                suggestions.push('5000'); // Salaires
                suggestions.push('5700'); // Charges sociales
                break;
                
            case 'rent':
            case 'loyer':
                suggestions.push('6000'); // Loyer
                break;
                
            case 'bank':
            case 'banque':
                suggestions.push('1020'); // Banque compte courant
                break;
                
            default:
                suggestions.push('6500'); // Services extérieurs (défaut)
        }
        
        return suggestions;
    },
    
    /**
     * Formate un numéro de compte
     */
    formatAccountNumber(accountNumber) {
        if (!accountNumber) return '';
        
        const num = accountNumber.toString();
        if (num.length === 4) {
            return num;
        } else if (num.length === 3) {
            return num + '0';
        }
        return num;
    },
    
    /**
     * Valide un numéro de compte
     */
    isValidAccountNumber(accountNumber) {
        if (!accountNumber) return false;
        
        const num = accountNumber.toString();
        return /^[1-9]\d{3}$/.test(num);
    },
    
    /**
     * Obtient le compte parent
     */
    getParentAccount(accountNumber) {
        if (!accountNumber || accountNumber.length < 3) return null;
        
        // Logique de hiérarchie (simplifié)
        const num = accountNumber.toString();
        if (num.length === 4) {
            // Chercher le parent à 3 chiffres
            return num.substring(0, 3) + '0';
        }
        
        return null;
    }
};

/**
 * Instance globale du plan comptable
 */
export const SwissChartOfAccounts = new ChartOfAccountsCH();

// Export par défaut
export default {
    ChartOfAccountsCH,
    SwissChartOfAccounts,
    ChartOfAccountsUtils,
    SWISS_CHART_OF_ACCOUNTS
};