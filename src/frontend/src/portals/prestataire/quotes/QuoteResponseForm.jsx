/**
 * QuoteResponseForm — S-02-04
 * Modal de réponse à une demande de devis prestataire.
 * PATCH /items/proposals/{id} avec prix, délai, notes.
 */

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Send, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const QuoteResponseForm = ({ proposal, onClose }) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      proposed_price: proposal?.proposed_price || '',
      proposed_delay_days: proposal?.proposed_delay_days || '',
      notes: proposal?.notes || '',
      availability_date: ''
    }
  })

  useEffect(() => {
    if (proposal) {
      reset({
        proposed_price: proposal.proposed_price || '',
        proposed_delay_days: proposal.proposed_delay_days || '',
        notes: proposal.notes || '',
        availability_date: ''
      })
    }
  }, [proposal, reset])

  // Mutation : soumettre la réponse
  const submitMutation = useMutation({
    mutationFn: (data) =>
      api.patch(`/items/proposals/${proposal.id}`, {
        proposed_price: parseFloat(data.proposed_price),
        proposed_delay_days: parseInt(data.proposed_delay_days),
        notes: data.notes || null,
        availability_date: data.availability_date || null,
        status: 'submitted',
        responded_at: new Date().toISOString()
      }),
    onSuccess: () => {
      toast.success('Réponse envoyée avec succès')
      queryClient.invalidateQueries({ queryKey: ['prestataire-proposals'] })
      onClose()
    },
    onError: (err) => {
      console.error('Erreur soumission réponse devis:', err)
      toast.error('Erreur lors de l\'envoi de la réponse')
    }
  })

  // Mutation : refuser la mission
  const rejectMutation = useMutation({
    mutationFn: () =>
      api.patch(`/items/proposals/${proposal.id}`, {
        status: 'rejected',
        responded_at: new Date().toISOString()
      }),
    onSuccess: () => {
      toast.success('Mission refusée')
      queryClient.invalidateQueries({ queryKey: ['prestataire-proposals'] })
      onClose()
    },
    onError: (err) => {
      console.error('Erreur refus mission:', err)
      toast.error('Erreur lors du refus')
    }
  })

  const onSubmit = (data) => {
    submitMutation.mutate(data)
  }

  const handleReject = () => {
    if (window.confirm('Êtes-vous sûr de vouloir refuser cette mission ?')) {
      rejectMutation.mutate()
    }
  }

  const isSubmitting = submitMutation.isPending || rejectMutation.isPending

  if (!proposal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Répondre au devis</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {proposal.project_id?.name || 'Projet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Résumé demande */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description de la demande</p>
          <p className="text-sm text-gray-700">{proposal.description || 'Aucune description fournie'}</p>
          {proposal.amount && (
            <p className="text-xs text-gray-500 mt-2">
              Budget indicatif : <span className="font-medium text-gray-700">{formatCHF(proposal.amount)}</span>
            </p>
          )}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Prix proposé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mon prix (CHF) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('proposed_price', {
                  required: 'Le prix est obligatoire',
                  min: { value: 0, message: 'Le prix doit être positif' }
                })}
                className="ds-input w-full pr-12"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">CHF</span>
            </div>
            {errors.proposed_price && (
              <p className="text-xs text-red-600 mt-1">{errors.proposed_price.message}</p>
            )}
          </div>

          {/* Délai en jours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Délai de réalisation (jours) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              {...register('proposed_delay_days', {
                required: 'Le délai est obligatoire',
                min: { value: 1, message: 'Minimum 1 jour' }
              })}
              className="ds-input w-full"
              placeholder="Ex: 15"
            />
            {errors.proposed_delay_days && (
              <p className="text-xs text-red-600 mt-1">{errors.proposed_delay_days.message}</p>
            )}
          </div>

          {/* Date de disponibilité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de disponibilité
            </label>
            <input
              type="date"
              {...register('availability_date')}
              className="ds-input w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes / commentaires
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="ds-input w-full resize-none"
              placeholder="Détails supplémentaires, conditions, remarques..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50"
            >
              <XCircle size={16} />
              Refuser la mission
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium bg-[var(--accent-hover)] text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Soumettre
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuoteResponseForm
