/**
 * RapportsRevendeur — Reports page for reseller portal
 * Monthly KPIs, 12-month evolution chart (Recharts), data table, CSV export.
 * Leads fetched from Directus (filtered by assigned_to).
 * Commissions fetched from `commissions` collection (reseller_id = user.id).
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval
} from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Download, TrendingUp, TrendingDown, Loader2,
  BarChart3, Users, Percent, Banknote
} from 'lucide-react'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

// ── Helpers ──

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const exportCSV = (data, filename) => {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0]).join(';')
  const rows = data.map(r => Object.values(r).join(';'))
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}


// ── KPI Card ──

const KPICard = ({ icon: Icon, label, value, subtitle, trend, trendLabel }) => {
  const isPositive = trend > 0
  const isZero = trend === 0 || trend === null || trend === undefined
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className="ds-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(0, 113, 227, 0.08)' }}
        >
          <Icon size={16} style={{ color: 'var(--accent-hover)' }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {!isZero && (
          <>
            <TrendIcon
              size={14}
              style={{ color: isPositive ? 'var(--semantic-green)' : 'var(--semantic-red)' }}
            />
            <span
              className="text-xs font-medium" style={{ color: isPositive ? 'var(--semantic-green)' : 'var(--semantic-red)' }}
            >
              {isPositive ? '+' : ''}{typeof trend === 'number' ? trend.toFixed(1) : trend}%
            </span>
          </>
        )}
        {isZero && (
          <span className="text-xs text-gray-400">--</span>
        )}
        {trendLabel && (
          <span className="text-xs text-gray-400 ml-1">{trendLabel}</span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

// ── Main Component ──

const RapportsRevendeur = () => {
  const user = useAuthStore(s => s.user)
  const userId = user?.id

  // Month/year selector state
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()) // 0-indexed

  const selectedDate = new Date(selectedYear, selectedMonth, 1)
  const prevMonthDate = subMonths(selectedDate, 1)

  const currentStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd')
  const currentEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd')
  const prevStart = format(startOfMonth(prevMonthDate), 'yyyy-MM-dd')
  const prevEnd = format(endOfMonth(prevMonthDate), 'yyyy-MM-dd')

  // ── Fetch leads assigned to this user (current month) ──
  const { data: currentLeads = [], isLoading: loadingCurrentLeads } = useQuery({
    queryKey: ['revendeur-leads-current', userId, currentStart, currentEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/leads', {
        params: {
          filter: {
            assigned_to: { _eq: userId },
            date_created: { _gte: currentStart, _lte: currentEnd + 'T23:59:59' }
          },
          fields: ['id', 'status', 'estimated_value', 'date_created', 'converted_at'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch leads assigned to this user (previous month) ──
  const { data: prevLeads = [] } = useQuery({
    queryKey: ['revendeur-leads-prev', userId, prevStart, prevEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/leads', {
        params: {
          filter: {
            assigned_to: { _eq: userId },
            date_created: { _gte: prevStart, _lte: prevEnd + 'T23:59:59' }
          },
          fields: ['id', 'status', 'estimated_value', 'date_created', 'converted_at'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch signed quotes (current month) ──
  const { data: currentQuotes = [], isLoading: loadingQuotes } = useQuery({
    queryKey: ['revendeur-quotes-current', userId, currentStart, currentEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          filter: {
            status: { _eq: 'signed' },
            signed_at: { _gte: currentStart, _lte: currentEnd + 'T23:59:59' }
          },
          fields: ['id', 'total', 'status', 'created_at', 'signed_at', 'company_id'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch signed quotes (previous month) ──
  const { data: prevQuotes = [] } = useQuery({
    queryKey: ['revendeur-quotes-prev', userId, prevStart, prevEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          filter: {
            status: { _eq: 'signed' },
            signed_at: { _gte: prevStart, _lte: prevEnd + 'T23:59:59' }
          },
          fields: ['id', 'total', 'status', 'signed_at'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch ALL leads for last 12 months (for chart + table) ──
  const twelveMonthsAgo = subMonths(endOfMonth(selectedDate), 11)
  const chartStart = format(startOfMonth(twelveMonthsAgo), 'yyyy-MM-dd')
  const chartEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd')

  const { data: allLeads12m = [] } = useQuery({
    queryKey: ['revendeur-leads-12m', userId, chartStart, chartEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/leads', {
        params: {
          filter: {
            assigned_to: { _eq: userId },
            date_created: { _gte: chartStart, _lte: chartEnd + 'T23:59:59' }
          },
          fields: ['id', 'status', 'estimated_value', 'date_created', 'converted_at'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  const { data: allQuotes12m = [] } = useQuery({
    queryKey: ['revendeur-quotes-12m', userId, chartStart, chartEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          filter: {
            status: { _eq: 'signed' },
            signed_at: { _gte: chartStart, _lte: chartEnd + 'T23:59:59' }
          },
          fields: ['id', 'total', 'signed_at'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch commissions for the 12-month range ──
  const { data: allCommissions12m = [] } = useQuery({
    queryKey: ['revendeur-commissions-12m', userId, chartStart, chartEnd],
    queryFn: async () => {
      const { data } = await api.get('/items/commissions', {
        params: {
          filter: {
            reseller_id: { _eq: userId },
            date_created: { _gte: chartStart, _lte: chartEnd + 'T23:59:59' }
          },
          fields: ['id', 'amount', 'status', 'date_created'],
          limit: -1
        }
      }).catch(() => ({ data: { data: [] } }))
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  // ── Computed KPIs ──

  const currentRevenue = currentQuotes.reduce(
    (sum, q) => sum + (parseFloat(q.total) || 0), 0
  )
  const prevRevenue = prevQuotes.reduce(
    (sum, q) => sum + (parseFloat(q.total) || 0), 0
  )
  const revenueTrend = prevRevenue > 0
    ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
    : null

  // Commission KPI: sum commissions for selected month vs previous month
  const currentCommission = useMemo(() => {
    const mStart = startOfMonth(selectedDate)
    const mEnd = endOfMonth(selectedDate)
    return allCommissions12m
      .filter((c) => {
        const d = new Date(c.date_created)
        return d >= mStart && d <= mEnd
      })
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  }, [allCommissions12m, selectedDate])

  const prevCommission = useMemo(() => {
    const mStart = startOfMonth(prevMonthDate)
    const mEnd = endOfMonth(prevMonthDate)
    return allCommissions12m
      .filter((c) => {
        const d = new Date(c.date_created)
        return d >= mStart && d <= mEnd
      })
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)
  }, [allCommissions12m, prevMonthDate])

  const commissionTrend = prevCommission > 0
    ? ((currentCommission - prevCommission) / prevCommission) * 100
    : null

  const currentConverted = currentLeads.filter(
    l => l.status === 'won' && l.converted_at
  ).length
  const prevConverted = prevLeads.filter(
    l => l.status === 'won' && l.converted_at
  ).length
  const convertedTrend = prevConverted > 0
    ? ((currentConverted - prevConverted) / prevConverted) * 100
    : null

  const currentConversionRate = currentLeads.length > 0
    ? (currentConverted / currentLeads.length) * 100
    : 0
  const prevConversionRate = prevLeads.length > 0
    ? (prevConverted / prevLeads.length) * 100
    : 0
  const conversionTrend = prevConversionRate > 0
    ? currentConversionRate - prevConversionRate
    : null

  // ── 12-month chart data ──

  const monthsInterval = eachMonthOfInterval({
    start: startOfMonth(twelveMonthsAgo),
    end: endOfMonth(selectedDate)
  })

  const chartData = useMemo(() => {
    return monthsInterval.map((monthDate) => {
      const monthKey = format(monthDate, 'yyyy-MM')
      const monthLabel = format(monthDate, 'MMM yyyy', { locale: fr })
      const mStart = startOfMonth(monthDate)
      const mEnd = endOfMonth(monthDate)

      // Leads pipeline for this month
      const monthLeads = allLeads12m.filter(l => {
        const d = new Date(l.date_created)
        return d >= mStart && d <= mEnd
      })
      const pipeline = monthLeads.reduce(
        (sum, l) => sum + (parseFloat(l.estimated_value) || 0), 0
      )

      // Converted leads
      const convertedCount = monthLeads.filter(
        l => l.status === 'won' && l.converted_at
      ).length

      // Signed quotes for this month
      const monthQuotes = allQuotes12m.filter(q => {
        const d = new Date(q.signed_at)
        return d >= mStart && d <= mEnd
      })

      // Commissions for this month (real data)
      const commission = allCommissions12m
        .filter((c) => {
          const d = new Date(c.date_created)
          return d >= mStart && d <= mEnd
        })
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)

      return {
        mois: monthLabel,
        key: monthKey,
        leads: monthLeads.length,
        leadsConvertis: convertedCount,
        pipeline: Math.round(pipeline),
        devisSignes: monthQuotes.length,
        commissions: Math.round(commission)
      }
    })
  }, [monthsInterval, allLeads12m, allQuotes12m, allCommissions12m])

  // ── Table data for export ──

  const tableExportData = chartData.map(row => ({
    Mois: row.mois,
    Leads: row.leads,
    'Leads convertis': row.leadsConvertis,
    'Pipeline CHF': row.pipeline,
    'Devis signes': row.devisSignes,
    'Commissions CHF': row.commissions
  }))

  // ── Month/Year selector options ──

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2026, i, 1), 'MMMM', { locale: fr })
  }))

  const isLoading = loadingCurrentLeads || loadingQuotes

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="ds-page-title">Rapports</h1>
        <div className="ds-card p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-sm text-gray-500">Chargement des rapports...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header with month/year selector ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="ds-page-title">Rapports</h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Banknote}
          label="Revenus generes"
          value={formatCHF(currentRevenue)}
          trend={revenueTrend}
          trendLabel="vs mois precedent"
        />
        <KPICard
          icon={BarChart3}
          label="Commissions gagnees"
          value={formatCHF(currentCommission)}
          trend={commissionTrend}
          trendLabel="vs mois precedent"
        />
        <KPICard
          icon={Users}
          label="Leads convertis"
          value={currentConverted}
          trend={convertedTrend}
          trendLabel="vs mois precedent"
        />
        <KPICard
          icon={Percent}
          label="Taux de conversion"
          value={`${currentConversionRate.toFixed(1)}%`}
          trend={conversionTrend}
          trendLabel="pts vs mois precedent"
        />
      </div>

      {/* ── 12-month Evolution Chart ── */}
      <div className="ds-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Evolution 12 mois
            </h2>
            <p className="text-xs text-gray-500 mt-1">Pipeline (leads) et commissions mensuelles</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px'
              }}
              formatter={(value, name) => [formatCHF(value), name]}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            />
            <Bar
              yAxisId="left"
              dataKey="pipeline"
              name="Pipeline (leads)"
              fill="rgba(0, 113, 227, 0.2)"
              stroke="var(--accent-hover)"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="commissions"
              name="Commissions"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Monthly Breakdown Table ── */}
      <div className="ds-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Detail mensuel
          </h2>
          <button
            onClick={() => exportCSV(
              tableExportData,
              `rapports-revendeur-${selectedYear}.csv`
            )}
            className="ds-btn ds-btn-ghost flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            Exporter CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-xs text-gray-500 font-medium">Mois</th>
                <th className="text-right py-3 text-xs text-gray-500 font-medium">Leads</th>
                <th className="text-right py-3 text-xs text-gray-500 font-medium">Leads convertis</th>
                <th className="text-right py-3 text-xs text-gray-500 font-medium">Pipeline CHF</th>
                <th className="text-right py-3 text-xs text-gray-500 font-medium">Devis signes</th>
                <th className="text-right py-3 text-xs text-gray-500 font-medium">Commissions CHF</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => {
                const isCurrentMonth =
                  row.key === format(selectedDate, 'yyyy-MM')
                return (
                  <tr
                    key={row.key}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 ${
                      isCurrentMonth ? 'font-medium' : ''
                    }`}
                    style={isCurrentMonth ? { background: 'rgba(0,113,227,0.04)' } : undefined}
                  >
                    <td className="py-3 text-gray-900 capitalize">{row.mois}</td>
                    <td className="py-3 text-right text-gray-700">{row.leads}</td>
                    <td className="py-3 text-right text-gray-700">{row.leadsConvertis}</td>
                    <td className="py-3 text-right text-gray-700">{formatCHF(row.pipeline)}</td>
                    <td className="py-3 text-right text-gray-700">{row.devisSignes}</td>
                    <td className="py-3 text-right font-medium" style={{ color: 'var(--semantic-green)' }}>
                      {formatCHF(row.commissions)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="py-3 font-semibold text-gray-900">Total</td>
                <td className="py-3 text-right font-semibold text-gray-900">
                  {chartData.reduce((s, r) => s + r.leads, 0)}
                </td>
                <td className="py-3 text-right font-semibold text-gray-900">
                  {chartData.reduce((s, r) => s + r.leadsConvertis, 0)}
                </td>
                <td className="py-3 text-right font-semibold text-gray-900">
                  {formatCHF(chartData.reduce((s, r) => s + r.pipeline, 0))}
                </td>
                <td className="py-3 text-right font-semibold text-gray-900">
                  {chartData.reduce((s, r) => s + r.devisSignes, 0)}
                </td>
                <td className="py-3 text-right font-semibold" style={{ color: 'var(--semantic-green)' }}>
                  {formatCHF(chartData.reduce((s, r) => s + r.commissions, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RapportsRevendeur
