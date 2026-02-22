/**
 * MauticEmailsWidget — Phase D (D.2.3)
 * Compact KPI: "Emails envoyes ce mois" from Mautic stats.
 * Polls every 60s. Graceful degradation.
 * Apple DS v2.0 tokens.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, Loader2 } from 'lucide-react'
import api from '../../../lib/axios'

const fetchEmailStats = async () => {
  try {
    const res = await api.get('/api/mautic/stats')
    const d = res.data?.data || res.data || {}
    return {
      emailsSent: d.emails_sent || d.total_emails || 0,
      emailsThisMonth: d.emails_this_month || d.emails_sent || 0,
      online: true
    }
  } catch {
    return { emailsSent: 0, emailsThisMonth: 0, online: false }
  }
}

const MauticEmailsWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['mautic-emails-widget'],
    queryFn: fetchEmailStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
    throwOnError: false
  })

  const count = data?.emailsThisMonth || 0
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
            background: 'var(--tint-green)'
          }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--label-3)' }} />
          ) : (
            <Mail size={16} style={{ color: 'var(--semantic-green)' }} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--label-1)' }}>
            {isLoading ? '...' : count.toLocaleString('fr-CH')} emails
          </p>
          <p className="ds-meta">Envoyes via Mautic ce mois</p>
        </div>
      </div>
    </div>
  )
}

export default MauticEmailsWidget
