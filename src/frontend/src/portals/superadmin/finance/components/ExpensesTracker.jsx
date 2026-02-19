/**
 * ExpensesTracker — Connected to Directus `expenses` collection
 * Expense management and approval workflow.
 */
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, Plus, Edit2, Trash2, Search, Download,
  CheckCircle, Clock, XCircle, Eye, Calendar, User, Loader2
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

const CATEGORIES = {
  software: { label: 'Logiciels', color: '#3b82f6' },
  travel: { label: 'Deplacements', color: '#10b981' },
  training: { label: 'Formation', color: '#f59e0b' },
  office: { label: 'Bureau', color: '#6366f1' },
  meals: { label: 'Repas', color: '#8b5cf6' },
  infrastructure: { label: 'Infrastructure', color: '#ef4444' },
  marketing: { label: 'Marketing', color: '#06b6d4' },
  other: { label: 'Autre', color: '#6b7280' }
}

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-CH')
}

const fetchExpenses = async (company) => {
  try {
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
    const res = await api.get('/items/expenses', {
      params: { filter, fields: ['*'], sort: ['-date_created'], limit: -1 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const ExpensesTracker = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', selectedCompany],
    queryFn: () => fetchExpenses(selectedCompany),
    staleTime: 1000 * 60 * 2
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await api.patch(`/items/expenses/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/items/expenses/${id}`)
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
    updateMutation.mutate({ id, data: { status: 'approved' } }, {
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
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle size={12} />Approuve</span>
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock size={12} />En attente</span>
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle size={12} />Refuse</span>
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status || 'N/A'}</span>
    }
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
            <Receipt className="w-6 h-6 text-blue-600" />
            Suivi des Depenses
          </h2>
          <p className="text-sm text-gray-500 mt-1">Gestion et validation des notes de frais</p>
        </div>
        <div className="flex gap-2">
          <button className="glass-button text-gray-600"><Download size={16} className="mr-1" />Exporter</button>
          <button className="glass-button bg-blue-600 text-white hover:bg-blue-700"><Plus size={16} className="mr-1" />Nouvelle depense</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={18} className="text-blue-600" />
            <span className="text-sm text-gray-500">Total depenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(stats.total)}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-sm text-gray-500">Approuvees</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(stats.approved)}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-yellow-600" />
            <span className="text-sm text-gray-500">En attente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(stats.pending)}</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-yellow-600" />
            <span className="text-sm text-gray-500">A approuver</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
          {stats.pendingCount > 0 && <p className="text-xs text-yellow-600 mt-1">Necessite validation</p>}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Depenses mensuelles (6 mois)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCHF(v)} />
              <Bar dataKey="amount" fill="#3b82f6" name="Depenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Par categorie</h3>
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
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="glass-button text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">Toutes categories</option>
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <select className="glass-button text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tous statuts</option>
          <option value="approved">Approuve</option>
          <option value="pending">En attente</option>
          <option value="rejected">Refuse</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Categorie</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-gray-900">{expense.description || expense.name || '-'}</span>
                    {expense.vendor && <span className="block text-xs text-gray-400">{expense.vendor}</span>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {CATEGORIES[expense.category]?.label || expense.category || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(expense.date || expense.date_created)}</span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{formatCHF(expense.amount || 0)}</td>
                  <td className="p-4">{getStatusBadge(expense.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {expense.status === 'pending' && (
                        <>
                          <button
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            onClick={() => handleApprove(expense.id)}
                            title="Approuver"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            onClick={() => handleReject(expense.id)}
                            title="Refuser"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
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
          <div className="text-center py-12 text-gray-400">
            <Receipt size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucune depense trouvee</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpensesTracker
