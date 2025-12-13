// src/frontend/src/portals/superadmin/legal/LegalDashboard.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Shield, PenTool, Clock, CheckCircle, 
  AlertTriangle, Users, Building2, RefreshCw 
} from 'lucide-react';
import { useLegalData, useLegalStats } from './hooks/useLegalData';
import CGVManager from './components/CGVManager';
import SignatureRequests from './components/SignatureRequests';
import AcceptanceHistory from './components/AcceptanceHistory';
import LegalStats from './components/LegalStats';
import toast from 'react-hot-toast';

const COMPANIES = [
  { id: 'HYPERVISUAL', name: 'HYPERVISUAL', color: 'blue' },
  { id: 'DAINAMICS', name: 'DAINAMICS', color: 'purple' },
  { id: 'LEXAIA', name: 'LEXAIA', color: 'green' },
  { id: 'ENKI_REALTY', name: 'ENKI REALTY', color: 'orange' },
  { id: 'TAKEOUT', name: 'TAKEOUT', color: 'red' }
];

const CGV_TYPES = [
  { id: 'cgv_vente', label: 'CGV Vente', icon: FileText },
  { id: 'cgl_location', label: 'CGL Location', icon: Building2 },
  { id: 'cgv_service', label: 'CGV Service', icon: Users }
];

const LegalDashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState('HYPERVISUAL');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { cgvList, signatureRequests, acceptances, stats, isLoading } = useLegalData(selectedCompany);
  
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Shield },
    { id: 'cgv', label: 'CGV / CGL', icon: FileText },
    { id: 'signatures', label: 'Signatures', icon: PenTool },
    { id: 'acceptances', label: 'Acceptations', icon: CheckCircle }
  ];
  
  const handleRefresh = () => {
    cgvList.refetch();
    signatureRequests.refetch();
    acceptances.refetch();
    stats.refetch();
    toast.success('Données actualisées');
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Shield className="me-2" size={24} />
              Module Légal
            </h2>
            <div className="text-muted mt-1">
              Gestion CGV, CGL et Signatures Électroniques
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
                <div className="subheader">CGV Actives</div>
              </div>
              <div className="h1 mb-0">
                {stats.data?.activeCGV || 0}
              </div>
              <div className="text-muted">
                sur {stats.data?.totalCGV || 0} versions
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Signatures en attente</div>
              </div>
              <div className="h1 mb-0 text-warning">
                {stats.data?.pendingSignatures || 0}
              </div>
              <div className="text-muted">
                {stats.data?.completedSignatures || 0} complétées ce mois
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Acceptations</div>
              </div>
              <div className="h1 mb-0 text-success">
                {stats.data?.totalAcceptances || 0}
              </div>
              <div className="text-muted">
                {stats.data?.recentAcceptances || 0} cette semaine
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Conformité</div>
              </div>
              <div className="h1 mb-0 text-primary">
                {stats.data?.complianceScore || 100}%
              </div>
              <div className="text-muted">
                Score conformité légale
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
            <LegalStats 
              company={selectedCompany} 
              stats={stats.data}
              cgvList={cgvList.data}
              signatureRequests={signatureRequests.data}
            />
          )}
          {activeTab === 'cgv' && (
            <CGVManager 
              company={selectedCompany}
              cgvTypes={CGV_TYPES}
              cgvList={cgvList.data}
              onRefresh={() => cgvList.refetch()}
            />
          )}
          {activeTab === 'signatures' && (
            <SignatureRequests 
              company={selectedCompany}
              requests={signatureRequests.data}
              onRefresh={() => signatureRequests.refetch()}
            />
          )}
          {activeTab === 'acceptances' && (
            <AcceptanceHistory 
              company={selectedCompany}
              acceptances={acceptances.data}
              onRefresh={() => acceptances.refetch()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalDashboard;