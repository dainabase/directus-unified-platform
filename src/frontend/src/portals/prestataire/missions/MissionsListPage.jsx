/**
 * MissionsListPage — Story 4.2
 * Liste des missions (projets) assignees au prestataire connecte.
 * Filtre par main_provider_id via Directus, recherche par nom, filtre par statut.
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban, Search, Calendar, Building2, ArrowRight, Loader2
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

const STATUS_MAP = {
  active: { label: 'En cours', color: 'var(--semantic-green)' },
  in_progress: { label: 'En cours', color: 'var(--semantic-green)' },
  'in-progress': { label: 'En cours', color: 'var(--semantic-green)' },
  completed: { label: 'Termine', color: 'var(--accent)' },
  planned: { label: 'Planifie', color: '#6B7280' },
  draft: { label: 'Brouillon', color: '#9CA3AF' }
}

const STATUS_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'active', label: 'En cours' },
  { value: 'completed', label: 'Terminees' },
  { value: 'planned', label: 'Planifiees' }
]

const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || { label: status || 'Inconnu', color: '#9CA3AF' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  )
}

const MissionCard = ({ mission, onClick }) => {
  const clientName = mission.client_id?.name
  const ownerName = mission.owner_company?.name

  return (
    <div
      className="ds-card p-5 hover:border-blue-200 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 leading-tight pr-3">
          {mission.name}
        </h3>
        <StatusBadge status={mission.status} />
      </div>

      {/* Tags: client + owner company */}
      <div className="flex flex-wrap gap-2 mb-3">
        {clientName && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-xs text-blue-700 font-medium">
            <Building2 size={12} />
            {clientName}
          </span>
        )}
        {ownerName && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600 font-medium">
            {ownerName}
          </span>
        )}
      </div>

      {/* Date range */}
      {(mission.start_date || mission.end_date) && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <Calendar size={14} />
          {mission.start_date && format(new Date(mission.start_date), 'dd.MM.yyyy', { locale: fr })}
          {mission.start_date && mission.end_date && ' \u2192 '}
          {mission.end_date && format(new Date(mission.end_date), 'dd.MM.yyyy', { locale: fr })}
        </div>
      )}

      {/* Budget */}
      {mission.budget != null && mission.budget > 0 && (
        <p className="text-sm font-medium text-gray-800 mb-2">
          {formatCHF(mission.budget)}
        </p>
      )}

      {/* Description */}
      {mission.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {mission.description.length > 100
            ? `${mission.description.slice(0, 100)}...`
            : mission.description}
        </p>
      )}

      {/* Action */}
      <div className="flex items-center justify-end pt-3 border-t border-gray-100">
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-hover)] text-white hover:bg-blue-700 transition-colors">
          Voir detail <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

const SkeletonCard = () => (
  <div className="ds-card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="ds-skeleton h-5 w-48 rounded" />
      <div className="ds-skeleton h-5 w-20 rounded-full" />
    </div>
    <div className="flex gap-2 mb-3">
      <div className="ds-skeleton h-5 w-24 rounded-md" />
      <div className="ds-skeleton h-5 w-20 rounded-md" />
    </div>
    <div className="ds-skeleton h-4 w-40 rounded mb-2" />
    <div className="ds-skeleton h-4 w-24 rounded mb-2" />
    <div className="ds-skeleton h-4 w-full rounded mb-4" />
    <div className="border-t border-gray-100 pt-3 flex justify-end">
      <div className="ds-skeleton h-7 w-24 rounded-lg" />
    </div>
  </div>
)

const MissionsListPage = () => {
  const { provider } = useProviderAuth()
  const navigate = useNavigate()
  const providerId = provider?.id

  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch missions from Directus
  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['provider-missions', providerId, statusFilter],
    queryFn: async () => {
      const filter = { main_provider_id: { _eq: providerId } }
      if (statusFilter !== 'all') filter.status = { _eq: statusFilter }
      const { data } = await api.get('/items/projects', {
        params: {
          filter,
          fields: ['id', 'name', 'status', 'start_date', 'end_date', 'budget', 'description', 'owner_company.name', 'client_id.name'],
          sort: ['-date_created'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Client-side search filter
  const filteredMissions = useMemo(() => {
    if (!searchQuery.trim()) return missions
    const q = searchQuery.toLowerCase().trim()
    return missions.filter(m =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q)
    )
  }, [missions, searchQuery])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="ds-page-title">Mes missions</h1>
          <p className="text-sm text-gray-500 mt-1">Chargement de vos missions...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="ds-page-title">Mes missions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Projets et missions qui vous sont assignes en tant que prestataire
        </p>
      </div>

      {/* Filter bar */}
      <div className="ds-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Status filter buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-[var(--accent-hover)] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 w-full sm:w-auto sm:min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une mission..."
              className="ds-input w-full pl-9 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Missions grid */}
      {filteredMissions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMissions.map(mission => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClick={() => navigate(`/prestataire/missions/${mission.id}`)}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="ds-card p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Aucune mission</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchQuery
              ? 'Aucune mission ne correspond a votre recherche.'
              : statusFilter !== 'all'
                ? 'Aucune mission avec ce statut pour le moment.'
                : 'Vous serez notifie des qu\'HYPERVISUAL vous attribuera une mission.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default MissionsListPage
