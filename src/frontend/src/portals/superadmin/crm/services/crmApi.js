// src/frontend/src/portals/superadmin/crm/services/crmApi.js
import axios from 'axios';

const DIRECTUS_URL = '/items';

export const crmApi = {
  // ============ CONTACTS ============
  
  // Récupérer tous les contacts avec pagination et filtres
  getContacts: async (params = {}) => {
    const queryParams = new URLSearchParams({
      fields: '*,company.name,company.id',
      sort: '-date_created',
      limit: params.limit || 50,
      offset: params.offset || 0,
      ...params.filter && { 'filter[status][_eq]': params.filter },
      ...params.company && { 'filter[company][_eq]': params.company },
      ...params.search && { 'filter[_or][0][first_name][_contains]': params.search },
      ...params.search && { 'filter[_or][1][last_name][_contains]': params.search },
      ...params.search && { 'filter[_or][2][email][_contains]': params.search }
    });
    
    const response = await axios.get(`${DIRECTUS_URL}/crm_contacts?${queryParams}`);
    return response.data;
  },

  // Récupérer un contact par ID
  getContact: async (id) => {
    const response = await axios.get(`${DIRECTUS_URL}/crm_contacts/${id}?fields=*,company.*,activities.*`);
    return response.data;
  },

  // Créer un nouveau contact
  createContact: async (contactData) => {
    const response = await axios.post(`${DIRECTUS_URL}/crm_contacts`, contactData);
    return response.data;
  },

  // Mettre à jour un contact
  updateContact: async (id, contactData) => {
    const response = await axios.patch(`${DIRECTUS_URL}/crm_contacts/${id}`, contactData);
    return response.data;
  },

  // Supprimer un contact
  deleteContact: async (id) => {
    const response = await axios.delete(`${DIRECTUS_URL}/crm_contacts/${id}`);
    return response.data;
  },

  // Importer contacts depuis CSV
  importContacts: async (file, mapping) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));
    
    const response = await axios.post(`${DIRECTUS_URL}/crm_contacts/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Exporter contacts vers CSV
  exportContacts: async (filters = {}) => {
    const queryParams = new URLSearchParams({
      export: 'csv',
      fields: 'first_name,last_name,email,phone,company.name,status,date_created',
      ...filters
    });
    
    const response = await axios.get(`${DIRECTUS_URL}/crm_contacts?${queryParams}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Recherche contacts avec suggestions
  searchContacts: async (query) => {
    const response = await axios.get(`${DIRECTUS_URL}/crm_contacts`, {
      params: {
        fields: 'id,first_name,last_name,email,company.name',
        limit: 10,
        'filter[_or][0][first_name][_contains]': query,
        'filter[_or][1][last_name][_contains]': query,
        'filter[_or][2][email][_contains]': query
      }
    });
    return response.data.data || [];
  },

  // ============ ENTREPRISES ============

  // Récupérer toutes les entreprises
  getCompanies: async (params = {}) => {
    const queryParams = new URLSearchParams({
      fields: '*,contacts.id,contacts.first_name,contacts.last_name',
      sort: '-date_created',
      limit: params.limit || 50,
      offset: params.offset || 0,
      ...params.status && { 'filter[status][_eq]': params.status },
      ...params.search && { 'filter[_or][0][name][_contains]': params.search },
      ...params.search && { 'filter[_or][1][industry][_contains]': params.search }
    });
    
    const response = await axios.get(`${DIRECTUS_URL}/crm_companies?${queryParams}`);
    return response.data;
  },

  // Récupérer une entreprise par ID
  getCompany: async (id) => {
    const response = await axios.get(`${DIRECTUS_URL}/crm_companies/${id}?fields=*,contacts.*,activities.*`);
    return response.data;
  },

  // Créer une nouvelle entreprise
  createCompany: async (companyData) => {
    const response = await axios.post(`${DIRECTUS_URL}/crm_companies`, companyData);
    return response.data;
  },

  // Mettre à jour une entreprise
  updateCompany: async (id, companyData) => {
    const response = await axios.patch(`${DIRECTUS_URL}/crm_companies/${id}`, companyData);
    return response.data;
  },

  // Supprimer une entreprise
  deleteCompany: async (id) => {
    const response = await axios.delete(`${DIRECTUS_URL}/crm_companies/${id}`);
    return response.data;
  },

  // Recherche entreprises
  searchCompanies: async (query) => {
    const response = await axios.get(`${DIRECTUS_URL}/crm_companies`, {
      params: {
        fields: 'id,name,industry,city',
        limit: 10,
        'filter[_or][0][name][_contains]': query,
        'filter[_or][1][industry][_contains]': query
      }
    });
    return response.data.data || [];
  },

  // ============ ACTIVITÉS ============

  // Récupérer activités
  getActivities: async (params = {}) => {
    const queryParams = new URLSearchParams({
      fields: '*,contact.first_name,contact.last_name,company.name,user.first_name,user.last_name',
      sort: '-date',
      limit: params.limit || 20,
      offset: params.offset || 0,
      ...params.type && { 'filter[type][_eq]': params.type },
      ...params.contact && { 'filter[contact][_eq]': params.contact },
      ...params.company && { 'filter[company][_eq]': params.company }
    });
    
    const response = await axios.get(`${DIRECTUS_URL}/crm_activities?${queryParams}`);
    return response.data;
  },

  // Créer une activité
  createActivity: async (activityData) => {
    const response = await axios.post(`${DIRECTUS_URL}/crm_activities`, {
      ...activityData,
      date: new Date().toISOString(),
      user: 1 // ID utilisateur courant
    });
    return response.data;
  },

  // Mettre à jour une activité
  updateActivity: async (id, activityData) => {
    const response = await axios.patch(`${DIRECTUS_URL}/crm_activities/${id}`, activityData);
    return response.data;
  },

  // ============ STATISTIQUES ============

  // Statistiques générales CRM
  getCRMStats: async (company = null) => {
    const filters = company ? `&filter[company][_eq]=${company}` : '';
    
    const [contactsRes, companiesRes, activitiesRes] = await Promise.all([
      axios.get(`${DIRECTUS_URL}/crm_contacts?aggregate[count]=*${filters}`),
      axios.get(`${DIRECTUS_URL}/crm_companies?aggregate[count]=*${filters}`),
      axios.get(`${DIRECTUS_URL}/crm_activities?aggregate[count]=*${filters}&filter[date][_gte]=${new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]}`)
    ]);

    return {
      totalContacts: contactsRes.data.data[0]?.count || 0,
      totalCompanies: companiesRes.data.data[0]?.count || 0,
      recentActivities: activitiesRes.data.data[0]?.count || 0,
      activeContacts: 0 // Calculé côté client
    };
  },

  // Statistiques par période
  getStatsOverTime: async (period = '30', company = null) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    
    const filters = [
      `filter[date][_gte]=${startDate.toISOString().split('T')[0]}`,
      `filter[date][_lte]=${endDate.toISOString().split('T')[0]}`,
      company ? `filter[company][_eq]=${company}` : ''
    ].filter(Boolean).join('&');
    
    const response = await axios.get(`${DIRECTUS_URL}/crm_activities?${filters}&fields=date,type&sort=date`);
    return response.data.data || [];
  }
};