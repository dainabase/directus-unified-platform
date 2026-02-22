/**
 * MissionDetailPage — Story 4.3 (Prestataire Portal)
 * Detail view of a single mission (project) for the prestataire.
 * Shows project info, deliverables, team, documents.
 * Fetches from Directus: projects, deliverables, project_documents.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Building2, Briefcase, CreditCard,
  Clock, CheckCircle, AlertCircle, FileText, Download,
  Loader2, User, Package
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

// ── Format CHF ──
const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

// ── Format date DD.MM.YYYY ──
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: fr })
  } catch {
    return '—'
  }
}

// ── Status badge configuration ──
const STATUS_CONFIG = {
  draft:       { label: 'Brouillon',  bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-2)',   icon: Clock },
  pending:     { label: 'En attente', bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)', icon: Clock },
  active:      { label: 'Actif',      bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)',  icon: CheckCircle },
  in_progress: { label: 'En cours',   bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)',   icon: Loader2 },
  'in-progress': { label: 'En cours', bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)',   icon: Loader2 },
  completed:   { label: 'Termine',    bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)', icon: CheckCircle },
  cancelled:   { label: 'Annule',     bg: 'rgba(255,59,48,0.12)', fg: 'var(--semantic-red)',     icon: AlertCircle },
  on_hold:     { label: 'En pause',   bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)', icon: Clock }
}

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status || 'Inconnu', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)', icon: Clock }
  const Icon = config.icon
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{background: config.bg, color: config.fg}}>
      <Icon size={12} />
      {config.label}
    </span>
  )
}

// ── Deliverable status badge (can differ from project) ──
const DELIVERABLE_STATUS = {
  draft:       { label: 'Brouillon',  bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-2)' },
  pending:     { label: 'En attente', bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)' },
  in_progress: { label: 'En cours',   bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)' },
  'in-progress': { label: 'En cours', bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)' },
  review:      { label: 'En revue',   bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent)' },
  completed:   { label: 'Termine',    bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)' },
  cancelled:   { label: 'Annule',     bg: 'rgba(255,59,48,0.12)', fg: 'var(--semantic-red)' }
}

// ── Skeleton loader ──
const SkeletonCard = ({ className = '' }) => (
  <div className={`ds-card p-6 ${className}`}>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  </div>
)

// ── Main component ──
const MissionDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { provider } = useProviderAuth()
  const providerId = provider?.id

  // ── Fetch project detail ──
  const { data: mission, isLoading: missionLoading } = useQuery({
    queryKey: ['provider-mission-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/projects/${id}`, {
        params: {
          fields: ['*', 'owner_company.name', 'client_id.name', 'client_id.email']
        }
      })
      return data?.data || null
    },
    enabled: !!id
  })

  // ── Fetch deliverables for this project ──
  const { data: deliverables = [], isLoading: deliverablesLoading } = useQuery({
    queryKey: ['provider-deliverables', id],
    queryFn: async () => {
      const { data } = await api.get('/items/deliverables', {
        params: {
          filter: { project_id: { _eq: id } },
          fields: ['id', 'name', 'status', 'due_date', 'assigned_provider_id'],
          sort: ['due_date']
        }
      })
      return data?.data || []
    },
    enabled: !!id
  })

  // ── Fetch documents for this project ──
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['provider-mission-documents', id],
    queryFn: async () => {
      const { data } = await api.get('/items/project_documents', {
        params: {
          filter: { project_id: { _eq: id } },
          fields: ['id', 'name', 'file_id.id', 'file_id.filename_download', 'date_created'],
          sort: ['-date_created']
        }
      })
      return data?.data || []
    },
    enabled: !!id
  })

  // ── Loading state ──
  if (missionLoading) {
    return (
      <div className="space-y-6">
        {/* Back button skeleton */}
        <div className="animate-pulse h-5 bg-gray-200 rounded w-40" />
        <SkeletonCard />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-48" />
      </div>
    )
  }

  // ── Not found ──
  if (!mission) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/prestataire/missions')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour aux missions
        </button>
        <div className="ds-card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Mission introuvable</h3>
          <p className="text-sm text-gray-500 mt-2">
            Cette mission n'existe pas ou vous n'y avez pas acces.
          </p>
        </div>
      </div>
    )
  }

  // ── Resolve nested fields ──
  const clientName = typeof mission.client_id === 'object' ? mission.client_id?.name : null
  const clientEmail = typeof mission.client_id === 'object' ? mission.client_id?.email : null
  const ownerCompanyName = typeof mission.owner_company === 'object' ? mission.owner_company?.name : null

  // ── Directus asset URL ──
  const apiBase = import.meta.env.VITE_API_URL || ''
  const getAssetUrl = (fileId) => `${apiBase}/assets/${fileId}`

  return (
    <div className="space-y-6">
      {/* ── Back button + Header ── */}
      <div>
        <button
          onClick={() => navigate('/prestataire/missions')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Retour aux missions
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{mission.name}</h1>
              <StatusBadge status={mission.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {clientName && (
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {clientName}
                </span>
              )}
              {mission.start_date && mission.end_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(mission.start_date)} — {formatDate(mission.end_date)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Info grid (2x3) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Budget */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} style={{color:"var(--accent)"}} />
            <span className="text-xs text-gray-500 font-medium">Budget</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCHF(mission.budget)}</p>
        </div>

        {/* Start date */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} style={{color:"var(--semantic-green)"}} />
            <span className="text-xs text-gray-500 font-medium">Date de debut</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatDate(mission.start_date)}</p>
        </div>

        {/* End date */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} style={{color:"var(--semantic-red)"}} />
            <span className="text-xs text-gray-500 font-medium">Date de fin</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatDate(mission.end_date)}</p>
        </div>

        {/* Status */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={16} style={{color:"var(--accent)"}} />
            <span className="text-xs text-gray-500 font-medium">Statut</span>
          </div>
          <div className="mt-1">
            <StatusBadge status={mission.status} />
          </div>
        </div>

        {/* Client */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} style={{color:"var(--accent)"}} />
            <span className="text-xs text-gray-500 font-medium">Client</span>
          </div>
          <p className="text-base font-semibold text-gray-900">{clientName || '—'}</p>
          {clientEmail && (
            <p className="text-xs text-gray-400 mt-0.5">{clientEmail}</p>
          )}
        </div>

        {/* Owner company */}
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-amber-500" />
            <span className="text-xs text-gray-500 font-medium">Entreprise</span>
          </div>
          <p className="text-base font-semibold text-gray-900">{ownerCompanyName || '—'}</p>
        </div>
      </div>

      {/* ── Description ── */}
      {mission.description && (
        <div className="ds-card p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {mission.description}
          </p>
        </div>
      )}

      {/* ── Deliverables table ── */}
      <div className="ds-card p-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Livrables
        </h2>

        {deliverablesLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        ) : deliverables.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucun livrable pour cette mission</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Livrable</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Statut</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Echeance</th>
                  <th className="text-left py-3 text-xs text-gray-500 font-medium">Attribution</th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map(d => {
                  const dConfig = DELIVERABLE_STATUS[d.status] || { label: d.status || '—', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)' }
                  const isAssignedToMe = d.assigned_provider_id === providerId

                  return (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3">
                        <span className="font-medium text-gray-900">{d.name}</span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{background: dConfig.bg, color: dConfig.fg}}>
                          {dConfig.label}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">
                        {formatDate(d.due_date)}
                      </td>
                      <td className="py-3">
                        {isAssignedToMe ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{background:"rgba(0,113,227,0.10)", color:"var(--accent)"}}>
                            <User size={12} />
                            Assigne a moi
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Documents section ── */}
      <div className="ds-card p-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Documents
        </h2>

        {documentsLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucun document</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => {
              const fileId = typeof doc.file_id === 'object' ? doc.file_id?.id : doc.file_id
              const filename = typeof doc.file_id === 'object'
                ? doc.file_id?.filename_download
                : doc.name || 'Document'

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[var(--sep)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{background:"rgba(0,113,227,0.08)"}}>
                      <FileText size={16} style={{color:"var(--accent)"}} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doc.name || filename}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(doc.date_created)}
                      </p>
                    </div>
                  </div>

                  {fileId && (
                    <a
                      href={getAssetUrl(fileId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-zinc-50 transition-colors" style={{color:"var(--accent)"}}
                    >
                      <Download size={14} />
                      Telecharger
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MissionDetailPage
