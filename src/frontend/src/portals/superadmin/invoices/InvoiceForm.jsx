/**
 * InvoiceForm — S-03-05
 * Formulaire creation / edition de facture client.
 * Lignes dynamiques, calcul auto TVA 8.1%, acompte.
 */

import React, { useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Loader2, Save } from 'lucide-react'
import api from '../../../lib/axios'

const COMPANIES = [
  { value: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22', label: 'HYPERVISUAL' },
  { value: '55483d07-6621-43d4-89a9-5ebbffe86fea', label: 'DAINAMICS' },
  { value: '6f4bc42a-d083-4df5-ace3-6b910164ae18', label: 'ENKI REALTY' },
  { value: '8db45f3b-4021-9556-3acaa5f35b3f', label: 'LEXAIA' },
  { value: 'a1313adf-0347-424b-aff2-c5f0b33c4a05', label: 'TAKEOUT' }
]

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)

const InvoiceForm = ({ invoice, selectedCompany, onSave, onCancel }) => {
  const isEdit = !!invoice?.id

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      invoice_number: invoice?.invoice_number || '',
      owner_company: invoice?.owner_company?.id || invoice?.owner_company || (selectedCompany !== 'all' ? selectedCompany : ''),
      client_name: invoice?.client_name || '',
      client_email: invoice?.client_email || '',
      client_address: invoice?.client_address || '',
      date_issued: invoice?.date_issued?.split('T')[0] || new Date().toISOString().split('T')[0],
      due_date: invoice?.due_date?.split('T')[0] || '',
      tax_rate: invoice?.tax_rate || 8.1,
      deposit_percentage: invoice?.deposit_percentage || 0,
      notes: invoice?.notes || '',
      payment_terms: invoice?.payment_terms || 'Net 30 jours',
      items: invoice?.items?.length ? invoice.items.map(i => ({
        description: i.description || i.label || '',
        quantity: i.quantity || 1,
        unit_price: i.unit_price || i.price || 0
      })) : [{ description: '', quantity: 1, unit_price: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const watchItems = watch('items')
  const watchTaxRate = watch('tax_rate')
  const watchDeposit = watch('deposit_percentage')

  const totals = useMemo(() => {
    const ht = (watchItems || []).reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
    }, 0)
    const tva = ht * (Number(watchTaxRate) || 0) / 100
    const ttc = ht + tva
    const deposit = ttc * (Number(watchDeposit) || 0) / 100
    return {
      total_ht: Math.round(ht * 100) / 100,
      total_tva: Math.round(tva * 100) / 100,
      total_ttc: Math.round(ttc * 100) / 100,
      deposit_amount: Math.round(deposit * 100) / 100
    }
  }, [watchItems, watchTaxRate, watchDeposit])

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        ...totals,
        currency: 'CHF',
        status: isEdit ? invoice.status : 'draft'
      }
      if (isEdit) {
        return api.patch(`/items/client_invoices/${invoice.id}`, payload)
      }
      return api.post('/items/client_invoices', payload)
    },
    onSuccess: () => onSave()
  })

  const onSubmit = (data) => saveMutation.mutate(data)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? `Modifier facture ${invoice.invoice_number}` : 'Nouvelle facture'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General info */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Informations generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">N° facture *</label>
              <input
                {...register('invoice_number', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="FAC-2026-001"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Entreprise *</label>
              <select
                {...register('owner_company', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Selectionner...</option>
                {COMPANIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nom client *</label>
              <input
                {...register('client_name', { required: true })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email client</label>
              <input
                {...register('client_email')}
                type="email"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date emission</label>
              <input
                {...register('date_issued')}
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date echeance</label>
              <input
                {...register('due_date')}
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Adresse client</label>
            <textarea
              {...register('client_address')}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Lignes de facture</h3>
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <Plus size={14} /> Ajouter ligne
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <input
                    {...register(`items.${idx}.description`, { required: true })}
                    placeholder="Description"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="w-20">
                  <input
                    {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Qte"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-right"
                  />
                </div>
                <div className="w-32">
                  <input
                    {...register(`items.${idx}.unit_price`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Prix unit."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-right"
                  />
                </div>
                <div className="w-28 text-right py-2 text-sm font-medium text-gray-700">
                  {formatCHF((Number(watchItems?.[idx]?.quantity) || 0) * (Number(watchItems?.[idx]?.unit_price) || 0))}
                </div>
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(idx)}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                  disabled={fields.length <= 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total HT</span>
                  <span className="font-medium">{formatCHF(totals.total_ht)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-2">
                    TVA
                    <input
                      {...register('tax_rate', { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      className="w-16 px-2 py-0.5 text-xs border border-gray-200 rounded text-right"
                    />
                    %
                  </span>
                  <span className="font-medium">{formatCHF(totals.total_tva)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span>Total TTC</span>
                  <span className="text-blue-600">{formatCHF(totals.total_ttc)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 flex items-center gap-2">
                    Acompte
                    <input
                      {...register('deposit_percentage', { valueAsNumber: true })}
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      className="w-14 px-2 py-0.5 text-xs border border-gray-200 rounded text-right"
                    />
                    %
                  </span>
                  <span className="font-medium text-amber-600">{formatCHF(totals.deposit_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & conditions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Conditions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Conditions de paiement</label>
              <input
                {...register('payment_terms')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Enregistrer' : 'Creer la facture'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default InvoiceForm
