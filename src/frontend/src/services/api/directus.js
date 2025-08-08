import axios from 'axios';
import toast from 'react-hot-toast';
import { addOwnerCompanyFilter, debugCompanyFilter } from '../../utils/company-filter';

// Configuration API avec gestion d'erreurs avancée
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8055';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

class DirectusAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN && { 'Authorization': `Bearer ${API_TOKEN}` })
      },
      timeout: 15000
    });

    // Intercepteur pour les requêtes
    this.client.interceptors.request.use(
      config => {
        // Log en développement
        if (import.meta.env.DEV) {
          console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
          if (config.params) {
            console.log('   Params:', config.params);
          }
        }
        return config;
      },
      error => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour les réponses
    this.client.interceptors.response.use(
      response => {
        if (import.meta.env.DEV) {
          const dataLength = response.data?.data?.length || 0;
          console.log(`✅ API Response: ${dataLength} items`);
        }
        return response;
      },
      error => {
        const message = error.response?.data?.errors?.[0]?.message || 
                       error.response?.data?.error?.message ||
                       error.message || 
                       'Une erreur API est survenue';
        
        // Gestion spécifique des erreurs réseau
        if (error.code === 'ERR_NETWORK' || error.response?.status === 0) {
          console.error('❌ Directus API non disponible');
          toast.error('Connexion à Directus impossible', {
            style: {
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }
          });
        } else if (error.response?.status !== 404) {
          // Notification pour les autres erreurs (sauf 404)
          toast.error(message, {
            style: {
              background: 'linear-gradient(135deg, #1e293b, #334155)',
              color: '#fff',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }
          });
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET avec support du filtrage owner_company automatique
   * @param {string} collection - Nom de la collection
   * @param {Object} params - Paramètres de requête
   * @param {Object} filters - Filtres métier { company: 'HYPERVISUAL' }
   * @returns {Promise<Array>} Données filtrées
   */
  async get(collection, params = {}, filters = {}) {
    try {
      // Ajouter automatiquement le filtre owner_company si nécessaire
      const finalParams = addOwnerCompanyFilter(params, filters);
      
      // Debug en développement
      if (import.meta.env.DEV && filters.company) {
        console.log(`🏢 Filtering ${collection} by company: ${filters.company}`);
      }
      
      const response = await this.client.get(`/items/${collection}`, {
        params: finalParams
      });
      
      const data = response.data.data || [];
      
      // Debug du filtrage
      debugCompanyFilter(`GET ${collection}`, filters, data);
      
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${collection}:`, error.message);
      
      // Retourner un tableau vide en cas d'erreur, JAMAIS de données de demo
      return [];
    }
  }

  /**
   * GET par ID
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID de l'élément
   * @param {Object} params - Paramètres de requête
   * @returns {Promise<Object|null>} Élément ou null
   */
  async getById(collection, id, params = {}) {
    try {
      const response = await this.client.get(`/items/${collection}/${id}`, {
        params
      });
      
      return response.data.data || null;
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(`❌ Error fetching ${collection}/${id}:`, error.message);
      }
      return null;
    }
  }

  /**
   * GET avec agrégation et support du filtrage owner_company
   * @param {string} collection - Nom de la collection
   * @param {Object} params - Paramètres d'agrégation
   * @param {Object} filters - Filtres métier
   * @returns {Promise<Array>} Résultats agrégés
   */
  async getAggregate(collection, params = {}, filters = {}) {
    try {
      // Construire les paramètres d'agrégation
      const aggregateParams = {
        aggregate: {
          sum: params.sum || [],
          avg: params.avg || [],
          count: params.count || ['*'],
          min: params.min || [],
          max: params.max || []
        },
        groupBy: params.groupBy || []
      };

      // Ajouter le filtrage owner_company
      const finalParams = addOwnerCompanyFilter({
        ...params,
        ...aggregateParams
      }, filters);
      
      const response = await this.client.get(`/items/${collection}`, {
        params: finalParams
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error(`❌ Error aggregating ${collection}:`, error.message);
      return [];
    }
  }

  /**
   * POST - Créer un élément avec owner_company automatique
   * @param {string} collection - Nom de la collection
   * @param {Object} data - Données à créer
   * @param {string} ownerCompany - Entreprise propriétaire (optionnel)
   * @returns {Promise<Object>} Élément créé
   */
  async create(collection, data, ownerCompany = null) {
    try {
      // Ajouter owner_company si fourni et pas déjà présent
      const finalData = { ...data };
      if (ownerCompany && !finalData.owner_company) {
        finalData.owner_company = ownerCompany;
      }
      
      const response = await this.client.post(`/items/${collection}`, finalData);
      
      toast.success('Élément créé avec succès', {
        style: {
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`❌ Error creating ${collection}:`, error.message);
      throw error;
    }
  }

  /**
   * PATCH - Mettre à jour un élément
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID de l'élément
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Élément mis à jour
   */
  async update(collection, id, data) {
    try {
      const response = await this.client.patch(`/items/${collection}/${id}`, data);
      
      toast.success('Élément mis à jour avec succès', {
        style: {
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`❌ Error updating ${collection}/${id}:`, error.message);
      throw error;
    }
  }

  /**
   * DELETE - Supprimer un élément
   * @param {string} collection - Nom de la collection
   * @param {string} id - ID de l'élément
   * @returns {Promise<boolean>} Succès de la suppression
   */
  async delete(collection, id) {
    try {
      await this.client.delete(`/items/${collection}/${id}`);
      
      toast.success('Élément supprimé avec succès', {
        style: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: '#fff'
        }
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Error deleting ${collection}/${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Recherche textuelle avec filtrage owner_company
   * @param {string} collection - Nom de la collection
   * @param {string} searchTerm - Terme de recherche
   * @param {Array} searchFields - Champs à rechercher
   * @param {Object} filters - Filtres métier
   * @returns {Promise<Array>} Résultats de recherche
   */
  async search(collection, searchTerm, searchFields = ['name', 'title', 'description'], filters = {}) {
    try {
      // Construire le filtre de recherche
      const searchFilter = {
        _or: searchFields.map(field => ({
          [field]: {
            _icontains: searchTerm
          }
        }))
      };

      const params = {
        filter: searchFilter,
        limit: 50
      };

      return await this.get(collection, params, filters);
    } catch (error) {
      console.error(`❌ Error searching ${collection}:`, error.message);
      return [];
    }
  }

  /**
   * Test de connexion à l'API
   * @returns {Promise<boolean>} Statut de la connexion
   */
  async testConnection() {
    try {
      const response = await this.client.get('/server/ping');
      return response.data === 'pong';
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * Récupérer les informations sur les collections
   * @returns {Promise<Array>} Liste des collections
   */
  async getCollections() {
    try {
      const response = await this.client.get('/collections');
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Error fetching collections:', error.message);
      return [];
    }
  }

  /**
   * Statistiques de filtrage par entreprise
   * @param {string} collection - Collection à analyser
   * @returns {Promise<Object>} Statistiques par entreprise
   */
  async getCompanyStats(collection) {
    try {
      const response = await this.client.get(`/items/${collection}`, {
        params: {
          aggregate: {
            count: ['*']
          },
          groupBy: ['owner_company']
        }
      });

      const data = response.data.data || [];
      const stats = {};

      data.forEach(stat => {
        stats[stat.owner_company || 'UNKNOWN'] = stat.count;
      });

      return stats;
    } catch (error) {
      console.error(`❌ Error getting stats for ${collection}:`, error.message);
      return {};
    }
  }
}

// Exporter une instance unique
const directus = new DirectusAPI();

export { directus };
export default directus;