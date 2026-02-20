/**
 * QuoteRequests — Phase D-03
 * Liste des demandes de devis pour le prestataire connecte.
 * Filtre par provider_id. Modal soumission offre avec TVA 8.1% auto.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  Send, X, Loader2, Eye, Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

const VAT_RATE = 8.1

const STATUS_CONFIG = {
  draft: { label: 'Nouveau', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  submitted: { label: 'Soumis', color: 'bg-blue-100 text-blue-700', icon: FileText },
  accepted: { label: 'Accepte', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Refuse', color: 'bg-gray-100 text-gray-600', icon: XCircle }
}

// -- Submit offer modal --
const SubmitOfferModal = ({ proposal, onClose, onSuccess }) => {
  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      amount: '',
      deadline: '',
      notes: ''
    }
  })

  const watchAmount = watch('amount')
  const amountHT = parseFloat(watchAmount) || 0
  const vatAmount = amountHT * VAT_RATE / 100
  const totalTTC = amountHT + vatAmount

  const submitMutation = useMutation({
    mutationFn: (formData) =>
      api.patch(`/items/proposals/${proposal.id}`, {
        amount: parseFloat(formData.amount),
        vat_rate: VAT_RATE,
        vat_amount: vatAmount,
        total_ttc: totalTTC,
        deadline: formData.deadline || null,
        notes: formData.notes || null,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }),
    onSuccess: () => {
      toast.success('Offre soumise — HYPERVISUAL vous contactera sous 24h')
      queryClient.invalidateQueries({ queryKey: ['provider-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['provider-pending-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['provider-unanswered-proposals'] })
      onSuccess?.()
      onClose()
    },
    onError: () => {
      toast.error('Erreur lors de la soumission')
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Soumettre mon offre</h2>
            <p className="text-sm text-gray-500 mt-0.5">{proposal.name || 'Demande de devis'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Mission description */}
        <div className="px-6 py-4 bg-blue-50/50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description de la mission</p>
          <p className="text-sm text-gray-700">{proposal.mission_description || proposal.description || 'Aucune description'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} className="p-6 space-y-4">
          {/* Amount HT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant HT (CHF) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('amount', {
                  required: 'Le montant est obligatoire',
                  min: { value: 0.01, message: 'Le montant doit etre positif' }
                })}
                className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">CHF</span>
            </div>
            {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
          </div>

          {/* TVA calculation (auto) */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Montant HT</span>
              <span className="font-medium text-gray-900">{formatCHF(amountHT)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">TVA {VAT_RATE}%</span>
              <span className="text-gray-700">{formatCHF(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total TTC</span>
              <span className="font-bold text-blue-700">{formatCHF(totalTTC)}</span>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delai d'intervention
            </label>
            <input
              type="date"
              {...register('deadline')}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / conditions
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 resize-none"
              placeholder="Details supplementaires, conditions, remarques..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Soumettre mon offre
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -- Main page --
const QuoteRequests = () => {
  const { provider } = useProviderAuth()
  const providerId = provider?.id
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProposal, setSelectedProposal] = useState(null)

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['provider-proposals', providerId, statusFilter],
    queryFn: async () => {
      const params = {
        fields: ['id', 'name', 'description', 'mission_description', 'status', 'amount', 'vat_rate', 'total_ttc', 'deadline', 'notes', 'created_at', 'submitted_at', 'project_id'],
        filter: { provider_id: { _eq: providerId } },
        sort: ['-created_at'],
        limit: 50
      }
      if (statusFilter !== 'all') {
        params.filter.status = { _eq: statusFilter }
      }
      const { data } = await api.get('/items/proposals', { params })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 3
  })

  const filters = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'submitted', label: 'Soumis' },
    { value: 'accepted', label: 'Acceptes' },
    { value: 'rejected', label: 'Refuses' }
  ]

  const pendingCount = useMemo(() =>
    proposals.filter(p => p.status === 'pending' || p.status === 'draft').length,
    [proposals]
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1></div>
        <div className="ds-card p-6">
          <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demandes de devis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Demandes envoyees par HYPERVISUAL — soumettez votre offre avec prix et delai
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-[#0071E3] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f.label}
            {f.value === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="ds-card p-6">
        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Aucune demande de devis</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Demande</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Description</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Date</th>
                  <th className="text-right py-3 text-xs text-gray-500 font-medium">Mon offre</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Statut</th>
                  <th className="text-right py-3 text-xs text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map(p => {
                  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                  const isPending = p.status === 'pending' || p.status === 'draft'

                  return (
                    <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${isPending ? 'bg-blue-50/20' : ''}`}>
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{p.name || 'Demande'}</p>
                      </td>
                      <td className="py-3 text-gray-600 max-w-[250px] truncate">
                        {p.mission_description || p.description || '—'}
                      </td>
                      <td className="py-3 text-gray-600">
                        {p.created_at ? format(new Date(p.created_at), 'dd.MM.yyyy', { locale: fr }) : '—'}
                      </td>
                      <td className="py-3 text-right">
                        {p.amount ? (
                          <div>
                            <span className="font-medium text-gray-900">{formatCHF(p.amount)}</span>
                            <span className="text-xs text-gray-500 ml-1">HT</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          {isPending && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {isPending ? (
                          <button
                            onClick={() => setSelectedProposal(p)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors"
                          >
                            Soumettre
                          </button>
                        ) : p.status === 'submitted' ? (
                          <span className="text-xs text-blue-600 font-medium">En revision</span>
                        ) : p.status === 'accepted' ? (
                          <span className="text-xs text-emerald-600 font-medium">Accepte</span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit offer modal */}
      {selectedProposal && (
        <SubmitOfferModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
        />
      )}
    </div>
  )
}

export default QuoteRequests
