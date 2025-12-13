// src/frontend/src/portals/superadmin/collection/CollectionDashboard.jsx
import React, { useState } from 'react';
import { 
  DollarSign, Users, Clock, TrendingUp, 
  FileText, AlertTriangle, CheckCircle, RefreshCw 
} from 'lucide-react';
import { useCollectionData } from './hooks/useCollectionData';
import DebtorsList from './components/DebtorsList';
import DebtorDetail from './components/DebtorDetail';
import WorkflowTimeline from './components/WorkflowTimeline';
import LPCases from './components/LPCases';
import InterestCalculator from './components/InterestCalculator';
import WorkflowConfig from './components/WorkflowConfig';
import AgingChart from './components/AgingChart';
import CollectionStats from './components/CollectionStats';
import toast from 'react-hot-toast';

const COMPANIES = [
  { id: 'HYPERVISUAL', name: 'HYPERVISUAL', color: 'blue' },
  { id: 'DAINAMICS', name: 'DAINAMICS', color: 'purple' },
  { id: 'LEXAIA', name: 'LEXAIA', color: 'green' },
  { id: 'ENKI_REALTY', name: 'ENKI REALTY', color: 'orange' },
  { id: 'TAKEOUT', name: 'TAKEOUT', color: 'red' }
];

const CollectionDashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState('HYPERVISUAL');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  
  const { debtors, stats, agingAnalysis, recoveryPerformance, isLoading } = useCollectionData(selectedCompany);
  
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'debtors', label: 'Débiteurs', icon: Users },
    { id: 'lp-cases', label: 'Procédures LP', icon: FileText },
    { id: 'aging', label: 'Âge Créances', icon: Clock },
    { id: 'calculator', label: 'Calculateur', icon: DollarSign },
    { id: 'config', label: 'Configuration', icon: AlertTriangle }
  ];
  
  const handleRefresh = () => {
    debtors.refetch();
    stats.refetch();
    agingAnalysis.refetch();
    recoveryPerformance.refetch();
    toast.success('Données actualisées');
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <DollarSign className="me-2" size={24} />
              Module Collection
            </h2>
            <div className="text-muted mt-1">
              Recouvrement et Procédures LP Suisses
            </div>
          </div>
          <div className="col-auto ms-auto">
            {/* Sélecteur entreprise */}
            <select 
              className="form-select me-2"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ width: '200px', display: 'inline-block' }}
            >
              {COMPANIES.map(company => (
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

      {/* KPIs rapides */}
      <div className="row row-deck row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Créances totales</div>
              </div>
              <div className="h1 mb-0">
                {stats.data?.totalDebt ? `${(stats.data.totalDebt / 1000).toFixed(0)}K CHF` : '0 CHF'}
              </div>
              <div className="text-muted">
                {stats.data?.activeDebtors || 0} débiteurs actifs
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Procédures LP</div>
              </div>
              <div className="h1 mb-0 text-warning">
                {stats.data?.activeLPCases || 0}
              </div>
              <div className="text-muted">
                {stats.data?.pendingLPSteps || 0} étapes en attente
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Taux recouvrement</div>
              </div>
              <div className="h1 mb-0 text-success">
                {stats.data?.recoveryRate || 0}%
              </div>
              <div className="text-muted">
                {stats.data?.recoveredAmount ? `${(stats.data.recoveredAmount / 1000).toFixed(0)}K CHF` : '0 CHF'} récupérés
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Âge moyen</div>
              </div>
              <div className="h1 mb-0 text-info">
                {stats.data?.averageAge || 0}j
              </div>
              <div className="text-muted">
                {stats.data?.overdueDebtors || 0} créances > 90j
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
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
          {activeTab === 'overview' && (
            <CollectionStats 
              company={selectedCompany}
              stats={stats.data}
              agingAnalysis={agingAnalysis.data}
              recoveryPerformance={recoveryPerformance.data}
            />
          )}
          
          {activeTab === 'debtors' && (
            selectedDebtor ? (
              <DebtorDetail 
                debtorId={selectedDebtor}
                onBack={() => setSelectedDebtor(null)}
                onRefresh={handleRefresh}
              />
            ) : (
              <DebtorsList 
                company={selectedCompany}
                debtors={debtors.data}
                onSelectDebtor={setSelectedDebtor}
                onRefresh={() => debtors.refetch()}
              />
            )
          )}
          
          {activeTab === 'lp-cases' && (
            <LPCases 
              company={selectedCompany}
              onRefresh={handleRefresh}
            />
          )}
          
          {activeTab === 'aging' && (
            <AgingChart 
              company={selectedCompany}
              agingData={agingAnalysis.data}
            />
          )}
          
          {activeTab === 'calculator' && (
            <InterestCalculator 
              company={selectedCompany}
            />
          )}
          
          {activeTab === 'config' && (
            <WorkflowConfig 
              company={selectedCompany}
            />
          )}
        </div>
      </div>

      {/* Alertes importantes */}
      {stats.data?.urgentAlerts?.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-warning">
              <div className="d-flex">
                <div>
                  <AlertTriangle size={24} />
                </div>
                <div className="ms-3">
                  <h4 className="alert-title">Alertes urgentes</h4>
                  <div className="text-muted">
                    {stats.data.urgentAlerts.map((alert, index) => (
                      <div key={index} className="mb-1">
                        • {alert}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDashboard;