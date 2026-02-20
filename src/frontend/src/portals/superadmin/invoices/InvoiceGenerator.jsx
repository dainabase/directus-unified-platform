/**
 * InvoiceGenerator — Modal wizard
 * Generates a client invoice from a signed quote.
 * Supports deposit (acompte), balance (solde), full, or custom amount.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Receipt, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)

const generateInvoiceNumber = async () => {
  const y = new Date().getFullYear()
  try {
    const { data } = await api.get('/items/client_invoices', {
      params: {
        aggregate: { count: ['id'] },
        filter: { invoice_number: { _starts_with: `INV-${y}` } }
      }
    })
    const count = parseInt(data?.data?.[0]?.count?.id || 0)
    const seq = String(count + 1).padStart(2, '0')
    return `INV-${y}-${seq}`
  } catch {
    const rand = String(Math.floor(Math.random() * 100)).padStart(2, '0')
    return `INV-${y}-${rand}`
  }
}

const InvoiceGenerator = ({ quote, onClose }) => {
  const queryClient = useQueryClient()

  // Derived values from quote
  const totalAmount = Number(quote?.total_ttc || quote?.amount || 0)
  const depositPercentage = Number(quote?.deposit_percentage || 0)
  const depositAmount = depositPercentage > 0
    ? Math.round(totalAmount * depositPercentage / 100 * 100) / 100
    : 0
  const balanceAmount = Math.round((totalAmount - depositAmount) * 100) / 100

  const clientName = quote?.client_name
    || (quote?.contact_id?.first_name && quote?.contact_id?.last_name
      ? `${quote.contact_id.first_name} ${quote.contact_id.last_name}`
      : 'Client inconnu')

  // Default type: deposit if quote has a deposit percentage, otherwise full
  const defaultType = depositPercentage > 0 ? 'deposit' : 'full'

  const [selectedType, setSelectedType] = useState(defaultType)
  const [customAmount, setCustomAmount] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('INV-...')

  useEffect(() => {
    generateInvoiceNumber().then(setInvoiceNumber)
  }, [])

  const selectedAmount = useMemo(() => {
    switch (selectedType) {
      case 'deposit':
        return depositAmount
      case 'balance':
        return balanceAmount
      case 'full':
        return totalAmount
      case 'custom':
        return Number(customAmount) || 0
      default:
        return totalAmount
    }
  }, [selectedType, customAmount, depositAmount, balanceAmount, totalAmount])

  const createInvoice = useMutation({
    mutationFn: (payload) => api.post('/items/client_invoices', payload),
    onSuccess: () => {
      toast.success('Facture creee avec succes')
      queryClient.invalidateQueries({ queryKey: ['client_invoices'] })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      onClose()
    },
    onError: (err) => {
      toast.error(err?.response?.data?.errors?.[0]?.message || 'Erreur lors de la creation de la facture')
    }
  })

  const handleGenerate = () => {
    if (selectedAmount <= 0) {
      toast.error('Le montant doit etre superieur a 0')
      return
    }

    createInvoice.mutate({
      invoice_number: invoiceNumber,
      client_name: clientName,
      amount: String(selectedAmount),
      status: 'pending',
      project_id: quote.project_id,
      owner_company: quote.owner_company_id,
      currency: 'CHF',
      quote_id: quote.id,
      invoice_type: selectedType
    })
  }

  const invoiceTypes = [
    {
      value: 'deposit',
      label: 'Acompte',
      description: `${depositPercentage}% du total`,
      amount: depositAmount,
      disabled: depositPercentage <= 0
    },
    {
      value: 'balance',
      label: 'Solde',
      description: 'Montant restant apres acompte',
      amount: balanceAmount,
      disabled: depositPercentage <= 0
    },
    {
      value: 'full',
      label: 'Facture complete',
      description: 'Montant total du devis',
      amount: totalAmount,
      disabled: false
    },
    {
      value: 'custom',
      label: 'Montant personnalise',
      description: 'Definir un montant libre',
      amount: null,
      disabled: false
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-50 rounded-lg">
              <Receipt size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Generer une facture</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Quote summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Resume du devis
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Devis N°</span>
                <p className="font-medium text-gray-900">
                  {quote?.quote_number || quote?.id || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Client</span>
                <p className="font-medium text-gray-900">{clientName}</p>
              </div>
              <div>
                <span className="text-gray-500">Montant total</span>
                <p className="font-bold text-gray-900">{formatCHF(totalAmount)}</p>
              </div>
              {depositPercentage > 0 && (
                <div>
                  <span className="text-gray-500">Acompte ({depositPercentage}%)</span>
                  <p className="font-medium" style={{ color: 'var(--warning)' }}>{formatCHF(depositAmount)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice type selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Type de facture
            </h3>
            <div className="space-y-2">
              {invoiceTypes.map((type) => (
                <label
                  key={type.value}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${type.disabled
                      ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50'
                      : selectedType === type.value
                        ? 'border-zinc-400 bg-zinc-50/50 ring-1 ring-zinc-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="invoiceType"
                    value={type.value}
                    checked={selectedType === type.value}
                    onChange={() => setSelectedType(type.value)}
                    disabled={type.disabled}
                    className="w-4 h-4 text-zinc-800 border-gray-300 focus:ring-zinc-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                  {type.amount !== null && (
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                      {formatCHF(type.amount)}
                    </span>
                  )}
                </label>
              ))}
            </div>

            {/* Custom amount input */}
            {selectedType === 'custom' && (
              <div className="mt-3 pl-7">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Montant (CHF)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-zinc-200 focus:border-zinc-300 outline-none"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Invoice number preview */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl text-sm">
            <span className="text-gray-500">N° facture</span>
            <span className="font-mono font-semibold text-gray-900">{invoiceNumber}</span>
          </div>

          {/* Amount summary */}
          <div className="flex items-center justify-between py-3 px-4 bg-zinc-50 rounded-xl">
            <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Montant de la facture</span>
            <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{formatCHF(selectedAmount)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={createInvoice.isPending}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleGenerate}
            disabled={createInvoice.isPending || selectedAmount <= 0}
            className="ds-btn ds-btn-primary text-sm disabled:opacity-50"
          >
            {createInvoice.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : createInvoice.isSuccess ? (
              <CheckCircle size={16} />
            ) : (
              <Receipt size={16} />
            )}
            {createInvoice.isPending ? 'Creation en cours...' : 'Generer la facture'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InvoiceGenerator
