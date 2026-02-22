/**
 * LeadDetail — S-05-01
 * Vue detail d'un lead avec timeline d'activites, info contact, actions rapides.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Phone, Mail, MessageSquare, Calendar, Building,
  Star, DollarSign, Clock, Plus, Send, User, Globe, Tag,
  Edit, Trash2, CheckCircle, AlertCircle, Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
// GlassCard replaced with ds-card div pattern
import { fetchLeadActivities, createLeadActivity, deleteLeadActivity } from '../../../../services/api/crm'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Appel', icon: Phone, color: 'ds-badge ds-badge-info' },
  { value: 'email', label: 'Email', icon: Mail, color: 'ds-badge ds-badge-info' },
  { value: 'meeting', label: 'RDV', icon: Calendar, color: 'ds-badge ds-badge-success' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'ds-badge ds-badge-success' },
  { value: 'note', label: 'Note', icon: Edit, color: 'ds-badge ds-badge-default' },
  { value: 'task', label: 'Tache', icon: CheckCircle, color: 'ds-badge ds-badge-warning' }
]

const STATUS_CONFIG = {
  new: { label: 'Nouveau', color: 'ds-badge ds-badge-default' },
  contacted: { label: 'Contacte', color: 'ds-badge ds-badge-info' },
  qualified: { label: 'Qualifie', color: 'ds-badge ds-badge-info' },
  proposal: { label: 'Proposition', color: 'ds-badge ds-badge-warning' },
  negotiation: { label: 'Negociation', color: 'ds-badge ds-badge-warning' },
  won: { label: 'Gagne', color: 'ds-badge ds-badge-success' },
  lost: { label: 'Perdu', color: 'ds-badge ds-badge-danger' }
}

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v || 0)

const LeadDetail = ({ lead, onBack, onEdit, onStatusChange }) => {
  const queryClient = useQueryClient()
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [activityType, setActivityType] = useState('call')
  const [activitySubject, setActivitySubject] = useState('')
  const [activityNotes, setActivityNotes] = useState('')

  // Fetch activities for this lead
  const { data: activities = [], isLoading: loadingActivities } = useQuery({
    queryKey: ['lead-activities', lead.id],
    queryFn: () => fetchLeadActivities(lead.id),
    staleTime: 30_000
  })

  // Create activity mutation
  const createMutation = useMutation({
    mutationFn: createLeadActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead.id] })
      toast.success('Activite ajoutee')
      setShowActivityForm(false)
      setActivitySubject('')
      setActivityNotes('')
    },
    onError: () => toast.error('Erreur lors de l\'ajout')
  })

  // Delete activity mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLeadActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities', lead.id] })
      toast.success('Activite supprimee')
    }
  })

  const handleAddActivity = (e) => {
    e.preventDefault()
    if (!activitySubject.trim()) return
    createMutation.mutate({
      lead_id: lead.id,
      type: activityType,
      subject: activitySubject.trim(),
      notes: activityNotes.trim() || undefined
    })
  }

  const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new

  const getScoreStyle = (score) => {
    if (score >= 80) return { color: 'var(--semantic-green)' }
    if (score >= 50) return { color: 'var(--semantic-orange)' }
    return {}
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {lead.first_name} {lead.last_name}
            </h1>
            {lead.company_name && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Building size={14} /> {lead.company_name}
                {lead.job_title && <span> — {lead.job_title}</span>}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
          <button
            onClick={() => onEdit(lead)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit size={14} className="inline mr-1" /> Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Info + Quick actions */}
        <div className="space-y-4">
          {/* Contact Info Card */}
          <div className="ds-card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact</h3>
            <div className="space-y-3">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-gray-700 transition-colors">
                  <Mail size={14} className="text-gray-400" /> {lead.email}
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-gray-700 transition-colors">
                  <Phone size={14} className="text-gray-400" /> {lead.phone}
                </a>
              )}
              {lead.whatsapp && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MessageSquare size={14} className="text-gray-400" /> {lead.whatsapp}
                </div>
              )}
              {lead.website && (
                <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-700 transition-colors">
                  <Globe size={14} className="text-gray-400" /> {lead.website}
                </a>
              )}
            </div>
          </div>

          {/* Lead Metrics */}
          <div className="ds-card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Metriques</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Valeur estimee</p>
                <p className="text-lg font-bold" style={{color:'var(--accent)'}}>{formatCHF(lead.estimated_value)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Score</p>
                <p className="text-lg font-bold text-gray-500" style={getScoreStyle(lead.score)}>
                  <Star size={14} className="inline mr-1" />{lead.score || 0}/100
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900">{lead.source || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Priorite</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{lead.priority || 'medium'}</p>
              </div>
            </div>
          </div>

          {/* Quick Status Change */}
          <div className="ds-card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Changer le statut</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => key !== lead.status && onStatusChange(lead.id, key)}
                  disabled={key === lead.status}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    key === lead.status
                      ? `${cfg.color} ring-2 ring-offset-1`
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <div className="ds-card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <Tag size={14} /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag, i) => (
                  <span key={i} className="ds-badge ds-badge-info">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="ds-card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="ds-card p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Dates</h3>
            <div className="space-y-2 text-sm">
              {lead.date_created && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cree le</span>
                  <span className="text-gray-900">{format(new Date(lead.date_created), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
              )}
              {lead.next_followup_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Prochain suivi</span>
                  <span className="font-medium" style={{color:'var(--semantic-orange)'}}>{format(new Date(lead.next_followup_at), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
              )}
              {lead.date_updated && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Modifie le</span>
                  <span className="text-gray-900">{format(new Date(lead.date_updated), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Activities timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Activity Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Activites ({activities.length})
            </h2>
            <button
              onClick={() => setShowActivityForm(!showActivityForm)}
              className="ds-btn ds-btn-primary text-sm"
            >
              <Plus size={14} /> Ajouter
            </button>
          </div>

          {/* Activity Form */}
          {showActivityForm && (
            <div className="ds-card p-5">
              <form onSubmit={handleAddActivity} className="space-y-3">
                {/* Type selector */}
                <div className="flex gap-2 flex-wrap">
                  {ACTIVITY_TYPES.map(at => {
                    const Icon = at.icon
                    return (
                      <button
                        key={at.value}
                        type="button"
                        onClick={() => setActivityType(at.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                          activityType === at.value
                            ? `${at.color} ring-2 ring-offset-1 ring-zinc-200`
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={14} /> {at.label}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="text"
                  value={activitySubject}
                  onChange={e => setActivitySubject(e.target.value)}
                  placeholder="Sujet de l'activite..."
                  required
                  className="ds-input w-full text-sm"
                />
                <textarea
                  value={activityNotes}
                  onChange={e => setActivityNotes(e.target.value)}
                  placeholder="Notes (optionnel)..."
                  rows={2}
                  className="ds-input w-full text-sm"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowActivityForm(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="ds-btn ds-btn-primary text-sm disabled:opacity-50"
                  >
                    {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Activities Timeline */}
          {loadingActivities ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{color:'var(--accent)'}} />
            </div>
          ) : activities.length === 0 ? (
            <div className="ds-card p-8 text-center">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune activite enregistree</p>
              <p className="text-sm text-gray-400 mt-1">Ajoutez un appel, email ou note pour commencer</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gray-200" />

              <div className="space-y-4">
                {activities.map(activity => {
                  const typeCfg = ACTIVITY_TYPES.find(t => t.value === activity.type) || ACTIVITY_TYPES[4]
                  const TypeIcon = typeCfg.icon
                  return (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeCfg.color}`}>
                        <TypeIcon size={16} />
                      </div>
                      {/* Content */}
                      <div className="ds-card flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{activity.subject || typeCfg.label}</p>
                            {activity.notes && (
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{activity.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {activity.date_created
                                ? format(new Date(activity.date_created), 'dd MMM yyyy HH:mm', { locale: fr })
                                : '—'}
                            </span>
                            <button
                              onClick={() => {
                                if (window.confirm('Supprimer cette activite ?')) {
                                  deleteMutation.mutate(activity.id)
                                }
                              }}
                              className="p-1 text-gray-300 transition-colors" style={{['--hover-color']:'var(--semantic-red)'}}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadDetail
