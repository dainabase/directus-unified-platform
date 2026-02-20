/**
 * ClientsRevendeur — Revendeur Portal
 * Liste des clients du revendeur connecte.
 * Logique : leads won (assigned_to=user.id) -> company_names -> companies.
 * Enrichi avec quotes count + total deals CHF.
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Search, Loader2, MapPin, Mail, Phone, FileText, DollarSign
} from 'lucide-react'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

const formatCHF = (value) =>
  new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0)

// ── Fetch won leads for the current revendeur ──
async function fetchWonLeads(userId) {
  const { data } = await api.get('/items/leads', {
    params: {
      filter: {
        status: { _eq: 'won' },
        assigned_to: { _eq: userId }
      },
      fields: ['id', 'company_name', 'estimated_value', 'converted_at'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Fetch companies matching lead company_names ──
async function fetchCompanies(companyNames) {
  if (!companyNames.length) return []
  const { data } = await api.get('/items/companies', {
    params: {
      filter: {
        name: { _in: companyNames }
      },
      fields: ['id', 'name', 'email', 'phone', 'city', 'postal_code', 'country', 'status', 'date_created'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Fetch all quotes to enrich client data ──
async function fetchQuotes() {
  const { data } = await api.get('/items/quotes', {
    params: {
      fields: ['id', 'company_id', 'total', 'subtotal', 'status'],
      limit: -1
    }
  }).catch(() => ({ data: { data: [] } }))
  return data?.data || []
}

// ── Skeleton card ──
const SkeletonCard = () => (
  <div className="ds-card p-5">
    <div className="animate-pulse space-y-3">
      <div className="h-5 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="flex gap-4 mt-3">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="h-4 bg-gray-100 rounded w-24" />
      </div>
    </div>
  </div>
)

const ClientsRevendeur = () => {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  // Step 1: Fetch won leads for the revendeur
  const { data: wonLeads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['revendeur-won-leads', user?.id],
    queryFn: () => fetchWonLeads(user.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2
  })

  // Step 2: Extract unique company names from won leads
  const companyNames = useMemo(() => {
    const names = wonLeads.map((l) => l.company_name).filter(Boolean)
    return [...new Set(names)]
  }, [wonLeads])

  // Step 3: Fetch companies matching those names
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['revendeur-clients-companies', companyNames],
    queryFn: () => fetchCompanies(companyNames),
    enabled: companyNames.length > 0,
    staleTime: 1000 * 60 * 2
  })

  // Step 4: Fetch quotes to enrich with deal data
  const { data: allQuotes = [], isLoading: quotesLoading } = useQuery({
    queryKey: ['revendeur-clients-quotes'],
    queryFn: fetchQuotes,
    staleTime: 1000 * 60 * 2
  })

  // Build enriched client data: companies + quote stats + lead value
  const enrichedClients = useMemo(() => {
    // Map lead estimated values by company name
    const leadValueByName = {}
    for (const lead of wonLeads) {
      if (lead.company_name) {
        leadValueByName[lead.company_name] =
          (leadValueByName[lead.company_name] || 0) + (lead.estimated_value || 0)
      }
    }

    return companies.map((company) => {
      const companyQuotes = allQuotes.filter((q) => q.company_id === company.id)
      const totalDeals = companyQuotes.reduce((sum, q) => sum + (q.total || q.subtotal || 0), 0)
      const leadValue = leadValueByName[company.name] || 0

      return {
        ...company,
        quotesCount: companyQuotes.length,
        totalDeals: totalDeals || leadValue
      }
    })
  }, [companies, allQuotes, wonLeads])

  // Client-side search filter
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return enrichedClients
    const q = searchQuery.toLowerCase().trim()
    return enrichedClients.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    )
  }, [enrichedClients, searchQuery])

  const isLoading = leadsLoading || companiesLoading || quotesLoading

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="ds-page-title">Mes Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Chargement de vos clients...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-page-title">Mes Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} acquis
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="ds-card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, ville ou email..."
            className="ds-input w-full pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Client cards grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="ds-card p-5 hover:border-blue-200 transition-colors cursor-pointer"
              onClick={() => navigate(`/revendeur/clients/${client.id}`)}
            >
              {/* Company name */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 leading-tight">
                  {client.name}
                </h3>
                {client.status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {client.status === 'active' ? 'Actif' : client.status}
                  </span>
                )}
              </div>

              {/* Location, email, phone */}
              <div className="space-y-1.5 mb-4">
                {client.city && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{client.city}{client.postal_code ? `, ${client.postal_code}` : ''}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats: quotes count + total deals */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-sm">
                  <FileText size={14} className="text-blue-500" />
                  <span className="text-gray-600">
                    {client.quotesCount} devis
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <DollarSign size={14} className="text-green-500" />
                  <span className="font-semibold text-gray-900">
                    {formatCHF(client.totalDeals)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="ds-card p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Aucun client</h3>
          <p className="text-sm text-gray-500 mt-2">
            {searchQuery
              ? 'Aucun client ne correspond a votre recherche.'
              : 'Vos clients apparaitront ici une fois vos leads convertis.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ClientsRevendeur
