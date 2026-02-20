/**
 * PipelineWidget — S-01-06 — Apple Premium Design System
 * Commercial pipeline funnel (leads + quotes).
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Target, Users } from 'lucide-react'
import api from '../../../lib/axios'

const STAGES = [
  { key: 'new', label: 'Nouveau' },
  { key: 'contacted', label: 'Contacte' },
  { key: 'qualified', label: 'Qualifie' },
  { key: 'proposal', label: 'Proposition' },
  { key: 'negotiation', label: 'Nego' },
  { key: 'won', label: 'Gagne' }
]

const formatCHF = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M CHF`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K CHF`
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0
  }).format(value)
}

const fetchPipelineData = async (company) => {
  try {
    const leadsFilter = company && company !== 'all' ? { company: { _eq: company } } : {}
    const quotesFilter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}

    const [leadsRes, quotesRes] = await Promise.all([
      api.get('/items/leads', {
        params: { filter: leadsFilter, fields: ['status', 'estimated_value'], limit: -1 }
      }).catch(() => ({ data: { data: [] } })),
      api.get('/items/quotes', {
        params: { filter: quotesFilter, fields: ['status', 'total_amount'], limit: -1 }
      }).catch(() => ({ data: { data: [] } }))
    ])

    const leads = leadsRes.data?.data || []
    const quotes = quotesRes.data?.data || []

    const stages = {}
    STAGES.forEach(s => { stages[s.key] = { count: 0, value: 0 } })

    leads.forEach(lead => {
      const stage = stages[lead.status]
      if (stage) {
        stage.count++
        stage.value += parseFloat(lead.estimated_value || 0)
      }
    })

    const totalValue = Object.values(stages).reduce((sum, s) => sum + s.value, 0)
    const totalLeads = leads.length
    const activeQuotes = quotes.filter(q => ['draft', 'sent', 'pending'].includes(q.status))

    return {
      stages,
      totalValue,
      totalLeads,
      activeQuotes: activeQuotes.length,
      quotesValue: activeQuotes.reduce((sum, q) => sum + parseFloat(q.total_amount || 0), 0)
    }
  } catch {
    return { stages: {}, totalValue: 0, totalLeads: 0, activeQuotes: 0, quotesValue: 0 }
  }
}

const PipelineWidget = ({ selectedCompany }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pipeline', selectedCompany],
    queryFn: () => fetchPipelineData(selectedCompany),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  if (isLoading) {
    return (
      <div className="ds-card p-5">
        <div className="ds-skeleton h-44 rounded-lg" />
      </div>
    )
  }

  const { stages = {}, totalValue = 0, totalLeads = 0, activeQuotes = 0, quotesValue = 0 } = data || {}
  const maxCount = Math.max(...Object.values(stages).map(s => s.count), 1)

  return (
    <div className="ds-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: 'var(--accent)' }} />
          <span className="ds-card-title">Pipeline Commercial</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatCHF(totalValue)}
        </span>
      </div>

      {/* Funnel bars */}
      <div className="space-y-2">
        {STAGES.map((stage, idx) => {
          const stageData = stages[stage.key] || { count: 0, value: 0 }
          const widthPercent = maxCount > 0 ? (stageData.count / maxCount) * 100 : 0
          // Opacity gradient: first bar full, last bar lighter
          const opacity = 1 - (idx * 0.12)

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <span className="ds-meta w-20 text-right truncate">{stage.label}</span>
              <div
                className="flex-1 h-6 rounded-full overflow-hidden relative"
                style={{ background: 'rgba(0,0,0,0.04)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(widthPercent, 2)}%`,
                    background: `var(--accent)`,
                    opacity
                  }}
                />
                <span
                  className="absolute inset-0 flex items-center justify-end pr-2"
                  style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  {stageData.count > 0 && `${stageData.count} · ${formatCHF(stageData.value)}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div
        className="mt-4 pt-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border-light)' }}
      >
        <div className="flex items-center gap-1.5 ds-meta">
          <Users size={12} />
          <span>{totalLeads} leads</span>
        </div>
        <span className="ds-meta">
          {activeQuotes} devis actifs · {formatCHF(quotesValue)}
        </span>
      </div>
    </div>
  )
}

export default PipelineWidget
