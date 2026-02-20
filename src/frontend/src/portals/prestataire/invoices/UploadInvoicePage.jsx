/**
 * UploadInvoicePage — Story 4.9
 * Page /prestataire/invoices/upload — Upload facture avec OCR automatique.
 * Wizard 3 etapes : Upload fichier -> Analyse OCR -> Formulaire pre-rempli -> Soumission.
 * TVA suisse 2025 : 8.1% / 2.6% / 3.8% (JAMAIS les anciens taux).
 * Montants en integer centimes cote serveur (CHF centimes).
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileText, Loader2, CheckCircle, AlertCircle,
  Camera, ArrowLeft, Receipt, X, Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

// -- Swiss TVA rates 2025 (source unique de verite) --
const VAT_RATES = [
  { value: 8.1, label: '8.1% — Taux normal' },
  { value: 2.6, label: '2.6% — Taux reduit' },
  { value: 3.8, label: '3.8% — Hebergement' }
]

// -- CHF formatter --
const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

// -- Max file size: 10 MB --
const MAX_FILE_SIZE = 10 * 1024 * 1024

// -- Accepted file types --
const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
]

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png'

// ============================================================
// Step Indicator
// ============================================================
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Analyse OCR' },
    { num: 3, label: 'Verification' }
  ]

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.num
        const isDone = currentStep > step.num

        return (
          <React.Fragment key={step.num}>
            {/* Connector line */}
            {idx > 0 && (
              <div
                className="h-0.5 w-12 sm:w-20 transition-colors duration-300"
                style={{
                  background: isDone || isActive
                    ? 'var(--accent)'
                    : 'var(--border-medium)'
                }}
              />
            )}

            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                style={{
                  background: isDone
                    ? 'var(--accent)'
                    : isActive
                      ? 'var(--accent)'
                      : 'rgba(0, 0, 0, 0.06)',
                  color: isDone || isActive ? '#FFFFFF' : 'var(--text-tertiary)',
                  boxShadow: isActive ? '0 0 0 4px rgba(0, 113, 227, 0.15)' : 'none'
                }}
              >
                {isDone ? <CheckCircle size={18} /> : step.num}
              </div>
              <span
                className="text-xs font-medium transition-colors duration-300"
                style={{
                  color: isDone || isActive ? 'var(--accent)' : 'var(--text-tertiary)'
                }}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ============================================================
// Step 1: File Upload (Drag & Drop)
// ============================================================
const StepUpload = ({ onFileSelected, file, onRemoveFile, onAnalyze, isAnalyzing }) => {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  // Generate preview for images
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [file])

  const validateFile = useCallback((f) => {
    if (!f) return null
    if (f.size > MAX_FILE_SIZE) {
      toast.error('Le fichier depasse la taille maximale de 10 MB')
      return null
    }
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error('Format non supporte. Utilisez PDF, JPG ou PNG.')
      return null
    }
    return f
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer?.files?.[0]
    const validFile = validateFile(droppedFile)
    if (validFile) onFileSelected(validFile)
  }, [validateFile, onFileSelected])

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0]
    const validFile = validateFile(selectedFile)
    if (validFile) onFileSelected(validFile)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }, [validateFile, onFileSelected])

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="ds-card p-6 space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Deposer votre facture
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Glissez un fichier PDF ou une image de votre facture
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleFileChange}
      />

      {!file ? (
        /* Drop zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl p-10 text-center transition-all duration-200"
          style={{
            border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border-medium)'}`,
            background: isDragOver ? 'var(--accent-light)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-200"
            style={{
              background: isDragOver ? 'var(--accent)' : 'rgba(0, 0, 0, 0.06)'
            }}
          >
            <Upload
              size={24}
              style={{ color: isDragOver ? '#FFFFFF' : 'var(--text-tertiary)' }}
            />
          </div>

          <p className="text-sm font-medium text-gray-700 mb-1">
            Cliquez ou glissez-deposez votre fichier ici
          </p>
          <p className="text-xs text-gray-400">
            Max 10 MB, PDF ou image (JPG, PNG)
          </p>
        </div>
      ) : (
        /* File selected state */
        <div className="space-y-4">
          {/* File info */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: 'var(--accent-light)',
              border: '1px solid rgba(0, 113, 227, 0.15)'
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent)' }}
              >
                <FileText size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemoveFile()
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image preview */}
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden border border-gray-100">
              <img
                src={previewUrl}
                alt="Apercu facture"
                className="w-full max-h-64 object-contain bg-gray-50"
              />
              <div className="absolute top-2 right-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                  style={{ background: 'rgba(0, 0, 0, 0.6)', color: '#fff' }}
                >
                  <Eye size={12} />
                  Apercu
                </span>
              </div>
            </div>
          )}

          {/* Analyze button */}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="ds-btn ds-btn-primary w-full py-3 text-sm font-medium"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Camera size={16} />
                Analyser avec OCR
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Step 2: OCR Analysis (loading state)
// ============================================================
const StepAnalyzing = () => {
  return (
    <div className="ds-card p-10 text-center space-y-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: 'var(--accent-light)' }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Analyse en cours
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Extraction des donnees de la facture par OCR...
        </p>
      </div>
      <div className="flex justify-center gap-1.5 pt-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full ds-pulse"
            style={{
              background: 'var(--accent)',
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Step 3: Review & Submit Form
// ============================================================
const StepReview = ({
  ocrData,
  fileId,
  fileName,
  providerId,
  projects,
  onSubmit,
  isSubmitting,
  onBack
}) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      invoice_number: ocrData?.invoice_number || '',
      invoice_date: ocrData?.invoice_date
        ? formatDateForInput(ocrData.invoice_date)
        : format(new Date(), 'yyyy-MM-dd'),
      project_id: '',
      amount_ht: ocrData?.amount_ht || '',
      vat_rate: 8.1,
      iban: ocrData?.iban || '',
      notes: ''
    }
  })

  const watchAmountHT = watch('amount_ht')
  const watchVatRate = watch('vat_rate')

  const amountHT = parseFloat(watchAmountHT) || 0
  const vatRate = parseFloat(watchVatRate) || 8.1
  const vatAmount = amountHT * vatRate / 100
  const amountTTC = amountHT + vatAmount

  const ocrDetected = !!(ocrData?.invoice_number || ocrData?.amount_ht || ocrData?.iban)

  return (
    <div className="ds-card p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Verifier et soumettre
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {ocrDetected
            ? 'Les champs ont ete pre-remplis par OCR. Verifiez et corrigez si necessaire.'
            : "L'OCR n'a pas pu extraire les donnees. Remplissez le formulaire manuellement."
          }
        </p>
      </div>

      {/* OCR status banner */}
      {ocrDetected && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
          style={{
            background: 'var(--success-light)',
            color: 'var(--success)'
          }}
        >
          <CheckCircle size={14} />
          Donnees extraites par OCR — verifiez avant de soumettre
        </div>
      )}

      {!ocrDetected && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-xs font-medium"
          style={{
            background: 'var(--warning-light)',
            color: '#B45309'
          }}
        >
          <AlertCircle size={14} />
          OCR non disponible ou aucune donnee extraite — saisie manuelle
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => onSubmit({ ...data, amount_ttc: amountTTC, vat_amount: vatAmount }))}
        className="space-y-4"
      >
        {/* Invoice number */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            N de facture <span className="text-red-500">*</span>
          </label>
          <input
            {...register('invoice_number', { required: 'Le numero de facture est obligatoire' })}
            className="ds-input w-full"
            placeholder="FAC-2026-001"
          />
          {errors.invoice_number && (
            <p className="text-xs text-red-600 mt-1">{errors.invoice_number.message}</p>
          )}
        </div>

        {/* Invoice date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Date de facture <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('invoice_date', { required: 'La date est obligatoire' })}
            className="ds-input w-full"
          />
          {errors.invoice_date && (
            <p className="text-xs text-red-600 mt-1">{errors.invoice_date.message}</p>
          )}
        </div>

        {/* Project select */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Projet associe
          </label>
          <select
            {...register('project_id')}
            className="ds-input w-full"
          >
            <option value="">Selectionner un projet...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Amount HT */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Montant HT (CHF) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('amount_ht', {
                required: 'Le montant est obligatoire',
                min: { value: 0.01, message: 'Le montant doit etre positif' }
              })}
              className="ds-input w-full pr-12"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              CHF
            </span>
          </div>
          {errors.amount_ht && (
            <p className="text-xs text-red-600 mt-1">{errors.amount_ht.message}</p>
          )}
        </div>

        {/* TVA rate */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Taux de TVA
          </label>
          <select
            {...register('vat_rate', { valueAsNumber: true })}
            className="ds-input w-full"
          >
            {VAT_RATES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* TVA calculation summary */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ background: 'rgba(0, 0, 0, 0.03)' }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Montant HT</span>
            <span className="font-medium text-gray-900">{formatCHF(amountHT)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">TVA {vatRate}%</span>
            <span className="text-gray-700">{formatCHF(vatAmount)}</span>
          </div>
          <div
            className="flex justify-between text-sm pt-2"
            style={{ borderTop: '1px solid var(--border-light)' }}
          >
            <span className="font-semibold text-gray-900">Total TTC</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>
              {formatCHF(amountTTC)}
            </span>
          </div>
        </div>

        {/* IBAN */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            IBAN
          </label>
          <input
            {...register('iban')}
            className="ds-input w-full"
            placeholder="CH93 0076 2011 6238 5295 7"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="ds-input w-full resize-none"
            placeholder="Remarques optionnelles..."
          />
        </div>

        {/* File reference (read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Fichier joint
          </label>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
            style={{
              background: 'rgba(0, 0, 0, 0.03)',
              border: '1px solid var(--border-light)'
            }}
          >
            <FileText size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-gray-700 truncate">{fileName}</span>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--border-light)' }}
        >
          <button
            type="button"
            onClick={onBack}
            className="ds-btn ds-btn-ghost text-sm"
          >
            <ArrowLeft size={16} />
            Retour
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ds-btn ds-btn-primary py-2.5 px-6 text-sm font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Soumission...
              </>
            ) : (
              <>
                <Receipt size={16} />
                Soumettre la facture
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

// ============================================================
// Helper: format OCR date to input[type=date] value
// ============================================================
function formatDateForInput(dateStr) {
  if (!dateStr) return ''
  // Handle common OCR date formats: DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) return dateStr.slice(0, 10)

  const euroMatch = dateStr.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/)
  if (euroMatch) {
    const [, d, m, y] = euroMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  return ''
}

// ============================================================
// Main Page Component
// ============================================================
const UploadInvoicePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { provider } = useProviderAuth()
  const providerId = provider?.id

  // Wizard state
  const [step, setStep] = useState(1)
  const [file, setFile] = useState(null)
  const [fileId, setFileId] = useState(null)
  const [ocrData, setOcrData] = useState({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Fetch provider's active projects for the select dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['provider-projects-select', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: {
            main_provider_id: { _eq: providerId },
            status: { _in: ['active', 'in_progress', 'in-progress'] }
          },
          fields: ['id', 'name'],
          sort: ['name'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!providerId
  })

  // -- Upload file to Directus --
  const uploadFile = useCallback(async (fileToUpload) => {
    const formData = new FormData()
    formData.append('file', fileToUpload)
    const { data } = await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data?.data?.id
  }, [])

  // -- OCR analysis (graceful fallback) --
  const analyzeOCR = useCallback(async (uploadedFileId) => {
    try {
      const { data } = await api.post('/api/finance/ocr-analyze', { file_id: uploadedFileId })
      return data?.data || data || {}
    } catch {
      // OCR endpoint may not exist — return empty, handled gracefully
      return {}
    }
  }, [])

  // -- Handle the "Analyser avec OCR" button --
  const handleAnalyze = useCallback(async () => {
    if (!file) return

    setIsAnalyzing(true)
    setStep(2)

    try {
      // Step A: upload to Directus files
      const uploadedId = await uploadFile(file)
      if (!uploadedId) {
        toast.error('Erreur lors de l\'upload du fichier')
        setStep(1)
        setIsAnalyzing(false)
        return
      }
      setFileId(uploadedId)

      // Step B: OCR analysis
      const extracted = await analyzeOCR(uploadedId)
      setOcrData(extracted)

      // Move to review step
      setStep(3)
    } catch (err) {
      console.error('Erreur analyse:', err)
      toast.error('Erreur lors de l\'analyse. Vous pouvez remplir manuellement.')
      // Still move to step 3 with empty OCR data if file was uploaded
      if (fileId) {
        setStep(3)
      } else {
        setStep(1)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }, [file, fileId, uploadFile, analyzeOCR])

  // -- Submit invoice mutation --
  const submitInvoice = useMutation({
    mutationFn: async (formData) => {
      await api.post('/items/supplier_invoices', {
        provider_id: providerId,
        project_id: formData.project_id || null,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        amount: Math.round(formData.amount_ht * 100), // CHF centimes
        amount_ht: Math.round(formData.amount_ht * 100),
        vat_rate: formData.vat_rate,
        vat_amount: Math.round(formData.vat_amount * 100),
        total_ttc: Math.round(formData.amount_ttc * 100),
        iban: formData.iban,
        notes: formData.notes,
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
      navigate('/prestataire/invoices')
    },
    onError: () => {
      toast.error('Erreur lors de la soumission')
    }
  })

  // -- Handle back navigation --
  const handleBack = useCallback(() => {
    if (step === 3) {
      // Go back to step 1 (file is already uploaded so keep fileId)
      setStep(1)
    } else {
      navigate('/prestataire/invoices')
    }
  }, [step, navigate])

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/prestataire/invoices')}
          className="ds-btn ds-btn-ghost p-2"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="ds-page-title">Soumettre une facture</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload avec reconnaissance automatique OCR
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
      {step === 1 && (
        <StepUpload
          file={file}
          onFileSelected={setFile}
          onRemoveFile={() => {
            setFile(null)
            setFileId(null)
            setOcrData({})
          }}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      )}

      {step === 2 && (
        <StepAnalyzing />
      )}

      {step === 3 && (
        <StepReview
          ocrData={ocrData}
          fileId={fileId}
          fileName={file?.name || 'Fichier joint'}
          providerId={providerId}
          projects={projects}
          onSubmit={(data) => submitInvoice.mutate(data)}
          isSubmitting={submitInvoice.isPending}
          onBack={handleBack}
        />
      )}
    </div>
  )
}

export default UploadInvoicePage
