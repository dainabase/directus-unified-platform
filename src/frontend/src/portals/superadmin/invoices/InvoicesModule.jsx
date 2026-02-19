/**
 * InvoicesModule — S-03-05
 * Module facturation SuperAdmin: CRUD factures client + QR Swiss.
 * Gere la liste, creation, edition et detail des factures.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, Plus, Search, Eye, Edit3, Trash2, Copy, Send,
  Loader2, AlertCircle, CheckCircle2, Clock, XCircle, Filter
} from 'lucide-react'
import api from '../../../lib/axios'
import QRSwiss, { displayCHF } from '../../../components/payments/QRSwiss'
import InvoiceForm from './InvoiceForm'
import InvoiceDetail from './InvoiceDetail'

const COMPANIES = [
  { value: '', label: 'Toutes' },
  { value: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22', label: 'HYPERVISUAL' },
  { value: '55483d07-6621-43d4-89a9-5ebbffe86fea', label: 'DAINAMICS' },
  { value: '6f4bc42a-d083-4df5-ace3-6b910164ae18', label: 'ENKI REALTY' },
  { value: '8db45f3b-4021-9556-3acaa5f35b3f', label: 'LEXAIA' },
  { value: 'a1313adf-0347-424b-aff2-c5f0b33c4a05', label: 'TAKEOUT' }
]

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  pending: { label: 'En attente', color: 'bg-amber-50 text-amber-700' },
  sent: { label: 'Envoyee', color: 'bg-blue-50 text-blue-700' },
  paid: { label: 'Payee', color: 'bg-emerald-50 text-emerald-700' },
  partial: { label: 'Partielle', color: 'bg-orange-50 text-orange-700' },
  overdue: { label: 'En retard', color: 'bg-red-50 text-red-700' },
  cancelled: { label: 'Annulee', color: 'bg-gray-100 text-gray-500' }
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// Fetch invoices
async function fetchInvoices({ company, status, search, page = 1 }) {
  const filter = {}
  if (company) filter.owner_company = { _eq: company }
  if (status && status !== 'all') filter.status = { _eq: status }
  if (search) filter._or = [
    { invoice_number: { _contains: search } },
    { client_name: { _contains: search } }
  ]

  const { data } = await api.get('/items/client_invoices', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      fields: [
        'id', 'invoice_number', 'status', 'total_ht', 'total_tva', 'total_ttc',
        'due_date', 'date_created', 'date_issued', 'client_name', 'client_id',
        'owner_company.name', 'currency'
      ],
      sort: ['-date_created'],
      limit: 25,
      offset: (page - 1) * 25,
      meta: 'total_count'
    }
  }).catch(() => ({ data: { data: [], meta: { total_count: 0 } } }))

  return { items: data?.data || [], total: data?.meta?.total_count || 0 }
}

// --- Main Module ---
const InvoicesModule = ({ selectedCompany }) => {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [view, setView] = useState('list') // 'list' | 'form' | 'detail'
  const [editInvoice, setEditInvoice] = useState(null)
  const [viewInvoice, setViewInvoice] = useState(null)

  const company = selectedCompany === 'all' ? '' : selectedCompany

  const { data, isLoading } = useQuery({
    queryKey: ['admin-invoices', company, statusFilter, search, page],
    queryFn: () => fetchInvoices({ company, status: statusFilter, search, page }),
    staleTime: 15_000
  })

  const invoices = data?.items || []
  const totalCount = data?.total || 0
  const totalPages = Math.ceil(totalCount / 25)

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/items/client_invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] })
  })

  // Send mutation (mark as sent)
  const sendMutation = useMutation({
    mutationFn: (id) => api.patch(`/items/client_invoices/${id}`, {
      status: 'sent', date_sent: new Date().toISOString()
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] })
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.get(`/items/client_invoices/${id}`, { params: { fields: ['*'] } })
      const original = data?.data
      if (!original) throw new Error('Not found')
      const { id: _id, date_created, date_updated, invoice_number, ...rest } = original
      return api.post('/items/client_invoices', {
        ...rest,
        status: 'draft',
        invoice_number: `${invoice_number}-COPIE`,
        date_issued: null,
        date_sent: null
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-invoices'] })
  })

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette facture ?')) {
      deleteMutation.mutate(id)
    }
  }

  // Form view
  if (view === 'form') {
    return (
      <InvoiceForm
        invoice={editInvoice}
        selectedCompany={selectedCompany}
        onSave={() => {
          qc.invalidateQueries({ queryKey: ['admin-invoices'] })
          setView('list')
          setEditInvoice(null)
        }}
        onCancel={() => { setView('list'); setEditInvoice(null) }}
      />
    )
  }

  // Detail view
  if (view === 'detail' && viewInvoice) {
    return (
      <InvoiceDetail
        invoiceId={viewInvoice}
        onBack={() => { setView('list'); setViewInvoice(null) }}
        onEdit={(inv) => { setEditInvoice(inv); setView('form') }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Factures clients</h2>
          <p className="text-sm text-gray-500 mt-1">{totalCount} facture(s) au total</p>
        </div>
        <button
          onClick={() => { setEditInvoice(null); setView('form') }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus size={16} /> Nouvelle facture
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = invoices.filter(i => i.status === key).length
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key === statusFilter ? 'all' : key)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                statusFilter === key
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white/70 hover:bg-gray-50'
              }`}
            >
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{cfg.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher ref. ou client..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
          >
            Effacer filtre
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Aucune facture</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Echeance</th>
                <th className="px-4 py-3 text-right">Montant TTC</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.client_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{inv.owner_company?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(inv.date_issued || inv.date_created)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{displayCHF(inv.total_ttc)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setViewInvoice(inv.id); setView('detail') }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                        title="Voir"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => { setEditInvoice(inv); setView('form') }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                        title="Modifier"
                      >
                        <Edit3 size={14} />
                      </button>
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => sendMutation.mutate(inv.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600"
                          title="Envoyer"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => duplicateMutation.mutate(inv.id)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-purple-600"
                        title="Dupliquer"
                      >
                        <Copy size={14} />
                      </button>
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
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
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Precedent
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

export default InvoicesModule
