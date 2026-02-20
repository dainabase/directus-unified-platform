/**
 * BankingPage — SuperAdmin Banking / Revolut page
 * Full-featured banking view with account cards, balance evolution chart,
 * filterable transactions table, CSV export, and reconciliation modal.
 *
 * Connected to Directus collections: bank_accounts, bank_transactions, client_invoices
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import {
  Landmark, CreditCard, Download, Search, X, ChevronLeft, ChevronRight,
  ArrowDownRight, ArrowUpRight, Link2, RefreshCw, Loader2, AlertCircle,
  Eye, EyeOff, Filter, CheckCircle2
} from 'lucide-react'
import { format, subDays, parseISO, startOfDay, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

// ────────────────────────────────────────────────────────────────────────────
// Formatters
// ────────────────────────────────────────────────────────────────────────────

const formatCHF = (value, currency = 'CHF') =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency }).format(value)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: fr })
  } catch {
    return dateStr
  }
}

const maskIBAN = (iban) => {
  if (!iban) return '****'
  const clean = iban.replace(/\s/g, '')
  if (clean.length < 8) return clean
  return `${clean.slice(0, 4)} **** **** ${clean.slice(-4)}`
}

const EXCHANGE_RATES = { EUR: 0.94, USD: 0.88, GBP: 1.12, CHF: 1 }

// ────────────────────────────────────────────────────────────────────────────
// API fetchers
// ────────────────────────────────────────────────────────────────────────────

const fetchBankAccounts = async (company) => {
  const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
  const res = await api.get('/items/bank_accounts', {
    params: { filter, fields: ['*'], limit: -1 }
  })
  return res.data?.data || []
}

const fetchBankTransactions = async (company) => {
  const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
  const res = await api.get('/items/bank_transactions', {
    params: {
      filter,
      fields: ['*'],
      sort: ['-date', '-date_created'],
      limit: -1
    }
  })
  return res.data?.data || []
}

const searchInvoices = async (query) => {
  if (!query || query.length < 2) return []
  const res = await api.get('/items/client_invoices', {
    params: {
      filter: {
        _or: [
          { invoice_number: { _contains: query } },
          { client_name: { _contains: query } }
        ]
      },
      fields: ['id', 'invoice_number', 'client_name', 'total', 'currency', 'status', 'date'],
      sort: ['-date'],
      limit: 5
    }
  })
  return res.data?.data || []
}

const createReconciliation = async ({ transaction_id, invoice_id, amount, currency }) => {
  const res = await api.post('/items/reconciliations', {
    transaction_id,
    invoice_id,
    amount,
    currency,
    reconciliation_type: 'manual',
    status: 'confirmed',
    date_created: new Date().toISOString()
  })
  // Also mark the transaction as reconciled
  await api.patch(`/items/bank_transactions/${transaction_id}`, {
    reconciled: true,
    reconciled_invoice: invoice_id,
    reconciliation_type: 'manual'
  })
  return res.data?.data
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

/** Account Card */
function AccountCard({ account, isSelected, onClick }) {
  const [ibanVisible, setIbanVisible] = useState(false)
  const balance = parseFloat(account.balance || 0)
  const currency = account.currency || 'CHF'

  return (
    <button
      onClick={onClick}
      className={`ds-card p-5 text-left w-full transition-all ${
        isSelected
          ? 'ring-2 ring-[#0071E3] bg-blue-50/60'
          : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#0071E3]/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#0071E3]" />
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase">{currency}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 truncate mb-1">
        {account.name || `Compte ${currency}`}
      </p>
      <p className="text-xl font-bold text-gray-900">{formatCHF(balance, currency)}</p>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-gray-400 font-mono">
          {ibanVisible ? (account.iban || 'N/A') : maskIBAN(account.iban)}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIbanVisible(!ibanVisible) }}
          className="text-gray-300 hover:text-gray-500 transition-colors"
        >
          {ibanVisible ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
      {currency !== 'CHF' && (
        <p className="text-xs text-gray-400 mt-1">
          ~ {formatCHF(balance / (EXCHANGE_RATES[currency] || 1))}
        </p>
      )}
    </button>
  )
}

/** Custom chart tooltip */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {formatCHF(entry.value)}
        </p>
      ))}
    </div>
  )
}

/** Reconciliation Quick Match Modal */
function ReconciliationModal({ transaction, onClose, onConfirm }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoice-search', searchTerm],
    queryFn: () => searchInvoices(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 30
  })

  const handleConfirm = () => {
    if (!selectedInvoice) return
    onConfirm({
      transaction_id: transaction.id,
      invoice_id: selectedInvoice.id,
      amount: Math.abs(parseFloat(transaction.amount || 0)),
      currency: transaction.currency || 'CHF'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Associer a une facture</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Transaction: {transaction.description || 'N/A'} — {formatCHF(Math.abs(parseFloat(transaction.amount || 0)), transaction.currency || 'CHF')}
            </p>
          </div>
          <button onClick={onClose} className="ds-btn ds-btn-ghost !p-1.5 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setSelectedInvoice(null) }}
              placeholder="Rechercher par numero de facture ou client..."
              className="ds-input pl-9 w-full"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="px-6 pb-2 min-h-[200px] max-h-[300px] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Recherche...
            </div>
          )}

          {!isLoading && searchTerm.length >= 2 && invoices.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Aucune facture trouvee pour "{searchTerm}"
            </div>
          )}

          {!isLoading && searchTerm.length < 2 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Saisissez au moins 2 caracteres pour rechercher
            </div>
          )}

          {invoices.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setSelectedInvoice(inv)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all border ${
                selectedInvoice?.id === inv.id
                  ? 'border-[#0071E3] bg-blue-50'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    {inv.invoice_number || `#${inv.id}`}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {inv.client_name || ''}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatCHF(parseFloat(inv.total || 0), inv.currency || 'CHF')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{formatDate(inv.date)}</span>
                {inv.status && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                    inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {inv.status === 'paid' ? 'Payee' :
                     inv.status === 'sent' ? 'Envoyee' :
                     inv.status === 'overdue' ? 'En retard' :
                     inv.status}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="ds-btn ds-btn-ghost">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedInvoice}
            className="ds-btn ds-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Link2 size={14} className="mr-1.5" />
            Associer
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Main BankingPage Component
// ────────────────────────────────────────────────────────────────────────────

export function BankingPage({ selectedCompany }) {
  const queryClient = useQueryClient()
  const company = selectedCompany === 'all' ? '' : selectedCompany

  // ── State ──
  const [selectedAccountId, setSelectedAccountId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [reconcileTarget, setReconcileTarget] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateStart: '',
    dateEnd: '',
    type: 'all',       // all | debit | credit
    amountMin: '',
    amountMax: '',
    search: '',
    reconciled: 'all'  // all | yes | no
  })

  const PAGE_SIZE = 50

  // ── Queries ──
  const {
    data: accounts = [],
    isLoading: accountsLoading,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['banking-accounts', company],
    queryFn: () => fetchBankAccounts(company),
    staleTime: 1000 * 60 * 2
  })

  const {
    data: allTransactions = [],
    isLoading: transactionsLoading,
    refetch: refetchTransactions
  } = useQuery({
    queryKey: ['banking-transactions', company],
    queryFn: () => fetchBankTransactions(company),
    staleTime: 1000 * 60
  })

  // ── Reconciliation mutation ──
  const reconciliationMutation = useMutation({
    mutationFn: createReconciliation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banking-transactions'] })
      setReconcileTarget(null)
    }
  })

  // ── Computed: consolidated balance ──
  const totalBalanceCHF = useMemo(() => {
    return accounts.reduce((total, account) => {
      const rate = EXCHANGE_RATES[account.currency] || 1
      return total + (parseFloat(account.balance || 0) / rate)
    }, 0)
  }, [accounts])

  // ── Computed: filtered transactions ──
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions]

    // Filter by selected account
    if (selectedAccountId) {
      result = result.filter((tx) => tx.bank_account === selectedAccountId)
    }

    // Filter by search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter((tx) =>
        (tx.description || '').toLowerCase().includes(q) ||
        (tx.merchant_name || '').toLowerCase().includes(q) ||
        (tx.reference || '').toLowerCase().includes(q)
      )
    }

    // Filter by type
    if (filters.type === 'debit') {
      result = result.filter((tx) => tx.type === 'debit' || parseFloat(tx.amount || 0) < 0)
    } else if (filters.type === 'credit') {
      result = result.filter((tx) => tx.type === 'credit' || parseFloat(tx.amount || 0) > 0)
    }

    // Filter by date range
    if (filters.dateStart || filters.dateEnd) {
      const start = filters.dateStart ? startOfDay(parseISO(filters.dateStart)) : new Date(0)
      const end = filters.dateEnd ? startOfDay(parseISO(filters.dateEnd)) : new Date('2099-12-31')
      result = result.filter((tx) => {
        const txDate = tx.date || tx.date_created
        if (!txDate) return true
        try {
          const d = startOfDay(parseISO(txDate))
          return isWithinInterval(d, { start, end })
        } catch {
          return true
        }
      })
    }

    // Filter by amount range
    if (filters.amountMin !== '') {
      const min = parseFloat(filters.amountMin)
      if (!isNaN(min)) {
        result = result.filter((tx) => Math.abs(parseFloat(tx.amount || 0)) >= min)
      }
    }
    if (filters.amountMax !== '') {
      const max = parseFloat(filters.amountMax)
      if (!isNaN(max)) {
        result = result.filter((tx) => Math.abs(parseFloat(tx.amount || 0)) <= max)
      }
    }

    // Filter by reconciliation status
    if (filters.reconciled === 'yes') {
      result = result.filter((tx) => tx.reconciled === true)
    } else if (filters.reconciled === 'no') {
      result = result.filter((tx) => !tx.reconciled)
    }

    return result
  }, [allTransactions, selectedAccountId, filters])

  // ── Computed: paginated transactions ──
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredTransactions.slice(start, start + PAGE_SIZE)
  }, [filteredTransactions, currentPage])

  // ── Computed: balance evolution chart data (30 days) ──
  const chartData = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)
    const days = []

    for (let i = 0; i <= 30; i++) {
      const day = subDays(now, 30 - i)
      days.push({
        date: format(day, 'dd/MM', { locale: fr }),
        dateObj: startOfDay(day),
        credits: 0,
        debits: 0
      })
    }

    // Aggregate transactions by day
    const relevantTx = allTransactions.filter((tx) => {
      const txDate = tx.date || tx.date_created
      if (!txDate) return false
      try {
        const d = parseISO(txDate)
        return d >= thirtyDaysAgo && d <= now
      } catch {
        return false
      }
    })

    relevantTx.forEach((tx) => {
      const txDate = tx.date || tx.date_created
      if (!txDate) return
      try {
        const d = startOfDay(parseISO(txDate))
        const dayEntry = days.find((day) => day.dateObj.getTime() === d.getTime())
        if (dayEntry) {
          const amount = parseFloat(tx.amount || 0)
          if (tx.type === 'credit' || amount > 0) {
            dayEntry.credits += Math.abs(amount)
          } else {
            dayEntry.debits += Math.abs(amount)
          }
        }
      } catch {
        // skip unparseable dates
      }
    })

    // Compute running balance from the first account balance going backwards
    const currentTotal = totalBalanceCHF
    let runningBalance = currentTotal

    // Walk backwards from today to build balances
    const result = [...days].reverse()
    result.forEach((day, i) => {
      if (i === 0) {
        day.balance = currentTotal
      } else {
        // For previous days, subtract credits and add debits of the next day
        const nextDay = result[i - 1]
        runningBalance = runningBalance - nextDay.credits + nextDay.debits
        day.balance = runningBalance
      }
    })

    return result.reverse().map(({ date, balance, credits, debits }) => ({
      date,
      balance: Math.round(balance * 100) / 100,
      credits: Math.round(credits * 100) / 100,
      debits: Math.round(debits * 100) / 100
    }))
  }, [allTransactions, totalBalanceCHF])

  // ── CSV Export ──
  const handleExportCSV = useCallback(() => {
    const BOM = '\uFEFF'
    const headers = ['Date', 'Description', 'Type', 'Montant', 'Devise', 'Rapproche', 'Reference']
    const rows = filteredTransactions.map((tx) => {
      const isCredit = tx.type === 'credit' || parseFloat(tx.amount || 0) > 0
      return [
        formatDate(tx.date || tx.date_created),
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        isCredit ? 'Credit' : 'Debit',
        parseFloat(tx.amount || 0).toFixed(2),
        tx.currency || 'CHF',
        tx.reconciled ? 'Oui' : 'Non',
        `"${(tx.reference || '').replace(/"/g, '""')}"`
      ].join(';')
    })

    const csv = BOM + [headers.join(';'), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `releve_bancaire_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredTransactions])

  // ── Filters reset ──
  const resetFilters = () => {
    setFilters({
      dateStart: '',
      dateEnd: '',
      type: 'all',
      amountMin: '',
      amountMax: '',
      search: '',
      reconciled: 'all'
    })
    setCurrentPage(1)
  }

  const activeFilterCount = [
    filters.dateStart,
    filters.dateEnd,
    filters.type !== 'all' ? filters.type : '',
    filters.amountMin,
    filters.amountMax,
    filters.search,
    filters.reconciled !== 'all' ? filters.reconciled : ''
  ].filter(Boolean).length

  // ── Refresh all ──
  const handleRefresh = () => {
    refetchAccounts()
    refetchTransactions()
  }

  // ── Loading ──
  const isLoading = accountsLoading || transactionsLoading

  if (isLoading && accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
          <h2 className="text-xl font-bold text-gray-900">Banking / Revolut</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="ds-btn ds-btn-ghost disabled:opacity-40"
          >
            <Download size={14} className="mr-1.5" />
            Exporter releve CSV
          </button>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="ds-btn ds-btn-primary"
          >
            <RefreshCw size={14} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Synchroniser
          </button>
        </div>
      </div>

      {/* ── Consolidated Balance ── */}
      <div className="bg-gradient-to-br from-[#0071E3] to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">
              Solde consolide
            </p>
            <h2 className="text-3xl font-bold mt-1">{formatCHF(totalBalanceCHF)}</h2>
            <p className="text-blue-200 text-sm mt-1">
              {accounts.length} compte{accounts.length !== 1 ? 's' : ''} actif{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Landmark size={40} className="text-white/20" />
        </div>
      </div>

      {/* ── Account Cards Row ── */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              isSelected={selectedAccountId === account.id}
              onClick={() => {
                setSelectedAccountId(
                  selectedAccountId === account.id ? null : account.id
                )
                setCurrentPage(1)
              }}
            />
          ))}
        </div>
      )}

      {accounts.length === 0 && !isLoading && (
        <div className="ds-card p-8 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aucun compte bancaire trouve</p>
        </div>
      )}

      {/* ── Balance Evolution Chart ── */}
      <div className="ds-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Evolution du solde (30 jours)</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0071E3" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#0071E3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` :
                  v >= 1000 ? `${(v / 1000).toFixed(0)}K` :
                  v.toFixed(0)
                }
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="balance"
                name="Solde"
                stroke="#0071E3"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#0071E3', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
            Aucune donnee disponible
          </div>
        )}
      </div>

      {/* ── Transactions Section ── */}
      <div className="ds-card overflow-hidden">
        {/* Transactions Header + Search */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Transactions</h3>
              <span className="text-xs text-gray-400">
                {filteredTransactions.length} resultat{filteredTransactions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Quick search */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters({ ...filters, search: e.target.value })
                    setCurrentPage(1)
                  }}
                  placeholder="Rechercher..."
                  className="ds-input pl-8 !py-1.5 text-sm w-48"
                />
                {filters.search && (
                  <button
                    onClick={() => { setFilters({ ...filters, search: '' }); setCurrentPage(1) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              {/* Filter toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`ds-btn ds-btn-ghost !py-1.5 text-sm relative ${
                  activeFilterCount > 0 ? 'text-[#0071E3]' : ''
                }`}
              >
                <Filter size={14} className="mr-1" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {filtersOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Date range */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Date debut</label>
                  <input
                    type="date"
                    value={filters.dateStart}
                    onChange={(e) => { setFilters({ ...filters, dateStart: e.target.value }); setCurrentPage(1) }}
                    className="ds-input !py-1.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Date fin</label>
                  <input
                    type="date"
                    value={filters.dateEnd}
                    onChange={(e) => { setFilters({ ...filters, dateEnd: e.target.value }); setCurrentPage(1) }}
                    className="ds-input !py-1.5 text-sm w-full"
                  />
                </div>

                {/* Type filter */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setCurrentPage(1) }}
                    className="ds-input !py-1.5 text-sm w-full"
                  >
                    <option value="all">Tous</option>
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                {/* Reconciliation status */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Rapprochement</label>
                  <select
                    value={filters.reconciled}
                    onChange={(e) => { setFilters({ ...filters, reconciled: e.target.value }); setCurrentPage(1) }}
                    className="ds-input !py-1.5 text-sm w-full"
                  >
                    <option value="all">Tous</option>
                    <option value="yes">Rapproches</option>
                    <option value="no">Non rapproches</option>
                  </select>
                </div>

                {/* Amount min/max */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Montant min (CHF)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filters.amountMin}
                    onChange={(e) => { setFilters({ ...filters, amountMin: e.target.value }); setCurrentPage(1) }}
                    placeholder="0.00"
                    className="ds-input !py-1.5 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Montant max (CHF)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={filters.amountMax}
                    onChange={(e) => { setFilters({ ...filters, amountMax: e.target.value }); setCurrentPage(1) }}
                    placeholder="100000.00"
                    className="ds-input !py-1.5 text-sm w-full"
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="ds-btn ds-btn-ghost !py-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <X size={12} className="mr-1" />
                    Reinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Montant</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Devise</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Rapproche</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    <Search size={24} className="mx-auto mb-2 opacity-40" />
                    <p>Aucune transaction</p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const amount = parseFloat(tx.amount || 0)
                  const isCredit = tx.type === 'credit' || amount > 0
                  const absAmount = Math.abs(amount)
                  const currency = tx.currency || 'CHF'

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-5 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(tx.date || tx.date_created)}
                      </td>

                      {/* Description */}
                      <td className="px-5 py-3 max-w-[260px]">
                        <p className="font-medium text-gray-900 truncate">
                          {tx.description || 'Transaction'}
                        </p>
                        {tx.reference && (
                          <p className="text-xs text-gray-400 truncate">{tx.reference}</p>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          isCredit
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {isCredit
                            ? <ArrowDownRight size={12} />
                            : <ArrowUpRight size={12} />
                          }
                          {isCredit ? 'Credit' : 'Debit'}
                        </span>
                      </td>

                      {/* Montant */}
                      <td className={`px-5 py-3 text-right whitespace-nowrap font-semibold ${
                        isCredit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isCredit ? '+' : '-'}{formatCHF(absAmount, currency)}
                      </td>

                      {/* Devise */}
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {currency}
                        </span>
                      </td>

                      {/* Rapproche */}
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        {tx.reconciled ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                            <CheckCircle2 size={12} />
                            Rapproche
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                            Non rapproche
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        {!tx.reconciled ? (
                          <button
                            onClick={() => setReconcileTarget(tx)}
                            className="ds-btn ds-btn-ghost !py-1 !px-2 text-xs text-[#0071E3] hover:bg-blue-50"
                          >
                            <Link2 size={12} className="mr-1" />
                            Associer a facture
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">--</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Page {currentPage} / {totalPages} — {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="ds-btn ds-btn-ghost !p-1.5 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#0071E3] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ds-btn ds-btn-ghost !p-1.5 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Reconciliation Modal ── */}
      {reconcileTarget && (
        <ReconciliationModal
          transaction={reconcileTarget}
          onClose={() => setReconcileTarget(null)}
          onConfirm={(data) => reconciliationMutation.mutate(data)}
        />
      )}
    </div>
  )
}

export default BankingPage
