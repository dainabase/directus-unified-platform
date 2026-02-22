/**
 * ClientDashboard — C-02 Enhanced
 * Connected to Directus, filtered by contact_id / company_id.
 * Shows: greeting, 4 KPI cards, recent projects with progress,
 * actions required (unsigned quotes + overdue invoices).
 * Polling: all queries refetch every 60 seconds.
 */
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Receipt, CreditCard, LifeBuoy,
  AlertTriangle, PenTool, ChevronRight, Loader2,
  Inbox
} from 'lucide-react'
import api from '../../lib/axios'
import { useClientAuth } from './hooks/useClientAuth'
import KPICard from './components/KPICard'
import ProgressBar from './components/ProgressBar'
import StatusBadge from './components/StatusBadge'
import EmptyState from './components/EmptyState'

// ── Formatters (fr-CH locale, CHF, DD.MM.YYYY) ──────────────────────────────
const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '\u2014'

// ── Polling interval ─────────────────────────────────────────────────────────
const REFETCH_INTERVAL = 60_000

const ClientDashboard = () => {
  const { client } = useClientAuth()
  const navigate = useNavigate()
  const contactId = client?.id
  const companyId = client?.company_id

  // ── 1. Fetch projects for this client's company ────────────────────────────
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['client-projects', companyId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: {
            _or: [
              { client_id: { _eq: companyId } },
              { company_id: { _eq: companyId } }
            ]
          },
          fields: ['id', 'name', 'status', 'start_date', 'end_date', 'date_created'],
          sort: ['-date_created'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!companyId,
    refetchInterval: REFETCH_INTERVAL
  })

  // ── 2. Fetch invoices for this contact ─────────────────────────────────────
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['client-invoices', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/client_invoices', {
        params: {
          filter: { contact_id: { _eq: contactId } },
          fields: [
            'id', 'invoice_number', 'amount', 'total', 'status',
            'due_date', 'tax_rate', 'tax_amount', 'date_created'
          ],
          sort: ['-date_created'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!contactId,
    refetchInterval: REFETCH_INTERVAL
  })

  // ── 3. Fetch quotes for this contact ───────────────────────────────────────
  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['client-quotes', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          filter: {
            contact_id: { _eq: contactId },
            status: { _nin: ['draft'] }
          },
          fields: [
            'id', 'quote_number', 'status', 'total',
            'valid_until', 'signed_at', 'date_created'
          ],
          sort: ['-date_created'],
          limit: 30
        }
      })
      return data?.data || []
    },
    enabled: !!contactId,
    refetchInterval: REFETCH_INTERVAL
  })

  // ── 4. Fetch support tickets for this company ──────────────────────────────
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['client-tickets', companyId],
    queryFn: async () => {
      const { data } = await api.get('/items/support_tickets', {
        params: {
          filter: {
            company_id: { _eq: companyId },
            status: { _eq: 'open' }
          },
          fields: ['id', 'subject', 'status', 'priority', 'date_created'],
          sort: ['-date_created'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!companyId,
    refetchInterval: REFETCH_INTERVAL
  })

  // ── 5. Derived: active projects (for KPI and recent list) ──────────────────
  const activeProjects = useMemo(
    () => projects.filter((p) => !['cancelled', 'completed'].includes(p.status)),
    [projects]
  )

  // Pick the 3 most recent active projects to show with deliverables
  const recentActiveProjects = useMemo(
    () => activeProjects.slice(0, 3),
    [activeProjects]
  )

  // ── 6. Fetch deliverables for recent active projects ───────────────────────
  const recentProjectIds = useMemo(
    () => recentActiveProjects.map((p) => p.id),
    [recentActiveProjects]
  )

  const { data: deliverables = [] } = useQuery({
    queryKey: ['client-deliverables-recent', recentProjectIds],
    queryFn: async () => {
      if (recentProjectIds.length === 0) return []
      const { data } = await api.get('/items/deliverables', {
        params: {
          filter: { project_id: { _in: recentProjectIds } },
          fields: ['id', 'title', 'status', 'due_date', 'project_id'],
          sort: ['due_date'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: recentProjectIds.length > 0,
    refetchInterval: REFETCH_INTERVAL
  })

  // ── 7. Derived: invoices ───────────────────────────────────────────────────
  const unpaidInvoices = useMemo(
    () => invoices.filter((i) => ['sent', 'overdue'].includes(i.status)),
    [invoices]
  )

  const totalDue = useMemo(
    () =>
      unpaidInvoices.reduce(
        (sum, i) => sum + parseFloat(i.total || i.amount || 0),
        0
      ),
    [unpaidInvoices]
  )

  const overdueInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'overdue'),
    [invoices]
  )

  // ── 8. Derived: unsigned quotes ────────────────────────────────────────────
  const unsignedQuotes = useMemo(
    () => quotes.filter((q) => !q.signed_at && ['sent', 'viewed'].includes(q.status)),
    [quotes]
  )

  // ── 9. Derived: deliverables per project (for progress) ────────────────────
  const deliverablesByProject = useMemo(() => {
    const map = {}
    for (const d of deliverables) {
      if (!map[d.project_id]) map[d.project_id] = []
      map[d.project_id].push(d)
    }
    return map
  }, [deliverables])

  const getProjectProgress = (projectId) => {
    const dels = deliverablesByProject[projectId] || []
    if (dels.length === 0) return { completed: 0, total: 0, pct: 0 }
    const completed = dels.filter((d) => d.status === 'completed').length
    return {
      completed,
      total: dels.length,
      pct: Math.round((completed / dels.length) * 100)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  const isLoading = !contactId || (projectsLoading && invoicesLoading && quotesLoading && ticketsLoading)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-hover)' }} />
      </div>
    )
  }

  // ── Whether actions-required section should show ───────────────────────────
  const hasActions = unsignedQuotes.length > 0 || overdueInvoices.length > 0

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Greeting ───────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>
          Bonjour{client?.first_name ? ` ${client.first_name}` : ''}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--label-2)' }}>
          Bienvenue sur votre espace client
        </p>
      </div>

      {/* ── 4 KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={FolderKanban}
          value={activeProjects.length}
          title="Projets actifs"
          subtitle={activeProjects.length === 0 ? 'Aucun projet en cours' : undefined}
          onClick={() => navigate('/client/projects')}
        />
        <KPICard
          icon={Receipt}
          value={unpaidInvoices.length}
          title="Factures en attente"
          subtitle={unpaidInvoices.length > 0 ? `${overdueInvoices.length} en retard` : 'Tout est a jour'}
          onClick={() => navigate('/client/invoices')}
        />
        <KPICard
          icon={CreditCard}
          value={formatCHF(totalDue)}
          title="Montant total du"
          subtitle={unpaidInvoices.length > 0 ? `${unpaidInvoices.length} facture(s)` : undefined}
          onClick={() => navigate('/client/invoices')}
        />
        <KPICard
          icon={LifeBuoy}
          value={tickets.length}
          title="Tickets ouverts"
          subtitle={tickets.length === 0 ? 'Aucun ticket en cours' : undefined}
          onClick={() => navigate('/client/support')}
        />
      </div>

      {/* ── Actions requises ───────────────────────────────────────────────── */}
      {hasActions && (
        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(255,149,0,0.06)', border: '1px solid rgba(255,149,0,0.18)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} style={{ color: 'var(--semantic-orange)' }} />
            <h2 className="font-semibold" style={{ color: '#CC7700' }}>
              Actions requises
            </h2>
          </div>
          <div className="space-y-2">
            {/* Unsigned quotes */}
            {unsignedQuotes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.85)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--label-1)' }}>
                    Devis {q.quote_number} — {formatCHF(q.total)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--label-3)' }}>
                    Valide jusqu'au {formatDate(q.valid_until)}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/client/quotes?sign=${q.id}`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: 'var(--accent-hover)' }}
                >
                  <PenTool size={14} /> Signer
                </button>
              </div>
            ))}

            {/* Overdue invoices */}
            {overdueInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.85)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--semantic-red)' }}>
                    Facture {inv.invoice_number} en retard — {formatCHF(inv.total || inv.amount)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--label-3)' }}>
                    Echue le {formatDate(inv.due_date)}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/client/invoices')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: 'var(--semantic-red)' }}
                >
                  <CreditCard size={14} /> Payer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mes projets recents ────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--label-1)' }}>
            Mes projets recents
          </h2>
          {activeProjects.length > 3 && (
            <button
              onClick={() => navigate('/client/projects')}
              className="text-sm font-medium flex items-center gap-1 transition-colors"
              style={{ color: 'var(--accent-hover)' }}
            >
              Voir tous <ChevronRight size={14} />
            </button>
          )}
        </div>

        {recentActiveProjects.length === 0 ? (
          <div className="ds-card">
            <EmptyState
              icon={Inbox}
              title="Aucun projet actif"
              subtitle="Vos projets en cours apparaitront ici."
              actionLabel="Voir tous les projets"
              onAction={() => navigate('/client/projects')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentActiveProjects.map((project) => {
              const progress = getProjectProgress(project.id)
              return (
                <div
                  key={project.id}
                  className="ds-card p-5 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/client/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold text-sm truncate"
                        style={{ color: 'var(--label-1)' }}
                      >
                        {project.name}
                      </h3>
                      <div className="mt-1">
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 ml-2 mt-0.5"
                      style={{ color: 'var(--label-3)' }}
                    />
                  </div>

                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--label-2)' }}>
                        Progression
                      </span>
                      <span className="font-medium" style={{ color: 'var(--label-1)' }}>
                        {progress.pct}%
                      </span>
                    </div>
                    <ProgressBar value={progress.pct} />
                  </div>

                  {/* Deliverables count */}
                  <p className="text-xs" style={{ color: 'var(--label-3)' }}>
                    {progress.completed}/{progress.total} livrable{progress.total !== 1 ? 's' : ''} termine{progress.total !== 1 ? 's' : ''}
                  </p>

                  {/* Dates */}
                  {(project.start_date || project.end_date) && (
                    <p className="text-xs mt-1" style={{ color: 'var(--label-3)' }}>
                      {formatDate(project.start_date)} — {formatDate(project.end_date)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDashboard
