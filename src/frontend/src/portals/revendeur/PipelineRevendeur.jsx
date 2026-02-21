/**
 * PipelineRevendeur — Pipeline page (Revendeur Portal)
 * Affiche les leads assignes au revendeur connecte.
 * Deux vues : Liste (default) et Kanban.
 * Filtrage par priorite + recherche par nom/entreprise.
 * Mutation status via PATCH /items/leads/:id.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  List, LayoutGrid, Search, Loader2, ArrowRight,
  Circle, Users, ChevronRight
} from 'lucide-react'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

// ── Format CHF ──
const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v || 0)

// ── Kanban columns (4 logical groups) ──
const KANBAN_COLUMNS = {
  prospect: { label: 'Prospect', color: '#6B7280', statuses: ['new', 'contacted'] },
  qualifie: { label: 'Qualifie', color: '#71717A', statuses: ['qualified'] },
  negociation: { label: 'Negociation', color: '#F59E0B', statuses: ['proposal', 'negotiation'] },
  signe: { label: 'Signe', color: '#22C55E', statuses: ['won'] }
}

// ── Next status transition map (for arrow button) ──
const NEXT_STATUS = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'proposal',
  proposal: 'negotiation',
  negotiation: 'won'
}

// ── Priority colors ──
const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' }

// ── Status badge config (for list view) ──
const STATUS_BADGE = {
  new: { label: 'Nouveau', bg: 'bg-gray-100', text: 'text-gray-600' },
  contacted: { label: 'Contacte', bg: 'bg-zinc-100', text: 'text-zinc-700' },
  qualified: { label: 'Qualifie', bg: 'bg-zinc-200', text: 'text-zinc-800' },
  proposal: { label: 'Proposition', bg: 'bg-amber-100', text: 'text-amber-700' },
  negotiation: { label: 'Negociation', bg: 'bg-orange-100', text: 'text-orange-700' },
  won: { label: 'Signe', bg: 'bg-green-100', text: 'text-green-700' },
  lost: { label: 'Perdu', bg: 'bg-red-100', text: 'text-red-700' },
  inactive: { label: 'Inactif', bg: 'bg-gray-100', text: 'text-gray-400' }
}

// ── Priority filter options ──
const PRIORITY_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' }
]

// ── Helper: relative date (e.g. "il y a 3 jours") ──
const relativeDate = (dateStr) => {
  if (!dateStr) return null
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: fr })
  } catch {
    return null
  }
}

// ── Helper: format date DD.MM.YYYY ──
const formatDate = (dateStr) => {
  if (!dateStr) return null
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: fr })
  } catch {
    return null
  }
}

// ── PriorityDot ──
const PriorityDot = ({ priority }) => {
  const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS.low
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: color }}
      title={`Priorite : ${priority || 'non definie'}`}
    />
  )
}

// ── Skeleton cards (loading state) ──
const SkeletonCards = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="ds-card p-5">
        <div className="animate-pulse flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/5" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-20" />
          <div className="h-4 bg-gray-100 rounded w-20" />
        </div>
      </div>
    ))}
  </div>
)

// ── Kanban Skeleton ──
const KanbanSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-4 min-h-[200px]">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-24 bg-gray-100 rounded-lg" />
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
)

// ── KanbanCard ──
const KanbanCard = ({ lead, onMoveNext, isPending }) => {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ')
  const nextStatus = NEXT_STATUS[lead.status]
  const updated = relativeDate(lead.date_updated)

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {lead.company_name && (
            <p className="text-sm font-medium text-gray-900 truncate">{lead.company_name}</p>
          )}
          {fullName && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{fullName}</p>
          )}
        </div>
        <PriorityDot priority={lead.priority} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-sm font-semibold text-gray-900">
          {formatCHF(lead.estimated_value)}
        </span>

        {nextStatus && (
          <button
            onClick={() => onMoveNext({ leadId: lead.id, newStatus: nextStatus })}
            disabled={isPending}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            title="Passer au statut suivant"
          >
            {isPending ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
          </button>
        )}
      </div>

      {updated && (
        <p className="text-[11px] text-gray-400 mt-2">{updated}</p>
      )}
    </div>
  )
}

// ── KanbanColumn ──
const KanbanColumn = ({ config, leads, onMoveNext, isPending }) => {
  const columnTotal = leads.reduce((sum, l) => sum + (l.estimated_value || 0), 0)

  return (
    <div className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3 min-h-[200px] flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
          <span className="text-sm font-semibold text-gray-700">{config.label}</span>
        </div>
        <span className="text-xs text-gray-400 font-medium bg-white px-2 py-0.5 rounded-full">
          {leads.length}
        </span>
      </div>

      {/* Column total */}
      {leads.length > 0 && (
        <div className="text-xs text-gray-500 font-medium px-1 mb-2">
          {formatCHF(columnTotal)}
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 space-y-2">
        {leads.map(lead => (
          <KanbanCard
            key={lead.id}
            lead={lead}
            onMoveNext={onMoveNext}
            isPending={isPending}
          />
        ))}
        {leads.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-400">
            Aucun lead
          </div>
        )}
      </div>
    </div>
  )
}

// ── LeadListItem (list view) ──
const LeadListItem = ({ lead, onStatusChange, isPending }) => {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(' ')
  const badge = STATUS_BADGE[lead.status] || STATUS_BADGE.new
  const nextStatus = NEXT_STATUS[lead.status]
  const lastActivity = formatDate(lead.date_updated || lead.last_contacted_at)

  return (
    <div className="ds-card p-4 hover:border-zinc-300 transition-colors">
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        {/* Priority dot */}
        <PriorityDot priority={lead.priority} />

        {/* Name + company */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {fullName || 'Sans nom'}
          </p>
          {lead.company_name && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.company_name}</p>
          )}
        </div>

        {/* Value CHF */}
        <span className="text-sm font-bold text-gray-900 shrink-0">
          {formatCHF(lead.estimated_value)}
        </span>

        {/* Status badge */}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>

        {/* Last activity date */}
        {lastActivity && (
          <span className="text-xs text-gray-400 shrink-0">{lastActivity}</span>
        )}

        {/* Next status arrow */}
        {nextStatus && (
          <button
            onClick={() => onStatusChange({ leadId: lead.id, newStatus: nextStatus })}
            disabled={isPending}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors disabled:opacity-50 shrink-0"
            title="Avancer au statut suivant"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main component ──
const PipelineRevendeur = () => {
  const user = useAuthStore(s => s.user)
  const queryClient = useQueryClient()
  const userId = user?.id

  // View state: 'list' or 'kanban'
  const [view, setView] = useState('kanban')
  // Filter state
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch leads assigned to current user ──
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['revendeur-leads', userId],
    queryFn: async () => {
      const { data } = await api.get('/items/leads', {
        params: {
          filter: { assigned_to: { _eq: userId } },
          fields: ['*'],
          sort: ['-date_updated'],
          limit: 100
        }
      })
      return data?.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2
  })

  // ── Status update mutation ──
  const updateStatus = useMutation({
    mutationFn: async ({ leadId, newStatus }) => {
      await api.patch(`/items/leads/${leadId}`, { status: newStatus })
    },
    onSuccess: () => {
      toast.success('Statut mis a jour')
      queryClient.invalidateQueries({ queryKey: ['revendeur-leads'] })
    },
    onError: () => toast.error('Erreur de mise a jour')
  })

  // ── Filter + search logic ──
  const filteredLeads = useMemo(() => {
    let result = leads

    // Exclude lost/inactive for all views
    result = result.filter(l => l.status !== 'lost' && l.status !== 'inactive')

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(l => l.priority === priorityFilter)
    }

    // Search by name / company
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(l =>
        (l.first_name || '').toLowerCase().includes(q) ||
        (l.last_name || '').toLowerCase().includes(q) ||
        (l.company_name || '').toLowerCase().includes(q)
      )
    }

    return result
  }, [leads, priorityFilter, searchQuery])

  // ── Kanban: group leads by column ──
  const kanbanData = useMemo(() => {
    const grouped = {}
    Object.entries(KANBAN_COLUMNS).forEach(([key, config]) => {
      grouped[key] = filteredLeads.filter(l => config.statuses.includes(l.status))
    })
    return grouped
  }, [filteredLeads])

  // ── Pipeline totals ──
  const pipelineTotal = useMemo(() => {
    return filteredLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0)
  }, [filteredLeads])

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vos leads et opportunites commerciales</p>
        </div>
        {view === 'kanban' ? <KanbanSkeleton /> : <SkeletonCards />}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} — {formatCHF(pipelineTotal)} en pipeline
          </p>
        </div>

        {/* View toggle (pill) */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={14} />
            Liste
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              view === 'kanban'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid size={14} />
            Kanban
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou entreprise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ds-input w-full pl-9 pr-4 py-2"
          />
        </div>

        {/* Priority filter pills */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {PRIORITY_FILTERS.map(pf => (
            <button
              key={pf.value}
              onClick={() => setPriorityFilter(pf.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                priorityFilter === pf.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {pf.value !== 'all' && (
                <Circle
                  size={8}
                  fill={PRIORITY_COLORS[pf.value]}
                  stroke={PRIORITY_COLORS[pf.value]}
                />
              )}
              {pf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filteredLeads.length === 0 && !isLoading && (
        <div className="ds-card p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Aucun lead</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchQuery || priorityFilter !== 'all'
              ? 'Aucun lead ne correspond a vos filtres.'
              : 'Votre pipeline est vide pour le moment.'}
          </p>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && filteredLeads.length > 0 && (
        <div className="space-y-2">
          {filteredLeads.map(lead => (
            <LeadListItem
              key={lead.id}
              lead={lead}
              onStatusChange={updateStatus.mutate}
              isPending={updateStatus.isPending}
            />
          ))}
        </div>
      )}

      {/* ── KANBAN VIEW ── */}
      {view === 'kanban' && filteredLeads.length > 0 && (
        <div className="flex overflow-x-auto gap-4 pb-4">
          {Object.entries(KANBAN_COLUMNS).map(([key, config]) => (
            <KanbanColumn
              key={key}
              config={config}
              leads={kanbanData[key] || []}
              onMoveNext={updateStatus.mutate}
              isPending={updateStatus.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PipelineRevendeur
