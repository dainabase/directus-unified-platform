/**
 * QuoteSignature — C-03
 * Client views quotes, signs with CGV acceptance.
 * Route: /client/quotes
 */
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  FileText, Eye, PenTool, CheckCircle, Clock, XCircle, AlertTriangle,
  X, Loader2, ChevronDown, ChevronUp, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'

const formatCHF = (v) => new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(v || 0)
const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const STATUS_CONFIG = {
  sent: { label: 'En attente', bg: 'var(--accent-light)', fg: 'var(--accent)', icon: Clock },
  viewed: { label: 'Consulté', bg: 'rgba(175,82,222,0.12)', fg: '#AF52DE', icon: Eye },
  signed: { label: 'Signé', bg: 'var(--success-light)', fg: 'var(--success)', icon: CheckCircle },
  rejected: { label: 'Refusé', bg: 'var(--danger-light)', fg: 'var(--danger)', icon: XCircle },
  expired: { label: 'Expiré', bg: 'rgba(0,0,0,0.04)', fg: 'var(--text-secondary)', icon: Clock }
}

const QuoteSignature = () => {
  const { client } = useClientAuth()
  const contactId = client?.id
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const autoSignId = searchParams.get('sign')

  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showSignModal, setShowSignModal] = useState(false)
  const [cgvExpanded, setCgvExpanded] = useState(false)
  const [cgvAccepted, setCgvAccepted] = useState(false)
  const [signerName, setSignerName] = useState('')
  const [signing, setSigning] = useState(false)

  // Fetch client's quotes (exclude drafts)
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['client-quotes-list', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          filter: { contact_id: { _eq: contactId }, status: { _nin: ['draft'] } },
          fields: ['id', 'quote_number', 'description', 'status', 'total', 'subtotal',
                   'tax_rate', 'tax_amount', 'currency', 'deposit_percentage', 'deposit_amount',
                   'valid_until', 'is_signed', 'signed_at', 'owner_company_id', 'created_at'],
          sort: ['-created_at']
        }
      })
      return data?.data || []
    },
    enabled: !!contactId
  })

  // Auto-open sign modal if ?sign=ID is in URL
  React.useEffect(() => {
    if (autoSignId && quotes.length > 0) {
      const q = quotes.find(q => q.id === autoSignId)
      if (q && (q.status === 'sent' || q.status === 'viewed')) {
        setSelectedQuote(q)
        setShowSignModal(true)
      }
    }
  }, [autoSignId, quotes])

  // Fetch active CGV for HYPERVISUAL
  const { data: activeCgv } = useQuery({
    queryKey: ['active-cgv'],
    queryFn: async () => {
      const { data } = await api.get('/items/cgv_versions', {
        params: {
          filter: { status: { _eq: 'active' } },
          fields: ['id', 'version', 'title', 'content_html', 'summary', 'owner_company_id'],
          sort: ['-effective_date'],
          limit: 1
        }
      })
      return data?.data?.[0] || null
    }
  })

  // Mark as viewed when opening
  const viewMutation = useMutation({
    mutationFn: (quoteId) => api.patch(`/items/quotes/${quoteId}`, {
      status: 'viewed', viewed_at: new Date().toISOString()
    })
  })

  // Sign mutation — the critical flow
  const signMutation = useMutation({
    mutationFn: async ({ quote, cgvVersionId, signerName }) => {
      const now = new Date().toISOString()

      // 1. Create CGV acceptance
      let cgvAcceptanceId = null
      if (cgvVersionId) {
        const { data: accRes } = await api.post('/items/cgv_acceptances', {
          contact_id: contactId,
          company_id: client?.company_id || null,
          cgv_version_id: cgvVersionId,
          quote_id: quote.id,
          accepted_at: now,
          acceptance_method: 'portal_checkbox',
          user_agent: navigator.userAgent,
          is_valid: true
        })
        cgvAcceptanceId = accRes?.data?.id
      }

      // 2. Create signature log
      await api.post('/items/signature_logs', {
        quote_id: quote.id,
        contact_id: contactId,
        signer_name: signerName,
        signer_email: client?.email,
        signer_role: 'client',
        signed_at: now,
        user_agent: navigator.userAgent,
        signature_type: 'SES',
        is_valid: true
      })

      // 3. Update quote
      await api.patch(`/items/quotes/${quote.id}`, {
        is_signed: true,
        signed_at: now,
        status: 'signed',
        cgv_accepted: true,
        cgv_version_id: cgvVersionId,
        cgv_acceptance_id: cgvAcceptanceId
      })
    },
    onSuccess: () => {
      toast.success('Devis signé avec succès ! Vous recevrez votre facture d\'acompte sous peu.')
      queryClient.invalidateQueries({ queryKey: ['client-quotes-list'] })
      queryClient.invalidateQueries({ queryKey: ['client-quotes'] })
      setShowSignModal(false)
      setSelectedQuote(null)
      setCgvAccepted(false)
      setSignerName('')
    },
    onError: (err) => {
      toast.error('Erreur lors de la signature: ' + (err.message || 'Veuillez réessayer'))
    }
  })

  const handleOpenQuote = (quote) => {
    setSelectedQuote(quote)
    if (quote.status === 'sent') {
      viewMutation.mutate(quote.id)
    }
    if (quote.status === 'sent' || quote.status === 'viewed') {
      setShowSignModal(true)
      setSignerName(`${client?.first_name || ''} ${client?.last_name || ''}`.trim())
    }
  }

  const handleSign = () => {
    if (!cgvAccepted) { toast.error('Veuillez accepter les CGV'); return }
    if (!signerName.trim()) { toast.error('Veuillez saisir votre nom complet'); return }
    signMutation.mutate({
      quote: selectedQuote,
      cgvVersionId: activeCgv?.id || null,
      signerName: signerName.trim()
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{color:'var(--accent)'}} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold" style={{color:'var(--text-primary)'}}>Mes devis</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-tertiary)'}}>Consultez et signez vos devis</p>
      </div>

      {/* Quotes list */}
      {quotes.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3" style={{color:'var(--text-tertiary)'}} />
          <p style={{color:'var(--text-tertiary)'}}>Aucun devis pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(quote => {
            const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.sent
            const Icon = cfg.icon
            const canSign = quote.status === 'sent' || quote.status === 'viewed'
            return (
              <div key={quote.id}
                className="ds-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>{quote.quote_number}</h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{background: cfg.bg, color: cfg.fg}}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>
                    {quote.description && (
                      <p className="text-sm mb-2 line-clamp-2" style={{color:'var(--text-tertiary)'}}>{quote.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm" style={{color:'var(--text-tertiary)'}}>
                      <span>Créé le {formatDate(quote.created_at)}</span>
                      {quote.valid_until && <span>Valide jusqu'au {formatDate(quote.valid_until)}</span>}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold" style={{color:'var(--text-primary)'}}>{formatCHF(quote.total)}</p>
                    <p className="text-xs" style={{color:'var(--text-tertiary)'}}>TVA {quote.tax_rate || 8.1}% incluse</p>
                    {canSign ? (
                      <button onClick={() => handleOpenQuote(quote)}
                        className="ds-btn ds-btn-primary mt-2 flex items-center gap-1 px-4 py-2 text-sm font-medium">
                        <PenTool size={14} /> Signer
                      </button>
                    ) : quote.status === 'signed' ? (
                      <p className="mt-2 text-xs font-medium" style={{color:'var(--accent)'}}>Signé le {formatDate(quote.signed_at)}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sign Modal */}
      {showSignModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 sticky top-0 rounded-t-2xl z-10" style={{borderBottom:'1px solid var(--border-light)', background:'var(--bg-surface)'}}>
              <div>
                <h2 className="text-lg font-semibold" style={{color:'var(--text-primary)'}}>Signer le devis {selectedQuote.quote_number}</h2>
                <p className="text-sm" style={{color:'var(--text-tertiary)'}}>Relisez les détails et signez</p>
              </div>
              <button onClick={() => { setShowSignModal(false); setCgvAccepted(false) }}
                className="ds-btn ds-btn-ghost p-2" style={{color:'var(--text-tertiary)'}}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quote summary */}
              <div className="rounded-xl p-5" style={{background:'rgba(0,0,0,0.02)'}}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{color:'var(--text-secondary)'}}>Résumé du devis</h3>
                {selectedQuote.description && (
                  <p className="text-sm mb-4" style={{color:'var(--text-secondary)'}}>{selectedQuote.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{color:'var(--text-tertiary)'}}>Sous-total HT</span>
                    <span className="font-medium">{formatCHF(selectedQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{color:'var(--text-tertiary)'}}>TVA ({selectedQuote.tax_rate || 8.1}%)</span>
                    <span className="font-medium">{formatCHF(selectedQuote.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 mt-2" style={{borderTop:'1px solid var(--border-light)'}}>
                    <span>Total TTC</span>
                    <span style={{color:'var(--text-primary)'}}>{formatCHF(selectedQuote.total)}</span>
                  </div>
                  {selectedQuote.deposit_percentage > 0 && (
                    <div className="flex justify-between text-sm pt-1" style={{color:'var(--accent)'}}>
                      <span>Acompte ({selectedQuote.deposit_percentage}%)</span>
                      <span className="font-medium">{formatCHF(selectedQuote.deposit_amount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CGV Section */}
              <div className="rounded-xl overflow-hidden" style={{border:'1px solid var(--border-light)'}}>
                <button onClick={() => setCgvExpanded(!cgvExpanded)}
                  className="w-full flex items-center justify-between p-4 ds-btn-ghost transition-colors" style={{background:'rgba(0,0,0,0.02)'}}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{color:'var(--accent)'}} />
                    <span className="font-medium" style={{color:'var(--text-primary)'}}>
                      Conditions Générales de Vente
                      {activeCgv && <span className="text-xs ml-2" style={{color:'var(--text-tertiary)'}}>({activeCgv.version})</span>}
                    </span>
                  </div>
                  {cgvExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {cgvExpanded && (
                  <div className="p-4 max-h-80 overflow-y-auto" style={{borderTop:'1px solid var(--border-light)'}}>
                    {activeCgv?.content_html ? (
                      <div className="prose prose-sm max-w-none" style={{color:'var(--text-secondary)'}}
                        dangerouslySetInnerHTML={{ __html: activeCgv.content_html }} />
                    ) : activeCgv?.summary ? (
                      <p className="text-sm whitespace-pre-wrap" style={{color:'var(--text-secondary)'}}>{activeCgv.summary}</p>
                    ) : (
                      <div className="text-center py-6" style={{color:'var(--warning)'}}>
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">CGV en cours de mise à jour — contactez HYPERVISUAL</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CGV checkbox */}
              {!activeCgv ? (
                <div className="rounded-lg p-4 text-sm flex items-center gap-2" style={{background:'var(--warning-light)', border:'1px solid var(--warning)', color:'var(--warning)'}}>
                  <AlertTriangle size={16} />
                  CGV en cours de mise à jour — signature temporairement désactivée
                </div>
              ) : (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" checked={cgvAccepted} onChange={(e) => setCgvAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded" style={{borderColor:'var(--border-light)', accentColor:'var(--accent)'}} />
                  <span className="text-sm" style={{color:'var(--text-secondary)'}}>
                    J'ai lu et j'accepte les <strong>Conditions Générales de Vente</strong> ({activeCgv.version}) d'HYPERVISUAL Switzerland
                  </span>
                </label>
              )}

              {/* Signature field */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{color:'var(--text-secondary)'}}>
                  Signature électronique
                </label>
                <p className="text-xs mb-2" style={{color:'var(--text-tertiary)'}}>
                  Tapez votre nom complet pour signer (signature simple conforme CO Art. 14)
                </p>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Prénom Nom"
                  className="ds-input w-full px-4 py-3 rounded-xl font-serif text-lg italic"
                  style={{color:'var(--text-primary)'}}
                />
              </div>

              {/* Sign button */}
              <button
                onClick={handleSign}
                disabled={!cgvAccepted || !signerName.trim() || signMutation.isPending || !activeCgv}
                className="ds-btn ds-btn-primary w-full flex items-center justify-center gap-2 py-3 px-4 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signMutation.isPending ? (
                  <><Loader2 size={18} className="animate-spin" /> Signature en cours...</>
                ) : (
                  <><PenTool size={18} /> Signer et accepter le devis</>
                )}
              </button>

              <p className="text-xs text-center" style={{color:'var(--text-tertiary)'}}>
                En signant, vous acceptez les conditions du devis et les CGV. Un email de confirmation vous sera envoyé.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuoteSignature
