/**
 * InvoicesPage — Client invoices list with search, status tabs, export CSV, pagination.
 * Connected to Directus `client_invoices` collection.
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, Search, Plus, Download, Receipt,
  ChevronLeft, ChevronRight, Loader2, ArrowUpDown
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Constants ──

const PAGE_SIZE = 25

const STATUS_CONFIG = {
  draft:     { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  sent:      { label: 'Envoyee',   color: 'bg-blue-50 text-blue-700' },
  partial:   { label: 'Partielle', color: 'bg-amber-50 text-amber-700' },
  paid:      { label: 'Payee',     color: 'bg-green-50 text-green-700' },
  overdue:   { label: 'En retard', color: 'bg-red-50 text-red-700' },
  cancelled: { label: 'Annulee',   color: 'bg-gray-100 text-gray-400 line-through' }
}

const STATUS_TABS = [
  { key: 'all',       label: 'Tous' },
  { key: 'draft',     label: 'Brouillon' },
  { key: 'sent',      label: 'Envoyee' },
  { key: 'partial',   label: 'Partielle' },
  { key: 'paid',      label: 'Payee' },
  { key: 'overdue',   label: 'En retard' },
  { key: 'cancelled', label: 'Annulee' }
]

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

const formatDate = (d) => {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ── Sub-components ──

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

const SkeletonRows = () => (
  <>
    {Array.from({ length: 8 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-3 w-32 bg-gray-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
        <td className="px-4 py-3 text-right"><div className="h-3 w-20 bg-gray-200 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-right"><div className="h-3 w-16 bg-gray-200 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-right"><div className="h-3 w-20 bg-gray-200 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-center"><div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" /></td>
      </tr>
    ))}
  </>
)

// ── Data fetching ──

async function fetchInvoices({ company, status, page }) {
  const filter = {}
  if (company) filter.owner_company = { _eq: company }
  if (status && status !== 'all') filter.status = { _eq: status }

  const { data } = await api.get('/items/client_invoices', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      fields: [
        'id', 'invoice_number', 'client_name', 'date_issued', 'due_date',
        'amount', 'tax_amount', 'total', 'total_ttc', 'status',
        'owner_company', 'date_created', 'type', 'currency',
        'contact_id', 'project_id'
      ],
      sort: ['-date_issued'],
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      meta: 'total_count'
    }
  }).catch(() => ({ data: { data: [], meta: { total_count: 0 } } }))

  return { items: data?.data || [], total: data?.meta?.total_count || 0 }
}

// ── CSV Export ──

function exportCSV(invoices) {
  const headers = [
    'N Facture', 'Client', 'Date emission', 'Echeance',
    'Montant HT', 'TVA', 'Montant TTC', 'Statut'
  ]

  const rows = invoices.map((inv) => [
    inv.invoice_number || '',
    (inv.client_name || '').replace(/,/g, ' '),
    inv.date_issued ? new Date(inv.date_issued).toLocaleDateString('fr-CH') : '',
    inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-CH') : '',
    parseFloat(inv.amount || 0).toFixed(2),
    parseFloat(inv.tax_amount || 0).toFixed(2),
    parseFloat(inv.total_ttc || inv.total || 0).toFixed(2),
    STATUS_CONFIG[inv.status]?.label || inv.status || ''
  ])

  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `factures-clients-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── Main component ──

const InvoicesPage = ({ selectedCompany, onSelectInvoice, onNewInvoice }) => {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const company = selectedCompany === 'all' ? '' : selectedCompany

  const { data, isLoading } = useQuery({
    queryKey: ['client-invoices', company, statusFilter, page],
    queryFn: () => fetchInvoices({ company, status: statusFilter, page }),
    staleTime: 15_000
  })

  const allInvoices = data?.items || []
  const totalCount = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // Client-side search filtering on invoice_number and client_name
  const invoices = useMemo(() => {
    if (!searchQuery.trim()) return allInvoices
    const q = searchQuery.toLowerCase().trim()
    return allInvoices.filter(
      (inv) =>
        (inv.invoice_number || '').toLowerCase().includes(q) ||
        (inv.client_name || '').toLowerCase().includes(q)
    )
  }, [allInvoices, searchQuery])

  const handleStatusChange = useCallback((status) => {
    setStatusFilter(status)
    setPage(0)
    setSearchQuery('')
  }, [])

  const handleExportCSV = useCallback(() => {
    exportCSV(invoices)
  }, [invoices])

  // Status counts from the current page data for tab badges
  const statusCounts = useMemo(() => {
    const counts = { all: totalCount }
    allInvoices.forEach((inv) => {
      counts[inv.status] = (counts[inv.status] || 0) + 1
    })
    return counts
  }, [allInvoices, totalCount])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Finance</p>
          <h2 className="ds-page-title text-xl font-bold text-gray-900">Factures clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">{totalCount} facture(s) au total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={invoices.length === 0}
            className="ds-btn ds-btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={onNewInvoice}
            className="ds-btn ds-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0071E3] rounded-lg hover:bg-blue-700"
          >
            <Plus size={15} />
            Nouvelle facture
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par numero ou client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ds-input w-full pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.key
          const count = tab.key === 'all' ? totalCount : (statusCounts[tab.key] || 0)
          return (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="ds-card overflow-hidden">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3">N Facture</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date emission</th>
                <th className="px-4 py-3">Echeance</th>
                <th className="px-4 py-3 text-right">Montant HT</th>
                <th className="px-4 py-3 text-right">TVA</th>
                <th className="px-4 py-3 text-right">Montant TTC</th>
                <th className="px-4 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <SkeletonRows />
            </tbody>
          </table>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-gray-600">Aucune facture trouvee</p>
            <p className="text-xs mt-1">
              {searchQuery
                ? 'Aucun resultat pour cette recherche.'
                : 'Les factures apparaitront ici une fois creees.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3">N Facture</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Date emission</th>
                <th className="px-4 py-3">Echeance</th>
                <th className="px-4 py-3 text-right">Montant HT</th>
                <th className="px-4 py-3 text-right">TVA</th>
                <th className="px-4 py-3 text-right">Montant TTC</th>
                <th className="px-4 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const isOverdue =
                  inv.status !== 'paid' &&
                  inv.status !== 'cancelled' &&
                  inv.due_date &&
                  new Date(inv.due_date) < new Date()
                const displayStatus = isOverdue && inv.status !== 'overdue' ? 'overdue' : inv.status

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelectInvoice && onSelectInvoice(inv.id)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-gray-400 flex-shrink-0" />
                        {inv.invoice_number || '--'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {inv.client_name || '--'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(inv.date_issued)}
                    </td>
                    <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                      {formatCHF(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
                      {formatCHF(inv.tax_amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                      {formatCHF(inv.total_ttc || inv.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={displayStatus} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} sur {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0}
                className="ds-btn ds-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Precedent
              </button>
              <span className="text-gray-600 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="ds-btn ds-btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40"
              >
                Suivant
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoicesPage
