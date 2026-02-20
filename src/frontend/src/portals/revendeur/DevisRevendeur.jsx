/**
 * DevisRevendeur — Page devis pour le portail revendeur.
 * Collection Directus : quotes
 * Affiche la liste des devis avec filtres, recherche, et actions (voir, relancer, dupliquer).
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText, Search, Eye, Copy, Send, Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

// ── Helpers ──

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

// ── Status mapping ──

const STATUS_MAP = {
  draft:    { label: 'Brouillon', bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' },
  active:   { label: 'Envoye',    bg: 'rgba(0,113,227,0.12)', fg: '#0071E3' },
  sent:     { label: 'Envoye',    bg: 'rgba(0,113,227,0.12)', fg: '#0071E3' },
  viewed:   { label: 'Consulte',  bg: 'rgba(0,113,227,0.10)', fg: '#0071E3' },
  accepted: { label: 'Accepte',   bg: 'rgba(52,199,89,0.12)', fg: '#34C759' },
  signed:   { label: 'Accepte',   bg: 'rgba(52,199,89,0.12)', fg: '#34C759' },
  rejected: { label: 'Refuse',    bg: 'rgba(255,59,48,0.12)', fg: '#FF3B30' },
  expired:  { label: 'Expire',    bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' }
}

const FILTER_PILLS = [
  { value: 'all',      label: 'Tous' },
  { value: 'draft',    label: 'Brouillon' },
  { value: 'sent',     label: 'Envoye' },
  { value: 'viewed',   label: 'Consulte' },
  { value: 'accepted', label: 'Accepte' },
  { value: 'rejected', label: 'Refuse' }
]

// Resolve the filter value to the actual status values it matches
const resolveStatusFilter = (filter) => {
  switch (filter) {
    case 'sent':     return ['active', 'sent']
    case 'accepted': return ['accepted', 'signed']
    default:         return [filter]
  }
}

// ── Data fetching ──

const fetchQuotes = async () => {
  try {
    const { data } = await api.get('/items/quotes', {
      params: {
        fields: ['*', 'company_id.name'],
        sort: ['-created_at'],
        limit: 50
      }
    })
    return data?.data || []
  } catch {
    return []
  }
}

// ── Component ──

const DevisRevendeur = () => {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch quotes
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['revendeur-devis'],
    queryFn: fetchQuotes,
    staleTime: 1000 * 60 * 2
  })

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (quote) => {
      const {
        id, created_at, sent_at, viewed_at, signed_at,
        is_signed, quote_number, ...rest
      } = quote
      // Remove nested relation objects (send only FK ids)
      const payload = {
        ...rest,
        company_id: typeof rest.company_id === 'object' ? rest.company_id?.id || null : rest.company_id,
        status: 'draft',
        name: `${rest.name || 'Devis'} (copie)`
      }
      const { data } = await api.post('/items/quotes', payload)
      return data?.data || data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revendeur-devis'] })
      toast.success('Devis duplique avec succes')
    },
    onError: () => {
      toast.error('Erreur lors de la duplication')
    }
  })

  // Relance handler
  const handleRelance = (quote) => {
    toast.success('Relance envoyee')
  }

  // View handler (placeholder — could navigate to detail view)
  const handleView = (quote) => {
    toast('Apercu du devis ' + (quote.quote_number || quote.id?.slice(0, 8)), { icon: '\u{1F4C4}' })
  }

  // ── Filtered and searched quotes ──

  const filteredQuotes = useMemo(() => {
    let result = quotes

    // Status filter
    if (statusFilter !== 'all') {
      const allowed = resolveStatusFilter(statusFilter)
      result = result.filter((q) => allowed.includes(q.status))
    }

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase().trim()
      result = result.filter((q) => {
        const num = (q.quote_number || '').toLowerCase()
        const name = (q.name || '').toLowerCase()
        return num.includes(term) || name.includes(term)
      })
    }

    return result
  }, [quotes, statusFilter, search])

  // ── Skeleton loading ──

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Title skeleton */}
        <div>
          <div className="h-7 w-48 ds-skeleton rounded mb-2" />
          <div className="h-4 w-72 ds-skeleton rounded" />
        </div>
        {/* Filter bar skeleton */}
        <div className="ds-card p-4">
          <div className="flex gap-3">
            <div className="h-9 w-64 ds-skeleton rounded" />
            <div className="h-9 w-20 ds-skeleton rounded-lg" />
            <div className="h-9 w-20 ds-skeleton rounded-lg" />
            <div className="h-9 w-20 ds-skeleton rounded-lg" />
          </div>
        </div>
        {/* Table skeleton */}
        <div className="ds-card">
          <div className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-24 ds-skeleton rounded" />
                <div className="h-4 w-40 ds-skeleton rounded" />
                <div className="h-4 w-32 ds-skeleton rounded" />
                <div className="h-4 w-20 ds-skeleton rounded" />
                <div className="h-4 w-20 ds-skeleton rounded" />
                <div className="h-4 w-16 ds-skeleton rounded-full" />
                <div className="h-4 w-24 ds-skeleton rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="ds-page-title">Mes Devis</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gestion et suivi de vos devis &mdash; {filteredQuotes.length} devis
        </p>
      </div>

      {/* Filter bar */}
      <div className="ds-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numero ou nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ds-input pl-9 w-full"
            />
          </div>

          {/* Status pills */}
          <div className="flex gap-2 flex-wrap">
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setStatusFilter(pill.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === pill.value
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quotes table */}
      <div className="ds-card">
        {filteredQuotes.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Aucun devis</p>
            <p className="text-xs mt-1">
              {search || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres.'
                : 'Les devis apparaitront ici.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">N&#xB0; devis</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">Nom</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">Client</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">Montant HT</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 font-medium">Total TTC</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">Statut</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q) => {
                  const statusCfg = STATUS_MAP[q.status] || STATUS_MAP.draft
                  const clientName = typeof q.company_id === 'object'
                    ? q.company_id?.name
                    : null
                  const canRelance = ['active', 'sent', 'viewed'].includes(q.status)

                  return (
                    <tr
                      key={q.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Quote number */}
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">
                        {q.quote_number || q.id?.slice(0, 8)}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                        {q.name || '\u2014'}
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4 text-gray-600">
                        {clientName || '\u2014'}
                      </td>

                      {/* Subtotal HT */}
                      <td className="py-3 px-4 text-right text-gray-900">
                        {q.subtotal != null ? formatCHF(q.subtotal) : '\u2014'}
                      </td>

                      {/* Total TTC */}
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {q.total != null ? formatCHF(q.total) : '\u2014'}
                      </td>

                      {/* Status badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: statusCfg.bg, color: statusCfg.fg }}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-500">
                        {q.created_at
                          ? format(new Date(q.created_at), 'dd.MM.yyyy', { locale: fr })
                          : '\u2014'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {/* Voir */}
                          <button
                            onClick={() => handleView(q)}
                            className="ds-btn-ghost p-1.5 rounded-lg"
                            title="Voir le devis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Relancer (only sent/viewed) */}
                          {canRelance && (
                            <button
                              onClick={() => handleRelance(q)}
                              className="ds-btn-ghost p-1.5 rounded-lg" style={{ color: 'var(--accent)' }}
                              title="Relancer"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Dupliquer */}
                          <button
                            onClick={() => duplicateMutation.mutate(q)}
                            disabled={duplicateMutation.isPending}
                            className="ds-btn-ghost p-1.5 rounded-lg"
                            title="Dupliquer"
                          >
                            {duplicateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DevisRevendeur
