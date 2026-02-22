/**
 * QuotesModule — S-03-04
 * Module devis client: liste + detail + acceptation CGV + signature.
 * Le client peut consulter, accepter les CGV et signer les devis.
 */

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FileText, Eye, PenTool, CheckCircle2, Clock, XCircle,
  AlertCircle, Loader2, ArrowLeft, FileCheck, Shield, ChevronDown
} from 'lucide-react'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../stores/authStore'

const GREEN = '#059669'

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Status config
const STATUS_CONFIG = {
  draft: { label: 'Brouillon', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-2)', icon: Clock },
  sent: { label: 'Envoye', bg: 'var(--accent-light)', fg: 'var(--accent)', icon: FileText },
  viewed: { label: 'Consulte', bg: 'rgba(175,82,222,0.12)', fg: '#AF52DE', icon: Eye },
  signed: { label: 'Signe', bg: 'var(--tint-green)', fg: 'var(--semantic-green)', icon: CheckCircle2 },
  expired: { label: 'Expire', bg: 'rgba(0,0,0,0.04)', fg: 'var(--label-3)', icon: XCircle },
  rejected: { label: 'Refuse', bg: 'var(--tint-red)', fg: 'var(--semantic-red)', icon: XCircle }
}

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.fg }}>
      <cfg.icon size={12} />
      {cfg.label}
    </span>
  )
}

// Fetch functions
async function fetchQuotes(userId) {
  const { data } = await api.get('/items/quotes', {
    params: {
      filter: { client_id: { _eq: userId } },
      fields: [
        'id', 'reference', 'title', 'status', 'total_ht', 'total_tva', 'total_ttc',
        'date_created', 'valid_until', 'deposit_percentage', 'deposit_amount',
        'cgv_accepted', 'cgv_accepted_at', 'signed_at',
        'owner_company.name'
      ],
      sort: ['-date_created'],
      limit: 50
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchQuoteDetail(quoteId) {
  const { data } = await api.get(`/items/quotes/${quoteId}`, {
    params: {
      fields: [
        '*',
        'owner_company.name', 'owner_company.iban', 'owner_company.address',
        'owner_company.zip_code', 'owner_company.city',
        'items.*'
      ]
    }
  }).catch(() => ({ data: { data: null } }))
  return data?.data || null
}

async function fetchActiveCGV(ownerCompanyId) {
  const { data } = await api.get('/items/cgv_versions', {
    params: {
      filter: { owner_company: { _eq: ownerCompanyId }, status: { _eq: 'active' } },
      fields: ['id', 'version', 'title', 'content', 'date_created'],
      sort: ['-date_created'],
      limit: 1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data?.[0] || null
}

// --- Quote Detail ---
const QuoteDetail = ({ quoteId, onBack }) => {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [cgvExpanded, setCgvExpanded] = useState(false)
  const [cgvChecked, setCgvChecked] = useState(false)

  const { data: quote, isLoading } = useQuery({
    queryKey: ['client-quote-detail', quoteId],
    queryFn: () => fetchQuoteDetail(quoteId),
    enabled: !!quoteId
  })

  const ownerCompanyId = quote?.owner_company?.id || quote?.owner_company
  const { data: cgv } = useQuery({
    queryKey: ['cgv-active', ownerCompanyId],
    queryFn: () => fetchActiveCGV(ownerCompanyId),
    enabled: !!ownerCompanyId && !quote?.cgv_accepted
  })

  // Mark as viewed
  const viewMutation = useMutation({
    mutationFn: () => api.patch(`/items/quotes/${quoteId}`, {
      status: 'viewed',
      viewed_at: new Date().toISOString()
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-quote'] })
  })

  // Accept CGV
  const acceptCGVMutation = useMutation({
    mutationFn: (cgvId) => Promise.all([
      api.patch(`/items/quotes/${quoteId}`, {
        cgv_accepted: true,
        cgv_accepted_at: new Date().toISOString(),
        cgv_version: cgvId
      }),
      api.post('/items/cgv_acceptances', {
        quote: quoteId,
        cgv_version: cgvId,
        client_id: user?.id,
        accepted_at: new Date().toISOString(),
        ip_address: 'client-portal'
      }).catch(() => null) // graceful if collection doesn't exist
    ]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-quote'] })
      qc.invalidateQueries({ queryKey: ['client-quotes'] })
    }
  })

  // Sign quote
  const signMutation = useMutation({
    mutationFn: () => api.patch(`/items/quotes/${quoteId}`, {
      status: 'signed',
      signed_at: new Date().toISOString(),
      signed_by: user?.id
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-quote'] })
      qc.invalidateQueries({ queryKey: ['client-quotes'] })
    }
  })

  // Auto-mark as viewed on first open
  React.useEffect(() => {
    if (quote && quote.status === 'sent') {
      viewMutation.mutate()
    }
  }, [quote?.id, quote?.status])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="text-center py-12 text-gray-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Devis introuvable</p>
        <button onClick={onBack} className="mt-3 text-sm underline" style={{ color: GREEN }}>Retour</button>
      </div>
    )
  }

  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date()
  const canSign = ['sent', 'viewed'].includes(quote.status) && quote.cgv_accepted && !isExpired
  const needsCGV = ['sent', 'viewed'].includes(quote.status) && !quote.cgv_accepted && !isExpired

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="ds-btn ds-btn-ghost p-2">
          <ArrowLeft size={20} style={{color:'var(--label-2)'}} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold" style={{color:'var(--label-1)'}}>{quote.title || `Devis ${quote.reference}`}</h2>
          <p className="text-sm" style={{color:'var(--label-3)'}}>Ref: {quote.reference} — {formatDate(quote.date_created)}</p>
        </div>
        <StatusBadge status={quote.status} />
      </div>

      {/* Expiry warning */}
      {isExpired && quote.status !== 'signed' && (
        <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{background:'var(--tint-red)', border:'1px solid var(--semantic-red)'}}>
          <XCircle className="w-5 h-5 flex-shrink-0" style={{color:'var(--semantic-red)'}} />
          <p className="text-sm" style={{color:'var(--semantic-red)'}}>Ce devis a expire le {formatDate(quote.valid_until)}.</p>
        </div>
      )}

      {/* Amounts card */}
      <div className="ds-card">
        <div className="p-5" style={{borderBottom:'1px solid var(--sep)'}}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide" style={{color:'var(--label-3)'}}>Montant HT</p>
              <p className="text-lg font-semibold" style={{color:'var(--label-1)'}}>{formatCHF(quote.total_ht)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide" style={{color:'var(--label-3)'}}>TVA</p>
              <p className="text-lg font-semibold" style={{color:'var(--label-1)'}}>{formatCHF(quote.total_tva)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide" style={{color:'var(--label-3)'}}>Total TTC</p>
              <p className="text-lg font-bold" style={{ color: GREEN }}>{formatCHF(quote.total_ttc)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide" style={{color:'var(--label-3)'}}>Acompte ({quote.deposit_percentage || 0}%)</p>
              <p className="text-lg font-semibold" style={{color:'var(--semantic-orange)'}}>{formatCHF(quote.deposit_amount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide" style={{color:'var(--label-3)'}}>Validite</p>
              <p className="text-lg font-semibold" style={{color: isExpired ? 'var(--semantic-red)' : 'var(--label-1)'}}>
                {formatDate(quote.valid_until)}
              </p>
            </div>
          </div>
        </div>

        {/* Line items */}
        {quote.items && quote.items.length > 0 && (
          <div className="p-5" style={{borderBottom:'1px solid var(--sep)'}}>
            <h4 className="text-sm font-semibold mb-3" style={{color:'var(--label-2)'}}>Detail des prestations</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide" style={{color:'var(--label-3)', borderBottom:'1px solid var(--sep)'}}>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qte</th>
                  <th className="text-right py-2">Prix unit.</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{borderColor:'rgba(0,0,0,0.04)'}}>
                {quote.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2" style={{color:'var(--label-1)'}}>{item.description || item.label}</td>
                    <td className="py-2 text-right" style={{color:'var(--label-2)'}}>{item.quantity || 1}</td>
                    <td className="py-2 text-right" style={{color:'var(--label-2)'}}>{formatCHF(item.unit_price || item.price)}</td>
                    <td className="py-2 text-right font-medium" style={{color:'var(--label-1)'}}>
                      {formatCHF((item.quantity || 1) * (item.unit_price || item.price || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {quote.notes && (
          <div className="p-5">
            <h4 className="text-sm font-semibold mb-2" style={{color:'var(--label-2)'}}>Conditions et notes</h4>
            <p className="text-sm whitespace-pre-line" style={{color:'var(--label-2)'}}>{quote.notes}</p>
          </div>
        )}
      </div>

      {/* CGV Acceptance */}
      {needsCGV && cgv && (
        <div className="ds-card">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5" style={{color:'var(--label-2)'}} />
              <h3 className="font-semibold" style={{color:'var(--label-1)'}}>Conditions Generales de Vente</h3>
              <span className="text-xs" style={{color:'var(--label-3)'}}>v{cgv.version}</span>
            </div>

            {/* Expandable CGV content */}
            <div className="rounded-lg mb-4" style={{border:'1px solid var(--sep)'}}>
              <button
                onClick={() => setCgvExpanded(!cgvExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium ds-btn-ghost"
                style={{color:'var(--label-2)'}}
              >
                <span>{cgv.title || 'Conditions Generales de Vente'}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${cgvExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {cgvExpanded && (
                <div className="px-4 pb-4 max-h-[400px] overflow-y-auto" style={{borderTop:'1px solid var(--sep)'}}>
                  <div className="prose prose-sm mt-3 whitespace-pre-line" style={{color:'var(--label-2)'}}>
                    {cgv.content}
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox + Accept button */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="cgv-accept"
                checked={cgvChecked}
                onChange={(e) => setCgvChecked(e.target.checked)}
                className="mt-1 rounded" style={{borderColor:'var(--sep)', accentColor:'var(--accent)'}}
              />
              <label htmlFor="cgv-accept" className="text-sm" style={{color:'var(--label-2)'}}>
                J'ai lu et j'accepte les Conditions Generales de Vente (v{cgv.version}).
              </label>
            </div>

            <button
              onClick={() => acceptCGVMutation.mutate(cgv.id)}
              disabled={!cgvChecked || acceptCGVMutation.isPending}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: GREEN }}
            >
              {acceptCGVMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileCheck size={14} />
              )}
              Accepter les CGV
            </button>
          </div>
        </div>
      )}

      {/* CGV already accepted badge */}
      {quote.cgv_accepted && (
        <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{background:'var(--accent-light)', border:'1px solid var(--accent)'}}>
          <CheckCircle2 className="w-5 h-5" style={{color:'var(--accent)'}} />
          <div>
            <p className="text-sm font-medium" style={{color:'var(--accent)'}}>CGV acceptees</p>
            <p className="text-xs" style={{color:'var(--accent)'}}>{formatDate(quote.cgv_accepted_at)}</p>
          </div>
        </div>
      )}

      {/* Sign button */}
      {canSign && (
        <div className="ds-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold" style={{color:'var(--label-1)'}}>Signer ce devis</h3>
              <p className="text-sm mt-1" style={{color:'var(--label-3)'}}>
                En signant, vous acceptez les conditions du devis et l'acompte de {formatCHF(quote.deposit_amount)} sera demande.
              </p>
            </div>
            <button
              onClick={() => signMutation.mutate()}
              disabled={signMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-colors"
              style={{ backgroundColor: GREEN }}
            >
              {signMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <PenTool size={16} />
              )}
              Signer le devis
            </button>
          </div>
        </div>
      )}

      {/* Already signed */}
      {quote.status === 'signed' && (
        <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{background:'var(--accent-light)', border:'1px solid var(--accent)'}}>
          <CheckCircle2 className="w-5 h-5" style={{color:'var(--accent)'}} />
          <div>
            <p className="text-sm font-medium" style={{color:'var(--accent)'}}>Devis signe</p>
            <p className="text-xs" style={{color:'var(--accent)'}}>{formatDate(quote.signed_at)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Main Module ---
const QuotesModule = () => {
  const user = useAuthStore((s) => s.user)
  const userId = user?.id
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['client-quotes', userId],
    queryFn: () => fetchQuotes(userId),
    enabled: !!userId,
    staleTime: 30_000
  })

  const filtered = statusFilter === 'all'
    ? quotes
    : quotes.filter(q => q.status === statusFilter)

  if (selectedQuote) {
    return (
      <QuoteDetail
        quoteId={selectedQuote}
        onBack={() => setSelectedQuote(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold" style={{color:'var(--label-1)'}}>Mes devis</h2>
        <p className="text-sm mt-1" style={{color:'var(--label-3)'}}>Consultez, acceptez les CGV et signez vos devis</p>
      </div>

      {/* Action needed alert */}
      {quotes.some(q => ['sent', 'viewed'].includes(q.status)) && (
        <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{background:'var(--tint-orange)', border:'1px solid var(--semantic-orange)'}}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{color:'var(--semantic-orange)'}} />
          <p className="text-sm" style={{color:'var(--semantic-orange)'}}>
            <strong>{quotes.filter(q => ['sent', 'viewed'].includes(q.status)).length} devis</strong> en attente de votre signature.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1">
        {[
          { value: 'all', label: 'Tous' },
          { value: 'sent', label: 'A signer' },
          { value: 'viewed', label: 'Consultes' },
          { value: 'signed', label: 'Signes' },
          { value: 'expired', label: 'Expires' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              statusFilter === f.value
                ? 'text-white'
                : 'ds-btn-ghost'
            }`}
            style={statusFilter === f.value ? { backgroundColor: GREEN } : undefined}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="ds-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: GREEN }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Aucun devis</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(q => {
              const isExpired = q.valid_until && new Date(q.valid_until) < new Date()
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuote(q.id)}
                  className="px-5 py-4 cursor-pointer transition-colors"
                  style={{':hover':{background:'rgba(0,0,0,0.02)'}}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium truncate" style={{color:'var(--label-1)'}}>
                          {q.title || `Devis ${q.reference}`}
                        </p>
                        <StatusBadge status={isExpired && q.status !== 'signed' ? 'expired' : q.status} />
                        {q.cgv_accepted && (
                          <span className="inline-flex items-center gap-1 text-xs" style={{color:'var(--accent)'}}>
                            <Shield size={10} /> CGV
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs" style={{color:'var(--label-3)'}}>
                        <span>Ref: {q.reference}</span>
                        <span>{formatDate(q.date_created)}</span>
                        {q.valid_until && (
                          <span style={isExpired ? {color:'var(--semantic-red)'} : undefined}>
                            Valide jusqu'au {formatDate(q.valid_until)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold" style={{color:'var(--label-1)'}}>{formatCHF(q.total_ttc)}</p>
                      {q.deposit_amount > 0 && (
                        <p className="text-xs" style={{color:'var(--semantic-orange)'}}>Acompte: {formatCHF(q.deposit_amount)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuotesModule
