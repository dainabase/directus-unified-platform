/**
 * AccountingDashboard Component
 * Tableau de bord comptable connecte a la collection Directus `accounting_entries`.
 * Affiche KPIs, graphiques mensuels debit/credit, repartition par compte, et table des ecritures.
 */

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
  AlertCircle,
  Inbox
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Formatting helpers ──

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount)

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

const shortMonth = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-CH', { month: 'short', year: '2-digit' })

// ── Status & type config ──

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-700' },
  pending: { label: 'En attente', bg: 'bg-amber-100', text: 'text-amber-700' },
  validated: { label: 'Valide', bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { label: 'Annule', bg: 'bg-red-100', text: 'text-red-700' }
}

const TYPE_CONFIG = {
  debit: { label: 'Debit', bg: 'bg-red-100', text: 'text-red-700' },
  credit: { label: 'Credit', bg: 'bg-green-100', text: 'text-green-700' }
}

const PIE_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'
]

// ── Data fetcher ──

const fetchAccountingEntries = async (company) => {
  const filter = company && company !== 'all'
    ? { owner_company: { _eq: company } }
    : {}

  const { data } = await api.get('/items/accounting_entries', {
    params: {
      filter,
      sort: ['-date_created'],
      limit: -1,
      fields: ['id', 'entry_number', 'description', 'amount', 'type', 'account_code', 'owner_company', 'date_created', 'status']
    }
  })

  return data?.data || []
}

// ── Compute helpers ──

function computeKPIs(entries) {
  const totalEntries = entries.length
  const totalDebits = entries
    .filter((e) => e.type === 'debit')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  const totalCredits = entries
    .filter((e) => e.type === 'credit')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
  const balance = totalCredits - totalDebits

  return { totalEntries, totalDebits, totalCredits, balance }
}

function computeMonthlyData(entries) {
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const buckets = {}
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = { month: shortMonth(d.toISOString()), debit: 0, credit: 0 }
  }

  entries.forEach((e) => {
    if (!e.date_created) return
    const d = new Date(e.date_created)
    if (d < sixMonthsAgo) return
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!buckets[key]) return
    const amount = parseFloat(e.amount || 0)
    if (e.type === 'debit') buckets[key].debit += amount
    else if (e.type === 'credit') buckets[key].credit += amount
  })

  return Object.values(buckets)
}

function computeAccountDistribution(entries) {
  const map = {}
  entries.forEach((e) => {
    const code = e.account_code || 'N/A'
    if (!map[code]) map[code] = 0
    map[code] += parseFloat(e.amount || 0)
  })

  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

// ── Sub-components ──

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 h-28 glass-skeleton" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-80 glass-skeleton" />
        <div className="glass-card p-6 h-80 glass-skeleton" />
      </div>
      <div className="glass-card p-6 h-64 glass-skeleton" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
      <Inbox className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune ecriture comptable</h3>
      <p className="text-sm text-gray-500 max-w-md">
        Il n'y a pas encore d'ecritures comptables pour cette entreprise.
        Les ecritures apparaitront ici une fois creees dans Directus.
      </p>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, formatted, color }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {formatted !== undefined ? formatted : value}
      </p>
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color }} className="mb-0">
          {entry.name}: {formatCHF(entry.value)}
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700">{name}</p>
      <p className="text-gray-600">{formatCHF(value)}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.debit
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

// ── Main component ──

function AccountingDashboard({ selectedCompany }) {
  const company = selectedCompany === 'all' ? '' : selectedCompany

  const { data: entries, isLoading, error, refetch } = useQuery({
    queryKey: ['accounting-entries', company],
    queryFn: () => fetchAccountingEntries(company),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  const kpis = useMemo(() => (entries ? computeKPIs(entries) : null), [entries])
  const monthlyData = useMemo(() => (entries ? computeMonthlyData(entries) : []), [entries])
  const accountData = useMemo(() => (entries ? computeAccountDistribution(entries) : []), [entries])
  const recentEntries = useMemo(() => (entries ? entries.slice(0, 15) : []), [entries])

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 mb-2">Erreur de chargement</h3>
        <p className="text-sm text-red-600 mb-4">
          {error.message || 'Impossible de charger les ecritures comptables'}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
        >
          <RefreshCw size={14} /> Reessayer
        </button>
      </div>
    )
  }

  // ── Loading state ──
  if (isLoading && !entries) {
    return <SkeletonLoader />
  }

  // ── Empty state ──
  if (!entries || entries.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardHeader isLoading={isLoading} onRefresh={refetch} />
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader isLoading={isLoading} onRefresh={refetch} />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={BookOpen}
          label="Total ecritures"
          formatted={kpis.totalEntries.toLocaleString('fr-CH')}
          color="bg-blue-600"
        />
        <KPICard
          icon={TrendingDown}
          label="Total debits"
          formatted={formatCHF(kpis.totalDebits)}
          color="bg-red-500"
        />
        <KPICard
          icon={TrendingUp}
          label="Total credits"
          formatted={formatCHF(kpis.totalCredits)}
          color="bg-green-500"
        />
        <KPICard
          icon={Scale}
          label="Solde"
          formatted={formatCHF(kpis.balance)}
          color={kpis.balance >= 0 ? 'bg-emerald-600' : 'bg-red-600'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly debit vs credit */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Debits vs Credits (6 derniers mois)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                width={55}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="debit" name="Debits" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="credit" name="Credits" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart by account_code */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Repartition par compte</h3>
          {accountData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={accountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#9ca3af' }}
                >
                  {accountData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              Aucune donnee
            </div>
          )}
        </div>
      </div>

      {/* Recent entries table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50">
          <h3 className="text-sm font-semibold text-gray-700">Ecritures recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">N</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Montant</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Compte</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-600">{entry.entry_number}</td>
                  <td className="px-4 py-3 text-gray-800 truncate max-w-[220px]">{entry.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCHF(parseFloat(entry.amount || 0))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <TypeBadge type={entry.type} />
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{entry.account_code}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(entry.date_created)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={entry.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DashboardHeader({ isLoading, onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
        <h2 className="text-xl font-bold text-gray-900">Comptabilite</h2>
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        Actualiser
      </button>
    </div>
  )
}

export default AccountingDashboard
