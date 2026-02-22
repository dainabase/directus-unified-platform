/**
 * RevolutHub — Phase D (D.3.1)
 * Hub Integration Revolut Business — balances live, transactions recentes,
 * token management, lien console externe.
 * Apple DS v2.0 tokens.
 *
 * Backend: /api/revolut/* or /api/integrations/revolut/*
 * Note: Revolut tokens expire 40min — refresh is backend-handled.
 *
 * @version 2.0.0
 * @date 2026-02-22
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CreditCard, ExternalLink, CheckCircle2, XCircle,
  RefreshCw, Loader2, Wallet, ArrowUpRight, ArrowDownRight,
  TrendingUp, AlertCircle
} from 'lucide-react'
import api from '../../../lib/axios'

const REVOLUT_URL = 'https://business.revolut.com'

// ── Fetchers ──

const fetchRevolutHealth = async () => {
  try {
    const res = await api.get('/api/integrations/health')
    const revData = res.data?.integrations?.revolut
    return {
      online: revData?.available === true,
      warning: revData?.warning || null,
      error: revData?.error || null
    }
  } catch {
    return { online: false, warning: null, error: 'Service indisponible' }
  }
}

const fetchRevolutBalances = async () => {
  try {
    const res = await api.get('/api/integrations/revolut/balances')
    return res.data?.data || res.data?.accounts || []
  } catch {
    return []
  }
}

const fetchRevolutTransactions = async () => {
  try {
    const res = await api.get('/api/integrations/revolut/transactions')
    return res.data?.data || res.data?.transactions || []
  } catch {
    return []
  }
}

// ── Helpers ──

const formatAmount = (value, currency = 'CHF') => {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency }).format(num)
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const CURRENCY_SYMBOLS = { CHF: 'CHF', EUR: 'EUR', USD: 'USD', GBP: 'GBP' }

// ── Component ──

const RevolutHub = ({ selectedCompany }) => {
  const {
    data: health = { online: false },
    isLoading: healthLoading,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['revolut-health'],
    queryFn: fetchRevolutHealth,
    staleTime: 30_000,
    refetchInterval: 60_000
  })

  const { data: balances = [] } = useQuery({
    queryKey: ['revolut-balances'],
    queryFn: fetchRevolutBalances,
    staleTime: 60_000,
    refetchInterval: 60_000,
    enabled: health.online
  })

  const { data: transactions = [] } = useQuery({
    queryKey: ['revolut-transactions'],
    queryFn: fetchRevolutTransactions,
    staleTime: 60_000,
    enabled: health.online
  })

  // Total balance across all accounts
  const totalCHF = balances.reduce((sum, b) => {
    if ((b.currency || 'CHF') === 'CHF') return sum + (parseFloat(b.balance || b.amount) || 0)
    return sum
  }, 0)

  return (
    <div className="space-y-6 ds-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ds-meta uppercase tracking-wide" style={{ fontSize: 11 }}>Banking</p>
          <h1 className="ds-page-title">Revolut Business</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={
            healthLoading
              ? 'ds-badge ds-badge-default'
              : health.online
                ? (health.warning ? 'ds-badge ds-badge-warning' : 'ds-badge ds-badge-success')
                : 'ds-badge ds-badge-danger'
          }>
            {healthLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : health.online ? (
              health.warning ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {healthLoading
              ? 'Verification...'
              : health.online
                ? (health.warning || 'Connecte')
                : 'Hors ligne'}
          </span>
          <button
            onClick={() => refetchHealth()}
            disabled={healthLoading}
            className="ds-btn ds-btn-ghost !p-2"
            title="Tester la connexion"
          >
            <RefreshCw size={14} className={healthLoading ? 'animate-spin' : ''} />
          </button>
          <a
            href={REVOLUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn ds-btn-secondary"
          >
            <ExternalLink size={14} />
            Console Revolut
          </a>
        </div>
      </div>

      {/* Offline banner */}
      {!healthLoading && !health.online && (
        <div className="ds-alert ds-alert-danger">
          <XCircle size={18} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--semantic-red)' }}>Connexion Revolut indisponible</p>
            <p className="ds-meta" style={{ marginTop: 2 }}>
              {health.error || 'Verifiez que le token API Revolut est valide (expire toutes les 40min).'}
            </p>
          </div>
        </div>
      )}

      {/* Token warning */}
      {health.online && health.warning && (
        <div className="ds-alert ds-alert-warning">
          <AlertCircle size={18} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--semantic-orange)' }}>Avertissement token</p>
            <p className="ds-meta" style={{ marginTop: 2 }}>{health.warning}</p>
          </div>
        </div>
      )}

      {/* Balances */}
      {health.online && (
        <div>
          <h3 className="ds-card-title mb-3">Soldes des comptes</h3>
          {balances.length === 0 ? (
            <div className="ds-card p-8 text-center">
              <Wallet size={24} className="mx-auto mb-2" style={{ color: 'var(--label-3)' }} />
              <p className="ds-meta">Aucun compte disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((acc, idx) => {
                const currency = acc.currency || 'CHF'
                const bal = parseFloat(acc.balance || acc.amount) || 0
                return (
                  <div key={acc.id || idx} className="ds-card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: currency === 'CHF' ? 'var(--tint-green)' : 'var(--tint-blue)' }}
                      >
                        <Wallet size={16} style={{ color: currency === 'CHF' ? 'var(--semantic-green)' : 'var(--semantic-blue)' }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--label-2)' }}>
                          {acc.name || `Compte ${CURRENCY_SYMBOLS[currency] || currency}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>
                      {formatAmount(bal, currency)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Total CHF highlight */}
      {health.online && balances.length > 1 && (
        <div
          className="ds-card p-5 flex items-center justify-between"
          style={{ borderLeft: '3px solid var(--semantic-green)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--tint-green)' }}>
              <TrendingUp size={16} style={{ color: 'var(--semantic-green)' }} />
            </div>
            <div>
              <p className="ds-meta">Total CHF</p>
              <p className="text-xl font-bold" style={{ color: 'var(--label-1)' }}>
                {formatAmount(totalCHF, 'CHF')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {health.online && transactions.length > 0 && (
        <div className="ds-card overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid var(--sep)' }}>
            <h3 className="ds-card-title">Dernieres transactions</h3>
          </div>
          <div>
            {transactions.slice(0, 10).map((tx, idx) => {
              const isCredit = tx.type === 'credit' || tx.direction === 'in' || (parseFloat(tx.amount) || 0) > 0
              const amount = Math.abs(parseFloat(tx.amount || tx.legs?.[0]?.amount) || 0)
              const currency = tx.currency || tx.legs?.[0]?.currency || 'CHF'

              return (
                <div
                  key={tx.id || idx}
                  className="flex items-center justify-between px-5 py-3 transition-colors"
                  style={{
                    borderBottom: idx < transactions.length - 1 ? '1px solid var(--sep)' : undefined
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--fill-5)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isCredit ? 'var(--tint-green)' : 'var(--tint-red)' }}
                    >
                      {isCredit ? (
                        <ArrowDownRight size={14} style={{ color: 'var(--semantic-green)' }} />
                      ) : (
                        <ArrowUpRight size={14} style={{ color: 'var(--semantic-red)' }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--label-1)' }}>
                        {tx.description || tx.reference || tx.counterparty?.name || 'Transaction'}
                      </p>
                      <p className="ds-meta truncate">
                        {formatDate(tx.created_at || tx.completed_at || tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: isCredit ? 'var(--semantic-green)' : 'var(--semantic-red)' }}
                    >
                      {isCredit ? '+' : '-'}{formatAmount(amount, currency)}
                    </span>
                    <span className={
                      tx.state === 'completed' || tx.status === 'completed'
                        ? 'ds-badge ds-badge-success'
                        : tx.state === 'pending' || tx.status === 'pending'
                          ? 'ds-badge ds-badge-warning'
                          : 'ds-badge ds-badge-default'
                    }>
                      {tx.state || tx.status || 'ok'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      {health.online && (
        <div className="ds-card p-5">
          <h3 className="ds-card-title mb-3">Liens rapides</h3>
          <div className="flex flex-wrap gap-3">
            <a href="/superadmin/finance/banking" className="ds-btn ds-btn-primary">
              <CreditCard size={14} />
              Banking
            </a>
            <a href="/superadmin/reconciliation" className="ds-btn ds-btn-secondary">
              Rapprochement bancaire
            </a>
            <a
              href={REVOLUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn-ghost"
            >
              <ExternalLink size={14} />
              Console Revolut
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevolutHub
