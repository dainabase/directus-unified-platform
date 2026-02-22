/**
 * StatusBadge — Reusable status badge component
 * Maps status strings to semantic colors (CDC §14)
 */
import React from 'react'

const STATUS_MAP = {
  // Positive
  paid: { label: 'Payée', bg: 'rgba(52,199,89,0.12)', color: 'var(--semantic-green)' },
  signed: { label: 'Signé', bg: 'rgba(52,199,89,0.12)', color: 'var(--semantic-green)' },
  active: { label: 'Actif', bg: 'rgba(52,199,89,0.12)', color: 'var(--semantic-green)' },
  completed: { label: 'Terminé', bg: 'rgba(52,199,89,0.12)', color: 'var(--semantic-green)' },
  resolved: { label: 'Résolu', bg: 'rgba(52,199,89,0.12)', color: 'var(--semantic-green)' },
  // Warning / Pending
  sent: { label: 'Envoyé', bg: 'rgba(255,149,0,0.12)', color: 'var(--semantic-orange)' },
  pending: { label: 'En attente', bg: 'rgba(255,149,0,0.12)', color: 'var(--semantic-orange)' },
  viewed: { label: 'Consulté', bg: 'rgba(0,113,227,0.12)', color: 'var(--accent-hover)' },
  in_progress: { label: 'En cours', bg: 'rgba(0,113,227,0.12)', color: 'var(--accent-hover)' },
  waiting: { label: 'En attente', bg: 'rgba(255,149,0,0.12)', color: 'var(--semantic-orange)' },
  open: { label: 'Ouvert', bg: 'rgba(255,149,0,0.12)', color: 'var(--semantic-orange)' },
  deposit_pending: { label: 'Acompte en attente', bg: 'rgba(255,149,0,0.12)', color: 'var(--semantic-orange)' },
  deposit_received: { label: 'Acompte reçu', bg: 'rgba(52,199,89,0.12)', color: 'var(--semantic-green)' },
  in_preparation: { label: 'En préparation', bg: 'rgba(0,113,227,0.12)', color: 'var(--accent-hover)' },
  on_hold: { label: 'En pause', bg: 'rgba(255,149,0,0.12)', color: 'var(--semantic-orange)' },
  quote_sent: { label: 'Devis envoyé', bg: 'rgba(0,113,227,0.12)', color: 'var(--accent-hover)' },
  // Danger
  overdue: { label: 'En retard', bg: 'rgba(255,59,48,0.12)', color: 'var(--semantic-red)' },
  refused: { label: 'Refusé', bg: 'rgba(255,59,48,0.12)', color: 'var(--semantic-red)' },
  rejected: { label: 'Refusé', bg: 'rgba(255,59,48,0.12)', color: 'var(--semantic-red)' },
  expired: { label: 'Expiré', bg: 'rgba(255,59,48,0.12)', color: 'var(--semantic-red)' },
  cancelled: { label: 'Annulé', bg: 'rgba(255,59,48,0.12)', color: 'var(--semantic-red)' },
  closed: { label: 'Fermé', bg: 'rgba(142,142,147,0.12)', color: 'var(--gray-1)' },
  // Neutral
  draft: { label: 'Brouillon', bg: 'rgba(142,142,147,0.12)', color: 'var(--gray-1)' }
}

const StatusBadge = ({ status, label: customLabel }) => {
  const cfg = STATUS_MAP[status] || { label: status || '—', bg: 'rgba(142,142,147,0.12)', color: 'var(--gray-1)' }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: '18px',
        background: cfg.bg,
        color: cfg.color,
        whiteSpace: 'nowrap'
      }}
    >
      {customLabel || cfg.label}
    </span>
  )
}

export default StatusBadge
