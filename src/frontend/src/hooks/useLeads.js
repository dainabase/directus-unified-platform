/**
 * useLeads Hook - Connexion aux leads Directus
 * Gère le fetch, cache et mutations des leads
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import directus from '../services/api/directus'
import { normalizeCompanyName } from '../utils/company-filter'

// Statuts des leads
export const LEAD_STATUSES = [
  { value: 'new', label: 'Nouveau', color: 'blue' },
  { value: 'contacted', label: 'Contacté', color: 'cyan' },
  { value: 'qualified', label: 'Qualifié', color: 'green' },
  { value: 'proposal', label: 'Proposition', color: 'yellow' },
  { value: 'negotiation', label: 'Négociation', color: 'orange' },
  { value: 'won', label: 'Gagné', color: 'emerald' },
  { value: 'lost', label: 'Perdu', color: 'red' }
]

// Priorités
export const LEAD_PRIORITIES = [
  { value: 'low', label: 'Basse', color: 'gray' },
  { value: 'medium', label: 'Moyenne', color: 'blue' },
  { value: 'high', label: 'Haute', color: 'orange' },
  { value: 'urgent', label: 'Urgente', color: 'red' }
]

/**
 * Hook principal pour les leads
 */
export function useLeads(options = {}) {
  const {
    company = null,
    status = null,
    source = null,
    priority = null,
    search = '',
    limit = -1
  } = options

  const queryClient = useQueryClient()

  // Construire les filtres
  const buildFilters = () => {
    const filter = {}

    if (company && company !== 'all') {
      filter.company = { _eq: normalizeCompanyName(company) }
    }

    if (status && status !== 'all') {
      filter.status = { _eq: status }
    }

    if (source && source !== 'all') {
      filter.source = { _eq: source }
    }

    if (priority && priority !== 'all') {
      filter.priority = { _eq: priority }
    }

    if (search) {
      filter._or = [
        { first_name: { _icontains: search } },
        { last_name: { _icontains: search } },
        { email: { _icontains: search } },
        { company_name: { _icontains: search } }
      ]
    }

    return Object.keys(filter).length > 0 ? { filter } : {}
  }

  // Query pour les leads
  const leadsQuery = useQuery({
    queryKey: ['leads', { company, status, source, priority, search }],
    queryFn: async () => {
      const params = {
        ...buildFilters(),
        limit,
        sort: ['-date_created']
      }

      const data = await directus.get('leads', params)
      return data || []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false
  })

  // Mutation pour créer un lead
  const createMutation = useMutation({
    mutationFn: async (leadData) => {
      return await directus.create('leads', leadData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })

  // Mutation pour mettre à jour un lead
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await directus.update('leads', id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })

  // Mutation pour supprimer un lead
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await directus.delete('leads', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })

  // Mutation pour changer le statut
  const changeStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await directus.update('leads', id, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })

  return {
    // Data
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    refetch: leadsQuery.refetch,

    // Mutations
    createLead: createMutation.mutateAsync,
    updateLead: updateMutation.mutateAsync,
    deleteLead: deleteMutation.mutateAsync,
    changeStatus: changeStatusMutation.mutateAsync,

    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

/**
 * Hook pour les statistiques des leads
 */
export function useLeadStats(company = null) {
  return useQuery({
    queryKey: ['lead-stats', company],
    queryFn: async () => {
      const filters = company && company !== 'all'
        ? { company: normalizeCompanyName(company) }
        : {}

      const leads = await directus.get('leads', { limit: -1 }, filters)

      if (!leads || leads.length === 0) {
        return {
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
      }

      // Calculer les stats par statut
      const byStatus = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {})

      // Valeur totale des leads gagnés
      const wonLeads = leads.filter(l => l.status === 'won')
      const totalWonValue = wonLeads.reduce((sum, l) =>
        sum + parseFloat(l.estimated_value || 0), 0
      )

      // Valeur totale pipeline
      const pipelineLeads = leads.filter(l => !['won', 'lost'].includes(l.status))
      const totalPipelineValue = pipelineLeads.reduce((sum, l) =>
        sum + parseFloat(l.estimated_value || 0), 0
      )

      // Score moyen
      const avgScore = leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length

      // Taux de conversion
      const closedLeads = leads.filter(l => ['won', 'lost'].includes(l.status)).length
      const conversionRate = closedLeads > 0
        ? (byStatus.won || 0) / closedLeads * 100
        : 0

      return {
        total: leads.length,
        new: byStatus.new || 0,
        contacted: byStatus.contacted || 0,
        qualified: byStatus.qualified || 0,
        proposal: byStatus.proposal || 0,
        negotiation: byStatus.negotiation || 0,
        won: byStatus.won || 0,
        lost: byStatus.lost || 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgDealSize: wonLeads.length > 0
          ? Math.round(totalWonValue / wonLeads.length)
          : 0,
        avgScore: Math.round(avgScore),
        totalValue: Math.round(totalPipelineValue),
        totalWonValue: Math.round(totalWonValue)
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

/**
 * Hook pour les sources de leads
 */
export function useLeadSources() {
  return useQuery({
    queryKey: ['lead-sources'],
    queryFn: async () => {
      const sources = await directus.get('lead_sources', {
        filter: { is_active: { _eq: true } },
        sort: ['sort_order']
      })
      return sources || []
    },
    staleTime: 1000 * 60 * 30 // 30 minutes - rarement modifié
  })
}

export default useLeads
