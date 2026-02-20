/**
 * StatusBadge — Reusable status badge component
 * Maps status strings to semantic colors (CDC §14)
 */
import React from 'react'

const STATUS_MAP = {
  // Positive
  paid: { label: 'Payée', bg: 'rgba(52,199,89,0.12)', color: '#34C759' },
  signed: { label: 'Signé', bg: 'rgba(52,199,89,0.12)', color: '#34C759' },
  active: { label: 'Actif', bg: 'rgba(52,199,89,0.12)', color: '#34C759' },
  completed: { label: 'Terminé', bg: 'rgba(52,199,89,0.12)', color: '#34C759' },
  resolved: { label: 'Résolu', bg: 'rgba(52,199,89,0.12)', color: '#34C759' },
  // Warning / Pending
  sent: { label: 'Envoyé', bg: 'rgba(255,149,0,0.12)', color: '#FF9500' },
  pending: { label: 'En attente', bg: 'rgba(255,149,0,0.12)', color: '#FF9500' },
  viewed: { label: 'Consulté', bg: 'rgba(0,113,227,0.12)', color: '#0071E3' },
  in_progress: { label: 'En cours', bg: 'rgba(0,113,227,0.12)', color: '#0071E3' },
  waiting: { label: 'En attente', bg: 'rgba(255,149,0,0.12)', color: '#FF9500' },
  open: { label: 'Ouvert', bg: 'rgba(255,149,0,0.12)', color: '#FF9500' },
  deposit_pending: { label: 'Acompte en attente', bg: 'rgba(255,149,0,0.12)', color: '#FF9500' },
  deposit_received: { label: 'Acompte reçu', bg: 'rgba(52,199,89,0.12)', color: '#34C759' },
  in_preparation: { label: 'En préparation', bg: 'rgba(0,113,227,0.12)', color: '#0071E3' },
  on_hold: { label: 'En pause', bg: 'rgba(255,149,0,0.12)', color: '#FF9500' },
  quote_sent: { label: 'Devis envoyé', bg: 'rgba(0,113,227,0.12)', color: '#0071E3' },
  // Danger
  overdue: { label: 'En retard', bg: 'rgba(255,59,48,0.12)', color: '#FF3B30' },
  refused: { label: 'Refusé', bg: 'rgba(255,59,48,0.12)', color: '#FF3B30' },
  rejected: { label: 'Refusé', bg: 'rgba(255,59,48,0.12)', color: '#FF3B30' },
  expired: { label: 'Expiré', bg: 'rgba(255,59,48,0.12)', color: '#FF3B30' },
  cancelled: { label: 'Annulé', bg: 'rgba(255,59,48,0.12)', color: '#FF3B30' },
  closed: { label: 'Fermé', bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' },
  // Neutral
  draft: { label: 'Brouillon', bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' }
}

const StatusBadge = ({ status, label: customLabel }) => {
  const cfg = STATUS_MAP[status] || { label: status || '—', bg: 'rgba(142,142,147,0.12)', color: '#8E8E93' }
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
