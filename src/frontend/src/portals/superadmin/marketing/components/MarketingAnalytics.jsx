// src/frontend/src/portals/superadmin/marketing/components/MarketingAnalytics.jsx
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3, Megaphone, MessageSquare, Target, TrendingUp
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import api from '../../../../lib/axios'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const STATUS_CFG = {
  draft:     { label: 'Brouillon',  bg: 'bg-gray-100',   text: 'text-gray-600' },
  scheduled: { label: 'Planifiee',  bg: 'bg-amber-100',  text: 'text-amber-700' },
  active:    { label: 'Active',     bg: 'bg-green-100',  text: 'text-green-700' },
  paused:    { label: 'En pause',   bg: 'bg-blue-100',   text: 'text-blue-700' },
  completed: { label: 'Terminee',   bg: 'bg-purple-100', text: 'text-purple-700' },
  cancelled: { label: 'Annulee',    bg: 'bg-red-100',    text: 'text-red-700' }
}

const MONTHS_FR = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'
]

// ── Skeleton ─────────────────────────────────────────────────────────────────
const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="glass-skeleton h-4 w-28 rounded mb-3" />
          <div className="glass-skeleton h-8 w-16 rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-5">
        <div className="glass-skeleton h-5 w-40 rounded mb-4" />
        <div className="glass-skeleton h-[250px] w-full rounded" />
      </div>
      <div className="glass-card p-5">
        <div className="glass-skeleton h-5 w-40 rounded mb-4" />
        <div className="glass-skeleton h-[250px] w-full rounded" />
      </div>
    </div>
    <div className="glass-card p-0 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
          <div className="glass-skeleton h-4 w-48 rounded" />
          <div className="glass-skeleton h-4 w-24 rounded" />
          <div className="glass-skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  </div>
)

// ── Component ────────────────────────────────────────────────────────────────
const MarketingAnalytics = ({ selectedCompany }) => {
  const company = selectedCompany === 'all' ? null : selectedCompany

  // ── Fetch campaigns ──
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['marketing-analytics-campaigns', company],
    queryFn: async () => {
      const filter = {}
      if (company) {
        filter.owner_company = { _eq: company }
      }
      const res = await api.get('/items/campaigns', {
        params: {
          filter,
          fields: ['*'],
          sort: ['-date_created'],
          limit: -1
        }
      })
      return res.data?.data || []
    },
    staleTime: 2 * 60 * 1000,
    retry: 2
  })

  // ── Fetch whatsapp messages ──
  const { data: whatsappMessages = [], isLoading: loadingWA } = useQuery({
    queryKey: ['marketing-analytics-whatsapp', company],
    queryFn: async () => {
      const filter = {}
      if (company) {
        filter.owner_company = { _eq: company }
      }
      const res = await api.get('/items/whatsapp_messages', {
        params: {
          filter,
          fields: ['*'],
          sort: ['-date_created'],
          limit: -1
        }
      })
      return res.data?.data || []
    },
    staleTime: 2 * 60 * 1000,
    retry: 2
  })

  const isLoading = loadingCampaigns || loadingWA

  // ── KPIs ──
  const kpis = useMemo(() => ({
    totalCampaigns: campaigns.length,
    totalWhatsapp: whatsappMessages.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length
  }), [campaigns, whatsappMessages])

  // ── Chart: campaigns by month ──
  const monthlyData = useMemo(() => {
    const buckets = {}
    campaigns.forEach(c => {
      if (!c.date_created) return
      const d = new Date(c.date_created)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
      if (!buckets[key]) buckets[key] = { key, label, count: 0 }
      buckets[key].count += 1
    })
    return Object.values(buckets).sort((a, b) => a.key.localeCompare(b.key))
  }, [campaigns])

  // ── Chart: campaigns by status ──
  const statusData = useMemo(() => {
    const counts = {}
    campaigns.forEach(c => {
      const s = c.status || 'draft'
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: STATUS_CFG[name]?.label || name,
      value
    }))
  }, [campaigns])

  // ── Detect campaign table columns dynamically ──
  const campaignColumns = useMemo(() => {
    if (campaigns.length === 0) return []
    const priority = ['name', 'title', 'status', 'channel', 'type', 'budget', 'emails_sent', 'opens', 'clicks', 'conversions', 'start_date', 'end_date', 'date_created']
    const available = Object.keys(campaigns[0])
    const skip = new Set(['id', 'owner_company', 'user_created', 'user_updated', 'date_updated', 'sort'])
    const ordered = []
    priority.forEach(k => { if (available.includes(k) && !skip.has(k)) ordered.push(k) })
    available.forEach(k => { if (!skip.has(k) && !ordered.includes(k)) ordered.push(k) })
    return ordered.slice(0, 10) // limit visible columns
  }, [campaigns])

  const formatCell = (value) => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non'
    if (typeof value === 'number') return value.toLocaleString('fr-CH')
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return new Date(value).toLocaleDateString('fr-CH')
    }
    return String(value)
  }

  const columnLabel = (key) => {
    const labels = {
      name: 'Nom', title: 'Titre', status: 'Statut', channel: 'Canal',
      type: 'Type', budget: 'Budget', emails_sent: 'Emails envoyes',
      opens: 'Ouvertures', clicks: 'Clics', conversions: 'Conversions',
      start_date: 'Debut', end_date: 'Fin', date_created: 'Cree le',
      description: 'Description'
    }
    return labels[key] || key.replace(/_/g, ' ')
  }

  // ── Loading ──
  if (isLoading && campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Analytics Marketing</h2>
        </div>
        <AnalyticsSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Analytics Marketing
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Statistiques des campagnes et messages WhatsApp
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">Total campagnes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.totalCampaigns}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Messages WhatsApp</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.totalWhatsapp}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-500">Campagnes actives</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.activeCampaigns}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart: campaigns by month */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Campagnes par mois</h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Aucune donnee disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Campagnes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart: campaigns by status */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Repartition par statut</h3>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Aucune campagne
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
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

      {/* WhatsApp summary */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-green-500" />
          <h3 className="text-sm font-semibold text-gray-900">Resume WhatsApp</h3>
        </div>
        <p className="text-sm text-gray-600">
          {whatsappMessages.length === 0
            ? 'Aucun message WhatsApp. Les messages apparaitront une fois la collection whatsapp_messages peuplee.'
            : `${whatsappMessages.length} message(s) au total dans la collection whatsapp_messages.`}
        </p>
      </div>

      {/* Recent campaigns table */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Campagnes recentes</h3>
        </div>
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Megaphone size={48} className="mb-3 opacity-40" />
            <p className="text-lg font-medium text-gray-500">Aucune campagne trouvee</p>
            <p className="text-sm mt-1">
              Ajoutez des campagnes dans Directus pour les voir ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {campaignColumns.map(col => (
                    <th key={col} className="px-5 py-3 whitespace-nowrap">{columnLabel(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.slice(0, 20).map(campaign => (
                  <tr key={campaign.id} className="hover:bg-gray-50/60 transition-colors">
                    {campaignColumns.map(col => (
                      <td key={col} className="px-5 py-3 whitespace-nowrap text-gray-700">
                        {col === 'status' ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            (STATUS_CFG[campaign.status] || STATUS_CFG.draft).bg
                          } ${(STATUS_CFG[campaign.status] || STATUS_CFG.draft).text}`}>
                            {(STATUS_CFG[campaign.status] || STATUS_CFG.draft).label}
                          </span>
                        ) : (
                          formatCell(campaign[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketingAnalytics
