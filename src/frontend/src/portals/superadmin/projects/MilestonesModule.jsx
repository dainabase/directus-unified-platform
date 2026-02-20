/**
 * MilestonesModule — I-01
 * Facturation par jalons (deliverables → factures)
 * Affiche les livrables d'un projet avec statut facturation.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Milestone, FileText, CheckCircle, Clock, AlertCircle,
  Loader2, Receipt, ChevronDown, ChevronUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchMilestones(projectId) {
  const res = await fetch(`${API_BASE}/api/milestones/project/${projectId}`)
  if (!res.ok) throw new Error('Erreur chargement jalons')
  return res.json()
}

async function invoiceMilestone(deliverableId) {
  const res = await fetch(`${API_BASE}/api/milestones/${deliverableId}/invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erreur facturation')
  }
  return res.json()
}

const STATUS_ICONS = {
  completed: <CheckCircle className="w-4 h-4 text-green-500" />,
  in_progress: <Clock className="w-4 h-4 text-amber-500" />,
  pending: <AlertCircle className="w-4 h-4 text-gray-400" />,
  draft: <AlertCircle className="w-4 h-4 text-gray-400" />
}

const STATUS_LABELS = {
  completed: 'Fait',
  in_progress: 'En cours',
  pending: 'A faire',
  draft: 'Brouillon'
}

function formatCHF(amount) {
  return `CHF ${parseFloat(amount || 0).toLocaleString('fr-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function MilestonesModule({ projectId, projectName, selectedCompany }) {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState(true)

  const { data, isLoading, error } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => fetchMilestones(projectId),
    enabled: !!projectId
  })

  const invoiceMut = useMutation({
    mutationFn: invoiceMilestone,
    onSuccess: (res) => {
      toast.success(`Facture ${res.invoice?.invoice_number} generee`)
      qc.invalidateQueries({ queryKey: ['milestones', projectId] })
    },
    onError: (err) => toast.error(err.message)
  })

  if (!projectId) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <p className="text-gray-400">Selectionnez un projet pour voir les jalons.</p>
      </div>
    )
  }

  const milestones = data?.milestones || []
  const summary = data?.summary || {}

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Milestone className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-semibold text-sm">
              Jalons — {projectName || 'Projet'}
            </h3>
            <p className="text-gray-400 text-xs">
              {summary.invoiced || 0}/{summary.total || 0} factures —{' '}
              {formatCHF(summary.invoiced_amount)} / {formatCHF(summary.total_amount)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary.can_invoice > 0 && (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
              {summary.can_invoice} a facturer
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Table */}
      {expanded && (
        <div className="border-t border-white/10">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm p-4">{error.message}</p>
          ) : milestones.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">Aucun livrable pour ce projet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b border-white/10">
                  <th className="text-left p-3">Livrable</th>
                  <th className="text-center p-3">Statut</th>
                  <th className="text-right p-3">Montant</th>
                  <th className="text-center p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map(m => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <p className="text-white font-medium">{m.title}</p>
                      {m.description && <p className="text-gray-500 text-xs truncate max-w-xs">{m.description}</p>}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {STATUS_ICONS[m.status] || STATUS_ICONS.pending}
                        <span className="text-xs text-gray-300">{STATUS_LABELS[m.status] || m.status}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-white">
                      {m.amount ? formatCHF(m.amount) : '—'}
                    </td>
                    <td className="p-3 text-center">
                      {m.is_invoiced ? (
                        <span className="text-green-400 text-xs flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3" /> Facture
                        </span>
                      ) : m.can_invoice ? (
                        <button
                          onClick={() => invoiceMut.mutate(m.id)}
                          disabled={invoiceMut.isPending}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs px-3 py-1 rounded-lg flex items-center gap-1 mx-auto transition-colors"
                        >
                          {invoiceMut.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Receipt className="w-3 h-3" />
                          )}
                          Facturer
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Footer summary */}
          {milestones.length > 0 && (
            <div className="flex justify-between items-center p-3 bg-white/5 text-xs">
              <span className="text-gray-400">
                Total facture : {formatCHF(summary.invoiced_amount)} / {formatCHF(summary.total_amount)}
              </span>
              <div className="h-2 w-32 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${summary.total_amount ? (summary.invoiced_amount / summary.total_amount * 100) : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
