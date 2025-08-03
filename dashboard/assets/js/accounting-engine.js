/**
 * Accounting Engine Module
 * Swiss SME Chart of Accounts Implementation
 * 
 * This module handles all accounting operations including:
 * - Chart of accounts management
 * - Journal entries
 * - Balance calculations
 * - Financial reports generation
 * - Automatic entry creation from invoices
 */

const AccountingEngine = (function() {
    'use strict';

    // Swiss SME Chart of Accounts Structure
    const chartOfAccounts = {
        '1': {
            name: 'ACTIFS',
            type: 'assets',
            children: {
                '10': {
                    name: 'Actif circulant',
                    children: {
                        '1000': { name: 'Caisse', balance: 1234.56 },
                        '1020': { name: 'Banque (compte postal)', balance: 234567.89 },
                        '1100': { name: 'Débiteurs (clients)', balance: 89456.78 },
                        '1170': { name: 'TVA à récupérer', balance: 0 },
                        '1200': { name: 'Stock marchandises', balance: 131529.89 }
                    }
                },
                '14': {
                    name: 'Actif immobilisé',
                    children: {
                        '1500': { name: 'Matériel informatique', balance: 0 },
                        '1510': { name: 'Mobilier', balance: 0 },
                        '1520': { name: 'Véhicules', balance: 0 }
                    }
                }
            }
        },
        '2': {
            name: 'PASSIFS',
            type: 'liabilities',
            children: {
                '20': {
                    name: 'Capitaux étrangers à court terme',
                    children: {
                        '2000': { name: 'Créanciers (fournisseurs)', balance: 156789.12 },
                        '2200': { name: 'TVA due', balance: 23456.78 },
                        '2300': { name: 'Charges sociales à payer', balance: 0 }
                    }
                },
                '24': {
                    name: 'Capitaux étrangers à long terme',
                    children: {
                        '2400': { name: 'Emprunts bancaires', balance: 0 }
                    }
                },
                '28': {
                    name: 'Capitaux propres',
                    children: {
                        '2800': { name: 'Capital social', balance: 100000.00 },
                        '2900': { name: 'Réserves', balance: 597532.11 },
                        '2990': { name: 'Bénéfice reporté', balance: 156789.45 }
                    }
                }
            }
        },
        '3': {
            name: 'PRODUITS D\'EXPLOITATION',
            type: 'revenue',
            children: {
                '32': {
                    name: 'Ventes de marchandises et prestations',
                    children: {
                        '3200': { name: 'Ventes marchandises', balance: 0 },
                        '3400': { name: 'Prestations de services', balance: 0 }
                    }
                }
            }
        },
        '4': {
            name: 'CHARGES MARCHANDISES',
            type: 'expenses',
            children: {
                '40': {
                    name: 'Charges matières et marchandises',
                    children: {
                        '4000': { name: 'Achats marchandises', balance: 0 }
                    }
                }
            }
        },
        '5': {
            name: 'CHARGES DE PERSONNEL',
            type: 'expenses',
            children: {
                '50': {
                    name: 'Salaires et charges sociales',
                    children: {
                        '5000': { name: 'Salaires', balance: 0 },
                        '5700': { name: 'Charges sociales', balance: 0 }
                    }
                }
            }
        },
        '6': {
            name: 'AUTRES CHARGES D\'EXPLOITATION',
            type: 'expenses',
            children: {
                '60': {
                    name: 'Loyers',
                    children: {
                        '6000': { name: 'Loyer locaux', balance: 0 }
                    }
                },
                '61': {
                    name: 'Entretien et réparations',
                    children: {
                        '6100': { name: 'Entretien matériel', balance: 0 }
                    }
                },
                '65': {
                    name: 'Administration',
                    children: {
                        '6500': { name: 'Frais administratifs', balance: 0 },
                        '6510': { name: 'Téléphone, internet', balance: 0 }
                    }
                },
                '68': {
                    name: 'Amortissements',
                    children: {
                        '6800': { name: 'Amortissements immobilisations', balance: 0 }
                    }
                }
            }
        },
        '8': {
            name: 'COMPTES DE RÉSULTAT',
            type: 'result',
            children: {
                '80': {
                    name: 'Résultat',
                    children: {
                        '8000': { name: 'Résultat de l\'exercice', balance: 0 }
                    }
                }
            }
        }
    };

    // Journal entries storage
    let journalEntries = [];
    let entryCounter = 1;
    
    // Configuration Notion pour les écritures comptables
    const DB_ECRITURES_COMPTABLES = window.SUPERADMIN_DB_IDS?.ECRITURES_COMPTABLES || "[ID de la base]";

    // Swiss VAT rates
    const VAT_RATES = {
        normal: 0.081,      // 8.1%
        reduced: 0.026,     // 2.6%
        lodging: 0.038      // 3.8%
    };

    /**
     * Format amount in Swiss format (1'234.56)
     */
    function formatSwissAmount(amount) {
        const parts = amount.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
        return parts.join('.');
    }

    /**
     * Get account by number
     */
    function getAccount(accountNumber) {
        const firstDigit = accountNumber.charAt(0);
        const twoDigits = accountNumber.substring(0, 2);
        
        if (chartOfAccounts[firstDigit] && 
            chartOfAccounts[firstDigit].children[twoDigits] && 
            chartOfAccounts[firstDigit].children[twoDigits].children[accountNumber]) {
            return chartOfAccounts[firstDigit].children[twoDigits].children[accountNumber];
        }
        return null;
    }

    /**
     * Create a new journal entry with Notion integration
     */
    async function createJournalEntry(data) {
        const entry = {
            id: `JE-2025-${String(entryCounter++).padStart(3, '0')}`,
            date: data.date || new Date().toISOString().split('T')[0],
            description: data.description,
            journal: data.journal || 'general',
            lines: data.lines,
            created: new Date().toISOString(),
            status: 'posted'
        };

        // Validate that entry is balanced
        const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error('Journal entry is not balanced');
        }

        // Update account balances
        entry.lines.forEach(line => {
            const account = getAccount(line.account);
            if (account) {
                if (line.debit) {
                    account.balance += line.debit;
                }
                if (line.credit) {
                    account.balance -= line.credit;
                }
            }
        });

        // Sauvegarder dans Notion si disponible
        await saveEntryToNotion(entry);

        journalEntries.push(entry);
        return entry;
    }

    /**
     * Sauvegarder écriture dans Notion DB-ECRITURES-COMPTABLES
     */
    async function saveEntryToNotion(entry) {
        try {
            if (typeof mcp_notion === 'undefined' || DB_ECRITURES_COMPTABLES === "[ID de la base]") {
                console.log('💾 MCP Notion non disponible, écriture sauvée en local uniquement');
                return;
            }

            // Créer une écriture par ligne comptable dans Notion
            for (const line of entry.lines) {
                const entryData = {
                    "Libellé": {
                        "title": [
                            {
                                "text": {
                                    "content": `${entry.description} - ${line.description}`
                                }
                            }
                        ]
                    },
                    "Date": {
                        "date": {
                            "start": entry.date
                        }
                    },
                    "Numéro Pièce": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": entry.id
                                }
                            }
                        ]
                    },
                    "Compte Débit": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": line.debit > 0 ? line.account : ""
                                }
                            }
                        ]
                    },
                    "Intitulé Compte Débit": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": line.debit > 0 ? (getAccount(line.account)?.name || "Compte inconnu") : ""
                                }
                            }
                        ]
                    },
                    "Compte Crédit": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": line.credit > 0 ? line.account : ""
                                }
                            }
                        ]
                    },
                    "Intitulé Compte Crédit": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": line.credit > 0 ? (getAccount(line.account)?.name || "Compte inconnu") : ""
                                }
                            }
                        ]
                    },
                    "Montant": {
                        "number": Math.max(line.debit || 0, line.credit || 0)
                    },
                    "Référence": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": entry.id
                                }
                            }
                        ]
                    },
                    "Type Écriture": {
                        "select": {
                            "name": mapJournalTypeToNotion(entry.journal)
                        }
                    },
                    "Période": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": formatPeriod(entry.date)
                                }
                            }
                        ]
                    },
                    "Exercice": {
                        "number": new Date(entry.date).getFullYear()
                    },
                    "Validé": {
                        "checkbox": true
                    }
                };

                await mcp_notion.create_page({
                    parent: {
                        database_id: DB_ECRITURES_COMPTABLES
                    },
                    properties: entryData
                });
            }

            console.log(`✅ Écriture ${entry.id} sauvegardée dans Notion DB-ECRITURES-COMPTABLES`);

        } catch (error) {
            console.error(`❌ Erreur sauvegarde écriture ${entry.id} dans Notion:`, error);
        }
    }

    /**
     * Helper functions pour Notion
     */
    function mapJournalTypeToNotion(journal) {
        const journalMapping = {
            'ventes': 'Facture client',
            'achats': 'Facture fournisseur', 
            'general': 'Autres',
            'bank': 'Banque',
            'vat': 'TVA'
        };
        return journalMapping[journal] || 'Autres';
    }

    function formatPeriod(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    /**
     * Create automatic entry from invoice
     */
    async function createInvoiceEntry(invoice) {
        const lines = [];
        const vatAmount = invoice.amount * VAT_RATES.normal;
        const totalAmount = invoice.amount + vatAmount;

        if (invoice.type === 'sale') {
            // Debit: Customer account
            lines.push({
                account: '1100',
                description: `Facture ${invoice.number}`,
                debit: totalAmount,
                credit: 0
            });
            
            // Credit: Sales
            lines.push({
                account: '3200',
                description: 'Vente marchandises',
                debit: 0,
                credit: invoice.amount
            });
            
            // Credit: VAT
            lines.push({
                account: '2200',
                description: 'TVA collectée',
                debit: 0,
                credit: vatAmount
            });
        } else if (invoice.type === 'purchase') {
            // Debit: Expense account
            lines.push({
                account: invoice.expenseAccount || '4000',
                description: invoice.description,
                debit: invoice.amount,
                credit: 0
            });
            
            // Debit: VAT recoverable
            lines.push({
                account: '1170',
                description: 'TVA récupérable',
                debit: vatAmount,
                credit: 0
            });
            
            // Credit: Supplier account
            lines.push({
                account: '2000',
                description: `Facture ${invoice.number}`,
                debit: 0,
                credit: totalAmount
            });
        }

        return await createJournalEntry({
            date: invoice.date,
            description: `${invoice.type === 'sale' ? 'Vente' : 'Achat'} - ${invoice.description}`,
            journal: invoice.type === 'sale' ? 'ventes' : 'achats',
            lines: lines
        });
    }

    /**
     * Generate trial balance
     */
    function generateTrialBalance(startDate, endDate) {
        const balance = [];
        
        // Iterate through all accounts
        Object.keys(chartOfAccounts).forEach(classKey => {
            const classData = chartOfAccounts[classKey];
            Object.keys(classData.children).forEach(groupKey => {
                const groupData = classData.children[groupKey];
                Object.keys(groupData.children).forEach(accountKey => {
                    const account = groupData.children[accountKey];
                    
                    // Calculate movements for the period
                    const movements = journalEntries
                        .filter(entry => entry.date >= startDate && entry.date <= endDate)
                        .reduce((acc, entry) => {
                            entry.lines.forEach(line => {
                                if (line.account === accountKey) {
                                    acc.debit += line.debit || 0;
                                    acc.credit += line.credit || 0;
                                }
                            });
                            return acc;
                        }, { debit: 0, credit: 0 });
                    
                    if (account.balance !== 0 || movements.debit !== 0 || movements.credit !== 0) {
                        balance.push({
                            account: accountKey,
                            name: account.name,
                            initialBalance: account.balance - movements.debit + movements.credit,
                            debit: movements.debit,
                            credit: movements.credit,
                            finalBalance: account.balance
                        });
                    }
                });
            });
        });
        
        return balance;
    }

    /**
     * Generate balance sheet
     */
    function generateBalanceSheet(date) {
        const balanceSheet = {
            assets: {
                current: [],
                fixed: [],
                total: 0
            },
            liabilities: {
                shortTerm: [],
                longTerm: [],
                equity: [],
                total: 0
            }
        };

        // Assets
        Object.keys(chartOfAccounts['1'].children).forEach(groupKey => {
            const group = chartOfAccounts['1'].children[groupKey];
            const groupTotal = Object.keys(group.children).reduce((sum, accountKey) => {
                const account = group.children[accountKey];
                const item = {
                    account: accountKey,
                    name: account.name,
                    balance: account.balance
                };
                
                if (groupKey === '10') {
                    balanceSheet.assets.current.push(item);
                } else {
                    balanceSheet.assets.fixed.push(item);
                }
                
                return sum + account.balance;
            }, 0);
            
            balanceSheet.assets.total += groupTotal;
        });

        // Liabilities and Equity
        Object.keys(chartOfAccounts['2'].children).forEach(groupKey => {
            const group = chartOfAccounts['2'].children[groupKey];
            Object.keys(group.children).forEach(accountKey => {
                const account = group.children[accountKey];
                const item = {
                    account: accountKey,
                    name: account.name,
                    balance: account.balance
                };
                
                if (groupKey === '20') {
                    balanceSheet.liabilities.shortTerm.push(item);
                } else if (groupKey === '24') {
                    balanceSheet.liabilities.longTerm.push(item);
                } else if (groupKey === '28') {
                    balanceSheet.liabilities.equity.push(item);
                }
                
                balanceSheet.liabilities.total += account.balance;
            });
        });

        return balanceSheet;
    }

    /**
     * Generate income statement
     */
    function generateIncomeStatement(startDate, endDate) {
        const incomeStatement = {
            revenue: [],
            expenses: {
                goods: [],
                personnel: [],
                other: []
            },
            totalRevenue: 0,
            totalExpenses: 0,
            netIncome: 0
        };

        // Calculate revenues and expenses from journal entries
        journalEntries
            .filter(entry => entry.date >= startDate && entry.date <= endDate)
            .forEach(entry => {
                entry.lines.forEach(line => {
                    const firstDigit = line.account.charAt(0);
                    const twoDigits = line.account.substring(0, 2);
                    
                    if (firstDigit === '3') {
                        // Revenue
                        const existing = incomeStatement.revenue.find(r => r.account === line.account);
                        if (existing) {
                            existing.amount += line.credit - line.debit;
                        } else {
                            incomeStatement.revenue.push({
                                account: line.account,
                                name: getAccount(line.account)?.name || 'Unknown',
                                amount: line.credit - line.debit
                            });
                        }
                        incomeStatement.totalRevenue += line.credit - line.debit;
                    } else if (firstDigit === '4') {
                        // Cost of goods
                        incomeStatement.expenses.goods.push({
                            account: line.account,
                            name: getAccount(line.account)?.name || 'Unknown',
                            amount: line.debit - line.credit
                        });
                        incomeStatement.totalExpenses += line.debit - line.credit;
                    } else if (firstDigit === '5') {
                        // Personnel expenses
                        incomeStatement.expenses.personnel.push({
                            account: line.account,
                            name: getAccount(line.account)?.name || 'Unknown',
                            amount: line.debit - line.credit
                        });
                        incomeStatement.totalExpenses += line.debit - line.credit;
                    } else if (firstDigit === '6') {
                        // Other expenses
                        incomeStatement.expenses.other.push({
                            account: line.account,
                            name: getAccount(line.account)?.name || 'Unknown',
                            amount: line.debit - line.credit
                        });
                        incomeStatement.totalExpenses += line.debit - line.credit;
                    }
                });
            });

        incomeStatement.netIncome = incomeStatement.totalRevenue - incomeStatement.totalExpenses;
        return incomeStatement;
    }

    /**
     * Initialize demo data
     */
    async function initializeDemoData() {
        // Create some demo journal entries
        const demoEntries = [
            {
                date: '2025-01-15',
                description: 'Vente marchandises Client ABC',
                journal: 'ventes',
                lines: [
                    { account: '1100', description: 'Facture client', debit: 12960, credit: 0 },
                    { account: '3200', description: 'Vente marchandises', debit: 0, credit: 12000 },
                    { account: '2200', description: 'TVA collectée', debit: 0, credit: 960 }
                ]
            },
            {
                date: '2025-01-20',
                description: 'Achat matériel informatique',
                journal: 'achats',
                lines: [
                    { account: '1500', description: 'Ordinateur portable', debit: 3240, credit: 0 },
                    { account: '1170', description: 'TVA récupérable', debit: 240, credit: 0 },
                    { account: '2000', description: 'Facture fournisseur', debit: 0, credit: 3480 }
                ]
            }
        ];

        // Créer les écritures de démonstration de manière séquentielle
        for (const entry of demoEntries) {
            try {
                await createJournalEntry(entry);
            } catch (error) {
                console.error('Erreur création écriture de démo:', error);
            }
        }
        
        console.log(`📊 ${demoEntries.length} écritures comptables de démonstration créées`);
    }

    /**
     * Charger les écritures depuis Notion DB-ECRITURES-COMPTABLES
     */
    async function loadEntriesFromNotion() {
        try {
            if (typeof mcp_notion === 'undefined' || DB_ECRITURES_COMPTABLES === "[ID de la base]") {
                console.log('📊 MCP Notion non disponible, utilisation des données locales uniquement');
                return;
            }

            console.log('📊 Chargement des écritures comptables depuis Notion...');

            const response = await mcp_notion.query_database({
                database_id: DB_ECRITURES_COMPTABLES,
                sorts: [
                    {
                        property: "Date",
                        direction: "descending"
                    }
                ]
            });

            // Regrouper les écritures par numéro de pièce
            const entriesByNumber = new Map();
            
            response.results.forEach(page => {
                const props = page.properties;
                const pieceNumber = props["Numéro Pièce"]?.rich_text?.[0]?.plain_text;
                
                if (pieceNumber) {
                    if (!entriesByNumber.has(pieceNumber)) {
                        entriesByNumber.set(pieceNumber, {
                            id: pieceNumber,
                            date: props["Date"]?.date?.start,
                            description: props["Libellé"]?.title?.[0]?.plain_text,
                            journal: mapNotionTypeToJournal(props["Type Écriture"]?.select?.name),
                            lines: [],
                            created: page.created_time,
                            status: 'posted'
                        });
                    }

                    // Ajouter la ligne comptable
                    const entry = entriesByNumber.get(pieceNumber);
                    const debitAccount = props["Compte Débit"]?.rich_text?.[0]?.plain_text;
                    const creditAccount = props["Compte Crédit"]?.rich_text?.[0]?.plain_text;
                    const amount = props["Montant"]?.number || 0;

                    if (debitAccount) {
                        entry.lines.push({
                            account: debitAccount,
                            description: props["Intitulé Compte Débit"]?.rich_text?.[0]?.plain_text || "Écriture",
                            debit: amount,
                            credit: 0
                        });
                    }

                    if (creditAccount) {
                        entry.lines.push({
                            account: creditAccount,
                            description: props["Intitulé Compte Crédit"]?.rich_text?.[0]?.plain_text || "Écriture",
                            debit: 0,
                            credit: amount
                        });
                    }
                }
            });

            // Convertir en tableau et ajouter aux écritures
            const notionEntries = Array.from(entriesByNumber.values());
            journalEntries.push(...notionEntries);

            console.log(`✅ ${notionEntries.length} écritures comptables chargées depuis Notion`);

        } catch (error) {
            console.error('❌ Erreur chargement écritures depuis Notion:', error);
        }
    }

    function mapNotionTypeToJournal(notionType) {
        const typeMapping = {
            'Facture client': 'ventes',
            'Facture fournisseur': 'achats',
            'Banque': 'bank',
            'TVA': 'vat',
            'Autres': 'general'
        };
        return typeMapping[notionType] || 'general';
    }

    // Public API
    return {
        init: async function() {
            // Charger d'abord les écritures existantes depuis Notion
            await loadEntriesFromNotion();
            
            // Si aucune écriture chargée, créer des données de démo
            if (journalEntries.length === 0) {
                await initializeDemoData();
            } else {
                console.log(`📊 Utilisation des écritures existantes (${journalEntries.length} trouvées)`);
            }
        },
        
        chartOfAccounts: chartOfAccounts,
        
        createJournalEntry: createJournalEntry,
        
        createInvoiceEntry: createInvoiceEntry,
        
        getJournalEntries: function() {
            return journalEntries;
        },
        
        loadEntriesFromNotion: loadEntriesFromNotion,
        
        generateTrialBalance: generateTrialBalance,
        
        generateBalanceSheet: generateBalanceSheet,
        
        generateIncomeStatement: generateIncomeStatement,
        
        formatSwissAmount: formatSwissAmount,
        
        getAccount: getAccount,
        
        VAT_RATES: VAT_RATES
    };
})();

// Initialize on DOM ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        AccountingEngine.init();
    });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountingEngine;
}