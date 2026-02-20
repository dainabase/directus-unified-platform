/**
 * VATReportsPage — Swiss VAT Reports (Formulaire 200 AFC)
 *
 * Displays quarterly/annual VAT declarations with:
 * - Period selector (quarterly Q1-Q4 + annual, year picker)
 * - Formulaire 200 AFC summary (Cases 200-510)
 * - Detail table by VAT rate (8.1%, 2.6%, 3.8%)
 * - Filing deadlines timeline with status badges
 * - VAT reconciliation summary
 * - Export & mark-as-filed actions
 *
 * Swiss VAT rates (CRITICAL — AFC 2025+):
 *   Standard:      8.1%
 *   Reduced:       2.6%
 *   Accommodation: 3.8%
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  Inbox,
  ArrowRight,
  Loader2,
  Printer,
  Shield
} from 'lucide-react'
import api from '../../../lib/axios'

// ── Swiss VAT rates — NEVER change these without AFC directive ──

const VAT_RATES = [
  { key: 'standard', rate: 0.081, label: 'Taux normal', display: '8.1%' },
  { key: 'reduced', rate: 0.026, label: 'Taux reduit', display: '2.6%' },
  { key: 'accommodation', rate: 0.038, label: 'Hebergement', display: '3.8%' }
]

const VAT_RATE_MAP = {
  8.1: 'standard',
  0.081: 'standard',
  2.6: 'reduced',
  0.026: 'reduced',
  3.8: 'accommodation',
  0.038: 'accommodation'
}

// ── Formatting helpers ──

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2
  }).format(amount || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ── Period helpers ──

function getCurrentQuarter() {
  const month = new Date().getMonth()
  return Math.floor(month / 3) + 1
}

function getCurrentYear() {
  return new Date().getFullYear()
}

function getPeriodDates(quarter, year) {
  if (quarter === 'annual') {
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`,
      label: `Annee ${year}`
    }
  }
  const q = parseInt(quarter)
  const startMonth = (q - 1) * 3
  const endMonth = startMonth + 2
  const lastDay = new Date(year, endMonth + 1, 0).getDate()
  return {
    start: `${year}-${String(startMonth + 1).padStart(2, '0')}-01`,
    end: `${year}-${String(endMonth + 1).padStart(2, '0')}-${lastDay}`,
    label: `T${q} ${year} (${['Jan-Mar', 'Avr-Jun', 'Jul-Sep', 'Oct-Dec'][q - 1]})`
  }
}

function getQuarterDeadline(quarter, year) {
  const deadlines = {
    1: new Date(year, 3, 30),      // Q1 → 30 April
    2: new Date(year, 6, 31),      // Q2 → 31 July
    3: new Date(year, 9, 31),      // Q3 → 31 October
    4: new Date(year + 1, 1, 28)   // Q4 → 28 February N+1
  }
  return deadlines[quarter]
}

function getDeadlineStatus(deadline, isFiled) {
  if (isFiled) return 'filed'
  const now = new Date()
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 30) return 'warning'
  return 'future'
}

const DEADLINE_STATUS_CONFIG = {
  filed:   { label: 'Declaree', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  overdue: { label: 'En retard', bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
  warning: { label: 'Echeance proche', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  future:  { label: 'A venir', bg: 'bg-gray-100', text: 'text-gray-500', icon: CalendarDays }
}

// ── Classify invoice tax rate into standard/reduced/accommodation ──

function classifyRate(taxRate) {
  if (taxRate == null || taxRate === undefined) return 'standard'

  const numRate = parseFloat(taxRate)
  if (isNaN(numRate)) return 'standard'

  // Handle both percentage (8.1) and decimal (0.081) formats
  const normalized = numRate > 1 ? numRate : numRate * 100

  if (Math.abs(normalized - 8.1) < 0.5) return 'standard'
  if (Math.abs(normalized - 2.6) < 0.5) return 'reduced'
  if (Math.abs(normalized - 3.8) < 0.5) return 'accommodation'

  // Default to standard if unrecognized
  return 'standard'
}

// ── Data fetching ──

async function fetchVATData(company, periodStart, periodEnd) {
  const companyFilter = company
    ? { owner_company: { _eq: company } }
    : {}

  const [clientRes, supplierRes] = await Promise.all([
    api.get('/items/client_invoices', {
      params: {
        filter: {
          status: { _neq: 'cancelled' },
          date_issued: { _between: [periodStart, periodEnd] },
          ...companyFilter
        },
        fields: ['id', 'total', 'tax_amount', 'total_ttc', 'tax_rate'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } })),

    api.get('/items/supplier_invoices', {
      params: {
        filter: {
          date_issued: { _between: [periodStart, periodEnd] },
          ...companyFilter
        },
        fields: ['id', 'total', 'tax_amount', 'total_ttc', 'tax_rate'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } }))
  ])

  const clientInvoices = clientRes?.data?.data || []
  const supplierInvoices = supplierRes?.data?.data || []

  return { clientInvoices, supplierInvoices }
}

// ── Compute VAT breakdown ──

function computeVATBreakdown(clientInvoices, supplierInvoices) {
  // Initialize accumulators per rate
  const collected = { standard: 0, reduced: 0, accommodation: 0 }
  const collectedCA = { standard: 0, reduced: 0, accommodation: 0 }
  const deductible = { standard: 0, reduced: 0, accommodation: 0 }
  const deductibleCA = { standard: 0, reduced: 0, accommodation: 0 }

  // Process client invoices (TVA collectee)
  clientInvoices.forEach((inv) => {
    const rateKey = classifyRate(inv.tax_rate)
    const taxAmount = parseFloat(inv.tax_amount || 0)
    const htAmount = parseFloat(inv.total || 0)

    if (taxAmount > 0) {
      collected[rateKey] += taxAmount
      collectedCA[rateKey] += htAmount
    } else {
      // If no tax_amount, compute from total using the rate
      const rateInfo = VAT_RATES.find((r) => r.key === rateKey)
      const computedTax = htAmount * rateInfo.rate
      collected[rateKey] += computedTax
      collectedCA[rateKey] += htAmount
    }
  })

  // Process supplier invoices (TVA deductible — impot prealable)
  supplierInvoices.forEach((inv) => {
    const rateKey = classifyRate(inv.tax_rate)
    const taxAmount = parseFloat(inv.tax_amount || 0)
    const htAmount = parseFloat(inv.total || 0)

    if (taxAmount > 0) {
      deductible[rateKey] += taxAmount
      deductibleCA[rateKey] += htAmount
    } else {
      const rateInfo = VAT_RATES.find((r) => r.key === rateKey)
      const computedTax = htAmount * rateInfo.rate
      deductible[rateKey] += computedTax
      deductibleCA[rateKey] += htAmount
    }
  })

  // Formulaire 200 cases
  const totalCA = Object.values(collectedCA).reduce((a, b) => a + b, 0)
  const case200 = totalCA
  const case205 = totalCA
  const case220 = collected.standard
  const case221 = collected.reduced
  const case225 = collected.accommodation
  const totalCollected = case220 + case221 + case225
  const case400 = Object.values(deductible).reduce((a, b) => a + b, 0)
  const case500 = totalCollected > case400 ? totalCollected - case400 : 0
  const case510 = case400 > totalCollected ? case400 - totalCollected : 0

  // Detail per rate
  const rateDetails = VAT_RATES.map((r) => ({
    key: r.key,
    label: r.label,
    display: r.display,
    ca: collectedCA[r.key],
    collected: collected[r.key],
    deductible: deductible[r.key],
    solde: collected[r.key] - deductible[r.key]
  }))

  return {
    case200,
    case205,
    case220,
    case221,
    case225,
    case400,
    case500,
    case510,
    totalCollected,
    totalDeductible: case400,
    netBalance: totalCollected - case400,
    rateDetails,
    invoiceCounts: {
      client: clientInvoices.length,
      supplier: supplierInvoices.length
    }
  }
}

// ── Export to CSV ──

function exportFormulaire200CSV(breakdown, periodLabel) {
  const rows = [
    ['Formulaire 200 AFC', periodLabel],
    [''],
    ['Case', 'Description', 'Montant CHF'],
    ['200', 'Chiffre d\'affaires total', breakdown.case200.toFixed(2)],
    ['205', 'Chiffre d\'affaires imposable', breakdown.case205.toFixed(2)],
    ['220', 'TVA au taux normal (8.1%)', breakdown.case220.toFixed(2)],
    ['221', 'TVA au taux reduit (2.6%)', breakdown.case221.toFixed(2)],
    ['225', 'TVA hebergement (3.8%)', breakdown.case225.toFixed(2)],
    ['', 'Total TVA collectee', breakdown.totalCollected.toFixed(2)],
    ['400', 'Impot prealable (TVA deductible)', breakdown.case400.toFixed(2)],
    ['500', 'Solde TVA a payer', breakdown.case500.toFixed(2)],
    ['510', 'Excedent (credit TVA)', breakdown.case510.toFixed(2)],
    [''],
    ['Detail par taux'],
    ['Taux', 'CA HT', 'TVA collectee', 'Impot prealable', 'Solde'],
    ...breakdown.rateDetails.map((r) => [
      r.display, r.ca.toFixed(2), r.collected.toFixed(2), r.deductible.toFixed(2), r.solde.toFixed(2)
    ])
  ]

  const csv = rows.map((r) => r.join(';')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `formulaire-200-${periodLabel.replace(/\s/g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Sub-components ──

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="ds-card p-6 h-16" />
      <div className="ds-card p-6 h-72" />
      <div className="ds-card p-6 h-48" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ds-card p-6 h-48" />
        <div className="ds-card p-6 h-36" />
      </div>
    </div>
  )
}

function PeriodSelector({ quarter, year, onQuarterChange, onYearChange }) {
  const years = []
  const currentYear = getCurrentYear()
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Quarter buttons */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {[1, 2, 3, 4].map((q) => (
          <button
            key={q}
            onClick={() => onQuarterChange(q)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              quarter === q
                ? 'bg-white text-[#0071E3] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            T{q}
          </button>
        ))}
        <button
          onClick={() => onQuarterChange('annual')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            quarter === 'annual'
              ? 'bg-white text-[#0071E3] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Annuel
        </button>
      </div>

      {/* Year selector */}
      <select
        value={year}
        onChange={(e) => onYearChange(parseInt(e.target.value))}
        className="ds-input"
        style={{ width: 'auto', minWidth: 90 }}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}

function Formulaire200Card({ breakdown }) {
  const cases = [
    { num: '200', desc: 'Chiffre d\'affaires total', value: breakdown.case200, indent: false },
    { num: '205', desc: 'Chiffre d\'affaires imposable', value: breakdown.case205, indent: false },
    { num: '', desc: '', value: null, separator: true },
    { num: '220', desc: 'TVA au taux normal (8.1%)', value: breakdown.case220, indent: false },
    { num: '221', desc: 'TVA au taux reduit (2.6%)', value: breakdown.case221, indent: false },
    { num: '225', desc: 'TVA hebergement (3.8%)', value: breakdown.case225, indent: false },
    { num: '', desc: 'Total TVA collectee', value: breakdown.totalCollected, bold: true },
    { num: '', desc: '', value: null, separator: true },
    { num: '400', desc: 'Impot prealable (TVA deductible sur achats)', value: breakdown.case400, indent: false },
    { num: '', desc: '', value: null, separator: true },
    { num: '500', desc: 'Solde TVA a payer', value: breakdown.case500, highlight: breakdown.case500 > 0 ? 'red' : null },
    { num: '510', desc: 'Excedent (credit TVA)', value: breakdown.case510, highlight: breakdown.case510 > 0 ? 'green' : null }
  ]

  return (
    <div className="ds-card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-[#0071E3]/10">
          <FileText size={18} className="text-[#0071E3]" />
        </div>
        <div>
          <h3 className="ds-card-title">Formulaire 200 AFC</h3>
          <p className="text-xs text-gray-500 mt-0.5">Declaration de la taxe sur la valeur ajoutee</p>
        </div>
      </div>

      <div className="space-y-0">
        {cases.map((c, idx) => {
          if (c.separator) {
            return <div key={idx} className="border-t border-gray-200 my-2" />
          }

          const highlightBg = c.highlight === 'red'
            ? 'bg-red-50'
            : c.highlight === 'green'
              ? 'bg-green-50'
              : ''

          return (
            <div
              key={idx}
              className={`flex items-center justify-between py-2 px-3 rounded-md ${highlightBg} ${c.bold ? 'font-semibold' : ''}`}
            >
              <div className="flex items-center gap-3">
                {c.num ? (
                  <span className="inline-flex items-center justify-center w-10 h-6 rounded bg-gray-100 text-xs font-mono font-semibold text-gray-600">
                    {c.num}
                  </span>
                ) : (
                  <span className="w-10" />
                )}
                <span className={`text-sm ${c.bold ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {c.desc}
                </span>
              </div>
              <span className={`text-sm font-mono ${
                c.highlight === 'red' ? 'text-red-700 font-semibold' :
                c.highlight === 'green' ? 'text-green-700 font-semibold' :
                c.bold ? 'text-gray-900 font-semibold' :
                'text-gray-900'
              }`}>
                {c.value != null ? formatCHF(c.value) : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-400">
        <Shield size={12} />
        <span>Taux AFC 2025+ : 8.1% / 2.6% / 3.8%</span>
        <span className="mx-1">|</span>
        <span>{breakdown.invoiceCounts.client} factures clients, {breakdown.invoiceCounts.supplier} factures fournisseurs</span>
      </div>
    </div>
  )
}

function RateDetailTable({ rateDetails }) {
  const totals = rateDetails.reduce(
    (acc, r) => ({
      ca: acc.ca + r.ca,
      collected: acc.collected + r.collected,
      deductible: acc.deductible + r.deductible,
      solde: acc.solde + r.solde
    }),
    { ca: 0, collected: 0, deductible: 0, solde: 0 }
  )

  return (
    <div className="ds-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50">
        <h3 className="ds-card-title">Detail par taux de TVA</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Taux</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">CA HT</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">TVA collectee</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Impot prealable</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Solde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rateDetails.map((r) => (
              <tr key={r.key} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{r.display}</span>
                    <span className="text-xs text-gray-400">{r.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-900">{formatCHF(r.ca)}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-900">{formatCHF(r.collected)}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-900">{formatCHF(r.deductible)}</td>
                <td className={`px-4 py-3 text-right font-mono font-medium ${
                  r.solde > 0 ? 'text-red-600' : r.solde < 0 ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {formatCHF(r.solde)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-3 text-gray-900">Total</td>
              <td className="px-4 py-3 text-right font-mono text-gray-900">{formatCHF(totals.ca)}</td>
              <td className="px-4 py-3 text-right font-mono text-gray-900">{formatCHF(totals.collected)}</td>
              <td className="px-4 py-3 text-right font-mono text-gray-900">{formatCHF(totals.deductible)}</td>
              <td className={`px-4 py-3 text-right font-mono ${
                totals.solde > 0 ? 'text-red-600' : totals.solde < 0 ? 'text-green-600' : 'text-gray-900'
              }`}>
                {formatCHF(totals.solde)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

function DeadlinesTimeline({ year, filedQuarters }) {
  const quarters = [1, 2, 3, 4]

  return (
    <div className="ds-card p-6">
      <h3 className="ds-card-title mb-4">Echeances de declaration {year}</h3>
      <div className="space-y-3">
        {quarters.map((q) => {
          const deadline = getQuarterDeadline(q, year)
          const isFiled = filedQuarters.includes(q)
          const status = getDeadlineStatus(deadline, isFiled)
          const cfg = DEADLINE_STATUS_CONFIG[status]
          const IconComponent = cfg.icon

          return (
            <div
              key={q}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${cfg.bg}`}>
                  <IconComponent size={14} className={cfg.text} />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">T{q} {year}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    ({['Jan-Mar', 'Avr-Jun', 'Jul-Sep', 'Oct-Dec'][q - 1]})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  Echeance: {formatDate(deadline.toISOString())}
                </span>
                <span className={`ds-badge ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReconciliationSummary({ totalCollected, totalDeductible, netBalance }) {
  const isCredit = netBalance < 0
  const absBalance = Math.abs(netBalance)

  return (
    <div className="ds-card p-6">
      <h3 className="ds-card-title mb-5">Reconciliation TVA</h3>

      <div className="flex flex-col items-center gap-4">
        {/* Visual equation */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="text-center px-4 py-3 rounded-lg bg-gray-50 min-w-[140px]">
            <p className="text-xs text-gray-500 mb-1">TVA collectee</p>
            <p className="text-lg font-bold font-mono text-gray-900">{formatCHF(totalCollected)}</p>
          </div>
          <span className="text-xl font-bold text-gray-400">-</span>
          <div className="text-center px-4 py-3 rounded-lg bg-gray-50 min-w-[140px]">
            <p className="text-xs text-gray-500 mb-1">TVA deductible</p>
            <p className="text-lg font-bold font-mono text-gray-900">{formatCHF(totalDeductible)}</p>
          </div>
          <span className="text-xl font-bold text-gray-400">=</span>
          <div className={`text-center px-4 py-3 rounded-lg min-w-[160px] ${
            isCredit ? 'bg-green-50 border border-green-200' : netBalance > 0 ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
          }`}>
            <p className="text-xs text-gray-500 mb-1">
              {isCredit ? 'Credit TVA (AFC vous doit)' : netBalance > 0 ? 'Solde a payer a l\'AFC' : 'Solde neutre'}
            </p>
            <p className={`text-2xl font-bold font-mono ${
              isCredit ? 'text-green-700' : netBalance > 0 ? 'text-red-700' : 'text-gray-900'
            }`}>
              {formatCHF(absBalance)}
            </p>
          </div>
        </div>

        {/* Status message */}
        <div className={`flex items-center gap-2 text-sm mt-2 px-4 py-2 rounded-full ${
          isCredit
            ? 'bg-green-50 text-green-700'
            : netBalance > 0
              ? 'bg-red-50 text-red-700'
              : 'bg-gray-50 text-gray-600'
        }`}>
          {isCredit ? (
            <>
              <CheckCircle2 size={14} />
              <span>L'AFC vous doit {formatCHF(absBalance)} (excedent d'impot prealable)</span>
            </>
          ) : netBalance > 0 ? (
            <>
              <AlertTriangle size={14} />
              <span>Vous devez {formatCHF(absBalance)} a l'AFC</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              <span>Aucun montant du ni dans un sens ni dans l'autre</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ──

export function VATReportsPage({ selectedCompany }) {
  const queryClient = useQueryClient()

  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [year, setYear] = useState(getCurrentYear())

  const company = selectedCompany === 'all' ? '' : selectedCompany
  const period = useMemo(() => getPeriodDates(quarter, year), [quarter, year])

  // Fetch VAT data
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['vat-reports', company, period.start, period.end],
    queryFn: () => fetchVATData(company, period.start, period.end),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  // Fetch filing status (stored in Directus settings or dedicated collection)
  const { data: filingData } = useQuery({
    queryKey: ['vat-filing-status', year],
    queryFn: async () => {
      try {
        const { data } = await api.get('/items/vat_declarations', {
          params: {
            filter: {
              year: { _eq: year },
              status: { _eq: 'filed' },
              ...(company ? { owner_company: { _eq: company } } : {})
            },
            fields: ['quarter', 'status', 'filed_date'],
            limit: -1
          }
        })
        return data?.data || []
      } catch {
        // Collection might not exist yet — gracefully return empty
        return []
      }
    },
    staleTime: 1000 * 60 * 5
  })

  const filedQuarters = useMemo(() => {
    if (!filingData) return []
    return filingData.map((d) => parseInt(d.quarter)).filter(Boolean)
  }, [filingData])

  // Compute VAT breakdown
  const breakdown = useMemo(() => {
    if (!rawData) return null
    return computeVATBreakdown(rawData.clientInvoices, rawData.supplierInvoices)
  }, [rawData])

  // Mark as filed mutation
  const markFiledMutation = useMutation({
    mutationFn: async () => {
      await api.post('/items/vat_declarations', {
        quarter: quarter === 'annual' ? null : quarter,
        year: year,
        status: 'filed',
        filed_date: new Date().toISOString().split('T')[0],
        total_collected: breakdown?.totalCollected || 0,
        total_deductible: breakdown?.totalDeductible || 0,
        net_balance: breakdown?.netBalance || 0,
        ...(company ? { owner_company: company } : {})
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vat-filing-status'] })
    }
  })

  // Export handler
  const handleExport = useCallback(() => {
    if (!breakdown) return
    exportFormulaire200CSV(breakdown, period.label)
  }, [breakdown, period.label])

  // Handle mark as filed
  const handleMarkFiled = useCallback(() => {
    if (window.confirm(`Marquer la declaration TVA ${period.label} comme declaree aupres de l'AFC ?`)) {
      markFiledMutation.mutate()
    }
  }, [markFiledMutation, period.label])

  // ── Error state ──
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-red-800 mb-2">Erreur de chargement</h3>
        <p className="text-sm text-red-600 mb-4">
          {error.message || 'Impossible de charger les donnees TVA'}
        </p>
        <button
          onClick={() => refetch()}
          className="ds-btn ds-btn-primary"
        >
          <RefreshCw size={14} /> Reessayer
        </button>
      </div>
    )
  }

  // ── Loading state ──
  if (isLoading && !rawData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
            <h2 className="text-xl font-bold text-gray-900">Rapports TVA</h2>
          </div>
        </div>
        <SkeletonLoader />
      </div>
    )
  }

  // ── Empty / no data ──
  if (!breakdown || (breakdown.invoiceCounts.client === 0 && breakdown.invoiceCounts.supplier === 0)) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
            <h2 className="text-xl font-bold text-gray-900">Rapports TVA</h2>
          </div>
          <button onClick={() => refetch()} disabled={isLoading} className="ds-btn ds-btn-ghost">
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* Period selector */}
        <PeriodSelector
          quarter={quarter}
          year={year}
          onQuarterChange={setQuarter}
          onYearChange={setYear}
        />

        {/* Empty state */}
        <div className="ds-card p-12 flex flex-col items-center justify-center text-center">
          <Inbox className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune donnee pour cette periode</h3>
          <p className="text-sm text-gray-500 max-w-md">
            Aucune facture client ou fournisseur trouvee pour {period.label}.
            Les calculs TVA apparaitront automatiquement une fois des factures enregistrees.
          </p>
        </div>

        {/* Deadlines always visible */}
        <DeadlinesTimeline year={year} filedQuarters={filedQuarters} />
      </div>
    )
  }

  // ── Main render ──
  const currentQuarterFiled = quarter !== 'annual' && filedQuarters.includes(parseInt(quarter))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
          <h2 className="text-xl font-bold text-gray-900">Rapports TVA</h2>
          <p className="text-sm text-gray-500 mt-1">Formulaire 200 AFC — {period.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="ds-btn ds-btn-ghost"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Period selector */}
      <PeriodSelector
        quarter={quarter}
        year={year}
        onQuarterChange={setQuarter}
        onYearChange={setYear}
      />

      {/* Formulaire 200 AFC summary */}
      <Formulaire200Card breakdown={breakdown} />

      {/* Detail table by rate */}
      <RateDetailTable rateDetails={breakdown.rateDetails} />

      {/* Reconciliation + Deadlines row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReconciliationSummary
          totalCollected={breakdown.totalCollected}
          totalDeductible={breakdown.totalDeductible}
          netBalance={breakdown.netBalance}
        />
        <DeadlinesTimeline year={year} filedQuarters={filedQuarters} />
      </div>

      {/* Action buttons */}
      <div className="ds-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText size={14} />
            <span>Actions pour {period.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="ds-btn ds-btn-secondary"
            >
              <Download size={14} />
              Exporter formulaire 200
            </button>

            {quarter !== 'annual' && (
              <button
                onClick={handleMarkFiled}
                disabled={currentQuarterFiled || markFiledMutation.isPending}
                className={`ds-btn ${currentQuarterFiled ? 'ds-btn-ghost' : 'ds-btn-primary'}`}
              >
                {markFiledMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : currentQuarterFiled ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {currentQuarterFiled
                  ? 'Deja declaree'
                  : markFiledMutation.isPending
                    ? 'Enregistrement...'
                    : 'Marquer comme declaree'
                }
              </button>
            )}
          </div>
        </div>

        {markFiledMutation.isError && (
          <div className="mt-3 p-3 rounded-lg bg-amber-50 text-amber-700 text-sm flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>
              Impossible d'enregistrer la declaration. La collection <code className="font-mono text-xs bg-amber-100 px-1 rounded">vat_declarations</code> n'existe peut-etre pas encore dans Directus.
            </span>
          </div>
        )}

        {markFiledMutation.isSuccess && (
          <div className="mt-3 p-3 rounded-lg bg-green-50 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span>Declaration T{quarter} {year} marquee comme soumise a l'AFC.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default VATReportsPage
