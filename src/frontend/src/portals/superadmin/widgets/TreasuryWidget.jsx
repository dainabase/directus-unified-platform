/**
 * TreasuryWidget — S-01-07 — Apple Premium Design System
 * Revolut treasury overview with graceful degradation.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
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

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentTx = transactions.filter(t => new Date(t.date) >= weekAgo)

    const inflows = recentTx
      .filter(t => parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const outflows = recentTx
      .filter(t => parseFloat(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

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
      <div className="ds-card p-5">
        <div className="ds-skeleton h-48 rounded-lg" />
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

  const burnRate = outflows > 0 ? outflows : 1
  const runway = balance > 0 ? Math.round((balance / burnRate) * 7 / 30) : 0

  return (
    <div className="ds-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet size={16} style={{ color: 'var(--success)' }} />
          <span className="ds-card-title">Tresorerie</span>
        </div>
        <div className="flex items-center gap-2">
          {source === 'revolut' ? (
            <span className="ds-badge ds-badge-success">Revolut</span>
          ) : source === 'directus' ? (
            <span className="ds-badge ds-badge-info">Directus</span>
          ) : (
            <span className="ds-badge">Offline</span>
          )}
          <button
            onClick={() => refetch()}
            className="p-1 rounded-md transition-colors duration-150"
            style={{ color: 'var(--text-tertiary)' }}
            title="Actualiser"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {formatCHF(balance)}
        </p>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="flex items-center gap-1" style={{ fontSize: 12.5, color: 'var(--success)' }}>
            <TrendingUp size={13} />
            +{formatCHF(inflows)} (7j)
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: 12.5, color: 'var(--danger)' }}>
            <TrendingDown size={13} />
            -{formatCHF(outflows)} (7j)
          </span>
        </div>
      </div>

      {/* Mini bar chart */}
      {dailyData.length > 0 && (
        <div className="h-24 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} barGap={2}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}K CHF`}
                contentStyle={{
                  fontSize: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-input)',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <Bar dataKey="inflows" fill="var(--success)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="outflows" fill="var(--danger)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Runway */}
      <div
        className="pt-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border-light)', fontSize: 12 }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>Runway estime</span>
        <span style={{
          fontWeight: 600,
          color: runway > 6 ? 'var(--success)' : runway > 3 ? 'var(--warning)' : 'var(--danger)'
        }}>
          {runway > 0 ? `${runway} mois` : 'N/A'}
        </span>
      </div>

      {source === 'offline' && (
        <div
          className="mt-3 flex items-center gap-2 p-2.5 rounded-lg"
          style={{ background: 'var(--warning-light)', fontSize: 12, color: 'var(--warning)' }}
        >
          <AlertCircle size={14} />
          <span>Donnees indisponibles — verifier la connexion</span>
        </div>
      )}
    </div>
  )
}

export default TreasuryWidget
