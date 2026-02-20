/**
 * KPISidebar — Phase J-01 — Apple Premium Design System
 * Sidebar KPI panel with real data from `kpis` collection.
 * MRR sparkline via Recharts LineChart.
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
    return (
      <span className="flex items-center gap-0.5" style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
        <Minus size={11} /> 0%
      </span>
    )
  }
  const isUp = trend === 'up'
  return (
    <span
      className="flex items-center gap-0.5"
      style={{ fontSize: 11, fontWeight: 500, color: isUp ? 'var(--success)' : 'var(--danger)' }}
    >
      {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
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
            stroke="var(--accent)"
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

  const sortedMetrics = Object.keys(kpis).sort((a, b) => {
    const ia = METRIC_ORDER.indexOf(a)
    const ib = METRIC_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  return (
    <div className="ds-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
          <span className="ds-card-title">KPIs {company}</span>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1 rounded-md transition-colors duration-150"
          style={{ color: 'var(--text-tertiary)' }}
          title="Actualiser"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="ds-skeleton h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {/* MRR — Featured */}
          {kpis.MRR && (
            <div
              className="p-3 rounded-xl"
              style={{ background: 'var(--accent-light)', border: '1px solid rgba(0,113,227,0.12)' }}
            >
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>MRR</span>
                <TrendBadge variation={kpis.MRR.variation} trend={kpis.MRR.trend} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
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
                <div
                  key={metric}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors duration-150"
                  style={{ cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="ds-body" style={{ color: 'var(--text-secondary)' }}>
                    {METRIC_LABELS[metric] || metric}
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
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
