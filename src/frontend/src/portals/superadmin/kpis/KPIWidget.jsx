/**
 * KPIWidget — Phase J-01
 * Sidebar KPI panel with real data from `kpis` collection.
 * MRR sparkline via Recharts LineChart.
 * Glassmorphism design, blue-600 dominant.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const formatCHF = (value) => {
  if (value >= 1_000_000) return `CHF ${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `CHF ${Math.round(value).toLocaleString('fr-CH')}`
  return `CHF ${Math.round(value).toLocaleString('fr-CH')}`
}

const formatMetricValue = (metric, value) => {
  if (['MRR', 'ARR', 'EBITDA'].includes(metric)) return formatCHF(value)
  if (metric === 'NPS') return `${value.toFixed(1)}`
  if (metric === 'LTV_CAC') return `${value.toFixed(2)}x`
  if (metric === 'RUNWAY' || metric === 'CASH_RUNWAY') return `${value.toFixed(1)} mois`
  if (metric === 'ACTIVE_PROJECTS') return `${Math.round(value)}`
  return String(Math.round(value))
}

const METRIC_LABELS = {
  MRR: 'MRR',
  ARR: 'ARR',
  NPS: 'NPS',
  LTV_CAC: 'LTV/CAC',
  ACTIVE_PROJECTS: 'Projets actifs',
  RUNWAY: 'Runway',
  CASH_RUNWAY: 'Runway',
  EBITDA: 'EBITDA'
}

// Priority order for display
const METRIC_ORDER = ['MRR', 'ARR', 'RUNWAY', 'EBITDA', 'LTV_CAC', 'NPS', 'ACTIVE_PROJECTS']

async function fetchLatestKPIs(company) {
  const res = await fetch(`${API_BASE}/api/kpis/latest?company=${company || 'HYPERVISUAL'}`)
  if (!res.ok) throw new Error('Erreur chargement KPIs')
  return res.json()
}

async function fetchMRRHistory(company) {
  const res = await fetch(`${API_BASE}/api/kpis/history/MRR?days=30&company=${company || 'HYPERVISUAL'}`)
  if (!res.ok) return { data: [] }
  return res.json()
}

const TrendBadge = ({ variation, trend }) => {
  if (!variation || variation === 0) {
    return <span className="flex items-center gap-0.5 text-gray-400 text-xs"><Minus size={12} /> 0%</span>
  }
  const isUp = trend === 'up'
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {variation > 0 ? '+' : ''}{variation}%
    </span>
  )
}

const MRRSparkline = ({ data }) => {
  if (!data || data.length < 2) return null
  return (
    <div className="mt-2">
      <ResponsiveContainer width="100%" height={40}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function KPISidebar({ selectedCompany }) {
  const company = selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'HYPERVISUAL'

  const { data: kpiData, isLoading, refetch } = useQuery({
    queryKey: ['kpis-latest', company],
    queryFn: () => fetchLatestKPIs(company),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  const { data: mrrHistory } = useQuery({
    queryKey: ['kpis-mrr-history', company],
    queryFn: () => fetchMRRHistory(company),
    staleTime: 1000 * 60 * 5
  })

  const kpis = kpiData?.kpis || {}

  // Sort metrics by priority order
  const sortedMetrics = Object.keys(kpis).sort((a, b) => {
    const ia = METRIC_ORDER.indexOf(a)
    const ib = METRIC_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            KPIs {company}
          </h3>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Actualiser"
        >
          <RefreshCw size={14} className="text-gray-400" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 glass-skeleton rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {/* MRR — Featured with sparkline */}
          {kpis.MRR && (
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-blue-600">MRR</span>
                <TrendBadge variation={kpis.MRR.variation} trend={kpis.MRR.trend} />
              </div>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {formatCHF(kpis.MRR.value)}
              </p>
              <MRRSparkline data={mrrHistory?.data} />
            </div>
          )}

          {/* Other metrics */}
          {sortedMetrics
            .filter(m => m !== 'MRR' && m !== 'Cash_Runway')
            .map(metric => {
              const kpi = kpis[metric]
              if (!kpi) return null

              return (
                <div key={metric} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-gray-600">
                    {METRIC_LABELS[metric] || metric}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatMetricValue(metric, kpi.value)}
                    </span>
                    <TrendBadge variation={kpi.variation} trend={kpi.trend} />
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
