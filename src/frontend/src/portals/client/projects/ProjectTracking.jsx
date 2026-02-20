/**
 * ProjectTracking — C-04
 * Client views project progress with deliverables timeline.
 * Route: /client/projects/:id
 */
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, FolderKanban, Calendar, CheckCircle, Clock,
  Circle, Loader2, AlertCircle
} from 'lucide-react'
import api from '../../../lib/axios'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const PROJECT_STATUSES = {
  pending: { label: 'En attente', bg: 'rgba(0,0,0,0.04)', fg: 'var(--text-secondary)' },
  active: { label: 'Actif', bg: 'var(--success-light)', fg: 'var(--success)' },
  in_progress: { label: 'En cours', bg: 'var(--accent-light)', fg: 'var(--accent)' },
  in_preparation: { label: 'En préparation', bg: 'rgba(90,200,250,0.12)', fg: '#5AC8FA' },
  deposit_received: { label: 'Acompte reçu', bg: 'rgba(48,176,199,0.12)', fg: '#30B0C7' },
  on_hold: { label: 'En pause', bg: 'var(--warning-light)', fg: 'var(--warning)' },
  completed: { label: 'Terminé', bg: 'var(--success-light)', fg: 'var(--success)' },
  cancelled: { label: 'Annulé', bg: 'var(--danger-light)', fg: 'var(--danger)' }
}

const DELIVERABLE_STATUS = {
  pending: { label: 'À faire', icon: Circle, fg: 'var(--text-tertiary)', bg: 'rgba(0,0,0,0.02)', border: 'var(--border-light)' },
  in_progress: { label: 'En cours', icon: Clock, fg: 'var(--accent)', bg: 'var(--accent-light)', border: 'var(--accent)' },
  completed: { label: 'Terminé', icon: CheckCircle, fg: 'var(--success)', bg: 'var(--success-light)', border: 'var(--success)' },
  cancelled: { label: 'Annulé', icon: AlertCircle, fg: 'var(--text-tertiary)', bg: 'rgba(0,0,0,0.02)', border: 'var(--border-light)' }
}

const ProjectTracking = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['client-project-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/projects/${id}`, {
        params: { fields: ['id', 'name', 'description', 'status', 'start_date', 'end_date', 'date_created'] }
      })
      return data?.data
    },
    enabled: !!id
  })

  const { data: deliverables = [] } = useQuery({
    queryKey: ['client-project-deliverables', id],
    queryFn: async () => {
      const { data } = await api.get('/items/deliverables', {
        params: {
          filter: { project_id: { _eq: id } },
          fields: ['id', 'title', 'description', 'status', 'due_date'],
          sort: ['due_date']
        }
      })
      return data?.data || []
    },
    enabled: !!id
  })

  const completed = deliverables.filter(d => d.status === 'completed').length
  const total = deliverables.filter(d => d.status !== 'cancelled').length
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const statusCfg = PROJECT_STATUSES[project?.status] || PROJECT_STATUSES.pending

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{color:'var(--accent)'}} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{color:'var(--danger)'}} />
        <p style={{color:'var(--text-secondary)'}}>Projet introuvable</p>
        <button onClick={() => navigate('/client/projects')} className="mt-4 hover:underline" style={{color:'var(--accent)'}}>
          ← Retour aux projets
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/client/projects')}
        className="flex items-center gap-2 text-sm" style={{color:'var(--text-tertiary)'}}>
        <ArrowLeft size={16} /> Retour aux projets
      </button>

      {/* Project header */}
      <div className="ds-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FolderKanban className="w-6 h-6" style={{color:'var(--accent)'}} />
              <h1 className="text-xl font-bold" style={{color:'var(--text-primary)'}}>{project.name}</h1>
            </div>
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium"
              style={{background: statusCfg.bg, color: statusCfg.fg}}>
              {statusCfg.label}
            </span>
          </div>
          <div className="text-right text-sm" style={{color:'var(--text-tertiary)'}}>
            {project.start_date && <p>Début : {formatDate(project.start_date)}</p>}
            {project.end_date && <p>Fin prévue : {formatDate(project.end_date)}</p>}
          </div>
        </div>
        {project.description && (
          <p className="text-sm mt-4" style={{color:'var(--text-secondary)'}}>{project.description}</p>
        )}
      </div>

      {/* Progress */}
      <div className="ds-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>Progression globale</h3>
          <span className="text-lg font-bold" style={{color:'var(--accent)'}}>{progressPct}%</span>
        </div>
        <div className="w-full rounded-full h-3" style={{background:'rgba(0,0,0,0.08)'}}>
          <div className="h-3 rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background:'var(--accent)' }} />
        </div>
        <p className="text-sm mt-2" style={{color:'var(--text-tertiary)'}}>{completed} sur {total} livrables terminés</p>
      </div>

      {/* Deliverables */}
      <div className="ds-card p-6">
        <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>Livrables</h3>
        {deliverables.length === 0 ? (
          <p className="text-sm text-center py-6" style={{color:'var(--text-tertiary)'}}>Aucun livrable défini</p>
        ) : (
          <div className="space-y-3">
            {deliverables.map((d, idx) => {
              const dcfg = DELIVERABLE_STATUS[d.status] || DELIVERABLE_STATUS.pending
              const DIcon = dcfg.icon
              return (
                <div key={d.id} className="flex items-start gap-4 p-4 rounded-xl"
                  style={{border:`1px solid ${dcfg.border}`, background: dcfg.bg}}>
                  <div className="flex flex-col items-center">
                    <DIcon className="w-5 h-5" style={{color: dcfg.fg}} />
                    {idx < deliverables.length - 1 && (
                      <div className="w-px h-8 mt-1" style={{background:'var(--border-light)'}} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${d.status === 'completed' ? 'line-through' : ''}`}
                        style={{color: d.status === 'completed' ? 'var(--text-tertiary)' : 'var(--text-primary)'}}>
                        {d.title}
                      </h4>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{color: dcfg.fg, background:'var(--bg-surface)'}}>
                        {dcfg.label}
                      </span>
                    </div>
                    {d.description && <p className="text-xs mt-1" style={{color:'var(--text-tertiary)'}}>{d.description}</p>}
                    {d.due_date && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs" style={{color:'var(--text-tertiary)'}}>
                        <Calendar size={12} /> {formatDate(d.due_date)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectTracking
