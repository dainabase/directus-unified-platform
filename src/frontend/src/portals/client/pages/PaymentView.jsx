/**
 * PaymentView — Client Portal Payment Interface
 *
 * Payment page for a specific invoice with 3 options:
 *   1. QR-Invoice (primary) — Swiss QR payment slip
 *   2. Revolut — Card payment link
 *   3. Virement bancaire — Manual bank transfer
 *
 * Polls payment status every 30s and shows success state when confirmed.
 *
 * Route: /client/payment/:invoiceId
 */

import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Copy, CreditCard, Building2, QrCode,
  CheckCircle, Loader2, AlertCircle, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'
import StatusBadge from '../components/StatusBadge'

/* ── Formatters ── */
const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2
  }).format(v || 0)

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '—'

/* ── Bank config (production values come from owner_companies) ── */
const BANK_CONFIG = {
  iban: 'CH56 0483 5012 3456 7800 9',
  ibanRaw: 'CH5604835012345678009',
  bic: 'CRESCHZZ80A',
  bank: 'Credit Suisse',
  beneficiary: 'HMF Corporation SA',
  address: 'Fribourg, Suisse'
}

/* ── Revolut placeholder ── */
const REVOLUT_PAY_URL = 'https://pay.revolut.com/placeholder'

const PaymentView = () => {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { client } = useClientAuth()
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  /* ── Fetch invoice ── */
  const {
    data: invoice,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['client-invoice-payment', invoiceId],
    queryFn: async () => {
      const { data } = await api.get(`/items/client_invoices/${invoiceId}`, {
        params: {
          fields: [
            'id',
            'invoice_number',
            'client_name',
            'amount',
            'total',
            'status',
            'due_date',
            'tax_rate',
            'tax_amount',
            'currency',
            'qr_reference',
            'company_id',
            'contact_id',
            'type',
            'description'
          ]
        }
      })
      return data?.data || null
    },
    enabled: !!invoiceId
  })

  /* ── Poll payments every 30s to detect confirmation ── */
  useQuery({
    queryKey: ['payment-poll', invoiceId],
    queryFn: async () => {
      const { data } = await api.get('/items/payments', {
        params: {
          filter: {
            invoice_id: { _eq: invoiceId },
            status: { _eq: 'completed' }
          },
          fields: ['id', 'amount', 'payment_date', 'status'],
          limit: 1
        }
      })
      const payments = data?.data || []
      if (payments.length > 0) {
        setPaymentConfirmed(true)
      }
      return payments
    },
    enabled: !!invoiceId && !paymentConfirmed,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false
  })

  /* ── Copy IBAN to clipboard ── */
  const handleCopyIban = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(BANK_CONFIG.ibanRaw)
      toast.success('IBAN copie dans le presse-papiers')
    } catch {
      toast.error('Impossible de copier l\'IBAN')
    }
  }, [])

  /* ── Copy reference to clipboard ── */
  const handleCopyReference = useCallback(async () => {
    const ref = invoice?.qr_reference || invoice?.invoice_number || ''
    try {
      await navigator.clipboard.writeText(ref)
      toast.success('Reference copiee dans le presse-papiers')
    } catch {
      toast.error('Impossible de copier la reference')
    }
  }, [invoice])

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-hover)' }} />
      </div>
    )
  }

  /* ── Error state ── */
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-gray-700 font-medium mb-1">Erreur de chargement</p>
        <p className="text-sm text-gray-500 mb-4">Impossible de charger les details de la facture.</p>
        <button
          onClick={() => navigate('/client/invoices')}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: 'var(--accent-hover)' }}
        >
          Retour aux factures
        </button>
      </div>
    )
  }

  /* ── Not found ── */
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
        <p className="text-gray-700 font-medium mb-1">Facture introuvable</p>
        <p className="text-sm text-gray-500 mb-4">
          La facture demandee n'existe pas ou vous n'y avez pas acces.
        </p>
        <button
          onClick={() => navigate('/client/invoices')}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: 'var(--accent-hover)' }}
        >
          Retour aux factures
        </button>
      </div>
    )
  }

  const reference = invoice.qr_reference || invoice.invoice_number || '—'
  const totalAmount = Number(invoice.total) || Number(invoice.amount) || 0

  /* ── Payment confirmed success state ── */
  if (paymentConfirmed || invoice.status === 'paid') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="relative mb-6">
          <CheckCircle size={64} style={{ color: 'var(--semantic-green)' }} />
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(52,199,89,0.15)' }}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement confirme !</h1>
        <p className="text-gray-500 mb-1">
          Votre paiement pour la facture <strong>{invoice.invoice_number}</strong> a ete recu.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Un recu sera envoye a votre adresse email.
        </p>
        <button
          onClick={() => navigate('/client/invoices')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--accent-hover)' }}
        >
          Retour aux factures
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/client/invoices')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            Paiement — Facture #{invoice.invoice_number}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Choisissez votre mode de paiement
          </p>
        </div>
      </div>

      {/* ── Invoice Summary ── */}
      <div className="ds-card p-5">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex-1 min-w-[140px]">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Client</p>
            <p className="text-sm font-medium text-gray-900">
              {invoice.client_name || client?.first_name + ' ' + client?.last_name || '—'}
            </p>
          </div>
          <div className="min-w-[140px]">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Montant TTC</p>
            <p className="font-bold text-gray-900" style={{ fontSize: 26, lineHeight: '32px' }}>
              {formatCHF(totalAmount)}
            </p>
          </div>
          <div className="min-w-[120px]">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Echeance</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(invoice.due_date)}</p>
          </div>
          <div className="min-w-[120px]">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reference</p>
            <p className="text-sm font-medium text-gray-900">{reference}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Statut</p>
            <StatusBadge status={invoice.status} />
          </div>
        </div>
      </div>

      {/* ── Option 1: QR-Invoice (Primary) ── */}
      <div className="ds-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <QrCode size={20} style={{ color: 'var(--accent-hover)' }} />
          <h2 className="text-base font-semibold text-gray-900">QR-Invoice</h2>
          <span
            className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(0,113,227,0.10)', color: 'var(--accent-hover)' }}
          >
            Recommande
          </span>
        </div>

        {/* QR Code placeholder */}
        <div
          className="w-full max-w-[200px] h-[200px] mx-auto mb-5 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          <div className="text-center">
            <QrCode size={48} className="mx-auto mb-2 text-gray-400" />
            <p className="text-xs text-gray-400 font-medium">QR-Invoice</p>
          </div>
        </div>

        {/* Bank details */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">IBAN</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-900">{BANK_CONFIG.iban}</span>
              <button
                onClick={handleCopyIban}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Copier IBAN"
              >
                <Copy size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Beneficiaire</span>
            <span className="text-gray-900 font-medium">
              {BANK_CONFIG.beneficiary}, {BANK_CONFIG.address}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Reference</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-900">{reference}</span>
              <button
                onClick={handleCopyReference}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Copier reference"
              >
                <Copy size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-500">Montant</span>
            <span className="text-gray-900 font-bold">{formatCHF(totalAmount)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Scannez avec votre application bancaire suisse pour effectuer le paiement.
        </p>
      </div>

      {/* ── Option 2: Revolut Link ── */}
      <div className="ds-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={20} style={{ color: 'var(--accent-hover)' }} />
          <h2 className="text-base font-semibold text-gray-900">Payer par carte</h2>
        </div>

        <button
          onClick={() => window.open(`${REVOLUT_PAY_URL}?amount=${totalAmount}&ref=${reference}`, '_blank')}
          className="w-full py-3 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--accent-hover)' }}
        >
          Payer via Revolut <ExternalLink size={14} />
        </button>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Paiement securise par Revolut Business
        </p>
      </div>

      {/* ── Option 3: Virement bancaire ── */}
      <div className="ds-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} style={{ color: 'var(--accent-hover)' }} />
          <h2 className="text-base font-semibold text-gray-900">Virement bancaire</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">IBAN</span>
            <span className="font-mono text-gray-900">{BANK_CONFIG.iban}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">BIC / SWIFT</span>
            <span className="font-mono text-gray-900">{BANK_CONFIG.bic}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Banque</span>
            <span className="text-gray-900">{BANK_CONFIG.bank}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Beneficiaire</span>
            <span className="text-gray-900">{BANK_CONFIG.beneficiary}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-500">Reference obligatoire</span>
            <span className="font-mono text-gray-900 font-medium">{invoice.invoice_number}</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0,113,227,0.06)' }}>
          <p className="text-xs" style={{ color: 'var(--accent-hover)' }}>
            Veuillez indiquer la reference <strong>{invoice.invoice_number}</strong> lors de votre virement
            afin que votre paiement soit automatiquement rapproche.
          </p>
        </div>
      </div>

      {/* ── Legal footer ── */}
      <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg)' }}>
        <p className="text-xs text-gray-400">
          <strong>Paiement securise</strong> — Les donnees bancaires sont transmises de maniere
          chiffree. Conformite suisse (FinSA/FinIA). Devise : CHF.
          TVA incluse au taux de {invoice.tax_rate || 8.1}%.
        </p>
      </div>
    </div>
  )
}

export default PaymentView
