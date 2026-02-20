/**
 * RevendeurDashboard — S-05-04
 * Dashboard revendeur connecte a Directus.
 * KPIs, devis recents, clients, CA.
 */

import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp, FileText, ShoppingCart, Users, Package,
  DollarSign, Loader2, ArrowUpRight
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'

const formatCHF = (v) =>
  new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', minimumFractionDigits: 0 }).format(v || 0)

// Fetch quotes for the revendeur (linked to current user or all HYPERVISUAL)
async function fetchRevendeurQuotes() {
  const { data } = await api.get('/items/quotes', {
    params: {
      fields: ['*'],
      sort: ['-date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

async function fetchRevendeurProducts() {
  const { data } = await api.get('/items/products', {
    params: {
      fields: ['*'],
      sort: ['name'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

const RevendeurDashboard = () => {
  const { data: quotes = [], isLoading: loadingQuotes } = useQuery({
    queryKey: ['revendeur-quotes'],
    queryFn: fetchRevendeurQuotes,
    staleTime: 60_000
  })

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['revendeur-products'],
    queryFn: fetchRevendeurProducts,
    staleTime: 120_000
  })

  const isLoading = loadingQuotes || loadingProducts

  // KPIs from real data
  const kpis = useMemo(() => {
    const total = quotes.reduce((s, q) => s + (q.total_amount || q.amount || 0), 0)
    const accepted = quotes.filter(q => q.status === 'accepted' || q.status === 'signed')
    const acceptedCA = accepted.reduce((s, q) => s + (q.total_amount || q.amount || 0), 0)
    const pending = quotes.filter(q => q.status === 'sent' || q.status === 'draft')
    const uniqueClients = new Set(quotes.map(q => q.client_id || q.company_id).filter(Boolean))
    return {
      totalQuotes: quotes.length,
      totalCA: total,
      acceptedCA,
      pendingCount: pending.length,
      productCount: products.length,
      clientCount: uniqueClients.size,
      conversionRate: quotes.length > 0 ? Math.round((accepted.length / quotes.length) * 100) : 0
    }
  }, [quotes, products])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tableau de bord Revendeur</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vue d'ensemble de votre activite commerciale</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-blue-400" />
            <span className="text-xs text-gray-500">Devis total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpis.totalQuotes}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.pendingCount} en attente</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-xs text-gray-500">CA accepte</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCHF(kpis.acceptedCA)}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.conversionRate}% conversion</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-400" />
            <span className="text-xs text-gray-500">Clients</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{kpis.clientCount}</p>
        </div>
        <div className="ds-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Package size={14} className="text-blue-400" />
            <span className="text-xs text-gray-500">Produits</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{kpis.productCount}</p>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="ds-card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Devis recents</h3>
          <span className="text-xs text-gray-400">{quotes.length} devis</span>
        </div>
        {quotes.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun devis</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {quotes.slice(0, 10).map(q => {
              const statusCfg = {
                draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
                sent: { label: 'Envoye', color: 'bg-blue-100 text-blue-700' },
                accepted: { label: 'Accepte', color: 'bg-green-100 text-green-700' },
                signed: { label: 'Signe', color: 'bg-emerald-100 text-emerald-700' },
                rejected: { label: 'Refuse', color: 'bg-red-100 text-red-700' },
                expired: { label: 'Expire', color: 'bg-gray-100 text-gray-500' }
              }
              const cfg = statusCfg[q.status] || statusCfg.draft
              return (
                <div key={q.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{q.reference || q.title || `Devis #${q.id?.slice(0, 8)}`}</p>
                      <p className="text-xs text-gray-400">
                        {q.date_created ? format(new Date(q.date_created), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatCHF(q.total_amount || q.amount)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Products Catalogue Preview */}
      {products.length > 0 && (
        <div className="ds-card">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Catalogue produits</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {products.slice(0, 6).map(p => (
              <div key={p.id} className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-blue-600">{formatCHF(p.price || p.unit_price)}</span>
                  {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default RevendeurDashboard
