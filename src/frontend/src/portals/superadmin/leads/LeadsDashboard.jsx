import React, { useState } from 'react'
import {
  UserPlus, Users, Target, Phone, Mail, MessageSquare,
  Calendar, TrendingUp, Filter, Search, Plus, MoreVertical,
  ChevronRight, Clock, Star, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Loader2, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

import { GlassCard, Badge } from '../../../components/ui'
import LeadsList from './components/LeadsList'
import LeadForm from './components/LeadForm'
import LeadKanban from './components/LeadKanban'
import LeadStats from './components/LeadStats'
import { useLeads, useLeadStats, LEAD_STATUSES } from '../../../hooks/useLeads'

const LeadsDashboard = ({ selectedCompany }) => {
  const [view, setView] = useState('kanban')
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

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

  // Stats réelles depuis Directus
  const { data: stats, isLoading: statsLoading } = useLeadStats(selectedCompany)

  // Stats par défaut si loading
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

  const handleCreateLead = () => {
    setEditingLead(null)
    setShowForm(true)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setShowForm(true)
  }

  const handleSaveLead = async (leadData) => {
    try {
      if (editingLead) {
        await updateLead({ id: editingLead.id, data: leadData })
        toast.success('Lead mis à jour')
      } else {
        // Ajouter owner_company si sélectionné
        const dataWithCompany = selectedCompany && selectedCompany !== 'all'
          ? { ...leadData, company: selectedCompany }
          : leadData
        await createLead(dataWithCompany)
        toast.success('Lead créé')
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
      toast.success('Lead supprimé')
    } catch (err) {
      toast.error(`Erreur: ${err.message}`)
    }
  }

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await changeStatus({ id: leadId, status: newStatus })
      toast.success(`Statut mis à jour: ${LEAD_STATUSES.find(s => s.value === newStatus)?.label || newStatus}`)
    } catch (err) {
      toast.error(`Erreur: ${err.message}`)
    }
  }

  // Filtrage côté client pour source (le reste est géré par le hook)
  const filteredLeads = leads.filter(lead => {
    const matchesSource = sourceFilter === 'all' ||
      (lead.notes && lead.notes.toLowerCase().includes(sourceFilter.toLowerCase()))
    return matchesSource
  })

  // Affichage erreur
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
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
            {isLoading && <span className="ml-2 text-blue-600">Chargement...</span>}
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
                view === 'kanban' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Liste
            </button>
          </div>

          {/* Add Lead Button */}
          <button
            onClick={handleCreateLead}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCreating ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            Nouveau Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <LeadStats stats={displayStats} isLoading={statsLoading} />

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="contacted">Contacté</option>
            <option value="qualified">Qualifié</option>
            <option value="proposal">Proposition</option>
            <option value="negotiation">Négociation</option>
            <option value="won">Gagné</option>
            <option value="lost">Perdu</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
      </GlassCard>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des leads...</p>
          </div>
        </div>
      ) : view === 'kanban' ? (
        <LeadKanban
          leads={filteredLeads}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <LeadsList
          leads={filteredLeads}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
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
    </div>
  )
}

export default LeadsDashboard
