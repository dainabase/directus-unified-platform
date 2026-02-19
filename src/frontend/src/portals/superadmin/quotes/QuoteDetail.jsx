/**
 * QuoteDetail — S-02-05
 * Vue lecture seule d'un devis avec timeline statut et bouton d'envoi.
 * Aperçu "document" du devis.
 */

import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X, Send, FileText, CheckCircle, Eye, Clock, XCircle, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

const formatDate = (d) => d ? format(new Date(d), 'dd MMMM yyyy à HH:mm', { locale: fr }) : null

const QuoteDetail = ({ quote, onClose }) => {
  const queryClient = useQueryClient()

  const sendMutation = useMutation({
    mutationFn: () => api.patch(`/items/quotes/${quote.id}`, {
      status: 'sent',
      sent_at: new Date().toISOString()
    }),
    onSuccess: () => {
      toast.success('Devis envoyé pour signature')
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
      onClose()
    },
    onError: (err) => {
      console.error('Erreur envoi devis:', err)
      toast.error("Erreur lors de l'envoi")
    }
  })

  if (!quote) return null

  const contactName = quote.contact_id
    ? `${quote.contact_id.first_name || ''} ${quote.contact_id.last_name || ''}`.trim()
    : '—'

  // Timeline statut
  const timelineSteps = [
    {
      label: 'Créé',
      date: quote.created_at,
      icon: FileText,
      done: true
    },
    {
      label: 'Envoyé',
      date: quote.sent_at,
      icon: Send,
      done: !!quote.sent_at
    },
    {
      label: 'Consulté',
      date: quote.viewed_at,
      icon: Eye,
      done: !!quote.viewed_at
    },
    {
      label: 'Signé',
      date: quote.signed_at,
      icon: CheckCircle,
      done: !!quote.is_signed
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Devis {quote.quote_number || `#${quote.id?.toString().slice(0, 8)}`}
            </h2>
            <p className="text-sm text-gray-500">
              {quote.owner_company_id?.name || 'Entreprise'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Timeline */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.done ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <p className={`text-xs font-medium mt-1.5 ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {format(new Date(step.date), 'dd/MM/yy', { locale: fr })}
                      </p>
                    )}
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      step.done ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Aperçu document */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            {/* En-tête document */}
            <div className="flex justify-between mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase">Client</p>
                <p className="font-semibold text-gray-900">{contactName}</p>
                <p className="text-sm text-gray-600">{quote.company_id?.name || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Devis N°</p>
                <p className="font-semibold text-gray-900">{quote.quote_number || '—'}</p>
                <p className="text-sm text-gray-600">
                  {quote.created_at && format(new Date(quote.created_at), 'dd/MM/yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            {/* Description */}
            {quote.description && (
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                <p className="text-sm text-gray-700">{quote.description}</p>
              </div>
            )}

            {/* Type et validité */}
            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium capitalize">{quote.project_type || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Valide jusqu'au</p>
                <p className="font-medium">
                  {quote.valid_until ? format(new Date(quote.valid_until), 'dd/MM/yyyy', { locale: fr }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Devise</p>
                <p className="font-medium">{quote.currency || 'CHF'}</p>
              </div>
            </div>

            {/* Montants */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-medium">{formatCHF(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA ({quote.tax_rate || 8.1}%)</span>
                <span className="font-medium">{formatCHF(quote.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                <span>Total TTC</span>
                <span className="text-blue-700">{formatCHF(quote.total)}</span>
              </div>
            </div>

            {/* Acompte */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 font-medium">
                  Acompte ({quote.deposit_percentage || 60}%)
                </span>
                <span className="text-blue-800 font-semibold">
                  {formatCHF(quote.deposit_amount || (quote.total * (quote.deposit_percentage || 60) / 100))}
                </span>
              </div>
              {quote.deposit_paid && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Acompte reçu
                </p>
              )}
            </div>

            {/* Badges */}
            <div className="flex items-center gap-3 mt-4">
              {quote.is_signed && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <CheckCircle size={12} /> Signé
                </span>
              )}
              {quote.cgv_accepted && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <CheckCircle size={12} /> CGV acceptées
                </span>
              )}
            </div>
          </div>

          {/* Action : Envoyer pour signature */}
          {quote.status === 'draft' && (
            <div className="flex justify-end">
              <button
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                Envoyer pour signature
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuoteDetail
