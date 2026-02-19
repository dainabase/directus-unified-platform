/**
 * TreasuryWidget — S-01-07
 * Revolut treasury overview with graceful degradation.
 * If /api/revolut is unavailable, shows bank_transactions from Directus.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import api from '../../../lib/axios'

const formatCHF = (value) => {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

const fetchTreasury = async (company) => {
  // Try Revolut API first
  try {
    const { data } = await api.get('/api/revolut/balance')
    if (data && (data.accounts || data.balance !== undefined)) {
      return {
        source: 'revolut',
        balance: data.balance || data.accounts?.reduce((sum, a) => sum + (a.balance || 0), 0) || 0,
        accounts: data.accounts || [],
        lastSync: data.lastSync || new Date().toISOString()
      }
    }
  } catch {
    // Revolut API unavailable, fallback to Directus
  }

  // Fallback: fetch from bank_transactions + bank_accounts
  try {
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}

    const [accountsRes, transactionsRes] = await Promise.all([
      api.get('/items/bank_accounts', {
        params: { filter, fields: ['*'], limit: 10 }
      }).catch(() => ({ data: { data: [] } })),
      api.get('/items/bank_transactions', {
        params: {
          filter,
          fields: ['amount', 'type', 'date', 'description'],
          sort: ['-date'],
          limit: 30
        }
      }).catch(() => ({ data: { data: [] } }))
    ])

    const accounts = accountsRes.data?.data || []
    const transactions = transactionsRes.data?.data || []

    const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || a.current_balance || 0), 0)

    // Weekly inflows/outflows
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentTx = transactions.filter(t => new Date(t.date) >= weekAgo)

    const inflows = recentTx
      .filter(t => parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const outflows = recentTx
      .filter(t => parseFloat(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

    // Daily data for mini chart
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().slice(0, 10)
      const dayTx = transactions.filter(t => t.date?.startsWith(dayStr))
      const dayIn = dayTx.filter(t => parseFloat(t.amount) > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0)
      const dayOut = dayTx.filter(t => parseFloat(t.amount) < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      dailyData.push({
        day: dayNames[d.getDay()],
        inflows: dayIn / 1000,
        outflows: dayOut / 1000
      })
    }

    return {
      source: 'directus',
      balance: totalBalance,
      accounts,
      inflows,
      outflows,
      dailyData,
      lastSync: null
    }
  } catch {
    return { source: 'offline', balance: 0, accounts: [], inflows: 0, outflows: 0, dailyData: [] }
  }
}

const TreasuryWidget = ({ selectedCompany }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['treasury', selectedCompany],
    queryFn: () => fetchTreasury(selectedCompany),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="h-52 glass-skeleton rounded-lg" />
      </div>
    )
  }

  const {
    source = 'offline',
    balance = 0,
    inflows = 0,
    outflows = 0,
    dailyData = []
  } = data || {}

  const cashFlow = inflows - outflows
  const burnRate = outflows > 0 ? outflows : 1
  const runway = balance > 0 ? Math.round((balance / burnRate) * 7 / 30) : 0 // weeks to months approx

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Trésorerie
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {source === 'revolut' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Revolut
            </span>
          ) : source === 'directus' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              Directus
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              Offline
            </span>
          )}
          <button
            onClick={() => refetch()}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">{formatCHF(balance)}</p>
        <div className="flex items-center gap-4 mt-1 text-sm">
          <span className="flex items-center gap-1 text-green-600">
            <TrendingUp size={14} />
            +{formatCHF(inflows)} (7j)
          </span>
          <span className="flex items-center gap-1 text-red-500">
            <TrendingDown size={14} />
            -{formatCHF(outflows)} (7j)
          </span>
        </div>
      </div>

      {/* Mini bar chart */}
      {dailyData.length > 0 && (
        <div className="h-24 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} barGap={2}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}K CHF`}
                contentStyle={{
                  fontSize: '12px',
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="inflows" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="outflows" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Runway */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <span className="text-gray-500">Runway estimé</span>
        <span className={`font-semibold ${runway > 6 ? 'text-green-600' : runway > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
          {runway > 0 ? `${runway} mois` : 'N/A'}
        </span>
      </div>

      {source === 'offline' && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700">
          <AlertCircle size={14} />
          <span>Données indisponibles — vérifier la connexion</span>
        </div>
      )}
    </div>
  )
}

export default TreasuryWidget
