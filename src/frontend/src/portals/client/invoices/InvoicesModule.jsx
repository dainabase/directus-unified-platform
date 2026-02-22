/**
 * InvoicesModule — S-03-03
 * Module factures client: liste + detail avec QR-Facture suisse.
 * Lecture seule — le client ne peut pas modifier les factures.
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Receipt, Search, Filter, Eye, Download, AlertCircle,
  Clock, CheckCircle2, XCircle, Loader2, ArrowLeft, X
} from 'lucide-react'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../stores/authStore'
import QRSwiss, { displayCHF } from '../../../components/payments/QRSwiss'

const GREEN = '#059669'

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })
}

const daysUntil = (d) => {
  if (!d) return null
  const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

// --- Status config ---
const STATUS_CONFIG = {
  draft: { label: 'Brouillon', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-2)', icon: Clock },
  pending: { label: 'En attente', bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)', icon: Clock },
  sent: { label: 'Envoyee', bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)', icon: Receipt },
  paid: { label: 'Payee', bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)', icon: CheckCircle2 },
  partial: { label: 'Partielle', bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)', icon: AlertCircle },
  overdue: { label: 'En retard', bg: 'rgba(255,59,48,0.12)', fg: 'var(--semantic-red)', icon: XCircle },
  cancelled: { label: 'Annulee', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)', icon: XCircle }
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{background: cfg.bg, color: cfg.fg}}>
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  )
}

// --- Fetch functions ---
async function fetchInvoices(userId, statusFilter) {
  const filter = { client_id: { _eq: userId } }
  if (statusFilter && statusFilter !== 'all') {
    filter.status = { _eq: statusFilter }
  }

  const { data } = await api.get('/items/client_invoices', {
    params: {
      filter,
      fields: [
        'id', 'invoice_number', 'status', 'total_ht', 'total_tva', 'total_ttc',
        'due_date', 'date_created', 'date_issued', 'currency', 'notes',
        'owner_company.name', 'client_id'
      ],
      sort: ['-date_created'],
      limit: 50
    }
  }).catch(() => ({ data: { data: [] } }))

  return data?.data || []
}

async function fetchInvoiceDetail(invoiceId) {
  const { data } = await api.get(`/items/client_invoices/${invoiceId}`, {
    params: {
      fields: [
        '*',
        'owner_company.name', 'owner_company.iban', 'owner_company.address',
        'owner_company.zip_code', 'owner_company.city', 'owner_company.country',
        'items.*'
      ]
    }
  }).catch(() => ({ data: { data: null } }))

  return data?.data || null
}

// --- Summary Cards ---
const SummaryCards = ({ invoices }) => {
  const totalDue = invoices
    .filter(i => ['pending', 'sent', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + (Number(i.total_ttc) || 0), 0)

  const overdueCount = invoices.filter(i => i.status === 'overdue' || (i.status === 'pending' && daysUntil(i.due_date) < 0)).length
  const paidCount = invoices.filter(i => i.status === 'paid').length
  const pendingCount = invoices.filter(i => ['pending', 'sent'].includes(i.status)).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      <div className="ds-card p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total du</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{displayCHF(totalDue)}</p>
      </div>
      <div className="ds-card p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">En attente</p>
        <p className="text-xl font-bold mt-1" style={{color:"var(--semantic-orange)"}}>{pendingCount}</p>
      </div>
      <div className="ds-card p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">En retard</p>
        <p className="text-xl font-bold mt-1" style={{color:"var(--semantic-red)"}}>{overdueCount}</p>
      </div>
      <div className="ds-card p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Payees</p>
        <p className="text-xl font-bold mt-1" style={{color:"var(--accent)"}}>{paidCount}</p>
      </div>
    </div>
  )
}

// --- Invoice Detail (with QR Swiss) ---
const InvoiceDetail = ({ invoiceId, onBack }) => {
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['client-invoice-detail', invoiceId],
    queryFn: () => fetchInvoiceDetail(invoiceId),
    enabled: !!invoiceId
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Facture introuvable</p>
        <button onClick={onBack} className="mt-3 text-sm underline" style={{ color: GREEN }}>Retour</button>
      </div>
    )
  }

  const oc = invoice.owner_company || {}

  // Build creditor info for QR Swiss
  const creditor = {
    iban: oc.iban || '',
    name: oc.name || 'HYPERVISUAL',
    street: oc.address || '',
    zip: oc.zip_code || '',
    city: oc.city || '',
    country: oc.country || 'CH'
  }

  const dueDays = daysUntil(invoice.due_date)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">Facture {invoice.invoice_number}</h2>
          <p className="text-sm text-gray-500">Emise le {formatDate(invoice.date_issued || invoice.date_created)}</p>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      {/* Invoice info card */}
      <div className="ds-card">
        <div className="p-5 border-b border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Montant HT</p>
              <p className="text-lg font-semibold text-gray-900">{displayCHF(invoice.total_ht)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">TVA</p>
              <p className="text-lg font-semibold text-gray-900">{displayCHF(invoice.total_tva)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total TTC</p>
              <p className="text-lg font-bold" style={{ color: GREEN }}>{displayCHF(invoice.total_ttc)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Echeance</p>
              <p className={`text-lg font-semibold ${dueDays !== null && dueDays < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(invoice.due_date)}
              </p>
              {dueDays !== null && dueDays < 0 && invoice.status !== 'paid' && (
                <p className="text-xs text-red-500">{Math.abs(dueDays)} jours de retard</p>
              )}
            </div>
          </div>
        </div>

        {/* Line items */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="p-5 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Detail des lignes</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qte</th>
                  <th className="text-right py-2">Prix unit.</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-gray-900">{item.description || item.label}</td>
                    <td className="py-2 text-right text-gray-600">{item.quantity || 1}</td>
                    <td className="py-2 text-right text-gray-600">{displayCHF(item.unit_price || item.price)}</td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {displayCHF((item.quantity || 1) * (item.unit_price || item.price || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="p-5 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* QR Swiss Payment slip — only for unpaid invoices */}
      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && creditor.iban && (
        <div className="ds-card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Bulletin de paiement QR</h3>
          <QRSwiss
            invoice={invoice}
            creditor={creditor}
            reference={invoice.qr_reference || ''}
            referenceType={invoice.qr_reference ? 'QRR' : 'NON'}
            message={`Facture ${invoice.invoice_number}`}
          />
          <p className="text-xs text-gray-400 mt-3">
            Scannez ce code QR avec votre application bancaire suisse pour effectuer le paiement.
          </p>
        </div>
      )}
    </div>
  )
}

// --- Main Module ---
const InvoicesModule = () => {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['client-invoices', userId, statusFilter],
    queryFn: () => fetchInvoices(userId, statusFilter),
    enabled: !!userId,
    staleTime: 30_000
  })

  const filtered = search
    ? invoices.filter(i =>
        (i.invoice_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.notes || '').toLowerCase().includes(search.toLowerCase())
      )
    : invoices

  // Detail view
  if (selectedInvoice) {
    return (
      <InvoiceDetail
        invoiceId={selectedInvoice}
        onBack={() => setSelectedInvoice(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mes factures</h2>
          <p className="text-sm text-gray-500 mt-1">Consultez et payez vos factures</p>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards invoices={invoices} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none"
          />
        </div>
        <div className="flex gap-1">
          {[
            { value: 'all', label: 'Toutes' },
            { value: 'pending', label: 'En attente' },
            { value: 'paid', label: 'Payees' },
            { value: 'overdue', label: 'En retard' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                statusFilter === f.value
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={statusFilter === f.value ? { backgroundColor: GREEN } : undefined}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="ds-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Aucune facture trouvee</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Echeance</th>
                <th className="px-5 py-3 text-right">Montant TTC</th>
                <th className="px-5 py-3 text-center">Statut</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv) => {
                const due = daysUntil(inv.due_date)
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(inv.date_created)}</td>
                    <td className="px-5 py-3">
                      <span className={due !== null && due < 0 && inv.status !== 'paid' ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        {formatDate(inv.due_date)}
                      </span>
                      {due !== null && due < 0 && inv.status !== 'paid' && (
                        <span className="block text-xs text-red-400">{Math.abs(due)}j retard</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{displayCHF(inv.total_ttc)}</td>
                    <td className="px-5 py-3 text-center"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
                        style={{ color: GREEN }}
                      >
                        <Eye size={14} /> Voir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default InvoicesModule
