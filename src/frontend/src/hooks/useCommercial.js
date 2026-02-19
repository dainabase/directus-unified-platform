/**
 * useCommercial — S-02-06
 * Hooks TanStack Query pour le module commercial (quotes + proposals).
 * Centralise toute la logique métier devis.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getQuotes, getQuote, createQuote, updateQuote,
  getProposals, createProposal, updateProposal
} from '../services/api/commercial'

// ── Quotes (devis clients) ──

/**
 * Liste des devis avec filtres.
 * @param {{ status?, owner_company_id?, page?, limit? }} filters
 */
export const useQuotes = (filters = {}) => {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: () => getQuotes(filters),
    staleTime: 1000 * 60 * 2,
    select: (data) => ({
      quotes: data.quotes,
      total: data.total,
      isLoading: false,
      error: null
    })
  })
}

/**
 * Détail d'un devis par ID.
 * @param {string} id
 */
export const useQuote = (id) => {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: () => getQuote(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2
  })
}

/**
 * Créer un nouveau devis.
 */
export const useCreateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
    }
  })
}

/**
 * Mettre à jour un devis existant.
 */
export const useUpdateQuote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateQuote(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      queryClient.invalidateQueries({ queryKey: ['quote', variables.id] })
    }
  })
}

// ── Proposals (devis prestataires) ──

/**
 * Liste des propositions avec filtres.
 * @param {{ status?, project_id? }} filters
 */
export const useProposals = (filters = {}) => {
  return useQuery({
    queryKey: ['proposals', filters],
    queryFn: () => getProposals(filters),
    staleTime: 1000 * 60 * 2
  })
}

/**
 * Créer une proposition.
 */
export const useCreateProposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    }
  })
}

/**
 * Mettre à jour une proposition.
 */
export const useUpdateProposal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateProposal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    }
  })
}

// Réexport des utilitaires
export { calculateQuoteTotals, formatCHF } from '../services/api/commercial'
