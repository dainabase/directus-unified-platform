/**
 * PipelineWidget — S-01-06 — Apple Premium Design System
 * Commercial pipeline funnel (leads + quotes) with KPI summary,
 * recent leads & quotes lists.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Target, Users, TrendingUp, FileText, DollarSign, Percent } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

const STAGES = [
  { key: 'new', label: 'Nouveau' },
  { key: 'contacted', label: 'Contacte' },
  { key: 'qualified', label: 'Qualifie' },
  { key: 'proposal', label: 'Proposition' },
  { key: 'negotiation', label: 'Nego' },
  { key: 'won', label: 'Gagne' }
]

/* ── Status badge config ── */
const LEAD_STATUS_BADGE = {
  new:         { label: 'Nouveau',     cls: 'ds-badge ds-badge-info' },
  contacted:   { label: 'Contacte',    cls: 'ds-badge ds-badge-warning' },
  qualified:   { label: 'Qualifie',    cls: 'ds-badge ds-badge-success' },
  proposal:    { label: 'Proposition', cls: 'ds-badge', style: { background: 'var(--accent-light)', color: 'var(--accent)' } },
  negotiation: { label: 'Nego',        cls: 'ds-badge ds-badge-warning' },
  won:         { label: 'Gagne',       cls: 'ds-badge ds-badge-success' },
  lost:        { label: 'Perdu',       cls: 'ds-badge ds-badge-danger' }
}

const QUOTE_STATUS_BADGE = {
  draft:    { label: 'Brouillon', cls: 'ds-badge ds-badge-default' },
  sent:     { label: 'Envoye',    cls: 'ds-badge', style: { background: 'var(--accent-light)', color: 'var(--accent)' } },
  pending:  { label: 'En attente', cls: 'ds-badge ds-badge-warning' },
  accepted: { label: 'Accepte',   cls: 'ds-badge ds-badge-success' },
  rejected: { label: 'Rejete',    cls: 'ds-badge ds-badge-danger' }
}

const formatCHF = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M CHF`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K CHF`
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0
  }).format(value)
}

const formatCHFFull = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const relativeDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return ''
  }
}

/* ── Data fetchers ── */

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

    // KPI computations
    const activeLeads = leads.filter(l => !['lost', 'won'].includes(l.status))
    const pendingQuotes = quotes.filter(q => ['sent', 'pending'].includes(q.status))
    const pipelineValue = activeLeads.reduce((sum, l) => sum + parseFloat(l.estimated_value || 0), 0)
    const wonLeads = leads.filter(l => l.status === 'won').length
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0

    return {
      stages,
      totalValue,
      totalLeads,
      activeQuotes: activeQuotes.length,
      quotesValue: activeQuotes.reduce((sum, q) => sum + parseFloat(q.total_amount || 0), 0),
      // KPI data
      activeLeadsCount: activeLeads.length,
      pendingQuotesCount: pendingQuotes.length,
      pipelineValue,
      conversionRate
    }
  } catch {
    return {
      stages: {}, totalValue: 0, totalLeads: 0, activeQuotes: 0, quotesValue: 0,
      activeLeadsCount: 0, pendingQuotesCount: 0, pipelineValue: 0, conversionRate: 0
    }
  }
}

const fetchRecentLeads = async (company) => {
  try {
    const filter = company && company !== 'all' ? { company: { _eq: company } } : {}
    const res = await api.get('/items/leads', {
      params: {
        filter,
        fields: ['first_name', 'last_name', 'company_name', 'status', 'date_created'],
        sort: ['-date_created'],
        limit: 5
      }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const fetchRecentQuotes = async (company) => {
  try {
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}
    const res = await api.get('/items/quotes', {
      params: {
        filter,
        fields: ['quote_number', 'client_name', 'total_amount', 'status', 'date_created'],
        sort: ['-date_created'],
        limit: 5
      }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

/* ── Sub-components ── */

const StatusBadge = ({ status, map }) => {
  const config = map[status] || { label: status || '—', cls: 'ds-badge ds-badge-default' }
  return (
    <span className={config.cls} style={config.style || {}}>
      {config.label}
    </span>
  )
}

const KPISummaryCard = ({ icon: Icon, label, value, accent }) => (
  <div
    className="p-3 rounded-lg"
    style={{ background: accent ? 'var(--accent-light)' : 'rgba(0,0,0,0.03)' }}
  >
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} style={{ color: accent ? 'var(--accent)' : 'var(--text-tertiary)' }} />
      <span className="ds-meta">{label}</span>
    </div>
    <p style={{
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: '-0.3px',
      color: accent ? 'var(--accent)' : 'var(--text-primary)',
      lineHeight: 1.2
    }}>
      {value}
    </p>
  </div>
)

/* ── Main widget ── */

const PipelineWidget = ({ selectedCompany }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pipeline', selectedCompany],
    queryFn: () => fetchPipelineData(selectedCompany),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  const { data: recentLeads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['pipeline-recent-leads', selectedCompany],
    queryFn: () => fetchRecentLeads(selectedCompany),
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  const { data: recentQuotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['pipeline-recent-quotes', selectedCompany],
    queryFn: () => fetchRecentQuotes(selectedCompany),
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

  const {
    stages = {}, totalValue = 0, totalLeads = 0,
    activeQuotes = 0, quotesValue = 0,
    activeLeadsCount = 0, pendingQuotesCount = 0,
    pipelineValue = 0, conversionRate = 0
  } = data || {}

  const maxCount = Math.max(...Object.values(stages).map(s => s.count), 1)

  return (
    <div className="ds-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: 'var(--accent)' }} />
          <span className="ds-card-title">Pipeline Commercial</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatCHF(totalValue)}
        </span>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <KPISummaryCard
          icon={Users}
          label="Leads actifs"
          value={activeLeadsCount}
          accent={false}
        />
        <KPISummaryCard
          icon={FileText}
          label="Devis en attente"
          value={pendingQuotesCount}
          accent={false}
        />
        <KPISummaryCard
          icon={DollarSign}
          label="Valeur pipeline"
          value={formatCHF(pipelineValue)}
          accent={true}
        />
        <KPISummaryCard
          icon={Percent}
          label="Taux conversion"
          value={`${conversionRate.toFixed(1)}%`}
          accent={false}
        />
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

      {/* Recent leads & quotes — 2-column section */}
      <div
        className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ borderTop: '1px solid var(--border-light)' }}
      >
        {/* Left: 5 derniers leads */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={13} style={{ color: 'var(--accent)' }} />
            <span className="ds-card-title" style={{ fontSize: 12.5 }}>5 derniers leads</span>
          </div>
          {leadsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="ds-skeleton h-10 rounded-lg" />)}
            </div>
          ) : recentLeads.length === 0 ? (
            <p className="ds-meta py-4 text-center">Aucun lead</p>
          ) : (
            <div className="space-y-1.5">
              {recentLeads.map((lead, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-150"
                  style={{ background: 'rgba(0,0,0,0.02)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">
                      {lead.first_name} {lead.last_name}
                    </p>
                    {lead.company_name && (
                      <p className="ds-meta truncate">{lead.company_name}</p>
                    )}
                  </div>
                  <StatusBadge status={lead.status} map={LEAD_STATUS_BADGE} />
                  <span className="ds-meta shrink-0" style={{ fontSize: 10 }}>
                    {relativeDate(lead.date_created)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: 5 derniers devis */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <FileText size={13} style={{ color: 'var(--accent)' }} />
            <span className="ds-card-title" style={{ fontSize: 12.5 }}>5 derniers devis</span>
          </div>
          {quotesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="ds-skeleton h-10 rounded-lg" />)}
            </div>
          ) : recentQuotes.length === 0 ? (
            <p className="ds-meta py-4 text-center">Aucun devis</p>
          ) : (
            <div className="space-y-1.5">
              {recentQuotes.map((quote, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-150"
                  style={{ background: 'rgba(0,0,0,0.02)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)' }} className="truncate">
                      {quote.quote_number || '—'}
                    </p>
                    {quote.client_name && (
                      <p className="ds-meta truncate">{quote.client_name}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {formatCHFFull(quote.total_amount)}
                  </span>
                  <StatusBadge status={quote.status} map={QUOTE_STATUS_BADGE} />
                  <span className="ds-meta shrink-0" style={{ fontSize: 10 }}>
                    {relativeDate(quote.date_created)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PipelineWidget
