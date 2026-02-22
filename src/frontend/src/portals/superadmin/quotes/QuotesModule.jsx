/**
 * QuotesModule — S-02-05
 * Page principale /superadmin/quotes.
 * Le CEO gere tous les devis clients : liste, creation, edition, apercu.
 *
 * Actions :
 *  - Creer / Editer   -> navigation vers /superadmin/quotes/new
 *  - Envoyer           -> PATCH status = 'sent'
 *  - Dupliquer         -> POST copie en brouillon
 *  - Marquer signe     -> PATCH status = 'signed' + signature_date + signed_by
 *  - Generer facture   -> ouvre InvoiceGenerator (lazy)
 */

import React, { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import api from '../../../lib/axios'
import QuotesList from './QuotesList'
import QuoteDetail from './QuoteDetail'

const InvoiceGenerator = lazy(() => import('../invoices/InvoiceGenerator'))

const QuotesModule = ({ selectedCompany }) => {
  const [mode, setMode] = useState(null) // null | 'view'
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [invoiceQuote, setInvoiceQuote] = useState(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // --- Navigation -----------------------------------------------------------

  const handleCreate = () => {
    navigate('/superadmin/quotes/new')
  }

  const handleEdit = (quote) => {
    navigate(`/superadmin/quotes/new?quote_id=${quote.id}`)
  }

  const handleView = (quote) => {
    setSelectedQuote(quote)
    setMode('view')
  }

  const handleClose = () => {
    setMode(null)
    setSelectedQuote(null)
  }

  // --- Mutations ------------------------------------------------------------

  // Envoi devis
  const sendMutation = useMutation({
    mutationFn: (quote) => api.patch(`/items/quotes/${quote.id}`, {
      status: 'sent',
      sent_at: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('Devis envoye')
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
      toast.success('Devis duplique (brouillon)')
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    },
    onError: () => toast.error('Erreur lors de la duplication')
  })

  // Marquer comme signe
  const markSignedMutation = useMutation({
    mutationFn: (quote) => api.patch(`/items/quotes/${quote.id}`, {
      status: 'signed',
      signature_date: new Date().toISOString(),
      signed_by: 'CEO'
    }),
    onSuccess: () => {
      toast.success('Devis marque comme signe')
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    },
    onError: () => toast.error('Erreur lors de la signature')
  })

  // H-01: Envoyer pour signature DocuSeal
  const sendDocuSealMutation = useMutation({
    mutationFn: (quote) => api.post(`/api/integrations/docuseal/signature/quote/${quote.id}`),
    onSuccess: (res) => {
      if (res.data?.alreadySent) {
        toast('Demande de signature deja envoyee', { icon: 'ℹ️' })
      } else {
        toast.success('Email de signature envoye au client via DocuSeal')
      }
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    },
    onError: (err) => toast.error(`Erreur DocuSeal: ${err.response?.data?.error || err.message}`)
  })

  // --- Handlers -------------------------------------------------------------

  const handleSend = (quote) => {
    if (window.confirm(`Envoyer le devis ${quote.quote_number || ''} pour signature ?`)) {
      sendMutation.mutate(quote)
    }
  }

  const handleDuplicate = (quote) => {
    duplicateMutation.mutate(quote)
  }

  const handleMarkSigned = (quote) => {
    if (window.confirm(`Marquer le devis ${quote.quote_number || ''} comme signe ?`)) {
      markSignedMutation.mutate(quote)
    }
  }

  const handleSendDocuSeal = (quote) => {
    if (window.confirm(`Envoyer le devis ${quote.quote_number || ''} pour signature electronique via DocuSeal ?`)) {
      sendDocuSealMutation.mutate(quote)
    }
  }

  const handleGenerateInvoice = (quote) => {
    if (quote.status !== 'signed') {
      toast.error('Seuls les devis signes peuvent etre factures')
      return
    }
    setInvoiceQuote(quote)
  }

  // D.1.3 — Convert quote to invoice via Invoice Ninja
  const convertINMutation = useMutation({
    mutationFn: (quote) => api.post(`/api/invoice-ninja/quotes/${quote.id}/convert`),
    onSuccess: () => {
      toast.success('Devis converti en facture dans Invoice Ninja')
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur conversion Invoice Ninja')
  })

  const handleConvertInvoiceNinja = (quote) => {
    if (window.confirm(`Convertir le devis ${quote.quote_number || ''} en facture Invoice Ninja ?`)) {
      convertINMutation.mutate(quote)
    }
  }

  // --- Render ---------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des devis</h1>
        <p className="text-sm text-gray-500">
          Creer, envoyer et suivre les devis clients
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
        onMarkSigned={handleMarkSigned}
        onSendDocuSeal={handleSendDocuSeal}
        onGenerateInvoice={handleGenerateInvoice}
        onConvertInvoiceNinja={handleConvertInvoiceNinja}
      />

      {/* Detail modal */}
      {mode === 'view' && selectedQuote && (
        <QuoteDetail
          quote={selectedQuote}
          onClose={handleClose}
        />
      )}

      {/* Invoice generator (lazy loaded) */}
      {invoiceQuote && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"><span className="text-white text-lg">Chargement...</span></div>}>
          <InvoiceGenerator
            quote={invoiceQuote}
            onClose={() => setInvoiceQuote(null)}
          />
        </Suspense>
      )}
    </div>
  )
}

export default QuotesModule
