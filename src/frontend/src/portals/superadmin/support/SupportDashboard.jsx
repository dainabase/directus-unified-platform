/**
 * SupportDashboard — S-05-03
 * Module support tickets SuperAdmin. Connecte a Directus support_tickets.
 * Vue d'ensemble avec KPIs reels, liste tickets CRUD, formulaire creation.
 */

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Headphones, MessageSquare, Bell, Clock, Plus, Search, Filter,
  AlertCircle, CheckCircle, Loader2, X, Save, Trash2, Edit, Eye,
  TrendingUp, ChevronRight, Receipt
} from 'lucide-react'
import { format, differenceInHours } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { fetchTickets, createTicket, updateTicket, deleteTicket } from '../../../services/api/crm'
import TicketsToInvoiceModule from './TicketsToInvoiceModule'

const STATUS_CONFIG = {
  open: { label: 'Ouvert', color: 'bg-zinc-100 text-zinc-700' },
  in_progress: { label: 'En cours', color: 'bg-amber-100 text-amber-700' },
  pending: { label: 'En attente', color: 'bg-zinc-200 text-zinc-700' },
  resolved: { label: 'Resolu', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Ferme', color: 'bg-gray-100 text-gray-600' }
}

const PRIORITY_CONFIG = {
  critical: { label: 'Critique', color: 'bg-red-100 text-red-700' },
  high: { label: 'Haute', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Basse', color: 'bg-gray-100 text-gray-600' }
}

const CATEGORY_OPTIONS = [
  'Technique', 'Facturation', 'Commercial', 'Fonctionnalite', 'Autre'
]

// ── Ticket Form ────────────────────────────────────────────
const TicketForm = ({ ticket, onSave, onClose, isSaving }) => {
  const [form, setForm] = useState({
    subject: ticket?.subject || '',
    description: ticket?.description || '',
    status: ticket?.status || 'open',
    priority: ticket?.priority || 'medium',
    category: ticket?.category || 'Technique',
    assigned_to: ticket?.assigned_to || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.subject.trim()) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {ticket ? 'Modifier le ticket' : 'Nouveau ticket'}
            </h2>
            <button type="button" onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
              <input
                type="text" value={form.subject} required
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3} value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorite</label>
                <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categorie</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              Annuler
            </button>
            <button type="submit" disabled={isSaving}
              className="ds-btn ds-btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-lg disabled:opacity-50">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {ticket ? 'Mettre a jour' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────
const SupportDashboard = ({ selectedCompany, view }) => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(view === 'tickets' ? 'tickets' : view === 'notifications' ? 'notifications' : 'overview')
  const [showForm, setShowForm] = useState(false)
  const [editingTicket, setEditingTicket] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const company = selectedCompany === 'all' ? '' : selectedCompany

  // Fetch tickets from Directus
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support-tickets', { company, status: statusFilter !== 'all' ? statusFilter : undefined, priority: priorityFilter !== 'all' ? priorityFilter : undefined, search: searchQuery }],
    queryFn: () => fetchTickets({ company, status: statusFilter !== 'all' ? statusFilter : undefined, priority: priorityFilter !== 'all' ? priorityFilter : undefined, search: searchQuery }),
    staleTime: 30_000
  })

  // Mutations
  const createMut = useMutation({
    mutationFn: createTicket,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['support-tickets'] }); toast.success('Ticket cree'); setShowForm(false) },
    onError: () => toast.error('Erreur creation')
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateTicket(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['support-tickets'] }); toast.success('Ticket mis a jour'); setShowForm(false); setEditingTicket(null) },
    onError: () => toast.error('Erreur mise a jour')
  })
  const deleteMut = useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['support-tickets'] }); toast.success('Ticket supprime') }
  })

  const handleSave = (formData) => {
    if (editingTicket) {
      updateMut.mutate({ id: editingTicket.id, data: formData })
    } else {
      createMut.mutate({ ...formData, owner_company: company || undefined })
    }
  }

  // KPIs computed from real data
  const kpis = useMemo(() => {
    const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
    const critical = tickets.filter(t => t.priority === 'critical' || t.priority === 'high').length
    const avgResponse = tickets.length > 0
      ? Math.round(tickets.reduce((s, t) => s + (t.date_created ? differenceInHours(new Date(), new Date(t.date_created)) : 0), 0) / tickets.length)
      : 0
    return { open, resolved, critical, total: tickets.length, avgResponse }
  }, [tickets])

  // Filtered for display
  const displayTickets = tickets

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
  }

  const PriorityBadge = ({ priority }) => {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Support</p>
          <h2 className="text-xl font-bold text-gray-900">Tickets & Notifications</h2>
        </div>
        {activeTab !== 'billing' && (
          <button
            onClick={() => { setEditingTicket(null); setShowForm(true) }}
            className="ds-btn ds-btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          >
            <Plus size={16} /> Nouveau ticket
          </button>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab !== 'billing' ? 'bg-white shadow text-zinc-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Headphones size={16} /> Tickets
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'billing' ? 'bg-white shadow text-zinc-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Receipt size={16} /> Facturation hors contrat
        </button>
      </div>

      {activeTab === 'billing' ? (
        <TicketsToInvoiceModule />
      ) : (
      <>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpis.total}</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs text-gray-500">Ouverts</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{kpis.open}</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-gray-500">Resolus</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--semantic-green)' }}>{kpis.resolved}</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-xs text-gray-500">Critiques</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{kpis.critical}</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-400" />
            <span className="text-xs text-gray-500">Age moyen</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{kpis.avgResponse}h</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-500"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">Toutes les priorites</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-sm text-gray-500">{displayTickets.length} ticket(s)</span>
      </div>

      {/* Tickets Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        </div>
      ) : displayTickets.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <Headphones className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun ticket de support</p>
          <p className="text-sm text-gray-400 mt-1">Creez un premier ticket pour commencer</p>
        </div>
      ) : (
        <div className="ds-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sujet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priorite</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayTickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{t.subject || '(sans sujet)'}</p>
                    {t.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{t.description}</p>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.category || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {t.date_created ? format(new Date(t.date_created), 'dd MMM yyyy', { locale: fr }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingTicket(t); setShowForm(true) }}
                        className="p-1.5 text-gray-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-50 transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => { if (window.confirm('Supprimer ce ticket ?')) deleteMut.mutate(t.id) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      </>
      )}

      {/* Ticket Form Modal */}
      {showForm && (
        <TicketForm
          ticket={editingTicket}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingTicket(null) }}
          isSaving={createMut.isPending || updateMut.isPending}
        />
      )}
    </div>
  )
}

export default SupportDashboard
