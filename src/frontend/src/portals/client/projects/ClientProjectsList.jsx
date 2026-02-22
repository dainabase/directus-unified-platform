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
  pending: { label: 'En attente', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-2)' },
  active: { label: 'Actif', bg: 'var(--tint-green)', fg: 'var(--semantic-green)' },
  in_progress: { label: 'En cours', bg: 'var(--accent-light)', fg: 'var(--accent)' },
  in_preparation: { label: 'En préparation', bg: 'rgba(90,200,250,0.12)', fg: '#5AC8FA' },
  deposit_received: { label: 'Acompte reçu', bg: 'rgba(48,176,199,0.12)', fg: '#30B0C7' },
  on_hold: { label: 'En pause', bg: 'var(--tint-orange)', fg: 'var(--semantic-orange)' },
  completed: { label: 'Terminé', bg: 'var(--tint-green)', fg: 'var(--semantic-green)' },
  cancelled: { label: 'Annulé', bg: 'var(--tint-red)', fg: 'var(--semantic-red)' },
  quote_sent: { label: 'Devis envoyé', bg: 'var(--accent-light)', fg: 'var(--accent)' },
  signed: { label: 'Signé', bg: 'var(--tint-green)', fg: 'var(--semantic-green)' },
  deposit_pending: { label: 'Acompte en attente', bg: 'var(--tint-orange)', fg: 'var(--semantic-orange)' }
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
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin" style={{color:'var(--accent)'}} /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{color:'var(--label-1)'}}>Mes projets</h1>
        <p className="text-sm mt-1" style={{color:'var(--label-3)'}}>{projects.length} projet(s)</p>
      </div>

      {projects.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <FolderKanban className="w-12 h-12 mx-auto mb-3" style={{color:'var(--label-3)'}} />
          <p style={{color:'var(--label-3)'}}>Aucun projet en cours</p>
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
                      <h3 className="font-semibold" style={{color:'var(--label-1)'}}>{project.name}</h3>
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{background: cfg.bg, color: cfg.fg}}>
                        {cfg.label}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm line-clamp-1" style={{color:'var(--label-3)'}}>{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs mt-2" style={{color:'var(--label-3)'}}>
                      {project.start_date && (
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(project.start_date)}</span>
                      )}
                      {project.end_date && (
                        <span>→ {formatDate(project.end_date)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 transition-colors" style={{color:'var(--label-3)'}} />
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
