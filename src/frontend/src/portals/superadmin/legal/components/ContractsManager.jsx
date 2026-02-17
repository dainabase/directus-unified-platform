// src/frontend/src/portals/superadmin/legal/components/ContractsManager.jsx
import React, { useState } from 'react';
import {
  FileText, Plus, Search, Filter, Download, Upload, Eye, Edit2,
  Trash2, Calendar, Users, AlertTriangle, CheckCircle, Clock,
  Building2, DollarSign, MoreVertical, RefreshCw, Send
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import toast from 'react-hot-toast';

const mockContracts = [
  {
    id: 1,
    title: 'Contrat de service - Swiss Industries',
    type: 'service',
    client: 'Swiss Industries AG',
    value: 120000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    renewalType: 'annual',
    signedDate: '2023-12-15',
    responsable: 'Marie Martin'
  },
  {
    id: 2,
    title: 'Licence SaaS - TechStart',
    type: 'license',
    client: 'TechStart SA',
    value: 24000,
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    status: 'active',
    renewalType: 'annual',
    signedDate: '2024-02-20',
    responsable: 'Jean Dupont'
  },
  {
    id: 3,
    title: 'Accord NDA - Digital AG',
    type: 'nda',
    client: 'Digital AG',
    value: 0,
    startDate: '2024-06-01',
    endDate: '2026-05-31',
    status: 'active',
    renewalType: 'biennial',
    signedDate: '2024-05-28',
    responsable: 'Sophie Blanc'
  },
  {
    id: 4,
    title: 'Contrat maintenance - MedTech',
    type: 'maintenance',
    client: 'MedTech Solutions',
    value: 48000,
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    status: 'pending-signature',
    renewalType: 'annual',
    signedDate: null,
    responsable: 'Marie Martin'
  },
  {
    id: 5,
    title: 'Partenariat - FinServ',
    type: 'partnership',
    client: 'FinServ Banque',
    value: 250000,
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    status: 'expiring-soon',
    renewalType: 'annual',
    signedDate: '2022-12-10',
    responsable: 'Thomas Weber'
  },
  {
    id: 6,
    title: 'Contrat fournisseur - CloudHost',
    type: 'supplier',
    client: 'CloudHost SA',
    value: 36000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    renewalType: 'annual',
    signedDate: '2023-12-01',
    responsable: 'Lucas Meyer'
  }
];

const mockTypeDistribution = [
  { name: 'Service', value: 35, color: '#3b82f6' },
  { name: 'Licence', value: 25, color: '#10b981' },
  { name: 'Maintenance', value: 20, color: '#f59e0b' },
  { name: 'NDA', value: 10, color: '#8b5cf6' },
  { name: 'Partenariat', value: 10, color: '#ef4444' }
];

const mockMonthlyValue = [
  { month: 'Jan', value: 85000 },
  { month: 'Fev', value: 92000 },
  { month: 'Mar', value: 78000 },
  { month: 'Avr', value: 105000 },
  { month: 'Mai', value: 98000 },
  { month: 'Jun', value: 112000 }
];

const CONTRACT_TYPES = {
  service: { label: 'Service', color: 'primary' },
  license: { label: 'Licence', color: 'success' },
  maintenance: { label: 'Maintenance', color: 'warning' },
  nda: { label: 'NDA', color: 'purple' },
  partnership: { label: 'Partenariat', color: 'info' },
  supplier: { label: 'Fournisseur', color: 'secondary' }
};

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'success', icon: CheckCircle },
  'pending-signature': { label: 'En attente signature', color: 'warning', icon: Clock },
  'expiring-soon': { label: 'Expire bientot', color: 'danger', icon: AlertTriangle },
  expired: { label: 'Expire', color: 'secondary', icon: AlertTriangle },
  draft: { label: 'Brouillon', color: 'secondary', icon: Edit2 }
};

const ContractsManager = ({ selectedCompany }) => {
  const [contracts, setContracts] = useState(mockContracts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContract, setSelectedContract] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status];
    if (!config) return <span className="badge bg-secondary">{status}</span>;
    const Icon = config.icon;
    return (
      <span className={`badge bg-${config.color}`}>
        <Icon size={12} className="me-1" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const config = CONTRACT_TYPES[type];
    return (
      <span className={`badge bg-${config?.color || 'secondary'}-lt text-${config?.color || 'secondary'}`}>
        {config?.label || type}
      </span>
    );
  };

  const getDaysUntilExpiry = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce contrat?')) {
      setContracts(contracts.filter(c => c.id !== id));
      toast.success('Contrat supprime');
    }
  };

  const handleSendForSignature = (contract) => {
    toast.success(`Demande de signature envoyee pour "${contract.title}"`);
  };

  // Stats
  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    pendingSignature: contracts.filter(c => c.status === 'pending-signature').length,
    expiringSoon: contracts.filter(c => c.status === 'expiring-soon').length,
    totalValue: contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0)
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <FileText className="me-2" size={24} />
              Gestion des Contrats
            </h2>
            <div className="text-muted mt-1">
              Contrats clients et fournisseurs
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary">
              <Download size={16} className="me-1" />
              Exporter
            </button>
            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
              <Plus size={16} className="me-1" />
              Nouveau contrat
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <FileText size={20} className="text-primary me-2" />
                <span className="text-muted small">Total contrats</span>
              </div>
              <h3 className="mb-0">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <span className="text-muted small">Actifs</span>
              </div>
              <h3 className="mb-0">{stats.active}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Clock size={20} className="text-warning me-2" />
                <span className="text-muted small">En attente</span>
              </div>
              <h3 className="mb-0">{stats.pendingSignature}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <AlertTriangle size={20} className="text-danger me-2" />
                <span className="text-muted small">Expirent bientot</span>
              </div>
              <h3 className="mb-0">{stats.expiringSoon}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <DollarSign size={20} className="text-info me-2" />
                <span className="text-muted small">Valeur totale</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.totalValue)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Valeur mensuelle des contrats</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockMonthlyValue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Par type</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={mockTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                {mockTypeDistribution.map(item => (
                  <div key={item.name} className="d-flex align-items-center">
                    <div
                      className="rounded-circle me-1"
                      style={{ width: 8, height: 8, backgroundColor: item.color }}
                    />
                    <small>{item.name}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="d-flex gap-2 mb-4">
        <div className="input-group" style={{ width: 300 }}>
          <span className="input-group-text">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">Tous types</option>
          {Object.entries(CONTRACT_TYPES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Contracts Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover card-table">
            <thead>
              <tr>
                <th>Contrat</th>
                <th>Type</th>
                <th>Client</th>
                <th>Valeur</th>
                <th>Periode</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th>Responsable</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(contract => {
                const daysLeft = getDaysUntilExpiry(contract.endDate);
                return (
                  <tr key={contract.id}>
                    <td>
                      <div className="fw-medium">{contract.title}</div>
                    </td>
                    <td>{getTypeBadge(contract.type)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Building2 size={14} className="me-2 text-muted" />
                        {contract.client}
                      </div>
                    </td>
                    <td className="fw-medium">
                      {contract.value > 0 ? formatCurrency(contract.value) : '-'}
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(contract.startDate).toLocaleDateString('fr-CH')} - {new Date(contract.endDate).toLocaleDateString('fr-CH')}
                      </small>
                    </td>
                    <td>
                      <span className={`small ${daysLeft <= 30 ? 'text-danger fw-medium' : daysLeft <= 90 ? 'text-warning' : 'text-muted'}`}>
                        {daysLeft > 0 ? `${daysLeft} jours` : 'Expire'}
                      </span>
                    </td>
                    <td>{getStatusBadge(contract.status)}</td>
                    <td className="text-muted">{contract.responsable}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-ghost-primary"
                          onClick={() => setSelectedContract(contract)}
                          title="Voir"
                        >
                          <Eye size={14} />
                        </button>
                        {contract.status === 'pending-signature' && (
                          <button
                            className="btn btn-sm btn-ghost-success"
                            onClick={() => handleSendForSignature(contract)}
                            title="Envoyer pour signature"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => handleDelete(contract.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredContracts.length === 0 && (
          <div className="text-center py-5 text-muted">
            <FileText size={48} className="mb-3 opacity-50" />
            <p>Aucun contrat trouve</p>
          </div>
        )}
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">{selectedContract.title}</h5>
                  <small className="text-muted">{selectedContract.client}</small>
                </div>
                <button className="btn-close" onClick={() => setSelectedContract(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted d-block">Type</small>
                      {getTypeBadge(selectedContract.type)}
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Statut</small>
                      {getStatusBadge(selectedContract.status)}
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Valeur annuelle</small>
                      <span className="fw-bold text-success h5">
                        {selectedContract.value > 0 ? formatCurrency(selectedContract.value) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted d-block">Periode</small>
                      <span>
                        {new Date(selectedContract.startDate).toLocaleDateString('fr-CH')} - {new Date(selectedContract.endDate).toLocaleDateString('fr-CH')}
                      </span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Renouvellement</small>
                      <span className="text-capitalize">{selectedContract.renewalType}</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Responsable</small>
                      <span>{selectedContract.responsable}</span>
                    </div>
                    {selectedContract.signedDate && (
                      <div className="mb-3">
                        <small className="text-muted d-block">Date de signature</small>
                        <span>{new Date(selectedContract.signedDate).toLocaleDateString('fr-CH')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedContract(null)}>
                  Fermer
                </button>
                <button className="btn btn-outline-primary">
                  <Download size={14} className="me-1" />
                  Telecharger PDF
                </button>
                <button className="btn btn-primary">
                  <Edit2 size={14} className="me-1" />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Contract Modal */}
      {showNewModal && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau contrat</h5>
                <button className="btn-close" onClick={() => setShowNewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Titre du contrat</label>
                  <input type="text" className="form-control" placeholder="ex: Contrat de service - Client" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select className="form-select">
                    {Object.entries(CONTRACT_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Client/Fournisseur</label>
                  <input type="text" className="form-control" placeholder="Nom de l'entreprise" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Valeur annuelle (CHF)</label>
                  <input type="number" className="form-control" placeholder="0" />
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Date de debut</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date de fin</label>
                    <input type="date" className="form-control" />
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <label className="form-label">Responsable</label>
                  <input type="text" className="form-control" placeholder="Nom du responsable" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Document (PDF)</label>
                  <input type="file" className="form-control" accept=".pdf" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowNewModal(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={() => {
                  toast.success('Contrat cree');
                  setShowNewModal(false);
                }}>
                  Creer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsManager;
