/**
 * QuoteForm — S-02-05
 * Modal de création/édition de devis client.
 * Sections : Infos générales, Lignes de devis, Conditions.
 * TVA Suisse 2025 : 8.1% par défaut.
 */

import React, { useEffect, useState, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Trash2, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

const OWNER_COMPANIES = [
  { id: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22', name: 'HYPERVISUAL' },
  { id: '55483d07-6621-43d4-89a9-5ebbffe86fea', name: 'DAINAMICS' },
  { id: '6f4bc42a-d083-4df5-ace3-6b910164ae18', name: 'ENKI REALTY' },
  { id: '8db45f3b-4021-9556-3acaa5f35b3f', name: 'LEXAIA' },
  { id: 'a1313adf-0347-424b-aff2-c5f0b33c4a05', name: 'TAKEOUT' }
]

const PROJECT_TYPES = [
  { value: 'vente', label: 'Vente' },
  { value: 'location', label: 'Location' },
  { value: 'service', label: 'Service' },
  { value: 'installation', label: 'Installation' }
]

const DEFAULT_TAX_RATE = 8.1

// Recherche autocomplete contacts
const useContactSearch = (searchTerm) => {
  return useQuery({
    queryKey: ['contacts-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return []
      const { data } = await api.get('/items/people', {
        params: {
          search: searchTerm,
          fields: ['id', 'first_name', 'last_name', 'email'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 1000 * 30
  })
}

// Recherche autocomplete entreprises
const useCompanySearch = (searchTerm) => {
  return useQuery({
    queryKey: ['companies-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return []
      const { data } = await api.get('/items/companies', {
        params: {
          search: searchTerm,
          fields: ['id', 'name'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 1000 * 30
  })
}

const QuoteForm = ({ quote, onClose }) => {
  const queryClient = useQueryClient()
  const isEditing = !!quote?.id

  const [contactSearch, setContactSearch] = useState('')
  const [companySearch, setCompanySearch] = useState('')
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

  const { data: contactResults } = useContactSearch(contactSearch)
  const { data: companyResults } = useCompanySearch(companySearch)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      owner_company_id: quote?.owner_company_id?.id || quote?.owner_company_id || OWNER_COMPANIES[0].id,
      contact_id: quote?.contact_id?.id || quote?.contact_id || '',
      company_id: quote?.company_id?.id || quote?.company_id || '',
      description: quote?.description || '',
      project_type: quote?.project_type || 'service',
      valid_until: quote?.valid_until ? quote.valid_until.slice(0, 10) : '',
      tax_rate: quote?.tax_rate || DEFAULT_TAX_RATE,
      deposit_percentage: quote?.deposit_percentage || 60,
      notes: quote?.notes || '',
      items: quote?.items || [{ description: '', quantity: 1, unit_price: 0 }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const watchItems = watch('items')
  const watchTaxRate = watch('tax_rate')
  const watchDepositPercentage = watch('deposit_percentage')

  // Calculs automatiques en temps réel
  const totals = useMemo(() => {
    const subtotal = (watchItems || []).reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unit_price) || 0
      return sum + (qty * price)
    }, 0)

    const taxRate = parseFloat(watchTaxRate) || DEFAULT_TAX_RATE
    const taxAmount = Math.round(subtotal * taxRate / 100 * 100) / 100
    const total = Math.round((subtotal + taxAmount) * 100) / 100
    const depositPct = parseFloat(watchDepositPercentage) || 60
    const depositAmount = Math.round(total * depositPct / 100 * 100) / 100

    return { subtotal, taxAmount, total, depositAmount }
  }, [watchItems, watchTaxRate, watchDepositPercentage])

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (formData) => {
      const payload = {
        owner_company_id: formData.owner_company_id,
        contact_id: formData.contact_id || null,
        company_id: formData.company_id || null,
        description: formData.description,
        project_type: formData.project_type,
        valid_until: formData.valid_until || null,
        tax_rate: parseFloat(formData.tax_rate) || DEFAULT_TAX_RATE,
        deposit_percentage: parseFloat(formData.deposit_percentage) || 60,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total: totals.total,
        deposit_amount: totals.depositAmount,
        currency: 'CHF',
        status: quote?.status || 'draft'
      }

      if (isEditing) {
        return api.patch(`/items/quotes/${quote.id}`, payload)
      }
      return api.post('/items/quotes', payload)
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Devis mis à jour' : 'Devis créé')
      queryClient.invalidateQueries({ queryKey: ['admin-quotes'] })
      onClose()
    },
    onError: (err) => {
      console.error('Erreur sauvegarde devis:', err)
      toast.error('Erreur lors de la sauvegarde')
    }
  })

  const onSubmit = (data) => {
    saveMutation.mutate(data)
  }

  // Noms affichés pour les sélections
  const [selectedContactName, setSelectedContactName] = useState(
    quote?.contact_id
      ? `${quote.contact_id.first_name || ''} ${quote.contact_id.last_name || ''}`.trim()
      : ''
  )
  const [selectedCompanyName, setSelectedCompanyName] = useState(
    quote?.company_id?.name || ''
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Modifier le devis' : 'Nouveau devis'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Section 1 — Infos générales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Informations générales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Entreprise émettrice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entreprise émettrice <span className="text-red-500">*</span>
                </label>
                <select {...register('owner_company_id', { required: true })} className="glass-input w-full">
                  {OWNER_COMPANIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Type de projet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de projet</label>
                <select {...register('project_type')} className="glass-input w-full">
                  {PROJECT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Contact (autocomplete) */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={showContactDropdown ? contactSearch : selectedContactName}
                  onChange={(e) => { setContactSearch(e.target.value); setShowContactDropdown(true) }}
                  onFocus={() => setShowContactDropdown(true)}
                  placeholder="Rechercher un contact..."
                  className="glass-input w-full"
                />
                {showContactDropdown && contactResults && contactResults.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-40 overflow-y-auto">
                    {contactResults.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setValue('contact_id', c.id)
                          setSelectedContactName(`${c.first_name} ${c.last_name}`)
                          setShowContactDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {c.first_name} {c.last_name}
                        {c.email && <span className="text-xs text-gray-400 ml-2">{c.email}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Entreprise client (autocomplete) */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise client</label>
                <input
                  type="text"
                  value={showCompanyDropdown ? companySearch : selectedCompanyName}
                  onChange={(e) => { setCompanySearch(e.target.value); setShowCompanyDropdown(true) }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  placeholder="Rechercher une entreprise..."
                  className="glass-input w-full"
                />
                {showCompanyDropdown && companyResults && companyResults.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-40 overflow-y-auto">
                    {companyResults.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setValue('company_id', c.id)
                          setSelectedCompanyName(c.name)
                          setShowCompanyDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="glass-input w-full resize-none"
                  placeholder="Description du devis..."
                />
              </div>

              {/* Validité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valide jusqu'au</label>
                <input type="date" {...register('valid_until')} className="glass-input w-full" />
              </div>
            </div>
          </div>

          {/* Section 2 — Lignes de devis */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Lignes de devis
              </h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Plus size={14} /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Quantité</div>
                <div className="col-span-2 text-right">Prix unit.</div>
                <div className="col-span-2 text-right">Montant</div>
                <div className="col-span-1"></div>
              </div>

              {fields.map((field, index) => {
                const qty = parseFloat(watchItems?.[index]?.quantity) || 0
                const price = parseFloat(watchItems?.[index]?.unit_price) || 0
                const lineTotal = qty * price

                return (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        {...register(`items.${index}.description`)}
                        className="glass-input w-full text-sm"
                        placeholder="Description"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        {...register(`items.${index}.quantity`)}
                        className="glass-input w-full text-sm text-right"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`items.${index}.unit_price`)}
                        className="glass-input w-full text-sm text-right"
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium text-gray-700 pr-1">
                      {formatCHF(lineTotal)}
                    </div>
                    <div className="col-span-1 text-center">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Totaux */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-medium">{formatCHF(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">TVA</span>
                  <input
                    type="number"
                    step="0.1"
                    {...register('tax_rate')}
                    className="glass-input w-16 text-xs text-center py-1"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
                <span className="font-medium">{formatCHF(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
                <span>Total TTC</span>
                <span className="text-blue-700">{formatCHF(totals.total)}</span>
              </div>
            </div>
          </div>

          {/* Section 3 — Conditions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Conditions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acompte (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  {...register('deposit_percentage')}
                  className="glass-input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Acompte : {formatCHF(totals.depositAmount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  className="glass-input w-full resize-none"
                  placeholder="Conditions supplémentaires..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isEditing ? 'Mettre à jour' : 'Créer le devis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuoteForm
