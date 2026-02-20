import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../../lib/axios'
import {
  DollarSign, Clock, Users, TrendingUp,
  AlertCircle, RefreshCw, Loader2, FileText, Inbox
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'

const STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#10b981',
  overdue: '#ef4444',
  cancelled: '#6b7280',
  partial: '#3b82f6',
  draft: '#a78bfa'
}

const AGING_BRACKETS = [
  { key: '0-30', label: '0-30j', min: 0, max: 30, color: '#10b981' },
  { key: '31-60', label: '31-60j', min: 31, max: 60, color: '#f59e0b' },
  { key: '61-90', label: '61-90j', min: 61, max: 90, color: '#f97316' },
  { key: '90+', label: '90+j', min: 91, max: Infinity, color: '#ef4444' }
]

const PIE_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#6b7280', '#3b82f6', '#a78bfa']

function daysSince(dateStr) {
  if (!dateStr) return 0
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

function parseAmount(val) {
  const n = parseFloat(val)
  return isNaN(n) ? 0 : n
}

function formatCHF(amount) {
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(amount)
}

function fetchInvoices(ownerCompany) {
  const filter = ownerCompany && ownerCompany !== 'all'
    ? { owner_company: { _eq: ownerCompany } }
    : {}
  return api.get('/items/client_invoices', {
    params: {
      filter: JSON.stringify(filter),
      fields: 'id,invoice_number,client_name,amount,status,date_created',
      limit: -1,
      sort: '-date_created'
    }
  }).then(res => res.data?.data ?? [])
}

// ── Skeleton loader ──
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded ${className}`} />
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="ds-card p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="ds-card p-6 space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

// ── Empty state ──
function EmptyState() {
  return (
    <div className="ds-card p-12 text-center">
      <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune facture</h3>
      <p className="text-sm text-gray-500">
        Aucune facture client trouvee pour cette entreprise.
      </p>
    </div>
  )
}

// ── Main component ──
const CollectionDashboard = ({ selectedCompany }) => {
  const company = selectedCompany === 'all' ? '' : selectedCompany

  const {
    data: invoices,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['collection-invoices', company],
    queryFn: () => fetchInvoices(company),
    staleTime: 60_000,
    refetchOnWindowFocus: false
  })

  // ── Computed data ──
  const computed = useMemo(() => {
    if (!invoices || invoices.length === 0) return null

    const now = Date.now()
    const thirtyDaysMs = 30 * 86400000

    // All pending invoices
    const pending = invoices.filter(inv => inv.status === 'pending')
    // Overdue = pending AND older than 30 days
    const overdue = pending.filter(inv => {
      const created = new Date(inv.date_created).getTime()
      return (now - created) > thirtyDaysMs
    })

    const totalOverdue = overdue.reduce((s, inv) => s + parseAmount(inv.amount), 0)
    const overdueCount = overdue.length

    const ages = overdue.map(inv => daysSince(inv.date_created))
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0

    // Recovery rate: paid / (paid + pending)
    const paidInvoices = invoices.filter(inv => inv.status === 'paid')
    const totalPaid = paidInvoices.reduce((s, inv) => s + parseAmount(inv.amount), 0)
    const totalPending = pending.reduce((s, inv) => s + parseAmount(inv.amount), 0)
    const recoveryRate = (totalPaid + totalPending) > 0
      ? Math.round((totalPaid / (totalPaid + totalPending)) * 100)
      : 0

    // Aging brackets (only overdue)
    const agingData = AGING_BRACKETS.map(bracket => {
      const matches = overdue.filter(inv => {
        const d = daysSince(inv.date_created)
        return d >= bracket.min && d <= bracket.max
      })
      return {
        name: bracket.label,
        count: matches.length,
        amount: matches.reduce((s, inv) => s + parseAmount(inv.amount), 0),
        color: bracket.color
      }
    })

    // Top 10 debtors (by sum of pending amounts)
    const debtorMap = {}
    pending.forEach(inv => {
      const name = inv.client_name || 'Inconnu'
      if (!debtorMap[name]) {
        debtorMap[name] = { client_name: name, total: 0, count: 0, oldest: inv.date_created }
      }
      debtorMap[name].total += parseAmount(inv.amount)
      debtorMap[name].count += 1
      if (inv.date_created && inv.date_created < debtorMap[name].oldest) {
        debtorMap[name].oldest = inv.date_created
      }
    })
    const topDebtors = Object.values(debtorMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)

    // Status distribution
    const statusMap = {}
    invoices.forEach(inv => {
      const s = inv.status || 'unknown'
      statusMap[s] = (statusMap[s] || 0) + 1
    })
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

    return {
      totalOverdue,
      overdueCount,
      avgAge,
      recoveryRate,
      totalPaid,
      agingData,
      topDebtors,
      statusData,
      totalInvoices: invoices.length
    }
  }, [invoices])

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 mb-2">Erreur de chargement</h3>
        <p className="text-sm text-red-600 mb-4">{error.message || 'Impossible de charger les donnees de recouvrement'}</p>
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
  if (isLoading && !invoices) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Recouvrement</p>
            <h2 className="text-xl font-bold text-gray-900">Module Collection</h2>
          </div>
        </div>
        <KPISkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  // ── Empty state ──
  if (!invoices || invoices.length === 0 || !computed) {
    return (
      <div className="space-y-6">
        <DashboardHeader isLoading={isLoading} onRefresh={refetch} />
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="space-y-6 ">
      <DashboardHeader isLoading={isLoading} onRefresh={refetch} />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={DollarSign}
          label="Montant en souffrance"
          value={formatCHF(computed.totalOverdue)}
          sub={`${computed.overdueCount} facture${computed.overdueCount > 1 ? 's' : ''} en retard`}
          color="text-red-600"
          bg="ds-card border-red-200"
        />
        <KPICard
          icon={FileText}
          label="Factures en retard"
          value={computed.overdueCount}
          sub={`sur ${computed.totalInvoices} factures totales`}
          color="text-amber-600"
          bg="ds-card border-amber-200"
        />
        <KPICard
          icon={Clock}
          label="Age moyen"
          value={`${computed.avgAge}j`}
          sub="des factures en souffrance"
          color="text-zinc-900"
          bg="ds-card"
        />
        <KPICard
          icon={TrendingUp}
          label="Taux de recouvrement"
          value={`${computed.recoveryRate}%`}
          sub={`${formatCHF(computed.totalPaid)} recouvres`}
          color="text-zinc-900"
          bg="ds-card border-green-200"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging chart */}
        <div className="ds-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Vieillissement des creances
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={computed.agingData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                formatter={(value, name) =>
                  name === 'amount' ? [formatCHF(value), 'Montant'] : [value, 'Factures']
                }
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="amount" name="amount" radius={[6, 6, 0, 0]}>
                {computed.agingData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="ds-card p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Repartition par statut
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={computed.statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, value }) => `${name} (${value})`}
              >
                {computed.statusData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={STATUS_COLORS[entry.name] || PIE_COLORS[idx % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value, 'Factures']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top debtors table */}
      <div className="ds-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Users size={16} />
            Top 10 debiteurs
          </h3>
        </div>
        {computed.topDebtors.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Aucune facture en attente
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">#</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Client</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Montant du</th>
                  <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Factures</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Plus ancienne</th>
                  <th className="text-center px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Retard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {computed.topDebtors.map((d, idx) => {
                  const age = daysSince(d.oldest)
                  const urgency = age > 90 ? 'text-red-600 font-semibold' : age > 60 ? 'text-orange-600' : age > 30 ? 'text-amber-600' : 'text-gray-600'
                  return (
                    <tr key={idx} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-6 py-3 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{d.client_name}</td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">{formatCHF(d.total)}</td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                          {d.count}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {d.oldest ? new Date(d.oldest).toLocaleDateString('fr-CH') : '-'}
                      </td>
                      <td className={`px-6 py-3 text-center ${urgency}`}>
                        {age}j
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──

function DashboardHeader({ isLoading, onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Recouvrement</p>
        <h2 className="text-xl font-bold text-gray-900">Module Collection</h2>
      </div>
      <button
        onClick={() => onRefresh()}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        Actualiser
      </button>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className={`ds-card p-5 ${bg}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-white/60 ${color}`}>
          <Icon size={18} />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  )
}

export default CollectionDashboard
