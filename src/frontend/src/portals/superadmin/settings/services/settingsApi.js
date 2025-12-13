// src/frontend/src/portals/superadmin/settings/services/settingsApi.js
import axios from 'axios';

const DIRECTUS_URL = '/items';

export const settingsApi = {
  // ============ COMPANY SETTINGS ============
  
  // Récupérer les paramètres d'une société
  getCompanySettings: async (company) => {
    const response = await axios.get(`${DIRECTUS_URL}/company_settings`, {
      params: {
        'filter[company][_eq]': company,
        fields: '*'
      }
    });
    return response.data.data?.[0] || null;
  },

  // Sauvegarder les paramètres d'une société
  saveCompanySettings: async (company, settings) => {
    // Vérifier si les paramètres existent déjà
    const existing = await settingsApi.getCompanySettings(company);
    
    if (existing) {
      const response = await axios.patch(`${DIRECTUS_URL}/company_settings/${existing.id}`, settings);
      return response.data;
    } else {
      const response = await axios.post(`${DIRECTUS_URL}/company_settings`, {
        company,
        ...settings
      });
      return response.data;
    }
  },

  // ============ INVOICE SETTINGS ============
  
  // Récupérer paramètres de facturation
  getInvoiceSettings: async (company) => {
    const response = await axios.get(`${DIRECTUS_URL}/invoice_settings`, {
      params: {
        'filter[company][_eq]': company,
        fields: '*'
      }
    });
    return response.data.data?.[0] || null;
  },

  // Sauvegarder paramètres de facturation
  saveInvoiceSettings: async (company, settings) => {
    const existing = await settingsApi.getInvoiceSettings(company);
    
    if (existing) {
      const response = await axios.patch(`${DIRECTUS_URL}/invoice_settings/${existing.id}`, settings);
      return response.data;
    } else {
      const response = await axios.post(`${DIRECTUS_URL}/invoice_settings`, {
        company,
        ...settings
      });
      return response.data;
    }
  },

  // Générer le prochain numéro de facture
  getNextInvoiceNumber: async (company) => {
    const response = await axios.get(`${DIRECTUS_URL}/invoice_settings/next-number/${company}`);
    return response.data;
  },

  // ============ PRODUCTS ============
  
  // Récupérer tous les produits
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams({
      fields: '*',
      sort: '-date_created',
      limit: params.limit || 50,
      offset: params.offset || 0,
      ...params.company && { 'filter[company][_eq]': params.company },
      ...params.category && { 'filter[category][_eq]': params.category },
      ...params.search && { 'filter[_or][0][name][_contains]': params.search },
      ...params.search && { 'filter[_or][1][description][_contains]': params.search }
    });
    
    const response = await axios.get(`${DIRECTUS_URL}/products?${queryParams}`);
    return response.data;
  },

  // Récupérer un produit par ID
  getProduct: async (id) => {
    const response = await axios.get(`${DIRECTUS_URL}/products/${id}`);
    return response.data;
  },

  // Créer un produit
  createProduct: async (productData) => {
    const response = await axios.post(`${DIRECTUS_URL}/products`, productData);
    return response.data;
  },

  // Mettre à jour un produit
  updateProduct: async (id, productData) => {
    const response = await axios.patch(`${DIRECTUS_URL}/products/${id}`, productData);
    return response.data;
  },

  // Supprimer un produit
  deleteProduct: async (id) => {
    const response = await axios.delete(`${DIRECTUS_URL}/products/${id}`);
    return response.data;
  },

  // Importer produits depuis CSV
  importProducts: async (file, company) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company', company);
    
    const response = await axios.post(`${DIRECTUS_URL}/products/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Exporter produits vers CSV
  exportProducts: async (company) => {
    const response = await axios.get(`${DIRECTUS_URL}/products/export`, {
      params: { company },
      responseType: 'blob'
    });
    return response.data;
  },

  // ============ USERS ============
  
  // Récupérer tous les utilisateurs
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams({
      fields: 'id,email,first_name,last_name,role,status,last_access,date_created',
      sort: '-date_created',
      limit: params.limit || 50,
      offset: params.offset || 0,
      ...params.status && { 'filter[status][_eq]': params.status },
      ...params.role && { 'filter[role][_eq]': params.role },
      ...params.search && { 'filter[_or][0][first_name][_contains]': params.search },
      ...params.search && { 'filter[_or][1][last_name][_contains]': params.search },
      ...params.search && { 'filter[_or][2][email][_contains]': params.search }
    });
    
    const response = await axios.get(`/users?${queryParams}`);
    return response.data;
  },

  // Récupérer un utilisateur par ID
  getUser: async (id) => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },

  // Créer un utilisateur
  createUser: async (userData) => {
    const response = await axios.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  updateUser: async (id, userData) => {
    const response = await axios.patch(`/users/${id}`, userData);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (id) => {
    const response = await axios.delete(`/users/${id}`);
    return response.data;
  },

  // Changer le mot de passe d'un utilisateur
  changeUserPassword: async (id, newPassword) => {
    const response = await axios.patch(`/users/${id}`, {
      password: newPassword
    });
    return response.data;
  },

  // Inviter un utilisateur
  inviteUser: async (email, role, company) => {
    const response = await axios.post('/users/invite', {
      email,
      role,
      company
    });
    return response.data;
  },

  // ============ ROLES & PERMISSIONS ============
  
  // Récupérer tous les rôles
  getRoles: async () => {
    const response = await axios.get('/roles');
    return response.data;
  },

  // Récupérer les permissions d'un rôle
  getRolePermissions: async (roleId) => {
    const response = await axios.get(`/roles/${roleId}/permissions`);
    return response.data;
  },

  // Mettre à jour les permissions d'un rôle
  updateRolePermissions: async (roleId, permissions) => {
    const response = await axios.patch(`/roles/${roleId}/permissions`, {
      permissions
    });
    return response.data;
  },

  // ============ GENERAL SETTINGS ============
  
  // Récupérer paramètres généraux
  getGeneralSettings: async () => {
    const response = await axios.get(`${DIRECTUS_URL}/general_settings`);
    return response.data.data?.[0] || null;
  },

  // Sauvegarder paramètres généraux
  saveGeneralSettings: async (settings) => {
    const existing = await settingsApi.getGeneralSettings();
    
    if (existing) {
      const response = await axios.patch(`${DIRECTUS_URL}/general_settings/${existing.id}`, settings);
      return response.data;
    } else {
      const response = await axios.post(`${DIRECTUS_URL}/general_settings`, settings);
      return response.data;
    }
  },

  // ============ SYSTEM SETTINGS ============
  
  // Récupérer informations système
  getSystemInfo: async () => {
    const response = await axios.get('/server/info');
    return response.data;
  },

  // Effectuer une sauvegarde
  createBackup: async () => {
    const response = await axios.post('/utils/export/schema');
    return response.data;
  },

  // Récupérer logs système
  getSystemLogs: async (params = {}) => {
    const response = await axios.get('/activity', {
      params: {
        limit: params.limit || 100,
        sort: '-timestamp',
        ...params.user && { 'filter[user][_eq]': params.user },
        ...params.action && { 'filter[action][_eq]': params.action }
      }
    });
    return response.data;
  },

  // Vider le cache
  clearCache: async () => {
    const response = await axios.post('/utils/cache/clear');
    return response.data;
  }
};