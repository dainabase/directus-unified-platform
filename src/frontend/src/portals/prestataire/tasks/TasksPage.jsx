/**
 * TasksPage — Story 4.4 (Prestataire Portal)
 * Affiche les livrables (deliverables) assignes au prestataire.
 * Deux vues : Liste (default) et Kanban.
 * Filtrage par priorite + recherche par nom.
 * Mutation status via PATCH /items/deliverables/:id.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  List, LayoutGrid, Search, CheckCircle, Loader2,
  ArrowRight, Calendar, Circle, ChevronDown
} from 'lucide-react'
import { format, isPast, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

// ── Status columns for Kanban ──
const STATUS_COLUMNS = {
  draft: { label: 'A faire', color: '#6B7280', statuses: ['draft', 'planned'] },
  in_progress: { label: 'En cours', color: 'var(--semantic-orange)', statuses: ['in_progress', 'in-progress'] },
  review: { label: 'En revue', color: 'var(--accent)', statuses: ['review'] },
  completed: { label: 'Termine', color: 'var(--semantic-green)', statuses: ['completed'] }
}

// ── Priority colors ──
const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' }

// ── Status badge styles (for list view) ──
const STATUS_BADGE = {
  draft: { label: 'Brouillon', bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' },
  planned: { label: 'Planifie', bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' },
  in_progress: { label: 'En cours', bg: 'rgba(0,113,227,0.12)', fg: 'var(--accent-hover)' },
  'in-progress': { label: 'En cours', bg: 'rgba(0,113,227,0.12)', fg: 'var(--accent-hover)' },
  review: { label: 'En revue', bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent-hover)' },
  completed: { label: 'Termine', bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)' }
}

// ── Next status transition map ──
const NEXT_STATUS = {
  draft: 'in_progress',
  planned: 'in_progress',
  in_progress: 'review',
  'in-progress': 'review',
  review: 'completed'
}

// ── Status options for dropdown ──
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'review', label: 'En revue' },
  { value: 'completed', label: 'Termine' }
]

// ── Priority filter options ──
const PRIORITY_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' }
]

// ── Helper: format date DD.MM.YYYY ──
const formatDate = (dateStr) => {
  if (!dateStr) return null
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: fr })
  } catch {
    return null
  }
}

// ── Helper: check if date is overdue ──
const isOverdue = (dateStr) => {
  if (!dateStr) return false
  try {
    return isPast(parseISO(dateStr))
  } catch {
    return false
  }
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

// ── StatusDropdown (list view) ──
const StatusDropdown = ({ currentStatus, onStatusChange, isPending }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (newStatus) => {
    if (newStatus !== currentStatus) {
      onStatusChange(newStatus)
    }
    setOpen(false)
  }

  const badge = STATUS_BADGE[currentStatus] || STATUS_BADGE.draft

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
        style={{ background: badge.bg, color: badge.fg }}
      >
        {isPending ? <Loader2 size={12} className="animate-spin" /> : null}
        {badge.label}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px]">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                  opt.value === currentStatus ? 'font-semibold' : 'text-gray-700'
                }`}
                style={opt.value === currentStatus ? { color: 'var(--accent)', background: 'rgba(0,113,227,0.06)' } : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
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

// ── TaskListItem (list view) ──
const TaskListItem = ({ task, onStatusChange, isPending, navigate }) => {
  const projectName = task.project_id?.name || null
  const projectId = task.project_id?.id || task.project_id
  const dueDateStr = formatDate(task.due_date)
  const overdue = task.status !== 'completed' && isOverdue(task.due_date)

  return (
    <div className="ds-card p-4 hover:border-[var(--sep)] transition-colors">
      <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
        {/* Priority dot */}
        <PriorityDot priority={task.priority} />

        {/* Name + project */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => projectId && navigate(`/prestataire/missions/${projectId}`)}
            className="text-sm font-semibold text-gray-900 hover:text-[var(--accent)] transition-colors text-left truncate block w-full"
          >
            {task.name}
          </button>
          {projectName && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{projectName}</p>
          )}
        </div>

        {/* Due date */}
        {dueDateStr && (
          <div className={`flex items-center gap-1 text-xs shrink-0 ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            <Calendar size={13} />
            {dueDateStr}
          </div>
        )}

        {/* Status dropdown */}
        <StatusDropdown
          currentStatus={task.status}
          onStatusChange={(newStatus) => onStatusChange({ taskId: task.id, newStatus })}
          isPending={isPending}
        />
      </div>
    </div>
  )
}

// ── KanbanCard (kanban view) ──
const KanbanCard = ({ task, onMoveNext, isPending, navigate }) => {
  const projectName = task.project_id?.name || null
  const projectId = task.project_id?.id || task.project_id
  const dueDateStr = formatDate(task.due_date)
  const overdue = task.status !== 'completed' && isOverdue(task.due_date)
  const nextStatus = NEXT_STATUS[task.status]

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => projectId && navigate(`/prestataire/missions/${projectId}`)}
            className="text-sm font-medium text-gray-900 hover:text-[var(--accent)] transition-colors text-left truncate block w-full"
          >
            {task.name}
          </button>
          {projectName && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{projectName}</p>
          )}
        </div>
        <PriorityDot priority={task.priority} />
      </div>

      <div className="flex items-center justify-between mt-3">
        {dueDateStr ? (
          <span className={`flex items-center gap-1 text-[11px] ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
            <Calendar size={11} />
            {dueDateStr}
          </span>
        ) : (
          <span />
        )}

        {nextStatus && (
          <button
            onClick={() => onMoveNext({ taskId: task.id, newStatus: nextStatus })}
            disabled={isPending}
            className="flex items-center gap-0.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50 hover:opacity-80"
            style={{ color: 'var(--accent)', background: 'rgba(0,113,227,0.08)' }}
            title="Passer au statut suivant"
          >
            {isPending ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ── KanbanColumn ──
const KanbanColumn = ({ columnKey, config, tasks, onMoveNext, isPending, navigate }) => {
  return (
    <div className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3 min-h-[200px] flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
          <span className="text-sm font-semibold text-gray-700">{config.label}</span>
        </div>
        <span className="text-xs text-gray-400 font-medium bg-white px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2">
        {tasks.map(task => (
          <KanbanCard
            key={task.id}
            task={task}
            onMoveNext={onMoveNext}
            isPending={isPending}
            navigate={navigate}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-400">
            Aucune tache
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ──
const TasksPage = () => {
  const { provider } = useProviderAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const providerId = provider?.id

  // View state: 'list' or 'kanban'
  const [view, setView] = useState('list')
  // Filter state
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch tasks (deliverables assigned to provider) ──
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['provider-tasks', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/deliverables', {
        params: {
          filter: { assigned_provider_id: { _eq: providerId } },
          fields: ['id', 'name', 'status', 'due_date', 'priority', 'description', 'project_id.id', 'project_id.name'],
          sort: ['due_date'],
          limit: 100
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // ── Status update mutation ──
  const updateStatus = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      await api.patch(`/items/deliverables/${taskId}`, { status: newStatus })
    },
    onSuccess: () => {
      toast.success('Statut mis a jour')
      queryClient.invalidateQueries({ queryKey: ['provider-tasks'] })
    },
    onError: () => toast.error('Erreur de mise a jour')
  })

  // ── Filter + search logic ──
  const filteredTasks = useMemo(() => {
    let result = tasks

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(t => t.priority === priorityFilter)
    }

    // Search by name
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(t =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.project_id?.name || '').toLowerCase().includes(q)
      )
    }

    return result
  }, [tasks, priorityFilter, searchQuery])

  // ── Kanban: group tasks by column ──
  const kanbanData = useMemo(() => {
    const grouped = {}
    Object.entries(STATUS_COLUMNS).forEach(([key, config]) => {
      grouped[key] = filteredTasks.filter(t => config.statuses.includes(t.status))
    })
    return grouped
  }, [filteredTasks])

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes taches</h1>
          <p className="text-sm text-gray-500 mt-1">Livrables assignes a votre compte</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Mes taches</h1>
          <p className="text-sm text-gray-500 mt-1">
            Livrables assignes a votre compte — {tasks.length} tache{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* View toggle */}
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
            placeholder="Rechercher une tache..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm bg-white/50 focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Priority filter */}
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
      {filteredTasks.length === 0 && !isLoading && (
        <div className="ds-card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Aucune tache assignee</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchQuery || priorityFilter !== 'all'
              ? 'Aucune tache ne correspond a vos filtres.'
              : 'Vous serez notifie lorsqu\'un livrable vous sera assigne.'}
          </p>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === 'list' && filteredTasks.length > 0 && (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <TaskListItem
              key={task.id}
              task={task}
              onStatusChange={updateStatus.mutate}
              isPending={updateStatus.isPending}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* ── KANBAN VIEW ── */}
      {view === 'kanban' && filteredTasks.length > 0 && (
        <div className="flex overflow-x-auto gap-4 pb-4">
          {Object.entries(STATUS_COLUMNS).map(([key, config]) => (
            <KanbanColumn
              key={key}
              columnKey={key}
              config={config}
              tasks={kanbanData[key] || []}
              onMoveNext={updateStatus.mutate}
              isPending={updateStatus.isPending}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TasksPage
