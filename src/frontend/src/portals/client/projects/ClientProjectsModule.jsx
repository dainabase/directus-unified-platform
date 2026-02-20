/**
 * ClientProjectsModule — S-04-04
 * Module Projets Client (lecture seule).
 * Affiche les projets du client connecte via client_id.
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FolderKanban, ChevronRight, Loader2, Calendar, CheckCircle2,
  Clock, PauseCircle, XCircle, BarChart3, Package
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../stores/authStore'

const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  in_progress: { label: 'En cours', color: 'bg-indigo-100 text-indigo-700', icon: BarChart3 },
  on_hold: { label: 'En pause', color: 'bg-amber-100 text-amber-700', icon: PauseCircle },
  completed: { label: 'Termine', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  cancelled: { label: 'Annule', color: 'bg-red-100 text-red-700', icon: XCircle },
  planning: { label: 'Planification', color: 'bg-gray-100 text-gray-600', icon: Clock }
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  )
}

// ── Data ─────────────────────────────────────────────────────

async function fetchClientProjects(userId) {
  // Try filtering by client_id first
  const { data } = await api.get('/items/projects', {
    params: {
      fields: ['id', 'name', 'status', 'start_date', 'end_date', 'description', 'owner_company', 'date_created'],
      filter: userId ? { client_id: { _eq: userId } } : undefined,
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))

  const projects = data?.data || []

  // If no projects found with client_id filter, fallback: show all from HYPERVISUAL
  if (projects.length === 0 && userId) {
    console.log('[ClientProjectsModule] No projects found for client_id, showing HYPERVISUAL projects as fallback')
    const fallback = await api.get('/items/projects', {
      params: {
        fields: ['id', 'name', 'status', 'start_date', 'end_date', 'description', 'owner_company', 'date_created'],
        filter: { owner_company: { _eq: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22' } },
        sort: ['-date_created'],
        limit: 20
      }
    }).catch(() => ({ data: { data: [] } }))
    return fallback?.data?.data || []
  }

  return projects
}

async function fetchProjectDeliverables(projectId) {
  const { data } = await api.get('/items/deliverables', {
    params: {
      fields: ['id', 'title', 'status', 'due_date', 'date_created'],
      filter: { project_id: { _eq: projectId } },
      sort: ['due_date'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Project Detail (read-only) ──────────────────────────────

const ProjectDetail = ({ project, onBack }) => {
  const { data: deliverables = [], isLoading } = useQuery({
    queryKey: ['client-deliverables', project.id],
    queryFn: () => fetchProjectDeliverables(project.id),
    staleTime: 30_000
  })

  const doneCount = deliverables.filter(d => d.status === 'done').length
  const totalDel = deliverables.length
  const progress = totalDel > 0 ? Math.round((doneCount / totalDel) * 100) : 0

  // Timeline events based on deliverable creation dates
  const timeline = deliverables
    .filter(d => d.date_created)
    .sort((a, b) => new Date(a.date_created) - new Date(b.date_created))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Retour</button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-900">{project.name}</span>
      </div>

      {/* Header */}
      <div className="ds-card p-6">
        <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
        {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
        <div className="flex items-center gap-3 mt-3">
          <StatusBadge status={project.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-500">Debut</p>
            <p className="font-semibold text-gray-900">{project.start_date ? format(new Date(project.start_date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fin prevue</p>
            <p className="font-semibold text-gray-900">{project.end_date ? format(new Date(project.end_date), 'dd MMM yyyy', { locale: fr }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avancement</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-900">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables (read-only) */}
      <div className="ds-card">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Livrables ({totalDel})</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" /></div>
        ) : deliverables.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun livrable pour ce projet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {deliverables.map(d => (
              <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadge status={d.status} />
                  <span className="text-sm text-gray-900">{d.title}</span>
                </div>
                {d.due_date && (
                  <span className={`text-xs ${new Date(d.due_date) < new Date() && d.status !== 'done' ? 'text-red-500' : 'text-gray-500'}`}>
                    {format(new Date(d.due_date), 'dd MMM yyyy', { locale: fr })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="ds-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Timeline</h3>
          </div>
          <div className="p-4">
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
              {timeline.map(d => (
                <div key={d.id} className="relative">
                  <div className={`absolute -left-4 w-3 h-3 rounded-full border-2 border-white ${d.status === 'done' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{d.title}</span>
                    <span className="text-xs text-gray-400">{format(new Date(d.date_created), 'dd MMM yyyy', { locale: fr })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

const ClientProjectsModule = () => {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id

  const [selectedProject, setSelectedProject] = useState(null)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['client-projects', userId],
    queryFn: () => fetchClientProjects(userId),
    staleTime: 30_000
  })

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mes projets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Suivi de vos projets en cours</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun projet pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} onClick={() => setSelectedProject(p)}
              className="ds-card p-5 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              {p.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {p.start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {format(new Date(p.start_date), 'dd MMM yyyy', { locale: fr })}
                  </span>
                )}
                {p.end_date && (
                  <span>→ {format(new Date(p.end_date), 'dd MMM yyyy', { locale: fr })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ClientProjectsModule
