/**
 * QuotesModule — S-02-04
 * Page principale /prestataire/quotes.
 * Le prestataire voit les demandes de devis reçues et peut y répondre.
 */

import React, { useState } from 'react'
import QuotesList from './QuotesList'
import QuoteResponseForm from './QuoteResponseForm'

const QuotesModule = () => {
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [respondingQuote, setRespondingQuote] = useState(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Devis reçus</h1>
        <p className="text-sm text-gray-500">
          Demandes de devis envoyées par HYPERVISUAL — répondez avec votre prix et délai
        </p>
      </div>

      {/* Liste */}
      <QuotesList
        onSelectQuote={setSelectedQuote}
        onRespondQuote={setRespondingQuote}
      />

      {/* Modal réponse */}
      {respondingQuote && (
        <QuoteResponseForm
          proposal={respondingQuote}
          onClose={() => setRespondingQuote(null)}
        />
      )}
    </div>
  )
}

export default QuotesModule
