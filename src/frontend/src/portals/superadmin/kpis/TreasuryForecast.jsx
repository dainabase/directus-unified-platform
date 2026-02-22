/**
 * TreasuryForecast — Phase J-04 — Apple Premium Design System
 * Prevision tresorerie 30/60/90 jours avec BarChart Recharts.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const formatCHF = (value) => {
  if (Math.abs(value) >= 1_000_000) return `CHF ${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `CHF ${Math.round(value / 1000)}K`
  return `CHF ${Math.round(value).toLocaleString('fr-CH')}`
}

const formatCHFFull = (value) =>
  `CHF ${Math.round(value).toLocaleString('fr-CH')}`

async function fetchTreasury(company) {
  const res = await fetch(`${API_BASE}/api/kpis/treasury?company=${company || 'HYPERVISUAL'}`)
  if (!res.ok) throw new Error('Erreur chargement prevision tresorerie')
  return res.json()
}

export default function TreasuryForecast({ selectedCompany }) {
  const company = selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'HYPERVISUAL'

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['treasury-forecast', company],
    queryFn: () => fetchTreasury(company),
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10
  })

  if (isLoading) {
    return (
      <div className="ds-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={16} style={{ color: 'var(--accent)' }} />
          <span className="ds-card-title">Tresorerie previsionnelle</span>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </div>
    )
  }

  if (!data) return null

  const currentBalance = data.current_balance || 0
  const burnRate = data.burn_rate_monthly || 0
  const runway = data.runway_months || 0

  const chartData = [
    { name: 'Actuel', balance: currentBalance },
    { name: '+30j', balance: data.d30?.balance || 0 },
    { name: '+60j', balance: data.d60?.balance || 0 },
    { name: '+90j', balance: data.d90?.balance || 0 }
  ]

  const runwayColor = runway > 6 ? 'var(--semantic-green)' : runway > 3 ? 'var(--semantic-orange)' : 'var(--semantic-red)'
  const runwayBg = runway > 6 ? 'var(--tint-green)' : runway > 3 ? 'var(--tint-orange)' : 'var(--tint-red)'

  return (
    <div className="ds-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={16} style={{ color: 'var(--accent)' }} />
          <span className="ds-card-title">Tresorerie previsionnelle</span>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1 rounded-md transition-colors duration-150"
          style={{ color: 'var(--label-3)' }}
          title="Actualiser"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl text-center" style={{ background: 'var(--accent-light)', border: '1px solid rgba(0,113,227,0.12)' }}>
          <p className="ds-meta mb-1">Solde</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--label-1)' }}>{formatCHF(currentBalance)}</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid var(--sep)' }}>
          <p className="ds-meta mb-1">Burn</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--label-1)' }}>{formatCHF(burnRate)}/m</p>
        </div>
        <div className="p-3 rounded-xl border text-center" style={{ background: runwayBg, borderColor: 'transparent' }}>
          <p className="ds-meta mb-1">Runway</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: runwayColor }}>{runway} mois</p>
        </div>
      </div>

      {/* Forecast details */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        {[
          { label: '+30j', data: data.d30 },
          { label: '+60j', data: data.d60 },
          { label: '+90j', data: data.d90 }
        ].map(({ label, data: horizonData }) => (
          <div key={label} className="p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <p className="ds-meta" style={{ fontWeight: 500 }}>{label}</p>
            <p style={{
              fontSize: 13,
              fontWeight: 700,
              color: (horizonData?.balance || 0) >= currentBalance ? 'var(--label-1)' : 'var(--semantic-red)'
            }}>
              {formatCHF(horizonData?.balance || 0)}
            </p>
            <div className="flex justify-between mt-1" style={{ fontSize: 10 }}>
              <span style={{ color: 'var(--semantic-green)' }}>+{formatCHF(horizonData?.incoming || 0)}</span>
              <span style={{ color: 'var(--semantic-red)' }}>-{formatCHF(horizonData?.outgoing || 0)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'var(--label-2)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--label-3)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${Math.round(v / 1000)}K`}
            />
            <Tooltip
              formatter={(v) => formatCHFFull(v)}
              contentStyle={{
                fontSize: '12px',
                background: 'var(--bg-2)',
                border: '1px solid var(--sep)',
                borderRadius: 'var(--radius-input)',
                boxShadow: 'var(--shadow-md)'
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.balance >= currentBalance ? 'var(--accent)' : 'var(--semantic-red)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Warning if runway < 6 months */}
      {runway > 0 && runway <= 6 && (
        <div
          className="mt-3 flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background: 'var(--tint-orange)', fontSize: 12, color: 'var(--semantic-orange)' }}
        >
          <AlertTriangle size={14} className="shrink-0" />
          <span>Runway inferieur a 6 mois — attention requise</span>
        </div>
      )}
    </div>
  )
}
