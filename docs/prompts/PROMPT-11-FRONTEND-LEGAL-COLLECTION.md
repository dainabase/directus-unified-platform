# PROMPT 11 - FRONTEND DASHBOARDS LEGAL & COLLECTION

## CONTEXTE
Les services backend pour les modules Legal (Prompt 9) et Collection (Prompt 10) sont 100% implémentés. Ce prompt crée les interfaces React pour ces modules.

## OBJECTIF
Créer les dashboards React complets pour :
1. **Module Legal** : Gestion CGV/CGL, signatures électroniques
2. **Module Collection** : Recouvrement automatisé, workflow LP

## TECHNOLOGIES OBLIGATOIRES
- React 18.2 (composants fonctionnels avec hooks)
- Recharts 3.1 pour graphiques
- Tabler.io 1.0.0-beta20 pour UI (classes CSS)
- Axios pour API calls
- React Query pour cache/state
- React Hot Toast pour notifications
- Lucide React pour icônes

---

## STRUCTURE À CRÉER

```
src/frontend/src/portals/superadmin/
├── legal/
│   ├── LegalDashboard.jsx           # Dashboard principal
│   ├── index.js                     # Export
│   ├── components/
│   │   ├── CGVManager.jsx           # CRUD CGV/CGL
│   │   ├── CGVEditor.jsx            # Éditeur de contenu CGV
│   │   ├── CGVPreview.jsx           # Prévisualisation
│   │   ├── SignatureRequests.jsx    # Liste demandes signature
│   │   ├── SignatureStatus.jsx      # Statut temps réel
│   │   ├── AcceptanceHistory.jsx    # Historique acceptations
│   │   └── LegalStats.jsx           # KPIs légaux
│   ├── hooks/
│   │   └── useLegalData.js          # Hook données légales
│   └── services/
│       └── legalApi.js              # Appels API
│
├── collection/
│   ├── CollectionDashboard.jsx      # Dashboard principal
│   ├── index.js                     # Export
│   ├── components/
│   │   ├── CollectionOverview.jsx   # Vue d'ensemble créances
│   │   ├── DebtorsList.jsx          # Liste débiteurs
│   │   ├── DebtorDetail.jsx         # Détail débiteur + historique
│   │   ├── WorkflowTimeline.jsx     # Timeline recouvrement
│   │   ├── ReminderQueue.jsx        # File rappels à envoyer
│   │   ├── LPCases.jsx              # Dossiers poursuites LP
│   │   ├── InterestCalculator.jsx   # Calculateur intérêts
│   │   ├── CollectionStats.jsx      # KPIs recouvrement
│   │   └── AgingChart.jsx           # Graphique ancienneté
│   ├── hooks/
│   │   └── useCollectionData.js     # Hook données recouvrement
│   └── services/
│       └── collectionApi.js         # Appels API
```

---

## FICHIER 1 : legalApi.js

```javascript
// src/frontend/src/portals/superadmin/legal/services/legalApi.js
import axios from 'axios';

const API_BASE = '/api/legal';

export const legalApi = {
  // ============ CGV/CGL ============
  
  // Récupérer CGV par entreprise et type
  getCGV: async (company, type) => {
    const response = await axios.get(`${API_BASE}/cgv/${company}/${type}`);
    return response.data;
  },
  
  // Créer/Mettre à jour CGV
  saveCGV: async (company, type, data) => {
    const response = await axios.post(`${API_BASE}/cgv/${company}/${type}`, data);
    return response.data;
  },
  
  // Lister toutes les CGV d'une entreprise
  listCGV: async (company) => {
    const response = await axios.get(`${API_BASE}/cgv/${company}`);
    return response.data;
  },
  
  // Activer une version de CGV
  activateCGV: async (cgvId) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/activate`);
    return response.data;
  },
  
  // Archiver une CGV
  archiveCGV: async (cgvId) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/archive`);
    return response.data;
  },
  
  // Prévisualiser CGV avec variables
  previewCGV: async (cgvId, variables) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/preview`, { variables });
    return response.data;
  },
  
  // ============ ACCEPTATIONS ============
  
  // Enregistrer acceptation client
  recordAcceptance: async (cgvId, clientData) => {
    const response = await axios.post(`${API_BASE}/cgv/${cgvId}/accept`, clientData);
    return response.data;
  },
  
  // Historique acceptations
  getAcceptanceHistory: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/acceptances`, { params: filters });
    return response.data;
  },
  
  // Vérifier acceptation client
  verifyAcceptance: async (clientId, cgvType) => {
    const response = await axios.get(`${API_BASE}/acceptances/verify/${clientId}/${cgvType}`);
    return response.data;
  },
  
  // ============ SIGNATURES ============
  
  // Créer demande de signature
  createSignatureRequest: async (data) => {
    const response = await axios.post(`${API_BASE}/signature/request`, data);
    return response.data;
  },
  
  // Lister demandes de signature
  listSignatureRequests: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/signature/requests`, { params: filters });
    return response.data;
  },
  
  // Statut demande signature
  getSignatureStatus: async (requestId) => {
    const response = await axios.get(`${API_BASE}/signature/${requestId}`);
    return response.data;
  },
  
  // Vérifier validité signature
  verifySignature: async (requestId) => {
    const response = await axios.get(`${API_BASE}/signature/${requestId}/verify`);
    return response.data;
  },
  
  // Annuler demande signature
  cancelSignatureRequest: async (requestId, reason) => {
    const response = await axios.post(`${API_BASE}/signature/${requestId}/cancel`, { reason });
    return response.data;
  },
  
  // Renvoyer demande signature
  resendSignatureRequest: async (requestId) => {
    const response = await axios.post(`${API_BASE}/signature/${requestId}/resend`);
    return response.data;
  },
  
  // ============ STATISTIQUES ============
  
  // Stats légales globales
  getLegalStats: async (company) => {
    const response = await axios.get(`${API_BASE}/stats/${company}`);
    return response.data;
  }
};

export default legalApi;
```

---

## FICHIER 2 : useLegalData.js

```javascript
// src/frontend/src/portals/superadmin/legal/hooks/useLegalData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '../services/legalApi';
import toast from 'react-hot-toast';

// Hook pour les CGV
export const useCGV = (company, type) => {
  return useQuery({
    queryKey: ['cgv', company, type],
    queryFn: () => legalApi.getCGV(company, type),
    enabled: !!company && !!type,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook pour lister toutes les CGV
export const useCGVList = (company) => {
  return useQuery({
    queryKey: ['cgv-list', company],
    queryFn: () => legalApi.listCGV(company),
    enabled: !!company,
  });
};

// Hook pour sauvegarder CGV
export const useSaveCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ company, type, data }) => legalApi.saveCGV(company, type, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['cgv', variables.company]);
      queryClient.invalidateQueries(['cgv-list', variables.company]);
      toast.success('CGV sauvegardée avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour activer CGV
export const useActivateCGV = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cgvId) => legalApi.activateCGV(cgvId),
    onSuccess: () => {
      queryClient.invalidateQueries(['cgv']);
      queryClient.invalidateQueries(['cgv-list']);
      toast.success('CGV activée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  });
};

// Hook pour les demandes de signature
export const useSignatureRequests = (filters = {}) => {
  return useQuery({
    queryKey: ['signature-requests', filters],
    queryFn: () => legalApi.listSignatureRequests(filters),
    refetchInterval: 30000, // Rafraîchir toutes les 30s
  });
};

// Hook pour créer demande signature
export const useCreateSignature = () => {
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

// Hook pour historique acceptations
export const useAcceptanceHistory = (filters = {}) => {
  return useQuery({
    queryKey: ['acceptances', filters],
    queryFn: () => legalApi.getAcceptanceHistory(filters),
  });
};

// Hook pour stats légales
export const useLegalStats = (company) => {
  return useQuery({
    queryKey: ['legal-stats', company],
    queryFn: () => legalApi.getLegalStats(company),
    enabled: !!company,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Hook principal combiné
export const useLegalData = (company) => {
  const cgvList = useCGVList(company);
  const signatureRequests = useSignatureRequests({ company });
  const acceptances = useAcceptanceHistory({ company, limit: 50 });
  const stats = useLegalStats(company);
  
  return {
    cgvList,
    signatureRequests,
    acceptances,
    stats,
    isLoading: cgvList.isLoading || signatureRequests.isLoading,
    error: cgvList.error || signatureRequests.error
  };
};

export default useLegalData;
```

---

## FICHIER 3 : LegalDashboard.jsx

```javascript
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
```

---

## FICHIER 4 : CGVManager.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/CGVManager.jsx
import React, { useState } from 'react';
import { 
  FileText, Plus, Edit, Eye, Archive, CheckCircle, 
  Clock, AlertTriangle, Copy, Download, Trash2 
} from 'lucide-react';
import { useSaveCGV, useActivateCGV, useCGV } from '../hooks/useLegalData';
import CGVEditor from './CGVEditor';
import CGVPreview from './CGVPreview';
import toast from 'react-hot-toast';

const CGVManager = ({ company, cgvTypes, cgvList, onRefresh }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedCGV, setSelectedCGV] = useState(null);
  
  const saveCGV = useSaveCGV();
  const activateCGV = useActivateCGV();
  
  const handleCreate = (type) => {
    setSelectedType(type);
    setSelectedCGV(null);
    setEditMode(true);
  };
  
  const handleEdit = (cgv) => {
    setSelectedCGV(cgv);
    setSelectedType(cgv.type);
    setEditMode(true);
  };
  
  const handlePreview = (cgv) => {
    setSelectedCGV(cgv);
    setPreviewMode(true);
  };
  
  const handleSave = async (data) => {
    await saveCGV.mutateAsync({
      company,
      type: selectedType,
      data
    });
    setEditMode(false);
    onRefresh();
  };
  
  const handleActivate = async (cgvId) => {
    await activateCGV.mutateAsync(cgvId);
    onRefresh();
  };
  
  const handleDuplicate = (cgv) => {
    setSelectedCGV({ ...cgv, id: null, version: cgv.version + 1 });
    setSelectedType(cgv.type);
    setEditMode(true);
    toast.success('CGV dupliquée - modifiez et sauvegardez');
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'bg-success', label: 'Active' },
      draft: { class: 'bg-warning', label: 'Brouillon' },
      archived: { class: 'bg-secondary', label: 'Archivée' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
  };

  // Modal Éditeur
  if (editMode) {
    return (
      <CGVEditor 
        company={company}
        type={selectedType}
        cgv={selectedCGV}
        onSave={handleSave}
        onCancel={() => setEditMode(false)}
        isLoading={saveCGV.isPending}
      />
    );
  }
  
  // Modal Prévisualisation
  if (previewMode) {
    return (
      <CGVPreview 
        cgv={selectedCGV}
        onClose={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div>
      {/* Boutons création par type */}
      <div className="row mb-4">
        {cgvTypes.map(type => (
          <div className="col-md-4" key={type.id}>
            <div className="card card-sm">
              <div className="card-body d-flex align-items-center">
                <type.icon size={24} className="me-3 text-primary" />
                <div className="flex-fill">
                  <div className="font-weight-medium">{type.label}</div>
                  <div className="text-muted small">
                    {cgvList?.filter(c => c.type === type.id && c.status === 'active').length || 0} active(s)
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCreate(type.id)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Liste des CGV existantes */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Version</th>
              <th>Titre</th>
              <th>Statut</th>
              <th>Dernière modification</th>
              <th>Acceptations</th>
              <th className="w-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cgvList?.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  Aucune CGV créée. Cliquez sur + pour commencer.
                </td>
              </tr>
            )}
            {cgvList?.map(cgv => (
              <tr key={cgv.id}>
                <td>
                  <span className="badge bg-blue-lt">
                    {cgvTypes.find(t => t.id === cgv.type)?.label || cgv.type}
                  </span>
                </td>
                <td>v{cgv.version}</td>
                <td>{cgv.title}</td>
                <td>{getStatusBadge(cgv.status)}</td>
                <td>
                  <Clock size={14} className="me-1" />
                  {new Date(cgv.updated_at).toLocaleDateString('fr-CH')}
                </td>
                <td>
                  <span className="badge bg-green-lt">
                    {cgv.acceptance_count || 0}
                  </span>
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
                    <button 
                      className="btn btn-sm btn-ghost-primary"
                      onClick={() => handleDuplicate(cgv)}
                      title="Dupliquer"
                    >
                      <Copy size={16} />
                    </button>
                    {cgv.status !== 'active' && (
                      <button 
                        className="btn btn-sm btn-ghost-success"
                        onClick={() => handleActivate(cgv.id)}
                        title="Activer"
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
    </div>
  );
};

export default CGVManager;
```

---

## FICHIER 5 : SignatureRequests.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/SignatureRequests.jsx
import React, { useState } from 'react';
import { 
  PenTool, Send, Clock, CheckCircle, XCircle, 
  RefreshCw, Eye, AlertTriangle, Mail, FileText 
} from 'lucide-react';
import { useCreateSignature } from '../hooks/useLegalData';
import { legalApi } from '../services/legalApi';
import toast from 'react-hot-toast';

const SIGNATURE_LEVELS = [
  { id: 'SES', label: 'Simple (SES)', description: 'Case cochée, email' },
  { id: 'AES', label: 'Avancée (AES)', description: 'Lien unique, vérification' },
  { id: 'QES', label: 'Qualifiée (QES)', description: 'Équivalent manuscrite' }
];

const PROVIDERS = [
  { id: 'SWISSCOM', label: 'Swisscom' },
  { id: 'SWISSSIGN', label: 'SwissSign' },
  { id: 'DIGICERT', label: 'DigiCert/QuoVadis' },
  { id: 'SIMULATION', label: 'Mode Test' }
];

const SignatureRequests = ({ company, requests, onRefresh }) => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    document_type: '',
    document_id: '',
    signer_email: '',
    signer_name: '',
    signature_level: 'AES',
    provider: 'SWISSCOM',
    message: ''
  });
  
  const createSignature = useCreateSignature();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSignature.mutateAsync({
      ...newRequest,
      company
    });
    setShowNewRequest(false);
    setNewRequest({
      document_type: '',
      document_id: '',
      signer_email: '',
      signer_name: '',
      signature_level: 'AES',
      provider: 'SWISSCOM',
      message: ''
    });
    onRefresh();
  };
  
  const handleResend = async (requestId) => {
    try {
      await legalApi.resendSignatureRequest(requestId);
      toast.success('Demande renvoyée');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors du renvoi');
    }
  };
  
  const handleCancel = async (requestId) => {
    if (!confirm('Annuler cette demande de signature ?')) return;
    try {
      await legalApi.cancelSignatureRequest(requestId, 'Annulé par administrateur');
      toast.success('Demande annulée');
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'bg-warning', icon: Clock, label: 'En attente' },
      sent: { class: 'bg-info', icon: Mail, label: 'Envoyée' },
      viewed: { class: 'bg-blue', icon: Eye, label: 'Consultée' },
      signed: { class: 'bg-success', icon: CheckCircle, label: 'Signée' },
      rejected: { class: 'bg-danger', icon: XCircle, label: 'Refusée' },
      expired: { class: 'bg-secondary', icon: AlertTriangle, label: 'Expirée' },
      cancelled: { class: 'bg-dark', icon: XCircle, label: 'Annulée' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class}`}>
        <Icon size={12} className="me-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <div>
      {/* Bouton nouvelle demande */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Demandes de signature</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowNewRequest(true)}
        >
          <Send size={16} className="me-2" />
          Nouvelle demande
        </button>
      </div>

      {/* Formulaire nouvelle demande */}
      {showNewRequest && (
        <div className="card mb-4 border-primary">
          <div className="card-header">
            <h4 className="card-title">Nouvelle demande de signature</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Email du signataire *</label>
                    <input 
                      type="email"
                      className="form-control"
                      value={newRequest.signer_email}
                      onChange={(e) => setNewRequest({...newRequest, signer_email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Nom du signataire *</label>
                    <input 
                      type="text"
                      className="form-control"
                      value={newRequest.signer_name}
                      onChange={(e) => setNewRequest({...newRequest, signer_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Type de document</label>
                    <select 
                      className="form-select"
                      value={newRequest.document_type}
                      onChange={(e) => setNewRequest({...newRequest, document_type: e.target.value})}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="contrat">Contrat</option>
                      <option value="devis">Devis</option>
                      <option value="bail">Bail</option>
                      <option value="nda">NDA</option>
                      <option value="cgv">CGV</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Niveau de signature *</label>
                    <select 
                      className="form-select"
                      value={newRequest.signature_level}
                      onChange={(e) => setNewRequest({...newRequest, signature_level: e.target.value})}
                      required
                    >
                      {SIGNATURE_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Prestataire</label>
                    <select 
                      className="form-select"
                      value={newRequest.provider}
                      onChange={(e) => setNewRequest({...newRequest, provider: e.target.value})}
                    >
                      {PROVIDERS.map(provider => (
                        <option key={provider.id} value={provider.id}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">Message personnalisé</label>
                    <textarea 
                      className="form-control"
                      rows="2"
                      value={newRequest.message}
                      onChange={(e) => setNewRequest({...newRequest, message: e.target.value})}
                      placeholder="Message optionnel pour le signataire..."
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-ghost-secondary"
                  onClick={() => setShowNewRequest(false)}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={createSignature.isPending}
                >
                  {createSignature.isPending ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des demandes */}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Signataire</th>
              <th>Niveau</th>
              <th>Statut</th>
              <th>Créée le</th>
              <th>Expire le</th>
              <th className="w-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests?.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  Aucune demande de signature
                </td>
              </tr>
            )}
            {requests?.map(request => (
              <tr key={request.id}>
                <td>
                  <FileText size={16} className="me-2 text-muted" />
                  {request.document_type || 'Document'}
                </td>
                <td>
                  <div>{request.signer_name}</div>
                  <div className="text-muted small">{request.signer_email}</div>
                </td>
                <td>
                  <span className={`badge ${request.signature_level === 'QES' ? 'bg-purple' : 'bg-blue-lt'}`}>
                    {request.signature_level}
                  </span>
                </td>
                <td>{getStatusBadge(request.status)}</td>
                <td>{new Date(request.created_at).toLocaleDateString('fr-CH')}</td>
                <td>
                  {request.expires_at ? 
                    new Date(request.expires_at).toLocaleDateString('fr-CH') : 
                    '-'
                  }
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
                        onClick={() => window.open(request.signed_document_url)}
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
    </div>
  );
};

export default SignatureRequests;
```

---

## SUITE FICHIER 6-15 dans PARTIE 2...

Ce prompt est trop long, je le divise. La partie 2 contiendra :
- CGVEditor.jsx
- CGVPreview.jsx  
- AcceptanceHistory.jsx
- LegalStats.jsx
- collectionApi.js
- useCollectionData.js
- CollectionDashboard.jsx
- DebtorsList.jsx
- WorkflowTimeline.jsx
- LPCases.jsx


---

## FICHIER 6 : CGVEditor.jsx

```javascript
// src/frontend/src/portals/superadmin/legal/components/CGVEditor.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, Eye, AlertTriangle, Info } from 'lucide-react';

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

const CGVEditor = ({ company, type, cgv, onSave, onCancel, isLoading }) => {
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
    
    // Vérifier clauses obligatoires
    const missingClauses = mandatoryClauses.filter(
      clause => !formData.clauses_checked.includes(clause.id)
    );
    if (missingClauses.length > 0) {
      errors.push(`Clauses obligatoires manquantes: ${missingClauses.map(c => c.label).join(', ')}`);
    }
    
    // Vérifier contenu minimum
    if (formData.content.length < 500) {
      errors.push('Le contenu doit faire au moins 500 caractères');
    }
    
    // Vérifier titre
    if (!formData.title.trim()) {
      errors.push('Le titre est obligatoire');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        type,
        company
      });
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
            <h3>{cgv ? 'Modifier' : 'Créer'} {getTypeLabel()}</h3>
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
                disabled={isLoading}
              >
                <Save size={16} className="me-1" />
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
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
                  placeholder="Rédigez ici le contenu complet de vos conditions générales...&#10;&#10;Vous pouvez utiliser des variables :&#10;{{company_name}} - Nom de l'entreprise&#10;{{company_address}} - Adresse&#10;{{company_ide}} - Numéro IDE&#10;{{current_date}} - Date du jour&#10;{{vat_rate}} - Taux TVA (8.1%)"
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

## FICHIER 7 : collectionApi.js

```javascript
// src/frontend/src/portals/superadmin/collection/services/collectionApi.js
import axios from 'axios';

const API_BASE = '/api/collection';

export const collectionApi = {
  // ============ TRACKING & WORKFLOW ============
  
  // Dashboard recouvrement
  getDashboard: async (company) => {
    const response = await axios.get(`${API_BASE}/dashboard/${company}`);
    return response.data;
  },
  
  // Initialiser suivi pour une facture
  initializeTracking: async (invoiceId) => {
    const response = await axios.post(`${API_BASE}/initialize/${invoiceId}`);
    return response.data;
  },
  
  // Lancer traitement workflow (cron manuel)
  processWorkflow: async (company) => {
    const response = await axios.post(`${API_BASE}/process`, { company });
    return response.data;
  },
  
  // Liste des créances
  getTrackingList: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/tracking`, { params: filters });
    return response.data;
  },
  
  // Détail créance
  getTrackingDetail: async (trackingId) => {
    const response = await axios.get(`${API_BASE}/tracking/${trackingId}`);
    return response.data;
  },
  
  // ============ PAIEMENTS ============
  
  // Enregistrer paiement
  recordPayment: async (trackingId, paymentData) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/payment`, paymentData);
    return response.data;
  },
  
  // Historique paiements
  getPaymentHistory: async (trackingId) => {
    const response = await axios.get(`${API_BASE}/${trackingId}/payments`);
    return response.data;
  },
  
  // ============ ACTIONS MANUELLES ============
  
  // Suspendre recouvrement
  suspendCollection: async (trackingId, reason) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/suspend`, { reason });
    return response.data;
  },
  
  // Reprendre recouvrement
  resumeCollection: async (trackingId) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/resume`);
    return response.data;
  },
  
  // Passer en perte
  writeOff: async (trackingId, reason) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/write-off`, { reason });
    return response.data;
  },
  
  // Envoyer rappel manuel
  sendManualReminder: async (trackingId, type) => {
    const response = await axios.post(`${API_BASE}/${trackingId}/reminder`, { type });
    return response.data;
  },
  
  // ============ INTÉRÊTS ============
  
  // Calculer intérêts
  calculateInterest: async (data) => {
    const response = await axios.post(`${API_BASE}/calculate-interest`, data);
    return response.data;
  },
  
  // Vérifier taux acceptable
  checkRate: async (rate) => {
    const response = await axios.get(`${API_BASE}/rate-check/${rate}`);
    return response.data;
  },
  
  // ============ POURSUITES LP ============
  
  // Initier poursuite LP
  initiateLPCase: async (trackingId) => {
    const response = await axios.post(`${API_BASE}/lp/initiate/${trackingId}`);
    return response.data;
  },
  
  // Liste dossiers LP
  getLPCases: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/lp/cases`, { params: filters });
    return response.data;
  },
  
  // Détail dossier LP
  getLPCaseDetail: async (caseId) => {
    const response = await axios.get(`${API_BASE}/lp/${caseId}`);
    return response.data;
  },
  
  // Continuer poursuite (après commandement)
  continueLPCase: async (caseId) => {
    const response = await axios.post(`${API_BASE}/lp/${caseId}/continue`);
    return response.data;
  },
  
  // Télécharger document LP
  downloadLPDocument: async (caseId, docType) => {
    const response = await axios.get(`${API_BASE}/lp/${caseId}/document/${docType}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  // ============ CONFIGURATION ============
  
  // Config workflow entreprise
  getWorkflowConfig: async (company) => {
    const response = await axios.get(`${API_BASE}/config/${company}`);
    return response.data;
  },
  
  // Mettre à jour config
  updateWorkflowConfig: async (company, config) => {
    const response = await axios.put(`${API_BASE}/config/${company}`, config);
    return response.data;
  },
  
  // ============ STATISTIQUES ============
  
  // Stats globales
  getStats: async (company, period = '30d') => {
    const response = await axios.get(`${API_BASE}/stats/${company}`, { params: { period } });
    return response.data;
  },
  
  // Rapport ancienneté (aging)
  getAgingReport: async (company) => {
    const response = await axios.get(`${API_BASE}/aging/${company}`);
    return response.data;
  }
};

export default collectionApi;
```

---

## FICHIER 8 : useCollectionData.js

```javascript
// src/frontend/src/portals/superadmin/collection/hooks/useCollectionData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi } from '../services/collectionApi';
import toast from 'react-hot-toast';

// Hook dashboard
export const useCollectionDashboard = (company) => {
  return useQuery({
    queryKey: ['collection-dashboard', company],
    queryFn: () => collectionApi.getDashboard(company),
    enabled: !!company,
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });
};

// Hook liste créances
export const useTrackingList = (filters = {}) => {
  return useQuery({
    queryKey: ['collection-tracking', filters],
    queryFn: () => collectionApi.getTrackingList(filters),
    staleTime: 30000,
  });
};

// Hook détail créance
export const useTrackingDetail = (trackingId) => {
  return useQuery({
    queryKey: ['collection-tracking-detail', trackingId],
    queryFn: () => collectionApi.getTrackingDetail(trackingId),
    enabled: !!trackingId,
  });
};

// Hook enregistrer paiement
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

// Hook suspendre
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

// Hook reprendre
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

// Hook passer en perte
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

// Hook initier LP
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

// Hook liste dossiers LP
export const useLPCases = (filters = {}) => {
  return useQuery({
    queryKey: ['lp-cases', filters],
    queryFn: () => collectionApi.getLPCases(filters),
    staleTime: 60000,
  });
};

// Hook config workflow
export const useWorkflowConfig = (company) => {
  return useQuery({
    queryKey: ['collection-config', company],
    queryFn: () => collectionApi.getWorkflowConfig(company),
    enabled: !!company,
  });
};

// Hook mise à jour config
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

// Hook rapport ancienneté
export const useAgingReport = (company) => {
  return useQuery({
    queryKey: ['aging-report', company],
    queryFn: () => collectionApi.getAgingReport(company),
    enabled: !!company,
  });
};

// Hook principal combiné
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

## FICHIER 9 : CollectionDashboard.jsx

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
  
  // Données pour graphique ancienneté
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

## FICHIER 10 : DebtorsList.jsx

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
  const [showDetail, setShowDetail] = useState(false);
  
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
                  <a href="#" onClick={(e) => { e.preventDefault(); setSelectedDebtor(debtor); setShowDetail(true); }}>
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

## INSTRUCTIONS FINALES POUR CLAUDE CODE

### Ordre de création des fichiers :

1. **Module Legal** (src/frontend/src/portals/superadmin/legal/)
   - services/legalApi.js
   - hooks/useLegalData.js
   - LegalDashboard.jsx
   - components/CGVManager.jsx
   - components/CGVEditor.jsx
   - components/CGVPreview.jsx (composant simple d'affichage)
   - components/SignatureRequests.jsx
   - components/AcceptanceHistory.jsx (liste paginée)
   - components/LegalStats.jsx (graphiques Recharts)
   - index.js

2. **Module Collection** (src/frontend/src/portals/superadmin/collection/)
   - services/collectionApi.js
   - hooks/useCollectionData.js
   - CollectionDashboard.jsx
   - components/DebtorsList.jsx
   - components/DebtorDetail.jsx (modal détail)
   - components/WorkflowTimeline.jsx (timeline événements)
   - components/LPCases.jsx (liste poursuites)
   - components/InterestCalculator.jsx (formulaire calcul)
   - components/WorkflowConfig.jsx (config workflow)
   - components/AgingChart.jsx (graphique ancienneté)
   - components/CollectionStats.jsx (KPIs)
   - index.js

3. **Mise à jour Router** (src/frontend/src/App.jsx)
   - Ajouter routes /superadmin/legal et /superadmin/collection
   - Ajouter liens navigation sidebar

4. **Rapport d'exécution**
   - RAPPORT-11-FRONTEND-LEGAL-COLLECTION.md

### Validation :
- Tous les composants utilisent Recharts (PAS ApexCharts)
- Classes Tabler.io pour le styling
- React Query pour le state management
- Toast notifications pour feedback utilisateur
- Responsive design

### Commit message :
```
feat(frontend): Dashboard Legal et Collection React

- LegalDashboard: Gestion CGV/CGL et signatures électroniques
- CollectionDashboard: Recouvrement et poursuites LP
- 20+ composants React avec Recharts
- Hooks React Query pour data fetching
- Conformité légale suisse intégrée
```
