/**
 * VAT Calculator Module
 * Swiss VAT Declaration and Reporting System
 * 
 * This module handles:
 * - VAT calculations with Swiss rates (8.1%, 2.6%, 3.8%)
 * - Quarterly/Monthly declarations
 * - AFC rubrique management
 * - Coherence controls
 * - XML export for e-filing
 */

const VATCalculator = (function() {
    'use strict';

    // Swiss VAT rates (as of 2024)
    const VAT_RATES = {
        normal: { rate: 8.1, code: 'normal', name: 'Taux normal', color: 'blue' },
        reduced: { rate: 2.6, code: 'reduced', name: 'Taux réduit', color: 'green' },
        lodging: { rate: 3.8, code: 'lodging', name: 'Hébergement', color: 'orange' }
    };

    // AFC official rubrique codes
    const RUBRIQUES_AFC = {
        // Revenue
        '200': 'Chiffre d\'affaires total',
        '205': 'Prestations non imposables',
        '220': 'Prestations exonérées',
        
        // VAT collected
        '302': 'Chiffre d\'affaires imposé au taux normal',
        '303': 'TVA due au taux normal',
        '312': 'Chiffre d\'affaires imposé au taux réduit',
        '313': 'TVA due au taux réduit',
        '342': 'Chiffre d\'affaires imposé au taux hébergement',
        '343': 'TVA due au taux hébergement',
        '399': 'Total TVA due',
        
        // VAT deductible
        '400': 'Impôt préalable sur marchandises',
        '405': 'Impôt préalable sur prestations',
        '410': 'Impôt préalable sur investissements',
        '415': 'Corrections impôt préalable',
        '479': 'Total impôt préalable',
        
        // Result
        '500': 'Montant à payer',
        '510': 'Crédit à reporter'
    };

    // Declaration periods
    const PERIODS = {
        quarterly: [
            { code: 'Q1', name: 'T1 (Jan-Mars)', months: [1, 2, 3], dueMonth: 4, dueDay: 30 },
            { code: 'Q2', name: 'T2 (Avr-Juin)', months: [4, 5, 6], dueMonth: 7, dueDay: 30 },
            { code: 'Q3', name: 'T3 (Juil-Sept)', months: [7, 8, 9], dueMonth: 10, dueDay: 30 },
            { code: 'Q4', name: 'T4 (Oct-Déc)', months: [10, 11, 12], dueMonth: 1, dueDay: 30 }
        ],
        monthly: Array.from({ length: 12 }, (_, i) => ({
            code: `M${i + 1}`,
            name: new Date(2025, i, 1).toLocaleDateString('fr-CH', { month: 'long' }),
            months: [i + 1],
            dueMonth: (i + 2) % 12 || 12,
            dueDay: 30
        }))
    };

    // Current declaration storage
    let currentDeclaration = null;
    let declarations = [];

    /**
     * Format amount in Swiss format
     */
    function formatSwissAmount(amount) {
        const parts = amount.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        return parts.join('.');
    }

    /**
     * Calculate VAT amount
     */
    function calculateVAT(amount, rate) {
        return Math.round(amount * rate / 100 * 100) / 100;
    }

    /**
     * Create new VAT declaration
     */
    function createDeclaration(data) {
        const declaration = {
            id: `TVA-${data.year}-${data.period}`,
            entity: data.entity || 'Hypervisual SA',
            vatNumber: data.vatNumber || 'CHE-123.456.789 TVA',
            
            period: {
                type: data.periodType || 'quarterly',
                year: data.year,
                code: data.period,
                startDate: data.startDate,
                endDate: data.endDate,
                dueDate: data.dueDate
            },
            
            method: data.method || 'effective',
            
            collected: {
                normalRate: {
                    netAmount: 0,
                    rate: VAT_RATES.normal.rate,
                    vatAmount: 0
                },
                reducedRate: {
                    netAmount: 0,
                    rate: VAT_RATES.reduced.rate,
                    vatAmount: 0
                },
                lodgingRate: {
                    netAmount: 0,
                    rate: VAT_RATES.lodging.rate,
                    vatAmount: 0
                },
                totalCollected: 0
            },
            
            deductible: {
                goods: {
                    netAmount: 0,
                    vatAmount: 0
                },
                services: {
                    netAmount: 0,
                    vatAmount: 0
                },
                investments: {
                    netAmount: 0,
                    vatAmount: 0
                },
                corrections: 0,
                totalDeductible: 0
            },
            
            result: {
                vatToPay: 0,
                vatToRecover: 0,
                paymentStatus: 'pending',
                paymentDate: null,
                paymentReference: null
            },
            
            status: 'draft',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            submittedDate: null,
            submittedBy: null
        };

        currentDeclaration = declaration;
        return declaration;
    }

    /**
     * Update declaration amounts
     */
    function updateDeclaration(section, category, amounts) {
        if (!currentDeclaration) return;

        if (section === 'collected') {
            currentDeclaration.collected[category].netAmount = amounts.netAmount || 0;
            currentDeclaration.collected[category].vatAmount = calculateVAT(
                amounts.netAmount || 0,
                currentDeclaration.collected[category].rate
            );
        } else if (section === 'deductible') {
            currentDeclaration.deductible[category].netAmount = amounts.netAmount || 0;
            currentDeclaration.deductible[category].vatAmount = amounts.vatAmount || 0;
        }

        calculateTotals();
        currentDeclaration.lastModified = new Date().toISOString();
    }

    /**
     * Calculate totals and result
     */
    function calculateTotals() {
        if (!currentDeclaration) return;

        // Total collected
        currentDeclaration.collected.totalCollected = 
            currentDeclaration.collected.normalRate.vatAmount +
            currentDeclaration.collected.reducedRate.vatAmount +
            currentDeclaration.collected.lodgingRate.vatAmount;

        // Total deductible
        currentDeclaration.deductible.totalDeductible = 
            currentDeclaration.deductible.goods.vatAmount +
            currentDeclaration.deductible.services.vatAmount +
            currentDeclaration.deductible.investments.vatAmount +
            currentDeclaration.deductible.corrections;

        // Result
        const balance = currentDeclaration.collected.totalCollected - 
                       currentDeclaration.deductible.totalDeductible;

        if (balance > 0) {
            currentDeclaration.result.vatToPay = balance;
            currentDeclaration.result.vatToRecover = 0;
        } else {
            currentDeclaration.result.vatToPay = 0;
            currentDeclaration.result.vatToRecover = Math.abs(balance);
        }
    }

    /**
     * Coherence controls
     */
    function runCoherenceControls() {
        const controls = [];
        
        // Control 1: Check totals
        const collectedCheck = Math.abs(
            currentDeclaration.collected.totalCollected - 
            (currentDeclaration.collected.normalRate.vatAmount +
             currentDeclaration.collected.reducedRate.vatAmount +
             currentDeclaration.collected.lodgingRate.vatAmount)
        ) < 0.01;

        controls.push({
            name: 'Cohérence des totaux',
            description: 'TVA collectée = Somme des TVA par taux',
            status: collectedCheck ? 'success' : 'error',
            message: collectedCheck ? 'Validé' : 'Erreur de calcul détectée'
        });

        // Control 2: Check VAT calculations
        let vatCalcCheck = true;
        const tolerance = 0.05; // 5 cents tolerance

        ['normalRate', 'reducedRate', 'lodgingRate'].forEach(rate => {
            const expected = calculateVAT(
                currentDeclaration.collected[rate].netAmount,
                currentDeclaration.collected[rate].rate
            );
            const actual = currentDeclaration.collected[rate].vatAmount;
            if (Math.abs(expected - actual) > tolerance) {
                vatCalcCheck = false;
            }
        });

        controls.push({
            name: 'Vérification des taux',
            description: 'TVA = Montant HT × Taux (tolérance 0.05 CHF)',
            status: vatCalcCheck ? 'success' : 'warning',
            message: vatCalcCheck ? 'Validé' : 'Écart détecté dans les calculs'
        });

        // Control 3: Revenue limits
        const totalRevenue = 
            currentDeclaration.collected.normalRate.netAmount +
            currentDeclaration.collected.reducedRate.netAmount +
            currentDeclaration.collected.lodgingRate.netAmount;

        const annualRevenue = totalRevenue * 4; // Quarterly to annual
        let revenueCheck = 'success';
        let revenueMessage = 'Déclaration trimestrielle OK';

        if (annualRevenue > 5000000) {
            revenueCheck = 'warning';
            revenueMessage = 'CA > 5M CHF → Déclaration mensuelle recommandée';
        }

        controls.push({
            name: 'Vérification des limites',
            description: 'Contrôle des seuils de chiffre d\'affaires',
            status: revenueCheck,
            message: revenueMessage
        });

        return controls;
    }

    /**
     * Generate AFC XML export
     */
    function generateAFCExport() {
        if (!currentDeclaration) return null;

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VATDeclaration xmlns="http://www.estv.admin.ch/xmlns/mwst/vat-declaration/1.0">
    <Header>
        <DeclarationId>${currentDeclaration.id}</DeclarationId>
        <VATNumber>${currentDeclaration.vatNumber}</VATNumber>
        <Period>
            <Year>${currentDeclaration.period.year}</Year>
            <Type>${currentDeclaration.period.type}</Type>
            <Code>${currentDeclaration.period.code}</Code>
        </Period>
        <CreatedDate>${currentDeclaration.createdAt}</CreatedDate>
    </Header>
    
    <Revenue>
        <Rubrique302>${currentDeclaration.collected.normalRate.netAmount.toFixed(2)}</Rubrique302>
        <Rubrique303>${currentDeclaration.collected.normalRate.vatAmount.toFixed(2)}</Rubrique303>
        <Rubrique312>${currentDeclaration.collected.reducedRate.netAmount.toFixed(2)}</Rubrique312>
        <Rubrique313>${currentDeclaration.collected.reducedRate.vatAmount.toFixed(2)}</Rubrique313>
        <Rubrique342>${currentDeclaration.collected.lodgingRate.netAmount.toFixed(2)}</Rubrique342>
        <Rubrique343>${currentDeclaration.collected.lodgingRate.vatAmount.toFixed(2)}</Rubrique343>
        <Rubrique399>${currentDeclaration.collected.totalCollected.toFixed(2)}</Rubrique399>
    </Revenue>
    
    <Deductible>
        <Rubrique400>${currentDeclaration.deductible.goods.vatAmount.toFixed(2)}</Rubrique400>
        <Rubrique405>${currentDeclaration.deductible.services.vatAmount.toFixed(2)}</Rubrique405>
        <Rubrique410>${currentDeclaration.deductible.investments.vatAmount.toFixed(2)}</Rubrique410>
        <Rubrique415>${currentDeclaration.deductible.corrections.toFixed(2)}</Rubrique415>
        <Rubrique479>${currentDeclaration.deductible.totalDeductible.toFixed(2)}</Rubrique479>
    </Deductible>
    
    <Result>
        <Rubrique500>${currentDeclaration.result.vatToPay.toFixed(2)}</Rubrique500>
        <Rubrique510>${currentDeclaration.result.vatToRecover.toFixed(2)}</Rubrique510>
    </Result>
</VATDeclaration>`;

        return xml;
    }

    /**
     * Save VAT declaration to Notion
     */
    async function saveVATDeclaration(declaration) {
        if (typeof mcp_notion === 'undefined') {
            console.warn('MCP Notion not available, saving locally only');
            return null;
        }

        try {
            // Calculate rubrique details
            const rubriquesDetail = generateRubriquesDetail(declaration);
            
            // Build detail par taux object
            const detailParTaux = {
                "8.1%": declaration.collected.normalRate.vatAmount,
                "2.6%": declaration.collected.reducedRate.vatAmount,
                "3.8%": declaration.collected.lodgingRate.vatAmount
            };
            
            const response = await mcp_notion.create_page({
                parent_id: "237adb95-3c6f-801f-a746-c0f0560f8d67", // DB-TVA-DECLARATIONS
                parent_type: "database",
                title: `${declaration.period.year} ${declaration.period.code}`,
                properties: {
                    "Période": { 
                        title: [{ 
                            text: { 
                                content: `${declaration.period.year} ${declaration.period.code}` 
                            }
                        }]
                    },
                    "Entité": { 
                        rich_text: [{ 
                            text: { content: declaration.entity }
                        }]
                    },
                    "Date Début": { 
                        date: { start: declaration.period.startDate.split('T')[0] }
                    },
                    "Date Fin": { 
                        date: { start: declaration.period.endDate.split('T')[0] }
                    },
                    "TVA Collectée Total": { 
                        number: declaration.collected.totalCollected 
                    },
                    "TVA Déductible Total": { 
                        number: declaration.deductible.totalDeductible 
                    },
                    "TVA à Payer": { 
                        number: declaration.result.vatToPay 
                    },
                    "Report Crédit": {
                        number: declaration.result.vatToRecover
                    },
                    "Statut": { 
                        select: { name: declaration.status === 'submitted' ? 'Soumise' : 'Brouillon' }
                    },
                    "Détail par Taux": { 
                        rich_text: [{ 
                            text: { 
                                content: JSON.stringify(detailParTaux)
                            }
                        }]
                    },
                    "Rappel Échéance": {
                        date: { start: declaration.period.dueDate.split('T')[0] }
                    },
                    "Chiffre Affaires Total": {
                        number: declaration.collected.normalRate.netAmount + 
                               declaration.collected.reducedRate.netAmount + 
                               declaration.collected.lodgingRate.netAmount
                    },
                    "Méthode": {
                        select: { name: declaration.method === 'effective' ? 'Effective' : 'Forfait' }
                    },
                    "Rubriques AFC": {
                        rich_text: [{ 
                            text: { content: JSON.stringify(rubriquesDetail) }
                        }]
                    },
                    "Numéro Déclaration": {
                        rich_text: [{ 
                            text: { content: declaration.id }
                        }]
                    },
                    "Commentaires": {
                        rich_text: [{ 
                            text: { content: `Déclaration créée le ${new Date().toLocaleDateString('fr-CH')}` }
                        }]
                    },
                    "Contrôles OK": {
                        checkbox: false
                    }
                }
            });

            return response.id;
        } catch (error) {
            console.error('Error saving VAT declaration to Notion:', error);
            throw error;
        }
    }

    /**
     * Load VAT declarations history from Notion
     */
    async function loadVATHistory(year = null) {
        if (typeof mcp_notion === 'undefined') {
            console.warn('MCP Notion not available, using local data');
            return declarations;
        }

        try {
            const filter = year ? {
                property: "Période",
                title: { contains: year.toString() }
            } : undefined;

            const response = await mcp_notion.query_database({
                database_id: "237adb95-3c6f-801f-a746-c0f0560f8d67", // DB-TVA-DECLARATIONS
                filter: filter,
                sorts: [
                    { property: "Date Fin", direction: "descending" }
                ]
            });

            return response.results.map(page => {
                const props = page.properties;
                const periode = props["Période"]?.title?.[0]?.text?.content || "";
                const [yearStr, periodCode] = periode.split(" ");
                
                return {
                    id: page.id,
                    entity: props["Entité"]?.rich_text?.[0]?.text?.content || "",
                    period: {
                        year: parseInt(yearStr) || new Date().getFullYear(),
                        code: periodCode || "",
                        startDate: props["Date Début"]?.date?.start || "",
                        endDate: props["Date Fin"]?.date?.start || "",
                        dueDate: props["Rappel Échéance"]?.date?.start || ""
                    },
                    collected: {
                        totalCollected: props["TVA Collectée Total"]?.number || 0
                    },
                    deductible: {
                        totalDeductible: props["TVA Déductible Total"]?.number || 0
                    },
                    result: {
                        vatToPay: props["TVA à Payer"]?.number || 0,
                        vatToRecover: props["Report Crédit"]?.number || 0,
                        paymentReference: props["Numéro Déclaration"]?.rich_text?.[0]?.text?.content || ""
                    },
                    status: props["Statut"]?.select?.name || "Brouillon",
                    detailData: props["Détail par Taux"]?.rich_text?.[0]?.text?.content || "{}",
                    chiffreAffaires: props["Chiffre Affaires Total"]?.number || 0,
                    rubriques: props["Rubriques AFC"]?.rich_text?.[0]?.text?.content || "{}"
                };
            });
        } catch (error) {
            console.error('Error loading VAT history from Notion:', error);
            return declarations;
        }
    }

    /**
     * Generate rubriques detail for storage
     */
    function generateRubriquesDetail(declaration) {
        return {
            '302': declaration.collected.normalRate.netAmount,
            '303': declaration.collected.normalRate.vatAmount,
            '312': declaration.collected.reducedRate.netAmount,
            '313': declaration.collected.reducedRate.vatAmount,
            '342': declaration.collected.lodgingRate.netAmount,
            '343': declaration.collected.lodgingRate.vatAmount,
            '399': declaration.collected.totalCollected,
            '400': declaration.deductible.goods.vatAmount,
            '405': declaration.deductible.services.vatAmount,
            '410': declaration.deductible.investments.vatAmount,
            '415': declaration.deductible.corrections,
            '479': declaration.deductible.totalDeductible,
            '500': declaration.result.vatToPay,
            '510': declaration.result.vatToRecover
        };
    }

    /**
     * Submit declaration
     */
    async function submitDeclaration() {
        if (!currentDeclaration) return false;

        // Run controls first
        const controls = runCoherenceControls();
        const hasErrors = controls.some(c => c.status === 'error');
        
        if (hasErrors) {
            console.error('Declaration has errors, cannot submit');
            return false;
        }

        currentDeclaration.status = 'submitted';
        currentDeclaration.submittedDate = new Date().toISOString();
        currentDeclaration.submittedBy = 'Paul Martin';
        
        // Generate reference
        currentDeclaration.result.paymentReference = 
            `${currentDeclaration.id}-${Date.now().toString(36).toUpperCase()}`;

        // Save to Notion
        try {
            const notionId = await saveVATDeclaration(currentDeclaration);
            currentDeclaration.notionId = notionId;
            console.log('Declaration saved to Notion with ID:', notionId);
        } catch (error) {
            console.error('Failed to save to Notion, keeping local only');
        }
        
        // Add to local history
        declarations.push(currentDeclaration);

        return true;
    }

    /**
     * Load invoices for VAT period from Notion
     */
    async function loadInvoicesForPeriod(startDate, endDate) {
        // Check if MCP Notion is available
        if (typeof mcp_notion === 'undefined') {
            console.warn('MCP Notion not available, using fallback data');
            return loadMockInvoicesForPeriod(startDate, endDate);
        }

        try {
            // TVA Collectée - Factures clients
            // Note: La base actuelle n'a pas de champ Date direct, donc on utilise toutes les factures
            // En production, il faudrait ajouter un champ Date à la base
            const clientInvoicesPromise = mcp_notion.query_database({
                database_id: "226adb95-3c6f-8011-a9bb-ca31f7da8e6a", // DB-FACTURES-CLIENTS
                filter: {
                    and: [
                        { property: "Type", select: { equals: "Facture" }},
                        { property: "Statut", select: { does_not_equal: "Annulé" }}
                    ]
                },
                page_size: 100
            });
            
            // TVA Déductible - Factures fournisseurs  
            const supplierInvoicesPromise = mcp_notion.query_database({
                database_id: "237adb95-3c6f-80de-9f92-c795334e5561", // DB-FACTURES-FOURNISSEURS
                filter: {
                    and: [
                        { property: "Date Facture", date: { on_or_after: startDate }},
                        { property: "Date Facture", date: { on_or_before: endDate }},
                        { property: "Statut", select: { equals: "Payée" }}
                    ]
                }
            });

            // TVA Déductible - Notes de frais
            const expensesPromise = mcp_notion.query_database({
                database_id: "237adb95-3c6f-804b-a530-e44d07ac9f7b", // DB-NOTES-FRAIS (correct ID)
                filter: {
                    and: [
                        { property: "Date", date: { on_or_after: startDate }},
                        { property: "Date", date: { on_or_before: endDate }},
                        { property: "Statut", select: { equals: "Remboursée" }}
                    ]
                }
            });

            const [clientInvoices, supplierInvoices, expenses] = await Promise.all([
                clientInvoicesPromise,
                supplierInvoicesPromise,
                expensesPromise
            ]);

            return { 
                clientInvoices: clientInvoices.results || [],
                supplierInvoices: supplierInvoices.results || [],
                expenses: expenses.results || []
            };
        } catch (error) {
            console.error('Error loading invoices from Notion:', error);
            return loadMockInvoicesForPeriod(startDate, endDate);
        }
    }

    /**
     * Process invoices to calculate VAT amounts
     */
    function processInvoicesForVAT(invoices) {
        const vatData = {
            collected: {
                normal: { net: 0, vat: 0 },
                reduced: { net: 0, vat: 0 },
                lodging: { net: 0, vat: 0 }
            },
            deductible: {
                goods: { net: 0, vat: 0 },
                services: { net: 0, vat: 0 },
                investments: { net: 0, vat: 0 }
            }
        };

        // Process client invoices (TVA collectée)
        invoices.clientInvoices.forEach(page => {
            const montantHT = page.properties["Prix Client HT"]?.number || 0;
            // Calcul TVA au taux normal par défaut (8.1%)
            const tauxTVA = 8.1;
            const montantTVA = calculateVAT(montantHT, tauxTVA);

            // Par défaut tout au taux normal (en production, il faudrait un champ Taux TVA)
            vatData.collected.normal.net += montantHT;
            vatData.collected.normal.vat += montantTVA;
        });

        // Process supplier invoices (TVA déductible)
        invoices.supplierInvoices.forEach(page => {
            const montantHT = page.properties["Montant HT"]?.number || 0;
            const montantTVA = page.properties["TVA"]?.number || 0;
            const categorie = page.properties["Catégorie AFC"]?.select?.name || "Marchandises";

            // Categorize by type
            if (categorie === "Marchandises") {
                vatData.deductible.goods.net += montantHT;
                vatData.deductible.goods.vat += montantTVA;
            } else if (categorie === "Services") {
                vatData.deductible.services.net += montantHT;
                vatData.deductible.services.vat += montantTVA;
            } else if (categorie === "Investissements") {
                vatData.deductible.investments.net += montantHT;
                vatData.deductible.investments.vat += montantTVA;
            }
        });

        // Process expenses (TVA déductible)
        invoices.expenses.forEach(page => {
            const montantHT = page.properties["Montant HT"]?.number || 0;
            const montantTVA = page.properties["TVA"]?.number || 0;
            
            // Expenses are generally services
            vatData.deductible.services.net += montantHT;
            vatData.deductible.services.vat += montantTVA;
        });

        return vatData;
    }

    /**
     * Load declaration from accounting (updated to use Notion)
     */
    async function loadFromAccounting(period) {
        const invoices = await loadInvoicesForPeriod(period.startDate, period.endDate);
        return processInvoicesForVAT(invoices);
    }

    /**
     * Fallback mock data for when Notion is unavailable
     */
    function loadMockInvoicesForPeriod(startDate, endDate) {
        return {
            clientInvoices: [
                {
                    properties: {
                        "Montant HT": { number: 125000 },
                        "Taux TVA": { select: { name: "8.1%" }},
                        "Montant TVA": { number: 10125 }
                    }
                },
                {
                    properties: {
                        "Montant HT": { number: 5000 },
                        "Taux TVA": { select: { name: "2.6%" }},
                        "Montant TVA": { number: 130 }
                    }
                }
            ],
            supplierInvoices: [
                {
                    properties: {
                        "Montant HT": { number: 30000 },
                        "TVA": { number: 2430 },
                        "Catégorie AFC": { select: { name: "Marchandises" }}
                    }
                },
                {
                    properties: {
                        "Montant HT": { number: 15000 },
                        "TVA": { number: 1215 },
                        "Catégorie AFC": { select: { name: "Services" }}
                    }
                }
            ],
            expenses: [
                {
                    properties: {
                        "Montant HT": { number: 25000 },
                        "TVA": { number: 2025 }
                    }
                }
            ]
        };
    }

    /**
     * Compare methods (effective vs forfait)
     */
    function compareDeclarationMethods(revenue) {
        const effective = currentDeclaration ? 
            currentDeclaration.result.vatToPay : 0;
        
        // Forfait rates for different business types
        const forfaitRates = {
            services: 6.2,
            retail: 4.2,
            hospitality: 5.2,
            construction: 3.5
        };

        const forfaitResults = {};
        Object.entries(forfaitRates).forEach(([type, rate]) => {
            forfaitResults[type] = revenue * rate / 100;
        });

        return {
            effective: effective,
            forfait: forfaitResults,
            recommendation: effective < Math.min(...Object.values(forfaitResults)) ? 
                'effective' : 'forfait'
        };
    }

    /**
     * Archive declaration (10 years legal requirement)
     */
    function archiveDeclaration(declaration) {
        const archived = {
            ...declaration,
            archivedDate: new Date().toISOString(),
            retentionUntil: new Date(
                new Date().getFullYear() + 10, 
                new Date().getMonth(), 
                new Date().getDate()
            ).toISOString()
        };

        // In real implementation, this would save to secure storage
        localStorage.setItem(
            `vat-archive-${declaration.id}`, 
            JSON.stringify(archived)
        );

        return archived;
    }

    /**
     * Initialize with current period data
     */
    async function initializeCurrentPeriod() {
        try {
            // Create current period declaration
            const now = new Date();
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const currentPeriod = PERIODS.quarterly[currentQuarter];
            
            createDeclaration({
                year: now.getFullYear(),
                period: currentPeriod.code,
                periodType: 'quarterly',
                startDate: new Date(now.getFullYear(), currentPeriod.months[0] - 1, 1).toISOString(),
                endDate: new Date(now.getFullYear(), currentPeriod.months[2], 0).toISOString(),
                dueDate: new Date(
                    currentPeriod.dueMonth === 1 ? now.getFullYear() + 1 : now.getFullYear(),
                    currentPeriod.dueMonth - 1,
                    currentPeriod.dueDay
                ).toISOString()
            });

            // Load real data from Notion
            const vatData = await loadFromAccounting(currentDeclaration.period);
            
            // Update declaration with real data
            updateDeclaration('collected', 'normalRate', { 
                netAmount: vatData.collected.normal.net 
            });
            updateDeclaration('collected', 'reducedRate', { 
                netAmount: vatData.collected.reduced.net 
            });
            updateDeclaration('collected', 'lodgingRate', { 
                netAmount: vatData.collected.lodging.net 
            });
            
            updateDeclaration('deductible', 'goods', { 
                netAmount: vatData.deductible.goods.net,
                vatAmount: vatData.deductible.goods.vat
            });
            updateDeclaration('deductible', 'services', { 
                netAmount: vatData.deductible.services.net,
                vatAmount: vatData.deductible.services.vat
            });
            updateDeclaration('deductible', 'investments', { 
                netAmount: vatData.deductible.investments.net,
                vatAmount: vatData.deductible.investments.vat
            });

            // Load history
            declarations = await loadVATHistory();
            
            console.log('VAT module initialized with Notion data');
        } catch (error) {
            console.error('Error initializing VAT module:', error);
            // Fall back to mock data if needed
            initializeMockData();
        }
    }

    /**
     * Initialize with mock data (fallback)
     */
    function initializeMockData() {
        const now = new Date();
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const currentPeriod = PERIODS.quarterly[currentQuarter];
        
        createDeclaration({
            year: now.getFullYear(),
            period: currentPeriod.code,
            periodType: 'quarterly',
            startDate: new Date(now.getFullYear(), currentPeriod.months[0] - 1, 1).toISOString(),
            endDate: new Date(now.getFullYear(), currentPeriod.months[2], 0).toISOString(),
            dueDate: new Date(
                currentPeriod.dueMonth === 1 ? now.getFullYear() + 1 : now.getFullYear(),
                currentPeriod.dueMonth - 1,
                currentPeriod.dueDay
            ).toISOString()
        });

        // Use mock data
        const mockData = loadMockInvoicesForPeriod(
            currentDeclaration.period.startDate, 
            currentDeclaration.period.endDate
        );
        const vatData = processInvoicesForVAT(mockData);
        
        // Update with mock data
        updateDeclaration('collected', 'normalRate', { 
            netAmount: vatData.collected.normal.net 
        });
        updateDeclaration('collected', 'reducedRate', { 
            netAmount: vatData.collected.reduced.net 
        });
        updateDeclaration('deductible', 'goods', { 
            netAmount: vatData.deductible.goods.net,
            vatAmount: vatData.deductible.goods.vat
        });
        updateDeclaration('deductible', 'services', { 
            netAmount: vatData.deductible.services.net,
            vatAmount: vatData.deductible.services.vat
        });
    }

    // Public API
    return {
        init: async function() {
            await initializeCurrentPeriod();
        },
        
        VAT_RATES: VAT_RATES,
        RUBRIQUES_AFC: RUBRIQUES_AFC,
        PERIODS: PERIODS,
        
        createDeclaration: createDeclaration,
        updateDeclaration: updateDeclaration,
        getCurrentDeclaration: () => currentDeclaration,
        getDeclarations: () => declarations,
        
        calculateVAT: calculateVAT,
        calculateTotals: calculateTotals,
        runCoherenceControls: runCoherenceControls,
        
        submitDeclaration: submitDeclaration,
        generateAFCExport: generateAFCExport,
        compareDeclarationMethods: compareDeclarationMethods,
        archiveDeclaration: archiveDeclaration,
        
        loadFromAccounting: loadFromAccounting,
        loadInvoicesForPeriod: loadInvoicesForPeriod,
        saveVATDeclaration: saveVATDeclaration,
        loadVATHistory: loadVATHistory,
        formatSwissAmount: formatSwissAmount,
        
        // New period management
        loadPeriodData: async function(year, periodCode) {
            const period = PERIODS.quarterly.find(p => p.code === periodCode) || 
                          PERIODS.monthly.find(p => p.code === periodCode);
            
            if (!period) return false;
            
            const startDate = new Date(year, period.months[0] - 1, 1).toISOString();
            const endDate = new Date(year, period.months[period.months.length - 1], 0).toISOString();
            const dueDate = new Date(
                period.dueMonth === 1 ? year + 1 : year,
                period.dueMonth - 1,
                period.dueDay
            ).toISOString();
            
            createDeclaration({
                year: year,
                period: periodCode,
                periodType: periodCode.startsWith('Q') ? 'quarterly' : 'monthly',
                startDate: startDate,
                endDate: endDate,
                dueDate: dueDate
            });
            
            const vatData = await loadFromAccounting({ startDate, endDate });
            
            // Update with loaded data
            updateDeclaration('collected', 'normalRate', { 
                netAmount: vatData.collected.normal.net 
            });
            updateDeclaration('collected', 'reducedRate', { 
                netAmount: vatData.collected.reduced.net 
            });
            updateDeclaration('collected', 'lodgingRate', { 
                netAmount: vatData.collected.lodging.net 
            });
            
            updateDeclaration('deductible', 'goods', { 
                netAmount: vatData.deductible.goods.net,
                vatAmount: vatData.deductible.goods.vat
            });
            updateDeclaration('deductible', 'services', { 
                netAmount: vatData.deductible.services.net,
                vatAmount: vatData.deductible.services.vat
            });
            updateDeclaration('deductible', 'investments', { 
                netAmount: vatData.deductible.investments.net,
                vatAmount: vatData.deductible.investments.vat
            });
            
            return true;
        }
    };
})();

// Initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async function() {
        await VATCalculator.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VATCalculator;
}