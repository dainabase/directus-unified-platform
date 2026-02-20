/**
 * SupplierInvoicesPage — Full-page supplier invoices management
 * Collection Directus: `supplier_invoices`
 *
 * Features:
 * - KPI cards (pending, approved this month, rejected this month)
 * - Drag & drop PDF upload with OCR processing
 * - Full CRUD table with status workflow (draft > pending > approved > paid / rejected)
 * - Status filter tabs, search, pagination (25/page)
 * - Approve / Reject / Mark paid / Delete actions
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Receipt, Search, Eye, Trash2, Plus, Upload, FileText,
  CheckCircle, Clock, XCircle, CreditCard, Loader2,
  ChevronDown, MoreHorizontal, X, AlertCircle, Ban
} from 'lucide-react'
import api from '../../../lib/axios'

// ── Constants ──

const PAGE_SIZE = 25
const VAT_RATE = 8.1

const STATUS_CONFIG = {
  draft:       { label: 'Brouillon',   color: 'bg-gray-100 text-gray-600',    icon: FileText },
  pending:     { label: 'En attente',  color: 'bg-amber-50 text-amber-700',   icon: Clock },
  pending_ocr: { label: 'OCR en cours', color: 'bg-blue-50 text-blue-600',    icon: Loader2 },
  approved:    { label: 'Approuvee',   color: 'bg-green-50 text-green-700',   icon: CheckCircle },
  paid:        { label: 'Payee',       color: 'bg-emerald-50 text-emerald-700', icon: CreditCard },
  rejected:    { label: 'Rejetee',     color: 'bg-red-50 text-red-700',       icon: XCircle }
}

const STATUS_TABS = [
  { key: 'all',         label: 'Toutes' },
  { key: 'pending',     label: 'En attente' },
  { key: 'pending_ocr', label: 'OCR' },
  { key: 'approved',    label: 'Approuvees' },
  { key: 'paid',        label: 'Payees' },
  { key: 'rejected',    label: 'Rejetees' },
  { key: 'draft',       label: 'Brouillons' }
]

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

const formatDate = (d) => {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ── StatusBadge ──

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={12} className={status === 'pending_ocr' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  )
}

// ── Data fetching ──

async function fetchSupplierInvoices({ company, status, search, page = 1 }) {
  const filter = {}
  if (company) filter.owner_company = { _eq: company }
  if (status && status !== 'all') filter.status = { _eq: status }
  if (search) {
    filter._or = [
      { invoice_number: { _contains: search } },
      { supplier_name: { _contains: search } }
    ]
  }

  const { data } = await api.get('/items/supplier_invoices', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      fields: [
        'id', 'invoice_number', 'supplier_name', 'amount', 'vat_rate',
        'total_ttc', 'status', 'date_created', 'due_date', 'date_paid',
        'project_id', 'provider_id', 'file_id', 'rejection_reason',
        'approved_by', 'owner_company', 'owner_company_id'
      ],
      sort: ['-date_created'],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      meta: 'total_count'
    }
  }).catch(() => ({ data: { data: [], meta: { total_count: 0 } } }))

  return { items: data?.data || [], total: data?.meta?.total_count || 0 }
}

async function fetchKPIs(company) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const baseFilter = company ? { owner_company: { _eq: company } } : {}

  const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
    // Pending invoices (all time)
    api.get('/items/supplier_invoices', {
      params: {
        filter: { ...baseFilter, status: { _in: ['pending', 'pending_ocr'] } },
        fields: ['id', 'amount'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } })),

    // Approved this month
    api.get('/items/supplier_invoices', {
      params: {
        filter: {
          ...baseFilter,
          status: { _eq: 'approved' },
          date_created: { _gte: startOfMonth }
        },
        fields: ['id', 'amount'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } })),

    // Rejected this month
    api.get('/items/supplier_invoices', {
      params: {
        filter: {
          ...baseFilter,
          status: { _eq: 'rejected' },
          date_created: { _gte: startOfMonth }
        },
        fields: ['id'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } }))
  ])

  const pendingItems = pendingRes.data?.data || []
  const approvedItems = approvedRes.data?.data || []
  const rejectedItems = rejectedRes.data?.data || []

  return {
    pending: {
      count: pendingItems.length,
      amount: pendingItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
    },
    approved: {
      count: approvedItems.length,
      amount: approvedItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0)
    },
    rejected: {
      count: rejectedItems.length
    }
  }
}

// ── Skeleton rows ──

const SkeletonRows = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-20 rounded" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-32 rounded" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-20 rounded" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-20 rounded" /></td>
        <td className="px-4 py-3 text-right"><div className="ds-skeleton h-3 w-20 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-right"><div className="ds-skeleton h-3 w-14 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-right"><div className="ds-skeleton h-3 w-20 rounded ml-auto" /></td>
        <td className="px-4 py-3 text-center"><div className="ds-skeleton h-5 w-20 rounded-full mx-auto" /></td>
        <td className="px-4 py-3"><div className="ds-skeleton h-3 w-8 rounded mx-auto" /></td>
      </tr>
    ))}
  </>
)

// ── Upload Modal with OCR ──

const UploadModal = ({ onClose, selectedCompany }) => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [ocrStep, setOcrStep] = useState('idle') // idle | uploading | processing | done | error
  const [ocrResult, setOcrResult] = useState(null)
  const [ocrError, setOcrError] = useState(null)

  // Manual form fields (editable after OCR or manual entry)
  const [formData, setFormData] = useState({
    invoice_number: '',
    supplier_name: '',
    amount: '',
    vat_rate: VAT_RATE,
    date: new Date().toISOString().split('T')[0],
    due_date: ''
  })

  const amountHT = parseFloat(formData.amount) || 0
  const vatAmount = amountHT * (parseFloat(formData.vat_rate) || VAT_RATE) / 100
  const totalTTC = amountHT + vatAmount

  const handleField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Drag & Drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  // Upload file to Directus and trigger OCR
  const processOCR = async () => {
    if (!selectedFile) return

    try {
      setOcrStep('uploading')
      setOcrError(null)

      // 1. Upload PDF to Directus files
      const uploadForm = new FormData()
      uploadForm.append('file', selectedFile)
      const { data: fileResponse } = await api.post('/files', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const fileId = fileResponse?.data?.id
      if (!fileId) throw new Error('Upload echoue — aucun file_id retourne')

      setOcrStep('processing')

      // 2. Convert PDF first page to base64 image for OCR
      // We try the OCR endpoint; if it fails, we still have the file uploaded
      let extractedData = null
      try {
        // Read the file as base64 for OCR
        const fileUrl = `/assets/${fileId}`
        const { data: fileBlob } = await api.get(fileUrl, { responseType: 'blob' })
        const reader = new FileReader()
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(fileBlob)
        })

        const { data: ocrRes } = await api.post('/api/ocr/scan-invoice', { image: base64 })
        if (ocrRes?.success && ocrRes?.extracted) {
          extractedData = ocrRes.extracted
        }
      } catch {
        // OCR failed but file is uploaded — continue with manual entry
      }

      setOcrStep('done')

      if (extractedData) {
        setOcrResult(extractedData)
        // Pre-fill form with OCR results
        setFormData((prev) => ({
          ...prev,
          invoice_number: extractedData.invoice_number || prev.invoice_number,
          supplier_name: extractedData.company || prev.supplier_name,
          amount: extractedData.amount ? String(extractedData.amount) : prev.amount,
          date: extractedData.date || prev.date
        }))
      }

      // Store file_id for later
      setFormData((prev) => ({ ...prev, _fileId: fileId }))
    } catch (err) {
      setOcrStep('error')
      setOcrError(err.message || 'Erreur lors du traitement')
    }
  }

  // Trigger OCR when file is selected
  useEffect(() => {
    if (selectedFile && ocrStep === 'idle') {
      processOCR()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile])

  // Save invoice mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        invoice_number: formData.invoice_number,
        supplier_name: formData.supplier_name,
        amount: parseFloat(formData.amount) || 0,
        vat_rate: parseFloat(formData.vat_rate) || VAT_RATE,
        total_ttc: totalTTC,
        date_created: formData.date || new Date().toISOString().split('T')[0],
        due_date: formData.due_date || null,
        file_id: formData._fileId || null,
        status: 'pending',
        owner_company: selectedCompany && selectedCompany !== 'all' ? selectedCompany : undefined
      }
      return api.post('/items/supplier_invoices', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['supplier-invoices-kpis'] })
      onClose()
    }
  })

  const canSave = formData.supplier_name && formData.amount && parseFloat(formData.amount) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nouvelle facture fournisseur</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Deposez un PDF pour extraction OCR automatique ou saisissez manuellement
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone */}
          {ocrStep === 'idle' && !selectedFile && (
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                flex flex-col items-center justify-center py-10 px-6
                border-2 border-dashed rounded-xl cursor-pointer transition-all
                ${isDragging
                  ? 'border-[#0071E3] bg-blue-50/50'
                  : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <Upload size={32} className={`mb-3 ${isDragging ? 'text-[#0071E3]' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-700">
                Glissez-deposez un fichier PDF ici
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ou cliquez pour parcourir vos fichiers
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Processing indicator */}
          {(ocrStep === 'uploading' || ocrStep === 'processing') && (
            <div className="flex flex-col items-center py-8 px-6 bg-blue-50/50 border border-blue-100 rounded-xl">
              <Loader2 size={28} className="text-[#0071E3] animate-spin mb-3" />
              <p className="text-sm font-medium text-gray-700">
                {ocrStep === 'uploading' ? 'Upload du fichier...' : 'Analyse OCR en cours...'}
              </p>
              <p className="text-xs text-gray-400 mt-1">{selectedFile?.name}</p>
            </div>
          )}

          {/* OCR error */}
          {ocrStep === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Erreur de traitement</p>
                <p className="text-xs text-red-600 mt-0.5">{ocrError}</p>
                <button
                  onClick={() => { setOcrStep('idle'); setSelectedFile(null); setOcrError(null) }}
                  className="text-xs text-red-700 underline mt-2"
                >
                  Reessayer
                </button>
              </div>
            </div>
          )}

          {/* File attached indicator */}
          {selectedFile && ocrStep === 'done' && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#0071E3]" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <span className="text-xs text-gray-400">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                {ocrResult && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    <CheckCircle size={10} /> OCR extrait
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  setOcrStep('idle')
                  setOcrResult(null)
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Form fields */}
          {(ocrStep === 'done' || ocrStep === 'error' || ocrStep === 'idle') && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => handleField('supplier_name', e.target.value)}
                    className="ds-input"
                    placeholder="Nom du fournisseur"
                  />
                </div>

                {/* Invoice number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N de facture
                  </label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => handleField('invoice_number', e.target.value)}
                    className="ds-input"
                    placeholder="FAC-2026-001"
                  />
                </div>

                {/* Amount HT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant HT (CHF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleField('amount', e.target.value)}
                    className="ds-input"
                    placeholder="0.00"
                  />
                </div>

                {/* VAT rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux TVA (%)
                  </label>
                  <select
                    value={formData.vat_rate}
                    onChange={(e) => handleField('vat_rate', e.target.value)}
                    className="ds-input"
                  >
                    <option value="8.1">8.1% — Taux normal</option>
                    <option value="2.6">2.6% — Taux reduit</option>
                    <option value="3.8">3.8% — Hebergement</option>
                    <option value="0">0% — Exonere</option>
                  </select>
                </div>

                {/* Invoice date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date facture
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleField('date', e.target.value)}
                    className="ds-input"
                  />
                </div>

                {/* Due date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Echeance
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => handleField('due_date', e.target.value)}
                    className="ds-input"
                  />
                </div>
              </div>

              {/* TVA calculation summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Montant HT</span>
                  <span className="font-medium text-gray-900">{formatCHF(amountHT)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA {formData.vat_rate}%</span>
                  <span className="text-gray-700">{formatCHF(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total TTC</span>
                  <span className="font-bold text-[#0071E3]">{formatCHF(totalTTC)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="ds-btn ds-btn-ghost"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={!canSave || saveMutation.isPending}
            className="ds-btn ds-btn-primary"
          >
            {saveMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Receipt size={14} />
            )}
            Enregistrer la facture
          </button>
        </div>

        {/* Save error */}
        {saveMutation.isError && (
          <div className="px-6 pb-4">
            <p className="text-xs text-red-600">
              Erreur : {saveMutation.error?.message || 'Impossible de sauvegarder la facture'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Detail Modal ──

const DetailModal = ({ invoice, onClose }) => {
  if (!invoice) return null
  const cfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {invoice.invoice_number || 'Facture sans numero'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{invoice.supplier_name || '--'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{formatDate(invoice.date_created)}</p>
            </div>
            <div>
              <p className="text-gray-500">Echeance</p>
              <p className="font-medium text-gray-900">{formatDate(invoice.due_date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Montant HT</p>
              <p className="font-medium text-gray-900">{formatCHF(invoice.amount)}</p>
            </div>
            <div>
              <p className="text-gray-500">TVA ({invoice.vat_rate || VAT_RATE}%)</p>
              <p className="font-medium text-gray-900">
                {formatCHF((parseFloat(invoice.amount) || 0) * (parseFloat(invoice.vat_rate) || VAT_RATE) / 100)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500">Total TTC</p>
              <p className="text-lg font-bold text-[#0071E3]">
                {invoice.total_ttc ? formatCHF(invoice.total_ttc) : formatCHF(
                  (parseFloat(invoice.amount) || 0) * (1 + (parseFloat(invoice.vat_rate) || VAT_RATE) / 100)
                )}
              </p>
            </div>
            {invoice.date_paid && (
              <div className="col-span-2">
                <p className="text-gray-500">Date de paiement</p>
                <p className="font-medium text-emerald-700">{formatDate(invoice.date_paid)}</p>
              </div>
            )}
            {invoice.rejection_reason && (
              <div className="col-span-2">
                <p className="text-gray-500">Motif de rejet</p>
                <p className="font-medium text-red-700">{invoice.rejection_reason}</p>
              </div>
            )}
          </div>

          {invoice.file_id && (
            <a
              href={`/assets/${invoice.file_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn-secondary w-full justify-center"
            >
              <FileText size={14} />
              Voir le document PDF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Actions Dropdown ──

const ActionsDropdown = ({ invoice, onApprove, onReject, onPay, onDelete, onView }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const items = []

  items.push({ label: 'Voir', icon: Eye, action: () => onView(invoice), color: 'text-gray-600' })

  if (['draft', 'pending', 'pending_ocr'].includes(invoice.status)) {
    items.push({
      label: 'Approuver',
      icon: CheckCircle,
      action: () => onApprove(invoice.id),
      color: 'text-green-600'
    })
  }

  if (['draft', 'pending', 'pending_ocr'].includes(invoice.status)) {
    items.push({
      label: 'Rejeter',
      icon: Ban,
      action: () => onReject(invoice.id),
      color: 'text-red-600'
    })
  }

  if (invoice.status === 'approved') {
    items.push({
      label: 'Marquer payee',
      icon: CreditCard,
      action: () => onPay(invoice.id),
      color: 'text-emerald-600'
    })
  }

  if (['draft', 'rejected'].includes(invoice.status)) {
    items.push({
      label: 'Supprimer',
      icon: Trash2,
      action: () => onDelete(invoice.id),
      color: 'text-red-600'
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={i}
                onClick={() => { item.action(); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <Icon size={14} className={item.color} />
                <span className={item.color}>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main Page Component ──

const SupplierInvoicesPage = ({ selectedCompany }) => {
  const qc = useQueryClient()

  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [viewInvoice, setViewInvoice] = useState(null)

  const company = selectedCompany === 'all' ? '' : selectedCompany

  // Fetch invoices
  const { data, isLoading } = useQuery({
    queryKey: ['supplier-invoices', company, statusFilter, search, page],
    queryFn: () => fetchSupplierInvoices({ company, status: statusFilter, search, page }),
    staleTime: 15_000
  })

  const invoices = data?.items || []
  const totalCount = data?.total || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Fetch KPIs
  const { data: kpis } = useQuery({
    queryKey: ['supplier-invoices-kpis', company],
    queryFn: () => fetchKPIs(company),
    staleTime: 30_000
  })

  // ── Mutations ──

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/items/supplier_invoices/${id}`, { status: 'approved' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-invoices'] })
      qc.invalidateQueries({ queryKey: ['supplier-invoices-kpis'] })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      api.patch(`/items/supplier_invoices/${id}`, { status: 'rejected', rejection_reason: reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-invoices'] })
      qc.invalidateQueries({ queryKey: ['supplier-invoices-kpis'] })
    }
  })

  const payMutation = useMutation({
    mutationFn: (id) =>
      api.patch(`/items/supplier_invoices/${id}`, {
        status: 'paid',
        date_paid: new Date().toISOString().split('T')[0]
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-invoices'] })
      qc.invalidateQueries({ queryKey: ['supplier-invoices-kpis'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/items/supplier_invoices/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplier-invoices'] })
      qc.invalidateQueries({ queryKey: ['supplier-invoices-kpis'] })
    }
  })

  // ── Handlers ──

  const handleApprove = (id) => {
    if (window.confirm('Approuver cette facture fournisseur ?')) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (id) => {
    const reason = window.prompt('Motif du rejet :')
    if (reason !== null) {
      rejectMutation.mutate({ id, reason: reason || 'Aucun motif specifie' })
    }
  }

  const handlePay = (id) => {
    if (window.confirm('Marquer cette facture comme payee ?')) {
      payMutation.mutate(id)
    }
  }

  const handleDelete = (id) => {
    if (window.confirm('Supprimer definitivement cette facture ?')) {
      deleteMutation.mutate(id)
    }
  }

  // Determine if a due date is overdue
  const isOverdue = (inv) => {
    if (!inv.due_date || inv.status === 'paid') return false
    return new Date(inv.due_date) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
          <h2 className="text-xl font-bold text-gray-900">Factures fournisseurs</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestion et approbation des factures fournisseurs — {totalCount} facture{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="ds-btn ds-btn-primary"
        >
          <Plus size={16} />
          Nouvelle facture
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock size={16} className="text-amber-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">En attente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(kpis?.pending?.amount || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis?.pending?.count || 0} facture{(kpis?.pending?.count || 0) !== 1 ? 's' : ''}</p>
        </div>

        {/* Approved this month */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Approuvees ce mois</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCHF(kpis?.approved?.amount || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis?.approved?.count || 0} facture{(kpis?.approved?.count || 0) !== 1 ? 's' : ''}</p>
        </div>

        {/* Rejected this month */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle size={16} className="text-red-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Rejetees ce mois</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpis?.rejected?.count || 0}</p>
          <p className="text-xs text-gray-400 mt-1">facture{(kpis?.rejected?.count || 0) !== 1 ? 's' : ''} rejetee{(kpis?.rejected?.count || 0) !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Status filter tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1) }}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all
                ${statusFilter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher ref. ou fournisseur..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="ds-input !pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="ds-card overflow-hidden" style={{ transition: 'none' }}>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">N</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Echeance</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">TTC</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <SkeletonRows />
              </tbody>
            </table>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-500">Aucune facture fournisseur</p>
            <p className="text-sm mt-1">
              {statusFilter !== 'all'
                ? 'Aucun resultat pour ce filtre. Essayez un autre statut.'
                : 'Les factures apparaitront ici une fois ajoutees.'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="ds-btn ds-btn-primary mt-4"
            >
              <Plus size={14} />
              Ajouter une facture
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-4 py-3">N</th>
                  <th className="px-4 py-3">Fournisseur</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Echeance</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="px-4 py-3 text-right">TVA</th>
                  <th className="px-4 py-3 text-right">TTC</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => {
                  const amt = parseFloat(inv.amount) || 0
                  const rate = parseFloat(inv.vat_rate) || VAT_RATE
                  const vat = amt * rate / 100
                  const ttc = inv.total_ttc ? parseFloat(inv.total_ttc) : amt + vat
                  const overdue = isOverdue(inv)

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-gray-50/50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {inv.file_id && <FileText size={13} className="text-[#0071E3] shrink-0" />}
                          <span className="font-medium text-gray-900">{inv.invoice_number || '--'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                        {inv.supplier_name || '--'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(inv.date_created)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {formatDate(inv.due_date)}
                          {overdue && <span className="text-[10px] ml-1 text-red-500">EN RETARD</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                        {formatCHF(amt)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                        {formatCHF(vat)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatCHF(ttc)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <ActionsDropdown
                            invoice={inv}
                            onView={setViewInvoice}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onPay={handlePay}
                            onDelete={handleDelete}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {page} sur {totalPages} — {totalCount} resultat{totalCount !== 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="ds-btn ds-btn-ghost disabled:opacity-40"
              >
                Precedent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="ds-btn ds-btn-ghost disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          selectedCompany={selectedCompany}
        />
      )}

      {/* Detail Modal */}
      {viewInvoice && (
        <DetailModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
        />
      )}
    </div>
  )
}

export default SupplierInvoicesPage
