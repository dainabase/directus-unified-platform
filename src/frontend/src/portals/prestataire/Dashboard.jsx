/**
 * PrestataireDashboard — S-02-03
 * Dashboard prestataire avec données réelles Directus.
 * Collections : projects, proposals, payments, client_invoices
 *
 * NOTE: Pas de champ prestataire_id confirmé sur projects.
 * Pour l'instant, affiche TOUTES les missions sans filtre prestataire.
 * À implémenter: relation projects ↔ prestataires (loggé dans PROGRESS.md).
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, TrendingUp, FileText, AlertCircle,
  Calendar, ChevronRight, Clock, Loader2
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import { format, isWithinInterval, addDays, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

// ── Fetch fonctions ──

const fetchStats = async () => {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now).toISOString()
    const monthEnd = endOfMonth(now).toISOString()

    const [projectsRes, proposalsRes, invoicesRes, paymentsRes] = await Promise.all([
      api.get('/items/projects', {
        params: {
          filter: { status: { _in: ['active', 'in_progress', 'in-progress'] } },
          aggregate: { count: ['*'] }
        }
      }).catch(() => ({ data: { data: [{ count: 0 }] } })),
      api.get('/items/proposals', {
        params: {
          filter: { status: { _eq: 'pending' } },
          aggregate: { count: ['*'] }
        }
      }).catch(() => ({ data: { data: [{ count: 0 }] } })),
      api.get('/items/client_invoices', {
        params: {
          filter: { status: { _neq: 'paid' }, _and: [{ status: { _neq: 'cancelled' } }] },
          aggregate: { count: ['*'] }
        }
      }).catch(() => ({ data: { data: [{ count: 0 }] } })),
      api.get('/items/payments', {
        params: {
          filter: {
            status: { _eq: 'confirmed' },
            date: { _between: [monthStart, monthEnd] }
          },
          aggregate: { sum: ['amount'] }
        }
      }).catch(() => ({ data: { data: [{ sum: { amount: 0 } }] } }))
    ])

    const activeMissions = parseInt(projectsRes.data?.data?.[0]?.count || 0)
    const pendingQuotes = parseInt(proposalsRes.data?.data?.[0]?.count || 0)
    const unpaidInvoices = parseInt(invoicesRes.data?.data?.[0]?.count || 0)
    const monthRevenue = parseFloat(paymentsRes.data?.data?.[0]?.sum?.amount || 0)

    return { activeMissions, monthRevenue, pendingQuotes, unpaidInvoices }
  } catch {
    return { activeMissions: 0, monthRevenue: 0, pendingQuotes: 0, unpaidInvoices: 0 }
  }
}

const fetchActiveMissions = async () => {
  try {
    const { data } = await api.get('/items/projects', {
      params: {
        filter: { status: { _in: ['active', 'in_progress', 'in-progress'] } },
        fields: ['id', 'name', 'status', 'deadline', 'progress', 'owner_company_id.name'],
        sort: ['-date_updated'],
        limit: 5
      }
    })
    return data?.data || []
  } catch {
    return []
  }
}

const fetchTimeline = async () => {
  try {
    const now = new Date()
    const next30 = addDays(now, 30)

    // Deadlines projets
    const [projectsRes, paymentsRes] = await Promise.all([
      api.get('/items/projects', {
        params: {
          filter: {
            deadline: { _between: [now.toISOString(), next30.toISOString()] },
            status: { _in: ['active', 'in_progress', 'in-progress'] }
          },
          fields: ['id', 'name', 'deadline'],
          sort: ['deadline'],
          limit: 10
        }
      }).catch(() => ({ data: { data: [] } })),
      api.get('/items/payments', {
        params: {
          filter: {
            due_date: { _between: [now.toISOString(), next30.toISOString()] },
            status: { _neq: 'confirmed' }
          },
          fields: ['id', 'amount', 'due_date', 'description'],
          sort: ['due_date'],
          limit: 10
        }
      }).catch(() => ({ data: { data: [] } }))
    ])

    const events = []

    ;(projectsRes.data?.data || []).forEach(p => {
      events.push({
        id: `project-${p.id}`,
        type: 'deadline',
        label: p.name,
        date: p.deadline
      })
    })

    ;(paymentsRes.data?.data || []).forEach(p => {
      events.push({
        id: `payment-${p.id}`,
        type: 'payment',
        label: p.description || formatCHF(p.amount),
        date: p.due_date,
        amount: p.amount
      })
    })

    // Trier par date
    events.sort((a, b) => new Date(a.date) - new Date(b.date))
    return events.slice(0, 8)
  } catch {
    return []
  }
}

// ── Composants ──

const StatCard = ({ icon: Icon, label, value, subtitle, color = 'purple' }) => {
  const colorMap = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

const MissionsTable = ({ missions, isLoading }) => {
  const navigate = useNavigate()

  if (isLoading) {
    return <div className="glass-card p-6"><div className="h-48 glass-skeleton rounded-lg" /></div>
  }

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-600'
    }
    const labels = {
      active: 'Actif',
      in_progress: 'En cours',
      'in-progress': 'En cours',
      pending: 'En attente',
      completed: 'Terminé'
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Missions en cours
          </h3>
        </div>
        <button
          onClick={() => navigate('/prestataire/missions')}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
        >
          Voir toutes <ChevronRight size={14} />
        </button>
      </div>

      {missions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">Aucune mission active</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Projet</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Entreprise</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Deadline</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Avancement</th>
                <th className="text-left py-2 text-xs text-gray-500 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => (
                <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="py-3 text-gray-600">{m.owner_company_id?.name || '—'}</td>
                  <td className="py-3 text-gray-600">
                    {m.deadline ? format(new Date(m.deadline), 'dd MMM yyyy', { locale: fr }) : '—'}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${m.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{m.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="py-3">{getStatusBadge(m.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const TimelineWidget = ({ events, isLoading }) => {
  if (isLoading) {
    return <div className="glass-card p-6"><div className="h-64 glass-skeleton rounded-lg" /></div>
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Prochaines échéances
        </h3>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">Aucune échéance à 30 jours</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                event.type === 'deadline' ? 'bg-orange-400' : 'bg-green-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{event.label}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(event.date), 'EEEE dd MMMM', { locale: fr })}
                  {event.amount && ` · ${formatCHF(event.amount)}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                event.type === 'deadline'
                  ? 'bg-orange-50 text-orange-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {event.type === 'deadline' ? 'Projet' : 'Paiement'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dashboard principal ──

const PrestataireDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['prestataire-stats'],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5
  })

  const { data: missions, isLoading: missionsLoading } = useQuery({
    queryKey: ['prestataire-missions'],
    queryFn: fetchActiveMissions,
    staleTime: 1000 * 60 * 2
  })

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['prestataire-timeline'],
    queryFn: fetchTimeline,
    staleTime: 1000 * 60 * 5
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Prestataire</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats rapides */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="glass-card p-5 h-24 glass-skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Briefcase}
            label="Missions actives"
            value={stats?.activeMissions || 0}
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="CA ce mois"
            value={formatCHF(stats?.monthRevenue || 0)}
            color="green"
          />
          <StatCard
            icon={FileText}
            label="Devis en attente"
            value={stats?.pendingQuotes || 0}
            color="blue"
          />
          <StatCard
            icon={AlertCircle}
            label="Factures impayées"
            value={stats?.unpaidInvoices || 0}
            color="red"
          />
        </div>
      )}

      {/* Missions + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MissionsTable missions={missions || []} isLoading={missionsLoading} />
        </div>
        <div>
          <TimelineWidget events={timeline || []} isLoading={timelineLoading} />
        </div>
      </div>
    </div>
  )
}

export default PrestataireDashboard
