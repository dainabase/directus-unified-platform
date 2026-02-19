// src/frontend/src/portals/superadmin/crm/components/PipelineView.jsx
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Target, Plus, MoreVertical, DollarSign, Calendar, User,
  ArrowRight, Phone, Mail, Clock, TrendingUp, Building2, X,
  GripVertical, Award
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../../lib/axios'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGES = [
  { id: 'new', label: 'Nouveau', color: 'blue', probability: 10 },
  { id: 'contacted', label: 'Contacte', color: 'cyan', probability: 25 },
  { id: 'qualified', label: 'Qualifie', color: 'green', probability: 50 },
  { id: 'proposal', label: 'Proposition', color: 'yellow', probability: 75 },
  { id: 'negotiation', label: 'Negociation', color: 'orange', probability: 90 },
  { id: 'won', label: 'Gagne', color: 'emerald', probability: 100 },
]

const STAGE_BG = {
  blue: 'bg-blue-50 border-blue-200',
  cyan: 'bg-cyan-50 border-cyan-200',
  green: 'bg-green-50 border-green-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  orange: 'bg-orange-50 border-orange-200',
  emerald: 'bg-emerald-50 border-emerald-200',
}

const STAGE_DOT = {
  blue: 'bg-blue-500',
  cyan: 'bg-cyan-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
}

const STAGE_BADGE = {
  blue: 'bg-blue-100 text-blue-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  orange: 'bg-orange-100 text-orange-700',
  emerald: 'bg-emerald-100 text-emerald-700',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCHF = (amount) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(amount || 0)

const daysFrom = (dateString) => {
  if (!dateString) return 0
  const diff = Date.now() - new Date(dateString).getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

const fetchLeads = async (company) => {
  try {
    const filter = company && company !== 'all' ? { company: { _eq: company } } : {}
    const res = await api.get('/items/leads', {
      params: {
        filter,
        fields: ['id', 'first_name', 'last_name', 'company_name', 'estimated_value', 'status', 'date_created', 'email', 'phone'],
        sort: ['-date_created'],
        limit: -1
      }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

const PipelineSkeleton = () => (
  <div className="space-y-6">
    {/* KPI skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="glass-skeleton h-4 w-24 rounded mb-3" />
          <div className="glass-skeleton h-8 w-32 rounded" />
        </div>
      ))}
    </div>
    {/* Board skeleton */}
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-72">
          <div className="glass-skeleton h-16 rounded-lg mb-3" />
          <div className="space-y-3">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="glass-skeleton h-32 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PipelineView = ({ selectedCompany }) => {
  const queryClient = useQueryClient()
  const [draggedLead, setDraggedLead] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)
  const [selectedDeal, setSelectedDeal] = useState(null)

  // Fetch leads from Directus
  const { data: leads = [], isLoading, isError } = useQuery({
    queryKey: ['pipeline-leads', selectedCompany],
    queryFn: () => fetchLeads(selectedCompany),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2
  })

  // Mutation: update lead status on drag-and-drop
  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, newStatus }) => {
      const res = await api.patch(`/items/leads/${leadId}`, { status: newStatus })
      return res.data?.data
    },
    onSuccess: (_data, variables) => {
      const stage = STAGES.find(s => s.id === variables.newStatus)
      toast.success(`Lead deplace vers ${stage?.label || variables.newStatus}`)
      queryClient.invalidateQueries({ queryKey: ['pipeline-leads'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline'] })
      queryClient.invalidateQueries({ queryKey: ['crm-stats'] })
    },
    onError: () => {
      toast.error('Erreur lors du deplacement du lead')
      queryClient.invalidateQueries({ queryKey: ['pipeline-leads'] })
    }
  })

  // Group leads by status
  const stageMap = useMemo(() => {
    const map = {}
    STAGES.forEach(s => { map[s.id] = [] })
    leads.forEach(lead => {
      const status = lead.status || 'new'
      if (map[status]) {
        map[status].push(lead)
      } else {
        // Unknown status -> put in 'new'
        map.new.push(lead)
      }
    })
    return map
  }, [leads])

  // KPI calculations
  const kpis = useMemo(() => {
    let totalValue = 0
    let weightedValue = 0
    let totalCount = leads.length
    let wonValue = 0

    STAGES.forEach(stage => {
      const stageLeads = stageMap[stage.id] || []
      const stageTotal = stageLeads.reduce((sum, l) => sum + parseFloat(l.estimated_value || 0), 0)
      totalValue += stageTotal
      weightedValue += stageTotal * (stage.probability / 100)
      if (stage.id === 'won') wonValue = stageTotal
    })

    return { totalValue, weightedValue, totalCount, wonValue }
  }, [leads, stageMap])

  // Drag handlers
  const handleDragStart = (e, lead, sourceStage) => {
    setDraggedLead({ lead, sourceStage })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', lead.id)
  }

  const handleDragOver = (e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e, targetStage) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggedLead || draggedLead.sourceStage === targetStage) {
      setDraggedLead(null)
      return
    }

    // Optimistic update via mutation
    updateStatusMutation.mutate({
      leadId: draggedLead.lead.id,
      newStatus: targetStage
    })
    setDraggedLead(null)
  }

  // Advance deal to next stage from modal
  const handleAdvanceDeal = () => {
    if (!selectedDeal) return
    const currentIdx = STAGES.findIndex(s => s.id === (selectedDeal.status || 'new'))
    if (currentIdx < STAGES.length - 1) {
      const nextStage = STAGES[currentIdx + 1]
      updateStatusMutation.mutate({
        leadId: selectedDeal.id,
        newStatus: nextStage.id
      })
      setSelectedDeal(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Pipeline Commercial
            </h2>
            <p className="text-sm text-gray-500 mt-1">Chargement des opportunites...</p>
          </div>
        </div>
        <PipelineSkeleton />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Pipeline Commercial
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des opportunites de vente
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Pipeline */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-500">Pipeline total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCHF(kpis.totalValue)}</div>
        </div>

        {/* Weighted Value */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-500">Valeur ponderee</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCHF(kpis.weightedValue)}</div>
        </div>

        {/* Total Leads */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-gray-500">Total leads</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{kpis.totalCount}</div>
        </div>

        {/* Won / Closing */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-gray-500">Gagne</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCHF(kpis.wonValue)}</div>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="glass-card p-4 mb-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded-lg">
          Impossible de charger les donnees du pipeline. Verifiez la connexion a Directus.
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '520px' }}>
        {STAGES.map(stage => {
          const stageLeads = stageMap[stage.id] || []
          const stageTotal = stageLeads.reduce((sum, l) => sum + parseFloat(l.estimated_value || 0), 0)
          const isDropTarget = dragOverStage === stage.id && draggedLead?.sourceStage !== stage.id

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-72 rounded-xl transition-all duration-200 ${
                isDropTarget ? 'ring-2 ring-blue-400 ring-offset-2' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-xl border ${STAGE_BG[stage.color]}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${STAGE_DOT[stage.color]}`} />
                    <h3 className="font-semibold text-gray-900 text-sm">{stage.label}</h3>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_BADGE[stage.color]}`}>
                    {stageLeads.length}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{stage.probability}% probabilite</span>
                  <span className="font-medium text-gray-700">{formatCHF(stageTotal)}</span>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-3 min-h-[400px] bg-gray-50/50 rounded-b-xl border border-t-0 border-gray-200">
                {stageLeads.map(lead => {
                  const daysInStage = daysFrom(lead.date_created)
                  const displayName = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || 'Sans nom'

                  return (
                    <div
                      key={lead.id}
                      className="glass-card p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead, stage.id)}
                      onClick={() => setSelectedDeal({ ...lead, _stage: stage.id })}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">
                          {displayName}
                        </h4>
                        <button
                          className="p-1 rounded hover:bg-gray-100 text-gray-400"
                          onClick={(e) => { e.stopPropagation() }}
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>

                      {/* Company */}
                      {lead.company_name && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                          <Building2 size={12} />
                          <span className="truncate">{lead.company_name}</span>
                        </div>
                      )}

                      {/* Contact info */}
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                          <Mail size={12} />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <Phone size={12} />
                          <span>{lead.phone}</span>
                        </div>
                      )}

                      {/* Value + days */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="font-bold text-blue-600 text-sm">
                          {formatCHF(lead.estimated_value)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={10} />
                          {daysInStage}j
                        </span>
                      </div>
                    </div>
                  )
                })}

                {/* Empty state */}
                {stageLeads.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    <Target size={20} className="mb-1 opacity-50" />
                    Aucun lead
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedDeal(null)}
        >
          <div
            className="glass-card w-full max-w-md mx-4 p-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {[selectedDeal.first_name, selectedDeal.last_name].filter(Boolean).join(' ') || 'Sans nom'}
              </h3>
              <button
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                onClick={() => setSelectedDeal(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Stage badge */}
              {(() => {
                const currentStage = STAGES.find(s => s.id === (selectedDeal.status || selectedDeal._stage))
                return currentStage ? (
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${STAGE_DOT[currentStage.color]}`} />
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STAGE_BADGE[currentStage.color]}`}>
                      {currentStage.label} ({currentStage.probability}%)
                    </span>
                  </div>
                ) : null
              })()}

              {/* Company */}
              {selectedDeal.company_name && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Entreprise</label>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Building2 size={16} className="text-gray-400" />
                    {selectedDeal.company_name}
                  </div>
                </div>
              )}

              {/* Value */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Valeur estimee</label>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCHF(selectedDeal.estimated_value)}
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                {selectedDeal.email && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <div className="text-sm text-gray-900 truncate">{selectedDeal.email}</div>
                  </div>
                )}
                {selectedDeal.phone && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Telephone</label>
                    <div className="text-sm text-gray-900">{selectedDeal.phone}</div>
                  </div>
                )}
              </div>

              {/* Days info */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Jours dans le pipeline</label>
                <div className="flex items-center gap-1 text-sm text-gray-700">
                  <Clock size={14} className="text-gray-400" />
                  {daysFrom(selectedDeal.date_created)} jours
                </div>
              </div>

              {/* Date created */}
              {selectedDeal.date_created && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date de creation</label>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(selectedDeal.date_created).toLocaleDateString('fr-CH', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2 pt-2">
                {selectedDeal.phone && (
                  <a
                    href={`tel:${selectedDeal.phone}`}
                    className="glass-button flex items-center gap-1.5 px-3 py-2 text-sm flex-1 justify-center"
                  >
                    <Phone size={14} /> Appeler
                  </a>
                )}
                {selectedDeal.email && (
                  <a
                    href={`mailto:${selectedDeal.email}`}
                    className="glass-button flex items-center gap-1.5 px-3 py-2 text-sm flex-1 justify-center"
                  >
                    <Mail size={14} /> Email
                  </a>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
              <button
                className="glass-button px-4 py-2 text-sm"
                onClick={() => setSelectedDeal(null)}
              >
                Fermer
              </button>
              {(() => {
                const currentIdx = STAGES.findIndex(s => s.id === (selectedDeal.status || selectedDeal._stage))
                const hasNext = currentIdx >= 0 && currentIdx < STAGES.length - 1
                const nextStage = hasNext ? STAGES[currentIdx + 1] : null
                return hasNext ? (
                  <button
                    className="glass-button glass-button-primary flex items-center gap-1.5 px-4 py-2 text-sm"
                    onClick={handleAdvanceDeal}
                    disabled={updateStatusMutation.isPending}
                  >
                    <ArrowRight size={14} />
                    {updateStatusMutation.isPending ? 'Deplacement...' : `Vers ${nextStage.label}`}
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <Award size={14} /> Gagne
                  </span>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PipelineView
