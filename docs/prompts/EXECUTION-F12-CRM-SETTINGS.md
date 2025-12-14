# PROMPT F-12 : Frontend CRM & Settings

## 🎯 OBJECTIF
Créer les modules frontend React pour la gestion CRM (contacts, entreprises) et les paramètres système (configuration entreprise, facturation, produits, utilisateurs).

## 📊 MÉTRIQUES
- **Fichiers à créer** : 18 fichiers
- **Lignes estimées** : ~1,800 lignes
- **Temps estimé** : 35-45 minutes

---

## 🛠️ STACK TECHNIQUE

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.2 | UI Framework |
| React Query | @tanstack/react-query | Data fetching & cache |
| Axios | 1.6+ | HTTP client |
| Lucide React | latest | Icons |
| Tabler.io | 1.0.0-beta20 | CSS Framework (classes uniquement) |
| React Hot Toast | 2.4+ | Notifications |

---

## 📁 STRUCTURE DES FICHIERS À CRÉER

```
src/frontend/src/portals/superadmin/
├── crm/
│   ├── index.js
│   ├── CRMDashboard.jsx
│   ├── services/
│   │   └── crmApi.js
│   ├── hooks/
│   │   └── useCRMData.js
│   └── components/
│       ├── ContactsList.jsx
│       ├── ContactForm.jsx
│       ├── ContactDetail.jsx
│       ├── CompaniesList.jsx
│       ├── CompanyForm.jsx
│       └── QuickStats.jsx
│
└── settings/
    ├── index.js
    ├── SettingsDashboard.jsx
    ├── services/
    │   └── settingsApi.js
    ├── hooks/
    │   └── useSettingsData.js
    └── components/
        ├── CompanySettings.jsx
        ├── InvoiceSettings.jsx
        ├── TaxSettings.jsx
        ├── ProductsList.jsx
        └── ProductForm.jsx
```

---

## 📝 FICHIER 1 : crm/index.js

```javascript
// src/frontend/src/portals/superadmin/crm/index.js
export { default as CRMDashboard } from './CRMDashboard';
export { default as crmApi } from './services/crmApi';
export * from './hooks/useCRMData';
```

---

## 📝 FICHIER 2 : crm/services/crmApi.js

```javascript
// src/frontend/src/portals/superadmin/crm/services/crmApi.js
import axios from 'axios';

const API_BASE = '/items';

export const crmApi = {
  // ============ CONTACTS (collection: people) ============
  
  getContacts: async (params = {}) => {
    const response = await axios.get(`${API_BASE}/people`, {
      params: {
        limit: params.limit || 50,
        offset: params.offset || 0,
        sort: params.sort || '-date_created',
        filter: params.filter || {},
        fields: '*,company_id.name,company_id.id'
      }
    });
    return response.data;
  },
  
  getContact: async (id) => {
    const response = await axios.get(`${API_BASE}/people/${id}`, {
      params: {
        fields: '*,company_id.*,addresses.*'
      }
    });
    return response.data;
  },
  
  createContact: async (data) => {
    const response = await axios.post(`${API_BASE}/people`, data);
    return response.data;
  },
  
  updateContact: async (id, data) => {
    const response = await axios.patch(`${API_BASE}/people/${id}`, data);
    return response.data;
  },
  
  deleteContact: async (id) => {
    const response = await axios.delete(`${API_BASE}/people/${id}`);
    return response.data;
  },
  
  searchContacts: async (query) => {
    const response = await axios.get(`${API_BASE}/people`, {
      params: {
        search: query,
        fields: 'id,first_name,last_name,email,company_id.name,type',
        limit: 20
      }
    });
    return response.data;
  },
  
  // ============ ENTREPRISES (collection: companies) ============
  
  getCompanies: async (params = {}) => {
    const response = await axios.get(`${API_BASE}/companies`, {
      params: {
        limit: params.limit || 50,
        offset: params.offset || 0,
        sort: params.sort || 'name',
        filter: params.filter || {},
        fields: '*,main_contact_id.first_name,main_contact_id.last_name'
      }
    });
    return response.data;
  },
  
  getCompany: async (id) => {
    const response = await axios.get(`${API_BASE}/companies/${id}`, {
      params: {
        fields: '*,people.*,addresses.*'
      }
    });
    return response.data;
  },
  
  createCompany: async (data) => {
    const response = await axios.post(`${API_BASE}/companies`, data);
    return response.data;
  },
  
  updateCompany: async (id, data) => {
    const response = await axios.patch(`${API_BASE}/companies/${id}`, data);
    return response.data;
  },
  
  deleteCompany: async (id) => {
    const response = await axios.delete(`${API_BASE}/companies/${id}`);
    return response.data;
  },
  
  // ============ STATISTIQUES CRM ============
  
  getStats: async (ourCompany = null) => {
    const filter = ourCompany ? { filter: { our_company_id: { _eq: ourCompany } } } : {};
    
    const [contactsRes, companiesRes] = await Promise.all([
      axios.get(`${API_BASE}/people`, { 
        params: { 
          aggregate: { count: '*' },
          groupBy: ['type'],
          ...filter 
        } 
      }),
      axios.get(`${API_BASE}/companies`, { 
        params: { 
          aggregate: { count: '*' },
          groupBy: ['type'],
          ...filter 
        } 
      })
    ]);
    
    return {
      contacts: contactsRes.data,
      companies: companiesRes.data
    };
  }
};

export default crmApi;
```

---

## 📝 FICHIER 3 : crm/hooks/useCRMData.js

```javascript
// src/frontend/src/portals/superadmin/crm/hooks/useCRMData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../services/crmApi';
import toast from 'react-hot-toast';

// ============ CONTACTS HOOKS ============

export const useContacts = (filters = {}) => {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => crmApi.getContacts(filters),
    staleTime: 30000,
  });
};

export const useContact = (id) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => crmApi.getContact(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => crmApi.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      queryClient.invalidateQueries(['crm-stats']);
      toast.success('Contact créé avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['contacts']);
      queryClient.invalidateQueries(['contact', variables.id]);
      toast.success('Contact mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => crmApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      queryClient.invalidateQueries(['crm-stats']);
      toast.success('Contact supprimé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ COMPANIES HOOKS ============

export const useCompanies = (filters = {}) => {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => crmApi.getCompanies(filters),
    staleTime: 30000,
  });
};

export const useCompany = (id) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => crmApi.getCompany(id),
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => crmApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      queryClient.invalidateQueries(['crm-stats']);
      toast.success('Entreprise créée avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['companies']);
      queryClient.invalidateQueries(['company', variables.id]);
      toast.success('Entreprise mise à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => crmApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      queryClient.invalidateQueries(['crm-stats']);
      toast.success('Entreprise supprimée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ STATS HOOK ============

export const useCRMStats = (ourCompany = null) => {
  return useQuery({
    queryKey: ['crm-stats', ourCompany],
    queryFn: () => crmApi.getStats(ourCompany),
    staleTime: 60000,
  });
};

// ============ SEARCH HOOK ============

export const useSearchContacts = (query) => {
  return useQuery({
    queryKey: ['contacts-search', query],
    queryFn: () => crmApi.searchContacts(query),
    enabled: query?.length >= 2,
    staleTime: 10000,
  });
};

// ============ COMBINED HOOK ============

export const useCRMData = (filters = {}) => {
  const contacts = useContacts(filters);
  const companies = useCompanies(filters);
  const stats = useCRMStats(filters.ourCompany);
  
  return {
    contacts,
    companies,
    stats,
    isLoading: contacts.isLoading || companies.isLoading,
    error: contacts.error || companies.error
  };
};

export default useCRMData;
```

---

## 📝 FICHIER 4 : crm/CRMDashboard.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/CRMDashboard.jsx
import React, { useState } from 'react';
import { 
  Users, Building2, RefreshCw, Plus, Search, Filter
} from 'lucide-react';
import { useCRMData, useCRMStats } from './hooks/useCRMData';
import ContactsList from './components/ContactsList';
import ContactForm from './components/ContactForm';
import CompaniesList from './components/CompaniesList';
import CompanyForm from './components/CompanyForm';
import QuickStats from './components/QuickStats';
import toast from 'react-hot-toast';

const OUR_COMPANIES = [
  { id: 'all', name: 'Toutes les entreprises' },
  { id: 'HYPERVISUAL', name: 'HYPERVISUAL' },
  { id: 'DAINAMICS', name: 'DAINAMICS' },
  { id: 'LEXAIA', name: 'LEXAIA' },
  { id: 'ENKI_REALTY', name: 'ENKI REALTY' },
  { id: 'TAKEOUT', name: 'TAKEOUT' }
];

const ENTITY_TYPES = [
  { id: 'all', label: 'Tous' },
  { id: 'prospect', label: 'Prospects' },
  { id: 'client', label: 'Clients' },
  { id: 'supplier', label: 'Fournisseurs' },
  { id: 'partner', label: 'Partenaires' }
];

const CRMDashboard = () => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Construire les filtres pour les requêtes
  const buildFilters = () => {
    const filters = {};
    if (selectedCompany !== 'all') {
      filters.filter = { ...filters.filter, our_company_id: { _eq: selectedCompany } };
    }
    if (typeFilter !== 'all') {
      filters.filter = { ...filters.filter, type: { _eq: typeFilter } };
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }
    return filters;
  };
  
  const filters = buildFilters();
  const { contacts, companies, stats, isLoading } = useCRMData({
    ...filters,
    ourCompany: selectedCompany !== 'all' ? selectedCompany : null
  });
  
  const handleRefresh = () => {
    contacts.refetch();
    companies.refetch();
    stats.refetch();
    toast.success('Données actualisées');
  };
  
  const handleCreate = () => {
    setEditItem(null);
    setShowForm(true);
  };
  
  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditItem(null);
  };
  
  const handleFormSuccess = () => {
    handleCloseForm();
    if (activeTab === 'contacts') {
      contacts.refetch();
    } else {
      companies.refetch();
    }
    stats.refetch();
  };
  
  const tabs = [
    { 
      id: 'contacts', 
      label: 'Contacts', 
      icon: Users, 
      count: contacts.data?.data?.length || 0 
    },
    { 
      id: 'companies', 
      label: 'Entreprises', 
      icon: Building2, 
      count: companies.data?.data?.length || 0 
    }
  ];

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Users className="me-2" size={24} />
              CRM
            </h2>
            <div className="text-muted mt-1">
              Gestion des contacts, clients et fournisseurs
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            {/* Filtre par entreprise */}
            <select 
              className="form-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ width: '200px' }}
            >
              {OUR_COMPANIES.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline-primary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            </button>
            
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={16} className="me-1" />
              {activeTab === 'contacts' ? 'Nouveau contact' : 'Nouvelle entreprise'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <QuickStats 
        stats={stats.data} 
        isLoading={stats.isLoading} 
      />

      {/* Barre de recherche et filtres */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="row align-items-center g-3">
            <div className="col-md-4">
              <div className="input-icon">
                <span className="input-icon-addon">
                  <Search size={16} />
                </span>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-5">
              <div className="btn-group">
                {ENTITY_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`btn btn-sm ${typeFilter === type.id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTypeFilter(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-3 text-end">
              <span className="text-muted">
                {activeTab === 'contacts' 
                  ? `${contacts.data?.data?.length || 0} contacts`
                  : `${companies.data?.data?.length || 0} entreprises`
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            {tabs.map(tab => (
              <li className="nav-item" key={tab.id}>
                <a 
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                >
                  <tab.icon size={16} className="me-2" />
                  {tab.label}
                  <span className="badge bg-secondary ms-2">{tab.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'contacts' && (
            <ContactsList 
              contacts={contacts.data?.data || []}
              isLoading={contacts.isLoading}
              onEdit={handleEdit}
              onRefresh={() => contacts.refetch()}
            />
          )}
          {activeTab === 'companies' && (
            <CompaniesList 
              companies={companies.data?.data || []}
              isLoading={companies.isLoading}
              onEdit={handleEdit}
              onRefresh={() => companies.refetch()}
            />
          )}
        </div>
      </div>

      {/* Modales formulaires */}
      {showForm && activeTab === 'contacts' && (
        <ContactForm 
          contact={editItem}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
      {showForm && activeTab === 'companies' && (
        <CompanyForm 
          company={editItem}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default CRMDashboard;
```

---

## 📝 FICHIER 5 : crm/components/QuickStats.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/components/QuickStats.jsx
import React from 'react';
import { Users, Building2, UserPlus, Briefcase, TrendingUp } from 'lucide-react';

const QuickStats = ({ stats, isLoading }) => {
  // Calculer les totaux depuis les données agrégées
  const calculateTotals = () => {
    if (!stats) return { 
      totalContacts: 0, 
      totalCompanies: 0,
      clients: 0,
      prospects: 0,
      suppliers: 0
    };
    
    const contactsByType = stats.contacts || [];
    const companiesByType = stats.companies || [];
    
    const totalContacts = contactsByType.reduce((sum, c) => sum + (c.count || 0), 0);
    const totalCompanies = companiesByType.reduce((sum, c) => sum + (c.count || 0), 0);
    
    const clients = contactsByType.find(c => c.type === 'client')?.count || 0;
    const prospects = contactsByType.find(c => c.type === 'prospect')?.count || 0;
    const suppliers = contactsByType.find(c => c.type === 'supplier')?.count || 0;
    
    return { totalContacts, totalCompanies, clients, prospects, suppliers };
  };
  
  const totals = calculateTotals();

  const cards = [
    { 
      label: 'Contacts', 
      value: totals.totalContacts, 
      icon: Users, 
      color: 'primary',
      subtitle: 'Total'
    },
    { 
      label: 'Entreprises', 
      value: totals.totalCompanies, 
      icon: Building2, 
      color: 'info',
      subtitle: 'Partenaires'
    },
    { 
      label: 'Clients', 
      value: totals.clients, 
      icon: Briefcase, 
      color: 'success',
      subtitle: 'Actifs'
    },
    { 
      label: 'Prospects', 
      value: totals.prospects, 
      icon: UserPlus, 
      color: 'warning',
      subtitle: 'À convertir'
    }
  ];

  return (
    <div className="row row-deck row-cards mb-4">
      {cards.map((card, index) => (
        <div className="col-sm-6 col-lg-3" key={index}>
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className={`avatar bg-${card.color}-lt me-3`}>
                  <card.icon size={20} className={`text-${card.color}`} />
                </div>
                <div className="subheader">{card.label}</div>
              </div>
              {isLoading ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-4 placeholder-lg"></span>
                </div>
              ) : (
                <>
                  <div className="h1 mb-0">{card.value.toLocaleString('fr-CH')}</div>
                  <div className="text-muted small">{card.subtitle}</div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
```

---

## 📝 FICHIER 6 : crm/components/ContactsList.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/components/ContactsList.jsx
import React from 'react';
import { 
  User, Mail, Phone, Building2, Edit, Trash2, 
  MoreVertical, Eye 
} from 'lucide-react';
import { useDeleteContact } from '../hooks/useCRMData';

const ContactsList = ({ contacts = [], isLoading, onEdit, onRefresh }) => {
  const deleteContact = useDeleteContact();
  
  const handleDelete = async (contact) => {
    if (!confirm(`Supprimer "${contact.first_name} ${contact.last_name}" ?`)) return;
    await deleteContact.mutateAsync(contact.id);
    onRefresh?.();
  };
  
  const getTypeBadge = (type) => {
    const badges = {
      prospect: { class: 'bg-blue-lt', label: 'Prospect' },
      client: { class: 'bg-green-lt', label: 'Client' },
      supplier: { class: 'bg-orange-lt', label: 'Fournisseur' },
      partner: { class: 'bg-purple-lt', label: 'Partenaire' },
      other: { class: 'bg-secondary', label: 'Autre' }
    };
    return badges[type] || badges.other;
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon"><User size={48} /></div>
        <p className="empty-title">Aucun contact</p>
        <p className="empty-subtitle text-muted">
          Créez votre premier contact pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-vcenter card-table table-hover">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Type</th>
            <th>Entreprise</th>
            <th>Téléphone</th>
            <th>Localisation</th>
            <th className="w-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => {
            const badge = getTypeBadge(contact.type);
            return (
              <tr key={contact.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="avatar avatar-sm bg-primary-lt me-2">
                      {contact.first_name?.[0]}{contact.last_name?.[0]}
                    </span>
                    <div>
                      <div className="font-weight-medium">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-muted small">
                        <Mail size={12} className="me-1" />
                        {contact.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${badge.class}`}>{badge.label}</span>
                  {contact.client_type && (
                    <span className="badge bg-secondary ms-1">{contact.client_type}</span>
                  )}
                </td>
                <td>
                  {contact.company_id ? (
                    <div className="d-flex align-items-center">
                      <Building2 size={14} className="me-1 text-muted" />
                      <span>{contact.company_id.name || contact.company_id}</span>
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {contact.phone || contact.mobile ? (
                    <div><Phone size={12} className="me-1" />{contact.phone || contact.mobile}</div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {contact.city ? (
                    <span>{contact.postal_code} {contact.city}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <div className="btn-list flex-nowrap">
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => onEdit(contact)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-ghost-secondary dropdown-toggle" 
                        data-bs-toggle="dropdown"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); onEdit(contact); }}
                        >
                          <Eye size={14} className="me-2" />
                          Voir détails
                        </a>
                        <div className="dropdown-divider"></div>
                        <a 
                          className="dropdown-item text-danger" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleDelete(contact); }}
                        >
                          <Trash2 size={14} className="me-2" />
                          Supprimer
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsList;
```

---

## 📝 FICHIER 7 : crm/components/ContactForm.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/components/ContactForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building2 } from 'lucide-react';
import { useCreateContact, useUpdateContact, useCompanies } from '../hooks/useCRMData';

const CANTONS_CH = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
];

const CONTACT_TYPES = [
  { id: 'prospect', label: 'Prospect' },
  { id: 'client', label: 'Client' },
  { id: 'supplier', label: 'Fournisseur' },
  { id: 'partner', label: 'Partenaire' },
  { id: 'other', label: 'Autre' }
];

const ContactForm = ({ contact, onClose, onSuccess }) => {
  const isEditing = !!contact;
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    type: 'prospect',
    client_type: 'B2B',
    company_id: null,
    position: '',
    address_line1: '',
    postal_code: '',
    city: '',
    canton: '',
    country: 'CH',
    default_payment_terms: 30,
    vat_number: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const { data: companiesData } = useCompanies();
  const companies = companiesData?.data || [];
  
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        type: contact.type || 'prospect',
        client_type: contact.client_type || 'B2B',
        company_id: contact.company_id?.id || contact.company_id || null,
        position: contact.position || '',
        address_line1: contact.address_line1 || '',
        postal_code: contact.postal_code || '',
        city: contact.city || '',
        canton: contact.canton || '',
        country: contact.country || 'CH',
        default_payment_terms: contact.default_payment_terms || 30,
        vat_number: contact.vat_number || '',
        notes: contact.notes || ''
      });
    }
  }, [contact]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'Prénom obligatoire';
    if (!formData.last_name.trim()) newErrors.last_name = 'Nom obligatoire';
    if (!formData.email.trim()) {
      newErrors.email = 'Email obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (formData.vat_number && !/^CHE-\d{3}\.\d{3}\.\d{3}( TVA)?$/.test(formData.vat_number)) {
      newErrors.vat_number = 'Format: CHE-XXX.XXX.XXX TVA';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (isEditing) {
        await updateContact.mutateAsync({ id: contact.id, data: formData });
      } else {
        await createContact.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const isPending = createContact.isPending || updateContact.isPending;

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <User size={20} className="me-2" />
              {isEditing ? 'Modifier le contact' : 'Nouveau contact'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Identification */}
              <h4 className="mb-3">Identification</h4>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label required">Prénom</label>
                  <input 
                    type="text"
                    className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                  />
                  {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label required">Nom</label>
                  <input 
                    type="text"
                    className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                  />
                  {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label required">Email</label>
                  <div className="input-icon">
                    <span className="input-icon-addon"><Mail size={16} /></span>
                    <input 
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                  {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label">Téléphone</label>
                  <input 
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Mobile</label>
                  <input 
                    type="tel"
                    className="form-control"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Classification */}
              <h4 className="mb-3">Classification</h4>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    {CONTACT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Catégorie</label>
                  <select 
                    className="form-select"
                    value={formData.client_type}
                    onChange={(e) => handleChange('client_type', e.target.value)}
                  >
                    <option value="B2B">B2B - Entreprise</option>
                    <option value="B2C">B2C - Particulier</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Entreprise</label>
                  <select 
                    className="form-select"
                    value={formData.company_id || ''}
                    onChange={(e) => handleChange('company_id', e.target.value || null)}
                  >
                    <option value="">-- Aucune --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Fonction</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="Ex: Directeur commercial"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">N° TVA</label>
                  <input 
                    type="text"
                    className={`form-control ${errors.vat_number ? 'is-invalid' : ''}`}
                    value={formData.vat_number}
                    onChange={(e) => handleChange('vat_number', e.target.value)}
                    placeholder="CHE-XXX.XXX.XXX TVA"
                  />
                  {errors.vat_number && <div className="invalid-feedback">{errors.vat_number}</div>}
                </div>
              </div>
              
              {/* Adresse */}
              <h4 className="mb-3">Adresse</h4>
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Adresse</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Code postal</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.postal_code}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Ville</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Canton</label>
                  <select 
                    className="form-select"
                    value={formData.canton}
                    onChange={(e) => handleChange('canton', e.target.value)}
                  >
                    <option value="">--</option>
                    {CANTONS_CH.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Pays</label>
                  <select 
                    className="form-select"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  >
                    <option value="CH">Suisse</option>
                    <option value="FR">France</option>
                    <option value="DE">Allemagne</option>
                  </select>
                </div>
              </div>
              
              {/* Options */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Délai paiement (jours)</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={formData.default_payment_terms}
                    onChange={(e) => handleChange('default_payment_terms', parseInt(e.target.value) || 30)}
                    min="0"
                    max="90"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="row">
                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                <Save size={16} className="me-1" />
                {isPending ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default ContactForm;
```

---

## 📝 FICHIER 8 : crm/components/CompaniesList.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/components/CompaniesList.jsx
import React from 'react';
import { 
  Building2, MapPin, Edit, Trash2, MoreVertical, Eye, Users 
} from 'lucide-react';
import { useDeleteCompany } from '../hooks/useCRMData';

const CompaniesList = ({ companies = [], isLoading, onEdit, onRefresh }) => {
  const deleteCompany = useDeleteCompany();
  
  const handleDelete = async (company) => {
    if (!confirm(`Supprimer "${company.name}" ?`)) return;
    await deleteCompany.mutateAsync(company.id);
    onRefresh?.();
  };
  
  const getTypeBadge = (type) => {
    const badges = {
      prospect: { class: 'bg-blue-lt', label: 'Prospect' },
      client: { class: 'bg-green-lt', label: 'Client' },
      supplier: { class: 'bg-orange-lt', label: 'Fournisseur' },
      partner: { class: 'bg-purple-lt', label: 'Partenaire' }
    };
    return badges[type] || { class: 'bg-secondary', label: type || 'Autre' };
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon"><Building2 size={48} /></div>
        <p className="empty-title">Aucune entreprise</p>
        <p className="empty-subtitle text-muted">
          Créez votre première entreprise pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-vcenter card-table table-hover">
        <thead>
          <tr>
            <th>Entreprise</th>
            <th>Type</th>
            <th>Contact principal</th>
            <th>Localisation</th>
            <th>IDE</th>
            <th className="w-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => {
            const badge = getTypeBadge(company.type);
            return (
              <tr key={company.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="avatar avatar-sm bg-info-lt me-2">
                      <Building2 size={16} />
                    </span>
                    <div>
                      <div className="font-weight-medium">{company.name}</div>
                      {company.legal_form && (
                        <div className="text-muted small">{company.legal_form}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${badge.class}`}>{badge.label}</span>
                </td>
                <td>
                  {company.main_contact_id ? (
                    <div className="d-flex align-items-center">
                      <Users size={14} className="me-1 text-muted" />
                      <span>
                        {company.main_contact_id.first_name} {company.main_contact_id.last_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {company.city ? (
                    <div className="d-flex align-items-center">
                      <MapPin size={14} className="me-1 text-muted" />
                      <span>{company.postal_code} {company.city}</span>
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {company.ide_number ? (
                    <code className="text-muted">{company.ide_number}</code>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <div className="btn-list flex-nowrap">
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => onEdit(company)}
                    >
                      <Edit size={16} />
                    </button>
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-ghost-secondary dropdown-toggle" 
                        data-bs-toggle="dropdown"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); onEdit(company); }}
                        >
                          <Eye size={14} className="me-2" />
                          Voir détails
                        </a>
                        <div className="dropdown-divider"></div>
                        <a 
                          className="dropdown-item text-danger" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleDelete(company); }}
                        >
                          <Trash2 size={14} className="me-2" />
                          Supprimer
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompaniesList;
```

---

## 📝 FICHIER 9 : crm/components/CompanyForm.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/components/CompanyForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Building2, MapPin } from 'lucide-react';
import { useCreateCompany, useUpdateCompany } from '../hooks/useCRMData';

const CANTONS_CH = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
];

const LEGAL_FORMS = [
  { id: 'SA', label: 'SA - Société Anonyme' },
  { id: 'Sarl', label: 'Sàrl - Société à responsabilité limitée' },
  { id: 'Raison_individuelle', label: 'Raison individuelle' },
  { id: 'SNC', label: 'SNC - Société en nom collectif' },
  { id: 'Association', label: 'Association' },
  { id: 'Fondation', label: 'Fondation' },
  { id: 'Cooperative', label: 'Coopérative' },
  { id: 'Autre', label: 'Autre' }
];

const COMPANY_TYPES = [
  { id: 'prospect', label: 'Prospect' },
  { id: 'client', label: 'Client' },
  { id: 'supplier', label: 'Fournisseur' },
  { id: 'partner', label: 'Partenaire' }
];

const CompanyForm = ({ company, onClose, onSuccess }) => {
  const isEditing = !!company;
  
  const [formData, setFormData] = useState({
    name: '',
    legal_form: '',
    type: 'prospect',
    ide_number: '',
    vat_number: '',
    address_line1: '',
    address_line2: '',
    postal_code: '',
    city: '',
    canton: '',
    country: 'CH',
    phone: '',
    email: '',
    website: '',
    default_payment_terms: 30,
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        legal_form: company.legal_form || '',
        type: company.type || 'prospect',
        ide_number: company.ide_number || '',
        vat_number: company.vat_number || '',
        address_line1: company.address_line1 || '',
        address_line2: company.address_line2 || '',
        postal_code: company.postal_code || '',
        city: company.city || '',
        canton: company.canton || '',
        country: company.country || 'CH',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        default_payment_terms: company.default_payment_terms || 30,
        notes: company.notes || ''
      });
    }
  }, [company]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nom obligatoire';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    // Validation IDE suisse : CHE-XXX.XXX.XXX
    if (formData.ide_number && !/^CHE-\d{3}\.\d{3}\.\d{3}$/.test(formData.ide_number)) {
      newErrors.ide_number = 'Format: CHE-XXX.XXX.XXX';
    }
    if (formData.vat_number && !/^CHE-\d{3}\.\d{3}\.\d{3}( TVA)?$/.test(formData.vat_number)) {
      newErrors.vat_number = 'Format: CHE-XXX.XXX.XXX TVA';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (isEditing) {
        await updateCompany.mutateAsync({ id: company.id, data: formData });
      } else {
        await createCompany.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const isPending = createCompany.isPending || updateCompany.isPending;

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Building2 size={20} className="me-2" />
              {isEditing ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Identification */}
              <h4 className="mb-3">Identification</h4>
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label required">Raison sociale</label>
                  <input 
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nom de l'entreprise"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Forme juridique</label>
                  <select 
                    className="form-select"
                    value={formData.legal_form}
                    onChange={(e) => handleChange('legal_form', e.target.value)}
                  >
                    <option value="">-- Choisir --</option>
                    {LEGAL_FORMS.map(lf => (
                      <option key={lf.id} value={lf.id}>{lf.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    {COMPANY_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">N° IDE</label>
                  <input 
                    type="text"
                    className={`form-control ${errors.ide_number ? 'is-invalid' : ''}`}
                    value={formData.ide_number}
                    onChange={(e) => handleChange('ide_number', e.target.value)}
                    placeholder="CHE-XXX.XXX.XXX"
                  />
                  {errors.ide_number && <div className="invalid-feedback">{errors.ide_number}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">N° TVA</label>
                  <input 
                    type="text"
                    className={`form-control ${errors.vat_number ? 'is-invalid' : ''}`}
                    value={formData.vat_number}
                    onChange={(e) => handleChange('vat_number', e.target.value)}
                    placeholder="CHE-XXX.XXX.XXX TVA"
                  />
                  {errors.vat_number && <div className="invalid-feedback">{errors.vat_number}</div>}
                </div>
              </div>
              
              {/* Coordonnées */}
              <h4 className="mb-3">Coordonnées</h4>
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Téléphone</label>
                  <input 
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input 
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Site web</label>
                  <input 
                    type="url"
                    className="form-control"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              {/* Adresse */}
              <h4 className="mb-3">Adresse</h4>
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Adresse</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                    placeholder="Rue et numéro"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12">
                  <label className="form-label">Complément</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.address_line2}
                    onChange={(e) => handleChange('address_line2', e.target.value)}
                    placeholder="Case postale, bâtiment, etc."
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Code postal</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.postal_code}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Ville</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Canton</label>
                  <select 
                    className="form-select"
                    value={formData.canton}
                    onChange={(e) => handleChange('canton', e.target.value)}
                  >
                    <option value="">--</option>
                    {CANTONS_CH.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Pays</label>
                  <select 
                    className="form-select"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  >
                    <option value="CH">Suisse</option>
                    <option value="FR">France</option>
                    <option value="DE">Allemagne</option>
                  </select>
                </div>
              </div>
              
              {/* Options */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Délai paiement (jours)</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={formData.default_payment_terms}
                    onChange={(e) => handleChange('default_payment_terms', parseInt(e.target.value) || 30)}
                    min="0"
                    max="90"
                  />
                </div>
              </div>
              
              {/* Notes */}
              <div className="row">
                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-control"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                <Save size={16} className="me-1" />
                {isPending ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default CompanyForm;
```

---

# PARTIE 2 : MODULE SETTINGS

---

## 📝 FICHIER 10 : settings/index.js

```javascript
// src/frontend/src/portals/superadmin/settings/index.js
export { default as SettingsDashboard } from './SettingsDashboard';
export { default as settingsApi } from './services/settingsApi';
export * from './hooks/useSettingsData';
```

---

## 📝 FICHIER 11 : settings/services/settingsApi.js

```javascript
// src/frontend/src/portals/superadmin/settings/services/settingsApi.js
import axios from 'axios';

const API_BASE = '/items';

export const settingsApi = {
  // ============ OUR COMPANIES (nos entreprises) ============
  
  getOurCompanies: async () => {
    const response = await axios.get(`${API_BASE}/our_companies`, {
      params: {
        fields: '*',
        sort: 'name'
      }
    });
    return response.data;
  },
  
  getOurCompany: async (id) => {
    const response = await axios.get(`${API_BASE}/our_companies/${id}`, {
      params: {
        fields: '*,bank_accounts.*'
      }
    });
    return response.data;
  },
  
  updateOurCompany: async (id, data) => {
    const response = await axios.patch(`${API_BASE}/our_companies/${id}`, data);
    return response.data;
  },
  
  // ============ INVOICE SETTINGS ============
  
  getInvoiceSettings: async (companyId) => {
    const response = await axios.get(`${API_BASE}/invoice_settings`, {
      params: {
        filter: { company_id: { _eq: companyId } },
        fields: '*'
      }
    });
    return response.data?.data?.[0] || null;
  },
  
  updateInvoiceSettings: async (id, data) => {
    const response = await axios.patch(`${API_BASE}/invoice_settings/${id}`, data);
    return response.data;
  },
  
  createInvoiceSettings: async (data) => {
    const response = await axios.post(`${API_BASE}/invoice_settings`, data);
    return response.data;
  },
  
  // ============ TAX SETTINGS (TVA) ============
  
  getTaxRates: async () => {
    const response = await axios.get(`${API_BASE}/tax_rates`, {
      params: {
        fields: '*',
        sort: '-rate'
      }
    });
    return response.data;
  },
  
  updateTaxRate: async (id, data) => {
    const response = await axios.patch(`${API_BASE}/tax_rates/${id}`, data);
    return response.data;
  },
  
  // ============ PRODUCTS / SERVICES ============
  
  getProducts: async (params = {}) => {
    const response = await axios.get(`${API_BASE}/products`, {
      params: {
        fields: '*',
        sort: 'name',
        limit: params.limit || 100,
        ...params
      }
    });
    return response.data;
  },
  
  getProduct: async (id) => {
    const response = await axios.get(`${API_BASE}/products/${id}`);
    return response.data;
  },
  
  createProduct: async (data) => {
    const response = await axios.post(`${API_BASE}/products`, data);
    return response.data;
  },
  
  updateProduct: async (id, data) => {
    const response = await axios.patch(`${API_BASE}/products/${id}`, data);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await axios.delete(`${API_BASE}/products/${id}`);
    return response.data;
  },
  
  // ============ USERS ============
  
  getUsers: async () => {
    const response = await axios.get('/users', {
      params: {
        fields: 'id,first_name,last_name,email,role,status,last_access',
        sort: 'first_name'
      }
    });
    return response.data;
  },
  
  getUser: async (id) => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },
  
  updateUser: async (id, data) => {
    const response = await axios.patch(`/users/${id}`, data);
    return response.data;
  }
};

export default settingsApi;
```

---

## 📝 FICHIER 12 : settings/hooks/useSettingsData.js

```javascript
// src/frontend/src/portals/superadmin/settings/hooks/useSettingsData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/settingsApi';
import toast from 'react-hot-toast';

// ============ OUR COMPANIES ============

export const useOurCompanies = () => {
  return useQuery({
    queryKey: ['our-companies'],
    queryFn: () => settingsApi.getOurCompanies(),
    staleTime: 300000, // 5 minutes
  });
};

export const useOurCompany = (id) => {
  return useQuery({
    queryKey: ['our-company', id],
    queryFn: () => settingsApi.getOurCompany(id),
    enabled: !!id,
  });
};

export const useUpdateOurCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateOurCompany(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['our-companies']);
      queryClient.invalidateQueries(['our-company', variables.id]);
      toast.success('Entreprise mise à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ INVOICE SETTINGS ============

export const useInvoiceSettings = (companyId) => {
  return useQuery({
    queryKey: ['invoice-settings', companyId],
    queryFn: () => settingsApi.getInvoiceSettings(companyId),
    enabled: !!companyId,
  });
};

export const useUpdateInvoiceSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateInvoiceSettings(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoice-settings']);
      toast.success('Paramètres de facturation mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ TAX RATES ============

export const useTaxRates = () => {
  return useQuery({
    queryKey: ['tax-rates'],
    queryFn: () => settingsApi.getTaxRates(),
    staleTime: 600000, // 10 minutes
  });
};

export const useUpdateTaxRate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateTaxRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-rates']);
      toast.success('Taux TVA mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ PRODUCTS ============

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => settingsApi.getProducts(params),
    staleTime: 60000,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => settingsApi.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => settingsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produit créé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', variables.id]);
      toast.success('Produit mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => settingsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produit supprimé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// ============ USERS ============

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => settingsApi.getUsers(),
    staleTime: 120000,
  });
};

// ============ COMBINED HOOK ============

export const useSettingsData = (companyId) => {
  const ourCompanies = useOurCompanies();
  const invoiceSettings = useInvoiceSettings(companyId);
  const taxRates = useTaxRates();
  const products = useProducts();
  
  return {
    ourCompanies,
    invoiceSettings,
    taxRates,
    products,
    isLoading: ourCompanies.isLoading || invoiceSettings.isLoading,
    error: ourCompanies.error || invoiceSettings.error
  };
};

export default useSettingsData;
```

---

## 📝 FICHIER 13 : settings/SettingsDashboard.jsx

```javascript
// src/frontend/src/portals/superadmin/settings/SettingsDashboard.jsx
import React, { useState } from 'react';
import { 
  Settings, Building2, FileText, Percent, Package, Users, RefreshCw
} from 'lucide-react';
import { useOurCompanies } from './hooks/useSettingsData';
import CompanySettings from './components/CompanySettings';
import InvoiceSettings from './components/InvoiceSettings';
import TaxSettings from './components/TaxSettings';
import ProductsList from './components/ProductsList';
import toast from 'react-hot-toast';

const SettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const { data: companiesData, isLoading, refetch } = useOurCompanies();
  const companies = companiesData?.data || [];
  
  // Auto-sélectionner la première entreprise
  React.useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0].id);
    }
  }, [companies, selectedCompany]);
  
  const handleRefresh = () => {
    refetch();
    toast.success('Données actualisées');
  };
  
  const tabs = [
    { id: 'company', label: 'Mon entreprise', icon: Building2 },
    { id: 'invoicing', label: 'Facturation', icon: FileText },
    { id: 'taxes', label: 'TVA', icon: Percent },
    { id: 'products', label: 'Produits', icon: Package }
  ];

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Settings className="me-2" size={24} />
              Paramètres
            </h2>
            <div className="text-muted mt-1">
              Configuration de votre entreprise et facturation
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            {/* Sélecteur entreprise */}
            <select 
              className="form-select"
              value={selectedCompany || ''}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ width: '220px' }}
              disabled={isLoading}
            >
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            
            <button 
              className="btn btn-outline-primary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            {tabs.map(tab => (
              <li className="nav-item" key={tab.id}>
                <a 
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}
                >
                  <tab.icon size={16} className="me-2" />
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          {!selectedCompany ? (
            <div className="text-center py-5 text-muted">
              Sélectionnez une entreprise
            </div>
          ) : (
            <>
              {activeTab === 'company' && (
                <CompanySettings companyId={selectedCompany} />
              )}
              {activeTab === 'invoicing' && (
                <InvoiceSettings companyId={selectedCompany} />
              )}
              {activeTab === 'taxes' && (
                <TaxSettings />
              )}
              {activeTab === 'products' && (
                <ProductsList companyId={selectedCompany} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
```

---

## 📝 FICHIER 14 : settings/components/CompanySettings.jsx

```javascript
// src/frontend/src/portals/superadmin/settings/components/CompanySettings.jsx
import React, { useState, useEffect } from 'react';
import { Save, Building2, Upload, CreditCard } from 'lucide-react';
import { useOurCompany, useUpdateOurCompany } from '../hooks/useSettingsData';

const CANTONS_CH = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
];

const CompanySettings = ({ companyId }) => {
  const { data: companyData, isLoading } = useOurCompany(companyId);
  const updateCompany = useUpdateOurCompany();
  const company = companyData?.data;
  
  const [formData, setFormData] = useState({
    name: '',
    legal_form: '',
    ide_number: '',
    vat_number: '',
    address_line1: '',
    address_line2: '',
    postal_code: '',
    city: '',
    canton: '',
    country: 'CH',
    phone: '',
    email: '',
    website: '',
    // Coordonnées bancaires
    bank_name: '',
    bank_iban: '',
    bank_bic: ''
  });
  
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        legal_form: company.legal_form || '',
        ide_number: company.ide_number || '',
        vat_number: company.vat_number || '',
        address_line1: company.address_line1 || '',
        address_line2: company.address_line2 || '',
        postal_code: company.postal_code || '',
        city: company.city || '',
        canton: company.canton || '',
        country: company.country || 'CH',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        bank_name: company.bank_name || '',
        bank_iban: company.bank_iban || '',
        bank_bic: company.bank_bic || ''
      });
    }
  }, [company]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCompany.mutateAsync({ id: companyId, data: formData });
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Identification */}
      <h4 className="mb-3">
        <Building2 size={18} className="me-2" />
        Identification
      </h4>
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Raison sociale</label>
          <input 
            type="text"
            className="form-control"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">N° IDE</label>
          <input 
            type="text"
            className="form-control"
            value={formData.ide_number}
            onChange={(e) => handleChange('ide_number', e.target.value)}
            placeholder="CHE-XXX.XXX.XXX"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">N° TVA</label>
          <input 
            type="text"
            className="form-control"
            value={formData.vat_number}
            onChange={(e) => handleChange('vat_number', e.target.value)}
            placeholder="CHE-XXX.XXX.XXX TVA"
          />
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Téléphone</label>
          <input 
            type="tel"
            className="form-control"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Email</label>
          <input 
            type="email"
            className="form-control"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Site web</label>
          <input 
            type="url"
            className="form-control"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>
      </div>
      
      {/* Adresse */}
      <h4 className="mb-3">Adresse du siège</h4>
      <div className="row mb-3">
        <div className="col-12">
          <label className="form-label">Adresse</label>
          <input 
            type="text"
            className="form-control"
            value={formData.address_line1}
            onChange={(e) => handleChange('address_line1', e.target.value)}
          />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">Code postal</label>
          <input 
            type="text"
            className="form-control"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <label className="form-label">Ville</label>
          <input 
            type="text"
            className="form-control"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Canton</label>
          <select 
            className="form-select"
            value={formData.canton}
            onChange={(e) => handleChange('canton', e.target.value)}
          >
            <option value="">--</option>
            {CANTONS_CH.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Pays</label>
          <select 
            className="form-select"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
          >
            <option value="CH">Suisse</option>
            <option value="FR">France</option>
            <option value="DE">Allemagne</option>
          </select>
        </div>
      </div>
      
      {/* Coordonnées bancaires */}
      <h4 className="mb-3">
        <CreditCard size={18} className="me-2" />
        Coordonnées bancaires (pour QR-factures)
      </h4>
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Banque</label>
          <input 
            type="text"
            className="form-control"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
            placeholder="Ex: PostFinance"
          />
        </div>
        <div className="col-md-5">
          <label className="form-label">IBAN</label>
          <input 
            type="text"
            className="form-control"
            value={formData.bank_iban}
            onChange={(e) => handleChange('bank_iban', e.target.value)}
            placeholder="CH00 0000 0000 0000 0000 0"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">BIC/SWIFT</label>
          <input 
            type="text"
            className="form-control"
            value={formData.bank_bic}
            onChange={(e) => handleChange('bank_bic', e.target.value)}
            placeholder="POFICHBEXXX"
          />
        </div>
      </div>
      
      {/* Bouton sauvegarder */}
      <div className="d-flex justify-content-end">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={updateCompany.isPending}
        >
          <Save size={16} className="me-1" />
          {updateCompany.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
};

export default CompanySettings;
```

---

## 📝 FICHIER 15 : settings/components/InvoiceSettings.jsx

```javascript
// src/frontend/src/portals/superadmin/settings/components/InvoiceSettings.jsx
import React, { useState, useEffect } from 'react';
import { Save, FileText, Info } from 'lucide-react';
import { useInvoiceSettings, useUpdateInvoiceSettings } from '../hooks/useSettingsData';

const InvoiceSettings = ({ companyId }) => {
  const { data: settings, isLoading } = useInvoiceSettings(companyId);
  const updateSettings = useUpdateInvoiceSettings();
  
  const [formData, setFormData] = useState({
    // Préfixes et numérotation
    invoice_prefix: 'FA',
    quote_prefix: 'DE',
    credit_prefix: 'AV',
    next_invoice_number: 1,
    next_quote_number: 1,
    
    // Conditions
    default_payment_terms: 30,
    default_quote_validity: 30,
    late_payment_rate: 5.0,
    
    // Textes par défaut
    default_invoice_footer: '',
    default_quote_footer: '',
    bank_details_text: '',
    
    // Options
    auto_send_reminders: true,
    reminder_days: [7, 14, 30],
    include_qr_code: true
  });
  
  useEffect(() => {
    if (settings) {
      setFormData({
        invoice_prefix: settings.invoice_prefix || 'FA',
        quote_prefix: settings.quote_prefix || 'DE',
        credit_prefix: settings.credit_prefix || 'AV',
        next_invoice_number: settings.next_invoice_number || 1,
        next_quote_number: settings.next_quote_number || 1,
        default_payment_terms: settings.default_payment_terms || 30,
        default_quote_validity: settings.default_quote_validity || 30,
        late_payment_rate: settings.late_payment_rate || 5.0,
        default_invoice_footer: settings.default_invoice_footer || '',
        default_quote_footer: settings.default_quote_footer || '',
        bank_details_text: settings.bank_details_text || '',
        auto_send_reminders: settings.auto_send_reminders ?? true,
        include_qr_code: settings.include_qr_code ?? true
      });
    }
  }, [settings]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (settings?.id) {
      await updateSettings.mutateAsync({ id: settings.id, data: formData });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Numérotation */}
      <h4 className="mb-3">
        <FileText size={18} className="me-2" />
        Numérotation des documents
      </h4>
      <div className="row mb-4">
        <div className="col-md-3">
          <label className="form-label">Préfixe factures</label>
          <input 
            type="text"
            className="form-control"
            value={formData.invoice_prefix}
            onChange={(e) => handleChange('invoice_prefix', e.target.value)}
            maxLength="5"
          />
          <small className="text-muted">Ex: FA-2025-0001</small>
        </div>
        <div className="col-md-3">
          <label className="form-label">Préfixe devis</label>
          <input 
            type="text"
            className="form-control"
            value={formData.quote_prefix}
            onChange={(e) => handleChange('quote_prefix', e.target.value)}
            maxLength="5"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Préfixe avoirs</label>
          <input 
            type="text"
            className="form-control"
            value={formData.credit_prefix}
            onChange={(e) => handleChange('credit_prefix', e.target.value)}
            maxLength="5"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Prochain n° facture</label>
          <input 
            type="number"
            className="form-control"
            value={formData.next_invoice_number}
            onChange={(e) => handleChange('next_invoice_number', parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>
      
      {/* Conditions */}
      <h4 className="mb-3">Conditions par défaut</h4>
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Délai paiement (jours)</label>
          <input 
            type="number"
            className="form-control"
            value={formData.default_payment_terms}
            onChange={(e) => handleChange('default_payment_terms', parseInt(e.target.value) || 30)}
            min="0"
            max="90"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Validité devis (jours)</label>
          <input 
            type="number"
            className="form-control"
            value={formData.default_quote_validity}
            onChange={(e) => handleChange('default_quote_validity', parseInt(e.target.value) || 30)}
            min="1"
            max="365"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Taux intérêts retard (%)</label>
          <input 
            type="number"
            className="form-control"
            value={formData.late_payment_rate}
            onChange={(e) => handleChange('late_payment_rate', parseFloat(e.target.value) || 5.0)}
            min="0"
            max="15"
            step="0.1"
          />
          <small className="text-muted">Art. 104 CO: 5% par défaut</small>
        </div>
      </div>
      
      {/* Options */}
      <h4 className="mb-3">Options</h4>
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-check">
            <input 
              type="checkbox"
              className="form-check-input"
              checked={formData.include_qr_code}
              onChange={(e) => handleChange('include_qr_code', e.target.checked)}
            />
            <span className="form-check-label">
              Inclure QR-code Swiss QR sur les factures
            </span>
          </label>
          <div className="text-muted small mt-1">
            <Info size={12} className="me-1" />
            Obligatoire depuis juin 2020 pour les factures suisses
          </div>
        </div>
        <div className="col-md-6">
          <label className="form-check">
            <input 
              type="checkbox"
              className="form-check-input"
              checked={formData.auto_send_reminders}
              onChange={(e) => handleChange('auto_send_reminders', e.target.checked)}
            />
            <span className="form-check-label">
              Envoi automatique des rappels
            </span>
          </label>
        </div>
      </div>
      
      {/* Textes par défaut */}
      <h4 className="mb-3">Textes par défaut</h4>
      <div className="row mb-4">
        <div className="col-md-6">
          <label className="form-label">Pied de page factures</label>
          <textarea 
            className="form-control"
            rows="3"
            value={formData.default_invoice_footer}
            onChange={(e) => handleChange('default_invoice_footer', e.target.value)}
            placeholder="Merci pour votre confiance..."
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Pied de page devis</label>
          <textarea 
            className="form-control"
            rows="3"
            value={formData.default_quote_footer}
            onChange={(e) => handleChange('default_quote_footer', e.target.value)}
            placeholder="Ce devis est valable..."
          />
        </div>
      </div>
      
      {/* Bouton sauvegarder */}
      <div className="d-flex justify-content-end">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={updateSettings.isPending}
        >
          <Save size={16} className="me-1" />
          {updateSettings.isPending ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default InvoiceSettings;
```

---

## 📝 FICHIER 16 : settings/components/TaxSettings.jsx

```javascript
// src/frontend/src/portals/superadmin/settings/components/TaxSettings.jsx
import React from 'react';
import { Percent, Info, AlertTriangle } from 'lucide-react';
import { useTaxRates, useUpdateTaxRate } from '../hooks/useSettingsData';

const TaxSettings = () => {
  const { data: taxRatesData, isLoading } = useTaxRates();
  const updateTaxRate = useUpdateTaxRate();
  const taxRates = taxRatesData?.data || [];
  
  // Taux TVA suisse 2025
  const SWISS_VAT_2025 = [
    { code: 'normal', rate: 8.1, label: 'Taux normal', description: 'Biens et services standard' },
    { code: 'reduced', rate: 2.6, label: 'Taux réduit', description: 'Alimentation, médicaments, livres, etc.' },
    { code: 'special', rate: 3.8, label: 'Taux hébergement', description: 'Prestations hôtelières' },
    { code: 'exempt', rate: 0, label: 'Exonéré', description: 'Exportations, santé, éducation, etc.' }
  ];

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      {/* Info légale */}
      <div className="alert alert-info mb-4">
        <div className="d-flex">
          <Info size={20} className="me-2 flex-shrink-0" />
          <div>
            <h4 className="alert-title">Taux TVA suisse 2025</h4>
            <div className="text-muted">
              Ces taux sont fixés par l'AFC (Administration fédérale des contributions) 
              et sont en vigueur depuis le 1er janvier 2024.
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des taux */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Type de taux</th>
              <th>Taux (%)</th>
              <th>Description</th>
              <th>Code comptable</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {SWISS_VAT_2025.map(vat => {
              const dbRate = taxRates.find(r => r.code === vat.code);
              const isCorrect = !dbRate || dbRate.rate === vat.rate;
              
              return (
                <tr key={vat.code}>
                  <td>
                    <div className="font-weight-medium">{vat.label}</div>
                  </td>
                  <td>
                    <span className="badge bg-primary fs-6">
                      {vat.rate}%
                    </span>
                  </td>
                  <td>
                    <span className="text-muted">{vat.description}</span>
                  </td>
                  <td>
                    <code>{vat.code.toUpperCase()}</code>
                  </td>
                  <td>
                    {isCorrect ? (
                      <span className="badge bg-success-lt">
                        <Percent size={12} className="me-1" />
                        Conforme
                      </span>
                    ) : (
                      <span className="badge bg-warning-lt">
                        <AlertTriangle size={12} className="me-1" />
                        À vérifier
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Note légale */}
      <div className="alert alert-warning mt-4">
        <div className="d-flex">
          <AlertTriangle size={20} className="me-2 flex-shrink-0" />
          <div>
            <strong>Important:</strong> Ces taux sont déterminés par la loi fédérale. 
            Toute modification doit être conforme aux directives de l'AFC. 
            Contactez votre fiduciaire en cas de doute.
          </div>
        </div>
      </div>
      
      {/* Lien AFC */}
      <div className="mt-3">
        <a 
          href="https://www.estv.admin.ch/estv/fr/accueil/taxe-sur-la-valeur-ajoutee.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-outline-primary btn-sm"
        >
          <Info size={14} className="me-1" />
          Site officiel AFC - TVA
        </a>
      </div>
    </div>
  );
};

export default TaxSettings;
```

---

## 📝 FICHIER 17 : settings/components/ProductsList.jsx

```javascript
// src/frontend/src/portals/superadmin/settings/components/ProductsList.jsx
import React, { useState } from 'react';
import { 
  Package, Plus, Edit, Trash2, MoreVertical, Search, Filter 
} from 'lucide-react';
import { useProducts, useDeleteProduct } from '../hooks/useSettingsData';
import ProductForm from './ProductForm';

const ProductsList = ({ companyId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: productsData, isLoading, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();
  
  const products = productsData?.data || [];
  
  // Filtrage
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });
  
  const handleCreate = () => {
    setEditProduct(null);
    setShowForm(true);
  };
  
  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };
  
  const handleDelete = async (product) => {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;
    await deleteProduct.mutateAsync(product.id);
    refetch();
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setEditProduct(null);
  };
  
  const handleFormSuccess = () => {
    handleFormClose();
    refetch();
  };
  
  const getTypeBadge = (type) => {
    const badges = {
      product: { class: 'bg-blue-lt', label: 'Produit' },
      service: { class: 'bg-green-lt', label: 'Service' },
      subscription: { class: 'bg-purple-lt', label: 'Abonnement' }
    };
    return badges[type] || { class: 'bg-secondary', label: type };
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      {/* Header avec filtres */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <div className="input-icon" style={{ width: '250px' }}>
            <span className="input-icon-addon">
              <Search size={16} />
            </span>
            <input 
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">Tous types</option>
            <option value="product">Produits</option>
            <option value="service">Services</option>
            <option value="subscription">Abonnements</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          <Plus size={16} className="me-1" />
          Nouveau produit
        </button>
      </div>

      {/* Liste */}
      {filteredProducts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><Package size={48} /></div>
          <p className="empty-title">Aucun produit</p>
          <p className="empty-subtitle text-muted">
            Créez vos produits et services pour les utiliser dans vos devis et factures.
          </p>
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} className="me-1" />
            Créer un produit
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>Produit/Service</th>
                <th>Type</th>
                <th>Prix HT</th>
                <th>TVA</th>
                <th>Unité</th>
                <th className="w-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const badge = getTypeBadge(product.type);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="avatar avatar-sm bg-primary-lt me-2">
                          <Package size={16} />
                        </span>
                        <div>
                          <div className="font-weight-medium">{product.name}</div>
                          {product.sku && (
                            <div className="text-muted small">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${badge.class}`}>{badge.label}</span>
                    </td>
                    <td>
                      <span className="font-weight-medium">
                        CHF {parseFloat(product.price || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted">{product.tax_rate || 8.1}%</span>
                    </td>
                    <td>
                      <span className="text-muted">{product.unit || 'pce'}</span>
                    </td>
                    <td>
                      <div className="btn-list flex-nowrap">
                        <button 
                          className="btn btn-sm btn-ghost-primary"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <ProductForm 
          product={editProduct}
          companyId={companyId}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default ProductsList;
```

---

## 📝 FICHIER 18 : settings/components/ProductForm.jsx

```javascript
// src/frontend/src/portals/superadmin/settings/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../hooks/useSettingsData';

const PRODUCT_TYPES = [
  { id: 'product', label: 'Produit' },
  { id: 'service', label: 'Service' },
  { id: 'subscription', label: 'Abonnement' }
];

const UNITS = [
  { id: 'pce', label: 'Pièce' },
  { id: 'h', label: 'Heure' },
  { id: 'j', label: 'Jour' },
  { id: 'forfait', label: 'Forfait' },
  { id: 'mois', label: 'Mois' },
  { id: 'an', label: 'Année' },
  { id: 'kg', label: 'Kilogramme' },
  { id: 'm', label: 'Mètre' },
  { id: 'm2', label: 'Mètre carré' }
];

const TAX_RATES = [
  { value: 8.1, label: '8.1% - Taux normal' },
  { value: 2.6, label: '2.6% - Taux réduit' },
  { value: 3.8, label: '3.8% - Hébergement' },
  { value: 0, label: '0% - Exonéré' }
];

const ProductForm = ({ product, companyId, onClose, onSuccess }) => {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    type: 'service',
    description: '',
    price: '',
    tax_rate: 8.1,
    unit: 'h',
    is_active: true,
    company_id: companyId
  });
  
  const [errors, setErrors] = useState({});
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        type: product.type || 'service',
        description: product.description || '',
        price: product.price || '',
        tax_rate: product.tax_rate ?? 8.1,
        unit: product.unit || 'h',
        is_active: product.is_active ?? true,
        company_id: product.company_id || companyId
      });
    }
  }, [product, companyId]);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nom obligatoire';
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Prix invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const data = {
      ...formData,
      price: parseFloat(formData.price)
    };
    
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="modal modal-blur fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <Package size={20} className="me-2" />
              {isEditing ? 'Modifier le produit' : 'Nouveau produit/service'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-8">
                  <label className="form-label required">Nom</label>
                  <input 
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Consultation stratégique"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>
                <div className="col-4">
                  <label className="form-label">SKU/Réf.</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    placeholder="CONS-001"
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    {PRODUCT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Unité</label>
                  <select 
                    className="form-select"
                    value={formData.unit}
                    onChange={(e) => handleChange('unit', e.target.value)}
                  >
                    {UNITS.map(u => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label required">Prix unitaire HT (CHF)</label>
                  <input 
                    type="number"
                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="150.00"
                  />
                  {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                </div>
                <div className="col-6">
                  <label className="form-label">Taux TVA</label>
                  <select 
                    className="form-select"
                    value={formData.tax_rate}
                    onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value))}
                  >
                    {TAX_RATES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description pour les devis et factures..."
                />
              </div>
              
              <div className="mb-3">
                <label className="form-check">
                  <input 
                    type="checkbox"
                    className="form-check-input"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                  />
                  <span className="form-check-label">Produit actif</span>
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                <Save size={16} className="me-1" />
                {isPending ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default ProductForm;
```

---

# INTÉGRATION FINALE

---

## 📝 MISE À JOUR DU ROUTER (App.jsx)

Ajouter ces imports et routes dans `src/frontend/src/App.jsx` :

```javascript
// Imports
import { CRMDashboard } from './portals/superadmin/crm';
import { SettingsDashboard } from './portals/superadmin/settings';

// Routes à ajouter dans le Router
<Route path="/superadmin/crm" element={<CRMDashboard />} />
<Route path="/superadmin/settings" element={<SettingsDashboard />} />
```

---

## 📝 MISE À JOUR DE LA NAVIGATION SIDEBAR

Ajouter ces sections dans le composant Sidebar :

```javascript
// Section Commercial
{
  title: 'COMMERCIAL',
  items: [
    { label: 'CRM', icon: Users, path: '/superadmin/crm' }
  ]
},

// Section Configuration
{
  title: 'CONFIGURATION',
  items: [
    { label: 'Paramètres', icon: Settings, path: '/superadmin/settings' }
  ]
}
```

---

## 🧪 TESTS À EFFECTUER

1. **Module CRM**
   - [ ] Affichage liste contacts avec pagination
   - [ ] Création nouveau contact avec validation
   - [ ] Modification contact existant
   - [ ] Suppression contact avec confirmation
   - [ ] Recherche et filtres (type, entreprise)
   - [ ] Affichage liste entreprises
   - [ ] CRUD entreprises
   - [ ] Statistiques rapides

2. **Module Settings**
   - [ ] Sélection entreprise
   - [ ] Modification infos entreprise
   - [ ] Configuration facturation (préfixes, numéros)
   - [ ] Affichage taux TVA suisse 2025
   - [ ] CRUD produits/services
   - [ ] Calcul prix TTC

---

## 📋 COMMIT MESSAGE

```
feat(frontend): Module CRM et Settings complet

CRM Module:
- CRMDashboard: Gestion contacts et entreprises
- ContactsList/ContactForm: CRUD contacts
- CompaniesList/CompanyForm: CRUD entreprises  
- QuickStats: KPIs (clients, prospects, fournisseurs)
- Recherche et filtres par type

Settings Module:
- SettingsDashboard: Navigation par onglets
- CompanySettings: Configuration entreprise (IDE, TVA, banque)
- InvoiceSettings: Paramètres facturation (préfixes, délais, QR)
- TaxSettings: Taux TVA suisse 2025 (8.1%, 2.6%, 3.8%, 0%)
- ProductsList/ProductForm: Catalogue produits/services

Collections Directus utilisées:
- people (contacts)
- companies (entreprises externes)
- our_companies (nos 5 entreprises)
- products (catalogue)
- invoice_settings (config facturation)
- tax_rates (TVA)
```

---

## 📊 RAPPORT D'EXÉCUTION ATTENDU

Créer `RAPPORT-12-CRM-SETTINGS.md` avec :
1. ✅ Liste des 18 fichiers créés
2. ✅ Collections Directus utilisées
3. ✅ Tests effectués
4. ✅ Captures d'écran (si possible)
5. ✅ Problèmes rencontrés et solutions

---

## ✅ FIN DU PROMPT F-12
