/**
 * QuotesList — S-02-04
 * Liste des demandes de devis reçues par le prestataire.
 * Collection : proposals
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { format, differenceInHours, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const STATUS_CONFIG = {
  new: { label: 'Nouveau', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  submitted: { label: 'Soumis', color: 'bg-blue-100 text-blue-700', icon: FileText },
  accepted: { label: 'Accepté', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Refusé', color: 'bg-gray-100 text-gray-600', icon: XCircle }
}

const fetchProposals = async (statusFilter) => {
  try {
    const params = {
      fields: [
        'id', 'status', 'description', 'project_id.name', 'project_id.id',
        'amount', 'deadline_response', 'created_at', 'viewed_at',
        'proposed_price', 'proposed_delay_days', 'notes'
      ],
      sort: ['-created_at'],
      limit: 50
    }

    if (statusFilter && statusFilter !== 'all') {
      params.filter = { status: { _eq: statusFilter } }
    }

    const { data } = await api.get('/items/proposals', { params })
    return data?.data || []
  } catch {
    return []
  }
}

const QuotesList = ({ onSelectQuote, onRespondQuote }) => {
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['prestataire-proposals', statusFilter],
    queryFn: () => fetchProposals(statusFilter),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3
  })

  // Marquer comme vu au clic
  const queryClient = useQueryClient()
  const markViewed = useMutation({
    mutationFn: (id) => api.patch(`/items/proposals/${id}`, { viewed_at: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prestataire-proposals'] })
  })

  const handleRowClick = (proposal) => {
    if (!proposal.viewed_at) {
      markViewed.mutate(proposal.id)
    }
    onSelectQuote?.(proposal)
  }

  const getDeadlineInfo = (deadline) => {
    if (!deadline) return null
    const deadlineDate = new Date(deadline)
    if (isPast(deadlineDate)) return { text: 'Expiré', urgent: true }
    const hoursLeft = differenceInHours(deadlineDate, new Date())
    if (hoursLeft < 48) return { text: `Il reste ${hoursLeft}h`, urgent: true }
    return { text: format(deadlineDate, 'dd MMM yyyy', { locale: fr }), urgent: false }
  }

  if (isLoading) {
    return (
      <div className="ds-card p-6">
        <div className="h-64 ds-skeleton rounded-lg" />
      </div>
    )
  }

  const filters = [
    { value: 'all', label: 'Tous' },
    { value: 'new', label: 'Nouveaux' },
    { value: 'pending', label: 'En attente' },
    { value: 'submitted', label: 'Soumis' },
    { value: 'accepted', label: 'Acceptés' },
    { value: 'rejected', label: 'Refusés' }
  ]

  return (
    <div className="ds-card p-6">
      {/* Header + Filtres */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Demandes de devis
          </h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {proposals?.length || 0}
          </span>
        </div>
      </div>

      {/* Filtres par statut */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      {(!proposals || proposals.length === 0) ? (
        <p className="text-sm text-gray-500 text-center py-8">Aucune demande de devis</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs text-gray-500 font-medium">N°</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Projet</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Description</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Date demande</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Deadline réponse</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">Mon prix</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Statut</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => {
                const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                const deadlineInfo = getDeadlineInfo(p.deadline_response)
                const isNew = !p.viewed_at && (p.status === 'new' || p.status === 'pending')

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer ${isNew ? 'bg-purple-50/30' : ''}`}
                    onClick={() => handleRowClick(p)}
                  >
                    <td className="py-3 text-gray-500 font-mono text-xs">
                      {p.id?.toString().slice(0, 8)}
                    </td>
                    <td className="py-3 font-medium text-gray-900">
                      {p.project_id?.name || '—'}
                    </td>
                    <td className="py-3 text-gray-600 max-w-[200px] truncate">
                      {p.description || '—'}
                    </td>
                    <td className="py-3 text-gray-600">
                      {p.created_at ? format(new Date(p.created_at), 'dd/MM/yyyy', { locale: fr }) : '—'}
                    </td>
                    <td className="py-3">
                      {deadlineInfo ? (
                        <span className={`text-xs font-medium ${deadlineInfo.urgent ? 'text-red-600' : 'text-gray-600'}`}>
                          {deadlineInfo.text}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {p.proposed_price ? formatCHF(p.proposed_price) : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {isNew && (
                          <span className="inline-flex w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      {(p.status === 'new' || p.status === 'pending') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRespondQuote?.(p) }}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                        >
                          Répondre
                        </button>
                      )}
                      {p.status === 'submitted' && (
                        <span className="text-xs text-blue-600 font-medium">En révision</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default QuotesList
