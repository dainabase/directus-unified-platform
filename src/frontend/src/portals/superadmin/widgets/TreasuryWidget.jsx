/**
 * TreasuryWidget — S-01-07 — Apple Premium Design System
 * Revolut treasury overview with graceful degradation.
 */

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wallet, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Loader2, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'

const formatCHF = (value) => {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)
}

const formatCurrency = (value, currency = 'CHF') => {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency,
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

    // Group balances by currency
    const currencyMap = {}
    accounts.forEach(a => {
      const cur = (a.currency || 'CHF').toUpperCase()
      const bal = parseFloat(a.balance || a.current_balance || 0)
      currencyMap[cur] = (currencyMap[cur] || 0) + bal
    })
    const currencyBreakdown = Object.entries(currencyMap)
      .map(([currency, balance]) => ({ currency, balance }))
      .sort((a, b) => b.balance - a.balance)

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
      currencyBreakdown,
      inflows,
      outflows,
      dailyData,
      lastSync: null
    }
  } catch {
    return { source: 'offline', balance: 0, accounts: [], currencyBreakdown: [], inflows: 0, outflows: 0, dailyData: [] }
  }
}

const TreasuryWidget = ({ selectedCompany }) => {
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['treasury', selectedCompany],
    queryFn: () => fetchTreasury(selectedCompany),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  // Fetch 5 latest transactions
  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['treasury-recent-tx', selectedCompany],
    queryFn: async () => {
      const filter = selectedCompany && selectedCompany !== 'all'
        ? { owner_company: { _eq: selectedCompany } }
        : {}
      const { data: res } = await api.get('/items/bank_transactions', {
        params: {
          filter,
          fields: ['id', 'date', 'description', 'amount', 'currency', 'type'],
          sort: ['-date'],
          limit: 5
        }
      })
      return res?.data || []
    },
    staleTime: 1000 * 60 * 2
  })

  // Fetch last sync log
  const { data: lastSyncData } = useQuery({
    queryKey: ['treasury-last-sync'],
    queryFn: async () => {
      const { data: res } = await api.get('/items/revolut_sync_logs', {
        params: {
          fields: ['id', 'synced_at'],
          sort: ['-synced_at'],
          limit: 1
        }
      })
      const logs = res?.data || []
      return logs.length > 0 ? logs[0] : null
    },
    staleTime: 1000 * 30
  })

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: () => api.post('/api/revolut/sync'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury'] })
      queryClient.invalidateQueries({ queryKey: ['treasury-recent-tx'] })
      queryClient.invalidateQueries({ queryKey: ['treasury-last-sync'] })
      queryClient.invalidateQueries({ queryKey: ['banking'] })
      toast.success('Synchronisation Revolut terminee')
    },
    onError: () => {
      toast.error('Erreur lors de la synchronisation')
    }
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
    currencyBreakdown = [],
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
        {/* Per-currency breakdown */}
        {currencyBreakdown.length > 1 && (
          <p className="ds-meta mt-2" style={{ fontSize: 12 }}>
            {currencyBreakdown.map((c, i) => (
              <span key={c.currency}>
                {i > 0 && <span style={{ color: 'var(--text-tertiary)', margin: '0 4px' }}>&middot;</span>}
                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {formatCurrency(c.balance, c.currency)}
                </span>
              </span>
            ))}
          </p>
        )}
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

      {/* 5 dernieres transactions */}
      {recentTransactions.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
          <p className="ds-meta mb-2" style={{ fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            5 dernieres transactions
          </p>
          <div className="space-y-1">
            {recentTransactions.map((tx) => {
              const amount = parseFloat(tx.amount || 0)
              const isPositive = amount >= 0
              const txDate = tx.date ? format(new Date(tx.date), 'dd.MM', { locale: fr }) : '--'
              const desc = tx.description
                ? (tx.description.length > 28 ? tx.description.slice(0, 28) + '...' : tx.description)
                : 'Transaction'

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors duration-100"
                  style={{ fontSize: 12 }}
                >
                  {isPositive ? (
                    <ArrowDownLeft size={12} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  ) : (
                    <ArrowUpRight size={12} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  )}
                  <span className="ds-meta" style={{ width: 38, flexShrink: 0 }}>{txDate}</span>
                  <span
                    className="flex-1 truncate"
                    style={{ color: 'var(--text-secondary)' }}
                    title={tx.description}
                  >
                    {desc}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      flexShrink: 0,
                      fontVariantNumeric: 'tabular-nums',
                      color: isPositive ? 'var(--success)' : 'var(--danger)'
                    }}
                  >
                    {isPositive ? '+' : ''}{formatCurrency(amount, tx.currency || 'CHF')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Derniere sync & Sync maintenant */}
      <div
        className="mt-3 pt-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border-light)', fontSize: 12 }}
      >
        <span className="flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <Clock size={12} />
          {lastSyncData?.synced_at ? (
            <span>
              Derniere sync : {formatDistanceToNow(new Date(lastSyncData.synced_at), { addSuffix: false, locale: fr })}
            </span>
          ) : (
            <span>Aucune synchronisation</span>
          )}
        </span>
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="ds-btn ds-btn-ghost !py-1 !px-2"
          style={{ fontSize: 11, color: 'var(--accent)' }}
        >
          {syncMutation.isPending ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Sync...
            </>
          ) : (
            <>
              <RefreshCw size={12} />
              Sync maintenant
            </>
          )}
        </button>
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
