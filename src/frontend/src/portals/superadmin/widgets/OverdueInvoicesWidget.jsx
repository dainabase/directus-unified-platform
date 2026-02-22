/**
 * OverdueInvoicesWidget — Phase D (D.1.4)
 * Shows overdue invoices count + amount from Invoice Ninja dashboard.
 * Polls every 60s. Graceful degradation if service offline.
 * Apple DS v2.0 tokens.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react'
import api from '../../../lib/axios'

const formatCHF = (value) => {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(num)
}

const fetchOverdue = async () => {
  try {
    const res = await api.get('/api/invoice-ninja/dashboard')
    const d = res.data?.data || {}
    return {
      count: d.overdue_count || 0,
      amount: d.overdue_amount || 0,
      online: true
    }
  } catch {
    return { count: 0, amount: 0, online: false }
  }
}

const OverdueInvoicesWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['invoice-ninja-overdue-widget'],
    queryFn: fetchOverdue,
    staleTime: 30_000,
    refetchInterval: 60_000,
    throwOnError: false
  })

  const count = data?.count || 0
  const amount = data?.amount || 0
  const online = data?.online ?? true

  // Hide widget when no overdue invoices and service is online
  if (!isLoading && online && count === 0) return null

  const IN_URL = import.meta.env.VITE_INVOICE_NINJA_URL || ''

  return (
    <div
      className="ds-card p-4"
      style={{
        borderLeft: count > 0 ? '3px solid var(--semantic-red)' : undefined
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 36,
              height: 36,
              background: count > 0 ? 'var(--tint-red)' : 'var(--fill-1)'
            }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" style={{ color: 'var(--label-3)' }} />
            ) : (
              <AlertCircle size={16} style={{ color: count > 0 ? 'var(--semantic-red)' : 'var(--label-3)' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: count > 0 ? 'var(--semantic-red)' : 'var(--label-1)' }}>
              {isLoading ? 'Chargement...' : `${count} facture${count > 1 ? 's' : ''} impayee${count > 1 ? 's' : ''}`}
            </p>
            {!isLoading && count > 0 && (
              <p className="ds-meta">{formatCHF(amount)} en retard</p>
            )}
            {!isLoading && !online && (
              <p className="ds-meta">Invoice Ninja hors ligne</p>
            )}
          </div>
        </div>
        {count > 0 && IN_URL && (
          <a
            href={`${IN_URL}/#/invoices?status=overdue`}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn ds-btn-ghost !py-1 text-xs"
          >
            Voir
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

export default OverdueInvoicesWidget
