/**
 * LeadsRevendeur — Gestion des leads pour le portail Revendeur
 * Affiche uniquement les leads assignes au revendeur connecte (assigned_to = user.id).
 * CRUD complet : liste, filtres, ajout, archivage, conversion en devis.
 */

import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  UserPlus, Search, Plus, X, Loader2, Archive,
  FileText, Phone, Mail, Building2, ChevronDown,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

// ── Helpers ──────────────────────────────────────────────
const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0
  }).format(v || 0)

// ── Status config ────────────────────────────────────────
const STATUS_CONFIG = {
  new:          { label: 'Nouveau',      bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' },
  contacted:    { label: 'Contacte',     bg: 'rgba(0,113,227,0.12)', fg: '#0071E3' },
  qualified:    { label: 'Qualifie',     bg: 'rgba(0,113,227,0.10)', fg: '#0071E3' },
  proposal:     { label: 'Proposition',  bg: 'rgba(255,149,0,0.12)', fg: '#FF9500' },
  negotiation:  { label: 'Negociation',  bg: 'rgba(255,149,0,0.15)', fg: '#FF9500' },
  won:          { label: 'Gagne',        bg: 'rgba(52,199,89,0.12)', fg: '#34C759' },
  lost:         { label: 'Perdu',        bg: 'rgba(255,59,48,0.12)', fg: '#FF3B30' },
  inactive:     { label: 'Inactif',      bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' }
}

const PRIORITY_CONFIG = {
  high:   { label: 'Haute',   dotColor: '#FF3B30' },
  medium: { label: 'Moyenne', dotColor: '#FF9500' },
  low:    { label: 'Basse',   dotColor: '#9CA3AF' }
}

const SOURCE_CONFIG = {
  wordpress: { label: 'WordPress', bg: 'rgba(0,113,227,0.08)', fg: '#0071E3' },
  email:     { label: 'Email',     bg: 'rgba(107,114,128,0.08)', fg: '#6B7280' },
  ringover:  { label: 'Ringover',  bg: 'rgba(52,199,89,0.08)', fg: '#34C759' },
  whatsapp:  { label: 'WhatsApp',  bg: 'rgba(52,199,89,0.08)', fg: '#34C759' },
  manual:    { label: 'Manuel',    bg: 'rgba(107,114,128,0.08)', fg: '#6B7280' }
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'new', label: 'Nouveau' },
  { value: 'contacted', label: 'Contacte' },
  { value: 'qualified', label: 'Qualifie' },
  { value: 'proposal', label: 'Proposition' },
  { value: 'negotiation', label: 'Negociation' },
  { value: 'won', label: 'Gagne' },
  { value: 'lost', label: 'Perdu' },
  { value: 'inactive', label: 'Inactif' }
]

const PRIORITY_OPTIONS = [
  { value: '', label: 'Toutes priorites' },
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' }
]

// ── Main Component ───────────────────────────────────────
const LeadsRevendeur = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  // Local state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showModal, setShowModal] = useState(false)

  // ── Fetch leads assigned to current user ──
  const { data: leads = [], isLoading, isError } = useQuery({
    queryKey: ['revendeur-leads', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data } = await api.get('/items/leads', {
        params: {
          fields: [
            'id', 'first_name', 'last_name', 'email', 'phone', 'company_name',
            'status', 'estimated_value', 'currency', 'priority', 'score',
            'source_channel', 'notes', 'tags', 'date_created', 'date_updated',
            'last_contacted_at', 'next_followup_at'
          ].join(','),
          filter: JSON.stringify({ assigned_to: { _eq: user.id } }),
          sort: '-date_updated',
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2
  })

  // ── Archive mutation (PATCH status to inactive) ──
  const archiveMutation = useMutation({
    mutationFn: async (leadId) => {
      await api.patch(`/items/leads/${leadId}`, { status: 'inactive' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revendeur-leads'] })
      toast.success('Lead archive')
    },
    onError: () => {
      toast.error('Erreur lors de l\'archivage')
    }
  })

  // ── Create lead mutation ──
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/items/leads', payload)
      return data?.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revendeur-leads'] })
      toast.success('Lead cree avec succes')
      setShowModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la creation du lead')
    }
  })

  // ── Filter leads ──
  const filteredLeads = useMemo(() => {
    let result = leads

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((l) =>
        `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
        (l.company_name || '').toLowerCase().includes(q) ||
        (l.email || '').toLowerCase().includes(q)
      )
    }

    if (statusFilter) {
      result = result.filter((l) => l.status === statusFilter)
    }

    if (priorityFilter) {
      result = result.filter((l) => l.priority === priorityFilter)
    }

    return result
  }, [leads, search, statusFilter, priorityFilter])

  // ── Convert to quote ──
  const handleConvertToQuote = (lead) => {
    navigate('/revendeur/devis', {
      state: {
        fromLead: true,
        leadId: lead.id,
        clientName: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
        companyName: lead.company_name,
        email: lead.email,
        phone: lead.phone,
        estimatedValue: lead.estimated_value
      }
    })
  }

  // ── Relative date helper ──
  const relativeDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr })
    } catch {
      return '—'
    }
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">Mes Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerez vos prospects et convertissez-les en devis
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="ds-btn ds-btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Nouveau lead
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="ds-card p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, entreprise, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ds-input pl-10 w-full"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ds-input pr-8 appearance-none cursor-pointer min-w-[160px]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Priority filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="ds-input pr-8 appearance-none cursor-pointer min-w-[160px]"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Active filter count */}
        {(search || statusFilter || priorityFilter) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span>{filteredLeads.length} resultat{filteredLeads.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter('') }}
              className="underline hover:opacity-80" style={{ color: 'var(--accent)' }}
            >
              Effacer les filtres
            </button>
          </div>
        )}
      </div>

      {/* ── Leads Table ── */}
      {isError ? (
        <div className="ds-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Erreur lors du chargement des leads.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['revendeur-leads'] })}
            className="ds-btn ds-btn-ghost mt-3 text-sm"
          >
            Reessayer
          </button>
        </div>
      ) : filteredLeads.length === 0 ? (
        /* ── Empty State ── */
        <div className="ds-card p-12 text-center">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Aucun lead</h3>
          <p className="text-sm text-gray-500 mb-4">
            {search || statusFilter || priorityFilter
              ? 'Aucun lead ne correspond a vos filtres.'
              : 'Commencez par ajouter votre premier prospect.'}
          </p>
          {!search && !statusFilter && !priorityFilter && (
            <button
              onClick={() => setShowModal(true)}
              className="ds-btn ds-btn-primary inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Ajouter un lead
            </button>
          )}
        </div>
      ) : (
        <div className="ds-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Entreprise</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Valeur</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Statut</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Priorite</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider hidden xl:table-cell">Activite</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.map((lead) => {
                  const fullName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || '—'
                  const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
                  const priorityCfg = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG.medium
                  const sourceCfg = SOURCE_CONFIG[lead.source_channel] || SOURCE_CONFIG.manual

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{fullName}</p>
                        {lead.phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone size={10} />
                            {lead.phone}
                          </p>
                        )}
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{lead.company_name || '—'}</span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="hover:underline flex items-center gap-1 hover:opacity-80" style={{ color: 'var(--accent)' }}
                          >
                            <Mail size={12} />
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Estimated Value */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-gray-900">
                          {lead.estimated_value ? formatCHF(lead.estimated_value) : '—'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: statusCfg.bg, color: statusCfg.fg }}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Priority Dot */}
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: priorityCfg.dotColor }} />
                          <span className="text-xs text-gray-600">{priorityCfg.label}</span>
                        </div>
                      </td>

                      {/* Source Channel Badge */}
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: sourceCfg.bg, color: sourceCfg.fg }}>
                          {sourceCfg.label}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs text-gray-500">
                          {relativeDate(lead.date_updated)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleConvertToQuote(lead)}
                            className="ds-btn ds-btn-ghost text-xs px-2 py-1 flex items-center gap-1" style={{ color: 'var(--accent)' }}
                            title="Convertir en devis"
                          >
                            <FileText size={14} />
                            <span className="hidden sm:inline">Devis</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Archiver le lead ${fullName} ?`)) {
                                archiveMutation.mutate(lead.id)
                              }
                            }}
                            disabled={archiveMutation.isPending || lead.status === 'inactive'}
                            className="ds-btn ds-btn-ghost text-xs px-2 py-1 flex items-center gap-1 text-gray-500 hover:text-red-600 disabled:opacity-40"
                            title="Archiver"
                          >
                            <Archive size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <span>{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</span>
            <span>
              Valeur totale : {formatCHF(filteredLeads.reduce((sum, l) => sum + (Number(l.estimated_value) || 0), 0))}
            </span>
          </div>
        </div>
      )}

      {/* ── Add Lead Modal ── */}
      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            createMutation.mutate({
              ...data,
              assigned_to: user.id,
              status: 'new',
              currency: 'CHF',
              country: 'CH'
            })
          }}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  )
}

// ── Add Lead Modal ───────────────────────────────────────
const AddLeadModal = ({ onClose, onSubmit, isSubmitting }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_name: '',
      estimated_value: '',
      priority: 'medium',
      notes: ''
    }
  })

  const onFormSubmit = (data) => {
    const payload = {
      ...data,
      estimated_value: data.estimated_value ? parseFloat(data.estimated_value) : null
    }
    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative ds-card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Nouveau lead</h2>
              <p className="text-sm text-gray-500 mt-0.5">Ajoutez un nouveau prospect</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prenom *</label>
                <input
                  {...register('first_name', { required: 'Le prenom est requis' })}
                  className="ds-input w-full"
                  placeholder="Jean"
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                <input
                  {...register('last_name', { required: 'Le nom est requis' })}
                  className="ds-input w-full"
                  placeholder="Dupont"
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email invalide'
                  }
                })}
                className="ds-input w-full"
                placeholder="jean.dupont@example.ch"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Telephone</label>
              <input
                type="tel"
                {...register('phone')}
                className="ds-input w-full"
                placeholder="+41 79 123 45 67"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Entreprise</label>
              <input
                {...register('company_name')}
                className="ds-input w-full"
                placeholder="Nom de l'entreprise"
              />
            </div>

            {/* Estimated value + Priority row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Valeur estimee (CHF)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('estimated_value', {
                    min: { value: 0, message: 'La valeur doit etre positive' }
                  })}
                  className="ds-input w-full"
                  placeholder="5000"
                />
                {errors.estimated_value && (
                  <p className="text-xs text-red-500 mt-1">{errors.estimated_value.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priorite</label>
                <select
                  {...register('priority')}
                  className="ds-input w-full"
                >
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="ds-input w-full resize-none"
                placeholder="Contexte, besoins identifies, remarques..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="ds-btn ds-btn-ghost"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="ds-btn ds-btn-primary flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Creer le lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LeadsRevendeur
