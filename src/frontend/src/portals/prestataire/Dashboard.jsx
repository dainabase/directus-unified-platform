/**
 * ProviderDashboard — Phase D-02
 * Dashboard prestataire connecte Directus, filtre par provider_id.
 * Cartes statut + section "A faire" + timeline.
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  FileText, FolderKanban, Receipt, CreditCard,
  ArrowRight, Clock, Loader2, AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'
import { useProviderAuth } from './hooks/useProviderAuth'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

// -- Stat card component --
const StatCard = ({ icon: Icon, label, value, subtitle, color = 'violet' }) => {
  const colorMap = {
    violet: 'from-violet-500 to-indigo-600',
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600'
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

const ProviderDashboard = () => {
  const { provider } = useProviderAuth()
  const navigate = useNavigate()
  const providerId = provider?.id

  // Fetch pending proposals count
  const { data: pendingProposals = 0 } = useQuery({
    queryKey: ['provider-pending-proposals', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/proposals', {
        params: {
          filter: { provider_id: { _eq: providerId }, status: { _in: ['draft', 'pending'] } },
          aggregate: { count: ['*'] }
        }
      })
      return parseInt(data?.data?.[0]?.count || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch active projects count
  const { data: activeProjects = 0 } = useQuery({
    queryKey: ['provider-active-projects', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: { main_provider_id: { _eq: providerId }, status: { _in: ['active', 'in_progress', 'in-progress'] } },
          aggregate: { count: ['*'] }
        }
      })
      return parseInt(data?.data?.[0]?.count || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch pending payments amount
  const { data: pendingPayments = 0 } = useQuery({
    queryKey: ['provider-pending-payments', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/supplier_invoices', {
        params: {
          filter: { provider_id: { _eq: providerId }, status: { _in: ['pending', 'approved'] } },
          aggregate: { sum: ['amount'] }
        }
      })
      return parseFloat(data?.data?.[0]?.sum?.amount || 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch projects without supplier invoice (need to submit)
  const { data: projectsNeedInvoice = [] } = useQuery({
    queryKey: ['provider-projects-need-invoice', providerId],
    queryFn: async () => {
      // Get active projects for this provider
      const { data: projects } = await api.get('/items/projects', {
        params: {
          filter: { main_provider_id: { _eq: providerId }, status: { _in: ['active', 'in_progress', 'in-progress'] } },
          fields: ['id', 'name'],
          limit: 50
        }
      })
      const projectList = projects?.data || []
      if (projectList.length === 0) return []

      // Get existing supplier invoices for these projects
      const projectIds = projectList.map(p => p.id)
      const { data: invoices } = await api.get('/items/supplier_invoices', {
        params: {
          filter: { provider_id: { _eq: providerId }, project_id: { _in: projectIds } },
          fields: ['project_id']
        }
      })
      const invoicedProjectIds = new Set((invoices?.data || []).map(i => i.project_id))
      return projectList.filter(p => !invoicedProjectIds.has(p.id))
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  // Fetch unanswered proposals
  const { data: unansweredProposals = [] } = useQuery({
    queryKey: ['provider-unanswered-proposals', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/proposals', {
        params: {
          filter: { provider_id: { _eq: providerId }, status: { _in: ['draft', 'pending'] } },
          fields: ['id', 'name', 'description', 'created_at', 'project_id'],
          sort: ['-created_at'],
          limit: 10
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2
  })

  const displayName = provider?.contact_person || provider?.name || 'Prestataire'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {displayName.split(' ')[0]} — Espace prestataire HYPERVISUAL
        </h1>
        <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre activite</p>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Demandes en attente"
          value={pendingProposals}
          subtitle="Devis a soumettre"
          color="violet"
        />
        <StatCard
          icon={FolderKanban}
          label="Projets en cours"
          value={activeProjects}
          subtitle="Missions actives"
          color="blue"
        />
        <StatCard
          icon={Receipt}
          label="Factures a soumettre"
          value={projectsNeedInvoice.length}
          subtitle="Projets sans facture"
          color="amber"
        />
        <StatCard
          icon={CreditCard}
          label="Paiements en attente"
          value={formatCHF(pendingPayments)}
          subtitle="Montant en cours"
          color="emerald"
        />
      </div>

      {/* Section "A faire" */}
      {(unansweredProposals.length > 0 || projectsNeedInvoice.length > 0) && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Actions requises
            </h2>
          </div>

          <div className="space-y-3">
            {/* Unanswered proposals */}
            {unansweredProposals.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-violet-50/50 border border-violet-100 hover:bg-violet-50 transition-colors cursor-pointer"
                onClick={() => navigate('/prestataire/quotes')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <FileText size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.name || 'Demande de devis'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.created_at && format(new Date(p.created_at), 'dd.MM.yyyy', { locale: fr })}
                      {p.description && ` — ${p.description.slice(0, 60)}...`}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                  Soumettre mon offre <ArrowRight size={14} />
                </button>
              </div>
            ))}

            {/* Projects without invoice */}
            {projectsNeedInvoice.map(p => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors cursor-pointer"
                onClick={() => navigate('/prestataire/invoices')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Receipt size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">Projet actif sans facture soumise</p>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                  Soumettre ma facture <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {unansweredProposals.length === 0 && projectsNeedInvoice.length === 0 && pendingProposals === 0 && activeProjects === 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Aucune action en attente</h3>
          <p className="text-sm text-gray-500 mt-2">
            Vous serez notifie des qu'HYPERVISUAL vous enverra une demande de devis.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProviderDashboard
