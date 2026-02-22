/**
 * ExpensesTracker — Connected to Directus
 * Fetches from `expenses` collection (primary).
 * Falls back to `bank_transactions` with type=debit if expenses is empty/unavailable.
 * Includes approval workflow (approve/reject mutations).
 */
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, Plus, Trash2, Search, Download,
  CheckCircle, Clock, XCircle, Calendar, Loader2, RefreshCw, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

const CATEGORIES = {
  software: { label: 'Logiciels', color: 'var(--accent-hover)' },
  travel: { label: 'Deplacements', color: 'var(--semantic-green)' },
  training: { label: 'Formation', color: 'var(--semantic-orange)' },
  office: { label: 'Bureau', color: '#5856D6' },
  meals: { label: 'Repas', color: '#AF52DE' },
  infrastructure: { label: 'Infrastructure', color: 'var(--semantic-red)' },
  marketing: { label: 'Marketing', color: '#00C7BE' },
  other: { label: 'Autre', color: 'var(--label-2)' }
}

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-CH')
}

/**
 * Fetch expenses from Directus `expenses` collection.
 * If collection is empty or unavailable, fall back to `bank_transactions` with type=debit.
 */
const fetchExpenses = async (company) => {
  const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}

  // Primary: fetch from `expenses` collection
  try {
    const res = await api.get('/items/expenses', {
      params: { filter, fields: ['*'], sort: ['-date_created'], limit: -1 }
    })
    const expenses = res.data?.data || []
    if (expenses.length > 0) return { source: 'expenses', data: expenses }
  } catch (err) {
    console.warn('expenses collection unavailable, trying bank_transactions fallback:', err.message)
  }

  // Fallback: fetch debit bank_transactions as expense proxy
  // TODO: Once `expenses` collection is populated, remove this fallback
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const res = await api.get('/items/bank_transactions', {
      params: {
        filter: {
          ...filter,
          type: { _eq: 'debit' },
          date: { _gte: sixMonthsAgo.toISOString() }
        },
        fields: ['*'],
        sort: ['-date'],
        limit: 500
      }
    })
    const transactions = (res.data?.data || []).map(tx => ({
      id: tx.id,
      description: tx.description || tx.reference || 'Transaction',
      vendor: tx.counterparty_name || tx.merchant || '',
      amount: Math.abs(parseFloat(tx.amount || 0)),
      category: tx.category || 'other',
      status: tx.reconciled ? 'approved' : 'pending',
      date: tx.date,
      date_created: tx.date_created,
      owner_company: tx.owner_company,
      _source: 'bank_transactions'
    }))
    return { source: 'bank_transactions', data: transactions }
  } catch (err) {
    console.warn('bank_transactions fallback also failed:', err.message)
  }

  return { source: 'none', data: [] }
}

const ExpensesTracker = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: expensesResult, isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', selectedCompany],
    queryFn: () => fetchExpenses(selectedCompany),
    staleTime: 1000 * 60 * 2
  })

  const expenses = expensesResult?.data || []
  const dataSource = expensesResult?.source || 'none'

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Only mutate on the real expenses collection, not on fallback data
      const collection = dataSource === 'bank_transactions' ? 'bank_transactions' : 'expenses'
      await api.patch(`/items/${collection}/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const collection = dataSource === 'bank_transactions' ? 'bank_transactions' : 'expenses'
      await api.delete(`/items/${collection}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      toast.success('Depense supprimee')
    },
    onError: () => toast.error('Erreur lors de la suppression')
  })

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = !searchTerm ||
      (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendor || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || e.category === filterCategory
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleApprove = (id) => {
    const data = dataSource === 'bank_transactions'
      ? { reconciled: true }
      : { status: 'approved' }
    updateMutation.mutate({ id, data }, {
      onSuccess: () => toast.success('Depense approuvee')
    })
  }

  const handleReject = (id) => {
    updateMutation.mutate({ id, data: { status: 'rejected' } }, {
      onSuccess: () => toast.success('Depense refusee')
    })
  }

  // Category breakdown for pie chart
  const categoryBreakdown = Object.entries(CATEGORIES).map(([key, config]) => {
    const total = expenses
      .filter(e => e.category === key)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    return { name: config.label, value: total, color: config.color }
  }).filter(c => c.value > 0)

  // Monthly expenses (last 6 months)
  const monthlyExpenses = (() => {
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const last6 = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthIdx = d.getMonth()
      const year = d.getFullYear()
      const monthExp = expenses.filter(e => {
        const ed = new Date(e.date || e.date_created)
        return ed.getMonth() === monthIdx && ed.getFullYear() === year
      })
      last6.push({
        month: months[monthIdx],
        amount: Math.round(monthExp.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0))
      })
    }
    return last6
  })()

  // Stats
  const stats = {
    total: expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    approved: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    pending: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    pendingCount: expenses.filter(e => e.status === 'pending').length
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="ds-badge ds-badge-success inline-flex items-center gap-1"><CheckCircle size={12} />Approuve</span>
      case 'pending':
        return <span className="ds-badge ds-badge-warning inline-flex items-center gap-1"><Clock size={12} />En attente</span>
      case 'rejected':
        return <span className="ds-badge ds-badge-danger inline-flex items-center gap-1"><XCircle size={12} />Refuse</span>
      default:
        return <span className="ds-badge ds-badge-default">{status || 'N/A'}</span>
    }
  }

  // Error state
  if (error) {
    return (
      <div className="ds-card p-8 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--semantic-red)' }} />
        <h3 className="font-semibold mb-2" style={{ color: 'var(--label-1)' }}>Erreur de chargement</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--label-2)' }}>
          {error.message || 'Impossible de charger les depenses'}
        </p>
        <button
          onClick={() => refetch()}
          className="ds-btn ds-btn-primary"
        >
          <RefreshCw size={14} /> Reessayer
        </button>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="ds-card p-6">
          <div className="h-12 ds-skeleton rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="ds-card p-6">
              <div className="h-20 ds-skeleton rounded-lg" />
            </div>
          ))}
        </div>
        <div className="ds-card p-6">
          <div className="h-64 ds-skeleton rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data source indicator */}
      {dataSource === 'bank_transactions' && (
        <div className="ds-card p-3 flex items-center gap-2" style={{ borderLeft: '3px solid var(--semantic-orange)' }}>
          <Clock size={14} style={{ color: 'var(--semantic-orange)' }} />
          <span className="text-xs" style={{ color: 'var(--label-2)' }}>
            Donnees depuis <strong>bank_transactions</strong> (collection expenses vide ou indisponible)
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="ds-page-title flex items-center gap-2">
            <Receipt className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Suivi des Depenses
          </h2>
          <p className="ds-label mt-1">Gestion et validation des notes de frais</p>
        </div>
        <div className="flex gap-2">
          <button className="ds-btn ds-btn-secondary">
            <Download size={16} />Exporter
          </button>
          <button className="ds-btn ds-btn-primary">
            <Plus size={16} />Nouvelle depense
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={18} style={{ color: 'var(--accent)' }} />
            <span className="ds-label">Total depenses</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{formatCHF(stats.total)}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} style={{ color: 'var(--semantic-green)' }} />
            <span className="ds-label">Approuvees</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{formatCHF(stats.approved)}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} style={{ color: 'var(--semantic-orange)' }} />
            <span className="ds-label">En attente</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{formatCHF(stats.pending)}</p>
        </div>
        <div className="ds-card p-5" style={{ borderLeft: '3px solid var(--semantic-orange)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} style={{ color: 'var(--semantic-orange)' }} />
            <span className="ds-label">A approuver</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{stats.pendingCount}</p>
          {stats.pendingCount > 0 && <p className="ds-meta mt-1" style={{ color: 'var(--semantic-orange)' }}>Necessite validation</p>}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="ds-card p-5 lg:col-span-2">
          <h3 className="ds-nav-section mb-4">Depenses mensuelles (6 mois)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCHF(v)} />
              <Bar dataKey="amount" fill="var(--accent)" name="Depenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ds-card p-5">
          <h3 className="ds-nav-section mb-4">Par categorie</h3>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCHF(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3">
                {categoryBreakdown.slice(0, 4).map(item => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="ds-meta">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <span className="ds-label">Aucune donnee</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--label-3)' }} />
          <input
            type="text"
            className="ds-input pl-9"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="ds-input" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">Toutes categories</option>
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <select className="ds-input" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tous statuts</option>
          <option value="approved">Approuve</option>
          <option value="pending">En attente</option>
          <option value="rejected">Refuse</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="ds-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sep)' }}>
                <th className="text-left p-4 ds-nav-section">Description</th>
                <th className="text-left p-4 ds-nav-section">Categorie</th>
                <th className="text-left p-4 ds-nav-section">Date</th>
                <th className="text-left p-4 ds-nav-section">Montant</th>
                <th className="text-left p-4 ds-nav-section">Statut</th>
                <th className="text-right p-4 ds-nav-section">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-medium" style={{ color: 'var(--label-1)' }}>{expense.description || expense.name || '-'}</span>
                    {expense.vendor && <span className="block ds-meta">{expense.vendor}</span>}
                  </td>
                  <td className="p-4">
                    <span className="ds-badge ds-badge-info">
                      {CATEGORIES[expense.category]?.label || expense.category || '-'}
                    </span>
                  </td>
                  <td className="p-4" style={{ color: 'var(--label-2)' }}>
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(expense.date || expense.date_created)}</span>
                  </td>
                  <td className="p-4 font-medium" style={{ color: 'var(--label-1)' }}>{formatCHF(expense.amount || 0)}</td>
                  <td className="p-4">{getStatusBadge(expense.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {expense.status === 'pending' && (
                        <>
                          <button
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--semantic-green)' }}
                            onClick={() => handleApprove(expense.id)}
                            title="Approuver"
                          >
                            <CheckCircle size={14} />
                          </button>
                          {/* Reject only available on real expenses, not bank_transactions fallback */}
                          {dataSource !== 'bank_transactions' && (
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                              style={{ color: 'var(--semantic-red)' }}
                              onClick={() => handleReject(expense.id)}
                              title="Refuser"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--semantic-red)' }}
                        onClick={() => { if (window.confirm('Supprimer?')) deleteMutation.mutate(expense.id) }}
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
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <Receipt size={48} className="mx-auto mb-3 opacity-30" />
            <p className="ds-label">Aucune depense trouvee</p>
            <p className="ds-meta mt-1">Ajoutez une depense ou modifiez les filtres</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpensesTracker
