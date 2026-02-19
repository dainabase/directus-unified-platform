/**
 * QuotesModule — S-02-05
 * Page principale /superadmin/quotes.
 * Le CEO gère tous les devis clients : liste, création, édition, aperçu.
 */

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import QuotesList from './QuotesList'
import QuoteForm from './QuoteForm'
import QuoteDetail from './QuoteDetail'

const QuotesModule = ({ selectedCompany }) => {
  const [mode, setMode] = useState(null) // null | 'create' | 'edit' | 'view'
  const [selectedQuote, setSelectedQuote] = useState(null)
  const queryClient = useQueryClient()

  const handleCreate = () => {
    setSelectedQuote(null)
    setMode('create')
  }

  const handleEdit = (quote) => {
    setSelectedQuote(quote)
    setMode('edit')
  }

  const handleView = (quote) => {
    setSelectedQuote(quote)
    setMode('view')
  }

  const handleClose = () => {
    setMode(null)
    setSelectedQuote(null)
  }

  // Envoi devis
  const sendMutation = useMutation({
    mutationFn: (quote) => api.patch(`/items/quotes/${quote.id}`, {
      status: 'sent',
      sent_at: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('Devis envoyé')
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    },
    onError: () => toast.error("Erreur lors de l'envoi")
  })

  // Duplication devis
  const duplicateMutation = useMutation({
    mutationFn: async (quote) => {
      const { data: original } = await api.get(`/items/quotes/${quote.id}`, {
        params: { fields: ['*'] }
      })
      const src = original?.data
      if (!src) throw new Error('Devis introuvable')

      const copy = {
        owner_company_id: src.owner_company_id,
        contact_id: src.contact_id,
        company_id: src.company_id,
        description: src.description ? `[COPIE] ${src.description}` : '[COPIE]',
        project_type: src.project_type,
        subtotal: src.subtotal,
        tax_rate: src.tax_rate,
        tax_amount: src.tax_amount,
        total: src.total,
        deposit_percentage: src.deposit_percentage,
        deposit_amount: src.deposit_amount,
        currency: src.currency || 'CHF',
        status: 'draft'
      }
      return api.post('/items/quotes', copy)
    },
    onSuccess: () => {
      toast.success('Devis dupliqué (brouillon)')
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    },
    onError: () => toast.error('Erreur lors de la duplication')
  })

  const handleSend = (quote) => {
    if (window.confirm(`Envoyer le devis ${quote.quote_number || ''} pour signature ?`)) {
      sendMutation.mutate(quote)
    }
  }

  const handleDuplicate = (quote) => {
    duplicateMutation.mutate(quote)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des devis</h1>
        <p className="text-sm text-gray-500">
          Créer, envoyer et suivre les devis clients
        </p>
      </div>

      {/* Liste */}
      <QuotesList
        selectedCompany={selectedCompany}
        onCreateQuote={handleCreate}
        onEditQuote={handleEdit}
        onViewQuote={handleView}
        onSendQuote={handleSend}
        onDuplicateQuote={handleDuplicate}
      />

      {/* Modals */}
      {(mode === 'create' || mode === 'edit') && (
        <QuoteForm
          quote={mode === 'edit' ? selectedQuote : null}
          onClose={handleClose}
        />
      )}

      {mode === 'view' && selectedQuote && (
        <QuoteDetail
          quote={selectedQuote}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

export default QuotesModule
