/**
 * InvoiceDetail — Single client invoice view with status actions, line items,
 * totals breakdown, payment history, and QR-Invoice generation.
 * Connected to Directus `client_invoices` + `payments` collections.
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, FileText, Send, CheckCircle, XCircle,
  QrCode, Loader2, AlertCircle, CreditCard, Clock,
  RefreshCw, Printer, Copy
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Constants ──

const STATUS_CONFIG = {
  draft:     { label: 'Brouillon', color: 'bg-gray-100 text-gray-600',     icon: FileText },
  sent:      { label: 'Envoyee',   color: 'bg-blue-50 text-blue-700',      icon: Send },
  partial:   { label: 'Partielle', color: 'bg-amber-50 text-amber-700',    icon: Clock },
  paid:      { label: 'Payee',     color: 'bg-green-50 text-green-700',    icon: CheckCircle },
  overdue:   { label: 'En retard', color: 'bg-red-50 text-red-700',        icon: AlertCircle },
  cancelled: { label: 'Annulee',   color: 'bg-gray-100 text-gray-400',     icon: XCircle }
}

const VAT_RATES = [8.1, 2.6, 3.8]

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
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
      <Icon size={14} />
      {cfg.label}
    </span>
  )
}

const SectionCard = ({ title, children, className = '' }) => (
  <div className={`ds-card p-5 ${className}`}>
    {title && (
      <h3 className="ds-card-title text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        {title}
      </h3>
    )}
    {children}
  </div>
)

// ── Data fetching ──

async function fetchInvoice(id) {
  const { data } = await api.get(`/items/client_invoices/${id}`, {
    params: {
      fields: [
        'id', 'invoice_number', 'client_name', 'client_address',
        'date_issued', 'due_date', 'amount', 'tax_amount', 'total',
        'total_ttc', 'status', 'owner_company', 'currency', 'type',
        'items', 'notes', 'contact_id', 'project_id', 'date_created'
      ]
    }
  })
  return data?.data || data || null
}

async function fetchPayments(invoiceId) {
  const { data } = await api.get('/items/payments', {
    params: {
      filter: { invoice_id: { _eq: invoiceId } },
      fields: ['id', 'amount', 'date', 'method', 'reference', 'notes', 'status', 'date_created'],
      sort: ['-date']
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Main component ──

const InvoiceDetail = ({ invoiceId, onBack, selectedCompany }) => {
  const qc = useQueryClient()
  const [actionLoading, setActionLoading] = useState(null)

  // Fetch invoice
  const {
    data: invoice,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['client-invoice', invoiceId],
    queryFn: () => fetchInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 10_000
  })

  // Fetch payments for this invoice
  const { data: payments = [] } = useQuery({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: () => fetchPayments(invoiceId),
    enabled: !!invoiceId,
    staleTime: 10_000
  })

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/items/client_invoices/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-invoice', invoiceId] })
      qc.invalidateQueries({ queryKey: ['client-invoices'] })
    }
  })

  const handleStatusChange = async (newStatus) => {
    setActionLoading(newStatus)
    try {
      await statusMutation.mutateAsync({ id: invoiceId, status: newStatus })
    } catch (err) {
      console.error('Status update error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Parse line items — could be JSON string or array
  const lineItems = React.useMemo(() => {
    if (!invoice?.items) return []
    try {
      const items = typeof invoice.items === 'string'
        ? JSON.parse(invoice.items)
        : invoice.items
      return Array.isArray(items) ? items : []
    } catch {
      return []
    }
  }, [invoice?.items])

  // Compute totals from line items
  const totals = React.useMemo(() => {
    if (lineItems.length === 0) {
      return {
        subtotal: parseFloat(invoice?.amount || 0),
        vatBreakdown: [],
        totalVat: parseFloat(invoice?.tax_amount || 0),
        totalTtc: parseFloat(invoice?.total_ttc || invoice?.total || 0)
      }
    }

    let subtotal = 0
    const vatMap = {}

    lineItems.forEach((line) => {
      const qty = parseFloat(line.quantity || line.qty || 1)
      const price = parseFloat(line.unit_price || line.price || 0)
      const rate = parseFloat(line.vat_rate || line.tax_rate || 8.1)
      const lineTotal = qty * price
      subtotal += lineTotal

      if (!vatMap[rate]) vatMap[rate] = 0
      vatMap[rate] += lineTotal * rate / 100
    })

    const vatBreakdown = Object.entries(vatMap)
      .map(([rate, amount]) => ({ rate: parseFloat(rate), amount }))
      .sort((a, b) => b.rate - a.rate)

    const totalVat = vatBreakdown.reduce((s, v) => s + v.amount, 0)

    return {
      subtotal,
      vatBreakdown,
      totalVat,
      totalTtc: subtotal + totalVat
    }
  }, [lineItems, invoice])

  // Total paid from payments
  const totalPaid = React.useMemo(() => {
    return payments
      .filter((p) => p.status !== 'cancelled' && p.status !== 'failed')
      .reduce((s, p) => s + parseFloat(p.amount || 0), 0)
  }, [payments])

  const remainingBalance = totals.totalTtc - totalPaid

  // ── Loading / Error states ──

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-[var(--accent-hover)] animate-spin" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="ds-btn ds-btn-ghost inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Retour aux factures
        </button>
        <div className="ds-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">Facture introuvable</p>
          <p className="text-sm text-gray-500 mt-1">
            {error?.message || `La facture #${invoiceId} n'existe pas ou est inaccessible.`}
          </p>
          <button
            onClick={refetch}
            className="ds-btn ds-btn-ghost mt-4 inline-flex items-center gap-2 text-sm"
          >
            <RefreshCw size={14} />
            Reessayer
          </button>
        </div>
      </div>
    )
  }

  const status = invoice.status || 'draft'
  const canSend = status === 'draft'
  const canMarkPaid = status === 'sent' || status === 'partial' || status === 'overdue'
  const canCancel = status !== 'paid' && status !== 'cancelled'

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="ds-btn ds-btn-ghost inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Retour aux factures
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-gray-900">
              {invoice.invoice_number || `Facture #${invoice.id}`}
            </h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-gray-500">
            Creee le {formatDate(invoice.date_created)}
            {invoice.project_id && <span> — Projet #{invoice.project_id}</span>}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canSend && (
            <button
              onClick={() => handleStatusChange('sent')}
              disabled={actionLoading === 'sent'}
              className="ds-btn ds-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent-hover)] rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading === 'sent' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Envoyer
            </button>
          )}

          {canMarkPaid && (
            <button
              onClick={() => handleStatusChange('paid')}
              disabled={actionLoading === 'paid'}
              className="ds-btn inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {actionLoading === 'paid' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Marquer payee
            </button>
          )}

          <button
            onClick={() => {
              // Generate or fetch QR invoice data
              window.open(`/api/finance/invoices/${invoiceId}/qr`, '_blank')
            }}
            className="ds-btn ds-btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <QrCode size={14} />
            QR-Invoice
          </button>

          {canCancel && (
            <button
              onClick={() => {
                if (window.confirm('Annuler cette facture ? Cette action est irreversible.')) {
                  handleStatusChange('cancelled')
                }
              }}
              disabled={actionLoading === 'cancelled'}
              className="ds-btn ds-btn-ghost inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading === 'cancelled' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <XCircle size={14} />
              )}
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Client info + Lines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <SectionCard title="Informations client">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="ds-label text-xs font-medium text-gray-500 uppercase mb-1">Client</p>
                <p className="text-gray-900 font-medium">{invoice.client_name || '--'}</p>
              </div>
              {invoice.client_address && (
                <div>
                  <p className="ds-label text-xs font-medium text-gray-500 uppercase mb-1">Adresse</p>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{invoice.client_address}</p>
                </div>
              )}
              <div>
                <p className="ds-label text-xs font-medium text-gray-500 uppercase mb-1">Date d'emission</p>
                <p className="text-gray-700">{formatDate(invoice.date_issued)}</p>
              </div>
              <div>
                <p className="ds-label text-xs font-medium text-gray-500 uppercase mb-1">Echeance</p>
                <p className={`font-medium ${
                  invoice.due_date && new Date(invoice.due_date) < new Date() && status !== 'paid' && status !== 'cancelled'
                    ? 'text-red-600'
                    : 'text-gray-700'
                }`}>
                  {formatDate(invoice.due_date)}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Line items */}
          <SectionCard title="Lignes de facture">
            {lineItems.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Aucun detail de ligne disponible.</p>
                <p className="text-xs mt-1">Les montants globaux sont affiches dans le recapitulatif.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      <th className="pb-2 pr-4">Description</th>
                      <th className="pb-2 pr-4 text-right">Qte</th>
                      <th className="pb-2 pr-4 text-right">Prix unit. HT</th>
                      <th className="pb-2 pr-4 text-right">TVA %</th>
                      <th className="pb-2 text-right">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lineItems.map((line, idx) => {
                      const qty = parseFloat(line.quantity || line.qty || 1)
                      const price = parseFloat(line.unit_price || line.price || 0)
                      const rate = parseFloat(line.vat_rate || line.tax_rate || 8.1)
                      const lineTotal = qty * price

                      return (
                        <tr key={idx}>
                          <td className="py-2.5 pr-4 text-gray-800">
                            {line.description || line.name || `Ligne ${idx + 1}`}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-gray-600 tabular-nums">
                            {qty}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-gray-600 tabular-nums">
                            {formatCHF(price)}
                          </td>
                          <td className="py-2.5 pr-4 text-right text-gray-500 tabular-nums">
                            {rate}%
                          </td>
                          <td className="py-2.5 text-right font-medium text-gray-900 tabular-nums">
                            {formatCHF(lineTotal)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Notes */}
          {invoice.notes && (
            <SectionCard title="Notes">
              <p className="text-sm text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </SectionCard>
          )}
        </div>

        {/* Right column: Totals + Payments */}
        <div className="space-y-6">
          {/* Totals summary */}
          <SectionCard title="Recapitulatif">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="text-gray-900 font-medium tabular-nums">{formatCHF(totals.subtotal)}</span>
              </div>

              {totals.vatBreakdown.length > 0 ? (
                totals.vatBreakdown.map((vat) => (
                  <div key={vat.rate} className="flex justify-between text-sm">
                    <span className="text-gray-500">TVA {vat.rate}%</span>
                    <span className="text-gray-700 tabular-nums">{formatCHF(vat.amount)}</span>
                  </div>
                ))
              ) : (
                totals.totalVat > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">TVA</span>
                    <span className="text-gray-700 tabular-nums">{formatCHF(totals.totalVat)}</span>
                  </div>
                )
              )}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total TTC</span>
                  <span className="font-bold text-lg text-gray-900 tabular-nums">
                    {formatCHF(totals.totalTtc)}
                  </span>
                </div>
              </div>

              {/* Payment summary */}
              {payments.length > 0 && (
                <>
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Paye</span>
                      <span className="text-green-700 font-medium tabular-nums">{formatCHF(totalPaid)}</span>
                    </div>
                  </div>
                  {remainingBalance > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600 font-medium">Solde du</span>
                      <span className="text-red-600 font-bold tabular-nums">{formatCHF(remainingBalance)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </SectionCard>

          {/* Payment history */}
          <SectionCard title="Historique des paiements">
            {payments.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Aucun paiement enregistre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCHF(payment.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(payment.date || payment.date_created)}
                        {payment.method && ` — ${payment.method}`}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Ref: {payment.reference}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'completed' || payment.status === 'paid'
                        ? 'bg-green-50 text-green-700'
                        : payment.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {payment.status === 'completed' || payment.status === 'paid'
                        ? 'Confirme'
                        : payment.status === 'pending'
                          ? 'En attente'
                          : payment.status || 'Inconnu'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetail
