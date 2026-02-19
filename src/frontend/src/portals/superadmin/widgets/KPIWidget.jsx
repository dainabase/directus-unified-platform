/**
 * KPIWidget — S-01-05
 * Real-time KPI sidebar with Recharts sparklines.
 * CHF formatting, fr-CH locale.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import api from '../../../lib/axios'

const formatCHF = (value) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const fetchKPIs = async (company) => {
  try {
    // Fetch real KPIs from multiple collections
    const [invoicesRes, projectsRes, leadsRes] = await Promise.all([
      api.get('/items/client_invoices', {
        params: {
          aggregate: { sum: ['amount'], count: ['*'] },
          filter: company && company !== 'all' ? { owner_company: { _eq: company } } : {},
          groupBy: ['status']
        }
      }).catch(() => ({ data: { data: [] } })),
      api.get('/items/projects', {
        params: {
          aggregate: { count: ['*'] },
          filter: company && company !== 'all' ? { owner_company: { _eq: company } } : {},
          groupBy: ['status']
        }
      }).catch(() => ({ data: { data: [] } })),
      api.get('/items/leads', {
        params: {
          aggregate: { count: ['*'], sum: ['estimated_value'] },
          filter: company && company !== 'all' ? { company: { _eq: company } } : {},
          groupBy: ['status']
        }
      }).catch(() => ({ data: { data: [] } }))
    ])

    const invoiceData = invoicesRes.data?.data || []
    const projectData = projectsRes.data?.data || []
    const leadData = leadsRes.data?.data || []

    // Calculate MRR from paid invoices
    const paidInvoices = invoiceData.find(i => i.status === 'paid')
    const totalRevenue = parseFloat(paidInvoices?.sum?.amount || 0)

    // Pipeline value from open leads
    const pipelineLeads = leadData.filter(l => !['won', 'lost'].includes(l.status))
    const pipelineValue = pipelineLeads.reduce((sum, l) => sum + parseFloat(l.sum?.estimated_value || 0), 0)

    // Active projects
    const activeProjects = projectData
      .filter(p => ['active', 'in_progress', 'in-progress'].includes(p.status))
      .reduce((sum, p) => sum + parseInt(p.count || 0), 0)

    // Won leads count
    const wonLeads = leadData.find(l => l.status === 'won')
    const totalLeads = leadData.reduce((sum, l) => sum + parseInt(l.count || 0), 0)
    const conversionRate = totalLeads > 0 ? ((parseInt(wonLeads?.count || 0) / totalLeads) * 100) : 0

    return {
      mrr: { value: totalRevenue, trend: 0, label: 'Chiffre d\'affaires' },
      pipeline: { value: pipelineValue, trend: 0, label: 'Pipeline commercial' },
      projects: { value: activeProjects, trend: 0, label: 'Projets actifs', isCurrency: false },
      conversion: { value: conversionRate, trend: 0, label: 'Taux conversion', isPercent: true }
    }
  } catch {
    return {
      mrr: { value: 0, trend: 0, label: 'Chiffre d\'affaires' },
      pipeline: { value: 0, trend: 0, label: 'Pipeline commercial' },
      projects: { value: 0, trend: 0, label: 'Projets actifs', isCurrency: false },
      conversion: { value: 0, trend: 0, label: 'Taux conversion', isPercent: true }
    }
  }
}

const TrendIcon = ({ value }) => {
  if (value > 0) return <TrendingUp size={14} className="text-green-600" />
  if (value < 0) return <TrendingDown size={14} className="text-red-600" />
  return <Minus size={14} className="text-gray-400" />
}

const MiniSparkline = ({ color = '#2563eb' }) => {
  // Simple sparkline with static data (will use real history when available)
  const data = Array.from({ length: 7 }, (_, i) => ({
    value: 50 + Math.sin(i * 0.8) * 20 + Math.random() * 10
  }))

  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data}>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.1}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const KPIWidget = ({ selectedCompany }) => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis', selectedCompany],
    queryFn: () => fetchKPIs(selectedCompany),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5 // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-4 h-24 glass-skeleton" />
        ))}
      </div>
    )
  }

  const items = kpis ? Object.entries(kpis) : []
  const colors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b']

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(([key, kpi], idx) => (
        <div key={key} className="glass-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
            <TrendIcon value={kpi.trend} />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {kpi.isPercent
              ? `${kpi.value.toFixed(1)}%`
              : kpi.isCurrency === false
                ? kpi.value
                : formatCHF(kpi.value)}
          </p>
          <div className="mt-2">
            <MiniSparkline color={colors[idx]} />
          </div>
          {kpi.trend !== 0 && (
            <p className={`text-xs mt-1 ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.trend > 0 ? '+' : ''}{kpi.trend.toFixed(1)}% vs mois dernier
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default KPIWidget
