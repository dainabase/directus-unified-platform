/**
 * MauticHub — Phase D (D.2.1)
 * Hub Integration Mautic — live data from /api/mautic/*
 * Status badge, KPIs (contacts, campaigns, emails), campagnes actives.
 * Apple DS v2.0 tokens.
 *
 * @version 2.0.0
 * @date 2026-02-22
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Megaphone, ExternalLink, CheckCircle2, XCircle,
  RefreshCw, Loader2, Users, Mail, Zap
} from 'lucide-react'
import api from '../../../lib/axios'

const MAUTIC_URL = import.meta.env.VITE_MAUTIC_URL || 'https://mautic.hypervisual.ch'

// ── Fetchers ──

const fetchMauticHealth = async () => {
  try {
    const res = await api.get('/api/mautic/health')
    return { online: res.data?.success === true || res.data?.status === 'ok', data: res.data }
  } catch {
    return { online: false, data: null }
  }
}

const fetchMauticStats = async () => {
  const res = await api.get('/api/mautic/stats')
  return res.data?.data || res.data || {}
}

const fetchMauticCampaigns = async () => {
  const res = await api.get('/api/mautic/campaigns')
  return res.data?.data || res.data?.campaigns || []
}

// ── Component ──

const MauticHub = ({ selectedCompany }) => {
  const {
    data: health = { online: false },
    isLoading: healthLoading,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['mautic-health'],
    queryFn: fetchMauticHealth,
    staleTime: 30_000,
    refetchInterval: 60_000
  })

  const { data: stats = {} } = useQuery({
    queryKey: ['mautic-stats'],
    queryFn: fetchMauticStats,
    staleTime: 60_000,
    enabled: health.online
  })

  const { data: campaigns = [] } = useQuery({
    queryKey: ['mautic-campaigns'],
    queryFn: fetchMauticCampaigns,
    staleTime: 120_000,
    enabled: health.online
  })

  const totalContacts = stats.contacts || stats.total_contacts || 0
  const totalEmails = stats.emails_sent || stats.total_emails || 0
  const activeCampaigns = stats.active_campaigns || campaigns.length || 0

  return (
    <div className="space-y-6 ds-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ds-meta uppercase tracking-wide" style={{ fontSize: 11 }}>Marketing</p>
          <h1 className="ds-page-title">Mautic</h1>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Offline banner */}
      {!healthLoading && !health.online && (
        <div className="ds-alert ds-alert-danger">
          <XCircle size={18} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--semantic-red)' }}>Connexion Mautic indisponible</p>
            <p className="ds-meta" style={{ marginTop: 2 }}>
              Verifiez que Mautic est accessible et que les identifiants API sont corrects.
            </p>
          </div>
        </div>
      )}

      {/* KPI Row */}
      {health.online && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="ds-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'var(--tint-blue)' }}>
                <Users size={16} style={{ color: 'var(--semantic-blue)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 11 }}>Contacts</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>
              {totalContacts.toLocaleString('fr-CH')}
            </p>
          </div>

          <div className="ds-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'var(--tint-green)' }}>
                <Mail size={16} style={{ color: 'var(--semantic-green)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 11 }}>Emails envoyes</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>
              {totalEmails.toLocaleString('fr-CH')}
            </p>
          </div>

          <div className="ds-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'var(--tint-orange)' }}>
                <Zap size={16} style={{ color: 'var(--semantic-orange)' }} />
              </div>
              <p className="ds-meta uppercase tracking-wider" style={{ fontSize: 11 }}>Campagnes actives</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--label-1)' }}>
              {activeCampaigns}
            </p>
          </div>
        </div>
      )}

      {/* Campaigns list */}
      {health.online && campaigns.length > 0 && (
        <div className="ds-card overflow-hidden">
          <div className="p-5" style={{ borderBottom: '1px solid var(--sep)' }}>
            <h3 className="ds-card-title">Campagnes actives</h3>
          </div>
          <div>
            {campaigns.slice(0, 8).map((c, idx) => (
              <div
                key={c.id || idx}
                className="flex items-center justify-between px-5 py-3 transition-colors"
                style={{
                  borderBottom: idx < campaigns.length - 1 ? '1px solid var(--sep)' : undefined
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--fill-5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--tint-blue)' }}
                  >
                    <Megaphone size={14} style={{ color: 'var(--semantic-blue)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--label-1)' }}>
                      {c.name || c.title || `Campagne #${c.id}`}
                    </p>
                    {c.description && (
                      <p className="ds-meta truncate">{c.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {c.contacts_count !== undefined && (
                    <span className="ds-meta">{c.contacts_count} contacts</span>
                  )}
                  <span className={
                    c.isPublished || c.is_published
                      ? 'ds-badge ds-badge-success'
                      : 'ds-badge ds-badge-default'
                  }>
                    {c.isPublished || c.is_published ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mautic iframe fallback when online but no data */}
      {health.online && campaigns.length === 0 && (
        <div className="ds-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 40, height: 40, background: 'var(--tint-blue)' }}
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
            className="w-full rounded-lg"
            style={{
              height: 'calc(100vh - 380px)',
              border: '1px solid var(--sep)',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default MauticHub
