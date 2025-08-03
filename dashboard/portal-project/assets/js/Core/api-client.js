/**
 * Client API unifié pour communiquer avec le serveur Node.js
 * Remplace les appels directs à MCP Notion
 */

class APIClient {
  constructor() {
    this.baseURL = window.API_BASE_URL || 'http://localhost:3001/api';
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Méthode générique pour les requêtes API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token ? `Bearer ${this.token}` : '',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * GET request helper
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * PUT request helper
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request helper
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // ========== AUTH API ==========
  
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    this.setToken(null);
    localStorage.clear();
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // ========== PROJECTS API ==========
  
  async getProjects(filters = {}) {
    return this.get('/projects', filters);
  }

  async getProject(id) {
    return this.get(`/projects/${id}`);
  }

  async getProjectTasks(projectId, filters = {}) {
    return this.get(`/projects/${projectId}/tasks`, filters);
  }

  async getProjectDocuments(projectId, filters = {}) {
    return this.get(`/projects/${projectId}/documents`, filters);
  }

  async createProject(properties) {
    return this.post('/projects', { properties });
  }

  async updateProject(id, properties) {
    return this.put(`/projects/${id}`, { properties });
  }

  async createTask(projectId, properties) {
    return this.post(`/projects/${projectId}/tasks`, { properties });
  }

  async getProjectStatistics() {
    return this.get('/projects/statistics/overview');
  }

  // ========== FINANCE API ==========
  
  async getFacturesClients(filters = {}) {
    return this.get('/finance/factures-clients', filters);
  }

  async getFacturesFournisseurs(filters = {}) {
    return this.get('/finance/factures-fournisseurs', filters);
  }

  async getNotesFrais(filters = {}) {
    return this.get('/finance/notes-frais', filters);
  }

  async getTVADeclarations(filters = {}) {
    return this.get('/finance/tva-declarations', filters);
  }

  async createFactureClient(properties) {
    return this.post('/finance/factures-clients', { properties });
  }

  async createNoteFrais(properties) {
    return this.post('/finance/notes-frais', { properties });
  }

  async updateFactureClient(id, properties) {
    return this.put(`/finance/factures-clients/${id}`, { properties });
  }

  async getFinanceStatistics(year, month) {
    return this.get('/finance/statistics', { year, month });
  }

  // ========== CRM API ==========
  
  async getContacts(filters = {}) {
    return this.get('/crm/contacts', filters);
  }

  async getEntreprises(filters = {}) {
    return this.get('/crm/entreprises', filters);
  }

  async getPipeline(filters = {}) {
    return this.get('/crm/pipeline', filters);
  }

  async createContact(properties) {
    return this.post('/crm/contacts', { properties });
  }

  async createEntreprise(properties) {
    return this.post('/crm/entreprises', { properties });
  }

  async createOpportunity(properties) {
    return this.post('/crm/pipeline', { properties });
  }

  async updateOpportunity(id, properties) {
    return this.put(`/crm/pipeline/${id}`, { properties });
  }

  async getCRMStatistics() {
    return this.get('/crm/statistics');
  }

  // ========== UTILITY METHODS ==========
  
  /**
   * Transform Notion properties to simple object
   */
  transformProperties(properties) {
    const result = {};
    
    Object.entries(properties).forEach(([key, value]) => {
      if (value.title) {
        result[key] = value.title[0]?.text?.content || '';
      } else if (value.rich_text) {
        result[key] = value.rich_text[0]?.text?.content || '';
      } else if (value.number !== undefined) {
        result[key] = value.number;
      } else if (value.select) {
        result[key] = value.select.name;
      } else if (value.date) {
        result[key] = value.date.start;
      } else if (value.checkbox !== undefined) {
        result[key] = value.checkbox;
      } else if (value.url) {
        result[key] = value.url;
      } else if (value.email) {
        result[key] = value.email;
      } else if (value.phone_number) {
        result[key] = value.phone_number;
      } else if (value.people) {
        result[key] = value.people.map(p => p.id);
      } else if (value.relation) {
        result[key] = value.relation.map(r => r.id);
      } else if (value.files) {
        result[key] = value.files.map(f => ({
          name: f.name,
          url: f.file?.url || f.external?.url
        }));
      }
    });
    
    return result;
  }

  /**
   * Build Notion properties from simple object
   */
  buildProperties(data) {
    const properties = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Déterminer le type en fonction du nom de la propriété
        if (key.toLowerCase().includes('email')) {
          properties[key] = { email: value };
        } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('téléphone')) {
          properties[key] = { phone_number: value };
        } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('lien')) {
          properties[key] = { url: value };
        } else {
          // Par défaut, utiliser rich_text
          properties[key] = { rich_text: [{ text: { content: value } }] };
        }
      } else if (typeof value === 'number') {
        properties[key] = { number: value };
      } else if (typeof value === 'boolean') {
        properties[key] = { checkbox: value };
      } else if (value instanceof Date) {
        properties[key] = { date: { start: value.toISOString() } };
      } else if (Array.isArray(value)) {
        // Supposer que c'est une relation
        properties[key] = { relation: value.map(id => ({ id })) };
      }
    });
    
    return properties;
  }
}

// Créer une instance globale
window.apiClient = new APIClient();

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIClient;
}