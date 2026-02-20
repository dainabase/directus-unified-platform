/**
 * AccountingPage — Plan comptable PME (Kafer)
 * Full Swiss accounting page with 3 tabs:
 *   1. Balance des comptes (trial balance grouped by account class)
 *   2. Journal des ecritures (chronological ledger with search/filter/pagination)
 *   3. Comptes individuels (single account view with running balance)
 *
 * Data source: `accounting_entries` collection from Directus.
 * Fallback reconstruction from `client_invoices`, `supplier_invoices`, `bank_transactions`
 * when accounting_entries is empty.
 *
 * @prop {string} selectedCompany - owner_company filter (or 'all')
 */

import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Inbox,
  Calendar,
  ListOrdered,
  BarChart3,
  FileText,
  Filter,
  ChevronsUpDown
} from 'lucide-react'
import api from '../../../lib/axios'

// ── Constants ──

const PAGE_SIZE = 50

const ACCOUNT_CLASSES = {
  1: 'Actifs',
  2: 'Passifs',
  3: 'Produits',
  4: 'Charges matieres',
  5: 'Charges de personnel',
  6: 'Autres charges',
  7: 'Produits hors exploitation',
  8: 'Charges hors exploitation',
  9: 'Cloture'
}

const KAFER_ACCOUNTS = [
  { code: '1000', label: 'Caisse', class: 1 },
  { code: '1020', label: 'Banque (PostFinance, Raiffeisen)', class: 1 },
  { code: '1100', label: 'Debiteurs (creances clients)', class: 1 },
  { code: '1200', label: 'Stock marchandises', class: 1 },
  { code: '2000', label: 'Creanciers (dettes fournisseurs)', class: 2 },
  { code: '2100', label: 'Dettes bancaires CT', class: 2 },
  { code: '2200', label: 'TVA due', class: 2 },
  { code: '3000', label: 'Ventes de marchandises', class: 3 },
  { code: '3200', label: 'Ventes de services', class: 3 },
  { code: '3400', label: "Autres produits d'exploitation", class: 3 },
  { code: '4000', label: 'Achats de marchandises', class: 4 },
  { code: '4400', label: 'Prestations de tiers', class: 4 },
  { code: '5000', label: 'Salaires', class: 5 },
  { code: '5200', label: 'Charges sociales (AVS, AI, APG, AC)', class: 5 },
  { code: '6000', label: 'Loyers', class: 6 },
  { code: '6100', label: 'Entretien', class: 6 },
  { code: '6500', label: "Frais d'administration", class: 6 },
  { code: '6800', label: 'Charges financieres', class: 6 },
  { code: '7000', label: 'Produits hors exploitation', class: 7 },
  { code: '8000', label: 'Charges hors exploitation', class: 8 }
]

const TABS = [
  { id: 'balance', label: 'Balance', icon: BarChart3 },
  { id: 'journal', label: 'Journal', icon: ListOrdered },
  { id: 'comptes', label: 'Comptes individuels', icon: FileText }
]

// ── Formatting helpers ──

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2
  }).format(amount)

const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDateLong = (dateStr) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// ── Data fetchers ──

async function fetchAccountingEntries(company, year) {
  const filter = {}
  if (company && company !== 'all') {
    filter.owner_company = { _eq: company }
  }
  if (year) {
    filter.date_created = {
      _gte: `${year}-01-01`,
      _lte: `${year}-12-31T23:59:59`
    }
  }

  const { data } = await api.get('/items/accounting_entries', {
    params: {
      filter: Object.keys(filter).length ? filter : undefined,
      sort: ['-date_created'],
      limit: -1,
      fields: [
        'id', 'entry_number', 'description', 'amount', 'type',
        'account_code', 'account_label', 'counterpart_code',
        'counterpart_label', 'owner_company', 'date_created', 'status'
      ]
    }
  }).catch(() => ({ data: { data: [] } }))

  return data?.data || []
}

async function fetchFallbackData(company, year) {
  const companyFilter = company && company !== 'all'
    ? { owner_company: { _eq: company } }
    : {}

  const dateFilter = year
    ? { date_created: { _gte: `${year}-01-01`, _lte: `${year}-12-31T23:59:59` } }
    : {}

  const filter = { ...companyFilter, ...dateFilter }
  const filterParam = Object.keys(filter).length ? filter : undefined

  const [clientInv, supplierInv, bankTx] = await Promise.all([
    api.get('/items/client_invoices', {
      params: {
        filter: filterParam,
        fields: ['id', 'invoice_number', 'total_amount', 'status', 'date_created', 'client_name', 'owner_company'],
        sort: ['-date_created'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } })),

    api.get('/items/supplier_invoices', {
      params: {
        filter: filterParam,
        fields: ['id', 'invoice_number', 'amount', 'status', 'date_created', 'supplier_name', 'owner_company'],
        sort: ['-date_created'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } })),

    api.get('/items/bank_transactions', {
      params: {
        filter: filterParam,
        fields: ['id', 'reference', 'amount', 'type', 'date_created', 'description', 'owner_company'],
        sort: ['-date_created'],
        limit: -1
      }
    }).catch(() => ({ data: { data: [] } }))
  ])

  const entries = []
  let seq = 1

  // Reconstruct from client invoices (paid = credit 3200, debit 1100)
  const clientItems = clientInv.data?.data || []
  clientItems.forEach((inv) => {
    if (inv.status !== 'paid' && inv.status !== 'validated') return
    const amount = parseFloat(inv.total_amount || 0)
    if (amount <= 0) return

    entries.push({
      id: `ci-d-${inv.id}`,
      entry_number: `R-${String(seq++).padStart(4, '0')}`,
      description: `Facture client ${inv.invoice_number || ''} — ${inv.client_name || 'Client'}`,
      amount,
      type: 'debit',
      account_code: '1100',
      account_label: 'Debiteurs',
      counterpart_code: '3200',
      counterpart_label: 'Ventes de services',
      date_created: inv.date_created,
      status: 'validated',
      owner_company: inv.owner_company,
      _source: 'client_invoice'
    })
    entries.push({
      id: `ci-c-${inv.id}`,
      entry_number: `R-${String(seq++).padStart(4, '0')}`,
      description: `Facture client ${inv.invoice_number || ''} — ${inv.client_name || 'Client'}`,
      amount,
      type: 'credit',
      account_code: '3200',
      account_label: 'Ventes de services',
      counterpart_code: '1100',
      counterpart_label: 'Debiteurs',
      date_created: inv.date_created,
      status: 'validated',
      owner_company: inv.owner_company,
      _source: 'client_invoice'
    })
  })

  // Reconstruct from supplier invoices (paid = debit 4400, credit 2000)
  const supplierItems = supplierInv.data?.data || []
  supplierItems.forEach((inv) => {
    if (inv.status !== 'paid' && inv.status !== 'approved') return
    const amount = parseFloat(inv.amount || 0)
    if (amount <= 0) return

    entries.push({
      id: `si-d-${inv.id}`,
      entry_number: `R-${String(seq++).padStart(4, '0')}`,
      description: `Facture fournisseur ${inv.invoice_number || ''} — ${inv.supplier_name || 'Fournisseur'}`,
      amount,
      type: 'debit',
      account_code: '4400',
      account_label: 'Prestations de tiers',
      counterpart_code: '2000',
      counterpart_label: 'Creanciers',
      date_created: inv.date_created,
      status: 'validated',
      owner_company: inv.owner_company,
      _source: 'supplier_invoice'
    })
    entries.push({
      id: `si-c-${inv.id}`,
      entry_number: `R-${String(seq++).padStart(4, '0')}`,
      description: `Facture fournisseur ${inv.invoice_number || ''} — ${inv.supplier_name || 'Fournisseur'}`,
      amount,
      type: 'credit',
      account_code: '2000',
      account_label: 'Creanciers',
      counterpart_code: '4400',
      counterpart_label: 'Prestations de tiers',
      date_created: inv.date_created,
      status: 'validated',
      owner_company: inv.owner_company,
      _source: 'supplier_invoice'
    })
  })

  // Reconstruct from bank transactions (debit/credit on 1020)
  const bankItems = bankTx.data?.data || []
  bankItems.forEach((tx) => {
    const amount = Math.abs(parseFloat(tx.amount || 0))
    if (amount <= 0) return
    const isCredit = parseFloat(tx.amount || 0) > 0 || tx.type === 'credit'

    entries.push({
      id: `bt-${tx.id}`,
      entry_number: `R-${String(seq++).padStart(4, '0')}`,
      description: tx.description || tx.reference || 'Transaction bancaire',
      amount,
      type: isCredit ? 'debit' : 'credit',
      account_code: '1020',
      account_label: 'Banque',
      counterpart_code: isCredit ? '3400' : '6500',
      counterpart_label: isCredit ? "Autres produits d'exploitation" : "Frais d'administration",
      date_created: tx.date_created,
      status: 'validated',
      owner_company: tx.owner_company,
      _source: 'bank_transaction'
    })
  })

  // Sort by date descending
  entries.sort((a, b) => new Date(b.date_created) - new Date(a.date_created))

  return entries
}

// ── Compute helpers ──

function computeTrialBalance(entries) {
  // Aggregate by account_code
  const accountMap = {}

  // Initialize from Kafer reference
  KAFER_ACCOUNTS.forEach((acc) => {
    accountMap[acc.code] = {
      code: acc.code,
      label: acc.label,
      classNum: acc.class,
      debit: 0,
      credit: 0
    }
  })

  // Aggregate entries
  entries.forEach((e) => {
    const code = e.account_code
    if (!code) return
    const amount = parseFloat(e.amount || 0)
    const classNum = parseInt(code.charAt(0), 10)

    if (!accountMap[code]) {
      accountMap[code] = {
        code,
        label: e.account_label || `Compte ${code}`,
        classNum: isNaN(classNum) ? 9 : classNum,
        debit: 0,
        credit: 0
      }
    }

    if (e.type === 'debit') {
      accountMap[code].debit += amount
    } else if (e.type === 'credit') {
      accountMap[code].credit += amount
    }
  })

  // Build class-grouped structure
  const accounts = Object.values(accountMap)
    .filter((a) => a.debit > 0 || a.credit > 0)
    .sort((a, b) => a.code.localeCompare(b.code))

  const classes = {}
  accounts.forEach((acc) => {
    const cls = acc.classNum
    if (!classes[cls]) {
      classes[cls] = {
        classNum: cls,
        className: ACCOUNT_CLASSES[cls] || `Classe ${cls}`,
        accounts: [],
        totalDebit: 0,
        totalCredit: 0
      }
    }
    classes[cls].accounts.push(acc)
    classes[cls].totalDebit += acc.debit
    classes[cls].totalCredit += acc.credit
  })

  const sortedClasses = Object.values(classes).sort((a, b) => a.classNum - b.classNum)

  const grandTotalDebit = sortedClasses.reduce((s, c) => s + c.totalDebit, 0)
  const grandTotalCredit = sortedClasses.reduce((s, c) => s + c.totalCredit, 0)

  return { classes: sortedClasses, grandTotalDebit, grandTotalCredit }
}

function getUniqueAccounts(entries) {
  const map = {}
  KAFER_ACCOUNTS.forEach((acc) => {
    map[acc.code] = acc.label
  })
  entries.forEach((e) => {
    if (e.account_code && !map[e.account_code]) {
      map[e.account_code] = e.account_label || `Compte ${e.account_code}`
    }
  })
  return Object.entries(map)
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

function computeAccountLedger(entries, accountCode) {
  const filtered = entries
    .filter((e) => e.account_code === accountCode)
    .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))

  let runningBalance = 0
  const classNum = parseInt(accountCode.charAt(0), 10)
  // Assets (1) and expenses (4,5,6,8) have normal debit balance
  // Liabilities (2), revenues (3,7) have normal credit balance
  const isDebitNormal = [1, 4, 5, 6, 8].includes(classNum)

  return filtered.map((entry) => {
    const amount = parseFloat(entry.amount || 0)
    if (entry.type === 'debit') {
      runningBalance += isDebitNormal ? amount : -amount
    } else {
      runningBalance += isDebitNormal ? -amount : amount
    }
    return { ...entry, runningBalance }
  })
}

// ── Year options ──

function getYearOptions() {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y)
  }
  return years
}

// ── Sub-components ──

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="ds-card p-6 h-16 animate-pulse" />
      <div className="ds-card p-6 h-12 animate-pulse" />
      <div className="ds-card p-6 h-96 animate-pulse" />
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="ds-card p-12 flex flex-col items-center justify-center text-center">
      <Inbox className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune ecriture comptable</h3>
      <p className="text-sm text-gray-500 max-w-md">
        {message || "Aucune donnee comptable trouvee pour cette periode. Les ecritures apparaitront ici une fois creees dans Directus ou reconstruites depuis les factures et transactions."}
      </p>
    </div>
  )
}

// ── Tab: Balance des comptes ──

function BalanceTab({ entries }) {
  const balance = useMemo(() => computeTrialBalance(entries), [entries])
  const isBalanced = Math.abs(balance.grandTotalDebit - balance.grandTotalCredit) < 0.01

  if (balance.classes.length === 0) {
    return <EmptyState message="Aucun mouvement comptable pour calculer la balance." />
  }

  return (
    <div className="ds-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Balance des comptes</h3>
        {!isBalanced && (
          <span className="ds-badge ds-badge-warning inline-flex items-center gap-1.5">
            <AlertCircle size={12} />
            Ecart: {formatCHF(Math.abs(balance.grandTotalDebit - balance.grandTotalCredit))}
          </span>
        )}
        {isBalanced && (
          <span className="ds-badge ds-badge-success inline-flex items-center gap-1.5">
            Equilibre
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="text-left px-4 py-3 font-medium text-gray-500 w-24">N. Compte</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Libelle</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 w-36">Debit</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 w-36">Credit</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 w-36">Solde</th>
            </tr>
          </thead>
          <tbody>
            {balance.classes.map((cls) => (
              <React.Fragment key={cls.classNum}>
                {/* Class header */}
                <tr className="bg-[#0071E3]/5">
                  <td colSpan={5} className="px-4 py-2.5 font-semibold text-[#0071E3] text-xs uppercase tracking-wide">
                    Classe {cls.classNum} — {cls.className}
                  </td>
                </tr>

                {/* Account rows */}
                {cls.accounts.map((acc) => {
                  const solde = acc.debit - acc.credit
                  return (
                    <tr key={acc.code} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100/50">
                      <td className="px-4 py-2.5 font-mono text-gray-600 text-xs">{acc.code}</td>
                      <td className="px-4 py-2.5 text-gray-800">{acc.label}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-gray-700">
                        {acc.debit > 0 ? formatCHF(acc.debit) : ''}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-gray-700">
                        {acc.credit > 0 ? formatCHF(acc.credit) : ''}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-mono font-medium ${solde >= 0 ? 'text-gray-900' : 'text-[var(--danger)]'}`}>
                        {formatCHF(Math.abs(solde))} {solde < 0 ? '(C)' : solde > 0 ? '(D)' : ''}
                      </td>
                    </tr>
                  )
                })}

                {/* Class subtotal */}
                <tr className="bg-gray-50/70 border-b border-gray-200/50">
                  <td className="px-4 py-2" />
                  <td className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
                    Sous-total Classe {cls.classNum}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-semibold text-gray-800">
                    {formatCHF(cls.totalDebit)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-semibold text-gray-800">
                    {formatCHF(cls.totalCredit)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-semibold text-gray-800">
                    {formatCHF(Math.abs(cls.totalDebit - cls.totalCredit))}
                  </td>
                </tr>
              </React.Fragment>
            ))}

            {/* Grand total */}
            <tr className="bg-gray-900 text-white">
              <td className="px-4 py-3" />
              <td className="px-4 py-3 font-bold uppercase text-sm">Total general</td>
              <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                {formatCHF(balance.grandTotalDebit)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                {formatCHF(balance.grandTotalCredit)}
              </td>
              <td className="px-4 py-3 text-right font-mono font-bold text-sm">
                {formatCHF(Math.abs(balance.grandTotalDebit - balance.grandTotalCredit))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Tab: Journal des ecritures ──

function JournalTab({ entries }) {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...entries]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          (e.description || '').toLowerCase().includes(q) ||
          (e.entry_number || '').toLowerCase().includes(q) ||
          (e.account_code || '').includes(q) ||
          (e.counterpart_code || '').includes(q)
      )
    }

    if (dateFrom) {
      const from = new Date(dateFrom)
      result = result.filter((e) => new Date(e.date_created) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59')
      result = result.filter((e) => new Date(e.date_created) <= to)
    }

    // Sort by date DESC (already sorted from fetch, but re-sort after filter)
    result.sort((a, b) => new Date(b.date_created) - new Date(a.date_created))

    return result
  }, [entries, search, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageEntries = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // Reset page when filters change
  const handleSearchChange = useCallback((val) => {
    setSearch(val)
    setPage(1)
  }, [])

  if (entries.length === 0) {
    return <EmptyState message="Aucune ecriture dans le journal pour cette periode." />
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="ds-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (description, numero, compte...)"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="ds-input w-full pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              className="ds-input px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              className="ds-input px-2 py-1.5 text-sm"
            />
          </div>
          {(search || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setPage(1) }}
              className="ds-btn ds-btn-ghost text-xs"
            >
              Effacer filtres
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} ecriture{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="ds-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">N. Ecriture</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Libelle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-32">Debit (compte)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-32">Credit (compte)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 w-32">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {pageEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Aucune ecriture ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                pageEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-600 text-xs whitespace-nowrap">
                      {formatDate(entry.date_created)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-gray-600 text-xs">
                      {entry.entry_number || '--'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-800 truncate max-w-[280px]" title={entry.description}>
                      {entry.description || '--'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {entry.type === 'debit' ? (
                        <span className="text-[var(--danger)]">{entry.account_code}</span>
                      ) : (
                        <span className="text-gray-400">{entry.counterpart_code || '--'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {entry.type === 'credit' ? (
                        <span className="text-[var(--success)]">{entry.account_code}</span>
                      ) : (
                        <span className="text-gray-400">{entry.counterpart_code || '--'}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-gray-900">
                      {formatCHF(parseFloat(entry.amount || 0))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200/50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Page {currentPage} sur {totalPages} ({filtered.length} ecritures)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="ds-btn ds-btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum
                if (totalPages <= 7) {
                  pageNum = i + 1
                } else if (currentPage <= 4) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i
                } else {
                  pageNum = currentPage - 3 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      pageNum === currentPage
                        ? 'bg-[#0071E3] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="ds-btn ds-btn-ghost p-1.5 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Tab: Comptes individuels ──

function ComptesTab({ entries }) {
  const accounts = useMemo(() => getUniqueAccounts(entries), [entries])
  const [selectedAccount, setSelectedAccount] = useState('')

  const ledger = useMemo(() => {
    if (!selectedAccount) return []
    return computeAccountLedger(entries, selectedAccount)
  }, [entries, selectedAccount])

  const selectedLabel = useMemo(() => {
    const acc = accounts.find((a) => a.code === selectedAccount)
    return acc ? `${acc.code} ${acc.label}` : ''
  }, [accounts, selectedAccount])

  const closingBalance = ledger.length > 0 ? ledger[ledger.length - 1].runningBalance : 0

  return (
    <div className="space-y-4">
      {/* Account selector */}
      <div className="ds-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <ChevronsUpDown size={16} className="text-gray-400 flex-shrink-0" />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="ds-input w-full py-2 text-sm"
            >
              <option value="">-- Selectionner un compte --</option>
              {accounts.map((acc) => (
                <option key={acc.code} value={acc.code}>
                  {acc.code} — {acc.label}
                </option>
              ))}
            </select>
          </div>
          {selectedAccount && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                {ledger.length} mouvement{ledger.length !== 1 ? 's' : ''}
              </span>
              <span className={`font-semibold font-mono ${closingBalance >= 0 ? 'text-gray-900' : 'text-[var(--danger)]'}`}>
                Solde: {formatCHF(Math.abs(closingBalance))} {closingBalance < 0 ? '(C)' : closingBalance > 0 ? '(D)' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Account ledger */}
      {!selectedAccount ? (
        <div className="ds-card p-12 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            Selectionnez un compte pour afficher les mouvements et le solde progressif.
          </p>
        </div>
      ) : ledger.length === 0 ? (
        <EmptyState message={`Aucun mouvement pour le compte ${selectedLabel}.`} />
      ) : (
        <div className="ds-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Compte {selectedLabel}
            </h3>
            <span className={`text-sm font-mono font-semibold ${closingBalance >= 0 ? 'text-gray-900' : 'text-[var(--danger)]'}`}>
              Solde final: {formatCHF(Math.abs(closingBalance))}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">N. Ecriture</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Libelle</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 w-28">Contrepartie</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 w-28">Debit</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 w-28">Credit</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 w-32">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {/* Opening balance row */}
                <tr className="bg-gray-50/30">
                  <td colSpan={6} className="px-4 py-2 text-xs text-gray-500 italic">
                    Solde d'ouverture
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-gray-500">
                    {formatCHF(0)}
                  </td>
                </tr>

                {ledger.map((entry, idx) => (
                  <tr key={entry.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-600 text-xs whitespace-nowrap">
                      {formatDate(entry.date_created)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-gray-600 text-xs">
                      {entry.entry_number || '--'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-800 truncate max-w-[250px]" title={entry.description}>
                      {entry.description || '--'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-gray-500 text-xs">
                      {entry.counterpart_code || '--'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[var(--danger)] text-xs">
                      {entry.type === 'debit' ? formatCHF(parseFloat(entry.amount || 0)) : ''}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[var(--success)] text-xs">
                      {entry.type === 'credit' ? formatCHF(parseFloat(entry.amount || 0)) : ''}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-mono font-medium text-xs ${entry.runningBalance >= 0 ? 'text-gray-900' : 'text-[var(--danger)]'}`}>
                      {formatCHF(Math.abs(entry.runningBalance))}
                    </td>
                  </tr>
                ))}

                {/* Closing balance row */}
                <tr className="bg-gray-900 text-white">
                  <td colSpan={6} className="px-4 py-2.5 font-semibold text-sm">
                    Solde de cloture
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-sm">
                    {formatCHF(Math.abs(closingBalance))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Export helper ──

function exportBalanceCSV(entries) {
  const balance = computeTrialBalance(entries)
  const rows = [['N. Compte', 'Libelle', 'Debit', 'Credit', 'Solde']]

  balance.classes.forEach((cls) => {
    rows.push([`Classe ${cls.classNum}`, cls.className, '', '', ''])
    cls.accounts.forEach((acc) => {
      const solde = acc.debit - acc.credit
      rows.push([
        acc.code,
        acc.label,
        acc.debit.toFixed(2),
        acc.credit.toFixed(2),
        solde.toFixed(2)
      ])
    })
    rows.push([
      '',
      `Sous-total Classe ${cls.classNum}`,
      cls.totalDebit.toFixed(2),
      cls.totalCredit.toFixed(2),
      (cls.totalDebit - cls.totalCredit).toFixed(2)
    ])
  })

  rows.push([
    '',
    'TOTAL GENERAL',
    balance.grandTotalDebit.toFixed(2),
    balance.grandTotalCredit.toFixed(2),
    (balance.grandTotalDebit - balance.grandTotalCredit).toFixed(2)
  ])

  const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `balance_comptes_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ── Main component ──

function AccountingPage({ selectedCompany }) {
  const [activeTab, setActiveTab] = useState('balance')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const yearOptions = useMemo(() => getYearOptions(), [])
  const company = selectedCompany === 'all' ? '' : selectedCompany

  // Primary query: accounting_entries
  const {
    data: directEntries,
    isLoading: isLoadingDirect,
    error: errorDirect,
    refetch: refetchDirect
  } = useQuery({
    queryKey: ['accounting-entries-page', company, selectedYear],
    queryFn: () => fetchAccountingEntries(company, selectedYear),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  // Fallback query: reconstruct from invoices + bank transactions
  const hasDirect = directEntries && directEntries.length > 0
  const {
    data: fallbackEntries,
    isLoading: isLoadingFallback,
    error: errorFallback,
    refetch: refetchFallback
  } = useQuery({
    queryKey: ['accounting-fallback', company, selectedYear],
    queryFn: () => fetchFallbackData(company, selectedYear),
    staleTime: 1000 * 60 * 2,
    enabled: !hasDirect && !isLoadingDirect
  })

  const entries = hasDirect ? directEntries : (fallbackEntries || [])
  const isLoading = isLoadingDirect || (!hasDirect && isLoadingFallback)
  const error = errorDirect || errorFallback
  const isFallback = !hasDirect && fallbackEntries && fallbackEntries.length > 0

  const handleRefresh = useCallback(() => {
    refetchDirect()
    if (!hasDirect) refetchFallback()
  }, [refetchDirect, refetchFallback, hasDirect])

  const handleExport = useCallback(() => {
    if (entries.length > 0) {
      exportBalanceCSV(entries)
    }
  }, [entries])

  // ── Error state ──
  if (error && !entries.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          selectedYear={selectedYear}
          yearOptions={yearOptions}
          onYearChange={setSelectedYear}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={isLoading}
          hasEntries={false}
        />
        <div className="ds-card p-6 text-center" style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)' }}>
          <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--danger)' }} />
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Erreur de chargement</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {error.message || 'Impossible de charger les donnees comptables'}
          </p>
          <button
            onClick={handleRefresh}
            className="ds-btn ds-btn-primary"
          >
            <RefreshCw size={14} /> Reessayer
          </button>
        </div>
      </div>
    )
  }

  // ── Loading state ──
  if (isLoading && entries.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          selectedYear={selectedYear}
          yearOptions={yearOptions}
          onYearChange={setSelectedYear}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={true}
          hasEntries={false}
        />
        <SkeletonLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        selectedYear={selectedYear}
        yearOptions={yearOptions}
        onYearChange={setSelectedYear}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isLoading={isLoading}
        hasEntries={entries.length > 0}
      />

      {/* Fallback notice */}
      {isFallback && (
        <div className="ds-card rounded-lg px-4 py-3 flex items-start gap-3" style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)' }}>
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
          <div className="text-sm">
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Donnees reconstituees</p>
            <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Aucune ecriture comptable native trouvee. Les donnees sont reconstituees a partir
              des factures clients, factures fournisseurs et transactions bancaires.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-[#0071E3] text-[#0071E3]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'balance' && <BalanceTab entries={entries} />}
      {activeTab === 'journal' && <JournalTab entries={entries} />}
      {activeTab === 'comptes' && <ComptesTab entries={entries} />}
    </div>
  )
}

// ── Page header ──

function PageHeader({ selectedYear, yearOptions, onYearChange, onRefresh, onExport, isLoading, hasEntries }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Pole Finance</p>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={22} className="text-[#0071E3]" />
          Plan comptable PME (Kafer)
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {/* Period selector */}
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
            className="ds-input px-2 py-1.5 text-sm pr-8"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Export button */}
        <button
          onClick={onExport}
          disabled={!hasEntries}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={14} />
          Exporter
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>
    </div>
  )
}

export default AccountingPage
