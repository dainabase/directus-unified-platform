/**
 * ClientDashboard — S-03-02
 * Dashboard portail client connecte a Directus via TanStack Query.
 * Affiche: stats, projets actifs, factures recentes, devis en attente.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Receipt, FileText, Clock,
  ArrowRight, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

const GREEN = '#059669'

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Fetches aggregated stats for the logged-in client.
 * Uses the client's company filter from their auth context.
 */
async function fetchClientStats(userId) {
  const [projectsRes, invoicesRes, quotesRes, paymentsRes] = await Promise.all([
    api.get('/items/projects', {
      params: { filter: { client_id: { _eq: userId } }, aggregate: { count: '*' }, 'filter[status][_neq]': 'archived' }
    }).catch(() => ({ data: { data: [{ count: 0 }] } })),
    api.get('/items/client_invoices', {
      params: { filter: { client_id: { _eq: userId }, status: { _eq: 'pending' } }, aggregate: { count: '*', sum: { total_ttc: 'total' } } }
    }).catch(() => ({ data: { data: [{ count: 0, sum: { total_ttc: 0 } }] } })),
    api.get('/items/quotes', {
      params: { filter: { client_id: { _eq: userId }, status: { _in: ['sent', 'viewed'] } }, aggregate: { count: '*' } }
    }).catch(() => ({ data: { data: [{ count: 0 }] } })),
    api.get('/items/payments', {
      params: { filter: { client_id: { _eq: userId } }, aggregate: { count: '*', sum: { amount: 'total' } } }
    }).catch(() => ({ data: { data: [{ count: 0, sum: { amount: 0 } }] } }))
  ])

  const pData = projectsRes.data?.data?.[0] || {}
  const iData = invoicesRes.data?.data?.[0] || {}
  const qData = quotesRes.data?.data?.[0] || {}

  return {
    activeProjects: Number(pData.count) || 0,
    pendingInvoices: Number(iData.count) || 0,
    pendingAmount: Number(iData.sum?.total_ttc) || 0,
    pendingQuotes: Number(qData.count) || 0
  }
}

async function fetchClientProjects(userId) {
  const { data } = await api.get('/items/projects', {
    params: {
      filter: { client_id: { _eq: userId }, status: { _neq: 'archived' } },
      fields: ['id', 'name', 'status', 'progress', 'deadline', 'owner_company'],
      sort: ['-date_updated'],
      limit: 5
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchClientInvoices(userId) {
  const { data } = await api.get('/items/client_invoices', {
    params: {
      filter: { client_id: { _eq: userId } },
      fields: ['id', 'invoice_number', 'status', 'total_ttc', 'due_date', 'date_created'],
      sort: ['-date_created'],
      limit: 5
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchClientQuotes(userId) {
  const { data } = await api.get('/items/quotes', {
    params: {
      filter: { client_id: { _eq: userId }, status: { _in: ['sent', 'viewed', 'signed'] } },
      fields: ['id', 'reference', 'title', 'status', 'total_ttc', 'date_created', 'valid_until'],
      sort: ['-date_created'],
      limit: 5
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// --- Stat Card ---
const StatCard = ({ icon: Icon, label, value, subtext, color = GREEN }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
    </div>
  </div>
)

// --- Status badge ---
const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700',
  overdue: 'bg-red-50 text-red-700',
  sent: 'bg-blue-50 text-blue-700',
  viewed: 'bg-purple-50 text-purple-700',
  signed: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-gray-100 text-gray-500'
}

const STATUS_LABELS = {
  active: 'Actif', in_progress: 'En cours', completed: 'Termine', pending: 'En attente',
  paid: 'Paye', overdue: 'En retard', sent: 'Envoye', viewed: 'Consulte',
  signed: 'Signe', draft: 'Brouillon', planning: 'Planification'
}

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
    {STATUS_LABELS[status] || status}
  </span>
)

// --- Main Dashboard ---
const ClientDashboard = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const userId = user?.id

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['client-stats', userId],
    queryFn: () => fetchClientStats(userId),
    enabled: !!userId,
    staleTime: 30_000
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['client-projects', userId],
    queryFn: () => fetchClientProjects(userId),
    enabled: !!userId,
    staleTime: 30_000
  })

  const { data: invoices = [] } = useQuery({
    queryKey: ['client-invoices-recent', userId],
    queryFn: () => fetchClientInvoices(userId),
    enabled: !!userId,
    staleTime: 30_000
  })

  const { data: quotes = [] } = useQuery({
    queryKey: ['client-quotes-recent', userId],
    queryFn: () => fetchClientQuotes(userId),
    enabled: !!userId,
    staleTime: 30_000
  })

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Client'
    : 'Client'

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: GREEN }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${GREEN}, #047857)` }}
      >
        <h2 className="text-xl font-bold">Bienvenue, {displayName}</h2>
        <p className="text-emerald-100 mt-1">Suivez l'avancement de vos projets et gerez vos documents.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Projets actifs"
          value={stats?.activeProjects || 0}
        />
        <StatCard
          icon={Receipt}
          label="Factures en attente"
          value={formatCHF(stats?.pendingAmount || 0)}
          subtext={`${stats?.pendingInvoices || 0} facture(s)`}
          color="#f59e0b"
        />
        <StatCard
          icon={FileText}
          label="Devis a signer"
          value={stats?.pendingQuotes || 0}
          color="#8b5cf6"
        />
        <StatCard
          icon={Clock}
          label="Prochain echeance"
          value={projects[0]?.deadline ? formatDate(projects[0].deadline) : '—'}
          subtext={projects[0]?.name || ''}
          color="#ef4444"
        />
      </div>

      {/* Alerts bar */}
      {(stats?.pendingQuotes > 0 || stats?.pendingInvoices > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1 text-sm text-amber-800">
            {stats.pendingQuotes > 0 && (
              <span>Vous avez <strong>{stats.pendingQuotes} devis</strong> en attente de signature. </span>
            )}
            {stats.pendingInvoices > 0 && (
              <span><strong>{stats.pendingInvoices} facture(s)</strong> en attente de paiement ({formatCHF(stats.pendingAmount)}). </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects list */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mes projets</h3>
              <button
                onClick={() => navigate('/client/projects')}
                className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: GREEN }}
              >
                Voir tout <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {projects.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  Aucun projet actif
                </div>
              ) : (
                projects.map((p) => (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        Echeance: {formatDate(p.deadline)}
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">{p.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${p.progress || 0}%`, backgroundColor: GREEN }}
                        />
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent quotes */}
        <div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Devis recents</h3>
              <button
                onClick={() => navigate('/client/quotes')}
                className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: GREEN }}
              >
                Voir tout <ArrowRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {quotes.length === 0 ? (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  Aucun devis
                </div>
              ) : (
                quotes.map((q) => (
                  <div key={q.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{q.title || q.reference}</p>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{formatDate(q.date_created)}</span>
                      <span className="text-sm font-semibold text-gray-700">{formatCHF(q.total_ttc)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Dernieres factures</h3>
          <button
            onClick={() => navigate('/client/invoices')}
            className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: GREEN }}
          >
            Voir tout <ArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Echeance</th>
                <th className="px-5 py-3 text-right">Montant</th>
                <th className="px-5 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    Aucune facture
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(inv.date_created)}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{formatCHF(inv.total_ttc)}</td>
                    <td className="px-5 py-3 text-center"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
