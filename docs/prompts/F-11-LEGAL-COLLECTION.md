# PROMPT F-11 : Frontend Legal & Collection Dashboards

## 🎯 OBJECTIF
Créer les modules frontend React pour la gestion légale (CGV/CGL, signatures électroniques) et le recouvrement automatisé (tracking créances, poursuites LP suisses).

## 📊 MÉTRIQUES
- **Fichiers à créer** : 22 fichiers
- **Lignes estimées** : ~2,340 lignes
- **Temps estimé** : 45-60 minutes

---

## 🛠️ STACK TECHNIQUE

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.2 | UI Framework |
| React Query | @tanstack/react-query | Data fetching & cache |
| Recharts | 2.10+ | Graphiques (PAS ApexCharts) |
| Axios | 1.6+ | HTTP client |
| Lucide React | latest | Icons |
| Tabler.io | 1.0.0-beta20 | CSS Framework (classes uniquement) |
| React Hot Toast | 2.4+ | Notifications |

---

## 📁 STRUCTURE DES FICHIERS À CRÉER

```
src/frontend/src/portals/superadmin/
├── legal/
│   ├── index.js
│   ├── LegalDashboard.jsx
│   ├── services/
│   │   └── legalApi.js
│   ├── hooks/
│   │   └── useLegalData.js
│   └── components/
│       ├── CGVManager.jsx
│       ├── CGVEditor.jsx
│       ├── CGVPreview.jsx
│       ├── SignatureRequests.jsx
│       ├── SignatureStatus.jsx
│       ├── AcceptanceHistory.jsx
│       └── LegalStats.jsx
│
└── collection/
    ├── index.js
    ├── CollectionDashboard.jsx
    ├── services/
    │   └── collectionApi.js
    ├── hooks/
    │   └── useCollectionData.js
    └── components/
        ├── DebtorsList.jsx
        ├── DebtorDetail.jsx
        ├── WorkflowTimeline.jsx
        ├── LPCases.jsx
        ├── InterestCalculator.jsx
        ├── WorkflowConfig.jsx
        ├── AgingChart.jsx
        └── CollectionStats.jsx
```

---

## 📝 FICHIER 1 : legalApi.js

```javascript
// src/frontend/src/portals/superadmin/legal/services/legalApi.js
import axios from 'axios';

const API_BASE = '/api/legal';

export const legalApi = {
  // ============ CGV / CGL ============
  
  // Liste CGV par entreprise et type
  getCGVList: async (company, type = null) => {
    const params = { company };
    if (type) params.type = type;
    const response = await axios.get(`${API_BASE}/cgv`, { params });
    return response.data;
  },
  
  // Détail CGV
  getCGV: async (cgvId) => {
    const response = await axios.get(`${API_BASE}/cgv/${cgvId}`);
    return response.data;
  },
  
  // Créer CGV
  createCGV: async (data) => {
    const response = await axios.post(`${API_BASE}/cgv`, data);
    return response.data;
  },
  
  // Mettre à jour CGV
  updateCGV: async (cgvId, data) => {
    const response = await axios.put(`${API_BASE}/cgv/${cgvId}`, data);
    return response.data;
  },
  
  // Publier CGV (nouvelle version)
  publishCGV: async (cgvId) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/publish`);
    return response.data;
  },
  
  // Archiver CGV
  archiveCGV: async (cgvId) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/archive`);
    return response.data;
  },
  
  // Prévisualiser CGV avec variables
  previewCGV: async (cgvId, clientId = null) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await axios.get(`${API_BASE}/cgv/${cgvId}/preview`, { params });
    return response.data;
  },
  
  // ============ SIGNATURES ÉLECTRONIQUES ============
  
  // Liste demandes de signature
  getSignatureRequests: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/signatures`, { params: filters });
    return response.data;
  },
  
  // Détail demande signature
  getSignatureRequest: async (requestId) => {
    const response = await axios.get(`${API_BASE}/signatures/${requestId}`);
    return response.data;
  },
  
  // Créer demande signature
  createSignatureRequest: async (data) => {
    const response = await axios.post(`${API_BASE}/signatures`, data);
    return response.data;
  },
  
  // Renvoyer demande signature
  resendSignatureRequest: async (requestId) => {
    const response = await axios.post(`${API_BASE}/signatures/${requestId}/resend`);
    return response.data;
  },
  
  // Annuler demande signature
  cancelSignatureRequest: async (requestId) => {
    const response = await axios.post(`${API_BASE}/signatures/${requestId}/cancel`);
    return response.data;
  },
  
  // Télécharger document signé
  downloadSignedDocument: async (requestId) => {
    const response = await axios.get(`${API_BASE}/signatures/${requestId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // ============ ACCEPTATIONS ============
  
  // Historique acceptations
  getAcceptanceHistory: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/acceptances`, { params: filters });
    return response.data;
  },
  
  // Détail acceptation
  getAcceptance: async (acceptanceId) => {
    const response = await axios.get(`${API_BASE}/acceptances/${acceptanceId}`);
    return response.data;
  },
  
  // Vérifier si client a accepté CGV
  checkClientAcceptance: async (clientId, cgvId) => {
    const response = await axios.get(`${API_BASE}/acceptances/check`, {
      params: { client_id: clientId, cgv_id: cgvId }
    });
    return response.data;
  },
  
  // ============ STATISTIQUES ============
  
  // Stats légales par entreprise
  getLegalStats: async (company) => {
    const response = await axios.get(`${API_BASE}/stats/${company}`);
    return response.data;
  },
  
  // Rapport conformité
  getComplianceReport: async (company) => {
    const response = await axios.get(`${API_BASE}/compliance/${company}`);
    return response.data;
  }
};

export default legalApi;
```

---

## 📝 FICHIER 2 : useLegalData.js

```javascript
// src/frontend/src/portals/superadmin/legal/hooks/useLegalData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '../services/legalApi';
import toast from 'react-hot-toast';

// ============ CGV HOOKS ============

export const useCGVList = (company, type = null) => {
  return useQuery({
    queryKey: ['cgv-list', company, type],
    queryFn: () => legalApi.getCGVList(company, type),
    enabled: !!company,
    staleTime: 60000, // 1 minute
  });
};

export const useCGV = (cgvId) => {
  return useQuery({
    queryKey: ['cgv', cgvId],
    queryFn: () => legalApi.getCGV(cgvId),
    enabled: !!cgvId,
  });
};

export const useCreateCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => legalApi.createCGV(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cgv-list']);
      toast.success('CGV créées avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useUpdateCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => legalApi.updateCGV(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['cgv-list']);
      queryClient.invalidateQueries(['cgv', variables.id]);
      toast.success('CGV mises à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const usePublishCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cgvId) => legalApi.publishCGV(cgvId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cgv-list']);
      toast.success('CGV publiées - nouvelle version active');
    },
    onError: (error) => {
      toast.error(`Erreur publication: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useArchiveCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cgvId) => legalApi.archiveCGV(cgvId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cgv-list']);
      toast.success('CGV archivées');
    },
    onError: (error) => {
      toast.error(`Erreur archivage: ${error.response?.data?.message || error.message}`);
    }
  });
};

// ============ SIGNATURE HOOKS ============

export const useSignatureRequests = (filters = {}) => {
  return useQuery({
    queryKey: ['signature-requests', filters],
    queryFn: () => legalApi.getSignatureRequests(filters),
    staleTime: 30000,
  });
};

export const useSignatureRequest = (requestId) => {
  return useQuery({
    queryKey: ['signature-request', requestId],
    queryFn: () => legalApi.getSignatureRequest(requestId),
    enabled: !!requestId,
  });
};

export const useCreateSignatureRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => legalApi.createSignatureRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['signature-requests']);
      toast.success('Demande de signature envoyée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useResendSignature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId) => legalApi.resendSignatureRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['signature-requests']);
      toast.success('Demande renvoyée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useCancelSignature = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requestId) => legalApi.cancelSignatureRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['signature-requests']);
      toast.success('Demande annulée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// ============ ACCEPTANCE HOOKS ============

export const useAcceptanceHistory = (filters = {}) => {
  return useQuery({
    queryKey: ['acceptances', filters],
    queryFn: () => legalApi.getAcceptanceHistory(filters),
    staleTime: 60000,
  });
};

// ============ STATS HOOKS ============

export const useLegalStats = (company) => {
  return useQuery({
    queryKey: ['legal-stats', company],
    queryFn: () => legalApi.getLegalStats(company),
    enabled: !!company,
    staleTime: 120000, // 2 minutes
  });
};

export const useComplianceReport = (company) => {
  return useQuery({
    queryKey: ['compliance-report', company],
    queryFn: () => legalApi.getComplianceReport(company),
    enabled: !!company,
    staleTime: 300000, // 5 minutes
  });
};

// ============ COMBINED HOOK ============

export const useLegalData = (company) => {
  const cgvList = useCGVList(company);
  const signatures = useSignatureRequests({ company });
  const acceptances = useAcceptanceHistory({ company });
  const stats = useLegalStats(company);
  
  return {
    cgvList,
    signatures,
    acceptances,
    stats,
    isLoading: cgvList.isLoading || signatures.isLoading,
    error: cgvList.error || signatures.error
  };
};

export default useLegalData;
```

---

## 📝 FICHIER 3 : LegalDashboard.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/LegalDashboard.jsx
import React, { useState } from 'react';
import { 
  FileText, PenTool, CheckCircle, Clock, AlertTriangle,
  Plus, RefreshCw, Settings, BarChart3 
} from 'lucide-react';
import { useLegalData, useLegalStats } from './hooks/useLegalData';
import CGVManager from './components/CGVManager';
import SignatureRequests from './components/SignatureRequests';
import AcceptanceHistory from './components/AcceptanceHistory';
import LegalStats from './components/LegalStats';
import toast from 'react-hot-toast';

const COMPANIES = [
  { id: 'HYPERVISUAL', name: 'HYPERVISUAL' },
  { id: 'DAINAMICS', name: 'DAINAMICS' },
  { id: 'LEXAIA', name: 'LEXAIA' },
  { id: 'ENKI_REALTY', name: 'ENKI REALTY' },
  { id: 'TAKEOUT', name: 'TAKEOUT' }
];

const LegalDashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState('HYPERVISUAL');
  const [activeTab, setActiveTab] = useState('cgv');
  
  const { cgvList, signatures, acceptances, stats, isLoading } = useLegalData(selectedCompany);
  
  const tabs = [
    { id: 'cgv', label: 'CGV / CGL', icon: FileText, count: cgvList.data?.length || 0 },
    { id: 'signatures', label: 'Signatures', icon: PenTool, count: signatures.data?.pending || 0 },
    { id: 'history', label: 'Acceptations', icon: CheckCircle, count: acceptances.data?.length || 0 },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 }
  ];
  
  const handleRefresh = () => {
    cgvList.refetch();
    signatures.refetch();
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
              <FileText className="me-2" size={24} />
              Gestion Légale
            </h2>
            <div className="text-muted mt-1">
              CGV, CGL et signatures électroniques
            </div>
          </div>
          <div className="col-auto ms-auto">
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
                <div className="subheader">CGV/CGL actives</div>
              </div>
              <div className="h1 mb-0">{stats.data?.active_documents || 0}</div>
              <div className="text-muted small">
                {stats.data?.draft_documents || 0} brouillons
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Signatures en attente</div>
                {(stats.data?.pending_signatures || 0) > 0 && (
                  <span className="badge bg-warning ms-auto">
                    {stats.data?.pending_signatures}
                  </span>
                )}
              </div>
              <div className="h1 mb-0 text-warning">
                {stats.data?.pending_signatures || 0}
              </div>
              <div className="text-muted small">
                {stats.data?.expired_signatures || 0} expirées
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Taux acceptation</div>
              </div>
              <div className="h1 mb-0 text-success">
                {stats.data?.acceptance_rate || 0}%
              </div>
              <div className="text-muted small">
                {stats.data?.total_acceptances || 0} acceptations totales
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
              <div className={`h1 mb-0 ${stats.data?.compliance_score >= 80 ? 'text-success' : 'text-warning'}`}>
                {stats.data?.compliance_score || 0}%
              </div>
              <div className="text-muted small">
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
                  {tab.count !== undefined && (
                    <span className="badge bg-secondary ms-2">{tab.count}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body">
          {activeTab === 'cgv' && (
            <CGVManager 
              company={selectedCompany}
              cgvList={cgvList.data}
              isLoading={cgvList.isLoading}
              onRefresh={() => cgvList.refetch()}
            />
          )}
          {activeTab === 'signatures' && (
            <SignatureRequests 
              company={selectedCompany}
              requests={signatures.data}
              isLoading={signatures.isLoading}
              onRefresh={() => signatures.refetch()}
            />
          )}
          {activeTab === 'history' && (
            <AcceptanceHistory 
              company={selectedCompany}
              acceptances={acceptances.data}
              isLoading={acceptances.isLoading}
              onRefresh={() => acceptances.refetch()}
            />
          )}
          {activeTab === 'stats' && (
            <LegalStats 
              company={selectedCompany}
              stats={stats.data}
              isLoading={stats.isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalDashboard;
```

---

## 📝 FICHIER 4 : CGVManager.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/CGVManager.jsx
import React, { useState } from 'react';
import { 
  Plus, Edit, Eye, Archive, Upload, FileText, 
  CheckCircle, Clock, AlertTriangle, MoreVertical 
} from 'lucide-react';
import { usePublishCGV, useArchiveCGV } from '../hooks/useLegalData';
import CGVEditor from './CGVEditor';
import CGVPreview from './CGVPreview';
import toast from 'react-hot-toast';

const CGV_TYPES = [
  { id: 'cgv_vente', label: 'CGV Vente', description: 'Conditions générales de vente de produits' },
  { id: 'cgl_location', label: 'CGL Location', description: 'Conditions générales de location' },
  { id: 'cgv_service', label: 'CGV Service', description: 'Conditions générales de prestation de services' }
];

const CGVManager = ({ company, cgvList = [], isLoading, onRefresh }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCGV, setSelectedCGV] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  const publishCGV = usePublishCGV();
  const archiveCGV = useArchiveCGV();
  
  const handleCreate = (type) => {
    setSelectedCGV(null);
    setSelectedType(type);
    setShowEditor(true);
  };
  
  const handleEdit = (cgv) => {
    setSelectedCGV(cgv);
    setSelectedType(cgv.type);
    setShowEditor(true);
  };
  
  const handlePreview = (cgv) => {
    setSelectedCGV(cgv);
    setShowPreview(true);
  };
  
  const handlePublish = async (cgvId) => {
    if (!confirm('Publier cette version ? Elle deviendra la version active.')) return;
    await publishCGV.mutateAsync(cgvId);
    onRefresh();
  };
  
  const handleArchive = async (cgvId) => {
    if (!confirm('Archiver ce document ?')) return;
    await archiveCGV.mutateAsync(cgvId);
    onRefresh();
  };
  
  const handleSaveEditor = () => {
    setShowEditor(false);
    setSelectedCGV(null);
    onRefresh();
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'bg-secondary', icon: Clock, label: 'Brouillon' },
      active: { class: 'bg-success', icon: CheckCircle, label: 'Active' },
      archived: { class: 'bg-warning', icon: Archive, label: 'Archivée' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`badge ${badge.class}`}>
        <badge.icon size={12} className="me-1" />
        {badge.label}
      </span>
    );
  };
  
  const filteredList = filterType === 'all' 
    ? cgvList 
    : cgvList?.filter(cgv => cgv.type === filterType);

  if (showEditor) {
    return (
      <CGVEditor 
        company={company}
        type={selectedType}
        cgv={selectedCGV}
        onSave={handleSaveEditor}
        onCancel={() => setShowEditor(false)}
      />
    );
  }
  
  if (showPreview && selectedCGV) {
    return (
      <CGVPreview 
        cgv={selectedCGV}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div>
      {/* Actions header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="btn-group">
          <button
            className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterType('all')}
          >
            Tous
          </button>
          {CGV_TYPES.map(type => (
            <button
              key={type.id}
              className={`btn ${filterType === type.id ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterType(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>
        
        <div className="dropdown">
          <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown">
            <Plus size={16} className="me-1" />
            Nouveau document
          </button>
          <div className="dropdown-menu dropdown-menu-end">
            {CGV_TYPES.map(type => (
              <a 
                key={type.id}
                className="dropdown-item" 
                href="#"
                onClick={(e) => { e.preventDefault(); handleCreate(type.id); }}
              >
                <FileText size={14} className="me-2" />
                {type.label}
                <div className="text-muted small">{type.description}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des CGV */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : filteredList?.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <FileText size={48} />
          </div>
          <p className="empty-title">Aucun document</p>
          <p className="empty-subtitle text-muted">
            Créez vos premières conditions générales.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Version</th>
                <th>Statut</th>
                <th>Dernière modification</th>
                <th className="w-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList?.map(cgv => (
                <tr key={cgv.id}>
                  <td>
                    <div className="font-weight-medium">{cgv.title}</div>
                    <div className="text-muted small">
                      Créé le {new Date(cgv.date_created).toLocaleDateString('fr-CH')}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-blue-lt">
                      {CGV_TYPES.find(t => t.id === cgv.type)?.label || cgv.type}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">v{cgv.version}</span>
                  </td>
                  <td>{getStatusBadge(cgv.status)}</td>
                  <td>
                    {cgv.date_updated 
                      ? new Date(cgv.date_updated).toLocaleDateString('fr-CH')
                      : '-'
                    }
                  </td>
                  <td>
                    <div className="btn-list flex-nowrap">
                      <button 
                        className="btn btn-sm btn-ghost-primary"
                        onClick={() => handlePreview(cgv)}
                        title="Prévisualiser"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost-primary"
                        onClick={() => handleEdit(cgv)}
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
                          {cgv.status === 'draft' && (
                            <a 
                              className="dropdown-item text-success" 
                              href="#"
                              onClick={(e) => { e.preventDefault(); handlePublish(cgv.id); }}
                            >
                              <Upload size={14} className="me-2" />
                              Publier
                            </a>
                          )}
                          {cgv.status === 'active' && (
                            <a 
                              className="dropdown-item" 
                              href="#"
                              onClick={(e) => { e.preventDefault(); handleArchive(cgv.id); }}
                            >
                              <Archive size={14} className="me-2" />
                              Archiver
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CGVManager;
```

---

## 📝 FICHIER 5 : CGVEditor.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/CGVEditor.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, Eye, AlertTriangle, Info } from 'lucide-react';
import { useCreateCGV, useUpdateCGV } from '../hooks/useLegalData';

const MANDATORY_CLAUSES = {
  cgv_vente: [
    { id: 'identification_vendeur', label: 'Identification vendeur (raison sociale, adresse, IDE)' },
    { id: 'prix_paiement', label: 'Prix et conditions de paiement (TVA 8.1%, délais, intérêts)' },
    { id: 'garantie_legale', label: 'Garantie légale (2 ans minimum B2C - art. 210 CO)' },
    { id: 'livraison', label: 'Conditions de livraison' },
    { id: 'droit_applicable', label: 'Droit applicable et for juridique' }
  ],
  cgl_location: [
    { id: 'identification_bailleur', label: 'Identification bailleur' },
    { id: 'objet_loue', label: 'Description objet loué' },
    { id: 'loyer_charges', label: 'Loyer et charges' },
    { id: 'depot_garantie', label: 'Dépôt de garantie (max 3 mois - art. 257e CO)' },
    { id: 'duree_resiliation', label: 'Durée et résiliation (formulaires cantonaux)' },
    { id: 'etat_lieux', label: 'État des lieux' }
  ],
  cgv_service: [
    { id: 'identification_prestataire', label: 'Identification prestataire' },
    { id: 'description_services', label: 'Description des services' },
    { id: 'prix_facturation', label: 'Prix et facturation' },
    { id: 'delais_execution', label: 'Délais d\'exécution' },
    { id: 'responsabilite', label: 'Limitation de responsabilité' }
  ]
};

const FORBIDDEN_CLAUSES = [
  'Exclusion responsabilité pour faute grave ou dol (art. 100 CO)',
  'Modification unilatérale sans préavis adéquat',
  'Pénalités disproportionnées (>20% valeur contrat)',
  'Renonciation aux droits légaux du consommateur',
  'Clauses surprenantes non signalées (règle de l\'insolite)'
];

const CGVEditor = ({ company, type, cgv, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    version: 1,
    content: '',
    clauses_checked: [],
    effective_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  const createCGV = useCreateCGV();
  const updateCGV = useUpdateCGV();
  const isEditing = !!cgv;
  
  useEffect(() => {
    if (cgv) {
      setFormData({
        title: cgv.title || '',
        version: cgv.version || 1,
        content: cgv.content || '',
        clauses_checked: cgv.clauses_checked || [],
        effective_date: cgv.effective_date || new Date().toISOString().split('T')[0],
        notes: cgv.notes || ''
      });
    }
  }, [cgv]);
  
  const mandatoryClauses = MANDATORY_CLAUSES[type] || [];
  
  const handleClauseToggle = (clauseId) => {
    setFormData(prev => ({
      ...prev,
      clauses_checked: prev.clauses_checked.includes(clauseId)
        ? prev.clauses_checked.filter(c => c !== clauseId)
        : [...prev.clauses_checked, clauseId]
    }));
  };
  
  const validateForm = () => {
    const errors = [];
    
    const missingClauses = mandatoryClauses.filter(
      clause => !formData.clauses_checked.includes(clause.id)
    );
    if (missingClauses.length > 0) {
      errors.push(`Clauses obligatoires manquantes: ${missingClauses.map(c => c.label).join(', ')}`);
    }
    
    if (formData.content.length < 500) {
      errors.push('Le contenu doit faire au moins 500 caractères');
    }
    
    if (!formData.title.trim()) {
      errors.push('Le titre est obligatoire');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const data = {
      ...formData,
      type,
      company,
      status: 'draft'
    };
    
    try {
      if (isEditing) {
        await updateCGV.mutateAsync({ id: cgv.id, data });
      } else {
        await createCGV.mutateAsync(data);
      }
      onSave();
    } catch (error) {
      // Error handled by hook
    }
  };
  
  const getTypeLabel = () => {
    const labels = {
      cgv_vente: 'Conditions Générales de Vente',
      cgl_location: 'Conditions Générales de Location',
      cgv_service: 'Conditions Générales de Service'
    };
    return labels[type] || type;
  };

  return (
    <div className="row">
      <div className="col-lg-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>{isEditing ? 'Modifier' : 'Créer'} {getTypeLabel()}</h3>
            <div className="btn-list">
              <button 
                type="button" 
                className="btn btn-ghost-secondary"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} className="me-1" />
                {showPreview ? 'Masquer' : 'Prévisualiser'}
              </button>
              <button 
                type="button" 
                className="btn btn-ghost-secondary"
                onClick={onCancel}
              >
                <X size={16} className="me-1" />
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={createCGV.isPending || updateCGV.isPending}
              >
                <Save size={16} className="me-1" />
                {createCGV.isPending || updateCGV.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
          
          {/* Erreurs de validation */}
          {validationErrors.length > 0 && (
            <div className="alert alert-danger mb-4">
              <AlertTriangle size={16} className="me-2" />
              <strong>Erreurs de validation:</strong>
              <ul className="mb-0 mt-2">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Formulaire */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label required">Titre du document</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Conditions Générales de Vente - HYPERVISUAL"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <label className="form-label">Version</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className="mb-3">
                    <label className="form-label">Date d'effet</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label required">Contenu des conditions</label>
                <textarea 
                  className="form-control"
                  rows="15"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder={`Rédigez ici le contenu complet de vos conditions générales...

Vous pouvez utiliser des variables :
{{company_name}} - Nom de l'entreprise
{{company_address}} - Adresse
{{company_ide}} - Numéro IDE
{{current_date}} - Date du jour
{{vat_rate}} - Taux TVA (8.1%)`}
                  required
                />
                <small className="text-muted">
                  {formData.content.length} caractères (minimum 500)
                </small>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Notes internes</label>
                <textarea 
                  className="form-control"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notes internes (non visibles par les clients)"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      
      {/* Sidebar - Checklist clauses */}
      <div className="col-lg-4">
        {/* Clauses obligatoires */}
        <div className="card mb-4">
          <div className="card-header">
            <h4 className="card-title text-success">
              ✓ Clauses obligatoires
            </h4>
          </div>
          <div className="card-body">
            {mandatoryClauses.map(clause => (
              <label className="form-check mb-2" key={clause.id}>
                <input 
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.clauses_checked.includes(clause.id)}
                  onChange={() => handleClauseToggle(clause.id)}
                />
                <span className="form-check-label">{clause.label}</span>
              </label>
            ))}
            <div className="mt-3 text-muted small">
              <Info size={14} className="me-1" />
              Toutes ces clauses doivent être cochées pour conformité légale suisse.
            </div>
          </div>
        </div>
        
        {/* Clauses interdites */}
        <div className="card border-danger">
          <div className="card-header bg-danger-lt">
            <h4 className="card-title text-danger">
              ✗ Clauses interdites (LCD art. 8)
            </h4>
          </div>
          <div className="card-body">
            <ul className="list-unstyled mb-0">
              {FORBIDDEN_CLAUSES.map((clause, i) => (
                <li key={i} className="mb-2 text-danger small">
                  <X size={14} className="me-1" />
                  {clause}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGVEditor;
```

---

## 📝 FICHIER 6 : CGVPreview.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/CGVPreview.jsx
import React from 'react';
import { X, Download, Printer, FileText } from 'lucide-react';

const CGVPreview = ({ cgv, onClose }) => {
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // Créer un blob avec le contenu
    const blob = new Blob([cgv.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cgv.title.replace(/\s+/g, '_')}_v${cgv.version}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>
            <FileText size={20} className="me-2" />
            {cgv.title}
          </h3>
          <div className="text-muted">
            Version {cgv.version} • 
            {cgv.effective_date && ` Effective depuis le ${new Date(cgv.effective_date).toLocaleDateString('fr-CH')}`}
          </div>
        </div>
        <div className="btn-list">
          <button className="btn btn-ghost-secondary" onClick={handlePrint}>
            <Printer size={16} className="me-1" />
            Imprimer
          </button>
          <button className="btn btn-ghost-secondary" onClick={handleDownload}>
            <Download size={16} className="me-1" />
            Télécharger
          </button>
          <button className="btn btn-ghost-secondary" onClick={onClose}>
            <X size={16} className="me-1" />
            Fermer
          </button>
        </div>
      </div>
      
      {/* Contenu prévisualisé */}
      <div className="card">
        <div className="card-body">
          <div 
            className="cgv-preview-content"
            style={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'serif',
              lineHeight: '1.8',
              fontSize: '14px'
            }}
          >
            {cgv.content}
          </div>
        </div>
      </div>
      
      {/* Métadonnées */}
      <div className="card mt-4">
        <div className="card-header">
          <h4 className="card-title">Informations</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <strong>Type:</strong><br />
              {cgv.type}
            </div>
            <div className="col-md-3">
              <strong>Statut:</strong><br />
              <span className={`badge bg-${cgv.status === 'active' ? 'success' : 'secondary'}`}>
                {cgv.status}
              </span>
            </div>
            <div className="col-md-3">
              <strong>Créé le:</strong><br />
              {new Date(cgv.date_created).toLocaleDateString('fr-CH')}
            </div>
            <div className="col-md-3">
              <strong>Modifié le:</strong><br />
              {cgv.date_updated 
                ? new Date(cgv.date_updated).toLocaleDateString('fr-CH')
                : '-'
              }
            </div>
          </div>
          {cgv.notes && (
            <div className="mt-3">
              <strong>Notes internes:</strong>
              <p className="text-muted mb-0">{cgv.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CGVPreview;
```

---

## 📝 FICHIER 7 : SignatureRequests.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/SignatureRequests.jsx
import React, { useState } from 'react';
import { 
  PenTool, Send, RefreshCw, XCircle, CheckCircle, 
  Clock, Eye, Mail, User, FileText, Plus, AlertTriangle 
} from 'lucide-react';
import { 
  useCreateSignatureRequest, useResendSignature, useCancelSignature 
} from '../hooks/useLegalData';
import { legalApi } from '../services/legalApi';
import toast from 'react-hot-toast';

const SignatureRequests = ({ company, requests = [], isLoading, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const createRequest = useCreateSignatureRequest();
  const resendRequest = useResendSignature();
  const cancelRequest = useCancelSignature();
  
  const handleResend = async (requestId) => {
    await resendRequest.mutateAsync(requestId);
    onRefresh();
  };
  
  const handleCancel = async (requestId) => {
    if (!confirm('Annuler cette demande de signature ?')) return;
    await cancelRequest.mutateAsync(requestId);
    onRefresh();
  };
  
  const handleDownload = async (requestId) => {
    try {
      const blob = await legalApi.downloadSignedDocument(requestId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document_signe_${requestId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-secondary', icon: Clock, label: 'En attente d\'envoi' },
      sent: { class: 'bg-blue', icon: Mail, label: 'Envoyée' },
      viewed: { class: 'bg-info', icon: Eye, label: 'Vue' },
      signed: { class: 'bg-success', icon: CheckCircle, label: 'Signée' },
      declined: { class: 'bg-danger', icon: XCircle, label: 'Refusée' },
      expired: { class: 'bg-warning', icon: AlertTriangle, label: 'Expirée' },
      cancelled: { class: 'bg-dark', icon: XCircle, label: 'Annulée' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`badge ${badge.class}`}>
        <badge.icon size={12} className="me-1" />
        {badge.label}
      </span>
    );
  };
  
  const filteredRequests = filterStatus === 'all'
    ? requests
    : requests?.filter(r => r.status === filterStatus);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Actions header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="btn-group">
          <button
            className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('all')}
          >
            Toutes
          </button>
          <button
            className={`btn ${filterStatus === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('pending')}
          >
            En attente
          </button>
          <button
            className={`btn ${filterStatus === 'sent' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('sent')}
          >
            Envoyées
          </button>
          <button
            className={`btn ${filterStatus === 'signed' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStatus('signed')}
          >
            Signées
          </button>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} className="me-1" />
          Nouvelle demande
        </button>
      </div>

      {/* Liste */}
      {filteredRequests?.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <PenTool size={48} />
          </div>
          <p className="empty-title">Aucune demande de signature</p>
          <p className="empty-subtitle text-muted">
            Créez une demande pour faire signer vos documents.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>Document</th>
                <th>Signataire</th>
                <th>Statut</th>
                <th>Envoyée le</th>
                <th>Expire le</th>
                <th className="w-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests?.map(request => (
                <tr key={request.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-sm bg-primary-lt me-2">
                        <FileText size={16} />
                      </span>
                      <div>
                        <div className="font-weight-medium">{request.document_title}</div>
                        <div className="text-muted small">{request.document_type}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-sm bg-secondary-lt me-2">
                        <User size={16} />
                      </span>
                      <div>
                        <div>{request.signer_name}</div>
                        <div className="text-muted small">{request.signer_email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>
                    {request.sent_at 
                      ? new Date(request.sent_at).toLocaleDateString('fr-CH')
                      : '-'
                    }
                  </td>
                  <td>
                    {request.expires_at ? (
                      <span className={new Date(request.expires_at) < new Date() ? 'text-danger' : ''}>
                        {new Date(request.expires_at).toLocaleDateString('fr-CH')}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="btn-list flex-nowrap">
                      {['pending', 'sent', 'viewed'].includes(request.status) && (
                        <>
                          <button 
                            className="btn btn-sm btn-ghost-primary"
                            onClick={() => handleResend(request.id)}
                            title="Renvoyer"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button 
                            className="btn btn-sm btn-ghost-danger"
                            onClick={() => handleCancel(request.id)}
                            title="Annuler"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {request.status === 'signed' && (
                        <button 
                          className="btn btn-sm btn-ghost-success"
                          onClick={() => handleDownload(request.id)}
                          title="Télécharger"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SignatureRequests;
```

---

## 📝 FICHIER 8 : AcceptanceHistory.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/AcceptanceHistory.jsx
import React, { useState } from 'react';
import { 
  CheckCircle, User, FileText, Calendar, MapPin, 
  Monitor, Clock, Search 
} from 'lucide-react';

const AcceptanceHistory = ({ company, acceptances = [], isLoading, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  
  const filteredAcceptances = acceptances?.filter(acc => {
    // Filtre recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = acc.client_name?.toLowerCase().includes(query);
      const matchEmail = acc.client_email?.toLowerCase().includes(query);
      const matchDoc = acc.document_title?.toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchDoc) return false;
    }
    
    // Filtre date
    if (dateFilter !== 'all') {
      const accDate = new Date(acc.accepted_at);
      const now = new Date();
      const diffDays = Math.floor((now - accDate) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7d' && diffDays > 7) return false;
      if (dateFilter === '30d' && diffDays > 30) return false;
      if (dateFilter === '90d' && diffDays > 90) return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-icon">
            <span className="input-icon-addon">
              <Search size={16} />
            </span>
            <input 
              type="text"
              className="form-control"
              placeholder="Rechercher par nom, email ou document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="btn-group w-100">
            <button
              className={`btn ${dateFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateFilter('all')}
            >
              Tout
            </button>
            <button
              className={`btn ${dateFilter === '7d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateFilter('7d')}
            >
              7 jours
            </button>
            <button
              className={`btn ${dateFilter === '30d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateFilter('30d')}
            >
              30 jours
            </button>
            <button
              className={`btn ${dateFilter === '90d' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setDateFilter('90d')}
            >
              90 jours
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      {filteredAcceptances?.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <CheckCircle size={48} />
          </div>
          <p className="empty-title">Aucune acceptation</p>
          <p className="empty-subtitle text-muted">
            Les acceptations de CGV/CGL apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>Client</th>
                <th>Document</th>
                <th>Date d'acceptation</th>
                <th>IP / Appareil</th>
                <th>Preuve</th>
              </tr>
            </thead>
            <tbody>
              {filteredAcceptances?.map(acc => (
                <tr key={acc.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-sm bg-success-lt me-2">
                        <User size={16} />
                      </span>
                      <div>
                        <div className="font-weight-medium">{acc.client_name}</div>
                        <div className="text-muted small">{acc.client_email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FileText size={14} className="me-2 text-muted" />
                      <div>
                        <div>{acc.document_title}</div>
                        <div className="text-muted small">Version {acc.document_version}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Calendar size={14} className="me-2 text-muted" />
                      <div>
                        <div>{new Date(acc.accepted_at).toLocaleDateString('fr-CH')}</div>
                        <div className="text-muted small">
                          {new Date(acc.accepted_at).toLocaleTimeString('fr-CH')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-muted small">
                      <div className="d-flex align-items-center">
                        <MapPin size={12} className="me-1" />
                        {acc.ip_address || '-'}
                      </div>
                      <div className="d-flex align-items-center">
                        <Monitor size={12} className="me-1" />
                        {acc.user_agent ? acc.user_agent.substring(0, 30) + '...' : '-'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-success">
                      <CheckCircle size={12} className="me-1" />
                      Horodaté
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Info légale */}
      <div className="alert alert-info mt-4">
        <strong>Conservation légale:</strong> Les preuves d'acceptation sont conservées 10 ans 
        conformément à l'art. 958f CO (obligation de conservation des pièces comptables).
      </div>
    </div>
  );
};

export default AcceptanceHistory;
```

---

## 📝 FICHIER 9 : LegalStats.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/LegalStats.jsx
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { TrendingUp, FileText, PenTool, CheckCircle, AlertTriangle } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

const LegalStats = ({ company, stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Données pour graphiques
  const documentsByType = [
    { name: 'CGV Vente', value: stats?.cgv_vente_count || 0 },
    { name: 'CGL Location', value: stats?.cgl_location_count || 0 },
    { name: 'CGV Service', value: stats?.cgv_service_count || 0 }
  ];
  
  const signaturesByStatus = [
    { name: 'Signées', value: stats?.signed_count || 0 },
    { name: 'En attente', value: stats?.pending_count || 0 },
    { name: 'Expirées', value: stats?.expired_count || 0 },
    { name: 'Refusées', value: stats?.declined_count || 0 }
  ];
  
  const acceptancesTrend = stats?.acceptances_trend || [];

  return (
    <div>
      {/* KPIs détaillés */}
      <div className="row row-deck row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <FileText size={20} className="text-primary me-2" />
                <div className="subheader">Documents actifs</div>
              </div>
              <div className="h1 mb-0">{stats?.active_documents || 0}</div>
              <div className="text-muted small mt-1">
                {stats?.total_documents || 0} total • {stats?.archived_documents || 0} archivés
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <PenTool size={20} className="text-info me-2" />
                <div className="subheader">Signatures ce mois</div>
              </div>
              <div className="h1 mb-0">{stats?.signatures_this_month || 0}</div>
              <div className="text-muted small mt-1">
                {stats?.avg_signature_time || 0}h temps moyen de signature
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <div className="subheader">Taux d'acceptation</div>
              </div>
              <div className="h1 mb-0 text-success">{stats?.acceptance_rate || 0}%</div>
              <div className="text-muted small mt-1">
                {stats?.total_acceptances || 0} acceptations totales
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <AlertTriangle size={20} className="text-warning me-2" />
                <div className="subheader">À mettre à jour</div>
              </div>
              <div className="h1 mb-0 text-warning">{stats?.outdated_documents || 0}</div>
              <div className="text-muted small mt-1">
                Documents > 12 mois sans révision
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Documents par type</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={documentsByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {documentsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Signatures par statut</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={signaturesByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {signaturesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tendance acceptations */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Évolution des acceptations (6 derniers mois)</h3>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={acceptancesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="acceptances" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e' }}
              />
              <Line 
                type="monotone" 
                dataKey="signatures" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rapport conformité */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Rapport de conformité</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h4>Points conformes ✓</h4>
              <ul className="list-unstyled">
                {stats?.compliance_checklist?.passed?.map((item, i) => (
                  <li key={i} className="text-success mb-2">
                    <CheckCircle size={14} className="me-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-6">
              <h4>Points à améliorer ✗</h4>
              <ul className="list-unstyled">
                {stats?.compliance_checklist?.failed?.map((item, i) => (
                  <li key={i} className="text-danger mb-2">
                    <AlertTriangle size={14} className="me-2" />
                    {item}
                  </li>
                ))}
                {(!stats?.compliance_checklist?.failed || stats?.compliance_checklist?.failed.length === 0) && (
                  <li className="text-success">
                    <CheckCircle size={14} className="me-2" />
                    Tous les critères sont conformes
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalStats;
```

---

## 📝 FICHIER 10 : legal/index.js

```javascript
// src/frontend/src/portals/superadmin/legal/index.js
export { default as LegalDashboard } from './LegalDashboard';
export { default as CGVManager } from './components/CGVManager';
export { default as CGVEditor } from './components/CGVEditor';
export { default as CGVPreview } from './components/CGVPreview';
export { default as SignatureRequests } from './components/SignatureRequests';
export { default as AcceptanceHistory } from './components/AcceptanceHistory';
export { default as LegalStats } from './components/LegalStats';
export * from './hooks/useLegalData';
export { legalApi } from './services/legalApi';
```

---

# PARTIE 2 : MODULE COLLECTION

## 📝 FICHIER 11 : collectionApi.js

```javascript
// src/frontend/src/portals/superadmin/collection/services/collectionApi.js
import axios from 'axios';

const API_BASE = '/api/collection';

export const collectionApi = {
  // ============ TRACKING & WORKFLOW ============
  
  getDashboard: async (company) => {
    const response = await axios.get(`${API_BASE}/dashboard/${company}`);
    return response.data;
  },
  
  initializeTracking: async (invoiceId) => {
    const response = await axios.post(`${API_BASE}/initialize/${invoiceId}`);
    return response.data;
  },
  
  processWorkflow: async (company) => {
    const response = await axios.post(`${API_BASE}/process`, { company });
    return response.data;
  },
  
  getTrackingList: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/tracking`, { params: filters });
    return response.data;
  },
  
  getTrackingDetail: async (trackingId) => {
    const response = await axios.get(`${API_BASE}/tracking/${trackingId}`);
    return response.data;
  },
  
  // ============ PAIEMENTS ============
  
  recordPayment: async (trackingId, paymentData) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/payment`, paymentData);
    return response.data;
  },
  
  getPaymentHistory: async (trackingId) => {
    const response = await axios.get(`${API_BASE}/${trackingId}/payments`);
    return response.data;
  },
  
  // ============ ACTIONS MANUELLES ============
  
  suspendCollection: async (trackingId, reason) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/suspend`, { reason });
    return response.data;
  },
  
  resumeCollection: async (trackingId) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/resume`);
    return response.data;
  },
  
  writeOff: async (trackingId, reason) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/write-off`, { reason });
    return response.data;
  },
  
  sendManualReminder: async (trackingId, type) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/reminder`, { type });
    return response.data;
  },
  
  // ============ INTÉRÊTS ============
  
  calculateInterest: async (data) => {
    const response = await axios.post(`${API_BASE}/calculate-interest`, data);
    return response.data;
  },
  
  checkRate: async (rate) => {
    const response = await axios.get(`${API_BASE}/rate-check/${rate}`);
    return response.data;
  },
  
  // ============ POURSUITES LP ============
  
  initiateLPCase: async (trackingId) => {
    const response = await axios.post(`${API_BASE}/lp/initiate/${trackingId}`);
    return response.data;
  },
  
  getLPCases: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/lp/cases`, { params: filters });
    return response.data;
  },
  
  getLPCaseDetail: async (caseId) => {
    const response = await axios.get(`${API_BASE}/lp/${caseId}`);
    return response.data;
  },
  
  continueLPCase: async (caseId) => {
    const response = await axios.post(`${API_BASE}/lp/${caseId}/continue`);
    return response.data;
  },
  
  downloadLPDocument: async (caseId, docType) => {
    const response = await axios.get(`${API_BASE}/lp/${caseId}/document/${docType}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // ============ CONFIGURATION ============
  
  getWorkflowConfig: async (company) => {
    const response = await axios.get(`${API_BASE}/config/${company}`);
    return response.data;
  },
  
  updateWorkflowConfig: async (company, config) => {
    const response = await axios.put(`${API_BASE}/config/${company}`, config);
    return response.data;
  },
  
  // ============ STATISTIQUES ============
  
  getStats: async (company, period = '30d') => {
    const response = await axios.get(`${API_BASE}/stats/${company}`, { params: { period } });
    return response.data;
  },
  
  getAgingReport: async (company) => {
    const response = await axios.get(`${API_BASE}/aging/${company}`);
    return response.data;
  }
};

export default collectionApi;
```

---

## 📝 FICHIER 12 : useCollectionData.js

```javascript
// src/frontend/src/portals/superadmin/collection/hooks/useCollectionData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi } from '../services/collectionApi';
import toast from 'react-hot-toast';

export const useCollectionDashboard = (company) => {
  return useQuery({
    queryKey: ['collection-dashboard', company],
    queryFn: () => collectionApi.getDashboard(company),
    enabled: !!company,
    refetchInterval: 60000,
  });
};

export const useTrackingList = (filters = {}) => {
  return useQuery({
    queryKey: ['collection-tracking', filters],
    queryFn: () => collectionApi.getTrackingList(filters),
    staleTime: 30000,
  });
};

export const useTrackingDetail = (trackingId) => {
  return useQuery({
    queryKey: ['collection-tracking-detail', trackingId],
    queryFn: () => collectionApi.getTrackingDetail(trackingId),
    enabled: !!trackingId,
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, paymentData }) => 
      collectionApi.recordPayment(trackingId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['collection']);
      toast.success('Paiement enregistré');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useSuspendCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, reason }) => 
      collectionApi.suspendCollection(trackingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['collection']);
      toast.success('Recouvrement suspendu');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useResumeCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackingId) => collectionApi.resumeCollection(trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['collection']);
      toast.success('Recouvrement repris');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useWriteOff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trackingId, reason }) => 
      collectionApi.writeOff(trackingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['collection']);
      toast.success('Créance passée en perte');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useInitiateLP = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackingId) => collectionApi.initiateLPCase(trackingId),
    onSuccess: () => {
      queryClient.invalidateQueries(['collection']);
      queryClient.invalidateQueries(['lp-cases']);
      toast.success('Poursuite LP initiée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useLPCases = (filters = {}) => {
  return useQuery({
    queryKey: ['lp-cases', filters],
    queryFn: () => collectionApi.getLPCases(filters),
    staleTime: 60000,
  });
};

export const useWorkflowConfig = (company) => {
  return useQuery({
    queryKey: ['collection-config', company],
    queryFn: () => collectionApi.getWorkflowConfig(company),
    enabled: !!company,
  });
};

export const useUpdateWorkflowConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ company, config }) => 
      collectionApi.updateWorkflowConfig(company, config),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['collection-config', variables.company]);
      toast.success('Configuration mise à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

export const useAgingReport = (company) => {
  return useQuery({
    queryKey: ['aging-report', company],
    queryFn: () => collectionApi.getAgingReport(company),
    enabled: !!company,
  });
};

export const useCollectionData = (company) => {
  const dashboard = useCollectionDashboard(company);
  const tracking = useTrackingList({ company, status: ['overdue', 'reminder_1', 'reminder_2', 'formal_notice'] });
  const lpCases = useLPCases({ company });
  const config = useWorkflowConfig(company);
  const aging = useAgingReport(company);
  
  return {
    dashboard,
    tracking,
    lpCases,
    config,
    aging,
    isLoading: dashboard.isLoading || tracking.isLoading,
    error: dashboard.error || tracking.error
  };
};

export default useCollectionData;
```

---

Suite dans le prochain message (CollectionDashboard, DebtorsList, LPCases, InterestCalculator...)


---

## 📝 FICHIER 13 : CollectionDashboard.jsx

```javascript
// src/frontend/src/portals/superadmin/collection/CollectionDashboard.jsx
import React, { useState } from 'react';
import { 
  Banknote, AlertTriangle, Clock, TrendingUp, Users, 
  FileText, Settings, RefreshCw, Scale, Calculator 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useCollectionData, useAgingReport } from './hooks/useCollectionData';
import DebtorsList from './components/DebtorsList';
import LPCases from './components/LPCases';
import WorkflowConfig from './components/WorkflowConfig';
import InterestCalculator from './components/InterestCalculator';
import toast from 'react-hot-toast';

const COMPANIES = [
  { id: 'HYPERVISUAL', name: 'HYPERVISUAL' },
  { id: 'DAINAMICS', name: 'DAINAMICS' },
  { id: 'LEXAIA', name: 'LEXAIA' },
  { id: 'ENKI_REALTY', name: 'ENKI REALTY' },
  { id: 'TAKEOUT', name: 'TAKEOUT' }
];

const AGING_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

const CollectionDashboard = () => {
  const [selectedCompany, setSelectedCompany] = useState('HYPERVISUAL');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { dashboard, tracking, lpCases, config, aging, isLoading } = useCollectionData(selectedCompany);
  
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'debtors', label: 'Débiteurs', icon: Users },
    { id: 'lp', label: 'Poursuites LP', icon: Scale },
    { id: 'calculator', label: 'Calculateur', icon: Calculator },
    { id: 'config', label: 'Configuration', icon: Settings }
  ];
  
  const handleRefresh = () => {
    dashboard.refetch();
    tracking.refetch();
    lpCases.refetch();
    aging.refetch();
    toast.success('Données actualisées');
  };
  
  const agingChartData = aging.data ? [
    { name: '1-30j', value: aging.data.bucket_1_30 || 0, color: AGING_COLORS[0] },
    { name: '31-60j', value: aging.data.bucket_31_60 || 0, color: AGING_COLORS[1] },
    { name: '61-90j', value: aging.data.bucket_61_90 || 0, color: AGING_COLORS[2] },
    { name: '>90j', value: aging.data.bucket_90_plus || 0, color: AGING_COLORS[3] }
  ] : [];
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount || 0);
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Banknote className="me-2" size={24} />
              Recouvrement
            </h2>
            <div className="text-muted mt-1">
              Gestion des créances et poursuites LP
            </div>
          </div>
          <div className="col-auto ms-auto">
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

      {/* KPIs */}
      <div className="row row-deck row-cards mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Total impayés</div>
                <span className="ms-auto badge bg-danger">
                  {dashboard.data?.overdue_count || 0}
                </span>
              </div>
              <div className="h1 mb-0 text-danger">
                {formatCurrency(dashboard.data?.total_overdue)}
              </div>
              <div className="text-muted">
                Moyenne: {dashboard.data?.avg_days_overdue || 0} jours
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">En rappel</div>
              </div>
              <div className="h1 mb-0 text-warning">
                {dashboard.data?.in_reminder || 0}
              </div>
              <div className="text-muted">
                {formatCurrency(dashboard.data?.reminder_amount)} en cours
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Poursuites LP</div>
              </div>
              <div className="h1 mb-0 text-purple">
                {dashboard.data?.lp_cases || 0}
              </div>
              <div className="text-muted">
                {formatCurrency(dashboard.data?.lp_amount)} en poursuite
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="subheader">Récupéré ce mois</div>
              </div>
              <div className="h1 mb-0 text-success">
                {formatCurrency(dashboard.data?.recovered_this_month)}
              </div>
              <div className="text-muted">
                Taux: {dashboard.data?.recovery_rate || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique ancienneté */}
      {activeTab === 'overview' && (
        <div className="row mb-4">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Ancienneté des créances (Aging)</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agingChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `${v/1000}k`} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label) => `Ancienneté: ${label}`}
                    />
                    <Bar dataKey="value" fill="#3b82f6">
                      {agingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Répartition par statut</h3>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Rappel 1', value: dashboard.data?.status_reminder_1 || 0 },
                        { name: 'Rappel 2', value: dashboard.data?.status_reminder_2 || 0 },
                        { name: 'Mise en demeure', value: dashboard.data?.status_formal || 0 },
                        { name: 'Poursuite LP', value: dashboard.data?.status_lp || 0 }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#eab308" />
                      <Cell fill="#f97316" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <DebtorsList 
              company={selectedCompany}
              debtors={tracking.data?.slice(0, 10)}
              showQuickActions
              onRefresh={() => tracking.refetch()}
            />
          )}
          {activeTab === 'debtors' && (
            <DebtorsList 
              company={selectedCompany}
              debtors={tracking.data}
              showFilters
              showPagination
              onRefresh={() => tracking.refetch()}
            />
          )}
          {activeTab === 'lp' && (
            <LPCases 
              company={selectedCompany}
              cases={lpCases.data}
              onRefresh={() => lpCases.refetch()}
            />
          )}
          {activeTab === 'calculator' && (
            <InterestCalculator company={selectedCompany} />
          )}
          {activeTab === 'config' && (
            <WorkflowConfig 
              company={selectedCompany}
              config={config.data}
              onRefresh={() => config.refetch()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionDashboard;
```

---

## 📝 FICHIER 14 : DebtorsList.jsx

```javascript
// src/frontend/src/portals/superadmin/collection/components/DebtorsList.jsx
import React, { useState } from 'react';
import { 
  User, Mail, Phone, Clock, AlertTriangle, 
  DollarSign, Send, Pause, Play, Ban, Eye, Scale 
} from 'lucide-react';
import { 
  useSuspendCollection, useResumeCollection, 
  useWriteOff, useInitiateLP 
} from '../hooks/useCollectionData';
import { collectionApi } from '../services/collectionApi';
import toast from 'react-hot-toast';

const DebtorsList = ({ 
  company, 
  debtors = [], 
  showFilters = false, 
  showQuickActions = false,
  showPagination = false,
  onRefresh 
}) => {
  const [filter, setFilter] = useState('all');
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  
  const suspendCollection = useSuspendCollection();
  const resumeCollection = useResumeCollection();
  const writeOff = useWriteOff();
  const initiateLP = useInitiateLP();
  
  const handleSendReminder = async (trackingId, type) => {
    try {
      await collectionApi.sendManualReminder(trackingId, type);
      toast.success('Rappel envoyé');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };
  
  const handleSuspend = async (trackingId) => {
    const reason = prompt('Raison de la suspension:');
    if (reason) {
      await suspendCollection.mutateAsync({ trackingId, reason });
      onRefresh?.();
    }
  };
  
  const handleWriteOff = async (trackingId) => {
    if (!confirm('Confirmer le passage en perte ? Cette action est irréversible.')) return;
    const reason = prompt('Raison:');
    if (reason) {
      await writeOff.mutateAsync({ trackingId, reason });
      onRefresh?.();
    }
  };
  
  const handleInitiateLP = async (trackingId) => {
    if (!confirm('Initier une poursuite LP ? Des frais seront appliqués.')) return;
    await initiateLP.mutateAsync(trackingId);
    onRefresh?.();
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      current: { class: 'bg-secondary', label: 'À jour' },
      overdue: { class: 'bg-warning', label: 'En retard' },
      reminder_1: { class: 'bg-yellow', label: 'Rappel 1' },
      reminder_2: { class: 'bg-orange', label: 'Rappel 2' },
      formal_notice: { class: 'bg-red', label: 'Mise en demeure' },
      lp_requisition: { class: 'bg-purple', label: 'Poursuite LP' },
      paid: { class: 'bg-success', label: 'Payé' },
      written_off: { class: 'bg-dark', label: 'Perte' },
      suspended: { class: 'bg-info', label: 'Suspendu' }
    };
    const badge = badges[status] || badges.current;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount || 0);
  };
  
  const filteredDebtors = filter === 'all' 
    ? debtors 
    : debtors?.filter(d => d.status === filter);

  return (
    <div>
      {/* Filtres */}
      {showFilters && (
        <div className="d-flex gap-2 mb-4">
          <select 
            className="form-select" 
            style={{ width: '200px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="overdue">En retard</option>
            <option value="reminder_1">Rappel 1</option>
            <option value="reminder_2">Rappel 2</option>
            <option value="formal_notice">Mise en demeure</option>
            <option value="lp_requisition">Poursuite LP</option>
            <option value="suspended">Suspendu</option>
          </select>
        </div>
      )}

      {/* Liste */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table table-hover">
          <thead>
            <tr>
              <th>Débiteur</th>
              <th>Facture</th>
              <th>Montant dû</th>
              <th>Retard</th>
              <th>Statut</th>
              <th>Prochain rappel</th>
              <th className="w-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDebtors?.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  Aucune créance en cours
                </td>
              </tr>
            )}
            {filteredDebtors?.map(debtor => (
              <tr key={debtor.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <span className="avatar avatar-sm bg-primary-lt me-2">
                      <User size={16} />
                    </span>
                    <div>
                      <div className="font-weight-medium">{debtor.client_name}</div>
                      <div className="text-muted small">{debtor.client_email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedDebtor(debtor); }}>
                    {debtor.invoice_number}
                  </a>
                  <div className="text-muted small">
                    Échéance: {new Date(debtor.due_date).toLocaleDateString('fr-CH')}
                  </div>
                </td>
                <td>
                  <div className="font-weight-medium text-danger">
                    {formatCurrency(debtor.amount_due)}
                  </div>
                  {debtor.interest_accrued > 0 && (
                    <div className="text-muted small">
                      +{formatCurrency(debtor.interest_accrued)} intérêts
                    </div>
                  )}
                </td>
                <td>
                  <div className={`text-${debtor.days_overdue > 60 ? 'danger' : debtor.days_overdue > 30 ? 'warning' : 'muted'}`}>
                    <Clock size={14} className="me-1" />
                    {debtor.days_overdue} jours
                  </div>
                </td>
                <td>{getStatusBadge(debtor.status)}</td>
                <td>
                  {debtor.next_action_date && (
                    <div className="small">
                      {new Date(debtor.next_action_date).toLocaleDateString('fr-CH')}
                      <div className="text-muted">{debtor.next_action_type}</div>
                    </div>
                  )}
                </td>
                <td>
                  <div className="btn-list flex-nowrap">
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-ghost-primary dropdown-toggle" 
                        data-bs-toggle="dropdown"
                      >
                        Actions
                      </button>
                      <div className="dropdown-menu dropdown-menu-end">
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleSendReminder(debtor.id, 'reminder'); }}
                        >
                          <Send size={14} className="me-2" />
                          Envoyer rappel
                        </a>
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleSendReminder(debtor.id, 'formal_notice'); }}
                        >
                          <AlertTriangle size={14} className="me-2" />
                          Mise en demeure
                        </a>
                        <div className="dropdown-divider"></div>
                        {debtor.status !== 'suspended' ? (
                          <a 
                            className="dropdown-item" 
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleSuspend(debtor.id); }}
                          >
                            <Pause size={14} className="me-2" />
                            Suspendre
                          </a>
                        ) : (
                          <a 
                            className="dropdown-item" 
                            href="#"
                            onClick={(e) => { e.preventDefault(); resumeCollection.mutate(debtor.id); }}
                          >
                            <Play size={14} className="me-2" />
                            Reprendre
                          </a>
                        )}
                        <div className="dropdown-divider"></div>
                        <a 
                          className="dropdown-item text-purple" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleInitiateLP(debtor.id); }}
                        >
                          <Scale size={14} className="me-2" />
                          Initier poursuite LP
                        </a>
                        <a 
                          className="dropdown-item text-danger" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleWriteOff(debtor.id); }}
                        >
                          <Ban size={14} className="me-2" />
                          Passer en perte
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
    </div>
  );
};

export default DebtorsList;
```

---

## 📝 FICHIER 15 : LPCases.jsx

```javascript
// src/frontend/src/portals/superadmin/collection/components/LPCases.jsx
import React, { useState } from 'react';
import { 
  Scale, FileText, Download, Clock, CheckCircle, 
  AlertTriangle, XCircle, ChevronRight, ExternalLink 
} from 'lucide-react';
import { collectionApi } from '../services/collectionApi';
import toast from 'react-hot-toast';

const LP_STAGES = [
  { id: 'requisition', label: 'Réquisition', description: 'Demande déposée à l\'office LP' },
  { id: 'commandement', label: 'Commandement de payer', description: 'Notifié au débiteur' },
  { id: 'opposition', label: 'Opposition', description: 'Débiteur a fait opposition (20 jours)' },
  { id: 'mainlevee', label: 'Mainlevée', description: 'Opposition levée par le juge' },
  { id: 'continuation', label: 'Continuation', description: 'Poursuite continuée' },
  { id: 'saisie', label: 'Saisie/Faillite', description: 'Exécution forcée' }
];

const LPCases = ({ company, cases = [], onRefresh }) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [filterStage, setFilterStage] = useState('all');
  
  const handleDownloadDocument = async (caseId, docType) => {
    try {
      const blob = await collectionApi.downloadLPDocument(caseId, docType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lp_${caseId}_${docType}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erreur téléchargement');
    }
  };
  
  const handleContinue = async (caseId) => {
    if (!confirm('Continuer la poursuite après le commandement de payer ?')) return;
    try {
      await collectionApi.continueLPCase(caseId);
      toast.success('Poursuite continuée');
      onRefresh?.();
    } catch (error) {
      toast.error('Erreur lors de la continuation');
    }
  };
  
  const getStageBadge = (stage) => {
    const badges = {
      requisition: { class: 'bg-blue', label: 'Réquisition' },
      commandement: { class: 'bg-warning', label: 'Commandement' },
      opposition: { class: 'bg-orange', label: 'Opposition' },
      mainlevee: { class: 'bg-purple', label: 'Mainlevée' },
      continuation: { class: 'bg-info', label: 'Continuation' },
      saisie: { class: 'bg-danger', label: 'Saisie' },
      closed: { class: 'bg-success', label: 'Clôturée' },
      abandoned: { class: 'bg-secondary', label: 'Abandonnée' }
    };
    const badge = badges[stage] || badges.requisition;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount || 0);
  };
  
  const filteredCases = filterStage === 'all'
    ? cases
    : cases?.filter(c => c.stage === filterStage);

  return (
    <div>
      {/* Info LP suisse */}
      <div className="alert alert-info mb-4">
        <Scale size={16} className="me-2" />
        <strong>Procédure LP (Loi fédérale sur la poursuite pour dettes et la faillite)</strong>
        <p className="mb-0 mt-1 small">
          Délais légaux: Opposition 10 jours • Mainlevée ~30 jours • Continuation 1 an après commandement
        </p>
      </div>

      {/* Filtres */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="btn-group">
          <button
            className={`btn ${filterStage === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStage('all')}
          >
            Toutes ({cases?.length || 0})
          </button>
          <button
            className={`btn ${filterStage === 'commandement' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStage('commandement')}
          >
            Commandement
          </button>
          <button
            className={`btn ${filterStage === 'opposition' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStage('opposition')}
          >
            Opposition
          </button>
          <button
            className={`btn ${filterStage === 'continuation' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilterStage('continuation')}
          >
            Continuation
          </button>
        </div>
      </div>

      {/* Liste */}
      {filteredCases?.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <Scale size={48} />
          </div>
          <p className="empty-title">Aucune poursuite LP</p>
          <p className="empty-subtitle text-muted">
            Les poursuites initiées apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-vcenter card-table table-hover">
            <thead>
              <tr>
                <th>N° Poursuite</th>
                <th>Débiteur</th>
                <th>Montant</th>
                <th>Office LP</th>
                <th>Étape</th>
                <th>Prochaine action</th>
                <th className="w-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases?.map(lpCase => (
                <tr key={lpCase.id}>
                  <td>
                    <div className="font-weight-medium">{lpCase.lp_number || '-'}</div>
                    <div className="text-muted small">
                      Facture: {lpCase.invoice_number}
                    </div>
                  </td>
                  <td>
                    <div>{lpCase.debtor_name}</div>
                    <div className="text-muted small">{lpCase.debtor_address}</div>
                  </td>
                  <td>
                    <div className="font-weight-medium">
                      {formatCurrency(lpCase.total_amount)}
                    </div>
                    <div className="text-muted small">
                      Principal: {formatCurrency(lpCase.principal)}
                      {lpCase.interest > 0 && ` + Int: ${formatCurrency(lpCase.interest)}`}
                      {lpCase.fees > 0 && ` + Frais: ${formatCurrency(lpCase.fees)}`}
                    </div>
                  </td>
                  <td>
                    <div>{lpCase.lp_office}</div>
                    <div className="text-muted small">{lpCase.lp_canton}</div>
                  </td>
                  <td>{getStageBadge(lpCase.stage)}</td>
                  <td>
                    {lpCase.next_deadline && (
                      <div>
                        <Clock size={14} className="me-1" />
                        {new Date(lpCase.next_deadline).toLocaleDateString('fr-CH')}
                        <div className="text-muted small">{lpCase.next_action}</div>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="btn-list flex-nowrap">
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-ghost-primary dropdown-toggle" 
                          data-bs-toggle="dropdown"
                        >
                          Actions
                        </button>
                        <div className="dropdown-menu dropdown-menu-end">
                          <a 
                            className="dropdown-item" 
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleDownloadDocument(lpCase.id, 'requisition'); }}
                          >
                            <Download size={14} className="me-2" />
                            Réquisition PDF
                          </a>
                          {lpCase.commandement_pdf && (
                            <a 
                              className="dropdown-item" 
                              href="#"
                              onClick={(e) => { e.preventDefault(); handleDownloadDocument(lpCase.id, 'commandement'); }}
                            >
                              <Download size={14} className="me-2" />
                              Commandement PDF
                            </a>
                          )}
                          <div className="dropdown-divider"></div>
                          {lpCase.stage === 'commandement' && !lpCase.has_opposition && (
                            <a 
                              className="dropdown-item" 
                              href="#"
                              onClick={(e) => { e.preventDefault(); handleContinue(lpCase.id); }}
                            >
                              <ChevronRight size={14} className="me-2" />
                              Continuer poursuite
                            </a>
                          )}
                          <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setSelectedCase(lpCase); }}>
                            <FileText size={14} className="me-2" />
                            Voir détails
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
      )}

      {/* Timeline des étapes LP */}
      <div className="card mt-4">
        <div className="card-header">
          <h4 className="card-title">Étapes de la procédure LP</h4>
        </div>
        <div className="card-body">
          <div className="steps steps-counter steps-blue">
            {LP_STAGES.map((stage, index) => (
              <div className="step-item" key={stage.id}>
                <div className="step-title">{stage.label}</div>
                <div className="step-description text-muted small">{stage.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LPCases;
```

---

## 📝 FICHIER 16 : InterestCalculator.jsx

```javascript
// src/frontend/src/portals/superadmin/collection/components/InterestCalculator.jsx
import React, { useState } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { collectionApi } from '../services/collectionApi';
import toast from 'react-hot-toast';

const InterestCalculator = ({ company }) => {
  const [formData, setFormData] = useState({
    principal: '',
    rate: 5, // Taux légal suisse art. 104 CO
    start_date: '',
    end_date: new Date().toISOString().split('T')[0],
    calculation_method: '30/360' // Méthode suisse standard
  });
  
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const handleCalculate = async () => {
    if (!formData.principal || !formData.start_date) {
      toast.error('Montant et date de début requis');
      return;
    }
    
    setIsCalculating(true);
    try {
      const response = await collectionApi.calculateInterest({
        principal: parseFloat(formData.principal),
        rate: parseFloat(formData.rate),
        start_date: formData.start_date,
        end_date: formData.end_date,
        calculation_method: formData.calculation_method
      });
      setResult(response);
    } catch (error) {
      toast.error('Erreur de calcul');
    } finally {
      setIsCalculating(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { 
      style: 'currency', 
      currency: 'CHF' 
    }).format(amount || 0);
  };

  return (
    <div className="row">
      <div className="col-lg-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calculator size={20} className="me-2" />
              Calculateur d'intérêts moratoires
            </h3>
          </div>
          <div className="card-body">
            {/* Info légale */}
            <div className="alert alert-info mb-4">
              <Info size={16} className="me-2" />
              <strong>Art. 104 CO:</strong> Le taux légal des intérêts moratoires est de 5% l'an.
              Un taux supérieur peut être convenu contractuellement.
            </div>
            
            <div className="mb-3">
              <label className="form-label required">Montant principal (CHF)</label>
              <input 
                type="number"
                className="form-control"
                value={formData.principal}
                onChange={(e) => setFormData({...formData, principal: e.target.value})}
                placeholder="Ex: 10000"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label required">Date de début</label>
                <input 
                  type="date"
                  className="form-control"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
                <small className="text-muted">Date d'échéance de la facture</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Date de fin</label>
                <input 
                  type="date"
                  className="form-control"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
                <small className="text-muted">Date de calcul</small>
              </div>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Taux d'intérêt (%)</label>
                <div className="input-group">
                  <input 
                    type="number"
                    className="form-control"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    min="0"
                    max="15"
                    step="0.1"
                  />
                  <span className="input-group-text">%</span>
                </div>
                <small className="text-muted">
                  Légal: 5% • Contractuel: max 15% (LCD)
                </small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Méthode de calcul</label>
                <select 
                  className="form-select"
                  value={formData.calculation_method}
                  onChange={(e) => setFormData({...formData, calculation_method: e.target.value})}
                >
                  <option value="30/360">30/360 (Standard suisse)</option>
                  <option value="actual/365">Exact/365</option>
                  <option value="actual/360">Exact/360</option>
                </select>
              </div>
            </div>
            
            <button 
              className="btn btn-primary w-100"
              onClick={handleCalculate}
              disabled={isCalculating}
            >
              <Calculator size={16} className="me-1" />
              {isCalculating ? 'Calcul...' : 'Calculer les intérêts'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="col-lg-6">
        {/* Résultat */}
        {result && (
          <div className="card">
            <div className="card-header bg-success-lt">
              <h3 className="card-title text-success">
                <CheckCircle size={20} className="me-2" />
                Résultat du calcul
              </h3>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <div className="text-muted">Principal</div>
                  <div className="h3">{formatCurrency(result.principal)}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Intérêts</div>
                  <div className="h3 text-danger">{formatCurrency(result.interest)}</div>
                </div>
              </div>
              
              <hr />
              
              <div className="row mb-3">
                <div className="col-12">
                  <div className="text-muted">Total à réclamer</div>
                  <div className="h1 text-success">{formatCurrency(result.total)}</div>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="text-muted">Période</td>
                      <td className="text-end">{result.days} jours</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Taux appliqué</td>
                      <td className="text-end">{result.rate}% / an</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Méthode</td>
                      <td className="text-end">{result.method}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Formule</td>
                      <td className="text-end small">
                        Principal × Taux × Jours / 360
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Avertissement si taux élevé */}
              {result.rate > 5 && (
                <div className="alert alert-warning mt-3 mb-0">
                  <AlertTriangle size={16} className="me-2" />
                  Taux supérieur au taux légal. Assurez-vous qu'il est prévu contractuellement.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Infos légales */}
        <div className="card mt-4">
          <div className="card-header">
            <h4 className="card-title">Références légales</h4>
          </div>
          <div className="card-body">
            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <strong>Art. 104 CO:</strong> Intérêts moratoires 5% l'an
              </li>
              <li className="mb-2">
                <strong>Art. 105 CO:</strong> Taux contractuel possible si convenu
              </li>
              <li className="mb-2">
                <strong>LCD art. 8:</strong> Taux abusif si > 15% (usure)
              </li>
              <li className="mb-0">
                <strong>ATF 130 III 591:</strong> Calcul au jour le jour admis
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestCalculator;
```

---

## 📝 FICHIER 17 : WorkflowConfig.jsx

```javascript
// src/frontend/src/portals/superadmin/collection/components/WorkflowConfig.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Save, Info, AlertTriangle } from 'lucide-react';
import { useUpdateWorkflowConfig } from '../hooks/useCollectionData';

const WorkflowConfig = ({ company, config, onRefresh }) => {
  const [formData, setFormData] = useState({
    reminder_1_days: 7,
    reminder_2_days: 14,
    formal_notice_days: 21,
    lp_threshold_days: 30,
    lp_threshold_amount: 500,
    auto_send_reminders: true,
    auto_calculate_interest: true,
    interest_rate: 5,
    email_template_reminder_1: '',
    email_template_reminder_2: '',
    email_template_formal_notice: ''
  });
  
  const updateConfig = useUpdateWorkflowConfig();
  
  useEffect(() => {
    if (config) {
      setFormData({
        reminder_1_days: config.reminder_1_days || 7,
        reminder_2_days: config.reminder_2_days || 14,
        formal_notice_days: config.formal_notice_days || 21,
        lp_threshold_days: config.lp_threshold_days || 30,
        lp_threshold_amount: config.lp_threshold_amount || 500,
        auto_send_reminders: config.auto_send_reminders ?? true,
        auto_calculate_interest: config.auto_calculate_interest ?? true,
        interest_rate: config.interest_rate || 5,
        email_template_reminder_1: config.email_template_reminder_1 || '',
        email_template_reminder_2: config.email_template_reminder_2 || '',
        email_template_formal_notice: config.email_template_formal_notice || ''
      });
    }
  }, [config]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateConfig.mutateAsync({ company, config: formData });
    onRefresh?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-lg-6">
          {/* Délais */}
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="card-title">
                <Settings size={18} className="me-2" />
                Délais du workflow
              </h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">1er rappel après (jours)</label>
                <input 
                  type="number"
                  className="form-control"
                  value={formData.reminder_1_days}
                  onChange={(e) => setFormData({...formData, reminder_1_days: parseInt(e.target.value)})}
                  min="1"
                  max="30"
                />
                <small className="text-muted">Jours après l'échéance</small>
              </div>
              
              <div className="mb-3">
                <label className="form-label">2ème rappel après (jours)</label>
                <input 
                  type="number"
                  className="form-control"
                  value={formData.reminder_2_days}
                  onChange={(e) => setFormData({...formData, reminder_2_days: parseInt(e.target.value)})}
                  min="1"
                  max="60"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Mise en demeure après (jours)</label>
                <input 
                  type="number"
                  className="form-control"
                  value={formData.formal_notice_days}
                  onChange={(e) => setFormData({...formData, formal_notice_days: parseInt(e.target.value)})}
                  min="1"
                  max="90"
                />
              </div>
              
              <div className="alert alert-info mb-0">
                <Info size={14} className="me-2" />
                Les délais sont comptés à partir de la date d'échéance de la facture.
              </div>
            </div>
          </div>
          
          {/* Seuils LP */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Seuils pour poursuite LP</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Délai minimum avant LP (jours)</label>
                <input 
                  type="number"
                  className="form-control"
                  value={formData.lp_threshold_days}
                  onChange={(e) => setFormData({...formData, lp_threshold_days: parseInt(e.target.value)})}
                  min="21"
                  max="180"
                />
                <small className="text-muted">Minimum légal recommandé: 30 jours</small>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Montant minimum pour LP (CHF)</label>
                <input 
                  type="number"
                  className="form-control"
                  value={formData.lp_threshold_amount}
                  onChange={(e) => setFormData({...formData, lp_threshold_amount: parseInt(e.target.value)})}
                  min="100"
                  step="100"
                />
                <small className="text-muted">Les frais LP peuvent dépasser les petits montants</small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          {/* Automatisation */}
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="card-title">Automatisation</h4>
            </div>
            <div className="card-body">
              <label className="form-check form-switch mb-3">
                <input 
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.auto_send_reminders}
                  onChange={(e) => setFormData({...formData, auto_send_reminders: e.target.checked})}
                />
                <span className="form-check-label">
                  <strong>Envoi automatique des rappels</strong>
                  <div className="text-muted small">
                    Les rappels seront envoyés automatiquement selon les délais configurés
                  </div>
                </span>
              </label>
              
              <label className="form-check form-switch mb-3">
                <input 
                  type="checkbox"
                  className="form-check-input"
                  checked={formData.auto_calculate_interest}
                  onChange={(e) => setFormData({...formData, auto_calculate_interest: e.target.checked})}
                />
                <span className="form-check-label">
                  <strong>Calcul automatique des intérêts</strong>
                  <div className="text-muted small">
                    Les intérêts seront calculés et ajoutés automatiquement
                  </div>
                </span>
              </label>
              
              <div className="mb-0">
                <label className="form-label">Taux d'intérêt appliqué (%)</label>
                <div className="input-group">
                  <input 
                    type="number"
                    className="form-control"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({...formData, interest_rate: parseFloat(e.target.value)})}
                    min="0"
                    max="15"
                    step="0.1"
                  />
                  <span className="input-group-text">% / an</span>
                </div>
                <small className="text-muted">
                  Art. 104 CO: 5% légal • Max recommandé: 15%
                </small>
              </div>
            </div>
          </div>
          
          {/* Avertissement */}
          <div className="alert alert-warning">
            <AlertTriangle size={16} className="me-2" />
            <strong>Important:</strong> Les modifications s'appliquent aux nouvelles créances. 
            Les créances en cours conservent leurs paramètres actuels.
          </div>
        </div>
      </div>
      
      {/* Bouton sauvegarde */}
      <div className="d-flex justify-content-end mt-4">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={updateConfig.isPending}
        >
          <Save size={16} className="me-1" />
          {updateConfig.isPending ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
        </button>
      </div>
    </form>
  );
};

export default WorkflowConfig;
```

---

## 📝 FICHIER 18 : collection/index.js

```javascript
// src/frontend/src/portals/superadmin/collection/index.js
export { default as CollectionDashboard } from './CollectionDashboard';
export { default as DebtorsList } from './components/DebtorsList';
export { default as LPCases } from './components/LPCases';
export { default as InterestCalculator } from './components/InterestCalculator';
export { default as WorkflowConfig } from './components/WorkflowConfig';
export * from './hooks/useCollectionData';
export { collectionApi } from './services/collectionApi';
```

---

## 📝 MISE À JOUR ROUTER : App.jsx

Ajouter ces imports et routes :

```javascript
// Imports
import { LegalDashboard } from './portals/superadmin/legal';
import { CollectionDashboard } from './portals/superadmin/collection';

// Routes à ajouter dans le Router
<Route path="/superadmin/legal" element={<LegalDashboard />} />
<Route path="/superadmin/collection" element={<CollectionDashboard />} />
```

---

## ✅ CHECKLIST VALIDATION

- [ ] Tous les fichiers utilisent **Recharts** (PAS ApexCharts)
- [ ] Classes CSS **Tabler.io** uniquement
- [ ] **React Query** pour le data fetching
- [ ] **Lucide React** pour les icônes
- [ ] **Toast notifications** avec react-hot-toast
- [ ] Formatage monétaire suisse (CHF)
- [ ] Dates au format suisse (fr-CH)
- [ ] Conformité légale suisse (CO, LCD, LP)

---

## 📄 COMMIT MESSAGE

```
feat(frontend): Module Legal et Collection React

- LegalDashboard: Gestion CGV/CGL conformes LCD
- CGVManager/Editor: CRUD avec checklist clauses obligatoires
- SignatureRequests: Intégration DocuSeal
- AcceptanceHistory: Historique horodaté
- CollectionDashboard: Workflow recouvrement automatisé
- DebtorsList: Gestion créances avec actions
- LPCases: Suivi poursuites LP suisses
- InterestCalculator: Calcul art. 104 CO
- WorkflowConfig: Configuration délais et seuils
- 22 fichiers, ~2340 lignes
```

---

## 📋 RAPPORT ATTENDU

Créer le fichier `RAPPORT-11-FRONTEND-LEGAL-COLLECTION.md` avec :
1. Liste des fichiers créés
2. Endpoints API utilisés
3. Composants et leur fonction
4. Tests effectués
5. Captures d'écran (si possible)
