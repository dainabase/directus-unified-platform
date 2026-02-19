/**
 * G-03 : Dashboard Reconciliation Bancaire
 * KPIs, liste transactions, rapprochement manuel, filtres
 * Connected to Directus bank_transactions + client_invoices + reconciliations
 */
import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Search,
  ArrowUpRight, Link2, Filter, ChevronDown, ChevronUp, Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'

const formatCHF = (amount, currency = 'CHF') =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency }).format(amount || 0)

// ── Data fetching ──

const fetchTransactions = async (company, statusFilter) => {
  try {
    const filter = {}
    if (company && company !== 'all') filter.owner_company_id = { _eq: company }
    if (statusFilter && statusFilter !== 'all') filter.reconciliation_status = { _eq: statusFilter }
    const res = await api.get('/items/bank_transactions', {
      params: { filter, fields: ['*'], sort: ['-date', '-date_created'], limit: 100 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const fetchReconciliations = async (company) => {
  try {
    const filter = {}
    if (company && company !== 'all') filter.owner_company = { _eq: company }
    const res = await api.get('/items/reconciliations', {
      params: { filter, fields: ['*'], sort: ['-reconciled_at'], limit: 50 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const fetchPendingInvoices = async (company) => {
  try {
    const filter = { status: { _in: ['sent', 'partial'] } }
    if (company && company !== 'all') filter.owner_company = { _eq: company }
    const res = await api.get('/items/client_invoices', {
      params: { filter, fields: ['*'], sort: ['-due_date'], limit: 200 }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

// ── Status helpers ──

const STATUS_MAP = {
  unmatched: { label: 'Non rapproche', variant: 'warning', icon: AlertTriangle },
  auto_matched: { label: 'Auto', variant: 'success', icon: Zap },
  manual_matched: { label: 'Manuel', variant: 'primary', icon: CheckCircle2 },
  pending: { label: 'En attente', variant: 'default', icon: RefreshCw }
}

const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.unmatched
  const Icon = config.icon
  return (
    <Badge variant={config.variant} size="sm" dot>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  )
}

// ── KPI Card ──

const KPICard = ({ title, value, subtitle, icon: Icon, color }) => (
  <GlassCard className="flex items-start gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </GlassCard>
)

// ── Reconciliation Modal ──

const ReconcileModal = ({ transaction, invoices, onClose, onReconcile, isLoading }) => {
  if (!transaction) return null

  // Score suggestions (from backend or compute client-side approximation)
  const suggestions = transaction.suggestions || []

  // Find matching invoices for suggestions
  const suggestedInvoices = suggestions.map(s => {
    const inv = invoices.find(i => i.id === s.invoice_id)
    return inv ? { ...s, ...inv, score: s.score } : s
  }).filter(Boolean)

  // Other invoices not in suggestions
  const suggestedIds = new Set(suggestions.map(s => s.invoice_id))
  const otherInvoices = invoices.filter(i => !suggestedIds.has(i.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Rapprochement manuel</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Transaction info */}
        <div className="p-4 rounded-lg bg-white/5 mb-6">
          <p className="text-sm text-gray-400">Transaction</p>
          <p className="text-lg font-bold text-white">
            {formatCHF(Math.abs(transaction.amount), transaction.currency)}
          </p>
          <p className="text-sm text-gray-300">{transaction.description || transaction.reference || 'N/A'}</p>
          <p className="text-xs text-gray-500">{transaction.date} — {transaction.state}</p>
        </div>

        {/* Suggested matches */}
        {suggestedInvoices.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Suggestions (Top 3)</p>
            {suggestedInvoices.map((inv, i) => (
              <button
                key={inv.invoice_id || inv.id}
                onClick={() => onReconcile(transaction.id, inv.invoice_id || inv.id)}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 mb-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {inv.invoice_number || `Facture #${i + 1}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {inv.client_name} — {formatCHF(inv.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    inv.score >= 85 ? 'text-green-400' :
                    inv.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {inv.score}%
                  </span>
                  <p className="text-xs text-gray-500">score</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* All pending invoices */}
        {otherInvoices.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">
              Autres factures en attente ({otherInvoices.length})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {otherInvoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => onReconcile(transaction.id, inv.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors text-left text-sm"
                >
                  <div>
                    <p className="text-gray-200">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-500">{inv.client_name}</p>
                  </div>
                  <p className="text-gray-300">{formatCHF(inv.amount)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {invoices.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Aucune facture en attente de paiement
          </p>
        )}
      </GlassCard>
    </div>
  )
}

// ── Main Dashboard ──

export default function ReconciliationDashboard({ selectedCompany }) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTx, setSelectedTx] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['reconciliation-transactions', selectedCompany, statusFilter],
    queryFn: () => fetchTransactions(selectedCompany, statusFilter),
    staleTime: 30_000,
    refetchInterval: 60_000
  })

  const { data: reconciliations = [] } = useQuery({
    queryKey: ['reconciliations', selectedCompany],
    queryFn: () => fetchReconciliations(selectedCompany),
    staleTime: 60_000
  })

  const { data: pendingInvoices = [] } = useQuery({
    queryKey: ['pending-invoices', selectedCompany],
    queryFn: () => fetchPendingInvoices(selectedCompany),
    staleTime: 60_000
  })

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: () => api.post('/api/revolut/sync-transactions', { hours: 24 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-transactions'] })
    }
  })

  // Reconcile mutation
  const reconcileMutation = useMutation({
    mutationFn: ({ transaction_id, invoice_id }) =>
      api.post('/api/revolut/reconcile', { transaction_id, invoice_id }),
    onSuccess: () => {
      setSelectedTx(null)
      queryClient.invalidateQueries({ queryKey: ['reconciliation-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['reconciliations'] })
      queryClient.invalidateQueries({ queryKey: ['pending-invoices'] })
    }
  })

  const handleReconcile = useCallback((transaction_id, invoice_id) => {
    reconcileMutation.mutate({ transaction_id, invoice_id })
  }, [reconcileMutation])

  // Compute KPIs
  const unmatchedCount = transactions.filter(t => t.reconciliation_status === 'unmatched').length
  const autoMatchedCount = transactions.filter(t => t.reconciliation_status === 'auto_matched').length
  const manualMatchedCount = transactions.filter(t => t.reconciliation_status === 'manual_matched').length
  const totalMatched = autoMatchedCount + manualMatchedCount
  const autoRate = totalMatched > 0 ? Math.round((autoMatchedCount / totalMatched) * 100) : 0
  const pendingAmount = transactions
    .filter(t => t.reconciliation_status === 'unmatched')
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0)

  // Filter transactions by search
  const filtered = transactions.filter(t => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (t.description || '').toLowerCase().includes(term) ||
      (t.reference || '').toLowerCase().includes(term) ||
      (t.revolut_transaction_id || '').toLowerCase().includes(term) ||
      String(t.amount).includes(term)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reconciliation bancaire</h1>
          <p className="text-sm text-gray-400">Rapprochement Revolut — Factures clients</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="glass-button flex items-center gap-2 px-4 py-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Revolut
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Non rapprochees"
          value={unmatchedCount}
          subtitle={`${formatCHF(pendingAmount)} en attente`}
          icon={AlertTriangle}
          color="bg-yellow-500/80"
        />
        <KPICard
          title="Rapprochement auto"
          value={autoMatchedCount}
          subtitle={`Taux auto : ${autoRate}%`}
          icon={Zap}
          color="bg-green-500/80"
        />
        <KPICard
          title="Rapprochement manuel"
          value={manualMatchedCount}
          subtitle={`${reconciliations.length} total historique`}
          icon={Link2}
          color="bg-blue-500/80"
        />
        <KPICard
          title="Factures en attente"
          value={pendingInvoices.length}
          subtitle="sent / partial"
          icon={ArrowUpRight}
          color="bg-purple-500/80"
        />
      </div>

      {/* Filters */}
      <GlassCard padding="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher ref, description, montant..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="glass-button flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Filter className="w-4 h-4" />
            Filtres
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'unmatched', label: 'Non rapprochees' },
              { value: 'auto_matched', label: 'Auto' },
              { value: 'manual_matched', label: 'Manuelles' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Transactions Table */}
      <GlassCard padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="text-left p-4 text-xs font-medium text-gray-400 uppercase">Description</th>
                <th className="text-right p-4 text-xs font-medium text-gray-400 uppercase">Montant</th>
                <th className="text-center p-4 text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="text-center p-4 text-xs font-medium text-gray-400 uppercase">Score</th>
                <th className="text-right p-4 text-xs font-medium text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {txLoading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    Aucune transaction trouvee
                  </td>
                </tr>
              ) : filtered.map(tx => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-sm text-gray-300">
                    {tx.date || '—'}
                    {tx.date_created && (
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(tx.date_created), { addSuffix: true, locale: fr })}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-white truncate max-w-[250px]">
                      {tx.description || tx.reference || 'Transaction Revolut'}
                    </p>
                    {tx.reference && tx.description !== tx.reference && (
                      <p className="text-xs text-gray-500 truncate max-w-[250px]">
                        Ref: {tx.reference}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`text-sm font-mono font-medium ${
                      parseFloat(tx.amount) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCHF(tx.amount, tx.currency)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={tx.reconciliation_status} />
                  </td>
                  <td className="p-4 text-center">
                    {tx.match_score ? (
                      <span className={`text-sm font-bold ${
                        tx.match_score >= 85 ? 'text-green-400' :
                        tx.match_score >= 60 ? 'text-yellow-400' : 'text-gray-500'
                      }`}>
                        {tx.match_score}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {tx.reconciliation_status === 'unmatched' && (
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="glass-button px-3 py-1.5 text-xs flex items-center gap-1 ml-auto"
                      >
                        <Link2 className="w-3 h-3" />
                        Rapprocher
                      </button>
                    )}
                    {(tx.reconciliation_status === 'auto_matched' || tx.reconciliation_status === 'manual_matched') && (
                      <CheckCircle2 className="w-5 h-5 text-green-400 ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 text-sm text-gray-500">
          <span>{filtered.length} transaction(s) affichee(s)</span>
          <span>Total : {transactions.length}</span>
        </div>
      </GlassCard>

      {/* Recent reconciliations */}
      {reconciliations.length > 0 && (
        <GlassCard>
          <h3 className="text-md font-semibold text-white mb-4">
            Derniers rapprochements
          </h3>
          <div className="space-y-2">
            {reconciliations.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm text-gray-200">
                    <Badge variant={r.method === 'auto' ? 'success' : 'primary'} size="sm">
                      {r.method === 'auto' ? 'Auto' : 'Manuel'}
                    </Badge>
                    <span className="ml-2">Score: {r.score}%</span>
                  </p>
                  {r.reconciled_at && (
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(r.reconciled_at), { addSuffix: true, locale: fr })}
                    </p>
                  )}
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Reconciliation Modal */}
      {selectedTx && (
        <ReconcileModal
          transaction={selectedTx}
          invoices={pendingInvoices}
          onClose={() => setSelectedTx(null)}
          onReconcile={handleReconcile}
          isLoading={reconcileMutation.isPending}
        />
      )}
    </div>
  )
}
