/**
 * ApprovalQueue — I-05 + I-06
 * Workflow validation factures fournisseurs + Detection ecarts devis/facture.
 * File d'attente CEO avec badges deviation colores.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ClipboardCheck, CheckCircle, XCircle, Loader2, AlertTriangle,
  Calendar, X, FileWarning, TrendingDown, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchPending() {
  const res = await fetch(`${API_BASE}/api/supplier-invoices/pending`)
  if (!res.ok) throw new Error('Erreur chargement file attente')
  return res.json()
}

async function fetchPendingCount() {
  const res = await fetch(`${API_BASE}/api/supplier-invoices/pending/count`)
  if (!res.ok) return { count: 0 }
  return res.json()
}

async function approveInvoice(id, data) {
  const res = await fetch(`${API_BASE}/api/supplier-invoices/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur approbation')
  }
  return res.json()
}

async function rejectInvoice(id, data) {
  const res = await fetch(`${API_BASE}/api/supplier-invoices/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur rejet')
  }
  return res.json()
}

function formatCHF(amount) {
  return `CHF ${parseFloat(amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH')
}

function DeviationBadge({ deviation }) {
  if (!deviation || deviation.status === 'no_quote') {
    return <span className="text-gray-500 text-xs">Pas de devis</span>
  }
  const colors = {
    ok: 'bg-green-500/20 text-green-400',
    warning: 'bg-amber-500/20 text-amber-400',
    blocked: 'bg-red-500/20 text-red-400'
  }
  const icons = {
    ok: <CheckCircle className="w-3 h-3" />,
    warning: <AlertTriangle className="w-3 h-3" />,
    blocked: <XCircle className="w-3 h-3" />
  }
  const sign = deviation.deviation_percentage >= 0 ? '+' : ''
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${colors[deviation.status]}`}>
      {icons[deviation.status]}
      {sign}{deviation.deviation_percentage}%
    </span>
  )
}

export default function ApprovalQueue({ selectedCompany }) {
  const qc = useQueryClient()
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [approveModal, setApproveModal] = useState(null)
  const [paymentDate, setPaymentDate] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['supplier-invoices-pending'],
    queryFn: fetchPending,
    refetchInterval: 30000
  })

  const { data: countData } = useQuery({
    queryKey: ['supplier-invoices-pending-count'],
    queryFn: fetchPendingCount,
    refetchInterval: 30000
  })

  const approveMut = useMutation({
    mutationFn: ({ id, data }) => approveInvoice(id, data),
    onSuccess: () => {
      toast.success('Facture approuvee')
      qc.invalidateQueries({ queryKey: ['supplier-invoices-pending'] })
      qc.invalidateQueries({ queryKey: ['supplier-invoices-pending-count'] })
      setApproveModal(null)
      setPaymentDate('')
    },
    onError: (err) => toast.error(err.message)
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, data }) => rejectInvoice(id, data),
    onSuccess: () => {
      toast.success('Facture rejetee')
      qc.invalidateQueries({ queryKey: ['supplier-invoices-pending'] })
      qc.invalidateQueries({ queryKey: ['supplier-invoices-pending-count'] })
      setRejectModal(null)
      setRejectReason('')
    },
    onError: (err) => toast.error(err.message)
  })

  const invoices = data?.invoices || []
  const pendingCount = countData?.count || invoices.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-orange-400" />
          <h2 className="text-white font-semibold">File d'approbation</h2>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {pendingCount}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="ds-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
            <p className="text-green-400 font-medium">Aucune facture en attente</p>
            <p className="text-gray-500 text-xs">Toutes les factures sont traitees.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-zinc-200">
                <th className="text-left p-3">N°</th>
                <th className="text-left p-3">Prestataire</th>
                <th className="text-right p-3">Montant</th>
                <th className="text-center p-3">Ecart devis</th>
                <th className="text-left p-3">Recue le</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const isBlocked = inv.deviation?.status === 'blocked'
                return (
                  <tr key={inv.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="p-3 font-mono text-white text-xs">{inv.invoice_number || '—'}</td>
                    <td className="p-3 text-gray-300">{inv.supplier_name || '—'}</td>
                    <td className="p-3 text-right text-white font-medium">
                      {formatCHF(inv.total_ttc || inv.amount)}
                    </td>
                    <td className="p-3 text-center">
                      <DeviationBadge deviation={inv.deviation} />
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{formatDate(inv.date_created)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setApproveModal(inv)}
                          disabled={isBlocked}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isBlocked
                              ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          }`}
                          title={isBlocked ? 'Ecart > 5% — contact requis' : 'Approuver'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRejectModal(inv)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-1.5 rounded-lg transition-colors"
                          title="Rejeter"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Approve Modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Approuver la facture</h3>
              <button onClick={() => setApproveModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 text-sm">
              {approveModal.supplier_name} — {formatCHF(approveModal.total_ttc || approveModal.amount)}
            </p>
            {approveModal.deviation?.status === 'warning' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Ecart devis {approveModal.deviation.deviation_percentage}% (avertissement)
              </div>
            )}
            <div>
              <label className="text-gray-400 text-xs">Date de paiement prevue</label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-white text-sm mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setApproveModal(null)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => approveMut.mutate({
                  id: approveModal.id,
                  data: {
                    approved_by: 'CEO',
                    payment_date: paymentDate || undefined,
                    force: approveModal.deviation?.status === 'warning'
                  }
                })}
                disabled={approveMut.isPending}
                className="bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {approveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approuver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Rejeter la facture</h3>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 text-sm">
              {rejectModal.supplier_name} — {formatCHF(rejectModal.total_ttc || rejectModal.amount)}
            </p>
            <div>
              <label className="text-gray-400 text-xs">Raison du rejet (obligatoire)</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-white text-sm mt-1"
                rows={3}
                placeholder="Raison du rejet..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => rejectMut.mutate({
                  id: rejectModal.id,
                  data: { rejected_by: 'CEO', reason: rejectReason }
                })}
                disabled={!rejectReason.trim() || rejectMut.isPending}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {rejectMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { fetchPendingCount }
