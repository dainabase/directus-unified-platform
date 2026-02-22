/**
 * InvoiceNinjaHub — Phase D (D.1.1)
 * Hub Integration Invoice Ninja — rewrite DS v2.0
 * Status badge, raccourcis rapides, 5 dernieres factures, alerte impayes.
 *
 * Backend API: /api/invoice-ninja (auth: superadmin)
 * Endpoints: /health, /invoices, /dashboard
 *
 * @version 2.0.0
 * @date 2026-02-22
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, Plus, Send, AlertCircle, CheckCircle2, XCircle,
  RefreshCw, Loader2, ExternalLink, ArrowRight, Receipt
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'

// ────────────────────────────────────────────────────────────────────────────
// API fetchers
// ────────────────────────────────────────────────────────────────────────────

const fetchHealth = async () => {
  try {
    const res = await api.get('/api/invoice-ninja/health')
    return { online: res.data?.success === true, data: res.data }
  } catch {
    return { online: false, data: null }
  }
}

const fetchRecentInvoices = async () => {
  try {
    const res = await api.get('/api/invoice-ninja/invoices', {
      params: { per_page: 5, sort: '-date' }
    })
    return res.data?.data || []
  } catch {
    return []
  }
}

const fetchDashboard = async () => {
  try {
    const res = await api.get('/api/invoice-ninja/dashboard')
    return res.data?.data || {}
  } catch {
    return {}
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const formatCHF = (value, currency = 'CHF') => {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('fr-CH', { style: 'currency', currency }).format(num)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: fr })
  } catch {
    return dateStr
  }
}

const STATUS_MAP = {
  1: { label: 'Brouillon', style: 'ds-badge ds-badge-default' },
  2: { label: 'Envoyee',   style: 'ds-badge ds-badge-info' },
  3: { label: 'Vue',       style: 'ds-badge ds-badge-info' },
  4: { label: 'Payee',     style: 'ds-badge ds-badge-success' },
  5: { label: 'Annulee',   style: 'ds-badge ds-badge-danger' },
  6: { label: 'Archivee',  style: 'ds-badge ds-badge-default' },
  draft:     { label: 'Brouillon', style: 'ds-badge ds-badge-default' },
  sent:      { label: 'Envoyee',   style: 'ds-badge ds-badge-info' },
  viewed:    { label: 'Vue',       style: 'ds-badge ds-badge-info' },
  paid:      { label: 'Payee',     style: 'ds-badge ds-badge-success' },
  cancelled: { label: 'Annulee',   style: 'ds-badge ds-badge-danger' },
  overdue:   { label: 'En retard', style: 'ds-badge ds-badge-danger' },
  partial:   { label: 'Partielle', style: 'ds-badge ds-badge-warning' }
}

function getStatusInfo(status) {
  if (!status) return { label: '-', style: 'ds-badge ds-badge-default' }
  return STATUS_MAP[status] || { label: String(status), style: 'ds-badge ds-badge-default' }
}

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

export function InvoiceNinjaHub({ selectedCompany }) {
  // ── Queries ──
  const companyId = selectedCompany?.id || selectedCompany || 'all'

  const {
    data: health = { online: false },
    isLoading: healthLoading,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['invoice-ninja-health', companyId],
    queryFn: fetchHealth,
    staleTime: 30_000,
    refetchInterval: 60_000
  })

  const {
    data: invoices = [],
    isLoading: invoicesLoading
  } = useQuery({
    queryKey: ['invoice-ninja-recent', companyId],
    queryFn: fetchRecentInvoices,
    staleTime: 60_000,
    enabled: health.online
  })

  const {
    data: dashboard = {},
    isLoading: dashboardLoading
  } = useQuery({
    queryKey: ['invoice-ninja-dashboard', companyId],
    queryFn: fetchDashboard,
    staleTime: 120_000,
    enabled: health.online
  })

  const overdueCount = dashboard.overdue_count || 0
  const overdueAmount = dashboard.overdue_amount || 0
  const totalRevenue = dashboard.total_revenue || dashboard.paid_to_date || 0
  const pendingAmount = dashboard.pending_amount || dashboard.balance || 0

  // ── Shortcut actions ──
  const IN_URL = import.meta.env.VITE_INVOICE_NINJA_URL || ''
  const openInvoiceNinja = (path) => {
    if (IN_URL) {
      window.open(`${IN_URL}${path}`, '_blank', 'noopener')
    }
  }

  return (
    <div className="space-y-6 ds-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ds-meta uppercase tracking-wide" style={{ fontSize: 11 }}>Pole Finance</p>
          <h1 className="ds-page-title">Invoice Ninja</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status badge */}
          <span className={
            healthLoading
              ? 'ds-badge ds-badge-default'
              : health.online
                ? 'ds-badge ds-badge-success'
                : 'ds-badge ds-badge-danger'
          }>
            {healthLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : health.online ? (
              <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {healthLoading ? 'Verification...' : health.online ? 'Connecte' : 'Hors ligne'}
          </span>
          <button
            onClick={() => refetchHealth()}
            disabled={healthLoading}
            className="ds-btn ds-btn-ghost !p-2"
            title="Tester la connexion"
          >
            <RefreshCw size={14} className={healthLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Offline banner ── */}
      {!healthLoading && !health.online && (
        <div className="ds-alert ds-alert-danger">
          <XCircle size={18} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--semantic-red)' }}>Connexion Invoice Ninja indisponible</p>
            <p className="ds-meta" style={{ marginTop: 2 }}>
              Verifiez que le service est demarre et que les identifiants API sont corrects
              dans Parametres &gt; Integrations.
            </p>
          </div>
        </div>
      )}

      {/* ── Overdue alert (when impayes > 0) ── */}
      {health.online && overdueCount > 0 && (
        <div className="ds-alert ds-alert-warning">
          <AlertCircle size={18} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: 'var(--semantic-orange)' }}>
              {overdueCount} facture{overdueCount > 1 ? 's' : ''} impayee{overdueCount > 1 ? 's' : ''}
            </p>
            <p className="ds-meta" style={{ marginTop: 2 }}>
              Montant total en retard : {formatCHF(overdueAmount)}
            </p>
          </div>
          <button
            onClick={() => openInvoiceNinja('/#/invoices?status=overdue')}
            className="ds-btn ds-btn-ghost"
          >
            Voir
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── KPI Row ── */}
      {health.online && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="ds-card p-5">
            <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 11 }}>Chiffre d'affaires</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--label-1)' }}>{formatCHF(totalRevenue)}</p>
          </div>
          <div className="ds-card p-5">
            <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 11 }}>En attente</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--label-1)' }}>{formatCHF(pendingAmount)}</p>
          </div>
          <div className="ds-card p-5">
            <div className="flex items-center justify-between">
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 11 }}>Impayes</p>
              {overdueCount > 0 && (
                <span className="ds-badge ds-badge-danger">{overdueCount}</span>
              )}
            </div>
            <p className="text-2xl font-bold mt-1" style={{ color: overdueCount > 0 ? 'var(--semantic-red)' : 'var(--label-1)' }}>
              {formatCHF(overdueAmount)}
            </p>
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="ds-card p-5">
        <h3 className="ds-card-title mb-4">Raccourcis rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => openInvoiceNinja('/#/quotes/create')}
            disabled={!health.online}
            className="ds-btn ds-btn-ghost justify-start gap-3 px-4 py-3 h-auto text-left disabled:opacity-40"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--tint-blue)' }}
            >
              <Plus size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--label-1)' }}>Creer un devis</p>
              <p className="ds-meta">Nouveau devis dans Invoice Ninja</p>
            </div>
          </button>

          <button
            onClick={() => openInvoiceNinja('/#/invoices/create')}
            disabled={!health.online}
            className="ds-btn ds-btn-ghost justify-start gap-3 px-4 py-3 h-auto text-left disabled:opacity-40"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--tint-blue)' }}
            >
              <Send size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--label-1)' }}>Envoyer une facture</p>
              <p className="ds-meta">Creer et envoyer par email</p>
            </div>
          </button>

          <button
            onClick={() => openInvoiceNinja('/#/invoices?status=overdue')}
            disabled={!health.online}
            className="ds-btn ds-btn-ghost justify-start gap-3 px-4 py-3 h-auto text-left disabled:opacity-40"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: overdueCount > 0 ? 'var(--tint-red)' : 'var(--tint-blue)' }}
            >
              <AlertCircle size={16} style={{ color: overdueCount > 0 ? 'var(--semantic-red)' : 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--label-1)' }}>Voir les impayes</p>
              <p className="ds-meta">
                {overdueCount > 0 ? `${overdueCount} facture${overdueCount > 1 ? 's' : ''} en retard` : 'Aucun impaye'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Recent Invoices ── */}
      <div className="ds-card overflow-hidden">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--sep)' }}>
          <h3 className="ds-card-title">5 dernieres factures</h3>
          {IN_URL && (
            <a
              href={`${IN_URL}/#/invoices`}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-btn ds-btn-ghost !py-1 text-xs"
            >
              Tout voir
              <ExternalLink size={12} className="ml-1" />
            </a>
          )}
        </div>

        {!health.online ? (
          <div className="px-5 py-12 text-center">
            <XCircle size={24} className="mx-auto mb-2" style={{ color: 'var(--label-3)' }} />
            <p className="ds-meta">Service hors ligne</p>
          </div>
        ) : invoicesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Receipt size={24} className="mx-auto mb-2" style={{ color: 'var(--label-3)' }} />
            <p className="ds-meta">Aucune facture</p>
          </div>
        ) : (
          <div>
            {invoices.slice(0, 5).map((inv, idx) => {
              const statusInfo = getStatusInfo(inv.status_id || inv.status)
              const amount = parseFloat(inv.amount || inv.total || 0)
              const currency = inv.currency?.code || inv.currency || 'CHF'
              const isOverdue = inv.status_id === 'overdue' || inv.is_overdue ||
                (inv.due_date && new Date(inv.due_date) < new Date() && inv.status_id !== 4 && inv.status !== 'paid')

              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-zinc-50"
                  style={{
                    borderBottom: idx < invoices.length - 1 ? '1px solid var(--sep)' : undefined,
                    cursor: 'default'
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--fill-1)' }}
                    >
                      <FileText size={14} style={{ color: 'var(--label-2)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--label-1)' }}>
                        {inv.number || inv.invoice_number || `#${inv.id}`}
                      </p>
                      <p className="ds-meta truncate">
                        {inv.client?.display_name || inv.client?.name || inv.client_name || '-'}
                        {inv.date && <> &middot; {formatDate(inv.date)}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={isOverdue ? 'ds-badge ds-badge-danger' : statusInfo.style}>
                      {isOverdue ? 'En retard' : statusInfo.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--label-1)' }}>
                      {formatCHF(amount, currency)}
                    </span>
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

export default InvoiceNinjaHub
