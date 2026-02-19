/**
 * BudgetsManager — Connected to Directus `budgets` collection
 * Manages budget allocation and tracking per department.
 */
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Wallet, Plus, Edit2, Trash2, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Filter, Download, Calendar, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

const CATEGORIES = {
  marketing: { label: 'Marketing', color: '#3b82f6' },
  it: { label: 'IT', color: '#10b981' },
  hr: { label: 'RH', color: '#f59e0b' },
  operations: { label: 'Operations', color: '#ef4444' },
  rd: { label: 'R&D', color: '#8b5cf6' },
  other: { label: 'Autre', color: '#6b7280' }
}

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount)

const fetchBudgets = async (company) => {
  try {
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
    const res = await api.get('/items/budgets', {
      params: { filter, fields: ['*'], sort: ['-date_created'], limit: -1 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const fetchExpensesForBudgets = async (company) => {
  try {
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
    const res = await api.get('/items/expenses', {
      params: { filter, fields: ['category', 'amount', 'date', 'date_created'], limit: -1 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const BudgetsManager = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', selectedCompany],
    queryFn: () => fetchBudgets(selectedCompany),
    staleTime: 1000 * 60 * 2
  })

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses-for-budgets', selectedCompany],
    queryFn: () => fetchExpensesForBudgets(selectedCompany),
    staleTime: 1000 * 60 * 2
  })

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
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} />En ligne</span>
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><AlertTriangle size={12} />Attention</span>
      case 'over-budget':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><TrendingUp size={12} />Depasse</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>
    }
  }

  const getProgressColor = (pct) => {
    if (pct > 100) return 'bg-red-500'
    if (pct > 85) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="glass-card p-6"><div className="h-12 glass-skeleton rounded-lg" /></div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="glass-card p-6"><div className="h-20 glass-skeleton rounded-lg" /></div>)}
        </div>
        <div className="glass-card p-6"><div className="h-64 glass-skeleton rounded-lg" /></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            Gestion des Budgets
          </h2>
          <p className="text-sm text-gray-500 mt-1">Suivi et allocation des budgets par departement</p>
        </div>
        <div className="flex gap-2">
          <button className="glass-button text-gray-600"><Download size={16} className="mr-1" />Exporter</button>
          <button className="glass-button bg-blue-600 text-white hover:bg-blue-700"><Plus size={16} className="mr-1" />Nouveau budget</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={18} className="text-blue-600" />
            <span className="text-sm text-gray-500">Budget total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(stats.totalAllocated)}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-yellow-600" />
            <span className="text-sm text-gray-500">Depense</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(stats.totalSpent)}</p>
          {stats.totalAllocated > 0 && (
            <p className="text-xs text-gray-500 mt-1">{((stats.totalSpent / stats.totalAllocated) * 100).toFixed(1)}% utilise</p>
          )}
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-sm text-gray-500">Disponible</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(stats.totalRemaining)}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-600" />
            <span className="text-sm text-gray-500">Budgets depasses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.overBudgetCount}</p>
          {stats.overBudgetCount > 0 && <p className="text-xs text-red-500 mt-1">Necessite attention</p>}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Budget vs Depenses reelles (6 mois)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCHF(v)} />
              <Legend />
              <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
              <Bar dataKey="actual" fill="#10b981" name="Reel" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Repartition par categorie</h3>
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
                    <span className="text-xs text-gray-500">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Aucune donnee</div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select className="glass-button text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">Toutes categories</option>
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <select className="glass-button text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tous statuts</option>
          <option value="on-track">En ligne</option>
          <option value="warning">Attention</option>
          <option value="over-budget">Depasse</option>
        </select>
      </div>

      {/* Budgets Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Budget</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Categorie</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Alloue</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Depense</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Progression</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgets.map(budget => (
                <tr key={budget.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{budget.name || budget.category}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {CATEGORIES[budget.category]?.label || budget.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{formatCHF(budget.allocated)}</td>
                  <td className="p-4 text-gray-700">{formatCHF(budget.spent)}</td>
                  <td className="p-4" style={{ width: 160 }}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getProgressColor(budget.percentage)}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{budget.percentage}%</span>
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(budget.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Modifier">
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
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
          <div className="text-center py-12 text-gray-400">
            <Wallet size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucun budget trouve</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetsManager
