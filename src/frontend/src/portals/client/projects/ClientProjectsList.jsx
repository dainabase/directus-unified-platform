/**
 * ClientProjectsList — C-04
 * Client sees all their projects with status and can click into details.
 * Route: /client/projects
 */
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, ChevronRight, Calendar, Loader2
} from 'lucide-react'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const PROJECT_STATUSES = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
  active: { label: 'Actif', color: 'bg-emerald-100 text-emerald-700' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  in_preparation: { label: 'En préparation', color: 'bg-cyan-100 text-cyan-700' },
  deposit_received: { label: 'Acompte reçu', color: 'bg-teal-100 text-teal-700' },
  on_hold: { label: 'En pause', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' },
  quote_sent: { label: 'Devis envoyé', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Signé', color: 'bg-emerald-100 text-emerald-700' },
  deposit_pending: { label: 'Acompte en attente', color: 'bg-amber-100 text-amber-700' }
}

const ClientProjectsList = () => {
  const { client } = useClientAuth()
  const navigate = useNavigate()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['client-projects-list', client?.id],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: {
            _or: [
              { client_id: { _eq: client?.company_id } },
              { company_id: { _eq: client?.company_id } }
            ]
          },
          fields: ['id', 'name', 'description', 'status', 'start_date', 'end_date', 'date_created'],
          sort: ['-date_created']
        }
      })
      return data?.data || []
    },
    enabled: !!client?.id
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes projets</h1>
        <p className="text-gray-500 text-sm mt-1">{projects.length} projet(s)</p>
      </div>

      {projects.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun projet en cours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const cfg = PROJECT_STATUSES[project.status] || PROJECT_STATUSES.pending
            return (
              <div key={project.id}
                onClick={() => navigate(`/client/projects/${project.id}`)}
                className="ds-card p-5 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                      {project.start_date && (
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(project.start_date)}</span>
                      )}
                      {project.end_date && (
                        <span>→ {formatDate(project.end_date)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ClientProjectsList
