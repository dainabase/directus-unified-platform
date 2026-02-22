// src/frontend/src/modules/projects/views/TimeTrackingView.jsx
import React, { useState } from 'react';
import {
  Clock, Play, Pause, StopCircle, Plus, Calendar, Users, Target,
  TrendingUp, BarChart3, Filter, Download, ChevronDown, Edit2, Trash2
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const mockTimeEntries = [
  {
    id: 1,
    project: 'Refonte Site Web',
    task: 'Design UI/UX',
    user: 'Marie Martin',
    date: '2024-12-14',
    duration: 4.5,
    billable: true,
    status: 'approved',
    rate: 150
  },
  {
    id: 2,
    project: 'Application Mobile',
    task: 'Developpement API',
    user: 'Jean Dupont',
    date: '2024-12-14',
    duration: 6,
    billable: true,
    status: 'pending',
    rate: 140
  },
  {
    id: 3,
    project: 'ERP Integration',
    task: 'Tests Integration',
    user: 'Sophie Blanc',
    date: '2024-12-14',
    duration: 3,
    billable: true,
    status: 'approved',
    rate: 130
  },
  {
    id: 4,
    project: 'Refonte Site Web',
    task: 'Meeting Client',
    user: 'Marie Martin',
    date: '2024-12-13',
    duration: 1.5,
    billable: false,
    status: 'approved',
    rate: 150
  },
  {
    id: 5,
    project: 'Migration Cloud',
    task: 'Configuration AWS',
    user: 'Lucas Meyer',
    date: '2024-12-13',
    duration: 5,
    billable: true,
    status: 'pending',
    rate: 160
  }
];

const mockWeeklyData = [
  { day: 'Lun', hours: 7.5 },
  { day: 'Mar', hours: 8 },
  { day: 'Mer', hours: 6.5 },
  { day: 'Jeu', hours: 8.5 },
  { day: 'Ven', hours: 7 },
  { day: 'Sam', hours: 2 },
  { day: 'Dim', hours: 0 }
];

const mockProjectDistribution = [
  { name: 'Refonte Site Web', hours: 24, color: 'var(--accent-hover)' },
  { name: 'Application Mobile', hours: 18, color: '#10b981' },
  { name: 'ERP Integration', hours: 12, color: '#f59e0b' },
  { name: 'Migration Cloud', hours: 8, color: '#71717a' }
];

const PROJECTS = [
  'Refonte Site Web',
  'Application Mobile',
  'ERP Integration',
  'Migration Cloud',
  'Audit Securite'
];

const TimeTrackingView = ({ selectedCompany }) => {
  const [entries, setEntries] = useState(mockTimeEntries);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    project: '',
    task: '',
    duration: '',
    billable: true
  });

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTimer = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTracking(true);
    const interval = setInterval(() => {
      setCurrentTimer(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
    toast.success('Timer demarre');
  };

  const pauseTimer = () => {
    setIsTracking(false);
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    toast('Timer en pause', { icon: '⏸️' });
  };

  const stopTimer = () => {
    setIsTracking(false);
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (currentTimer > 0) {
      const hours = currentTimer / 3600;
      toast.success(`${formatDuration(hours)} enregistrees`);
    }
    setCurrentTimer(0);
  };

  const filteredEntries = entries.filter(e => {
    const matchesProject = filterProject === 'all' || e.project === filterProject;
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesProject && matchesStatus;
  });

  const handleAddEntry = () => {
    if (!newEntry.project || !newEntry.task || !newEntry.duration) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const entry = {
      id: entries.length + 1,
      ...newEntry,
      duration: parseFloat(newEntry.duration),
      user: 'Utilisateur actuel',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      rate: 150
    };
    setEntries([entry, ...entries]);
    setShowNewEntryModal(false);
    setNewEntry({ project: '', task: '', duration: '', billable: true });
    toast.success('Entree ajoutee');
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette entree?')) {
      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entree supprimee');
    }
  };

  // Stats
  const stats = {
    todayHours: entries.filter(e => e.date === '2024-12-14').reduce((sum, e) => sum + e.duration, 0),
    weekHours: mockWeeklyData.reduce((sum, d) => sum + d.hours, 0),
    billableHours: entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0),
    revenue: entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration * e.rate), 0)
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Clock className="me-2" size={24} />
              Time Tracking
            </h2>
            <div className="text-muted mt-1">
              Suivi du temps de travail
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="ds-btn ds-btn-outline-secondary">
              <Download size={16} className="me-1" />
              Exporter
            </button>
            <button className="ds-btn ds-btn-primary" onClick={() => setShowNewEntryModal(true)}>
              <Plus size={16} className="me-1" />
              Nouvelle entree
            </button>
          </div>
        </div>
      </div>

      {/* Timer Widget */}
      <div className="ds-card mb-4 bg-primary-lt">
        <div className="ds-card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="display-6 font-monospace fw-bold text-primary">
                {formatTimer(currentTimer)}
              </div>
            </div>
            <div className="col">
              {isTracking ? (
                <select className="form-select" style={{ width: 'auto' }}>
                  <option value="">Selectionnez un projet...</option>
                  {PROJECTS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <span className="text-muted">Demarrez le timer pour tracker votre temps</span>
              )}
            </div>
            <div className="col-auto d-flex gap-2">
              {!isTracking ? (
                <button className="ds-btn ds-btn-success btn-lg" onClick={startTimer}>
                  <Play size={20} className="me-1" />
                  Demarrer
                </button>
              ) : (
                <>
                  <button className="ds-btn ds-btn-warning btn-lg" onClick={pauseTimer}>
                    <Pause size={20} />
                  </button>
                  <button className="ds-btn ds-btn-danger btn-lg" onClick={stopTimer}>
                    <StopCircle size={20} className="me-1" />
                    Arreter
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <Clock size={20} className="text-primary me-2" />
                <span className="text-muted small">Aujourd'hui</span>
              </div>
              <h3 className="mb-0">{formatDuration(stats.todayHours)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <Calendar size={20} className="text-info me-2" />
                <span className="text-muted small">Cette semaine</span>
              </div>
              <h3 className="mb-0">{formatDuration(stats.weekHours)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <Target size={20} className="text-success me-2" />
                <span className="text-muted small">Facturable</span>
              </div>
              <h3 className="mb-0">{formatDuration(stats.billableHours)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="ds-card">
            <div className="ds-card-body">
              <div className="d-flex align-items-center mb-2">
                <TrendingUp size={20} className="text-warning me-2" />
                <span className="text-muted small">Revenus</span>
              </div>
              <h3 className="mb-0">CHF {stats.revenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="ds-card">
            <div className="ds-card-header">
              <h5 className="ds-card-title mb-0">Heures par jour (cette semaine)</h5>
            </div>
            <div className="ds-card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockWeeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(v) => `${v}h`} />
                  <Bar dataKey="hours" fill="var(--accent-hover)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="ds-card h-100">
            <div className="ds-card-header">
              <h5 className="ds-card-title mb-0">Par projet</h5>
            </div>
            <div className="ds-card-body">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={mockProjectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="hours"
                  >
                    {mockProjectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}h`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-column gap-1 mt-2">
                {mockProjectDistribution.map(item => (
                  <div key={item.name} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle me-2"
                        style={{ width: 8, height: 8, backgroundColor: item.color }}
                      />
                      <small className="text-truncate" style={{ maxWidth: 120 }}>{item.name}</small>
                    </div>
                    <small className="fw-medium">{item.hours}h</small>
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
          <option value="pending">En attente</option>
          <option value="approved">Approuve</option>
          <option value="rejected">Rejete</option>
        </select>
      </div>

      {/* Time Entries Table */}
      <div className="ds-card">
        <div className="table-responsive">
          <table className="table table-hover card-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Projet</th>
                <th>Tache</th>
                <th>Utilisateur</th>
                <th>Duree</th>
                <th>Facturable</th>
                <th>Montant</th>
                <th>Statut</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <small className="text-muted">
                      {new Date(entry.date).toLocaleDateString('fr-CH')}
                    </small>
                  </td>
                  <td className="fw-medium">{entry.project}</td>
                  <td>{entry.task}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-sm me-2">
                        {entry.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      {entry.user}
                    </div>
                  </td>
                  <td className="fw-medium">{formatDuration(entry.duration)}</td>
                  <td>
                    {entry.billable ? (
                      <span className="badge bg-success-lt text-success">Oui</span>
                    ) : (
                      <span className="badge bg-secondary-lt text-secondary">Non</span>
                    )}
                  </td>
                  <td>
                    {entry.billable ? `CHF ${(entry.duration * entry.rate).toLocaleString()}` : '-'}
                  </td>
                  <td>
                    <span className={`badge ${
                      entry.status === 'approved' ? 'bg-success' :
                      entry.status === 'pending' ? 'bg-warning' : 'bg-danger'
                    }`}>
                      {entry.status === 'approved' ? 'Approuve' :
                       entry.status === 'pending' ? 'En attente' : 'Rejete'}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button className="ds-btn ds-btn-sm ds-btn-ghost-primary" title="Modifier">
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="ds-btn ds-btn-sm ds-btn-ghost-danger"
                        onClick={() => handleDelete(entry.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEntries.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Clock size={48} className="mb-3 opacity-50" />
            <p>Aucune entree de temps trouvee</p>
          </div>
        )}
      </div>

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvelle entree de temps</h5>
                <button className="btn-close" onClick={() => setShowNewEntryModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Projet</label>
                  <select
                    className="form-select"
                    value={newEntry.project}
                    onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value })}
                  >
                    <option value="">Selectionnez un projet...</option>
                    {PROJECTS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tache</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Description de la tache"
                    value={newEntry.task}
                    onChange={(e) => setNewEntry({ ...newEntry, task: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Duree (heures)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ex: 2.5"
                    step="0.25"
                    value={newEntry.duration}
                    onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={newEntry.billable}
                      onChange={(e) => setNewEntry({ ...newEntry, billable: e.target.checked })}
                    />
                    <span className="form-check-label">Temps facturable</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="ds-btn ds-btn-secondary" onClick={() => setShowNewEntryModal(false)}>
                  Annuler
                </button>
                <button className="ds-btn ds-btn-primary" onClick={handleAddEntry}>
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackingView;
