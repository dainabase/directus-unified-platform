/**
 * RevendeurDashboard — Portail Revendeur
 * Dashboard revendeur connecte a Directus.
 * KPIs (leads actifs, pipeline, deals signes, commissions mock),
 * Top 5 deals, commissions recentes (mock), pipeline chart (Recharts).
 *
 * Auth: useAuthStore (user.id = directus_users uuid)
 * Leads filtres par assigned_to = user.id
 * Quotes: company-wide (pas de reseller_id)
 * Commissions: MOCK (collection inexistante)
 */

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Loader2, TrendingUp, Target, Award, Wallet,
  BarChart3
} from 'lucide-react'
import { format, startOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

// ── Format CHF ──
const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0
  }).format(v || 0)

// ── Inactive lead statuses (excluded from "active") ──
const INACTIVE_STATUSES = ['won', 'lost', 'inactive']

// ── Status badge config for quotes ──
const quoteStatusConfig = {
  active:   { label: 'Actif',   cls: 'ds-badge ds-badge-info' },
  draft:    { label: 'Brouillon', cls: 'ds-badge ds-badge-default' },
  sent:     { label: 'Envoye',  cls: 'ds-badge ds-badge-info' },
  viewed:   { label: 'Vu',      cls: 'ds-badge ds-badge-warning' },
  signed:   { label: 'Signe',   cls: 'ds-badge ds-badge-success' },
  accepted: { label: 'Accepte', cls: 'ds-badge ds-badge-success' },
  rejected: { label: 'Refuse',  cls: 'ds-badge ds-badge-danger' },
  expired:  { label: 'Expire',  cls: 'ds-badge ds-badge-default' }
}

// ── KPI Card ──
const KPICard = ({ icon: Icon, label, value, subtitle }) => (
  <div className="ds-card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--accent-light)' }}
      >
        <Icon size={16} style={{ color: 'var(--accent)' }} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
)

// ── Custom Recharts tooltip ──
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="ds-card p-3" style={{ boxShadow: 'var(--shadow-md)' }}>
      <p className="text-xs font-medium text-gray-900 mb-1">{label}</p>
      <p className="text-sm font-bold" style={{ color: '#0071E3' }}>
        {payload[0].value} lead{payload[0].value > 1 ? 's' : ''}
      </p>
    </div>
  )
}

const RevendeurDashboard = () => {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id

  // ── Fetch leads assigned to this reseller ──
  const { data: leads = [], isLoading: loadingLeads } = useQuery({
    queryKey: ['revendeur-leads', userId],
    queryFn: async () => {
      const { data } = await api.get('/items/leads', {
        params: {
          filter: { assigned_to: { _eq: userId } },
          fields: ['id', 'first_name', 'last_name', 'email', 'company_name', 'status', 'estimated_value', 'priority', 'date_created', 'date_updated'],
          sort: ['-date_created'],
          limit: -1
        }
      }).catch(() => ({ data: { data: [] } }))
      return data?.data || []
    },
    enabled: !!userId,
    refetchInterval: 60000
  })

  // ── Fetch quotes (company-wide, no reseller_id) ──
  const { data: quotes = [], isLoading: loadingQuotes } = useQuery({
    queryKey: ['revendeur-quotes'],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          fields: ['id', 'quote_number', 'name', 'status', 'company_id.name', 'subtotal', 'total', 'tax_rate', 'currency', 'created_at', 'sent_at', 'viewed_at', 'signed_at', 'valid_until'],
          sort: ['-created_at'],
          limit: -1
        }
      }).catch(() => ({ data: { data: [] } }))
      return data?.data || []
    },
    refetchInterval: 60000
  })

  const isLoading = loadingLeads || loadingQuotes

  // ── KPI computations ──
  const activeLeads = useMemo(
    () => leads.filter((l) => !INACTIVE_STATUSES.includes(l.status)),
    [leads]
  )

  const pipelineValue = useMemo(
    () => activeLeads.reduce((sum, l) => sum + (parseFloat(l.estimated_value) || 0), 0),
    [activeLeads]
  )

  const dealsSignedThisMonth = useMemo(() => {
    const monthStart = startOfMonth(new Date())
    return quotes.filter((q) => {
      if (!q.signed_at) return false
      return new Date(q.signed_at) >= monthStart
    })
  }, [quotes])

  // ── Top 5 deals (quotes sorted by total desc) ──
  const topDeals = useMemo(() => {
    const sorted = [...quotes].sort((a, b) => (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0))
    return sorted.slice(0, 5)
  }, [quotes])

  // ── Pipeline chart: leads created per month over last 6 months ──
  const chartData = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthKey = format(monthDate, 'yyyy-MM')
      const label = format(monthDate, 'MMM yy', { locale: fr })
      months.push({ monthKey, label, count: 0 })
    }

    leads.forEach((l) => {
      if (!l.date_created) return
      const key = l.date_created.slice(0, 7) // 'yyyy-MM'
      const bucket = months.find((m) => m.monthKey === key)
      if (bucket) bucket.count += 1
    })

    return months.map(({ label, count }) => ({ name: label, leads: count }))
  }, [leads])

  // ── TODO: commissions collection does not exist in Directus ──
  // ── Replace with real data when `commissions` collection is created ──
  const mockCommissions = useMemo(() => [
    { id: 1, label: 'Commission HYPERVISUAL Q4', amount: 4800, date: '2026-01-15', status: 'payee' },
    { id: 2, label: 'Commission LED Wall Migros', amount: 3200, date: '2026-02-01', status: 'en attente' },
    { id: 3, label: 'Commission Ecran COOP', amount: 4450, date: '2026-02-10', status: 'en attente' }
  ], [])

  // ── Display name ──
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    : 'Revendeur'

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {displayName.split(' ')[0]} — Espace revendeur
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d'ensemble de votre activite commerciale
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Target}
          label="Leads actifs"
          value={activeLeads.length}
          subtitle={`${leads.length} leads au total`}
        />
        <KPICard
          icon={TrendingUp}
          label="Pipeline CHF"
          value={formatCHF(pipelineValue)}
          subtitle={`${activeLeads.length} opportunite${activeLeads.length > 1 ? 's' : ''}`}
        />
        <KPICard
          icon={Award}
          label="Deals signes ce mois"
          value={dealsSignedThisMonth.length}
          subtitle={format(new Date(), 'MMMM yyyy', { locale: fr })}
        />
        {/* TODO: Replace mock commission value with real data when `commissions` collection exists in Directus */}
        <KPICard
          icon={Wallet}
          label="Commissions a recevoir"
          value={formatCHF(12450)}
          subtitle="Estimation en cours"
        />
      </div>

      {/* Two-column layout: Top 5 deals + Commissions recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 deals */}
        <div className="ds-card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Top 5 deals
            </h2>
            <span className="text-xs text-gray-400">{quotes.length} devis au total</span>
          </div>

          {topDeals.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Aucun devis disponible
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-50">
                    <th className="text-left px-4 py-2 font-medium">N. devis</th>
                    <th className="text-left px-4 py-2 font-medium">Entreprise</th>
                    <th className="text-right px-4 py-2 font-medium">Total CHF</th>
                    <th className="text-center px-4 py-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topDeals.map((q) => {
                    const cfg = quoteStatusConfig[q.status] || quoteStatusConfig.active
                    const companyName =
                      typeof q.company_id === 'object' && q.company_id?.name
                        ? q.company_id.name
                        : '—'
                    return (
                      <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {q.quote_number || `#${String(q.id).slice(0, 8)}`}
                        </td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[160px]">
                          {companyName}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {formatCHF(parseFloat(q.total) || 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cfg.cls}>{cfg.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions recentes — TODO: replace mock data with real Directus collection */}
        <div className="ds-card">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Commissions recentes
            </h2>
            {/* TODO: show total from real data */}
            <span className="text-xs text-gray-400">3 dernieres</span>
          </div>

          <div className="divide-y divide-gray-50">
            {/* TODO: Replace this mock data with useQuery fetching from `commissions` collection when it exists */}
            {mockCommissions.map((c) => {
              const isPaid = c.status === 'payee'
              return (
                <div
                  key={c.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={isPaid ? 'ds-badge ds-badge-success' : 'ds-badge ds-badge-warning'}>
                      {c.status}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.label}</p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(c.date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCHF(c.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pipeline chart — leads created per month (last 6 months) */}
      <div className="ds-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: '#0071E3' }} />
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Activite pipeline — 6 derniers mois
          </h2>
        </div>

        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%">
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6E6E73' }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#6E6E73' }}
                width={30}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 113, 227, 0.04)' }} />
              <Bar
                dataKey="leads"
                fill="#0071E3"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default RevendeurDashboard
