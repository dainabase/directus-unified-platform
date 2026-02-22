/**
 * RevolutHub — Phase C (C.4)
 * Integration hub page for Revolut Business banking.
 * Apple DS v2.0 tokens.
 */

import React from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'

const REVOLUT_URL = 'https://business.revolut.com'

const RevolutHub = ({ selectedCompany }) => {
  return (
    <div className="space-y-6 ds-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">Revolut Business</h1>
          <p className="ds-meta mt-0.5">Comptes bancaires, transactions, virements</p>
        </div>
        <a
          href={REVOLUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ds-btn ds-btn-secondary"
        >
          <ExternalLink size={14} />
          Ouvrir Revolut
        </a>
      </div>

      <div className="ds-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 40,
              height: 40,
              background: 'var(--tint-blue)',
            }}
          >
            <CreditCard size={20} style={{ color: 'var(--semantic-blue)' }} />
          </div>
          <div>
            <h2 className="ds-card-title">Revolut Business API v2</h2>
            <p className="ds-meta">5 comptes entreprise — sync automatique</p>
          </div>
        </div>

        <p className="ds-body" style={{ color: 'var(--label-2)' }}>
          Les transactions Revolut sont synchronisees automatiquement via l'API.
          Consultez la page Banking pour voir les soldes et mouvements en temps reel.
        </p>

        <div className="mt-4 flex gap-3">
          <a href="/superadmin/finance/banking" className="ds-btn ds-btn-primary">
            Voir Banking
          </a>
          <a
            href={REVOLUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-btn ds-btn-ghost"
          >
            <ExternalLink size={14} />
            Console Revolut
          </a>
        </div>
      </div>
    </div>
  )
}

export default RevolutHub
