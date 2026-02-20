/**
 * SupplierInvoicesModule
 * Gestion des factures fournisseurs — collection Directus `supplier_invoices`.
 * CRUD, filtres, approbation, pagination.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, Search, Eye, Edit3, Trash2, Plus,
  CheckCircle, Clock, Filter, Loader2
} from 'lucide-react'
import api from '../../../../lib/axios'

const PAGE_SIZE = 25

const STATUS_CONFIG = {
  draft:    { label: 'Brouillon', color: 'ds-badge ds-badge-default' },
  pending:  { label: 'En attente', color: 'ds-badge ds-badge-warning' },
  approved: { label: 'Approuvee', color: 'ds-badge ds-badge-success' },
  paid:     { label: 'Payee', color: 'ds-badge ds-badge-success' },
  rejected: { label: 'Rejetee', color: 'ds-badge ds-badge-danger' }
}

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
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={cfg.color}>
      {cfg.label}
    </span>
  )
}

// ── Data fetching ──

async function fetchSupplierInvoices({ company, status, search, page = 1 }) {
  const filter = {}
  if (company) filter.owner_company = { _eq: company }
  if (status && status !== 'all') filter.status = { _eq: status }
  if (search) {
    filter._or = [
      { invoice_number: { _contains: search } },
      { supplier_name: { _contains: search } }
    ]
  }

  const { data } = await api.get('/items/supplier_invoices', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      fields: [
        'id', 'invoice_number', 'supplier_name', 'amount',
        'status', 'date_created', 'project_id', 'provider_id',
        'approved_by', 'owner_company', 'owner_company_id'
      ],
      sort: ['-date_created'],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      meta: 'total_count'
    }
  }).catch(() => ({ data: { data: [], meta: { total_count: 0 } } }))

  return { items: data?.data || [], total: data?.meta?.total_count || 0 }
}

// ── Skeleton rows ──

const SkeletonRows = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-3 w-32 bg-gray-200 rounded" /></td>
        <td className="px-4 py-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
        <td className="px-4 py-3 text-right"><div className="h-3 w-20 bg-gray-200 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-center"><div className="h-5 w-16 bg-gray-200 rounded-full mx-auto" /></td>
        <td className="px-4 py-3"><div className="h-3 w-16 bg-gray-200 rounded mx-auto" /></td>
      </tr>
    ))}
  </>
)

// ── Main component ──

const SupplierInvoicesModule = ({ selectedCompany }) => {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const company = selectedCompany === 'all' ? '' : selectedCompany

  const { data, isLoading } = useQuery({
    queryKey: ['supplier-invoices', company, statusFilter, search, page],
    queryFn: () => fetchSupplierInvoices({ company, status: statusFilter, search, page }),
    staleTime: 15_000
  })

  const invoices = data?.items || []
  const totalCount = data?.total || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/items/supplier_invoices/${id}`, { status: 'approved' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supplier-invoices'] })
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/items/supplier_invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supplier-invoices'] })
  })

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette facture fournisseur ?')) {
      deleteMutation.mutate(id)
    }
  }

  // Status counts from current page (used for summary cards)
  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = invoices.filter((i) => i.status === key).length
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Factures fournisseurs</h2>
          <p className="text-sm text-gray-500 mt-1">{totalCount} facture(s) au total</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key === statusFilter ? 'all' : key); setPage(1) }}
            className="p-3 rounded-lg border text-center transition-colors"
            style={statusFilter === key
              ? { borderColor: 'var(--accent)', background: 'var(--accent-light)' }
              : { borderColor: 'var(--border-light)', background: 'var(--bg-surface)' }
            }
          >
            <p className="text-lg font-bold text-gray-900">{statusCounts[key] || 0}</p>
            <p className="text-xs text-gray-500">{cfg.label}</p>
          </button>
        ))}
      </div>

      {/* Filters: search + status */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher ref. ou fournisseur..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="ds-input w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
        {statusFilter !== 'all' && (
          <button
            onClick={() => { setStatusFilter('all'); setPage(1) }}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
          >
            Effacer filtre
          </button>
        )}
      </div>

      {/* Table */}
      <div className="ds-card overflow-hidden">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <SkeletonRows />
            </tbody>
          </table>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Aucune facture fournisseur</p>
            <p className="text-xs mt-1">Les factures apparaitront ici une fois ajoutees.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {inv.invoice_number || '--'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {inv.supplier_name || '--'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(inv.date_created)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCHF(inv.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                        style={{ '--hover-color': 'var(--accent)' }}
                        title="Voir"
                      >
                        <Eye size={14} />
                      </button>
                      {(inv.status === 'pending' || inv.status === 'draft') && (
                        <button
                          onClick={() => approveMutation.mutate(inv.id)}
                          disabled={approveMutation.isPending}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40"
                          title="Approuver"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-40"
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Precedent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupplierInvoicesModule
