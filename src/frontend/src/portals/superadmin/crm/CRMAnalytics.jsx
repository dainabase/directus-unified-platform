/**
 * CRMAnalytics — S-05-07
 * CRM Dashboard Analytics: funnel, pie, line, bar charts from leads data.
 */

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  FunnelChart, Funnel, LabelList,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
  TrendingUp, Users, Target, DollarSign, BarChart3,
  Loader2, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import directus from '../../../services/api/directus'
import { formatCHF } from '../../../services/api/crm'
import { LEAD_STATUSES } from '../../../hooks/useLeads'

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#22c55e', '#ef4444']
const FUNNEL_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#eab308', '#f97316', '#22c55e', '#ef4444']

const CRMAnalytics = ({ selectedCompany }) => {
  const company = selectedCompany === 'all' ? null : selectedCompany

  // Fetch all leads for analytics
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['crm-analytics-leads', company],
    queryFn: async () => {
      const filter = {}
      if (company) filter.company = { _eq: company }
      const { data } = await directus.get('/items/leads', {
        params: {
          fields: ['*'],
          filter: Object.keys(filter).length ? filter : undefined,
          sort: ['-date_created'],
          limit: -1
        }
      }).catch(() => ({ data: { data: [] } }))
      return data?.data || []
    },
    staleTime: 60_000
  })

  // ── KPIs ──
  const kpis = useMemo(() => {
    const total = leads.length
    const won = leads.filter(l => l.status === 'won')
    const lost = leads.filter(l => l.status === 'lost')
    const active = leads.filter(l => !['won', 'lost'].includes(l.status))
    const totalValue = leads.reduce((s, l) => s + (l.estimated_value || l.deal_value || 0), 0)
    const wonValue = won.reduce((s, l) => s + (l.estimated_value || l.deal_value || 0), 0)
    const avgDealSize = won.length > 0 ? wonValue / won.length : 0
    const conversionRate = total > 0 ? ((won.length / total) * 100).toFixed(1) : 0
    const avgScore = total > 0 ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / total) : 0
    return { total, wonCount: won.length, lostCount: lost.length, activeCount: active.length, totalValue, wonValue, avgDealSize, conversionRate, avgScore }
  }, [leads])

  // ── Funnel data ──
  const funnelData = useMemo(() => {
    return LEAD_STATUSES.map((s, i) => ({
      name: s.label,
      value: leads.filter(l => l.status === s.value).length,
      fill: FUNNEL_COLORS[i]
    })).filter(d => d.value > 0)
  }, [leads])

  // ── Status distribution (Pie) ──
  const statusPieData = useMemo(() => {
    return LEAD_STATUSES.map(s => ({
      name: s.label,
      value: leads.filter(l => l.status === s.value).length
    })).filter(d => d.value > 0)
  }, [leads])

  // ── Monthly trend (Line) — last 6 months ──
  const monthlyTrend = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      const monthLeads = leads.filter(l => {
        if (!l.date_created) return false
        const d = new Date(l.date_created)
        return isWithinInterval(d, { start, end })
      })
      const won = monthLeads.filter(l => l.status === 'won').length
      const lost = monthLeads.filter(l => l.status === 'lost').length
      months.push({
        month: format(date, 'MMM yy', { locale: fr }),
        total: monthLeads.length,
        won,
        lost
      })
    }
    return months
  }, [leads])

  // ── Source distribution (Bar) ──
  const sourceData = useMemo(() => {
    const counts = {}
    leads.forEach(l => {
      const src = l.source || l.notes?.split(' ')[0] || 'Autre'
      counts[src] = (counts[src] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [leads])

  // ── Priority distribution ──
  const priorityData = useMemo(() => {
    const map = { low: 'Basse', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' }
    const counts = {}
    leads.forEach(l => {
      const p = l.priority || 'medium'
      counts[p] = (counts[p] || 0) + 1
    })
    return Object.entries(counts).map(([k, value]) => ({
      name: map[k] || k,
      value
    }))
  }, [leads])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-blue-500" />
          CRM Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Analyse du pipeline commercial et performance des leads</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total leads', value: kpis.total, icon: Users, color: 'text-blue-500', sub: `${kpis.activeCount} actifs` },
          { label: 'Conversion', value: `${kpis.conversionRate}%`, icon: Target, color: 'text-green-500', sub: `${kpis.wonCount} gagnes` },
          { label: 'CA gagnes', value: formatCHF(kpis.wonValue), icon: DollarSign, color: 'text-emerald-500', sub: `Moy: ${formatCHF(kpis.avgDealSize)}` },
          { label: 'Pipeline total', value: formatCHF(kpis.totalValue), icon: TrendingUp, color: 'text-indigo-500', sub: `${kpis.total} leads` },
          { label: 'Score moyen', value: `${kpis.avgScore}/100`, icon: Target, color: 'text-amber-500', sub: `${kpis.lostCount} perdus` }
        ].map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={i} className="ds-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={kpi.color} />
                <span className="text-xs text-gray-500">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Row 1: Funnel + Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Funnel de conversion</h3>
          {funnelData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucun lead</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#374151" stroke="none" dataKey="name" fontSize={12} />
                  <LabelList position="center" fill="#fff" stroke="none" dataKey="value" fontSize={14} fontWeight="bold" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Repartition par statut</h3>
          {statusPieData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune donnee</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {statusPieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2: Monthly trend + Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Tendance mensuelle (6 mois)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="won" stroke="#22c55e" strokeWidth={2} name="Gagnes" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} name="Perdus" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Source distribution */}
        <div className="ds-card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Leads par source</h3>
          {sourceData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune donnee</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Priority distribution */}
      <div className="ds-card p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Repartition par priorite</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {priorityData.map((p, i) => {
            const colors = ['bg-gray-100 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700']
            return (
              <div key={p.name} className="text-center p-4 rounded-lg border border-gray-100">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[i % colors.length]}`}>
                  {p.name}
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-2">{p.value}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {leads.length > 0 ? `${((p.value / leads.length) * 100).toFixed(0)}%` : '0%'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CRMAnalytics
