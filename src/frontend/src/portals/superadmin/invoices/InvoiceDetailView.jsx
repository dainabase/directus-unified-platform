/**
 * InvoiceDetailView — Phase 3
 * Full invoice detail page with Swiss QR payment info.
 * Route: /superadmin/invoices/:id
 */

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Receipt, Printer, Download, Send, CheckCircle2,
  Building2, User, Calendar, Clock, Loader2, AlertCircle
} from 'lucide-react'
import api from '../../../lib/axios'

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', {
  style: 'currency', currency: 'CHF', minimumFractionDigits: 2
}).format(v || 0)

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: 'long', year: 'numeric' })
}

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-700' },
  pending: { label: 'En attente', bg: 'bg-amber-100', text: 'text-amber-700' },
  sent: { label: 'Envoyée', bg: 'bg-blue-100', text: 'text-blue-700' },
  paid: { label: 'Payée', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  partial: { label: 'Partielle', bg: 'bg-orange-100', text: 'text-orange-700' },
  overdue: { label: 'En retard', bg: 'bg-red-100', text: 'text-red-700' },
  cancelled: { label: 'Annulée', bg: 'bg-gray-100', text: 'text-gray-500' }
}

const InvoiceDetailView = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/client_invoices/${id}`, {
        params: { fields: ['*'] }
      })
      return data?.data
    },
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Facture introuvable</h2>
        <button onClick={() => navigate('/superadmin/invoices/clients')} className="text-blue-600 hover:underline">
          ← Retour aux factures
        </button>
      </div>
    )
  }

  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft
  const amount = parseFloat(invoice.amount || 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('/superadmin/invoices/clients')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft size={16} /> Retour aux factures
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="text-blue-600" />
            {invoice.invoice_number || 'Facture'}
          </h1>
          <p className="text-gray-500 mt-1">Créée le {formatDate(invoice.date_created)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Imprimer">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invoice details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Client</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.client_name || '—'}</p>
                  <p className="text-xs text-gray-500">Client</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.owner_company || '—'}</p>
                  <p className="text-xs text-gray-500">Entreprise émettrice</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Montant</h3>
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-gray-900">{formatCHF(amount)}</p>
              <p className="text-sm text-gray-500 mt-2">{invoice.currency || 'CHF'}</p>
            </div>
            {invoice.invoice_type && (
              <div className="text-center">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {invoice.invoice_type === 'deposit' ? 'Acompte' :
                   invoice.invoice_type === 'balance' ? 'Solde' :
                   invoice.invoice_type === 'full' ? 'Facture complète' : invoice.invoice_type}
                </span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Historique</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Créée le {formatDate(invoice.date_created)}</span>
              </div>
              {invoice.date_sent && (
                <div className="flex items-center gap-3 text-sm">
                  <Send className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Envoyée le {formatDate(invoice.date_sent)}</span>
                </div>
              )}
              {invoice.date_paid && (
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Payée le {formatDate(invoice.date_paid)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: QR Code & Payment */}
        <div className="space-y-6">
          {/* QR Payment placeholder */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Paiement QR</h3>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs">QR-Facture Swiss</p>
                <p className="text-xs">{formatCHF(amount)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              QR-Invoice conforme norme suisse SIX
            </p>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetailView
