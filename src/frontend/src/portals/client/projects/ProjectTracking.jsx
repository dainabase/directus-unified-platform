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
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  in_preparation: { label: 'En préparation', color: 'bg-cyan-100 text-cyan-700' },
  deposit_received: { label: 'Acompte reçu', color: 'bg-teal-100 text-teal-700' },
  on_hold: { label: 'En pause', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' }
}

const DELIVERABLE_STATUS = {
  pending: { label: 'À faire', icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
  in_progress: { label: 'En cours', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  completed: { label: 'Terminé', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  cancelled: { label: 'Annulé', icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' }
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
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Projet introuvable</p>
        <button onClick={() => navigate('/client/projects')} className="mt-4 text-emerald-600 hover:underline">
          ← Retour aux projets
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/client/projects')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} /> Retour aux projets
      </button>

      {/* Project header */}
      <div className="ds-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FolderKanban className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <div className="text-right text-sm text-gray-500">
            {project.start_date && <p>Début : {formatDate(project.start_date)}</p>}
            {project.end_date && <p>Fin prévue : {formatDate(project.end_date)}</p>}
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-gray-600 mt-4">{project.description}</p>
        )}
      </div>

      {/* Progress */}
      <div className="ds-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Progression globale</h3>
          <span className="text-lg font-bold text-emerald-700">{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-sm text-gray-500 mt-2">{completed} sur {total} livrables terminés</p>
      </div>

      {/* Deliverables */}
      <div className="ds-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Livrables</h3>
        {deliverables.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Aucun livrable défini</p>
        ) : (
          <div className="space-y-3">
            {deliverables.map((d, idx) => {
              const dcfg = DELIVERABLE_STATUS[d.status] || DELIVERABLE_STATUS.pending
              const DIcon = dcfg.icon
              return (
                <div key={d.id} className={`flex items-start gap-4 p-4 rounded-xl border ${dcfg.border} ${dcfg.bg}`}>
                  <div className="flex flex-col items-center">
                    <DIcon className={`w-5 h-5 ${dcfg.color}`} />
                    {idx < deliverables.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${d.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {d.title}
                      </h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dcfg.color} bg-white`}>
                        {dcfg.label}
                      </span>
                    </div>
                    {d.description && <p className="text-xs text-gray-500 mt-1">{d.description}</p>}
                    {d.due_date && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
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
