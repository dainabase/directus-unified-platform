/**
 * FinanceDashboardPage — Story 3.10 — Master Finance Overview
 *
 * Consolidated finance dashboard with 6 KPI sections:
 * - Treasury, Receivables, Payables, Monthly Revenue, Monthly Expenses, Net Margin
 * - Cash Flow Evolution (12 months LineChart)
 * - Revenue by Company (PieChart)
 * - Monthly P&L (ComposedChart)
 * - Recent Activity (transactions + overdue invoices)
 * - Alerts Panel (overdue, due soon, low balance, budget overruns)
 *
 * Connected to Directus: bank_accounts, client_invoices, supplier_invoices,
 *                        expenses, bank_transactions
 *
 * @version 1.0.0
 * @date 2026-02-20
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart, Area, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
  Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown,
  CreditCard, Target, RefreshCw, Loader2, AlertCircle,
  ChevronUp, ChevronDown, Clock, AlertTriangle, Ban,
  ArrowDownRight
} from 'lucide-react'
import api from '../../../lib/axios'

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const ACCENT = 'var(--accent-hover)'

const MONTHS_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
]

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'
]

const COMPANY_COLORS = [
  ACCENT, 'var(--semantic-green)', 'var(--semantic-orange)', '#AF52DE', 'var(--semantic-red)',
  '#5856D6', '#00C7BE', '#FF2D55'
]

const LOW_BALANCE_THRESHOLD = 5000

// ────────────────────────────────────────────────────────────────────────────
// Formatters
// ────────────────────────────────────────────────────────────────────────────

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(value || 0)

const formatCHFShort = (value) => {
  const abs = Math.abs(value || 0)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value?.toFixed(0) || '0'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const formatPercent = (value) => {
  if (value === null || value === undefined || !isFinite(value)) return '--'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

// ────────────────────────────────────────────────────────────────────────────
// Date helpers
// ────────────────────────────────────────────────────────────────────────────

function getCurrentMonthRange() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end, year, month }
}

function getPreviousMonthRange() {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() - 1
  if (month < 0) { month = 11; year-- }
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end, year, month }
}

function getMonthRangeForOffset(offset) {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() - offset
  while (month < 0) { month += 12; year-- }
  while (month > 11) { month -= 12; year++ }
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end, year, month }
}

function daysBetween(dateStr) {
  if (!dateStr) return 0
  const due = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - due.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// ────────────────────────────────────────────────────────────────────────────
// API fetcher
// ────────────────────────────────────────────────────────────────────────────

const fetchDashboardData = async (company) => {
  const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}

  const [bankRes, clientInvRes, supplierInvRes, expensesRes, transactionsRes] = await Promise.all([
    api.get('/items/bank_accounts', {
      params: { filter, fields: ['id', 'name', 'balance', 'currency', 'bank_name'] }
    }),
    api.get('/items/client_invoices', {
      params: {
        filter,
        fields: ['id', 'invoice_number', 'client_name', 'total_ttc', 'status', 'date_issued', 'due_date', 'owner_company'],
        sort: ['-date_created'],
        limit: 200
      }
    }),
    api.get('/items/supplier_invoices', {
      params: {
        filter,
        fields: ['id', 'invoice_number', 'supplier_name', 'amount', 'status', 'date_created', 'owner_company'],
        sort: ['-date_created'],
        limit: 200
      }
    }),
    api.get('/items/expenses', {
      params: {
        filter,
        fields: ['id', 'description', 'amount', 'category', 'status', 'date_created', 'owner_company'],
        sort: ['-date_created'],
        limit: 200
      }
    }),
    api.get('/items/bank_transactions', {
      params: {
        filter,
        fields: ['id', 'description', 'amount', 'type', 'date', 'bank_account', 'owner_company'],
        sort: ['-date'],
        limit: 20
      }
    })
  ])

  return {
    bankAccounts: bankRes.data?.data || [],
    clientInvoices: clientInvRes.data?.data || [],
    supplierInvoices: supplierInvRes.data?.data || [],
    expenses: expensesRes.data?.data || [],
    transactions: transactionsRes.data?.data || []
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Custom chart tooltip
// ────────────────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill }}>
          {entry.name}: {formatCHF(entry.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{entry.name}</p>
      <p style={{ color: entry.payload?.fill }}>{formatCHF(entry.value)}</p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// KPI Card sub-component
// ────────────────────────────────────────────────────────────────────────────

function KPICard({ label, value, trend, icon: Icon, iconColor }) {
  const isPositive = trend > 0
  const isNeutral = trend === null || trend === undefined || !isFinite(trend)
  const TrendIcon = isPositive ? ChevronUp : ChevronDown

  return (
    <div className="ds-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor || ACCENT}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor || ACCENT }} />
        </div>
        {!isNeutral && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'ds-badge ds-badge-success'
                : 'ds-badge ds-badge-danger'
            }`}
          >
            <TrendIcon size={12} />
            {formatPercent(trend)}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{formatCHF(value)}</p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Alert item sub-component
// ────────────────────────────────────────────────────────────────────────────

function AlertItem({ severity, message, detail }) {
  const config = {
    red: { bgStyle: { background: 'var(--tint-red)', borderColor: 'var(--semantic-red)' }, textStyle: { color: 'var(--label-1)' }, icon: Ban, iconStyle: { color: 'var(--semantic-red)' } },
    amber: { bgStyle: { background: 'var(--tint-orange)', borderColor: 'var(--semantic-orange)' }, textStyle: { color: 'var(--label-1)' }, icon: AlertTriangle, iconStyle: { color: 'var(--semantic-orange)' } },
    blue: { bgStyle: { background: 'var(--accent-light)', borderColor: 'var(--accent)' }, textStyle: { color: 'var(--label-1)' }, icon: AlertCircle, iconStyle: { color: 'var(--accent)' } }
  }
  const s = config[severity] || config.blue
  const IconComp = s.icon

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg border" style={s.bgStyle}>
      <IconComp size={16} className="mt-0.5 flex-shrink-0" style={s.iconStyle} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={s.textStyle}>{message}</p>
        {detail && <p className="text-xs text-gray-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

const FinanceDashboardPage = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const company = selectedCompany === 'all' ? '' : selectedCompany

  // Period state
  const now = new Date()
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // ── Main data query ──
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['finance-dashboard', company],
    queryFn: () => fetchDashboardData(company),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false
  })

  // ── KPI Computations ──
  const kpis = useMemo(() => {
    if (!data) return null

    const { bankAccounts, clientInvoices, supplierInvoices, expenses } = data
    const currentMonth = getCurrentMonthRange()
    const prevMonth = getPreviousMonthRange()

    // Treasury: sum of all bank account balances
    const treasury = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0)

    // Receivables: unpaid client invoices (sent or overdue)
    const receivables = clientInvoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + parseFloat(inv.total_ttc || 0), 0)

    // Payables: unpaid supplier invoices (pending or approved)
    const payables = supplierInvoices
      .filter((inv) => inv.status === 'pending' || inv.status === 'approved')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)

    // Monthly revenue: paid client invoices in current month
    const monthlyRevenue = clientInvoices
      .filter((inv) => {
        if (inv.status !== 'paid') return false
        const d = inv.date_issued || inv.date_created
        return d && d >= currentMonth.start && d <= currentMonth.end
      })
      .reduce((sum, inv) => sum + parseFloat(inv.total_ttc || 0), 0)

    // Previous month revenue for trend
    const prevMonthRevenue = clientInvoices
      .filter((inv) => {
        if (inv.status !== 'paid') return false
        const d = inv.date_issued || inv.date_created
        return d && d >= prevMonth.start && d <= prevMonth.end
      })
      .reduce((sum, inv) => sum + parseFloat(inv.total_ttc || 0), 0)

    // Monthly expenses
    const monthlyExpenses = expenses
      .filter((exp) => {
        const d = exp.date_created
        return d && d >= currentMonth.start && d <= currentMonth.end
      })
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

    // Previous month expenses for trend
    const prevMonthExpenses = expenses
      .filter((exp) => {
        const d = exp.date_created
        return d && d >= prevMonth.start && d <= prevMonth.end
      })
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

    // Net margin
    const netMargin = monthlyRevenue - monthlyExpenses
    const prevNetMargin = prevMonthRevenue - prevMonthExpenses

    // Trends (percentage change vs previous month)
    const computeTrend = (current, previous) => {
      if (!previous || previous === 0) return null
      return ((current - previous) / Math.abs(previous)) * 100
    }

    return {
      treasury,
      receivables,
      payables,
      monthlyRevenue,
      monthlyExpenses,
      netMargin,
      revenueTrend: computeTrend(monthlyRevenue, prevMonthRevenue),
      expensesTrend: computeTrend(monthlyExpenses, prevMonthExpenses),
      marginTrend: computeTrend(netMargin, prevNetMargin)
    }
  }, [data])

  // ── Cash Flow Evolution (12 months) ──
  const cashFlowData = useMemo(() => {
    if (!data) return []

    const { clientInvoices, expenses } = data
    const months = []

    for (let i = 11; i >= 0; i--) {
      const { start, end, year, month } = getMonthRangeForOffset(i)

      const revenue = clientInvoices
        .filter((inv) => {
          const d = inv.date_issued || inv.date_created
          return d && d >= start && d <= end && inv.status !== 'cancelled'
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total_ttc || 0), 0)

      const expense = expenses
        .filter((exp) => {
          const d = exp.date_created
          return d && d >= start && d <= end
        })
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

      months.push({
        name: `${MONTHS_SHORT[month]} ${String(year).slice(2)}`,
        revenus: Math.round(revenue),
        depenses: Math.round(expense),
        net: Math.round(revenue - expense)
      })
    }

    return months
  }, [data])

  // ── Revenue by Company (PieChart) ──
  const revenueByCompany = useMemo(() => {
    if (!data) return []

    const { clientInvoices } = data
    const map = {}

    clientInvoices
      .filter((inv) => inv.status !== 'cancelled')
      .forEach((inv) => {
        const key = inv.owner_company || 'Non attribue'
        if (!map[key]) map[key] = 0
        map[key] += parseFloat(inv.total_ttc || 0)
      })

    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  // ── Monthly P&L (ComposedChart) ──
  const plData = useMemo(() => {
    if (!data) return []

    const { clientInvoices, supplierInvoices, expenses } = data
    const months = []

    for (let i = 11; i >= 0; i--) {
      const { start, end, year, month } = getMonthRangeForOffset(i)

      const revenue = clientInvoices
        .filter((inv) => {
          const d = inv.date_issued || inv.date_created
          return d && d >= start && d <= end && inv.status !== 'cancelled'
        })
        .reduce((sum, inv) => sum + parseFloat(inv.total_ttc || 0), 0)

      const supplierExp = supplierInvoices
        .filter((inv) => {
          const d = inv.date_created
          return d && d >= start && d <= end
        })
        .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)

      const otherExp = expenses
        .filter((exp) => {
          const d = exp.date_created
          return d && d >= start && d <= end
        })
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)

      const totalExpenses = supplierExp + otherExp

      months.push({
        name: `${MONTHS_SHORT[month]} ${String(year).slice(2)}`,
        revenus: Math.round(revenue),
        depenses: Math.round(totalExpenses),
        marge: Math.round(revenue - totalExpenses)
      })
    }

    return months
  }, [data])

  // ── Recent Activity ──
  const recentTransactions = useMemo(() => {
    if (!data) return []
    return data.transactions.slice(0, 10)
  }, [data])

  const overdueInvoices = useMemo(() => {
    if (!data) return []
    return data.clientInvoices
      .filter((inv) => inv.status === 'overdue' && inv.due_date)
      .sort((a, b) => daysBetween(b.due_date) - daysBetween(a.due_date))
      .slice(0, 5)
      .map((inv) => ({
        ...inv,
        daysOverdue: daysBetween(inv.due_date)
      }))
  }, [data])

  // ── Alerts ──
  const alerts = useMemo(() => {
    if (!data) return []

    const result = []
    const { clientInvoices, bankAccounts } = data

    // Invoices overdue > 30 days
    const severeOverdue = clientInvoices.filter((inv) => {
      if (inv.status !== 'overdue' || !inv.due_date) return false
      return daysBetween(inv.due_date) > 30
    })
    if (severeOverdue.length > 0) {
      const totalOverdue = severeOverdue.reduce((s, inv) => s + parseFloat(inv.total_ttc || 0), 0)
      result.push({
        severity: 'red',
        message: `${severeOverdue.length} facture${severeOverdue.length > 1 ? 's' : ''} en retard de plus de 30 jours`,
        detail: `Montant total: ${formatCHF(totalOverdue)}`
      })
    }

    // Invoices due within 7 days
    const dueSoon = clientInvoices.filter((inv) => {
      if (inv.status !== 'sent' || !inv.due_date) return false
      const days = daysBetween(inv.due_date)
      return days >= -7 && days < 0
    })
    if (dueSoon.length > 0) {
      const totalDueSoon = dueSoon.reduce((s, inv) => s + parseFloat(inv.total_ttc || 0), 0)
      result.push({
        severity: 'amber',
        message: `${dueSoon.length} facture${dueSoon.length > 1 ? 's' : ''} arrive${dueSoon.length > 1 ? 'nt' : ''} a echeance dans les 7 prochains jours`,
        detail: `Montant total: ${formatCHF(totalDueSoon)}`
      })
    }

    // Low bank balance warnings
    const lowBalanceAccounts = bankAccounts.filter(
      (acc) => parseFloat(acc.balance || 0) < LOW_BALANCE_THRESHOLD
    )
    lowBalanceAccounts.forEach((acc) => {
      result.push({
        severity: 'amber',
        message: `Solde bas sur le compte "${acc.name || acc.bank_name || 'N/A'}"`,
        detail: `Solde actuel: ${formatCHF(parseFloat(acc.balance || 0))} (seuil: ${formatCHF(LOW_BALANCE_THRESHOLD)})`
      })
    })

    // Budget overruns (compare monthly expenses vs revenue)
    if (kpis && kpis.monthlyExpenses > kpis.monthlyRevenue && kpis.monthlyRevenue > 0) {
      result.push({
        severity: 'red',
        message: 'Depenses superieures aux revenus ce mois',
        detail: `Depenses: ${formatCHF(kpis.monthlyExpenses)} vs Revenus: ${formatCHF(kpis.monthlyRevenue)}`
      })
    }

    return result
  }, [data, kpis])

  // ── Build period options ──
  const periodOptions = useMemo(() => {
    const options = []
    const current = new Date()
    for (let i = 0; i < 12; i++) {
      let m = current.getMonth() - i
      let y = current.getFullYear()
      while (m < 0) { m += 12; y-- }
      const value = `${y}-${String(m + 1).padStart(2, '0')}`
      const label = `${MONTHS_FR[m]} ${y}`
      options.push({ value, label })
    }
    return options
  }, [])

  // ── Company display name ──
  const companyLabel = useMemo(() => {
    if (!company) return 'Toutes les entreprises'
    return company
  }, [company])

  // ── Loading state ──
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="ds-card p-8 text-center">
        <AlertCircle size={32} className="mx-auto mb-3 text-red-500" />
        <h3 className="font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-sm text-gray-500 mb-4">
          {error.message || 'Impossible de charger les donnees finance'}
        </p>
        <button onClick={() => refetch()} className="ds-btn ds-btn-primary">
          <RefreshCw size={14} className="mr-1.5" />
          Reessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── 1. Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="ds-page-title">Finance</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Vue consolidee &mdash; {companyLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="ds-input"
            style={{ width: 'auto', minWidth: 170 }}
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="ds-btn ds-btn-primary"
          >
            <RefreshCw size={14} className={`mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── 2. KPI Cards (2 rows of 3) ── */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1 */}
          <KPICard
            label="Tresorerie totale"
            value={kpis.treasury}
            trend={null}
            icon={Wallet}
            iconColor={ACCENT}
          />
          <KPICard
            label="A encaisser"
            value={kpis.receivables}
            trend={null}
            icon={ArrowDownLeft}
            iconColor="var(--semantic-orange)"
          />
          <KPICard
            label="A payer"
            value={kpis.payables}
            trend={null}
            icon={ArrowUpRight}
            iconColor="var(--semantic-red)"
          />

          {/* Row 2 */}
          <KPICard
            label="CA du mois"
            value={kpis.monthlyRevenue}
            trend={kpis.revenueTrend}
            icon={TrendingUp}
            iconColor="var(--semantic-green)"
          />
          <KPICard
            label="Depenses du mois"
            value={kpis.monthlyExpenses}
            trend={kpis.expensesTrend}
            icon={CreditCard}
            iconColor="#AF52DE"
          />
          <KPICard
            label="Marge nette"
            value={kpis.netMargin}
            trend={kpis.marginTrend}
            icon={Target}
            iconColor={kpis.netMargin >= 0 ? 'var(--semantic-green)' : 'var(--semantic-red)'}
          />
        </div>
      )}

      {/* ── 3. Charts Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Cash Flow Evolution (12 months) */}
        <div className="ds-card p-5 lg:col-span-2">
          <h3 className="ds-card-title mb-4">Evolution du Cash Flow (12 mois)</h3>
          {cashFlowData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="netAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCHFShort}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  fill="url(#netAreaGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="revenus"
                  name="Revenus"
                  stroke="var(--semantic-green)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--semantic-green)' }}
                  activeDot={{ r: 5, fill: 'var(--semantic-green)', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="depenses"
                  name="Depenses"
                  stroke="var(--semantic-red)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--semantic-red)' }}
                  activeDot={{ r: 5, fill: 'var(--semantic-red)', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              Aucune donnee disponible
            </div>
          )}
        </div>

        {/* Revenue by Company (PieChart) */}
        <div className="ds-card p-5">
          <h3 className="ds-card-title mb-4">Revenus par entreprise</h3>
          {revenueByCompany.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={revenueByCompany}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                >
                  {revenueByCompany.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={COMPANY_COLORS[idx % COMPANY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              Aucune donnee de revenus
            </div>
          )}
        </div>

        {/* Monthly P&L (ComposedChart) */}
        <div className="ds-card p-5">
          <h3 className="ds-card-title mb-4">P&L Mensuel</h3>
          {plData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={plData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCHFShort}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="revenus"
                  name="Revenus"
                  fill="var(--semantic-green)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="depenses"
                  name="Depenses"
                  fill="var(--semantic-red)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
                <Line
                  type="monotone"
                  dataKey="marge"
                  name="Marge"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: ACCENT }}
                  activeDot={{ r: 5, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">
              Aucune donnee disponible
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Last 10 transactions */}
        <div className="ds-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="ds-card-title">Dernieres transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="px-5 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">
                      Aucune transaction recente
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => {
                    const amount = parseFloat(tx.amount || 0)
                    const isCredit = tx.type === 'credit' || amount > 0

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900 truncate max-w-[200px]">
                          {tx.description || 'Transaction'}
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap font-semibold" style={{ color: isCredit ? 'var(--semantic-green)' : 'var(--semantic-red)' }}>
                          {isCredit ? '+' : '-'}{formatCHF(Math.abs(amount))}
                        </td>
                        <td className="px-5 py-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 ${
                            isCredit
                              ? 'ds-badge ds-badge-success'
                              : 'ds-badge ds-badge-danger'
                          }`}>
                            {isCredit
                              ? <ArrowDownRight size={12} />
                              : <ArrowUpRight size={12} />
                            }
                            {isCredit ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last 5 overdue invoices */}
        <div className="ds-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="ds-card-title flex items-center gap-2">
              <Clock size={16} className="text-red-500" />
              Factures en retard
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Facture</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Retard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overdueInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">
                      Aucune facture en retard
                    </td>
                  </tr>
                ) : (
                  overdueInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 truncate max-w-[150px]">
                        {inv.client_name || 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {inv.invoice_number || `#${inv.id}`}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatCHF(parseFloat(inv.total_ttc || 0))}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center ${
                          inv.daysOverdue > 30
                            ? 'ds-badge ds-badge-danger'
                            : inv.daysOverdue > 14
                              ? 'ds-badge ds-badge-warning'
                              : 'ds-badge ds-badge-warning'
                        }`}>
                          {inv.daysOverdue}j
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 5. Alerts Panel ── */}
      {alerts.length > 0 && (
        <div className="ds-card p-5">
          <h3 className="ds-card-title mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Alertes ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <AlertItem
                key={idx}
                severity={alert.severity}
                message={alert.message}
                detail={alert.detail}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceDashboardPage
