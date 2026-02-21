// src/frontend/src/modules/projects/views/DeliverablesView.jsx
import React, { useState } from 'react';
import {
  Package, Plus, CheckCircle, Clock, AlertTriangle, FileText,
  Download, Upload, Eye, Edit2, Trash2, Filter, Calendar,
  Users, Target, Link, MoreVertical, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const mockDeliverables = [
  {
    id: 1,
    name: 'Maquettes UI/UX',
    project: 'Refonte Site Web',
    description: 'Design complet des interfaces utilisateur',
    status: 'completed',
    progress: 100,
    dueDate: '2024-12-10',
    completedDate: '2024-12-08',
    assignee: 'Marie Martin',
    priority: 'high',
    attachments: 3,
    tasks: { total: 8, completed: 8 }
  },
  {
    id: 2,
    name: 'API Backend v1',
    project: 'Application Mobile',
    description: 'Endpoints REST pour l\'application mobile',
    status: 'in-progress',
    progress: 65,
    dueDate: '2024-12-20',
    completedDate: null,
    assignee: 'Jean Dupont',
    priority: 'high',
    attachments: 5,
    tasks: { total: 12, completed: 8 }
  },
  {
    id: 3,
    name: 'Documentation Technique',
    project: 'ERP Integration',
    description: 'Documentation complete de l\'integration',
    status: 'in-progress',
    progress: 40,
    dueDate: '2024-12-25',
    completedDate: null,
    assignee: 'Sophie Blanc',
    priority: 'medium',
    attachments: 2,
    tasks: { total: 5, completed: 2 }
  },
  {
    id: 4,
    name: 'Tests Unitaires',
    project: 'Migration Cloud',
    description: 'Suite complete de tests automatises',
    status: 'pending',
    progress: 0,
    dueDate: '2024-12-30',
    completedDate: null,
    assignee: 'Lucas Meyer',
    priority: 'medium',
    attachments: 0,
    tasks: { total: 15, completed: 0 }
  },
  {
    id: 5,
    name: 'Rapport d\'Audit',
    project: 'Audit Securite',
    description: 'Rapport detaille des vulnerabilites',
    status: 'review',
    progress: 90,
    dueDate: '2024-12-15',
    completedDate: null,
    assignee: 'Thomas Weber',
    priority: 'critical',
    attachments: 4,
    tasks: { total: 6, completed: 5 }
  }
];

const mockTasks = [
  { id: 1, deliverableId: 2, name: 'Endpoint /users', status: 'completed', assignee: 'Jean Dupont' },
  { id: 2, deliverableId: 2, name: 'Endpoint /products', status: 'completed', assignee: 'Jean Dupont' },
  { id: 3, deliverableId: 2, name: 'Endpoint /orders', status: 'in-progress', assignee: 'Jean Dupont' },
  { id: 4, deliverableId: 2, name: 'Authentication JWT', status: 'completed', assignee: 'Jean Dupont' },
  { id: 5, deliverableId: 2, name: 'Documentation Swagger', status: 'pending', assignee: 'Sophie Blanc' }
];

const PROJECTS = [
  'Refonte Site Web',
  'Application Mobile',
  'ERP Integration',
  'Migration Cloud',
  'Audit Securite'
];

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'secondary', icon: Clock },
  'in-progress': { label: 'En cours', color: 'primary', icon: Target },
  review: { label: 'En review', color: 'warning', icon: Eye },
  completed: { label: 'Termine', color: 'success', icon: CheckCircle },
  blocked: { label: 'Bloque', color: 'danger', icon: AlertTriangle }
};

const PRIORITY_CONFIG = {
  low: { label: 'Basse', color: 'secondary' },
  medium: { label: 'Moyenne', color: 'info' },
  high: { label: 'Haute', color: 'warning' },
  critical: { label: 'Critique', color: 'danger' }
};

const DeliverablesView = ({ selectedCompany }) => {
  const [deliverables, setDeliverables] = useState(mockDeliverables);
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredDeliverables = deliverables.filter(d => {
    const matchesProject = filterProject === 'all' || d.project === filterProject;
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesProject && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    return (
      <span className={`badge bg-${config.color}`}>
        <Icon size={12} className="me-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = PRIORITY_CONFIG[priority];
    return (
      <span className={`badge bg-${config.color}-lt text-${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce livrable?')) {
      setDeliverables(deliverables.filter(d => d.id !== id));
      toast.success('Livrable supprime');
    }
  };

  // Stats
  const stats = {
    total: deliverables.length,
    completed: deliverables.filter(d => d.status === 'completed').length,
    inProgress: deliverables.filter(d => d.status === 'in-progress').length,
    overdue: deliverables.filter(d => isOverdue(d.dueDate, d.status)).length
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Package className="me-2" size={24} />
              Livrables & Taches
            </h2>
            <div className="text-muted mt-1">
              Gestion des livrables projets
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="ds-btn ds-btn-outline-secondary">
              <Download size={16} className="me-1" />
              Exporter
            </button>
            <button className="ds-btn ds-btn-primary" onClick={() => setShowNewModal(true)}>
              <Plus size={16} className="me-1" />
              Nouveau livrable
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <Package size={20} className="text-primary me-2" />
                <span className="text-muted small">Total livrables</span>
              </div>
              <h3 className="mb-0">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <span className="text-muted small">Termines</span>
              </div>
              <h3 className="mb-0">{stats.completed}</h3>
              <small className="text-muted">
                {Math.round((stats.completed / stats.total) * 100)}% du total
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <Target size={20} className="text-info me-2" />
                <span className="text-muted small">En cours</span>
              </div>
              <h3 className="mb-0">{stats.inProgress}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <AlertTriangle size={20} className="text-danger me-2" />
                <span className="text-muted small">En retard</span>
              </div>
              <h3 className="mb-0">{stats.overdue}</h3>
              {stats.overdue > 0 && (
                <small className="text-danger">Action requise</small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-4">
        <select
          className="form-select"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">Tous les projets</option>
          {PROJECTS.map(p => (
            <option key={p} value={p}>{p}</option>
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

      {/* Deliverables Grid */}
      <div className="row g-4">
        {filteredDeliverables.map(deliverable => (
          <div key={deliverable.id} className="col-md-6 col-lg-4">
            <div className={`ds-card h-100 ${isOverdue(deliverable.dueDate, deliverable.status) ? 'border-danger' : ''}`}>
              <div className="ds-card-header">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="ds-card-title mb-1">{deliverable.name}</h5>
                    <small className="text-muted">{deliverable.project}</small>
                  </div>
                  <div className="dropdown">
                    <button className="ds-btn ds-btn-sm ds-btn-ghost-secondary" data-bs-toggle="dropdown">
                      <MoreVertical size={16} />
                    </button>
                    <div className="dropdown-menu dropdown-menu-end">
                      <a className="dropdown-item" href="#" onClick={() => setSelectedDeliverable(deliverable)}>
                        <Eye size={14} className="me-2" />Voir details
                      </a>
                      <a className="dropdown-item" href="#">
                        <Edit2 size={14} className="me-2" />Modifier
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item text-danger" href="#" onClick={() => handleDelete(deliverable.id)}>
                        <Trash2 size={14} className="me-2" />Supprimer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ds-card-body">
                <p className="text-muted small mb-3">{deliverable.description}</p>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Progression</small>
                    <small className="fw-medium">{deliverable.progress}%</small>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className={`progress-bar bg-${deliverable.progress === 100 ? 'success' : 'primary'}`}
                      style={{ width: `${deliverable.progress}%` }}
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {getStatusBadge(deliverable.status)}
                  {getPriorityBadge(deliverable.priority)}
                </div>

                <div className="d-flex justify-content-between text-muted small">
                  <div className="d-flex align-items-center">
                    <Users size={12} className="me-1" />
                    {deliverable.assignee}
                  </div>
                  <div className="d-flex align-items-center">
                    <FileText size={12} className="me-1" />
                    {deliverable.tasks.completed}/{deliverable.tasks.total}
                  </div>
                </div>
              </div>
              <div className="ds-card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <div className={`d-flex align-items-center small ${isOverdue(deliverable.dueDate, deliverable.status) ? 'text-danger' : 'text-muted'}`}>
                    <Calendar size={12} className="me-1" />
                    {new Date(deliverable.dueDate).toLocaleDateString('fr-CH')}
                    {isOverdue(deliverable.dueDate, deliverable.status) && (
                      <span className="ms-1">(En retard)</span>
                    )}
                  </div>
                  {deliverable.attachments > 0 && (
                    <div className="d-flex align-items-center text-muted small">
                      <Link size={12} className="me-1" />
                      {deliverable.attachments}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliverables.length === 0 && (
        <div className="ds-card">
          <div className="ds-card-body text-center py-5 text-muted">
            <Package size={48} className="mb-3 opacity-50" />
            <p>Aucun livrable trouve</p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDeliverable && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title">{selectedDeliverable.name}</h5>
                  <small className="text-muted">{selectedDeliverable.project}</small>
                </div>
                <button className="btn-close" onClick={() => setSelectedDeliverable(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-8">
                    <h6 className="mb-3">Taches</h6>
                    <div className="list-group list-group-flush">
                      {mockTasks.filter(t => t.deliverableId === selectedDeliverable.id).map(task => (
                        <div key={task.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                          <div className="d-flex align-items-center">
                            <div className={`form-check-input me-3 ${task.status === 'completed' ? 'bg-success border-success' : ''}`}
                              style={{ width: 20, height: 20 }}
                            />
                            <span className={task.status === 'completed' ? 'text-decoration-line-through text-muted' : ''}>
                              {task.name}
                            </span>
                          </div>
                          <span className={`badge ${
                            task.status === 'completed' ? 'bg-success' :
                            task.status === 'in-progress' ? 'bg-primary' : 'bg-secondary'
                          }`}>
                            {task.status === 'completed' ? 'Fait' :
                             task.status === 'in-progress' ? 'En cours' : 'A faire'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <h6 className="mb-3">Details</h6>
                    <div className="mb-2">
                      <small className="text-muted d-block">Statut</small>
                      {getStatusBadge(selectedDeliverable.status)}
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Priorite</small>
                      {getPriorityBadge(selectedDeliverable.priority)}
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Responsable</small>
                      <span>{selectedDeliverable.assignee}</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Echeance</small>
                      <span>{new Date(selectedDeliverable.dueDate).toLocaleDateString('fr-CH')}</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted d-block">Progression</small>
                      <span className="fw-medium">{selectedDeliverable.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="ds-btn ds-btn-secondary" onClick={() => setSelectedDeliverable(null)}>
                  Fermer
                </button>
                <button className="ds-btn ds-btn-primary">
                  <Edit2 size={14} className="me-1" />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Deliverable Modal */}
      {showNewModal && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouveau livrable</h5>
                <button className="btn-close" onClick={() => setShowNewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom du livrable</label>
                  <input type="text" className="form-control" placeholder="ex: API Backend v2" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Projet</label>
                  <select className="form-select">
                    <option value="">Selectionnez un projet...</option>
                    {PROJECTS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="2" placeholder="Description du livrable..."></textarea>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Date d'echeance</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Priorite</label>
                    <select className="form-select">
                      {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-3 mt-3">
                  <label className="form-label">Responsable</label>
                  <input type="text" className="form-control" placeholder="Nom du responsable" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="ds-btn ds-btn-secondary" onClick={() => setShowNewModal(false)}>
                  Annuler
                </button>
                <button className="ds-btn ds-btn-primary" onClick={() => {
                  toast.success('Livrable cree');
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

export default DeliverablesView;
