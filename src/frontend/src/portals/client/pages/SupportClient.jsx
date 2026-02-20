/**
 * SupportClient — Client portal support ticket management
 * Create, view, filter and reply to support tickets.
 * Data from Directus collection: support_tickets
 */
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LifeBuoy, Plus, X, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const PRIORITY_CONFIG = {
  critical: { label: 'Critique', bg: 'rgba(255,59,48,0.12)', color: '#FF3B30' },
  high:     { label: 'Haute',    bg: 'rgba(255,59,48,0.08)', color: '#FF6961' },
  medium:   { label: 'Moyenne',  bg: 'rgba(255,204,0,0.12)', color: '#B8860B' },
  low:      { label: 'Basse',    bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' }
}

const FILTER_TABS = [
  { key: 'all',         label: 'Tous' },
  { key: 'open',        label: 'Ouvert' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'resolved',    label: 'Résolu' },
  { key: 'closed',      label: 'Fermé' }
]

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '18px',
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap'
      }}
    >
      {cfg.label}
    </span>
  )
}

const SupportClient = () => {
  const { client } = useClientAuth()
  const contactId = client?.id
  const companyId = client?.company_id
  const queryClient = useQueryClient()

  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedTicket, setExpandedTicket] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [replyText, setReplyText] = useState('')

  // -- New ticket form state --
  const [newSubject, setNewSubject] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [newProjectId, setNewProjectId] = useState('')

  // ── Fetch tickets ──
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['client-support-tickets', contactId, activeFilter],
    queryFn: async () => {
      const filter = { requester_id: { _eq: contactId } }
      if (activeFilter !== 'all') {
        filter.status = { _eq: activeFilter }
      }
      const { data } = await api.get('/items/support_tickets', {
        params: {
          filter,
          fields: [
            'id', 'ticket_number', 'subject', 'description', 'priority',
            'status', 'date_created', 'project_id.id', 'project_id.name',
            'assigned_to.first_name', 'assigned_to.last_name'
          ],
          sort: ['-date_created']
        }
      })
      return data?.data || []
    },
    enabled: !!contactId
  })

  // ── Fetch client projects (for new ticket form) ──
  const { data: projects = [] } = useQuery({
    queryKey: ['client-projects-select', companyId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: { company_id: { _eq: companyId } },
          fields: ['id', 'name'],
          sort: ['name'],
          limit: 100
        }
      })
      return data?.data || []
    },
    enabled: !!companyId
  })

  // ── Create ticket mutation ──
  const createTicket = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/items/support_tickets', payload)
      return data?.data
    },
    onSuccess: () => {
      toast.success('Ticket créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['client-support-tickets'] })
      resetNewForm()
      setShowNewModal(false)
    },
    onError: () => {
      toast.error('Erreur lors de la création du ticket')
    }
  })

  // ── Reply mutation (comments collection) ──
  const sendReply = useMutation({
    mutationFn: async ({ ticketId, message }) => {
      const { data } = await api.post('/items/comments', {
        name: `ticket:${ticketId}`,
        description: message
      })
      return data?.data
    },
    onSuccess: () => {
      toast.success('Message envoyé')
      setReplyText('')
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi du message')
    }
  })

  // ── Close ticket mutation ──
  const closeTicket = useMutation({
    mutationFn: async (ticketId) => {
      const { data } = await api.patch(`/items/support_tickets/${ticketId}`, {
        status: 'resolved'
      })
      return data?.data
    },
    onSuccess: () => {
      toast.success('Ticket marqué comme résolu')
      queryClient.invalidateQueries({ queryKey: ['client-support-tickets'] })
      setExpandedTicket(null)
    },
    onError: () => {
      toast.error('Erreur lors de la fermeture du ticket')
    }
  })

  const resetNewForm = () => {
    setNewSubject('')
    setNewDescription('')
    setNewPriority('medium')
    setNewProjectId('')
  }

  const handleCreateTicket = (e) => {
    e.preventDefault()
    if (!newSubject.trim()) {
      toast.error('Le sujet est requis')
      return
    }
    if (newDescription.trim().length < 20) {
      toast.error('La description doit contenir au moins 20 caractères')
      return
    }
    createTicket.mutate({
      subject: newSubject.trim(),
      description: newDescription.trim(),
      priority: newPriority,
      status: 'open',
      requester_id: contactId,
      company_id: companyId,
      ...(newProjectId ? { project_id: newProjectId } : {})
    })
  }

  const handleSendReply = (ticketId) => {
    if (!replyText.trim()) return
    sendReply.mutate({ ticketId, message: replyText.trim() })
  }

  const toggleExpanded = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId)
    setReplyText('')
  }

  // ── Loading ──
  if (ticketsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{color:"var(--accent)"}} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos demandes d'assistance</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: '#0071E3' }}
        >
          <Plus size={16} />
          Nouveau ticket
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: activeFilter === tab.key ? 'rgba(0,113,227,0.10)' : 'transparent',
              color: activeFilter === tab.key ? '#0071E3' : 'var(--text-secondary, #6E6E73)',
              border: activeFilter === tab.key ? 'none' : '1px solid var(--border-light, #E5E5EA)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="ds-card">
          <EmptyState
            icon={LifeBuoy}
            title="Aucun ticket"
            subtitle="Vous n'avez pas encore de ticket de support. Créez-en un si vous avez besoin d'aide."
            actionLabel="Créer un ticket"
            onAction={() => setShowNewModal(true)}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const isExpanded = expandedTicket === ticket.id
            const projectName = ticket.project_id?.name || null

            return (
              <div key={ticket.id} className="ds-card overflow-hidden">
                {/* Ticket row */}
                <button
                  onClick={() => toggleExpanded(ticket.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-gray-400">{ticket.ticket_number}</span>
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{ticket.subject}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {projectName && (
                        <span className="text-xs text-gray-400">Projet : {projectName}</span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(ticket.date_created)}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      {/* Info grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Statut</p>
                          <StatusBadge status={ticket.status} />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Priorité</p>
                          <PriorityBadge priority={ticket.priority} />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Créé le</p>
                          <p className="font-medium text-gray-900">{formatDate(ticket.date_created)}</p>
                        </div>
                        {ticket.assigned_to && (
                          <div>
                            <p className="text-gray-500 text-xs mb-0.5">Assigné à</p>
                            <p className="font-medium text-gray-900">
                              {ticket.assigned_to.first_name} {ticket.assigned_to.last_name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {ticket.description && (
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Description</p>
                          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                            {ticket.description}
                          </div>
                        </div>
                      )}

                      {/* Response info */}
                      <p className="text-xs text-gray-400 italic">
                        Réponse de l'équipe sous 24h ouvrées
                      </p>

                      {/* Reply form */}
                      {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                        <div className="space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Votre message..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                            style={{ background: 'var(--bg-secondary, #F5F5F7)' }}
                          />
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleSendReply(ticket.id)}
                              disabled={!replyText.trim() || sendReply.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                              style={{ background: '#0071E3' }}
                            >
                              {sendReply.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              Envoyer
                            </button>
                            <button
                              onClick={() => closeTicket.mutate(ticket.id)}
                              disabled={closeTicket.isPending}
                              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              {closeTicket.isPending ? 'Fermeture...' : 'Marquer comme résolu'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── New Ticket Modal ── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Nouveau ticket</h2>
              <button
                onClick={() => { setShowNewModal(false); resetNewForm() }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Décrivez brièvement votre demande"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                  style={{ background: 'var(--bg-secondary, #F5F5F7)' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Détaillez votre demande (min. 20 caractères)"
                  rows={5}
                  required
                  minLength={20}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                  style={{ background: 'var(--bg-secondary, #F5F5F7)' }}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {newDescription.length}/20 caractères minimum
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] appearance-none"
                  style={{ background: 'var(--bg-secondary, #F5F5F7)' }}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              {/* Linked project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projet lié <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] appearance-none"
                  style={{ background: 'var(--bg-secondary, #F5F5F7)' }}
                >
                  <option value="">Aucun projet</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createTicket.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                  style={{ background: '#0071E3' }}
                >
                  {createTicket.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Créer le ticket
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewModal(false); resetNewForm() }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportClient
