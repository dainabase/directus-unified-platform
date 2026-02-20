/**
 * QuotesList — S-02-05
 * Tableau des devis clients avec filtres, actions, badges.
 * Collection : quotes
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Plus, Search, Filter, Copy, Archive, Eye, Edit3, Send, PenTool, CheckCircle, Receipt } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)

const OWNER_COMPANIES = [
  { id: '2d6b906a-5b8a-4d9e-a37b-aee8c1281b22', name: 'HYPERVISUAL' },
  { id: '55483d07-6621-43d4-89a9-5ebbffe86fea', name: 'DAINAMICS' },
  { id: '6f4bc42a-d083-4df5-ace3-6b910164ae18', name: 'ENKI REALTY' },
  { id: '8db45f3b-4021-9556-3acaa5f35b3f', name: 'LEXAIA' },
  { id: 'a1313adf-0347-424b-aff2-c5f0b33c4a05', name: 'TAKEOUT' }
]

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Consulté', color: 'bg-cyan-100 text-cyan-700' },
  signed: { label: 'Signé', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
  expired: { label: 'Expiré', color: 'bg-yellow-100 text-yellow-700' }
}

const fetchQuotes = async ({ status, ownerCompany, page, limit }) => {
  try {
    const filter = {}
    if (status && status !== 'all') filter.status = { _eq: status }
    if (ownerCompany && ownerCompany !== 'all') filter.owner_company_id = { _eq: ownerCompany }

    const { data } = await api.get('/items/quotes', {
      params: {
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        fields: [
          'id', 'quote_number', 'status', 'subtotal', 'tax_rate', 'tax_amount',
          'total', 'currency', 'sent_at', 'signed_at', 'is_signed', 'cgv_accepted',
          'created_at', 'valid_until', 'deposit_percentage', 'deposit_amount',
          'contact_id.first_name', 'contact_id.last_name',
          'company_id.name',
          'owner_company_id.name', 'owner_company_id.id'
        ],
        sort: ['-created_at'],
        limit: limit || 25,
        page: page || 1,
        meta: 'total_count'
      }
    })
    return {
      quotes: data?.data || [],
      total: data?.meta?.total_count || 0
    }
  } catch {
    return { quotes: [], total: 0 }
  }
}

const QuotesList = ({ selectedCompany, onCreateQuote, onEditQuote, onViewQuote, onSendQuote, onDuplicateQuote, onMarkSigned, onSendDocuSeal, onGenerateInvoice }) => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const ownerCompanyFilter = selectedCompany && selectedCompany !== 'all' ? selectedCompany : 'all'

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quotes', statusFilter, ownerCompanyFilter, page],
    queryFn: () => fetchQuotes({ status: statusFilter, ownerCompany: ownerCompanyFilter, page, limit: 25 }),
    staleTime: 1000 * 60 * 2
  })

  const quotes = data?.quotes || []
  const total = data?.total || 0

  // Filtrage local par recherche
  const filtered = search
    ? quotes.filter(q =>
        (q.quote_number || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.contact_id?.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.contact_id?.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (q.company_id?.name || '').toLowerCase().includes(search.toLowerCase())
      )
    : quotes

  const statusFilters = [
    { value: 'all', label: 'Tous' },
    { value: 'draft', label: 'Brouillons' },
    { value: 'sent', label: 'Envoyés' },
    { value: 'viewed', label: 'Consultés' },
    { value: 'signed', label: 'Signés' },
    { value: 'rejected', label: 'Refusés' },
    { value: 'expired', label: 'Expirés' }
  ]

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="h-64 glass-skeleton rounded-lg" />
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Devis clients
          </h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {total}
          </span>
        </div>
        <button
          onClick={onCreateQuote}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nouveau devis
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par N°, client, entreprise..."
            className="glass-input w-full pl-10"
          />
        </div>

        {/* Filtres statut */}
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">Aucun devis trouvé</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2.5 text-xs text-gray-500 font-medium">N° devis</th>
                <th className="text-left py-2.5 text-xs text-gray-500 font-medium">Client</th>
                <th className="text-left py-2.5 text-xs text-gray-500 font-medium">Entreprise</th>
                <th className="text-right py-2.5 text-xs text-gray-500 font-medium">Montant HT</th>
                <th className="text-right py-2.5 text-xs text-gray-500 font-medium">TVA</th>
                <th className="text-right py-2.5 text-xs text-gray-500 font-medium">Total TTC</th>
                <th className="text-left py-2.5 text-xs text-gray-500 font-medium">Statut</th>
                <th className="text-left py-2.5 text-xs text-gray-500 font-medium">Envoyé</th>
                <th className="text-left py-2.5 text-xs text-gray-500 font-medium">Signé</th>
                <th className="text-left py-2.5 text-xs text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const config = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft
                const contactName = q.contact_id
                  ? `${q.contact_id.first_name || ''} ${q.contact_id.last_name || ''}`.trim()
                  : '—'

                return (
                  <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 font-mono text-xs text-gray-700">
                      {q.quote_number || q.id?.toString().slice(0, 8)}
                    </td>
                    <td className="py-3 font-medium text-gray-900">{contactName}</td>
                    <td className="py-3 text-gray-600">{q.company_id?.name || '—'}</td>
                    <td className="py-3 text-right font-medium">{formatCHF(q.subtotal)}</td>
                    <td className="py-3 text-right text-gray-500">{q.tax_rate || 8.1}%</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{formatCHF(q.total)}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">
                      {q.sent_at ? format(new Date(q.sent_at), 'dd/MM/yy', { locale: fr }) : '—'}
                    </td>
                    <td className="py-3">
                      {q.is_signed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          Signé ✓
                        </span>
                      ) : q.cgv_accepted ? (
                        <span className="text-xs text-blue-600">CGV ✓</span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onViewQuote?.(q)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          title="Voir"
                        >
                          <Eye size={14} />
                        </button>
                        {q.status === 'draft' && (
                          <button
                            onClick={() => onEditQuote?.(q)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                            title="Modifier"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        {q.status === 'draft' && (
                          <button
                            onClick={() => onSendQuote?.(q)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600"
                            title="Envoyer"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        {(q.status === 'draft' || q.status === 'sent') && (
                          <button
                            onClick={() => onSendDocuSeal?.(q)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                            title="Envoyer pour signature DocuSeal"
                          >
                            <PenTool size={14} />
                          </button>
                        )}
                        {q.status === 'sent' && !q.is_signed && (
                          <button
                            onClick={() => onMarkSigned?.(q)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600"
                            title="Marquer comme signé"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {q.status === 'signed' && (
                          <button
                            onClick={() => onGenerateInvoice?.(q)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-amber-600"
                            title="Générer facture"
                          >
                            <Receipt size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => onDuplicateQuote?.(q)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-purple-600"
                          title="Dupliquer"
                        >
                          <Copy size={14} />
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

      {/* Pagination simple */}
      {total > 25 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Page {page} · {total} devis au total
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              disabled={page * 25 >= total}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuotesList
