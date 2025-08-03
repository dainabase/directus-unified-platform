/**
 * MCP Notion Wrapper
 * Provides a clean interface for Notion integration in the portal
 * This wrapper handles MCP communication and data transformation
 */

const MCPNotionWrapper = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        databases: {
            // Financial databases
            'FACTURES_CLIENTS': '226adb95-3c6f-8011-a9bb-ca31f7da8e6a',
            'FACTURES_FOURNISSEURS': '237adb95-3c6f-80de-9f92-c795334e5561',
            'NOTES_FRAIS': '237adb95-3c6f-804b-a530-e44d07ac9f7b',
            'TVA_DECLARATIONS': '237adb95-3c6f-801f-a746-c0f0560f8d67',
            'TRANSACTIONS_BANCAIRES': '237adb95-3c6f-803c-9ead-e6156b991db4',
            'ECRITURES_COMPTABLES': '237adb95-3c6f-8042-b5be-fa51e13c390f',
            
            // Project databases
            'PROJETS_CLIENTS': '226adb95-3c6f-806e-9e61-e263baf7af69',
            'TACHES': '227adb95-3c6f-8047-b7c1-e7d309071682',
            'DOCUMENTS': '230adb95-3c6f-80eb-9903-ff117c2a518f',
            
            // Contact databases
            'CONTACTS_ENTREPRISES': '223adb95-3c6f-80e7-aa2b-cfd9888f2af3',
            'CONTACTS_PERSONNES': '22cadb95-3c6f-80f1-8e05-ffe0eef29f52',
            
            // Other databases
            'ENTITE_GROUPE': '231adb95-3c6f-8002-b885-c94041b44a44',
            'SUIVI_ABONNEMENTS': '231adb95-3c6f-80ba-9608-c9e5fdd4baf9',
            'PREVISIONS_TRESORERIE': '22eadb95-3c6f-80d0-8e51-fbbacd56e138'
        },
        
        // Property mappings for consistent API
        propertyMappings: {
            factures_clients: {
                numero: 'Numéro',
                date: 'Date',
                client: 'Client',
                montantHT: 'Montant HT',
                tauxTVA: 'Taux TVA',
                montantTVA: 'Montant TVA',
                montantTTC: 'Montant TTC',
                statut: 'Statut',
                type: 'Type'
            },
            factures_fournisseurs: {
                numero: 'Numéro Facture',
                date: 'Date Facture',
                fournisseur: 'Fournisseur',
                montantHT: 'Montant HT',
                tva: 'TVA',
                montantTTC: 'Montant TTC',
                categorieAFC: 'Catégorie AFC',
                statut: 'Statut'
            },
            notes_frais: {
                date: 'Date',
                description: 'Description',
                montantHT: 'Montant HT',
                tva: 'TVA',
                montantTTC: 'Montant TTC',
                statut: 'Statut',
                employe: 'Employé'
            }
        }
    };

    /**
     * Query a Notion database with filters
     */
    async function queryDatabase(databaseKey, filter = null, sorts = null, pageSize = 100) {
        const databaseId = CONFIG.databases[databaseKey] || databaseKey;
        
        try {
            // In production, this would call the actual MCP Notion API
            // For now, return mock data for testing
            console.log(`Querying Notion database: ${databaseKey} (${databaseId})`);
            console.log('Filter:', filter);
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Return mock data based on database
            return getMockDataForDatabase(databaseKey, filter);
            
        } catch (error) {
            console.error(`Error querying database ${databaseKey}:`, error);
            throw error;
        }
    }

    /**
     * Create a new page in a Notion database
     */
    async function createPage(databaseKey, properties) {
        const databaseId = CONFIG.databases[databaseKey] || databaseKey;
        
        try {
            console.log(`Creating page in database: ${databaseKey} (${databaseId})`);
            console.log('Properties:', properties);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                id: 'mock-' + Date.now(),
                created_time: new Date().toISOString(),
                url: `https://notion.so/mock-${Date.now()}`
            };
            
        } catch (error) {
            console.error(`Error creating page in ${databaseKey}:`, error);
            throw error;
        }
    }

    /**
     * Update an existing page
     */
    async function updatePage(pageId, properties) {
        try {
            console.log(`Updating page: ${pageId}`);
            console.log('Properties:', properties);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 400));
            
            return {
                id: pageId,
                last_edited_time: new Date().toISOString()
            };
            
        } catch (error) {
            console.error(`Error updating page ${pageId}:`, error);
            throw error;
        }
    }

    /**
     * Get mock data for testing
     */
    function getMockDataForDatabase(databaseKey, filter) {
        const mockData = {
            FACTURES_CLIENTS: [
                {
                    id: 'fc-001',
                    properties: {
                        'Numéro': { title: [{ text: { content: 'FC-2024-001' }}]},
                        'Date': { date: { start: '2024-10-15' }},
                        'Client': { relation: [{ id: 'client-123' }]},
                        'Montant HT': { number: 50000 },
                        'Taux TVA': { select: { name: '8.1%' }},
                        'Montant TVA': { number: 4050 },
                        'Montant TTC': { number: 54050 },
                        'Statut': { select: { name: 'Payée' }},
                        'Type': { select: { name: 'Facture' }}
                    }
                },
                {
                    id: 'fc-002',
                    properties: {
                        'Numéro': { title: [{ text: { content: 'FC-2024-002' }}]},
                        'Date': { date: { start: '2024-11-20' }},
                        'Client': { relation: [{ id: 'client-456' }]},
                        'Montant HT': { number: 25000 },
                        'Taux TVA': { select: { name: '8.1%' }},
                        'Montant TVA': { number: 2025 },
                        'Montant TTC': { number: 27025 },
                        'Statut': { select: { name: 'En attente' }},
                        'Type': { select: { name: 'Facture' }}
                    }
                }
            ],
            
            FACTURES_FOURNISSEURS: [
                {
                    id: 'ff-001',
                    properties: {
                        'Numéro Facture': { title: [{ text: { content: 'FF-2024-001' }}]},
                        'Date Facture': { date: { start: '2024-10-20' }},
                        'Fournisseur': { relation: [{ id: 'fournisseur-789' }]},
                        'Montant HT': { number: 15000 },
                        'TVA': { number: 1215 },
                        'Montant TTC': { number: 16215 },
                        'Catégorie AFC': { select: { name: 'Services' }},
                        'Statut': { select: { name: 'Payée' }}
                    }
                }
            ],
            
            TVA_DECLARATIONS: [
                {
                    id: 'tva-2024-q3',
                    properties: {
                        'Période': { title: [{ text: { content: '2024 Q3' }}]},
                        'Entité': { select: { name: 'Hypervisual SA' }},
                        'Date Début': { date: { start: '2024-07-01' }},
                        'Date Fin': { date: { start: '2024-09-30' }},
                        'TVA Collectée': { number: 12500 },
                        'TVA Déductible': { number: 7800 },
                        'TVA à Payer': { number: 4700 },
                        'Statut': { select: { name: 'Payée' }}
                    }
                }
            ]
        };

        return {
            results: mockData[databaseKey] || [],
            has_more: false,
            next_cursor: null
        };
    }

    /**
     * Helper function to build Notion filters
     */
    function buildFilter(conditions) {
        if (!conditions || conditions.length === 0) return null;
        
        if (conditions.length === 1) return conditions[0];
        
        return {
            and: conditions
        };
    }

    /**
     * Helper to create date filter
     */
    function dateFilter(property, startDate, endDate) {
        const filters = [];
        
        if (startDate) {
            filters.push({
                property: property,
                date: { on_or_after: startDate }
            });
        }
        
        if (endDate) {
            filters.push({
                property: property,
                date: { on_or_before: endDate }
            });
        }
        
        return buildFilter(filters);
    }

    /**
     * Transform Notion properties to simple object
     */
    function transformProperties(properties, mapping = null) {
        const result = {};
        
        Object.entries(properties).forEach(([key, value]) => {
            const mappedKey = mapping ? (mapping[key] || key) : key;
            
            // Extract value based on property type
            if (value.title) {
                result[mappedKey] = value.title[0]?.text?.content || '';
            } else if (value.rich_text) {
                result[mappedKey] = value.rich_text[0]?.text?.content || '';
            } else if (value.number !== undefined) {
                result[mappedKey] = value.number;
            } else if (value.select) {
                result[mappedKey] = value.select.name;
            } else if (value.date) {
                result[mappedKey] = value.date.start;
            } else if (value.checkbox !== undefined) {
                result[mappedKey] = value.checkbox;
            } else if (value.url) {
                result[mappedKey] = value.url;
            } else if (value.relation) {
                result[mappedKey] = value.relation.map(r => r.id);
            }
        });
        
        return result;
    }

    // Public API
    return {
        // Database IDs
        databases: CONFIG.databases,
        
        // Core functions
        queryDatabase,
        createPage,
        updatePage,
        
        // Helper functions
        buildFilter,
        dateFilter,
        transformProperties,
        
        // Specialized queries for VAT module
        async loadInvoicesForVAT(startDate, endDate) {
            const [clientInvoices, supplierInvoices, expenses] = await Promise.all([
                queryDatabase('FACTURES_CLIENTS', dateFilter('Date', startDate, endDate)),
                queryDatabase('FACTURES_FOURNISSEURS', dateFilter('Date Facture', startDate, endDate)),
                queryDatabase('NOTES_FRAIS', dateFilter('Date', startDate, endDate))
            ]);
            
            return {
                clientInvoices: clientInvoices.results,
                supplierInvoices: supplierInvoices.results,
                expenses: expenses.results
            };
        },
        
        // Save VAT declaration
        async saveVATDeclaration(declaration) {
            const properties = {
                'Période': { 
                    title: [{ 
                        text: { 
                            content: `${declaration.period.year} ${declaration.period.code}` 
                        }
                    }]
                },
                'Entité': { 
                    select: { name: declaration.entity }
                },
                'Date Début': { 
                    date: { start: declaration.period.startDate }
                },
                'Date Fin': { 
                    date: { start: declaration.period.endDate }
                },
                'TVA Collectée': { 
                    number: declaration.collected.totalCollected 
                },
                'TVA Déductible': { 
                    number: declaration.deductible.totalDeductible 
                },
                'TVA à Payer': { 
                    number: declaration.result.vatToPay 
                },
                'TVA à Récupérer': {
                    number: declaration.result.vatToRecover
                },
                'Statut': { 
                    select: { name: declaration.status === 'submitted' ? 'Soumise' : 'Brouillon' }
                }
            };
            
            return createPage('TVA_DECLARATIONS', properties);
        }
    };
})();

// Make it globally available
window.MCPNotionWrapper = MCPNotionWrapper;

// Also expose as mcp_notion for compatibility
window.mcp_notion = {
    query_database: async (params) => {
        const results = await MCPNotionWrapper.queryDatabase(
            params.database_id,
            params.filter,
            params.sorts,
            params.page_size
        );
        return results;
    },
    
    create_page: async (params) => {
        return MCPNotionWrapper.createPage(
            params.parent.database_id,
            params.properties
        );
    },
    
    update_page: async (params) => {
        return MCPNotionWrapper.updatePage(
            params.page_id,
            params.properties
        );
    }
};