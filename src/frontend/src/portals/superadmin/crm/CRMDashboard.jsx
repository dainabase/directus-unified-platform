// src/frontend/src/portals/superadmin/crm/CRMDashboard.jsx
import React, { useState } from 'react';
import { 
  Users, Building2, Activity, Plus, 
  Search, RefreshCw, Filter, Download,
  Mail, Phone, MapPin, Calendar
} from 'lucide-react';
import { useCRMData } from './hooks/useCRMData';
import QuickStats from './components/QuickStats';
import ContactsList from './components/ContactsList';
import CompaniesList from './components/CompaniesList';
import ContactForm from './components/ContactForm';
import CompanyForm from './components/CompanyForm';

const CRMDashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  
  const company = selectedCompany === 'all' ? null : selectedCompany;
  const { 
    stats, 
    recentActivities, 
    recentContacts, 
    recentCompanies, 
    isLoading 
  } = useCRMData(company);
  
  const companies = [
    { id: 'all', name: 'Toutes les sociétés' },
    { id: 'HYPERVISUAL', name: 'HYPERVISUAL SA' },
    { id: 'DAINAMICS', name: 'DAINAMICS SA' },
    { id: 'LEXAIA', name: 'LEXAIA SA' },
    { id: 'ENKI_REALTY', name: 'ENKI REALTY SA' },
    { id: 'TAKEOUT', name: 'TAKEOUT SA' }
  ];

  const handleRefresh = () => {
    // Les queries React Query se rafraîchissent automatiquement
    window.location.reload();
  };

  const tabs = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: Activity },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'companies', label: 'Entreprises', icon: Building2 },
    { id: 'activities', label: 'Activités', icon: Calendar }
  ];

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowCompanyForm(true);
  };

  const handleCloseContactForm = () => {
    setShowContactForm(false);
    setEditingContact(null);
  };

  const handleCloseCompanyForm = () => {
    setShowCompanyForm(false);
    setEditingCompany(null);
  };

  return (
    <div className="page">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Portail Superadmin</div>
              <h2 className="page-title">
                <Users size={24} className="me-2" />
                CRM - Gestion des Relations Client
              </h2>
            </div>
            
            {/* Actions principales */}
            <div className="col-auto ms-auto d-print-none">
              <div className="btn-list">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={`me-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                
                <div className="dropdown">
                  <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
                    <Plus size={16} className="me-1" />
                    Nouveau
                  </button>
                  <div className="dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => setShowContactForm(true)}
                    >
                      <Users size={16} className="me-2" />
                      Contact
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => setShowCompanyForm(true)}
                    >
                      <Building2 size={16} className="me-2" />
                      Entreprise
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtres et sélecteurs */}
          <div className="row g-2 align-items-center mt-3">
            <div className="col-auto">
              <select 
                className="form-select"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col">
              <div className="input-icon">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Rechercher contacts, entreprises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="input-icon-addon">
                  <Search size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="page-body">
        <div className="container-xl">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <ul className="nav nav-tabs card-header-tabs">
                    {tabs.map(tab => {
                      const IconComponent = tab.icon;
                      return (
                        <li key={tab.id} className="nav-item">
                          <button
                            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                          >
                            <IconComponent size={16} className="me-1" />
                            {tab.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                <div className="card-body">
                  {/* Contenu selon l'onglet actif */}
                  {activeTab === 'dashboard' && (
                    <div>
                      {/* Statistiques rapides */}
                      <QuickStats 
                        company={company}
                        stats={stats.data}
                        isLoading={stats.isLoading}
                      />
                      
                      {/* Activités récentes et aperçus */}
                      <div className="row mt-4">
                        {/* Contacts récents */}
                        <div className="col-lg-4">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                <Users size={16} className="me-1" />
                                Contacts Récents
                              </h3>
                            </div>
                            <div className="card-body p-0">
                              {recentContacts.isLoading ? (
                                <div className="text-center py-4">
                                  <RefreshCw size={20} className="animate-spin text-muted" />
                                </div>
                              ) : recentContacts.data?.data?.length ? (
                                <div className="list-group list-group-flush">
                                  {recentContacts.data.data.slice(0, 5).map(contact => (
                                    <div key={contact.id} className="list-group-item">
                                      <div className="row align-items-center">
                                        <div className="col-auto">
                                          <div className="avatar avatar-sm">
                                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                                          </div>
                                        </div>
                                        <div className="col text-truncate">
                                          <div className="text-reset d-block">
                                            {contact.first_name} {contact.last_name}
                                          </div>
                                          <div className="d-block text-muted text-truncate mt-n1">
                                            {contact.email}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  Aucun contact récent
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Entreprises récentes */}
                        <div className="col-lg-4">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                <Building2 size={16} className="me-1" />
                                Entreprises Récentes
                              </h3>
                            </div>
                            <div className="card-body p-0">
                              {recentCompanies.isLoading ? (
                                <div className="text-center py-4">
                                  <RefreshCw size={20} className="animate-spin text-muted" />
                                </div>
                              ) : recentCompanies.data?.data?.length ? (
                                <div className="list-group list-group-flush">
                                  {recentCompanies.data.data.slice(0, 5).map(company => (
                                    <div key={company.id} className="list-group-item">
                                      <div className="row align-items-center">
                                        <div className="col-auto">
                                          <div className="avatar avatar-sm">
                                            <Building2 size={16} />
                                          </div>
                                        </div>
                                        <div className="col text-truncate">
                                          <div className="text-reset d-block">
                                            {company.name}
                                          </div>
                                          <div className="d-block text-muted text-truncate mt-n1">
                                            {company.industry}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  Aucune entreprise récente
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Activités récentes */}
                        <div className="col-lg-4">
                          <div className="card">
                            <div className="card-header">
                              <h3 className="card-title">
                                <Activity size={16} className="me-1" />
                                Activités Récentes
                              </h3>
                            </div>
                            <div className="card-body p-0">
                              {recentActivities.isLoading ? (
                                <div className="text-center py-4">
                                  <RefreshCw size={20} className="animate-spin text-muted" />
                                </div>
                              ) : recentActivities.data?.data?.length ? (
                                <div className="list-group list-group-flush">
                                  {recentActivities.data.data.slice(0, 5).map(activity => (
                                    <div key={activity.id} className="list-group-item">
                                      <div className="row align-items-center">
                                        <div className="col-auto">
                                          <div className="avatar avatar-sm">
                                            {activity.type === 'email' && <Mail size={16} />}
                                            {activity.type === 'call' && <Phone size={16} />}
                                            {activity.type === 'meeting' && <Calendar size={16} />}
                                            {activity.type === 'note' && <Activity size={16} />}
                                          </div>
                                        </div>
                                        <div className="col text-truncate">
                                          <div className="text-reset d-block">
                                            {activity.subject || activity.type}
                                          </div>
                                          <div className="d-block text-muted text-truncate mt-n1">
                                            {new Date(activity.date).toLocaleDateString('fr-CH')}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted">
                                  Aucune activité récente
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'contacts' && (
                    <ContactsList 
                      company={company}
                      searchQuery={searchQuery}
                      onEdit={handleEditContact}
                    />
                  )}
                  
                  {activeTab === 'companies' && (
                    <CompaniesList 
                      company={company}
                      searchQuery={searchQuery}
                      onEdit={handleEditCompany}
                    />
                  )}
                  
                  {activeTab === 'activities' && (
                    <div className="text-center py-5">
                      <Activity size={48} className="text-muted mb-3" />
                      <h4 className="text-muted">Module Activités</h4>
                      <p className="text-muted">
                        La gestion détaillée des activités sera disponible dans une future version.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showContactForm && (
        <ContactForm 
          contact={editingContact}
          onClose={handleCloseContactForm}
          companies={companies.filter(c => c.id !== 'all')}
        />
      )}
      
      {showCompanyForm && (
        <CompanyForm 
          company={editingCompany}
          onClose={handleCloseCompanyForm}
        />
      )}
    </div>
  );
};

export default CRMDashboard;