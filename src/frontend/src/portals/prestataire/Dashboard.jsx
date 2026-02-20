/**
 * ProviderDashboard — Phase D-02 / Story 4.1
 * Dashboard prestataire connecte Directus, filtre par provider_id.
 * Cartes statut + quick stats + section "A faire" + timeline + echeances.
 */

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FileText, FolderKanban, Receipt, CreditCard,
  ArrowRight, Clock, Loader2, AlertTriangle,
  CheckCircle2, CalendarClock, Activity, Eye,
  TrendingUp, Banknote, Timer
} from 'lucide-react'
import { format, formatDistanceToNow, addDays, differenceInDays, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'
import { useProviderAuth } from './hooks/useProviderAuth'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

// -- Stat card component --
const StatCard = ({ icon: Icon, label, value, subtitle, color = 'blue' }) => {
  return (
    <div className="ds-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ background: color === 'blue' ? 'var(--accent)' : color === 'emerald' ? 'var(--success)' : 'var(--warning)' }}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

// -- Mini stat card for secondary row --
const MiniStatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="ds-card p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 113, 227, 0.08)' }}>
        <Icon size={16} style={{ color: '#0071E3' }} />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// -- Deadline badge with color coding --
const DeadlineBadge = ({ dueDate }) => {
  const today = startOfDay(new Date())
  const due = startOfDay(new Date(dueDate))
  const daysLeft = differenceInDays(due, today)

  let bgColor, textColor
  if (daysLeft < 7) {
    bgColor = 'rgba(239,68,68,0.1)'
    textColor = 'var(--error)'
  } else if (daysLeft < 14) {
    bgColor = 'rgba(245,158,11,0.1)'
    textColor = 'var(--warning)'
  } else {
    bgColor = 'rgba(34,197,94,0.1)'
    textColor = 'var(--success)'
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: bgColor, color: textColor }}
    >
      {daysLeft === 0
        ? "Aujourd'hui"
        : daysLeft === 1
          ? 'Demain'
          : `${daysLeft} jours`}
    </span>
  )
}

// -- Timeline item icon mapping --
const timelineIconMap = {
  proposal: { Icon: FileText, bg: 'rgba(0, 113, 227, 0.1)', color: '#0071E3' },
  project: { Icon: FolderKanban, bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' },
  invoice: { Icon: Receipt, bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }
}

const ProviderDashboard = () => {
  const { provider } = useProviderAuth()
  const navigate = useNavigate()
  const providerId = provider?.id

  // ── Existing queries ──

  // Fetch pending proposals count
  const { data: pendingProposals = 0 } = useQuery({
    queryKey: ['provider-pending-proposals', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/proposals', {
        params: {
          filter: { provider_id: { _eq: providerId }, status: { _in: ['draft', 'pending'] } },
          aggregate: { count: ['*'] }
        }
      })
      return parseInt(data?.data?.[0]?.count || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch active projects count
  const { data: activeProjects = 0 } = useQuery({
    queryKey: ['provider-active-projects', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: { main_provider_id: { _eq: providerId }, status: { _in: ['active', 'in_progress', 'in-progress'] } },
          aggregate: { count: ['*'] }
        }
      })
      return parseInt(data?.data?.[0]?.count || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch pending payments amount
  const { data: pendingPayments = 0 } = useQuery({
    queryKey: ['provider-pending-payments', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/supplier_invoices', {
        params: {
          filter: { provider_id: { _eq: providerId }, status: { _in: ['pending', 'approved'] } },
          aggregate: { sum: ['amount'] }
        }
      })
      return parseFloat(data?.data?.[0]?.sum?.amount || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch projects without supplier invoice (need to submit)
  const { data: projectsNeedInvoice = [] } = useQuery({
    queryKey: ['provider-projects-need-invoice', providerId],
    queryFn: async () => {
      // Get active projects for this provider
      const { data: projects } = await api.get('/items/projects', {
        params: {
          filter: { main_provider_id: { _eq: providerId }, status: { _in: ['active', 'in_progress', 'in-progress'] } },
          fields: ['id', 'name'],
          limit: 50
        }
      })
      const projectList = projects?.data || []
      if (projectList.length === 0) return []

      // Get existing supplier invoices for these projects
      const projectIds = projectList.map(p => p.id)
      const { data: invoices } = await api.get('/items/supplier_invoices', {
        params: {
          filter: { provider_id: { _eq: providerId }, project_id: { _in: projectIds } },
          fields: ['project_id']
        }
      })
      const invoicedProjectIds = new Set((invoices?.data || []).map(i => i.project_id))
      return projectList.filter(p => !invoicedProjectIds.has(p.id))
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch unanswered proposals
  const { data: unansweredProposals = [] } = useQuery({
    queryKey: ['provider-unanswered-proposals', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/proposals', {
        params: {
          filter: { provider_id: { _eq: providerId }, status: { _in: ['draft', 'pending'] } },
          fields: ['id', 'name', 'description', 'created_at', 'project_id'],
          sort: ['-created_at'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // ── New queries (Story 4.1) ──

  // Completed projects count
  const { data: completedProjects = 0 } = useQuery({
    queryKey: ['provider-completed-projects', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: { main_provider_id: { _eq: providerId }, status: { _eq: 'completed' } },
          aggregate: { count: ['*'] }
        }
      })
      return parseInt(data?.data?.[0]?.count || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Total invoiced amount
  const { data: totalInvoiced = 0 } = useQuery({
    queryKey: ['provider-total-invoiced', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/supplier_invoices', {
        params: {
          filter: { provider_id: { _eq: providerId } },
          aggregate: { sum: ['amount'] }
        }
      })
      return parseFloat(data?.data?.[0]?.sum?.amount || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Recent proposals (for timeline)
  const { data: recentProposals = [] } = useQuery({
    queryKey: ['provider-recent-proposals', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/proposals', {
        params: {
          filter: { provider_id: { _eq: providerId } },
          fields: ['id', 'name', 'status', 'date_created'],
          sort: ['-date_created'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Recent projects (for timeline)
  const { data: recentProjects = [] } = useQuery({
    queryKey: ['provider-recent-projects', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: { main_provider_id: { _eq: providerId } },
          fields: ['id', 'name', 'status', 'date_created'],
          sort: ['-date_created'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Recent invoices (for timeline)
  const { data: recentInvoices = [] } = useQuery({
    queryKey: ['provider-recent-invoices', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/supplier_invoices', {
        params: {
          filter: { provider_id: { _eq: providerId } },
          fields: ['id', 'amount', 'status', 'date_created'],
          sort: ['-date_created'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Upcoming deliverable deadlines (next 30 days)
  const { data: upcomingDeadlines = [] } = useQuery({
    queryKey: ['provider-upcoming-deadlines', providerId],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const in30days = format(addDays(new Date(), 30), 'yyyy-MM-dd')
      const { data } = await api.get('/items/deliverables', {
        params: {
          filter: {
            assigned_provider_id: { _eq: providerId },
            due_date: { _gte: today, _lte: in30days },
            status: { _neq: 'completed' }
          },
          fields: ['id', 'name', 'due_date', 'status', 'project_id.name'],
          sort: ['due_date'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // ── Computed: merged timeline ──
  const timelineItems = useMemo(() => {
    const items = []

    recentProposals.forEach(p => {
      const statusLabel = p.status === 'accepted' ? 'acceptee' : p.status === 'rejected' ? 'refusee' : 'recue'
      items.push({
        id: `proposal-${p.id}`,
        type: 'proposal',
        description: `Demande de devis "${p.name || 'Sans titre'}" ${statusLabel}`,
        date: p.date_created,
        link: '/prestataire/quotes'
      })
    })

    recentProjects.forEach(p => {
      const statusLabel = p.status === 'completed' ? 'termine' : p.status === 'active' || p.status === 'in_progress' || p.status === 'in-progress' ? 'en cours' : 'cree'
      items.push({
        id: `project-${p.id}`,
        type: 'project',
        description: `Projet "${p.name || 'Sans titre'}" ${statusLabel}`,
        date: p.date_created,
        link: '/prestataire/orders'
      })
    })

    recentInvoices.forEach(inv => {
      const statusLabel = inv.status === 'paid' ? 'payee' : inv.status === 'approved' ? 'approuvee' : 'soumise'
      items.push({
        id: `invoice-${inv.id}`,
        type: 'invoice',
        description: `Facture de ${formatCHF(inv.amount)} ${statusLabel}`,
        date: inv.date_created,
        link: '/prestataire/invoices'
      })
    })

    // Sort by date descending and take the 10 most recent
    items.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })

    return items.slice(0, 10)
  }, [recentProposals, recentProjects, recentInvoices])

  const displayName = provider?.contact_person || provider?.name || 'Prestataire'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {displayName.split(' ')[0]} — Espace prestataire HYPERVISUAL
        </h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre activite</p>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Demandes en attente"
          value={pendingProposals}
          subtitle="Devis a soumettre"
          color="blue"
        />
        <StatCard
          icon={FolderKanban}
          label="Projets en cours"
          value={activeProjects}
          subtitle="Missions actives"
          color="blue"
        />
        <StatCard
          icon={Receipt}
          label="Factures a soumettre"
          value={projectsNeedInvoice.length}
          subtitle="Projets sans facture"
          color="amber"
        />
        <StatCard
          icon={CreditCard}
          label="Paiements en attente"
          value={formatCHF(pendingPayments)}
          subtitle="Montant en cours"
          color="emerald"
        />
      </div>

      {/* Quick stats row (secondary) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStatCard
          icon={CheckCircle2}
          label="Projets termines"
          value={completedProjects}
        />
        <MiniStatCard
          icon={Banknote}
          label="Total facture"
          value={formatCHF(totalInvoiced)}
        />
        <MiniStatCard
          icon={Timer}
          label="Temps de reponse moyen"
          value="—"
        />
      </div>

      {/* Section "A faire" */}
      {(unansweredProposals.length > 0 || projectsNeedInvoice.length > 0) && (
        <div className="ds-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Actions requises
            </h2>
          </div>

          <div className="space-y-3">
            {/* Unanswered proposals */}
            {unansweredProposals.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => navigate('/prestataire/quotes')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.name || 'Demande de devis'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.created_at && format(new Date(p.created_at), 'dd.MM.yyyy', { locale: fr })}
                      {p.description && ` — ${p.description.slice(0, 60)}...`}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0071E3] text-white hover:bg-blue-700 transition-colors">
                  Soumettre mon offre <ArrowRight size={14} />
                </button>
              </div>
            ))}

            {/* Projects without invoice */}
            {projectsNeedInvoice.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors cursor-pointer"
                onClick={() => navigate('/prestataire/invoices')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Receipt size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">Projet actif sans facture soumise</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                  Soumettre ma facture <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout: Timeline + Upcoming deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline — Recent activity */}
        <div className="ds-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" style={{ color: '#0071E3' }} />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Activite recente
            </h2>
          </div>

          {timelineItems.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune activite recente</p>
            </div>
          ) : (
            <div className="space-y-1">
              {timelineItems.map((item, idx) => {
                const { Icon, bg, color } = timelineIconMap[item.type] || timelineIconMap.proposal
                return (
                  <div key={item.id} className="flex items-start gap-3 py-2.5 group">
                    {/* Icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: bg }}
                    >
                      <Icon size={14} style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.date
                          ? formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: fr })
                          : '—'}
                      </p>
                    </div>

                    {/* Voir link */}
                    <button
                      onClick={() => navigate(item.link)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#0071E3' }}
                    >
                      <Eye size={12} />
                      Voir
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="ds-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-5 h-5" style={{ color: '#0071E3' }} />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Echeances a venir
            </h2>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune echeance dans les 30 prochains jours</p>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingDeadlines.map(d => {
                const projectName =
                  typeof d.project_id === 'object' && d.project_id?.name
                    ? d.project_id.name
                    : null
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between py-2.5 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: 'rgba(0, 113, 227, 0.08)' }}
                      >
                        <CalendarClock size={14} style={{ color: '#0071E3' }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {d.name || 'Livrable'}
                        </p>
                        {projectName && (
                          <p className="text-xs text-gray-400 truncate">{projectName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <DeadlineBadge dueDate={d.due_date} />
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {format(new Date(d.due_date), 'dd.MM.yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {unansweredProposals.length === 0 && projectsNeedInvoice.length === 0 && pendingProposals === 0 && activeProjects === 0 && (
        <div className="ds-card p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Aucune action en attente</h3>
          <p className="text-sm text-gray-500 mt-2">
            Vous serez notifie des qu'HYPERVISUAL vous enverra une demande de devis.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProviderDashboard
