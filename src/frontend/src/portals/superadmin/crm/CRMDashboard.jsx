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

const CRMDashboard = ({ selectedCompany: propCompany, view }) => {
  const [localCompany, setLocalCompany] = useState('all');
  const selectedCompany = propCompany || localCompany;
  const setSelectedCompany = setLocalCompany;
  const viewToTab = { contacts: 'contacts', companies: 'companies', activities: 'activities' };
  const [activeTab, setActiveTab] = useState(viewToTab[view] || 'dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showNewMenu, setShowNewMenu] = useState(false);

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-xs text-gray-400 uppercase tracking-wide">Portail Superadmin</div>
            <h2 className="ds-page-title flex items-center gap-2">
              <Users size={24} />
              CRM - Gestion des Relations Client
            </h2>
          </div>

          {/* Actions principales */}
          <div className="ml-auto shrink-0">
            <div className="flex items-center gap-2">
              <button
                className="ds-btn ds-btn-ghost"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowNewMenu(!showNewMenu)}
                  className="ds-btn ds-btn-primary"
                >
                  <Plus size={14} className="mr-1" />
                  Nouveau
                </button>
                {showNewMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <button
                      onClick={() => { setShowContactForm(true); setShowNewMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Users size={14} />
                      Contact
                    </button>
                    <button
                      onClick={() => { setShowCompanyForm(true); setShowNewMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Building2 size={14} />
                      Entreprise
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et sélecteurs */}
        <div className="flex items-center gap-2 mt-3">
          <div className="shrink-0">
            <select
              className="ds-input"
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

          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                className="ds-input pl-10 w-full"
                placeholder="Rechercher contacts, entreprises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div>
        <div className="ds-card">
          <div className="flex gap-1 border-b border-gray-100 px-4">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[var(--accent-hover)] text-[var(--accent-hover)]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <IconComponent size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4">
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">
                  {/* Contacts récents */}
                  <div className="ds-card">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="ds-card-title flex items-center gap-1.5">
                        <Users size={16} />
                        Contacts Récents
                      </h3>
                    </div>
                    <div className="p-0">
                      {recentContacts.isLoading ? (
                        <div className="text-center py-4">
                          <RefreshCw size={20} className="animate-spin text-gray-400" />
                        </div>
                      ) : recentContacts.data?.data?.length ? (
                        <div className="divide-y divide-gray-50">
                          {recentContacts.data.data.slice(0, 5).map(contact => (
                            <div key={contact.id} className="px-4 py-3 flex items-center gap-3">
                              <div className="shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {contact.first_name?.[0]}{contact.last_name?.[0]}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {contact.first_name} {contact.last_name}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {contact.email}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          Aucun contact récent
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Entreprises récentes */}
                  <div className="ds-card">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="ds-card-title flex items-center gap-1.5">
                        <Building2 size={16} />
                        Entreprises Récentes
                      </h3>
                    </div>
                    <div className="p-0">
                      {recentCompanies.isLoading ? (
                        <div className="text-center py-4">
                          <RefreshCw size={20} className="animate-spin text-gray-400" />
                        </div>
                      ) : recentCompanies.data?.data?.length ? (
                        <div className="divide-y divide-gray-50">
                          {recentCompanies.data.data.slice(0, 5).map(company => (
                            <div key={company.id} className="px-4 py-3 flex items-center gap-3">
                              <div className="shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  <Building2 size={16} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {company.name}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {company.industry}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          Aucune entreprise récente
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activités récentes */}
                  <div className="ds-card">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="ds-card-title flex items-center gap-1.5">
                        <Activity size={16} />
                        Activités Récentes
                      </h3>
                    </div>
                    <div className="p-0">
                      {recentActivities.isLoading ? (
                        <div className="text-center py-4">
                          <RefreshCw size={20} className="animate-spin text-gray-400" />
                        </div>
                      ) : recentActivities.data?.data?.length ? (
                        <div className="divide-y divide-gray-50">
                          {recentActivities.data.data.slice(0, 5).map(activity => (
                            <div key={activity.id} className="px-4 py-3 flex items-center gap-3">
                              <div className="shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                  {activity.type === 'email' && <Mail size={16} />}
                                  {activity.type === 'call' && <Phone size={16} />}
                                  {activity.type === 'meeting' && <Calendar size={16} />}
                                  {activity.type === 'note' && <Activity size={16} />}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {activity.subject || activity.type}
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                  {new Date(activity.date).toLocaleDateString('fr-CH')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          Aucune activité récente
                        </div>
                      )}
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
              <div className="text-center py-12">
                <Activity size={48} className="text-gray-400 mb-3 mx-auto" />
                <h4 className="text-base font-semibold text-gray-400">Module Activités</h4>
                <p className="text-gray-500">
                  La gestion détaillée des activités sera disponible dans une future version.
                </p>
              </div>
            )}
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
