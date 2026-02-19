/**
 * MarketingDashboard — S-05-06
 * Marketing module connected to Directus campaigns + whatsapp messages.
 * Overview KPIs computed from real campaign data.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Megaphone, Calendar, Mail, BarChart3, Users, Target,
  TrendingUp, Eye, MousePointer, RefreshCw, Plus,
  MessageSquare, Loader2, Search, X, Edit, Trash2
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  fetchCampaigns, createCampaign, updateCampaign, deleteCampaign,
  fetchWhatsappMessages, formatCHF
} from '../../../services/api/crm'
import ContentCalendar from './components/ContentCalendar'
import MarketingAnalytics from './components/MarketingAnalytics'
import MarketingEvents from './components/MarketingEvents'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const STATUS_CFG = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  scheduled: { label: 'Planifiee', color: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  paused: { label: 'En pause', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Terminee', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Annulee', color: 'bg-red-100 text-red-700' }
}

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'campaigns', label: 'Campagnes', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'calendar', label: 'Calendrier', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'events', label: 'Evenements', icon: Users }
]

const MarketingDashboard = ({ selectedCompany, view }) => {
  const queryClient = useQueryClient()
  const getInitialTab = () => {
    if (view === 'campaigns') return 'campaigns'
    if (view === 'whatsapp') return 'whatsapp'
    return 'overview'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)

  const company = selectedCompany === 'all' ? null : selectedCompany

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', company, statusFilter, searchQuery],
    queryFn: () => fetchCampaigns({
      company,
      status: statusFilter !== 'all' ? statusFilter : null,
      search: searchQuery || null
    }),
    staleTime: 30_000
  })

  // Fetch whatsapp messages
  const { data: whatsappMessages = [], isLoading: loadingWA } = useQuery({
    queryKey: ['whatsapp-messages'],
    queryFn: () => fetchWhatsappMessages({ limit: 50 }),
    staleTime: 60_000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campagne creee')
      setShowForm(false)
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`)
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campagne mise a jour')
      setShowForm(false)
      setEditingCampaign(null)
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`)
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campagne supprimee')
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`)
  })

  // KPIs from real data
  const kpis = useMemo(() => {
    const total = campaigns.length
    const active = campaigns.filter(c => c.status === 'active').length
    const completed = campaigns.filter(c => c.status === 'completed').length
    const totalSent = campaigns.reduce((s, c) => s + (c.emails_sent || 0), 0)
    const totalOpens = campaigns.reduce((s, c) => s + (c.opens || 0), 0)
    const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0)
    const totalConversions = campaigns.reduce((s, c) => s + (c.conversions || 0), 0)
    const totalBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0)
    const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : 0
    const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : 0
    return { total, active, completed, totalSent, totalOpens, totalClicks, totalConversions, totalBudget, openRate, clickRate }
  }, [campaigns])

  // Chart data: campaigns by status
  const statusChartData = useMemo(() => {
    const counts = {}
    campaigns.forEach(c => {
      const status = c.status || 'draft'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({
      name: STATUS_CFG[name]?.label || name,
      value
    }))
  }, [campaigns])

  // Chart data: campaigns by type/channel
  const channelChartData = useMemo(() => {
    const counts = {}
    campaigns.forEach(c => {
      const ch = c.channel || c.type || 'email'
      counts[ch] = (counts[ch] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [campaigns])

  const handleSave = (formData) => {
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data: formData })
    } else {
      createMutation.mutate({
        ...formData,
        owner_company: company || undefined
      })
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer cette campagne ?')) return
    deleteMutation.mutate(id)
  }

  // ── Overview Tab ──
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Campagnes', value: kpis.total, icon: Megaphone, color: 'text-blue-500' },
          { label: 'Actives', value: kpis.active, icon: Target, color: 'text-green-500' },
          { label: 'Emails envoyes', value: kpis.totalSent.toLocaleString(), icon: Mail, color: 'text-indigo-500' },
          { label: 'Taux ouverture', value: `${kpis.openRate}%`, icon: Eye, color: 'text-cyan-500' },
          { label: 'Taux clic', value: `${kpis.clickRate}%`, icon: MousePointer, color: 'text-amber-500' },
          { label: 'Budget total', value: formatCHF(kpis.totalBudget), icon: TrendingUp, color: 'text-emerald-500' }
        ].map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={kpi.color} />
                <span className="text-xs text-gray-500">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status distribution */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Repartition par statut</h3>
          {statusChartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune campagne</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Channel distribution */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Repartition par canal</h3>
          {channelChartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucune donnee</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={channelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Campagnes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Campagnes recentes</h3>
          <button onClick={() => setActiveTab('campaigns')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Voir toutes
          </button>
        </div>
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucune campagne</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campaigns.slice(0, 5).map(c => {
              const cfg = STATUS_CFG[c.status] || STATUS_CFG.draft
              return (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name || c.title || `Campagne #${c.id?.slice(0, 8)}`}</p>
                      <p className="text-xs text-gray-400">
                        {c.date_created ? format(new Date(c.date_created), 'dd MMM yyyy', { locale: fr }) : '—'}
                        {c.channel ? ` · ${c.channel}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {c.emails_sent ? `${c.emails_sent} envoyes` : ''}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // ── Campaigns Tab ──
  const renderCampaigns = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une campagne..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button
          onClick={() => { setEditingCampaign(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={16} /> Nouvelle campagne
        </button>
      </div>

      {/* Campaign list */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        {campaigns.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Aucune campagne trouvee</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campaigns.map(c => {
              const cfg = STATUS_CFG[c.status] || STATUS_CFG.draft
              return (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{c.name || c.title || `Campagne #${c.id?.slice(0, 8)}`}</p>
                      <p className="text-xs text-gray-400">
                        {c.date_created ? format(new Date(c.date_created), 'dd MMM yyyy', { locale: fr }) : '—'}
                        {c.channel ? ` · ${c.channel}` : ''}
                        {c.budget ? ` · Budget: ${formatCHF(c.budget)}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
                      {c.emails_sent > 0 && <span>{c.emails_sent} envoyes</span>}
                      {c.opens > 0 && <span>{c.opens} ouvertures</span>}
                      {c.clicks > 0 && <span>{c.clicks} clics</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingCampaign(c); setShowForm(true) }}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  // ── WhatsApp Tab ──
  const renderWhatsApp = () => (
    <div className="space-y-4">
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <MessageSquare size={16} className="text-green-500" />
          <h3 className="font-semibold text-gray-900">Messages WhatsApp</h3>
          <span className="text-xs text-gray-400 ml-auto">{whatsappMessages.length} messages</span>
        </div>
        {loadingWA ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          </div>
        ) : whatsappMessages.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Aucun message WhatsApp</p>
            <p className="text-xs mt-1">Les messages apparaitront ici une fois la collection peuplee.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {whatsappMessages.map(m => (
              <div key={m.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{m.contact_name || m.phone || 'Inconnu'}</p>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${m.direction === 'outgoing' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {m.direction === 'outgoing' ? 'Sortant' : 'Entrant'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{m.message || m.body || '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {m.date_created ? format(new Date(m.date_created), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone size={22} className="text-blue-500" />
            Marketing
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Campagnes, WhatsApp et analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['campaigns'] })}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'campaigns' && renderCampaigns()}
          {activeTab === 'whatsapp' && renderWhatsApp()}
          {activeTab === 'calendar' && <ContentCalendar selectedCompany={selectedCompany} />}
          {activeTab === 'analytics' && <MarketingAnalytics selectedCompany={selectedCompany} />}
          {activeTab === 'events' && <MarketingEvents selectedCompany={selectedCompany} />}
        </>
      )}

      {/* Campaign Form Modal */}
      {showForm && (
        <CampaignFormModal
          campaign={editingCampaign}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingCampaign(null) }}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  )
}

// ── Campaign Form Modal ──
const CampaignFormModal = ({ campaign, onSave, onClose, isSaving }) => {
  const [form, setForm] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    status: campaign?.status || 'draft',
    channel: campaign?.channel || 'email',
    budget: campaign?.budget || '',
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Nom requis')
    onSave({
      ...form,
      budget: form.budget ? Number(form.budget) : null
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {campaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Newsletter Fevrier 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.entries(STATUS_CFG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
              <select
                value={form.channel}
                onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="social">Social Media</option>
                <option value="ads">Ads</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget (CHF)</label>
              <input
                type="number"
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Debut</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {campaign ? 'Mettre a jour' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MarketingDashboard
