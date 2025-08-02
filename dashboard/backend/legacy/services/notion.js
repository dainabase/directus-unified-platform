// services/notion.js - Service pour interagir avec l'API Notion
const { Client } = require('@notionhq/client');
const DATABASES = require('../config/databases');

class NotionService {
  constructor() {
    this.notion = new Client({
      auth: process.env.NOTION_API_KEY,
      notionVersion: process.env.NOTION_VERSION || '2022-06-28'
    });
    
    // Cache simple en mémoire
    this.cache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    // Base de données IDs
    this.databases = DATABASES;
  }

  // Méthode générique pour query une base de données
  async queryDatabase(databaseId, options = {}) {
    const cacheKey = `${databaseId}-${JSON.stringify(options)}`;
    
    // Vérifier le cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await this.notion.databases.query({
        database_id: databaseId,
        ...options,
        page_size: options.page_size || 100
      });
      
      const results = this.parseResults(response.results);
      
      // Mettre en cache
      this.setCache(cacheKey, results);
      
      return {
        results,
        has_more: response.has_more,
        next_cursor: response.next_cursor
      };
    } catch (error) {
      console.error('Notion query error:', error);
      throw this.handleNotionError(error);
    }
  }

  // Récupérer une page spécifique
  async getPage(pageId) {
    const cacheKey = `page-${pageId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    
    try {
      const response = await this.notion.pages.retrieve({ page_id: pageId });
      const parsed = this.parsePage(response);
      
      this.setCache(cacheKey, parsed);
      return parsed;
    } catch (error) {
      console.error('Notion get page error:', error);
      throw this.handleNotionError(error);
    }
  }

  // Créer une nouvelle page
  async createPage(databaseId, properties, children = []) {
    try {
      const response = await this.notion.pages.create({
        parent: { database_id: databaseId },
        properties: this.formatProperties(properties),
        children
      });
      
      // Invalider le cache de la base de données
      this.invalidateCache(databaseId);
      
      return this.parsePage(response);
    } catch (error) {
      console.error('Notion create page error:', error);
      throw this.handleNotionError(error);
    }
  }

  // Mettre à jour une page
  async updatePage(pageId, properties) {
    try {
      const response = await this.notion.pages.update({
        page_id: pageId,
        properties: this.formatProperties(properties)
      });
      
      // Invalider le cache
      this.invalidateCache(`page-${pageId}`);
      
      return this.parsePage(response);
    } catch (error) {
      console.error('Notion update page error:', error);
      throw this.handleNotionError(error);
    }
  }

  // Parser les résultats d'une query
  parseResults(results) {
    return results.map(page => this.parsePage(page));
  }

  // Parser une page Notion
  parsePage(page) {
    const parsed = {
      id: page.id,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      archived: page.archived
    };
    
    // Parser les propriétés
    for (const [key, value] of Object.entries(page.properties || {})) {
      parsed[this.camelCase(key)] = this.parseProperty(value);
    }
    
    return parsed;
  }

  // Parser une propriété selon son type
  parseProperty(property) {
    switch (property.type) {
      case 'title':
        return property.title[0]?.plain_text || '';
        
      case 'rich_text':
        return property.rich_text[0]?.plain_text || '';
        
      case 'number':
        return property.number;
        
      case 'select':
        return property.select?.name || null;
        
      case 'multi_select':
        return property.multi_select.map(item => item.name);
        
      case 'date':
        return property.date?.start || null;
        
      case 'checkbox':
        return property.checkbox;
        
      case 'url':
        return property.url;
        
      case 'email':
        return property.email;
        
      case 'phone_number':
        return property.phone_number;
        
      case 'relation':
        return property.relation.map(rel => rel.id);
        
      case 'people':
        return property.people.map(person => ({
          id: person.id,
          name: person.name,
          avatar_url: person.avatar_url
        }));
        
      case 'formula':
        return this.parseFormula(property.formula);
        
      case 'rollup':
        return this.parseRollup(property.rollup);
        
      default:
        return null;
    }
  }

  // Formater les propriétés pour l'envoi à Notion
  formatProperties(properties) {
    const formatted = {};
    
    for (const [key, value] of Object.entries(properties)) {
      const propKey = this.pascalCase(key);
      
      if (value === null || value === undefined) continue;
      
      // Déterminer le type selon la valeur
      if (typeof value === 'string') {
        // Essayer de déterminer le type approprié
        if (key.toLowerCase().includes('email')) {
          formatted[propKey] = { email: value };
        } else if (key.toLowerCase().includes('url')) {
          formatted[propKey] = { url: value };
        } else if (key.toLowerCase() === 'name' || key.toLowerCase() === 'title') {
          formatted[propKey] = {
            title: [{ text: { content: value } }]
          };
        } else {
          formatted[propKey] = {
            rich_text: [{ text: { content: value } }]
          };
        }
      } else if (typeof value === 'number') {
        formatted[propKey] = { number: value };
      } else if (typeof value === 'boolean') {
        formatted[propKey] = { checkbox: value };
      } else if (value instanceof Date) {
        formatted[propKey] = {
          date: { start: value.toISOString().split('T')[0] }
        };
      } else if (Array.isArray(value)) {
        // Multi-select ou relation
        if (value.length > 0 && typeof value[0] === 'string') {
          formatted[propKey] = {
            multi_select: value.map(v => ({ name: v }))
          };
        }
      }
    }
    
    return formatted;
  }

  // Gestion du cache
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_TTL
    });
  }

  invalidateCache(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Gestion des erreurs Notion
  handleNotionError(error) {
    if (error.code === 'object_not_found') {
      return new Error('Ressource non trouvée');
    }
    if (error.code === 'unauthorized') {
      return new Error('Non autorisé');
    }
    if (error.code === 'rate_limited') {
      return new Error('Trop de requêtes, veuillez réessayer');
    }
    
    return new Error(error.message || 'Erreur Notion');
  }

  // Utilitaires
  camelCase(str) {
    return str.replace(/_./g, match => match[1].toUpperCase())
              .replace(/^./, match => match.toLowerCase());
  }

  pascalCase(str) {
    return str.replace(/_./g, match => match[1].toUpperCase())
              .replace(/^./, match => match.toUpperCase());
  }

  parseFormula(formula) {
    switch (formula.type) {
      case 'string':
        return formula.string;
      case 'number':
        return formula.number;
      case 'boolean':
        return formula.boolean;
      case 'date':
        return formula.date?.start || null;
      default:
        return null;
    }
  }

  parseRollup(rollup) {
    switch (rollup.type) {
      case 'number':
        return rollup.number;
      case 'array':
        return rollup.array.map(item => this.parseProperty(item));
      default:
        return null;
    }
  }
}

// Export singleton
module.exports = new NotionService();