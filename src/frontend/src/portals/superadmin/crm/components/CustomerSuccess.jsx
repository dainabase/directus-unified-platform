// src/frontend/src/portals/superadmin/crm/components/CustomerSuccess.jsx
import React, { useState } from 'react';
import {
  Heart, TrendingUp, Users, Star, AlertTriangle, CheckCircle,
  Phone, Mail, Calendar, Clock, RefreshCw, Filter, MoreVertical,
  ThumbsUp, ThumbsDown, MessageSquare, Award, Target
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const mockCustomers = [
  {
    id: 1,
    name: 'Swiss Industries AG',
    contact: 'Peter Mueller',
    email: 'p.mueller@swiss-industries.ch',
    healthScore: 92,
    nps: 9,
    mrr: 4500,
    lastContact: '2024-12-10',
    status: 'healthy',
    renewalDate: '2025-03-15',
    csm: 'Marie Martin'
  },
  {
    id: 2,
    name: 'TechStart SA',
    contact: 'Marc Dubois',
    email: 'm.dubois@techstart.ch',
    healthScore: 78,
    nps: 7,
    mrr: 2200,
    lastContact: '2024-12-08',
    status: 'healthy',
    renewalDate: '2025-02-28',
    csm: 'Jean Rochat'
  },
  {
    id: 3,
    name: 'Digital AG',
    contact: 'Anna Schmidt',
    email: 'a.schmidt@digital-ag.ch',
    healthScore: 45,
    nps: 5,
    mrr: 3800,
    lastContact: '2024-11-25',
    status: 'at-risk',
    renewalDate: '2025-01-31',
    csm: 'Marie Martin'
  },
  {
    id: 4,
    name: 'MedTech Solutions',
    contact: 'Sophie Martin',
    email: 's.martin@medtech.ch',
    healthScore: 88,
    nps: 8,
    mrr: 5200,
    lastContact: '2024-12-12',
    status: 'healthy',
    renewalDate: '2025-06-30',
    csm: 'Jean Rochat'
  },
  {
    id: 5,
    name: 'FinServ Banque',
    contact: 'Thomas Weber',
    email: 't.weber@finserv.ch',
    healthScore: 32,
    nps: 4,
    mrr: 8500,
    lastContact: '2024-11-15',
    status: 'critical',
    renewalDate: '2025-01-15',
    csm: 'Marie Martin'
  }
];

const mockHealthTrend = [
  { month: 'Jul', score: 75 },
  { month: 'Aou', score: 78 },
  { month: 'Sep', score: 82 },
  { month: 'Oct', score: 79 },
  { month: 'Nov', score: 81 },
  { month: 'Dec', score: 84 }
];

const mockNpsDistribution = [
  { name: 'Promoteurs (9-10)', value: 45, color: '#10b981' },
  { name: 'Passifs (7-8)', value: 35, color: '#f59e0b' },
  { name: 'Detracteurs (0-6)', value: 20, color: '#ef4444' }
];

const mockChurnRisk = [
  { month: 'Jan', retained: 98, churned: 2 },
  { month: 'Fev', retained: 97, churned: 3 },
  { month: 'Mar', retained: 99, churned: 1 },
  { month: 'Avr', retained: 96, churned: 4 },
  { month: 'Mai', retained: 98, churned: 2 },
  { month: 'Jun', retained: 97, churned: 3 }
];

const CustomerSuccess = ({ selectedCompany }) => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
  };

  const filteredCustomers = customers.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return <span className="badge bg-success"><CheckCircle size={12} className="me-1" />Sain</span>;
      case 'at-risk':
        return <span className="badge bg-warning"><AlertTriangle size={12} className="me-1" />A risque</span>;
      case 'critical':
        return <span className="badge bg-danger"><AlertTriangle size={12} className="me-1" />Critique</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getNpsEmoji = (nps) => {
    if (nps >= 9) return '😊';
    if (nps >= 7) return '😐';
    return '😞';
  };

  // Stats
  const stats = {
    avgHealthScore: Math.round(customers.reduce((sum, c) => sum + c.healthScore, 0) / customers.length),
    avgNps: (customers.reduce((sum, c) => sum + c.nps, 0) / customers.length).toFixed(1),
    totalMrr: customers.reduce((sum, c) => sum + c.mrr, 0),
    atRiskCount: customers.filter(c => c.status === 'at-risk' || c.status === 'critical').length,
    upcomingRenewals: customers.filter(c => {
      const renewal = new Date(c.renewalDate);
      const now = new Date();
      const diff = (renewal - now) / (1000 * 60 * 60 * 24);
      return diff <= 60 && diff > 0;
    }).length
  };

  const handleAction = (action, customer) => {
    toast.success(`Action "${action}" planifiee pour ${customer.name}`);
    setShowActionModal(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Heart className="me-2" size={24} />
              Customer Success
            </h2>
            <div className="text-muted mt-1">
              Satisfaction et retention clients
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary">
              <RefreshCw size={16} className="me-1" />
              Actualiser
            </button>
            <button className="btn btn-primary">
              <Calendar size={16} className="me-1" />
              Planifier review
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
                <Heart size={20} className="text-success me-2" />
                <span className="text-muted small">Health Score moyen</span>
              </div>
              <h3 className={`mb-0 text-${getHealthColor(stats.avgHealthScore)}`}>
                {stats.avgHealthScore}%
              </h3>
              <small className="text-success">+3% ce mois</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Star size={20} className="text-warning me-2" />
                <span className="text-muted small">NPS moyen</span>
              </div>
              <h3 className="mb-0">{stats.avgNps}</h3>
              <small className="text-muted">Sur 10</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <TrendingUp size={20} className="text-primary me-2" />
                <span className="text-muted small">MRR total</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.totalMrr)}</h3>
              <small className="text-success">+8% YoY</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <AlertTriangle size={20} className="text-danger me-2" />
                <span className="text-muted small">Clients a risque</span>
              </div>
              <h3 className="mb-0">{stats.atRiskCount}</h3>
              <small className="text-danger">Action requise</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Calendar size={20} className="text-info me-2" />
                <span className="text-muted small">Renouvellements</span>
              </div>
              <h3 className="mb-0">{stats.upcomingRenewals}</h3>
              <small className="text-muted">Dans 60 jours</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Health Score (6 mois)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockHealthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Distribution NPS</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={mockNpsDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockNpsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-column gap-1 mt-2">
                {mockNpsDistribution.map(item => (
                  <div key={item.name} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="rounded-circle me-2"
                        style={{ width: 8, height: 8, backgroundColor: item.color }}
                      />
                      <small>{item.name}</small>
                    </div>
                    <small className="fw-medium">{item.value}%</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Retention (6 mois)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mockChurnRisk}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="retained" stackId="a" fill="#10b981" name="Retenus" />
                  <Bar dataKey="churned" stackId="a" fill="#ef4444" name="Churnes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">Tous les clients</option>
            <option value="healthy">Sains</option>
            <option value="at-risk">A risque</option>
            <option value="critical">Critiques</option>
          </select>
        </div>
        <div className="text-muted small">
          {filteredCustomers.length} client(s)
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover card-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Health Score</th>
                <th>NPS</th>
                <th>MRR</th>
                <th>Dernier contact</th>
                <th>Renouvellement</th>
                <th>Statut</th>
                <th>CSM</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td className="fw-medium">{customer.name}</td>
                  <td>
                    <div>{customer.contact}</div>
                    <small className="text-muted">{customer.email}</small>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="progress flex-grow-1" style={{ width: 60, height: 6 }}>
                        <div
                          className={`progress-bar bg-${getHealthColor(customer.healthScore)}`}
                          style={{ width: `${customer.healthScore}%` }}
                        />
                      </div>
                      <span className={`ms-2 text-${getHealthColor(customer.healthScore)} fw-medium`}>
                        {customer.healthScore}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="me-1">{getNpsEmoji(customer.nps)}</span>
                    {customer.nps}/10
                  </td>
                  <td>{formatCurrency(customer.mrr)}</td>
                  <td>
                    <small className="text-muted">
                      <Clock size={12} className="me-1" />
                      {new Date(customer.lastContact).toLocaleDateString('fr-CH')}
                    </small>
                  </td>
                  <td>
                    <small className={
                      new Date(customer.renewalDate) < new Date(Date.now() + 30*24*60*60*1000)
                        ? 'text-danger fw-medium'
                        : 'text-muted'
                    }>
                      {new Date(customer.renewalDate).toLocaleDateString('fr-CH')}
                    </small>
                  </td>
                  <td>{getStatusBadge(customer.status)}</td>
                  <td className="text-muted">{customer.csm}</td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-ghost-primary"
                        title="Appeler"
                        onClick={() => toast.success(`Appel vers ${customer.contact}`)}
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost-primary"
                        title="Email"
                        onClick={() => toast.success(`Email a ${customer.email}`)}
                      >
                        <Mail size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost-secondary"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowActionModal(true);
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Users size={48} className="mb-3 opacity-50" />
            <p>Aucun client trouve</p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && selectedCustomer && (
        <div className="modal modal-blur fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Actions - {selectedCustomer.name}</h5>
                <button className="btn-close" onClick={() => setShowActionModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <Heart size={16} className="me-2 text-muted" />
                    <span>Health Score: </span>
                    <span className={`ms-2 fw-medium text-${getHealthColor(selectedCustomer.healthScore)}`}>
                      {selectedCustomer.healthScore}%
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <Star size={16} className="me-2 text-muted" />
                    <span>NPS: </span>
                    <span className="ms-2 fw-medium">{selectedCustomer.nps}/10</span>
                  </div>
                </div>
                <hr />
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleAction('Planifier call de suivi', selectedCustomer)}
                  >
                    <Phone size={16} className="me-2" />
                    Planifier call de suivi
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleAction('Envoyer questionnaire NPS', selectedCustomer)}
                  >
                    <MessageSquare size={16} className="me-2" />
                    Envoyer questionnaire NPS
                  </button>
                  <button
                    className="btn btn-outline-success"
                    onClick={() => handleAction('Proposer upsell', selectedCustomer)}
                  >
                    <TrendingUp size={16} className="me-2" />
                    Proposer upsell
                  </button>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => handleAction('Creer plan de retention', selectedCustomer)}
                  >
                    <Target size={16} className="me-2" />
                    Creer plan de retention
                  </button>
                  <button
                    className="btn btn-outline-info"
                    onClick={() => handleAction('Envoyer certificat fidelite', selectedCustomer)}
                  >
                    <Award size={16} className="me-2" />
                    Envoyer certificat fidelite
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowActionModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSuccess;
