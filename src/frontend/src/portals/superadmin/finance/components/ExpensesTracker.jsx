// src/frontend/src/portals/superadmin/finance/components/ExpensesTracker.jsx
import React, { useState } from 'react';
import {
  Receipt, Plus, Edit2, Trash2, Search, Filter, Download,
  CheckCircle, Clock, XCircle, Eye, Upload, Calendar, User
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const mockExpenses = [
  {
    id: 1,
    description: 'Licence Figma annuelle',
    amount: 540,
    category: 'software',
    vendor: 'Figma Inc.',
    date: '2024-12-10',
    status: 'approved',
    submittedBy: 'Marie Martin',
    approvedBy: 'Jean Dupont',
    receipt: true
  },
  {
    id: 2,
    description: 'Deplacement client Zurich',
    amount: 285,
    category: 'travel',
    vendor: 'SBB / Hotels.ch',
    date: '2024-12-08',
    status: 'approved',
    submittedBy: 'Pierre Blanc',
    approvedBy: 'Jean Dupont',
    receipt: true
  },
  {
    id: 3,
    description: 'Materiel de bureau',
    amount: 156,
    category: 'office',
    vendor: 'Office World',
    date: '2024-12-05',
    status: 'pending',
    submittedBy: 'Sophie Dubois',
    approvedBy: null,
    receipt: true
  },
  {
    id: 4,
    description: 'Repas d\'equipe',
    amount: 420,
    category: 'meals',
    vendor: 'Restaurant Le Central',
    date: '2024-12-03',
    status: 'pending',
    submittedBy: 'Lucas Meyer',
    approvedBy: null,
    receipt: false
  },
  {
    id: 5,
    description: 'Formation React Advanced',
    amount: 1200,
    category: 'training',
    vendor: 'Frontend Masters',
    date: '2024-11-28',
    status: 'approved',
    submittedBy: 'Pierre Blanc',
    approvedBy: 'Marie Martin',
    receipt: true
  },
  {
    id: 6,
    description: 'Hebergement serveur cloud',
    amount: 890,
    category: 'infrastructure',
    vendor: 'Google Cloud',
    date: '2024-11-25',
    status: 'approved',
    submittedBy: 'Admin',
    approvedBy: 'Auto',
    receipt: true
  },
  {
    id: 7,
    description: 'Pub LinkedIn Ads',
    amount: 500,
    category: 'marketing',
    vendor: 'LinkedIn',
    date: '2024-11-20',
    status: 'rejected',
    submittedBy: 'Marie Martin',
    approvedBy: 'Jean Dupont',
    receipt: true,
    rejectReason: 'Budget marketing depasse'
  }
];

const mockCategoryBreakdown = [
  { name: 'Software', value: 2540, color: '#3b82f6' },
  { name: 'Deplacements', value: 1850, color: '#10b981' },
  { name: 'Formation', value: 1200, color: '#f59e0b' },
  { name: 'Infrastructure', value: 890, color: '#ef4444' },
  { name: 'Marketing', value: 500, color: '#8b5cf6' },
  { name: 'Autre', value: 576, color: '#6b7280' }
];

const mockMonthlyExpenses = [
  { month: 'Jul', amount: 4200 },
  { month: 'Aou', amount: 3800 },
  { month: 'Sep', amount: 5100 },
  { month: 'Oct', amount: 4600 },
  { month: 'Nov', amount: 5800 },
  { month: 'Dec', amount: 3200 }
];

const CATEGORIES = {
  software: { label: 'Logiciels', color: 'primary' },
  travel: { label: 'Deplacements', color: 'success' },
  training: { label: 'Formation', color: 'warning' },
  office: { label: 'Bureau', color: 'info' },
  meals: { label: 'Repas', color: 'purple' },
  infrastructure: { label: 'Infrastructure', color: 'danger' },
  marketing: { label: 'Marketing', color: 'cyan' },
  other: { label: 'Autre', color: 'secondary' }
};

const ExpensesTracker = ({ selectedCompany }) => {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge bg-success"><CheckCircle size={12} className="me-1" />Approuve</span>;
      case 'pending':
        return <span className="badge bg-warning"><Clock size={12} className="me-1" />En attente</span>;
      case 'rejected':
        return <span className="badge bg-danger"><XCircle size={12} className="me-1" />Refuse</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const handleApprove = (id) => {
    setExpenses(expenses.map(e =>
      e.id === id ? { ...e, status: 'approved', approvedBy: 'Admin' } : e
    ));
    toast.success('Depense approuvee');
  };

  const handleReject = (id) => {
    setExpenses(expenses.map(e =>
      e.id === id ? { ...e, status: 'rejected', approvedBy: 'Admin' } : e
    ));
    toast.success('Depense refusee');
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette depense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
      toast.success('Depense supprimee');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-CH');
  };

  // Stats
  const stats = {
    total: expenses.reduce((sum, e) => sum + e.amount, 0),
    approved: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
    pending: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
    pendingCount: expenses.filter(e => e.status === 'pending').length
  };

  return (
    <div className="container-xl">
      {/* Header */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col-auto">
            <h2 className="page-title">
              <Receipt className="me-2" size={24} />
              Suivi des Depenses
            </h2>
            <div className="text-muted mt-1">
              Gestion et validation des notes de frais
            </div>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            <button className="btn btn-outline-secondary">
              <Download size={16} className="me-1" />
              Exporter
            </button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} className="me-1" />
              Nouvelle depense
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
                <Receipt size={20} className="text-primary me-2" />
                <span className="text-muted small">Total depenses</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.total)}</h3>
              <small className="text-muted">Ce mois</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <CheckCircle size={20} className="text-success me-2" />
                <span className="text-muted small">Approuvees</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.approved)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Clock size={20} className="text-warning me-2" />
                <span className="text-muted small">En attente</span>
              </div>
              <h3 className="mb-0">{formatCurrency(stats.pending)}</h3>
              <small className="text-warning">{stats.pendingCount} a valider</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning-lt">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <Clock size={20} className="text-warning me-2" />
                <span className="text-muted small">A approuver</span>
              </div>
              <h3 className="mb-0">{stats.pendingCount}</h3>
              <small className="text-warning">Necessite validation</small>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Depenses mensuelles (6 mois)</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockMonthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="amount" fill="#3b82f6" name="Depenses" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Par categorie</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={mockCategoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mockCategoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {mockCategoryBreakdown.slice(0, 4).map(item => (
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
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text"><Search size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">Toutes categories</option>
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous statuts</option>
            <option value="approved">Approuve</option>
            <option value="pending">En attente</option>
            <option value="rejected">Refuse</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover card-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Categorie</th>
                <th>Fournisseur</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Soumis par</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => {
                const catInfo = CATEGORIES[expense.category];

                return (
                  <tr key={expense.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="fw-medium">{expense.description}</span>
                        {expense.receipt && (
                          <span className="badge bg-secondary-lt text-secondary ms-2" title="Justificatif">
                            <Receipt size={10} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge bg-${catInfo?.color || 'secondary'}-lt text-${catInfo?.color || 'secondary'}`}>
                        {catInfo?.label}
                      </span>
                    </td>
                    <td className="text-muted">{expense.vendor}</td>
                    <td>
                      <span className="text-muted">
                        <Calendar size={12} className="me-1" />
                        {formatDate(expense.date)}
                      </span>
                    </td>
                    <td className="fw-medium">{formatCurrency(expense.amount)}</td>
                    <td>{getStatusBadge(expense.status)}</td>
                    <td>
                      <span className="text-muted">
                        <User size={12} className="me-1" />
                        {expense.submittedBy}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        {expense.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-ghost-success"
                              onClick={() => handleApprove(expense.id)}
                              title="Approuver"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-ghost-danger"
                              onClick={() => handleReject(expense.id)}
                              title="Refuser"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-sm btn-ghost-primary"
                          onClick={() => setSelectedExpense(expense)}
                          title="Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost-danger"
                          onClick={() => handleDelete(expense.id)}
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
        {filteredExpenses.length === 0 && (
          <div className="text-center py-5 text-muted">
            <Receipt size={48} className="mb-3 opacity-50" />
            <p>Aucune depense trouvee</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensesTracker;
