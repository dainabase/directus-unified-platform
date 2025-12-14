// src/frontend/src/portals/superadmin/settings/SettingsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Settings, Building2, FileText, Percent, Package, RefreshCw
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
  useEffect(() => {
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
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : !selectedCompany ? (
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
