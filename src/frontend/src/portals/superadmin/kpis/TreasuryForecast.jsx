/**
 * TreasuryForecast — Phase J-04
 * Prévision trésorerie 30/60/90 jours avec BarChart Recharts.
 * Glassmorphism design, blue-600 dominant.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet, TrendingDown, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
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
  if (!res.ok) throw new Error('Erreur chargement prévision trésorerie')
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
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Trésorerie prévisionnelle
          </h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const currentBalance = data.current_balance || 0
  const burnRate = data.burn_rate_monthly || 0
  const runway = data.runway_months || 0

  // Chart data
  const chartData = [
    { name: 'Actuel', balance: currentBalance },
    { name: '+30j', balance: data.d30?.balance || 0 },
    { name: '+60j', balance: data.d60?.balance || 0 },
    { name: '+90j', balance: data.d90?.balance || 0 }
  ]

  const runwayColor = runway > 6 ? 'text-green-600' : runway > 3 ? 'text-amber-600' : 'text-red-600'
  const runwayBg = runway > 6 ? 'bg-green-50 border-green-100' : runway > 3 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Trésorerie prévisionnelle
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Solde</p>
          <p className="text-lg font-bold text-gray-900">{formatCHF(currentBalance)}</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Burn</p>
          <p className="text-lg font-bold text-gray-900">{formatCHF(burnRate)}/m</p>
        </div>
        <div className={`p-3 rounded-xl border text-center ${runwayBg}`}>
          <p className="text-xs text-gray-500 mb-1">Runway</p>
          <p className={`text-lg font-bold ${runwayColor}`}>{runway} mois</p>
        </div>
      </div>

      {/* Forecast details */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        {[
          { label: '+30j', data: data.d30 },
          { label: '+60j', data: data.d60 },
          { label: '+90j', data: data.d90 }
        ].map(({ label, data: horizonData }) => (
          <div key={label} className="p-2 rounded-lg bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={`text-sm font-bold ${
              (horizonData?.balance || 0) >= currentBalance ? 'text-gray-900' : 'text-red-600'
            }`}>
              {formatCHF(horizonData?.balance || 0)}
            </p>
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span className="text-green-500">+{formatCHF(horizonData?.incoming || 0)}</span>
              <span className="text-red-400">-{formatCHF(horizonData?.outgoing || 0)}</span>
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
              tick={{ fontSize: 11, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${Math.round(v / 1000)}K`}
            />
            <Tooltip
              formatter={(v) => formatCHFFull(v)}
              contentStyle={{
                fontSize: '12px',
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.balance >= currentBalance ? '#2563eb' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Warning if runway < 6 months */}
      {runway > 0 && runway <= 6 && (
        <div className="mt-3 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
          <AlertTriangle size={14} className="flex-shrink-0" />
          <span>Runway inférieur à 6 mois — attention requise</span>
        </div>
      )}
    </div>
  )
}
