/**
 * BudgetsManager — Connected to Directus
 * Fetches from `budgets` collection (primary) with `expenses` for actual spend.
 * Falls back to `dashboard_kpis` for budget KPIs and `bank_transactions` for actuals
 * if the primary collections return empty.
 */
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Wallet, Plus, Edit2, Trash2, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Download, Loader2, RefreshCw, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

const CATEGORIES = {
  marketing: { label: 'Marketing', color: 'var(--accent-hover)' },
  it: { label: 'IT', color: 'var(--semantic-green)' },
  hr: { label: 'RH', color: 'var(--semantic-orange)' },
  operations: { label: 'Operations', color: 'var(--semantic-red)' },
  rd: { label: 'R&D', color: '#AF52DE' },
  other: { label: 'Autre', color: 'var(--label-2)' }
}

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount)

/**
 * Fetch budgets from Directus `budgets` collection.
 * If collection is empty or unavailable, fall back to `dashboard_kpis` for budget-like data.
 */
const fetchBudgets = async (company) => {
  const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}

  // Primary: fetch from `budgets` collection
  try {
    const res = await api.get('/items/budgets', {
      params: { filter, fields: ['*'], sort: ['-date_created'], limit: -1 }
    })
    const budgets = res.data?.data || []
    if (budgets.length > 0) return { source: 'budgets', data: budgets }
  } catch (err) {
    console.warn('budgets collection unavailable, trying fallback:', err.message)
  }

  // Fallback: fetch from `dashboard_kpis` where metric type relates to budgets
  // Fallback: dashboard_kpis for budget-like data when budgets collection is empty
  try {
    const res = await api.get('/items/dashboard_kpis', {
      params: {
        filter: { ...filter, category: { _eq: 'budget' } },
        fields: ['*'],
        sort: ['-date_created'],
        limit: -1
      }
    })
    const kpis = res.data?.data || []
    if (kpis.length > 0) {
      // Transform KPIs into budget-like shape
      const budgets = kpis.map(kpi => ({
        id: kpi.id,
        name: kpi.label || kpi.name || kpi.metric,
        category: kpi.subcategory || kpi.category || 'other',
        amount: parseFloat(kpi.value || kpi.amount || 0),
        allocated: parseFloat(kpi.target || kpi.value || 0),
        period: kpi.period,
        date_created: kpi.date_created,
        owner_company: kpi.owner_company
      }))
      return { source: 'dashboard_kpis', data: budgets }
    }
  } catch (err) {
    console.warn('dashboard_kpis fallback also unavailable:', err.message)
  }

  return { source: 'none', data: [] }
}

/**
 * Fetch expenses data. Primary: `expenses` collection.
 * Fallback: `bank_transactions` filtered by debit type, aggregated by month.
 */
const fetchExpensesForBudgets = async (company) => {
  const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}

  // Primary: fetch from `expenses` collection
  try {
    const res = await api.get('/items/expenses', {
      params: { filter, fields: ['category', 'amount', 'date', 'date_created'], limit: -1 }
    })
    const expenses = res.data?.data || []
    if (expenses.length > 0) return { source: 'expenses', data: expenses }
  } catch (err) {
    console.warn('expenses collection unavailable, trying bank_transactions fallback:', err.message)
  }

  // Fallback: fetch debit bank_transactions as expense proxy
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
        fields: ['id', 'amount', 'date', 'description', 'category', 'date_created'],
        sort: ['-date'],
        limit: 500
      }
    })
    const transactions = (res.data?.data || []).map(tx => ({
      ...tx,
      amount: Math.abs(parseFloat(tx.amount || 0)),
      category: tx.category || 'other'
    }))
    return { source: 'bank_transactions', data: transactions }
  } catch (err) {
    console.warn('bank_transactions fallback also failed:', err.message)
  }

  return { source: 'none', data: [] }
}

const BudgetsManager = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: budgetsResult, isLoading: budgetsLoading, error: budgetsError, refetch: refetchBudgets } = useQuery({
    queryKey: ['budgets', selectedCompany],
    queryFn: () => fetchBudgets(selectedCompany),
    staleTime: 1000 * 60 * 2
  })

  const { data: expensesResult, isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses-for-budgets', selectedCompany],
    queryFn: () => fetchExpensesForBudgets(selectedCompany),
    staleTime: 1000 * 60 * 2
  })

  const budgets = budgetsResult?.data || []
  const expenses = expensesResult?.data || []
  const isLoading = budgetsLoading || expensesLoading

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/items/budgets/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget supprime')
    },
    onError: () => toast.error('Erreur lors de la suppression')
  })

  // Enrich budgets with spent data from expenses
  const enrichedBudgets = budgets.map(b => {
    const categoryExpenses = expenses.filter(e => e.category === b.category)
    const spent = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
    const allocated = parseFloat(b.amount || b.allocated || 0)
    const remaining = allocated - spent
    const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
    let status = 'on-track'
    if (percentage > 100) status = 'over-budget'
    else if (percentage > 85) status = 'warning'

    return { ...b, allocated, spent, remaining, percentage, status }
  })

  const filteredBudgets = enrichedBudgets.filter(b => {
    const matchesCategory = filterCategory === 'all' || b.category === filterCategory
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus
    return matchesCategory && matchesStatus
  })

  // Category breakdown for pie chart
  const categoryBreakdown = Object.entries(CATEGORIES).map(([key, config]) => {
    const total = enrichedBudgets
      .filter(b => b.category === key)
      .reduce((sum, b) => sum + b.allocated, 0)
    return { name: config.label, value: total, color: config.color }
  }).filter(c => c.value > 0)

  // Monthly trend from expenses
  const monthlyTrend = (() => {
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const last6 = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthIdx = d.getMonth()
      const year = d.getFullYear()
      const monthExpenses = expenses.filter(e => {
        const ed = new Date(e.date || e.date_created)
        return ed.getMonth() === monthIdx && ed.getFullYear() === year
      })
      const actual = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
      const budget = enrichedBudgets.reduce((sum, b) => sum + (b.allocated / 12), 0)
      last6.push({ month: months[monthIdx], budget: Math.round(budget), actual: Math.round(actual) })
    }
    return last6
  })()

  // Stats
  const stats = {
    totalAllocated: enrichedBudgets.reduce((sum, b) => sum + b.allocated, 0),
    totalSpent: enrichedBudgets.reduce((sum, b) => sum + b.spent, 0),
    totalRemaining: enrichedBudgets.reduce((sum, b) => sum + b.remaining, 0),
    overBudgetCount: enrichedBudgets.filter(b => b.status === 'over-budget').length
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'on-track':
        return <span className="ds-badge ds-badge-success inline-flex items-center gap-1"><CheckCircle size={12} />En ligne</span>
      case 'warning':
        return <span className="ds-badge ds-badge-warning inline-flex items-center gap-1"><AlertTriangle size={12} />Attention</span>
      case 'over-budget':
        return <span className="ds-badge ds-badge-danger inline-flex items-center gap-1"><TrendingUp size={12} />Depasse</span>
      default:
        return <span className="ds-badge ds-badge-default inline-flex items-center gap-1">{status}</span>
    }
  }

  const getProgressStyle = (pct) => {
    if (pct > 100) return { backgroundColor: 'var(--semantic-red)' }
    if (pct > 85) return { backgroundColor: 'var(--semantic-orange)' }
    return { backgroundColor: 'var(--semantic-green)' }
  }

  // Error state
  if (budgetsError) {
    return (
      <div className="ds-card p-8 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--semantic-red)' }} />
        <h3 className="font-semibold mb-2" style={{ color: 'var(--label-1)' }}>Erreur de chargement</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--label-2)' }}>
          {budgetsError.message || 'Impossible de charger les budgets'}
        </p>
        <button
          onClick={() => refetchBudgets()}
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
      {/* Data source indicator (dev only) */}
      {budgetsResult?.source && budgetsResult.source !== 'budgets' && (
        <div className="ds-card p-3 flex items-center gap-2" style={{ borderLeft: '3px solid var(--semantic-orange)' }}>
          <AlertTriangle size={14} style={{ color: 'var(--semantic-orange)' }} />
          <span className="text-xs" style={{ color: 'var(--label-2)' }}>
            Donnees depuis <strong>{budgetsResult.source}</strong> (collection budgets vide ou indisponible)
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="ds-page-title flex items-center gap-2">
            <Wallet className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Gestion des Budgets
          </h2>
          <p className="ds-label mt-1">Suivi et allocation des budgets par departement</p>
        </div>
        <div className="flex gap-2">
          <button className="ds-btn ds-btn-secondary">
            <Download size={16} />Exporter
          </button>
          <button className="ds-btn ds-btn-primary">
            <Plus size={16} />Nouveau budget
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} style={{ color: 'var(--accent)' }} />
            <span className="ds-label">Budget total</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{formatCHF(stats.totalAllocated)}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} style={{ color: 'var(--semantic-orange)' }} />
            <span className="ds-label">Depense</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{formatCHF(stats.totalSpent)}</p>
          {stats.totalAllocated > 0 && (
            <p className="ds-meta mt-1">{((stats.totalSpent / stats.totalAllocated) * 100).toFixed(1)}% utilise</p>
          )}
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} style={{ color: 'var(--semantic-green)' }} />
            <span className="ds-label">Disponible</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{formatCHF(stats.totalRemaining)}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} style={{ color: 'var(--semantic-red)' }} />
            <span className="ds-label">Budgets depasses</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>{stats.overBudgetCount}</p>
          {stats.overBudgetCount > 0 && <p className="ds-meta mt-1" style={{ color: 'var(--semantic-red)' }}>Necessite attention</p>}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="ds-card p-5 lg:col-span-2">
          <h3 className="ds-nav-section mb-4">Budget vs Depenses reelles (6 mois)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCHF(v)} />
              <Legend />
              <Bar dataKey="budget" fill="var(--accent)" name="Budget" />
              <Bar dataKey="actual" fill="var(--semantic-green)" name="Reel" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="ds-card p-5">
          <h3 className="ds-nav-section mb-4">Repartition par categorie</h3>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCHF(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {categoryBreakdown.map(item => (
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
      <div className="flex gap-3">
        <select className="ds-input" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">Toutes categories</option>
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <select className="ds-input" style={{ width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tous statuts</option>
          <option value="on-track">En ligne</option>
          <option value="warning">Attention</option>
          <option value="over-budget">Depasse</option>
        </select>
      </div>

      {/* Budgets Table */}
      <div className="ds-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sep)' }}>
                <th className="text-left p-4 ds-nav-section">Budget</th>
                <th className="text-left p-4 ds-nav-section">Categorie</th>
                <th className="text-left p-4 ds-nav-section">Alloue</th>
                <th className="text-left p-4 ds-nav-section">Depense</th>
                <th className="text-left p-4 ds-nav-section">Progression</th>
                <th className="text-left p-4 ds-nav-section">Statut</th>
                <th className="text-right p-4 ds-nav-section">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgets.map(budget => (
                <tr key={budget.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium" style={{ color: 'var(--label-1)' }}>{budget.name || budget.category}</td>
                  <td className="p-4">
                    <span className="ds-badge ds-badge-info">
                      {CATEGORIES[budget.category]?.label || budget.category}
                    </span>
                  </td>
                  <td className="p-4" style={{ color: 'var(--label-2)' }}>{formatCHF(budget.allocated)}</td>
                  <td className="p-4" style={{ color: 'var(--label-2)' }}>{formatCHF(budget.spent)}</td>
                  <td className="p-4" style={{ width: 160 }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(budget.percentage, 100)}%`, ...getProgressStyle(budget.percentage) }} />
                      </div>
                      <span className="ds-meta w-8">{budget.percentage}%</span>
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(budget.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--accent)' }} title="Modifier">
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: 'var(--semantic-red)' }}
                        onClick={() => { if (window.confirm('Supprimer ce budget?')) deleteMutation.mutate(budget.id) }}
                        title="Supprimer"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBudgets.length === 0 && (
          <div className="text-center py-12">
            <Wallet size={48} className="mx-auto mb-3 opacity-30" />
            <p className="ds-label">Aucun budget trouve</p>
            <p className="ds-meta mt-1">Creez un budget ou verifiez les filtres</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetsManager
