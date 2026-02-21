/**
 * InvoiceNinjaHub — Hub Integration Invoice Ninja
 * Statut connexion online/offline, 5 dernières factures,
 * 3 boutons raccourcis (Créer devis, Envoyer facture, Voir impayés).
 *
 * Backend API: /api/invoice-ninja (auth: superadmin)
 * Endpoints: /health, /invoices, /dashboard
 *
 * @version 1.0.0
 * @date 2026-02-21
 */

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, Plus, Send, AlertCircle, CheckCircle2, XCircle,
  RefreshCw, Loader2, ExternalLink, Clock, ArrowRight, Receipt
} from 'lucide-react'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
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
  const res = await api.get('/api/invoice-ninja/invoices', {
    params: { per_page: 5, sort: '-date' }
  })
  return res.data?.data || []
}

const fetchDashboard = async () => {
  const res = await api.get('/api/invoice-ninja/dashboard')
  return res.data?.data || {}
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
  1: { label: 'Brouillon', className: 'bg-zinc-100 text-zinc-600' },
  2: { label: 'Envoyee', className: 'bg-blue-50 text-blue-700' },
  3: { label: 'Vue', className: 'bg-indigo-50 text-indigo-700' },
  4: { label: 'Payee', className: 'bg-green-50 text-green-700' },
  5: { label: 'Annulee', className: 'bg-red-50 text-red-700' },
  6: { label: 'Archivee', className: 'bg-zinc-100 text-zinc-500' },
  draft: { label: 'Brouillon', className: 'bg-zinc-100 text-zinc-600' },
  sent: { label: 'Envoyee', className: 'bg-blue-50 text-blue-700' },
  viewed: { label: 'Vue', className: 'bg-indigo-50 text-indigo-700' },
  paid: { label: 'Payee', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Annulee', className: 'bg-red-50 text-red-700' },
  overdue: { label: 'En retard', className: 'bg-red-50 text-red-700' },
  partial: { label: 'Partielle', className: 'bg-amber-50 text-amber-700' }
}

function getStatusInfo(status) {
  if (!status) return { label: '-', className: 'bg-zinc-100 text-zinc-500' }
  return STATUS_MAP[status] || { label: String(status), className: 'bg-zinc-100 text-zinc-500' }
}

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

export function InvoiceNinjaHub({ selectedCompany }) {
  // ── Queries ──
  const {
    data: health = { online: false },
    isLoading: healthLoading,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['invoice-ninja-health'],
    queryFn: fetchHealth,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60
  })

  const {
    data: invoices = [],
    isLoading: invoicesLoading
  } = useQuery({
    queryKey: ['invoice-ninja-recent'],
    queryFn: fetchRecentInvoices,
    staleTime: 1000 * 60,
    enabled: health.online
  })

  const {
    data: dashboard = {},
    isLoading: dashboardLoading
  } = useQuery({
    queryKey: ['invoice-ninja-dashboard'],
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 2,
    enabled: health.online
  })

  const isLoading = healthLoading || invoicesLoading || dashboardLoading

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
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Pole Finance</p>
          <h2 className="text-xl font-bold text-zinc-900">Invoice Ninja</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            healthLoading
              ? 'bg-zinc-100 text-zinc-500'
              : health.online
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
          }`}>
            {healthLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : health.online ? (
              <CheckCircle2 size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {healthLoading ? 'Verification...' : health.online ? 'Connecte' : 'Hors ligne'}
          </div>
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
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Connexion Invoice Ninja indisponible</p>
            <p className="text-xs text-red-600 mt-0.5">
              Verifiez que le service est demarre et que les identifiants API sont corrects
              dans Parametres &gt; Integrations.
            </p>
          </div>
        </div>
      )}

      {/* ── KPI Row ── */}
      {health.online && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="ds-card p-5">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Chiffre d'affaires</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{formatCHF(totalRevenue)}</p>
          </div>
          <div className="ds-card p-5">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">En attente</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{formatCHF(pendingAmount)}</p>
          </div>
          <div className="ds-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Impayes</p>
              {overdueCount > 0 && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {overdueCount}
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? 'text-red-600' : 'text-zinc-900'}`}>
              {formatCHF(overdueAmount)}
            </p>
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="ds-card p-5">
        <h3 className="font-semibold text-zinc-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => openInvoiceNinja('/#/quotes/create')}
            disabled={!health.online}
            className="ds-btn ds-btn-ghost justify-start gap-3 px-4 py-3 h-auto text-left disabled:opacity-40"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0071E3]/10 flex items-center justify-center flex-shrink-0">
              <Plus size={16} className="text-[#0071E3]" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Creer un devis</p>
              <p className="text-xs text-zinc-500">Nouveau devis dans Invoice Ninja</p>
            </div>
          </button>

          <button
            onClick={() => openInvoiceNinja('/#/invoices/create')}
            disabled={!health.online}
            className="ds-btn ds-btn-ghost justify-start gap-3 px-4 py-3 h-auto text-left disabled:opacity-40"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0071E3]/10 flex items-center justify-center flex-shrink-0">
              <Send size={16} className="text-[#0071E3]" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Envoyer une facture</p>
              <p className="text-xs text-zinc-500">Creer et envoyer par email</p>
            </div>
          </button>

          <button
            onClick={() => openInvoiceNinja('/#/invoices?status=overdue')}
            disabled={!health.online}
            className="ds-btn ds-btn-ghost justify-start gap-3 px-4 py-3 h-auto text-left disabled:opacity-40"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              overdueCount > 0 ? 'bg-red-50' : 'bg-[#0071E3]/10'
            }`}>
              <AlertCircle size={16} className={overdueCount > 0 ? 'text-red-500' : 'text-[#0071E3]'} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Voir les impayes</p>
              <p className="text-xs text-zinc-500">
                {overdueCount > 0 ? `${overdueCount} facture${overdueCount > 1 ? 's' : ''} en retard` : 'Aucun impaye'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Recent Invoices ── */}
      <div className="ds-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900">5 dernieres factures</h3>
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
            <XCircle size={24} className="mx-auto mb-2 text-zinc-300" />
            <p className="text-sm text-zinc-400">Service hors ligne</p>
          </div>
        ) : invoicesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-[#0071E3] animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Receipt size={24} className="mx-auto mb-2 text-zinc-300" />
            <p className="text-sm text-zinc-400">Aucune facture</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {invoices.slice(0, 5).map((inv) => {
              const statusInfo = getStatusInfo(inv.status_id || inv.status)
              const amount = parseFloat(inv.amount || inv.total || 0)
              const currency = inv.currency?.code || inv.currency || 'CHF'
              const isOverdue = inv.status_id === 'overdue' || inv.is_overdue ||
                (inv.due_date && new Date(inv.due_date) < new Date() && inv.status_id !== 4 && inv.status !== 'paid')

              return (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {inv.number || inv.invoice_number || `#${inv.id}`}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {inv.client?.display_name || inv.client?.name || inv.client_name || '-'}
                        {inv.date && <> &middot; {formatDate(inv.date)}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isOverdue ? 'bg-red-50 text-red-700' : statusInfo.className
                    }`}>
                      {isOverdue ? 'En retard' : statusInfo.label}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 tabular-nums">
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
