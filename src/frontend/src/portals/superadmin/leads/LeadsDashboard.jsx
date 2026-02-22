import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus, Users, Target, Phone, Mail, MessageSquare,
  Calendar, TrendingUp, Filter, Search, Plus, MoreVertical,
  ChevronRight, Clock, Star, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw,
  FileText, Archive, X, ThermometerSun
} from 'lucide-react'
import toast from 'react-hot-toast'

import { Badge } from '../../../components/ui'
import api from '../../../lib/axios'
import LeadsList from './components/LeadsList'
import LeadForm from './components/LeadForm'
import LeadKanban from './components/LeadKanban'
import LeadStats from './components/LeadStats'
import LeadDetail from './components/LeadDetail'
import { useLeads, useLeadStats, LEAD_STATUSES } from '../../../hooks/useLeads'

// ─────────────────────────────────────────────────────────
// Helper: Age badge based on hours since date_created
// ─────────────────────────────────────────────────────────
const getAgeBadge = (dateCreated) => {
  if (!dateCreated) return { label: '', className: '' }
  const now = new Date()
  const created = new Date(dateCreated)
  const diffMs = now - created
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours < 24) {
    return {
      label: 'Nouveau',
      className: 'ds-badge ds-badge-success'
    }
  }
  if (diffHours < 48) {
    return {
      label: '24h+',
      className: 'ds-badge ds-badge-warning'
    }
  }
  return {
    label: 'URGENT',
    className: 'ds-badge ds-badge-danger font-bold'
  }
}

// ─────────────────────────────────────────────────────────
// Qualification score labels
// ─────────────────────────────────────────────────────────
const QUALIFICATION_SCORES = [
  { value: 1, label: 'Froid' },
  { value: 2, label: 'Tiede' },
  { value: 3, label: 'Interesse' },
  { value: 4, label: 'Chaud' },
  { value: 5, label: 'Tres chaud' }
]

const NEXT_ACTIONS = [
  { value: 'call', label: 'Appeler' },
  { value: 'email', label: 'Envoyer email' },
  { value: 'meeting', label: 'Planifier RDV' },
  { value: 'quote', label: 'Envoyer devis' }
]

// ─────────────────────────────────────────────────────────
// QualifyModal — glassmorphism overlay
// ─────────────────────────────────────────────────────────
const QualifyModal = ({ lead, onSave, onClose, isSaving }) => {
  const [score, setScore] = useState(3)
  const [notes, setNotes] = useState('')
  const [nextAction, setNextAction] = useState('call')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      id: lead.id,
      data: {
        status: 'qualified',
        qualification_score: score,
        notes: notes.trim() || lead.notes || '',
        next_action: nextAction
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg ds-card p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ThermometerSun size={20} style={{color:'var(--semantic-orange)'}} />
              Qualifier le lead
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {lead.first_name} {lead.last_name}
              {lead.company_name ? ` — ${lead.company_name}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Qualification score */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Score de qualification
            </label>
            <div className="flex gap-2">
              {QUALIFICATION_SCORES.map((qs) => (
                <label
                  key={qs.value}
                  className={`flex-1 cursor-pointer text-center rounded-xl border-2 py-3 px-2 transition-all ${
                    score === qs.value
                      ? 'border-gray-200 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  style={score === qs.value ? {borderColor:'var(--accent)', background:'rgba(0,113,227,0.06)'} : undefined}
                >
                  <input
                    type="radio"
                    name="qualification_score"
                    value={qs.value}
                    checked={score === qs.value}
                    onChange={() => setScore(qs.value)}
                    className="sr-only"
                  />
                  <div className={`text-xl font-bold ${
                    score === qs.value ? '' : 'text-gray-400'
                  }`} style={score === qs.value ? {color:'var(--accent)'} : undefined}>
                    {qs.value}
                  </div>
                  <div className={`text-xs mt-0.5 ${
                    score === qs.value ? 'font-medium' : 'text-gray-500'
                  }`} style={score === qs.value ? {color:'var(--accent)'} : undefined}>
                    {qs.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* CEO notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Notes CEO
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, contexte, potentiel..."
              rows={3}
              className="ds-input w-full text-sm resize-none"
            />
          </div>

          {/* Next action */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Prochaine action
            </label>
            <select
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="ds-input w-full text-sm"
            >
              {NEXT_ACTIONS.map((na) => (
                <option key={na.value} value={na.value}>
                  {na.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="ds-btn ds-btn-primary text-sm disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              Qualifier
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// LeadsDashboard — Main component
// ─────────────────────────────────────────────────────────
const LeadsDashboard = ({ selectedCompany }) => {
  const navigate = useNavigate()

  const [view, setView] = useState('kanban')
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  // Qualify modal state
  const [qualifyingLead, setQualifyingLead] = useState(null)
  // Converting state
  const [convertingLeadId, setConvertingLeadId] = useState(null)

  // Connexion Directus via hooks
  const {
    leads,
    isLoading,
    error,
    refetch,
    createLead,
    updateLead,
    deleteLead,
    changeStatus,
    isCreating,
    isUpdating,
    isDeleting
  } = useLeads({
    company: selectedCompany,
    status: statusFilter !== 'all' ? statusFilter : null,
    search: searchQuery
  })

  // Stats reelles depuis Directus
  const { data: stats, isLoading: statsLoading } = useLeadStats(selectedCompany)

  // Stats par defaut si loading
  const displayStats = stats || {
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
    conversionRate: 0,
    avgDealSize: 0,
    avgScore: 0,
    totalValue: 0
  }

  // ── Existing handlers ──

  const handleCreateLead = () => {
    setEditingLead(null)
    setShowForm(true)
  }

  const handleViewLead = (lead) => {
    setSelectedLead(lead)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setShowForm(true)
  }

  const handleSaveLead = async (leadData) => {
    try {
      if (editingLead) {
        await updateLead({ id: editingLead.id, data: leadData })
        toast.success('Lead mis a jour')
      } else {
        // Ajouter owner_company si selectionne
        const dataWithCompany = selectedCompany && selectedCompany !== 'all'
          ? { ...leadData, company: selectedCompany }
          : leadData
        await createLead(dataWithCompany)
        toast.success('Lead cree')
      }
      setShowForm(false)
      setEditingLead(null)
    } catch (err) {
      toast.error(`Erreur: ${err.message}`)
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Supprimer ce lead ?')) return
    try {
      await deleteLead(leadId)
      toast.success('Lead supprime')
    } catch (err) {
      toast.error(`Erreur: ${err.message}`)
    }
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await changeStatus({ id: leadId, status: newStatus })
      toast.success(`Statut mis a jour: ${LEAD_STATUSES.find(s => s.value === newStatus)?.label || newStatus}`)
    } catch (err) {
      toast.error(`Erreur: ${err.message}`)
    }
  }

  // ── New handlers: Qualify, Convert, Archive ──

  /**
   * handleQualify — called from QualifyModal onSave
   * PATCHes the lead to status 'qualified' with score, notes, next_action
   */
  const handleQualify = useCallback(async ({ id, data }) => {
    try {
      await updateLead({ id, data })
      toast.success('Lead qualifie avec succes')
      setQualifyingLead(null)
      // If we were viewing this lead in detail, update local ref
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) => ({ ...prev, ...data }))
      }
    } catch (err) {
      toast.error(`Erreur qualification: ${err.message}`)
    }
  }, [updateLead, selectedLead])

  /**
   * handleConvertToQuote — creates a project then patches lead to 'proposal',
   * then navigates to quote creation page
   */
  const handleConvertToQuote = useCallback(async (lead) => {
    if (!lead) return
    const confirmMsg = `Convertir "${lead.first_name} ${lead.last_name}" en devis ? Un projet sera cree automatiquement.`
    if (!window.confirm(confirmMsg)) return

    setConvertingLeadId(lead.id)
    try {
      // 1. Create project
      const { data: projectRes } = await api.post('/items/projects', {
        name: `Projet ${lead.first_name} ${lead.last_name} — ${lead.company_name || ''}`.trim(),
        status: 'quote_sent',
        lead_id: lead.id,
        project_type: lead.project_type || 'service',
        owner_company: lead.company || selectedCompany,
        total_revenue: parseFloat(lead.budget_estimate || lead.estimated_value || 0)
      })

      const project = projectRes?.data || projectRes

      // 2. Patch lead to proposal
      await updateLead({ id: lead.id, data: { status: 'proposal' } })

      toast.success('Projet cree — redirection vers le devis')

      // 3. Navigate to quote creation
      const projectId = project?.id || ''
      navigate(`/superadmin/quotes/new?lead_id=${lead.id}&project_id=${projectId}`)
    } catch (err) {
      toast.error(`Erreur conversion: ${err.message}`)
    } finally {
      setConvertingLeadId(null)
    }
  }, [selectedCompany, updateLead, navigate])

  /**
   * handleArchive — confirms then patches lead status to 'lost'
   */
  const handleArchive = useCallback(async (lead) => {
    if (!lead) return
    const confirmMsg = `Archiver le lead "${lead.first_name} ${lead.last_name}" ? Il sera marque comme perdu.`
    if (!window.confirm(confirmMsg)) return

    try {
      await updateLead({
        id: lead.id,
        data: {
          status: 'lost',
          lost_reason: 'Archive par CEO'
        }
      })
      toast.success('Lead archive')
      // If viewing this lead in detail, go back
      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead(null)
      }
    } catch (err) {
      toast.error(`Erreur archivage: ${err.message}`)
    }
  }, [updateLead, selectedLead])

  // ── Filtering ──

  // Filtrage cote client pour source (le reste est gere par le hook)
  const filteredLeads = leads.filter(lead => {
    const matchesSource = sourceFilter === 'all' ||
      (lead.notes && lead.notes.toLowerCase().includes(sourceFilter.toLowerCase()))
    return matchesSource
  })

  // ── Helpers to check if actions are available ──

  const canQualify = (lead) =>
    lead && (lead.status === 'new' || lead.status === 'contacted')

  const canConvert = (lead) =>
    lead && lead.status === 'qualified'

  const canArchive = (lead) =>
    lead && lead.status !== 'won' && lead.status !== 'lost'

  // ── Detail view with action buttons ──

  if (selectedLead) {
    return (
      <div className="space-y-4">
        {/* CEO Action Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Qualify button */}
          {canQualify(selectedLead) && (
            <button
              onClick={() => setQualifyingLead(selectedLead)}
              className="ds-btn ds-btn-primary text-sm shadow-sm"
            >
              <ThermometerSun size={16} />
              Qualifier
            </button>
          )}

          {/* Convert to quote button */}
          {canConvert(selectedLead) && (
            <button
              onClick={() => handleConvertToQuote(selectedLead)}
              disabled={convertingLeadId === selectedLead.id}
              className="ds-btn ds-btn-primary text-sm shadow-sm disabled:opacity-50"
            >
              {convertingLeadId === selectedLead.id ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              Devis
            </button>
          )}

          {/* Archive button */}
          {canArchive(selectedLead) && (
            <button
              onClick={() => handleArchive(selectedLead)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
            >
              <Archive size={16} />
              Archiver
            </button>
          )}

          {/* Age badge */}
          {selectedLead.date_created && (() => {
            const badge = getAgeBadge(selectedLead.date_created)
            return badge.label ? (
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.className}`}>
                <Clock size={12} />
                {badge.label}
              </span>
            ) : null
          })()}
        </div>

        <LeadDetail
          lead={selectedLead}
          onBack={() => setSelectedLead(null)}
          onEdit={(lead) => { setSelectedLead(null); handleEditLead(lead) }}
          onStatusChange={handleStatusChange}
        />

        {/* Qualify Modal */}
        {qualifyingLead && (
          <QualifyModal
            lead={qualifyingLead}
            onSave={handleQualify}
            onClose={() => setQualifyingLead(null)}
            isSaving={isUpdating}
          />
        )}
      </div>
    )
  }

  // Affichage erreur
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{color:'var(--semantic-red)'}} />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="ds-btn ds-btn-primary"
        >
          Reessayer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Leads
          </h1>
          <p className="text-gray-600">
            Pipeline commercial et prospection
            {isLoading && <span className="ml-2" style={{color:'var(--accent)'}}>Chargement...</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'kanban' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
              style={view === 'kanban' ? {color:'var(--accent)'} : undefined}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white shadow' : 'text-gray-600 hover:text-gray-900'
              }`}
              style={view === 'list' ? {color:'var(--accent)'} : undefined}
            >
              Liste
            </button>
          </div>

          {/* Add Lead Button */}
          <button
            onClick={handleCreateLead}
            disabled={isCreating}
            className="ds-btn ds-btn-primary disabled:opacity-50"
          >
            {isCreating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Nouveau Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <LeadStats stats={displayStats} isLoading={statsLoading} />

      {/* Filters */}
      <div className="ds-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ds-input w-full pl-10 pr-4 py-2"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ds-input px-4 py-2"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="contacted">Contacte</option>
            <option value="qualified">Qualifie</option>
            <option value="proposal">Proposition</option>
            <option value="negotiation">Negociation</option>
            <option value="won">Gagne</option>
            <option value="lost">Perdu</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="ds-input px-4 py-2"
          >
            <option value="all">Toutes les sources</option>
            <option value="Site Web">Site Web</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Recommandation">Recommandation</option>
            <option value="Cold Call">Cold Call</option>
            <option value="Email Marketing">Email Marketing</option>
            <option value="Salon">Salon professionnel</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Partenaire">Partenaire</option>
          </select>

          {/* Results count */}
          <span className="text-sm text-gray-500">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
            ) : (
              `${filteredLeads.length} lead${filteredLeads.length > 1 ? 's' : ''}`
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{color:'var(--accent)'}} />
            <p className="text-gray-600">Chargement des leads...</p>
          </div>
        </div>
      ) : view === 'kanban' ? (
        <LeadKanban
          leads={filteredLeads}
          onEdit={handleViewLead}
          onDelete={handleDeleteLead}
          onStatusChange={handleStatusChange}
          onQualify={setQualifyingLead}
          onConvert={handleConvertToQuote}
          onArchive={handleArchive}
          getAgeBadge={getAgeBadge}
        />
      ) : (
        <LeadsList
          leads={filteredLeads}
          onEdit={handleViewLead}
          onDelete={handleDeleteLead}
          onQualify={setQualifyingLead}
          onConvert={handleConvertToQuote}
          onArchive={handleArchive}
          getAgeBadge={getAgeBadge}
        />
      )}

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          lead={editingLead}
          onSave={handleSaveLead}
          onClose={() => {
            setShowForm(false)
            setEditingLead(null)
          }}
        />
      )}

      {/* Qualify Modal */}
      {qualifyingLead && (
        <QualifyModal
          lead={qualifyingLead}
          onSave={handleQualify}
          onClose={() => setQualifyingLead(null)}
          isSaving={isUpdating}
        />
      )}
    </div>
  )
}

export default LeadsDashboard
