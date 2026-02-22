/**
 * RevolutPaymentModal — Extracted from SupplierInvoicesPage (Phase D patch)
 * 3-step payment flow: Review → Confirm → Result
 *
 * Safety:
 * - Idempotency key (UUID) generated at modal open, sent with every request
 * - retry: 0 on useMutation (no automatic retry on financial action)
 * - Health check before opening (caller responsibility)
 * - Timeout 15s on API call
 * - Button disabled after first click via isPending
 *
 * @version 2.1.0
 * @date 2026-02-22
 */

import React, { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Wallet, X, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import api from '../../../lib/axios'

const VAT_RATE = 8.1

const formatCHF = (value) => {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(num)
}

const RevolutPaymentModal = ({ invoice, onClose, onSuccess }) => {
  const [step, setStep] = useState(1) // 1: review, 2: confirm, 3: done
  const [error, setError] = useState(null)

  // Idempotency key — generated ONCE at modal open, stable across re-renders
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [])

  const amt = parseFloat(invoice.amount) || 0
  const rate = parseFloat(invoice.vat_rate) || VAT_RATE
  const vat = amt * rate / 100
  const ttc = invoice.total_ttc ? parseFloat(invoice.total_ttc) : amt + vat
  const currency = invoice.currency || 'CHF'

  const payMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/integrations/revolut/pay', {
        supplier_invoice_id: invoice.id,
        amount: ttc,
        currency,
        supplier_name: invoice.supplier_name,
        reference: invoice.invoice_number || `SI-${invoice.id}`,
        idempotency_key: idempotencyKey
      }, {
        timeout: 15_000
      })
      return res.data
    },
    retry: 0,
    onSuccess: (data) => {
      setStep(3)
      if (onSuccess) onSuccess(invoice.id, data)
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.message || 'Erreur de paiement Revolut')
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--sep)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--tint-blue)' }}>
              <Wallet size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--label-1)' }}>
                Paiement Revolut
              </h2>
              <p className="ds-meta">
                {step === 1 ? 'Etape 1/3 — Verification' : step === 2 ? 'Etape 2/3 — Confirmation' : 'Etape 3/3 — Resultat'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--label-3)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Step 1: Review */}
          {step === 1 && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--label-2)' }}>Fournisseur</span>
                  <span className="font-medium" style={{ color: 'var(--label-1)' }}>{invoice.supplier_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--label-2)' }}>Reference</span>
                  <span className="font-medium" style={{ color: 'var(--label-1)' }}>{invoice.invoice_number || '--'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--label-2)' }}>Montant HT</span>
                  <span style={{ color: 'var(--label-1)' }}>{formatCHF(amt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--label-2)' }}>TVA {rate}%</span>
                  <span style={{ color: 'var(--label-1)' }}>{formatCHF(vat)}</span>
                </div>
                <div className="flex justify-between text-sm pt-3" style={{ borderTop: '1px solid var(--sep)' }}>
                  <span className="font-semibold" style={{ color: 'var(--label-1)' }}>Total TTC</span>
                  <span className="font-bold text-lg" style={{ color: 'var(--accent)' }}>{formatCHF(ttc)}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="ds-btn ds-btn-ghost flex-1">Annuler</button>
                <button onClick={() => setStep(2)} className="ds-btn ds-btn-primary flex-1">
                  Continuer
                </button>
              </div>
            </>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <>
              <div className="ds-alert ds-alert-warning">
                <AlertCircle size={18} />
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--semantic-orange)' }}>Confirmer le paiement</p>
                  <p className="ds-meta" style={{ marginTop: 2 }}>
                    Un virement de <strong>{formatCHF(ttc)}</strong> sera initie vers <strong>{invoice.supplier_name}</strong> via votre compte Revolut Business.
                  </p>
                </div>
              </div>

              {error && (
                <div className="ds-alert ds-alert-danger">
                  <XCircle size={16} />
                  <p className="text-sm" style={{ color: 'var(--semantic-red)' }}>{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setStep(1); setError(null) }} className="ds-btn ds-btn-ghost flex-1">
                  Retour
                </button>
                <button
                  onClick={() => payMutation.mutate()}
                  disabled={payMutation.isPending}
                  className="ds-btn ds-btn-primary flex-1"
                >
                  {payMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wallet size={14} />
                  )}
                  Confirmer le paiement
                </button>
              </div>
            </>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <>
              <div className="text-center py-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'var(--tint-green)' }}
                >
                  <CheckCircle size={28} style={{ color: 'var(--semantic-green)' }} />
                </div>
                <p className="text-lg font-semibold" style={{ color: 'var(--label-1)' }}>
                  Paiement initie
                </p>
                <p className="ds-meta mt-1">
                  Le virement de {formatCHF(ttc)} vers {invoice.supplier_name} a ete soumis a Revolut.
                </p>
              </div>
              <button onClick={onClose} className="ds-btn ds-btn-primary w-full">
                Fermer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Check Revolut health before opening the payment modal.
 * Returns { canPay: boolean, warning: string|null }
 */
export const checkRevolutHealth = async () => {
  try {
    const res = await api.get('/api/integrations/health', { timeout: 5_000 })
    const rev = res.data?.integrations?.revolut
    if (!rev?.available) {
      return { canPay: false, warning: 'Revolut est hors ligne. Verifiez le token API.' }
    }
    if (rev.warning) {
      return { canPay: true, warning: rev.warning }
    }
    return { canPay: true, warning: null }
  } catch {
    return { canPay: false, warning: 'Impossible de verifier la connexion Revolut.' }
  }
}

export default RevolutPaymentModal
