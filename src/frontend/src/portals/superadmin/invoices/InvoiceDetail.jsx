/**
 * InvoiceDetail — S-03-05
 * Vue detail facture SuperAdmin avec QR Swiss et timeline statut.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Edit3, Loader2, AlertCircle,
  Clock, Send, Eye, CheckCircle2, FileText
} from 'lucide-react'
import api from '../../../lib/axios'
import QRSwiss, { displayCHF } from '../../../components/payments/QRSwiss'

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Status timeline steps
const TIMELINE_STEPS = [
  { key: 'draft', label: 'Creee', icon: FileText },
  { key: 'sent', label: 'Envoyee', icon: Send },
  { key: 'viewed', label: 'Vue', icon: Eye },
  { key: 'paid', label: 'Payee', icon: CheckCircle2 }
]

const STATUS_ORDER = { draft: 0, pending: 1, sent: 1, viewed: 2, partial: 2, paid: 3, overdue: 1, cancelled: -1 }

async function fetchInvoice(id) {
  const { data } = await api.get(`/items/client_invoices/${id}`, {
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

const InvoiceDetail = ({ invoiceId, onBack, onEdit }) => {
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['admin-invoice-detail', invoiceId],
    queryFn: () => fetchInvoice(invoiceId),
    enabled: !!invoiceId
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Facture introuvable</p>
        <button onClick={onBack} className="mt-3 text-sm text-blue-600 underline">Retour</button>
      </div>
    )
  }

  const oc = invoice.owner_company || {}
  const currentStep = STATUS_ORDER[invoice.status] ?? 0

  const creditor = {
    iban: oc.iban || '',
    name: oc.name || 'HYPERVISUAL',
    street: oc.address || '',
    zip: oc.zip_code || '',
    city: oc.city || '',
    country: oc.country || 'CH'
  }

  const debtor = invoice.client_name ? {
    name: invoice.client_name,
    street: (invoice.client_address || '').split('\n')[0] || '',
    zip: '',
    city: ''
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900">Facture {invoice.invoice_number}</h2>
          <p className="text-sm text-gray-500">
            Client: {invoice.client_name || '—'} | {oc.name || '—'}
          </p>
        </div>
        <button
          onClick={() => onEdit(invoice)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
        >
          <Edit3 size={14} /> Modifier
        </button>
      </div>

      {/* Status timeline */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
        <div className="flex items-center justify-between">
          {TIMELINE_STEPS.map((step, i) => {
            const isCompleted = currentStep >= i
            const isCurrent = currentStep === i
            const Icon = step.icon
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}
                    ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                  `}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-xs mt-1.5 ${isCompleted ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > i ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Amounts */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Montant HT</p>
            <p className="text-lg font-semibold text-gray-900">{displayCHF(invoice.total_ht)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">TVA ({invoice.tax_rate || 8.1}%)</p>
            <p className="text-lg font-semibold text-gray-900">{displayCHF(invoice.total_tva)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total TTC</p>
            <p className="text-lg font-bold text-blue-600">{displayCHF(invoice.total_ttc)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Emise le</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.date_issued)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Echeance</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.due_date)}</p>
          </div>
        </div>
      </div>

      {/* Line items */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Lignes de facture</h3>
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

      {/* QR Swiss */}
      {creditor.iban && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">QR-Facture suisse</h3>
          <QRSwiss
            invoice={invoice}
            creditor={creditor}
            debtor={debtor}
            reference={invoice.qr_reference || ''}
            referenceType={invoice.qr_reference ? 'QRR' : 'NON'}
            message={`Facture ${invoice.invoice_number}`}
          />
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}
    </div>
  )
}

export default InvoiceDetail
