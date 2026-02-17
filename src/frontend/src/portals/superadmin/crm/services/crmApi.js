/**
 * CRM API - Connexion aux collections Directus existantes
 * Collections utilisées: people, companies, activities, interactions
 */
import directus from '../../../../services/api/directus';
import { normalizeCompanyName } from '../../../../utils/company-filter';

export const crmApi = {
  // ============ CONTACTS (people collection) ============

  // Récupérer tous les contacts avec pagination et filtres
  getContacts: async (params = {}) => {
    const filter = {};

    if (params.company && params.company !== 'all') {
      filter.owner_company = { _eq: normalizeCompanyName(params.company) };
    }

    if (params.search) {
      filter._or = [
        { first_name: { _icontains: params.search } },
        { last_name: { _icontains: params.search } },
        { email: { _icontains: params.search } }
      ];
    }

    const data = await directus.get('people', {
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: params.limit || 50,
      sort: [params.sort || '-date_created']
    });

    return { data };
  },

  // Récupérer un contact par ID
  getContact: async (id) => {
    const data = await directus.getById('people', id);
    return { data };
  },

  // Créer un nouveau contact
  createContact: async (contactData) => {
    const data = await directus.create('people', contactData);
    return { data };
  },

  // Mettre à jour un contact
  updateContact: async (id, contactData) => {
    const data = await directus.update('people', id, contactData);
    return { data };
  },

  // Supprimer un contact
  deleteContact: async (id) => {
    await directus.delete('people', id);
    return { success: true };
  },

  // Importer contacts depuis CSV (non implémenté)
  importContacts: async (file, mapping) => {
    console.warn('Import contacts non implémenté');
    return { imported: 0 };
  },

  // Exporter contacts vers CSV (non implémenté - utiliser Directus export)
  exportContacts: async (filters = {}) => {
    console.warn('Export contacts: utilisez l\'export Directus');
    return new Blob(['Export non disponible'], { type: 'text/plain' });
  },

  // Recherche contacts avec suggestions
  searchContacts: async (query) => {
    const data = await directus.get('people', {
      filter: {
        _or: [
          { first_name: { _icontains: query } },
          { last_name: { _icontains: query } },
          { email: { _icontains: query } }
        ]
      },
      limit: 10
    });
    return data || [];
  },

  // ============ ENTREPRISES (companies collection) ============

  // Récupérer toutes les entreprises
  getCompanies: async (params = {}) => {
    const filter = {};

    if (params.company && params.company !== 'all') {
      filter.owner_company = { _eq: normalizeCompanyName(params.company) };
    }

    if (params.search) {
      filter._or = [
        { name: { _icontains: params.search } },
        { industry: { _icontains: params.search } }
      ];
    }

    const data = await directus.get('companies', {
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: params.limit || 50,
      sort: [params.sort || '-date_created']
    });

    return { data };
  },

  // Récupérer une entreprise par ID
  getCompany: async (id) => {
    const data = await directus.getById('companies', id);
    return { data };
  },

  // Créer une nouvelle entreprise
  createCompany: async (companyData) => {
    const data = await directus.create('companies', companyData);
    return { data };
  },

  // Mettre à jour une entreprise
  updateCompany: async (id, companyData) => {
    const data = await directus.update('companies', id, companyData);
    return { data };
  },

  // Supprimer une entreprise
  deleteCompany: async (id) => {
    await directus.delete('companies', id);
    return { success: true };
  },

  // Recherche entreprises
  searchCompanies: async (query) => {
    const data = await directus.get('companies', {
      filter: {
        _or: [
          { name: { _icontains: query } },
          { industry: { _icontains: query } }
        ]
      },
      limit: 10
    });
    return data || [];
  },

  // ============ ACTIVITÉS (activities collection) ============

  // Récupérer activités
  getActivities: async (params = {}) => {
    const filter = {};

    if (params.company && params.company !== 'all') {
      filter.owner_company = { _eq: normalizeCompanyName(params.company) };
    }

    if (params.type) {
      filter.type = { _eq: params.type };
    }

    const data = await directus.get('activities', {
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      limit: params.limit || 20,
      sort: ['-date_created']
    });

    return { data };
  },

  // Créer une activité
  createActivity: async (activityData) => {
    const data = await directus.create('activities', {
      ...activityData,
      date: new Date().toISOString()
    });
    return { data };
  },

  // Mettre à jour une activité
  updateActivity: async (id, activityData) => {
    const data = await directus.update('activities', id, activityData);
    return { data };
  },

  // ============ STATISTIQUES ============

  // Statistiques générales CRM
  getCRMStats: async (company = null) => {
    const filter = company && company !== 'all'
      ? { owner_company: normalizeCompanyName(company) }
      : {};

    try {
      const [people, companies, activities] = await Promise.all([
        directus.get('people', { filter, limit: -1 }),
        directus.get('companies', { filter, limit: -1 }),
        directus.get('activities', { filter, limit: -1 })
      ]);

      // Activités des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivities = (activities || []).filter(a => {
        const actDate = new Date(a.date_created || a.date);
        return actDate >= thirtyDaysAgo;
      });

      // Contacts actifs (avec email vérifié ou récente activité)
      const activeContacts = (people || []).filter(p =>
        p.is_employee === true || p.status === 'active'
      ).length;

      return {
        totalContacts: people?.length || 0,
        totalCompanies: companies?.length || 0,
        recentActivities: recentActivities.length,
        activeContacts
      };
    } catch (error) {
      console.error('Error fetching CRM stats:', error);
      return {
        totalContacts: 0,
        totalCompanies: 0,
        recentActivities: 0,
        activeContacts: 0
      };
    }
  },

  // Statistiques par période
  getStatsOverTime: async (period = '30', company = null) => {
    const filter = company && company !== 'all'
      ? { owner_company: normalizeCompanyName(company) }
      : {};

    try {
      const activities = await directus.get('activities', {
        filter,
        limit: -1,
        sort: ['date_created']
      });

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);

      return (activities || []).filter(a => {
        const actDate = new Date(a.date_created || a.date);
        return actDate >= startDate && actDate <= endDate;
      });
    } catch (error) {
      console.error('Error fetching stats over time:', error);
      return [];
    }
  }
};