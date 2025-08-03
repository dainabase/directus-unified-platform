// Configuration des clés API (à ne pas commiter dans le contrôle de version)
// Ce fichier définit les clés API nécessaires pour le module OCR

module.exports = {
    // Configuration OpenAI pour l'OCR Vision
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.1
    },
    
    // Configuration Notion pour l'upload et la base de données
    notion: {
        apiKey: process.env.NOTION_API_KEY || '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',
        version: process.env.NOTION_VERSION || '2022-06-28',
        databases: {
            documents: process.env.NOTION_DB_DOCUMENTS || '230adb95-3c6f-80eb-9903-ff117c2a518f',
            factures: process.env.NOTION_DB_FACTURES || '231adb95-3c6f-80ac-a702-edc3398c37b0',
            clients: process.env.NOTION_DB_CLIENTS || '232adb95-3c6f-80ac-a702-edc3398c37b1'
        }
    },
    
    // Validation des clés
    validate() {
        const errors = [];
        
        if (!this.openai.apiKey) {
            errors.push('OPENAI_API_KEY manquante - L\'OCR ne fonctionnera pas');
        }
        
        if (!this.notion.apiKey) {
            errors.push('NOTION_API_KEY manquante - L\'upload ne fonctionnera pas');
        }
        
        if (this.openai.apiKey && !this.openai.apiKey.startsWith('sk-')) {
            errors.push('OPENAI_API_KEY invalide - Doit commencer par "sk-"');
        }
        
        if (this.notion.apiKey && !this.notion.apiKey.startsWith('secret_') && !this.notion.apiKey.startsWith('ntn_')) {
            errors.push('NOTION_API_KEY invalide - Doit commencer par "secret_" ou "ntn_"');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            warnings: this.getWarnings()
        };
    },
    
    // Avertissements non bloquants
    getWarnings() {
        const warnings = [];
        
        if (this.openai.apiKey === '') {
            warnings.push('OpenAI non configuré - Fonctionnalités OCR limitées');
        }
        
        if (this.notion.apiKey === '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') {
            warnings.push('Utilisation de la clé Notion par défaut - Configurez votre propre clé');
        }
        
        return warnings;
    }
};