// src/frontend/src/portals/superadmin/legal/components/ComplianceManager.jsx
import React, { useState } from 'react';
import {
  Shield, CheckCircle, AlertTriangle, Clock, FileText, Calendar,
  Users, Target, TrendingUp, Download, RefreshCw, Eye, Edit2,
  Plus, Filter, AlertOctagon, CheckSquare, XCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const mockComplianceItems = [
  {
    id: 1,
    title: 'RGPD - Protection des donnees',
    category: 'data-privacy',
    status: 'compliant',
    lastAudit: '2024-11-15',
    nextAudit: '2025-05-15',
    responsable: 'Marie Martin',
    score: 92,
    requirements: 12,
    completed: 11
  },
  {
    id: 2,
    title: 'ISO 27001 - Securite Information',
    category: 'security',
    status: 'partial',
    lastAudit: '2024-10-01',
    nextAudit: '2025-04-01',
    responsable: 'Jean Dupont',
    score: 78,
    requirements: 15,
    completed: 12
  },
  {
    id: 3,
    title: 'LPD - Loi Protection Donnees Suisse',
    category: 'data-privacy',
    status: 'compliant',
    lastAudit: '2024-09-20',
    nextAudit: '2025-03-20',
    responsable: 'Sophie Blanc',
    score: 95,
    requirements: 8,
    completed: 8
  },
  {
    id: 4,
    title: 'PCI-DSS - Paiements',
    category: 'financial',
    status: 'non-compliant',
    lastAudit: '2024-08-15',
    nextAudit: '2025-02-15',
    responsable: 'Thomas Weber',
    score: 45,
    requirements: 10,
    completed: 4
  },
  {
    id: 5,
    title: 'SOC 2 Type II',
    category: 'security',
    status: 'in-progress',
    lastAudit: '2024-06-01',
    nextAudit: '2025-06-01',
    responsable: 'Lucas Meyer',
    score: 65,
    requirements: 20,
    completed: 13
  },
  {
    id: 6,
    title: 'Droit du travail Suisse',
    category: 'employment',
    status: 'compliant',
    lastAudit: '2024-12-01',
    nextAudit: '2025-12-01',
    responsable: 'Marie Martin',
    score: 100,
    requirements: 6,
    completed: 6
  }
];

const mockAuditHistory = [
  { id: 1, date: '2024-12-01', type: 'Audit interne', result: 'passed', findings: 2 },
  { id: 2, date: '2024-11-15', type: 'RGPD Review', result: 'passed', findings: 1 },
  { id: 3, date: '2024-10-01', type: 'ISO 27001', result: 'partial', findings: 5 },
  { id: 4, date: '2024-08-15', type: 'PCI-DSS', result: 'failed', findings: 8 }
];

const mockStatusDistribution = [
  { name: 'Conforme', value: 50, color: '#10b981' },
  { name: 'Partiel', value: 25, color: '#f59e0b' },
  { name: 'Non conforme', value: 10, color: '#ef4444' },
  { name: 'En cours', value: 15, color: '#3b82f6' }
];

const CATEGORIES = {
  'data-privacy': { label: 'Protection donnees', color: 'primary' },
  security: { label: 'Securite', color: 'success' },
  financial: { label: 'Finance', color: 'warning' },
  employment: { label: 'Emploi', color: 'info' },
  industry: { label: 'Industrie', color: 'purple' }
};

const STATUS_CONFIG = {
  compliant: { label: 'Conforme', color: 'success', icon: CheckCircle },
  partial: { label: 'Partiellement', color: 'warning', icon: AlertTriangle },
  'non-compliant': { label: 'Non conforme', color: 'danger', icon: XCircle },
  'in-progress': { label: 'En cours', color: 'info', icon: Clock }
};

const ComplianceManager = ({ selectedCompany }) => {
  const [items, setItems] = useState(mockComplianceItems);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesCategory && matchesStatus;
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

  const getCategoryBadge = (category) => {
    const config = CATEGORIES[category];
    return (
      <span className={`badge bg-${config?.color || 'secondary'}-lt text-${config?.color || 'secondary'}`}>
        {config?.label || category}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  // Stats
  const stats = {
    totalItems: items.length,
    compliant: items.filter(i => i.status === 'compliant').length,
    avgScore: Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length),
    pendingAudits: items.filter(i => {
      const nextAudit = new Date(i.nextAudit);
      const now = new Date();
      const diff = (nextAudit - now) / (1000 * 60 * 60 * 24);
      return diff <= 60 && diff > 0;
    }).length,
    criticalIssues: items.filter(i => i.status === 'non-compliant').length
  };

  const overallScore = [{ name: 'Score', value: stats.avgScore, fill: stats.avgScore >= 80 ? '#10b981' : stats.avgScore >= 60 ? '#f59e0b' : '#ef4444' }];

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Shield className="me-2" size={24} />
              Conformite & Compliance
            </h2>
            <div className="text-muted mt-1">
              Suivi des certifications et audits
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary">
              <Download size={16} className="me-1" />
              Rapport
            </button>
            <button className="btn btn-primary">
              <Plus size={16} className="me-1" />
              Nouvel audit
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
                <Shield size={20} className="text-primary me-2" />
                <span className="text-muted small">Reglementations</span>
              </div>
              <h3 className="mb-0">{stats.totalItems}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <span className="text-muted small">Conformes</span>
              </div>
              <h3 className="mb-0">{stats.compliant}</h3>
              <small className="text-muted">
                {Math.round((stats.compliant / stats.totalItems) * 100)}% du total
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <TrendingUp size={20} className="text-info me-2" />
                <span className="text-muted small">Score moyen</span>
              </div>
              <h3 className={`mb-0 text-${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Calendar size={20} className="text-warning me-2" />
                <span className="text-muted small">Audits proches</span>
              </div>
              <h3 className="mb-0">{stats.pendingAudits}</h3>
              <small className="text-muted">Dans 60 jours</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <AlertOctagon size={20} className="text-danger me-2" />
                <span className="text-muted small">Non conformes</span>
              </div>
              <h3 className="mb-0">{stats.criticalIssues}</h3>
              {stats.criticalIssues > 0 && (
                <small className="text-danger">Action requise</small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Score Global</h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  data={overallScore}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center mt-n5">
                <h2 className={`mb-0 text-${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</h2>
                <small className="text-muted">Conformite globale</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Repartition par statut</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={mockStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                {mockStatusDistribution.map(item => (
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
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Derniers audits</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {mockAuditHistory.slice(0, 4).map(audit => (
                  <div key={audit.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-medium">{audit.type}</div>
                      <small className="text-muted">{new Date(audit.date).toLocaleDateString('fr-CH')}</small>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge bg-${
                        audit.result === 'passed' ? 'success' :
                        audit.result === 'partial' ? 'warning' : 'danger'
                      }`}>
                        {audit.result === 'passed' ? 'Reussi' :
                         audit.result === 'partial' ? 'Partiel' : 'Echec'}
                      </span>
                      {audit.findings > 0 && (
                        <small className="text-muted">{audit.findings} points</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-4">
        <select
          className="form-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">Toutes categories</option>
          {Object.entries(CATEGORIES).map(([key, val]) => (
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

      {/* Compliance Items */}
      <div className="row g-4">
        {filteredItems.map(item => (
          <div key={item.id} className="col-md-6 col-lg-4">
            <div className={`card h-100 ${item.status === 'non-compliant' ? 'border-danger' : ''}`}>
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="card-title mb-0">{item.title}</h5>
                  <button
                    className="btn btn-sm btn-ghost-secondary"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {getCategoryBadge(item.category)}
                  {getStatusBadge(item.status)}
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Score de conformite</small>
                    <small className={`fw-medium text-${getScoreColor(item.score)}`}>{item.score}%</small>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div
                      className={`progress-bar bg-${getScoreColor(item.score)}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>
                    <CheckSquare size={12} className="me-1" />
                    {item.completed}/{item.requirements} exigences
                  </span>
                  <span>
                    <Users size={12} className="me-1" />
                    {item.responsable}
                  </span>
                </div>
              </div>
              <div className="card-footer">
                <div className="d-flex justify-content-between text-muted small">
                  <span>
                    Dernier audit: {new Date(item.lastAudit).toLocaleDateString('fr-CH')}
                  </span>
                  <span className={
                    new Date(item.nextAudit) < new Date(Date.now() + 60*24*60*60*1000)
                      ? 'text-warning fw-medium'
                      : ''
                  }>
                    Prochain: {new Date(item.nextAudit).toLocaleDateString('fr-CH')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-5 text-muted">
            <Shield size={48} className="mb-3 opacity-50" />
            <p>Aucune reglementation trouvee</p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">{selectedItem.title}</h5>
                  <div className="d-flex gap-2 mt-2">
                    {getCategoryBadge(selectedItem.category)}
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>
                <button className="btn-close" onClick={() => setSelectedItem(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <h6>Score de conformite</h6>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: 12 }}>
                          <div
                            className={`progress-bar bg-${getScoreColor(selectedItem.score)}`}
                            style={{ width: `${selectedItem.score}%` }}
                          />
                        </div>
                        <span className={`ms-3 h4 mb-0 text-${getScoreColor(selectedItem.score)}`}>
                          {selectedItem.score}%
                        </span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Exigences completees</small>
                      <span className="fw-medium">{selectedItem.completed} / {selectedItem.requirements}</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Responsable</small>
                      <span>{selectedItem.responsable}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <small className="text-muted d-block">Dernier audit</small>
                      <span>{new Date(selectedItem.lastAudit).toLocaleDateString('fr-CH')}</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Prochain audit</small>
                      <span>{new Date(selectedItem.nextAudit).toLocaleDateString('fr-CH')}</span>
                    </div>
                    <div className="d-grid gap-2 mt-4">
                      <button className="btn btn-outline-primary">
                        <FileText size={14} className="me-2" />
                        Voir documentation
                      </button>
                      <button className="btn btn-outline-primary">
                        <Calendar size={14} className="me-2" />
                        Planifier audit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedItem(null)}>
                  Fermer
                </button>
                <button className="btn btn-primary">
                  <Edit2 size={14} className="me-1" />
                  Gerer exigences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceManager;
