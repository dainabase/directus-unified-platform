/**
 * KPIWidget — S-01-05
 * Real-time KPI sidebar with Recharts sparklines.
 * CHF formatting, fr-CH locale.
 *
 * Data strategy:
 *   1. Primary — fetch from `dashboard_kpis` collection (pre-computed KPIs)
 *   2. Fallback — compute KPIs on the fly from invoices, projects, leads
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

/**
 * Try to load KPIs from the `dashboard_kpis` collection.
 * Returns a normalised KPI map or null if the collection is empty / unavailable.
 */
const fetchDashboardKPIs = async (company) => {
  const kpisRes = await api.get('/items/dashboard_kpis', {
    params: {
      filter: company && company !== 'all' ? { owner_company: { _eq: company } } : {},
      sort: ['sort_order'],
      limit: 8
    }
  }).catch(() => null)

  if (kpisRes?.data?.data?.length > 0) {
    const items = kpisRes.data.data
    const result = {}
    items.forEach(item => {
      let sparklineData = null
      if (item.history) {
        try {
          const parsed = typeof item.history === 'string' ? JSON.parse(item.history) : item.history
          // Normalise to array of { value } objects for Recharts
          sparklineData = Array.isArray(parsed)
            ? parsed.map(v => (typeof v === 'object' ? v : { value: v }))
            : null
        } catch {
          sparklineData = null
        }
      }

      result[item.key || item.id] = {
        value: parseFloat(item.value || 0),
        trend: parseFloat(item.trend || 0),
        label: item.label || item.name,
        isCurrency: item.is_currency !== false,
        isPercent: item.is_percent === true,
        sparklineData
      }
    })
    return result
  }

  return null
}

/**
 * Compute KPIs on the fly from invoices, projects and leads collections.
 * Used as fallback when `dashboard_kpis` is empty or unavailable.
 */
const fetchComputedKPIs = async (company) => {
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

  // Calculate revenue from paid invoices
  const paidInvoices = invoiceData.find(i => i.status === 'paid')
  const totalRevenue = parseFloat(paidInvoices?.sum?.amount || 0)

  // Pipeline value from open leads
  const pipelineLeads = leadData.filter(l => !['won', 'lost'].includes(l.status))
  const pipelineValue = pipelineLeads.reduce((sum, l) => sum + parseFloat(l.sum?.estimated_value || 0), 0)

  // Active projects
  const activeProjects = projectData
    .filter(p => ['active', 'in_progress', 'in-progress'].includes(p.status))
    .reduce((sum, p) => sum + parseInt(p.count || 0), 0)

  // Conversion rate
  const wonLeads = leadData.find(l => l.status === 'won')
  const totalLeads = leadData.reduce((sum, l) => sum + parseInt(l.count || 0), 0)
  const conversionRate = totalLeads > 0 ? ((parseInt(wonLeads?.count || 0) / totalLeads) * 100) : 0

  return {
    mrr: { value: totalRevenue, trend: 0, label: 'Chiffre d\'affaires', sparklineData: null },
    pipeline: { value: pipelineValue, trend: 0, label: 'Pipeline commercial', sparklineData: null },
    projects: { value: activeProjects, trend: 0, label: 'Projets actifs', isCurrency: false, sparklineData: null },
    conversion: { value: conversionRate, trend: 0, label: 'Taux conversion', isPercent: true, sparklineData: null }
  }
}

/**
 * Main fetch function.
 * Tries dashboard_kpis first, falls back to computed KPIs.
 */
const fetchKPIs = async (company) => {
  try {
    // 1. Primary source — pre-computed KPIs from dashboard_kpis collection
    const dashboardKPIs = await fetchDashboardKPIs(company)
    if (dashboardKPIs) return dashboardKPIs

    // 2. Fallback — compute from invoices, projects, leads
    return await fetchComputedKPIs(company)
  } catch {
    return {
      mrr: { value: 0, trend: 0, label: 'Chiffre d\'affaires', sparklineData: null },
      pipeline: { value: 0, trend: 0, label: 'Pipeline commercial', sparklineData: null },
      projects: { value: 0, trend: 0, label: 'Projets actifs', isCurrency: false, sparklineData: null },
      conversion: { value: 0, trend: 0, label: 'Taux conversion', isPercent: true, sparklineData: null }
    }
  }
}

const TrendIcon = ({ value }) => {
  if (value > 0) return <TrendingUp size={14} className="text-green-600" />
  if (value < 0) return <TrendingDown size={14} className="text-red-600" />
  return <Minus size={14} className="text-gray-400" />
}

const MiniSparkline = ({ color = '#2563eb', data: externalData }) => {
  // Use real sparkline data when provided, otherwise generate a placeholder curve
  const data = externalData || Array.from({ length: 7 }, (_, i) => ({
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
  const colors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

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
            <MiniSparkline color={colors[idx % colors.length]} data={kpi.sparklineData} />
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
