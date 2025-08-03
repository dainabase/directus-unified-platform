/**
 * Adaptateur pour transformer les appels Notion en appels Directus
 * IMPORTANT : Ne PAS modifier la logique métier, juste adapter les appels
 * Préserve 100% de la logique existante
 */

const axios = require('axios');

class DirectusAdapter {
    constructor() {
        this.directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
        this.directusToken = process.env.DIRECTUS_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';
        
        this.client = axios.create({
            baseURL: this.directusUrl,
            headers: {
                'Authorization': `Bearer ${this.directusToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    // Mapper les collections Notion → Directus
    mapCollection(notionDb) {
        const mapping = {
            'DB-PROJETS': 'projects',
            'DB-CLIENTS': 'companies',
            'DB-CONTACTS': 'people',
            'DB-TACHES': 'deliverables',
            'DB-FACTURES-CLIENTS': 'client_invoices',
            'DB-FACTURES-FOURNISSEURS': 'supplier_invoices',
            'DB-BANQUE': 'bank_transactions',
            'DB-BUDGET': 'budgets',
            'DB-DEPENSES': 'expenses',
            'DB-ABONNEMENTS': 'subscriptions',
            'DB-TALENTS': 'talents',
            'DB-INTERACTIONS': 'interactions',
            'DB-SUPPORT': 'support_tickets',
            'DB-COMPLIANCE': 'compliance',
            'DB-CONTENT-CALENDAR': 'content_calendar',
            'DB-TIME-TRACKING': 'time_tracking',
            'DB-PERMISSIONS': 'permissions',
            'DB-PROVIDERS': 'providers',
            'DB-ACCOUNTING': 'accounting_entries'
        };
        return mapping[notionDb] || notionDb.toLowerCase().replace('db-', '');
    }

    // Adapter une requête Notion vers Directus
    async adaptNotionQuery(notionQuery) {
        const { database_id, filter, sorts, page_size } = notionQuery;
        
        const directusQuery = {
            collection: this.mapCollection(database_id),
            filter: this.convertNotionFilter(filter),
            sort: this.convertNotionSort(sorts),
            limit: page_size || 100
        };
        
        return directusQuery;
    }

    // Convertir les filtres Notion en filtres Directus
    convertNotionFilter(notionFilter) {
        if (!notionFilter) return {};
        
        const directusFilter = {};
        
        // Conversion basique des filtres Notion
        if (notionFilter.property) {
            const prop = notionFilter.property;
            const condition = notionFilter[Object.keys(notionFilter).find(k => k !== 'property')];
            
            if (condition?.equals) {
                directusFilter[prop] = { _eq: condition.equals };
            } else if (condition?.contains) {
                directusFilter[prop] = { _contains: condition.contains };
            } else if (condition?.is_not_empty) {
                directusFilter[prop] = { _nnull: true };
            }
        }
        
        return directusFilter;
    }

    // Convertir les tris Notion en tris Directus
    convertNotionSort(notionSorts) {
        if (!notionSorts || !notionSorts.length) return [];
        
        return notionSorts.map(sort => {
            const field = sort.property || sort.timestamp;
            const direction = sort.direction === 'descending' ? '-' : '';
            return `${direction}${field}`;
        });
    }

    // Méthode pour récupérer des données (remplace les appels Notion)
    async getItems(collection, options = {}) {
        try {
            const response = await this.client.get(`/items/${collection}`, {
                params: {
                    filter: options.filter || {},
                    sort: options.sort || [],
                    limit: options.limit || 100,
                    offset: options.offset || 0,
                    fields: options.fields || '*'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error(`Erreur Directus getItems ${collection}:`, error.message);
            throw error;
        }
    }

    // Méthode pour créer un item
    async createItem(collection, data) {
        try {
            const response = await this.client.post(`/items/${collection}`, data);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur Directus createItem ${collection}:`, error.message);
            throw error;
        }
    }

    // Méthode pour mettre à jour un item
    async updateItem(collection, id, data) {
        try {
            const response = await this.client.patch(`/items/${collection}/${id}`, data);
            return response.data.data;
        } catch (error) {
            console.error(`Erreur Directus updateItem ${collection}:`, error.message);
            throw error;
        }
    }

    // Méthode pour supprimer un item
    async deleteItem(collection, id) {
        try {
            await this.client.delete(`/items/${collection}/${id}`);
            return { success: true };
        } catch (error) {
            console.error(`Erreur Directus deleteItem ${collection}:`, error.message);
            throw error;
        }
    }
}

module.exports = DirectusAdapter;