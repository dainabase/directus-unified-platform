/**
 * ProviderInvoices — Phase D-05
 * Soumission facture fournisseur + suivi paiement.
 * Upload PDF via Directus files API. Filtre par provider_id.
 */

import React, { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Receipt, Upload, FileText, CheckCircle, Clock, CreditCard,
  X, Loader2, Plus, Eye, AlertCircle
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
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approuvee', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  paid: { label: 'Payee', color: 'bg-green-100 text-green-700', icon: CreditCard },
  rejected: { label: 'Refusee', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Annulee', color: 'bg-gray-100 text-gray-500', icon: X }
}

// -- New invoice modal --
const NewInvoiceModal = ({ onClose, providerId, providerName }) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      invoice_number: '',
      amount: '',
      project_id: '',
      vat_rate: VAT_RATE
    }
  })

  const watchAmount = watch('amount')
  const amountHT = parseFloat(watchAmount) || 0
  const vatAmount = amountHT * VAT_RATE / 100
  const totalTTC = amountHT + vatAmount

  // Fetch provider's active projects
  const { data: projects = [] } = useQuery({
    queryKey: ['provider-projects-for-invoice', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: { main_provider_id: { _eq: providerId }, status: { _in: ['active', 'in_progress', 'in-progress'] } },
          fields: ['id', 'name'],
          sort: ['name']
        }
      })
      return data?.data || []
    },
    enabled: !!providerId
  })

  const submitMutation = useMutation({
    mutationFn: async (formData) => {
      let fileId = null

      // Upload PDF if selected
      if (selectedFile) {
        const formDataFile = new FormData()
        formDataFile.append('file', selectedFile)
        const { data: fileData } = await api.post('/files', formDataFile, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        fileId = fileData?.data?.id
        if (!fileId) throw new Error('Upload PDF echoue')
      }

      // Create supplier invoice
      return api.post('/items/supplier_invoices', {
        invoice_number: formData.invoice_number,
        supplier_name: providerName,
        amount: parseFloat(formData.amount),
        vat_rate: VAT_RATE,
        total_ttc: totalTTC,
        project_id: formData.project_id || null,
        provider_id: providerId,
        file_id: fileId,
        status: 'pending',
        date_created: new Date().toISOString()
      })
    },
    onSuccess: () => {
      toast.success('Facture soumise avec succes')
      queryClient.invalidateQueries({ queryKey: ['provider-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['provider-pending-payments'] })
      queryClient.invalidateQueries({ queryKey: ['provider-projects-need-invoice'] })
      onClose()
    },
    onError: (err) => {
      toast.error('Erreur lors de la soumission de la facture')
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Soumettre une facture</h2>
            <p className="text-sm text-gray-500 mt-0.5">Facture fournisseur pour HYPERVISUAL</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} className="p-6 space-y-4">
          {/* Invoice number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N de facture <span className="text-red-500">*</span>
            </label>
            <input
              {...register('invoice_number', { required: 'Le numero de facture est obligatoire' })}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
              placeholder="FAC-2026-001"
            />
            {errors.invoice_number && <p className="text-xs text-red-600 mt-1">{errors.invoice_number.message}</p>}
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projet associe
            </label>
            <select
              {...register('project_id')}
              className="w-full pl-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
            >
              <option value="">Selectionner un projet...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

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

          {/* TVA calculation */}
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

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facture PDF
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <span className="text-xs text-gray-400">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <Upload size={18} />
                Joindre le PDF de la facture
              </button>
            )}
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
                <Receipt size={16} />
              )}
              Soumettre la facture
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -- Main page --
const ProviderInvoices = () => {
  const { provider } = useProviderAuth()
  const providerId = provider?.id
  const [showNew, setShowNew] = useState(false)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['provider-invoices', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/supplier_invoices', {
        params: {
          filter: { provider_id: { _eq: providerId } },
          fields: ['id', 'invoice_number', 'amount', 'total_ttc', 'status', 'date_created', 'date_paid', 'project_id', 'file_id'],
          sort: ['-date_created'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Totals
  const totalPending = invoices
    .filter(i => i.status === 'pending' || i.status === 'approved')
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)

  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Mes factures</h1></div>
        <div className="ds-card p-6">
          <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes factures</h1>
          <p className="text-sm text-gray-500 mt-1">
            Soumettez vos factures et suivez vos paiements
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Soumettre une facture
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xs text-gray-500 font-medium">En attente de paiement</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(totalPending)}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Total paye</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(totalPaid)}</p>
        </div>
      </div>

      {/* Invoices list */}
      <div className="ds-card p-6">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Aucune facture soumise</p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Soumettre votre premiere facture
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">N facture</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Date</th>
                  <th className="text-right py-3 text-xs text-gray-500 font-medium">Montant HT</th>
                  <th className="text-right py-3 text-xs text-gray-500 font-medium">TTC</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Statut</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Paiement</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const config = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending
                  const StatusIcon = config.icon

                  return (
                    <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {inv.file_id && <FileText size={14} className="text-blue-500" />}
                          <span className="font-medium text-gray-900">{inv.invoice_number || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">
                        {inv.date_created ? format(new Date(inv.date_created), 'dd.MM.yyyy', { locale: fr }) : '—'}
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        {formatCHF(inv.amount)}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {inv.total_ttc ? formatCHF(inv.total_ttc) : '—'}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                          <StatusIcon size={12} />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3">
                        {inv.status === 'approved' && (
                          <span className="text-xs text-blue-600 font-medium">En cours Revolut</span>
                        )}
                        {inv.status === 'paid' && inv.date_paid && (
                          <span className="text-xs text-emerald-600 font-medium">
                            Paye le {format(new Date(inv.date_paid), 'dd.MM.yyyy', { locale: fr })}
                          </span>
                        )}
                        {inv.status === 'paid' && !inv.date_paid && (
                          <span className="text-xs text-emerald-600 font-medium">Paye</span>
                        )}
                        {inv.status === 'pending' && (
                          <span className="text-xs text-gray-400">En attente de validation</span>
                        )}
                        {inv.status === 'rejected' && (
                          <span className="text-xs text-red-600 font-medium">Refusee</span>
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

      {/* New invoice modal */}
      {showNew && (
        <NewInvoiceModal
          onClose={() => setShowNew(false)}
          providerId={providerId}
          providerName={provider?.name}
        />
      )}
    </div>
  )
}

export default ProviderInvoices
