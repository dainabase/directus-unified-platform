/**
 * ActiveProjectsWidget — Story 2.6
 * Projets actifs en temps reel depuis Directus.
 * Affiche les projets actifs/in-progress avec progression et deadlines.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { FolderOpen, Calendar, Users, Loader2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v || 0)

const ActiveProjectsWidget = ({ selectedCompany, maxItems = 8 }) => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['active-projects', selectedCompany],
    queryFn: async () => {
      const filter = {
        status: { _in: ['active', 'in_progress', 'in-progress'] }
      }
      if (selectedCompany && selectedCompany !== 'all') {
        filter.owner_company = { _eq: selectedCompany }
      }
      const { data } = await api.get('/items/projects', {
        params: {
          filter,
          fields: ['id', 'name', 'status', 'start_date', 'end_date', 'budget', 'progress', 'main_provider_id', 'owner_company', 'date_created'],
          sort: ['-date_created'],
          limit: maxItems
        }
      })
      return data?.data || []
    },
    staleTime: 30_000,
    refetchInterval: 60_000
  })

  const getProgress = (p) => {
    if (p.progress != null) return Math.min(100, Math.max(0, p.progress))
    if (!p.start_date || !p.end_date) return 0
    const total = differenceInDays(new Date(p.end_date), new Date(p.start_date))
    const elapsed = differenceInDays(new Date(), new Date(p.start_date))
    if (total <= 0) return 100
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
  }

  const getDaysLeft = (p) => {
    if (!p.end_date) return null
    return differenceInDays(new Date(p.end_date), new Date())
  }

  if (isLoading) {
    return (
      <div className="ds-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={16} className="text-blue-500" />
          <h3 className="ds-card-title">Projets actifs</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="ds-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-blue-500" />
          <h3 className="ds-card-title">Projets actifs</h3>
        </div>
        <span className="text-xs text-gray-400">{projects.length} projet(s)</span>
      </div>

      {projects.length === 0 ? (
        <div className="py-6 text-center">
          <FolderOpen className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aucun projet actif</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => {
            const progress = getProgress(p)
            const daysLeft = getDaysLeft(p)
            const isOverdue = daysLeft !== null && daysLeft < 0
            return (
              <div key={p.id} className="group">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">
                    {p.budget ? formatCHF(p.budget) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: isOverdue ? 'var(--semantic-red)' : 'var(--accent)'
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 w-8 text-right">{progress}%</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {p.end_date && (
                    <span className={`flex items-center gap-1 text-[11px] ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      <Calendar size={10} />
                      {isOverdue
                        ? `${Math.abs(daysLeft)}j retard`
                        : daysLeft !== null
                          ? `${daysLeft}j restants`
                          : format(new Date(p.end_date), 'dd MMM', { locale: fr })
                      }
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ActiveProjectsWidget
