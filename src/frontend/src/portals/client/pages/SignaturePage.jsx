/**
 * SignaturePage — H-03b
 * Page dediee pour la signature electronique d'un devis via DocuSeal.
 * Route : /client/quotes/:quoteId/sign
 *
 * Affiche un resume du devis + iframe DocuSeal pour signature.
 * Gere les etats : chargement, signature en cours, complete, erreur.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useClientAuth } from '../context/ClientAuthContext'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2
  }).format(value || 0)

const SignaturePage = () => {
  const { quoteId } = useParams()
  const navigate = useNavigate()
  const { authFetch } = useClientAuth()
  const iframeRef = useRef(null)

  const [quote, setQuote] = useState(null)
  const [embedUrl, setEmbedUrl] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | signing | completed | error
  const [error, setError] = useState(null)

  // --- Charger le devis et l'URL de signature ---

  useEffect(() => {
    loadQuoteAndSignature()

    const handleMessage = (event) => {
      const data = event.data
      if (!data) return

      // DocuSeal postMessage events
      if (data.type === 'docuseal' || data.event === 'completed' || data.event === 'signed') {
        setStatus('completed')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [quoteId])

  const loadQuoteAndSignature = async () => {
    setStatus('loading')
    setError(null)

    try {
      // 1. Charger le devis
      const quoteRes = await authFetch(`/items/quotes/${quoteId}?fields=*,contact_id.first_name,contact_id.last_name,company_id.name,owner_company_id.name`)
      const quoteData = await quoteRes.json()
      const q = quoteData?.data
      if (!q) throw new Error('Devis introuvable')
      setQuote(q)

      // 2. Si deja signe, afficher completion
      if (q.is_signed || q.status === 'signed') {
        setStatus('completed')
        return
      }

      // 3. Si embed URL existe deja, l'utiliser
      if (q.docuseal_embed_url) {
        setEmbedUrl(q.docuseal_embed_url)
        setStatus('ready')
        return
      }

      // 4. Sinon, demander une nouvelle signature
      const sigRes = await authFetch(`/api/integrations/docuseal/signature/quote/${quoteId}`, {
        method: 'POST'
      })
      const sigData = await sigRes.json()

      if (!sigRes.ok) {
        throw new Error(sigData.error || 'Erreur lors de la creation de la signature')
      }

      if (sigData.embedUrl) {
        setEmbedUrl(sigData.embedUrl)
        setStatus('ready')
      } else if (sigData.alreadySent) {
        // Re-charger le devis pour obtenir l'URL
        const refreshRes = await authFetch(`/items/quotes/${quoteId}?fields=docuseal_embed_url`)
        const refreshData = await refreshRes.json()
        if (refreshData?.data?.docuseal_embed_url) {
          setEmbedUrl(refreshData.data.docuseal_embed_url)
          setStatus('ready')
        } else {
          setError('La demande de signature a ete envoyee. Verifiez votre email.')
          setStatus('error')
        }
      } else {
        throw new Error('Aucune URL de signature recue')
      }
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handleIframeLoad = () => {
    if (status === 'ready') setStatus('signing')
  }

  // --- Loading ---
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Preparation de la signature...</p>
        </div>
      </div>
    )
  }

  // --- Error ---
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadQuoteAndSignature}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reessayer
            </button>
            <button
              onClick={() => navigate('/client/quotes')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour aux devis
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Completed ---
  if (status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-green-700 mb-2">Devis signe</h2>
          <p className="text-gray-600 mb-2">
            Votre signature a ete enregistree avec succes.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vous recevrez une confirmation par email avec le document signe.
          </p>
          {quote && (
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left text-sm">
              <p className="font-medium text-green-800">Devis {quote.quote_number}</p>
              <p className="text-green-700">
                Montant : {formatCHF(quote.total)} {quote.currency || 'CHF'}
              </p>
              {quote.deposit_amount > 0 && (
                <p className="text-green-700 mt-1">
                  Acompte de {formatCHF(quote.deposit_amount)} a regler
                </p>
              )}
            </div>
          )}
          <button
            onClick={() => navigate('/client')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au portail
          </button>
        </div>
      </div>
    )
  }

  // --- Ready / Signing — afficher resume + iframe ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Signature electronique</h1>
            <p className="text-sm text-gray-500">
              {quote?.quote_number ? `Devis ${quote.quote_number}` : 'Devis'}
              {quote?.company_id?.name ? ` — ${quote.company_id.name}` : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/client/quotes')}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Resume du devis */}
        {quote && (
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-500">Client</span>
              <p className="font-medium text-gray-900">
                {quote.contact_id
                  ? `${quote.contact_id.first_name || ''} ${quote.contact_id.last_name || ''}`.trim()
                  : '—'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Entreprise</span>
              <p className="font-medium text-gray-900">{quote.company_id?.name || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">Montant TTC</span>
              <p className="font-semibold text-gray-900">{formatCHF(quote.total)} {quote.currency || 'CHF'}</p>
            </div>
            {quote.deposit_amount > 0 && (
              <div>
                <span className="text-gray-500">Acompte</span>
                <p className="font-medium text-amber-600">
                  {formatCHF(quote.deposit_amount)} ({quote.deposit_percentage || 30}%)
                </p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Statut</span>
              <p className="font-medium text-blue-600">
                {status === 'signing' ? 'Signature en cours...' : 'Pret a signer'}
              </p>
            </div>
          </div>
        )}

        {/* DocuSeal Iframe */}
        {embedUrl && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ minHeight: '700px' }}>
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title="Signature electronique DocuSeal"
              onLoad={handleIframeLoad}
              className="w-full border-0"
              style={{ height: '700px' }}
              allow="camera;microphone"
            />
          </div>
        )}

        {/* Legal notice */}
        <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-500">
          <strong>Signature electronique securisee</strong> — Ce document est signe
          electroniquement conformement aux normes suisses (ZertES/SCSE).
          Votre signature a la meme valeur juridique qu'une signature manuscrite.
        </div>
      </div>
    </div>
  )
}

export default SignaturePage
