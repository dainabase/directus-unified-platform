/**
 * MonthlyReportsPage — Rapport P&L mensuel
 * Affiche les revenus, depenses, marges et evolution annuelle.
 * Connecte aux collections Directus : client_invoices, supplier_invoices, expenses.
 */

import React, { useState, useMemo, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  RefreshCw,
  Printer,
  Loader2,
  AlertCircle,
  FileText,
  Inbox
} from 'lucide-react'
import api from '../../../../lib/axios'

// ── Constants ──

const ACCENT = '#0071E3'
const GRAY_500 = '#6B7280'
const GRAY_300 = '#D1D5DB'
const SUCCESS = '#34C759'
const DANGER = '#FF3B30'

const MONTHS_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
]

const FALLBACK_CATEGORIES = [
  'Vente materiel',
  'Location',
  'Maintenance',
  'Software',
  'Autres'
]

const CATEGORY_COLORS = [
  ACCENT,
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#9CA3AF',
  '#6B7280',
  '#4B5563',
  '#374151'
]

const ESTIMATED_FIXED_COSTS_RATIO = 0.15 // 15% of revenue as estimated fixed costs

// ── Formatters ──

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const formatCHFPrecise = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

const formatPercent = (value) => {
  if (value === null || value === undefined || !isFinite(value)) return '--'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

const formatShortCHF = (value) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toFixed(0)
}

// ── Date helpers ──

function getMonthRange(year, month) {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return [start, end]
}

function getPreviousMonth(year, month) {
  if (month === 0) return { year: year - 1, month: 11 }
  return { year, month: month - 1 }
}

function getLast12Months(year, month) {
  const months = []
  for (let i = 11; i >= 0; i--) {
    let m = month - i
    let y = year
    while (m < 0) { m += 12; y-- }
    months.push({ year: y, month: m })
  }
  return months
}

// ── Data fetchers ──

async function fetchMonthlyRevenue(year, month, companyFilter) {
  const [start, end] = getMonthRange(year, month)
  const filter = {
    status: { _neq: 'cancelled' },
    date_issued: { _between: [start, end] },
    ...companyFilter
  }

  try {
    const { data } = await api.get('/items/client_invoices', {
      params: {
        filter,
        aggregate: { sum: ['total', 'tax_amount', 'total_ttc'] }
      }
    })
    const row = data?.data?.[0] || {}
    return {
      total: parseFloat(row.sum?.total || 0),
      tax: parseFloat(row.sum?.tax_amount || 0),
      ttc: parseFloat(row.sum?.total_ttc || 0)
    }
  } catch {
    return { total: 0, tax: 0, ttc: 0 }
  }
}

async function fetchMonthlyExpenses(year, month, companyFilter) {
  const [start, end] = getMonthRange(year, month)

  // Supplier invoices
  let supplierTotal = 0
  try {
    const { data } = await api.get('/items/supplier_invoices', {
      params: {
        filter: {
          date_issued: { _between: [start, end] },
          ...companyFilter
        },
        aggregate: { sum: ['total', 'total_ttc'] }
      }
    })
    const row = data?.data?.[0] || {}
    supplierTotal = parseFloat(row.sum?.total || 0)
  } catch {
    // silent
  }

  // Expenses collection
  let expensesTotal = 0
  try {
    const { data } = await api.get('/items/expenses', {
      params: {
        filter: {
          date: { _between: [start, end] },
          ...companyFilter
        },
        aggregate: { sum: ['amount'] }
      }
    })
    const row = data?.data?.[0] || {}
    expensesTotal = parseFloat(row.sum?.amount || 0)
  } catch {
    // expenses collection may not exist
  }

  return { supplierTotal, expensesTotal, total: supplierTotal + expensesTotal }
}

async function fetchRevenueByCategory(year, month, companyFilter) {
  const [start, end] = getMonthRange(year, month)

  try {
    const { data } = await api.get('/items/client_invoices', {
      params: {
        filter: {
          status: { _neq: 'cancelled' },
          date_issued: { _between: [start, end] },
          ...companyFilter
        },
        fields: ['id', 'total', 'type', 'category'],
        limit: -1
      }
    })

    const invoices = data?.data || []
    const map = {}

    invoices.forEach((inv) => {
      const cat = inv.category || inv.type || 'Autres'
      if (!map[cat]) map[cat] = 0
      map[cat] += parseFloat(inv.total || 0)
    })

    const result = Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // If no categories found, return empty
    if (result.length === 0) return []

    return result
  } catch {
    return []
  }
}

async function fetchAllMonthlyData(year, month, companyFilter) {
  const prev = getPreviousMonth(year, month)

  // Fetch current month + previous month in parallel
  const [
    currentRevenue,
    currentExpenses,
    prevRevenue,
    prevExpenses,
    categoryBreakdown
  ] = await Promise.all([
    fetchMonthlyRevenue(year, month, companyFilter),
    fetchMonthlyExpenses(year, month, companyFilter),
    fetchMonthlyRevenue(prev.year, prev.month, companyFilter),
    fetchMonthlyExpenses(prev.year, prev.month, companyFilter),
    fetchRevenueByCategory(year, month, companyFilter)
  ])

  // YTD: fetch all months from Jan to current
  const ytdMonths = []
  for (let m = 0; m <= month; m++) {
    ytdMonths.push(
      Promise.all([
        fetchMonthlyRevenue(year, m, companyFilter),
        fetchMonthlyExpenses(year, m, companyFilter)
      ])
    )
  }
  const ytdResults = await Promise.all(ytdMonths)
  const ytdRevenue = ytdResults.reduce((sum, [rev]) => sum + rev.total, 0)
  const ytdExpenses = ytdResults.reduce((sum, [, exp]) => sum + exp.total, 0)

  // Last 12 months for evolution chart
  const last12 = getLast12Months(year, month)
  const evolutionPromises = last12.map(({ year: y, month: m }) =>
    Promise.all([
      fetchMonthlyRevenue(y, m, companyFilter),
      fetchMonthlyExpenses(y, m, companyFilter)
    ]).then(([rev, exp]) => ({
      month: `${MONTHS_FR[m].slice(0, 3)} ${String(y).slice(2)}`,
      revenue: rev.total,
      expenses: exp.total,
      profit: rev.total - exp.total
    }))
  )
  const evolution = await Promise.all(evolutionPromises)

  return {
    current: {
      revenue: currentRevenue,
      expenses: currentExpenses
    },
    previous: {
      revenue: prevRevenue,
      expenses: prevExpenses
    },
    ytd: {
      revenue: ytdRevenue,
      expenses: ytdExpenses
    },
    categoryBreakdown,
    evolution
  }
}

// ── Variance computation ──

function computeVariation(current, previous) {
  if (!previous || previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

// ── Sub-components ──

function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="ds-card p-5 h-28">
            <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-6 w-28 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ds-card p-6 h-80" />
        <div className="ds-card p-6 h-80" />
      </div>
    </div>
  )
}

function VariationBadge({ value }) {
  if (value === null || value === undefined || !isFinite(value)) {
    return <span className="ds-meta">--</span>
  }

  const isPositive = value > 0
  const isNeutral = value === 0
  const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown
  const color = isPositive ? SUCCESS : isNeutral ? GRAY_500 : DANGER
  const bgColor = isPositive
    ? 'rgba(52, 199, 89, 0.12)'
    : isNeutral
      ? 'rgba(0, 0, 0, 0.06)'
      : 'rgba(255, 59, 48, 0.12)'

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: bgColor, color }}
    >
      <Icon size={12} />
      {formatPercent(value)}
    </span>
  )
}

function KPICard({ label, value, subtitle, variation, invertVariation = false }) {
  // invertVariation: for expenses, a decrease is positive
  const adjustedVariation = invertVariation && variation !== null
    ? -variation
    : variation

  return (
    <div className="ds-card p-5">
      <p className="ds-label mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {formatCHF(value)}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <VariationBadge value={adjustedVariation} />
        {subtitle && (
          <span className="ds-meta">{subtitle}</span>
        )}
      </div>
    </div>
  )
}

function YTDSection({ ytdRevenue, ytdExpenses }) {
  const ytdMargin = ytdRevenue - ytdExpenses
  const ytdMarginPct = ytdRevenue > 0 ? (ytdMargin / ytdRevenue) * 100 : 0

  return (
    <div className="ds-card p-5">
      <h3 className="ds-card-title mb-4 flex items-center gap-2">
        <Calendar size={16} style={{ color: ACCENT }} />
        Cumul annuel (YTD)
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="ds-label">Revenus YTD</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCHF(ytdRevenue)}
          </p>
        </div>
        <div>
          <p className="ds-label">Depenses YTD</p>
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {formatCHF(ytdExpenses)}
          </p>
        </div>
        <div>
          <p className="ds-label">Marge YTD</p>
          <p className="text-lg font-bold" style={{ color: ytdMargin >= 0 ? SUCCESS : DANGER }}>
            {formatCHF(ytdMargin)}
          </p>
        </div>
        <div>
          <p className="ds-label">% Marge YTD</p>
          <p className="text-lg font-bold" style={{ color: ytdMarginPct >= 0 ? SUCCESS : DANGER }}>
            {ytdMarginPct.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}

function CategoryBreakdownChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="ds-card p-6">
        <h3 className="ds-card-title mb-4">Revenus par categorie</h3>
        <div className="flex flex-col items-center justify-center h-[280px] text-center">
          <Inbox size={32} style={{ color: 'var(--text-tertiary)' }} className="mb-2" />
          <p className="ds-label">Aucune donnee de categorie disponible</p>
          <p className="ds-meta mt-1">Les categories s'afficheront une fois les factures emises.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ds-card p-6">
      <h3 className="ds-card-title mb-4">Revenus par categorie</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={formatShortCHF}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            stroke="var(--border-light)"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            stroke="var(--border-light)"
          />
          <Tooltip
            formatter={(value) => [formatCHFPrecise(value), 'Montant']}
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-input)',
              boxShadow: 'var(--shadow-md)',
              fontSize: 12
            }}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          >
            {data.map((_, idx) => (
              <rect key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function EvolutionChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="ds-card p-6">
        <h3 className="ds-card-title mb-4">Evolution sur 12 mois</h3>
        <div className="flex items-center justify-center h-[280px]">
          <p className="ds-label">Aucune donnee disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ds-card p-6">
      <h3 className="ds-card-title mb-4">Evolution sur 12 mois</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            stroke="var(--border-light)"
          />
          <YAxis
            tickFormatter={formatShortCHF}
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            stroke="var(--border-light)"
            width={55}
          />
          <Tooltip
            formatter={(value, name) => [formatCHFPrecise(value), name]}
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-input)',
              boxShadow: 'var(--shadow-md)',
              fontSize: 12
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="revenue"
            name="Revenus"
            fill={ACCENT}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Depenses"
            stroke={GRAY_500}
            strokeWidth={2}
            dot={{ r: 3, fill: GRAY_500 }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function TextSummary({ month, year, companyName, revenue, expenses, prevRevenue }) {
  const grossMargin = revenue - expenses
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue) * 100 : 0
  const revenueVariation = computeVariation(revenue, prevRevenue)
  const monthName = MONTHS_FR[month]

  const trend = revenueVariation === null
    ? ''
    : revenueVariation >= 0
      ? `en hausse de ${Math.abs(revenueVariation).toFixed(1)}%`
      : `en baisse de ${Math.abs(revenueVariation).toFixed(1)}%`

  const company = companyName || 'le groupe'

  return (
    <div className="ds-card p-5">
      <h3 className="ds-card-title mb-3 flex items-center gap-2">
        <FileText size={16} style={{ color: ACCENT }} />
        Synthese
      </h3>
      <p className="ds-body leading-relaxed">
        En {monthName} {year}, {company} a realise{' '}
        <strong>{formatCHFPrecise(revenue)}</strong> de chiffre d'affaires
        {trend ? `, ${trend} par rapport au mois precedent` : ''}.
        {expenses > 0 && (
          <> Les depenses s'elevent a <strong>{formatCHFPrecise(expenses)}</strong>.</>
        )}
        {' '}La marge brute atteint{' '}
        <strong style={{ color: grossMarginPct >= 0 ? SUCCESS : DANGER }}>
          {grossMarginPct.toFixed(1)}%
        </strong>
        {grossMargin !== 0 && (
          <> ({formatCHFPrecise(grossMargin)})</>
        )}.
      </p>
    </div>
  )
}

// ── Print styles ──

const printStyles = `
@media print {
  body * { visibility: hidden; }
  .monthly-report-print, .monthly-report-print * { visibility: visible; }
  .monthly-report-print { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
  .ds-card { break-inside: avoid; box-shadow: none; border: 1px solid #e5e7eb; }
}
`

// ── Main component ──

export function MonthlyReportsPage({ selectedCompany }) {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const reportRef = useRef(null)

  const company = selectedCompany === 'all' ? '' : selectedCompany
  const companyFilter = company ? { owner_company: { _eq: company } } : {}

  // Build available years (current year and 3 years back)
  const availableYears = useMemo(() => {
    const years = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
      years.push(y)
    }
    return years
  }, [])

  // Main query
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['monthly-pnl', selectedYear, selectedMonth, company],
    queryFn: () => fetchAllMonthlyData(selectedYear, selectedMonth, companyFilter),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false
  })

  // Compute KPIs from fetched data
  const kpis = useMemo(() => {
    if (!data) return null

    const revenue = data.current.revenue.total
    const expenses = data.current.expenses.total
    const grossMargin = revenue - expenses
    const estimatedFixedCosts = revenue * ESTIMATED_FIXED_COSTS_RATIO
    const netMargin = grossMargin - estimatedFixedCosts

    const prevRevenue = data.previous.revenue.total
    const prevExpenses = data.previous.expenses.total
    const prevGrossMargin = prevRevenue - prevExpenses
    const prevNetMargin = prevGrossMargin - (prevRevenue * ESTIMATED_FIXED_COSTS_RATIO)

    return {
      revenue,
      expenses,
      grossMargin,
      netMargin,
      revenueVar: computeVariation(revenue, prevRevenue),
      expensesVar: computeVariation(expenses, prevExpenses),
      grossMarginVar: computeVariation(grossMargin, prevGrossMargin),
      netMarginVar: computeVariation(netMargin, prevNetMargin),
      prevRevenue
    }
  }, [data])

  // Handle export
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  // ── Error state ──
  if (error) {
    return (
      <div className="ds-card p-8 text-center">
        <AlertCircle size={32} style={{ color: DANGER }} className="mx-auto mb-3" />
        <h3 className="ds-card-title mb-2">Erreur de chargement</h3>
        <p className="ds-label mb-4">
          {error.message || 'Impossible de charger les donnees du rapport'}
        </p>
        <button onClick={() => refetch()} className="ds-btn ds-btn-primary">
          <RefreshCw size={14} />
          Reessayer
        </button>
      </div>
    )
  }

  // ── Loading state (initial) ──
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          availableYears={availableYears}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onRefresh={refetch}
          onPrint={handlePrint}
          isFetching={isFetching}
        />
        <SkeletonLoader />
      </div>
    )
  }

  return (
    <>
      <style>{printStyles}</style>
      <div className="space-y-6 monthly-report-print" ref={reportRef}>
        {/* Header with selectors */}
        <PageHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          availableYears={availableYears}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onRefresh={refetch}
          onPrint={handlePrint}
          isFetching={isFetching}
        />

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Revenus totaux HT"
              value={kpis.revenue}
              variation={kpis.revenueVar}
              subtitle="vs mois precedent"
            />
            <KPICard
              label="Depenses totales HT"
              value={kpis.expenses}
              variation={kpis.expensesVar}
              invertVariation
              subtitle="vs mois precedent"
            />
            <KPICard
              label="Marge brute"
              value={kpis.grossMargin}
              variation={kpis.grossMarginVar}
              subtitle="Revenus - Depenses directes"
            />
            <KPICard
              label="Marge nette (est.)"
              value={kpis.netMargin}
              variation={kpis.netMarginVar}
              subtitle="Apres charges fixes estimees"
            />
          </div>
        )}

        {/* Comparison vs previous month */}
        {kpis && data && (
          <ComparisonSection
            current={data.current}
            previous={data.previous}
            currentMonth={selectedMonth}
            currentYear={selectedYear}
          />
        )}

        {/* YTD */}
        {data && (
          <YTDSection
            ytdRevenue={data.ytd.revenue}
            ytdExpenses={data.ytd.expenses}
          />
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by category */}
          <CategoryBreakdownChart data={data?.categoryBreakdown || []} />

          {/* 12-month evolution */}
          <EvolutionChart data={data?.evolution || []} />
        </div>

        {/* Text summary */}
        {kpis && data && (
          <TextSummary
            month={selectedMonth}
            year={selectedYear}
            companyName={company || null}
            revenue={kpis.revenue}
            expenses={kpis.expenses}
            prevRevenue={kpis.prevRevenue}
          />
        )}
      </div>
    </>
  )
}

// ── Page header with month/year selectors ──

function PageHeader({
  selectedMonth,
  selectedYear,
  availableYears,
  onMonthChange,
  onYearChange,
  onRefresh,
  onPrint,
  isFetching
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
      <div>
        <p className="ds-meta uppercase tracking-wide">Pole Finance</p>
        <h2 className="ds-page-title">
          Rapport P&L Mensuel
        </h2>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Month selector */}
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="ds-input"
          style={{ width: 'auto', minWidth: 140 }}
        >
          {MONTHS_FR.map((name, idx) => (
            <option key={idx} value={idx}>{name}</option>
          ))}
        </select>

        {/* Year selector */}
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="ds-input"
          style={{ width: 'auto', minWidth: 90 }}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="ds-btn ds-btn-ghost"
          title="Actualiser"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
        </button>

        {/* Print / Export */}
        <button
          onClick={onPrint}
          className="ds-btn ds-btn-primary"
        >
          <Printer size={14} />
          Exporter PDF
        </button>
      </div>
    </div>
  )
}

// ── Comparison vs previous month ──

function ComparisonSection({ current, previous, currentMonth, currentYear }) {
  const prev = getPreviousMonth(currentYear, currentMonth)

  const rows = [
    {
      label: 'Revenus HT',
      current: current.revenue.total,
      previous: previous.revenue.total
    },
    {
      label: 'Depenses HT',
      current: current.expenses.total,
      previous: previous.expenses.total,
      invert: true
    },
    {
      label: 'Marge brute',
      current: current.revenue.total - current.expenses.total,
      previous: previous.revenue.total - previous.expenses.total
    }
  ]

  return (
    <div className="ds-card overflow-hidden">
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="ds-card-title">
          Comparaison : {MONTHS_FR[currentMonth]} {currentYear} vs {MONTHS_FR[prev.month]} {prev.year}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <th className="text-left px-5 py-3 ds-label font-medium">Indicateur</th>
              <th className="text-right px-5 py-3 ds-label font-medium">
                {MONTHS_FR[prev.month].slice(0, 3)} {prev.year}
              </th>
              <th className="text-right px-5 py-3 ds-label font-medium">
                {MONTHS_FR[currentMonth].slice(0, 3)} {currentYear}
              </th>
              <th className="text-right px-5 py-3 ds-label font-medium">Variation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const variation = computeVariation(row.current, row.previous)
              const adjustedVar = row.invert && variation !== null ? -variation : variation
              return (
                <tr
                  key={row.label}
                  className="border-t"
                  style={{ borderColor: 'var(--border-light)' }}
                >
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {row.label}
                  </td>
                  <td className="px-5 py-3 text-right" style={{ color: 'var(--text-secondary)' }}>
                    {formatCHF(row.previous)}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCHF(row.current)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <VariationBadge value={adjustedVar} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MonthlyReportsPage
