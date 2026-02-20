/**
 * ClientDetailRevendeur — Revendeur Portal
 * Detail d'un client : infos entreprise, devis, factures, stats.
 * Fetches: companies/:id, quotes (company_id), client_invoices (company_id).
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, MapPin, Mail, Phone, Globe,
  FileText, Receipt, Info, Loader2, AlertCircle,
  DollarSign, TrendingUp, Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

// ── Format CHF ──
const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

// ── Format date DD.MM.YYYY ──
const formatDate = (dateStr) => {
  if (!dateStr) return '\u2014'
  try {
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: fr })
  } catch {
    return '\u2014'
  }
}

// ── Quote status config ──
const QUOTE_STATUS = {
  draft:    { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Envoye',    color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepte',   color: 'bg-green-100 text-green-700' },
  signed:   { label: 'Signe',     color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Refuse',    color: 'bg-red-100 text-red-700' },
  expired:  { label: 'Expire',    color: 'bg-gray-100 text-gray-500' }
}

// ── Invoice status config ──
const INVOICE_STATUS = {
  draft:    { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Envoyee',   color: 'bg-blue-100 text-blue-700' },
  paid:     { label: 'Payee',     color: 'bg-green-100 text-green-700' },
  overdue:  { label: 'En retard', color: 'bg-red-100 text-red-700' },
  partial:  { label: 'Partielle', color: 'bg-yellow-100 text-yellow-700' },
  cancelled:{ label: 'Annulee',   color: 'bg-gray-100 text-gray-500' }
}

// ── Tab definitions ──
const TABS = [
  { id: 'devis',    label: 'Devis',    icon: FileText },
  { id: 'factures', label: 'Factures', icon: Receipt },
  { id: 'info',     label: 'Info',     icon: Info }
]

// ── Skeleton loader ──
const SkeletonCard = ({ className = '' }) => (
  <div className={`ds-card p-6 ${className}`}>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  </div>
)

const ClientDetailRevendeur = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [activeTab, setActiveTab] = useState('devis')

  // ── Fetch company detail ──
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['revendeur-client-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/companies/${id}`, {
        params: {
          fields: ['id', 'name', 'email', 'phone', 'address', 'city', 'postal_code', 'country', 'website', 'status', 'date_created']
        }
      })
      return data?.data || null
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch quotes for this company ──
  const { data: quotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['revendeur-client-quotes', id],
    queryFn: async () => {
      const { data } = await api.get('/items/quotes', {
        params: {
          filter: { company_id: { _eq: id } },
          fields: ['id', 'quote_number', 'name', 'status', 'total', 'subtotal', 'currency', 'created_at', 'sent_at', 'signed_at'],
          sort: ['-created_at'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2
  })

  // ── Fetch invoices for this company ──
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['revendeur-client-invoices', id],
    queryFn: async () => {
      const { data } = await api.get('/items/client_invoices', {
        params: {
          filter: { company_id: { _eq: id } },
          fields: ['id', 'invoice_number', 'amount', 'status', 'date_created'],
          sort: ['-date_created'],
          limit: -1
        }
      })
      return data?.data || []
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2
  })

  // ── Summary stats ──
  const stats = useMemo(() => {
    const totalDevis = quotes.reduce((sum, q) => sum + (q.total || q.subtotal || 0), 0)
    const totalFactures = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid')
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    return { totalDevis, totalFactures, totalPaid, quotesCount: quotes.length, invoicesCount: invoices.length }
  }, [quotes, invoices])

  // ── Loading state ──
  if (companyLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-5 bg-gray-200 rounded w-40" />
        <SkeletonCard />
        <div className="grid grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard className="h-48" />
      </div>
    )
  }

  // ── Not found ──
  if (!company) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/revendeur/clients')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Mes clients
        </button>
        <div className="ds-card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Client introuvable</h3>
          <p className="text-sm text-gray-500 mt-2">
            Ce client n'existe pas ou vous n'y avez pas acces.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Back link ── */}
      <button
        onClick={() => navigate('/revendeur/clients')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Mes clients
      </button>

      {/* ── Company header ── */}
      <div className="ds-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
              {company.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" />
                  {company.city}{company.postal_code ? `, ${company.postal_code}` : ''}
                  {company.country ? ` - ${company.country}` : ''}
                </span>
              )}
              {company.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-400" />
                  {company.email}
                </span>
              )}
              {company.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" />
                  {company.phone}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  <Globe size={14} />
                  {company.website}
                </a>
              )}
            </div>
          </div>
          {company.status && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              company.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {company.status === 'active' ? 'Actif' : company.status}
            </span>
          )}
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-blue-500" />
            <span className="text-xs text-gray-500 font-medium">Total devis</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCHF(stats.totalDevis)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.quotesCount} devis</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={16} className="text-green-500" />
            <span className="text-xs text-gray-500 font-medium">Total factures</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCHF(stats.totalFactures)}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.invoicesCount} facture{stats.invoicesCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="ds-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Montant encaisse</span>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatCHF(stats.totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.totalFactures > 0
              ? `${Math.round((stats.totalPaid / stats.totalFactures) * 100)}% encaisse`
              : 'Aucune facture'}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="ds-card">
        {/* Tab headers */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#0071E3] text-[#0071E3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === 'devis' && quotes.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {quotes.length}
                  </span>
                )}
                {tab.id === 'factures' && invoices.length > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {invoices.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {/* ── Devis tab ── */}
          {activeTab === 'devis' && (
            quotesLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucun devis pour ce client</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-xs text-gray-500 font-medium">N. devis</th>
                      <th className="text-left py-3 text-xs text-gray-500 font-medium">Nom</th>
                      <th className="text-right py-3 text-xs text-gray-500 font-medium">Total CHF</th>
                      <th className="text-left py-3 text-xs text-gray-500 font-medium">Statut</th>
                      <th className="text-left py-3 text-xs text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => {
                      const cfg = QUOTE_STATUS[q.status] || { label: q.status || '\u2014', color: 'bg-gray-100 text-gray-500' }
                      const dateStr = q.signed_at || q.sent_at || q.created_at
                      return (
                        <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 font-medium text-gray-900">
                            {q.quote_number || `#${q.id?.toString().slice(0, 8)}`}
                          </td>
                          <td className="py-3 text-gray-600">
                            {q.name || '\u2014'}
                          </td>
                          <td className="py-3 text-right font-semibold text-gray-900">
                            {formatCHF(q.total || q.subtotal)}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">
                            {formatDate(dateStr)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── Factures tab ── */}
          {activeTab === 'factures' && (
            invoicesLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-10">
                <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucune facture pour ce client</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 text-xs text-gray-500 font-medium">N. facture</th>
                      <th className="text-right py-3 text-xs text-gray-500 font-medium">Montant CHF</th>
                      <th className="text-left py-3 text-xs text-gray-500 font-medium">Statut</th>
                      <th className="text-left py-3 text-xs text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const cfg = INVOICE_STATUS[inv.status] || { label: inv.status || '\u2014', color: 'bg-gray-100 text-gray-500' }
                      return (
                        <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 font-medium text-gray-900">
                            {inv.invoice_number || `#${inv.id?.toString().slice(0, 8)}`}
                          </td>
                          <td className="py-3 text-right font-semibold text-gray-900">
                            {formatCHF(inv.amount)}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">
                            {formatDate(inv.date_created)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── Info tab ── */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Nom de l'entreprise</p>
                  <p className="text-sm text-gray-900 font-medium">{company.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                  <p className="text-sm text-gray-900">{company.email || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Telephone</p>
                  <p className="text-sm text-gray-900">{company.phone || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Site web</p>
                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-900">{'\u2014'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Adresse</p>
                  <p className="text-sm text-gray-900">
                    {company.address || '\u2014'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Ville / CP</p>
                  <p className="text-sm text-gray-900">
                    {company.city
                      ? `${company.city}${company.postal_code ? ` ${company.postal_code}` : ''}${company.country ? `, ${company.country}` : ''}`
                      : '\u2014'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Statut</p>
                  <p className="text-sm text-gray-900">{company.status || '\u2014'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Date de creation</p>
                  <p className="text-sm text-gray-900">{formatDate(company.date_created)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClientDetailRevendeur
