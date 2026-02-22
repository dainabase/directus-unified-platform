/**
 * MauticHub — Phase C (C.4)
 * Integration hub page for Mautic marketing automation.
 * Apple DS v2.0 tokens.
 */

import React from 'react'
import { Megaphone, ExternalLink } from 'lucide-react'

const MAUTIC_URL = import.meta.env.VITE_MAUTIC_URL || 'https://mautic.hypervisual.ch'

const MauticHub = ({ selectedCompany }) => {
  return (
    <div className="space-y-6 ds-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">Mautic</h1>
          <p className="ds-meta mt-0.5">Marketing automation & email campaigns</p>
        </div>
        <a
          href={MAUTIC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ds-btn ds-btn-secondary"
        >
          <ExternalLink size={14} />
          Ouvrir Mautic
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
            <Megaphone size={20} style={{ color: 'var(--semantic-blue)' }} />
          </div>
          <div>
            <h2 className="ds-card-title">Mautic 5.x</h2>
            <p className="ds-meta">Campagnes, contacts, segments, emails</p>
          </div>
        </div>

        <iframe
          src={MAUTIC_URL}
          title="Mautic"
          className="w-full rounded-lg border"
          style={{
            height: 'calc(100vh - 280px)',
            border: '1px solid var(--sep)',
          }}
        />
      </div>
    </div>
  )
}

export default MauticHub
