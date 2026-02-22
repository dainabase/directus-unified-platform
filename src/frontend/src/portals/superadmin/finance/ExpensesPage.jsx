/**
 * ExpensesPage — Full-page expense management (Story 3.7)
 * Collection Directus: `expenses`
 *
 * Enhanced wrapper over ExpensesTracker with:
 * - Server-side paginated table (20/page)
 * - Create expense modal with TVA calculation
 * - KPI cards (month, year, pending, budget remaining)
 * - PieChart by category + BarChart monthly evolution
 * - Approve / Reject / CSV export actions
 * - Search + category + status filters
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, Plus, Search, Download, X, Loader2,
  CheckCircle, Clock, XCircle, Calendar, DollarSign,
  TrendingUp, Wallet, MoreHorizontal, Eye, Trash2, Ban
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import api from '../../../lib/axios'

// ── Constants ──

const PAGE_SIZE = 20

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

const STATUS_CONFIG = {
  pending:  { label: 'En attente', color: 'bg-amber-50 text-amber-700',   icon: Clock },
  approved: { label: 'Approuvee',  color: 'bg-green-50 text-green-700',   icon: CheckCircle },
  rejected: { label: 'Refusee',    color: 'bg-red-50 text-red-700',       icon: XCircle },
  paid:     { label: 'Payee',      color: 'bg-zinc-50 text-zinc-700',     icon: DollarSign }
}

const TVA_RATES = [
  { value: '8.1', label: '8.1% — Taux normal' },
  { value: '2.6', label: '2.6% — Taux reduit' },
  { value: '3.8', label: '3.8% — Hebergement' },
  { value: '0',   label: '0% — Exonere' }
]

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec']

// ── Formatters ──

const formatCHF = (value) => {
  const num = parseFloat(value)
  if (isNaN(num)) return 'CHF 0.00'
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2
  }).format(num)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ── StatusBadge ──

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  )
}

// ── Data fetching ──

async function fetchExpenses({ company, page, filters }) {
  const filter = {}
  if (company && company !== 'all') filter.owner_company = { _eq: company }
  if (filters.status !== 'all') filter.status = { _eq: filters.status }
  if (filters.category !== 'all') filter.category = { _eq: filters.category }
  if (filters.search) {
    filter._or = [
      { description: { _contains: filters.search } },
      { vendor: { _contains: filters.search } }
    ]
  }

  const { data } = await api.get('/items/expenses', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      fields: ['*'],
      sort: ['-date_created'],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      meta: 'total_count'
    }
  }).catch(() => ({ data: { data: [], meta: { total_count: 0 } } }))

  return { items: data?.data || [], total: data?.meta?.total_count || 0 }
}

async function fetchAllExpenses(company) {
  const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
  const { data } = await api.get('/items/expenses', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      fields: ['id', 'amount', 'vat_rate', 'category', 'status', 'date', 'date_created'],
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Skeleton rows ──

const SkeletonRows = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-20 rounded" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-32 rounded" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-16 rounded" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-20 rounded" /></td>
        <td className="px-4 py-3 text-right"><div className="ds-skeleton h-3 w-20 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-right"><div className="ds-skeleton h-3 w-14 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-right"><div className="ds-skeleton h-3 w-20 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-center"><div className="ds-skeleton h-5 w-20 rounded-full mx-auto" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-8 rounded mx-auto" /></td>
      </tr>
    ))}
  </>
)

// ── Create Expense Modal ──

const CreateExpenseModal = ({ onClose, selectedCompany }) => {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    vat_rate: '8.1',
    receipt_file: null
  })

  const amountHT = parseFloat(formData.amount) || 0
  const vatRate = parseFloat(formData.vat_rate) || 0
  const vatAmount = amountHT * vatRate / 100
  const totalTTC = amountHT + vatAmount

  const handleField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        description: formData.description,
        amount: amountHT,
        category: formData.category,
        date: formData.date || new Date().toISOString().split('T')[0],
        vendor: formData.vendor,
        vat_rate: vatRate,
        total_ttc: totalTTC,
        status: 'pending',
        owner_company: selectedCompany && selectedCompany !== 'all' ? selectedCompany : undefined
      }
      return api.post('/items/expenses', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['expenses-all'] })
      onClose()
    }
  })

  const canSave = formData.description && formData.amount && parseFloat(formData.amount) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nouvelle depense</h2>
            <p className="text-sm text-gray-500 mt-0.5">Ajouter une note de frais au systeme</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleField('description', e.target.value)}
                className="ds-input"
                placeholder="Description de la depense"
              />
            </div>

            {/* Montant HT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant HT (CHF) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleField('amount', e.target.value)}
                className="ds-input"
                placeholder="0.00"
              />
            </div>

            {/* Categorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select
                value={formData.category}
                onChange={(e) => handleField('category', e.target.value)}
                className="ds-input"
              >
                {Object.entries(CATEGORIES).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleField('date', e.target.value)}
                className="ds-input"
              />
            </div>

            {/* Fournisseur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => handleField('vendor', e.target.value)}
                className="ds-input"
                placeholder="Nom du fournisseur"
              />
            </div>

            {/* TVA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux TVA</label>
              <select
                value={formData.vat_rate}
                onChange={(e) => handleField('vat_rate', e.target.value)}
                className="ds-input"
              >
                {TVA_RATES.map((rate) => (
                  <option key={rate.value} value={rate.value}>{rate.label}</option>
                ))}
              </select>
            </div>

            {/* Justificatif placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Justificatif</label>
              <div className="ds-input flex items-center justify-center text-gray-400 text-sm cursor-not-allowed opacity-60">
                Upload bientot disponible
              </div>
            </div>
          </div>

          {/* TVA calculation summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Montant HT</span>
              <span className="font-medium text-gray-900">{formatCHF(amountHT)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">TVA {formData.vat_rate}%</span>
              <span className="text-gray-700">{formatCHF(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total TTC</span>
              <span className="font-bold text-[var(--accent-hover)]">{formatCHF(totalTTC)}</span>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button type="button" onClick={onClose} className="ds-btn ds-btn-ghost">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!canSave || saveMutation.isPending}
            className="ds-btn ds-btn-primary"
          >
            {saveMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Creer la depense
          </button>
        </div>

        {saveMutation.isError && (
          <div className="px-6 pb-4">
            <p className="text-xs text-red-600">
              Erreur : {saveMutation.error?.message || 'Impossible de creer la depense'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Actions Dropdown ──

const ActionsDropdown = ({ expense, onApprove, onReject, onView, onDelete }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const items = []

  items.push({ label: 'Voir', icon: Eye, action: () => onView(expense), color: 'text-gray-600' })

  if (expense.status === 'pending') {
    items.push({
      label: 'Approuver',
      icon: CheckCircle,
      action: () => onApprove(expense.id),
      color: 'text-green-600'
    })
    items.push({
      label: 'Refuser',
      icon: Ban,
      action: () => onReject(expense.id),
      color: 'text-red-600'
    })
  }

  if (['pending', 'rejected'].includes(expense.status)) {
    items.push({
      label: 'Supprimer',
      icon: Trash2,
      action: () => onDelete(expense.id),
      color: 'text-red-600'
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={i}
                onClick={() => { item.action(); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <Icon size={14} className={item.color} />
                <span className={item.color}>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Detail Modal ──

const DetailModal = ({ expense, onClose }) => {
  if (!expense) return null

  const amt = parseFloat(expense.amount) || 0
  const rate = parseFloat(expense.vat_rate) || 0
  const vat = amt * rate / 100
  const ttc = expense.total_ttc ? parseFloat(expense.total_ttc) : amt + vat

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {expense.description || 'Depense sans description'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{expense.vendor || '--'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <StatusBadge status={expense.status} />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{formatDate(expense.date || expense.date_created)}</p>
            </div>
            <div>
              <p className="text-gray-500">Categorie</p>
              <span
                className="inline-flex items-center gap-1.5 mt-0.5"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORIES[expense.category]?.color || '#6b7280' }}
                />
                <span className="font-medium text-gray-900">
                  {CATEGORIES[expense.category]?.label || expense.category || '--'}
                </span>
              </span>
            </div>
            <div>
              <p className="text-gray-500">Montant HT</p>
              <p className="font-medium text-gray-900">{formatCHF(amt)}</p>
            </div>
            <div>
              <p className="text-gray-500">TVA ({rate}%)</p>
              <p className="font-medium text-gray-900">{formatCHF(vat)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Total TTC</p>
              <p className="text-lg font-bold text-[var(--accent-hover)]">{formatCHF(ttc)}</p>
            </div>
            {expense.vendor && (
              <div className="col-span-2">
                <p className="text-gray-500">Fournisseur</p>
                <p className="font-medium text-gray-900">{expense.vendor}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CSV Export ──

function exportCSV(expenses) {
  const headers = ['Date', 'Description', 'Categorie', 'Fournisseur', 'Montant HT', 'TVA %', 'Total TTC', 'Statut']
  const rows = expenses.map((e) => {
    const amt = parseFloat(e.amount) || 0
    const rate = parseFloat(e.vat_rate) || 0
    const ttc = e.total_ttc ? parseFloat(e.total_ttc) : amt + (amt * rate / 100)
    return [
      formatDate(e.date || e.date_created),
      `"${(e.description || '').replace(/"/g, '""')}"`,
      CATEGORIES[e.category]?.label || e.category || '',
      `"${(e.vendor || '').replace(/"/g, '""')}"`,
      amt.toFixed(2),
      rate,
      ttc.toFixed(2),
      STATUS_CONFIG[e.status]?.label || e.status || ''
    ].join(';')
  })

  const csv = [headers.join(';'), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `depenses_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Main Page Component ──

const ExpensesPage = ({ selectedCompany }) => {
  const qc = useQueryClient()

  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ status: 'all', category: 'all', search: '' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewExpense, setViewExpense] = useState(null)

  const company = selectedCompany === 'all' ? '' : selectedCompany

  // Reset page when filters change
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  // Fetch paginated expenses for table
  const { data, isLoading } = useQuery({
    queryKey: ['expenses', company, page, filters],
    queryFn: () => fetchExpenses({ company, page, filters }),
    staleTime: 15_000
  })

  const expenses = data?.items || []
  const totalCount = data?.total || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Fetch ALL expenses for KPIs and charts (lightweight fields only)
  const { data: allExpenses = [] } = useQuery({
    queryKey: ['expenses-all', company],
    queryFn: () => fetchAllExpenses(company),
    staleTime: 30_000
  })

  // ── KPIs ──

  const kpis = (() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const thisMonth = allExpenses.filter((e) => {
      const d = new Date(e.date || e.date_created)
      return d >= startOfMonth
    })
    const thisYear = allExpenses.filter((e) => {
      const d = new Date(e.date || e.date_created)
      return d >= startOfYear
    })
    const pending = allExpenses.filter((e) => e.status === 'pending')

    return {
      monthTotal: thisMonth.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
      yearTotal: thisYear.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
      pendingAmount: pending.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0),
      pendingCount: pending.length,
      monthCount: thisMonth.length,
      yearCount: thisYear.length
    }
  })()

  // ── Charts data ──

  // Category breakdown for PieChart
  const categoryBreakdown = Object.entries(CATEGORIES).map(([key, cfg]) => {
    const total = allExpenses
      .filter((e) => e.category === key)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    return { name: cfg.label, value: total, color: cfg.color }
  }).filter((c) => c.value > 0)

  // Monthly expenses (last 6 months) for BarChart
  const monthlyExpenses = (() => {
    const now = new Date()
    const last6 = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthIdx = d.getMonth()
      const year = d.getFullYear()
      const monthExp = allExpenses.filter((e) => {
        const ed = new Date(e.date || e.date_created)
        return ed.getMonth() === monthIdx && ed.getFullYear() === year
      })
      last6.push({
        month: `${MONTH_NAMES[monthIdx]} ${String(year).slice(2)}`,
        amount: Math.round(monthExp.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0))
      })
    }
    return last6
  })()

  // ── Mutations ──

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/items/expenses/${id}`, { status: 'approved' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-all'] })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/items/expenses/${id}`, { status: 'rejected' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-all'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/items/expenses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['expenses-all'] })
    }
  })

  // ── Handlers ──

  const handleApprove = (id) => {
    if (window.confirm('Approuver cette depense ?')) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (id) => {
    if (window.confirm('Refuser cette depense ?')) {
      rejectMutation.mutate(id)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer definitivement cette depense ?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleExportCSV = () => {
    exportCSV(allExpenses)
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
          <h2 className="text-xl font-bold text-gray-900">Gestion des Depenses</h2>
          <p className="text-sm text-gray-500 mt-1">
            Suivi, validation et analyse des notes de frais — {totalCount} depense{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="ds-btn ds-btn-ghost"
          >
            <Download size={16} />
            Exporter CSV
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="ds-btn ds-btn-primary"
          >
            <Plus size={16} />
            Nouvelle depense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Month total */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-zinc-50">
              <Calendar size={16} className="text-zinc-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Depenses ce mois</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(kpis.monthTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.monthCount} depense{kpis.monthCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Year total */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-green-50">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Depenses annee</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(kpis.yearTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.yearCount} depense{kpis.yearCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Pending approval */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock size={16} className="text-amber-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">En attente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(kpis.pendingAmount)}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.pendingCount} a approuver</p>
        </div>

        {/* Budget remaining */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-zinc-50">
              <Wallet size={16} className="text-zinc-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Budget restant</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-400 mt-1">Non configure</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* BarChart: Monthly evolution */}
        <div className="ds-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Evolution mensuelle (6 mois)
          </h3>
          {monthlyExpenses.some((m) => m.amount > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCHF(v)} />
                <Bar dataKey="amount" fill="var(--accent-hover)" name="Depenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
              Aucune donnee sur les 6 derniers mois
            </div>
          )}
        </div>

        {/* PieChart: Category breakdown */}
        <div className="ds-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Repartition par categorie
          </h3>
          {categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCHF(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {categoryBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-500">{item.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[230px] text-gray-400 text-sm">
              Aucune donnee
            </div>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher description ou fournisseur..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="ds-input !pl-9"
          />
        </div>

        {/* Category filter */}
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="ds-input w-auto"
        >
          <option value="all">Toutes categories</option>
          {Object.entries(CATEGORIES).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="ds-input w-auto"
        >
          <option value="all">Tous statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvee</option>
          <option value="rejected">Refusee</option>
          <option value="paid">Payee</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="ds-card overflow-hidden" style={{ transition: 'none' }}>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Categorie</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">Total TTC</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <SkeletonRows />
              </tbody>
            </table>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-500">Aucune depense trouvee</p>
            <p className="text-sm mt-1">
              {filters.status !== 'all' || filters.category !== 'all' || filters.search
                ? 'Aucun resultat pour ces filtres. Essayez de modifier vos criteres.'
                : 'Les depenses apparaitront ici une fois ajoutees.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="ds-btn ds-btn-primary mt-4"
            >
              <Plus size={14} />
              Ajouter une depense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Categorie</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">Total TTC</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((expense) => {
                  const amt = parseFloat(expense.amount) || 0
                  const rate = parseFloat(expense.vat_rate) || 0
                  const vat = amt * rate / 100
                  const ttc = expense.total_ttc ? parseFloat(expense.total_ttc) : amt + vat

                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(expense.date || expense.date_created)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 max-w-[200px] truncate block">
                          {expense.description || '--'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: CATEGORIES[expense.category]?.color || '#6b7280' }}
                          />
                          <span className="text-gray-600 text-xs">
                            {CATEGORIES[expense.category]?.label || expense.category || '--'}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                        {expense.vendor || '--'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                        {formatCHF(amt)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                        {formatCHF(vat)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatCHF(ttc)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={expense.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <ActionsDropdown
                            expense={expense}
                            onView={setViewExpense}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDelete}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {page} sur {totalPages} — {totalCount} resultat{totalCount !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="ds-btn ds-btn-ghost disabled:opacity-40"
              >
                Precedent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="ds-btn ds-btn-ghost disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateExpenseModal
          onClose={() => setShowCreateModal(false)}
          selectedCompany={selectedCompany}
        />
      )}

      {/* Detail Modal */}
      {viewExpense && (
        <DetailModal
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
        />
      )}
    </div>
  )
}

export default ExpensesPage
