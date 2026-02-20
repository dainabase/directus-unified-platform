/**
 * QRInvoiceGenerator — Swiss QR-Bill Generator ISO 20022 v2.3
 *
 * Generates Swiss QR-Bills following SIX Group Implementation Guidelines v2.3.
 * Supports QRR, SCOR, and NON reference types with structured addresses.
 *
 * Swiss VAT rates (CRITICAL — AFC 2025+):
 *   Standard:      8.1%
 *   Reduced:       2.6%
 *   Accommodation: 3.8%
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, QrCode, FileText, Download, Copy,
  Loader2, AlertCircle, CheckCircle2, CreditCard,
  Building2, User, Info, RefreshCw, Scissors
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Constants ──

const REFERENCE_TYPES = [
  { value: 'QRR', label: 'QR-Reference (QRR)', description: '27 chiffres, mod10 recursif' },
  { value: 'SCOR', label: 'Creditor Reference (SCOR)', description: 'ISO 11649, RF + 2 check + max 21 chars' },
  { value: 'NON', label: 'Sans reference (NON)', description: 'Aucune reference structuree' }
]

const CURRENCIES = ['CHF', 'EUR']

const VAT_RATES = [
  { value: 8.1, label: '8.1% — Normal' },
  { value: 2.6, label: '2.6% — Reduit' },
  { value: 3.8, label: '3.8% — Hebergement' }
]

// ── Formatters ──

const formatCHF = (value, currency = 'CHF') => {
  const num = parseFloat(value)
  if (isNaN(num)) return `${currency} 0.00`
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(num)
}

const formatDate = (d) => {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ── QR-Reference Generator (mod10 recursive) ──

const generateQRReference = (invoiceNumber) => {
  const base = String(invoiceNumber).replace(/[^0-9]/g, '').padStart(26, '0').slice(0, 26)
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
  let carry = 0
  for (const char of base) {
    carry = table[(carry + parseInt(char, 10)) % 10]
  }
  return base + String((10 - carry) % 10)
}

// ── SCOR Reference Generator (ISO 11649) ──

const generateSCORReference = (invoiceNumber) => {
  const raw = String(invoiceNumber).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 21)
  // RF + 00 + reference, then compute check digits via mod97
  const refWithRF = raw + 'RF00'
  const numericStr = refWithRF.split('').map((ch) => {
    const code = ch.charCodeAt(0)
    return code >= 65 && code <= 90 ? String(code - 55) : ch
  }).join('')
  const remainder = BigInt(numericStr) % 97n
  const checkDigits = String(98n - remainder).padStart(2, '0')
  return `RF${checkDigits}${raw}`
}

// ── IBAN Validation (CH/LI) ──

const validateSwissIBAN = (iban) => {
  const clean = iban.replace(/\s/g, '').toUpperCase()
  if (!/^(CH|LI)\d{19}$/.test(clean)) return false
  // mod97 check
  const rearranged = clean.slice(4) + clean.slice(0, 4)
  const numericStr = rearranged.split('').map((ch) => {
    const code = ch.charCodeAt(0)
    return code >= 65 && code <= 90 ? String(code - 55) : ch
  }).join('')
  // Compute mod97 in chunks to avoid BigInt on older browsers
  let remainder = 0
  for (let i = 0; i < numericStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numericStr[i], 10)) % 97
  }
  return remainder === 1
}

// ── Format IBAN for display ──

const formatIBAN = (iban) => {
  const clean = iban.replace(/\s/g, '').toUpperCase()
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

// ── Validate QRR reference ──

const validateQRR = (ref) => {
  if (!/^\d{27}$/.test(ref)) return false
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
  let carry = 0
  for (const char of ref.slice(0, 26)) {
    carry = table[(carry + parseInt(char, 10)) % 10]
  }
  return parseInt(ref[26], 10) === (10 - carry) % 10
}

// ── Validate SCOR reference ──

const validateSCOR = (ref) => {
  if (!/^RF\d{2}[A-Za-z0-9]{1,21}$/.test(ref)) return false
  const rearranged = ref.slice(4) + ref.slice(0, 4)
  const numericStr = rearranged.split('').map((ch) => {
    const code = ch.toUpperCase().charCodeAt(0)
    return code >= 65 && code <= 90 ? String(code - 55) : ch
  }).join('')
  let remainder = 0
  for (let i = 0; i < numericStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numericStr[i], 10)) % 97
  }
  return remainder === 1
}

// ── Data Fetching ──

async function fetchInvoices(ownerCompany) {
  const filter = {
    status: { _in: ['draft', 'sent'] }
  }
  if (ownerCompany) filter.owner_company = { _eq: ownerCompany }

  const { data } = await api.get('/items/client_invoices', {
    params: {
      filter,
      fields: ['id', 'invoice_number', 'client_name', 'total_ttc', 'currency'],
      sort: ['-date_created'],
      limit: 200
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchInvoiceDetail(id) {
  const { data } = await api.get(`/items/client_invoices/${id}`, {
    params: {
      fields: [
        'id', 'invoice_number', 'client_name', 'client_address',
        'total_ttc', 'currency', 'status', 'owner_company',
        'date_issued', 'due_date', 'notes'
      ]
    }
  })
  return data?.data || data || null
}

async function fetchOwnerCompany(id) {
  const { data } = await api.get(`/items/owner_companies/${id}`, {
    params: {
      fields: ['id', 'name', 'address', 'postal_code', 'city', 'country', 'iban', 'bic']
    }
  }).catch(() => ({ data: { data: null } }))
  return data?.data || data || null
}

// ── Sub-components ──

const SectionCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`ds-card p-5 ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={16} className="text-[#0071E3]" />}
        <h3 className="ds-card-title text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
    )}
    {children}
  </div>
)

const FormField = ({ label, error, children, required = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

// ── QR-Bill Preview ──

const QRBillPreview = ({ creditor, debtor, amount, currency, referenceType, reference, message }) => {
  const formattedAmount = amount ? parseFloat(amount).toFixed(2) : ''

  const AddressBlock = ({ data, placeholder }) => (
    <div className="text-[10px] leading-tight text-gray-900">
      {data.name ? (
        <>
          <div className="font-medium">{data.name}</div>
          {data.street && <div>{data.street}</div>}
          <div>{data.postalCode} {data.city}</div>
        </>
      ) : (
        <div className="text-gray-400 italic">{placeholder}</div>
      )}
    </div>
  )

  return (
    <div className="border border-gray-300 bg-white rounded-md overflow-hidden" style={{ maxWidth: 680 }}>
      {/* Title bar */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-300 flex items-center gap-2">
        <Scissors size={12} className="text-gray-400 rotate-90" />
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Bulletin de versement / Payment part</span>
      </div>

      <div className="flex">
        {/* Receipt (left) */}
        <div className="w-[200px] border-r border-dashed border-gray-300 p-3 space-y-3 flex-shrink-0">
          <div>
            <p className="text-[8px] font-bold uppercase text-gray-600 mb-0.5">Empfangsschein / Recepisse</p>
          </div>
          <div>
            <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Compte / Payable a</p>
            <div className="text-[9px] leading-tight text-gray-900">
              {creditor.iban ? formatIBAN(creditor.iban) : 'CH__ ____ ____ ____ ____ _'}
            </div>
            <AddressBlock data={creditor} placeholder="Crediteur" />
          </div>
          {referenceType !== 'NON' && reference && (
            <div>
              <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Reference</p>
              <p className="text-[9px] font-mono text-gray-900 break-all">{reference}</p>
            </div>
          )}
          <div>
            <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Payable par</p>
            <AddressBlock data={debtor} placeholder="Debiteur" />
          </div>
          <div className="flex gap-4 pt-1">
            <div>
              <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Monnaie</p>
              <p className="text-[10px] font-medium">{currency}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Montant</p>
              <p className="text-[10px] font-medium font-mono">{formattedAmount || '______'}</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-[7px] text-gray-400 uppercase">Point de depot</p>
          </div>
        </div>

        {/* Payment part (right) */}
        <div className="flex-1 p-4 space-y-3">
          <p className="text-[9px] font-bold uppercase text-gray-600 mb-2">Zahlteil / Section paiement</p>

          <div className="flex gap-4">
            {/* QR code placeholder */}
            <div className="w-[120px] h-[120px] border-2 border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
              <div className="text-center">
                <QrCode size={40} className="text-gray-300 mx-auto mb-1" />
                <span className="text-[8px] text-gray-400 block">Swiss QR Code</span>
                <span className="text-[7px] text-gray-300 block">Genere cote serveur</span>
              </div>
            </div>

            {/* Info right of QR */}
            <div className="flex-1 space-y-2.5 min-w-0">
              <div>
                <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Compte / Payable a</p>
                <div className="text-[9px] leading-tight text-gray-900">
                  {creditor.iban ? formatIBAN(creditor.iban) : 'CH__ ____ ____ ____ ____ _'}
                </div>
                <AddressBlock data={creditor} placeholder="Crediteur" />
              </div>
              {referenceType !== 'NON' && reference && (
                <div>
                  <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Reference</p>
                  <p className="text-[9px] font-mono text-gray-900 break-all">{reference}</p>
                </div>
              )}
              {message && (
                <div>
                  <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Informations supplementaires</p>
                  <p className="text-[9px] text-gray-700 break-words">{message}</p>
                </div>
              )}
              <div>
                <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Payable par</p>
                <AddressBlock data={debtor} placeholder="Debiteur" />
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-1">
            <div>
              <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Monnaie</p>
              <p className="text-[11px] font-medium">{currency}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase text-gray-500 mb-0.5">Montant</p>
              <p className="text-[11px] font-medium font-mono">{formattedAmount || '______'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──

const QRInvoiceGenerator = ({ selectedCompany, invoiceId: propInvoiceId, onBack }) => {
  const queryClient = useQueryClient()
  const company = selectedCompany === 'all' ? '' : selectedCompany

  // ── State ──
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(propInvoiceId || null)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState({})

  // Creditor address (pre-filled from owner company)
  const [creditor, setCreditor] = useState({
    iban: '',
    name: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'CH'
  })

  // Debtor address (from invoice client)
  const [debtor, setDebtor] = useState({
    name: '',
    street: '',
    postalCode: '',
    city: '',
    country: 'CH'
  })

  // Payment info
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('CHF')
  const [referenceType, setReferenceType] = useState('QRR')
  const [reference, setReference] = useState('')
  const [message, setMessage] = useState('')

  const activeInvoiceId = selectedInvoiceId || propInvoiceId

  // ── Queries ──

  // Fetch available invoices (for selector if no invoiceId prop)
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['qr-invoices-list', company],
    queryFn: () => fetchInvoices(company),
    enabled: !propInvoiceId,
    staleTime: 30_000
  })

  // Fetch selected invoice detail
  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['qr-invoice-detail', activeInvoiceId],
    queryFn: () => fetchInvoiceDetail(activeInvoiceId),
    enabled: !!activeInvoiceId,
    staleTime: 15_000
  })

  // Fetch owner company for creditor info
  const { data: ownerCompany } = useQuery({
    queryKey: ['owner-company-qr', invoice?.owner_company || company],
    queryFn: () => fetchOwnerCompany(invoice?.owner_company || company),
    enabled: !!(invoice?.owner_company || company),
    staleTime: 60_000
  })

  // ── Pre-fill from invoice and owner company ──

  useEffect(() => {
    if (ownerCompany) {
      setCreditor((prev) => ({
        iban: ownerCompany.iban || prev.iban,
        name: ownerCompany.name || prev.name,
        street: ownerCompany.address || prev.street,
        postalCode: ownerCompany.postal_code || prev.postalCode,
        city: ownerCompany.city || prev.city,
        country: ownerCompany.country || 'CH'
      }))
    }
  }, [ownerCompany])

  useEffect(() => {
    if (invoice) {
      // Set amount and currency from invoice
      setAmount(String(parseFloat(invoice.total_ttc || 0)))
      setCurrency(invoice.currency || 'CHF')

      // Parse client address
      const addr = invoice.client_address || ''
      const lines = addr.split('\n').map((l) => l.trim()).filter(Boolean)

      setDebtor((prev) => ({
        name: invoice.client_name || prev.name,
        street: lines[0] || prev.street,
        postalCode: lines[1]?.match(/(\d{4,5})/)?.[1] || prev.postalCode,
        city: lines[1]?.replace(/^\d{4,5}\s*/, '') || prev.city,
        country: prev.country || 'CH'
      }))

      // Auto-generate reference
      if (invoice.invoice_number) {
        const qrRef = generateQRReference(invoice.invoice_number)
        setReference(qrRef)
      }

      // Set message with invoice number and due date
      const parts = []
      if (invoice.invoice_number) parts.push(`Facture ${invoice.invoice_number}`)
      if (invoice.due_date) parts.push(`Echeance: ${formatDate(invoice.due_date)}`)
      setMessage(parts.join(' — '))
    }
  }, [invoice])

  // ── Validation ──

  const validate = useCallback(() => {
    const newErrors = {}

    // IBAN
    if (!creditor.iban.trim()) {
      newErrors.iban = 'IBAN requis'
    } else if (!validateSwissIBAN(creditor.iban)) {
      newErrors.iban = 'IBAN suisse invalide (CH/LI, 21 caracteres)'
    }

    // Creditor address
    if (!creditor.name.trim()) newErrors.creditorName = 'Nom du crediteur requis'
    if (!creditor.street.trim()) newErrors.creditorStreet = 'Rue requise'
    if (!creditor.postalCode.trim()) newErrors.creditorPostalCode = 'NPA requis'
    if (!creditor.city.trim()) newErrors.creditorCity = 'Localite requise'

    // Amount
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Le montant doit etre superieur a 0'
    } else if (numAmount > 999999999.99) {
      newErrors.amount = 'Le montant ne peut pas depasser 999 999 999.99'
    }

    // Reference validation based on type
    if (referenceType === 'QRR') {
      if (!reference.trim()) {
        newErrors.reference = 'Reference QRR requise (27 chiffres)'
      } else if (!validateQRR(reference.trim())) {
        newErrors.reference = 'Reference QRR invalide (27 chiffres, checksum mod10 recursive)'
      }
    } else if (referenceType === 'SCOR') {
      if (!reference.trim()) {
        newErrors.reference = 'Reference SCOR requise (RF + check + max 21 chars)'
      } else if (!validateSCOR(reference.trim())) {
        newErrors.reference = 'Reference SCOR invalide (format ISO 11649)'
      }
    }

    // Debtor address (structured required by SIX IG v2.3)
    if (!debtor.name.trim()) newErrors.debtorName = 'Nom du debiteur requis'
    if (!debtor.street.trim()) newErrors.debtorStreet = 'Rue du debiteur requise'
    if (!debtor.postalCode.trim()) newErrors.debtorPostalCode = 'NPA du debiteur requis'
    if (!debtor.city.trim()) newErrors.debtorCity = 'Localite du debiteur requise'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [creditor, debtor, amount, referenceType, reference])

  // ── Build QR data payload ──

  const buildQRPayload = useCallback(() => ({
    creditor: {
      iban: creditor.iban.replace(/\s/g, '').toUpperCase(),
      name: creditor.name,
      street: creditor.street,
      postalCode: creditor.postalCode,
      city: creditor.city,
      country: creditor.country
    },
    debtor: {
      name: debtor.name,
      street: debtor.street,
      postalCode: debtor.postalCode,
      city: debtor.city,
      country: debtor.country
    },
    amount: parseFloat(amount),
    currency,
    referenceType,
    reference: referenceType === 'NON' ? '' : reference.trim(),
    message: message.trim()
  }), [creditor, debtor, amount, currency, referenceType, reference, message])

  // ── Mutations ──

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Validation echouee')
      const payload = buildQRPayload()
      const { data } = await api.post(`/api/finance/invoices/${activeInvoiceId}/qr`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-invoice', activeInvoiceId] })
    }
  })

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!validate()) throw new Error('Validation echouee')
      const payload = buildQRPayload()
      const { data } = await api.post(
        `/api/finance/invoices/${activeInvoiceId}/qr/pdf`,
        payload,
        { responseType: 'blob' }
      )
      return data
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-invoice-${invoice?.invoice_number || activeInvoiceId}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    }
  })

  // ── Copy to clipboard ──

  const handleCopy = useCallback(async () => {
    const payload = buildQRPayload()
    const text = [
      `IBAN: ${formatIBAN(payload.creditor.iban)}`,
      `Crediteur: ${payload.creditor.name}`,
      `${payload.creditor.street}, ${payload.creditor.postalCode} ${payload.creditor.city}`,
      '',
      `Debiteur: ${payload.debtor.name}`,
      `${payload.debtor.street}, ${payload.debtor.postalCode} ${payload.debtor.city}`,
      '',
      `Montant: ${formatCHF(payload.amount, payload.currency)}`,
      `Monnaie: ${payload.currency}`,
      `Type reference: ${payload.referenceType}`,
      payload.reference ? `Reference: ${payload.reference}` : '',
      payload.message ? `Message: ${payload.message}` : ''
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }, [buildQRPayload])

  // ── Reference auto-generation on type change ──

  const handleReferenceTypeChange = useCallback((type) => {
    setReferenceType(type)
    if (!invoice?.invoice_number) return

    if (type === 'QRR') {
      setReference(generateQRReference(invoice.invoice_number))
    } else if (type === 'SCOR') {
      setReference(generateSCORReference(invoice.invoice_number))
    } else {
      setReference('')
    }
  }, [invoice?.invoice_number])

  // ── Update creditor field helper ──

  const updateCreditor = (field, value) => {
    setCreditor((prev) => ({ ...prev, [field]: value }))
    if (errors[`creditor${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[`creditor${field.charAt(0).toUpperCase() + field.slice(1)}`]
        return next
      })
    }
  }

  const updateDebtor = (field, value) => {
    setDebtor((prev) => ({ ...prev, [field]: value }))
    if (errors[`debtor${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[`debtor${field.charAt(0).toUpperCase() + field.slice(1)}`]
        return next
      })
    }
  }

  // ── Loading state ──

  if (invoiceLoading && activeInvoiceId) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="ds-btn ds-btn-ghost inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
          <h2 className="text-xl font-bold text-gray-900">Generateur QR-Invoice</h2>
          <p className="text-sm text-gray-500 mt-1">
            SIX Group IG v2.3 — ISO 20022 Swiss QR-Bill
          </p>
        </div>
        {invoice && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-[#0071E3] text-sm font-medium">
            <FileText size={14} />
            {invoice.invoice_number || `Facture #${invoice.id}`}
          </span>
        )}
      </div>

      {/* Invoice selector (if no invoiceId prop) */}
      {!propInvoiceId && (
        <SectionCard title="Selection de la facture" icon={FileText}>
          {invoicesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Chargement des factures...
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune facture brouillon ou envoyee</p>
            </div>
          ) : (
            <select
              value={selectedInvoiceId || ''}
              onChange={(e) => setSelectedInvoiceId(e.target.value || null)}
              className="ds-input w-full"
            >
              <option value="">-- Selectionner une facture --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number || `#${inv.id}`} — {inv.client_name} — {formatCHF(inv.total_ttc, inv.currency || 'CHF')}
                </option>
              ))}
            </select>
          )}
        </SectionCard>
      )}

      {/* No invoice selected */}
      {!activeInvoiceId && (
        <div className="ds-card p-12 text-center">
          <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Selectionnez une facture</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Choisissez une facture client ci-dessus pour generer le QR-Bill correspondant.
          </p>
        </div>
      )}

      {/* Main form (only when invoice is selected) */}
      {activeInvoiceId && invoice && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Creditor info */}
            <SectionCard title="Crediteur (beneficiaire)" icon={Building2}>
              <div className="space-y-4">
                <FormField label="IBAN" error={errors.iban} required>
                  <input
                    type="text"
                    value={formatIBAN(creditor.iban)}
                    onChange={(e) => {
                      updateCreditor('iban', e.target.value.replace(/\s/g, ''))
                      if (errors.iban) setErrors((prev) => ({ ...prev, iban: undefined }))
                    }}
                    placeholder="CH93 0076 2011 6238 5295 7"
                    className={`ds-input w-full font-mono ${errors.iban ? 'border-red-300 focus:ring-red-400' : ''}`}
                    maxLength={26}
                  />
                </FormField>
                <FormField label="Nom / Raison sociale" error={errors.creditorName} required>
                  <input
                    type="text"
                    value={creditor.name}
                    onChange={(e) => updateCreditor('name', e.target.value)}
                    className={`ds-input w-full ${errors.creditorName ? 'border-red-300' : ''}`}
                    maxLength={70}
                  />
                </FormField>
                <FormField label="Rue et numero" error={errors.creditorStreet} required>
                  <input
                    type="text"
                    value={creditor.street}
                    onChange={(e) => updateCreditor('street', e.target.value)}
                    className={`ds-input w-full ${errors.creditorStreet ? 'border-red-300' : ''}`}
                    maxLength={70}
                  />
                </FormField>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="NPA" error={errors.creditorPostalCode} required>
                    <input
                      type="text"
                      value={creditor.postalCode}
                      onChange={(e) => updateCreditor('postalCode', e.target.value)}
                      className={`ds-input w-full ${errors.creditorPostalCode ? 'border-red-300' : ''}`}
                      maxLength={16}
                    />
                  </FormField>
                  <FormField label="Localite" error={errors.creditorCity} required>
                    <input
                      type="text"
                      value={creditor.city}
                      onChange={(e) => updateCreditor('city', e.target.value)}
                      className={`ds-input w-full ${errors.creditorCity ? 'border-red-300' : ''}`}
                      maxLength={35}
                    />
                  </FormField>
                  <FormField label="Pays">
                    <input
                      type="text"
                      value={creditor.country}
                      onChange={(e) => updateCreditor('country', e.target.value.toUpperCase())}
                      className="ds-input w-full"
                      maxLength={2}
                    />
                  </FormField>
                </div>
              </div>
            </SectionCard>

            {/* Debtor info */}
            <SectionCard title="Debiteur (payeur)" icon={User}>
              <div className="space-y-4">
                <FormField label="Nom / Raison sociale" error={errors.debtorName} required>
                  <input
                    type="text"
                    value={debtor.name}
                    onChange={(e) => updateDebtor('name', e.target.value)}
                    className={`ds-input w-full ${errors.debtorName ? 'border-red-300' : ''}`}
                    maxLength={70}
                  />
                </FormField>
                <FormField label="Rue et numero" error={errors.debtorStreet} required>
                  <input
                    type="text"
                    value={debtor.street}
                    onChange={(e) => updateDebtor('street', e.target.value)}
                    className={`ds-input w-full ${errors.debtorStreet ? 'border-red-300' : ''}`}
                    maxLength={70}
                  />
                </FormField>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="NPA" error={errors.debtorPostalCode} required>
                    <input
                      type="text"
                      value={debtor.postalCode}
                      onChange={(e) => updateDebtor('postalCode', e.target.value)}
                      className={`ds-input w-full ${errors.debtorPostalCode ? 'border-red-300' : ''}`}
                      maxLength={16}
                    />
                  </FormField>
                  <FormField label="Localite" error={errors.debtorCity} required>
                    <input
                      type="text"
                      value={debtor.city}
                      onChange={(e) => updateDebtor('city', e.target.value)}
                      className={`ds-input w-full ${errors.debtorCity ? 'border-red-300' : ''}`}
                      maxLength={35}
                    />
                  </FormField>
                  <FormField label="Pays">
                    <input
                      type="text"
                      value={debtor.country}
                      onChange={(e) => updateDebtor('country', e.target.value.toUpperCase())}
                      className="ds-input w-full"
                      maxLength={2}
                    />
                  </FormField>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Payment info */}
          <SectionCard title="Informations de paiement" icon={CreditCard}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField label="Montant" error={errors.amount} required>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
                  }}
                  className={`ds-input w-full font-mono ${errors.amount ? 'border-red-300' : ''}`}
                  min="0.01"
                  max="999999999.99"
                  step="0.01"
                />
              </FormField>
              <FormField label="Monnaie">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="ds-input w-full"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Type de reference" required>
                <select
                  value={referenceType}
                  onChange={(e) => handleReferenceTypeChange(e.target.value)}
                  className="ds-input w-full"
                >
                  {REFERENCE_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              </FormField>
              {referenceType !== 'NON' && (
                <FormField label="Reference" error={errors.reference} required>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => {
                      setReference(e.target.value)
                      if (errors.reference) setErrors((prev) => ({ ...prev, reference: undefined }))
                    }}
                    className={`ds-input w-full font-mono text-xs ${errors.reference ? 'border-red-300' : ''}`}
                    placeholder={referenceType === 'QRR' ? '00000000000000000000000000X' : 'RF18539007547034'}
                  />
                </FormField>
              )}
            </div>

            {/* Reference type description */}
            <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                {REFERENCE_TYPES.find((r) => r.value === referenceType)?.description}
                {referenceType === 'QRR' && ' — Compatible avec les QR-IBAN (QR-IID 30000-31999).'}
                {referenceType === 'SCOR' && ' — Compatible avec les IBAN standards.'}
              </span>
            </div>

            {/* Additional message */}
            <div className="mt-4">
              <FormField label="Message additionnel (non structure)">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="ds-input w-full"
                  maxLength={140}
                  placeholder="Facture INV-2026-001 — Echeance: 15.03.2026"
                />
                <p className="text-[10px] text-gray-400 mt-1">{message.length}/140 caracteres</p>
              </FormField>
            </div>
          </SectionCard>

          {/* QR-Bill Preview */}
          <SectionCard title="Apercu du bulletin de versement" icon={QrCode}>
            <QRBillPreview
              creditor={creditor}
              debtor={debtor}
              amount={amount}
              currency={currency}
              referenceType={referenceType}
              reference={reference}
              message={message}
            />
            <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1.5">
              <Info size={10} />
              Apercu indicatif. Le QR Code final est genere cote serveur avec les donnees validees.
            </p>
          </SectionCard>

          {/* Action buttons */}
          <div className="ds-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <QrCode size={14} />
                <span>Actions QR-Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Copy data */}
                <button
                  onClick={handleCopy}
                  className="ds-btn ds-btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={14} className="text-green-600" />
                      <span className="text-green-600">Copie</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copier les donnees
                    </>
                  )}
                </button>

                {/* Download PDF */}
                <button
                  onClick={() => downloadMutation.mutate()}
                  disabled={downloadMutation.isPending}
                  className="ds-btn ds-btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {downloadMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  Telecharger PDF
                </button>

                {/* Generate QR-Invoice */}
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                  className="ds-btn ds-btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#0071E3] rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {generateMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <QrCode size={14} />
                  )}
                  Generer QR-Invoice
                </button>
              </div>
            </div>

            {/* Success message */}
            {generateMutation.isSuccess && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 text-green-700 text-sm flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>QR-Invoice genere avec succes pour {invoice?.invoice_number || `#${activeInvoiceId}`}.</span>
              </div>
            )}

            {/* Error messages */}
            {generateMutation.isError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={14} />
                <span>
                  {generateMutation.error?.message === 'Validation echouee'
                    ? 'Veuillez corriger les erreurs de validation ci-dessus.'
                    : `Erreur: ${generateMutation.error?.response?.data?.message || generateMutation.error?.message || 'Echec de generation.'}`
                  }
                </span>
              </div>
            )}

            {downloadMutation.isError && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm flex items-center gap-2">
                <AlertCircle size={14} />
                <span>
                  Impossible de telecharger le PDF. L'endpoint serveur n'est peut-etre pas encore implemente.
                </span>
              </div>
            )}

            {/* Validation errors summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm">
                <div className="flex items-center gap-2 mb-2 font-medium">
                  <AlertCircle size={14} />
                  <span>Erreurs de validation ({Object.keys(errors).length})</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  {Object.values(errors).filter(Boolean).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* SIX Group compliance note */}
          <div className="flex items-start gap-3 text-xs text-gray-400 px-1">
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              Conforme aux Implementation Guidelines SIX Group v2.3 pour les QR-factures suisses.
              Adresses structurees obligatoires (type S). Taux TVA AFC 2025+ : 8.1% / 2.6% / 3.8%.
              Le QR Code contient les donnees au format Swiss Payment Standard selon ISO 20022.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default QRInvoiceGenerator
