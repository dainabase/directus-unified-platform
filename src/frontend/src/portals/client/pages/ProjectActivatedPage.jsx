/**
 * ProjectActivatedPage — Client Portal Success Page
 *
 * Displayed after a project is activated following payment confirmation.
 * Shows a success state with project summary and next steps.
 *
 * Route: /client/project-activated/:projectId
 */

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'
import StatusBadge from '../components/StatusBadge'

/* ── Formatters ── */
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : '—'

const ProjectActivatedPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { client } = useClientAuth()

  /* ── Fetch project details ── */
  const {
    data: project,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['client-project-activated', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/items/projects/${projectId}`, {
        params: {
          fields: ['id', 'name', 'status', 'start_date', 'end_date', 'company_id', 'date_created']
        }
      })
      return data?.data || null
    },
    enabled: !!projectId
  })

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-hover)' }} />
      </div>
    )
  }

  /* ── Error / not found ── */
  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
        <p className="text-gray-700 font-medium mb-1">Projet introuvable</p>
        <p className="text-sm text-gray-500 mb-4">
          Ce projet n'existe pas ou vous n'y avez pas acces.
        </p>
        <button
          onClick={() => navigate('/client')}
          className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ color: 'var(--accent-hover)' }}
        >
          Retour au tableau de bord
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center">
        {/* ── Success icon with pulse ── */}
        <div className="relative inline-block mb-6">
          <CheckCircle size={64} style={{ color: 'var(--semantic-green)' }} />
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(52,199,89,0.12)' }}
          />
        </div>

        {/* ── Title & subtitle ── */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Votre projet est active !
        </h1>
        <p className="text-gray-500 mb-8">
          Nous avons bien recu votre paiement. Votre projet demarre maintenant.
        </p>

        {/* ── Project summary card ── */}
        <div className="ds-card p-5 text-left mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Projet</span>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-lg font-semibold text-gray-900">{project.name}</p>

            <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Debut</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(project.start_date || project.date_created)}
                </p>
              </div>
              {project.end_date && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fin prevue</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(project.end_date)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Contact info ── */}
        <div
          className="rounded-lg p-4 mb-6 text-left"
          style={{ backgroundColor: 'rgba(0,113,227,0.06)' }}
        >
          <p className="text-sm" style={{ color: 'var(--accent-hover)' }}>
            Votre referent HYPERVISUAL vous contactera sous 24h pour organiser le lancement
            et definir les prochaines etapes.
          </p>
        </div>

        {/* ── CTA ── */}
        <button
          onClick={() => navigate(`/client/projects/${project.id}`)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: 'var(--accent-hover)' }}
        >
          Voir mon projet <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default ProjectActivatedPage
