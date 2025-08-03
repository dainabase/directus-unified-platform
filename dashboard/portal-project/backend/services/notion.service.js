/**
 * Notion API Service
 * Gestion complète de l'intégration avec Notion
 */

const { Client } = require('@notionhq/client');
const logger = require('../utils/logger');

class NotionService {
    constructor() {
        this.notion = new Client({
            auth: process.env.NOTION_API_KEY,
        });

        // Database IDs mapping
        this.databases = {
            'facture_client': process.env.NOTION_DB_FACTURES_CLIENTS,
            'facture_fournisseur': process.env.NOTION_DB_FACTURES_FOURNISSEURS,
            'devis': process.env.NOTION_DB_DEVIS,
            'note_frais': process.env.NOTION_DB_NOTES_FRAIS,
            'ticket_cb': process.env.NOTION_DB_TICKETS_CB,
            'document_divers': process.env.NOTION_DB_DOCUMENTS_DIVERS
        };

        // Validate configuration
        this.validateConfig();
    }

    validateConfig() {
        if (!process.env.NOTION_API_KEY) {
            throw new Error('NOTION_API_KEY is not configured');
        }

        // Check all database IDs
        for (const [type, id] of Object.entries(this.databases)) {
            if (!id) {
                logger.warn(`Database ID for ${type} is not configured`);
            }
        }
    }

    /**
     * Create a new document in the appropriate Notion database
     */
    async createDocument(documentType, extractedData, fileUrl) {
        try {
            const databaseId = this.databases[documentType];
            if (!databaseId) {
                throw new Error(`No database configured for document type: ${documentType}`);
            }

            // Map data to Notion properties based on document type
            const properties = this.mapToNotionProperties(documentType, extractedData);
            
            // Add file attachment
            if (fileUrl) {
                properties['Document'] = {
                    files: [{
                        type: 'external',
                        name: extractedData.fileName || 'Document',
                        external: { url: fileUrl }
                    }]
                };
            }

            // Create page in Notion
            const response = await this.notion.pages.create({
                parent: { database_id: databaseId },
                properties: properties,
                children: this.createPageContent(documentType, extractedData)
            });

            logger.info(`Document created in Notion: ${response.id}`, {
                type: documentType,
                documentNumber: extractedData.numero
            });

            return {
                success: true,
                notionPageId: response.id,
                url: response.url
            };

        } catch (error) {
            logger.error('Error creating document in Notion:', error);
            throw error;
        }
    }

    /**
     * Map extracted data to Notion properties based on document type
     */
    mapToNotionProperties(documentType, data) {
        const baseProperties = {
            'Titre': {
                title: [{
                    text: {
                        content: this.generateTitle(documentType, data)
                    }
                }]
            },
            'Statut': {
                select: {
                    name: 'À traiter'
                }
            },
            'Date création': {
                date: {
                    start: new Date().toISOString()
                }
            },
            'Confiance IA': {
                number: Math.round((data.confidence || 0.9) * 100)
            }
        };

        // Type-specific property mapping
        switch (documentType) {
            case 'facture_client':
                return {
                    ...baseProperties,
                    'Client': {
                        rich_text: [{
                            text: { content: data.client || '' }
                        }]
                    },
                    'Numéro facture': {
                        rich_text: [{
                            text: { content: data.numero || '' }
                        }]
                    },
                    'Date facture': {
                        date: {
                            start: this.formatDate(data.date)
                        }
                    },
                    'Montant HT': {
                        number: data.montant_ht || 0
                    },
                    'TVA': {
                        number: data.montant_tva || 0
                    },
                    'Montant TTC': {
                        number: data.montant_ttc || 0
                    },
                    'Devise': {
                        select: {
                            name: data.devise || 'EUR'
                        }
                    },
                    'Entité': {
                        select: {
                            name: data.entite || 'Principal'
                        }
                    }
                };

            case 'facture_fournisseur':
                return {
                    ...baseProperties,
                    'Fournisseur': {
                        rich_text: [{
                            text: { content: data.company || data.entite || '' }
                        }]
                    },
                    'Client facturé': {
                        rich_text: [{
                            text: { content: data.client || '' }
                        }]
                    },
                    'Numéro facture': {
                        rich_text: [{
                            text: { content: data.numero || '' }
                        }]
                    },
                    'Date facture': {
                        date: {
                            start: this.formatDate(data.date)
                        }
                    },
                    'Montant TTC': {
                        number: data.montant_ttc || 0
                    },
                    'Devise': {
                        select: {
                            name: data.devise || 'EUR'
                        }
                    },
                    'Catégorie': {
                        select: {
                            name: this.detectCategory(data)
                        }
                    }
                };

            case 'devis':
                return {
                    ...baseProperties,
                    'Client': {
                        rich_text: [{
                            text: { content: data.client || '' }
                        }]
                    },
                    'Numéro devis': {
                        rich_text: [{
                            text: { content: data.numero || '' }
                        }]
                    },
                    'Date devis': {
                        date: {
                            start: this.formatDate(data.date)
                        }
                    },
                    'Montant total': {
                        number: data.montant_ttc || 0
                    },
                    'Devise': {
                        select: {
                            name: data.devise || 'EUR'
                        }
                    },
                    'Validité': {
                        number: 30 // jours par défaut
                    },
                    'Statut devis': {
                        select: {
                            name: 'En attente'
                        }
                    }
                };

            case 'note_frais':
                return {
                    ...baseProperties,
                    'Employé': {
                        rich_text: [{
                            text: { content: data.employe || 'Non spécifié' }
                        }]
                    },
                    'Date dépense': {
                        date: {
                            start: this.formatDate(data.date)
                        }
                    },
                    'Montant': {
                        number: data.montant_ttc || 0
                    },
                    'Devise': {
                        select: {
                            name: data.devise || 'EUR'
                        }
                    },
                    'Catégorie': {
                        select: {
                            name: this.detectExpenseCategory(data)
                        }
                    },
                    'Remboursé': {
                        checkbox: false
                    }
                };

            case 'ticket_cb':
                return {
                    ...baseProperties,
                    'Commerçant': {
                        rich_text: [{
                            text: { content: data.company || data.commercant || '' }
                        }]
                    },
                    'Date transaction': {
                        date: {
                            start: this.formatDate(data.date)
                        }
                    },
                    'Montant': {
                        number: data.montant_ttc || 0
                    },
                    'Devise': {
                        select: {
                            name: data.devise || 'EUR'
                        }
                    },
                    'Carte': {
                        select: {
                            name: data.carte || 'Entreprise'
                        }
                    },
                    'Catégorie': {
                        select: {
                            name: this.detectExpenseCategory(data)
                        }
                    }
                };

            default:
                return {
                    ...baseProperties,
                    'Description': {
                        rich_text: [{
                            text: { content: data.description || 'Document divers' }
                        }]
                    },
                    'Date': {
                        date: {
                            start: this.formatDate(data.date)
                        }
                    }
                };
        }
    }

    /**
     * Create rich content for the Notion page
     */
    createPageContent(documentType, data) {
        const blocks = [];

        // Summary block
        blocks.push({
            object: 'block',
            type: 'callout',
            callout: {
                icon: { emoji: '🤖' },
                color: 'blue_background',
                rich_text: [{
                    text: {
                        content: `Document analysé par IA avec ${Math.round((data.confidence || 0.9) * 100)}% de confiance`
                    }
                }]
            }
        });

        // Key information
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [{
                    text: { content: '📊 Informations clés' }
                }]
            }
        });

        // Add relevant fields as bullet points
        const keyFields = this.getKeyFields(documentType, data);
        blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: [{
                    text: { content: keyFields.join('\n• ') }
                }]
            }
        });

        // Raw extracted text
        if (data.rawText) {
            blocks.push({
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{
                        text: { content: '📄 Texte extrait' }
                    }]
                }
            });

            blocks.push({
                object: 'block',
                type: 'code',
                code: {
                    language: 'plain text',
                    rich_text: [{
                        text: {
                            content: data.rawText.substring(0, 2000) // Limit to 2000 chars
                        }
                    }]
                }
            });
        }

        return blocks;
    }

    /**
     * Search for existing documents to avoid duplicates
     */
    async searchDocument(documentType, documentNumber) {
        try {
            const databaseId = this.databases[documentType];
            if (!databaseId) return null;

            const response = await this.notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: this.getDocumentNumberField(documentType),
                    rich_text: {
                        equals: documentNumber
                    }
                }
            });

            return response.results.length > 0 ? response.results[0] : null;

        } catch (error) {
            logger.error('Error searching document:', error);
            return null;
        }
    }

    /**
     * Update existing document
     */
    async updateDocument(pageId, properties) {
        try {
            const response = await this.notion.pages.update({
                page_id: pageId,
                properties: properties
            });

            return {
                success: true,
                notionPageId: response.id,
                url: response.url
            };

        } catch (error) {
            logger.error('Error updating document:', error);
            throw error;
        }
    }

    /**
     * Create document with direct properties (pour les routes spécifiques)
     */
    async createDocumentDirect(databaseId, properties, fileUrl = null) {
        try {
            if (!databaseId) {
                throw new Error('Database ID is required');
            }

            // Ajouter le fichier si fourni
            if (fileUrl && properties['Document'] === undefined) {
                properties['Document'] = {
                    files: [{
                        type: 'external',
                        name: 'Document',
                        external: { url: fileUrl }
                    }]
                };
            }

            // Créer la page dans Notion
            const response = await this.notion.pages.create({
                parent: { database_id: databaseId },
                properties: properties
            });

            logger.info(`Document créé dans Notion: ${response.id}`);

            return {
                success: true,
                notionPageId: response.id,
                url: response.url
            };

        } catch (error) {
            logger.error('Error creating document directly:', error);
            throw error;
        }
    }

    // Helper methods
    generateTitle(documentType, data) {
        const typeLabels = {
            'facture_client': 'Facture Client',
            'facture_fournisseur': 'Facture Fournisseur',
            'devis': 'Devis',
            'note_frais': 'Note de Frais',
            'ticket_cb': 'Ticket CB'
        };

        const label = typeLabels[documentType] || 'Document';
        const number = data.numero || data.number || '';
        const client = data.client || data.company || '';
        
        return `${label} ${number} - ${client}`.trim();
    }

    formatDate(date) {
        if (!date) return new Date().toISOString().split('T')[0];
        
        try {
            // Handle various date formats
            const parsed = new Date(date);
            return parsed.toISOString().split('T')[0];
        } catch {
            return new Date().toISOString().split('T')[0];
        }
    }

    detectCategory(data) {
        // Simple category detection based on keywords
        const text = JSON.stringify(data).toLowerCase();
        
        if (text.includes('marketing') || text.includes('publicité')) return 'Marketing';
        if (text.includes('développement') || text.includes('programmation')) return 'Développement';
        if (text.includes('consulting') || text.includes('conseil')) return 'Consulting';
        if (text.includes('design') || text.includes('graphique')) return 'Design';
        if (text.includes('hébergement') || text.includes('hosting')) return 'Infrastructure';
        
        return 'Autres';
    }

    detectExpenseCategory(data) {
        const text = JSON.stringify(data).toLowerCase();
        
        if (text.includes('restaurant') || text.includes('repas')) return 'Repas';
        if (text.includes('transport') || text.includes('taxi') || text.includes('train')) return 'Transport';
        if (text.includes('hôtel') || text.includes('hébergement')) return 'Hébergement';
        if (text.includes('formation') || text.includes('conférence')) return 'Formation';
        if (text.includes('matériel') || text.includes('équipement')) return 'Matériel';
        
        return 'Autres';
    }

    getDocumentNumberField(documentType) {
        const fields = {
            'facture_client': 'Numéro facture',
            'facture_fournisseur': 'Numéro facture',
            'devis': 'Numéro devis',
            'note_frais': 'Référence',
            'ticket_cb': 'Référence'
        };
        
        return fields[documentType] || 'Référence';
    }

    getKeyFields(documentType, data) {
        const fields = [];
        
        if (data.client) fields.push(`Client: ${data.client}`);
        if (data.numero) fields.push(`Numéro: ${data.numero}`);
        if (data.date) fields.push(`Date: ${data.date}`);
        if (data.montant_ttc) fields.push(`Montant: ${data.montant_ttc} ${data.devise || 'EUR'}`);
        if (data.taux_tva) fields.push(`TVA: ${data.taux_tva}%`);
        
        return fields;
    }
}

module.exports = new NotionService();