/**
 * PipelineWidget — S-01-06
 * Commercial pipeline funnel (leads + quotes).
 * Real data from Directus leads + quotes collections.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Target, ChevronRight, Users } from 'lucide-react'
import api from '../../../lib/axios'

const STAGES = [
  { key: 'new', label: 'Nouveau', color: 'bg-blue-500' },
  { key: 'contacted', label: 'Contacté', color: 'bg-cyan-500' },
  { key: 'qualified', label: 'Qualifié', color: 'bg-green-500' },
  { key: 'proposal', label: 'Proposition', color: 'bg-yellow-500' },
  { key: 'negotiation', label: 'Négo', color: 'bg-orange-500' },
  { key: 'won', label: 'Gagné', color: 'bg-emerald-600' }
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
    const filter = company && company !== 'all' ? { owner_company: { _eq: company } } : {}

    const [leadsRes, quotesRes] = await Promise.all([
      api.get('/items/leads', {
        params: {
          filter,
          fields: ['status', 'estimated_value'],
          limit: -1
        }
      }).catch(() => ({ data: { data: [] } })),
      api.get('/items/quotes', {
        params: {
          filter,
          fields: ['status', 'total_amount'],
          limit: -1
        }
      }).catch(() => ({ data: { data: [] } }))
    ])

    const leads = leadsRes.data?.data || []
    const quotes = quotesRes.data?.data || []

    // Count by stage
    const stages = {}
    STAGES.forEach(s => { stages[s.key] = { count: 0, value: 0 } })

    leads.forEach(lead => {
      const stage = stages[lead.status]
      if (stage) {
        stage.count++
        stage.value += parseFloat(lead.estimated_value || 0)
      }
    })

    // Total pipeline value
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
      <div className="glass-card p-6">
        <div className="h-48 glass-skeleton rounded-lg" />
      </div>
    )
  }

  const { stages = {}, totalValue = 0, totalLeads = 0, activeQuotes = 0, quotesValue = 0 } = data || {}
  const maxCount = Math.max(...Object.values(stages).map(s => s.count), 1)

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Pipeline Commercial
          </h3>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {formatCHF(totalValue)}
        </span>
      </div>

      {/* Funnel bars */}
      <div className="space-y-2">
        {STAGES.map((stage) => {
          const stageData = stages[stage.key] || { count: 0, value: 0 }
          const widthPercent = maxCount > 0 ? (stageData.count / maxCount) * 100 : 0

          return (
            <div key={stage.key} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-20 text-right truncate">
                {stage.label}
              </span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center`}
                  style={{ width: `${Math.max(widthPercent, 2)}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-gray-600">
                  {stageData.count > 0 && `${stageData.count} · ${formatCHF(stageData.value)}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Users size={14} />
          <span>{totalLeads} leads</span>
        </div>
        <div>
          {activeQuotes} devis actifs · {formatCHF(quotesValue)}
        </div>
      </div>
    </div>
  )
}

export default PipelineWidget
