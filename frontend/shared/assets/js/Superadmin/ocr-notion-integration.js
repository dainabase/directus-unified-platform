/**
 * OCR Notion Integration - Intégration API Notion
 * Gestion complète de l'envoi vers les bases de données Notion
 */

class OCRNotionIntegration {
    constructor() {
        this.apiKey = localStorage.getItem('notion_api_key');
        this.apiVersion = '2022-06-28';
        this.baseUrl = 'https://api.notion.com/v1';
        
        // Configuration
        this.config = {
            timeout: 30000,
            maxRetries: 3,
            retryDelay: 1000
        };
        
        // Cache des databases
        this.databasesCache = null;
        this.cacheExpiry = null;
    }
    
    /**
     * Initialisation et vérification de l'API
     */
    async init() {
        if (!this.apiKey) {
            console.warn('⚠️ Clé API Notion non configurée');
            return false;
        }
        
        // En mode file://, on ne peut pas faire d'appels directs à Notion
        if (window.location.protocol === 'file:') {
            console.log('📁 Mode fichier local détecté - Notion via proxy uniquement');
            return true; // On considère que c'est OK
        }
        
        try {
            // Vérifier la connexion
            const response = await this.makeRequest('/users/me');
            console.log('✅ Notion API connectée:', response.name);
            return true;
        } catch (error) {
            console.warn('⚠️ Connexion Notion directe impossible (CORS) - Utilisation du proxy');
            return true; // On continue quand même
        }
    }
    
    /**
     * Envoyer un document vers Notion
     */
    async sendDocument(documentType, data, attachmentFile = null) {
        try {
            const template = DOCUMENT_TYPES[documentType];
            if (!template) {
                throw new Error(`Type de document inconnu: ${documentType}`);
            }
            
            // Préparer les propriétés Notion
            const properties = this.prepareNotionProperties(template, data);
            
            // Créer la page
            const pageData = {
                parent: { database_id: template.database_id },
                properties: properties,
                children: []
            };
            
            // Ajouter le contenu si nécessaire
            if (data.description || data.notes) {
                pageData.children = this.createPageContent(data);
            }
            
            // Créer la page Notion
            const page = await this.createPage(pageData);
            
            // Uploader le fichier si présent
            if (attachmentFile && page.id) {
                await this.uploadAttachment(page.id, attachmentFile);
            }
            
            return {
                success: true,
                pageId: page.id,
                url: page.url,
                message: `Document créé dans ${template.database_name}`
            };
            
        } catch (error) {
            console.error('❌ Erreur envoi Notion:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Préparer les propriétés pour Notion
     */
    prepareNotionProperties(template, data) {
        const properties = {};
        
        template.fields.forEach(field => {
            const value = data[field.key];
            if (value === undefined || value === null || value === '') return;
            
            switch (field.type) {
                case 'text':
                case 'textarea':
                    properties[field.label] = {
                        title: field.key === 'numero' || field.key === 'nom_document',
                        rich_text: [{
                            type: 'text',
                            text: { content: String(value) }
                        }]
                    };
                    break;
                    
                case 'number':
                    properties[field.label] = {
                        number: parseFloat(value) || 0
                    };
                    break;
                    
                case 'date':
                    properties[field.label] = {
                        date: {
                            start: value,
                            end: null
                        }
                    };
                    break;
                    
                case 'select':
                    properties[field.label] = {
                        select: {
                            name: String(value)
                        }
                    };
                    break;
                    
                case 'multi_select':
                    properties[field.label] = {
                        multi_select: Array.isArray(value) 
                            ? value.map(v => ({ name: String(v) }))
                            : [{ name: String(value) }]
                    };
                    break;
                    
                case 'checkbox':
                    properties[field.label] = {
                        checkbox: Boolean(value)
                    };
                    break;
                    
                case 'url':
                    properties[field.label] = {
                        url: String(value)
                    };
                    break;
                    
                case 'email':
                    properties[field.label] = {
                        email: String(value)
                    };
                    break;
                    
                case 'phone':
                    properties[field.label] = {
                        phone_number: String(value)
                    };
                    break;
            }
        });
        
        // Ajouter metadata
        properties['Créé par OCR'] = {
            checkbox: true
        };
        
        properties['Date Import'] = {
            date: {
                start: new Date().toISOString().split('T')[0]
            }
        };
        
        return properties;
    }
    
    /**
     * Créer le contenu de la page
     */
    createPageContent(data) {
        const blocks = [];
        
        // Titre
        blocks.push({
            object: 'block',
            type: 'heading_1',
            heading_1: {
                rich_text: [{
                    type: 'text',
                    text: { content: 'Informations extraites par OCR' }
                }]
            }
        });
        
        // Description ou notes
        if (data.description) {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        type: 'text',
                        text: { content: data.description }
                    }]
                }
            });
        }
        
        // Tableau récapitulatif
        blocks.push({
            object: 'block',
            type: 'heading_2',
            heading_2: {
                rich_text: [{
                    type: 'text',
                    text: { content: 'Données complètes' }
                }]
            }
        });
        
        // Liste des données
        Object.entries(data).forEach(([key, value]) => {
            if (value && !['description', 'notes'].includes(key)) {
                blocks.push({
                    object: 'block',
                    type: 'bulleted_list_item',
                    bulleted_list_item: {
                        rich_text: [{
                            type: 'text',
                            text: { 
                                content: `${this.formatLabel(key)}: ${this.formatValue(value)}`,
                                annotations: { bold: false }
                            }
                        }]
                    }
                });
            }
        });
        
        return blocks;
    }
    
    /**
     * Créer une page Notion
     */
    async createPage(pageData) {
        return await this.makeRequest('/pages', 'POST', pageData);
    }
    
    /**
     * Uploader un fichier attaché
     */
    async uploadAttachment(pageId, file) {
        // Note: L'API Notion ne permet pas l'upload direct de fichiers
        // On ajoute un bloc avec un lien ou on utilise une solution externe
        
        const fileInfo = {
            object: 'block',
            type: 'heading_3',
            heading_3: {
                rich_text: [{
                    type: 'text',
                    text: { content: '📎 Document original' }
                }]
            }
        };
        
        const fileDetails = {
            object: 'block',
            type: 'paragraph',
            paragraph: {
                rich_text: [{
                    type: 'text',
                    text: { 
                        content: `Fichier: ${file.name} (${this.formatFileSize(file.size)})` 
                    }
                }]
            }
        };
        
        // Ajouter les blocs à la page
        await this.appendBlocks(pageId, [fileInfo, fileDetails]);
    }
    
    /**
     * Ajouter des blocs à une page
     */
    async appendBlocks(pageId, blocks) {
        return await this.makeRequest(`/blocks/${pageId}/children`, 'PATCH', {
            children: blocks
        });
    }
    
    /**
     * Récupérer les databases disponibles
     */
    async getDatabases() {
        // Utiliser le cache si valide
        if (this.databasesCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
            return this.databasesCache;
        }
        
        const response = await this.makeRequest('/search', 'POST', {
            filter: {
                value: 'database',
                property: 'object'
            },
            sort: {
                direction: 'ascending',
                timestamp: 'last_edited_time'
            }
        });
        
        // Mettre en cache pour 5 minutes
        this.databasesCache = response.results;
        this.cacheExpiry = Date.now() + (5 * 60 * 1000);
        
        return response.results;
    }
    
    /**
     * Vérifier si une database existe
     */
    async verifyDatabase(databaseId) {
        try {
            const database = await this.makeRequest(`/databases/${databaseId}`);
            return {
                exists: true,
                title: database.title[0]?.plain_text || 'Sans titre',
                properties: Object.keys(database.properties)
            };
        } catch (error) {
            return {
                exists: false,
                error: error.message
            };
        }
    }
    
    /**
     * Faire une requête à l'API Notion
     */
    async makeRequest(endpoint, method = 'GET', body = null, retryCount = 0) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Notion-Version': this.apiVersion,
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                if (response.status === 429 && retryCount < this.config.maxRetries) {
                    // Rate limit - attendre et réessayer
                    const retryAfter = response.headers.get('Retry-After') || this.config.retryDelay;
                    await this.sleep(parseInt(retryAfter) * 1000);
                    return this.makeRequest(endpoint, method, body, retryCount + 1);
                }
                
                const error = await response.json();
                throw new Error(error.message || `Erreur API Notion: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Timeout: La requête a pris trop de temps');
            }
            throw error;
        }
    }
    
    /**
     * Utilitaires
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    formatLabel(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    formatValue(value) {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Test de connexion
     */
    async testConnection() {
        try {
            await this.init();
            const databases = await this.getDatabases();
            
            console.log('✅ Connexion Notion OK');
            console.log(`📊 ${databases.length} databases trouvées`);
            
            // Vérifier les databases du projet
            const projectDbs = Object.values(DOCUMENT_TYPES).map(t => t.database_id);
            for (const dbId of projectDbs) {
                const result = await this.verifyDatabase(dbId);
                console.log(`Database ${dbId}:`, result.exists ? '✅' : '❌');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Test connexion échoué:', error);
            return false;
        }
    }
}

// Export global
window.OCRNotionIntegration = OCRNotionIntegration;