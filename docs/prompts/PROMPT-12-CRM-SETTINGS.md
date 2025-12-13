# PROMPT 12 - MODULE CRM & CONFIGURATION

## CONTEXTE
Après analyse des workflows métier (voir docs/ANALYSE-WORKFLOWS-COMPLET.md), les modules CRM et Configuration sont CRITIQUES car ils sont les prérequis pour tous les autres flux (devis, factures, projets).

## OBJECTIF
Créer les modules :
1. **CRM** : Gestion contacts et entreprises (clients, fournisseurs, prospects)
2. **Settings** : Configuration entreprise, facturation, utilisateurs, produits

---

## STRUCTURE À CRÉER

```
src/frontend/src/portals/superadmin/
├── crm/
│   ├── CRMDashboard.jsx
│   ├── index.js
│   ├── components/
│   │   ├── ContactsList.jsx
│   │   ├── ContactForm.jsx
│   │   ├── ContactDetail.jsx
│   │   ├── CompaniesList.jsx
│   │   ├── CompanyForm.jsx
│   │   ├── CompanyDetail.jsx
│   │   ├── AddressForm.jsx
│   │   └── QuickStats.jsx
│   ├── hooks/
│   │   └── useCRMData.js
│   └── services/
│       └── crmApi.js
│
├── settings/
│   ├── SettingsDashboard.jsx
│   ├── index.js
│   ├── components/
│   │   ├── CompanySettings.jsx
│   │   ├── InvoiceSettings.jsx
│   │   ├── TaxSettings.jsx
│   │   ├── BankSettings.jsx
│   │   ├── UsersList.jsx
│   │   ├── UserForm.jsx
│   │   ├── ProductsList.jsx
│   │   └── ProductForm.jsx
│   ├── hooks/
│   │   └── useSettingsData.js
│   └── services/
│       └── settingsApi.js
```

---

## FICHIER 1 : crmApi.js

```javascript
// src/frontend/src/portals/superadmin/crm/services/crmApi.js
import axios from 'axios';

const DIRECTUS_URL = '/items';

export const crmApi = {
  // ============ CONTACTS ============
  
  // Liste contacts avec filtres
  getContacts: async (params = {}) => {
    const response = await axios.get(`${DIRECTUS_URL}/contacts`, {
      params: {
        fields: '*,company_id.name,addresses.*',
        sort: '-date_created',
        ...params
      }
    });
    return response.data;
  },
  
  // Détail contact
  getContact: async (id) => {
    const response = await axios.get(`${DIRECTUS_URL}/contacts/${id}`, {
      params: {
        fields: '*,company_id.*,addresses.*,invoices.*,quotes.*'
      }
    });
    return response.data;
  },
  
  // Créer contact
  createContact: async (data) => {
    const response = await axios.post(`${DIRECTUS_URL}/contacts`, data);
    return response.data;
  },
  
  // Modifier contact
  updateContact: async (id, data) => {
    const response = await axios.patch(`${DIRECTUS_URL}/contacts/${id}`, data);
    return response.data;
  },
  
  // Supprimer contact
  deleteContact: async (id) => {
    const response = await axios.delete(`${DIRECTUS_URL}/contacts/${id}`);
    return response.data;
  },
  
  // Recherche contacts
  searchContacts: async (query) => {
    const response = await axios.get(`${DIRECTUS_URL}/contacts`, {
      params: {
        search: query,
        fields: 'id,first_name,last_name,email,company_id.name,type',
        limit: 20
      }
    });
    return response.data;
  },
  
  // ============ ENTREPRISES ============
  
  // Liste entreprises
  getCompanies: async (params = {}) => {
    const response = await axios.get(`${DIRECTUS_URL}/companies`, {
      params: {
        fields: '*,main_contact_id.first_name,main_contact_id.last_name',
        sort: 'name',
        ...params
      }
    });
    return response.data;
  },
  
  // Détail entreprise
  getCompany: async (id) => {
    const response = await axios.get(`${DIRECTUS_URL}/companies/${id}`, {
      params: {
        fields: '*,contacts.*,addresses.*,invoices.*'
      }
    });
    return response.data;
  },
  
  // Créer entreprise
  createCompany: async (data) => {
    const response = await axios.post(`${DIRECTUS_URL}/companies`, data);
    return response.data;
  },
  
  // Modifier entreprise
  updateCompany: async (id, data) => {
    const response = await axios.patch(`${DIRECTUS_URL}/companies/${id}`, data);
    return response.data;
  },
  
  // Supprimer entreprise
  deleteCompany: async (id) => {
    const response = await axios.delete(`${DIRECTUS_URL}/companies/${id}`);
    return response.data;
  },
  
  // ============ ADRESSES ============
  
  // Ajouter adresse
  createAddress: async (data) => {
    const response = await axios.post(`${DIRECTUS_URL}/addresses`, data);
    return response.data;
  },
  
  // Modifier adresse
  updateAddress: async (id, data) => {
    const response = await axios.patch(`${DIRECTUS_URL}/addresses/${id}`, data);
    return response.data;
  },
  
  // Supprimer adresse
  deleteAddress: async (id) => {
    const response = await axios.delete(`${DIRECTUS_URL}/addresses/${id}`);
    return response.data;
  },
  
  // ============ STATISTIQUES ============
  
  // Stats CRM
  getStats: async () => {
    const [contacts, companies] = await Promise.all([
      axios.get(`${DIRECTUS_URL}/contacts`, { params: { aggregate: { count: 'id' }, groupBy: 'type' } }),
      axios.get(`${DIRECTUS_URL}/companies`, { params: { aggregate: { count: 'id' }, groupBy: 'type' } })
    ]);
    return {
      contacts: contacts.data,
      companies: companies.data
    };
  }
};

export default crmApi;
```

---

## FICHIER 2 : useCRMData.js

```javascript
// src/frontend/src/portals/superadmin/crm/hooks/useCRMData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../services/crmApi';
import toast from 'react-hot-toast';

// Hook liste contacts
export const useContacts = (filters = {}) => {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => crmApi.getContacts(filters),
    staleTime: 30000,
  });
};

// Hook détail contact
export const useContact = (id) => {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => crmApi.getContact(id),
    enabled: !!id,
  });
};

// Hook créer contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => crmApi.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact créé avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// Hook modifier contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateContact(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['contacts']);
      queryClient.invalidateQueries(['contact', variables.id]);
      toast.success('Contact mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// Hook supprimer contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => crmApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts']);
      toast.success('Contact supprimé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// Hook liste entreprises
export const useCompanies = (filters = {}) => {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => crmApi.getCompanies(filters),
    staleTime: 30000,
  });
};

// Hook détail entreprise
export const useCompany = (id) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => crmApi.getCompany(id),
    enabled: !!id,
  });
};

// Hook créer entreprise
export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => crmApi.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      toast.success('Entreprise créée avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// Hook modifier entreprise
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => crmApi.updateCompany(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['companies']);
      queryClient.invalidateQueries(['company', variables.id]);
      toast.success('Entreprise mise à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// Hook supprimer entreprise
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => crmApi.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      toast.success('Entreprise supprimée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  });
};

// Hook stats CRM
export const useCRMStats = () => {
  return useQuery({
    queryKey: ['crm-stats'],
    queryFn: () => crmApi.getStats(),
    staleTime: 60000,
  });
};

// Hook recherche contacts
export const useSearchContacts = (query) => {
  return useQuery({
    queryKey: ['contacts-search', query],
    queryFn: () => crmApi.searchContacts(query),
    enabled: query?.length >= 2,
    staleTime: 10000,
  });
};

// Hook principal combiné
export const useCRMData = (filters = {}) => {
  const contacts = useContacts(filters);
  const companies = useCompanies(filters);
  const stats = useCRMStats();
  
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

## FICHIER 3 : CRMDashboard.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/CRMDashboard.jsx
import React, { useState } from 'react';
import { 
  Users, Building2, UserPlus, Building, RefreshCw,
  Mail, Phone, MapPin, Tag, Filter, Search, Plus
} from 'lucide-react';
import { useCRMData, useCRMStats } from './hooks/useCRMData';
import ContactsList from './components/ContactsList';
import ContactForm from './components/ContactForm';
import CompaniesList from './components/CompaniesList';
import CompanyForm from './components/CompanyForm';
import QuickStats from './components/QuickStats';
import toast from 'react-hot-toast';

const COMPANIES = [
  { id: 'all', name: 'Toutes les entreprises' },
  { id: 'HYPERVISUAL', name: 'HYPERVISUAL' },
  { id: 'DAINAMICS', name: 'DAINAMICS' },
  { id: 'LEXAIA', name: 'LEXAIA' },
  { id: 'ENKI_REALTY', name: 'ENKI REALTY' },
  { id: 'TAKEOUT', name: 'TAKEOUT' }
];

const CONTACT_TYPES = [
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
  
  // Construire les filtres
  const filters = {};
  if (selectedCompany !== 'all') {
    filters['filter[our_company_id][_eq]'] = selectedCompany;
  }
  if (typeFilter !== 'all') {
    filters['filter[type][_eq]'] = typeFilter;
  }
  if (searchQuery) {
    filters.search = searchQuery;
  }
  
  const { contacts, companies, stats, isLoading } = useCRMData(filters);
  
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
  
  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: Users, count: contacts.data?.data?.length || 0 },
    { id: 'companies', label: 'Entreprises', icon: Building2, count: companies.data?.data?.length || 0 }
  ];

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Users className="me-2" size={24} />
              CRM - Contacts & Entreprises
            </h2>
            <div className="text-muted mt-1">
              Gestion des clients, fournisseurs et partenaires
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            {/* Filtre entreprise */}
            <select 
              className="form-select"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ width: '200px' }}
            >
              {COMPANIES.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            
            {/* Refresh */}
            <button 
              className="btn btn-outline-primary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            </button>
            
            {/* Bouton créer */}
            <button 
              className="btn btn-primary"
              onClick={handleCreate}
            >
              <Plus size={16} className="me-1" />
              {activeTab === 'contacts' ? 'Nouveau contact' : 'Nouvelle entreprise'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <QuickStats stats={stats.data} isLoading={stats.isLoading} />

      {/* Filtres et recherche */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="row align-items-center">
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
            <div className="col-md-4">
              <div className="btn-group w-100">
                {CONTACT_TYPES.map(type => (
                  <button
                    key={type.id}
                    className={`btn ${typeFilter === type.id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTypeFilter(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-4 text-end">
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

      {/* Modal formulaire */}
      {showForm && activeTab === 'contacts' && (
        <ContactForm 
          contact={editItem}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            contacts.refetch();
          }}
        />
      )}
      {showForm && activeTab === 'companies' && (
        <CompanyForm 
          company={editItem}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            companies.refetch();
          }}
        />
      )}
    </div>
  );
};

export default CRMDashboard;
```

---

## FICHIER 4 : ContactForm.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/components/ContactForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Building2, MapPin, FileText } from 'lucide-react';
import { useCreateContact, useUpdateContact, useCompanies } from '../hooks/useCRMData';

const CANTONS = [
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
    // Identification
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    
    // Type
    type: 'prospect',
    client_type: 'B2B',
    
    // Entreprise
    company_id: null,
    position: '',
    department: '',
    
    // Adresse
    address_line1: '',
    address_line2: '',
    postal_code: '',
    city: '',
    canton: '',
    country: 'CH',
    
    // Facturation
    default_payment_terms: 30,
    vat_number: '',
    
    // Légal
    accepts_marketing: false,
    
    // Notes
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
        company_id: contact.company_id || null,
        position: contact.position || '',
        department: contact.department || '',
        address_line1: contact.address_line1 || '',
        address_line2: contact.address_line2 || '',
        postal_code: contact.postal_code || '',
        city: contact.city || '',
        canton: contact.canton || '',
        country: contact.country || 'CH',
        default_payment_terms: contact.default_payment_terms || 30,
        vat_number: contact.vat_number || '',
        accepts_marketing: contact.accepts_marketing || false,
        notes: contact.notes || ''
      });
    }
  }, [contact]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Le prénom est obligatoire';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Le nom est obligatoire';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

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
              <div className="row mb-4">
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
              
              <div className="row mb-4">
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
                  <div className="input-icon">
                    <span className="input-icon-addon"><Phone size={16} /></span>
                    <input 
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+41 XX XXX XX XX"
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Mobile</label>
                  <input 
                    type="tel"
                    className="form-control"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value)}
                    placeholder="+41 7X XXX XX XX"
                  />
                </div>
              </div>
              
              {/* Type et entreprise */}
              <h4 className="mb-3">Classification</h4>
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Type de contact</label>
                  <select 
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    {CONTACT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Type client</label>
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
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Entreprise</label>
                  <select 
                    className="form-select"
                    value={formData.company_id || ''}
                    onChange={(e) => handleChange('company_id', e.target.value || null)}
                  >
                    <option value="">-- Aucune entreprise --</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fonction</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="Ex: Directeur"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Département</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Ex: Achats"
                  />
                </div>
              </div>
              
              {/* Adresse */}
              <h4 className="mb-3">Adresse</h4>
              <div className="row mb-4">
                <div className="col-md-12">
                  <label className="form-label">Adresse ligne 1</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.address_line1}
                    onChange={(e) => handleChange('address_line1', e.target.value)}
                    placeholder="Rue et numéro"
                  />
                </div>
              </div>
              <div className="row mb-4">
                <div className="col-md-12">
                  <label className="form-label">Adresse ligne 2</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={formData.address_line2}
                    onChange={(e) => handleChange('address_line2', e.target.value)}
                    placeholder="Complément (optionnel)"
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
                    placeholder="1000"
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
                    {CANTONS.map(canton => (
                      <option key={canton} value={canton}>{canton}</option>
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
                    <option value="IT">Italie</option>
                    <option value="AT">Autriche</option>
                  </select>
                </div>
              </div>
              
              {/* Options */}
              <h4 className="mb-3">Options</h4>
              <div className="row mb-4">
                <div className="col-md-4">
                  <label className="form-label">Délai de paiement (jours)</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={formData.default_payment_terms}
                    onChange={(e) => handleChange('default_payment_terms', parseInt(e.target.value))}
                    min="0"
                    max="90"
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label">&nbsp;</label>
                  <label className="form-check">
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      checked={formData.accepts_marketing}
                      onChange={(e) => handleChange('accepts_marketing', e.target.checked)}
                    />
                    <span className="form-check-label">
                      Accepte de recevoir des communications marketing
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Notes */}
              <div className="row">
                <div className="col-12">
                  <label className="form-label">Notes internes</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Notes privées sur ce contact..."
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost-secondary" onClick={onClose}>
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={createContact.isPending || updateContact.isPending}
              >
                <Save size={16} className="me-1" />
                {createContact.isPending || updateContact.isPending 
                  ? 'Enregistrement...' 
                  : isEditing ? 'Mettre à jour' : 'Créer le contact'
                }
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

## FICHIER 5 : ContactsList.jsx

```javascript
// src/frontend/src/portals/superadmin/crm/components/ContactsList.jsx
import React, { useState } from 'react';
import { 
  User, Mail, Phone, Building2, Edit, Trash2, Eye, 
  MoreVertical, Tag, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { useDeleteContact } from '../hooks/useCRMData';

const ContactsList = ({ contacts = [], isLoading, onEdit, onRefresh }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const deleteContact = useDeleteContact();
  
  const handleDelete = async (contact) => {
    if (!confirm(`Supprimer le contact "${contact.first_name} ${contact.last_name}" ?`)) return;
    
    await deleteContact.mutateAsync(contact.id);
    onRefresh?.();
  };
  
  const getTypeBadge = (type) => {
    const types = {
      prospect: { class: 'bg-blue-lt', label: 'Prospect' },
      client: { class: 'bg-green-lt', label: 'Client' },
      supplier: { class: 'bg-orange-lt', label: 'Fournisseur' },
      partner: { class: 'bg-purple-lt', label: 'Partenaire' },
      other: { class: 'bg-secondary', label: 'Autre' }
    };
    const badge = types[type] || types.other;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
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
        <div className="empty-icon">
          <User size={48} />
        </div>
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
          {contacts.map(contact => (
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
                {getTypeBadge(contact.type)}
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
                {contact.position && (
                  <div className="text-muted small">{contact.position}</div>
                )}
              </td>
              <td>
                {contact.phone ? (
                  <div>
                    <Phone size={12} className="me-1" />
                    {contact.phone}
                  </div>
                ) : contact.mobile ? (
                  <div>
                    <Phone size={12} className="me-1" />
                    {contact.mobile}
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td>
                {contact.city ? (
                  <div>
                    {contact.postal_code} {contact.city}
                    {contact.canton && <span className="text-muted"> ({contact.canton})</span>}
                  </div>
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
                      <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); onEdit(contact); }}>
                        <Eye size={14} className="me-2" />
                        Voir détails
                      </a>
                      <a className="dropdown-item" href="#">
                        <Mail size={14} className="me-2" />
                        Envoyer email
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsList;
```

---

## FICHIERS SUPPLÉMENTAIRES À CRÉER

### Fichier 6 : CompanyForm.jsx
(Structure similaire à ContactForm.jsx avec champs entreprise : nom, forme juridique, IDE, TVA, adresse siège, etc.)

### Fichier 7 : CompaniesList.jsx
(Structure similaire à ContactsList.jsx)

### Fichier 8 : QuickStats.jsx
```javascript
// Affiche les KPIs : nombre clients, prospects, fournisseurs, etc.
```

### Fichier 9 : settingsApi.js
```javascript
// API pour configuration : our_companies, invoice_settings, products, users
```

### Fichier 10 : useSettingsData.js
```javascript
// Hooks React Query pour settings
```

### Fichier 11 : SettingsDashboard.jsx
```javascript
// Dashboard configuration avec onglets
```

### Fichier 12 : CompanySettings.jsx
```javascript
// Formulaire configuration entreprise (logo, adresse, bancaire, etc.)
```

### Fichier 13 : InvoiceSettings.jsx
```javascript
// Configuration facturation (préfixes, numérotation, TVA, délais)
```

### Fichier 14 : ProductsList.jsx et ProductForm.jsx
```javascript
// CRUD produits/services catalogue
```

---

## MISE À JOUR ROUTER (App.jsx)

Ajouter les routes suivantes :

```javascript
// Dans le router
<Route path="/superadmin/crm" element={<CRMDashboard />} />
<Route path="/superadmin/crm/contacts" element={<CRMDashboard tab="contacts" />} />
<Route path="/superadmin/crm/companies" element={<CRMDashboard tab="companies" />} />
<Route path="/superadmin/settings" element={<SettingsDashboard />} />
<Route path="/superadmin/settings/company" element={<SettingsDashboard tab="company" />} />
<Route path="/superadmin/settings/invoicing" element={<SettingsDashboard tab="invoicing" />} />
<Route path="/superadmin/settings/products" element={<SettingsDashboard tab="products" />} />
<Route path="/superadmin/settings/users" element={<SettingsDashboard tab="users" />} />
```

---

## MISE À JOUR NAVIGATION SIDEBAR

Ajouter dans le composant Sidebar :

```javascript
{
  section: 'COMMERCIAL',
  items: [
    { label: 'Contacts', icon: Users, path: '/superadmin/crm/contacts' },
    { label: 'Entreprises', icon: Building2, path: '/superadmin/crm/companies' }
  ]
},
{
  section: 'CONFIGURATION',
  items: [
    { label: 'Mon entreprise', icon: Building, path: '/superadmin/settings/company' },
    { label: 'Facturation', icon: FileText, path: '/superadmin/settings/invoicing' },
    { label: 'Produits', icon: Package, path: '/superadmin/settings/products' },
    { label: 'Utilisateurs', icon: UserCog, path: '/superadmin/settings/users' }
  ]
}
```

---

## COMMIT MESSAGE

```
feat(frontend): Module CRM et Configuration

- CRMDashboard: Gestion contacts et entreprises
- ContactForm/ContactsList: CRUD complet contacts
- CompanyForm/CompaniesList: CRUD complet entreprises
- SettingsDashboard: Configuration entreprise
- CompanySettings: Logo, adresse, coordonnées bancaires
- InvoiceSettings: Numérotation, TVA, délais
- ProductsList/ProductForm: Catalogue produits/services
- Nouvelles routes et navigation sidebar
```

---

## RAPPORT D'EXÉCUTION ATTENDU

RAPPORT-12-CRM-SETTINGS.md avec :
- Liste des fichiers créés
- Endpoints Directus utilisés
- Captures des formulaires
- Validation des champs obligatoires
