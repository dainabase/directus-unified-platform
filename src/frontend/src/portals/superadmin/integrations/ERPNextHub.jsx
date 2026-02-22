/**
 * ERPNextHub — Phase C (C.4)
 * Integration hub page for ERPNext advanced accounting.
 * Apple DS v2.0 tokens.
 */

import React from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'https://erp.hypervisual.ch'

const ERPNextHub = ({ selectedCompany }) => {
  return (
    <div className="space-y-6 ds-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">ERPNext</h1>
          <p className="ds-meta mt-0.5">Comptabilite avancee, plan comptable PME Kafer</p>
        </div>
        <a
          href={ERPNEXT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ds-btn ds-btn-secondary"
        >
          <ExternalLink size={14} />
          Ouvrir ERPNext
        </a>
      </div>

      <div className="ds-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 40,
              height: 40,
              background: 'var(--tint-green)',
            }}
          >
            <BookOpen size={20} style={{ color: 'var(--semantic-green)' }} />
          </div>
          <div>
            <h2 className="ds-card-title">ERPNext v15</h2>
            <p className="ds-meta">API REST — sync comptable bidirectionnelle</p>
          </div>
        </div>

        <iframe
          src={ERPNEXT_URL}
          title="ERPNext"
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

export default ERPNextHub
