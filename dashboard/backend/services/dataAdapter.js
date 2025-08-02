/**
 * DataAdapter - Couche d'abstraction pour supporter Notion (legacy) ET Directus (nouveau)
 * 
 * Permet une migration progressive module par module sans casser l'existant
 */

const { createDirectus, rest, authentication } = require('@directus/sdk');
const { Client: NotionClient } = require('@notionhq/client');

class DataAdapter {
  constructor(provider = 'directus') {
    this.provider = provider;
    this.initializeClients();
  }

  async initializeClients() {
    // Client Directus
    this.directusClient = createDirectus(process.env.DIRECTUS_URL)
      .with(authentication())
      .with(rest());
    
    if (process.env.DIRECTUS_EMAIL && process.env.DIRECTUS_PASSWORD) {
      await this.directusClient.login(
        process.env.DIRECTUS_EMAIL, 
        process.env.DIRECTUS_PASSWORD
      );
    }

    // Client Notion (legacy)
    this.notionClient = new NotionClient({ 
      auth: process.env.NOTION_API_KEY 
    });
  }

  /**
   * Récupérer des éléments d'une collection/base
   */
  async getItems(collection, query = {}) {
    if (this.provider === 'directus') {
      return this.getDirectusItems(collection, query);
    } else {
      return this.getNotionItems(collection, query);
    }
  }

  /**
   * Créer un élément
   */
  async createItem(collection, data) {
    if (this.provider === 'directus') {
      return this.directusClient.request(
        createItem(collection, data)
      );
    } else {
      return this.createNotionItem(collection, data);
    }
  }

  /**
   * Mettre à jour un élément
   */
  async updateItem(collection, id, data) {
    if (this.provider === 'directus') {
      return this.directusClient.request(
        updateItem(collection, id, data)
      );
    } else {
      return this.updateNotionItem(collection, id, data);
    }
  }

  /**
   * Supprimer un élément
   */
  async deleteItem(collection, id) {
    if (this.provider === 'directus') {
      return this.directusClient.request(
        deleteItem(collection, id)
      );
    } else {
      // Notion : pas de suppression réelle
      console.warn('Notion: Suppression non autorisée (lecture seule)');
      return null;
    }
  }

  // === Méthodes Directus ===
  async getDirectusItems(collection, query) {
    try {
      const response = await this.directusClient.request(
        readItems(collection, query)
      );
      return response.data || response;
    } catch (error) {
      console.error(`Erreur Directus ${collection}:`, error);
      throw error;
    }
  }

  // === Méthodes Notion (Legacy) ===
  async getNotionItems(collection, query) {
    try {
      const databaseId = this.getNotionDatabaseId(collection);
      if (!databaseId) {
        throw new Error(`Database Notion non trouvée pour: ${collection}`);
      }

      const response = await this.notionClient.databases.query({
        database_id: databaseId,
        ...query
      });

      return this.transformNotionResponse(response);
    } catch (error) {
      console.error(`Erreur Notion ${collection}:`, error);
      throw error;
    }
  }

  async createNotionItem(collection, data) {
    const databaseId = this.getNotionDatabaseId(collection);
    if (!databaseId) {
      throw new Error(`Database Notion non trouvée pour: ${collection}`);
    }

    const response = await this.notionClient.pages.create({
      parent: { database_id: databaseId },
      properties: this.transformDataToNotionProperties(data, collection)
    });

    return this.transformNotionPage(response);
  }

  async updateNotionItem(collection, id, data) {
    const response = await this.notionClient.pages.update({
      page_id: id,
      properties: this.transformDataToNotionProperties(data, collection)
    });

    return this.transformNotionPage(response);
  }

  // === Mapping Notion → Directus ===
  getNotionDatabaseId(collection) {
    const mapping = {
      // CRM & Contacts
      'companies': process.env.NOTION_DB_CONTACTS_ENTREPRISES,
      'people': process.env.NOTION_DB_CONTACTS_PERSONNES,
      'providers': process.env.NOTION_DB_PRESTATAIRES,
      'customer_success': process.env.NOTION_DB_CUSTOMER_SUCCESS,

      // Finance
      'client_invoices': process.env.NOTION_DB_FACTURES_CLIENTS,
      'supplier_invoices': process.env.NOTION_DB_FACTURES_FOURNISSEURS,
      'expenses': process.env.NOTION_DB_NOTES_FRAIS,
      'subscriptions': process.env.NOTION_DB_SUIVI_ABONNEMENTS,
      'bank_transactions': process.env.NOTION_DB_TRANSACTIONS_BANCAIRES,
      'accounting_entries': process.env.NOTION_DB_ECRITURES_COMPTABLES,

      // Projets
      'projects': process.env.NOTION_DB_PROJETS,
      'deliverables': process.env.NOTION_DB_LIVRAISONS,
      'support_tickets': process.env.NOTION_DB_TICKETS_SUPPORT
    };

    return mapping[collection];
  }

  // === Transformations ===
  transformNotionResponse(response) {
    return response.results.map(page => this.transformNotionPage(page));
  }

  transformNotionPage(page) {
    const data = { id: page.id };
    
    // Transformer les propriétés Notion en format standard
    for (const [key, property] of Object.entries(page.properties)) {
      data[key] = this.extractNotionPropertyValue(property);
    }

    return data;
  }

  extractNotionPropertyValue(property) {
    switch (property.type) {
      case 'title':
        return property.title?.[0]?.plain_text || '';
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || '';
      case 'number':
        return property.number;
      case 'select':
        return property.select?.name || null;
      case 'multi_select':
        return property.multi_select?.map(item => item.name) || [];
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
        return property.relation?.map(rel => rel.id) || [];
      default:
        return null;
    }
  }

  transformDataToNotionProperties(data, collection) {
    // TODO: Implémenter la transformation inverse selon le schéma de chaque collection
    const properties = {};
    
    // Exemple pour companies
    if (collection === 'companies') {
      if (data.name) {
        properties.Name = { title: [{ text: { content: data.name } }] };
      }
      if (data.domain) {
        properties.Domain = { rich_text: [{ text: { content: data.domain } }] };
      }
      // ... autres champs
    }

    return properties;
  }

  // === Méthodes utilitaires ===
  
  /**
   * Définir le provider pour une collection spécifique
   */
  setProvider(collection, provider) {
    this.collectionProviders = this.collectionProviders || {};
    this.collectionProviders[collection] = provider;
  }

  /**
   * Obtenir le provider pour une collection
   */
  getProviderForCollection(collection) {
    return this.collectionProviders?.[collection] || this.provider;
  }

  /**
   * Test de connectivité
   */
  async testConnections() {
    const results = {
      directus: false,
      notion: false
    };

    try {
      await this.directusClient.request(readUsers({ limit: 1 }));
      results.directus = true;
    } catch (error) {
      console.error('Directus connection failed:', error.message);
    }

    try {
      await this.notionClient.users.me();
      results.notion = true;
    } catch (error) {
      console.error('Notion connection failed:', error.message);
    }

    return results;
  }
}

module.exports = DataAdapter;