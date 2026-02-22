/**
 * InvoiceForm — Create / edit client invoice with dynamic line items,
 * auto-calculated Swiss VAT (8.1%, 2.6%, 3.8%), and Directus persistence.
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Save, Plus, X, Loader2,
  FileText, Calculator, Trash2
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Constants ──

const VAT_RATES = [
  { value: 8.1, label: '8.1% — Normal' },
  { value: 2.6, label: '2.6% — Reduit' },
  { value: 3.8, label: '3.8% — Hebergement' }
]

const EMPTY_LINE = {
  description: '',
  quantity: 1,
  unit_price: 0,
  vat_rate: 8.1
}

// ── Formatters ──

const formatCHF = (value) => {
  const num = parseFloat(value)
  if (isNaN(num)) return 'CHF 0.00'
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2
  }).format(num)
}

const toISODate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().slice(0, 10)
}

const todayISO = () => toISODate(new Date())

const plus30Days = () => {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return toISODate(d)
}

// ── Fetch companies for client dropdown ──

async function fetchCompanies(ownerCompany) {
  const filter = {}
  if (ownerCompany) filter.owner_company = { _eq: ownerCompany }

  const { data } = await api.get('/items/companies', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      fields: ['id', 'name', 'address', 'city', 'postal_code', 'country'],
      sort: ['name'],
      limit: 500
    }
  }).catch(() => ({ data: { data: [] } }))

  return data?.data || []
}

// ── Generate next invoice number ──

async function generateInvoiceNumber(ownerCompany) {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const prefix = `FA-${yearMonth}-`

  try {
    const { data } = await api.get('/items/client_invoices', {
      params: {
        filter: {
          invoice_number: { _starts_with: prefix },
          ...(ownerCompany ? { owner_company: { _eq: ownerCompany } } : {})
        },
        fields: ['invoice_number'],
        sort: ['-invoice_number'],
        limit: 1
      }
    })

    const lastInvoice = data?.data?.[0]
    if (lastInvoice?.invoice_number) {
      const lastNum = parseInt(lastInvoice.invoice_number.split('-').pop(), 10) || 0
      return `${prefix}${String(lastNum + 1).padStart(3, '0')}`
    }
  } catch {
    // Fallback: start from 001
  }

  return `${prefix}001`
}

// ── Main component ──

const InvoiceForm = ({ invoice, onSave, onCancel, selectedCompany }) => {
  const qc = useQueryClient()
  const isEdit = !!invoice
  const company = selectedCompany === 'all' ? '' : selectedCompany

  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    client_address: '',
    date_issued: todayISO(),
    due_date: plus30Days(),
    notes: '',
    currency: 'CHF'
  })

  const [lines, setLines] = useState([{ ...EMPTY_LINE }])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies-dropdown', company],
    queryFn: () => fetchCompanies(company),
    staleTime: 60_000
  })

  // Populate form if editing
  useEffect(() => {
    if (invoice) {
      setFormData({
        client_id: invoice.contact_id || '',
        client_name: invoice.client_name || '',
        client_address: invoice.client_address || '',
        date_issued: toISODate(invoice.date_issued) || todayISO(),
        due_date: toISODate(invoice.due_date) || plus30Days(),
        notes: invoice.notes || '',
        currency: invoice.currency || 'CHF'
      })

      // Parse existing items
      try {
        const items = typeof invoice.items === 'string'
          ? JSON.parse(invoice.items)
          : invoice.items
        if (Array.isArray(items) && items.length > 0) {
          setLines(items.map((item) => ({
            description: item.description || item.name || '',
            quantity: parseFloat(item.quantity || item.qty || 1),
            unit_price: parseFloat(item.unit_price || item.price || 0),
            vat_rate: parseFloat(item.vat_rate || item.tax_rate || 8.1)
          })))
        }
      } catch {
        // Keep default empty line
      }
    }
  }, [invoice])

  // ── Line item handlers ──

  const updateLine = useCallback((index, field, value) => {
    setLines((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }, [])

  const addLine = useCallback(() => {
    setLines((prev) => [...prev, { ...EMPTY_LINE }])
  }, [])

  const removeLine = useCallback((index) => {
    setLines((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  // ── Computed totals ──

  const computedTotals = useMemo(() => {
    let subtotal = 0
    const vatMap = {}

    lines.forEach((line) => {
      const qty = parseFloat(line.quantity) || 0
      const price = parseFloat(line.unit_price) || 0
      const rate = parseFloat(line.vat_rate) || 8.1
      const lineTotal = qty * price
      subtotal += lineTotal

      if (!vatMap[rate]) vatMap[rate] = 0
      vatMap[rate] += lineTotal * rate / 100
    })

    const vatBreakdown = Object.entries(vatMap)
      .map(([rate, amount]) => ({ rate: parseFloat(rate), amount }))
      .filter((v) => v.amount > 0)
      .sort((a, b) => b.rate - a.rate)

    const totalVat = vatBreakdown.reduce((s, v) => s + v.amount, 0)
    const totalTtc = subtotal + totalVat

    return { subtotal, vatBreakdown, totalVat, totalTtc }
  }, [lines])

  // ── Client selection handler ──

  const handleClientChange = useCallback((companyId) => {
    const selected = companies.find((c) => String(c.id) === String(companyId))
    if (selected) {
      const addressParts = [
        selected.address,
        [selected.postal_code, selected.city].filter(Boolean).join(' '),
        selected.country
      ].filter(Boolean)

      setFormData((prev) => ({
        ...prev,
        client_id: selected.id,
        client_name: selected.name || '',
        client_address: addressParts.join('\n')
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        client_id: companyId,
        client_name: '',
        client_address: ''
      }))
    }
  }, [companies])

  // ── Field change handler ──

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }, [errors])

  // ── Validation ──

  const validate = useCallback(() => {
    const newErrors = {}

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Le nom du client est requis'
    }
    if (!formData.date_issued) {
      newErrors.date_issued = 'La date d\'emission est requise'
    }
    if (!formData.due_date) {
      newErrors.due_date = 'La date d\'echeance est requise'
    }

    const hasValidLine = lines.some(
      (l) => l.description.trim() && parseFloat(l.unit_price) > 0
    )
    if (!hasValidLine) {
      newErrors.lines = 'Au moins une ligne avec description et prix est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, lines])

  // ── Submit ──

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSaving(true)
    try {
      // Generate invoice number if new
      let invoiceNumber = invoice?.invoice_number
      if (!isEdit) {
        invoiceNumber = await generateInvoiceNumber(company)
      }

      const payload = {
        invoice_number: invoiceNumber,
        client_name: formData.client_name.trim(),
        client_address: formData.client_address.trim(),
        contact_id: formData.client_id || null,
        date_issued: formData.date_issued,
        due_date: formData.due_date,
        currency: formData.currency,
        notes: formData.notes.trim(),
        status: invoice?.status || 'draft',
        items: JSON.stringify(
          lines.map((l) => ({
            description: l.description,
            quantity: parseFloat(l.quantity) || 1,
            unit_price: parseFloat(l.unit_price) || 0,
            vat_rate: parseFloat(l.vat_rate) || 8.1
          }))
        ),
        amount: Math.round(computedTotals.subtotal * 100) / 100,
        tax_amount: Math.round(computedTotals.totalVat * 100) / 100,
        total: Math.round(computedTotals.subtotal * 100) / 100,
        total_ttc: Math.round(computedTotals.totalTtc * 100) / 100
      }

      // Add owner_company if selected
      if (company) {
        payload.owner_company = company
      }

      if (isEdit) {
        await api.patch(`/items/client_invoices/${invoice.id}`, payload)
      } else {
        await api.post('/items/client_invoices', payload)
      }

      // Invalidate queries
      qc.invalidateQueries({ queryKey: ['client-invoices'] })

      if (onSave) onSave()
    } catch (err) {
      console.error('Invoice save error:', err)
      setErrors({ submit: err.response?.data?.errors?.[0]?.message || err.message || 'Erreur lors de la sauvegarde' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="ds-btn ds-btn-ghost inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="ds-page-title text-xl font-bold text-gray-900">
              {isEdit ? 'Modifier la facture' : 'Nouvelle facture'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? `Edition de ${invoice.invoice_number || `#${invoice.id}`}`
                : 'Les champs marques * sont obligatoires'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="ds-btn ds-btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="ds-btn ds-btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[var(--accent-hover)] rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {isEdit ? 'Enregistrer' : 'Creer la facture'}
          </button>
        </div>
      </div>

      {/* Global error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {errors.submit}
        </div>
      )}

      {/* Form sections in grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Client + Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client selection */}
          <div className="ds-card p-5">
            <h3 className="ds-card-title text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Client *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="ds-label block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Selectionner un client
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="ds-input w-full px-3 py-2 text-sm"
                >
                  <option value="">-- Choisir un client --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ds-label block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Nom du client *
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  placeholder="Nom de l'entreprise ou du client"
                  className={`ds-input w-full px-3 py-2 text-sm ${errors.client_name ? 'border-red-400 focus:ring-red-200' : ''}`}
                />
                {errors.client_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="ds-label block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Adresse
                </label>
                <textarea
                  value={formData.client_address}
                  onChange={(e) => handleChange('client_address', e.target.value)}
                  placeholder="Adresse complete du client"
                  rows={2}
                  className="ds-input w-full px-3 py-2 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="ds-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="ds-card-title text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Lignes de facture *
              </h3>
              <button
                type="button"
                onClick={addLine}
                className="ds-btn ds-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--accent-hover)] border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                <Plus size={13} />
                Ajouter une ligne
              </button>
            </div>

            {errors.lines && (
              <p className="text-xs text-red-500 mb-3">{errors.lines}</p>
            )}

            {/* Column headers */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 pb-2 mb-2 border-b border-gray-100">
              <div className="col-span-5 text-xs font-medium text-gray-500 uppercase">Description</div>
              <div className="col-span-1 text-xs font-medium text-gray-500 uppercase text-center">Qte</div>
              <div className="col-span-2 text-xs font-medium text-gray-500 uppercase text-right">Prix unit. HT</div>
              <div className="col-span-2 text-xs font-medium text-gray-500 uppercase text-center">TVA</div>
              <div className="col-span-1 text-xs font-medium text-gray-500 uppercase text-right">Sous-total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Lines */}
            <div className="space-y-2">
              {lines.map((line, idx) => {
                const qty = parseFloat(line.quantity) || 0
                const price = parseFloat(line.unit_price) || 0
                const lineTotal = qty * price

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start py-2 group"
                  >
                    {/* Description */}
                    <div className="sm:col-span-5">
                      <label className="sm:hidden ds-label block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => updateLine(idx, 'description', e.target.value)}
                        placeholder="Description du service ou produit"
                        className="ds-input w-full px-3 py-2 text-sm"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-1">
                      <label className="sm:hidden ds-label block text-xs font-medium text-gray-500 mb-1">Quantite</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                        className="ds-input w-full px-2 py-2 text-sm text-center tabular-nums"
                      />
                    </div>

                    {/* Unit price */}
                    <div className="sm:col-span-2">
                      <label className="sm:hidden ds-label block text-xs font-medium text-gray-500 mb-1">Prix unitaire HT</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unit_price}
                        onChange={(e) => updateLine(idx, 'unit_price', e.target.value)}
                        placeholder="0.00"
                        className="ds-input w-full px-2 py-2 text-sm text-right tabular-nums"
                      />
                    </div>

                    {/* VAT rate */}
                    <div className="sm:col-span-2">
                      <label className="sm:hidden ds-label block text-xs font-medium text-gray-500 mb-1">Taux TVA</label>
                      <select
                        value={line.vat_rate}
                        onChange={(e) => updateLine(idx, 'vat_rate', parseFloat(e.target.value))}
                        className="ds-input w-full px-2 py-2 text-sm text-center"
                      >
                        {VAT_RATES.map((rate) => (
                          <option key={rate.value} value={rate.value}>
                            {rate.value}%
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Line total (read-only) */}
                    <div className="sm:col-span-1 flex items-center justify-end">
                      <span className="text-sm font-medium text-gray-900 tabular-nums whitespace-nowrap">
                        {formatCHF(lineTotal)}
                      </span>
                    </div>

                    {/* Remove button */}
                    <div className="sm:col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        disabled={lines.length <= 1}
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Supprimer la ligne"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add line button (bottom) */}
            <button
              type="button"
              onClick={addLine}
              className="mt-3 w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:text-[var(--accent-hover)] hover:border-blue-300 transition-colors"
            >
              + Ajouter une ligne
            </button>
          </div>

          {/* Notes */}
          <div className="ds-card p-5">
            <h3 className="ds-card-title text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Notes
            </h3>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Conditions particulieres, informations de paiement, references..."
              rows={3}
              className="ds-input w-full px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        {/* Right column: Dates + Totals */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="ds-card p-5">
            <h3 className="ds-card-title text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              Dates
            </h3>
            <div className="space-y-4">
              <div>
                <label className="ds-label block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Date d'emission *
                </label>
                <input
                  type="date"
                  value={formData.date_issued}
                  onChange={(e) => handleChange('date_issued', e.target.value)}
                  className={`ds-input w-full px-3 py-2 text-sm ${errors.date_issued ? 'border-red-400' : ''}`}
                />
                {errors.date_issued && (
                  <p className="text-xs text-red-500 mt-1">{errors.date_issued}</p>
                )}
              </div>
              <div>
                <label className="ds-label block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Date d'echeance *
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  className={`ds-input w-full px-3 py-2 text-sm ${errors.due_date ? 'border-red-400' : ''}`}
                />
                {errors.due_date && (
                  <p className="text-xs text-red-500 mt-1">{errors.due_date}</p>
                )}
              </div>
              <div>
                <label className="ds-label block text-xs font-medium text-gray-500 uppercase mb-1.5">
                  Devise
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="ds-input w-full px-3 py-2 text-sm"
                >
                  <option value="CHF">CHF — Franc suisse</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — Dollar US</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auto-calculated totals */}
          <div className="ds-card p-5">
            <h3 className="ds-card-title text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Calculator size={14} />
              Recapitulatif
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total HT</span>
                <span className="text-gray-900 font-medium tabular-nums">
                  {formatCHF(computedTotals.subtotal)}
                </span>
              </div>

              {computedTotals.vatBreakdown.map((vat) => (
                <div key={vat.rate} className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA {vat.rate}%</span>
                  <span className="text-gray-700 tabular-nums">
                    {formatCHF(vat.amount)}
                  </span>
                </div>
              ))}

              {computedTotals.vatBreakdown.length === 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">TVA</span>
                  <span className="text-gray-400 tabular-nums">CHF 0.00</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total TTC</span>
                  <span className="font-bold text-lg text-gray-900 tabular-nums">
                    {formatCHF(computedTotals.totalTtc)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-[var(--accent-hover)] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Numero de facture</p>
                <p className="text-blue-600">
                  {isEdit
                    ? invoice.invoice_number
                    : 'Le numero sera genere automatiquement au format FA-YYYYMM-NNN.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default InvoiceForm
