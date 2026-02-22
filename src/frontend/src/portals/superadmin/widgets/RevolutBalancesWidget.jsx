/**
 * RevolutBalancesWidget — Phase D (D.3.3)
 * Compact KPI: Total CHF balance from Revolut accounts.
 * Polls every 60s. Graceful degradation.
 * Apple DS v2.0 tokens.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet, Loader2 } from 'lucide-react'
import api from '../../../lib/axios'

const fetchRevolutBalance = async () => {
  try {
    const healthRes = await api.get('/api/integrations/health')
    const revData = healthRes.data?.integrations?.revolut
    if (!revData?.available) return { total: 0, online: false }

    const balRes = await api.get('/api/integrations/revolut/balances')
    const accounts = balRes.data?.data || balRes.data?.accounts || []
    const totalCHF = accounts.reduce((sum, a) => {
      if ((a.currency || 'CHF') === 'CHF') {
        return sum + (parseFloat(a.balance || a.amount) || 0)
      }
      return sum
    }, 0)

    return { total: totalCHF, online: true }
  } catch {
    return { total: 0, online: false }
  }
}

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v)

const RevolutBalancesWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['revolut-balances-widget'],
    queryFn: fetchRevolutBalance,
    staleTime: 30_000,
    refetchInterval: 60_000,
    throwOnError: false
  })

  const total = data?.total || 0
  const online = data?.online ?? true

  if (!isLoading && !online) return null

  return (
    <div className="ds-card p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: 'var(--tint-blue)'
          }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--label-3)' }} />
          ) : (
            <Wallet size={16} style={{ color: 'var(--accent)' }} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--label-1)' }}>
            {isLoading ? '...' : formatCHF(total)}
          </p>
          <p className="ds-meta">Solde Revolut CHF</p>
        </div>
      </div>
    </div>
  )
}

export default RevolutBalancesWidget
