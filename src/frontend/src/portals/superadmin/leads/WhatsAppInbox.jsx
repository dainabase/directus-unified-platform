/**
 * F-02 — WhatsApp Inbox
 * Design: Apple Premium Monochromatic (zinc/slate, zero glassmorphism)
 * Affiche les messages WhatsApp Business recus + statut de traitement
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  MessageSquare, Phone, ArrowDownLeft, ArrowUpRight,
  CheckCircle, Clock, AlertCircle, RefreshCw, Loader2,
  ChevronRight, Search, User
} from 'lucide-react'
import api from '../../../lib/axios'

const STATUS_BADGES = {
  received: { label: 'Recu', icon: ArrowDownLeft, className: 'ds-badge ds-badge-default' },
  processed: { label: 'Traite', icon: CheckCircle, className: 'ds-badge ds-badge-success' },
  sent: { label: 'Envoye', icon: ArrowUpRight, className: 'ds-badge ds-badge-info' },
  failed: { label: 'Echec', icon: AlertCircle, className: 'ds-badge ds-badge-danger' }
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatPhone(phone) {
  if (!phone) return '—'
  return phone.replace(/(\+\d{2})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
}

export default function WhatsAppInbox() {
  const [search, setSearch] = useState('')
  const [selectedMsg, setSelectedMsg] = useState(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['whatsapp-messages'],
    queryFn: async () => {
      const res = await api.get('/api/leads/whatsapp-messages', { params: { limit: 100 } })
      return res.data?.data || []
    },
    refetchInterval: 30000
  })

  const messages = data || []

  const filtered = search
    ? messages.filter(m =>
        (m.phone || '').includes(search) ||
        (m.content || '').toLowerCase().includes(search.toLowerCase())
      )
    : messages

  const stats = {
    total: messages.length,
    received: messages.filter(m => m.status === 'received').length,
    processed: messages.filter(m => m.status === 'processed').length
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            WhatsApp Business
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Messages recus via Meta Business API
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total messages', value: stats.total, icon: MessageSquare },
          { label: 'En attente', value: stats.received, icon: Clock },
          { label: 'Traites', value: stats.processed, icon: CheckCircle }
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-zinc-200 rounded-xl px-5 py-4 flex items-center gap-4">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <stat.icon className="w-5 h-5 text-zinc-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-zinc-900">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Rechercher par telephone ou contenu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ds-input w-full pl-10 pr-4 py-2.5 text-sm"
        />
      </div>

      {/* Messages list + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* List */}
        <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-20 text-sm text-red-500">
              Erreur de chargement
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <MessageSquare className="w-10 h-10 mb-3" />
              <p className="text-sm">Aucun message WhatsApp</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto">
              {filtered.map((msg) => {
                const badge = STATUS_BADGES[msg.status] || STATUS_BADGES.received
                const BadgeIcon = badge.icon
                const isSelected = selectedMsg?.id === msg.id
                return (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMsg(msg)}
                    className={`w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-zinc-50 transition-colors ${
                      isSelected ? 'bg-zinc-50 border-l-2 border-zinc-900' : ''
                    }`}
                  >
                    <div className="p-2 bg-zinc-100 rounded-full flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-zinc-900 truncate">
                          {formatPhone(msg.phone)}
                        </span>
                        <span className="text-xs text-zinc-400 flex-shrink-0">
                          {formatDate(msg.date_created)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 truncate mt-0.5">
                        {msg.content?.slice(0, 80) || '(media)'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        {msg.direction === 'inbound' && (
                          <span className="text-xs text-zinc-400">Entrant</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 flex-shrink-0 mt-2" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-5">
          {selectedMsg ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-100 rounded-full">
                  <Phone className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {formatPhone(selectedMsg.phone)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(selectedMsg.date_created)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Message</p>
                  <div className="bg-zinc-50 rounded-lg p-4 text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                    {selectedMsg.content || '—'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Statut</p>
                    <p className="text-sm text-zinc-700">{STATUS_BADGES[selectedMsg.status]?.label || selectedMsg.status}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Direction</p>
                    <p className="text-sm text-zinc-700">{selectedMsg.direction === 'inbound' ? 'Entrant' : 'Sortant'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-sm text-zinc-700">{selectedMsg.message_type || 'text'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Lead ID</p>
                    <p className="text-sm text-zinc-700">{selectedMsg.lead || '—'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">External ID</p>
                  <p className="text-xs text-zinc-500 font-mono break-all">{selectedMsg.external_id || '—'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-400">
              <MessageSquare className="w-8 h-8 mb-3" />
              <p className="text-sm">Selectionnez un message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
