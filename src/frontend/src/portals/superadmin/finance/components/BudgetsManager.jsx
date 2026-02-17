// src/frontend/src/portals/superadmin/finance/components/BudgetsManager.jsx
import React, { useState } from 'react';
import {
  Wallet, Plus, Edit2, Trash2, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Filter, Download, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const mockBudgets = [
  {
    id: 1,
    name: 'Marketing Q4 2024',
    category: 'marketing',
    allocated: 50000,
    spent: 38500,
    remaining: 11500,
    period: '2024-Q4',
    status: 'on-track',
    owner: 'Marie Martin'
  },
  {
    id: 2,
    name: 'IT Infrastructure',
    category: 'it',
    allocated: 120000,
    spent: 95000,
    remaining: 25000,
    period: '2024',
    status: 'on-track',
    owner: 'Pierre Blanc'
  },
  {
    id: 3,
    name: 'RH - Recrutement',
    category: 'hr',
    allocated: 30000,
    spent: 28500,
    remaining: 1500,
    period: '2024-Q4',
    status: 'warning',
    owner: 'Sophie Dubois'
  },
  {
    id: 4,
    name: 'Operations',
    category: 'operations',
    allocated: 80000,
    spent: 82000,
    remaining: -2000,
    period: '2024',
    status: 'over-budget',
    owner: 'Jean Dupont'
  },
  {
    id: 5,
    name: 'R&D Innovation',
    category: 'rd',
    allocated: 200000,
    spent: 145000,
    remaining: 55000,
    period: '2024',
    status: 'on-track',
    owner: 'Lucas Meyer'
  }
];

const mockMonthlyTrend = [
  { month: 'Jul', budget: 40000, actual: 38000 },
  { month: 'Aou', budget: 40000, actual: 42000 },
  { month: 'Sep', budget: 45000, actual: 43500 },
  { month: 'Oct', budget: 45000, actual: 47000 },
  { month: 'Nov', budget: 50000, actual: 48500 },
  { month: 'Dec', budget: 55000, actual: 52000 }
];

const mockCategoryBreakdown = [
  { name: 'Marketing', value: 50000, color: '#3b82f6' },
  { name: 'IT', value: 120000, color: '#10b981' },
  { name: 'RH', value: 30000, color: '#f59e0b' },
  { name: 'Operations', value: 80000, color: '#ef4444' },
  { name: 'R&D', value: 200000, color: '#8b5cf6' }
];

const CATEGORIES = {
  marketing: { label: 'Marketing', color: 'primary' },
  it: { label: 'IT', color: 'success' },
  hr: { label: 'RH', color: 'warning' },
  operations: { label: 'Operations', color: 'danger' },
  rd: { label: 'R&D', color: 'purple' },
  other: { label: 'Autre', color: 'secondary' }
};

const BudgetsManager = ({ selectedCompany }) => {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const filteredBudgets = budgets.filter(b => {
    const matchesCategory = filterCategory === 'all' || b.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesPeriod = filterPeriod === 'all' || b.period.includes(filterPeriod);
    return matchesCategory && matchesStatus && matchesPeriod;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'on-track':
        return <span className="badge bg-success"><CheckCircle size={12} className="me-1" />En ligne</span>;
      case 'warning':
        return <span className="badge bg-warning"><AlertTriangle size={12} className="me-1" />Attention</span>;
      case 'over-budget':
        return <span className="badge bg-danger"><TrendingUp size={12} className="me-1" />Depasse</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getProgressColor = (spent, allocated) => {
    const percentage = (spent / allocated) * 100;
    if (percentage > 100) return 'danger';
    if (percentage > 85) return 'warning';
    return 'success';
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer ce budget?')) {
      setBudgets(budgets.filter(b => b.id !== id));
      toast.success('Budget supprime');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
  };

  // Stats globales
  const stats = {
    totalAllocated: budgets.reduce((sum, b) => sum + b.allocated, 0),
    totalSpent: budgets.reduce((sum, b) => sum + b.spent, 0),
    totalRemaining: budgets.reduce((sum, b) => sum + b.remaining, 0),
    overBudgetCount: budgets.filter(b => b.status === 'over-budget').length
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Wallet className="me-2" size={24} />
              Gestion des Budgets
            </h2>
            <div className="text-muted mt-1">
              Suivi et allocation des budgets par departement
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary">
              <Download size={16} className="me-1" />
              Exporter
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} className="me-1" />
              Nouveau budget
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Wallet size={20} className="text-primary me-2" />
                <span className="text-muted small">Budget total</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.totalAllocated)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <TrendingDown size={20} className="text-warning me-2" />
                <span className="text-muted small">Depense</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.totalSpent)}</h3>
              <small className="text-muted">
                {((stats.totalSpent / stats.totalAllocated) * 100).toFixed(1)}% utilise
              </small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <span className="text-muted small">Disponible</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.totalRemaining)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <AlertTriangle size={20} className="text-danger me-2" />
                <span className="text-muted small">Budgets depasses</span>
              </div>
              <h3 className="mb-0">{stats.overBudgetCount}</h3>
              <small className="text-danger">Necessite attention</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Budget vs Depenses reelles (6 mois)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockMonthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                  <Bar dataKey="actual" fill="#10b981" name="Reel" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Repartition par categorie</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mockCategoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockCategoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                {mockCategoryBreakdown.map(item => (
                  <div key={item.name} className="d-flex align-items-center">
                    <div
                      className="rounded-circle me-1"
                      style={{ width: 8, height: 8, backgroundColor: item.color }}
                    />
                    <small className="text-muted">{item.name}</small>
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
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <select
          className="form-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">Tous statuts</option>
          <option value="on-track">En ligne</option>
          <option value="warning">Attention</option>
          <option value="over-budget">Depasse</option>
        </select>
        <select
          className="form-select"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">Toutes periodes</option>
          <option value="2024-Q4">Q4 2024</option>
          <option value="2024">Annee 2024</option>
          <option value="2025">Annee 2025</option>
        </select>
      </div>

      {/* Budgets Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover card-table">
            <thead>
              <tr>
                <th>Budget</th>
                <th>Categorie</th>
                <th>Periode</th>
                <th>Alloue</th>
                <th>Depense</th>
                <th>Progression</th>
                <th>Statut</th>
                <th>Responsable</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgets.map(budget => {
                const catInfo = CATEGORIES[budget.category];
                const percentage = Math.round((budget.spent / budget.allocated) * 100);

                return (
                  <tr key={budget.id}>
                    <td className="fw-medium">{budget.name}</td>
                    <td>
                      <span className={`badge bg-${catInfo?.color || 'secondary'}-lt text-${catInfo?.color || 'secondary'}`}>
                        {catInfo?.label}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary-lt text-secondary">
                        <Calendar size={12} className="me-1" />
                        {budget.period}
                      </span>
                    </td>
                    <td>{formatCurrency(budget.allocated)}</td>
                    <td>{formatCurrency(budget.spent)}</td>
                    <td style={{ width: '150px' }}>
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div
                            className={`progress-bar bg-${getProgressColor(budget.spent, budget.allocated)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <small className="ms-2 text-muted">{percentage}%</small>
                      </div>
                    </td>
                    <td>{getStatusBadge(budget.status)}</td>
                    <td className="text-muted">{budget.owner}</td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-ghost-primary" title="Modifier">
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => handleDelete(budget.id)}
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
        {filteredBudgets.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Wallet size={48} className="mb-3 opacity-50" />
            <p>Aucun budget trouve</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsManager;
