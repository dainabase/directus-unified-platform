/**
 * FinanceDashboard Component
 * Dashboard principal du pôle Finance pour SuperAdmin
 */

import React, { useState } from 'react';
import { useFinanceData } from './hooks/useFinanceData';
import { KPICards } from './components/KPICards';
import { AlertsPanel } from './components/AlertsPanel';
import { CashFlowChart } from './components/CashFlowChart';
import { RecentTransactions } from './components/RecentTransactions';

// Sélecteur d'entreprise
function CompanySelector({ value, onChange, companies }) {
  return (
    <select 
      className="form-select" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 'auto' }}
    >
      {companies.map(company => (
        <option key={company} value={company}>{company}</option>
      ))}
    </select>
  );
}

// Header avec bouton refresh
function DashboardHeader({ company, onCompanyChange, onRefresh, lastUpdated, loading }) {
  const companies = ['HYPERVISUAL', 'DAINAMICS', 'LEXAIA', 'ENKI REALTY', 'TAKEOUT'];
  
  return (
    <div className="page-header d-print-none">
      <div className="container-xl">
        <div className="page-pretitle">Pôle Finance</div>
        <div className="d-flex align-items-center">
          <h2 className="page-title me-auto">
            Dashboard Finance
          </h2>
          <div className="d-flex align-items-center gap-2">
            <CompanySelector 
              value={company} 
              onChange={onCompanyChange}
              companies={companies}
            />
            <button 
              className="btn btn-primary"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="icon me-1" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                </svg>
              )}
              Actualiser
            </button>
          </div>
        </div>
        {lastUpdated && (
          <small className="text-muted">
            Dernière mise à jour: {lastUpdated.toLocaleTimeString('fr-CH')}
          </small>
        )}
      </div>
    </div>
  );
}

// Skeleton loader
function DashboardSkeleton() {
  return (
    <div className="container-xl">
      <div className="row row-deck row-cards">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="col-sm-6 col-lg-3">
            <div className="card placeholder-glow">
              <div className="card-body">
                <div className="placeholder col-7 mb-2"></div>
                <div className="placeholder placeholder-lg col-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant principal
export function FinanceDashboard() {
  const [selectedCompany, setSelectedCompany] = useState('HYPERVISUAL');
  
  const {
    kpis,
    alerts,
    evolution,
    transactions,
    loading,
    error,
    lastUpdated,
    refresh
  } = useFinanceData(selectedCompany, {
    autoRefresh: 60000 // Refresh toutes les minutes
  });

  const handleAlertAction = (alert) => {
    console.log('Action sur alerte:', alert);
    // Implémenter les actions selon le type
    switch (alert.action) {
      case 'send_reminder':
        // Ouvrir modal de relance
        break;
      case 'schedule_payment':
        // Ouvrir modal de paiement
        break;
      case 'review_reconciliation':
        // Naviguer vers rapprochements
        break;
      default:
        break;
    }
  };

  if (error) {
    return (
      <div className="container-xl">
        <div className="alert alert-danger">
          <h4>Erreur de chargement</h4>
          <p>{error}</p>
          <button className="btn btn-danger" onClick={refresh}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <DashboardHeader
        company={selectedCompany}
        onCompanyChange={setSelectedCompany}
        onRefresh={refresh}
        lastUpdated={lastUpdated}
        loading={loading}
      />
      
      <div className="page-body">
        <div className="container-xl">
          {loading && !kpis ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Alertes prioritaires */}
              {alerts.length > 0 && (
                <div className="mb-4">
                  <AlertsPanel 
                    alerts={alerts} 
                    onAction={handleAlertAction}
                    maxItems={5}
                  />
                </div>
              )}
              
              {/* KPIs */}
              <div className="mb-4">
                <KPICards kpis={kpis} />
              </div>
              
              {/* Graphique + Transactions */}
              <div className="row row-deck row-cards">
                <div className="col-lg-8">
                  <CashFlowChart data={evolution} height={350} />
                </div>
                <div className="col-lg-4">
                  <RecentTransactions transactions={transactions} limit={8} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;